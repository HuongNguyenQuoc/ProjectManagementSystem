import type { GlobalRole } from "../generated/prisma/enums.js";
import { findProjectMember } from "../repositories/project.repository.js";

/**
 * Single source of truth for "does this requester have access to this
 * project" — a global ADMIN always does, regardless of membership.
 */
export const getProjectAccess = async (
  projectId: string,
  requesterId: string,
  requesterRole: GlobalRole = "USER",
) => {
  const isAdmin = requesterRole === "ADMIN";
  const membership = await findProjectMember(projectId, requesterId);
  return {
    membership,
    isMember: isAdmin || Boolean(membership),
    isLeader: isAdmin || membership?.projectRole === "PROJECT_LEADER",
  };
};
