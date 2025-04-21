(async () => {
    const getWebRTCIps = async () => {
        return new Promise((resolve) => {
            const ips = new Set();
            const pc = new RTCPeerConnection({ iceServers: [] });
            pc.createDataChannel("");
            pc.createOffer().then(offer => pc.setLocalDescription(offer));
            pc.onicecandidate = event => {
                if (event?.candidate?.candidate) {
                    const match = event.candidate.candidate.match(/([0-9]{1,3}(\.[0-9]{1,3}){3})/);
                    if (match) ips.add(match[1]);
                } else if (!event.candidate) {
                    resolve(Array.from(ips));
                }
            };
        });
    };

    const getBrowserInfo = () => {
        const ua = navigator.userAgent;
        let browser = 'Unknown';
        if (ua.includes("Firefox")) browser = "Firefox";
        else if (ua.includes("Chrome")) browser = "Chrome";
        else if (ua.includes("Safari")) browser = "Safari";
        else if (ua.includes("Edge")) browser = "Edge";
        let os = 'Unknown';
        if (ua.includes("Win")) os = "Windows";
        else if (ua.includes("Mac")) os = "MacOS";
        else if (ua.includes("Linux")) os = "Linux";
        return { browser, os };
    };

    const plugins = [];
    for (let i = 0; i < navigator.plugins.length; i++) {
        plugins.push(navigator.plugins[i].name);
    }

    const webrtcIPs = await getWebRTCIps();
    const { browser, os } = getBrowserInfo();
    const data = {
        ip: '<%= ip %>', // Will be overwritten server-side if spoofed
        webrtcIPs,
        os,
        browser,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        language: navigator.language,
        resolution: `${window.screen.width}x${window.screen.height}`,
        plugins
    };

    fetch('/report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data })
    });
})();
