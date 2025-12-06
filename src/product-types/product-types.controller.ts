import { Controller, Get, Post, Body, Param, Put, Delete, Query, ParseIntPipe, HttpCode, HttpStatus } from '@nestjs/common';
import { ProductTypesService } from './product-types.service';
import { CreateProductTypeDto } from './dto/create-product-type.dto';
import { UpdateProductTypeDto } from './dto/update-product-type.dto';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';

@Controller('product-types')
export class ProductTypesController {
  constructor(private readonly productTypesService: ProductTypesService) {}

  @Get()
  async findAll(@Query() query: PaginationQueryDto) {
    return this.productTypesService.findAll(query.page ?? 0, query.size ?? 10);
  }

  @Get('active')
  async findActive(@Query() query: PaginationQueryDto) {
    return this.productTypesService.findActive(query.page ?? 0, query.size ?? 10);
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.productTypesService.findOne(id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
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
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id', ParseIntPipe) id: number) {
    await this.productTypesService.remove(id);
  }
}

