import { InputType, Field, Int } from '@nestjs/graphql';
import { MATCH_FORMATS } from '@ares/core';
import { MatchFormat } from '@prisma/client';
import {
  ArrayNotEmpty,
  IsArray,
  IsBoolean,
  IsIn,
  IsInt,
  IsOptional,
  Min,
} from 'class-validator';

@InputType()
export class CreateStandardLeagueInput {
  @Field()
  @IsBoolean()
  allowDraw: boolean;

  @Field(() => Int)
  @IsInt()
  @Min(0)
  pointsPerWin: number;

  @Field(() => Int)
  @IsInt()
  @Min(0)
  pointsPerDraw: number;

  @Field(() => Int)
  @IsInt()
  @Min(0)
  pointsPerLoss: number;

  @Field(() => [String])
  @IsArray()
  @ArrayNotEmpty()
  @IsIn(MATCH_FORMATS, { each: true })
  allowedFormats: MatchFormat[];
}

@InputType()
export class UpdateStandardLeagueInput {
  @Field({ nullable: true })
  @IsBoolean()
  @IsOptional()
  allowDraw?: boolean;

  @Field(() => Int, { nullable: true })
  @IsInt()
  @IsOptional()
  pointsPerWin?: number;

  @Field(() => Int, { nullable: true })
  @IsInt()
  @IsOptional()
  pointsPerDraw?: number;

  @Field(() => Int, { nullable: true })
  @IsInt()
  @IsOptional()
  pointsPerLoss?: number;

  @Field(() => [String], { nullable: true })
  @IsArray()
  @IsOptional()
  @IsIn(MATCH_FORMATS, { each: true })
  allowedFormats?: MatchFormat[];
}
