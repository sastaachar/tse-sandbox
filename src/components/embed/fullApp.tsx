import {
  useEmbedRef,
  AppEmbed,
  Page,
  EmbedEvent,
  LiveboardEmbed,
} from "@thoughtspot/visual-embed-sdk/react";
import { getSessionInfo, tokenizedFetch } from "@thoughtspot/visual-embed-sdk";
import { useEffect } from "react";
import { useAppConfig } from "../../contexts/appConfig";
import { useGlobalModal } from "../GlobalModal";
import { commonStyles } from "./embedUtils";
import { HostEventBar } from "./hostEventBar";
import { toast } from "react-toastify";

export function MyAppEmbed() {
  const embedRef = useEmbedRef<typeof AppEmbed>();

  const { embedConfig, tsHost } = useAppConfig();

  useEffect(() => {
    // We need to subscribe to RouteCHange event using on
    embedRef.current.on(EmbedEvent.RouteChange, async (e) => {
      // using const we can decalre variables in javascript
      const newPath = e.data.currentPath as string;
      if (newPath.includes("/pinboard/")) {
        // get the liveboard path
        const pathIds = newPath.split("/pinboard/")[1];
        // get the pinboard id
        const pinboardId = pathIds.split("/")[0];
        // create the api link to call we are using metadata search
        const apiLink = tsHost + "/api/rest/2.0/metadata/search";
        // use sdk's tokenizedFetch to call apis
        const apiResponse = await tokenizedFetch(apiLink, {
          // We use http standard's POST,
          // Becase the backend api supports POST
          method: "POST",
          // We need to pass this as this is a browser standard
          // to send POST data this will till thoghtspot server we are sending JSON
          headers: {
            "Content-type": "application/json",
          },
          // JSON.stringify is a speacial function provided by browsers to stringify json object
          body: JSON.stringify({
            metadata: [
              {
                // These are the params expected by the thoughtspot api
                identifier: pinboardId,
              },
            ],
          }),
        });
        // This is the browser standart to parse json in javascript
        const apiResult = await apiResponse.json();
        // We finally get the livebaord name from api
        const liveboardName = apiResult[0]?.metadata_name;
        // Use the name whereever needed
        toast("Opening : " + liveboardName, { type: "success" });
      }

      // This is just a console log for debugging , its ok for testing
      console.log("Route -> ", e.data.currentPath);
    });
    // to know more about this check react docs
  }, [tsHost]);

  console.log("Embed config", embedConfig);

  return (
    <>
      <HostEventBar embedRef={embedRef} />
      <div className="MyLiveboardOne">
        <AppEmbed
          preRenderId="app-embed"
          ref={embedRef}
          pageId={Page.Search}
          linkOverride={true}
          showPrimaryNavbar={true}
          onParameterChanged={(d) => {
            console.info("onParameterChanged", d);
          }}
          customizations={commonStyles}
          enableApiIntercept={true}
          onOnBeforeGetVizDataIntercept={(paload, res) => {
           console.log(paload, "paload");
            const execute = confirm("Do you want to proceed?");
            res({
              data: {
                execute: execute,
                errorText: "errorTexterrorText errorText ?",
                errorDescription: "errorDescriptionerrorDescription !",
              },
            });
          }}
          isOnBeforeGetVizDataInterceptEnabled={true}
          additionalFlags={{
            pinboardVisibleVizs: ['754977f5-177a-492b-b79a-b703e33db9ef'] as any,
          }}
          // {...(embedConfig?.fullApp || {})}
          // interceptUrls={["DATA"]}
        />
      </div>
    </>
  );
}
