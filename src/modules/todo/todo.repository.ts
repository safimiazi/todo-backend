import { Todo, TodoStatus } from '@prisma/client';

export interface TodoRepository {
    create(todo: Partial<Todo>): Promise<Todo>;
    findAll(
        userId: string,
        status?: TodoStatus,
        page?: number,
        limit?: number,
        search?:string
    ):Promise<{ todos: Todo[]; totalItems: number }>;
    findById(id: string, userId: string): Promise<Todo | null>;
    update(id: string, userId: string, data: Partial<Todo>): Promise<Todo>;
    delete(id: string, userId: string): Promise<void>;
}
