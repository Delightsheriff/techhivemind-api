export interface IEnvironment {
  APP: {
    NAME?: string;
    PORT?: number;
    ENV?: string;
    CLIENT?: string;
    API?: string;
  };
  DB: {
    URI: string;
  };
  REDIS: {
    PASSWORD: string;
    PORT: number;
    HOST: string;
  };
  EMAIL: {
    USER: string;
    PASSWORD: string;
  };
  JWT: {
    ACCESS: string;
    REFRESH: string;
  };
  CLOUDINARY: {
    NAME: string;
    API_KEY: string;
    API_SECRET: string;
  };
  PAYSTACK: {
    API_SECRET: string;
    URL: string;
  };
}
