import express from "express";
const router = express.Router();
import RegController from "../controller/ApiController.js";
import checkUserAuth from "../middleware/auth-middleware.js";
//token required
router.use("/changepassword", checkUserAuth);
router.get(`/loggeduser`, checkUserAuth);

//Public Routes
router.post("/register", RegController.userRegistration);
router.post("/login", RegController.userLogin);
router.post(
  `/send-reset-password-email`,
  RegController.sendUserPasswordResetEmail
);
router.post(`/reset-password/:id/:token`, RegController.userPasswordReset);
router.get("/fetchall", RegController.fetchAllData);
//Protected Routes
router.post("/changepassword", RegController.changeUserPassword);
router.get(`/loggeduser`, RegController.loggedUser);

//Admin Routes
router.delete(`/deleteuser`, RegController.deleteUser);
router.get(`/ExcelSheet`, RegController.updateExcel);

export default router;
