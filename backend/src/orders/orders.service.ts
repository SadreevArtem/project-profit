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
import { CurrencyService } from 'src/currency/currency.service';
// import { getNumericValue } from 'src/helpers/func';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    private readonly usersService: UsersService,
    private readonly customersService: CustomersService,
    private readonly currencyService: CurrencyService,
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

    const buffer = await workbook.xlsx.writeBuffer(); // сохраняем в буфер, не в файл
    const wb = XLSX.read(buffer, { type: 'buffer' });
    XLSX_CALC(wb);

    // // === Пересчитываем формулы через xlsx + xlsx-calc ===
    // const wb = XLSX.readFile(outputPath);
    // XLSX_CALC(wb); // выполняем пересчёт всех формул
    // XLSX.writeFile(wb, outputPath); // сохраняем обратно

    // // === Перечитываем файл (имитация открытия Excel) ===
    // const reopened = new Workbook();
    // await reopened.xlsx.readFile(outputPath);

    // // Можно снова включить пересчёт для надёжности
    // reopened.calcProperties.fullCalcOnLoad = true;

    // // Выбираем лист (например, первый)
    // const worksheetRead = reopened.getWorksheet(1);

    // const getCellResultFunc = (cell) => {
    //   return getNumericValue(cell, worksheetRead);
    // };

    // === 3. Считываем актуальные значения без изменения оригинального файла ===
    const getCellResultFunc = (addr: string) => {
      const sheet = wb.Sheets[wb.SheetNames[0]];
      const cell = sheet[addr];
      return typeof cell?.v === 'number' ? cell.v : Number(cell?.v || 0);
    };

    const companyProfit = getCellResultFunc('C41'); // Прибыль компании
    const companyProfitMinusVAT = getCellResultFunc('C42'); // Прибыль компании за вычетом НДС
    const companyProfitMinusTAX = getCellResultFunc('C44'); // Прибыль компании за вычетом налога на прибыль
    const projectProfitability = getCellResultFunc('C46'); // Рентабельность проекта
    const percentShareInProfit = getCellResultFunc('C48'); // % доли *** в прибыли

    // const { ...rest } = updateOrderDto;
    // Обновляем заказ, передавая только нужные поля из rest
    return this.orderRepository.update(id, {
      ...order,
      parameters: {
        ...(order.parameters || {}),
        companyProfit,
        companyProfitMinusVAT,
        companyProfitMinusTAX,
        projectProfitability: projectProfitability * 100,
        percentShareInProfit: percentShareInProfit * 100,
      },
      filePath: `https://api.greenlinerussia.com.ru/uploads/${outputFileNameXLS}`,
    });
  }
  async calculateUSD(id: number, updateOrderDto: UpdateOrderDto) {
    const templatePath = path.join(__dirname, '../templates/template_usd.xlsx');
    const outputDir = path.join(__dirname, '../../uploads');
    const { ...order } = updateOrderDto;
    const workbook = new Workbook();

    // Получаем курсы валют ===
    const rates = await this.currencyService.getRates();
    // rates.USD, rates.EUR, rates.GBP, rates.CNY

    // Загружаем шаблон
    await workbook.xlsx.readFile(templatePath);

    // Выбираем лист (например, первый)
    const worksheet = workbook.getWorksheet('sheet');
    if (!worksheet) {
      throw new Error('Worksheet not found in template_usd.xlsx');
    }

    // Заполняем данные в ячейки
    worksheet.getCell('C6').value = order.parameters.currency || ''; // Валюта закупки
    // Записываем валюты и курсы валют в файл Excel для формул VLOOKUP/INDEX-MATCH ===
    // Валюта в колонке G, курс в колонке H
    worksheet.getCell('G8').value = 'EUR';
    worksheet.getCell('H8').value = rates.EUR;
    worksheet.getCell('G9').value = 'USD';
    worksheet.getCell('H9').value = rates.USD;
    worksheet.getCell('G10').value = 'GBP';
    worksheet.getCell('H10').value = rates.GBP;
    worksheet.getCell('G11').value = 'CNY';
    worksheet.getCell('H11').value = rates.CNY;

    worksheet.getCell('D6').value =
      (order.parameters.bankCurrencySalesRatio ?? 0) / 100; // Коэффициент продажи валюты
    worksheet.getCell('D6').numFmt = '0%';

    worksheet.getCell('C9').value = order.parameters.productionTime ?? ''; // Срок производства

    worksheet.getCell('J13').value = order.parameters.agentServices ?? 0; // услуги агента
    worksheet.getCell('K2').value = order.parameters.purchase ?? 0; // Закупка

    worksheet.getCell('R2').value = (order.parameters.dutyPercent ?? 0) / 100; // Пошлина
    worksheet.getCell('R2').numFmt = '0%'; // Пошлина

    worksheet.getCell('D10').value = (order.parameters.prepayment ?? 0) / 100; // Предоплата (в долях)
    worksheet.getCell('D10').numFmt = '0%'; // Формат отображения процентов

    worksheet.getCell('F10').value =
      (order.parameters.paymentBeforeShipment ?? 0) / 100; // Перед отгрузкой
    worksheet.getCell('F10').numFmt = '0%'; // Формат процентов

    worksheet.getCell('D16').value =
      (order.parameters.prepaymentSale ?? 0) / 100; // Предоплата (продажа)
    worksheet.getCell('D16').numFmt = '0%';

    worksheet.getCell('F16').value =
      (order.parameters.paymentBeforeShipmentSale ?? 0) / 100; // Перед отгрузкой (продажа)
    worksheet.getCell('F16').numFmt = '0%';

    worksheet.getCell('E58').value = (order.parameters.markup ?? 0) / 100; // наценка
    worksheet.getCell('E58').numFmt = '0%';

    worksheet.getCell('D19').value = order.parameters.currencyDelivery || ''; //Валюта оплаты доставки

    worksheet.getCell('C19').value = order.parameters.deliveryToRF ?? 0; // доставка до РФ

    worksheet.getCell('C20').value =
      order.parameters.deliveryTimeLogisticsToRF ?? ''; //  Срок доставки до РФ

    worksheet.getCell('C21').value = (order.parameters.transferFee ?? 0) / 100; // Комиссия за перевод %
    worksheet.getCell('C21').numFmt = '0%';

    worksheet.getCell('C22').value = order.parameters.deliveryRF ?? 0; // Доставка по РФ

    worksheet.getCell('C23').value =
      order.parameters.deliveryTimeLogisticsRF ?? ''; // срок доставки по РФ

    worksheet.getCell('C24').value =
      order.parameters.deferralPaymentByCustomer ?? ''; // Отсрочка оплаты заказчика

    worksheet.getCell('C27').value = order.parameters.daysForRegistration ?? 0; // Дни на оформление

    worksheet.getCell('C30').value = order.parameters.certification ?? 0; // Сертификация

    worksheet.getCell('C34').value = (order.parameters.costOfMoney ?? 0) / 100; // Инвестиции
    worksheet.getCell('C34').numFmt = '0%';

    worksheet.getCell('D49').value =
      (order.parameters.operationalActivitiesPercent ?? 0) / 100; // ***
    worksheet.getCell('D49').numFmt = '0%';

    worksheet.getCell('D50').value =
      (order.parameters.additionalExpensesPercent ?? 0) / 100; // ***
    worksheet.getCell('D50').numFmt = '0%';

    worksheet.getCell('C51').value =
      order.parameters.otherUnplannedExpenses ?? 0; // Прочие незапланированные расходы

    // Формируем имя нового файла
    const outputFileNameXLS = `order_${id}.xlsx`;
    const outputPath = path.join(outputDir, outputFileNameXLS);
    // Сохраняем заполненный файл
    await workbook.xlsx.writeFile(outputPath);

    const buffer = await workbook.xlsx.writeBuffer(); // сохраняем в буфер, не в файл
    const wb = XLSX.read(buffer, { type: 'buffer' });
    try {
      // Настраиваем обработку ошибок для xlsx-calc
      // Используем функцию с опциями, если поддерживается
      if (typeof XLSX_CALC === 'function') {
        try {
          XLSX_CALC(wb);
        } catch (calcError) {
          // Если есть ошибки в формулах, но они не критичны, продолжаем
          console.warn(
            'Formula calculation warnings (may be expected):',
            calcError.message,
          );
          // Пытаемся продолжить с частичными результатами
        }
      } else {
        XLSX_CALC(wb);
      }
    } catch (error) {
      console.error('Error calculating Excel formulas:', error);
      console.error('Currency value:', order.parameters.currency);
      console.error('Currency rates:', rates);
      // Пытаемся продолжить, даже если есть ошибки в формулах
      // Многие ошибки #N/A могут быть ожидаемыми в процессе вычислений
      console.warn('Continuing despite formula calculation errors...');
    }

    // // === Пересчитываем формулы через xlsx + xlsx-calc ===
    // const wb = XLSX.readFile(outputPath);
    // XLSX_CALC(wb); // выполняем пересчёт всех формул
    // XLSX.writeFile(wb, outputPath); // сохраняем обратно

    // // === Перечитываем файл (имитация открытия Excel) ===
    // const reopened = new Workbook();
    // await reopened.xlsx.readFile(outputPath);

    // // Можно снова включить пересчёт для надёжности
    // reopened.calcProperties.fullCalcOnLoad = true;

    // // Выбираем лист (например, первый)
    // const worksheetRead = reopened.getWorksheet(1);

    // const getCellResultFunc = (cell) => {
    //   return getNumericValue(cell, worksheetRead);
    // };

    // === 3. Считываем актуальные значения без изменения оригинального файла ===
    const getCellResultFunc = (addr: string) => {
      const sheet = wb.Sheets[wb.SheetNames[0]];
      const cell = sheet[addr];
      return typeof cell?.v === 'number' ? cell.v : Number(cell?.v || 0);
    };

    const companyProfit = getCellResultFunc('C55'); // Прибыль компании
    const companyProfitMinusVAT = getCellResultFunc('C56'); // Прибыль компании за вычетом НДС
    const companyProfitMinusTAX = getCellResultFunc('C58'); // Прибыль компании за вычетом налога на прибыль
    const projectProfitability = getCellResultFunc('C60'); // Рентабельность проекта
    const percentShareInProfit = getCellResultFunc('C62'); // % доли *** в прибыли

    // const { ...rest } = updateOrderDto;
    // Обновляем заказ, передавая только нужные поля из rest
    return this.orderRepository.update(id, {
      ...order,
      parameters: {
        ...(order.parameters || {}),
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
