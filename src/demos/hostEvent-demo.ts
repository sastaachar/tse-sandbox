import {
  createBearerAuthenticationConfig,
  createConfiguration,
  ServerConfiguration,
  ThoughtSpotRestApi,
} from "@thoughtspot/rest-api-sdk";
import { HostEvent } from "@thoughtspot/visual-embed-sdk";
import { TsEmbed } from "@thoughtspot/visual-embed-sdk/lib/src/embed/ts-embed";

export const hostEventDemo = async (embed: TsEmbed) => {
  const data = await embed.trigger(HostEvent.SaveAnswer, {
    name: "",
    description: "",
  });
  const data2 = await embed.trigger(HostEvent.Pin, {
    newPinboardName: "",
    newVizName: "",
  });
};
