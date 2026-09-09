import { Router } from "express";
import {
  createProtest,
  listProtests,
  getProtest,
  myProtests,
  updateProtestStatus,
  joinProtest,
  leaveProtest,
} from "../controllers/protest.controller.js";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { makeUploader } from "../middleware/upload.js";

const router = Router();
const uploadBanner = makeUploader(8);

router.get("/", listProtests);
router.get("/mine", requireAuth, requireRole("admin"), myProtests);
router.get("/:id", getProtest);

router.post("/", requireAuth, requireRole("admin"), uploadBanner.single("banner"), createProtest);
router.patch("/:id/status", requireAuth, requireRole("admin"), updateProtestStatus);

router.post("/:id/join", requireAuth, requireRole("protester"), joinProtest);
router.delete("/:id/join", requireAuth, requireRole("protester"), leaveProtest);

export default router;
