const listHelper = require('../utils/list_helper')

describe('Test 1', () => {
  const blogs = []
  test('dummy returns one', () => {
    const result = listHelper.dummy(blogs)
    expect(result).toBe(1)
  })
})

describe('Test 2', () => {
  const blogs = [
    {
      title: 'Some title',
      author: 'Some author',
      url: 'https://Someblog.test',
      likes: 1,
    },
    {
      title: 'Some title',
      author: 'Some author',
      url: 'https://Someblog.test',
      likes: 0,
    },
    {
      title: 'Some title',
      author: 'Some author',
      url: 'https://Someblog.test',
      likes: 0,
    },
    {
      title: 'Some title',
      author: 'Some author',
      url: 'https://Someblog.test',
      likes: 1,
    },
  ]
  test('totalLikes returns 2', () => {
    const result = listHelper.totalLikes(blogs)
    expect(result).toBe(2)
  })
})

describe('Test 3', () => {
  const blogs = [
    {
      title: 'Some title',
      author: 'Some author',
      url: 'https://Someblog.test',
      likes: 5,
    },
    {
      title: 'Some title',
      author: 'Some author',
      url: 'https://Someblog.test',
      likes: 0,
    },
    {
      title: 'Some title',
      author: 'Some author',
      url: 'https://Someblog.test',
      likes: 0,
    },
    {
      title: 'Some title',
      author: 'Some author',
      url: 'https://Someblog.test',
      likes: 1,
    },
  ]
  test('Most liked blog', () => {
    const result = listHelper.favoriteBlog(blogs)
    expect(result).toEqual({
      title: 'Some title',
      author: 'Some author',
      url: 'https://Someblog.test',
      likes: 5,
    })
  })
})

describe('Test 4', () => {
  const blogs = [
    {
      title: 'Some title',
      author: 'Some author',
      url: 'https://Someblog.test',
      likes: 5,
    },
    {
      title: 'Some title',
      author: 'This author',
      url: 'https://Someblog.test',
      likes: 0,
    },
    {
      title: 'Some title',
      author: 'This author',
      url: 'https://Someblog.test',
      likes: 0,
    },
    {
      title: 'Some title',
      author: 'This author',
      url: 'https://Someblog.test',
      likes: 1,
    },
  ]
  test('most blogs author', () => {
    const result = listHelper.mostBlogs(blogs)
    expect(result).toEqual({ author: 'This author', blogs: 3 })
  })
})

describe('Test 5', () => {
  const blogs = [
    {
      title: 'Some title',
      author: 'Some author',
      url: 'https://Someblog.test',
      likes: 5,
    },
    {
      title: 'Some title',
      author: 'This author',
      url: 'https://Someblog.test',
      likes: 3,
    },
    {
      title: 'Some title',
      author: 'This author',
      url: 'https://Someblog.test',
      likes: 0,
    },
    {
      title: 'Some title',
      author: 'This author',
      url: 'https://Someblog.test',
      likes: 1,
    },
  ]
  test('most blog likes', () => {
    const result = listHelper.mostLikes(blogs)
    expect(result).toEqual({ author: 'Some author', likes: 5 })
  })
})
