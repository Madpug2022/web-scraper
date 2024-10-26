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
          throw new HttpException(
            'Página no encontrada (404)',
            HttpStatus.NOT_FOUND,
          );
        }
      } catch (error) {
        if (error.response && error.response.status === 404) {
          throw new HttpException(
            'Página no encontrada (404)',
            HttpStatus.NOT_FOUND,
          );
        }
        throw new HttpException(
          'Error al acceder a la URL',
          HttpStatus.BAD_REQUEST,
        );
      }

      console.log('Lanzando el navegador con Puppeteer');

      browser = await puppeteer.launch({
        headless: true,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
        ],
      });

      console.log('Navegador lanzado exitosamente');

      const page = await browser.newPage();

      await page.setUserAgent(
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) ' +
          'AppleWebKit/537.36 (KHTML, like Gecko) ' +
          'Chrome/85.0.4183.102 Safari/537.36',
      );

      console.log('Navegando a la URL');
      await page.goto(url, { waitUntil: 'domcontentloaded' });
      console.log('URL cargada');

      const pageTitle = await page.title();
      console.log('Título de la página:', pageTitle);

      const images = await page.$$eval('img', (imgs) =>
        imgs.map((img) => img.src),
      );
      console.log('Imágenes encontradas:', images.length);

      const paragraphs = await page.$$eval('p', (ps) =>
        ps.map((p) => p.textContent.trim()).filter((text) => text.length > 0),
      );
      console.log('Párrafos encontrados:', paragraphs.length);

      if (paragraphs.length === 0) {
        throw new HttpException(
          'No se encontraron párrafos en la página',
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
            : 'No se encontraron imágenes en la página',
        pageTitle,
      };

      const createdData = new this.dataModel(dataToSave);
      await createdData.save();

      console.log('Datos creados en la base de datos');

      return createdData;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      console.error('Error en scrapeData:', error);
      throw new HttpException(
        'Error al procesar la solicitud',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    } finally {
      if (browser) {
        await browser.close();
        console.log('Navegador cerrado');
      }
    }
  }
}
