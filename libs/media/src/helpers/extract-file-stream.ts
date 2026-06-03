import type { Request } from 'express';
import { Readable } from 'node:stream';
import Busboy from 'busboy';
import { DomainException, DomainExceptionCode } from '@app/exceptions';

interface ExtractFileStreamOptions {
  fileSizeLimit?: number;
}

export async function extractFileStream(
  req: Request,
  options: ExtractFileStreamOptions = {},
): Promise<{ stream: Readable; filename: string }> {
  return new Promise((resolve, reject) => {
    const busboy = Busboy({
      headers: req.headers as any,
      limits: { fileSize: options.fileSizeLimit },
    });

    let resolved = false;

    busboy.on('file', (name, stream, info) => {
      stream.on('limit', () => {
        stream.destroy(
          new DomainException({
            code: DomainExceptionCode.BadRequest,
            message: 'Image is too large (max 3 MB)',
          }),
        );
      });

      resolved = true;
      resolve({ stream, filename: info.filename });
    });

    busboy.on('error', (err: any) => {
      reject(err instanceof Error ? err : new Error(String(err)));
    });

    busboy.on('finish', () => {
      if (!resolved) {
        reject(
          new DomainException({
            code: DomainExceptionCode.BadRequest,
            message: 'No file provided in request',
          }),
        );
      }
    });

    req.pipe(busboy);
  });
}
