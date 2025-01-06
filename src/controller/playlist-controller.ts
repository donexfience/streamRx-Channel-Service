import { ValidationError } from "../_lib/utils/errors/validationError";
import { Request, Response } from "express";
import { ChannelService } from "../services/channel-service";
import { PlaylistService } from "../services/playlist-service";
export class PlaylistController {
  constructor(private PlaylistService: PlaylistService) {}

  async createPlaylist(req: Request, res: Response) {
    try {
      const playlist = await this.PlaylistService.createPlaylist(
        req.params.channelId,
        req.body
      );
      res.status(201).json(playlist);
    } catch (error) {
      if (error instanceof ValidationError) {
        res.status(400).json({ error: error.message });
      } else {
        res.status(500).json({ error: "Internal server error" });
      }
    }
  }

  async editPlaylist(req: Request, res: Response) {
    try {
      const playlist = await this.PlaylistService.editPlaylist(
        req.params.playlistId,
        req.body
      );
      res.json(playlist);
    } catch (error) {
      if (error instanceof ValidationError) {
        res.status(400).json({ error: error.message });
      } else {
        res.status(500).json({ error: "Internal server error" });
      }
    }
  }

  async deletePlaylist(req: Request, res: Response) {
    try {
      await this.PlaylistService.deletePlaylist(req.params.playlistId);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Internal server error" });
    }
  }

  async addVideoToPlaylist(req: Request, res: Response) {
    try {
      const playlist = await this.PlaylistService.addVideoToPlaylist(
        req.params.playlistId,
        req.body.videoId
      );
      res.json(playlist);
    } catch (error) {
      if (error instanceof ValidationError) {
        res.status(400).json({ error: error.message });
      } else {
        res.status(500).json({ error: "Internal server error" });
      }
    }
  }
}
