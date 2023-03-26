import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, ObjectId } from 'mongoose';

export type ChatHistoryDocument = HydratedDocument<ChatHistory>;

@Schema({ collection: 'chat-history' })
export class ChatHistory {
  //   @Prop()
  //   _id: string;

  @Prop({ default: Date.now() })
  createdAt: Date;

  @Prop({ default: Date.now() })
  updatedAt: Date;

  @Prop()
  chatId: string;

  @Prop()
  message: string;

  @Prop()
  role: string;
}

export const ChatHistorySchema = SchemaFactory.createForClass(ChatHistory);
