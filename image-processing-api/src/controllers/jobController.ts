import { NextFunction, Request, Response } from 'express';
import { validateCSVFile } from "../utils"

export class JobController {

  async createNewJobController(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
        const results = await validateCSVFile(req.file);
        if (results.inValidData.length>0) 
          return res.status(422).json({
            success: false,
            status: 422,
            message: 'Validation error',
            errors: results.inValidData,
          });
        
          console.log(results.data)


      return res.status(201).json({ message: 'Job created' });
    } catch (error) {
      next(error);
    }
  }
}
