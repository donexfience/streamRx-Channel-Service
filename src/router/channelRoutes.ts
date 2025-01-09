import { Router } from "express";
import { ChannelController } from "../controller/channel-controller";
import { ChannelService } from "../services/channel-service";
import { ChannelRepostiory } from "../repository/ChannelRepository";
import { UserRepository } from "../repository/userRepository";

// Channel routes
export class ChannelRoutes {
  public router: Router;

  constructor() {
    this.router = Router();
    this.initRoutes();
  }

  private initRoutes() {
    const channelRepository = new ChannelRepostiory();
    const userRepository = new UserRepository();
    const channelService = new ChannelService(
      channelRepository,
      userRepository
    );
    const channelController = new ChannelController(channelService);
    this.router.post(
      "/",
      channelController.createChannel.bind(channelController)
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
