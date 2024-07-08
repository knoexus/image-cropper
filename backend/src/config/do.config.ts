import { config } from 'dotenv';

config();

const DO_CONFIG: DOConfig = {
  endpoint: process.env.DO_SPACES_ENDPOINT,
  cdnEndpoint: process.env.DO_SPACES_CDN_ENDPOINT,
  bucketName: process.env.DO_SPACES_BUCKET_NAME,
  bucketUploadDirName: process.env.DO_SPACES_BUCKET_DIRNAME,
  region: process.env.DO_SPACES_REGION,
  forcePathStyle: false,
  credentials: {
    accessKeyId: process.env.DO_SPACES_KEY,
    secretAccessKey: process.env.DO_SPACES_SECRET,
  },
};

export interface DOCredentials {
  accessKeyId: string;
  secretAccessKey: string;
}

export interface DOConfig {
  endpoint: string;
  cdnEndpoint: string;
  bucketName: string;
  bucketUploadDirName: string;
  region: string;
  forcePathStyle: boolean;
  credentials: DOCredentials;
}

export default DO_CONFIG;
