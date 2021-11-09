import express from 'express'
import {
  appOAuth,
  extractToken,
  signedAxiosInstance,
  makeServerToken,
  signToken,
} from '../api'

const router = express.Router()
const ownerId = process.env.EXTENSION_CLIENT_ID

const errorHandleWrapper = (callback) => function (req, res, next) {
  callback(req, res, next).catch(e => {

    const err = e?.response?.data
    console.log('err: ', err)

    if (e.name === 'JsonWebTokenError') next()
    else if (err?.status) res.status(err.status).send()
    else {
      res.json(err || {
        type: 'error',
        message: 'Произошла ошибка. Обратитесь к администратору',
      })
    }
    
  })
}

router.use(errorHandleWrapper(async (req, res, next) => {

  if (req.headers.authorization) {
    req.user = extractToken(req.headers.authorization)
  }

  next()
  
}))

// public routes

router.post('/emitWidgetStatus', errorHandleWrapper(async (req, res, next) => {
  const { active, channelId } = req.body
  await signedAxiosInstance.post(
    `https://api.twitch.tv/extensions/message/${channelId}`,
    {
      content_type: "application/json",
      message: `{"active": "${ active }"}`,
      targets: ["broadcast"]
    },
    {
      headers: { Authorization: `Bearer ${signToken()}` }
    }
  )
  res.json({ status: 'ok' })
}))

router.use(errorHandleWrapper(async (req, res, next) => {

  if (!req.user) res.status(401).send()
  console.log(req.user)
  next()

}))

// private routes

router.get('/chat/globalEmotes', errorHandleWrapper(async (req, res, next) => {
  res.json((await appOAuth.get(
    `https://api.twitch.tv/helix/chat/emotes/global`
  )).data)
}))

// need sign token
router.use(errorHandleWrapper(async (req, res, next) => {

  signedAxiosInstance.defaults.headers.common['Authorization'] = `Bearer ${makeServerToken(req.user)}`
  
  next()

}))

router.get('/configuration', errorHandleWrapper(async (req, res, next) => {
  res.json((await signedAxiosInstance.get(
    `https://api.twitch.tv/extensions/${ownerId}/configurations/channels/${req.user.channel_id}`
  )).data)
}))

router.post('/bits/transaction', errorHandleWrapper(async (req, res, next) => {
  req.app.get('io').sockets.emit(req.user.channel_id, 'socket')
}))

export default router