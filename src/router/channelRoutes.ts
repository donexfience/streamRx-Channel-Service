import { Router } from "express";
import { ChannelController } from "../controller/channel-controller";
import { ChannelService } from "../services/channel-service";
import { ChannelRepostiory } from "../repository/ChannelRepository";
import { UserRepository } from "../repository/userRepository";
import { RabbitMQConnection } from "streamrx_common";

// Channel routes
export class ChannelRoutes {
  public router: Router;

  constructor() {
    this.router = Router();
    this.initRoutes();
  }

  private async initRoutes() {
    const channelRepository = new ChannelRepostiory();
    const userRepository = new UserRepository();
    const channelService = new ChannelService(
      channelRepository,
      userRepository
    );
    const rabbitMQConnection = RabbitMQConnection.getInstance();
    await rabbitMQConnection.connect(
      process.env.RABBITMQ_URL || "amqp://localhost"
    );

    const channelController = new ChannelController(
      channelService,
      rabbitMQConnection
    );
    this.router.post(
      "/",
      channelController.createChannel.bind(channelController)
    );
    this.router.get(
      "/:email",
      channelController.getChannelByEmail.bind(channelController)
    );
    this.router.put(
      "/:id",
      channelController.editChannel.bind(channelController)
    );
    this.router.delete(
      "/:id",
      channelController.deleteChannel.bind(channelController)
    );
  }
}
