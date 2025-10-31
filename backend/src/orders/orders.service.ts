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
import * as path from 'path';
import * as XLSX from 'xlsx';
import * as XLSX_CALC from 'xlsx-calc';
import { Workbook } from 'exceljs';
import { getNumericValue } from 'src/helpers/func';

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
  async calculate(id: number, updateOrderDto: UpdateOrderDto) {
    const existingOrder = await this.orderRepository.findOne({ where: { id } });
    const templatePath = path.join(__dirname, '../templates/template_rub.xlsx');
    const outputDir = path.join(__dirname, '../../uploads');
    const { ...order } = updateOrderDto;
    const workbook = new Workbook();

    // Загружаем шаблон
    await workbook.xlsx.readFile(templatePath);

    // Выбираем лист (например, первый)
    const worksheet = workbook.getWorksheet(1);

    // Заполняем данные в ячейки
    worksheet.getCell('C6').value = order.parameters.purchase ?? 0; // Закупка
    worksheet.getCell('C7').value = order.parameters.productionTime ?? ''; // Срок производства

    worksheet.getCell('D8').value = (order.parameters.prepayment ?? 0) / 100; // Предоплата (в долях)
    worksheet.getCell('D8').numFmt = '0%'; // Формат отображения процентов

    worksheet.getCell('F8').value =
      (order.parameters.paymentBeforeShipment ?? 0) / 100; // Перед отгрузкой
    worksheet.getCell('F8').numFmt = '0%'; // Формат процентов

    worksheet.getCell('C12').value = order.parameters.salesWithVAT ?? 0; // Продажа с НДС

    worksheet.getCell('D14').value =
      (order.parameters.prepaymentSale ?? 0) / 100; // Предоплата (продажа)
    worksheet.getCell('D14').numFmt = '0%';

    worksheet.getCell('F14').value =
      (order.parameters.paymentBeforeShipmentSale ?? 0) / 100; // Перед отгрузкой (продажа)
    worksheet.getCell('F14').numFmt = '0%';

    worksheet.getCell('C17').value = order.parameters.delivery ?? 0; // Доставка
    worksheet.getCell('C18').value =
      order.parameters.deliveryTimeLogistics ?? ''; // Срок поставки
    worksheet.getCell('C19').value =
      order.parameters.deferralPaymentByCustomer ?? ''; // Отсрочка оплаты заказчика

    worksheet.getCell('C22').value = (order.parameters.costOfMoney ?? 0) / 100; // Инвестиции
    worksheet.getCell('C22').numFmt = '0%';

    worksheet.getCell('D36').value =
      (order.parameters.additionalExpensesPercent ?? 0) / 100; // ***
    worksheet.getCell('D36').numFmt = '0%';

    worksheet.getCell('C37').value =
      order.parameters.otherUnplannedExpenses ?? 0; // Прочие незапланированные расходы

    // Формируем имя нового файла
    const outputFileNameXLS = `order_${id}.xlsx`;
    const outputPath = path.join(outputDir, outputFileNameXLS);
    // Сохраняем заполненный файл
    await workbook.xlsx.writeFile(outputPath);

    // === Пересчитываем формулы через xlsx + xlsx-calc ===
    const wb = XLSX.readFile(outputPath);
    XLSX_CALC(wb); // выполняем пересчёт всех формул
    XLSX.writeFile(wb, outputPath); // сохраняем обратно

    // === Перечитываем файл (имитация открытия Excel) ===
    const reopened = new Workbook();
    await reopened.xlsx.readFile(outputPath);

    // Можно снова включить пересчёт для надёжности
    reopened.calcProperties.fullCalcOnLoad = true;

    // Выбираем лист (например, первый)
    const worksheetRead = reopened.getWorksheet(1);

    const getCellResultFunc = (cell) => {
      return getNumericValue(cell, worksheetRead);
    };

    const companyProfit = getCellResultFunc('C41'); // Прибыль компании
    const companyProfitMinusVAT = getCellResultFunc('C42'); // Прибыль компании за вычетом НДС
    const companyProfitMinusTAX = getCellResultFunc('C44'); // Прибыль компании за вычетом налога на прибыль
    const projectProfitability = getCellResultFunc('C46'); // Рентабельность проекта
    const percentShareInProfit = getCellResultFunc('C48'); // % доли *** в прибыли
    // "Закрываем" книгу — пересохраняем в том же месте
    await reopened.xlsx.writeFile(outputPath);

    // const { ...rest } = updateOrderDto;
    // Обновляем заказ, передавая только нужные поля из rest
    return this.orderRepository.update(id, {
      // ...rest,
      parameters: {
        ...(existingOrder.parameters || {}), // сохраняем старые значения
        companyProfit,
        companyProfitMinusVAT,
        companyProfitMinusTAX,
        projectProfitability: projectProfitability * 100,
        percentShareInProfit: percentShareInProfit * 100,
      },
      filePath: `https://api.greenlinerussia.com.ru/uploads/${outputFileNameXLS}`,
    });
  }
  async remove(id: number, user: User) {
    if (user.role !== UserRole.ADMIN) {
      throw new BadRequestException('Недостаточно прав для удаления заказа');
    }
    const order = await this.orderRepository.findOne({ where: { id } });
    return this.orderRepository.remove(order);
  }
}
