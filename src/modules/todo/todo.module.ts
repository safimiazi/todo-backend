import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { TodoController } from './todo.controller';
import { TodoService } from './todo.service';
import { TodoRepositoryImpl } from './todo.repository.impl';
import { JwtMiddleware } from '../auth/jwt.middleware';

@Module({
  controllers: [TodoController],
  providers: [
    TodoService,
    { provide: 'TodoRepository', useClass: TodoRepositoryImpl },
  ],
})
export class TodoModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(JwtMiddleware).forRoutes(TodoController);
  }
}
