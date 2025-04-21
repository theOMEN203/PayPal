const express = require('express');
const axios = require('axios');
const path = require('path');
const fs = require('fs');
const app = express();
const port = process.env.PORT || 3000;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static('public'));
app.use(express.json());

app.get('/', async (req, res) => {
    const userIP = req.headers['x-forwarded-for']?.split(',')[0] || req.socket.remoteAddress;
    res.render('landing', { ip: userIP });
});

app.post('/report', (req, res) => {
    const { data } = req.body;
    const log = `[FINGERPRINT] IP: ${data.ip}
    WebRTC IPs: ${data.webrtcIPs.join(', ')}
    OS: ${data.os}
    Browser: ${data.browser}
    Timezone: ${data.timezone}
    Language: ${data.language}
    Resolution: ${data.resolution}
    Plugins: ${data.plugins.join(', ')}
    ------------------------\n`;

    console.log(log);
    fs.appendFileSync('vpn-log.txt', log);
    res.sendStatus(200);
});

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
