const playlistUrl = "/playlist.m3u"; // Point to the static playlist.m3u file
let channels = [];
let cacheKey = "live_tv_channels";

async function fetchPlaylist() {
    try {
        const response = await fetch(playlistUrl);
        if (!response.ok) {
            throw new Error(`Failed to fetch playlist: ${response.statusText}`);
        }
        const content = await response.text();

        // Parse M3U content
        channels = parseM3U(content);
        return channels;
    } catch (error) {
        alert(error.message);
        return [];
    }
}

function parseM3U(content) {
    const lines = content.split("\n");
    const channels = [];
    let currentChannel = {};

    lines.forEach(line => {
        line = line.trim();
        if (line.startsWith("#EXTINF:")) {
            const nameMatch = line.match(/,(.+)$/);
            const groupMatch = line.match(/group-title="([^"]+)"/);
            const logoMatch = line.match(/tvg-logo="([^"]+)"/);

            currentChannel = {
                name: nameMatch ? nameMatch[1] : "Unknown",
                group: groupMatch ? groupMatch[1] : "Unknown",
                logo: logoMatch ? logoMatch[1] : "fallback.png"
            };
        } else if (line && !line.startsWith("#")) {
            currentChannel.url = line;
            channels.push(currentChannel);
            currentChannel = {};
        }
    });

    return channels;
}

async function loadPlaylist() {
    const cachedData = localStorage.getItem(cacheKey);
    if (cachedData) {
        channels = JSON.parse(cachedData);
    } else {
        channels = await fetchPlaylist();
        localStorage.setItem(cacheKey, JSON.stringify(channels));
    }
    renderChannels();
}

function renderChannels() {
    const grid = document.getElementById("channelGrid");
    grid.innerHTML = channels.map(channel => `
        <div class="card" onclick="goToPlayer('${channel.url}', '${channel.name}', '${channel.logo}')">
            <img src="${channel.logo}" alt="${channel.name}">
            <div>${channel.name}</div>
            <div>${channel.group}</div>
        </div>
    `).join("");
}

function goToPlayer(url, name, logo) {
    const playerPageUrl = `player.html?url=${encodeURIComponent(url)}&name=${encodeURIComponent(name)}&logo=${encodeURIComponent(logo)}`;
    window.location.href = playerPageUrl;
}

function clearCache() {
    localStorage.removeItem(cacheKey);
    alert("Cache cleared!");
}

function refreshPlaylist() {
    localStorage.removeItem(cacheKey);
    loadPlaylist();
}

loadPlaylist();
