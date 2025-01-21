import { Router } from "express";
import { CommentController } from "../controller/comment-controller";
import { CommentRepository } from "../repository/CommentRepository";
import { CommentService } from "../services/comment-service";
import { RabbitMQConnection } from "streamrx_common";
import { VideoRepository } from "../repository/VideoRepository";
import { UserRepository } from "../repository/userRepository";
import { ChannelRepostiory } from "../repository/ChannelRepository";

export class CommentRoutes {
  public router: Router;

  constructor() {
    this.router = Router();
    this.initRoutes();
  }

  private async initRoutes() {
    const videoRepository = new VideoRepository();
    const userRepository = new UserRepository();
    const channelRepository = new ChannelRepostiory();
    const commentRepository = new CommentRepository();
    const commentService = new CommentService(
      commentRepository,
      videoRepository,
      userRepository,
      channelRepository
    );
    const commentController = new CommentController(commentService);

    this.router.post(
      "/video/:videoId",
      commentController.createComment.bind(commentController)
    );

    this.router.get(
      "/comment/:videoId",
      commentController.getVideoComments.bind(commentController)
    );

    this.router.get(
      "/replies/:commentId",
      commentController.getReplies.bind(commentController)
    );

    this.router.put(
      "/:commentId",
      commentController.updateComment.bind(commentController)
    );

    this.router.delete(
      "/:commentId",
      commentController.deleteComment.bind(commentController)
    );
  }
}
