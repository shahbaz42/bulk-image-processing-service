import CSVFileValidator from 'csv-file-validator';
import fs from 'fs';
import isURL from 'validator/lib/isURL';

/**
 * Validates a CSV file.
 * 
 * @param file - The CSV file to validate.
 * @returns A promise that resolves to the validation results.
 * @throws {Error} If no file is uploaded, the file type is invalid, or the file size is too large.
 */
const validateCSVFile = async (file: Express.Multer.File) => {
  if (!file) {
    throw new Error('No file uploaded');
  }
  if (file.mimetype !== 'text/csv') {
    throw new Error('Invalid file type');
  }
  if (file.size > 1000000) {
    throw new Error('File size too large');
  }

  const config = {
    headers: [
      {
        name: 'S. No.',
        inputName: 'S. No.',
        required: true,
        unique: true,
        requiredError: function (
          headerName: any,
          rowNumber: any,
          columnNumber: any
        ) {
          return `${headerName} is required in the ${rowNumber} row / ${columnNumber} column`;
        },
        uniqueError: function (headerName: any, rowNumber: any) {
          return `${headerName} is not unique in the ${rowNumber} row`;
        },
      },
      {
        name: 'Product Name',
        inputName: 'Product Name',
        required: true,
        unique: true,
        requiredError: function (
          headerName: any,
          rowNumber: any,
          columnNumber: any
        ) {
          return `${headerName} is required in the ${rowNumber} row / ${columnNumber} column`;
        },
        uniqueError: function (headerName: any, rowNumber: any) {
          return `${headerName} is not unique in the ${rowNumber} row`;
        },
      },
      {
        name: 'Input Image Urls',
        inputName: 'Input Image Urls',
        validate: function (v: string) {
          const urls = v.split(',');

          return urls.every((url: string) => {
            if(isURL(url.trim())) {
              return true;
            } else {
                console.log('Invalid URL:', url);
                return false;
            }
        });
        },
        validateError: function (
          headerName: any,
          rowNumber: any,
          columnNumber: any
        ) {
          return `${headerName} is not valid in the row: ${rowNumber}, column:${columnNumber}`;
        },
      },
    ],
  };

  // create readable stream from file
  const stream = fs.createReadStream(file.path);
  const results = await CSVFileValidator(stream, config);
  return results;
};

export default validateCSVFile;
