document.getElementById("fetchYouTube").addEventListener("click", function () {
  console.log("Button clicked"); // Log line
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    const tab = tabs[0];
    const url = tab.url;
    console.log("Sending message:", url); // Log line
    chrome.tabs.sendMessage(tab.id, { action: "fetchYouTubeURL", url: url });
  });
});
