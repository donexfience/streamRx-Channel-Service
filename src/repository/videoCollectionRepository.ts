import { IVideoCollectionRepository } from "../interfaces/IVideoCollectionRepository";
import videoHistorySchema, {
  VideoHistory as VideoHistoryType,
} from "../model/schema/videoHistorySchema";
import watchLaterSchema, {
  IWatchLater as WatchLaterType,
} from "../model/schema/watchLaterSchema";

export class VideoCollectionRepository implements IVideoCollectionRepository {
  async findHistoryByUser(userId: string): Promise<VideoHistoryType> {
    const history = await videoHistorySchema.findOne({ userId });
    if (!history) {
      throw new Error("Video history not found");
    }
    return history;
  }

  async isVideoInHistory(userId: string, videoId: string): Promise<boolean> {
    const history = await videoHistorySchema.findOne({
      userId,
      "videos.videoId": videoId,
    });
    return !!history;
  }

  async addToHistory(
    userId: string,
    videoData: any
  ): Promise<VideoHistoryType> {
    const isVideoExists = await this.isVideoInHistory(
      userId,
      videoData.videoId
    );

    if (isVideoExists) {
      await this.removeFromHistory(userId, videoData.videoId);
    }

    const history = await videoHistorySchema.findOneAndUpdate(
      { userId },
      { $push: { videos: { $each: [videoData], $position: 0 } } },
      { new: true, upsert: true }
    );

    return history;
  }

  async removeFromHistory(
    userId: string,
    videoId: string
  ): Promise<VideoHistoryType> {
    const history = await videoHistorySchema.findOneAndUpdate(
      { userId },
      { $pull: { videos: { videoId } } },
      { new: true }
    );

    if (!history) {
      throw new Error("Video history not found");
    }

    return history;
  }

  async createHistory(
    userId: string,
    videoData: any
  ): Promise<VideoHistoryType> {
    return await videoHistorySchema.create({ userId, videos: [videoData] });
  }

  async getHistory(
    userId: string,
    limit: number,
    skip: number,
    search: string
  ): Promise<VideoHistoryType> {
    const query = { userId };

    if (search) {
      const history = await videoHistorySchema
        .findOne(query)
        .populate({
          path: "videos.videoId",
          match: {
            $or: [
              { title: { $regex: search, $options: "i" } },
              { "channelId.name": { $regex: search, $options: "i" } },
            ],
          },
        })
        .exec();

      if (!history) {
        throw new Error("Video history not found");
      }
      history.videos = history.videos
        .filter((video) => video.videoId !== null)
        .slice(skip, skip + limit);

      return history;
    }


    const history = await videoHistorySchema
      .findOne(query)
      .populate("videos.videoId")
      .slice("videos", [skip, limit]);

    if (!history) {
      throw new Error("Video history not found");
    }

    return history;
  }

  async isVideoInWatchLater(userId: string, videoId: string): Promise<boolean> {
    const watchLater = await watchLaterSchema.findOne({
      userId,
      "videos.videoId": videoId,
    });
    return !!watchLater;
  }

  async addToWatchLater(
    userId: string,
    videoId: string
  ): Promise<WatchLaterType> {
    const isVideoExists = await this.isVideoInWatchLater(userId, videoId);

    if (isVideoExists) {
      throw new Error("Video already in watch later list");
    }

    const watchLater = await watchLaterSchema.findOneAndUpdate(
      { userId },
      { $push: { videos: { videoId } } },
      { new: true, upsert: true }
    );

    return watchLater;
  }

  async removeFromWatchLater(
    userId: string,
    videoId: string
  ): Promise<WatchLaterType> {
    const watchLater = await watchLaterSchema.findOneAndUpdate(
      { userId },
      { $pull: { videos: { videoId } } },
      { new: true }
    );

    if (!watchLater) {
      throw new Error("Watch later list not found");
    }

    return watchLater;
  }

  async findWatchLaterByUser(userId: string): Promise<WatchLaterType> {
    const watchLater = await watchLaterSchema.findOne({ userId });
    if (!watchLater) {
      throw new Error("Watch later list not found");
    }
    return watchLater;
  }

  async createWatchLater(
    userId: string,
    videoId: string
  ): Promise<WatchLaterType> {
    return await watchLaterSchema.create({ userId, videos: [{ videoId }] });
  }

  async getWatchLater(
    userId: string,
    limit: number,
    skip: number
  ): Promise<WatchLaterType> {
    const watchLater = await watchLaterSchema
      .findOne({ userId })
      .populate("videos.videoId")
      .slice("videos", [skip, limit]);

    if (!watchLater) {
      throw new Error("Watch later list not found");
    }

    return watchLater;
  }
}
