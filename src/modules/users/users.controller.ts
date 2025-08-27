import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Query,
  Req,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UpdateUserDto } from './dto/update-user.input';
import { successResponse } from 'src/common/response/response.util';
import { UserService } from './users.service';

@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UserController {
  constructor(private readonly userService: UserService) {}

  // ✅ List users (with pagination, filters, search)
  @Get()
  @Roles('ADMIN')
  async findAll(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query('search') searchTerm?: string,
    @Query('order') order: 'asc' | 'desc' = 'desc',
    @Query() filters?: any,
  ) {
    const data = await this.userService.findAll(
      Number(page),
      Number(limit),
      searchTerm,
      order,
      filters,
    );
    return successResponse(data, 'Users fetched');
  }

  // ✅ Get single user by ID
  @Get(':id')
  @Roles('ADMIN', 'USER')
  async findOne(@Param('id') id: string) {
    const data = await this.userService.findOne(id);
    return successResponse(data, 'User fetched');
  }

  // ✅ Update user
  @Patch('update-user/:id')
  @Roles('ADMIN', 'USER')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateUserDto,
    @Req() req,
  ) {
    const userId = req.user?.userId;

    // Users can only update their own account unless ADMIN
    if (req.user?.role !== 'ADMIN' && userId !== id) {
      throw new UnauthorizedException(
        'You can only update your own account',
      );
    }

    const data = await this.userService.update(id, dto);
    return successResponse(data, 'User updated');
  }

  // ✅ Soft delete user
  @Delete(':id')
  @Roles('ADMIN', 'USER')
  async remove(@Param('id') id: string, @Req() req) {
    const userId = req.user?.userId;

    // Users can only delete themselves unless ADMIN
    if (req.user?.role !== 'ADMIN' && userId !== id) {
      throw new UnauthorizedException(
        'You can only delete your own account',
      );
    }

    const data = await this.userService.remove(id);
    return successResponse(data, 'User deleted');
  }

  // ✅ Get user by email (Admin only)
  @Get('by-email/:email')
  @Roles('ADMIN')
  async findOneByEmail(@Param('email') email: string) {
    const data = await this.userService.findOneByEmail(email);
    return successResponse(data, 'User fetched by email');
  }
}
