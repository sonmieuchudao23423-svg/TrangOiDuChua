import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
  });
  console.log('☁️ [Cloudinary] Đã kết nối Cloudinary Storage thành công: ' + process.env.CLOUDINARY_CLOUD_NAME);
}

const UPLOAD_BASE_DIR = path.resolve(process.env.UPLOAD_DIR || './uploads');
const ARTWORKS_DIR = path.join(UPLOAD_BASE_DIR, 'artworks');
const THUMBNAILS_DIR = path.join(UPLOAD_BASE_DIR, 'thumbnails');

// Ensure directories exist for local backup
[UPLOAD_BASE_DIR, ARTWORKS_DIR, THUMBNAILS_DIR].forEach((dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

export interface ProcessedImages {
  imageUrl: string;
  thumbnailUrl: string;
}

export class ImageService {
  /**
   * Helper to upload buffer to Cloudinary
   */
  private static async uploadBufferToCloudinary(
    buffer: Buffer,
    folder: string,
    publicId: string,
    format = 'png'
  ): Promise<string> {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: `bay_tien_sa_trung_thu_2026/${folder}`,
          public_id: publicId,
          format,
          resource_type: 'image',
        },
        (error, result) => {
          if (error || !result) {
            return reject(error || new Error('Không nhận được phản hồi từ Cloudinary'));
          }
          resolve(result.secure_url);
        }
      );
      uploadStream.end(buffer);
    });
  }

  /**
   * Process and save artwork from Base64 Data URL (e.g. from HTML5 Canvas)
   */
  static async saveArtworkFromBase64(base64Data: string): Promise<ProcessedImages> {
    // Validate and strip prefix if present
    const matches = base64Data.match(/^data:image\/(png|jpeg|webp);base64,(.+)$/);
    const dataString = matches ? matches[2] : base64Data;
    const buffer = Buffer.from(dataString, 'base64');

    if (buffer.length > 10 * 1024 * 1024) {
      throw new Error('Ảnh vượt quá kích thước cho phép (tối đa 10MB)');
    }

    return this.processAndSaveBuffer(buffer);
  }

  /**
   * Process and save artwork from buffer (Uploads to Cloudinary with local backup)
   */
  static async processAndSaveBuffer(buffer: Buffer): Promise<ProcessedImages> {
    const fileId = crypto.randomUUID();
    const artworkFilename = `${fileId}.png`;
    const thumbnailFilename = `${fileId}_thumb.webp`;

    const artworkPath = path.join(ARTWORKS_DIR, artworkFilename);
    const thumbnailPath = path.join(THUMBNAILS_DIR, thumbnailFilename);

    // 1. Process full artwork (800x800 PNG with sharp)
    const artworkBuffer = await sharp(buffer)
      .resize(800, 800, { fit: 'cover' })
      .png({ quality: 95, compressionLevel: 7 })
      .toBuffer();

    // 2. Process high-clarity thumbnail (400x400 WebP)
    const thumbnailBuffer = await sharp(buffer)
      .resize(400, 400, { fit: 'cover' })
      .webp({ quality: 90 })
      .toBuffer();

    // 3. Save local backup copies
    await Promise.all([
      fs.promises.writeFile(artworkPath, artworkBuffer),
      fs.promises.writeFile(thumbnailPath, thumbnailBuffer),
    ]);

    // 4. If Cloudinary is configured, upload to Cloud Storage for global CDN
    if (
      process.env.CLOUDINARY_CLOUD_NAME &&
      process.env.CLOUDINARY_API_KEY &&
      process.env.CLOUDINARY_API_SECRET
    ) {
      try {
        const [cloudArtworkUrl, cloudThumbUrl] = await Promise.all([
          this.uploadBufferToCloudinary(artworkBuffer, 'artworks', fileId, 'png'),
          this.uploadBufferToCloudinary(thumbnailBuffer, 'thumbnails', `${fileId}_thumb`, 'webp'),
        ]);

        console.log(`✨ [Cloudinary] Đã lưu ảnh lên Cloudinary CDN: ${cloudArtworkUrl}`);
        return {
          imageUrl: cloudArtworkUrl,
          thumbnailUrl: cloudThumbUrl,
        };
      } catch (cloudErr) {
        console.error('⚠️ [Cloudinary] Lỗi upload Cloudinary, chuyển sang dùng local backup:', cloudErr);
      }
    }

    // Fallback to local server path
    return {
      imageUrl: `/uploads/artworks/${artworkFilename}`,
      thumbnailUrl: `/uploads/thumbnails/${thumbnailFilename}`,
    };
  }

  /**
   * Generate an image from raw SVG string (useful for seed data)
   */
  static async saveArtworkFromSvg(svgString: string): Promise<ProcessedImages> {
    const buffer = Buffer.from(svgString);
    return this.processAndSaveBuffer(buffer);
  }
}
