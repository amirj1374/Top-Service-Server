import { Controller, Get, Post, Body, Param, Put, Delete, Query, ParseIntPipe, HttpStatus } from '@nestjs/common';
import { ProductTypesService } from './product-types.service';
import { CreateProductTypeDto } from './dto/create-product-type.dto';
import { UpdateProductTypeDto } from './dto/update-product-type.dto';

@Controller('product-types')
export class ProductTypesController {
  constructor(private readonly productTypesService: ProductTypesService) {}

  @Get()
  async findAll(
    @Query('page') page?: string,
    @Query('size') size?: string
  ) {
    const pageNum = page ? parseInt(page) : 0;
    const sizeNum = size ? parseInt(size) : 10;
    return this.productTypesService.findAll(pageNum, sizeNum);
  }

  @Get('active')
  async findActive(
    @Query('page') page?: string,
    @Query('size') size?: string
  ) {
    const pageNum = page ? parseInt(page) : 0;
    const sizeNum = size ? parseInt(size) : 10;
    return this.productTypesService.findActive(pageNum, sizeNum);
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.productTypesService.findOne(id);
  }

  @Post()
  async create(@Body() createProductTypeDto: CreateProductTypeDto) {
    return this.productTypesService.create(createProductTypeDto);
  }

  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateProductTypeDto: UpdateProductTypeDto
  ) {
    return this.productTypesService.update(id, updateProductTypeDto);
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    await this.productTypesService.remove(id);
    return { status: 'success', data: null };
  }
}

