import { CommentNode } from "../model/schema/comment.schema";
import { CommentRepository } from "../repository/CommentRepository";
import { Types } from "mongoose";
import { VideoRepository } from "../repository/VideoRepository";
import { UserRepository } from "../repository/userRepository";
import { ChannelRepostiory } from "../repository/ChannelRepository";

export class CommentService {
  constructor(
    private commentRepository: CommentRepository,
    private videoRepository: VideoRepository,
    private userRepository: UserRepository,
    private channelRepository: ChannelRepostiory
  ) {}

  async createComment(
    commentData: Partial<CommentNode>,
    videoId: string,
    userId: string
  ): Promise<CommentNode> {
    try {
      const existingVideo = await this.videoRepository.findById(videoId);
      const existingUser = await this.userRepository.findById(userId);

      if (!existingVideo || !existingUser) {
        throw new Error("channel, video, or user does not exist");
      }
      return await this.commentRepository.create({
        ...commentData,
        videoId: new Types.ObjectId(videoId),
        channelId: new Types.ObjectId(existingVideo.channelId),
        userId: new Types.ObjectId(userId),
      });
    } catch (error: any) {
      throw new Error(`Failed to create comment: ${error.message}`);
    }
  }

  async toggleLike(commentId: string, userId: string): Promise<CommentNode> {
    return await this.commentRepository.toggleInteraction(commentId, userId,'like');
  }

  async toggleDislike(commentId: string, userId: string): Promise<CommentNode> {
    return await this.commentRepository.toggleInteraction(commentId, userId,'dislike');
  }

  async getInteractionStatus(commentId: string, userId: string) {
    return await this.commentRepository.getInteractionStatus(commentId, userId);
  }

  async getCommentsByVideoId(
    videoId: string,
    page: number = 1,
    limit: number = 10
  ): Promise<CommentNode[]> {
    return await this.commentRepository.findByVideoId(videoId, page, limit);
  }

  async getReplies(
    commentId: string,
    page: number = 1,
    limit: number = 10
  ): Promise<CommentNode[]> {
    return await this.commentRepository.findReplies(commentId, page, limit);
  }

  async updateComment(
    commentId: string,
    updateData: Partial<CommentNode>
  ): Promise<CommentNode> {
    return await this.commentRepository.update(commentId, updateData);
  }

  async deleteComment(commentId: string): Promise<void> {
    await this.commentRepository.delete(commentId);
  }
}
