import { Injectable } from '@nestjs/common';
import { Configuration, OpenAIApi } from 'openai';
import { Readable } from 'stream';
import { Response } from 'express';
@Injectable()
export class AppService {
  // 🚀 Mendefinisikan konfigurasi untuk koneksi ke API OpenAI
  private configuration = new Configuration({
    apiKey: process.env.NEST_OPENAI_API_KEY, // 🤫 Mengambil API key dari environment variable
  });

  // 🤖 Membuat objek OpenAIApi dengan menggunakan konfigurasi yang telah dibuat
  private openai = new OpenAIApi(this.configuration);

  constructor() {}

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
      throw error;
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
