import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as compression from 'compression';
import * as dotenv from 'dotenv';
// import * as config from 'config';

const port = process.env.PORT || 3000;
// require('dotenv').config({ path: `../${process.env.NODE_ENV}.env` });
console.log('env2:', process.env.NEST_OPENAI_API_KEY);
async function bootstrap() {
  dotenv.config(); // Load .env file

  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: '*',
  });
  app.use(compression());
  await app.listen(port);
}
bootstrap();
