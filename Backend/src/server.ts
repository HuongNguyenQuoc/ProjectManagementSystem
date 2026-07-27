import { connectDatabase, disconnectDatabase } from "./lib/prisma.js";
import { PORT } from "../config/env.js";
import app from "./app.js";

const startServer = async () => {
  try {
    await connectDatabase();

    const server = app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });

    process.on("SIGINT", async () => {
      await disconnectDatabase();
      server.close(() => process.exit(0));
    });
  } catch (error) {
    console.error("Error starting server: ", error);
    process.exit(1); // Exit the process with an error code
  }
};

startServer();
