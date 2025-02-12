import { IPlaylist } from "../model/schema/user-playlist";

export interface IPlaylistUserRepository {
  createPlaylist(
    userId: string,
    name: string,
    description?: string
  ): Promise<IPlaylist>;
  findPlaylistById(playlistId: string): Promise<IPlaylist>;
  findPlaylistsByUser(userId: string): Promise<IPlaylist[]>;
  addVideoToPlaylist(playlistId: string, videoId: string): Promise<IPlaylist>;
  removeVideoFromPlaylist(
    playlistId: string,
    videoId: string
  ): Promise<IPlaylist>;
  deletePlaylist(playlistId: string): Promise<void>;
  isVideoInPlaylist(playlistId: string, videoId: string): Promise<boolean>;
  doesPlaylistExist(userId: string, name: string): Promise<boolean>;
}
