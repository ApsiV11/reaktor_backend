const mongoose = require('mongoose')
const uniqueValidator = require('mongoose-unique-validator');

const cursorSchema = mongoose.Schema({
    cursor: {
      type: String,
      required: true
    }
})

cursorSchema.plugin(uniqueValidator);

cursorSchema.set('toJSON', {
    transform: (document, returnedObject) => {
      returnedObject.id = returnedObject._id.toString()
      delete returnedObject._id
      delete returnedObject.__v
    }
  })
  
module.exports = mongoose.model('Cursor', cursorSchema)