import { ICsvData, JobData } from '../constants';

/**
 * Transforms an array of CSV data into an array of JobData objects.
 * @param data - The array of CSV data to be transformed.
 * @returns The transformed array of JobData objects.
 */
export function transformCsvDataToJobData(data: ICsvData[]): JobData[] {
  const transformedData: JobData[] = [];

  data.forEach((r) => {
    const links = r['Input Image Urls'].split(',');
    const product_name = r['Product Name'];

    links.forEach((l) => {
      transformedData.push({
        url: l.trim(),
        metadata: {
          'Product Name': product_name,
        },
      });
    });
  });

  return transformedData;
}
