import { InputType, Field, Int, Float } from '@nestjs/graphql';
import { MATCH_FORMATS } from '@ares/core';
import { MatchFormat } from '@prisma/client';
import {
  ArrayNotEmpty,
  IsArray,
  IsBoolean,
  IsIn,
  IsInt,
  IsNumber,
  IsOptional,
  Min,
} from 'class-validator';

@InputType()
export class CreateEloLeagueInput {
  @Field(() => Int)
  @IsInt()
  @Min(0)
  initialElo: number;

  @Field()
  @IsBoolean()
  allowDraw: boolean;

  @Field(() => Int)
  @IsInt()
  @Min(1)
  kFactor: number;

  @Field(() => Float)
  @IsNumber()
  scoreRelevance: number;

  @Field(() => Int)
  @IsInt()
  @Min(0)
  inactivityDecay: number;

  @Field(() => Int)
  @IsInt()
  @Min(1)
  inactivityThresholdHours: number;

  @Field(() => Int)
  @IsInt()
  @Min(0)
  inactivityDecayFloor: number;

  @Field(() => [String])
  @IsArray()
  @ArrayNotEmpty()
  @IsIn(MATCH_FORMATS, { each: true })
  allowedFormats: MatchFormat[];
}

@InputType()
export class UpdateEloLeagueInput {
  @Field(() => Int, { nullable: true })
  @IsInt()
  @IsOptional()
  initialElo?: number;

  @Field({ nullable: true })
  @IsBoolean()
  @IsOptional()
  allowDraw?: boolean;

  @Field(() => Int, { nullable: true })
  @IsInt()
  @IsOptional()
  kFactor?: number;

  @Field(() => Float, { nullable: true })
  @IsNumber()
  @IsOptional()
  scoreRelevance?: number;

  @Field(() => Int, { nullable: true })
  @IsInt()
  @IsOptional()
  inactivityDecay?: number;

  @Field(() => Int, { nullable: true })
  @IsInt()
  @IsOptional()
  inactivityThresholdHours?: number;

  @Field(() => Int, { nullable: true })
  @IsInt()
  @IsOptional()
  inactivityDecayFloor?: number;

  @Field(() => [String], { nullable: true })
  @IsArray()
  @IsOptional()
  @IsIn(MATCH_FORMATS, { each: true })
  allowedFormats?: MatchFormat[];
}
