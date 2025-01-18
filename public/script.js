const playlistUrl = "https://github.com/MohammadKobirShah/mix/raw/refs/heads/main/jsyz.m3u8";
let channels = [];
let cacheKey = "live_tv_channels";

async function fetchPlaylist() {
    try {
        const response = await fetch(playlistUrl);
        if (!response.ok) throw new Error(`Failed to fetch playlist: ${response.statusText}`);
        return parseM3U(await response.text());
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
        if (line.startsWith("#EXTINF:")) {
            const nameMatch = line.match(/,(.+)$/);
            const groupMatch = line.match(/group-title="([^"]+)"/);
            const logoMatch = line.match(/tvg-logo="([^"]+)"/);
            currentChannel = {
                name: nameMatch ? nameMatch[1] : "Unknown",
                group: groupMatch ? groupMatch[1] : "Unknown",
                logo: logoMatch ? logoMatch[1] : "fallback.png"
            };
        } else if (line.startsWith("http")) {
            currentChannel.url = line;
            extractedChannels.push(currentChannel);
            currentChannel = {};
        }
    });

    return extractedChannels;
}

async function loadPlaylist() {
    const cachedData = localStorage.getItem(cacheKey);
    channels = cachedData ? JSON.parse(cachedData) : await fetchPlaylist();
    if (!cachedData) localStorage.setItem(cacheKey, JSON.stringify(channels));
    displayChannels();
}

function displayChannels() {
    const grid = document.getElementById("channelGrid");
    grid.innerHTML = channels.map(channel => `
        <div class="card" onclick="openPlayer('${channel.url}', '${channel.name}', '${channel.logo}')">
            <img src="${channel.logo}" loading="lazy" alt="${channel.name}">
            <div class="overlay">${channel.name}</div>
        </div>
    `).join("");
}

function openPlayer(url, name, logo) {
    window.location.href = `player.html?url=${url}&name=${name}&logo=${logo}`;
}

function toggleMenu() {
    document.getElementById("mobileMenu").classList.toggle("hidden");
}

function toggleTheme() {
    document.body.classList.toggle("light-theme");
}

function shareChannel(name, url) {
    navigator.share({ title: name, url: url });
}

window.onload = loadPlaylist;
