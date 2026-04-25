import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  Res,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AuthGuard } from '@nestjs/passport';
import type { Response } from 'express';

import { AuthService } from './auth.service';
import { DiscordCallbackGuard } from './guards/discord-callback.guard';
import { User } from '@bellona/db';

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
  @UseGuards(DiscordCallbackGuard)
  async discordAuthCallback(@Req() req: { user: User }, @Res() res: Response) {
    const raw = this.configService.getOrThrow<string>('CORS_ORIGIN');
    const frontendUrl = raw.split(',')[0].trim();
    const { accessToken } = await this.authService.login(req.user);

    const code = await this.authService.createAuthCode(accessToken);

    res.redirect(
      `${frontendUrl}/auth/callback?code=${encodeURIComponent(code)}`,
    );
  }

  @Post('exchange')
  async exchange(@Body('code') code: string) {
    const token: string | null = await this.authService.exchangeCode(code);

    if (!token) {
      throw new UnauthorizedException('Invalid or expired code');
    }

    return { token };
  }

  @Get('me')
  @UseGuards(AuthGuard('jwt'))
  getMe(@Req() req: { user: { id: string } }) {
    return this.authService.getSessionData(req.user.id);
  }
}
