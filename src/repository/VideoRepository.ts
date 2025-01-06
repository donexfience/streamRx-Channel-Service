import { IVideoRepository } from "../interfaces/IVideoRepository";
import Video, { Video as VideoType } from "../model/schema/video.schema";

export class VideoRepository implements IVideoRepository {
  async create(videoData: Partial<VideoType>): Promise<VideoType> {
    const video = new Video(videoData);
    return await video.save();
  }

  async update(
    videoId: string,
    updateData: Partial<VideoType>
  ): Promise<VideoType> {
    const video = await Video.findByIdAndUpdate(videoId, updateData, { new: true });
    if (!video) throw new Error('Video not found');
    return video;
  }

  async delete(videoId: string): Promise<void> {
    await Video.findByIdAndDelete(videoId);
  }

  async findById(videoId: string): Promise<VideoType> {
    const video = await Video.findById(videoId);
    if (!video) throw new Error('Video not found');
    return video;
  }
}
