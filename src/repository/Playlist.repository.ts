import Playlist, {
  Playlist as PlaylistType,
} from "../model/schema/playlist.schema";
import { Types } from "mongoose";

export class PlaylistRepository {
  async create(playlistData: Partial<PlaylistType>): Promise<PlaylistType> {
    console.log(playlistData, "playlist data in the repository");
    const playlist = new Playlist(playlistData);
    await playlist.save();
    const plainDocument = playlist.toObject();
    return plainDocument;
  }

  async findByIds(ids: string | string[]) {
    console.log(ids, "ids got in the repository");
    try {
      const idsArray = Array.isArray(ids) ? ids : [ids];
      const validIds = idsArray.filter((id) => Types.ObjectId.isValid(id));

      if (validIds.length === 0) {
        throw new Error("No valid playlist IDs provided.");
      }

      return await Playlist.find({
        _id: { $in: validIds.map((id) => new Types.ObjectId(id)) },
      });
    } catch (error: any) {
      throw new Error(`Repository error: ${error.message}`);
    }
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

  async getFullPlaylistById(playlistId: string): Promise<PlaylistType | null> {
    try {
      const playlist = await Playlist.findById(playlistId)
        .populate("videos.videoId")
        .populate("channelId")
        .lean();

      if (!playlist) throw new Error("Playlist not found");

      return playlist;
    } catch (error) {
      console.error("Error in PlaylistRepository.getFullPlaylistById:", error);
      throw error;
    }
  }

  async findByChannelId(channelId: string): Promise<PlaylistType[]> {
    try {
      return await Playlist.find({ channelId })
        .populate("videos.videoId")
        .lean();
    } catch (error) {
      console.error("Error in PlaylistRepository.findByChannelId:", error);
      throw error;
    }
  }

  async createInitial(
    playlistData: Partial<PlaylistType>
  ): Promise<PlaylistType> {
    try {
      const playlist = new Playlist({
        ...playlistData,
        videos: [],
        status: "active",
      });
      await playlist.save();
      return playlist.toObject();
    } catch (error) {
      console.error("Error in PlaylistRepository.createInitial:", error);
      throw error;
    }
  }

  async updatePlaylistsVideos(
    playlistId: string,
    videos: Array<{
      videoId: string;
      videoUrl: string;
      next: string | null;
      prev: string | null;
    }>
  ): Promise<PlaylistType> {
    try {
      const playlist = await Playlist.findByIdAndUpdate(
        playlistId,
        {
          $set: { videos },
        },
        { new: true }
      ).populate("videos.videoId");

      if (!playlist) {
        throw new Error("Playlist not found");
      }

      return playlist.toObject();
    } catch (error) {
      console.error("Error in PlaylistRepository.updateVideos:", error);
      throw error;
    }
  }

  async addVideoToPlaylist(
    playlistId: string,
    videoData: {
      videoId: string;
      videoUrl: string;
      next: string | null;
      prev: string | null;
    }
  ): Promise<PlaylistType> {
    try {
      const playlist = await Playlist.findByIdAndUpdate(
        playlistId,
        {
          $push: { videos: videoData },
          $set: { updatedAt: new Date() },
        },
        { new: true }
      ).populate("videos.videoId");

      if (!playlist) {
        throw new Error("Playlist not found");
      }

      return playlist.toObject();
    } catch (error) {
      console.error("Error in PlaylistRepository.addVideoToPlaylist:", error);
      throw error;
    }
  }

  async getAll(
    skip: number = 0,
    limit: number = 10,
    channelId: string
  ): Promise<PlaylistType[]> {
    try {
      const playlists = await Playlist.find({ channelId: channelId })
        .populate("videos.videoId")
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
    const playlist = await Playlist.findById(playlistId).populate(
      "videos.videoId"
    );
    if (!playlist) throw new Error("Playlist not found");
    return playlist;
  }

  async findByQuery(filter: Record<string, any>): Promise<PlaylistType[]> {
    try {
      return await Playlist.find(filter)
        .sort({ createdAt: -1 })
        .populate("channelId")
        .populate("videos.videoId")
        .lean();
    } catch (error) {
      console.error("Error in PlaylistRepository.findByQuery:", error);
      throw error;
    }
  }
}
