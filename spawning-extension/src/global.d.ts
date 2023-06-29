type Links = {
  images: string[];
  audio: string[];
  video: string[];
  text: string[];
  code: string[];
  other: string[];
  domains: string[];
};

type RecordProps = {
  record: {
    id?: string;
    url?: string;
    title?: string;
    timestamp?: string;
    hibtLink?: string;
    domains: number;
    images: number;
    audio: number;
    video: number;
    text: number;
    code: number;
    other: number;
  };
};

type Records = {
  id: string;
  record: {
    links: Links;
    timestamp: string;
    currentUrl: string;
    currentTitle: string;
    hibtLink: string;
  };
}[];

type Config = {
  images: boolean;
  audio: boolean;
  video: boolean;
  text: boolean;
  code: boolean;
};

interface TabData {
  observerState: boolean;
  urls: {
    images: string[];
    audio: string[];
    video: string[];
    text: string[];
    code: string[];
    other: string[];
    domains: string[];
  };
}

type SearchLogItemProps = {
  record: {
    id?: string;
    url?: string;
    title?: string;
    timestamp?: string;
    hibtLink?: string;
    domains: number;
    images: number;
    audio: number;
    video: number;
    text: number;
    code: number;
    other: number;
  };
};

declare namespace JSX {
  interface IntrinsicElements {
    "dotlottie-player": any;
  }
}
