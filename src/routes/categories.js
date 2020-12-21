const express = require('express');
const path = require('path')

const categoriesDbPath = path.join(__dirname, '../db/categories.json');;
const { read, write, createError } = require('../utils');

const router = express.Router();

router.get('/', (req, res, next) => {
  try {
    const categoriesSlice = categoriesDb.slice(0, 5);

    res.status(200).json({
      data: {
        categories: categoriesSlice,
        total: categoriesSlice.length,
      },
      status: 'ok',
    });
  } catch (error) {
    next(error);
  }
});

router.post('/create', async (req, res, next) => {
  try {
    const { name, color } = req.body;
    if (!name || !color) {
      createError(`Some mandatory field missing`, 400);
    }

    const categoriesList = await read(categoriesDbPath);
    const categoriesRepeated = categoriesList.find((category) => category.name === name);

    if (categoriesRepeated) {
      return createError('this category already exist', 400);
    }

    const newCategory = {
      id: categoriesList.length + 1,
      name,
      color,
    };

    const newCategoryList = [...categoriesList, newCategory];

    await write(categoriesDbPath, newCategoryList);

    res.status(200).json({
      data: {
        categories: newCategoryList,
        total: newCategoryList.length,
      },
      status: 'ok',
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
