import { Video } from "../model/schema/video.schema";

export interface IVideoRepository {
  create(videoData: Partial<Video>): Promise<Video>;
  update(videoId: string, updateData: Partial<Video>): Promise<Video>;
  delete(videoId: string): Promise<void>;
  findById(videoId: string): Promise<Video>;
}
