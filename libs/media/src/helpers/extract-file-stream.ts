import type { Request } from 'express';
import { Readable } from 'node:stream';
import Busboy from 'busboy';
import { DomainException, DomainExceptionCode } from '@app/exceptions';

export async function extractFileStream(
  req: Request,
): Promise<{ stream: Readable; filename: string }> {
  return new Promise((resolve, reject) => {
    const busboy = Busboy({ headers: req.headers as any });

    busboy.on('file', (name, stream, info) => {
      resolve({ stream, filename: info.filename });
    });

    busboy.on('error', (err: any) => {
      reject(err instanceof Error ? err : new Error(err));
    });

    busboy.on('finish', () => {
      reject(
        new DomainException({
          code: DomainExceptionCode.BadRequest,
          message: 'No file provided in request',
        }),
      );
    });

    req.pipe(busboy);
  });
}
