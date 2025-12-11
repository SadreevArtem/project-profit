import { Module } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from './entities/order.entity';
import { UsersModule } from 'src/users/users.module';
import { CustomersModule } from 'src/customers/customers.module';
import { CurrencyService } from 'src/currency/currency.service';

@Module({
  imports: [TypeOrmModule.forFeature([Order]), UsersModule, CustomersModule],
  exports: [OrdersService],
  providers: [OrdersService, CurrencyService],
  controllers: [OrdersController],
})
export class OrdersModule {}
