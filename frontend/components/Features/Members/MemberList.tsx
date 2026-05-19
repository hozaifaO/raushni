"use client";

import { Edit, Trash2 } from "lucide-react";
import type { Member } from "@/types/models/member";

type MemberListProps = {
  members: Member[];
  readOnly?: boolean;
  onEdit: (member: Member) => void;
  onDelete: (member: Member) => void;
};

const statusClasses = {
  active: "border-emerald-200 bg-emerald-50 text-emerald-700",
  inactive: "border-gray-200 bg-gray-100 text-gray-700",
  pending: "border-amber-200 bg-amber-50 text-amber-700",
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

export default function MemberList({ members, readOnly = false, onEdit, onDelete }: MemberListProps) {
  if (members.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-gray-300 bg-white px-6 py-12 text-center">
        <p className="text-base font-semibold text-gray-950">No members found</p>
        <p className="mt-2 text-sm text-gray-600">
          Add a member or adjust the search and status filter.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">
                Member
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">
                Contact
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">
                Role
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">
                Joined
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">
                Status
              </th>
              {!readOnly && (
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase text-gray-500">
                  Actions
                </th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 bg-white">
            {members.map((member) => (
              <tr key={member.id} className="hover:bg-orange-50/50">
                <td className="whitespace-nowrap px-4 py-4">
                  <div className="font-semibold text-gray-950">{member.full_name}</div>
                  <div className="text-sm text-gray-500">{member.address || "Address not set"}</div>
                </td>
                <td className="whitespace-nowrap px-4 py-4">
                  <div className="text-sm font-medium text-gray-900">{member.phone}</div>
                  <div className="text-sm text-gray-500">{member.email || "Email not set"}</div>
                </td>
                <td className="whitespace-nowrap px-4 py-4 text-sm text-gray-700">
                  {member.role}
                </td>
                <td className="whitespace-nowrap px-4 py-4 text-sm text-gray-700">
                  {formatDate(member.joined_on)}
                </td>
                <td className="whitespace-nowrap px-4 py-4">
                  <span
                    className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold capitalize ${statusClasses[member.status]}`}
                  >
                    {member.status}
                  </span>
                </td>
                {!readOnly && (
                  <td className="whitespace-nowrap px-4 py-4 text-right">
                    <div className="inline-flex gap-2">
                      <button
                        type="button"
                        onClick={() => onEdit(member)}
                        className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 text-gray-600 transition hover:border-orange-300 hover:bg-orange-50 hover:text-orange-700"
                        aria-label={`Edit ${member.full_name}`}
                      >
                        <Edit size={16} aria-hidden="true" />
                      </button>
                      <button
                        type="button"
                        onClick={() => onDelete(member)}
                        className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 text-gray-600 transition hover:border-red-300 hover:bg-red-50 hover:text-red-700"
                        aria-label={`Delete ${member.full_name}`}
                      >
                        <Trash2 size={16} aria-hidden="true" />
                      </button>
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
