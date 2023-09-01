var isInitialDataSent = false; // Flag to track initial data sent

// Initialize a variable to store the last sent data
var lastSentData = null;

function sendDataToPopup() {
  var data = localStorage.getItem("sb-hyjmgjfwhqbeztjastpo-auth-token");

  if (!data) {
    console.error("User is not logged in. No data found.");
    return;
  }

  try {
    var dataObject = JSON.parse(data);
    var userId = dataObject.user.id;

    // Check if the data has changed since the last sent data
    if (JSON.stringify(dataObject) !== JSON.stringify(lastSentData)) {
      // Send the message to the popup
      chrome.runtime.sendMessage({ webPageData: userId }, function (response) {
        if (chrome.runtime.lastError) {
          console.error(
            "Please open the extension popup window.",
            chrome.runtime.lastError
          );
        } else {
          console.log("User id: " + userId + " sent to popup.", response);

          // Update the last sent data
          lastSentData = dataObject;

          // Set the flag after the initial data is sent successfully
          if (!isInitialDataSent) {
            isInitialDataSent = true;
          }
        }
      });
    } else if (!isInitialDataSent) {
      // If the data hasn't changed but the initial data hasn't been sent yet, send it now
      chrome.runtime.sendMessage({ webPageData: userId }, function (response) {
        if (!chrome.runtime.lastError) {
          console.log(
            "User id: " + userId + " sent to popup (initial).",
            response
          );

          // Update the last sent data
          lastSentData = dataObject;

          // Set the flag after the initial data is sent successfully
          isInitialDataSent = true;
        }
      });
    }
  } catch (error) {
    console.error("Error parsing data:", error);
  }
}

// Initially call sendDataToPopup to send data if it exists
sendDataToPopup();

// Then set up an interval to periodically call sendDataToPopup
setInterval(sendDataToPopup, 5000);
