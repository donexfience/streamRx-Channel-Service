import cors from "cors";
import express, { Application } from "express";
import { ErrorMiddleware } from "./middlewares/error-middleware";
import morgan from "morgan";
import { Database } from "./config/MongoDB/connection";
import { UserService } from "./services/user-service";
import { UserRepository } from "./repository/userRepository";
import { ChannelServiceConsumer } from "./communication/consumer";
import CommonRoutes from "./router/commonRouter";
import client from "./config/MongoDB/elastic search/elasticSearchConnection";
import { VideoService } from "./services/video-service";
import { VideoRepository } from "./repository/VideoRepository";
import { ChannelRepostiory } from "./repository/ChannelRepository";

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
    this.app.use(
      cors({
        origin: ["http://localhost:3001"],
        methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
        credentials: true,
        allowedHeaders: [
          "Origin",
          "X-Requested-With",
          "Content-Type",
          "Accept",
          "Authorization",
          "accesstoken",
          "refreshtoken",
        ],
        exposedHeaders: ["Authorization"],
      })
    );
    this.app.use(morgan("tiny"));
    this.app.use(express.json());

    this.app.use(express.urlencoded({ extended: true }));
    this.app.use("/", CommonRoutes);
    // this.app.use(ErrorMiddleware.handleError);
  }
  private async initializeServices() {
    await Database.connect();
    await this.initializeElasticsearch();
  }
  public listen() {
    this.app.listen(this.port, () => {
      console.log(`CHANNEL-SERVICE RUNNING ON PORT  ${this.port}`);
    });
  }

  private async initializeElasticsearch() {
    try {
      await client.ping();
      console.log("Connected to Elasticsearch!");
    } catch (err) {
      console.error("Could not connect to Elasticsearch:", err);
    }
  }
  private async startConsuming() {
    try {
      const user_repostiory = new UserRepository();
      const video_repository = new VideoRepository();
      const channel_Repository = new ChannelRepostiory();
      const userService = new UserService(user_repostiory);
      const videoService = new VideoService(
        video_repository,
        channel_Repository
      );
      const channelServiceConsumer = new ChannelServiceConsumer(
        userService,
        videoService
      );
      await channelServiceConsumer.start();
      console.log("[INFO] Started consuming messages from RabbitMQ queues.");
    } catch (error) {
      console.error("[ERROR] Failed to start consuming:", error);
    }
  }
}
export default App;
