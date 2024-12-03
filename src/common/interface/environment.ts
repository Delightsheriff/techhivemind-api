export interface IEnvironment {
  APP: {
    NAME?: string;
    PORT?: number;
    ENV?: string;
    CLIENT?: string;
  };
  CLIENT: {
    URL?: string;
  };
  DB: {
    URI: string;
  };
  REDIS: {
    PASSWORD: string;
    PORT: number;
    HOST: string;
  };
}
