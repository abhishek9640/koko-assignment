import { Request, Response, NextFunction } from 'express';

export const errorHandler = (
    err: Error,
    req: Request,
    res: Response,
    next: NextFunction
): void => {
    console.error('Error:', err.message);
    console.error('Stack:', err.stack);

    res.status(500).json({
        error: 'Internal server error',
        message: process.env.NODE_ENV === 'development' ? err.message : undefined,
    });
};

export const notFoundHandler = (req: Request, res: Response): void => {
    res.status(404).json({
        error: 'Not found',
        path: req.originalUrl,
    });
};
