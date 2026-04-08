import { Injectable } from '@nestjs/common';
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { MediaConfig } from '../../../core/media.config';
import {
  ImageUploadToS3Params,
  ImageUploadToS3ParamsMany,
  ImageUploadToS3Result,
  ImageUploadToS3ResultMany,
} from '../interfaces';
import { randomUUID } from 'node:crypto';
import { DomainException, DomainExceptionCode } from '@app/exceptions';
import { LoggerService } from '@app/logger';
import pLimit from 'p-limit';

@Injectable()
export class S3StorageService {
  private readonly s3Client: S3Client;
  private readonly bucket: string;
  private readonly endpoint: string;
  private readonly endpointPath: string;

  constructor(
    private readonly config: MediaConfig,
    private readonly logger: LoggerService,
  ) {
    this.logger.setContext(S3StorageService.name);

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

  /**
   * Uploads a single image to S3 and returns its URL and key
   */
  async upload(params: ImageUploadToS3Params): Promise<ImageUploadToS3Result> {
    const {
      file,
      optimizedBuffer: buffer,
      optimizedFileExtension: extension,
      optimizedMimeTypeExtension: mimetype,
      publicUserId,
      type,
    } = params;

    try {
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
      return {
        url,
        key,
      };
    } catch (error) {
      this.logger.error(`Failed to upload image to S3 ${file.filename}`, error);
      throw new DomainException({
        code: DomainExceptionCode.InternalServerError,
        message: 'Image upload failed',
      });
    }
  }

  /**
   * Uploads multiple images to S3 with concurrency limit
   * Returns successful uploads and failed count
   */
  async uploadMany(params: ImageUploadToS3ParamsMany): Promise<ImageUploadToS3ResultMany> {
    const { images, publicUserId, type } = params;

    const limit = pLimit(this.config.s3concurrency); // ограничение на кол-во одновременных запросов

    // Ограничиваем параллельные вызовы
    const tasks = images.map((i) => limit(() => this.upload({ ...i, publicUserId, type })));

    const results = await Promise.allSettled(tasks);

    const successful = results
      .filter((r): r is PromiseFulfilledResult<ImageUploadToS3Result> => r.status === 'fulfilled')
      .map((r) => r.value);

    const failedCount = results.filter((r) => r.status === 'rejected').length;

    if (failedCount > 0) {
      this.logger.warn(
        `Batch images upload to S3: ${successful.length} succeeded, ${failedCount} failed`,
      );
    }

    if (!successful.length) {
      throw new DomainException({
        code: DomainExceptionCode.InternalServerError,
        message: `All images upload failed, total images: ${failedCount} `,
      });
    }

    this.logger.log(
      `Batch images upload to S3: ${successful.length} succeeded, ${failedCount} failed, total images: ${tasks.length}`,
    );

    return {
      images: successful,
      failedCount,
    };
  }
}
