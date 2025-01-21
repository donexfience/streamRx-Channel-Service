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

  async getAll(skip: number = 0, limit: number = 10): Promise<VideoType[]> {
    try {
      const videos = await Video.find()
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
    const video = await Video.findById(videoId);
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
}
