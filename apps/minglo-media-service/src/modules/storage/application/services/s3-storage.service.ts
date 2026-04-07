import { Injectable } from '@nestjs/common';
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { MediaConfig } from '../../../core/media.config';
import { UploadParams, UploadResult } from '../interfaces';
import { randomUUID } from 'node:crypto';
import { MediaType } from '../../../../../prisma/generated/prisma/enums';

@Injectable()
export class S3StorageService {
  private readonly s3Client: S3Client;
  private readonly bucket: string;
  private readonly endpoint: string;
  private readonly endpointPath: string;

  constructor(private readonly config: MediaConfig) {
    this.bucket = this.config.s3bucketName;
    this.endpoint = this.config.s3endpoint;
    this.endpointPath = this.config.s3endpoint.split('//')[1];

    // Setup S3 client
    this.s3Client = new S3Client({
      region: this.config.s3region,
      endpoint: this.config.s3endpoint,
      credentials: {
        accessKeyId: this.config.s3accessKeyId,
        secretAccessKey: this.config.s3secretKey,
      },
    });
  }

  /* Загружает массив файлов в S3 и возвращает массив объектов с публичными URL и ключами. */
  async upload(params: UploadParams[], type: MediaType): Promise<UploadResult[]> {
    const uploads = params.map(
      async ({ mimetype, publicUserId, buffer }: UploadParams): Promise<UploadResult> => {
        // file extension
        const extension = mimetype.split('/')[1]; // jpeg | png | webp
        // current date for file key in S3
        const currentDate = new Date().toISOString().split('T')[0]; // дата
        // file path in S3 bucket
        const key = `${type.toLowerCase()}s/${publicUserId}/${currentDate}/${randomUUID()}.${extension}`;

        await this.s3Client.send(
          new PutObjectCommand({
            Bucket: this.bucket,
            Key: key,
            Body: buffer,
            ContentType: mimetype,
            ACL: 'public-read',
          }),
        );

        // file public url for clients
        const url = `https://${this.bucket}.${this.endpointPath}/${key}`;
        return { url, key };
      },
    );

    return Promise.all(uploads);
  }
}
