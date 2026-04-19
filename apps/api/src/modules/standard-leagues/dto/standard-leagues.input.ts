import { InputType, Field, Int } from '@nestjs/graphql';
import { MATCH_FORMATS } from '@ares/core';
import { MatchFormat } from '@prisma/client';
import {
  ArrayNotEmpty,
  IsArray,
  IsString,
  IsOptional,
  IsInt,
  IsBoolean,
  IsDate,
  IsIn,
  Min,
} from 'class-validator';

@InputType()
export class CreateStandardLeagueInput {
  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  gameId?: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  gameName?: string;

  @Field()
  @IsString()
  name: string;

  @Field()
  @IsString()
  slug: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  description?: string;

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

  @Field({ nullable: true })
  @IsDate()
  @IsOptional()
  startDate?: Date;

  @Field({ nullable: true })
  @IsDate()
  @IsOptional()
  endDate?: Date;

  @Field()
  @IsString()
  authorId: string;
}

@InputType()
export class UpdateStandardLeagueInput {
  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  name?: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  slug?: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  description?: string;

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
