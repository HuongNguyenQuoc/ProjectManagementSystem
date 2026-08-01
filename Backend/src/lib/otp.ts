import bcrypt from "bcryptjs";
import { randomInt } from "node:crypto";

export const VERIFICATION_CODE_TTL_MINUTES = 15;

/* Generates a 6-digit verification code (as a string) for use in OTP verification, e.g. "037689". Use crypto.randomInt to generate a random
integer between 0 and 999999, then pad it with leading zeros to ensure it's always 6 digits. */
export const generateVerificationCode = (): string => {
  return String(randomInt(0, 1_000_000)).padStart(6, "0"); /* pads with leading zeros to ensure 6 digits and it will add 
  the digits 0 into header of string if the number is less than 6 digits */
};

// Same hashing scheme as passwords (bcryptjs, 10 rounds) - never store the raw code 
export const hashVerificationCode = async (code: string) => bcrypt.hash(code, 10);

export const compareVerificationCode = async (code: string, hashedCode: string) => bcrypt.compare(code, hashedCode);

