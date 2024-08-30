import { Request, Response, NextFunction } from "express";
import { Result, validationResult, ValidationError } from "express-validator";

const validateRequest = (req: Request, res: Response, next: NextFunction) => {
    const errors: Result<ValidationError> = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({
            success: false,
            status: 422,
            message: "Validation error", 
            errors: errors.array() 
        });
    } else {
        next();
    }
};

export default validateRequest;