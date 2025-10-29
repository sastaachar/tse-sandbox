import {
  useEmbedRef,
  AppEmbed,
  Page,
  EmbedEvent,
  LiveboardEmbed,
} from "@thoughtspot/visual-embed-sdk/react";
import {
  getSessionInfo,
  tokenizedFetch,
  InterceptedApiType,
} from "@thoughtspot/visual-embed-sdk";
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
          // Old feature with new flag
          // enableApiIntercept={true}
          onOnBeforeGetVizDataIntercept={(payload, res) => {
            console.log(payload, "payload");
            const execute = confirm(
              "Query , " + payload?.data?.data?.answer?.search_query
            );
            res({
              data: {
                error: {
                  errorText: "Aditya is a good boy errorText ?",
                  errorDescription:
                    "Shivam kumar is a good boy errorDescription !",
                },
                execute: execute,
              },
            });
          }}
          // For this to work properly in spotter we need this
          // This is a known bug and team is working on it
          additionalFlags={{ isSpotterExperienceEnabled: true }}
          // isOnBeforeGetVizDataInterceptEnabled={true}
          /////////////////////////////////////
          // block liveboard embed data calls
          // enableApiIntercept={true}
          // onApiIntercept={(payload, res) => {
          //   console.log(payload, "payload");
          //   const execute = confirm("Do you want to proceed?");
          //   res({
          //     data: {
          //       error: {
          //         errorText: "Aditya is a good boy errorText ?",
          //         errorDescription:
          //           "Shivam kumar is a good boy errorDescription !",
          //       },
          //       execute: execute,
          //     },
          //   });
          // }}
          // interceptUrls={[
          //   InterceptedApiType.LIVEBOARD_DATA,
          //   // InterceptedApiType.ANSWER_DATA
          // ]}
          isOnBeforeGetVizDataInterceptEnabled={true}
          /////////////////////////////////////
          // interceptUrls={[
          //   InterceptedApiType.ANSWER_DATA,
          //   // "https://172.32.10.83:8443/prism/?op=GetTrendingList",
          // ]}
          // onApiIntercept={(payload, res) => {
          //   console.log(payload, "swanirka");
          //   const hey = confirm("hi guysss");
          //   res({
          //     data: {
          //       execute: hey,
          //       response: {
          //         body: {
          //           data: {
          //             getTrendingList: {
          //               pinboards: [
          //                 {
          //                   id: "33248a57-cc70-4e39-9199-fb5092283381",
          //                   type: "PINBOARD_ANSWER_BOOK",
          //                   author: "59481331-ee53-42be-a548-bd87be6ddd4a",
          //                   authorDisplayName: "Administrator",
          //                   authorName: "tsadmin",
          //                   hasLenientDiscoverability: false,
          //                   name: "Priyanshu ka pinboard",
          //                   stats: {
          //                     views: 35,
          //                     __typename: "TrendingStats",
          //                   },
          //                   description:
          //                     "This pinboard contains a chart, a table and a headline visualization based on TPCH.",
          //                   isFavorite: false,
          //                   isVerified: false,
          //                   __typename: "TrendingItem",
          //                 },
          //               ],
          //               answers: [
          //                 {
          //                   id: "32e79029-1c9b-4270-8844-f01b702544b0",
          //                   type: "QUESTION_ANSWER_BOOK",
          //                   author: "67e15c06-d153-4924-a4cd-ff615393b60f",
          //                   authorDisplayName: "System User",
          //                   authorName: "system",
          //                   hasLenientDiscoverability: false,
          //                   name: "Sample Event Tracing for Consumption (Change the Credit Window ID and the Timestamp)",
          //                   stats: {
          //                     views: 6,
          //                     __typename: "TrendingStats",
          //                   },
          //                   description: null,
          //                   isFavorite: false,
          //                   isVerified: false,
          //                   __typename: "TrendingItem",
          //                 },
          //               ],
          //               __typename: "Trending",
          //             },
          //           },
          //         },
          //       },
          //     },
          //   });
          // }}

          // additionalFlags={{
          //   pinboardVisibleVizs: [
          //     "754977f5-177a-492b-b79a-b703e33db9ef",
          //   ] as any,
          // }}
          // {...(embedConfig?.fullApp || {})}
          // interceptUrls={["DATA"]}
        />
      </div>
    </>
  );
}
