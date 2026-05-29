export type TodoStatus = 'NOT_STARTED' | 'IN_PROGRESS' | 'DONE' | 'OVERDUE';

export interface Todo {
  id: string;
  user_id: string;
  category_id: string;
  title: string;
  description: string | null;
  start_date: string | null;
  end_date: string | null;
  is_done: boolean;
  status: TodoStatus;
  created_at: string;
  updated_at: string;
}

export interface CreateTodoInput {
  title: string;
  description?: string;
  category_id?: string;
  start_date?: string;
  end_date?: string;
}

export interface UpdateTodoInput {
  title?: string;
  description?: string | null;
  category_id?: string;
  start_date?: string | null;
  end_date?: string | null;
  is_done?: boolean;
}

export interface TodoFilters {
  categoryId?: string;
  status?: TodoStatus;
}
