var ObjectId = require('mongoose').Types.ObjectId
const blogsRouter = require('express').Router()
const Blog = require('../models/blog')

blogsRouter.get('/', async (request, response) => {
  const blogs = await Blog.find({})
  response.json(blogs)
})

blogsRouter.post('/', async (request, response) => {
  const body = request.body

  if (!body.title && !body.url) {
    response.status(400).json({ error: 'Title and URL field are require' })
  } else if (!body.title && body.url) {
    response.status(400).json({ error: 'Title field is require' })
  } else if (!body.url && body.title) {
    response.status(400).json({ error: 'URL field is require' })
  } else {
    const blog = new Blog(request.body)
    const result = await blog.save()
    response.status(201).json(result)
  }
})

blogsRouter.delete('/:id', async (req, res) => {
  const id = req.params.id
  if (isObjectIdValid(id)) {
    const deletedBlog = await Blog.findByIdAndRemove(id)
    if (deletedBlog !== null) {
      res.status(204).end()
    } else {
      res.status(404).send({ error: 'Entry could not be found' })
    }
  } else {
    res.status(404).send({ error: 'Not valid MONGODB ID' })
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
