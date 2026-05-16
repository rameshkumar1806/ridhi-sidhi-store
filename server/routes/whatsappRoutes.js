import express from 'express';
import { handleIncomingMessage, verifyWebhook } from '../controllers/whatsappController.js';

const router = express.Router();

// Meta / Facebook requires a GET request to verify the webhook URL
router.get('/webhook', verifyWebhook);

// The actual POST endpoint where WhatsApp forwards incoming messages
router.post('/webhook', handleIncomingMessage);

export default router;
