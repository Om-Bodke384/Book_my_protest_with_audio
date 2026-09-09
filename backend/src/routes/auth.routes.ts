import { Router } from "express";
import {
  registerProtester,
  loginProtester,
  googleAuthProtester,
  registerAdmin,
  loginAdmin,
  googleAuthAdmin,
  refresh,
  logout,
} from "../controllers/auth.controller.js";
import { makeUploader } from "../middleware/upload.js";

const router = Router();
const uploadPhoto = makeUploader(5);

router.post("/protester/register", uploadPhoto.single("photo"), registerProtester);
router.post("/protester/login", loginProtester);
router.post("/protester/google", googleAuthProtester);

router.post("/admin/register", registerAdmin);
router.post("/admin/login", loginAdmin);
router.post("/admin/google", googleAuthAdmin);

router.post("/refresh", refresh);
router.post("/logout", logout);

export default router;
