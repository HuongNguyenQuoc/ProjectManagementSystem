import jwt from "jsonwebtoken";
import { COOKIE_NAME, JWT_SECRET } from "../../config/env.js";
import { AppError } from "../errors/appError.js";
export const requireAuth = (req, _res, next) => {
    const token = req.cookies?.[COOKIE_NAME];
    if (!token) {
        next(new AppError(401, "Authentication token is missing"));
        return;
    }
    try {
        const payload = jwt.verify(token, JWT_SECRET); // If correct return the payload with userId
        req.userId = payload.userId; // Attach the userId to the request object
        next(); // Proceed to the next middleware or route handler
    }
    catch (err) {
        next(new AppError(401, "Invalid or expired authentication token"));
    }
};
//# sourceMappingURL=requireAuth.js.map