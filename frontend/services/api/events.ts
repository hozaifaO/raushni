/**
 * @deprecated Prefer `listSimpleRecords("events", …)` from `./simpleRecords`.
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

const MODULE = "events";

export function listEvents(options: ListOptions = {}) {
  return listSimpleRecords(MODULE, options);
}

export function createEvent(values: SimpleRecordFormValues) {
  return createSimpleRecord(MODULE, values);
}

export function updateEvent(id: string, values: SimpleRecordFormValues) {
  return updateSimpleRecord(MODULE, id, values);
}

export function deleteEvent(id: string) {
  return deleteSimpleRecord(MODULE, id);
}
