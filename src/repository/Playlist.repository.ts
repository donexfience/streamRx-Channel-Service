import { IPlaylistRepository } from "../interfaces/IPlaylistRepository";
import Playlist, {
  Playlist as PlaylistType,
} from "../model/schema/playlist.schema";

export class PlaylistRepository implements IPlaylistRepository {
  async create(playlistData: Partial<PlaylistType>): Promise<PlaylistType> {
    const playlist = new Playlist(playlistData);
    return await playlist.save();
  }

  async update(
    playlistId: string,
    updateData: Partial<PlaylistType>
  ): Promise<PlaylistType> {
    const playlist = await Playlist.findByIdAndUpdate(playlistId, updateData, {
      new: true,
    });
    if (!playlist) {
      throw new Error("Playlist not found");
    }
    return playlist;
  }

  async delete(playlistId: string): Promise<void> {
    await Playlist.findByIdAndDelete(playlistId);
  }

  async findById(playlistId: string): Promise<PlaylistType> {
    const playlist = await Playlist.findById(playlistId);
    if (!playlist) {
      throw new Error("Playlist not found");
    }
    return playlist;
  }

  async addVideo(playlistId: string, videoId: string): Promise<PlaylistType> {
    const playlist = await Playlist.findByIdAndUpdate(
      playlistId,
      { $addToSet: { videos: videoId } },
      { new: true }
    );
    if (!playlist) {
      throw new Error("Playlist not found");
    }
    return playlist;
  }
}
