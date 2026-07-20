import { Router } from 'express';
import { createProjectController, listProjectsController } from '../controllers/project.controller.js';
import { requireAuth } from '../middlewares/requireAuth.js';

const projectRouter = Router();

projectRouter.use(requireAuth);

projectRouter.post('/', createProjectController);
projectRouter.get('/', listProjectsController);

export default projectRouter;
