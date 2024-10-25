import { Controller } from '@nestjs/common';
import { ScraperService } from './scraper.service';
import { PrismaService } from '../services/prisma.service';

@Controller('scrape')
export class ScraperController {
  constructor(
    private readonly scraperService: ScraperService,
    private readonly prisma: PrismaService,
  ) {}
}
