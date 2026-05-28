import { DomainException, DomainExceptionCode } from '@app/exceptions';

export type SupportedFileType = 'JPG' | 'PNG' | 'WEBP';

export const getFileTypeFromBuffer = (chunk: Buffer): SupportedFileType => {
  if (!chunk || chunk.length < 12) {
    throw new DomainException({
      code: DomainExceptionCode.BadRequest,
      message: 'File is too small or empty',
    });
  }

  // JPG: FF D8 FF
  if (chunk[0] === 0xff && chunk[1] === 0xd8 && chunk[2] === 0xff) {
    return 'JPG';
  }

  // PNG: 89 50 4E 47 0D 0A 1A 0A
  const pngMagicNumbers = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  if (chunk.subarray(0, 8).equals(pngMagicNumbers)) {
    return 'PNG';
  }

  // WEBP: RIFF .... WEBP
  const isRiff = chunk.toString('ascii', 0, 4) === 'RIFF';
  const isWebp = chunk.toString('ascii', 8, 12) === 'WEBP';
  if (isRiff && isWebp) {
    return 'WEBP';
  }

  throw new DomainException({
    code: DomainExceptionCode.BadRequest,
    message: 'Photo in the wrong format',
  });
};
