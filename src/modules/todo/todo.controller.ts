import { Controller, Get, Post, Put, Delete, Param, Body, Query, Req } from '@nestjs/common';
import { TodoService } from './todo.service';
import { TodoStatus } from '@prisma/client';
import { Request } from 'express';
import { successResponse } from 'src/common/response/response.util';

@Controller('todos')
export class TodoController {
    constructor(private readonly todoService: TodoService) { }

    @Post('create')
    async create(@Req() req: Request, @Body() body: { title: string; description?: string }) {
        const { userId }: any = req['user'];

        const result = await this.todoService.create({ ...body, userId });
        return successResponse(result, "Todo Successfully created.")
    }

@Get('get-all')
async findAll(
  @Req() req: Request,
  @Query('status') status?: TodoStatus,
  @Query('page') page = '1',
  @Query('limit') limit = '10',
) {
  const { userId }: any = req['user'];
  const pageNumber = parseInt(page, 10);
  const limitNumber = parseInt(limit, 10);

  const result = await this.todoService.findAll(userId, status, pageNumber, limitNumber);
  return successResponse(result, "Todos fetched successfully.");
}


    @Get(':id')
    async findById(@Req() req: Request, @Param('id') id: string) {
        const { userId }: any = req['user'];
        const result = await this.todoService.findById(id, userId);
        return successResponse(result, "Todo fetched successfully.")

    }

    @Put(':id')
    async update(@Req() req: Request, @Param('id') id: string, @Body() data: Partial<{ title: string; description: string; status: TodoStatus }>) {
        const { userId }: any = req['user'];
        const result = await this.todoService.update(id, userId, data);
     return   successResponse(result, "Todos update successfully.")

    }

    @Delete(':id')
    async delete(@Req() req: Request, @Param('id') id: string) {
        const { userId }: any = req['user'];
      const result = await  await this.todoService.delete(id, userId);
        return successResponse(result, 'Todo deleted successfully.');

    }
}
