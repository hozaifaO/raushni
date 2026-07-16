/**
 * @deprecated Prefer `listSimpleRecords("news", …)` from `./simpleRecords`.
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

const MODULE = "news";

export function listNews(options: ListOptions = {}) {
  return listSimpleRecords(MODULE, options);
}

export function createNews(values: SimpleRecordFormValues) {
  return createSimpleRecord(MODULE, values);
}

export function updateNews(id: string, values: SimpleRecordFormValues) {
  return updateSimpleRecord(MODULE, id, values);
}

export function deleteNews(id: string) {
  return deleteSimpleRecord(MODULE, id);
}
