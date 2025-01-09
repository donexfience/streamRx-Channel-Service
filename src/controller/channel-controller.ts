import { ValidationError } from "./../_lib/utils/errors/validationError";
import { Request, Response } from "express";
import { ChannelService } from "../services/channel-service";

export class ChannelController {
  constructor(private channelService: ChannelService) {}

  async createChannel(req: Request, res: Response) {
    try {
      const channel = await this.channelService.createChannel(req.body);
      res.status(201).json(channel);
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
}
