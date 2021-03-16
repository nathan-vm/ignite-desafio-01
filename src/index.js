const express = require('express');
const cors = require('cors');
const { v4: uuidv4, v4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [
  // { 
  //   id: 'uuid', // precisa ser um uuid
  //   name: 'Danilo Vieira', 
  //   username: 'danilo', 
  //   todos: []
  // }
];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers
  const user = users.find(user=>user.username === username)
  if(user) {
    request.user = user
    return next()
  }
  return response.status(400).json({error:"user not found"})
}

app.post('/users', (request, response) => {
  const { username, name } = request.body
  const usernameAlreadyInUse = users.some(usr=>usr.username===username)
  if(usernameAlreadyInUse){
    return response.status(400).json({error:"user already in use"})
  }
  const user = {
    id: v4(),
    name,
    username,
    todos: []
  }
  users.push(user)
  return response.json(user)
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const { todos } = request.user
  return response.json(todos)
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { title, deadline } = request.body
  const { todos } = request.user
  const todo = {
    id: v4(),
    title,
    done: false,
    deadline:new Date(deadline),
    created_at:new Date()
  }
  todos.push(todo)
  return response.status(201).json(todo)
});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { title, deadline } = request.body
  const { id } = request.params
  const { todos } = request.user

  const todo = todos.find(todo=>todo.id===id)
  if(!todo) {
    return response.status(404).json({error:"todo dosnt exist"})
  }

  todo.title = title ? title : todo.title
  todo.deadline = deadline ? new Date(deadline) : todo.deadline

  return response.json(todo)
});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const { id } = request.params
  const { todos } = request.user
  const todo = todos.find(todo=>todo.id===id)
  if(!todo) {
    return response.status(404).json({error:"todo dosnt exist"})
  }
  todo.done = true
  return response.json(todo)
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { id } = request.params
  const { todos } = request.user
  const todo = todos.findIndex(todo=>todo.id===id)
  if(todo===-1){
    return response.status(404).json({error:"todo dosnt exist"})
  }
  todos.splice(todo,1)
  return response.status(204).send()
});

module.exports = app;