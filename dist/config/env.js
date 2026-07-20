import { config } from 'dotenv';
config({
    path: `.env.${process.env.NODE_ENV || 'development'}.local`,
});
export const { PORT, DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASSWORD, NODE_ENV, JWT_SECRET, EXPIRES_IN, COOKIE_NAME } = process.env;
//# sourceMappingURL=env.js.map