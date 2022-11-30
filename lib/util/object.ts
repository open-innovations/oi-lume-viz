import { getUniqueItemsFromArray } from "./array.ts";

export function getAllKeysFromArrayOfRecords(recordArray: { [k: string]: unknown }[]) {
  return getUniqueItemsFromArray(recordArray.reduce((keys: string[], record) => [keys, Object.keys(record)].flat(), []));
}

export function getValuesInColumnOfArrayOfRecords(key: string, recordArray: { [k: string]: unknown }[]) {
  return recordArray.map((record: Record<string, unknown>) => record[key]);
}