import {
  Body,
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { ImagesService } from './images.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { FileModel } from '@App/models/file.model';
import { CropImageDto } from './dto/crop-image.dto';
import FILE_CONFIG from '@App/config/file.config';

export const multerOptions = {
  limits: {
    fileSize: FILE_CONFIG.maxFileSize,
  },
};

@Controller('images')
export class ImagesController {
  constructor(private readonly imagesService: ImagesService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file', multerOptions))
  async uploadImage(@UploadedFile() file: FileModel) {
    return this.imagesService.uploadImage(file);
  }

  @Post('crop')
  async cropFile(@Body() cropImageDto: CropImageDto) {
    return this.imagesService.cropImage(cropImageDto);
  }
}
