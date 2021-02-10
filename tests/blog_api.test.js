const mongoose = require('mongoose')
const supertest = require('supertest')
const helper = require('./test_helper')
const app = require('../app')
const api = supertest(app)
const Blog = require('../models/blog')

beforeEach(async () => {
  await Blog.deleteMany({})

  const blogsObjects = helper.initialBlogs.map((blog) => new Blog(blog))
  const promiseArray = blogsObjects.map((blog) => blog.save())
  await Promise.all(promiseArray)
})
describe('POST and return checks', () => {
  test('Blog post is successful', async () => {
    const newBlog = {
      title: 'New Added Blog',
      author: 'Author Added',
      url: 'https://SomeAddedBlog.test',
      likes: 46,
    }

    await api
      .post('/api/blogs')
      .send(newBlog)
      .expect(201)
      .expect('Content-Type', /application\/json/)

    const blogsAfterPost = await helper.blogsInDb()
    expect(blogsAfterPost).toHaveLength(helper.initialBlogs.length + 1)

    const blogContents = blogsAfterPost.map((b) => b.title)
    expect(blogContents).toContain(newBlog.title)
  })
  test('blogs are returned as json', async () => {
    await api
      .get('/api/blogs')
      .expect(200)
      .expect('Content-Type', /application\/json/)
  })

  test('Blog _.id is blog.id', async () => {
    const response = await api.get('/api/blogs')

    expect(response.body[0].id).toBeDefined()
    expect(response.body[0]._id).not.toBeDefined()
  })
})

describe('POST with missing variables', () => {
  test('Likes defult to ZERO', async () => {
    const newBlog = {
      title: 'New Added Blog',
      author: 'Author Added',
      url: 'https://SomeAddedBlog.test',
    }

    const postedBlog = await api
      .post('/api/blogs')
      .send(newBlog)
      .expect(201)
      .expect('Content-Type', /application\/json/)

    expect(postedBlog.body.likes).toBe(0)
  })

  test('Error: missing title and url', async () => {
    const newBlog = {
      author: 'Missing url and title',
    }

    const responseOne = await api.post('/api/blogs').send(newBlog).expect(400)
    expect(responseOne.body.error).toBe('Title and URL field are require')
  })
  test('Error: missing url', async () => {
    const newBlog = {
      author: 'Missing URL',
      title: 'Test Title',
    }

    const responseTwo = await api.post('/api/blogs').send(newBlog).expect(400)
    expect(responseTwo.body.error).toBe('URL field is require')
  })
  test('Error: missing title', async () => {
    const newBlog = {
      author: 'Missing title',
      url: 'Test Url',
    }

    const responseThree = await api.post('/api/blogs').send(newBlog).expect(400)
    expect(responseThree.body.error).toBe('Title field is require')
  })
})

describe('DELETE of a entry', () => {
  test('DELETE by id', async () => {
    const blogsInDb = await helper.blogsInDb()
    await api.delete(`/api/blogs/${blogsInDb[0].id}`).expect(204)
  })
  test('Error: not valid id', async () => {
    const notValidMongoId = '6022453865dcfd6874d6dc'

    const res = await api.delete(`/api/blogs/${notValidMongoId}`).expect(404)
    expect(res.body.error).toBe('Not valid MONGODB ID')
  })
  test('Error: none exsisting blog by id', async () => {
    const nonExsistingId = await helper.nonExistingId()
    const response = await api
      .delete(`/api/blogs/${nonExsistingId}`)
      .expect(404)
    expect(response.body.error).toBe('Entry could not be found')
  })
})

describe('PUT of a entry variable', () => {
  test('Updates amount of likes', async () => {
    const blogsInDb = await helper.blogsInDb()
    const blogToUpdate = blogsInDb[0]
    const iDofBlogToUpdate = blogToUpdate.id

    const updateInformation = { likes: 79 }

    blogToUpdate.likes = 79
    const returnedBlog = await api
      .put(`/api/blogs/${iDofBlogToUpdate}`)
      .send(updateInformation)
      .expect(200)
    expect(returnedBlog.body).toEqual(blogToUpdate)
  })
  test('Error: not valid id', async () => {
    const badId = 'asdasdadasda23'
    const response = await api.put(`/api/blogs/${badId}`).expect(404)
    expect(response.body.error).toBe('Not valid MONGODB ID')
  })
  test('Error: none exsisting blog by id', async () => {
    const nonExsistingId = await helper.nonExistingId()
    const response = await api.put(`/api/blogs/${nonExsistingId}`).expect(404)
    expect(response.body.error).toBe('Entry could not be found')
  })
})

afterAll(() => {
  mongoose.connection.close()
})
