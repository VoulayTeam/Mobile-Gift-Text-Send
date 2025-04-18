class AppError extends Error {
    constructor(message, statusCode = 400, errorCode = null) {
        super(message);
        this.statusCode = statusCode;
        this.errorCode = errorCode || `ERR_${statusCode}`;
        this.name = 'AppError';
    }
}

// Error types as constants
const ErrorTypes = {
    VALIDATION: (message) => new AppError(message, 400, 'Bad Request'),
    NOT_FOUND: (message) => new AppError(message || 'Resource not found', 404, 'Not Found'),
    FORBIDDEN: (message) => new AppError(message || 'Operation not allowed', 403, 'Forbidden'),
    CONFLICT: (message) => new AppError(message || 'Resource conflict', 409, 'Conflict'),
    SERVER: (message) => new AppError(message || 'Internal server error', 500, 'Server')
};

// Generic error handler middleware for Express
const errorHandler = (err, req, res, next) => {
    if (err instanceof AppError) {
        return res.status(err.statusCode).json({
            error: err.errorCode,
            message: err.message
        });
    }

    // Fallback for unexpected errors
    console.error(err);
    return res.status(500).json({
        error: 'Unknown',
        message: 'An unexpected error occurred'
    });
}

module.exports = {
    AppError,
    ErrorTypes,
    errorHandler
}