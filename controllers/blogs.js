/* eslint-disable no-undef */
const jwt = require('jsonwebtoken')
var ObjectId = require('mongoose').Types.ObjectId
const blogsRouter = require('express').Router()
const Blog = require('../models/blog')
const User = require('../models/user')

blogsRouter.get('/', async (request, response) => {
  const blogs = await Blog.find({}).populate('user', { username: 1, name: 1 })
  response.json(blogs)
})

blogsRouter.post('/', async (request, response) => {
  const body = request.body

  const decodedToken = jwt.verify(request.token, process.env.SECRET)
  if (!request.token || !decodedToken.id) {
    return response.status(401).json({ error: 'token missing or invalid' })
  }
  const user = await User.findById(decodedToken.id)

  const blog = new Blog({
    title: request.body.title,
    author: request.body.author,
    url: request.body.url,
    likes: request.body.likes,
    user: user.id,
  })

  if (!body.title && !body.url) {
    response.status(400).json({ error: 'Title and URL field are require' })
  } else if (!body.title && body.url) {
    response.status(400).json({ error: 'Title field is require' })
  } else if (!body.url && body.title) {
    response.status(400).json({ error: 'URL field is require' })
  } else {
    const savedBlog = await blog.save()
    user.blogs = user.blogs.concat(savedBlog._id)
    await user.save()
    response.status(201).json(savedBlog)
  }
})

blogsRouter.delete('/:id', async (request, response) => {
  const decodedToken = jwt.verify(request.token, process.env.SECRET)
  if (!request.token || !decodedToken.id) {
    return response.status(401).json({ error: 'token missing or invalid' })
  }
  const user = await User.findById(decodedToken.id)

  const noteId = request.params.id
  console.log(user.blogs.includes(noteId))

  if (isObjectIdValid(noteId)) {
    if (user.blogs.includes(noteId)) {
      const deletedBlog = await Blog.findByIdAndRemove(noteId)
      if (deletedBlog !== null) {
        response.status(204).end()
      } else {
        response.status(404).send({ error: 'Entry could not be found' })
      }
    }
  } else {
    response.status(404).send({ error: 'Not valid MONGODB ID' })
  }
})

blogsRouter.put('/:id', async (req, res) => {
  const id = req.params.id
  const updatedBlog = req.body
  if (isObjectIdValid(id)) {
    const returnedUpdatedBlog = await Blog.findByIdAndUpdate(id, updatedBlog, {
      new: true,
    })
    if (returnedUpdatedBlog !== null) {
      res.json(returnedUpdatedBlog)
    } else {
      res.status(404).send({ error: 'Entry could not be found' })
    }
  } else {
    res.status(404).send({ error: 'Not valid MONGODB ID' })
  }
})
const isObjectIdValid = (id) =>
  ObjectId.isValid(id)
    ? String(new ObjectId(id) === id)
      ? true
      : false
    : false
module.exports = blogsRouter
