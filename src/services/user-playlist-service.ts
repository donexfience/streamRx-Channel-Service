import { IPlaylistUserRepository } from "../interfaces/IPlaylistUserRepository";
import { IPlaylist } from "../model/schema/user-playlist";
import { UserPlaylistRepository } from "../repository/userPlaylistRepository";

export class PlaylistUserService {
  constructor(private readonly repository: UserPlaylistRepository) {}

  async createPlaylist(
    userId: string,
    name: string,
    description?: string
  ): Promise<IPlaylist> {
    try {
      return await this.repository.createPlaylist(userId, name, description);
    } catch (error: any) {
      throw new Error(`Failed to create playlist: ${error.message}`);
    }
  }

  async getPlaylistById(playlistId: string): Promise<IPlaylist> {
    try {
      return await this.repository.findPlaylistById(playlistId);
    } catch (error: any) {
      throw new Error(`Failed to get playlist: ${error.message}`);
    }
  }

  async getUserPlaylists(userId: string): Promise<IPlaylist[]> {
    try {
      return await this.repository.findPlaylistsByUser(userId);
    } catch (error: any) {
      throw new Error(`Failed to get user playlists: ${error.message}`);
    }
  }

  async addVideoToPlaylist(
    playlistId: string,
    videoId: string
  ): Promise<IPlaylist> {
    try {
      return await this.repository.addVideoToPlaylist(playlistId, videoId);
    } catch (error: any) {
      throw new Error(`Failed to add video to playlist: ${error.message}`);
    }
  }

  async removeVideoFromPlaylist(
    playlistId: string,
    videoId: string
  ): Promise<IPlaylist> {
    try {
      return await this.repository.removeVideoFromPlaylist(playlistId, videoId);
    } catch (error: any) {
      throw new Error(`Failed to remove video from playlist: ${error.message}`);
    }
  }

  async deletePlaylist(playlistId: string): Promise<void> {
    try {
      await this.repository.deletePlaylist(playlistId);
    } catch (error: any) {
      throw new Error(`Failed to delete playlist: ${error.message}`);
    }
  }
}
