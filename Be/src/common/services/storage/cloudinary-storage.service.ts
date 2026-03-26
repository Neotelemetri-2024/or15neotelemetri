import { Injectable, Logger } from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary';
import { IStorageService } from './storage.interface';

@Injectable()
export class CloudinaryStorageService implements IStorageService {
  private readonly logger = new Logger(CloudinaryStorageService.name);

  constructor() {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });
  }

  async uploadFile(
    file: Express.Multer.File,
    folder = 'neo-telemetri',
  ): Promise<string> {
    try {
      const isImage = file.mimetype.startsWith('image/');

      // ✅ Untuk raw files: public_id TANPA ekstensi
      // Cloudinary akan append ekstensi otomatis dari filename asli
      const baseName = file.originalname.replace(/\.[^/.]+$/, '');
      const publicId = `${baseName}-${Date.now()}`;

      const result = await cloudinary.uploader.upload(
        `data:${file.mimetype};base64,${file.buffer.toString('base64')}`,
        {
          folder,
          resource_type: isImage ? 'image' : 'raw',
          use_filename: true,
          unique_filename: false,
          public_id: publicId,
          access_mode: 'public',
          type: 'upload',
          // ✅ hapus flags: 'attachment' — ini yang menyebabkan force-download
          // dan kadang conflict dengan akses direct di browser
        },
      );

      this.logger.log(`Uploaded: ${result.secure_url}`);
      return result.secure_url;
    } catch (error) {
      this.logger.error('Cloudinary upload failed', error);
      throw error;
    }
  }

  async deleteFile(fileUrl: string): Promise<void> {
    try {
      // ✅ Parse public_id dengan benar dari URL Cloudinary
      // Format URL: https://res.cloudinary.com/{cloud}/raw/upload/v{ver}/{folder}/{filename.ext}
      const url = new URL(fileUrl);
      const match = url.pathname.match(/\/upload\/(?:v\d+\/)?(.+)$/);

      if (match) {
        const publicId = match[1]; // sudah include ekstensi untuk raw files
        await cloudinary.uploader.destroy(publicId, { resource_type: 'raw' });
        this.logger.log(`Deleted: ${publicId}`);
      }
    } catch (error) {
      this.logger.warn(
        `Failed to delete file from Cloudinary: ${fileUrl}`,
        error,
      );
    }
  }
}
