import Form from "@rjsf/core";
import { RJSFSchema, UiSchema } from "@rjsf/utils";
import validator from "@rjsf/validator-ajv8";
import { useCallback, useEffect, useState } from "react";
import { Resizable } from "re-resizable";
import "react-resizable/css/styles.css";
import { AppConfig, useAppConfig } from "../contexts/appConfig";
import { getItemFromStorage } from "../utils/storage";
import { AuthType, LogLevel, logout } from "@thoughtspot/visual-embed-sdk";
import {
  basicInit,
  embeddedSSOInit,
  implementedAuthTypes,
  noneInit,
  samlRedirectInit,
  trustedAuthTokenCookielessInit,
  trustedAuthTokenInit,
} from "../utils/sdkHelpers";
import { useGlobalModal } from "./GlobalModal";
import { configs } from "../configs";
import ReactJson from "react-json-view";

function ForkedWarning() {
  const originalUrl = "m8l3cm.csb.app";
  if (window.location.hostname !== originalUrl && configs.hideForkMessage)
    return (
      <div className="forked-warning">
        This is a forked version of the site and may not include the latest
        updates. For the original, visit{" "}
        <a href="https://m8l3cm.csb.app/">here</a>.
        <p>Hide this message using hideForkMessage in configs.ts</p>
      </div>
    );
  return null;
}

const getJsonSchema = (defaults: any): RJSFSchema => {
  return {
    title: "Sandbox Config",
    type: "object",
    required: ["title"],
    properties: {
      authType: {
        type: "string",
        title: "AuthType",
        default: defaults.authType,
        enum: implementedAuthTypes,
      },
      tsHost: {
        type: "string",
        title: "TsHost",
        default: defaults.tsHost,
      },
      username: {
        type: "string",
        title: "Username",
        default: defaults.username,
      },
      password: {
        type: "string",
        title: "Password",
        default: defaults.password,
      },
      logLevel: {
        type: "string",
        title: "LogLevel",
        default: defaults.logLevel,
        enum: Object.keys(LogLevel),
      },
    },
  };
};

const getUiSchema = (): UiSchema => {
  return {
    authType: {
      "ui:widget": "select",
      "ui:classNames": "rjsfField",
    },
    tsHost: {
      "ui:classNames": "rjsfField",
    },
    username: {
      "ui:classNames": "rjsfField",
    },
    password: {
      "ui:classNames": "rjsfField",
    },
    logLevel: {
      "ui:widget": "select",
      "ui:classNames": "rjsfField",
    },
  };
};

const InfoContent = () => {
  return (
    <div>
      <p>Some useful info below 😅:</p>
      <div>
        <p className="codeEditor">
          echo "https://.*.csb.app" | tscli --adv config set --key
          "/config/nginx/corshosts"
        </p>
        <p className="codeEditor">
          tscli csp add-override --source 'frame-ancestors' --url '*'
        </p>
        <p className="codeEditor">
          tscli --adv service add-gflag nginx.nanny nginx_cookie_flag 'Secure
          SameSite=None'
        </p>
        <p>Click init once after filling details</p>
      </div>
      <p>
        This sandbox was created for my personal testing, please dont create
        JIRA bugs for this 🙏 (this is not part of product)
      </p>
      <p>justin.mathew@thoughtspot.com for more info</p>
      <p>sandbox version : 2.0.0</p>
    </div>
  );
};

const handleInitClick = (config: Partial<AppConfig>) => {
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

export const NewLanding = () => {
  const {
    isDefaultsLoaded,
    setFullConfig,
    tsHost,
    authType,
    username,
    password,
    logLevel,
    liveboardIdOne,
    backendHost,
  } = useAppConfig();

  console.log(backendHost, "1");

  const initialCachedItem = useCallback(() => getItemFromStorage(), []);

  const [formData, setFormData] = useState(initialCachedItem());

  const [jsonString, setJsonString] = useState(
    JSON.stringify(initialCachedItem())
  );

  const [jsonEditorVisible, setJsonEditorVisible] = useState(false);

  const { showModalContent } = useGlobalModal();

  const [editAsString, setEditAsString] = useState(true);

  useEffect(() => {
    try {
      const value = JSON.parse(jsonString);
      setFormData(value);
    } catch (e) {
      console.log("Chup", e);
    }
  }, [jsonString]);

  useEffect(() => {
    setFullConfig(formData);
  }, [formData]);

  const handleLogoutClick = () => {
    logout();
  };

  return (
    <>
      <ForkedWarning />
      {backendHost && <div>{"BackendHost is set : " + backendHost}</div>}
      {!isDefaultsLoaded && "loading"}
      <div
        style={{
          position: "relative",
        }}
      >
        <Form
          formData={formData}
          schema={getJsonSchema(initialCachedItem())}
          uiSchema={getUiSchema()}
          validator={validator}
          onChange={(e) => {
            setFormData(e.formData);
          }}
        >
          {/* to hide submit button */}{" "}
        </Form>
        <div className="editButton">
          <button
            onClick={() => {
              setJsonString(JSON.stringify(formData, null, 2));
              setJsonEditorVisible((e) => !e);
            }}
          >
            {"{ }"}
          </button>
          {jsonEditorVisible && (
            <button
              onClick={() => {
                setEditAsString((e) => !e);
              }}
            >
              {editAsString ? "Fancy editor" : "String editor"}
            </button>
          )}
        </div>
        {jsonEditorVisible && (
          <Resizable
            style={{
              position: "absolute",
              top: "10px",
              left: "2px",
            }}
            defaultSize={{
              width: 320,
              height: 200,
            }}
            className="resizableBox"
          >
            {editAsString ? (
              <textarea
                className="codeEditor"
                onChange={(e) => {
                  setJsonString(e.target.value);
                }}
                value={jsonString}
              />
            ) : (
              <ReactJson
                src={JSON.parse(jsonString)}
                onEdit={(e) => setJsonString(JSON.stringify(e.updated_src))}
                onAdd={(e) => setJsonString(JSON.stringify(e.updated_src))}
                onDelete={(e) => setJsonString(JSON.stringify(e.updated_src))}
                iconStyle="triangle"
                enableClipboard={true}
                theme="monokai"
                indentWidth={4}
              />
            )}
          </Resizable>
        )}
      </div>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <button
          className="landing-controls-button"
          onClick={() =>
            handleInitClick({
              tsHost,
              authType,
              username,
              password,
              logLevel,
              backendHost,
            })
          }
        >
          init
        </button>
        <button className="landing-controls-button" onClick={handleLogoutClick}>
          logout
        </button>
        <button
          className="landing-controls-button"
          onClick={() => {
            showModalContent(InfoContent);
          }}
        >
          more info
        </button>
      </div>
    </>
  );
};
