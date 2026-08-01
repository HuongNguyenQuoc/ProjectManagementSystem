import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { AppError } from '../errors/appError.js';
import { JWT_SECRET, EXPIRES_IN } from '../../config/env.js';
import { activeUser, createUser, findUserByEmail, findUserById, setVerificationCode, updateUserStatus } from '../repositories/user.repository.js';
import { compareVerificationCode, generateVerificationCode, hashVerificationCode, VERIFICATION_CODE_TTL_MINUTES } from '../lib/otp.js';
import { sendVerificationEmail } from '../lib/mailer.js';

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
    ...input, password: hashedPassword, status: 'PENDING_VERIFICATION',
  });

  const code = generateVerificationCode();
  const hashedCode = await hashVerificationCode(code);
  const expiresAt = new Date(Date.now() + VERIFICATION_CODE_TTL_MINUTES * 60 * 1000) // 15 minutes from now
  await setVerificationCode(newUser.id, { code: hashedCode, expiresAt });
  await sendVerificationEmail(newUser.email, code);

  const { password, verificationCode, verificationCodeExpiresAt, ...safeUser } = newUser;
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
    if (user.status === 'PENDING_VERIFICATION') {
      throw new AppError(403, 'Please verify your email before signing in');
    }
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

  const { password, verificationCode, verificationCodeExpiresAt, ...safeUser } = user;
  return { user: safeUser, token };
};

// Add a function to verify the email using the verification code
interface VerifyEmailInput {
  email: string;
  code: string;
}

export const verifyEmail = async ({ email, code }: VerifyEmailInput) => {
  const user = await findUserByEmail(email);
  if (!user) { throw new AppError(404, 'User not found'); }

  if (user.status !== 'PENDING_VERIFICATION') { throw new AppError(400, 'User is already verified or not in a verifiable state'); }

  if (!user.verificationCode || !user.verificationCodeExpiresAt || user.verificationCodeExpiresAt < new Date()) { throw new AppError(400, 'Verification code has expired, please request a new one'); }

  const isCodeValid = await compareVerificationCode(code, user.verificationCode);
  if (!isCodeValid) { throw new AppError(400, 'Invalid verification code'); }

  await updateUserStatus(user.id, 'ACTIVE');
  await activeUser(user.id);

  const token = jwt.sign(
    { userId: user.id },
    JWT_SECRET as string,
    { expiresIn: EXPIRES_IN as jwt.SignOptions['expiresIn'] }
  );

  const { password, verificationCode, verificationCodeExpiresAt, ...safeUser } = user;
  return { user: { ...safeUser, status: 'ACTIVE' as const }, token };
}

interface ResendVerificationCodeInput {
  email: string;
}

export const resendVerificationCode = async ({ email }: ResendVerificationCodeInput) => {
  const user = await findUserByEmail(email);
  if (!user) { 
    throw new AppError(404, 'User not found'); 
  }

  if (user.status !== 'PENDING_VERIFICATION') { 
    throw new AppError(400, 'Email is already verified');
  }

  if (user.verificationCodeExpiresAt) {
    const issuedAt = new Date(user.verificationCodeExpiresAt.getTime() - VERIFICATION_CODE_TTL_MINUTES * 60 * 1000);
    const secondsSinceIssued = (Date.now() - issuedAt.getTime()) / 1000;
    if (secondsSinceIssued < 60) {
      throw new AppError(429, 'Please wait before requesting another code');
    }
  }

  const code = generateVerificationCode();
  const hashedCode = await hashVerificationCode(code);
  const expiresAt = new Date(Date.now() + VERIFICATION_CODE_TTL_MINUTES * 60 * 1000); // 15 minutes fron now

  await setVerificationCode(user.id, { code: hashedCode, expiresAt });
  await sendVerificationEmail(user.email, code);
};

/** Backs `GET /api/auth/me` — used by the OAuth callback page to learn who
 * the httpOnly session cookie now authenticates as (the redirect response
 * itself has nowhere to put the user JSON). */
export const getCurrentUser = async (userId: string) => {
  const user = await findUserById(userId);
  if (!user) {
    throw new AppError(401, 'User not found');
  }

  const { password, verificationCode, verificationCodeExpiresAt, ...safeUser } = user;
  return safeUser;
};