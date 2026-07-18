import { connectDatabase } from "../config/database.js";
import { PORT } from "../config/env.js";
import app from "./app.js";

const startServer = async () => {
  try {
    await connectDatabase();

    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Error starting server: ", error);
    process.exit(1); // Exit the process with an error code
  }
};

startServer();
