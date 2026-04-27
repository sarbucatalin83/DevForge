import Docker from 'dockerode'
import app from './app'

const PORT = 3001

async function pingDocker(): Promise<void> {
  const docker = new Docker()
  await docker.ping()
}

app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`)

  pingDocker()
    .then(() => console.log('Docker daemon: reachable'))
    .catch(() => {
      console.warn(
        'Warning: Docker daemon is not reachable. ' +
          'Coding exercises will not work until Docker is started. ' +
          'Remediation: install Docker Desktop and ensure it is running, then restart the backend.',
      )
    })
})
