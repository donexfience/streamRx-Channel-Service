import { Request, Response, RequestHandler } from "express";
import { ValidationError } from "../_lib/utils/errors/validationError";
import { PlaylistService } from "../services/playlist-service";

export class PlaylistController {
  constructor(private playlistService: PlaylistService) {}

  getAllPlaylists: RequestHandler = async (req, res, next) => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const channelId = req.params.channelId;
      const playlists = await this.playlistService.getAllPlaylists(page, limit,channelId);
      res.status(200).json({
        success: true,
        message: "Playlists retrieved successfully",
        data: playlists,
        pagination: { page, limit },
      });
    } catch (error) {
      next(error);
    }
  };

  getPlaylist: RequestHandler = async (req, res, next) => {
    try {
      const playlistId = req.params.playlistId;
      if (!playlistId) {
        throw new ValidationError([{ fields: ["playlistId"], constants: "Playlist ID is required." }]);
      }

      const playlist = await this.playlistService.getPlaylistById(playlistId);
      if (!playlist) {
        res.status(404).json({ error: "Playlist not found" });
      }

      res.status(200).json(playlist);
    } catch (error) {
      next(error);
    }
  };

  createPlaylist: RequestHandler = async (req, res, next) => {
    try {
      const playlistData = req.body;
      if (!playlistData.name || !playlistData.description) {
        throw new ValidationError([{ fields: ["name", "description"], constants: "Name and Description are required." }]);
      }

      const playlist = await this.playlistService.createPlaylist(playlistData);
      res.status(201).json(playlist);
    } catch (error) {
      next(error);
    }
  };

  updatePlaylist: RequestHandler = async (req, res, next) => {
    try {
      const playlistId = req.params.playlistId;
      const updateData = req.body;
      if (!playlistId) {
        throw new ValidationError([{ fields: ["playlistId"], constants: "Playlist ID is required." }]);
      }

      const updatedPlaylist = await this.playlistService.updatePlaylist(playlistId, updateData);
      res.status(200).json(updatedPlaylist);
    } catch (error) {
      next(error);
    }
  };

  deletePlaylist: RequestHandler = async (req, res, next) => {
    try {
      const playlistId = req.params.playlistId;
      if (!playlistId) {
        throw new ValidationError([{ fields: ["playlistId"], constants: "Playlist ID is required." }]);
      }

      await this.playlistService.deletePlaylist(playlistId);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  };
}
