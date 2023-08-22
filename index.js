import 'dotenv/config'
import express from 'express'
import mongoose from 'mongoose'
import { StatusCodes } from 'http-status-codes'
import mongoSanitize from 'express-mongo-sanitize'
import rateLimit from 'express-rate-limit'
import cors from 'cors'
import routeUsers from './routes/users.js'
import routeProducts from './routes/products.js'
import routeOrders from './routes/orders.js'
import './passport/passport.js'
import bot from './linebot/index.js'
import session from 'express-session'

const app = express()

// 會話管理
const sessionConfig = {
  // 加密會話數據的秘密金鑰
  secret: process.env.SESSION_SECRET,
  // 在每次請求結束時，即使未修改會話數據，也會將會話重新保存回存儲區
  resave: false,
  // 在請求中的每個新會話將自動初始化，即使它沒有修改。
  saveUninitialized: true
}

// 確保在特定情況下只使用安全的 HTTPS 連接來處理會話 cookie
if (process.env.LOGIN_CHANNEL_CALLBACK.includes('render')) {
  sessionConfig.cookie = { secure: true }
}
app.use('/line', bot)
// 告訴 Express 應用程式，它應該信任代理並適當地處理代理頭信息
app.set('trust proxy', 1)
app.use(session(sessionConfig))

app.use(rateLimit({
  // 設定一個 IP 在 15 分鐘內最多 100 次請求
  windowMs: 15 * 60 * 1000,
  max: 100,
  // 設定回應 headers
  standardHeaders: true,
  legacyHeaders: false,
  // 超出流量時回應的狀態碼
  statusCode: StatusCodes.TOO_MANY_REQUESTS,
  // 超出流量時回應的訊息
  message: '太多請求',
  // 超出流量時回應的 function
  handler (req, res, next, options) {
    res.status(options.statusCode).json({
      success: false,
      message: options.message
    })
  }
}))

app.use(cors({
  // origin = 請求來源
  // callback(錯誤, 是否允許請求)
  origin (origin, callback) {
    if (origin === undefined || origin.includes('github') || origin.includes('localhost')) {
      callback(null, true)
    } else {
      callback(new Error('CORS'), false)
    }
  }
}))
app.use((_, req, res, next) => {
  res.status(StatusCodes.FORBIDDEN).json({
    success: true,
    message: '請求被拒'
  })
})

app.use(express.json())
app.use((_, req, res, next) => {
  res.status(StatusCodes.BAD_REQUEST).json({
    success: true,
    message: '資料格式錯誤'
  })
})

// 將 $ 消除
app.use(mongoSanitize())

app.use('/users', routeUsers)
app.use('/products', routeProducts)
app.use('/orders', routeOrders)

app.all('*', (req, res) => {
  res.status(StatusCodes.NOT_FOUND).json({
    success: false,
    message: '找不到'
  })
})

// render
app.listen(process.env.PORT || 4000, async () => {
  console.log('伺服器啟動')
  await mongoose.connect(process.env.DB_URL)
  mongoose.set('sanitizeFilter', true)
  console.log('資料庫連線成功')
})
