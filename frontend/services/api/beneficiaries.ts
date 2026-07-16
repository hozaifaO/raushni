/**
 * @deprecated Prefer `listSimpleRecords("beneficiaries", …)` from `./simpleRecords`.
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

const MODULE = "beneficiaries";

export function listBeneficiaries(options: ListOptions = {}) {
  return listSimpleRecords(MODULE, options);
}

export function createBeneficiary(values: SimpleRecordFormValues) {
  return createSimpleRecord(MODULE, values);
}

export function updateBeneficiary(id: string, values: SimpleRecordFormValues) {
  return updateSimpleRecord(MODULE, id, values);
}

export function deleteBeneficiary(id: string) {
  return deleteSimpleRecord(MODULE, id);
}
