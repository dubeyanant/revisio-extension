import { SUPABASE_URL, SUPABASE_API_KEY, TABLE_NAME } from "./config.js";

let user_id = null;

chrome.storage.local.get("userId", function (result) {
  user_id = result.userId || null;
  console.log("Retrieved User ID from Chrome Storage:", user_id);
  //displayData(user_id);
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

    //displayData(user_id);

    // Check if user_id is null
    if (user_id === null) {
      alert("Please sign in to Revisio");
      window.open("https://revisio.vercel.app/", "_blank");
    }
  }
});

/**
 * Function to display data in the popup
 * @param {string} data - Unique ID for the user
 */
function displayData(data) {
  const dataDisplay = document.getElementById("dataDisplay");
  dataDisplay.textContent = data ? `Error: ${data}` : "No error :D";
}

/**
 * Function to inject the <img> element back into the button
 * @param {string} src - The source URL for the image
 * @param {int} place - 0 for before the text element and 1 for after the text element
 */
function injectImgElement(src, place) {
  const fetchButton = document.getElementById("fetchUrl");
  if (fetchButton) {
    const imgElement = document.createElement("img");

    imgElement.src = src;
    imgElement.alt = "button icon";
    imgElement.className = "main__button__icon";

    const textNode = fetchButton.childNodes[place];

    fetchButton.insertBefore(imgElement, textNode);
  }
}

// Function to fetch data from the web page
async function fetchDataFromWebPage() {
  // Select the button and the img element
  const fetchButton = document.getElementById("fetchUrl");
  fetchButton.disabled = true;

  // Store the current button text
  const originalButtonText = fetchButton.textContent;

  // Update button text to "Sending"
  fetchButton.textContent = "Sending";
  injectImgElement("sending.svg", 1);

  // Check if user_id is not null before making the API request
  if (user_id !== null) {
    try {
      const tabs = await chrome.tabs.query({
        active: true,
        currentWindow: true,
      });

      const tab = tabs[0];
      const url = tab.url;

      const data = {
        url: url,
        user_id: user_id,
      };

      const response = await fetch(`${SUPABASE_URL}/rest/v1/${TABLE_NAME}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          apikey: SUPABASE_API_KEY,
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        if (response.status === 409) {
          fetchButton.textContent = "Error";
          injectImgElement("error.svg", 1);
          displayData("Same URL exists. Try another URL.");
          setTimeout(() => {
            fetchButton.textContent = originalButtonText;
            injectImgElement("plus.svg", 0);
          }, 2000);
          throw new Error("Same URL exists. Try another URL.");
        } else if (response.status === 400) {
          fetchButton.textContent = "Error";
          injectImgElement("error.svg", 1);
          displayData("No user exists.");
          setTimeout(() => {
            fetchButton.textContent = originalButtonText;
            injectImgElement("plus.svg", 0);
          }, 2000);
          throw new Error("No user ID exists.");
        } else {
          fetchButton.textContent = "Error";
          injectImgElement("error.svg", 1);
          displayData("Occurred :X");
          setTimeout(() => {
            fetchButton.textContent = originalButtonText;
            injectImgElement("plus.svg", 0);
          }, 2000);
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
      }

      // Update button text to "Done" after successful response
      fetchButton.textContent = "Done";
      injectImgElement("check.svg", 1);
      displayData(null);
      setTimeout(() => {
        fetchButton.textContent = originalButtonText;
        injectImgElement("plus.svg", 0);
      }, 2000);

      const responseData = await response.text();

      if (!responseData) {
        console.log(
          "Data inserted into Supabase successfully: No data returned from the Supabase API."
        );
      }
    } catch (error) {
      console.error("Error inserting data into Supabase:", error);
    } finally {
      fetchButton.disabled = false;
    }
  } else {
    console.log("User not signed in. Cannot send data to the server.");
  }
}

document
  .getElementById("fetchUrl")
  .addEventListener("click", fetchDataFromWebPage);
