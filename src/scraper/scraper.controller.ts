import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  Delete,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ScraperService } from './scraper.service';
import { ScrapeDto } from './scraper.dto';

/**
 * Scraper Controller
 * @class
 * @name ScraperController
 * @description Scraper Controller
 * @path src/scraper/scraper.controller.ts
 *
 * This controller is responsible for handling incoming requests to scrape data from a given URL.
 */

@Controller('scrape')
export class ScraperController {
  constructor(private readonly scraperService: ScraperService) {}

  @Post()
  @UsePipes(new ValidationPipe({ whitelist: true }))
  /**
   * Scrape data from a given URL
   * @param {ScrapeDto} scrapeDto - The URL to scrape data from
   * @returns {Promise} - The scraped data
   * @throws {Error} - An error occurred while scraping data
   *
   * @example
   * scrape({
   *  url: 'https://example.com'
   * })
   *
   * This method scrapes data from a given URL and returns the scraped data.
   */
  async scrape(@Body() scrapeDto: ScrapeDto) {
    try {
      return await this.scraperService.scrapeData(scrapeDto.url);
    } catch (error) {
      throw error;
    }
  }

  @Get('urls')
  /**
   * Get all URLs
   * @returns {Promise} - All URLs
   * @throws {Error} - An error occurred while fetching URLs
   *
   *
   * This method fetches all URLs from the database and returns them.
   *
   * @example
   */
  async getAllUrls() {
    try {
      const urls = await this.scraperService.getAllUrls();
      return { urls };
    } catch (error) {
      throw error;
    }
  }

  @Get()
  /**
   * Get data by URL
   * @param {ScrapeDto} urlDto - The URL to fetch data from
   * @returns {Promise} - The data fetched from the URL
   * @throws {Error} - An error occurred while fetching data
   *
   * @example
   * getDataByUrl({
   * url: 'https://example.com'
   * })
   *
   * This method fetches data from a given URL and returns the data.
   */
  @UsePipes(new ValidationPipe({ whitelist: true }))
  async getDataByUrl(@Query() urlDto: ScrapeDto) {
    try {
      return await this.scraperService.getDataByUrl(urlDto.url);
    } catch (error) {
      throw error;
    }
  }

  @Delete()
  /**
   * Delete all data
   *
   * @returns {Promise} - The result of deleting all data
   * @throws {Error} - An error occurred while deleting all data
   *
   * This method deletes all data from the database.
   */
  async deleteAllData() {
    try {
      return await this.scraperService.deleteAllData();
    } catch (error) {
      throw error;
    }
  }
}
