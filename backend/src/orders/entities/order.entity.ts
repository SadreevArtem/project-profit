import { Length } from 'class-validator';
import { Customer } from 'src/customers/entities/customer.entity';
import { OrderStatus, Parameters, TypeOrder } from 'src/types';
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

  @Column({ type: 'jsonb', nullable: true })
  parameters: Parameters;

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

  @Column({
    type: 'enum',
    enum: TypeOrder,
    nullable: true,
    default: TypeOrder.RUBTORUB, //по умолчанию черновик
  })
  typeOrder: TypeOrder;

  @Column({ nullable: true })
  @Length(1, 200)
  filePath: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
  //лист документации
  @Column({ default: false })
  documentationSheet: boolean;
}
