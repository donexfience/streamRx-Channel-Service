import { Request, Response, RequestHandler } from "express";
import { ValidationError } from "../_lib/utils/errors/validationError";
import { PlaylistService } from "../services/playlist-service";
import { RabbitMQConnection, RabbitMQProducer } from "streamrx_common";

export class PlaylistController {
  private rabbitMQProducer: RabbitMQProducer;
  constructor(
    private playlistService: PlaylistService,
    private readonly RabbitMQConnection: RabbitMQConnection
  ) {
    this.rabbitMQProducer = new RabbitMQProducer(this.RabbitMQConnection);
  }

  getAllPlaylists: RequestHandler = async (req, res, next) => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const channelId = req.params.channelId;
      const { visibility, category, startDate, endDate, searchQuery, status } =
        req.query;

      // Build the filter object based on the query parameters
      const filters: any = { channelId };

      if (status) filters.status = status;

      if (visibility) filters.visibility = visibility;
      if (category) filters.category = category;

      // Handle date range filtering
      if (startDate && endDate && startDate !== "null" && endDate !== "null") {
        const startDateObj = new Date(startDate as string);
        const endDateObj = new Date(endDate as string);

        // Check if the dates are valid
        if (!isNaN(startDateObj.getTime()) && !isNaN(endDateObj.getTime())) {
          filters.createdAt = {
            $gte: startDateObj,
            $lte: endDateObj,
          };
        }
      }

      if (searchQuery) {
        filters.$or = [
          { name: { $regex: searchQuery, $options: "i" } },
          { description: { $regex: searchQuery, $options: "i" } },
        ];
      }

      const { playlists, total } = await this.playlistService.getAllPlaylists(
        page,
        limit,
        filters
      );

      if (!playlists || playlists.length === 0) {
        res.status(200).json({
          success: true,
          message: "No playlist found",
          data: null,
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: "Playlists retrieved successfully",
        data: playlists,
        pagination: { page, limit, total },
      });
    } catch (error) {
      next(error);
    }
  };
  getFullPlaylistById: RequestHandler = async (req, res, next) => {
    try {
      const { id } = req.params;
      console.log(req.params, "params got");

      const playlist = await this.playlistService.getFullPlaylistById(id);
      if (!playlist) {
        res.status(404).json({ error: "Playlist not found" });
      }

      res.status(200).json({ success: true, playlist });
    } catch (error) {
      next(error);
    }
  };

  getPlaylist: RequestHandler = async (req, res, next) => {
    try {
      console.log(req.query, "enjoyed");

      console.log(req.query?.query);
      const { query } = req.query;
      const { channelId } = req.params;
      console.log(channelId, "playlist id for searching");
      let decodedTitle;
      if (!query) {
        throw new ValidationError([
          { fields: ["playlistId"], constants: "Playlist ID is required." },
        ]);
      }

      if (query) {
        if (typeof query === "string") {
          console.log(query, decodeURIComponent(query), "title ");
          decodedTitle = decodeURIComponent(query);
        } else {
          console.log(query, "title is not a string");
        }
      }
      console.log(decodedTitle, "decoeder");
      const playlist = await this.playlistService.getPlayListByTitle(
        channelId,
        decodedTitle as string
      );
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
        throw new ValidationError([
          {
            fields: ["name", "description"],
            constants: "Name and Description are required.",
          },
        ]);
      }

      const playlist = await this.playlistService.createPlaylist(playlistData);
      const exchangeName = "playlist-created";
      await this.rabbitMQProducer.publishToExchange(exchangeName, "", {
        ...playlistData,
      });
      res.status(201).json(playlist);
    } catch (error) {
      next(error);
    }
  };

  createInitialPlaylist: RequestHandler = async (req, res, next) => {
    try {
      const playlistData = req.body;
      if (!playlistData.name || !playlistData.description) {
        throw new ValidationError([
          {
            fields: ["name", "description"],
            constants: "Name and Description are required.",
          },
        ]);
      }

      const playlist = await this.playlistService.createInitialPlaylist(
        playlistData
      );
      const exchangeName = "initial-playlist-created";
      await this.rabbitMQProducer.publishToExchange(exchangeName, "", {
        ...playlist,
      });
      res.status(201).json(playlist);
    } catch (error) {
      next(error);
    }
  };

  updatePlaylistsvideoes: RequestHandler = async (req, res, next) => {
    try {
      const videos = req.body;
      const { playlistId } = req.params;

      const playlist = await this.playlistService.updatePlaylistVideoes(
        playlistId,
        videos
      );
      const exchangeName = "playlist-videoes-updated";
      await this.rabbitMQProducer.publishToExchange(exchangeName, "", {
        videos,
        playlistId,
      });

      res.status(201).json(playlist);
    } catch (error) {
      next(error);
    }
  };

  getPlaylistBySearchQuery: RequestHandler = async (req, res, next) => {
    try {
      const { title } = req.query;
      let decodedTitle;
      if (title) {
        if (typeof title === "string") {
          console.log(title, decodeURIComponent(title), "title ");
          decodedTitle = decodeURIComponent(title);
        } else {
          console.log(title, "title is not a string");
        }
      }

      const videos = await this.playlistService.getPlayListByTitle(
        decodedTitle as string
      );
      res.status(200).json(videos);
    } catch (error) {
      console.error("Error fetching videos by title:", error);
      res.status(500).json({ message: "Failed to fetch videos by title" });
    }
  };

  getPlaylistsByIds: RequestHandler = async (req, res, next) => {
    try {
      let { ids } = req.query;

      const playlistIds = Array.isArray(ids)
        ? ids.map(String)
        : ids
        ? [String(ids)]
        : [];

      if (playlistIds.length === 0) {
        res.status(400).json({ error: "Missing playlist ID(s)" });
      }

      const playlists = await this.playlistService.getPlaylistsByIds(
        playlistIds
      );
      res.status(200).json(playlists);
    } catch (error) {
      next(error);
    }
  };

  updatePlaylist: RequestHandler = async (req, res, next) => {
    try {
      const playlistId = req.params.playlistId;
      const updateData = req.body;
      if (!playlistId) {
        throw new ValidationError([
          { fields: ["playlistId"], constants: "Playlist ID is required." },
        ]);
      }

      const updatedPlaylist = await this.playlistService.updatePlaylist(
        playlistId,
        updateData
      );

      const exchangeName = "playlist-updated";
      await this.rabbitMQProducer.publishToExchange(exchangeName, "", {
        playlistId,
        updateData,
      });
      res.status(200).json(updatedPlaylist);
    } catch (error) {
      next(error);
    }
  };

  deletePlaylist: RequestHandler = async (req, res, next) => {
    try {
      const playlistId = req.params.playlistId;
      if (!playlistId) {
        throw new ValidationError([
          { fields: ["playlistId"], constants: "Playlist ID is required." },
        ]);
      }
      const exchangeName = "playlist-deleted";
      await this.rabbitMQProducer.publishToExchange(exchangeName, "", {
        playlistId,
      });

      await this.playlistService.deletePlaylist(playlistId);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  };

  getPlaylistByChannelId: RequestHandler = async (req, res, next) => {
    try {
      const { channelId } = req.params;

      if (!channelId) {
        res.status(400).json({ error: "Channel ID is required" });
      }

      console.log(`Fetching playlists for channel ID: ${channelId}`);

      const playlists = await this.playlistService.getPlaylistsByChannelId(
        channelId
      );

      res.status(200).json({
        success: true,
        message: "Playlists retrieved successfully",
        data: playlists,
      });
    } catch (error) {
      console.error("Error in getPlaylistByChannelId:", error);
      next(error);
    }
  };
}
