import { Injectable } from '@nestjs/common';

@Injectable() //IoC Container - Inversion of Control
export class AppService {
  getHello(): string {
    return 'Hello World';
  }
}
