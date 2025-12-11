import { Injectable } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class CurrencyService {
  async getRates() {
    const url = 'https://www.cbr-xml-daily.ru/daily_json.js';
    const res = await axios.get(url);

    return {
      USD: res.data.Valute.USD.Value,
      EUR: res.data.Valute.EUR.Value,
      GBP: res.data.Valute.GBP.Value,
      CNY: res.data.Valute.CNY.Value,
    };
  }
}
