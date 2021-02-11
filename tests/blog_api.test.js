const mongoose = require('mongoose')
const supertest = require('supertest')
const helper = require('./test_helper')
const app = require('../app')
const _ = require('lodash')
const Blog = require('../models/blog')
const User = require('../models/user')
const api = supertest(app)

beforeEach(async () => {
  await Blog.deleteMany({})
  await User.deleteMany({})

  const blogsObjects = helper.initialBlogs.map((blog) => new Blog(blog))
  const promiseArray = blogsObjects.map((blog) => blog.save())
  await Promise.all(promiseArray)

  await helper.registerUser({ username: 'root', password: 'sekret' })
  await helper.registerUser({ username: 'test', password: 'testpassword' })

  const users = await helper.usersInDb()
  const blogs = await helper.blogsInDb()

  for (let i = 0; i < blogs.length; i++) {
    if (i % 2 === 0) {
      const user = await User.findById(users[0].id)
      const blog = blogs[i]
      blog.user = user.id
      const savedBlog = await Blog.findByIdAndUpdate(blog.id, blog, {
        new: true,
      })
      user.blogs = user.blogs.concat(savedBlog._id)
      await user.save()
    } else {
      const user = await User.findById(users[1].id)
      const blog = blogs[i]
      blog.user = user.id
      const savedBlog = await Blog.findByIdAndUpdate(blog.id, blog, {
        new: true,
      })
      user.blogs = user.blogs.concat(savedBlog._id)
      await user.save()
    }
  }

  /*   


  const passwordHashOne = await bcrypt.hash('sekret', 10)
  const userOne = new User({ username: 'root', passwordHashOne })

  const passwordHashTwo = await bcrypt.hash('sekret', 10)
  const userTwo = new User({ username: 'root', passwordHashTwo })

  await userTwo.save()
  await userOne.save() */
})

describe('*** POST checks ***', () => {
  test('Blog post is successful (Logged in)', async () => {
    const newBlog = {
      title: 'New Added Blog',
      author: 'Author Added',
      url: 'https://SomeAddedBlog.test',
      likes: 46,
    }

    const user = { username: 'root', password: 'sekret' }
    const loggedInUser = await api.post('/api/login').send(user)

    await api
      .post('/api/blogs/')
      .set('Authorization', `bearer ${loggedInUser.body.token}`)
      .send(newBlog)
      .expect(201)
      .expect('Content-Type', /application\/json/)

    const blogsAfterPost = await helper.blogsInDb()
    expect(blogsAfterPost).toHaveLength(helper.initialBlogs.length + 1)

    const blogContents = blogsAfterPost.map((b) => b.title)
    expect(blogContents).toContain(newBlog.title)
  })
  test('Blog post is added to user.blogs array', async () => {
    const newBlog = {
      title: 'New Added Blog',
      author: 'Author Added',
      url: 'https://SomeAddedBlog.test',
      likes: 46,
    }

    const user = { username: 'root', password: 'sekret' }
    const loggedInUser = await api.post('/api/login').send(user)

    const postedBlog = await api
      .post('/api/blogs/')
      .set('Authorization', `bearer ${loggedInUser.body.token}`)
      .send(newBlog)

    const usersInDb = await helper.usersInDb()
    const updatedUser = _.find(usersInDb, (u) => {
      return u.username === user.username
    })

    expect(updatedUser.blogs.toString()).toContain([postedBlog.body.id])
  })
  test('User is added to blog object on post', async () => {
    const newBlog = {
      title: 'New Added Blog',
      author: 'Author Added',
      url: 'https://SomeAddedBlog.test',
      likes: 46,
    }

    const user = { username: 'root', password: 'sekret' }
    const loggedInUser = await api.post('/api/login').send(user)

    const postedBlog = await api
      .post('/api/blogs/')
      .set('Authorization', `bearer ${loggedInUser.body.token}`)
      .send(newBlog)

    expect(postedBlog.body.user).toBeDefined()
  })

  describe('--- ERROR: Authentication  ---', () => {
    test('Error: bad token', async () => {
      const newBlog = {
        title: 'New Added Blog',
        author: 'Author Added',
        url: 'https://SomeAddedBlog.test',
        likes: 46,
      }
      const user = { username: 'root', password: 'sekret' }
      const loggedInUser = await api.post('/api/login').send(user)

      const postedBlog = await api
        .post('/api/blogs/')
        .set('Authorization', `bearer ${loggedInUser.body.token + 'a'}`)
        .send(newBlog)
        .expect(401)
        .expect('Content-Type', /application\/json/)

      expect(postedBlog.body.error).toContain('invalid token')
    })

    test('Error: no token', async () => {
      const newBlog = {
        title: 'New Added Blog',
        author: 'Author Added',
        url: 'https://SomeAddedBlog.test',
        likes: 46,
      }

      const responseOne = await api
        .post('/api/blogs/')
        .set('Authorization', `bearer `)
        .send(newBlog)
        .expect(401)
        .expect('Content-Type', /application\/json/)

      expect(responseOne.body.error).toContain('invalid token')
    })
    test('Error: no auth header', async () => {
      const newBlog = {
        author: 'Missing URL',
        title: 'Test Title',
      }

      const responseTwo = await api
        .post('/api/blogs/')
        .send(newBlog)
        .expect(401)
        .expect('Content-Type', /application\/json/)

      expect(responseTwo.body.error).toContain('invalid token')
    })
  })

  describe('--- ERROR: missing variables (Logged in) ---', () => {
    test('Likes defult to ZERO', async () => {
      const newBlog = {
        title: 'New Added Blog',
        author: 'Author Added',
        url: 'https://SomeAddedBlog.test',
      }
      const user = { username: 'root', password: 'sekret' }
      const loggedInUser = await api.post('/api/login').send(user)

      const postedBlog = await api
        .post('/api/blogs/')
        .set('Authorization', `bearer ${loggedInUser.body.token}`)
        .send(newBlog)
        .expect(201)
        .expect('Content-Type', /application\/json/)

      expect(postedBlog.body.likes).toBe(0)
    })

    test('Error: missing title and url', async () => {
      const newBlog = {
        author: 'Missing url and title',
      }

      const user = { username: 'root', password: 'sekret' }
      const loggedInUser = await api.post('/api/login').send(user)

      const responseOne = await api
        .post('/api/blogs/')
        .set('Authorization', `bearer ${loggedInUser.body.token}`)
        .send(newBlog)
        .expect(400)
        .expect('Content-Type', /application\/json/)

      expect(responseOne.body.error).toContain('`title` is required')
    })
    test('Error: missing url', async () => {
      const newBlog = {
        author: 'Missing URL',
        title: 'Test Title',
      }

      const user = { username: 'root', password: 'sekret' }
      const loggedInUser = await api.post('/api/login').send(user)

      const responseTwo = await api
        .post('/api/blogs/')
        .set('Authorization', `bearer ${loggedInUser.body.token}`)
        .send(newBlog)
        .expect(400)
        .expect('Content-Type', /application\/json/)

      expect(responseTwo.body.error).toContain('`url` is required')
    })
    test('Error: missing title', async () => {
      const newBlog = {
        author: 'Missing title',
        url: 'Test Url',
      }

      const user = { username: 'root', password: 'sekret' }
      const loggedInUser = await api.post('/api/login').send(user)

      const responseThree = await api
        .post('/api/blogs/')
        .set('Authorization', `bearer ${loggedInUser.body.token}`)
        .send(newBlog)
        .expect(400)
        .expect('Content-Type', /application\/json/)

      expect(responseThree.body.error).toContain('`title` is required')
    })
  })
})

describe('*** GET checks ***', () => {
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

describe('*** DELETE checks ***', () => {
  describe('--- ERROR: note not registered to user ---', () => {
    test('user logged in', async () => {
      const user = { username: 'root', password: 'sekret' }
      const loggedInUser = await api.post('/api/login').send(user)

      const blogsInDb = await helper.blogsInDb()

      await api
        .delete(`/api/blogs/${blogsInDb[1].id}`)
        .set('Authorization', `bearer ${loggedInUser.body.token}`)
        .expect(401)
    })
    test('Error: User not logged in', async () => {
      const blogsInDb = await helper.blogsInDb()

      await api.delete(`/api/blogs/${blogsInDb[0].id}`).expect(401)
    })
  })
  describe('--- Note deleted by user ---', () => {
    test('DELETE by id (Logged in)', async () => {
      const user = { username: 'root', password: 'sekret' }
      const loggedInUser = await api.post('/api/login').send(user)

      const blogsInDb = await helper.blogsInDb()

      await api
        .delete(`/api/blogs/${blogsInDb[0].id}`)
        .set('Authorization', `bearer ${loggedInUser.body.token}`)
        .expect(204)
    })

    test('Error: not valid id', async () => {
      const notValidMongoId = '6022453865dcfd6874d6dc'

      const user = { username: 'root', password: 'sekret' }
      const loggedInUser = await api.post('/api/login').send(user)

      const res = await api
        .delete(`/api/blogs/${notValidMongoId}`)
        .set('Authorization', `bearer ${loggedInUser.body.token}`)
        .expect(400)
      expect(res.body.error).toBe('malformatted id')
    })
    test('Error: none exsisting blog by id', async () => {
      const nonExsistingId = await helper.nonExistingId()

      const user = { username: 'root', password: 'sekret' }
      const loggedInUser = await api.post('/api/login').send(user)

      const response = await api
        .delete(`/api/blogs/${nonExsistingId}`)
        .set('Authorization', `bearer ${loggedInUser.body.token}`)
        .expect(404)
      expect(response.body.error).toBe('Entry could not be found')
    })
  })
})

describe('*** PUT checks ***', () => {
  test('Error: User not logged in', async () => {
    const blogsInDb = await helper.blogsInDb()
    const blogToUpdate = blogsInDb[0]

    const updateInformation = { likes: 79 }

    blogToUpdate.likes = 79
    const returnedBlog = await api
      .put(`/api/blogs/${blogToUpdate.id}`)
      .send(updateInformation)
      .expect(401)
    expect(returnedBlog.body.error).toContain('invalid token')
  })
  test('Updates amount of likes', async () => {
    const user = { username: 'root', password: 'sekret' }
    const loggedInUser = await api.post('/api/login').send(user)

    const blogsInDb = await helper.blogsInDb()
    const blogToUpdate = blogsInDb[0]

    const updateInformation = { likes: 79 }

    blogToUpdate.likes = 79
    const returnedBlog = await api
      .put(`/api/blogs/${blogToUpdate.id}`)
      .set('Authorization', `bearer ${loggedInUser.body.token}`)
      .send(updateInformation)
      .expect(200)
    expect(returnedBlog.body.likes).toEqual(blogToUpdate.likes)
  })
  test('Error: not valid id', async () => {
    const user = { username: 'root', password: 'sekret' }
    const loggedInUser = await api.post('/api/login').send(user)

    const badId = 'asdasdadasda23'

    const updateInformation = { likes: 79 }

    const response = await api
      .put(`/api/blogs/${badId}`)
      .set('Authorization', `bearer ${loggedInUser.body.token}`)
      .send(updateInformation)
      .expect(400)
    expect(response.body.error).toBe('malformatted id')
  })
  test('Error: none exsisting blog by id', async () => {
    const user = { username: 'root', password: 'sekret' }
    const loggedInUser = await api.post('/api/login').send(user)

    const nonExsistingId = await helper.nonExistingId()

    const updateInformation = { likes: 79 }

    const response = await api
      .put(`/api/blogs/${nonExsistingId}`)
      .set('Authorization', `bearer ${loggedInUser.body.token}`)
      .send(updateInformation)
      .expect(404)
    expect(response.body.error).toBe('Entry could not be found')
  })
})

afterAll(() => {
  mongoose.connection.close()
})
