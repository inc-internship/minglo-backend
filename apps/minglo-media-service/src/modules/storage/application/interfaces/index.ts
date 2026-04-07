export interface UploadParams {
  buffer: Buffer;
  mimetype: string;
  publicUserId: string;
}

export interface UploadResult {
  /* file public url */
  url: string;
  /* file path in bucket */
  key: string;
}
