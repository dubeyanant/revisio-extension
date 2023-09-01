import { SUPABASE_URL, SUPABASE_API_KEY, TABLE_NAME } from "./config.js";

let user_id = "null";

// Listen for messages from contentScript.js
chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
  if (message.webPageData) {
    user_id = message.webPageData;
    console.log("User ID from contentScript.js:", user_id);
    sendResponse({ confirmation: "Message received in popup" });

    // Display the user ID in the dataDisplay div
    displayData(user_id);
  }
});

// Function to display data in the popup
function displayData(data) {
  const dataDisplay = document.getElementById("dataDisplay");
  dataDisplay.textContent = data ? `User ID: ${data}` : "No data available.";
}

// Function to fetch data from the web page
function fetchDataFromWebPage() {
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
            throw new Error("Same URL exists. Try other URL.");
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
}

document
  .getElementById("fetchUrl")
  .addEventListener("click", fetchDataFromWebPage);

// Retrieve and display data when the popup is opened
// fetchDataFromWebPage();
