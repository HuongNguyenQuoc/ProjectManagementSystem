import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { AppError } from '../errors/appError.js';
import { JWT_SECRET, EXPIRES_IN } from '../../config/env.js';
import { createUser, findUserByEmail } from '../repositories/user.repository.js';
export const registerUser = async (input) => {
    if (!input.fullName || !input.email || !input.password) {
        throw new AppError(400, 'Full name, email and password are required');
    }
    const existingUser = await findUserByEmail(input.email);
    if (existingUser) {
        throw new AppError(400, 'Email already exists');
    }
    const hashedPassword = await bcrypt.hash(input.password, 10);
    const newUser = await createUser({
        ...input, password: hashedPassword
    });
    const { password, ...safeUser } = newUser;
    return safeUser;
};
export const loginUser = async (input) => {
    if (!input.email || !input.password) {
        throw new AppError(400, 'Email and password are required');
    }
    const user = await findUserByEmail(input.email);
    if (!user) {
        throw new AppError(401, 'Invalid email or password');
    }
    if (user.status !== 'ACTIVE') {
        throw new AppError(403, 'User account is not active');
    }
    const isPasswordValid = await bcrypt.compare(input.password, user.password);
    if (!isPasswordValid) {
        throw new AppError(401, 'Invalid email or password');
    }
    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: EXPIRES_IN });
    const { password, ...safeUser } = user;
    return { user: safeUser, token };
};
//# sourceMappingURL=auth.service.js.map