// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace Const {
  export const JESGO_TAG = {
    PREFIX: 'jesgo:tag',
    CANCER_MAJOR: 'cancer_major',
    CANCER_MINOR: 'cancer_minor',
    FIGO: 'figo',
    INITIAL_TREATMENT_DATE: 'initial_treatment_date',
    DIAGNOSIS_DATE: 'diagnosis_date',
    REGISTRABILITY: 'registrability',
    REGISTRATION_NUMBER: 'registration_number',
    RECURRENCE: 'recurrence',
    TREATMENT_SURGERY: 'treatment_surgery',
    TREATMENT_CHEMO: 'treatment_chemo',
    TREATMENT_RADIO: 'treatment_radio',
    TREATMENT_SUPPORTIVECARE: 'treatment_supportivecare',
    THREE_YEAR_PROGNOSIS: 'three_year_prognosis',
    FIVE_YEAR_PROGNOSIS: 'five_year_prognosis',
  }
}

export const jesgo_tagging = (tag:string):string => {
  return `"${Const.JESGO_TAG.PREFIX}":"${tag}"`
}

export const escapeText = (text:string):string => {
  return text.replace('"', '\\"');
}