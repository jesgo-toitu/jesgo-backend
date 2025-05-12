/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
export type EnvVariables = {
  database: string;
  user: string;
  password: string;
  host: string;
  port: number;
  passwordSalt: string;
  hashSalt: string;
  serverPort: number;
  privateKey: string;
  publicKey: string;
};

import * as fs from 'fs';

const _pathJson = fs
  .readFileSync('./package.json')
  .toString();
const pathJson = JSON.parse(_pathJson);
const configPath = process.env.NODE_ENV === 'production' ?
  pathJson['config']['configPath']['production'] :
  pathJson['config']['configPath']['development'];

const _configJson: string = fs
  .readFileSync(configPath as string || './backendapp/config/config.json')
  .toString();
const _privateKey: string = fs
  .readFileSync('./backendapp/config/keys/private.key')
  .toString();
const _publicKey: string = fs
  .readFileSync('./backendapp/config/keys/public.key')
  .toString();
const configJson = JSON.parse(_configJson);

const envVariables = (): EnvVariables => {
  return {
    database: configJson['server']['database'],
    user: configJson['server']['user'],
    password: configJson['server']['password'],
    host: configJson['server']['host'],
    port: configJson['server']['port'],
    passwordSalt: configJson['server']['passwordSalt'],
    hashSalt: configJson['server']['hashSalt'],
    serverPort: configJson['server']['serverPort'],
    privateKey: _privateKey,
    publicKey: _publicKey,
  };
};

export default envVariables();
