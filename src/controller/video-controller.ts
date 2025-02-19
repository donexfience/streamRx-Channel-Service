import { Request, RequestHandler, Response } from "express";
import { ValidationError } from "../_lib/utils/errors/validationError";
import { VideoService } from "../services/video-service";
import mongoose, { Types, Document, Schema } from "mongoose";
import { RabbitMQConnection, RabbitMQProducer } from "streamrx_common";
import { ElasticsearchService } from "../services/elasti-search-service";

export class VideoController {
  private rabbitMQProducer: RabbitMQProducer;
  constructor(
    private videoService: VideoService,
    private readonly rabbitMQConnection: RabbitMQConnection,
    private readonly elasticsearchService: ElasticsearchService
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
      const { channelId } = req.params;
      console.log(channelId);
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
        channelId,
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
      const { channelId } = req.params;
      const { status, visibility, category, searchQuery, dateRange } =
        req.query;

      const filter: any = { channelId };
      console.log(req.query, "query of the get all video ");

      if (status) filter.status = status;
      if (visibility) filter.visibility = visibility;
      if (category) filter.category = category;

      if (searchQuery) {
        filter.$or = [
          { title: { $regex: searchQuery, $options: "i" } },
          { description: { $regex: searchQuery, $options: "i" } },
          { tags: { $regex: searchQuery, $options: "i" } },
        ];
      }

      if (dateRange) {
        const { start, end } = JSON.parse(dateRange as string);
        if (start && end) {
          filter.createdAt = {
            $gte: new Date(start),
            $lte: new Date(end),
          };
        }
      }

      const { videos, total } = await this.videoService.getAllVideo(
        page,
        limit,
        filter
      );

      if (!videos || videos.length === 0) {
        res.status(200).json({
          success: true,
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
          total,
        },
      });
    } catch (error) {
      console.error("Error in getAllVideo:", error);
      next(error);
    }
  };

  getRecentVideo: RequestHandler = async (req, res, next) => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const userId = req.query.userId as string;

      const videoes = await this.videoService.getRecentVideo(
        userId,
        page,
        limit
      );
      if (!videoes || videoes.length === 0) {
        res.status(400).json({
          success: false,
          message: "No videos found",
          data: null,
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: "Videos retrieved successfully",
        data: videoes,
        pagination: {
          page,
          limit,
        },
      });
    } catch (error) {
      console.error("error in getting recent video ");
      next(error);
    }
  };

  getPopularVideo: RequestHandler = async (req, res, next) => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const userId = req.query.userId as string;

      const videoes = await this.videoService.getMostPopularVideo(
        userId,
        page,
        limit
      );
      if (!videoes || videoes.length === 0) {
        res.status(400).json({
          success: false,
          message: "No videos found",
          data: null,
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: "Videos retrieved successfully",
        data: videoes,
        pagination: {
          page,
          limit,
        },
      });
    } catch (error) {
      console.error("error in getting recent video ");
      next(error);
    }
  };

  getMostLikedVideo: RequestHandler = async (req, res, next) => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;

      const userId = req.query.userId as string;

      const videoes = await this.videoService.getMostPopularVideo(
        userId,
        page,
        limit
      );
      if (!videoes || videoes.length === 0) {
        res.status(400).json({
          success: false,
          message: "No videos found",
          data: null,
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: "Videos retrieved successfully",
        data: videoes,
        pagination: {
          page,
          limit,
        },
      });
    } catch (error) {
      console.error("error in getting recent video ");
      next(error);
    }
  };

  getMostViewedVideo: RequestHandler = async (req, res, next) => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const userId = req.query.userId as string;
      const videoes = await this.videoService.getMostViewedVideo(
        userId,
        page,
        limit
      );
      if (!videoes || videoes.length === 0) {
        res.status(400).json({
          success: false,
          message: "No videos found",
          data: null,
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: "Videos retrieved successfully",
        data: videoes,
        pagination: {
          page,
          limit,
        },
      });
    } catch (error) {
      console.error("error in getting recent video ");
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
        const response = await this.elasticsearchService.indexVideo(video);
        console.log(response, "from elastic search");
        console.log("[INFO] Elasticsearch indexing successful:", response);
      } catch (esError) {
        console.error("[ERROR] Elasticsearch indexing failed:", esError);
      }

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

  searchVideos: RequestHandler = async (req, res, next) => {
    try {
      const {
        searchQuery,
        status,
        visibility,
        category,
        videoType,
        tags,
        dateRange,
        page = 1,
        limit = 10,
      } = req.query;

      const parsedTags = tags ? (tags as string).split(",") : undefined;

      let parsedDateRange;
      if (dateRange) {
        const { start, end } = JSON.parse(dateRange as string);
        parsedDateRange = {
          start: new Date(start),
          end: new Date(end),
        };
      }
      const searchResults = await this.elasticsearchService.searchVideos({
        searchQuery: searchQuery as string,
        status: status as string,
        visibility: visibility as string,
        category: category as string,
        videoType: videoType as string,
        tags: parsedTags,
        dateRange: parsedDateRange,
        page: parseInt(page as string, 10),
        limit: parseInt(limit as string, 10),
      });

      console.log(searchResults.hits, "video");
      res.status(200).json({
        success: true,
        message: "Videos retrieved successfully",
        data: searchResults.hits,
        pagination: {
          page: parseInt(page as string, 10),
          limit: parseInt(limit as string, 10),
          total: searchResults.total,
        },
      });
    } catch (error) {
      console.error("Error searching videos:", error);
      next(error);
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

      const elasticresponse = await this.elasticsearchService.updateVideo(
        videoId,
        updateData
      );
      console.log(elasticresponse, "elastic response");

      const exchangeName = "videoes-updated";
      await this.rabbitMQProducer.publishToExchange(exchangeName, "", {
        videoId,
        updateData,
      });
      res.status(200).json(video);
    } catch (error) {
      next(error);
    }
  };

  // searchAutocomplete: RequestHandler = async (req, res, next) => {
  //   try {
  //     const { query } = req.query;

  //     if (!query) {
  //       res.status(400).json({
  //         success: false,
  //         message: "Query parameter is required",
  //       });
  //       return;
  //     }

  //     const suggestions = await this.elasticsearchService.getSuggestions(
  //       query as string
  //     );

  //     res.status(200).json({
  //       success: true,
  //       message: "Autocomplete suggestions retrieved successfully",
  //       data: suggestions,
  //     });
  //   } catch (error) {
  //     console.error("Error fetching autocomplete suggestions:", error);
  //     next(error);
  //   }
  // };

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

      const exchangeName = "videoes-playlist-updated";
      await this.rabbitMQProducer.publishToExchange(exchangeName, "", {
        videoId,
        playlistId,
      });
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

      await this.elasticsearchService.bulkIndex(updatedVideos);

      const exchangeName = "bulk-video-updated";
      await this.rabbitMQProducer.publishToExchange(exchangeName, "", {
        videoIds,
        playlistId,
      });

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
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const videos = await this.videoService.getVideosByChannelId(
        channelId,
        page,
        limit
      );
      res.json(videos);
    } catch (error) {
      res.status(500).json({ message: "Error fetching videos", error });
    }
  };

  getVideosByChannelIdViewer: RequestHandler = async (req, res, next) => {
    try {
      console.log("hello in the video conctroller Ff");
      const { channelId } = req.params;
      console.log(req.query, "queryyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyy");
      console.log(req.params, "paramsssssssssssssssssssssssssssssssssssssss");
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const userId = req.query.userId as string;
      const videos = await this.videoService.getVideosByChannelIdViewer(
        channelId,
        userId,
        page,
        limit
      );
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

      await this.elasticsearchService.deleteVideo(videoId);

      const exchangeName = "video-deleted";
      await this.rabbitMQProducer.publishToExchange(exchangeName, "", {
        videoId,
      });
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  };
}
