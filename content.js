console.log("Content script loaded");

// Listen for messages from the popup script
chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
  console.log("Received message:", message);

  if (message.action === "fetchYouTubeURL") {
    const url = message.url;
    console.log("Received message with URL:", url);

    // Extract the video ID from the YouTube URL
    const videoId = url.match(/[?&]v=([^&]+)/)[1];
    console.log("Extracted videoId:", videoId);

    // Send the videoId back to the popup script
    sendResponse({ videoId: videoId });
  }
});
