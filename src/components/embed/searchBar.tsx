import { SearchEmbed, useEmbedRef } from "@thoughtspot/visual-embed-sdk/react";
import { useAppConfig } from "../../contexts/appConfig";
import { useGlobalModal } from "../GlobalModal";
import { commonStyles } from "./embedUtils";
import { HostEventBar } from "./hostEventBar";

export function MySearchBarEmbed() {
  const embedRef = useEmbedRef<typeof SearchEmbed>();

  const { showModalContent } = useGlobalModal();

  const { hostEventParams, setFullConfig } = useAppConfig();

  return (
    <>
      <HostEventBar
        embedRef={embedRef}
        customButtons={[
          {
            name: "GetAnswerSession",
            callback: async () => {
              const ans = await embedRef.current.getAnswerService();
              showModalContent(
                JSON.stringify(ans.getSession() || "null", null, 4)
              );
            },
          },
        ]}
      />
      <div className="MyLiveboardOne">
        <SearchEmbed
          ref={embedRef}
          dataPanelV2={false}
          additionalFlags={{
            overrideConsoleLogs: false,
          }}
          customizations={commonStyles}
        />
      </div>
    </>
  );
}
