// services/playlist-service.ts

import { Playlist } from "../model/schema/playlist.schema";
import { PlaylistRepository } from "../repository/Playlist.repository";

export class PlaylistService {
  constructor(private playlistRepository: PlaylistRepository) {}

  async createPlaylist(
    channelId: string,
    playlistData: any
  ): Promise<Playlist> {
    return await this.playlistRepository.create({
      ...playlistData,
      channelId,
    });
  }

  async editPlaylist(
    playlistId: string,
    updateData: Partial<Playlist>
  ): Promise<Playlist> {
    return await this.playlistRepository.update(playlistId, updateData);
  }

  async deletePlaylist(playlistId: string): Promise<void> {
    await this.playlistRepository.delete(playlistId);
  }

  async addVideoToPlaylist(
    playlistId: string,
    videoId: string
  ): Promise<Playlist> {
    return await this.playlistRepository.addVideo(playlistId, videoId);
  }
}
