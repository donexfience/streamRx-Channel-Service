import videoHistorySchema, {
  VideoHistory as VideoHistoryType,
} from "../model/schema/videoHistorySchema";
import watchLaterSchema, {
  IWatchLater as WatchLaterType,
} from "../model/schema/watchLaterSchema";
export interface IVideoCollectionRepository {
  findHistoryByUser(userId: string): Promise<VideoHistoryType>;
  addToHistory(userId: string, videoData: any): Promise<VideoHistoryType>;
  createHistory(userId: string, videoData: any): Promise<VideoHistoryType>;
  getHistory(
    userId: string,
    limit: number,
    skip: number,
    search: string
  ): Promise<VideoHistoryType>;
  findWatchLaterByUser(userId: string): Promise<WatchLaterType>;
  createWatchLater(userId: string, videoId: string): Promise<WatchLaterType>;
  getWatchLater(
    userId: string,
    limit: number,
    skip: number
  ): Promise<WatchLaterType>;
  addToWatchLater(userId: string, videoId: string): Promise<WatchLaterType>;
  removeFromHistory(userId: string, videoId: string): Promise<VideoHistoryType>;
  removeFromWatchLater(
    userId: string,
    videoId: string
  ): Promise<WatchLaterType>;
  isVideoInHistory(userId: string, videoId: string): Promise<boolean>;
  isVideoInWatchLater(userId: string, videoId: string): Promise<boolean>;
}
