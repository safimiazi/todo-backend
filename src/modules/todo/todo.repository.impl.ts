import { Injectable } from '@nestjs/common';
import { PrismaClient, Todo, TodoStatus, Prisma } from '@prisma/client';
import { TodoRepository } from './todo.repository';

@Injectable()
export class TodoRepositoryImpl implements TodoRepository {
    private prisma = new PrismaClient();

    async create(todo: { title: string; description?: string; status?: TodoStatus; userId: string }): Promise<Todo> {
        return this.prisma.todo.create({
            data: {
                title: todo.title,
                description: todo.description,
                status: todo.status || TodoStatus.PENDING,
                userId: todo.userId,
            },
        });
    }

    async findAll(
        userId: string,
        status?: TodoStatus,
        page = 1,
        limit = 10,
        search?: string,
    ): Promise<{ todos: Todo[]; totalItems: number }> {
        const where: any = { userId };

        if (status) where.status = status;

        if (search) {
            where.OR = [
                { title: { contains: search } },
                { description: { contains: search } },
            ];
        }


        const [todos, totalItems] = await Promise.all([
            this.prisma.todo.findMany({
                where,
                skip: (page - 1) * limit,
                take: limit,
                orderBy: { createdAt: 'desc' },
                include: {
                    user: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                        },
                    },
                },
            }),
            this.prisma.todo.count({ where }),
        ]);

        return { todos, totalItems };
    }




    async findById(id: string, userId: string): Promise<Todo | null> {
        return this.prisma.todo.findFirst({ where: { id, userId } });
    }

    async update(id: string, userId: string, data: { title?: string; description?: string; status?: TodoStatus }): Promise<Todo> {
        return this.prisma.todo.update({
            where: { id },
            data,
            include: {
                user: {
                    select: { id: true, name: true, email: true },
                },
            },
        });
    }

    async delete(id: string, userId: string): Promise<void> {
        await this.prisma.todo.delete({ where: { id } });
    }
}
