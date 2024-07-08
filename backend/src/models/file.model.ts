export interface FileModel {
  buffer: Buffer;
  size: number;
  fileName: string;
  originalname: string;
  mimetype?: string;
}
