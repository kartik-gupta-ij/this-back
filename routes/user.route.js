import express from 'express';
import {
  test,
  updateUser,
  deleteUser,
  getAllUser,
  getRecentBirthdays,
  forgotPassword,
  verifyOTP,
  resetPassword,
  userToMaster,
  addUsersToMaster,
  updateRoleToAdmin,
  getMasterData,
  userStatus,getAllUnderMaster
} from '../controllers/user.controller.js';
import { verifyToken } from '../utils/verifyUser.js';
import { chatroom ,getAllChat} from '../controllers/chat.controllers.js';
import { sadhanafill } from '../controllers/sadhana.controllers.js';
import { MasterDetails } from '../controllers/master.controller.js';
const router = express.Router();

router.get('/', test);
router.post('/update/:id', verifyToken, updateUser);
router.get('/getallchat',getAllChat);
router.delete('/delete/:id', verifyToken, deleteUser);
router.post('/api/chatroom/:id',verifyToken,chatroom);
router.post('/api/sadhana/:id',verifyToken,sadhanafill);
router.get("/getuser", getAllUser);
router.get("/getMasterUser/:MasterId",getAllUnderMaster)
router.put("/update/:id", verifyToken, updateUser );
router.get("/api/getbirthday", verifyToken, getRecentBirthdays);
router.post("/forgetpassword", forgotPassword);
router.post("/verifyotp", verifyOTP);
router.post("/resetpassword", resetPassword);
router.post("/addmaster/:userId", userToMaster);
router.post("/userstatus/:userId", userStatus);
router.post("/addusertomaster/:userId",  addUsersToMaster);
router.post("/createadmin", updateRoleToAdmin);
router.get("/getmaster/:masterId", getMasterData);
router.get("/master/data",MasterDetails);

export default router;
