import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PaginatedResponse } from '../common/interfaces/paginated-response.interface';
import { createPaginatedResponse } from '../common/utils/pagination.util';
import * as bcrypt from 'bcrypt';
import { User } from '@prisma/client';
import { SetCustomizerDto } from './dto/set-customizer.dto';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(page = 0, size = 10): Promise<PaginatedResponse<Omit<User, 'password'>>> {
    const skip = page * size;
    const take = size;

    const [content, totalElements] = await Promise.all([
      this.prisma.user.findMany({
        select: {
          id: true,
          name: true,
          email: true,
          customizer: true,
          age: true,
          createdAt: true,
          updatedAt: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
        skip,
        take,
      }),
      this.prisma.user.count(),
    ]);

    return createPaginatedResponse(content, totalElements, page, size);
  }

  async findOne(id: string): Promise<Omit<User, 'password'>> {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        customizer: true,
        age: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return user;
  }

  async create(createUserDto: CreateUserDto): Promise<Omit<User, 'password'>> {
    const { password, ...rest } = createUserDto;

    // Check if email already exists
    const existingUser = await this.prisma.user.findUnique({
      where: { email: rest.email },
    });

    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await this.prisma.user.create({
      data: {
        name: createUserDto.name,
        email: createUserDto.email,
        age: createUserDto.age ?? null,
        customizer: createUserDto.customizer ?? null,
        password: hashedPassword,
      } as { name: string; email: string; age: number | null; customizer: string | null; password: string },
      select: {
        id: true,
        name: true,
        email: true,
        customizer: true,
        age: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return user;
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<Omit<User, 'password'>> {
    // Check if user exists
    await this.findOne(id);

    // If email is being updated, check for conflicts
    if (updateUserDto.email) {
      const existingUser = await this.prisma.user.findUnique({
        where: { email: updateUserDto.email },
      });

      if (existingUser && existingUser.id !== id) {
        throw new ConflictException('User with this email already exists');
      }
    }

    // Prepare update data
    const updateData: {
      name?: string;
      email?: string;
      age?: number | null;
      customizer?: string | null;
      password?: string;
    } = { ...updateUserDto };

    // If password is being updated, hash it
    if (updateData.password) {
      updateData.password = await bcrypt.hash(updateData.password, 10);
    }

    const user = await this.prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        customizer: true,
        age: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return user;
  }

  async remove(id: string): Promise<void> {
    await this.findOne(id);
    await this.prisma.user.delete({
      where: { id },
    });
  }

  async setCustomizerFromToken(userId: string, dto: SetCustomizerDto) {
    await this.findOne(userId);

    const user = await this.prisma.user.update({
      where: { id: userId },
      data: {
        customizer: dto.customizer ?? null,
      },
      select: {
        customizer: true,
      },
    });

    return user;
  }

  async getCustomizerFromToken(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        customizer: true,
      },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    return user;
  }
}

