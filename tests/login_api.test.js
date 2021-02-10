const bcrypt = require('bcrypt')
const User = require('../models/user')
const helper = require('./test_helper')
const supertest = require('supertest')
const app = require('../app')
const api = supertest(app)

test('User creation', async () => {
  const newUser = new User({
    username: 'Test User',
    name: 'Test',
    password: 'weakpass',
  })
  const createdUser = await api.post('/api/users').send(newUser).expect(200)
})
