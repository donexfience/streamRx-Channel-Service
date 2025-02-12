import { IPlaylistUserRepository } from "../interfaces/IPlaylistUserRepository";
import playlistSchema, { IPlaylist } from "../model/schema/user-playlist";

export class UserPlaylistRepository implements IPlaylistUserRepository {
  async createPlaylist(
    userId: string,
    name: string,
    description?: string
  ): Promise<IPlaylist> {
    const playlistExists = await this.doesPlaylistExist(userId, name);
    if (playlistExists) {
      throw new Error("A playlist with this name already exists");
    }

    return await playlistSchema.create({
      userId,
      name,
      description,
      videos: [],
    });
  }

  async findPlaylistById(playlistId: string): Promise<IPlaylist> {
    const playlist = await playlistSchema
      .findById(playlistId)
      .populate("videos.videoId");
    if (!playlist) {
      throw new Error("Playlist not found");
    }
    return playlist;
  }

  async findPlaylistsByUser(userId: string): Promise<IPlaylist[]> {
    return await playlistSchema.find({ userId }).populate("videos.videoId");
  }

  async addVideoToPlaylist(
    playlistId: string,
    videoId: string
  ): Promise<IPlaylist> {
    const isVideoInPlaylist = await this.isVideoInPlaylist(playlistId, videoId);
    if (isVideoInPlaylist) {
      throw new Error("Video already exists in playlist");
    }

    const playlist = await playlistSchema
      .findByIdAndUpdate(
        playlistId,
        { $push: { videos: { videoId, addedAt: new Date() } } },
        { new: true }
      )
      .populate("videos.videoId");

    if (!playlist) {
      throw new Error("Playlist not found");
    }

    return playlist;
  }

  async removeVideoFromPlaylist(
    playlistId: string,
    videoId: string
  ): Promise<IPlaylist> {
    const playlist = await playlistSchema
      .findByIdAndUpdate(
        playlistId,
        { $pull: { videos: { videoId } } },
        { new: true }
      )
      .populate("videos.videoId");

    if (!playlist) {
      throw new Error("Playlist not found");
    }

    return playlist;
  }

  async deletePlaylist(playlistId: string): Promise<void> {
    const result = await playlistSchema.findByIdAndDelete(playlistId);
    if (!result) {
      throw new Error("Playlist not found");
    }
  }

  async isVideoInPlaylist(
    playlistId: string,
    videoId: string
  ): Promise<boolean> {
    const playlist = await playlistSchema.findOne({
      _id: playlistId,
      "videos.videoId": videoId,
    });
    return !!playlist;
  }

  async doesPlaylistExist(userId: string, name: string): Promise<boolean> {
    const playlist = await playlistSchema.findOne({
      userId,
      name: { $regex: new RegExp(`^${name}$`, "i") },
    });
    return !!playlist;
  }
}
