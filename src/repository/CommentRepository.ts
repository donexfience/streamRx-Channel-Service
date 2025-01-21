import Comment, { CommentNode } from "../model/schema/comment.schema";
import { ICommentRepository } from "../interfaces/ICommentRepository";
import mongoose from "mongoose";

export class CommentRepository implements ICommentRepository {
  async create(commentData: Partial<CommentNode>): Promise<CommentNode> {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const comment = new Comment(commentData);
      console.log(comment, "comment created");

      if (commentData.parentId) {
        const parentComment = await Comment.findById(commentData.parentId);
        if (!parentComment) {
          throw new Error("Parent comment not found");
        }

        comment.depth = parentComment.depth + 1;
        comment.path = parentComment.path
          ? `${parentComment.path}.${comment._id}`
          : comment._id.toString();

        // Update parent's children array
        await Comment.findByIdAndUpdate(
          parentComment._id,
          { $push: { children: comment._id } },
          { session }
        );
      } else {
        comment.path = comment._id.toString();
      }

      await comment.save({ session });
      await session.commitTransaction();
      return comment.toObject();
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  async update(
    commentId: string,
    updateData: Partial<CommentNode>
  ): Promise<CommentNode> {
    const comment = await Comment.findByIdAndUpdate(commentId, updateData, {
      new: true,
    });
    if (!comment) {
      throw new Error(`Comment with ID ${commentId} not found`);
    }
    return comment;
  }

  async delete(commentId: string): Promise<void> {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const comment = await Comment.findById(commentId);
      if (!comment) {
        throw new Error(`Comment with ID ${commentId} not found`);
      }

      // Delete all replies (children) recursively
      await Comment.deleteMany(
        {
          path: new RegExp(`^${comment.path}\\.`),
        },
        { session }
      );

      // Remove the comment from its parent's children array
      if (comment.parentId) {
        await Comment.findByIdAndUpdate(
          comment.parentId,
          { $pull: { children: comment._id } },
          { session }
        );
      }

      // Delete the comment itself
      await Comment.findByIdAndDelete(commentId, { session });

      await session.commitTransaction();
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  async findById(commentId: string): Promise<CommentNode> {
    const comment = await Comment.findById(commentId)
      .populate("userId", "name avatar")
      .exec();
    if (!comment) {
      throw new Error(`Comment with ID ${commentId} not found`);
    }
    return comment;
  }

  async findByVideoId(
    videoId: string,
    page: number = 1,
    limit: number = 10
  ): Promise<CommentNode[]> {
    return await Comment.find({
      videoId,
      parentId: null,
    })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate({
        path: "userId",
        select: "email username profileImageURL",
      });
    // .exec();
  }

  async findReplies(
    commentId: string,
    page: number = 1,
    limit: number = 10
  ): Promise<CommentNode[]> {
    const comment = await Comment.findById(commentId);
    if (!comment) {
      throw new Error(`Comment with ID ${commentId} not found`);
    }

    return await Comment.find({
      path: new RegExp(`^${comment.path}\\.`),
    })
      .sort({ createdAt: 1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate({
        path: "userId",
        select: "email username profileImageURL",
      });
  }
}
