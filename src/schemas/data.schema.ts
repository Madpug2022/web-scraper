import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type DataDocument = Data & Document;

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
}

export const DataSchema = SchemaFactory.createForClass(Data);
