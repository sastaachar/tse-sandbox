import {
  createBearerAuthenticationConfig,
  createConfiguration,
  ServerConfiguration,
  ThoughtSpotRestApi,
} from "@thoughtspot/rest-api-sdk";

// SDK token demo
let lastFetchedTime = null;
let cachedToken = "";

const expiryTime = 5 * 1000;
const getNewToken = async () => {
  const config = createBasic;
  const tsRestApiClient = new ThoughtSpotRestApi(config);

  const data = await tsRestApiClient.getFullAccessToken({
    username: "",
    password: "",
    validity_time_in_sec: expiryTime,
    org_id: 0,
  });
  return data.token;
};

export const getCachedToken = async () => {
  if (Date.now() - lastFetchedTime < expiryTime) return cachedToken;
  const newToken = await getNewToken();
  cachedToken = newToken;
  lastFetchedTime = Date.now();
};

const clientConfig = createBearerAuthenticationConfig(
  "https://something.thoughtspot.com",
  getCachedToken
);
const tsClient = new ThoughtSpotRestApi(clientConfig);
