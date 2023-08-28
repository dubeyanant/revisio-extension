const SUPABASE_URL = "https://hyjmgjfwhqbeztjastpo.supabase.co";
const SUPABASE_API_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh5am1namZ3aHFiZXp0amFzdHBvIiwicm9sZSI6ImFub24iLCJpYXQiOjE2OTMwNzI0NDIsImV4cCI6MjAwODY0ODQ0Mn0.uRcmey3xR0bvr_8zXliud2Ebqk7i59TtVabVJljwssE";
const TABLE_NAME = "links";
const user_id = "b0ee4911-7cb9-4196-8a0a-8d779cd64ad7";

document.getElementById("fetchUrl").addEventListener("click", function () {
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
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.text();
      })
      .then((data) => {
        console.log("Data inserted into Supabase:", data);
      })
      .catch((error) => {
        console.error("Error inserting data into Supabase:", error);
      });
  });
});
