import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { RequestMethod } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Se você quiser prefixo API (opcional). Se não quiser, pode remover esse bloco.
  app.setGlobalPrefix('api', {
    exclude: [{ path: 'health', method: RequestMethod.GET }],
  });

  app.enableCors({
    origin: true,
    credentials: true,
  });

  const port = Number(process.env.PORT || 3000);
  await app.listen(port, '0.0.0.0');

  console.log(`BICO API running on http://0.0.0.0:${port}`);
}
bootstrap();