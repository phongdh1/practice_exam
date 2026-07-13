import { Type } from "class-transformer";
import {
  IsEnum,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  MinLength,
  ValidateNested,
} from "class-validator";
import type { HeroChartPreset, HeroSidecardMode } from "@practice-exam/types";

class LandingMetricDto {
  @IsString()
  @MinLength(1)
  @MaxLength(80)
  label!: string;

  @IsString()
  @MinLength(1)
  @MaxLength(120)
  value!: string;
}

class LandingAssetRefDto {
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  assetId!: string;

  @IsString()
  @MinLength(1)
  @MaxLength(2000)
  url!: string;

  @IsString()
  @MinLength(1)
  @MaxLength(500)
  alt!: string;
}

class FocalPointDto {
  @IsNumber()
  @Min(0)
  @Max(1)
  x!: number;

  @IsNumber()
  @Min(0)
  @Max(1)
  y!: number;
}

class HeroBackgroundDto {
  @ValidateNested()
  @Type(() => LandingAssetRefDto)
  asset!: LandingAssetRefDto;

  @IsNumber()
  @Min(0)
  @Max(1)
  overlayOpacity!: number;

  @IsOptional()
  @ValidateNested()
  @Type(() => FocalPointDto)
  focalPoint?: FocalPointDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => LandingAssetRefDto)
  mobileAsset?: LandingAssetRefDto;
}

class HeroSidecardStatsDto {
  @IsEnum(["balanced", "growth", "peak"])
  chartPreset!: HeroChartPreset;

  @ValidateNested({ each: true })
  @Type(() => LandingMetricDto)
  metrics!: [LandingMetricDto, LandingMetricDto];
}

class HeroSidecardDto {
  @IsEnum(["stats", "image", "hybrid"])
  mode!: HeroSidecardMode;

  @IsString()
  @MinLength(1)
  @MaxLength(200)
  cardTitle!: string;

  @IsString()
  @MinLength(1)
  @MaxLength(500)
  illustrationFootnote!: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => HeroSidecardStatsDto)
  stats?: HeroSidecardStatsDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => LandingAssetRefDto)
  image?: LandingAssetRefDto;
}

export class UpdateLandingContentDto {
  @IsString()
  @MinLength(1)
  @MaxLength(120)
  badge!: string;

  @IsString()
  @MinLength(1)
  @MaxLength(300)
  headline!: string;

  @IsString()
  @MinLength(1)
  @MaxLength(5000)
  subheadlineMarkdown!: string;

  @IsString()
  @MinLength(1)
  @MaxLength(120)
  ctaPrimaryLabel!: string;

  @IsString()
  @MinLength(1)
  @MaxLength(120)
  ctaSecondaryLabel!: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  signInPrompt?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => HeroBackgroundDto)
  heroBackground?: HeroBackgroundDto | null;

  @ValidateNested()
  @Type(() => HeroSidecardDto)
  heroSidecard!: HeroSidecardDto;
}
