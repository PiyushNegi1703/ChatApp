import express from "express";
import { createChat, getChats, updateChat } from "../controllers/chatController.js";

const router = express.Router();

router.post("/create", createChat);
router.post("/", getChats);
router.post("/update", updateChat);

export { router };