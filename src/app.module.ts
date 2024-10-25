import { Module } from '@nestjs/common';
import { ScraperService } from './scraper/scraper.service';
import { ScraperController } from './scraper/scraper.controller';

@Module({
  imports: [],
  controllers: [ScraperController],
  providers: [ScraperService],
})
export class AppModule {}
