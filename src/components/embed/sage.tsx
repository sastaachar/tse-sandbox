import { SageEmbed, useEmbedRef } from "@thoughtspot/visual-embed-sdk/react";
import { useAppConfig } from "../../contexts/appConfig";
import { useGlobalModal } from "../GlobalModal";
import {
  getPinboardEmbedApiCustomButton,
  getAnswerEmbedApiCustomButton,
  commonStyles,
} from "./embedUtils";
import { HostEventBar } from "./hostEventBar";

export function MySageEmbed() {
  const { showModalContent } = useGlobalModal();
  const { hostEventParams, setFullConfig } = useAppConfig();
  const embedRef = useEmbedRef<typeof SageEmbed>();
  return (
    <>
      <HostEventBar embedRef={embedRef} />
      <div className="MyLiveboardOne">
        <SageEmbed
          ref={embedRef}
          additionalFlags={{
            overrideConsoleLogs: false,
          }}
          customizations={commonStyles}
        />
      </div>
    </>
  );
}
