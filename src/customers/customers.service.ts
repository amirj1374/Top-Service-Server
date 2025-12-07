import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { PaginatedResponse } from '../common/interfaces/paginated-response.interface';
import { createPaginatedResponse } from '../common/utils/pagination.util';

type CustomerWithCars = {
  id: string;
  fullName: string;
  phone: string;
  createdAt: Date;
  updatedAt: Date;
  cars: Array<{
    id: string;
    title: string | null;
    plate: string;
    carModelId: string;
    customerId: string;
    createdAt: Date;
    updatedAt: Date;
    carModel: {
      id: string;
      name: string;
      brand: string | null;
      createdAt: Date;
      updatedAt: Date;
    };
  }>;
};

@Injectable()
export class CustomersService {
  constructor(private readonly prisma: PrismaService) {}

  // Type assertion to fix TypeScript language server cache issue
  // The Prisma client is correctly generated and works at runtime
  private get prismaClient() {
    return this.prisma as any;
  }

  async create(createCustomerDto: CreateCustomerDto): Promise<CustomerWithCars> {
    // Verify carModels exist and check for duplicate plates if cars are provided
    if (createCustomerDto.cars && createCustomerDto.cars.length > 0) {
      // Check for duplicate plates within the request
      const plates = createCustomerDto.cars.map((car) => car.plate);
      const uniquePlates = new Set(plates);
      if (plates.length !== uniquePlates.size) {
        throw new ConflictException('Duplicate plates found in the request. Each car must have a unique plate.');
      }

      // Verify carModels exist and check if plates already exist in database
      for (const car of createCustomerDto.cars) {
        const carModel = await this.prismaClient.carModel.findUnique({
          where: { id: car.carModelId },
        });

        if (!carModel) {
          throw new NotFoundException(`CarModel with ID ${car.carModelId} not found`);
        }

        // Check if plate already exists (belongs to another customer)
        const existingCar = await this.prismaClient.car.findUnique({
          where: { plate: car.plate },
        });

        if (existingCar) {
          throw new ConflictException(`Car with plate "${car.plate}" already exists and belongs to another customer.`);
        }
      }
    }

    const customer = await this.prismaClient.customer.create({
      data: {
        fullName: createCustomerDto.fullName,
        phone: createCustomerDto.phone,
        cars: createCustomerDto.cars
          ? {
              create: createCustomerDto.cars.map((car) => ({
                title: car.title,
                plate: car.plate,
                carModelId: car.carModelId,
              })),
            }
          : undefined,
      },
      include: {
        cars: {
          include: {
            carModel: true,
          },
        },
      },
    });

    return customer;
  }

  async findAll(page = 0, size = 10): Promise<PaginatedResponse<CustomerWithCars>> {
    const skip = page * size;
    const take = size;

    const [customers, totalElements] = await Promise.all([
      this.prismaClient.customer.findMany({
        include: {
          cars: {
            include: {
              carModel: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        skip,
        take,
      }),
      this.prismaClient.customer.count(),
    ]);

    return createPaginatedResponse(customers, totalElements, page, size);
  }

  async findOne(id: string): Promise<CustomerWithCars> {
    const customer = await this.prismaClient.customer.findUnique({
      where: { id },
      include: {
        cars: {
          include: {
            carModel: true,
          },
        },
      },
    });

    if (!customer) {
      throw new NotFoundException(`Customer with ID ${id} not found`);
    }

    return customer;
  }

  async update(id: string, updateCustomerDto: UpdateCustomerDto): Promise<CustomerWithCars> {
    // Check if customer exists
    const existingCustomer = await this.prismaClient.customer.findUnique({
      where: { id },
    });

    if (!existingCustomer) {
      throw new NotFoundException(`Customer with ID ${id} not found`);
    }

    const customer = await this.prismaClient.customer.update({
      where: { id },
      data: {
        fullName: updateCustomerDto.fullName,
        phone: updateCustomerDto.phone,
      },
      include: {
        cars: {
          include: {
            carModel: true,
          },
        },
      },
    });

    return customer;
  }

  async remove(id: string): Promise<void> {
    const customer = await this.prismaClient.customer.findUnique({
      where: { id },
    });

    if (!customer) {
      throw new NotFoundException(`Customer with ID ${id} not found`);
    }

    await this.prismaClient.customer.delete({
      where: { id },
    });
  }
}

