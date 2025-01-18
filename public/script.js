const playlistUrl = "/api/playlist.php?url=https://raw.githubusercontent.com/MohammadKobirShah/ToffeeWeb/main/TATA_TV6.m3u";
let channels = [];
let cacheKey = "live_tv_channels";

async function fetchPlaylist() {
    const response = await fetch(playlistUrl);
    if (!response.ok) {
        alert(`Failed to fetch playlist: ${response.statusText}`);
        return [];
    }
    const data = await response.json();
    if (data.error) {
        alert(data.error);
        return [];
    }
    return data.channels;
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
        <div class="card" onclick="playChannel('${channel.url}')">
            <img src="${channel.logo}" alt="${channel.name}">
            <div>${channel.name}</div>
            <div>${channel.group}</div>
        </div>
    `).join("");
}

function playChannel(url) {
    const player = document.getElementById("tvPlayer");
    player.src = url;
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
