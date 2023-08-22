import mongoose from 'mongoose'

const schema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, '缺少名稱']
  },
  price: {
    type: Number,
    required: [true, '缺少價格'],
    min: [0, '價格太低']
  },
  image: {
    type: String,
    required: [true, '缺少圖片']
  },
  description: {
    type: String,
    required: [true, '缺少說明']
  },
  category: {
    type: String,
    required: [true, '缺少分類'],
    enum: {
      values: ['新生兒', '女童', '男童', '童鞋', '汽車座椅', '電器用品', '學習餐椅', '童書玩具', '彌月禮盒', '其他'],
      message: '分類錯誤'
    }
  },
  sell: {
    type: Boolean,
    required: [true, '缺少上架狀態']
  }
}, { versionKey: false })

export default mongoose.model('products', schema)
