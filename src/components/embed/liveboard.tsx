import {
  CustomisationsInterface,
  LiveboardEmbed,
  useEmbedRef,
  EmbedEvent,
} from "@thoughtspot/visual-embed-sdk/react";
import { useEffect } from "react";
import { configs } from "../../configs";
import { useAppConfig } from "../../contexts/appConfig";
import { useGlobalModal } from "../GlobalModal";
import { HostEventBar } from "./hostEventBar";
import { commonStyles } from "./embedUtils";

const LB_ONE = configs.liveboardOneId;

export function MyLiveboardOne() {
  const embedRef = useEmbedRef<typeof LiveboardEmbed>();

  const { showModalContent } = useGlobalModal();
  const { liveboardIdOne, hostEventParams, setFullConfig, embedConfig } =
    useAppConfig();

  useEffect(() => {
    embedRef.current.on(
      EmbedEvent.OnBeforeGetVizDataIntercept,
      (payload, res) => {
        console.log(payload, "a");
        res({ data: { execute: false } });
      }
    );
  });

  return (
    <>
      <HostEventBar embedRef={embedRef} />
      <div className="MyLiveboardOne">
        <LiveboardEmbed
          onCustomAction={(data) => {}}
          liveboardId={liveboardIdOne || LB_ONE}
          ref={embedRef}
          additionalFlags={{
            overrideConsoleLogs: false,
            "embed-hostEventParameterization": true,
            isOnBeforeGetVizDataInterceptEnabled: true,
          }}
          customizations={commonStyles}
          {...(embedConfig?.liveboard || {})}
          fullHeight={true}
          lazyLoadingForFullHeight={true}
          lazyLoadingMargin={"0px"}
        />
      </div>
    </>
  );
}
