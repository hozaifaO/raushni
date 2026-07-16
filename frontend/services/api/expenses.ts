/**
 * @deprecated Prefer `listSimpleRecords("expenses", …)` from `./simpleRecords`.
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

const MODULE = "expenses";

export function listExpenses(options: ListOptions = {}) {
  return listSimpleRecords(MODULE, options);
}

export function createExpense(values: SimpleRecordFormValues) {
  return createSimpleRecord(MODULE, values);
}

export function updateExpense(id: string, values: SimpleRecordFormValues) {
  return updateSimpleRecord(MODULE, id, values);
}

export function deleteExpense(id: string) {
  return deleteSimpleRecord(MODULE, id);
}
