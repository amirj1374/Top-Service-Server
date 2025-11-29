import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) {}

  async findAll(page = 0, size = 10) {
    const skip = page * size;
    const take = size;

    const [products, totalElements] = await Promise.all([
      this.prisma.product.findMany({
        include: {
          productType: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
        skip,
        take,
      }),
      this.prisma.product.count(),
    ]);

    // Ensure groupByItem is included in response
    const content = products.map((product: any) => ({
      ...product,
      groupByItem: product.groupByItem || product.productType?.name || null,
    }));

    return {
      content,
      page: {
        size,
        number: page,
        totalElements,
        totalPages: Math.ceil(totalElements / size),
      },
    };
  }

  async findOne(id: string) {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: {
        productType: true,
      },
    });

    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }

    // Ensure groupByItem is included in response
    const productResponse: any = {
      ...product,
      groupByItem: (product as any).groupByItem || product.productType?.name || null,
    };

    return productResponse;
  }

  async create(createProductDto: CreateProductDto) {
    // Fetch productType to get the name for groupByItem
    const productType = await this.prisma.productType.findUnique({
      where: { id: createProductDto.productTypeId },
    });

    if (!productType) {
      throw new NotFoundException(
        `ProductType with ID ${createProductDto.productTypeId} not found`,
      );
    }

    const product = await this.prisma.product.create({
      data: {
        ...createProductDto,
        stock: createProductDto.stock ?? 0,
        ['groupByItem']: productType.name,
      } as any,
      include: {
        productType: true,
      },
    });

    // Exclude groupByItem from response
    const { ['groupByItem']: _, ...productResponse } = product as any;
    return productResponse;
  }

  async update(id: string, updateProductDto: UpdateProductDto) {
    const existingProduct = await this.findOne(id); // Check if exists

    // If productTypeId is being updated, fetch the new productType name
    let groupByItem: string | undefined;
    if (updateProductDto.productTypeId) {
      const productType = await this.prisma.productType.findUnique({
        where: { id: updateProductDto.productTypeId },
      });

      if (!productType) {
        throw new NotFoundException(
          `ProductType with ID ${updateProductDto.productTypeId} not found`,
        );
      }

      groupByItem = productType.name;
    }

    const product = await this.prisma.product.update({
      where: { id },
      data: {
        ...updateProductDto,
        ...(groupByItem && { ['groupByItem']: groupByItem }),
      } as any,
      include: {
        productType: true,
      },
    });

    // Exclude groupByItem from response
    const { ['groupByItem']: _, ...productResponse } = product as any;
    return productResponse;
  }

  async remove(id: string) {
    await this.findOne(id); // Check if exists
    return this.prisma.product.delete({
      where: { id },
    });
  }
}

