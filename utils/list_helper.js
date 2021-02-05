const _ = require('lodash')

const dummy = (blogs) => {
  return 1
}

const totalLikes = (blogs) => {
  return blogs.reduce((acc, cur) => acc + cur.likes, 0)
}

const favoriteBlog = (blogs) => {
  const max = Math.max.apply(
    Math,
    blogs.map((blog) => blog.likes)
  )
  const obj = blogs.find((blog) => (blog.likes = max))
  return obj
}

const mostBlogs = (blogs) => {
  //Get list of authors and thier blog count
  const blogAuthors = _.countBy(blogs, (blog) => blog.author)
  console.log('blogAuthors: ', blogAuthors)

  //Get name of the author with most blog count
  const authorWithMostBlogs = _.maxBy(
    _.keys(blogAuthors),
    (x) => blogAuthors[x]
  )
  //I need to asasign the authors name and blog posts to the object
  return {
    author: authorWithMostBlogs,
    blogs: blogAuthors[authorWithMostBlogs],
  }
}

const mostLikes = (blogs) => {
  const authors = _(blogs)
    .groupBy('author')
    .map((objs, key) => ({
      author: key,
      likes: _.sumBy(objs, 'likes'),
    }))
    .value()

  const authorsDesc = _.orderBy(authors, 'likes', 'desc')
  console.log(authorsDesc[0])

  const authorWithMostLikes = authorsDesc[0]
  return authorWithMostLikes
}

module.exports = {
  dummy,
  totalLikes,
  favoriteBlog,
  mostBlogs,
  mostLikes,
}
