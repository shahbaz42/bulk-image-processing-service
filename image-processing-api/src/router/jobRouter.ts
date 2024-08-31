import express from 'express';
import { JobController } from '../controllers';
import { validateRequest } from '../utils';
import { body, query } from 'express-validator';
import { upload } from "../config"
import { validateCsvMiddleware } from '../midddleware';
import { csvValidatorConfig } from '../config';

const router = express.Router();
const jobController = new JobController();

router.get(
  '/',
  [query('job_id').isString().notEmpty().withMessage('job_id is required')],
  validateRequest,
  jobController.fetchJobStatus
);

router.post(
  '/',
  upload.single('file'),
  [body('webhook').optional().isURL().withMessage('Invalid URL')],
  validateRequest,
  validateCsvMiddleware(csvValidatorConfig),
  jobController.createNewJobController
);

export default router;