const express = require('express')

const categoriesRouter = require('./categories')
const todosRouter = require('./todos')

const router = express.Router()

router.use('/categories', categoriesRouter)
router.use('/todos', todosRouter)

module.exports = router;