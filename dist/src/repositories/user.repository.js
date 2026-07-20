import { prisma } from "../lib/prisma.js";
export const findUserByEmail = (email) => {
    return prisma.user.findUnique({
        where: { email }
    });
};
export const createUser = (data) => {
    return prisma.user.create({ data });
};
export const findUserById = (id) => {
    return prisma.user.findUnique({
        where: { id }
    });
};
//# sourceMappingURL=user.repository.js.map