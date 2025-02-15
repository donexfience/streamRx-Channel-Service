import { Video } from "../model/schema/video.schema";
import { ChannelRepostiory } from "../repository/ChannelRepository";
import { VideoRepository } from "../repository/VideoRepository";
import { ObjectId, Types, Schema } from "mongoose";

export class VideoService {
  constructor(
    private videoRepository: VideoRepository,
    private channelRepository: ChannelRepostiory
  ) {}

  async createVideoRecord(
    videoData: Partial<Video>,
    channelId: string
  ): Promise<Video> {
    console.log(videoData, "in the service i got the video data ");
    try {
      let channel;
      if (channelId) {
        channel = await this.channelRepository.findById(channelId);
      }
      return await this.videoRepository.create({
        ...videoData,
        channelId: channel
          ? new Types.ObjectId((channel as any)._id.toString())
          : undefined,
        status: "ready",
      });
    } catch (error: any) {
      throw new Error(`Failed to create video record: ${error.message}`);
    }
  }

  async getVideosByTitle(channelId: string, title?: string) {
    const filter = title ? { title: { $regex: title, $options: "i" } } : {};
    return await this.videoRepository.findByQuery(channelId, filter);
  }

  async editVideo(videoId: string, updateData: Partial<Video>): Promise<Video> {
    return await this.videoRepository.update(videoId, updateData);
  }

  async bulkUpdate(videoIds: string[], playlistId: string): Promise<Video[]> {
    return await this.videoRepository.bulkUpdateVideoPlaylists(
      videoIds,
      playlistId
    );
  }

  async updateVideoplaylist(
    videoId: string,
    playlistId: string
  ): Promise<Video> {
    return await this.videoRepository.updateVideoPlaylist(videoId, playlistId);
  }

  async getAllVideo(page: number = 1, limit: number = 10, filter: any) {
    const skip = (page - 1) * limit;
    const { videos, total } = await this.videoRepository.getAll(
      skip,
      limit,
      filter
    );
    return { videos, total };
  }

  async getVideosByChannelId(channelId: string): Promise<Video[]> {
    return await this.videoRepository.getVideosByChannelId(channelId);
  }

  async getVideoById(videoId: string): Promise<Video> {
    return await this.videoRepository.findById(videoId);
  }

  async deleteVideo(videoId: string): Promise<void> {
    await this.videoRepository.delete(videoId);
  }

  async getMostLikedVideo(
    page: number = 1,
    limit: number = 10
  ): Promise<Video[]> {
    return await this.videoRepository.getMostLikedVideo(page, limit);
  }

  async getMostViewedVideo(
    page: number = 1,
    limit: number = 10
  ): Promise<Video[]> {
    return await this.videoRepository.getMostViewedVideo(page, limit);
  }

  async getRecentVideo(page: number = 1, limit: number = 10): Promise<Video[]> {
    return await this.videoRepository.getRecentVideo(page, limit);
  }

  async getMostPopularVideo(
    page: number = 1,
    limit: number = 10
  ): Promise<Video[]> {
    return await this.videoRepository.getPopularVideo(page, limit);
  }
}
