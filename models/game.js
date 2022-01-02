const mongoose = require('mongoose')

mongoose.set('useFindAndModify', false)

const gameSchema = mongoose.Schema({
    type: {
      type: String,
      required: true
    },
    gameId: {
      type: String,
      required: true
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

gameSchema.set('toJSON', {
    transform: (document, returnedObject) => {
      returnedObject.id = returnedObject._id.toString()
      delete returnedObject._id
      delete returnedObject.__v
    }
  })
  
module.exports = mongoose.model('Game', gameSchema)