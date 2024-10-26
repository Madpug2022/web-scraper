import { Test, TestingModule } from '@nestjs/testing';
import { ScraperController } from '../scraper/scraper.controller';
import { ScraperService } from '../scraper/scraper.service';
import { ScrapeDto } from '../scraper/scraper.dto';
import { HttpException, HttpStatus } from '@nestjs/common';
import { Data } from '../schemas/data.schema';

const testData: Data = {
  pageUrl: 'https://piratebay.org',
  pageText: 'I am a migthy corsair!',
  imageUrl: 'https://piratebay.org/majestous-parrot.jpg',
  pageTitle: 'Something smells fishy',
};

const testUrls = ['https://piratebay.org', 'https://somethingelseidunno.com'];

describe('ScraperController', () => {
  let scraperController: ScraperController;
  let scraperService: ScraperService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ScraperController],
      providers: [
        {
          provide: ScraperService,
          useValue: {
            scrapeData: jest.fn(),
            getAllUrls: jest.fn(),
            getDataByUrl: jest.fn(),
          },
        },
      ],
    }).compile();

    scraperController = module.get<ScraperController>(ScraperController);
    scraperService = module.get<ScraperService>(ScraperService);
  });

  describe('scrape', () => {
    it('must scrape and store the data', async () => {
      const scrapeDto: ScrapeDto = { url: 'https://piratebay.org' };

      jest.spyOn(scraperService, 'scrapeData').mockResolvedValue(testData);

      const result = await scraperController.scrape(scrapeDto);

      expect(scraperService.scrapeData).toHaveBeenCalledWith(scrapeDto.url);
      expect(result).toEqual(testData);
    });

    it('launch an exception is something goes off', async () => {
      const scrapeDto: ScrapeDto = { url: 'https://piratebay.org' };

      jest
        .spyOn(scraperService, 'scrapeData')
        .mockRejectedValue(
          new HttpException(
            'Error al procesar la solicitud',
            HttpStatus.INTERNAL_SERVER_ERROR,
          ),
        );

      await expect(scraperController.scrape(scrapeDto)).rejects.toThrow(
        HttpException,
      );
    });
  });

  describe('getAllUrls', () => {
    it('return a list of urls', async () => {
      jest.spyOn(scraperService, 'getAllUrls').mockResolvedValue(testUrls);

      const result = await scraperController.getAllUrls();

      expect(scraperService.getAllUrls).toHaveBeenCalled();
      expect(result).toEqual({ urls: testUrls });
    });

    it('launch an exception is something fails', async () => {
      jest
        .spyOn(scraperService, 'getAllUrls')
        .mockRejectedValue(
          new HttpException(
            'Error al obtener las URLs',
            HttpStatus.INTERNAL_SERVER_ERROR,
          ),
        );

      await expect(scraperController.getAllUrls()).rejects.toThrow(
        HttpException,
      );
    });
  });

  describe('getDataByUrl', () => {
    it('must return data of the provided url', async () => {
      const urlDto: ScrapeDto = { url: 'https://piratebay.org' };

      jest.spyOn(scraperService, 'getDataByUrl').mockResolvedValue(testData);

      const result = await scraperController.getDataByUrl(urlDto);

      expect(scraperService.getDataByUrl).toHaveBeenCalledWith(urlDto.url);
      expect(result).toEqual(testData);
    });

    it('launch an exception is something fails', async () => {
      const urlDto: ScrapeDto = { url: 'https://doesnotexists.com' };

      jest
        .spyOn(scraperService, 'getDataByUrl')
        .mockRejectedValue(
          new HttpException(
            'No se encontraron datos para la URL proporcionada',
            HttpStatus.NOT_FOUND,
          ),
        );

      await expect(scraperController.getDataByUrl(urlDto)).rejects.toThrow(
        HttpException,
      );
    });
  });
});
