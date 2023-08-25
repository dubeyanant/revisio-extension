document.getElementById("fetchYouTube").addEventListener("click", function () {
  console.log("Button clicked"); // Log line
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    const tab = tabs[0];
    const url = tab.url;
    console.log("Sending message:", url); // Log line

    // Create a data object to send in the request body
    const data = { url: url };

    // Send a POST request to your API endpoint
    fetch("http://0.0.0.0:3000/url", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    })
      .then((response) => response.json())
      .then((data) => {
        console.log("API response:", data);
        // Handle the API response here, if needed
      })
      .catch((error) => {
        console.error("Error:", error);
        // Handle errors here, if needed
      });
  });
});
