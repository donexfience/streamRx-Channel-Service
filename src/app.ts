import express, { Application } from "express";
import { ErrorMiddleware } from "./middlewares/error-middleware";
import morgan from "morgan";
import { Database } from "./config/MongoDB/connection";
import { UserService } from "./services/user-service";
import { UserRepository } from "./repository/userRepository";
import { ChannelServiceConsumer } from "./communication/consumer";

class App {
  public app: Application;
  private port: number;
  constructor(port: number) {
    this.app = express();
    this.port = port;
    this.initializeMiddleware();
    this.initializeServices();
    this.startConsuming();
  }
  private initializeMiddleware() {
    this.app.use(morgan("tiny"));
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));
    this.app.use(ErrorMiddleware.handleError);
  }
  private async initializeServices() {
    await Database.connect();
  }
  public listen() {
    this.app.listen(this.port, () => {
      console.log(`CHANNEL-SERVICE RUNNING ON PORT  ${this.port}`);
    });
  }
  private async startConsuming() {
    try {
      const user_repostiory = new UserRepository();
      const userService = new UserService(user_repostiory);
      const channelServiceConsumer = new ChannelServiceConsumer(userService);
      await channelServiceConsumer.start();
      console.log("[INFO] Started consuming messages from RabbitMQ queues.");
    } catch (error) {
      console.error("[ERROR] Failed to start consuming:", error);
    }
  }
}
export default App;
