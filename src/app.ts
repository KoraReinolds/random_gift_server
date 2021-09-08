import express from 'express'
import { config } from 'dotenv'
config()
import cors from 'cors'
import routes from './router'

const app = express()
const port = 3000

app.use(cors({
  origin: '*',
}))

app.use('/', routes)

app.listen(port, (err?) => {
  if (err) {
    return console.error(err)
  }
  return console.log(`server is listening on ${port}`)
})