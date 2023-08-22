import mongoose from 'mongoose'

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
  user: {
    type: mongoose.ObjectId,
    ref: 'users',
    required: [true, '缺少使用者']
  },
  date: {
    type: Date,
    default: Date.now
  },
  cart: {
    type: [cartSchema],
    default: [],
    validate: {
      validator (value) {
        return Array.isArray(value) && value.length > 0
      },
      message: '購物車不能為空'
    }
  }
  // name: {
  //   type: String,
  //   required: [true, '缺少收件人']
  // },
  // phone: {
  //   type: String,
  //   required: [true, '缺少電話']
  // },
  // email: {
  //   type: String,
  //   required: [true, '缺少電子信箱']
  // },
  // address: {
  //   type: String,
  //   required: [true, '缺少地址']
  // },
  // payment: {
  //   type: String,
  //   required: [true, '缺少付款方式']
  // }
}, { versionKey: false })

export default mongoose.model('orders', schema)
