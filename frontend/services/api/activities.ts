/**
 * @deprecated Prefer `listSimpleRecords("activities", …)` from `./simpleRecords`.
 */
import {
  createSimpleRecord,
  deleteSimpleRecord,
  listSimpleRecords,
  updateSimpleRecord,
} from "./simpleRecords";
import type { SimpleRecordFormValues, SimpleRecordStatus } from "@/types/models/simpleRecord";

type ListOptions = {
  search?: string;
  status?: SimpleRecordStatus | "all";
};

const MODULE = "activities";

export function listActivities(options: ListOptions = {}) {
  return listSimpleRecords(MODULE, options);
}

export function createActivity(values: SimpleRecordFormValues) {
  return createSimpleRecord(MODULE, values);
}

export function updateActivity(id: string, values: SimpleRecordFormValues) {
  return updateSimpleRecord(MODULE, id, values);
}

export function deleteActivity(id: string) {
  return deleteSimpleRecord(MODULE, id);
}
