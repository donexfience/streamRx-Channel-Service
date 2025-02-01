import { Router } from "express";
import { ChannelController } from "../controller/channel-controller";
import { ChannelService } from "../services/channel-service";
import { ChannelRepostiory } from "../repository/ChannelRepository";
import { UserRepository } from "../repository/userRepository";
import { RabbitMQConnection } from "streamrx_common";
import { ChannelSubscriptionRepository } from "../repository/ChannelSubscriptionRepository";
import { ChannelSubscriptionService } from "../services/channel-subscription-service";
import { ChannelSubscriptionController } from "../controller/channel-subscription-controller";

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

    const channelSubscriptionRepository = new ChannelSubscriptionRepository();
    const channelSubscriptionService = new ChannelSubscriptionService(
      channelSubscriptionRepository,
      channelRepository
    );
    const channelSubscriptionController = new ChannelSubscriptionController(
      channelSubscriptionService,
      rabbitMQConnection
    );

    this.router.get(
      "/channel/id/:id",
      channelController.getChannelByChannelId.bind(channelController)
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

    this.router.get(
      "getchannel/:id",
      channelController.getChannelById.bind(channelController)
    );

    this.router.delete(
      "/:id",
      channelController.deleteChannel.bind(channelController)
    );
    this.router.post(
      "/subscribe",
      channelSubscriptionController.subscribe.bind(
        channelSubscriptionController
      )
    );
    this.router.post(
      "/unsubscribe",
      channelSubscriptionController.unsubscribe.bind(
        channelSubscriptionController
      )
    );
    this.router.get(
      "/subscribe/status",
      channelSubscriptionController.getStatus.bind(
        channelSubscriptionController
      )
    );
    this.router.get(
      "/subscribe/count/:channelId",
      channelSubscriptionController.getSubscriberCount.bind(
        channelSubscriptionController
      )
    );
  }
}
