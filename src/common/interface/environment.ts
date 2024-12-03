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
    URL: string;
  };
}
