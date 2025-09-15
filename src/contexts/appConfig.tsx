import { AuthType, HostEvent, LogLevel } from "@thoughtspot/visual-embed-sdk";
import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import { implementedAuthTypes } from "../utils/sdkHelpers";
import { getItemFromStorage, setItemInLocalStorage } from "../utils/storage";

export type AppConfig = {
  tsHost: string;
  username: string;
  password: string;
  logLevel: LogLevel;
  liveboardIdOne: string;
  authType: (typeof implementedAuthTypes)[number];
  setTsHost: (username: string) => void;
  setUsername: (username: string) => void;
  setPassword: (passord: string) => void;
  setAuthType: (authType: (typeof implementedAuthTypes)[number]) => void;
  setLogLevel: (logLevel: LogLevel) => void;
  setFullConfig: (config: any) => void;
  setBackendHost?: (config: any) => void;
  isDefaultsLoaded: boolean;
  hostEventParams?: {
    addVizToPinboard?: any;
    saveAnswer?: any;
  };
  backendHost?: string;
  hostEventsConfig?: { type: string}[];
  embedConfig?: {
    fullApp: any;
    liveboard: any;
    search: any;
    searchBar: any;
  },
  setEmbedConfig?: (config: any) => void;
};

const defaultConfig: AppConfig = {
  tsHost: "",
  username: "",
  password: "",
  liveboardIdOne: "9bd202f5-d431-44bf-9a07-b4f7be372125",
  logLevel: LogLevel.ERROR,
  authType: AuthType.None,
  setTsHost: () => {},
  setUsername: () => {},
  setPassword: () => {},
  setAuthType: () => {},
  setLogLevel: () => {},
  setFullConfig: () => {},
  isDefaultsLoaded: false,
  hostEventParams: {
    addVizToPinboard: {
      vizId: "754977f5-177a-492b-b79a-b703e33db9ef",
      newVizName: "Its a new day new viz",
      newVizDescription: "its HostEvent",
      newPinboardName: "New pinboard",
      newTabName: "New pinboard",
    },
    saveAnswer: {
      name: "John doe Asnwer",
      description: "As the name suggestes its john doe's",
    },
  },
  hostEventsConfig: [
    { type: HostEvent.DownloadAsPdf },
    { type: HostEvent.Reload },
    {
      type: HostEvent.CopyLink,
    },
    { type: HostEvent.Edit },
    { type: HostEvent.Share },
    { type: HostEvent.Pin },
    { type: HostEvent.Save },
  ],
}
const AppConfigContext = createContext<AppConfig>(defaultConfig);

export const AppConfigProvider = (props: any) => {
  const initialCachedItem = useCallback(() => getItemFromStorage(), []);
  console.log(initialCachedItem());
  const [isDefaultsLoaded, setIsDefaultLaoded] = useState(false);
  const [tsHost, setTsHost] = useState(initialCachedItem().tsHost);
  const [username, setUsername] = useState(initialCachedItem().username);
  const [password, setPassword] = useState(initialCachedItem().password);
  const [authType, setAuthType] = useState<
    (typeof implementedAuthTypes)[number]
  >(initialCachedItem().authType);
  const [logLevel, setLogLevel] = useState(initialCachedItem().logLevel);
  const [liveboardIdOne, setLiveboardIdOne] = useState(
    initialCachedItem().liveboardIdOne || "9bd202f5-d431-44bf-9a07-b4f7be372125"
  );
  const [hostEventParams, setHostEventsParams] = useState<any>(
    initialCachedItem().hostEventParams || {
      addVizToPinboard: {
        vizId: "754977f5-177a-492b-b79a-b703e33db9ef",
        newVizName: "Its a new day new viz",
        newVizDescription: "its HostEvent",
        newPinboardName: "New pinboard",
        newTabName: "New pinboard",
      },
    }
  );
  const [backendHost, setBackendHost] = useState(
    initialCachedItem().backendHost
  );
  const [hostEventsConfig, setHostEventsConfig] = useState(
    initialCachedItem().hostEvents || defaultConfig.hostEventsConfig
  );
  const [embedConfig, setEmbedConfig] = useState<any>({});

  useEffect(() => {
    setItemInLocalStorage({
      tsHost,
      username,
      password,
      logLevel,
      authType,
      liveboardIdOne,
      hostEventParams,
      backendHost,
      hostEventsConfig,
      embedConfig
    });
  }, [
    tsHost,
    username,
    password,
    logLevel,
    authType,
    liveboardIdOne,
    hostEventParams,
    backendHost,
    hostEventsConfig,
    embedConfig
  ]);

  const setFullConfig = (config: Partial<AppConfig>) => {
    config.tsHost && setTsHost(config.tsHost);
    config.username && setUsername(config.username);
    config.password && setPassword(config.password);
    config.authType && setAuthType(config.authType);
    config.logLevel && setLogLevel(config.logLevel);
    config.liveboardIdOne && setLiveboardIdOne(config.liveboardIdOne);
    config.embedConfig && setEmbedConfig(config.embedConfig);
    setHostEventsParams(config.hostEventParams);
    setBackendHost(config.backendHost);
    config.hostEventsConfig && setHostEventsConfig(config.hostEventsConfig);
  };

  return (
    <AppConfigContext.Provider
      value={{
        tsHost,
        username,
        password,
        logLevel,
        authType,
        setTsHost,
        setUsername,
        setPassword,
        setAuthType,
        setLogLevel,
        setFullConfig,
        isDefaultsLoaded,
        liveboardIdOne,
        hostEventParams,
        setBackendHost,
        backendHost,
        hostEventsConfig,
        embedConfig,
        setEmbedConfig
      }}
    >
      {props.children}
    </AppConfigContext.Provider>
  );
};

export const useAppConfig = () => useContext(AppConfigContext);
