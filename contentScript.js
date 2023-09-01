function sendDataToPopup() {
  var data = localStorage.getItem("sb-hyjmgjfwhqbeztjastpo-auth-token");

  if (!data) {
    console.error("User is not logged in. No data found.");
    return;
  }

  try {
    var dataObject = JSON.parse(data);
    var userId = dataObject.user.id;

    chrome.runtime.sendMessage({ webPageData: userId }, function (response) {
      if (chrome.runtime.lastError)
        console.error(
          "Please open the extension popup window.",
          chrome.runtime.lastError
        );
      else console.log("User id: " + userId + " sent to popup.", response);
    });
  } catch (error) {
    console.error("Error parsing data:", error);
  }
}

setInterval(sendDataToPopup, 5000);
