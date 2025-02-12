import { Types } from "mongoose";
import Video from "../model/schema/video.schema";
import Playlist from "../model/schema/playlist.schema";

export class RelatedVideosRepository {
  async getVideoWithDetails(videoId: string) {
    return Video.findById(videoId).select(
      "title tags category selectedPlaylist"
    );
  }

  async getPlaylistWithVideos(playlistId: Types.ObjectId) {
    return Playlist.findById(playlistId).select("_id name thumbnailUrl videos");
  }

  async getOrderedPlaylistVideos(playlist: any, currentVideoId: string) {
    const videos = playlist.videos;
    const orderedVideos = [];

    // Find current video's position in playlist
    let currentNode = videos.find(
      (v: any) => v.videoId.toString() === currentVideoId
    );

    // Get next videos
    while (currentNode && currentNode.next) {
      const nextVideo = await Video.findById(currentNode.next).select(
        "_id title thumbnailUrl channelId engagement duration createdAt"
      );
      if (nextVideo) {
        orderedVideos.push(nextVideo);
      }
      currentNode = videos.find(
        (v: any) => v.videoId.toString() === currentNode.next?.toString()
      );
    }

    return orderedVideos;
  }

  //finding the scores of the videoes based on the tags and categeory
  async findRelatedVideos({
    videoId,
    tags,
    category,
    limit,
  }: {
    videoId: string;
    tags: string[];
    category: string;
    limit: number;
  }) {
    return Video.aggregate([
      {
        $match: {
          _id: { $ne: videoId },
          $or: [{ tags: { $in: tags } }, { category }],
          status: "ready",
          visibility: "public",
        },
      },
      {
        $addFields: {
          score: {
            $add: [
              { $cond: [{ $in: ["$category", [category]] }, 2, 0] },
              {
                $size: {
                  $setIntersection: ["$tags", tags],
                },
              },
            ],
          },
        },
      },
      {
        $sort: {
          score: -1,
          "engagement.viewCount": -1,
        },
      },
      {
        $project: {
          _id: 1,
          title: 1,
          thumbnailUrl: 1,
          channelId: 1,
          engagement: 1,
          duration: 1,
          createdAt: 1,
        },
      },
      {
        $limit: limit,
      },
    ]);
  }
}
