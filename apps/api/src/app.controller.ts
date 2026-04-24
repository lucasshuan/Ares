import { Controller, Get, Head, HttpCode, HttpStatus } from '@nestjs/common';

@Controller()
export class AppController {
  @Get()
  getRoot() {
    return { status: 'ok' };
  }

  @Head()
  headRoot() {}

  @Get('health')
  getHealth() {
    return { status: 'ok' };
  }

  @Get('favicon.ico')
  @HttpCode(HttpStatus.NO_CONTENT)
  getFavicon() {}
}
