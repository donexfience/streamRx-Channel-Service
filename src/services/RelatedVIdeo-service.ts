import { RelatedVideosRepository } from "../repository/RelatedVideoRepository";

export class RelatedVideosService {
  constructor(private repository: RelatedVideosRepository) {}

  async getRelatedVideos(videoId: string): Promise<any> {
    // Get the current video details with playlist info for  checking
    const currentVideo = await this.repository.getVideoWithDetails(videoId);
    if (!currentVideo) {
      throw new Error("Video not found");
    }

    let playlistVideos: any[] = [];
    let currentPlaylist;

    // If video is in a playlist, get other videos from the same playlist
    if (
      currentVideo.selectedPlaylist &&
      currentVideo.selectedPlaylist.length > 0
    ) {
      const playlistId = currentVideo.selectedPlaylist[0];
      const playlist = await this.repository.getPlaylistWithVideos(playlistId);

      if (playlist) {
        currentPlaylist = {
          _id: playlist._id,
          name: playlist.name,
          thumbnailUrl: playlist.thumbnailUrl,
        };

        // Get videos from playlist in correct order
        playlistVideos = await this.repository.getOrderedPlaylistVideos(
          playlist,
          videoId
        );
      }
    }

    // Get related videos based on tags and category
    const relatedVideos = await this.repository.findRelatedVideos({
      videoId,
      tags: currentVideo.tags,
      category: currentVideo.category,
      limit: 20,
    });

    return {
      playlistVideos,
      relatedVideos,
      currentPlaylist,
    };
  }
}
