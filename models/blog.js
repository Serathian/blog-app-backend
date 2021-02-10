const config = require('../utils/config')
const mongoose = require('mongoose')
const uniqueValidator = require('mongoose-unique-validator')
const mongoUrl = config.MONGODB_URI

mongoose
  .connect(mongoUrl, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
    useCreateIndex: true,
  })
  .then(() => console.log('connecting to mongoDB'))
  .catch((error) => console.log('Error connecting to MongoDB: ', error.message))

const blogSchema = new mongoose.Schema({
  title: { type: String, required: true },
  author: String,
  url: { type: String, required: true },
  likes: { type: Number, default: 0 },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
})

blogSchema
  .set('toJSON', {
    transform: (document, returnedObject) => {
      returnedObject.id = returnedObject._id.toString()
      delete returnedObject._id
      delete returnedObject.__v
    },
  })
  .plugin(uniqueValidator)

module.exports = mongoose.model('Blog', blogSchema)
