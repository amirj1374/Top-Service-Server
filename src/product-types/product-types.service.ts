import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProductTypeDto } from './dto/create-product-type.dto';
import { UpdateProductTypeDto } from './dto/update-product-type.dto';

@Injectable()
export class ProductTypesService {
  constructor(private prisma: PrismaService) {}

  async findAll(page = 0, size = 10) {
    const skip = page * size;
    const take = size;

    const [content, totalElements] = await Promise.all([
      this.prisma.productType.findMany({
        orderBy: {
          createdAt: 'desc'
        },
        skip,
        take
      }),
      this.prisma.productType.count()
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

  async findActive(page = 0, size = 10) {
    const skip = page * size;
    const take = size;

    const [content, totalElements] = await Promise.all([
      this.prisma.productType.findMany({
        where: {
          isActive: true
        },
        orderBy: {
          name: 'asc'
        },
        skip,
        take
      }),
      this.prisma.productType.count({
        where: {
          isActive: true
        }
      })
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

  async findOne(id: number) {
    const productType = await this.prisma.productType.findUnique({
      where: { id }
    });

    if (!productType) {
      throw new Error('Product type not found');
    }

    return productType;
  }

  async create(createProductTypeDto: CreateProductTypeDto) {
    return this.prisma.productType.create({
      data: createProductTypeDto
    });
  }

  async update(id: number, updateProductTypeDto: UpdateProductTypeDto) {
    await this.findOne(id); // Check if exists
    return this.prisma.productType.update({
      where: { id },
      data: updateProductTypeDto
    });
  }

  async remove(id: number) {
    await this.findOne(id); // Check if exists
    return this.prisma.productType.delete({
      where: { id }
    });
  }
}

