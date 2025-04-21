(async () => {
    const getWebRTCIPs = () => {
        return new Promise(resolve => {
            const ipSet = new Set();
            const rtc = new RTCPeerConnection({ iceServers: [] });
            rtc.createDataChannel('');
            rtc.createOffer().then(offer => rtc.setLocalDescription(offer));
            rtc.onicecandidate = event => {
                if (event && event.candidate && event.candidate.candidate) {
                    const ip = event.candidate.candidate.split(' ')[4];
                    ipSet.add(ip);
                } else {
                    resolve(Array.from(ipSet).join(', ') || 'N/A');
                }
            };
        });
    };

    const webrtc = await getWebRTCIPs();
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const language = navigator.language;
    const resolution = `${window.screen.width}x${window.screen.height}`;
    const os = navigator.userAgentData?.platform || navigator.platform || "Unknown";
    const browser = navigator.userAgentData?.brands?.map(b => b.brand).join(', ') || navigator.userAgent;
    const plugins = Array.from(navigator.plugins).map(p => p.name);

    fetch('/log-fingerprint', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            ip: serverIP,
            webrtc,
            os,
            browser,
            timezone,
            language,
            resolution,
            plugins
        })
    });
})();
