import { Router } from 'express';
import { addMemberToProjectController, createProjectController, getProjectByIdController, listProjectsController, updateProjectController } from '../controllers/project.controller.js';
import { requireAuth } from '../middlewares/requireAuth.js';
import taskRouter from './task.routes.js';

const projectRouter = Router();

projectRouter.use(requireAuth);

projectRouter.post('/', createProjectController);
projectRouter.get('/', listProjectsController);
projectRouter.get('/:projectId', getProjectByIdController);
projectRouter.patch('/:projectId', updateProjectController);
projectRouter.post('/:projectId/members', addMemberToProjectController);

projectRouter.use('/:projectId/tasks', taskRouter);

export default projectRouter;
