import { IsBoolean, IsNotEmpty, IsOptional, Length } from 'class-validator';

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

  @IsOptional()
  @IsBoolean()
  installationDrawings: boolean;

  @IsOptional()
  @IsBoolean()
  assemblyDrawing: boolean;

  @IsOptional()
  @IsBoolean()
  installationInstructions: boolean;

  @IsOptional()
  @IsBoolean()
  qualityPlan: boolean;

  @IsOptional()
  @IsBoolean()
  materialsCertificate: boolean;

  @IsOptional()
  @IsBoolean()
  declarationOfTRTC: boolean;

  @IsOptional()
  @IsBoolean()
  presenceOfCustomerDuringTesting: boolean;

  @IsOptional()
  @IsBoolean()
  gasInspectionHighPressure: boolean;

  @IsOptional()
  @IsBoolean()
  thirdSideInspection: boolean;
}
