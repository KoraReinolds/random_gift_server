import express from 'express'
import { config } from 'dotenv'
config()
import axios from './api'
import cors from 'cors'
import routes from './router'

const app = express()
const port = 3000
const extSecret = process.env.TWITCH_API_SECRET
const clientId = process.env.CLIENT_ID

const getAccessToken = async () => {
  const { data: { access_token } } = await axios.post(
    `https://id.twitch.tv/oauth2/token?client_id=${clientId}&client_secret=${extSecret}&grant_type=client_credentials`
  )
  axios.defaults.headers.common['Authorization'] = `Bearer ${access_token}`
}

getAccessToken()

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