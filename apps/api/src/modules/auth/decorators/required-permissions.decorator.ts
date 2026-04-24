import { SetMetadata } from '@nestjs/common';
import { PermissionKey } from '@bellona/core';

export const PERMISSIONS_KEY = 'permissions';
export const RequiredPermissions = (...permissions: PermissionKey[]) =>
  SetMetadata(PERMISSIONS_KEY, permissions);
