import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  HttpException,
  HttpStatus,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ScraperService } from './scraper.service';
import { ScrapeDto } from './scraper.dto';

@Controller('scrape')
export class ScraperController {
  constructor(private readonly scraperService: ScraperService) {}

  @Post()
  @UsePipes(new ValidationPipe({ whitelist: true }))
  async scrape(@Body() scrapeDto: ScrapeDto) {
    try {
      return await this.scraperService.scrapeData(scrapeDto.url);
    } catch (error) {
      throw error;
    }
  }

  @Get('urls')
  async getAllUrls() {
    try {
      const urls = await this.scraperService.getAllUrls();
      return { urls };
    } catch (error) {
      throw error;
    }
  }

  @Get()
  @UsePipes(new ValidationPipe({ whitelist: true }))
  async getDataByUrl(@Query() urlDto: ScrapeDto) {
    try {
      return await this.scraperService.getDataByUrl(urlDto.url);
    } catch (error) {
      throw error;
    }
  }
}
