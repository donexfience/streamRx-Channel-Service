import { Router } from "express";
import { ChannelController } from "../controller/channel-controller";
import { ChannelService } from "../services/channel-service";

// Channel routes
export class ChannelRoutes {
  public router: Router;

  constructor() {
    this.router = Router();
    this.initRoutes();
  }

  private initRoutes() {
    const channelController = new ChannelController(new ChannelService());
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
