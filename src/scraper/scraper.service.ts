import { Injectable } from '@nestjs/common';
import { Builder, WebDriver } from 'selenium-webdriver';
import * as chrome from 'selenium-webdriver/chrome';
import { PrismaService } from '../services/prisma.service';

@Injectable()
export class ScraperService {
  private driver: WebDriver;

  constructor(private prisma: PrismaService) {
    this.initDriver();
  }

  async initDriver() {
    this.driver = await new Builder()
      .forBrowser('chrome')
      .setChromeOptions(new chrome.Options().headless()) // Ejecuta Chrome en modo headless
      .build();
  }
}
