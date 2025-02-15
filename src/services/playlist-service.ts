import { Playlist } from "../model/schema/playlist.schema";
import { PlaylistRepository } from "../repository/Playlist.repository";

export class PlaylistService {
  constructor(private playlistRepository: PlaylistRepository) {}

  async createPlaylist(playlistData: Partial<Playlist>): Promise<Playlist> {
    try {
      return await this.playlistRepository.create(playlistData);
    } catch (error: any) {
      throw new Error(`Failed to create playlist: ${error.message}`);
    }
  }

  async getAllPlaylists(page: number = 1, limit: number = 10, filters: any) {
    const skip = (page - 1) * limit;
    const { playlists, total } = await this.playlistRepository.getAll(
      skip,
      limit,
      filters
    );
    return { playlists, total };
  }
  async getPlaylistById(playlistId: string): Promise<Playlist> {
    return await this.playlistRepository.findById(playlistId);
  }

  async getFullPlaylistById(playlistId: string): Promise<Playlist | null> {
    return await this.playlistRepository.getFullPlaylistById(playlistId);
  }

  async getPlayListByTitle(channelId: string, title?: string) {
    const filter = title ? { name: { $regex: title, $options: "i" } } : {};
    return await this.playlistRepository.findByQuery(filter, channelId);
  }

  async createInitialPlaylist(
    playlistData: Partial<Playlist>
  ): Promise<Playlist> {
    try {
      return await this.playlistRepository.createInitial(playlistData);
    } catch (error: any) {
      throw new Error(`Failed to create initial playlist: ${error.message}`);
    }
  }

  async updatePlaylistVideoes(
    playlistId: string,
    data: {
      videos: Array<{
        videoId: string;
        videoUrl: string;
        next: string | null;
        prev: string | null;
      }>;
    }
  ) {
    try {
      const { videos } = data;
      console.log("Videos in service:", videos);

      if (!Array.isArray(videos)) {
        throw new Error("Videos must be an array");
      }

      return await this.playlistRepository.updatePlaylistsVideos(
        playlistId,
        videos
      );
    } catch (error) {
      console.error("Service error:", error);
      throw new Error("failed to update existing playlist with video");
    }
  }

  async updatePlaylist(
    playlistId: string,
    updateData: Partial<Playlist>
  ): Promise<Playlist> {
    return await this.playlistRepository.update(playlistId, updateData);
  }

  async deletePlaylist(playlistId: string): Promise<void> {
    await this.playlistRepository.delete(playlistId);
  }

  async getPlaylistsByChannelId(channelId: string) {
    try {
      return await this.playlistRepository.findByChannelId(channelId);
    } catch (error) {
      console.error("Error in PlaylistService.getPlaylistsByChannelId:", error);
      throw error;
    }
  }

  async getPlaylistsByIds(ids: string[]) {
    try {
      return await this.playlistRepository.findByIds(ids);
    } catch (error: any) {
      throw new Error(`Error fetching playlists: ${error.message}`);
    }
  }
}
