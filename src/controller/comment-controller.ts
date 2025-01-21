import { Request, RequestHandler, Response } from "express";
import { ValidationError } from "../_lib/utils/errors/validationError";
import { CommentService } from "../services/comment-service";
import { RabbitMQConnection, RabbitMQProducer } from "streamrx_common";

export class CommentController {
  constructor(private commentService: CommentService) {}

  createComment: RequestHandler = async (req, res, next) => {
    try {
      const { videoId } = req.params;
      const { userId, text, parentId } = req.body;
      console.log(req.body, "fsflfjalfkjslk");
      console.log(parentId, "parentID got");

      if (!text) {
        throw new ValidationError([
          {
            fields: ["text"],
            constants: "Comment text is required.",
          },
        ]);
      }

      const comment = await this.commentService.createComment(
        { text, parentId },
        videoId,
        userId
      );

      res.status(201).json(comment);
    } catch (error) {
      next(error);
    }
  };

  getVideoComments: RequestHandler = async (req, res, next) => {
    try {
      const { videoId } = req.params;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;

      const comments = await this.commentService.getCommentsByVideoId(
        videoId,
        page,
        limit
      );

      res.status(200).json({
        success: true,
        data: comments,
        pagination: { page, limit },
      });
    } catch (error) {
      next(error);
    }
  };

  getReplies: RequestHandler = async (req, res, next) => {
    try {
      const { commentId } = req.params;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;

      const replies = await this.commentService.getReplies(
        commentId,
        page,
        limit
      );

      res.status(200).json({
        success: true,
        data: replies,
        pagination: { page, limit },
      });
    } catch (error) {
      next(error);
    }
  };

  updateComment: RequestHandler = async (req, res, next) => {
    try {
      const { commentId } = req.params;
      const updateData = req.body;

      const comment = await this.commentService.updateComment(
        commentId,
        updateData
      );

      res.status(200).json(comment);
    } catch (error) {
      next(error);
    }
  };

  deleteComment: RequestHandler = async (req, res, next) => {
    try {
      const { commentId } = req.params;
      await this.commentService.deleteComment(commentId);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  };
}
