import express from 'express';
import { verifyToken } from '../utils/verifyUser.js';
import { 
  createSadhanaForm, 
  getdatainExcel,
  getCurrentUserForms 
} from '../controllers/sadhanaform.controller.js';

const router = express.Router();

// Protected routes
router.post('/', verifyToken, createSadhanaForm);
router.get('/excel/:userId', verifyToken, getdatainExcel);
router.get('/my-forms', verifyToken, getCurrentUserForms);

export default router;