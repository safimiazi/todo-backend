import { Injectable, Inject } from '@nestjs/common';
import { TodoRepository } from './todo.repository';
import { Todo, TodoStatus } from '@prisma/client';

@Injectable()
export class TodoService {
  constructor(
    @Inject('TodoRepository') private readonly todoRepo: TodoRepository,
  ) {}

  create(todo: Partial<Todo>) {
    return this.todoRepo.create(todo);
  }

async findAll(userId: string, status?: TodoStatus, page = 1, limit = 10) {
  const { todos, totalItems } = await this.todoRepo.findAll(userId, status, page, limit);
  const totalPages = Math.ceil(totalItems / limit);
  return { todos, meta: { page, limit, totalItems, totalPages } };
}



  findById(id: string, userId: string) {
    return this.todoRepo.findById(id, userId);
  }

  update(id: string, userId: string, data: Partial<Todo>) {
    return this.todoRepo.update(id, userId, data);
  }

  delete(id: string, userId: string) {
    return this.todoRepo.delete(id, userId);
  }
}
