import mongoose, { Document, Schema } from 'mongoose'
import bcrypt from 'bcryptjs'
import validator from 'validator'

const PlayerSchema = new Schema({
  username: {
    type: String,
    unique: true
  },
  password: {
    type: String,
    required: true
  }
})

// exported interface extending Document
// (otherwise TS won't see PlayerSchema.methods)
interface IPlayer extends Document {
  username: string
  password?: string
  comparePassword: (password: string, next: any) => any
}

// handle password hashing on update
PlayerSchema.pre<IPlayer>('save', function (next: any) {
  if(!this.password || !this.isModified('password')) { 
    return next()
  }
  this.password = bcrypt.hashSync(this.password, 10)
  next()
})

// handle password compare on lookup
PlayerSchema.methods.comparePassword = function (plaintext: string, next: any) {
  return next(null, bcrypt.compareSync(plaintext, this.password))
}

const PlayerModel = mongoose.model<IPlayer>('Player', PlayerSchema)
export default PlayerModel
export { IPlayer }

