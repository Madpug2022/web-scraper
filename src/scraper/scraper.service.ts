import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import * as puppeteer from 'puppeteer';
import axios from 'axios';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Data, DataDocument } from '../schemas/data.schema';

@Injectable()
export class ScraperService {
  constructor(@InjectModel(Data.name) private dataModel: Model<DataDocument>) {}

  async scrapeData(url: string): Promise<Data> {
    let browser: puppeteer.Browser;
    try {
      console.log('Scraping URL:', url);

      try {
        const response = await axios.head(url);
        if (response.status === 404) {
          throw new HttpException('Page not found (404)', HttpStatus.NOT_FOUND);
        }
      } catch (error) {
        if (error.response && error.response.status === 404) {
          throw new HttpException('Page not found (404)', HttpStatus.NOT_FOUND);
        }
        throw new HttpException(
          'Error accesing the URL',
          HttpStatus.BAD_REQUEST,
        );
      }

      console.log('Launching browser');

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
      await page.goto(url, { waitUntil: 'domcontentloaded' });
      console.log('URL loaded');

      const pageTitle = await page.title();
      console.log('Page title:', pageTitle);

      const images = await page.$$eval('img', (imgs) =>
        imgs.map((img) => img.src),
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

      const randomIndex = Math.floor(Math.random() * paragraphs.length);
      const randomParagraph = paragraphs[randomIndex];

      const dataToSave = {
        pageUrl: url,
        pageText: randomParagraph,
        imageUrl:
          images.length > 0
            ? images[Math.floor(Math.random() * images.length)]
            : 'No images found',
        pageTitle,
      };

      const createdData = new this.dataModel(dataToSave);
      await createdData.save();

      console.log('Data created');

      return createdData;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      console.error('Error in scrapeData:', error);
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

  async getAllUrls(): Promise<string[]> {
    const dataList = await this.dataModel
      .find({}, { pageUrl: 1, _id: 0 })
      .exec();
    return dataList.map((data) => data.pageUrl);
  }

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

  async deleteAllData() {
    await this.dataModel.deleteMany({}).exec();
    return 'All data deleted';
  }
}
