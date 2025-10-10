import {
  CustomisationsInterface,
  useEmbedRef,
  LiveboardEmbed,
  AppEmbed,
  SearchEmbed,
  SageEmbed,
} from "@thoughtspot/visual-embed-sdk/react";
import { HostEvent, SearchBarEmbed } from "@thoughtspot/visual-embed-sdk";

import { configs } from "../../configs";
import Form from "@rjsf/core";
import { RJSFSchema, UiSchema } from "@rjsf/utils";
import validator from "@rjsf/validator-ajv8";
import { useRef } from "react";
import { useAppConfig } from "../../contexts/appConfig";
import { useGlobalModal } from "../GlobalModal";
// import { TsEmbed } from "@thoughtspot/visual-embed-sdk";

export const hostEvents = configs.hostEvents;

export const getHostEventCallback = (
  embedRef: ReturnType<typeof useEmbedRef>,
  e: (typeof hostEvents)[number]
) => {
  return () => {
    embedRef?.current
      ?.trigger?.(e.type, e.data)
      .then((res) => {
        console.info("HostEvent :", JSON.stringify(e), "Response :", res);
      })
      .catch((err) => {
        console.info("HostEvent :", JSON.stringify(e), "Error :", err);
      });
  };
};

export const getParamFromModal = async (
  schema: RJSFSchema,
  showModalContent: (content: string | React.FC, onClose: any) => void
) => {
  let promiseRef = {
    resolve: (data: any) => {},
    reject: (data: any) => {},
  };

  showModalContent(
    () => {
      return (
        <Form
          schema={schema}
          validator={validator}
          onSubmit={(d) => {
            promiseRef.resolve([d.formData, null]);
          }}
        />
      );
    },
    () => {
      promiseRef.resolve([null, { message: "Someone closed the damn modal" }]);
    }
  );

  return new Promise<[any, Error]>((resolve, reject) => {
    promiseRef = {
      reject,
      resolve,
    };
  });
};

export const commonStyles: CustomisationsInterface = {
  style: {
    customCSS: {
      variables: {
        "--ts-var-root-background": "#2b2d42",

        "--ts-var-nav-background": "#2b2d42",
        "--ts-var-nav-color": "white",

        "--ts-var-button--secondary-background": "#2b2d42",
        "--ts-var-button--secondary-color": "white",
        "--ts-var-button--secondary--hover-background": "#2b2d62",
      },
    },
  },
};
