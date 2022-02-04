import { EnvVariables } from '../';
import * as fs from 'fs';

const _privateKey: string = fs.readFileSync('./backendapp/config/development/private.key').toString();
const _publicKey: string = fs.readFileSync('./backendapp/config/development/public.key').toString();

const devVariables: EnvVariables = {
    database: "jesgo_db",
    user: "postgres",
    password: "12345678",
    host: "localhost",
    port: 5432,
    passwordSalt: "abcde",
    privateKey: _privateKey,
    publicKey: _publicKey,
};

export default devVariables;