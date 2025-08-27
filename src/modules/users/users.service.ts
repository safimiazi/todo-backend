import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { UpdateUserDto } from './dto/update-user.input';

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(
    page: number = 1,
    limit: number = 10,
    searchTerm?: string,
    order: 'asc' | 'desc' = 'desc',
    filters?: { [key: string]: any },
  ) {
    try {
      const skip = (page - 1) * limit;

      // Build search filter
      const searchFilter: Prisma.UserWhereInput = searchTerm
        ? {
            OR: [
              { firstName: { contains: searchTerm, mode: 'insensitive' } },
              { lastName: { contains: searchTerm, mode: 'insensitive' } },
              { email: { contains: searchTerm, mode: 'insensitive' } },
            ],
          }
        : {};

      const where: Prisma.UserWhereInput = {
        ...filters,
        ...searchFilter,
      };

      const [users, total] = await Promise.all([
        this.prisma.user.findMany({
          skip,
          take: limit,
          where,
          orderBy: { createdAt: order },
        }),
        this.prisma.user.count({ where }),
      ]);

      return {
        data: users,
        meta: {
          total,
          page,
          lastPage: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      throw new InternalServerErrorException('Failed to fetch users.');
    }
  }

  async findOne(id: string) {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id },
      });

      if (!user) {
        throw new NotFoundException(`User not found`);
      }

      return user;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to fetch user');
    }
  }

async update(id: string, updateUserDto: UpdateUserDto) {
  try {
    const { role, email, password, ...rest } = updateUserDto;


    const user = await this.prisma.user.update({
      where: { id },
      data: {
        ...rest,
        ...(role ? { role: role as any } : {}),
      },
    });

    // 🚫 Do not expose password
    const { password: _, ...safeUser } = user;

    return safeUser;
  } catch (error) {
    if (error.code === 'P2025') {
      throw new NotFoundException(`User not found`);
    }
    throw new InternalServerErrorException('Failed to update user');
  }
}


  async remove(id: string) {
    const existingUser = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!existingUser) {
      throw new NotFoundException(`User not found`);
    }

    if (existingUser.isDeleted) {
      throw new BadRequestException(`User is already deleted`);
    }

    const user = await this.prisma.user.update({
      where: { id },
      data: { isDeleted: true },
    });

    return user;
  }

  async findOneByEmail(email: string) {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new NotFoundException('User not found.');
    }

    if (user.isDeleted) {
      throw new NotFoundException('User already deleted, you cannot login.');
    }

    return user;
  }
}
