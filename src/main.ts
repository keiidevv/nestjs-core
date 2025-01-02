import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['verbose'],
  });

  // class-validator를 사용하기 위해 등록
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // 데코레이터가 없는 속성은 제거 (기본값은 false)
      forbidNonWhitelisted: true, // 데코레이터가 없는 속성이 있으면 요청 자체를 막아 에러가 발생 (기본값은 false)
    }),
  );

  await app.listen(process.env.PORT || 3000);
}
bootstrap();
