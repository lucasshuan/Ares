import { Controller, Get, Head } from '@nestjs/common';

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
}
