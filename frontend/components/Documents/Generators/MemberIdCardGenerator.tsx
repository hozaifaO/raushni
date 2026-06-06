"use client";

import { ArrowLeft, CreditCard, Printer, RefreshCw } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import MemberIDCard from "@/components/Documents/PDFGenerator/MemberIDCard";
import type { CmsDocumentTemplate } from "@/lib/cms/documentTemplates";
import { listMembers } from "@/services/api/members";
import type { Member } from "@/types/models/member";

type FormState = {
  memberName: string;
  memberRole: string;
  memberId: string;
  joinedOn: string;
  phone: string;
};

const today = new Date().toISOString().slice(0, 10);

function makeMemberId(member?: Pick<Member, "id">) {
  const source = member?.id ?? Math.random().toString(36).slice(2, 8);
  return `RSH-MEM-${source.slice(0, 8).toUpperCase()}`;
}

export default function MemberIdCardGenerator({ template }: { template: CmsDocumentTemplate }) {
  const [members, setMembers] = useState<Member[]>([]);
  const [selectedMemberId, setSelectedMemberId] = useState("");
  const [loadingMembers, setLoadingMembers] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>({
    memberName: "Member Name",
    memberRole: "Volunteer",
    memberId: makeMemberId(),
    joinedOn: today,
    phone: "+91",
  });

  useEffect(() => {
    async function load() {
      setLoadingMembers(true);
      setError(null);
      try {
        const response = await listMembers({ status: "all" });
        setMembers(response.items);
      } catch (requestError) {
        setError(requestError instanceof Error ? requestError.message : "Unable to load members. You can still type details manually.");
      } finally {
        setLoadingMembers(false);
      }
    }
    void load();
  }, []);

  const selectedMember = useMemo(
    () => members.find((member) => member.id === selectedMemberId),
    [members, selectedMemberId],
  );

  const selectMember = (memberId: string) => {
    setSelectedMemberId(memberId);
    const member = members.find((item) => item.id === memberId);
    if (!member) return;
    setForm({
      memberName: member.full_name,
      memberRole: member.role,
      memberId: makeMemberId(member),
      joinedOn: member.joined_on,
      phone: member.phone,
    });
  };

  const updateField = <K extends keyof FormState>(field: K, value: FormState[K]) => {
    setSelectedMemberId("");
    setForm((current) => ({ ...current, [field]: value }));
  };

  return (
    <section className="min-h-[calc(100vh-7rem)] bg-gray-50 px-4 py-8 text-gray-950 sm:px-6 lg:px-8">
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .document-print-area,
          .document-print-area * {
            visibility: visible;
          }
          .document-print-area {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            padding: 24px;
          }
          .document-print-hide {
            display: none !important;
          }
        }
      `}</style>
      <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-[360px_1fr]">
        <aside className="document-print-hide rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
          <Link href="/documents" className="inline-flex items-center gap-2 text-sm font-bold text-gray-600 transition hover:text-orange-700">
            <ArrowLeft size={16} aria-hidden="true" />
            Documents
          </Link>
          <div className="mt-5 flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-orange-100 text-orange-700">
              <CreditCard size={22} aria-hidden="true" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-orange-600">Generate</p>
              <h1 className="text-xl font-black">Member ID Card</h1>
            </div>
          </div>

          {error && <p className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm font-semibold text-amber-800">{error}</p>}

          <div className="mt-5 grid gap-4">
            <label className="grid gap-1 text-sm font-bold text-gray-700">
              Select member
              <select
                value={selectedMember?.id ?? ""}
                onChange={(event) => selectMember(event.target.value)}
                className="min-h-11 rounded-lg border border-gray-300 px-3 text-sm font-semibold text-gray-950 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
              >
                <option value="">{loadingMembers ? "Loading members..." : "Manual entry"}</option>
                {members.map((member) => (
                  <option key={member.id} value={member.id}>{member.full_name} - {member.role}</option>
                ))}
              </select>
            </label>
            <TextField label="Member name" value={form.memberName} onChange={(value) => updateField("memberName", value)} />
            <TextField label="Role" value={form.memberRole} onChange={(value) => updateField("memberRole", value)} />
            <TextField label="Member ID" value={form.memberId} onChange={(value) => updateField("memberId", value)} />
            <TextField label="Joined on" type="date" value={form.joinedOn} onChange={(value) => updateField("joinedOn", value)} />
            <TextField label="Phone" value={form.phone} onChange={(value) => updateField("phone", value)} />
            <button
              type="button"
              onClick={() => window.print()}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-orange-600 px-4 text-sm font-bold text-white shadow-sm transition hover:bg-orange-700"
            >
              <Printer size={18} aria-hidden="true" />
              Print / Save PDF
            </button>
            <button
              type="button"
              onClick={() => setForm((current) => ({ ...current, memberId: makeMemberId(selectedMember) }))}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-gray-300 px-4 text-sm font-bold text-gray-700 transition hover:bg-gray-50"
            >
              <RefreshCw size={18} aria-hidden="true" />
              Refresh ID
            </button>
          </div>
        </aside>

        <main className="document-print-area grid place-items-center rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <MemberIDCard
            template={template}
            memberName={form.memberName}
            memberRole={form.memberRole}
            memberId={form.memberId}
            joinedOn={form.joinedOn}
            phone={form.phone}
          />
        </main>
      </div>
    </section>
  );
}

function TextField({
  label,
  value,
  onChange,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
}) {
  return (
    <label className="grid gap-1 text-sm font-bold text-gray-700">
      {label}
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="min-h-11 rounded-lg border border-gray-300 px-3 text-sm font-semibold text-gray-950 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
      />
    </label>
  );
}
