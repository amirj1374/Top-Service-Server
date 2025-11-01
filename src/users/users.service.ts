import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findAll(page = 0, size = 10) {
    const skip = page * size;
    const take = size;

    const [content, totalElements] = await Promise.all([
      this.prisma.user.findMany({
        orderBy: {
          createdAt: 'desc'
        },
        skip,
        take
      }),
      this.prisma.user.count()
    ]);

    return {
      content,
      page: {
        size,
        number: page,
        totalElements,
        totalPages: Math.ceil(totalElements / size)
      }
    };
  }

  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id }
    });

    if (!user) {
      throw new Error('User not found');
    }

    return user;
  }

  async create(createUserDto: CreateUserDto) {
    return this.prisma.user.create({
      data: createUserDto
    });
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    await this.findOne(id); // Check if exists
    return this.prisma.user.update({
      where: { id },
      data: updateUserDto
    });
  }

  async remove(id: string) {
    await this.findOne(id); // Check if exists
    return this.prisma.user.delete({
      where: { id }
    });
  }
}

