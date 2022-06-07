const express = require('express')
const port = 3000
const { v4: uuidv4 } = require('uuid')

const app = express()
app.use(express.json())

const users = []

function verifyExistsUserAccount(req, res, next) {
  const { username } = req.headers

  const user = users.find((user) => user.username === username)
  if (!user) {
    return res
      .status(404)
      .json({ error: 'User not found' })
  }
  req.user = user
  return next()
}

app.post('/user', (req, res) => {
  const { username, name } = req.body
  const userAlreadyExists = users.some((user) => user.username === username)

  if (userAlreadyExists) {
    return res
      .status(400)
      .json({ error: 'User already exists' })

  }
  users.push({
    username,
    name,
    id: uuidv4(),
    todo: []
  })
  return res
    .status(201)
    .send()

})

app.get('/todos', verifyExistsUserAccount, (req, res) => {
  const { user } = req
  return res
    .status(200)
    .json(user.todo)
})

app.post('/todos', verifyExistsUserAccount, (req, res) => {
  const { title, done, deadline } = req.body
  const { user } = req

  const todoOperation = {
    id: uuidv4(),
    title,
    done,
    deadline,
    created_at: new Date()
  }

  user.todo.push(todoOperation)
  return res
    .status(201)
    .send(user.todo)

})

app.put('/todos/:id', verifyExistsUserAccount, (req, res) => {
  const { user } = req
  const { id } = req.params
  const { title, deadline } = req.body

  const todo = user.todo.find((todo) => todo.id === id)

  if (!todo) {
    return res
      .status(404)
      .json({ error: 'To do not found' })

  }

  todo.title = title
  todo.deadline = deadline

  return res
    .status(201)
    .send()

})

app.patch('/todos/:id/done', verifyExistsUserAccount, (req, res) => {
  const { user } = req
  const { id } = req.params

  const todo = user.todo.find((todo) => todo.id === id)
  if (!todo) {
    return res
      .status(404)
      .json({ error: 'To do not found' })

  }

  todo.done = true
  return res
    .status(201)
    .send()

})

app.delete('/todos/:id', verifyExistsUserAccount, (req, res) => {
  const { user } = req
  const { id } = req.params

  const todoDelete = user.todo.find((todo) => todo.id === id)

  if (!todoDelete) {
    return res
      .status(404)
      .json({ error: 'To do not found' })

  }
  user.todo.splice(todoDelete, 1)


  return res
    .status(200)
    .json(user.todo)
})

app.listen(port, () => {
  console.log(`Listening app on port ${port}`)
})