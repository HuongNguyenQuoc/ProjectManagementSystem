import { Router } from "express";
import { createCommentController, listCommentsByTaskController } from "../controllers/comment.controller.js";
const commentRouter = Router({ mergeParams: true });
commentRouter.post('/', createCommentController);
commentRouter.get('/', listCommentsByTaskController);
export default commentRouter;
//# sourceMappingURL=comment.routes.js.map