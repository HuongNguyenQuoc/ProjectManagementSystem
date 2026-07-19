export class AppError extends Error {
    statusCode;
    constructor(message, statusCode) {
        super(message);
        this.statusCode = statusCode;
        this.name = "AppError";
        Error.captureStackTrace(this, this.constructor);
    }
}
//# sourceMappingURL=appError.js.map