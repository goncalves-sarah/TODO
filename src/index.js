const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(req, res, next) {
    const { username } = req.headers;

    const user = users.find(user => user.username === username);

    if(!user) {
      return res.status(404).json({error : 'Usuário inválido'})
    }

    req.user = user;

    next();
}

app.post('/users', (req, res) => {
  const { name, username } = req.body;

  const usernameAlreadyExists = users.find(user => user.username === username);

  if(usernameAlreadyExists){
    return res.status(400).json({error: 'Username já cadastrado'});
  }

  const user = { 
    id: uuidv4(),
    name, 
    username, 
    todos: []
  };

  users.push(user);

  res.status(201).json(user);

});

app.get('/todos', checksExistsUserAccount, (req, res) => {

   const user = req.user;

   const todos = user.todos;

   return res.status(200).json(todos);
});

app.post('/todos', checksExistsUserAccount, (req, res) => {
    const { title, deadline } = req.body;

    const user = req.user;

    const todo = { 
      id: uuidv4(),
      title,
      done: false, 
      deadline: new Date(deadline), // deadline vem no formato AMD, logo, precisa ser convertida em um formato válido de data do js
      created_at: new Date()
    }

    user.todos.push(todo);

    return res.status(201).json(todo);
});

app.put('/todos/:id', checksExistsUserAccount, (req, res) => {
  const { id } = req.params;
  const { title, deadline } = req.body;
  const user = req.user;

  const todo = user.todos.find(t => t.id === id);

  if(!todo) {
    res.status(404).json({error : 'Todo não existente'});
  }

  todo.title = title;
  todo.deadline = new Date(deadline); // deadline vem no formato AMD, logo, precisa ser convertida em um formato válido de data do js

  return res.json(todo);
});

app.patch('/todos/:id/done', checksExistsUserAccount, (req, res) => {
  const { id } = req.params;
  const user = req.user;
  const todo = user.todos.find(t => t.id === id);

  if(!todo) {
    res.status(404).json({error : 'Todo não existente'})
  }

  todo.done = true;

  return res.json(todo);
});

app.delete('/todos/:id', checksExistsUserAccount, (req, res) => {
  const { id } = req.params;
  const user = req.user;

  const todoIndex = user.todos.findIndex(t => t.id === id);

  if(todoIndex === -1) {
    return res.status(404).json({error : 'Todo não existente'})
  }

  user.todos.splice(todoIndex,1)

  return res.status(204).json();

});

module.exports = app;