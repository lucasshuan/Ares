import { Controller, Get, Req, UseGuards, Res } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import type { Response } from 'express';
import { ConfigService } from '@nestjs/config';
import type { User } from '@ares/db';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private configService: ConfigService,
  ) {}

  @Get('discord')
  @UseGuards(AuthGuard('discord'))
  async discordAuth() {}

  @Get('discord/callback')
  @UseGuards(AuthGuard('discord'))
  discordAuthCallback(@Req() req: { user: User }, @Res() res: Response) {
    const { accessToken } = this.authService.login(req.user);
    const frontendUrl = this.configService.getOrThrow<string>('CORS_ORIGIN');

    // Redireciona de volta para o frontend com o token
    // Em um cenário real, você usaria cookies ou um caminho mais seguro
    res.redirect(`${frontendUrl}/auth/callback?token=${accessToken}`);
  }
}
