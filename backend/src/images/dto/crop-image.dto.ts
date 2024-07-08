import { IsInt, IsNotEmpty, IsString, IsPositive, Min } from 'class-validator';

export class CropImageDto {
  @IsString()
  @IsNotEmpty()
  key: string;

  @IsInt()
  @Min(0)
  x: number;

  @IsInt()
  @Min(0)
  y: number;

  @IsInt()
  @IsPositive()
  width: number;

  @IsInt()
  @IsPositive()
  height: number;
}
