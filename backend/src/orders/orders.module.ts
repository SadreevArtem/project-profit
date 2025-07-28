import { Module } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from './entities/order.entity';
import { UsersModule } from 'src/users/users.module';
import { CustomersModule } from 'src/customers/customers.module';

@Module({
  imports: [TypeOrmModule.forFeature([Order]), UsersModule, CustomersModule],
  exports: [OrdersService],
  providers: [OrdersService],
  controllers: [OrdersController],
})
export class OrdersModule {}
