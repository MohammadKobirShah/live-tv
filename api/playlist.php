<?php
header('Content-Type: application/json');

// Fetch and parse M3U playlist
function parseM3U($url) {
    $content = file_get_contents($url);
    if ($content === false) {
        return ["error" => "Unable to fetch the playlist from the URL."];
    }

    $lines = explode("\n", $content);
    $channels = [];
    $currentChannel = [];

    foreach ($lines as $line) {
        $line = trim($line);
        if (strpos($line, "#EXTINF:") === 0) {
            $nameMatch = preg_match("/,(.+)$/", $line, $nameMatches);
            $groupMatch = preg_match('/group-title="([^"]+)"/', $line, $groupMatches);
            $logoMatch = preg_match('/tvg-logo="([^"]+)"/', $line, $logoMatches);

            $currentChannel = [
                "name" => $nameMatch ? $nameMatches[1] : "Unknown",
                "group" => $groupMatch ? $groupMatches[1] : "Unknown",
                "logo" => $logoMatch ? $logoMatches[1] : "fallback.png"
            ];
        } elseif (filter_var($line, FILTER_VALIDATE_URL)) {
            $currentChannel["url"] = $line;
            $channels[] = $currentChannel;
            $currentChannel = [];
        }
    }

    return $channels;
}

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $url = $_GET['url'] ?? null;

    if (!$url || !filter_var($url, FILTER_VALIDATE_URL)) {
        echo json_encode(["error" => "Invalid or missing URL parameter."]);
        exit;
    }

    $channels = parseM3U($url);
    if (isset($channels["error"])) {
        echo json_encode($channels);
    } else {
        echo json_encode(["channels" => $channels]);
    }
} else {
    echo json_encode(["error" => "Only GET requests are supported."]);
}
?>
