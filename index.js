const express = require('express');
const axios = require('axios');
const path = require('path');
const fs = require('fs');
const app = express();
const port = process.env.PORT || 3000;

// Replace this with your token from ipinfo.io
const IPINFO_TOKEN = 'bfc20db1153926';

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.get('/', async (req, res) => {
    const userIP = req.headers['x-forwarded-for']?.split(',')[0] || req.socket.remoteAddress;

    try {
        const response = await axios.get(`https://ipinfo.io/${userIP}?token=${IPINFO_TOKEN}`);
        const data = response.data;

        const isVPN = data.privacy?.vpn || false;

        if (isVPN) {
            const log = `[VPN DETECTED] IP: ${data.ip} | ISP: ${data.org} | Country: ${data.country} | Location: ${data.city}\n`;
            console.log(log);
            fs.appendFileSync('vpn-log.txt', log);
        }

        res.render('landing', {
            ip: data.ip,
            country: data.country,
        });

    } catch (err) {
        console.error("Error fetching IP info:", err.message);
        res.send('Something went wrong.');
    }
});

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
