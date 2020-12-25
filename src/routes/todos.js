const express = require('express');
const path = require('path');
const { read, write, getPages, getAsNumber, createError, TODOS_PER_PAGE } = require('../utils');

const todosDbPath = path.join(__dirname, '../db/todos.json');
const categoriesDbPath = path.join(__dirname, '../db/categories.json');

const router = express.Router();

router.get('/', async (req, res, next) => {
  try {
    let { page, category } = req.query;
    if (!page) {
      page = 1;
    }
    // console.log(category);
    const reqPage = getAsNumber(page, 1);
    const reqCategory = getAsNumber(category, undefined);
    // console.log(reqCategory);

    const startIndex = (reqPage - 1) * TODOS_PER_PAGE;
    const endIndex = reqPage * TODOS_PER_PAGE;

    const todos = await read(todosDbPath);
    const categories = await read(categoriesDbPath);

    if (category) {
      // console.log(true);
      const todosFiltered = todos
        .filter((el) => el.category === reqCategory)
        .reduce((acc, current) => {
          current.category = categories.find((el) => el.id === current.category).name;
          return [...acc, current];
        }, []);

      res.status(200).json({
        data: {
          todos: todosFiltered,
          total: todosFiltered.length,
        },
        status: 'ok',
      });
    }
    const pages = getPages(todos, TODOS_PER_PAGE);
    const nextPage = reqPage > pages ? null : reqPage + 1;

    if (reqPage > pages) {
      createError(`This page does not exist`, 404);
    }

    const todosSlice = todos.slice(startIndex, endIndex).reduce((acc, current) => {
      current.category = categories.find((el) => el.id === current.category).name;
      return [...acc, current];
    }, []);

    res.status(200).json({
      data: {
        todos: todosSlice,
        total: todosSlice.length,
      },
      status: 'ok',
      next: nextPage,
    });
  } catch (error) {
    next(error);
  }
});

router.post('/create', async (req, res, next) => {
  try {
    const { title, category, description } = req.body;
    if (!title || !category || !description) {
      createError(`Some mandatory field missing`, 400);
    }

    const todosList = await read(todosDbPath);
    const todoRepeated = todosList.find((todo) => todo.title === title);

    if (todoRepeated) {
      return createError('this TODO already exist', 400);
    }

    const newTodo = {
      id: todosList.length + 1,
      title,
      category,
      description,
    };

    const newTodoList = [...todosList, newTodo];

    await write(todosDbPath, newTodoList);

    res.status(200).json({
      data: {
        todos: newTodoList,
        total: newTodoList.length,
      },
      status: 'ok',
    });
  } catch (error) {
    next(error);
  }
});

router.put('/modify/:id', async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const body = req.body;
    const bodyKeys = Object.keys(body);
    const todosList = await read(todosDbPath);
    const filteredTodo = todosList.filter((todo) => todo.id === id)[0];

    const todosMapped = todosList.map((todo) => {
      if (todo.id === id) {
        for (key of bodyKeys) {
          // console.log(filteredTodo[key])
          todo[key] = body[key];
        }
      }
      return todo;
    });

    await write(todosDbPath, todosMapped);

    res.status(200).json({
      data: {
        filteredTodo,
      },
      status: 'ok',
    });
  } catch (error) {
    next(error);
  }
});

router.delete('/delete/:id', async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    // console.log(id)
    const todosList = await read(todosDbPath);

    const todoToRemove = todosList.filter((todo) => todo.id === id)[0];
    const filteredTodos = todosList.filter((todo) => todo.id !== id);

    await write(todosDbPath, filteredTodos);
    res.status(200).json({
      data: {
        removed: todoToRemove,
        filteredTodos,
      },
      status: 'ok',
    });
  } catch (error) {
    next(error);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const categories = await read(categoriesDbPath);
    const singleTodo = (await read(todosDbPath)).filter((el) => el.id === id)[0];

    if (singleTodo.length === 0) {
      createError(`No todo found with ID ${id}`, 404);
    }

    singleTodo.category = categories.find((el) => el.id === singleTodo.category).name;

    res.status(200).json({
      data: {
        todo: singleTodo,
        total: singleTodo.length,
      },
      status: 'ok',
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
