/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
export interface ApiReturnObject {
  statusNum: number;
  body: unknown;
}

export const RESULT = {
  NORMAL_TERMINATION: 0,
  ABNORMAL_TERMINATION: -1,
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
