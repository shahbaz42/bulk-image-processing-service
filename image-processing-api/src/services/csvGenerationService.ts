import { ResultJobData } from '../constants';
import axios from 'axios';
import Papa from 'papaparse';
import { S3BucketService } from './s3BucketService';
import { S3_BUCKET_URL } from '../config';

export class CsvGenerationService {
  /**
   * Maps product names to their corresponding URLs.
   *
   * @param data - An array of ResultJobData objects.
   * @returns A Map object where each key is a product name and the corresponding value is an array of URLs.
   */
  private static productNameUrlMap(
    data: ResultJobData[]
  ): Map<string, string[]> {
    const productNameUrlMap = new Map<string, string[]>();

    data.forEach((result) => {
      const productName = result.value.metadata['Product Name'] as string;
      const url = result.value.url;

      if (!productNameUrlMap.has(productName)) {
        productNameUrlMap.set(productName, []);
      } else {
        productNameUrlMap.get(productName)?.push(url);
      }
    });
    return productNameUrlMap;
  }

  /**
   * Downloads a CSV file from the specified URL.
   *
   * @param url - The URL of the CSV file to download.
   * @returns A Promise that resolves to a Buffer containing the downloaded CSV file data.
   */
  private static async downloadCsvFile(url: string): Promise<Buffer> {
    const response = await axios.get(url, {
      responseType: 'arraybuffer',
    });
    return response.data;
  }

  /**
   * Generates a new CSV file with updated data based on the original CSV file and a map of product names to URLs.
   * @param originalCsvFile - The original CSV file as a Buffer.
   * @param productNameUrlMap - A map of product names to arrays of URLs.
   * @returns A Promise that resolves to the updated CSV file as a string.
   */
  private static async generateNewCsvFile(
    originalCsvFile: Buffer,
    productNameUrlMap: Map<string, string[]>
  ): Promise<string> {
    const originalCsvFileData = Papa.parse(originalCsvFile.toString(), {
      header: true,
    });

    const updatedData = originalCsvFileData.data.map((row: any, index) => {
      row['Output Image Urls'] = productNameUrlMap
        .get(row['Product Name'])
        ?.join(',');
      return row;
    });

    const updatedCsv = Papa.unparse(updatedData, {
      header: true,
    });

    return updatedCsv;
  }

  /**
   * Uploads a CSV file to the S3 bucket.
   *
   * @param updatedCsv - The updated CSV content as a string.
   * @param key - The key or filename for the uploaded file.
   * @returns A Promise that resolves to the URL of the uploaded file.
   */
  private static async uploadCsvFile(
    updatedCsv: string,
    key: string
  ): Promise<string> {
    const s3BucketService = new S3BucketService();
    await s3BucketService.uploadFile(Buffer.from(updatedCsv), key);
    return `${S3_BUCKET_URL}${key}`;
  }

  /**
   * Updates the CSV file name by appending "-resized" to the original file name.
   *
   * @param originalCsvUrl - The URL of the original CSV file.
   * @returns The updated CSV file name.
   */
  private static generateUpdatedCsvKey(originalCsvUrl: string): string {
    const nameWithoutExtention = originalCsvUrl.split('.csv')[0];
    const name = nameWithoutExtention.replace(S3_BUCKET_URL, '');
    return `${name}-resized.csv`;
  }

  /**
   * Generates a CSV file URL based on the provided data and source CSV URL.
   * @param data - An array of ResultJobData objects.
   * @param sourceCsvUrl - The URL of the source CSV file.
   * @returns A Promise that resolves to the URL of the generated CSV file.
   */
  static async generateCsvUrl(
    data: ResultJobData[],
    sourceCsvUrl: string
  ): Promise<string> {
    const productNameUrlMap = this.productNameUrlMap(data);
    const originalCsvFileBuffer = await this.downloadCsvFile(sourceCsvUrl);
    const updatedCsv = await this.generateNewCsvFile(
      originalCsvFileBuffer,
      productNameUrlMap
    );
    const updatedCsvKey = this.generateUpdatedCsvKey(sourceCsvUrl);
    const uploadedCsvUrl = await this.uploadCsvFile(updatedCsv, updatedCsvKey);
    return uploadedCsvUrl;
  }
}
