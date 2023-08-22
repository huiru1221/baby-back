import orders from '../models/orders.js'
import users from '../models/users.js'
import { getMessageFromValidationError } from '../utils/error.js'
import { StatusCodes } from 'http-status-codes'
import { sendMessage } from '../linebot/bot.js'
import products from '../models/products.js'
import mongoose from 'mongoose'

export const create = async (req, res) => {
  try {
    // 檢查購物車是不是空的
    if (req.user.cart.length === 0) {
      throw new Error('EMPTY')
    }
    // 檢查是否有下架商品
    const user = await users.findById(req.user._id, 'cart').populate('cart.product')
    const canCheckout = user.cart.every(cart => cart.product.sell)
    if (!canCheckout) {
      throw new Error('SELL')
    }
    // 建立訂單
    const result = await orders.create({
      user: req.user._id,
      cart: req.user.cart
    })
    // 清空購物車(完成購買後下架商品)
    const productIds = req.user.cart.map((data) => new mongoose.Types.ObjectId(data.product.toString()))
    for (const productId of productIds) {
      await products.findByIdAndUpdate(productId, { sell: false })
    }
    req.user.cart = []
    await req.user.save()
    res.status(StatusCodes.OK).json({
      success: true,
      message: ''
    })

    const orderResult = await orders.findById(result._id).populate('cart.product')
    const total = orderResult.cart.reduce((total, current) => total + (current.quantity * current.product.price), 0)
    await sendMessage(req.user.line, `感謝您的訂購♥\n以下是您的訂單資訊。\n訂單編號： ${result._id}\n金額： NT. ${total}\n購買日期： ${new Date(result.date).toLocaleString('zh-TW')}`)
  } catch (error) {
    console.log(error)
    if (error.message === 'EMPTY') {
      res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: '購物車為空'
      })
    } else if (error.message === 'SELL') {
      res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: '包含下架商品'
      })
    } else if (error.name === 'ValidationError') {
      res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: getMessageFromValidationError(error)
      })
    } else {
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: '發生錯誤'
      })
    }
  }
}

export const get = async (req, res) => {
  try {
    const result = await orders.find({ user: req.user._id }).populate('cart.product')
    res.status(StatusCodes.OK).json({
      success: true,
      message: '',
      result
    })
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: '發生錯誤'
    })
  }
}

export const getAll = async (req, res) => {
  try {
    const result = await orders.find().populate('cart.product').populate('user', 'username')
    res.status(StatusCodes.OK).json({
      success: true,
      message: '',
      result
    })
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: '發生錯誤'
    })
  }
}
