/**
 * Storage Adapter Interface
 *
 * Allows plugging in different storage backends
 * (S3, Azure Blob, Google Cloud Storage, local filesystem, etc.)
 */

export interface StorageObject {
  key: string;
  size: number;
  contentType?: string;
  lastModified: Date;
  metadata?: Record<string, string>;
}

export interface UploadOptions {
  contentType?: string;
  metadata?: Record<string, string>;
  acl?: 'private' | 'public-read' | 'public-read-write';
  cacheControl?: string;
}

export interface DownloadOptions {
  range?: {
    start: number;
    end: number;
  };
}

export interface ListOptions {
  prefix?: string;
  maxKeys?: number;
  startAfter?: string;
}

export interface SignedUrlOptions {
  expiresIn: number; // seconds
  contentType?: string;
}

export interface IStorageAdapter {
  /**
   * Adapter name/identifier
   */
  readonly name: string;

  /**
   * Upload a file
   */
  upload(
    key: string,
    data: Buffer | ReadableStream | string,
    options?: UploadOptions
  ): Promise<{ key: string; url?: string }>;

  /**
   * Download a file
   */
  download(key: string, options?: DownloadOptions): Promise<Buffer>;

  /**
   * Get a signed URL for temporary access
   */
  getSignedUrl(key: string, options: SignedUrlOptions): Promise<string>;

  /**
   * Delete a file
   */
  delete(key: string): Promise<void>;

  /**
   * Delete multiple files
   */
  deleteBatch(keys: string[]): Promise<void>;

  /**
   * Check if a file exists
   */
  exists(key: string): Promise<boolean>;

  /**
   * Get file metadata
   */
  getMetadata(key: string): Promise<StorageObject>;

  /**
   * List files
   */
  list(options?: ListOptions): Promise<{
    objects: StorageObject[];
    isTruncated: boolean;
    nextStartAfter?: string;
  }>;

  /**
   * Copy a file
   */
  copy(sourceKey: string, destKey: string): Promise<void>;

  /**
   * Get adapter status
   */
  getStatus(): Promise<{
    healthy: boolean;
    message?: string;
  }>;
}

/**
 * Local Filesystem Storage Adapter (for development)
 */
export class LocalStorageAdapter implements IStorageAdapter {
  readonly name = 'local';

  constructor(
    private config: {
      basePath: string;
    }
  ) {}

  async upload(
    key: string,
    data: Buffer | ReadableStream | string,
    options?: UploadOptions
  ): Promise<{ key: string; url?: string }> {
    // TODO: Implement actual file system write
    console.log('[Local Storage] Upload:', key, 'Options:', options);
    return {
      key,
      url: `file://${this.config.basePath}/${key}`,
    };
  }

  async download(key: string, options?: DownloadOptions): Promise<Buffer> {
    // TODO: Implement actual file system read
    console.log('[Local Storage] Download:', key, 'Options:', options);
    return Buffer.from('mock file content');
  }

  async getSignedUrl(key: string, options: SignedUrlOptions): Promise<string> {
    // Local files don't need signed URLs
    return `file://${this.config.basePath}/${key}`;
  }

  async delete(key: string): Promise<void> {
    // TODO: Implement file deletion
    console.log('[Local Storage] Delete:', key);
  }

  async deleteBatch(keys: string[]): Promise<void> {
    await Promise.all(keys.map((k) => this.delete(k)));
  }

  async exists(key: string): Promise<boolean> {
    // TODO: Check file existence
    console.log('[Local Storage] Exists check:', key);
    return false;
  }

  async getMetadata(key: string): Promise<StorageObject> {
    // TODO: Get file stats
    return {
      key,
      size: 0,
      lastModified: new Date(),
    };
  }

  async list(options?: ListOptions): Promise<{
    objects: StorageObject[];
    isTruncated: boolean;
    nextStartAfter?: string;
  }> {
    // TODO: List directory contents
    console.log('[Local Storage] List:', options);
    return {
      objects: [],
      isTruncated: false,
    };
  }

  async copy(sourceKey: string, destKey: string): Promise<void> {
    // TODO: Copy file
    console.log('[Local Storage] Copy:', sourceKey, 'to', destKey);
  }

  async getStatus() {
    return {
      healthy: true,
      message: 'Local storage adapter ready',
    };
  }
}

/**
 * AWS S3 Storage Adapter
 */
export class S3StorageAdapter implements IStorageAdapter {
  readonly name = 's3';

  constructor(
    private config: {
      bucket: string;
      region: string;
      accessKeyId: string;
      secretAccessKey: string;
      endpoint?: string;
    }
  ) {}

  async upload(
    key: string,
    data: Buffer | ReadableStream | string,
    options?: UploadOptions
  ): Promise<{ key: string; url?: string }> {
    // TODO: Implement S3 upload using AWS SDK
    console.log('[S3] Upload:', key, 'Options:', options);
    return {
      key,
      url: `https://${this.config.bucket}.s3.${this.config.region}.amazonaws.com/${key}`,
    };
  }

  async download(key: string, options?: DownloadOptions): Promise<Buffer> {
    // TODO: Implement S3 download
    console.log('[S3] Download:', key, 'Options:', options);
    return Buffer.from('mock S3 content');
  }

  async getSignedUrl(key: string, options: SignedUrlOptions): Promise<string> {
    // TODO: Generate S3 presigned URL
    console.log('[S3] Get signed URL:', key, 'Expires in:', options.expiresIn);
    return `https://${this.config.bucket}.s3.${this.config.region}.amazonaws.com/${key}?signed`;
  }

  async delete(key: string): Promise<void> {
    // TODO: Delete from S3
    console.log('[S3] Delete:', key);
  }

  async deleteBatch(keys: string[]): Promise<void> {
    // TODO: Use S3 batch delete
    console.log('[S3] Delete batch:', keys.length, 'objects');
  }

  async exists(key: string): Promise<boolean> {
    // TODO: HEAD request to check existence
    console.log('[S3] Exists check:', key);
    return false;
  }

  async getMetadata(key: string): Promise<StorageObject> {
    // TODO: Get S3 object metadata
    return {
      key,
      size: 0,
      lastModified: new Date(),
    };
  }

  async list(options?: ListOptions): Promise<{
    objects: StorageObject[];
    isTruncated: boolean;
    nextStartAfter?: string;
  }> {
    // TODO: List S3 objects
    console.log('[S3] List:', options);
    return {
      objects: [],
      isTruncated: false,
    };
  }

  async copy(sourceKey: string, destKey: string): Promise<void> {
    // TODO: S3 copy operation
    console.log('[S3] Copy:', sourceKey, 'to', destKey);
  }

  async getStatus() {
    return {
      healthy: true,
      message: 'S3 adapter ready',
    };
  }
}

/**
 * Azure Blob Storage Adapter
 */
export class AzureBlobStorageAdapter implements IStorageAdapter {
  readonly name = 'azure-blob';

  constructor(
    private config: {
      accountName: string;
      accountKey: string;
      containerName: string;
    }
  ) {}

  async upload(
    key: string,
    data: Buffer | ReadableStream | string,
    options?: UploadOptions
  ): Promise<{ key: string; url?: string }> {
    // TODO: Implement Azure Blob upload
    console.log('[Azure Blob] Upload:', key, 'Options:', options);
    return {
      key,
      url: `https://${this.config.accountName}.blob.core.windows.net/${this.config.containerName}/${key}`,
    };
  }

  async download(key: string, options?: DownloadOptions): Promise<Buffer> {
    // TODO: Implement Azure Blob download
    console.log('[Azure Blob] Download:', key, 'Options:', options);
    return Buffer.from('mock Azure content');
  }

  async getSignedUrl(key: string, options: SignedUrlOptions): Promise<string> {
    // TODO: Generate SAS token
    console.log('[Azure Blob] Get signed URL:', key);
    return `https://${this.config.accountName}.blob.core.windows.net/${this.config.containerName}/${key}?sas`;
  }

  async delete(key: string): Promise<void> {
    console.log('[Azure Blob] Delete:', key);
  }

  async deleteBatch(keys: string[]): Promise<void> {
    await Promise.all(keys.map((k) => this.delete(k)));
  }

  async exists(key: string): Promise<boolean> {
    console.log('[Azure Blob] Exists check:', key);
    return false;
  }

  async getMetadata(key: string): Promise<StorageObject> {
    return {
      key,
      size: 0,
      lastModified: new Date(),
    };
  }

  async list(options?: ListOptions): Promise<{
    objects: StorageObject[];
    isTruncated: boolean;
    nextStartAfter?: string;
  }> {
    console.log('[Azure Blob] List:', options);
    return {
      objects: [],
      isTruncated: false,
    };
  }

  async copy(sourceKey: string, destKey: string): Promise<void> {
    console.log('[Azure Blob] Copy:', sourceKey, 'to', destKey);
  }

  async getStatus() {
    return {
      healthy: true,
      message: 'Azure Blob adapter ready',
    };
  }
}
