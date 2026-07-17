import { Request, Response, NextFunction } from "express";

export function notFoundHandler(req: Request, res: Response): void {
    res.status(404).json({
        success: false,
        error: {
            message: `Route not found ${req.method} ${req.originalUrl}`
        }
    })
}

// global error handler
export function globalErrorHandler(err: Error, req: Request, res: Response, next: NextFunction): void {
    res.status(500).json({
        success: false,
        error: {
            message: `Interval server error`
        }
    });
}