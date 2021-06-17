const bcrypt = require('bcryptjs')
const usersRouter = require('express').Router()
const User = require('../models/user')

usersRouter.get('/', async (request, response) => {
  const users = await User.find({}).populate('blogs', {
    title: 1,
    author: 1,
    url: 1,
    likes: 1,
  })
  response.json(users.map((u) => u.toJSON()))
})
usersRouter.get('/:id', async (request, response) => {
  const userId = request.params.id
  const user = await User.findById({ _id: userId }).populate('blogs', {
    title: 1,
    author: 1,
    url: 1,
    likes: 1,
  })
  response.json(user)
})

usersRouter.post('/', async (request, response) => {
  const body = request.body

  //if password is not present
  if (!body.password) {
    response.status(400).send({
      error: 'User validation failed: password: Path `password` is required.',
    })
  }
  //if password is not min 3 char
  else if (body.password.length <= 3) {
    response.status(400).send({
      error: `User validation failed: password: Path 'password' (${body.password}) is shorter than the minimum allowed length (3).`,
    })
  } else {
    const saltRounds = 10
    const passwordHash = await bcrypt.hash(body.password, saltRounds)

    const user = new User({
      username: body.username,
      name: body.name,
      passwordHash,
    })

    const savedUser = await user.save()
    response.json(savedUser)
  }
})

module.exports = usersRouter
