import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProductTypeDto } from './dto/create-product-type.dto';
import { UpdateProductTypeDto } from './dto/update-product-type.dto';
import { PaginatedResponse } from '../common/interfaces/paginated-response.interface';
import { createPaginatedResponse } from '../common/utils/pagination.util';
import { ProductType } from '@prisma/client';

@Injectable()
export class ProductTypesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(page = 0, size = 10): Promise<PaginatedResponse<ProductType>> {
    const skip = page * size;
    const take = size;

    const [content, totalElements] = await Promise.all([
      this.prisma.productType.findMany({
        orderBy: {
          createdAt: 'desc',
        },
        skip,
        take,
      }),
      this.prisma.productType.count(),
    ]);

    return createPaginatedResponse(content, totalElements, page, size);
  }

  async findActive(page = 0, size = 10): Promise<PaginatedResponse<ProductType>> {
    const skip = page * size;
    const take = size;

    const [content, totalElements] = await Promise.all([
      this.prisma.productType.findMany({
        where: {
          isActive: true,
        },
        orderBy: {
          name: 'asc',
        },
        skip,
        take,
      }),
      this.prisma.productType.count({
        where: {
          isActive: true,
        },
      }),
    ]);

    return createPaginatedResponse(content, totalElements, page, size);
  }

  async findOne(id: number): Promise<ProductType> {
    const productType = await this.prisma.productType.findUnique({
      where: { id },
    });

    if (!productType) {
      throw new NotFoundException(`Product type with ID ${id} not found`);
    }

    return productType;
  }

  async create(createProductTypeDto: CreateProductTypeDto): Promise<ProductType> {
    // Check if name already exists
    const existing = await this.prisma.productType.findUnique({
      where: { name: createProductTypeDto.name },
    });

    if (existing) {
      throw new ConflictException('Product type with this name already exists');
    }

    return this.prisma.productType.create({
      data: createProductTypeDto,
    });
  }

  async update(id: number, updateProductTypeDto: UpdateProductTypeDto): Promise<ProductType> {
    await this.findOne(id); // Check if exists

    // If name is being updated, check for conflicts
    if (updateProductTypeDto.name) {
      const existing = await this.prisma.productType.findUnique({
        where: { name: updateProductTypeDto.name },
      });

      if (existing && existing.id !== id) {
        throw new ConflictException('Product type with this name already exists');
      }
    }

    return this.prisma.productType.update({
      where: { id },
      data: updateProductTypeDto,
    });
  }

  async remove(id: number): Promise<void> {
    const productType = await this.findOne(id);

    // Check if there are products using this type
    const productsCount = await this.prisma.product.count({
      where: { productTypeId: id },
    });

    if (productsCount > 0) {
      throw new ConflictException(
        `Cannot delete product type. There are ${productsCount} product(s) associated with it.`,
      );
    }

    await this.prisma.productType.delete({
      where: { id },
    });
  }
}


