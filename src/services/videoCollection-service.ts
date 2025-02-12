import { IVideoCollectionRepository } from "../interfaces/IVideoCollectionRepository";
import videoHistorySchema, {
  VideoHistory as VideoHistoryType,
} from "../model/schema/videoHistorySchema";
import watchLaterSchema, {
  IWatchLater as WatchLaterType,
} from "../model/schema/watchLaterSchema";
import { VideoCollectionRepository } from "../repository/videoCollectionRepository";

export class VideoCollectionService {
  constructor(private readonly repository: VideoCollectionRepository) {}

  async addToHistory(
    userId: string,
    videoData: any
  ): Promise<VideoHistoryType> {
    try {
      return await this.repository.addToHistory(userId, videoData);
    } catch (error: any) {
      throw new Error(`Failed to add video to history: ${error.message}`);
    }
  }

  async addToWatchLater(
    userId: string,
    videoId: string
  ): Promise<WatchLaterType> {
    try {
      const isInWatchLater = await this.repository.isVideoInWatchLater(
        userId,
        videoId
      );
      if (isInWatchLater) {
        throw new Error("Video is already in watch later list");
      }
      return await this.repository.addToWatchLater(userId, videoId);
    } catch (error: any) {
      throw new Error(`Failed to add video to watch later: ${error.message}`);
    }
  }

  async getHistory(
    userId: string,
    page: number = 1,
    limit: number = 10,
    search: string = ""
  ): Promise<VideoHistoryType> {
    try {
      const skip = (page - 1) * limit;
      return await this.repository.getHistory(userId, limit, skip, search);
    } catch (error: any) {
      throw new Error(`Failed to get history: ${error.message}`);
    }
  }

  async getWatchLater(
    userId: string,
    page: number = 1,
    limit: number = 10
  ): Promise<WatchLaterType> {
    try {
      const skip = (page - 1) * limit;
      return await this.repository.getWatchLater(userId, limit, skip);
    } catch (error: any) {
      throw new Error(`Failed to get watch later list: ${error.message}`);
    }
  }

  async removeFromHistory(
    userId: string,
    videoId: string
  ): Promise<VideoHistoryType> {
    try {
      return await this.repository.removeFromHistory(userId, videoId);
    } catch (error: any) {
      throw new Error(`Failed to remove video from history: ${error.message}`);
    }
  }

  async removeFromWatchLater(
    userId: string,
    videoId: string
  ): Promise<WatchLaterType> {
    try {
      return await this.repository.removeFromWatchLater(userId, videoId);
    } catch (error: any) {
      throw new Error(
        `Failed to remove video from watch later: ${error.message}`
      );
    }
  }
}
