const express = require("express");
const axios = require("axios");
const app = express();
const https = require("https");
const fs = require("fs");

let accessToken =''
let userId = null;

const optionSSL = {
  key: fs.readFileSync("./cert/key.pem"),
  cert: fs.readFileSync("./cert/cert.pem"),
};

// Define your Instagram credentials
// 1314798999165158
// ede75ef05e4d77e45a09bb5e26b598ee
const clientID = "1314798999165158";
const clientSecret = "ede75ef05e4d77e45a09bb5e26b598ee";
const redirectURI = "https://localhost:3000/auth/instagram/callback";

//1 
app.get("/auth/instagram", (req, res) => {
  // Redirect the user to Instagram's authorization URL
  const authURL = `https://api.instagram.com/oauth/authorize?client_id=${clientID}&redirect_uri=https://localhost:3000/auth/instagram/callback&response_type=code&scope=user_profile,user_media`;

  //   const authURL = `https://api.instagram.com/oauth/authorize?client_id=${clientID}&redirect_uri=${redirectURI}&response_type=code`;
  res.redirect(authURL);
});


//2
app.get("/auth/instagram/callback", async (req, res) => {
  const code = req.query.code;
console.log({
    client_id: clientID,
    client_secret: clientSecret,
    redirect_uri: redirectURI,
    code: {code},
    grant_type: "authorization_code",
  })
  // Exchange the authorization code for an access token
  try {
    const FormData = require('form-data');
const form = new FormData();

form.append('client_id', clientID);
form.append('client_secret', clientSecret);
form.append('redirect_uri', redirectURI);
form.append('grant_type', 'authorization_code');
form.append('code', code);

//     curl -X POST \
//   https://api.instagram.com/oauth/access_token \
//   -F client_id=1314798999165158 \
//   -F client_secret=ede75ef05e4d77e45a09bb5e26b598ee \
//   -F grant_type=authorization_code \
//   -F redirect_uri=https://localhost:3000/auth/instagram/callback \
//   -F code=AQBxzG3nUu-d1o8mn6ab8q91uuM97K0oCLLjaTKErkDB8YMRvM4DFZh_kGOrxpEAmT0R3hfe4Jp8TJqIcudVrwEpwBUna8RpUd7Ekark_YYPFlYPCIeqza9R3I8IDjF7yYq4Y8p29hMDGGEZUFfnu7tmb1D3nMmgq9kpCU14SOCAcRPcvvmiZYtXkTu6UY9R1i5NnOI_yIFZXLopoYAfQqkMVHnw9045A0Vc1cSFyzhsXQ
    const response = await axios.post(
      "https://api.instagram.com/oauth/access_token",
      form,
      {
        headers: {
          ...form.getHeaders(),
        },
      }
    );
     accessToken = response.data.access_token;
     userId = response.data.user_id;
    // Use the access token to make authenticated requests to Instagram's API
    // Fetch user data, username, followers, images, and videos here

    // Store the username in your database
    // Implement session management as needed

    res.send(`Authentication successful!
    accessToken: ${accessToken} , userId : ${userId}
    `);
  } catch (error) {
    // console.error(error);
    res.send("Authentication failed.");
  }
});


app.get('/instagram/user', async (req, res) => {
    try {
      // Make a GET request to the Instagram Graph API
      const response = await axios.get(`https://graph.instagram.com/me`, {
        params: {
          fields: 'id,username',
          access_token: 'IGQWRORGxNcllEZAFc4SUMwRUMybWQtTWtPREg1elhCRUpDVUk1WnlHN0d3WFlZASXhRemU5N0ExdzQ1T01LRi1XamtBSE5PN290bkxZAaTAtTDlVNE9xei1QUjJuNTd2YUNJRkNUYkVONjlQWjdPUjdNSVBSMGc1WTNyXy1DN091TXpndwZDZD',
        },
      });
  
      const userData = response.data;
      res.json(userData);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'An error occurred while fetching user data from Instagram.' });
    }
  });


  app.get('/instagram/user/images', async (req, res) => {
    try {
      // Make a GET request to the Instagram Graph API to fetch user's images
    //   https://graph.instagram.com/me/media?fields=id,caption&access_token=IGQVJ...'
      const response = await axios.get(`https://graph.instagram.com/me/media`, {
        params: {
          fields: 'id,media_url,caption',
          access_token: 'IGQWRNbWxmSFpRcEgySFpGWEhfS3RCa0V6VWJpTG82MDhTSXhfSGZA5UkptRWNQb29SMnJaQjlhd0JRTERtOU1fQjZAXcmNrVERudmhSbkI4OGVMYzlrdTZAPTUlEVElmY0lfb2pLM1lUUWh6UQZDZD',
        },
      });
  
      const imageData = response.data.data;
      res.json(imageData);
    } catch (error) {
      console.error(error.response.data);
      res.status(500).json({ error: 'An error occurred while fetching user images from Instagram.' });
    }
  });


  app.get('/instagram/token/exchange', async (req, res) => {
    //not a expired one
    let shortTermAccessToken = "IGQWRNZATdhSUVZAZA3ZAZAQ2FpSUZAfX0w2UEhJcFZAWWmJfLXZACTC1jQnFmN3ZAEUnJkMmtURm1sckdDSEJ3QXhfLUdHZA09qOTZAhQmtqTVNzY3hfcTFOTmVrc3M3YVF1MHZAMSGg4ZAmVIb2RHT3BHZAzRUVU43VWxLTlBhMzItcVY1RFYzZA0ozZAwZDZD"
    try {
      // Define the URL for the token exchange
      const tokenExchangeURL = 'https://graph.instagram.com/access_token';
  
      // Define the parameters for the request
      const params = {
        grant_type: 'ig_exchange_token',
        client_secret: clientSecret,
        access_token: shortTermAccessToken,
      };
  
      // Make the GET request to exchange the access token
      const response = await axios.get(tokenExchangeURL, { params });
  
      // Extract the long-lived access token from the response
    //   IGQWRNbWxmSFpRcEgySFpGWEhfS3RCa0V6VWJpTG82MDhTSXhfSGZA5UkptRWNQb29SMnJaQjlhd0JRTERtOU1fQjZAXcmNrVERudmhSbkI4OGVMYzlrdTZAPTUlEVElmY0lfb2pLM1lUUWh6UQZDZD
      const longLivedAccessToken = response.data.access_token;
  
      // Respond with the long-lived access token
      res.json({ long_lived_access_token: longLivedAccessToken });
    } catch (error) {
      console.error('Error exchanging access token:', error);
      res.status(500).json({ error: 'An error occurred while exchanging the access token.' });
    }
  });


  app.get('/instagram/token/refresh', async (req, res) => {
    try {
      // Define the URL for refreshing the access token
      const tokenRefreshURL = 'https://graph.instagram.com/refresh_access_token';
  
      // Define the parameters for the request
      const params = {
        grant_type: 'ig_refresh_token',
        access_token: longLivedAccessToken,
      };
  
      // Make the GET request to refresh the access token
      const response = await axios.get(tokenRefreshURL, { params });
  
      // Extract the refreshed access token from the response
      const refreshedAccessToken = response.data.access_token;
  
      // Respond with the refreshed access token
      res.json({ refreshed_access_token: refreshedAccessToken });
    } catch (error) {
      console.error('Error refreshing access token:', error);
      res.status(500).json({ error: 'An error occurred while refreshing the access token.' });
    }
  });


const server = https.createServer(optionSSL, app);
server.listen(3000, () => {
  console.log("Server is running on port 3000");
});
