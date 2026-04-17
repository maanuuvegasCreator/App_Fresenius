/** Eventos JSON del WebSocket Media Streams (Twilio). */

export type TwilioStreamConnectedEvent = {
  event: "connected";
  protocol: string;
  version: string;
};

export type TwilioStreamStartEvent = {
  event: "start";
  sequenceNumber: string;
  start: {
    streamSid: string;
    accountSid: string;
    callSid: string;
    tracks: string[];
    customParameters?: Record<string, string>;
    mediaFormat: { encoding: string; sampleRate: number; channels: number };
  };
  streamSid: string;
};

export type TwilioStreamMediaEvent = {
  event: "media";
  sequenceNumber: string;
  streamSid: string;
  media: {
    track: string;
    chunk: string;
    timestamp: string;
    payload: string;
  };
};

export type TwilioStreamMarkEvent = {
  event: "mark";
  sequenceNumber: string;
  streamSid: string;
  mark: { name: string };
};

export type TwilioStreamStopEvent = {
  event: "stop";
  sequenceNumber: string;
  streamSid: string;
  stop: { accountSid: string; callSid: string };
};

export type TwilioStreamUnknownEvent = Record<string, unknown> & { event?: string };

export type TwilioStreamInboundEvent =
  | TwilioStreamConnectedEvent
  | TwilioStreamStartEvent
  | TwilioStreamMediaEvent
  | TwilioStreamMarkEvent
  | TwilioStreamStopEvent
  | TwilioStreamUnknownEvent;
