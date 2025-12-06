import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { PaginatedResponse } from '../common/interfaces/paginated-response.interface';
import { createPaginatedResponse } from '../common/utils/pagination.util';
import { Product, ProductType } from '@prisma/client';

type ProductWithType = Product & {
  productType: Pick<ProductType, 'id' | 'name' | 'description' | 'isActive'>;
};

type ProductResponse = Omit<ProductWithType, 'groupByItem'> & {
  groupByItem: string | null;
};

@Injectable()
export class ProductsService {
  constructor(private readonly prisma: PrismaService) {}

  private mapProductToResponse(product: ProductWithType): ProductResponse {
    const { groupByItem, ...rest } = product;
    return {
      ...rest,
      groupByItem: groupByItem || product.productType?.name || null,
    };
  }

  async findAll(page = 0, size = 10): Promise<PaginatedResponse<ProductResponse>> {
    const skip = page * size;
    const take = size;

    const [products, totalElements] = await Promise.all([
      this.prisma.product.findMany({
        include: {
          productType: {
            select: {
              id: true,
              name: true,
              description: true,
              isActive: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        skip,
        take,
      }),
      this.prisma.product.count(),
    ]);

    const content = products.map((product) => this.mapProductToResponse(product));

    return createPaginatedResponse(content, totalElements, page, size);
  }

  async findOne(id: string): Promise<ProductResponse> {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: {
        productType: {
          select: {
            id: true,
            name: true,
            description: true,
            isActive: true,
          },
        },
      },
    });

    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }

    return this.mapProductToResponse(product);
  }

  async create(createProductDto: CreateProductDto): Promise<ProductResponse> {
    // Verify productType exists
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
        name: createProductDto.name,
        description: createProductDto.description,
        price: createProductDto.price,
        stock: createProductDto.stock ?? 0,
        productTypeId: createProductDto.productTypeId,
        groupByItem: productType.name,
      },
      include: {
        productType: {
          select: {
            id: true,
            name: true,
            description: true,
            isActive: true,
          },
        },
      },
    });

    return this.mapProductToResponse(product);
  }

  async update(id: string, updateProductDto: UpdateProductDto): Promise<ProductResponse> {
    // Check if product exists
    const existingProduct = await this.prisma.product.findUnique({
      where: { id },
    });

    if (!existingProduct) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }

    // If productTypeId is being updated, verify it exists
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

    // Build update data
    const updateData: Partial<Product> & { groupByItem?: string } = {
      ...updateProductDto,
    };

    if (groupByItem) {
      updateData.groupByItem = groupByItem;
    }

    const product = await this.prisma.product.update({
      where: { id },
      data: updateData,
      include: {
        productType: {
          select: {
            id: true,
            name: true,
            description: true,
            isActive: true,
          },
        },
      },
    });

    return this.mapProductToResponse(product);
  }

  async remove(id: string): Promise<void> {
    const product = await this.prisma.product.findUnique({
      where: { id },
    });

    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }

    await this.prisma.product.delete({
      where: { id },
    });
  }
}

