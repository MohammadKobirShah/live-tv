const playlistUrl = "https://raw.githubusercontent.com/MohammadKobirShah/mix/refs/heads/main/jsyz.m3u8";
let channels = [];
let cacheKey = "live_tv_channels";

async function fetchPlaylist() {
    try {
        const response = await fetch(playlistUrl);
        if (!response.ok) throw new Error(`Failed to fetch playlist: ${response.statusText}`);
        const content = await response.text();
        return parseM3U(content); // Parse the content
    } catch (error) {
        alert(`Error: ${error.message}`);
        return [];
    }
}

// Default M3U Parser
function parseM3U(content) {
    const lines = content.split("\n");
    const extractedChannels = [];
    let currentChannel = {};

    for (const line of lines) {
        const trimmedLine = line.trim();

        if (trimmedLine.startsWith("#EXTINF:")) {
            // Extract channel metadata from the EXTINF line
            const nameMatch = trimmedLine.match(/,(.+)$/);
            currentChannel.name = nameMatch ? nameMatch[1] : "Unknown";
        } else if (trimmedLine.startsWith("http")) {
            // Extract the URL for the channel
            currentChannel.url = trimmedLine;
            extractedChannels.push(currentChannel);
            currentChannel = {}; // Reset for the next channel
        }
    }

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
        <div class="card" onclick="openPlayer('${channel.url}', '${channel.name}')">
            <div class="overlay">${channel.name}</div>
        </div>
    `).join("");
}

function openPlayer(url, name) {
    window.location.href = `player.html?url=${encodeURIComponent(url)}&name=${encodeURIComponent(name)}`;
}

function filterByCategory() {
    const selectedCategory = document.getElementById("categorySelect").value.toLowerCase();
    const filteredChannels = selectedCategory
        ? channels.filter(ch => ch.group && ch.group.toLowerCase() === selectedCategory)
        : channels;

    displayChannels(filteredChannels);
}

function showSuggestions() {
    const input = document.getElementById('searchBox').value.toLowerCase();
    const suggestions = channels.filter(ch => ch.name.toLowerCase().includes(input));
    const suggestionBox = document.getElementById('suggestions');

    suggestionBox.innerHTML = suggestions
        .map(s => `<div onclick="openPlayer('${s.url}', '${s.name}')">${s.name}</div>`)
        .join("");

    suggestionBox.classList.toggle("active", suggestions.length > 0);
}

async function refreshPlaylist() {
    channels = await fetchPlaylist();
    localStorage.setItem(cacheKey, JSON.stringify(channels));
    displayChannels();
}

window.onload = loadPlaylist;
