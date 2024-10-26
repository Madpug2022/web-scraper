import { IsUrl, IsNotEmpty } from 'class-validator';

/**
 * Data transfer object for the scrape endpoint
 * @class
 * @property {string} url - The URL to scrape data from
 * @example
 * const scrapeDto = {
 * url: 'https://example.com'
 * }
 */
export class ScrapeDto {
  @IsUrl()
  @IsNotEmpty()
  url: string;
}
