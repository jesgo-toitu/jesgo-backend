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
  privateKey: string;
  publicKey: string;
};

import * as fs from 'fs';

const _configJson: string = fs
  .readFileSync('./backendapp/config/config.json')
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
    database: configJson['database'],
    user: configJson['user'],
    password: configJson['password'],
    host: configJson['host'],
    port: configJson['port'],
    passwordSalt: configJson['passwordSalt'],
    hashSalt: configJson['hashSalt'],
    privateKey: _privateKey,
    publicKey: _publicKey,
  };
};

export default envVariables();
