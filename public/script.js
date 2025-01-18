const playlistUrl = "/api/playlist.php?url=https://raw.githubusercontent.com/MohammadKobirShah/ToffeeWeb/main/TATA_TV6.m3u";
let channels = [];
let cacheKey = "live_tv_channels";

async function fetchPlaylist() {
    try {
        const response = await fetch(playlistUrl);
        if (!response.ok) {
            throw new Error(`Failed to fetch playlist: ${response.statusText}`);
        }
        const data = await response.json();
        if (data.error) {
            throw new Error(data.error);
        }
        return data.channels;
    } catch (error) {
        alert(error.message);
        return [];
    }
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
