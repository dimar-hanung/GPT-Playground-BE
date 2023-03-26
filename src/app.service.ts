import { Injectable } from '@nestjs/common';
import { Configuration, OpenAIApi } from 'openai';
import { Readable } from 'stream';
import { Response } from 'express';
import { InjectModel } from '@nestjs/mongoose';
import { ChatHistory, ChatHistoryDocument } from './chat.schema';
import mongoose, { Model } from 'mongoose';
@Injectable()
export class AppService {
  // 🚀 Mendefinisikan konfigurasi untuk koneksi ke API OpenAI
  private configuration = new Configuration({
    apiKey: process.env.NEST_OPENAI_API_KEY, // 🤫 Mengambil API key dari environment variable
  });

  // 🤖 Membuat objek OpenAIApi dengan menggunakan konfigurasi yang telah dibuat
  private openai = new OpenAIApi(this.configuration);

  constructor(
    @InjectModel(ChatHistory.name)
    private chatHistoryModel: Model<ChatHistoryDocument>,
  ) {
    console.log('ChatHistory.name', ChatHistory.name);
  }

  getHello(): string {
    return 'Hello World! Dimar !';
  }

  async getCompletionBasic({ prompt }: { prompt: string }) {
    try {
      // 🚀 Mengirimkan permintaan untuk memproses prompt menggunakan model 'text-davinci-003'
      const response = await this.openai.createCompletion({
        model: 'text-davinci-003', // 🤖 Model OpenAI yang digunakan untuk memproses prompt
        prompt: prompt, // 🎯 Prompt yang akan diolah oleh model OpenAI
        temperature: 0.9, // 🔥 Mengatur tingkat variasi hasil. Semakin tinggi nilai temperature, semakin banyak variasi hasil yang dihasilkan.
        max_tokens: 2048, // 🧱 Batas jumlah karakter yang dihasilkan
      });

      // 🎉 Mengambil hasil dari API OpenAI dan mengembalikannya
      return {
        data: response.data.choices?.[0]?.text,
      };
    } catch (error) {
      // 🚨 Melemparkan error jika terjadi kesalahan
      console.log('error 2', error);
      // throw error;
    }
  }

  async getChatCompletion({ res, prompt }: { res: Response; prompt: string }) {
    try {
      // insert chat history

      const response = await this.openai.createChatCompletion(
        {
          model: 'gpt-3.5-turbo',
          messages: [
            { role: 'system', content: 'You are a helpful assistant.' },
            { role: 'user', content: 'Siapa rektur ut sekarang?' },
            {
              role: 'assistant',
              content: 'Ojat Darojat',
            },
            { role: 'user', content: 'siapa dia?' },
          ],
          max_tokens: 4000,
          temperature: 0.9,
          stream: true,
        },
        { responseType: 'stream' },
      );

      // Mengambil stream dari API OpenAI
      const stream = response.data as any as Readable;
      const message = [];
      stream
        .on('data', async (chunk) => {
          try {
            // Mendapatkan hasil dari setiap chunk data yang diterima dari stream
            const decoder = new TextDecoder('utf-8');
            const res = decoder.decode(chunk);
            const parsed =
              JSON.parse(res?.toString()?.trim()?.replace('data: ', '')) ?? {};

            // Mengirim data ke client
            // Menggunakan metode flush() untuk memastikan bahwa respon sudah dikirimkan ke client

            message.push(parsed.choices?.[0]?.delta?.content as string);
          } catch (error) {
            console.log('Skipable error', message.join(''));
            const chatHistory = new this.chatHistoryModel({
              chatId: Math.random().toString(),
              message: message.join(''),
              role: 'user',
            });
            const x = await chatHistory.save();
          }
        })
        // Mengalirkan data dari stream ke respon yang diberikan
        .pipe(res);

      // Mengakhiri respon saat stream berakhir
      stream.on('end', () => {
        res.end();
      });

      // Menangani kesalahan yang terjadi pada stream
      stream.on('error', (error) => {
        console.error(error);
        res.end(
          JSON.stringify({
            error: true,
            message: 'Error generating response.',
          }),
        );
      });
    } catch (error) {
      console.log('error', error);
    }
  }

  async getCompletionStream({
    res,
    prompt,
  }: {
    res: Response;
    prompt: string;
  }) {
    console.log('completion stream');

    // 🚀 Mengirimkan permintaan untuk memproses prompt menggunakan model 'text-davinci-003' dengan menggunakan stream
    const response = await this.openai.createCompletion(
      {
        model: 'text-davinci-003',
        prompt: prompt,
        temperature: 0.9, // 🔥 Mengatur tingkat variasi hasil. Semakin tinggi nilai temperature, semakin banyak variasi hasil yang dihasilkan.
        max_tokens: 2048, // 🧱 Batas jumlah karakter yang dihasilkan
        stream: true, // 🌊 Menggunakan stream untuk mengambil hasil
      },
      { responseType: 'stream' },
    );

    // Mengambil stream dari API OpenAI
    const stream = response.data as any as Readable;
    stream
      .on('data', (chunk) => {
        try {
          // Mendapatkan hasil dari setiap chunk data yang diterima dari stream
          const data =
            JSON.parse(chunk?.toString()?.trim()?.replace('data: ', '')) ?? {};

          // Mengirim data ke client
          // Menggunakan metode flush() untuk memastikan bahwa respon sudah dikirimkan ke client
          (res as any).flush(data.choices?.[0]?.text);
        } catch (error) {
          console.log('Skipable error');
        }
      })
      // Mengalirkan data dari stream ke respon yang diberikan
      .pipe(res);

    // Mengakhiri respon saat stream berakhir
    stream.on('end', () => {
      res.end();
    });

    // Menangani kesalahan yang terjadi pada stream
    stream.on('error', (error) => {
      console.error(error);
      res.end(
        JSON.stringify({
          error: true,
          message: 'Error generating response.',
        }),
      );
    });
  }
}
