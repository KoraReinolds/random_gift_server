import express from 'express'
import axios from '../api'
import jsonwebtoken from 'jsonwebtoken'

const router = express.Router()

function extractToken(token) {

  const prefix = 'Bearer '
  const secret = Buffer.from(process.env.EXT_SECRET, 'base64')

  console.log('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE2Mjc1MDY0MjUsIm9wYXF1ZV91c2VyX2lkIjoiVTUzNjc0NzI3NiIsInJvbGUiOiJicm9hZGNhc3RlciIsInB1YnN1Yl9wZXJtcyI6eyJsaXN0ZW4iOlsiYnJvYWRjYXN0IiwiZ2xvYmFsIl0sInNlbmQiOlsiYnJvYWRjYXN0Il19LCJjaGFubmVsX2lkIjoiNTM2NzQ3Mjc2IiwidXNlcl9pZCI6IjUzNjc0NzI3NiIsImlhdCI6MTYyNzQyMDAyNX0.EcJA1bkxPUogn9sv83Usc8micU_ut75p9DLqyA1Dy_g' === token.substring(prefix.length))
  return jsonwebtoken.verify(
    token.substring(prefix.length),
    secret,
    { algorithms: ['HS256'] },
  )

}

const errorHandleWrapper = function(callback) {
  return function (req, res, next) {
    callback(req, res, next)
      .catch(e => {

        const err = e?.response?.data

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
}

router.use(errorHandleWrapper(async (req, res, next) => {

  if (req.headers.authorization) {
    req.user = extractToken(req.headers.authorization)
  }

  next()
  
}))

// public routes

router.use(errorHandleWrapper(async (req, res, next) => {

  if (!req.user) res.status(401).send()
  
  next()

}))

// private routes

router.get('/chat/globalEmotes', errorHandleWrapper(async (req, res, next) => {
  res.json((await axios.get(
    `https://api.twitch.tv/helix/chat/emotes/global`
  )).data)
  
}))

export default router