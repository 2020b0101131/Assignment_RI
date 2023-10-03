import express from "express";
import { registerController, loginController, testController, forget_password, reset_password, editUser, deleteUser } from '../controllers/authController.js'
import { requireSignIn, isAdmin } from "../middlewares/authMiddleware.js";
//router object
const router = express.Router()
    //ROUTING
router.post('/register', registerController)
router.post('/login', loginController)
router.post('/forget-password', forget_password);
router.get('/reset-password', reset_password);
router.get("/test", requireSignIn, isAdmin, testController); //middleware
router.put('/:id', editUser)
router.delete('/:id', deleteUser)
export default router;