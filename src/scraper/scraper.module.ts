import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ScraperService } from './scraper.service';
import { ScraperController } from './scraper.controller';
import { Data, DataSchema } from '../schemas/data.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Data.name, schema: DataSchema }]),
  ],
  providers: [ScraperService],
  controllers: [ScraperController],
})
export class ScraperModule {}
