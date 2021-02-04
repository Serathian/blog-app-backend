const config = require('../utils/config')
const mongoose = require('mongoose')
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
  title: String,
  author: String,
  url: String,
  likes: Number,
})

module.exports = mongoose.model('Blog', blogSchema)
