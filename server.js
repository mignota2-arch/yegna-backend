const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// Create the Server and attach Socket.io
const server = http.createServer(app);
const io = socketIo(server, {
    cors: { origin: "*" } // Allows the frontend to connect
});

// ⚡ REAL-TIME LOGIC
io.on('connection', (socket) => {
    console.log('User connected to the engine 🚀');

    // Listen for the "place_order" signal from a customer
    socket.on('place_order', (orderData) => {
        console.log('New Order Received:', orderData);
        
        // Shout it out to every connected staff screen (Kitchen/Admin)
        io.emit('incoming_order', orderData);
    });

    socket.on('disconnect', () => {
        console.log('User disconnected ❌');
    });
});

// IMPORTANT: Use server.listen instead of app.listen
const PORT = 5000;
server.listen(PORT, () => {
    console.log(`Kitchen Engine is alive on port ${PORT} ⚡`);
});// 💳 TELEBIRR AUTOMATION
// This is the "Webhook" or "Callback" route
app.post('/api/telebirr/callback', async (req, res) => {
    // 1. Receive the data from Telebirr
    const { status, outTradeNo, msisdn } = req.body;

    console.log(`Checking payment for Order: ${outTradeNo}...`);

    // 2. Check if the payment was actually successful
    if (status === 'COMPLETED') {
        console.log(`✅ Success! Payment received from ${msisdn}`);

        // 3. SHOUT to the Frontend (Real-time update)
        // This tells the customer and the kitchen "It's Paid!" instantly
        io.emit('payment_success', { 
            orderId: outTradeNo, 
            message: "Payment Verified via Telebirr ⚡" 
        });
        
        // Note: Here is where you would update your MongoDB database
    }

    // 4. Always tell Telebirr you received the message
    res.status(200).send("ok");
});app.post('/api/login', async (req, res) => {
    const { email, password } = req.body;

    // 1. Find the user in your Database
    // (For now, we use a 'fake' check to help you debug)
    if (email === "admin@yegna.com" && password === "123456") {
        
        // 2. Create the Token with the 'admin' role
        const token = jwt.sign(
            { name: "Admin User", role: "admin" }, 
            process.env.JWT_SECRET, 
            { expiresIn: '1d' }
        );

        return res.json({ token });
    }

    res.status(401).json({ message: "Invalid email or password" });
});