import { IVideoRepository } from "../interfaces/IVideoRepository";
import Video, { Video as VideoType } from "../model/schema/video.schema";

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
    channelId: string
  ): Promise<VideoType[]> {
    try {
      const videos = await Video.find({ channelId: channelId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate("channelId")
        .lean();

      return videos;
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

  async findByQuery(filter: Record<string, any>): Promise<VideoType[]> {
    try {
      return await Video.find(filter)
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
        { _id: { $in: videoIds } },
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

  async getVideosByChannelId(channelId: string): Promise<VideoType[]> {
    return await Video.find({ channelId: channelId });
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
}
