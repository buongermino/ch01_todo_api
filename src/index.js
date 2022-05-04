const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers

  const foundUser = users.find(user => user.username === username)

  if (!foundUser) {
    return response.status(404).json({ error: "User not found" })
  }
  request.user = foundUser
  next()
}

function todoExists(user, id) {
  const foundToDo = user.todos.find(todo => todo.id === id)

  if (!foundToDo) {
    return false
  }
  return true
}

app.post('/users', (request, response) => {
  const { name, username } = request.body

  const usernameExists = users.some(user => user.username === username)
  
  if (usernameExists) {
    return response.status(400).json({ error: "User already created" })
  }

  const user = {
    name,
    username,
    id: uuidv4(),
    todos: []    
  }

  users.push(user)
  return response.status(201).json(user)

  
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = request
  return response.json(user.todos)
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { title, deadline } = request.body
  const { user } = request

  const todo = {
    id: uuidv4(),
    // id: '1234',
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date() 
  }

  user.todos.push(todo)
  return response.status(201).json(todo)
});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { id } = request.params
  const { title, deadline } = request.body
  const { user }  = request

  if (!todoExists(user, id)) {
    return response.status(404).json({error: "Task not found"})
  }
 
  const todoIndex = user.todos.findIndex(todo => todo.id === id)
  user.todos[todoIndex].title = title
  user.todos[todoIndex].deadline = deadline

  return response.json(user.todos[todoIndex])

});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const { id } = request.params
  const { user } = request

  if (!todoExists(user, id)) {
    return response.status(404).json({error: "Task not found"})
  }  

  user.todos.foundToDo = user.todos.find(todo => todo.id === id)
  
  user.todos.foundToDo.done = true

  return response.json(user.todos.foundToDo).send()
  
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { id } = request.params
  const { user } = request

  if (!todoExists(user, id)) {
    return response.status(404).json({error: "Task not found"})
  }

  const todoIndex = user.todos.findIndex(todo => todo.id === id)
  
  user.todos.splice(todoIndex, 1)
  
  return response.status(204).send()
});

module.exports = app;