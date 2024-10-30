import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type DataDocument = Data & Document;

/**
 * Data schema
 * @param pageUrl: string
 * @param pageText: string
 * @param imageUrl: string
 * @param pageTitle: string
 *
 * @returns DataDocument
 *
 * This section is used to define the schema for the data that will be stored in the database.
 */

@Schema()
export class Data {
  @Prop({ required: true })
  pageUrl: string;

  @Prop({ required: true })
  pageText: string;

  @Prop({ required: true })
  imageUrl: string;

  @Prop({ required: true })
  pageTitle: string;

  @Prop({ required: true })
  couldBeError: boolean;
}

export const DataSchema = SchemaFactory.createForClass(Data);
