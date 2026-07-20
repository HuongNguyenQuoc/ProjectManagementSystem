import { Router } from 'express';
import { createProjectController, listProjectsController } from '../controllers/project.controller.js';
import { requireAuth } from '../middlewares/requireAuth.js';
import taskRouter from './task.routes.js';
const projectRouter = Router();
projectRouter.use(requireAuth);
projectRouter.post('/', createProjectController);
projectRouter.get('/', listProjectsController);
projectRouter.use('/:projectId/tasks', taskRouter);
export default projectRouter;
//# sourceMappingURL=project.routes.js.map