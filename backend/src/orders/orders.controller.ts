import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseFilters,
  UseGuards,
} from '@nestjs/common';
import { OrdersService } from './orders.service';
import { JwtGuard } from 'src/guard/jwt.guard';
import { CreateOrderDto } from './dto/create-order.dto';
import { AuthUser } from 'src/common/decorators/user.decorator';
import { User } from 'src/users/entities/user.entity';
import { EntityNotFoundFilter } from 'src/common/filters/entity-not-found-exception.filter';
import { UpdateOrderDto } from './dto/update-order.dto';
@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}
  @UseGuards(JwtGuard)
  @Get()
  findAll() {
    return this.ordersService.findAll();
  }
  @UseGuards(JwtGuard)
  @Post()
  create(@Body() createOrderDto: CreateOrderDto, @AuthUser() user: User) {
    return this.ordersService.create(createOrderDto, user.id);
  }
  @UseGuards(JwtGuard)
  @Get(':id')
  async getOrderById(@Param('id') id: string) {
    return this.ordersService.findById(+id);
  }
  @UseGuards(JwtGuard)
  @Delete(':id')
  @UseFilters(EntityNotFoundFilter)
  async remove(@Param('id', ParseIntPipe) id: number, @AuthUser() user: User) {
    return this.ordersService.remove(id, user);
  }
  @UseGuards(JwtGuard)
  @Patch(':id')
  @UseFilters(EntityNotFoundFilter)
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateOrderDto: UpdateOrderDto,
  ) {
    return this.ordersService.update(id, updateOrderDto);
  }
  @UseGuards(JwtGuard)
  @Patch('calculate/:id')
  @UseFilters(EntityNotFoundFilter)
  async calculate(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateOrderDto: UpdateOrderDto,
  ) {
    return this.ordersService.calculate(id, updateOrderDto);
  }
  @UseGuards(JwtGuard)
  @Patch('calculate-usd/:id')
  @UseFilters(EntityNotFoundFilter)
  async calculateUSD(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateOrderDto: UpdateOrderDto,
  ) {
    return this.ordersService.calculateUSD(id, updateOrderDto);
  }
}
