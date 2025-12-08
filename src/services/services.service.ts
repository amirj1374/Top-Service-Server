import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';
import { createPaginatedResponse } from '../common/utils/pagination.util';
import { PaginatedResponse } from '../common/interfaces/paginated-response.interface';

@Injectable()
export class ServicesService {
  constructor(private readonly prisma: PrismaService) {}

  // Access Prisma client with a relaxed type to avoid stale TS typings before regeneration
  private get prismaClient() {
    return this.prisma as any;
  }

  async findAll(page = 0, size = 10): Promise<PaginatedResponse<any>> {
    const skip = page * size;
    const take = size;

    const [content, totalElements] = await Promise.all([
      this.prismaClient.service.findMany({
        orderBy: {
          createdAt: 'desc',
        },
        skip,
        take,
      }),
      this.prismaClient.service.count(),
    ]);

    return createPaginatedResponse(content, totalElements, page, size);
  }

  async findActive(page = 0, size = 10): Promise<PaginatedResponse<any>> {
    const skip = page * size;
    const take = size;

    const [content, totalElements] = await Promise.all([
      this.prismaClient.service.findMany({
        where: {
          isActive: true,
        },
        orderBy: {
          name: 'asc',
        },
        skip,
        take,
      }),
      this.prismaClient.service.count({
        where: { isActive: true },
      }),
    ]);

    return createPaginatedResponse(content, totalElements, page, size);
  }

  async findOne(id: string) {
    const service = await this.prismaClient.service.findUnique({
      where: { id },
    });

    if (!service) {
      throw new NotFoundException(`Service with ID ${id} not found`);
    }

    return service;
  }

  async create(createServiceDto: CreateServiceDto) {
    const existing = await this.prismaClient.service.findUnique({
      where: { name: createServiceDto.name },
    });

    if (existing) {
      throw new ConflictException('Service with this name already exists');
    }

    try {
      return await this.prismaClient.service.create({
        data: {
          name: createServiceDto.name,
          price: createServiceDto.price,
          description: createServiceDto.description,
          isActive: createServiceDto.isActive ?? true,
        },
      });
    } catch (error) {
      throw new BadRequestException('Failed to create service');
    }
  }

  async update(id: string, updateServiceDto: UpdateServiceDto) {
    const existing = await this.prismaClient.service.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException(`Service with ID ${id} not found`);
    }

    if (updateServiceDto.name) {
      const nameConflict = await this.prismaClient.service.findUnique({
        where: { name: updateServiceDto.name },
      });

      if (nameConflict && nameConflict.id !== id) {
        throw new ConflictException('Service with this name already exists');
      }
    }

    try {
      return await this.prismaClient.service.update({
        where: { id },
        data: updateServiceDto,
      });
    } catch (error) {
      throw new BadRequestException('Failed to update service');
    }
  }

  async remove(id: string) {
    const existing = await this.prismaClient.service.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException(`Service with ID ${id} not found`);
    }

    await this.prismaClient.service.delete({
      where: { id },
    });
  }
}

