import devVariables from './development';
import stgVariables from './staging';
import prodVariables from './production';

export type EnvVariables = {
  database: string;
  user: string;
  password: string;
  host: string;
  port: number;
  passwordSalt: string;
  privateKey: string;
  publicKey: string;
};

const envVariables = (): EnvVariables => {
  if (process.env.FLAVOR === 'production') {
    return prodVariables;
  }
  if (process.env.FLAVOR === 'staging') {
    return stgVariables;
  }
  return devVariables;
};

export default envVariables();
