import express from 'express';
const aiRouter =  express.Router();
import { makeWebsite} from './chatsai.js';

aiRouter.post('/chat', makeWebsite);

export default aiRouter;