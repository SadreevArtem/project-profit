import {
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  Length,
} from 'class-validator';
import { OrderStatus } from 'src/types';

export class CreateOrderDto {
  @IsNotEmpty()
  @Length(2, 200)
  contractNumber: string;

  @IsNotEmpty()
  @Length(2, 200)
  complectName: string;

  @IsOptional()
  @IsBoolean()
  documentationSheet: boolean;

  @IsOptional()
  @IsBoolean()
  agreementProtocol: boolean;

  @IsNotEmpty()
  customerId: number;

  @IsOptional()
  ownerId: number; // связь с пользователем, который является владельцем заказа

  @IsEnum(OrderStatus)
  @IsOptional()
  orderStatus?: OrderStatus;
}
