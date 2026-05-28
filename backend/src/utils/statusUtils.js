'use strict';

function toDateOnly(date) {
  const d = new Date(date);
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

function computeTodoStatus(todo, now) {
  if (todo.is_done) return 'DONE';
  if (!todo.start_date || !todo.end_date) return 'NOT_STARTED';

  const today = toDateOnly(now);
  const start = toDateOnly(todo.start_date);
  const end = toDateOnly(todo.end_date);

  if (today > end) return 'OVERDUE';
  if (today >= start && today <= end) return 'IN_PROGRESS';
  return 'NOT_STARTED';
}

module.exports = { computeTodoStatus };
