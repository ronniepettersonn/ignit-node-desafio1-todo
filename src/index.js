const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;

  const user = users.find(user => user.username === username)

  if (!user) {
    return response.status(404).json({ error: "User not found" })
  }

  request.user = user

  next()
}

app.post('/users', (request, response) => {
  const { name, username } = request.body;

  const user = {
    id: uuidv4(),
    name,
    username,
    todos: []
  }

  const userExists = users.some(user => user.username === username)

  if (!userExists) {
    users.push(user)
    return response.status(201).json(user)
  } else {
    return response.status(400).json({ error: "Username exists!" })
  }

});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = request

  return response.status(201).json(user.todos)
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { title, deadline } = request.body

  const { user } = request

  const todo = {
    id: uuidv4(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date()
  }

  user.todos.push(todo)

  return response.status(201).json(todo)

});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { user } = request
  const { id } = request.params;

  const { title, deadline } = request.body

  const idExists = user.todos.find(todo => todo.id === id)

  if (!idExists) {
    return response.status(404).json({ error: 'ToDo not found' })
  }

  let todoUpdated

  const newTodo = user.todos.map(todo => {
    if (todo.id === id) {
      todoUpdated = {
        title,
        done: false,
        deadline,
      }

      return {
        id: todo.id,
        title,
        done: false,
        deadline,
        created_at: todo.created_at
      }
    }

    return todo
  })

  user.todos = newTodo

  return response.status(201).json(todoUpdated)

});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const { user } = request
  const { id } = request.params;

  const idExists = user.todos.find(todo => todo.id === id)

  if (!idExists) {
    return response.status(404).json({ error: 'ToDo not found' })
  }

  let todoDone

  const newTodo = user.todos.map(todo => {
    if (todo.id === id) {
      todoDone = {
        id: todo.id,
        title: todo.title,
        done: true,
        deadline: todo.deadline,
        created_at: todo.created_at
      }

      return {
        id: todo.id,
        title: todo.title,
        done: true,
        deadline: todo.deadline,
        created_at: todo.created_at
      }
    }

    return todo
  })

  user.todos = newTodo

  return response.status(201).send(todoDone)

});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { user } = request

  const { id } = request.params;

  const idExists = user.todos.find(todo => todo.id === id)

  if (!idExists) {
    return response.status(404).json({ error: 'ToDo not found' })
  }

  const todo = user.todos.filter(todo => todo.id !== id)

  user.todos = todo

  return response.status(204).send()
});

module.exports = app;