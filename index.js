const express = require('express');
const axios = require('axios');
const path = require('path');
const fs = require('fs');
const app = express();
const port = process.env.PORT || 3000;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.get('/', async (req, res) => {
    const userIP = req.headers['x-forwarded-for']?.split(',')[0] || req.socket.remoteAddress;

    try {
        const response = await axios.get(`https://ip-api.com/json/${userIP}?fields=status,message,country,regionName,city,isp,org,proxy,hosting,query`);
        const data = response.data;

        const isVPN = data.proxy || data.hosting;

        if (isVPN) {
            const timestamp = new Date().toISOString();
            const log = `[${timestamp}] [VPN DETECTED] IP: ${data.query} | ISP: ${data.isp} | Country: ${data.country} | Host: ${data.hosting}\n`;
            console.log(log);
            fs.appendFileSync('vpn-log.txt', log);
        }

        res.render('landing', {
            ip: data.query,
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
