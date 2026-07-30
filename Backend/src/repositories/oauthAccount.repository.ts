import { prisma } from "../lib/prisma.js";
import type { Prisma } from "../generated/prisma/client.js";
import type { OAuthProvider } from "../generated/prisma/enums.js";

type DbClient = typeof prisma | Prisma.TransactionClient;

export const findOAuthAccount = (
  provider: OAuthProvider,
  providerAccountId: string,
  client: DbClient = prisma,
) => {
  return client.oAuthAccount.findUnique({
    where: { provider_providerAccountId: { provider, providerAccountId } },
    include: { user: true },
  });
};

export const createOAuthAccount = (
  data: Prisma.OAuthAccountUncheckedCreateInput,
  client: DbClient = prisma,
) => {
  return client.oAuthAccount.create({ data });
};
