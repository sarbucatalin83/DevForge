import type { RequestHandler } from 'express'

declare global {
  namespace Express {
    interface Request {
      userId: string
    }
  }
}

const authMiddleware: RequestHandler = (req, _res, next) => {
  req.userId = 'local'
  next()
}

export default authMiddleware
