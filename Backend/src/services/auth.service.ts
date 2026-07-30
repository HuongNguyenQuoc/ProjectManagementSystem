import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { AppError } from '../errors/appError.js';
import { JWT_SECRET, EXPIRES_IN } from '../../config/env.js';
import { createUser, findUserByEmail, findUserById } from '../repositories/user.repository.js';

interface RegisterInput {
  fullName: string;
  email: string;
  password: string;
}

interface LoginInput {
  email: string;
  password: string;
}

export const registerUser = async (input: RegisterInput)=> {
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
}

export const loginUser = async (input: LoginInput) => {
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

  if (!user.password) {
    throw new AppError(401, 'This account has no password set. Sign in with Google, Facebook, or Apple instead.');
  }

  const isPasswordValid = await bcrypt.compare(input.password, user.password);

  if (!isPasswordValid) {
    throw new AppError(401, 'Invalid email or password');
  }

  const token = jwt.sign(
    { userId: user.id },
    JWT_SECRET as string,
    { expiresIn: EXPIRES_IN as jwt.SignOptions['expiresIn'] }
  );

  const { password, ...safeUser } = user;
  return { user: safeUser, token };
};

/** Backs `GET /api/auth/me` — used by the OAuth callback page to learn who
 * the httpOnly session cookie now authenticates as (the redirect response
 * itself has nowhere to put the user JSON). */
export const getCurrentUser = async (userId: string) => {
  const user = await findUserById(userId);
  if (!user) {
    throw new AppError(401, 'User not found');
  }

  const { password, ...safeUser } = user;
  return safeUser;
};