import { Request, Response } from "express";
import { ChannelSubscriptionService } from "../services/channel-subscription-service";
import { RabbitMQConnection, RabbitMQProducer } from "streamrx_common";

export class ChannelSubscriptionController {
  private rabbitMQProducer: RabbitMQProducer;
  constructor(
    private service: ChannelSubscriptionService,
    private readonly rabbitMQConnection: RabbitMQConnection
  ) {
    this.rabbitMQProducer = new RabbitMQProducer(this.rabbitMQConnection);
  }

  subscribe = async (req: Request, res: Response) => {
    try {
      const { userId, channelId } = req.body;

      const result = await this.service.subscribe(userId, channelId);
      await this.rabbitMQProducer.publishToExchange(
        "subscription-created",
        "",
        { userId: userId, channelId: channelId }
      );
      res.status(200).json(result);
    } catch (error) {
      res.status(500).json({ error: "Failed to subscribe" });
    }
  };

  unsubscribe = async (req: Request, res: Response) => {
    try {
      const { userId, channelId } = req.body;
      const result = await this.service.unsubscribe(userId, channelId);
      await this.rabbitMQProducer.publishToExchange(
        "subscription-deleted",
        "",
        { userId: userId, channelId: channelId }
      );
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
