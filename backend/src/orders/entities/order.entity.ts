import { Length } from 'class-validator';
import { Customer } from 'src/customers/entities/customer.entity';
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
  count: number;

  @Column()
  @Length(2, 200)
  complectName: string;

  @ManyToOne(() => Customer, (customer) => customer.orders)
  customer: Customer; // заказчик

  @ManyToOne(() => User, (user) => user.orders)
  owner: User; // связь с пользователем, который является владельцем заказа

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ nullable: true })
  @Length(1, 200)
  filePath: string;

  @Column({ nullable: true })
  @Length(1, 200)
  filePathPdf: string;
  //лист документации
  @Column({ default: false })
  documentationSheet: boolean;
  //монтажные чертежи
  @Column({ default: false })
  installationDrawings: boolean;
  //сборочный чертеж
  @Column({ default: false })
  assemblyDrawing: boolean;
  //протокол согласования
  @Column({ default: false })
  agreementProtocol: boolean;
  // Инструкции по мантажу
  @Column({ default: false })
  installationInstructions: boolean;
  // План качества
  @Column({ default: false })
  qualityPlan: boolean;
  // сертификат на материалы
  @Column({ default: false })
  materialsCertificate: boolean;
  // декларация ТР ТС
  @Column({ default: false })
  declarationOfTRTC: boolean;
  // Плата за присутствие заказчика во время испытаний (в сутки)
  @Column({ default: false })
  presenceOfCustomerDuringTesting: boolean;
  // испытание газом высокого давления (в час)
  @Column({ default: false })
  gasInspectionHighPressure: boolean;
  // инспекция третьей стороны
  @Column({ default: false })
  thirdSideInspection: boolean;
}
