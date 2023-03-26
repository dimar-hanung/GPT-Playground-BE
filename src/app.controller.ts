import { AppService } from './app.service';

import { Controller, Get, Post, Req, Res } from '@nestjs/common';

import { Configuration, OpenAIApi } from 'openai';
import { response, Response } from 'express';
import { createReadStream } from 'fs';

import { Readable } from 'stream';
import { ConfigService } from '@nestjs/config';
require('dotenv').config({ path: `../${process.env.NODE_ENV}.env` });
console.log('env:', process.env.NEST_OPENAI_API_KEY);

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private configService: ConfigService,
  ) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Post('gpt-basic-quote')
  async gptBasicQuote(@Res() res: Response, @Req() { body }: { body: any }) {
    try {
      this.appService
        .getCompletionBasic({
          prompt: `Buat 1 kalimat hiburan lucu untuk programmer.
buat dengan bahasa non formal dan asik.`,
        })
        .then((response) => {
          res.send({ text: response.data?.trim() ?? '' });
        });
    } catch (error) {
      console.log('error', error);
      // throw error;
    }
  }

  @Post('gpt-quotes')
  async gptQuotes(@Res() res: Response, @Req() { body }: { body: any }) {
    if (body.count > 10) {
      body.count = 10;
    }
    this.appService
      .getCompletionBasic({
        prompt: `Buat ${body.count || 2} quotes yang berasal dari anime.
    buat dengan format response:
    [{"quote":"ini quote 1", "anime": "asal anime"}, {"quote":"ini quote 2", "anime": "asal anime"}, [etc] ]
    `,
      })
      .then((response) => {
        res.send({ data: response.data.trim()?.replace?.('\n', '') || [] });
      });
  }

  @Post('gpt-quote')
  async gptQuote(@Res() res: Response, @Req() { body }: { body: any }) {
    try {
      this.appService.getCompletionStream({
        res,
        prompt: `Buat 1 kalimat hiburan lucu untuk programmer.
      buat dengan bahasa non formal dan asik.
      `,
      });
      // return completion.data;
    } catch (error) {
      console.log('error', error);
    }
  }

  @Post('gpt-puisi')
  async gptPuisi(@Res() res: Response, @Req() { body }: { body: any }) {
    try {
      this.appService.getCompletionStream({
        res,
        prompt: `Web GPT Playground ini dibuat dengan Vue 3, Nest JS, Open AI.
        ini berisi hello-world dan study case untuk integrasi dengan gpt dari openai.
        Tujuan nya untuk mempermudah untuk mempelajari gpt dengan praktik langsung.

        tolong jelaskan dalam bentuk puisi. gunakan bahasa anak senja
      `,
      });
      // return completion.data;
    } catch (error) {
      console.log('error', error);
    }
  }

  @Post('chat')
  async gptChat(@Res() res: Response, @Req() { body }: { body: any }) {
    try {
      this.appService.getChatCompletion({
        res,
        prompt: `Buat 1 kalimat hiburan lucu untuk programmer.
      buat dengan bahasa non formal dan asik.
      `,
      });
      // return completion.data;
    } catch (error) {
      console.log('error', error);
    }
  }
}
