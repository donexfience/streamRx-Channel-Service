import Playlist, {
  Playlist as PlaylistType,
} from "../model/schema/playlist.schema";
import { Types } from "mongoose";

export class PlaylistRepository {
  async create(playlistData: Partial<PlaylistType>): Promise<PlaylistType> {
    console.log(playlistData, "palylist data in the repository");
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
    if (!playlist) throw new Error("Playlist not found");
    return playlist;
  }

  async delete(playlistId: string): Promise<void> {
    await Playlist.findByIdAndDelete(playlistId);
  }

  async getAll(
    skip: number = 0,
    limit: number = 10,
    channelId: string
  ): Promise<PlaylistType[]> {
    try {
      const playlists = await Playlist.find({ channelId: channelId })
        .skip(skip)
        .limit(limit)
        .lean();
      return playlists;
    } catch (error) {
      console.error("Error in PlaylistRepository.getAll:", error);
      throw error;
    }
  }

  async findById(playlistId: string): Promise<PlaylistType> {
    const playlist = await Playlist.findById(playlistId);
    if (!playlist) throw new Error("Playlist not found");
    return playlist;
  }

  async findByQuery(filter: Record<string, any>): Promise<PlaylistType[]> {
    try {
      return await Playlist.find(filter)
        .sort({ createdAt: -1 })
        .populate("channelId")
        .lean();
    } catch (error) {
      console.error("Error in VideoRepository.findByQuery:", error);
      throw error;
    }
  }
}
