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

  async getAllPlaylists(page: number = 1, limit: number = 10 ,channelId:string) {
    const skip = (page - 1) * limit;
    return await this.playlistRepository.getAll(skip, limit,channelId);
  }

  async getPlaylistById(playlistId: string): Promise<Playlist> {
    return await this.playlistRepository.findById(playlistId);
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
}
