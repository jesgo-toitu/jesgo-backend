import { Client } from 'pg';
import envVariables from '../config';
export class DbAccess {
  private client!: Client;

  public async connectWithConf() {
    return this.connect(
      envVariables.host,
      envVariables.port,
      envVariables.user,
      envVariables.password,
      envVariables.database
    );
  }

  /**
   * 接続
   * @param {string} host
   * @param {number} port
   * @param {string} user
   * @param {string} password
   * @param {string} database
   * @returns {Promise}
   */
  public async connect(
    host: string,
    port: number,
    user: string,
    password: string,
    database: string
  ) {
    this.client = new Client({
      host: host,
      port: port,
      user: user,
      password: password,
      database: database,
    });
    await this.client.connect();
  }

  /**
   * クエリ実行
   * @param {string} query
   * @param {any[]} parameters
   * @returns {Promise<unknown>}
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public async query(query: string, parameters: any[] = []): Promise<unknown> {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return (await this.client.query(query, parameters)).rows;
  }

  /**
   * 終了
   * @returns {Promise}
   */
  public async end() {
    await this.client.end();
  }
}
