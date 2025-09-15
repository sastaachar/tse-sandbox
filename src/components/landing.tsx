import { AuthType, logout, LogLevel } from "@thoughtspot/visual-embed-sdk";
import { ChangeEvent, useEffect, useState } from "react";
import { configs } from "../configs";
import { useAppConfig } from "../contexts/appConfig";
import {
  trustedAuthTokenCookielessInit,
  trustedAuthTokenInit,
  noneInit,
  basicInit,
  samlRedirectInit,
  embeddedSSOInit,
  implementedAuthTypes,
} from "../utils/sdkHelpers";
import { NewLanding } from "./newLanding";

const authTypeReverseMapping: Record<string, string> = Object.keys(
  AuthType
).reduce((acc, key) => {
  return {
    ...acc,
    [(AuthType as any)[key]]: key,
  };
}, {});

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

export function Landing() {
  return (
    <div className="Landing">
      <NewLanding />
    </div>
  );
}
