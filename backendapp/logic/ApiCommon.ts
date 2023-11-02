/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
export interface ApiReturnObject {
  statusNum: number;
  body: unknown;
  userId?: number;
  error?: string;
}

export const RESULT = {
  NORMAL_TERMINATION: 0,
  ABNORMAL_TERMINATION: -1,
  ID_DUPLICATION: -2,
  NOT_FOUND_CASE: -3,
  TOKEN_EXPIRED_ERROR: -10,
  FAILED_USER_ALREADY_REGISTERED: -100,
  FAILED_USER_ERROR: -101,
  PLUGIN_ALREADY_UPDATED: -201,
};

export const getToken = (req: any): string => {
  let returnString = '';
  if (req.header('token') !== undefined) {
    returnString = req.header('token') as string;
  } else {
    returnString = req.body.headers.token as string;
  }
  return returnString;
};
