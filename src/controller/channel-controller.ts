import { ValidationError } from "./../_lib/utils/errors/validationError";
import { Request, Response } from "express";
import { ChannelService } from "../services/channel-service";
import { RabbitMQConnection, RabbitMQProducer } from "streamrx_common";

export class ChannelController {
  private rabbitMQProducer: RabbitMQProducer;
  constructor(
    private channelService: ChannelService,

    private readonly rabbitMQConnection: RabbitMQConnection
  ) {
    this.rabbitMQProducer = new RabbitMQProducer(this.rabbitMQConnection);
  }

  async createChannel(req: Request, res: Response) {
    try {
      const channel = await this.channelService.createChannel(req.body);
      console.log(channel, "channel data in the contorller");
      try {
        const exchangeName = "channel-created";
        await this.rabbitMQProducer.publishToExchange(exchangeName, "", {
          ...channel,
          event: "channel-created",
          timestamp: new Date().toISOString(),
        });

        console.log("[INFO] Successfully published channel creation event");
      } catch (mqError) {
        console.error(
          "[ERROR] Failed to publish channel creation event:",
          mqError
        );
      }
      res.status(201).json({ success: true, data: channel });
    } catch (error) {
      console.log(error, "error of channel creation in controller");
      if (error instanceof ValidationError) {
        res.status(400).json({ error: error.message });
      } else {
        res.status(500).json({ error: "Internal server error" });
      }
    }
  }

  async editChannel(req: Request, res: Response) {
    try {
      const channel = await this.channelService.editChannel(
        req.params.id,
        req.body
      );
      res.json(channel);
    } catch (error) {
      if (error instanceof ValidationError) {
        res.status(400).json({ error: error.message });
      } else {
        res.status(500).json({ error: "Internal server error" });
      }
    }
  }

  async deleteChannel(req: Request, res: Response) {
    try {
      await this.channelService.deleteChannel(req.params.id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Internal server error" });
    }
  }
  async getChannelByEmail(req: Request, res: Response) {
    try {
      const channel = await this.channelService.getChannelByEmail(
        req.params.email
      );
      res.json(channel);
    } catch (error) {
      console.error(error, "error of get channel by email in controller");
      res.status(500).json({ error: "Internal server error" });
    }
  }

  async getChannelById(req: Request, res: Response) {
    try {
      console.log(req.params, "emmail");
      const channel = await this.channelService.getChannelById(req.params.id);
      res.json(channel);
    } catch (error) {
      console.error(error, "error of get channel by email in controller");
      res.status(500).json({ error: "Internal server error" });
    }
  }
  async getChannelByChannelId(req: Request, res: Response) {
    try {
      console.log(req.params, "channelId");
      const channel = await this.channelService.getChannelById(req.params.id);
      res.json(channel);
    } catch (error) {
      console.error(error, "error of get channel by email in controller");
      res.status(500).json({ error: "Internal server error" });
    }
  }
  
}
