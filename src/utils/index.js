const fs = require('fs');
const path = require('path');
const categoriesDbPath = path.join(__dirname, '../db/categories.json');

const TODOS_PER_PAGE = 5;

const read = async (path) => {
  const raw = await fs.readFileSync(path);
  return JSON.parse(raw);
};

const write = async (path, content) => {
  const contentStr = typeof content === 'string' ? content : JSON.stringify(content);
  await fs.writeFileSync(path, contentStr);
};

const getPages = (totalTodos, amountPerPage) => Math.ceil(totalTodos.length / amountPerPage);

const getAsNumber = (value, defaultValue) =>
  Number.isNaN(Number(value)) || Number(value) <= 0 ? defaultValue : Number(value);

const createError = (message, code) => {
  const error = new Error(message);
  error.code = code;
  throw error;
};

module.exports = {
  read,
  write,
  getPages,
  getAsNumber,
  createError,
  TODOS_PER_PAGE,
};
