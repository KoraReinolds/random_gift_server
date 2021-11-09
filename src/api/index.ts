import axios, { AxiosRequestConfig } from 'axios'
import jsonwebtoken from 'jsonwebtoken'

const serverTokenDurationSec = 30
const extSecret = process.env.EXT_SECRET
const secret = Buffer.from(extSecret, 'base64')

const twitchAPISecret = process.env.TWITCH_API_SECRET
const ownerId = process.env.APP_CLIENT_ID
const extClientId = process.env.EXTENSION_CLIENT_ID
const prefix = 'Bearer '

axios.defaults.headers.common['Content-Type'] = 'application/json';

const makeServerToken = ({ channel_id, user_id }) => jsonwebtoken.sign({
  exp: Math.floor(Date.now() / 1000) + serverTokenDurationSec,
  channel_id,
  user_id: channel_id, // is the Twitch user ID that owns the extension.
  role: 'external',
  pubsub_perms: {
    send: ['*'],
  },
}, secret, { algorithm: 'HS256' });

const appOAuth = axios.create({
  headers: { 'Client-Id': ownerId }
})
const signedAxiosInstance = axios.create({
  headers: { 'Client-Id': extClientId }
})

const extractToken = (token) => jsonwebtoken.verify(
  token.substring(prefix.length),
  secret,
  { algorithms: ['HS256'] },
)

const getAccessToken = async () => {
  try {
    const { data: { access_token } } = await appOAuth.post(
      `https://id.twitch.tv/oauth2/token?client_id=${ownerId}&client_secret=${twitchAPISecret}&grant_type=client_credentials`
    )
    appOAuth.defaults.headers.common['Authorization'] = `Bearer ${access_token}`
  } catch(e) {
    console.log(e?.response?.data)
  }
}

const signToken = () => {
  return jsonwebtoken.sign({
    exp: +new Date() + 60000,
    user_id: "536747276",
    channel_id: "536747276",
    role: "external",
    pubsub_perms: {
      send:[
        "broadcast"
      ]
    },
  }, secret)
}

getAccessToken()

export {

  signedAxiosInstance,
  appOAuth,
  extractToken,
  makeServerToken,
  signToken,
}