import { Server } from "http";
import app from "./app";
import config from "./config";
import seedUsers from "./app/seedSuperAdmin";

const port = config.port || 5001;

async function main() {
  const server: Server = app.listen(port, async () => {
    console.log(`🚀 Subnix Server running on http://localhost:${port}`);
    await seedUsers();
  });

  const exitHandler = () => {
    if (server) {
      server.close(() => {
        console.info("Server gracefully closed!");
      });
    }
    process.exit(1);
  };

  process.on("uncaughtException", (error) => {
    console.error("Uncaught Exception:", error);
    exitHandler();
  });

  process.on("unhandledRejection", (error) => {
    console.error("Unhandled Rejection:", error);
    exitHandler();
  });
}

main();
