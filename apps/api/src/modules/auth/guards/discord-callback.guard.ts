import { ExecutionContext, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AuthGuard } from '@nestjs/passport';
import type { Request, Response } from 'express';

/**
 * Extends the Discord Passport guard to gracefully handle the case where the
 * user cancels the OAuth flow (Discord sends `?error=access_denied`).
 * Instead of propagating a 401, we redirect them back to the frontend with a
 * `?error=Cancelled` query parameter so the UI can show a friendly toast.
 */
@Injectable()
export class DiscordCallbackGuard extends AuthGuard('discord') {
  constructor(private configService: ConfigService) {
    super();
  }

  canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest<Request>();

    if (request.query['error']) {
      const frontendUrl = this.configService.getOrThrow<string>('FRONTEND_URL');
      const response = context.switchToHttp().getResponse<Response>();
      response.redirect(`${frontendUrl}/?error=Cancelled`);
      return false;
    }

    return super.canActivate(context);
  }
}
