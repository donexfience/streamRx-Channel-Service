import { Request, RequestHandler, Response } from "express";
import { ValidationError } from "../_lib/utils/errors/validationError";
import { VideoService } from "../services/video-service";
import mongoose, { Types, Document, Schema } from "mongoose";
import { RabbitMQConnection, RabbitMQProducer } from "streamrx_common";

export class VideoController {
  private rabbitMQProducer: RabbitMQProducer;
  constructor(
    private videoService: VideoService,
    private readonly rabbitMQConnection: RabbitMQConnection
  ) {
    this.rabbitMQProducer = new RabbitMQProducer(this.rabbitMQConnection);
  }

  getVideo: RequestHandler = async (req, res, next) => {
    try {
      const videoId = req.params.videoId;
      if (!videoId) {
        throw new ValidationError([
          {
            fields: ["videoId"],
            constants: "Video ID is required.",
          },
        ]);
      }

      const video = await this.videoService.getVideoById(videoId);
      if (!video) {
        res.status(404).json({ error: "Video not found" });
      }

      res.status(200).json(video);
    } catch (error) {
      next(error);
    }
  };

  getVideoBySearchQuery: RequestHandler = async (req, res, next) => {
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

      const videos = await this.videoService.getVideosByTitle(
        decodedTitle as string
      );
      res.status(200).json(videos);
    } catch (error) {
      console.error("Error fetching videos by title:", error);
      res.status(500).json({ message: "Failed to fetch videos by title" });
    }
  };

  getAllVideo: RequestHandler = async (req, res, next) => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const {channelId} = req.params;

      const videos = await this.videoService.getAllVideo(page, limit,channelId);

      if (!videos || videos.length === 0) {
        res.status(404).json({
          success: false,
          message: "No videos found",
          data: null,
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: "Videos retrieved successfully",
        data: videos,
        pagination: {
          page,
          limit,
        },
      });
    } catch (error) {
      console.error("Error in getAllVideo:", error);
      next(error);
    }
  };
  createVideoRecord: RequestHandler = async (req, res, next) => {
    try {
      const videoData = req.body;
      const { channelId } = req.params;
      if (!videoData || !videoData.title) {
        throw new ValidationError([
          {
            fields: ["title"],
            constants: "Video title is required.",
          },
        ]);
      }
      if (!channelId) {
        throw new ValidationError([
          { fields: ["channelId"], constants: "channel Id is required" },
        ]);
      }

      console.log(videoData, "video data here in controller");
      console.log("channel id is here", channelId);
      const video = await this.videoService.createVideoRecord(
        videoData,
        channelId
      );

      try {
        const exchangeName = "video-created";
        await this.rabbitMQProducer.publishToExchange(exchangeName, "", {
          ...video,
          event: "video-created",
          timestamp: new Date().toISOString(),
        });

        console.log("[INFO] Successfully published channel creation event");
      } catch (mqError) {
        console.error(
          "[ERROR] Failed to publish channel creation event:",
          mqError
        );
      }
      res.status(201).json(video);
    } catch (error) {
      console.log(error, "error in controller");
    }
  };

  editVideo: RequestHandler = async (req, res, next) => {
    try {
      const videoId = req.params.videoId;
      const updateData = req.body;
      if (!videoId) {
        throw new ValidationError([
          {
            fields: ["videoId"],
            constants: "Video ID is required.",
          },
        ]);
      }

      const video = await this.videoService.editVideo(videoId, updateData);
      res.status(200).json(video);
    } catch (error) {
      next(error);
    }
  };

  updateVideoplaylist: RequestHandler = async (req, res, next) => {
    try {
      const videoId = req.params.playlistId;
      const playlistId = req.body;
      if (!videoId) {
        throw new ValidationError([
          {
            fields: ["videoId"],
            constants: "Video ID is required.",
          },
        ]);
      }

      const video = await this.videoService.updateVideoplaylist(
        videoId,
        playlistId
      );
      res.status(200).json(video);
    } catch (error) {
      next(error);
    }
  };

  bulkUpdateVideo: RequestHandler = async (req, res, next) => {
    try {
      const { videoIds, playlistId } = req.body;

      // Validate input
      if (!Array.isArray(videoIds) || videoIds.length === 0) {
        res.status(400).json({
          success: false,
          message: "videoIds must be a non-empty array",
        });
      }

      if (!playlistId) {
        res.status(400).json({
          success: false,
          message: "playlistId is required",
        });
      }

      console.log("Processing bulk update:", { videoIds, playlistId });

      const updatedVideos = await this.videoService.bulkUpdate(
        videoIds,
        playlistId
      );

      console.log("Bulk update completed:", {
        updatedCount: updatedVideos.length,
        videoIds: updatedVideos.map((v) => v._id),
      });

      res.status(200).json({
        success: true,
        data: updatedVideos,
      });
    } catch (error) {
      console.error("Bulk update failed:", error);
      next(error);
    }
  };

  getVideosByChannelId: RequestHandler = async (req, res, next) => {
    try {
      const { channelId } = req.params;
      const videos = await this.videoService.getVideosByChannelId(channelId);
      res.json(videos);
    } catch (error) {
      res.status(500).json({ message: "Error fetching videos", error });
    }
  };

  deleteVideo: RequestHandler = async (req, res, next) => {
    try {
      const videoId = req.params.videoId;
      if (!videoId) {
        throw new ValidationError([
          {
            fields: ["videoId"],
            constants: "Video ID is required.",
          },
        ]);
      }

      await this.videoService.deleteVideo(videoId);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  };
}
