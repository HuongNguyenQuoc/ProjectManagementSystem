import { AppError } from "../errors/appError.js";
import { findUserByEmail } from "../repositories/user.repository.js";

/**
 * The "Add member" screen needs to turn an email into a userId, but the
 * backend has no user directory endpoint. This is the minimal lookup that
 * supports it — no listing, no enumeration beyond an exact email match.
 */
export const lookupUserByEmailService = async (email: string) => {
  if (!email) throw new AppError(400, "Email is required");

  const user = await findUserByEmail(email);
  if (!user) {
    throw new AppError(404, "No user found with this email");
  }

  return {
    id: user.id,
    fullName: user.fullName,
    email: user.email,
  };
};
