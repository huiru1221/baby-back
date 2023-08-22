import passport from 'passport'
import passportLocal from 'passport-local'
import passportJWT from 'passport-jwt'
import bcrypt from 'bcrypt'
import users from '../models/users.js'
import LineStrategy from 'passport-line'

passport.use('jwt', new passportJWT.Strategy({
  jwtFromRequest: passportJWT.ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.JWT_SECRET,
  passReqToCallback: true,
  ignoreExpiration: true
}, async (req, payload, done) => {
  try {
    const expired = payload.exp * 1000 < Date.now()

    const url = req.baseUrl + req.path
    if (expired && url !== '/users/extend' && url !== 'users/logout') {
      throw new Error('EXPIRED')
    }

    const token = req.headers.authorization.split(' ')[1]

    const user = await users.findOne({ _id: payload._id, tokens: token })
    if (!user) {
      throw new Error('NO USER')
    }
    return done(null, { user, token })
  } catch (error) {
    if (error.message === 'EXPIRED') {
      return done(null, false, { message: ' 登入逾時 ' })
    } else if (error.message === 'NO USER') {
      return done(null, false, { message: '使用者或 JWT 無效' })
    } else {
      return done(error, false, { message: '錯誤' })
    }
  }
}))

passport.use('line', new LineStrategy({
  channelID: process.env.LOGIN_CHANNEL_ID,
  channelSecret: process.env.LOGIN_CHANNEL_SECRET,
  callbackURL: process.env.LOGIN_CHANNEL_CALLBACK,
  scope: ['profile', 'openid', 'email'],
  botPrompt: 'normal'
},
async (accessToken, refreshToken, profile, done) => {
  try {
    const user = await users.findOne({ line: profile.id })
    if (user) {
      user.username = profile.displayName
      user.picture = profile.pictureUrl
      await user.save()
      done(null, user)
    } else {
      const result = await users.create({
        line: profile.id,
        username: profile.displayName,
        picture: profile.pictureUrl
      })
      done(null, result)
    }
  } catch (error) {
    console.log(error)
    done(error, false)
  }
}
))
