import { IVideoRepository } from "../interfaces/IVideoRepository";
import Video, { Video as VideoType } from "../model/schema/video.schema";
import { Types } from "mongoose";
import ChannelSubscription from "../model/schema/subscription.schema";

export class VideoRepository implements IVideoRepository {
  async create(videoData: Partial<VideoType>): Promise<VideoType> {
    const video = new Video(videoData);
    await video.save();
    const plainDocument = video.toObject();

    return plainDocument;
  }

  async update(
    videoId: string,
    updateData: Partial<VideoType>
  ): Promise<VideoType> {
    const video = await Video.findByIdAndUpdate(videoId, updateData, {
      new: true,
    });
    if (!video) throw new Error("Video not found");
    return video;
  }

  async delete(videoId: string): Promise<void> {
    await Video.findByIdAndDelete(videoId);
  }

  async getAll(
    skip: number = 0,
    limit: number = 10,
    filter: any
  ): Promise<{ videos: VideoType[]; total: number }> {
    try {
      const videos = await Video.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate("channelId")
        .lean();

      const total = await Video.countDocuments(filter);

      return { videos, total };
    } catch (error) {
      console.error("Error in VideoRepository.getAll:", error);
      throw error;
    }
  }

  async findById(videoId: string): Promise<VideoType> {
    const video = await Video.findById(videoId).populate("channelId");
    if (!video) throw new Error("Video not found");
    return video;
  }

  async findByQuery(
    channelId: string,
    filter: Record<string, any>
  ): Promise<VideoType[]> {
    try {
      const searchFilter = {
        ...filter,
        channelId: new Types.ObjectId(channelId),
        videoType: "normal",
      };
      return await Video.find(searchFilter)
        .sort({ createdAt: -1 })
        .populate("channelId")
        .lean();
    } catch (error) {
      console.error("Error in VideoRepository.findByQuery:", error);
      throw error;
    }
  }
  async updateVideoPlaylist(
    videoId: string,
    playlistId: string
  ): Promise<VideoType> {
    try {
      const video = await Video.findByIdAndUpdate(
        videoId,
        {
          $addToSet: { selectedPlaylist: playlistId },
          $set: { updatedAt: new Date() },
        },
        { new: true }
      ).populate("channelId");

      if (!video) {
        throw new Error("Video not found");
      }

      return video.toObject();
    } catch (error) {
      console.error("Error in VideoRepository.updateVideoPlaylist:", error);
      throw error;
    }
  }

  async bulkUpdateVideoPlaylists(
    videoIds: string[],
    playlistId: string
  ): Promise<VideoType[]> {
    try {
      const result = await Video.updateMany(
        { _id: { $in: videoIds }, videoType: "normal" },
        {
          $addToSet: { selectedPlaylist: playlistId },
          $set: { updatedAt: new Date() },
        }
      );

      const updatedVideos = await Video.find({
        _id: { $in: videoIds },
      }).populate("channelId");

      return updatedVideos.map((video) => video.toObject());
    } catch (error) {
      console.error(
        "Error in VideoRepository.bulkUpdateVideoPlaylists:",
        error
      );
      throw error;
    }
  }

  async getVideosByChannelId(
    channelId: string,
    page: number,
    limit: number
  ): Promise<{ videos: VideoType[]; total: number }> {
    const videos = await Video.find({
      channelId: channelId,
      videoType: "normal",
    })
      .skip((page - 1) * limit)
      .limit(limit)
      .exec();

    const total = await Video.countDocuments({
      channelId: channelId,
    });

    return { videos, total };
  }

  async getVideosByChannelIdViewer(
    channelId: string,
    userId: string,
    page: number,
    limit: number
  ): Promise<{ videos: VideoType[]; total: number }> {
    console.log(
      "channelId",
      channelId,
      "userId",
      userId,
      "page",
      page,
      "limit",
      limit,
      "in ther repostiory"
    );
    const channelSubscription = await ChannelSubscription.findOne({
      userId,
      channelId,
    }).sort({ updatedAt: -1 });
    console.log(channelSubscription, "subscription got");
    const isSubscribed = channelSubscription?.status === "active" || false;
    console.log(isSubscribed, "subscribed or not");
    const baseQuery: any = {
      channelId: channelId,
      videoType: "normal",
    };
    if (!isSubscribed) {
      baseQuery.visibility = "public";
    }
    console.log(baseQuery, "base query final");
    const videos = await Video.find(baseQuery)
      .skip((page - 1) * limit)
      .limit(limit)
      .exec();
    console.log(videos, "videos");
    const total = await Video.countDocuments(baseQuery);

    return { videos, total };
  }

  async removeFromPlaylist(
    videoId: string,
    playlistId: string
  ): Promise<VideoType> {
    try {
      const video = await Video.findByIdAndUpdate(
        videoId,
        {
          $pull: { selectedPlaylist: playlistId },
          $set: { updatedAt: new Date() },
        },
        { new: true }
      ).populate("channelId");

      if (!video) {
        throw new Error("Video not found");
      }

      return video.toObject();
    } catch (error) {
      console.error("Error in VideoRepository.removeFromPlaylist:", error);
      throw error;
    }
  }

  async getVideosByPlaylist(playlistId: string): Promise<VideoType[]> {
    try {
      const videos = await Video.find({
        selectedPlaylist: playlistId,
        videoType: "normal",
      })
        .sort({ createdAt: -1 })
        .populate("channelId")
        .lean();

      return videos;
    } catch (error) {
      console.error("Error in VideoRepository.getVideosByPlaylist:", error);
      throw error;
    }
  }

  async getRecentVideo(
    userId: string,
    page: number,
    limit: number
  ): Promise<VideoType[]> {
    try {
      console.log("user", userId);
      const subscribedChannels = await ChannelSubscription.find({
        userId,
        status: "active",
      });

      const subscribedChannelIds = subscribedChannels.map(
        (sub) => sub.channelId
      );
      console.log(subscribedChannelIds, "subscribed channel IDs");
      const videoQuery = {
        channelId: {
          $in: subscribedChannelIds,
        },
        videoType: "normal",
        status: "ready",
        $or: [
          {
            channelId: { $in: subscribedChannelIds },
            visibility: { $in: ["public", "private"] },
          },
          {
            visibility: "public",
          },
        ],
      };

      const recentVideos = await Video.find(videoQuery)
        .sort({ createdAt: -1 })
        .limit(limit)
        .skip((page - 1) * limit)
        .populate("channelId");

      return recentVideos;
    } catch (error: any) {
      console.error("Error in VideoRepository.getRecentVideo:", error);
      throw error;
    }
  }

  async getMostLikedVideo(
    userId: string,
    page: number,
    limit: number
  ): Promise<VideoType[]> {
    try {
      const subscribedChannels = await ChannelSubscription.find({
        userId,
        status: "active",
      });
      const subscribedChannelIds = subscribedChannels.map(
        (sub) => sub.channelId
      );

      const mostLikedVideos = await Video.find({
        videoType: "normal",
        $or: [
          // For subscribed channels - show both public and private videos
          {
            channelId: { $in: subscribedChannelIds },
            visibility: { $in: ["public", "private"] },
          },
          // For non-subscribed channels - show only public videos
          {
            visibility: "public",
          },
        ],
      })
        .sort({ "engagement.likeCount": -1 })
        .skip((page - 1) * limit)
        .limit(limit);
      return mostLikedVideos;
    } catch (error: any) {
      console.error("Error in VideoRepository.getMostLikedVideo:", error);
      throw error;
    }
  }

  async getPopularVideo(
    userId: string,
    page: number,
    limit: number
  ): Promise<VideoType[]> {
    try {
      const subscribedChannels = await ChannelSubscription.find({
        userId,
        status: "active",
      });
      const subscribedChannelIds = subscribedChannels.map(
        (sub) => sub.channelId
      );

      const popularVideos = await Video.aggregate([
        {
          $match: {
            $or: [
              {
                channelId: { $in: subscribedChannelIds },
                visibility: { $in: ["public", "private"] },
              },
              {
                visibility: "public",
              },
            ],
          },
        },
        {
          $addFields: {
            popularityScore: {
              $add: [
                { $multiply: ["$engagement.viewCount", 0.5] },
                { $multiply: ["$engagement.likeCount", 0.3] },
                { $multiply: ["$engagement.commentCount", 0.2] },
              ],
            },
          },
        },
        {
          $sort: { popularityScore: -1 },
        },
        {
          $skip: (page - 1) * limit,
        },
        {
          $limit: limit,
        },
      ]);
      return popularVideos;
    } catch (error: any) {
      console.error("Error in VideoRepository.getPopularVideo:", error);
      throw error;
    }
  }

  async getMostViewedVideo(
    userId: string,
    page: number,
    limit: number
  ): Promise<VideoType[]> {
    try {
      const subscribedChannels = await ChannelSubscription.find({
        userId,
        status: "active",
      });
      const subscribedChannelIds = subscribedChannels.map(
        (sub) => sub.channelId
      );

      const mostViewedVideos = await Video.find({
        videoType: "normal",
        $or: [
          {
            channelId: { $in: subscribedChannelIds },
            visibility: { $in: ["public", "private"] },
          },
          {
            visibility: "public",
          },
        ],
      })
        .sort({ "engagement.viewCount": -1 })
        .skip((page - 1) * limit)
        .limit(limit);
      return mostViewedVideos;
    } catch (error: any) {
      console.error("Error in VideoRepository.getMostViewedVideo:", error);
      throw error;
    }
  }
  async incrementEngagementCount(
    videoId: string,
    interactionType: "view" | "like" | "dislike" | "comment" | "partial_view"
  ): Promise<VideoType | undefined> {
    console.log(`Incrementing ${interactionType} count for video ${videoId}`);
    const updateField = `engagement.${interactionType}Count`;
    if (interactionType !== "partial_view") {
      const video = await Video.findByIdAndUpdate(
        videoId,
        {
          $inc: { [updateField]: 1 },
          $set: { updatedAt: new Date() },
        },
        { new: true }
      ).populate("channelId");

      if (!video) {
        throw new Error("Video not found");
      }
      return video.toObject();
    }
    return undefined;
  }
}
