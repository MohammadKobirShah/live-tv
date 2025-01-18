const playlistUrl = "https://github.com/MohammadKobirShah/mix/raw/refs/heads/main/jsyz.m3u8";
let channels = [];
let cacheKey = "live_tv_channels";

async function fetchPlaylist() {
    try {
        const response = await fetch(playlistUrl);
        if (!response.ok) throw new Error(`Failed to fetch playlist: ${response.statusText}`);
        const content = await response.text();
        const parsedChannels = parseM3U(content);

        if (!parsedChannels.length) {
            throw new Error("No channels found in the playlist.");
        }

        return parsedChannels;
    } catch (error) {
        alert(`Error: ${error.message}`);
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
    if (cachedData) {
        channels = JSON.parse(cachedData);
    } else {
        channels = await fetchPlaylist();
        if (channels.length) {
            localStorage.setItem(cacheKey, JSON.stringify(channels));
        }
    }

    if (!channels.length) {
        alert("No channels to display. Please check your playlist or network.");
    }

    displayChannels();
}

function displayChannels() {
    const grid = document.getElementById("channelGrid");
    if (!channels.length) {
        grid.innerHTML = `<p>No channels available. Try refreshing the playlist.</p>`;
        return;
    }

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

function filterByCategory() {
    const selectedCategory = document.getElementById("categorySelect").value.toLowerCase();
    const filteredChannels = selectedCategory
        ? channels.filter(ch => ch.group.toLowerCase() === selectedCategory)
        : channels;

    displayChannels(filteredChannels);
}

function showSuggestions() {
    const input = document.getElementById('searchBox').value.toLowerCase();
    const suggestions = channels.filter(ch => ch.name.toLowerCase().includes(input));
    const suggestionBox = document.getElementById('suggestions');

    suggestionBox.innerHTML = suggestions
        .map(s => `<div onclick="openPlayer('${s.url}', '${s.name}', '${s.logo}')">${s.name}</div>`)
        .join("");

    suggestionBox.classList.toggle("active", suggestions.length > 0);
}

function toggleMenu() {
    document.getElementById("mobileMenu").classList.toggle("hidden");
}

function toggleTheme() {
    document.body.classList.toggle("light-theme");
}

async function refreshPlaylist() {
    channels = await fetchPlaylist();
    localStorage.setItem(cacheKey, JSON.stringify(channels));
    displayChannels();
}

window.onload = loadPlaylist;
