import { Request, Response } from "express";
import { ChannelSubscriptionService } from "../services/channel-subscription-service";

export class ChannelSubscriptionController {
  constructor(private service: ChannelSubscriptionService) {}

  subscribe = async (req: Request, res: Response) => {
    try {
      const { userId, channelId } = req.body;
      const result = await this.service.subscribe(userId, channelId);
      res.status(200).json(result);
    } catch (error) {
      res.status(500).json({ error: "Failed to subscribe" });
    }
  };

  unsubscribe = async (req: Request, res: Response) => {
    try {
      const { userId, channelId } = req.body;
      const result = await this.service.unsubscribe(userId, channelId);
      res.status(200).json(result);
    } catch (error) {
      res.status(500).json({ error: "Failed to unsubscribe" });
    }
  };

  getStatus = async (req: Request, res: Response) => {
    try {
      const { userId, channelId } = req.query;
      const result = await this.service.getSubscriptionStatus(
        userId as string,
        channelId as string
      );
      res.status(200).json({ isSubscribed: result });
    } catch (error) {
      res.status(500).json({ error: "Failed to get subscription status" });
    }
  };

  getSubscriberCount = async (req: Request, res: Response) => {
    try {
      const { channelId } = req.params;
      const count = await this.service.getSubscriberCount(channelId);
      res.status(200).json({ count });
    } catch (error) {
      res.status(500).json({ error: "Failed to get subscriber count" });
    }
  };
}
