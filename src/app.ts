import express from 'express'
import { config } from 'dotenv'
config()
import cors from 'cors'
import routes from './router'
import { createServer } from "http"
import { Server } from "socket.io"

const app = express()

const httpServer = createServer(app)
const io = new Server(httpServer, {
  cors: {
    origin: '*',
    credentials: true,
  }
})

app.use(cors({
  origin: '*',
}))

app.set('io', io)

app.use('/', routes)

httpServer.listen(3000)