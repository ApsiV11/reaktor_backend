const mongoose = require('mongoose')
const uniqueValidator = require('mongoose-unique-validator');

const gameSchema = mongoose.Schema({
    type: {
      type: String,
      required: true
    },
    gameId: {
      type: String,
      required: true,
      unique: true
    },
    t: Number,
    playerA: {
      type: Object,
      required: true
    },
    playerB: {
        type: Object,
        required: true
    }
})

gameSchema.plugin(uniqueValidator);

gameSchema.set('toJSON', {
    transform: (document, returnedObject) => {
      returnedObject.id = returnedObject._id.toString()
      delete returnedObject._id
      delete returnedObject.__v
    }
  })
  
module.exports = mongoose.model('Game', gameSchema)