import { AppConfig } from "./interfaces";
import dotenv from "dotenv";

dotenv.config();

class Config implements AppConfig {
  public mongo: { connString: string; name: string };
  public aws: {
    cloudfrontAddress: string;
    bucket: string;
    credentials: { accessKeyId: string; secretAccessKey: string };
  };
  public appPort: number;
  public appHost: string;
  constructor() {
    this.mongo = {
      name: process.env.MONGO_DB_NAME as string,
      connString: process.env.MONGO_DB_CONN_STRING as string,
    };
    this.aws = {
      cloudfrontAddress: process.env.AWS_CLOUDFRONT as string,

      bucket: process.env.AWS_BUCKET_NAME as string,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID as string,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY as string,
      },
    };
    this.appPort = parseInt((process.env.PORT as string) || "8080");
  }
}

export default new Config();
