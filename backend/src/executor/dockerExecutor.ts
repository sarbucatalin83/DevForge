import Docker from 'dockerode'
import fs from 'fs'
import os from 'os'
import path from 'path'
import type { ExecutionResult } from '../types/index'
import type { ExecutorConfig } from '../types/index'

const docker = new Docker()

type SubmittedFile = { name: string; content: string }

export async function execute(
  _exerciseId: string,
  files: SubmittedFile[],
  config: ExecutorConfig,
): Promise<ExecutionResult> {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'devlearn-'))

  try {
    for (const file of files) {
      fs.writeFileSync(path.join(tmpDir, file.name), file.content, 'utf-8')
    }

    const testFile = files.find((f) => f.name.includes('.test.') || f.name.includes('.spec.'))
    const testFilePath = testFile ? `/workspace/${testFile.name}` : '/workspace'
    const cmd = config.testCommand.replace('{testFile}', testFilePath)

    await ensureImagePulled(config.image)

    const container = await docker.createContainer({
      Image: config.image,
      Cmd: ['sh', '-c', cmd],
      WorkingDir: '/workspace',
      HostConfig: {
        Binds: [`${tmpDir}:/workspace:ro`],
        NanoCpus: Math.round(parseFloat(config.cpuLimit) * 1e9),
        Memory: parseMemoryBytes(config.memoryLimit),
        AutoRemove: false,
        NetworkMode: 'none',
      },
    })

    try {
      await container.start()

      const timeoutMs = config.timeoutSeconds * 1000
      const waitResult = await Promise.race([
        container.wait(),
        new Promise<{ StatusCode: number; timedOut: true }>((resolve) =>
          setTimeout(() => resolve({ StatusCode: -1, timedOut: true }), timeoutMs),
        ),
      ])

      if ('timedOut' in waitResult && waitResult.timedOut) {
        await container.stop({ t: 0 }).catch(() => undefined)
        await container.remove({ force: true }).catch(() => undefined)
        return { passed: false, testOutput: '', previewHtml: null, timedOut: true }
      }

      const logs = await container.logs({ stdout: true, stderr: true })
      const testOutput = typeof logs === 'string' ? logs : logs.toString('utf-8')
      const passed = waitResult.StatusCode === 0

      await container.remove({ force: true }).catch(() => undefined)

      return { passed, testOutput, previewHtml: null, timedOut: false }
    } catch (err) {
      await container.remove({ force: true }).catch(() => undefined)
      throw err
    }
  } finally {
    fs.rmSync(tmpDir, { recursive: true, force: true })
  }
}

async function ensureImagePulled(image: string): Promise<void> {
  const images = await docker.listImages()
  const tag = image.includes(':') ? image : `${image}:latest`
  const exists = images.some((img) =>
    (img.RepoTags ?? []).includes(tag),
  )
  if (!exists) {
    await new Promise<void>((resolve, reject) => {
      docker.pull(image, (err: Error | null, stream: NodeJS.ReadableStream) => {
        if (err) return reject(err)
        docker.modem.followProgress(stream, (pullErr: Error | null) => {
          if (pullErr) return reject(pullErr)
          resolve()
        })
      })
    })
  }
}

function parseMemoryBytes(limit: string): number {
  const match = /^(\d+(\.\d+)?)(m|g|k)?$/i.exec(limit.trim())
  if (!match) return 128 * 1024 * 1024
  const value = parseFloat(match[1])
  const unit = (match[3] ?? '').toLowerCase()
  if (unit === 'g') return Math.round(value * 1024 * 1024 * 1024)
  if (unit === 'm') return Math.round(value * 1024 * 1024)
  if (unit === 'k') return Math.round(value * 1024)
  return Math.round(value)
}
