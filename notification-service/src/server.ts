import {
  config,
  connectKafka,
  connectMongoDB,
  disconnectKafka,
  redisClient,
  CustomLogger,
} from "@cash-daddy/shared";
import app from "./app.js";

process.env.KAFKAJS_NO_PARTITIONER_WARNING = "1";

config.validateConfig();

const start = async () => {
  try {
    await connectMongoDB();
    await redisClient.connect();
    await connectKafka();
    app.listen(parseInt(config.PORT!), () => {
      CustomLogger.info(`User microservice listening on port ${config.PORT}`);
    });
  } catch (err) {
    CustomLogger.error("Failed to connect:", err);
  }
};

start();

// Graceful shutdown
process.on("SIGTERM", async () => {
  CustomLogger.info("SIGTERM signal received. Closing HTTP server.");
  await disconnectKafka();
  // Close other connections...
  process.exit(0);
});
