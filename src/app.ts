import express from 'express'
import { config } from 'dotenv'
import axios from './api'

config()
const app = express()
const port = 3000
const extSecret = process.env.EXT_SECRET
const clientId = process.env.CLIENT_ID

const getAccessToken = async () => {
  const { data: { access_token } } = await axios.post(
    `https://id.twitch.tv/oauth2/token?client_id=${clientId}&client_secret=${extSecret}&grant_type=client_credentials`
  )
  axios.defaults.headers.common['Authorization'] = `Bearer ${access_token}`
}

getAccessToken()

app.get('/', async (req, res) => {

  let data = ''

  try {
    data = (await axios.get(
      `https://api.twitch.tv/helix/chat/emotes/global`
    )).data
  } catch (e) {
    data = e.response.data
  }

  res.json(data)

})

app.listen(port, (err?) => {
  if (err) {
    return console.error(err)
  }
  return console.log(`server is listening on ${port}`)
})