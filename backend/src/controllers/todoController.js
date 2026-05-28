'use strict';

const todoQueries = require('../db/todoQueries');
const categoryQueries = require('../db/categoryQueries');
const { computeTodoStatus } = require('../utils/statusUtils');
const { createError } = require('../utils/errorUtils');
const { sendSuccess } = require('../utils/responseUtils');

function withStatus(todo) {
  return { ...todo, status: computeTodoStatus(todo, new Date()) };
}

async function getAll(req, res, next) {
  const { categoryId, status } = req.query;
  try {
    const rows = await todoQueries.findAllByUserId(req.user.userId, { categoryId });
    let todos = rows.map(withStatus);
    if (status) {
      todos = todos.filter(t => t.status === status);
    }
    return sendSuccess(res, todos);
  } catch (err) {
    next(err);
  }
}

async function getOne(req, res, next) {
  try {
    const todo = await todoQueries.findByIdAndUserId(req.params.id, req.user.userId);
    if (!todo) {
      return next(createError('FORBIDDEN', '할일에 대한 접근 권한이 없습니다.', 403));
    }
    return sendSuccess(res, withStatus(todo));
  } catch (err) {
    next(err);
  }
}

async function create(req, res, next) {
  const { title, description, start_date, end_date } = req.body;
  let { category_id } = req.body;
  try {
    if (!category_id) {
      const categories = await categoryQueries.findAllByUserId(req.user.userId);
      const defaultCat = categories.find(c => c.is_default);
      category_id = defaultCat.id;
    } else {
      const cat = await categoryQueries.findByIdAndUserId(category_id, req.user.userId);
      if (!cat) {
        return next(createError('FORBIDDEN', '카테고리에 대한 접근 권한이 없습니다.', 403));
      }
    }
    const todo = await todoQueries.insertTodo(req.user.userId, category_id, {
      title, description, start_date, end_date,
    });
    return sendSuccess(res, withStatus(todo), 201);
  } catch (err) {
    next(err);
  }
}

async function update(req, res, next) {
  const { id } = req.params;
  const { title, description, category_id, start_date, end_date } = req.body;
  try {
    const existing = await todoQueries.findByIdAndUserId(id, req.user.userId);
    if (!existing) {
      return next(createError('FORBIDDEN', '할일에 대한 접근 권한이 없습니다.', 403));
    }
    if (category_id && category_id !== existing.category_id) {
      const cat = await categoryQueries.findByIdAndUserId(category_id, req.user.userId);
      if (!cat) {
        return next(createError('FORBIDDEN', '카테고리에 대한 접근 권한이 없습니다.', 403));
      }
    }
    const data = {};
    if (title !== undefined) data.title = title;
    if (description !== undefined) data.description = description;
    if (category_id !== undefined) data.category_id = category_id;
    if (start_date !== undefined) data.start_date = start_date;
    if (end_date !== undefined) data.end_date = end_date;
    if (req.body.is_done !== undefined) data.is_done = req.body.is_done;

    const updated = await todoQueries.updateTodo(id, data);
    return sendSuccess(res, withStatus(updated));
  } catch (err) {
    next(err);
  }
}

async function toggleDone(req, res, next) {
  const { id } = req.params;
  try {
    const existing = await todoQueries.findByIdAndUserId(id, req.user.userId);
    if (!existing) {
      return next(createError('FORBIDDEN', '할일에 대한 접근 권한이 없습니다.', 403));
    }
    const updated = await todoQueries.updateTodo(id, { is_done: true });
    return sendSuccess(res, withStatus(updated));
  } catch (err) {
    next(err);
  }
}

async function remove(req, res, next) {
  const { id } = req.params;
  try {
    const existing = await todoQueries.findByIdAndUserId(id, req.user.userId);
    if (!existing) {
      return next(createError('FORBIDDEN', '할일에 대한 접근 권한이 없습니다.', 403));
    }
    await todoQueries.deleteTodo(id);
    return res.status(204).end();
  } catch (err) {
    next(err);
  }
}

module.exports = { getAll, getOne, create, update, toggleDone, remove };
