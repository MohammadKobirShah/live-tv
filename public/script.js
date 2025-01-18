let channels = [];
let cacheKey = "live_tv_channels";

async function fetchPlaylist(url) {
    try {
        const response = await fetch(url);
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
    const playlistUrl = prompt("https://raw.githubusercontent.com/MohammadKobirShah/ToffeeWeb/refs/heads/main/TATA_TV6.m3u");
    if (!playlistUrl) {
        alert("Playlist URL is required!");
        return;
    }

    const cachedData = localStorage.getItem(cacheKey);
    if (cachedData) {
        channels = JSON.parse(cachedData);
    } else {
        channels = await fetchPlaylist(playlistUrl);
        localStorage.setItem(cacheKey, JSON.stringify(channels));
    }
    renderChannels();
    populateCategoryFilter();
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

function populateCategoryFilter() {
    const categorySelect = document.getElementById("categorySelect");
    const categories = [...new Set(channels.map(channel => channel.group))];
    categorySelect.innerHTML = `<option value="">All Categories</option>` +
        categories.map(category => `<option value="${category}">${category}</option>`).join("");
}

function filterByCategory() {
    const selectedCategory = document.getElementById("categorySelect").value;
    const filteredChannels = selectedCategory
        ? channels.filter(channel => channel.group === selectedCategory)
        : channels;

    const grid = document.getElementById("channelGrid");
    grid.innerHTML = filteredChannels.map(channel => `
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
