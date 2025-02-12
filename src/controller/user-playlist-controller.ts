import { Request, Response } from "express";
import { PlaylistUserService } from "../services/user-playlist-service";

export class PlaylistUserController {
  constructor(private readonly service: PlaylistUserService) {}

  async createPlaylist(req: Request, res: Response) {
    try {
      const { userId } = req.params;
      const { name, description } = req.body;
      const result = await this.service.createPlaylist(
        userId,
        name,
        description
      );
      res.status(201).json(result);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async getPlaylistById(req: Request, res: Response) {
    try {
      const { playlistId } = req.params;
      const result = await this.service.getPlaylistById(playlistId);
      res.status(200).json(result);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async getUserPlaylists(req: Request, res: Response) {
    try {
      const { userId } = req.params;
      const result = await this.service.getUserPlaylists(userId);
      res.status(200).json(result);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async addVideoToPlaylist(req: Request, res: Response) {
    try {
      const { playlistId } = req.params;
      const { videoId } = req.body;
      const result = await this.service.addVideoToPlaylist(playlistId, videoId);
      res.status(200).json(result);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async removeVideoFromPlaylist(req: Request, res: Response) {
    try {
      const { playlistId, videoId } = req.params;
      const result = await this.service.removeVideoFromPlaylist(
        playlistId,
        videoId
      );
      res.status(200).json(result);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async deletePlaylist(req: Request, res: Response) {
    try {
      const { playlistId } = req.params;
      await this.service.deletePlaylist(playlistId);
      res.status(204).send();
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }
}
