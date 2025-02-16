import { Client } from "@elastic/elasticsearch";
import { Video } from "../model/schema/video.schema";

export class ElasticsearchService {
  private client: Client;
  private index = "videos";

  constructor(client: Client) {
    this.client = client;
    this.initIndex();
  }

  private async initIndex() {
    const exists = await this.client.indices.exists({ index: this.index });

    if (!exists) {
      await this.client.indices.create({
        index: this.index,
        mappings: {
          properties: {
            channelId: { type: "keyword" },
            title: {
              type: "text",
              analyzer: "standard",
              fields: {
                keyword: {
                  type: "keyword",
                  ignore_above: 256,
                },
              },
            },
            description: { type: "text" },
            status: { type: "keyword" },
            processingProgress: { type: "float" },
            processingError: { type: "text" },
            videoType: { type: "keyword" },
            metadata: {
              properties: {
                originalFileName: { type: "keyword" },
                mimeType: { type: "keyword" },
                codec: { type: "keyword" },
                fps: { type: "float" },
                duration: { type: "float" },
              },
            },
            qualities: {
              type: "nested",
              properties: {
                resolution: { type: "keyword" },
                bitrate: { type: "keyword" },
                size: { type: "long" },
                url: { type: "keyword" },
                s3Key: { type: "keyword" },
              },
            },
            visibility: { type: "keyword" },
            selectedPlaylist: { type: "keyword" },
            tags: { type: "keyword" },
            category: { type: "keyword" },
            defaultQuality: { type: "keyword" },
            engagement: {
              properties: {
                viewCount: { type: "long" },
                likeCount: { type: "long" },
                dislikeCount: { type: "long" },
                commentCount: { type: "long" },
                averageWatchDuration: { type: "float" },
                completionRate: { type: "float" },
              },
            },
            thumbnailUrl: { type: "keyword" },
            createdAt: { type: "date" },
            updatedAt: { type: "date" },
          },
        },
      });
    }
  }

  async indexVideo(video: Video) {
    const videoDocument = {
      channelId: video.channelId.toString(),
      title: video.title,
      description: video.description,
      status: video.status,
      processingProgress: video.processingProgress,
      processingError: video.processingError,
      videoType: video.videoType,
      metadata: video.metadata,
      qualities: video.qualities,
      visibility: video.visibility,
      selectedPlaylist: video.selectedPlaylist?.map((id) => id.toString()),
      tags: video.tags,
      category: video.category,
      defaultQuality: video.defaultQuality,
      engagement: video.engagement,
      thumbnailUrl: video.thumbnailUrl,
      createdAt: video.createdAt,
      updatedAt: video.updatedAt,
    };

    return await this.client.index({
      index: this.index,
      id: video._id.toString(),
      document: videoDocument,
    });
  }

  async updateVideo(videoId: string, updateData: Partial<Video>) {
    const doc = { ...updateData };

    if (updateData.channelId) {
      doc.channelId = updateData.channelId;
    }
    if (updateData.selectedPlaylist) {
      doc.selectedPlaylist = updateData.selectedPlaylist.map((id) => id);
    }

    return await this.client.update({
      index: this.index,
      id: videoId,
      doc,
    });
  }

  async searchVideos(query: {
    searchQuery?: string;
    channelId?: string;
    status?: string;
    visibility?: string;
    category?: string;
    videoType?: string;
    tags?: string[];
    dateRange?: { start: Date; end: Date };
    page: number;
    limit: number;
  }) {
    const searchQuery: { bool: { must: Array<Record<string, any>> } } = {
      bool: {
        must: [],
      },
    };

    if (query.searchQuery) {
      searchQuery.bool.must.push({
        multi_match: {
          query: query.searchQuery,
          fields: ["title^3", "description^2", "tags"],
          type: "best_fields",
          fuzziness: "AUTO",
        },
      });
    }

    if (query.channelId) {
      searchQuery.bool.must.push({
        term: { channelId: query.channelId },
      });
    }

    if (query.status) {
      searchQuery.bool.must.push({
        term: { status: query.status },
      });
    }

    if (query.visibility) {
      searchQuery.bool.must.push({
        term: { visibility: query.visibility },
      });
    }

    if (query.videoType) {
      searchQuery.bool.must.push({
        term: { videoType: query.videoType },
      });
    }

    if (query.category) {
      searchQuery.bool.must.push({
        term: { category: query.category },
      });
    }

    if (query.tags && query.tags.length > 0) {
      searchQuery.bool.must.push({
        terms: { tags: query.tags },
      });
    }

    if (query.dateRange) {
      searchQuery.bool.must.push({
        range: {
          createdAt: {
            gte: query.dateRange.start,
            lte: query.dateRange.end,
          },
        },
      });
    }

    const response = await this.client.search({
      index: this.index,
      query: searchQuery,
      from: (query.page - 1) * query.limit,
      size: query.limit,
    });

    return {
      hits: response.hits.hits.map((hit) => ({
        _id: hit._id,
        ...(hit._source as Record<string, any>),
      })),
      total:
        typeof response.hits.total === "number"
          ? response.hits.total
          : response.hits.total?.value || 0,
    };
  }

  async deleteVideo(videoId: string) {
    return await this.client.delete({
      index: this.index,
      id: videoId,
    });
  }

  async bulkIndex(videos: Video[]) {
    const operations = videos.flatMap((video) => [
      { index: { _index: this.index, _id: video._id.toString() } },
      {
        channelId: video.channelId.toString(),
        title: video.title,
        description: video.description,
        status: video.status,
        processingProgress: video.processingProgress,
        processingError: video.processingError,
        videoType: video.videoType,
        metadata: video.metadata,
        qualities: video.qualities,
        visibility: video.visibility,
        selectedPlaylist: video.selectedPlaylist?.map((id) => id.toString()),
        tags: video.tags,
        category: video.category,
        defaultQuality: video.defaultQuality,
        engagement: video.engagement,
        thumbnailUrl: video.thumbnailUrl,
        createdAt: video.createdAt,
        updatedAt: video.updatedAt,
      },
    ]);

    return await this.client.bulk({ operations });
  }
}
