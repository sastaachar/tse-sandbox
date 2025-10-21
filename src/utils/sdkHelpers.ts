import {
  ServerConfiguration,
  ThoughtSpotRestApi,
  createConfiguration,
  createBearerAuthenticationConfig,
} from "@thoughtspot/rest-api-sdk";
import { AuthFailureType, LogLevel } from "@thoughtspot/visual-embed-sdk";
import { AuthStatus, AuthType, init } from "@thoughtspot/visual-embed-sdk";
import { configs } from "../configs";
import { toast } from "react-toastify";
import { AppConfig } from "../contexts/appConfig";
import { getItemFromStorage } from "./storage";

export const implementedAuthTypes = [
  AuthType.Basic,
  AuthType.TrustedAuthToken,
  AuthType.TrustedAuthTokenCookieless,
  AuthType.None,
  AuthType.SAMLRedirect,
  AuthType.EmbeddedSSO,
];

let initTiming = { start: 0, end: 0, total: 0 };
const registerAuthEvent = ({ aEE, name }: { aEE: any; name: string }) => {
  initTiming.start = Date.now();
  aEE.on(AuthStatus.SUCCESS, (data) => {
    toast("Embed login success", { type: "success" });
    console.log("Success", name, data);
    console.log("Success Username from info", data?.userName);
  });
  aEE.on(AuthStatus.FAILURE, (e) => {
    toast(`Auth ${e}`, {
      type: e === AuthFailureType.EXPIRY ? "warning" : "error",
    });
    console.log("Auth fail", e);
  });
  aEE.on(AuthStatus.SDK_SUCCESS, () => {
    initTiming.end = Date.now();
    initTiming.total = (initTiming.end - initTiming.start) / 1000;
    toast(`Init login success: ${initTiming.total}s`, { type: "success" });
    console.log("Login SDK_SUCCESS");
  });
};

const trustedAuthTokenCookielessInit = (
  tsHost: string,
  username: string,
  password: string,
  logLevel: LogLevel,
  backendHost?: string
) => {
  console.log("TrustedAuthTokenCookieless Init called", tsHost);
  registerAuthEvent({
    aEE: init({
      disableLoginFailurePage: true,
      thoughtSpotHost: tsHost,
      authType: AuthType.TrustedAuthTokenCookieless,
      getAuthToken: async () => {
        const config = createConfiguration({
          baseServer: new ServerConfiguration(backendHost ?? tsHost, {}),
        });
        const tsRestApiClient = new ThoughtSpotRestApi(config);

        const data = await tsRestApiClient.getFullAccessToken({
          username,
          password,
          validity_time_in_sec: 30000,
          org_id: configs.orgId || undefined,
        });
        return data.token;
      },

      autoLogin: true,
      loginFailedMessage: "Login Failed",
      logLevel: logLevel,
      disablePreauthCache: true,
    }),
    name: AuthType.TrustedAuthTokenCookieless,
  });
};
const trustedAuthTokenInit = async (
  tsHost: string,
  username: string,
  password: string,
  logLevel: LogLevel,
  backendHost?: string
) => {
  console.log("TrustedAuthToken Init called");
  const config = createConfiguration({
    baseServer: new ServerConfiguration(backendHost ?? tsHost, {}),
  });
  const tsRestApiClient = new ThoughtSpotRestApi(config);
  registerAuthEvent({
    aEE: init({
      thoughtSpotHost: tsHost,
      authType: AuthType.TrustedAuthToken,
      username: username,
      getAuthToken: async () => {
        const data = await tsRestApiClient.getFullAccessToken({
          username,
          password,
          validity_time_in_sec: 920,
        });
        return data.token;
      },
      logLevel: LogLevel.DEBUG,
    }),
    name: AuthType.TrustedAuthToken,
  });
};
const noneInit = (tsHost: string, logLevel: LogLevel) => {
  console.log("None Init called");
  registerAuthEvent({
    aEE: init({
      thoughtSpotHost: tsHost,
      authType: AuthType.None,
      logLevel: logLevel,
    }),
    name: AuthType.None,
  });
};
const basicInit = (
  tsHost: string,
  username: string,
  password: string,
  logLevel: LogLevel
) => {
  console.log("Basic Init called");
  registerAuthEvent({
    aEE: init({
      thoughtSpotHost: tsHost,
      authType: AuthType.Basic,
      logLevel: logLevel,
      username,
      password,
    }),
    name: AuthType.Basic,
  });
};
const samlRedirectInit = (tsHost: string, logLevel: LogLevel) => {
  console.log("SAMLRedirect Init called");
  registerAuthEvent({
    aEE: init({
      thoughtSpotHost: tsHost,
      authType: AuthType.SAMLRedirect,
      logLevel: logLevel,
    }),
    name: AuthType.SAMLRedirect,
  });
};
const embeddedSSOInit = (tsHost: string, logLevel: LogLevel) => {
  console.log("EmbeddedSSO Init called");
  registerAuthEvent({
    aEE: init({
      thoughtSpotHost: tsHost,
      authType: AuthType.EmbeddedSSO,
      logLevel: logLevel,
      inPopup: false,
      disableLoginFailurePage: true,
    }),
    name: AuthType.EmbeddedSSO,
  });
};

export const handleInit = (config: Partial<AppConfig>) => {
  const {
    authType,
    tsHost = "",
    username = "",
    password = "",
    logLevel = LogLevel.ERROR,
    backendHost,
  } = config;
  switch (authType) {
    case AuthType.TrustedAuthTokenCookieless:
      trustedAuthTokenCookielessInit(
        tsHost,
        username,
        password,
        logLevel,
        backendHost
      );
      break;
    case AuthType.TrustedAuthToken:
      trustedAuthTokenInit(tsHost, username, password, logLevel, backendHost);
      break;
    case AuthType.None:
      noneInit(tsHost, logLevel);
      break;
    case AuthType.Basic:
      basicInit(tsHost, username, password, logLevel);
      break;
    case AuthType.SAMLRedirect:
      samlRedirectInit(tsHost, logLevel);
      break;
    case AuthType.EmbeddedSSO:
      embeddedSSOInit(tsHost, logLevel);
      break;
    default:
      window.alert("Auth type not implemented in sandbox");
  }
};

export const autoInit = () => {
  const config = getItemFromStorage();
  if (!config.authType || !config.tsHost) {
    return true;
  }

  handleInit(config);
  return true;
};

export {
  trustedAuthTokenCookielessInit,
  trustedAuthTokenInit,
  noneInit,
  basicInit,
  samlRedirectInit,
  embeddedSSOInit,
};
