import type { Request } from 'express';
import { Readable, Transform } from 'node:stream';
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
    });

    let resolved = false;

    busboy.on('file', (name, stream, info) => {
      const limit = options.fileSizeLimit;
      let bytes = 0;

      const guard = new Transform({
        transform(chunk: Buffer, _enc, cb) {
          bytes += chunk.length;
          if (limit && bytes > limit) {
            stream.resume();
            return cb(
              new DomainException({
                code: DomainExceptionCode.BadRequest,
                message: 'Image is too large (max 3 MB)',
              }),
            );
          }
          cb(null, chunk);
        },
      });

      stream.pipe(guard);

      resolved = true;
      resolve({ stream: guard, filename: info.filename });
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
