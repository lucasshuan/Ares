import { Global, Module } from '@nestjs/common';
import { DataLoaderService } from './dataloaders/dataloader.service';
import { JsonScalar } from './scalars/json.scalar';

@Global()
@Module({
  providers: [DataLoaderService, JsonScalar],
  exports: [DataLoaderService, JsonScalar],
})
export class CommonModule {}
