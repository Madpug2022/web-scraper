import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import * as puppeteer from 'puppeteer';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Data, DataDocument } from '../schemas/data.schema';

@Injectable()
export class ScraperService {
  constructor(@InjectModel(Data.name) private dataModel: Model<DataDocument>) {}

  /**
   *
   * @param url
   * @returns {Promise<Data>} - The scraped data
   * @throws {Error} - An error occurred while scraping data
   *
   * This method scrapes data from a given URL and returns the scraped data.
   */
  async scrapeData(url: string): Promise<Data> {
    let browser: puppeteer.Browser;
    try {
      console.log('Scraping URL:', url);

      // Lanzar el navegador Puppeteer
      browser = await puppeteer.launch({
        headless: true,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
        ],
      });

      console.log('Browser launched');

      const page = await browser.newPage();
      await page.setUserAgent(
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) ' +
          'AppleWebKit/537.36 (KHTML, like Gecko) ' +
          'Chrome/85.0.4183.102 Safari/537.36',
      );

      console.log('Navigating');

      const response = await page.goto(url, { waitUntil: 'domcontentloaded' });

      if (!response || response.status() >= 400) {
        throw new HttpException('Page not found', HttpStatus.NOT_FOUND);
      }

      console.log('URL loaded');

      // This will try to detect if the page is an error page without depending on the status code
      // Since some pages return a 200 status code even if they are error pages
      // But this is not a foolproof method
      // So for safeguarding we will store this as a new value in the database
      // Wich indicated that the page could be an error page

      const pageTitle = await page.title();
      const h1Element = await page.$('h1');
      const h2Element = await page.$('h2');

      const h1Text = h1Element
        ? await page.evaluate((el) => el.textContent.toLowerCase(), h1Element)
        : '';
      const h2Text = h2Element
        ? await page.evaluate((el) => el.textContent.toLowerCase(), h2Element)
        : '';

      const errorIndicators = [
        '404 Page Not Found',
        '404 Pagina no encontrada',
        '404 Página no encontrada',
      ];
      const isErrorPage = errorIndicators.some(
        (indicator) =>
          pageTitle.toLowerCase().includes(indicator) ||
          h1Text.includes(indicator) ||
          h2Text.includes(indicator),
      );

      console.log('Page title:', pageTitle);

      const images = await page.$$eval('img', (imgs) =>
        imgs.map((img) => img.getAttribute('src')).filter((src) => src),
      );
      console.log('Found images:', images.length);

      const paragraphs = await page.$$eval('p', (ps) =>
        ps.map((p) => p.textContent.trim()).filter((text) => text.length > 0),
      );
      console.log('Texts found:', paragraphs.length);

      if (paragraphs.length === 0) {
        throw new HttpException(
          'No text was found in the page',
          HttpStatus.NO_CONTENT,
        );
      }

      const longestParagraph = paragraphs.reduce((a, b) =>
        a.length > b.length ? a : b,
      );

      const imageUrl =
        images.find((img) => img && img.startsWith('http')) || null;

      const dataToSave = {
        pageUrl: url,
        pageText: longestParagraph,
        imageUrl,
        pageTitle,
        couldBeError: isErrorPage,
      };

      const createdData = new this.dataModel(dataToSave);
      await createdData.save();

      console.log('Data created');

      return createdData;
    } catch (error) {
      console.error('Error in scrapeData:', error);
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Error processing the URL',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    } finally {
      if (browser) {
        await browser.close();
        console.log('Browser closed');
      }
    }
  }

  /**
   *
   * @returns {<string[]>} - All URLs
   * @throws {Error} - An error occurred while fetching URLs
   *
   * This method fetches all URLs from the database and returns them.
   */
  async getAllUrls(): Promise<string[]> {
    const dataList = await this.dataModel.find({}, { _id: 0 }).exec();
    return dataList.map((data) => data.pageUrl);
  }

  /**
   *
   * @param url
   * @returns {<Data>} - The data fetched from the URL
   * @throws {Error} - An error occurred while fetching data
   *
   * This method fetches data from a given URL and returns the data.
   */
  async getDataByUrl(url: string): Promise<Data> {
    const data = await this.dataModel.findOne({ pageUrl: url }).exec();
    if (!data) {
      throw new HttpException(
        'No data found for the URL',
        HttpStatus.NOT_FOUND,
      );
    }
    return data;
  }

  /**
   *
   * @returns {<string>} - All data deleted
   */
  async deleteAllData() {
    await this.dataModel.deleteMany({}).exec();
    return 'All data deleted';
  }
}
