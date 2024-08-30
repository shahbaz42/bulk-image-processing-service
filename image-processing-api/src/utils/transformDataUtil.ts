import { ICsvData } from "../midddleware"
import { JobData } from "../queues"

export function transformCsvDataToJobData (data: ICsvData[]): JobData[] {
    const transformedData: JobData[] = []

    data.forEach(r => {
      const links = r['Input Image Urls'].split(',')
      const product_name = r['Product Name']

      links.forEach(l => {
        transformedData.push({
          url: l.trim(),
          metadata: {
            'Product Name': product_name
          }
        })
      })
    })

    return transformedData;
  }