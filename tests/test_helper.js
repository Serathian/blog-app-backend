const Blog = require('../models/blog')
const User = require('../models/user')
//#region Blog helpers
const initialBlogs = [
  {
    title: 'Test Blog One',
    author: 'Author One',
    url: 'https://SomeBlogOne.test',
    likes: 5,
  },
  {
    title: 'Test Blog Two',
    author: 'Some Author Two',
    url: 'https://SomeBlogTwo.test',
    likes: 1,
  },
]

const initialUsers = [
  { username: 'Test User One', name: 'T-user-1', password: 'testPassword' },
]

const nonExistingId = async () => {
  const blog = new Blog({
    title: 'Will Be Removed',
    author: 'Should Be Removed',
    url: 'https://DeleteMe.test',
    likes: 69,
  })
  await blog.save()
  await blog.remove()

  return blog._id.toString()
}

const blogsInDb = async () => {
  const blogs = await Blog.find({})
  return blogs.map((blog) => blog.toJSON())
}
//#endregion

//#region User helpers
const usersInDb = async () => {
  const users = await User.find({})
  return users.map((u) => u.toJSON())
}
//#endregion
module.exports = {
  initialBlogs,
  initialUsers,
  nonExistingId,
  blogsInDb,
  usersInDb,
}
