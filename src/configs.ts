import { HostEvent } from "@thoughtspot/visual-embed-sdk";

interface Configs {
  liveboardOneId: string;
  hostEvents: { type: HostEvent; data?: any }[];
  orgId: number;
  hideForkMessage: boolean;
}

export const configs: Configs = {
  // liveboardOneId: "bea79810-145f-4ad0-a02c-4177a6e7d861",
  liveboardOneId: "9bd202f5-d431-44bf-9a07-b4f7be372125",
  hostEvents: [
    { type: HostEvent.DownloadAsPdf },
    { type: HostEvent.Reload },
    {
      type: HostEvent.CopyLink,
    },
    { type: HostEvent.Edit },
    { type: HostEvent.Share },
    { type: HostEvent.Pin },
    { type: HostEvent.Save },
  ],
  orgId: 0,
  hideForkMessage: false,
};

export function getConfig() {
  return configs;
}
