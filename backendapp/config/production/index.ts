import { EnvVariables } from '../';

const prodVariables: EnvVariables = {
    database: "jesgo_db",
    user: "postgres",
    password: "12345678",
    host: "localhost",
    port: 5432,
    passwordSalt: "abcde",
    privateKey: "",
    publicKey: "",
};

export default prodVariables;