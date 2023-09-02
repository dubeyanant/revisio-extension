import { SUPABASE_URL, SUPABASE_API_KEY, TABLE_NAME } from "./config.js";

let user_id = null;

chrome.storage.local.get("userId", function (result) {
  user_id = result.userId || null;
  console.log("Retrieved User ID from Chrome Storage:", user_id);
  displayData(user_id);
});

// Listen for messages from contentScript.js
chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
  if (message.webPageData) {
    user_id = message.webPageData;
    console.log("User ID from contentScript.js:", user_id);
    sendResponse({ confirmation: "Message received in popup" });

    // Store user_id in Chrome Storage
    chrome.storage.local.set({ userId: user_id }, function () {
      console.log("User ID stored in Chrome Storage.");
    });

    displayData(user_id);

    // Check if user_id is null
    if (user_id === null) {
      alert("Please sign in to Revisio");
      window.open("https://revisio.vercel.app/", "_blank");
    }
  }
});

// Function to display data in the popup
function displayData(data) {
  const dataDisplay = document.getElementById("dataDisplay");
  dataDisplay.textContent = data ? `User ID: ${data}` : "No data available.";
}

// Function to fetch data from the web page
function fetchDataFromWebPage() {
  // Check if user_id is not null before making the API request
  if (user_id !== null) {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      const tab = tabs[0];
      const url = tab.url;

      const data = {
        url: url,
        user_id: user_id,
      };

      fetch(`${SUPABASE_URL}/rest/v1/${TABLE_NAME}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          apikey: SUPABASE_API_KEY,
        },
        body: JSON.stringify(data),
      })
        .then((response) => {
          if (!response.ok) {
            if (response.status === 409)
              throw new Error("Same URL exists. Try another URL.");
            else if (response.status === 400)
              throw new Error("No user ID exists.");
            else throw new Error(`HTTP error! Status: ${response.status}`);
          }
          return response.text();
        })
        .then((data) => {
          if (!data)
            console.log(
              "Data inserted into Supabase successfully: No data returned from the Supabase API."
            );
          else console.log("Data inserted into Supabase successfully: ", data);
        })
        .catch((error) => {
          console.error("Error inserting data into Supabase:", error);
        });
    });
  } else {
    console.log("User not signed in. Cannot send data to the server.");
  }
}

document
  .getElementById("fetchUrl")
  .addEventListener("click", fetchDataFromWebPage);
