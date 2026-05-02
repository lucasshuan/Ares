import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  CopyObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { randomUUID } from 'crypto';
import { Env } from '../../env';

const ALLOWED_CONTENT_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
]);

const PRESIGNED_URL_EXPIRES_IN = 300; // 5 minutes

@Injectable()
export class StorageService {
  private readonly s3: S3Client;
  private readonly bucket: string;
  private readonly cdnUrl: string;

  constructor(private configService: ConfigService<Env, true>) {
    const region = this.configService.getOrThrow<string>('AWS_S3_REGION');
    const accessKeyId =
      this.configService.getOrThrow<string>('AWS_ACCESS_KEY_ID');
    const secretAccessKey = this.configService.getOrThrow<string>(
      'AWS_SECRET_ACCESS_KEY',
    );
    const bucket = this.configService.getOrThrow<string>('AWS_S3_BUCKET');
    const cdnUrl = this.configService.getOrThrow<string>('AWS_S3_CDN_URL');

    this.s3 = new S3Client({
      region,
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
      requestChecksumCalculation: 'WHEN_REQUIRED',
      responseChecksumValidation: 'WHEN_REQUIRED',
    });
    this.bucket = bucket;
    this.cdnUrl = cdnUrl.replace(/\/$/, '');
  }

  isAllowedContentType(contentType: string): boolean {
    return ALLOWED_CONTENT_TYPES.has(contentType);
  }

  /** Returns true if the path is a temporary upload awaiting confirmation. */
  isTmpPath(path: string): boolean {
    return path.startsWith('tmp/');
  }

  /** Returns the full public URL for a stored path. */
  getPublicUrl(path: string): string {
    return `${this.cdnUrl}/${path}`;
  }

  /**
   * Resolves a stored value (path or legacy full URL) to an S3 key.
   * Returns null for external URLs not owned by this CDN.
   */
  private toKey(pathOrUrl: string): string | null {
    if (pathOrUrl.startsWith('http://') || pathOrUrl.startsWith('https://')) {
      const prefix = `${this.cdnUrl}/`;
      if (pathOrUrl.startsWith(prefix)) {
        return pathOrUrl.slice(prefix.length);
      }
      return null; // external URL, not owned
    }
    return pathOrUrl; // already a path/key
  }

  async getPresignedPutUrl(
    filename: string,
    contentType: string,
  ): Promise<{ uploadUrl: string; path: string }> {
    const ext = filename.split('.').pop() ?? '';
    const key = `tmp/${randomUUID()}${ext ? `.${ext}` : ''}`;

    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: key,
      ContentType: contentType,
    });

    const uploadUrl = await getSignedUrl(this.s3, command, {
      expiresIn: PRESIGNED_URL_EXPIRES_IN,
    });

    return { uploadUrl, path: key };
  }

  /**
   * Copies a file from sourcePath to destPath and deletes the source.
   * Returns the destination path.
   */
  async moveFile(sourcePath: string, destPath: string): Promise<string> {
    await this.s3.send(
      new CopyObjectCommand({
        Bucket: this.bucket,
        CopySource: `${this.bucket}/${sourcePath}`,
        Key: destPath,
      }),
    );
    await this.s3.send(
      new DeleteObjectCommand({ Bucket: this.bucket, Key: sourcePath }),
    );
    return destPath;
  }

  /** Uploads a buffer directly to S3 and returns the stored path (key). */
  async uploadBuffer(
    buffer: Buffer,
    contentType: string,
    path: string,
  ): Promise<string> {
    await this.s3.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: path,
        ContentType: contentType,
        Body: buffer,
      }),
    );

    return path;
  }

  /** Deletes a file by its stored path or a legacy full CDN URL. */
  async deleteFile(pathOrUrl: string | null | undefined): Promise<void> {
    if (!pathOrUrl) return;
    const key = this.toKey(pathOrUrl);
    if (!key) return;
    await this.s3.send(
      new DeleteObjectCommand({ Bucket: this.bucket, Key: key }),
    );
  }
}
