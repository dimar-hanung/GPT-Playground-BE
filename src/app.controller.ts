import { AppService } from './app.service';

import { Controller, Get, Post, Req, Res } from '@nestjs/common';

import { Configuration, OpenAIApi } from 'openai';
import { Response } from 'express';
import { createReadStream } from 'fs';

import { Readable } from 'stream';
import { ConfigService } from '@nestjs/config';

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
      const configuration = new Configuration({
        apiKey: this.configService.get('NEST_OPENAI_API_KEY'),
      });
      const openai = new OpenAIApi(configuration);
      const response = await openai.createCompletion({
        model: 'text-davinci-003',
        prompt: `Buat 1 kalimat hiburan lucu untuk programmer.

          buat dengan bahasa non formal dan asik.
          `,
        temperature: 0.9,
        max_tokens: 2048,
      });
      res.send({ text: response.data.choices?.[0]?.text || '' });
      return { text: response.data.choices?.[0]?.text || '' };
    } catch (error) {
      throw error;
    }
  }

  @Post('gpt-quotes')
  async gptQuotes(@Res() res: Response, @Req() { body }: { body: any }) {
    try {
      const configuration = new Configuration({
        apiKey: this.configService.get('NEST_OPENAI_API_KEY'),
      });
      if (body.count > 10) {
        body.count = 10;
      }
      const openai = new OpenAIApi(configuration);
      const response = await openai.createCompletion({
        model: 'text-davinci-003',
        prompt: `Buat ${body?.count || 2} quotes yang berasal dari anime.
          buat dengan format response:
          [{"quote":"ini quote 1", "anime": "asal anime"}, {"quote":"ini quote 2", "anime": "asal anime"}, [etc] ]

          `,
        temperature: 0.9,
        max_tokens: 2048,
      });
      res.send({
        data: response.data.choices?.[0]?.text?.trim()?.replace('\n', '') || [],
      });
      return { data: response.data.choices?.[0]?.text || [] };
    } catch (error) {
      throw error;
    }
  }

  @Post('gpt-quote')
  async gptQuote(@Res() res: any, @Req() { body }: { body: any }) {
    try {
      const configuration = new Configuration({
        apiKey: this.configService.get('NEST_OPENAI_API_KEY'),
      });
      const openai = new OpenAIApi(configuration);
      const response = await openai.createCompletion(
        {
          model: 'text-davinci-003',
          prompt: `Buat 1 kalimat hiburan lucu untuk programmer.

          buat dengan bahasa non formal dan asik.
          `,
          temperature: 0.9,
          max_tokens: 2048,
          stream: true,
        },
        { responseType: 'stream' },
      );

      const stream = response.data as any as Readable;
      stream
        .on('data', (chunk) => {
          try {
            const data =
              JSON.parse(chunk?.toString()?.trim()?.replace('data: ', '')) ??
              {};

            res.flush();
          } catch (error) {
            console.log('Skipable error');
          }
        })
        .pipe(res);

      stream.on('end', () => {
        res.end();
      });

      stream.on('error', (error) => {
        console.error(error);
        res.end(
          JSON.stringify({
            error: true,
            message: 'Error generating response.',
          }),
        );
      });

      // return completion.data;
    } catch (error) {
      console.log('error', error);
    }
  }
}
