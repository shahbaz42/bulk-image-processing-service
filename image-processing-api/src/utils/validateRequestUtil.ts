import { Request, Response, NextFunction } from "express";
import { Result, validationResult, ValidationError } from "express-validator";

/**
 * Validates the request using the express-validator library.
 * If there are validation errors, it sends a JSON response with the error details.
 * Otherwise, it calls the next middleware function.
 *
 * @param req - The Express request object.
 * @param res - The Express response object.
 * @param next - The next middleware function.
 */
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