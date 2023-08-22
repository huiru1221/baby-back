import express from 'express'
import bot from './bot.js'

const router = express.Router()

// 加密編碼
router.use(express.json({
  verify (req, res, buf, encoding) {
    req.rawBody = buf.toString(encoding)
  }
}))

// 驗證
router.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    res.status(400).send({ success: false, message: '格式錯誤' })
  } else { next() }
})

// 回傳json
router.post('/', (req, res) => {
  bot.parse(req.body)
  return res.json({})
})

export default router
