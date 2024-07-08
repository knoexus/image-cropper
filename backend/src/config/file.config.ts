import { config } from 'dotenv';

config();

const FILE_CONFIG: FileConfig = {
  maxFileSize: 10 * 1024 * 1024,
};

export interface FileConfig {
  maxFileSize: number;
}

export default FILE_CONFIG;
