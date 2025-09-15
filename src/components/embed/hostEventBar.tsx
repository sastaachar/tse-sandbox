import {
  EmbedEvent,
  HostEvent,
  MessagePayload,
  UIPassthroughEvent,
  UiPassthroughEvent,
} from "@thoughtspot/visual-embed-sdk/react";
// import { TsEmbed } from "@thoughtspot/visual-embed-sdk";
import { useEffect, useRef, useState } from "react";

import { useGlobalModal } from "../GlobalModal";
import { RJSFSchema } from "@rjsf/utils";
import { useAppConfig } from "../../contexts/appConfig";
import { getParamFromModal } from "./embedUtils";
import { useEmbedRef } from "@thoughtspot/visual-embed-sdk/react";

const getDefaultPinSchema = (parameters = {}): RJSFSchema => {
  const AddVizToPinboard = "addVizToPinboard";
  return {
    title: `${AddVizToPinboard} Params`,
    type: "object",
    required: ["newVizName"],
    properties: {
      vizId: {
        type: "string",
        title: "Viz ID",
        default: parameters[AddVizToPinboard]?.vizId,
      },
      newVizName: {
        type: "string",
        title: "New Viz Name",
        default: parameters[AddVizToPinboard]?.newVizName,
      },
      newVizDescription: {
        type: "string",
        title: "New Viz Description",
        default: parameters[AddVizToPinboard]?.newVizDescription,
      },
      liveboardId: {
        type: "string",
        title: "Pinboard ID",
        default: parameters[AddVizToPinboard]?.liveboardId,
      },
      tabId: {
        type: "string",
        title: "Tab ID",
        default: parameters[AddVizToPinboard]?.tabId,
      },
      newLiveboardName: {
        type: "string",
        title: "New Pinboard Name",
        default: parameters[AddVizToPinboard]?.newLiveboardName,
      },
      newTabName: {
        type: "string",
        title: "New Tab Name",
        default: parameters[AddVizToPinboard]?.newTabName,
      },
      // pinFromStore: {
      //   type: "boolean",
      //   title: "Pin from Store",
      //   default: parameters[AddVizToPinboard].pinFromStore ?? false,
      // },
    },
  };
};

const getDefaultSaveSchema = (parameters = {}) => {
  const AddVizToPinboard = "addVizToPinboard";
  const SaveAnswer = "saveAnswer";
  return {
    title: `Save Params`,
    type: "object",
    properties: {
      vizId: {
        type: "string",
        title: "Viz ID",
        default: parameters[AddVizToPinboard]?.vizId,
      },
      name: {
        type: "string",
        title: "Name",
        default: parameters[SaveAnswer]?.name || "Jötunheimr",
      },
      description: {
        type: "string",
        title: "Description",
        default: parameters[SaveAnswer]?.description || "Heeehawww",
      },
      isDiscoverable: {
        type: "boolean",
        title: "isDiscoverable",
        default: parameters[SaveAnswer]?.isDiscoverable || false,
      },
    },
  };
};

const createEmbedApiCallback = (
  embedApiName: string,
  schema: any,
  defaultParams: any,
  setFullConfig: any,
  showModalContent: any,
  embedRef: ReturnType<typeof useEmbedRef>
) => {
  return {
    name: embedApiName,
    color: schema ? "primary" : "secondary",
    callback: async () => {
      const [params, error] = await getParamFromModal(schema, showModalContent);
      if (error) return;

      setFullConfig({
        hostEventParams: {
          ...defaultParams,
          [embedApiName]: params,
        },
      });
      console.log(`Calling ${embedApiName} with`, params);
      const res = await embedRef.current.trigger("UiPassthrough" as HostEvent, {
        type: embedApiName,
        parameters: params,
      });

      showModalContent(
        JSON.stringify(
          res ?? res.map((r) => (r?.errors ? { error: r.errors.message } : r)),
          null,
          2
        )
      );
    },
  };
};

const createHostEventCallback = ({
  hostEvent,
  schema,
  embedRef,
  noResponseModal,
  buttonName,
  embedApiType,
  type,
}: {
  hostEvent: HostEvent;
  schema?: any;
  embedRef: ReturnType<typeof useEmbedRef>;
  noResponseModal?: boolean;
  embedApiType?: string;
  buttonName?: string;
  type?: "primary" | "secondary";
}) => {
  const { setFullConfig, hostEventParams } = useAppConfig();
  const { showModalContent } = useGlobalModal();

  return {
    name: buttonName || hostEvent,
    callback: async () => {
      let paramsForEvent = undefined;

      if (schema) {
        const [params, error] = await getParamFromModal(
          schema,
          showModalContent
        );
        if (error) return;
        setFullConfig({
          hostEventParams: {
            ...hostEventParams,
            [hostEvent]: params,
          },
        });
        paramsForEvent = params;
      }
      if (embedApiType) {
        paramsForEvent = {
          type: embedApiType,
          parameters: paramsForEvent,
        };
      }
      console.log(`Calling ${hostEvent} with`, paramsForEvent);
      const res = await embedRef.current.trigger(hostEvent, paramsForEvent);

      if (noResponseModal) return;

      showModalContent(
        JSON.stringify(
          res ?? res.map((r) => (r?.errors ? { error: r.errors.message } : r)),
          null,
          2
        )
      );
    },
    type: type || "primary",
  };
};

export const getCommonHostEventButtons = (
  embedRef: ReturnType<typeof useEmbedRef>
) => {
  const { hostEventParams, hostEventsConfig } = useAppConfig();
  const { showModalContent } = useGlobalModal();
  const defaultButtons = hostEventsConfig.map((e) => {
    return createHostEventCallback({
      hostEvent: e.type as HostEvent,
      embedRef,
      noResponseModal: true,
    });
  });

  return [
    ...defaultButtons,
    createHostEventCallback({
      hostEvent: HostEvent.Pin,
      schema: getDefaultPinSchema(hostEventParams),
      embedRef,
      buttonName: "Pin with param",
    }),
    createHostEventCallback({
      hostEvent: HostEvent.SaveAnswer,
      schema: getDefaultSaveSchema(hostEventParams),
      embedRef,
      buttonName: "SaveAnswer with Param",
    }),
    {
      name: "getAnswerPageConfig",
      callback: async () => {
        const data = await embedRef.current.triggerUiPassThrough(
          UiPassthroughEvent.getAnswerPageConfig,
          {}
        );
        showModalContent(JSON.stringify(data, null, 2));
      },
      type: "secondary",
    },
    {
      name: "getPinboardPageConfig",
      callback: async () => {
        const data = await embedRef.current.triggerUiPassThrough(
          UiPassthroughEvent.getPinboardPageConfig,
          {}
        );
        showModalContent(JSON.stringify(data, null, 2));
      },
      type: "secondary",
    },
    {
      name: "getAvailableUiPassthroughs",
      callback: async () => {
        const data = await embedRef.current.triggerUIPassThrough(
          UIPassthroughEvent.GetAvailableUIPassthroughs,
          {}
        );
        showModalContent(JSON.stringify(data, null, 2));
      },
      type: "secondary",
    },
  ];
};

export const getAnswerEmbedApiCustomButton = (
  embedRef: ReturnType<typeof useEmbedRef>,
  showModalContent: (content: string | React.FC) => void,
  parameters: any = {},
  setFullConfig?: any
) => {
  const AddVizToPinboard = "addVizToPinboard";
  const SaveAnswer = "saveAnswer";
  return [
    createEmbedApiCallback(
      AddVizToPinboard,
      getDefaultPinSchema(parameters),
      parameters,
      setFullConfig,
      showModalContent,
      embedRef
    ),
    createEmbedApiCallback(
      SaveAnswer,
      {
        title: `${SaveAnswer} Params`,
        type: "object",
        properties: {
          vizId: {
            type: "string",
            title: "Viz ID",
            default: parameters[AddVizToPinboard]?.vizId,
          },
          name: {
            type: "string",
            title: "Name",
            default: parameters[SaveAnswer]?.name || "Jötunheimr",
          },
          description: {
            type: "string",
            title: "Description",
            default: parameters[SaveAnswer]?.description || "Heeehawww",
          },
          isDiscoverable: {
            type: "boolean",
            title: "isDiscoverable",
            default: parameters[SaveAnswer]?.isDiscoverable || false,
          },
        },
      },
      parameters,
      setFullConfig,
      showModalContent,
      embedRef
    ),
    {
      name: "getAnswerPageConfig",
      callback: async () => {
        console.log(
          "Calling getAnswerPageConfig with",
          parameters.getAnswerPageConfig
        );
        const res = await embedRef.current.triggerUiPassThrough(
          UiPassthroughEvent.getAnswerPageConfig,
          {}
        );
        console.log(res);
        showModalContent(JSON.stringify(res, null, 2));
      },
    },
    {
      name: "With Params Pin",
      callback: async () => {
        const schema = getDefaultPinSchema(parameters);
        const [params, error] = await getParamFromModal(
          schema,
          showModalContent
        );
        if (error) return;

        setFullConfig({
          hostEventParams: {
            ...parameters,
            ["Pin"]: params,
          },
        });

        console.log(`Calling ${HostEvent.Pin} with`, params);
        const res = await embedRef.current.trigger(HostEvent.Pin, params);

        showModalContent(
          JSON.stringify(
            res ??
              res.map((r) => (r?.errors ? { error: r.errors.message } : r)),
            null,
            2
          )
        );
      },
    },
    {
      name: "Without Params Pin",
      callback: async () => {
        console.log(`Calling ${HostEvent.Pin} without params`);
        embedRef.current.trigger(HostEvent.Pin);
      },
    },
  ];
};

export const getPinboardEmbedApiCustomButton = (
  embedRef: ReturnType<typeof useEmbedRef>,
  showModalContent: (content: string | React.FC) => void,
  parameters: any,
  setFullConfig?: any
) => {
  return [
    {
      name: "getDiscoverabilityStatus",
      callback: async () => {
        console.log(
          "Calling getDiscoverabilityStatus with",
          parameters.getDiscoverabilityStatus
        );
        const res = await embedRef.current.trigger(
          "UiPassthrough" as HostEvent,
          {
            type: "getDiscoverabilityStatus",
          }
        );
        console.log(res);
        showModalContent(JSON.stringify(res, null, 2));
      },
    },
    {
      name: "getAvailableEmbedApis",
      callback: async () => {
        console.log(
          "Calling getAvailableEmbedApis with",
          parameters.getUpdatedPinboardList
        );
        const res = await embedRef.current.trigger(
          "UiPassthrough" as HostEvent,
          {
            type: "getAvailableEmbedApis",
          }
        );
        console.log(res);
        showModalContent(JSON.stringify(res, null, 2));
      },
    },
    {
      name: "getPinboardPageConfig",
      callback: async () => {
        console.log(
          "Calling getPinboardPageConfig with",
          parameters.getPinboardPageConfig
        );
        const res = await embedRef.current.trigger(
          "UiPassthrough" as HostEvent,
          {
            type: "getPinboardPageConfig",
          }
        );
        console.log(res);
        showModalContent(JSON.stringify(res, null, 2));
      },
    },
  ];
};

export function HostEventBar({
  embedRef,
  customButtons = [],
}: {
  embedRef: React.MutableRefObject<any>;
  customButtons?: {
    name: string;
    callback: (params: any) => any;
    type?: string;
  }[];
}) {
  const [embedEvents, setEmbedEvents] = useState<
    { event: MessagePayload; time: number; id: string }[]
  >([]);

  const isLoaded = useRef(false);
  const { showModalContent } = useGlobalModal();
  useEffect(() => {
    const sI = setInterval(() => {
      if (embedRef?.current?.on && !isLoaded.current) {
        isLoaded.current = true;
        embedRef?.current?.on(EmbedEvent.ALL, (e) => {
          const time = Date.now();
          const id = e?.type + time + Math.random();
          const event = {
            event: e,
            time,
            id,
          };
          setEmbedEvents((prevEmbedEvents) => {
            return [event, ...prevEmbedEvents];
          });
        });
        clearInterval(sI);
      }
    }, 10);
  }, []);

  const hostEventButtons = getCommonHostEventButtons(embedRef);

  return (
    <div className="hostMenuBar">
      <div className="hostEvents">
        {[...hostEventButtons, ...customButtons]?.map((button) => {
          return (
            <button
              key={button.name}
              onClick={button.callback}
              className={`custom-button custom-button-${
                button?.type || "primary"
              }`}
            >
              {button.name}
            </button>
          );
        })}
      </div>
      <div
        className="embedEvents"
        onClick={() => {
          showModalContent(
            JSON.stringify(
              embedEvents.map((e) => e.event),
              null,
              2
            ),
            undefined,
            true
          );
        }}
      >
        {embedEvents.map((e) => (
          <div key={e.id}>{e?.event.type}</div>
        ))}
      </div>
    </div>
  );
}
