import CSVFileValidator from 'csv-file-validator';
import { NextFunction, Request, Response } from 'express';
import fs from 'fs';

export interface RequestWithCSV extends Request {
  csv: Record<any, any>;
}

/**
 * Middleware factory to validate a CSV file.
 *
 * @param csvValidatorConfig - The configuration for CSV validation.
 * @returns An Express middleware function.
 */
const validateCsvMiddleware = (csvValidatorConfig: any) => {
  return async (req: RequestWithCSV, res: Response, next: NextFunction) => {
    const file = req.file;
    if (!file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }
    if (file.mimetype !== 'text/csv') {
      return res.status(400).json({ message: 'Invalid file type' });
    }
    if (file.size > 1000000) {
      return res.status(400).json({ message: 'File size too large' });
    }

    try {
      // Create readable stream from file
      const stream = fs.createReadStream(file.path);
      const results = await CSVFileValidator(stream, csvValidatorConfig);

      if (results.inValidData.length > 0) {
        return res.status(422).json({
          success: false,
          status: 422,
          message: 'Validation error',
          errors: results.inValidData,
        });
      }

      // Store valid CSV data in the request object
      req.csv = results.data;
      next();
    } catch (error) {
      return next(error);
    }
  };
};

export { validateCsvMiddleware };
