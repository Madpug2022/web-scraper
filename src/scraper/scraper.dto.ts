import { IsUrl, IsNotEmpty } from 'class-validator';

export class ScrapeDto {
  @IsUrl()
  @IsNotEmpty()
  url: string;
}
