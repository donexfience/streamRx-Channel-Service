import { CommentNode } from "../model/schema/comment.schema";

export interface ICommentRepository {
  create(commentData: Partial<CommentNode>): Promise<CommentNode>;
  update(
    commentId: string,
    updateData: Partial<CommentNode>
  ): Promise<CommentNode>;
  toggleInteraction(
    commentId: string,
    userId: string,
    interactionType: "like" | "dislike"
  ): Promise<CommentNode>; 
  delete(commentId: string): Promise<void>;
  findById(commentId: string): Promise<CommentNode>;
  findByVideoId(
    videoId: string,
    page: number,
    limit: number
  ): Promise<CommentNode[]>;
  findReplies(
    commentId: string,
    page: number,
    limit: number
  ): Promise<CommentNode[]>;
}
