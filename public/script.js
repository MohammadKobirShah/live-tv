const playlistUrl = "https://github.com/MohammadKobirShah/mix/raw/refs/heads/main/jsyz.m3u8"; // Static playlist URL
let channels = [];
let cacheKey = "live_tv_channels";

async function fetchPlaylist() {
    try {
        const response = await fetch(playlistUrl);
        if (!response.ok) {
            throw new Error(`Failed to fetch playlist: ${response.statusText}`);
        }
        const content = await response.text();

        // Parse M3U content and return channels
        return parseM3U(content);
    } catch (error) {
        alert(error.message);
        return [];
    }
}

function parseM3U(content) {
    const lines = content.split("\n");
    const extractedChannels = [];
    let currentChannel = {};

    lines.forEach(line => {
        line = line.trim();

        // Extract channel metadata
        if (line.startsWith("#EXTINF:")) {
            const nameMatch = line.match(/,(.+)$/);
            const groupMatch = line.match(/group-title="([^"]+)"/);
            const logoMatch = line.match(/tvg-logo="([^"]+)"/);

            currentChannel = {
                name: nameMatch ? nameMatch[1] : "Unknown",
                group: groupMatch ? groupMatch[1] : "Unknown",
                logo: logoMatch ? logoMatch[1] : "fallback.png"
            };
        } else if (line.startsWith("http://port.denver1769.in")) {
            // Extract channel URL and push the channel
            currentChannel.url = line;
            extractedChannels.push(currentChannel);
            currentChannel = {};
        }
    });

    return extractedChannels;
}

async function loadPlaylist() {
    const cachedData = localStorage.getItem(cacheKey);
    if (cachedData) {
        channels = JSON.parse(cachedData);
    } else {
        channels = await fetchPlaylist();
        localStorage.setItem(cacheKey, JSON.stringify(channels));
    }
