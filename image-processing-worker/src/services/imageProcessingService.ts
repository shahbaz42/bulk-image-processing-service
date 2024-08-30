import axios from 'axios';
import sharp from 'sharp';

/**
 * ImageProcessingService handles image processing operations.
 * like downloading and reducing the quality of an image.
 */
export class ImageProcessingService {
  constructor() {}

  /**
   * Downloads an image from the specified URL and returns it as a Buffer.
   *
   * @param url - The URL of the image to download.
   * @returns A Promise that resolves to a Buffer containing the downloaded image.
   * @throws If an error occurs during the download process.
   */
  async downloadImage(url: string): Promise<Buffer> {
    try {
      const response = await axios.get(url, {
        responseType: 'arraybuffer',
      });
      return Buffer.from(response.data);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Reduces the quality of an image.
   *
   * @param image - The image to be processed as a Buffer.
   * @param quality - The desired quality of the image (0-100).
   * @returns A Promise that resolves to the processed image as a Buffer.
   * @throws If an error occurs during the image processing.
   */
  async reduceQuality(image: Buffer, quality: number): Promise<Buffer> {
    try {
      const response = await sharp(image).jpeg({ quality }).toBuffer();
      return response;
    } catch (error) {
      throw error;
    }
  }
}
