import mongoose from 'mongoose'
// import validator from 'validator'
// import bcrypt from 'bcrypt'
import UserRole from '../enums/UserRole.js'

const cartSchema = new mongoose.Schema({
  product: {
    type: mongoose.ObjectId,
    ref: 'products',
    required: [true, '缺少商品']
  },
  quantity: {
    type: Number,
    required: [true, '缺少數量']
  }
}, { versionKey: false })

const schema = new mongoose.Schema({
  // line登入
  line: {
    type: String,
    required: [true, '缺少line id'],
    unique: true
  },
  username: {
    type: String,
    required: [true, '缺少 line username']
  },
  picture: {
    type: String,
    require: [true, '缺少 line pictureurl']
  },
  tokens: {
    type: [String],
    default: []
  },
  // line登入
  cart: {
    type: [cartSchema],
    default: []
  },
  role: {
    type: Number,
    default: UserRole.USER
  }
  // 關掉修改次數顯示
}, { versionKey: false })

export default mongoose.model('users', schema)
