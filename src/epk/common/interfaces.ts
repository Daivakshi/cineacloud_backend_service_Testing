import { Request } from "express";

export interface AppConfig {
  mongo: {
    connString: string;
    name: string;
  };
  aws: {
    cloudfrontAddress: string;
    bucket: string;
    credentials: {
      accessKeyId: string;
      secretAccessKey: string;
    };
  };
  appPort: number;
  appHost: string;
}

export interface Template {
  id?: string;
  name: string;
  frame: Frame;
  objects: UIBoxObject[];
  background: {
    type: string;
    value: string;
  };
  preview?: string;
}

interface Frame {
  width: number;
  height: number;
}

type UIBoxObject = TextOptions | ImageOptions;

interface BaseOptions {
  id: string;
  name: string;
  top: number;
  left: number;
  angle: number;
  width: number;
  height: number;
  originX: string;
  originY: string;
  scaleX: number;
  scaleY: number;
  fill: string;
}

interface TextOptions extends BaseOptions {
  textAlign: string;
  fontFamily: string;
  fontSize: number;
  fontWeight: string;
  charspacing: number;
  lineheight: number;
}

interface ImageOptions extends BaseOptions {
  ../..: string;
}

// HTTP Interfaces

export type HTTPRequest<T, V> = Request & {
  body: T;
  query: V;
};
