import { Injectable, NotFoundException } from '@nestjs/common';
import * as sharp from 'sharp';
import {
  DeleteObjectCommand,
  GetObjectCommand,
  ObjectCannedACL,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { v4 as uuidv4 } from 'uuid';
import { FileModel } from '@App/models/file.model';
import { extname } from 'path';
import DO_CONFIG from '@App/config/do.config';
import { Readable } from 'stream';
import { CropImageDto } from './dto/crop-image.dto';

export interface ImageResponse {
  key: string;
  url: string;
}

@Injectable()
export class ImagesService {
  private s3Client: S3Client;

  constructor() {
    const { endpoint, region, forcePathStyle, credentials } = DO_CONFIG;
    this.s3Client = new S3Client({
      endpoint: `https://${endpoint}`,
      region,
      forcePathStyle,
      credentials,
    });
  }

  async uploadImage(file: FileModel): Promise<ImageResponse> {
    const fileContent = file.buffer;
    const Bucket = DO_CONFIG.bucketName;
    const Key = `${DO_CONFIG.bucketUploadDirName}/${uuidv4()}${extname(file.originalname)}`;

    await this.s3Client.send(
      new PutObjectCommand({
        Bucket,
        Key,
        Body: fileContent,
        ACL: ObjectCannedACL.public_read,
        ContentType: file.mimetype,
      }),
    );

    return {
      key: Key,
      url: `https://${DO_CONFIG.bucketName}.${DO_CONFIG.cdnEndpoint}/${Key}`,
    };
  }

  async cropImage(cropImageDto: CropImageDto): Promise<ImageResponse> {
    const getObjectCommand = new GetObjectCommand({
      Bucket: DO_CONFIG.bucketName,
      Key: cropImageDto.key,
    });
    const { Body, ContentType } = await this.s3Client.send(getObjectCommand);
    if (!Body) {
      throw new NotFoundException('Unable to retrieve image from S3');
    }

    const chunks: Buffer[] = [];
    for await (const chunk of Body as Readable) {
      chunks.push(chunk);
    }
    const originalImageBuffer = Buffer.concat(chunks);

    const croppedImageBuffer = await sharp(originalImageBuffer)
      .extract({
        left: cropImageDto.x,
        top: cropImageDto.y,
        width: cropImageDto.width,
        height: cropImageDto.height,
      })
      .toBuffer();

    const croppedKey = `${DO_CONFIG.bucketUploadDirName}/${uuidv4()}.${ContentType.split('/')[1]}`;
    await this.s3Client.send(
      new PutObjectCommand({
        Bucket: DO_CONFIG.bucketName,
        Key: croppedKey,
        Body: croppedImageBuffer,
        ACL: ObjectCannedACL.public_read,
        ContentType,
      }),
    );

    await this.s3Client.send(
      new DeleteObjectCommand({
        Bucket: DO_CONFIG.bucketName,
        Key: cropImageDto.key,
      }),
    );

    return {
      key: croppedKey,
      url: `https://${DO_CONFIG.bucketName}.${DO_CONFIG.cdnEndpoint}/${croppedKey}`,
    };
  }
}
