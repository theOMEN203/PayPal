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
    console.log(`Incoming Request IP: ${userIP}`);

    try {
        const response = await axios.get(`http://ip-api.com/json/${userIP}?fields=status,message,country,regionName,city,isp,org,proxy,hosting,query`);
        const data = response.data;

        if (data.status !== 'success') {
            console.log(`IP lookup failed: ${data.message}`);
            return res.send('Could not fetch your IP data.');
        }

        const isVPN = data.proxy || data.hosting;

        // Log every visit with VPN status
        const log = `[VISIT] IP: ${data.query} | Country: ${data.country} | City: ${data.city || 'N/A'} | ISP: ${data.org || 'N/A'} | VPN: ${isVPN}\n`;
        console.log(log);
        fs.appendFileSync('vpn-log.txt', log);

        if (isVPN) {
            console.log(`[ALERT] VPN detected for IP ${data.query}`);
        }

        // Render the landing page with info
        res.render('landing', {
            ip: data.query,
            country: data.country,
            vpn: isVPN ? 'Yes' : 'No'
        });

    } catch (err) {
        console.error('Error fetching IP info:', err.message);
        res.send('Something went wrong.');
    }
});

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
