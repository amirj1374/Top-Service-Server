import { Controller, Get, Post, Body, Param, Put, Delete, Query, HttpCode, HttpStatus, Req } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';
import { SetCustomizerDto } from './dto/set-customizer.dto';
import { Request } from 'express';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  async findAll(@Query() query: PaginationQueryDto) {
    return this.usersService.findAll(query.page ?? 0, query.size ?? 10);
  }

  @Put('me/customizer')
  async setCustomizerFromToken(@Req() req: Request, @Body() dto: SetCustomizerDto) {
    const userId = (req.user as { id: string }).id;
    return this.usersService.setCustomizerFromToken(userId, dto);
  }

  @Get('me/customizer')
  async getCustomizerFromToken(@Req() req: Request) {
    const userId = (req.user as { id: string }).id;
    return this.usersService.getCustomizerFromToken(userId);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto
  ) {
    return this.usersService.update(id, updateUserDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string) {
    await this.usersService.remove(id);
  }
}

