import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Order } from './entities/order.entity';
import { Repository } from 'typeorm';
import { UsersService } from 'src/users/users.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { User } from 'src/users/entities/user.entity';
import { UserRole } from 'src/types';
import { CustomersService } from 'src/customers/customers.service';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    private readonly usersService: UsersService,
    private readonly customersService: CustomersService,
  ) {}
  findAll(): Promise<Order[]> {
    return this.orderRepository.find({
      order: { id: 'ASC' },
      relations: { owner: true, customer: true },
    });
  }
  findById(id: number) {
    return this.orderRepository.findOne({
      where: { id },
      relations: {
        owner: true,
        customer: true,
      },
    });
  }
  async update(id: number, updateOrderDto: UpdateOrderDto) {
    const { customerId, ownerId: userId, ...rest } = updateOrderDto;
    // Получаем сущности для связи
    const owner = await this.usersService.findById(userId);
    const customer = await this.customersService.findById(customerId);
    // Обновляем заказ, передавая только нужные поля из rest
    return this.orderRepository.update(id, {
      ...rest,
      owner,
      customer,
    });
  }
  async create(createOrderDto: CreateOrderDto, userId: number) {
    const { customerId } = createOrderDto;
    const owner = await this.usersService.findById(userId);
    const customer = await this.customersService.findById(customerId);
    const order = await this.orderRepository.create({
      ...createOrderDto,
      owner,
      customer,
    });
    return this.orderRepository.save(order);
  }
  async remove(id: number, user: User) {
    if (user.role !== UserRole.ADMIN) {
      throw new BadRequestException('Недостаточно прав для удаления заказа');
    }
    const order = await this.orderRepository.findOne({ where: { id } });
    return this.orderRepository.remove(order);
  }
}
