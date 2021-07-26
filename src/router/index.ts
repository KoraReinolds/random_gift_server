import express from 'express'
import axios from '../api'

const router = express.Router()

const errorHandleWrapper = function(callback) {
  return function (req, res, next) {
    callback(req, res, next)
      .catch(e => {

        const err = e?.response?.data
        
        if (err.status) res.status(err.status).send()

        res.json(err || {
          type: "error",
          message: "Произошла ошибка. Обратитесь к администратору",
        })
        
      })
  }
}

router.use(errorHandleWrapper(async (req, res, next) => {
  // verify user
  next()
}))

router.get('/', errorHandleWrapper(async (req, res, next) => {
  res.json((await axios.get(
    `https://api.twitch.tv/helix/chat/emotes/globals`
  )).data)
  
}))

export default router