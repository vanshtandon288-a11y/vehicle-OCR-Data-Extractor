import { IsOptional, IsString } from 'class-validator';

export class UpdateExtractedDataDto {
  @IsOptional()
  @IsString()
  chassisNumber?: string;

  @IsOptional()
  @IsString()
  engineNumber?: string;

  @IsOptional()
  @IsString()
  registrationNumber?: string;

  @IsOptional()
  @IsString()
  insuranceNumber?: string;

  @IsOptional()
  @IsString()
  insuranceExpiryDate?: string;

  @IsOptional()
  @IsString()
  pucNumber?: string;

  @IsOptional()
  @IsString()
  pucExpiryDate?: string;

  @IsOptional()
  @IsString()
  permitNumber?: string;

  @IsOptional()
  @IsString()
  permitExpiryDate?: string;

  @IsOptional()
  @IsString()
  fitnessExpiryDate?: string;
}
