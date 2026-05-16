import asyncHandler from 'express-async-handler';
// import { GoogleGenerativeAI } from '@google/generative-ai'; // Uncomment if using Gemini API

// @desc    Handle incoming WhatsApp messages via Webhook
// @route   POST /api/whatsapp/webhook
// @access  Public (should verify signature in production)
export const handleIncomingMessage = asyncHandler(async (req, res) => {
  // Twilio sends data in req.body.Body (the message) and req.body.From (sender's number)
  // Meta sends data in a slightly different nested JSON structure. 
  // We'll assume a generic or Twilio-like structure for this example.
  
  const incomingMsg = req.body.Body?.toLowerCase() || req.body.text?.toLowerCase() || '';
  const senderNumber = req.body.From || req.body.sender || '';

  console.log(`Received WhatsApp message from ${senderNumber}: ${incomingMsg}`);

  let replyText = '';

  // Simple hardcoded AI logic
  if (incomingMsg.includes('hi') || incomingMsg.includes('hello')) {
    replyText = "Hello! Welcome to Ridhi Sidhi General Store. 🛒\n\nI am your AI assistant. Which product are you looking for today?";
  } 
  else if (incomingMsg.includes('dal') || incomingMsg.includes('rice') || incomingMsg.includes('sugar')) {
    replyText = `We have premium quality ${incomingMsg} in stock! Would you like to know the prices or place an order?`;
  }
  else if (incomingMsg.includes('order')) {
    replyText = "Great! Please list the items and quantities you want to order, along with your delivery address.";
  }
  else {
    replyText = "I'm still learning! You can ask me about our products like Dals, Rice, Oils, or type 'order' to place a new order.";
  }

  // --- OPTIONAL: Real AI Integration ---
  // If you want a real AI, you can connect Google Gemini or OpenAI here:
  // const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  // const model = genAI.getGenerativeModel({ model: "gemini-pro" });
  // const result = await model.generateContent(`You are a grocery store assistant. A customer says: ${incomingMsg}`);
  // replyText = result.response.text();

  console.log(`Sending reply: ${replyText}`);

  // Send response back (Format depends on your provider. Twilio uses TwiML XML, Meta uses JSON)
  
  // Example for Twilio TwiML response:
  /*
  res.set('Content-Type', 'text/xml');
  res.send(`
    <Response>
      <Message>${replyText}</Message>
    </Response>
  `);
  */

  // Example for standard JSON response (Meta / generic):
  res.status(200).json({
    success: true,
    reply: replyText
  });
});

// @desc    Verify Webhook (Used by Meta to verify the endpoint)
// @route   GET /api/whatsapp/webhook
// @access  Public
export const verifyWebhook = asyncHandler(async (req, res) => {
  const verify_token = process.env.WHATSAPP_VERIFY_TOKEN || 'ridhi_sidhi_token';
  
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode && token) {
    if (mode === 'subscribe' && token === verify_token) {
      console.log('WEBHOOK_VERIFIED');
      res.status(200).send(challenge);
    } else {
      res.sendStatus(403);
    }
  } else {
    res.status(400).send('Missing parameters');
  }
});
