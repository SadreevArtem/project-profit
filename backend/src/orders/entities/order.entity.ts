import { Length } from 'class-validator';
import { Customer } from 'src/customers/entities/customer.entity';
import { OrderStatus } from 'src/types';
import { User } from 'src/users/entities/user.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class Order {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  @Length(2, 200)
  contractNumber: string;

  @Column()
  @Length(2, 200)
  complectName: string;

  @ManyToOne(() => Customer, (customer) => customer.orders)
  customer: Customer; // заказчик

  @ManyToOne(() => User, (user) => user.orders)
  owner: User; // связь с пользователем, который является владельцем заказа

  @Column({
    type: 'enum',
    enum: OrderStatus,
    nullable: true,
    default: OrderStatus.DRAFT, //по умолчанию черновик
  })
  orderStatus: OrderStatus;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
  //лист документации
  @Column({ default: false })
  documentationSheet: boolean;
}
