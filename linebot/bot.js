import linebot from 'linebot'

const bot = linebot({
  channelId: process.env.CHANNEL_ID,
  channelSecret: process.env.CHANNEL_SECRET,
  channelAccessToken: process.env.CHANNEL_ACCESS_TOKEN
})

bot.on('message', function (event) {
  event.reply(event.message.text).then(function (data) {
    console.log('Success', data)
  }).catch(function (error) {
    console.log('Error', error)
  })
})

export default bot

/**
 * 傳送 LINE 訊息給使用者
 * @param {string} id 使用者 line id
 * @param {object} message 要送出的訊息
 */
export const sendMessage = async (id, message) => {
  try {
    await bot.push(id, message)
  } catch (error) {
    console.log(error)
  }
}
