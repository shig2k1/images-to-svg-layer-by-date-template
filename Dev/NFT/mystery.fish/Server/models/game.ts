import mongoose, { Schema } from 'mongoose'

const GameSchema = new Schema({
  created: {
    type: Number
  },
  owner: {
    type: String,
    required: true
  },
  players: {
    type: Array
  }
})

const GameModel = mongoose.model('Game', GameSchema)
export default GameModel
