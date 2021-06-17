/* eslint-disable no-undef */
const blogsRouter = require('express').Router()
const jwt = require('jsonwebtoken')
const Blog = require('../models/blog')
const User = require('../models/user')

blogsRouter.get('/', async (_request, response) => {
  const blogs = await Blog.find({}).populate('user', { username: 1, name: 1 })
  response.json(blogs)
})
blogsRouter.get('/:id', async (request, response) => {
  const blogID = request.params.id
  const blog = await Blog.findById({ _id: blogID })
  response.json(blog)
})

blogsRouter.post('/', async (request, response) => {
  const body = request.body

  const decodedToken = jwt.verify(request.token, process.env.SECRET)
  if (!request.token || !decodedToken.id) {
    return response.status(401).json({ error: 'token missing or invalid' })
  }
  const user = await User.findById(decodedToken.id)
  const blog = new Blog({
    title: body.title,
    author: body.author,
    url: body.url,
    likes: body.likes,
    user: user.id,
  })

  const savedBlog = await blog.save()
  user.blogs = user.blogs.concat(savedBlog._id)
  await user.save()
  response.status(201).json(savedBlog)
})

blogsRouter.delete('/:id', async (request, response) => {
  const decodedToken = jwt.verify(request.token, process.env.SECRET)
  if (!request.token || !decodedToken.id) {
    return response.status(401).json({ error: 'token missing or invalid' })
  } else {
    const blogId = request.params.id
    const blog = await Blog.findById(blogId)
    if (blog !== null) {
      const userId = decodedToken.id

      if (blog.user.toString() === userId.toString()) {
        const deletedBlog = await Blog.findByIdAndRemove(blogId)
        if (deletedBlog !== null) {
          response.status(204).end()
        } else {
          response.status(404).send({ error: 'Entry could not be found' })
        }
      } else {
        response.status(401).send({ error: 'Authentication error' })
      }
    } else {
      response.status(404).send({ error: 'Entry could not be found' })
    }
  }
})

blogsRouter.put('/:id', async (request, response) => {
  const decodedToken = jwt.verify(request.token, process.env.SECRET)
  if (!request.token || !decodedToken.id) {
    return response.status(401).json({ error: 'token missing or invalid' })
  } else {
    const userId = decodedToken.id
    const blogId = request.params.id
    const blog = await Blog.findById(blogId)
    const updatedBlog = request.body

    if (blog !== null) {
      if (blog.user.toString() === userId.toString()) {
        const returnedUpdatedBlog = await Blog.findByIdAndUpdate(
          blogId,
          updatedBlog,
          {
            new: true,
          }
        )
        if (returnedUpdatedBlog !== null) {
          response.json(returnedUpdatedBlog)
        } else {
          response.status(404).send({ error: 'Entry could not be found' })
        }
      } else {
        response.status(401).send({ error: 'Authentication error' })
      }
    } else {
      response.status(404).send({ error: 'Entry could not be found' })
    }
  }
})

blogsRouter.put('/:id/comments', async (request, response) => {
  const decodedToken = jwt.verify(request.token, process.env.SECRET)

  if (!request.token || !decodedToken.id) {
    return response.status(401).json({ error: 'token missing or invalid' })
  } else {
    const userId = decodedToken.id
    const blogId = request.params.id
    const newComment = request.body.comment
    const blog = await Blog.findById(blogId)
    let updatedBlog = blog._doc
    if (blog.comments) {
      updatedBlog = {
        ...updatedBlog,
        comments: [...updatedBlog.comments, newComment],
      }
    } else {
      updatedBlog = { ...updatedBlog, comments: [newComment] }
    }

    if (blog !== null) {
      if (userId.toString()) {
        const returnedUpdatedBlog = await Blog.findByIdAndUpdate(
          blogId,
          updatedBlog,
          {
            new: true,
          }
        )
        if (returnedUpdatedBlog !== null) {
          response.json(returnedUpdatedBlog)
        } else {
          response.status(404).send({ error: 'Entry could not be found' })
        }
      } else {
        response.status(401).send({ error: 'Authentication error' })
      }
    } else {
      response.status(404).send({ error: 'Entry could not be found' })
    }
  }
})

module.exports = blogsRouter
