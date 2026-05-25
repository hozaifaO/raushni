"use client";

import { Award, ExternalLink, ShieldCheck } from "lucide-react";
import { use, useEffect, useState } from "react";
import { verifyInternshipCertificate } from "@/services/api/internships";
import type { InternshipCertificate } from "@/types/models/internship";

export default function Page({ params }: { params: Promise<{ code: string }> }) {
  const { code } = use(params);
  const [certificate, setCertificate] = useState<InternshipCertificate | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError(null);
      try {
        setCertificate(await verifyInternshipCertificate(code));
      } catch (requestError) {
        setError(requestError instanceof Error ? requestError.message : "Certificate could not be verified.");
      } finally {
        setLoading(false);
      }
    }
    void load();
  }, [code]);

  return (
    <section className="bg-[#f7f7f7] px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">
        <div className="rounded-lg border border-stone-200 bg-white p-6 shadow-sm">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700">
              <ShieldCheck size={24} aria-hidden="true" />
            </div>
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.18em] text-emerald-700">Certificate verification</p>
              <h1 className="mt-2 text-3xl font-black text-stone-950">Raushni Internship Certificate</h1>
              <p className="mt-2 text-sm leading-6 text-stone-800">
                Verify the authenticity of issued internship completion certificates using the QR code or certificate number.
              </p>
            </div>
          </div>

          {loading && <p className="mt-8 rounded-lg bg-white p-4 text-sm font-semibold text-stone-800 shadow-sm">Checking certificate...</p>}

          {error && (
            <div className="mt-8 rounded-lg border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">
              {error}
            </div>
          )}

          {certificate && (
            <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_180px]">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-sm font-bold text-emerald-700">
                  <Award size={16} aria-hidden="true" />
                  Verified and issued
                </div>
                <h2 className="mt-4 text-2xl font-black text-stone-950">{certificate.participant_name}</h2>
                <p className="mt-2 text-sm leading-6 text-stone-700">
                  Successfully completed <strong>{certificate.program_title}</strong> in the <strong>{certificate.track}</strong> track.
                </p>
                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  <Info label="Certificate No." value={certificate.certificate_number} />
                  <Info label="Issued on" value={new Date(certificate.issued_at).toLocaleDateString("en-IN")} />
                  <Info label="Status" value={certificate.status} />
                  <Info label="Verification code" value={certificate.verification_code} />
                </div>
                <a
                  href={`http://localhost:8000/api/v1/internships/certificates/${certificate.verification_code}/html`}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-6 inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-amber-400 px-5 text-sm font-bold text-stone-950 transition hover:bg-amber-300"
                >
                  Open printable certificate
                  <ExternalLink size={16} aria-hidden="true" />
                </a>
              </div>
              <div
                className="h-44 w-44 rounded-lg border border-stone-200 bg-white p-3"
                dangerouslySetInnerHTML={{ __html: certificate.qr_code_svg }}
              />
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-stone-200 bg-white p-3 shadow-sm">
      <p className="text-xs font-bold uppercase text-stone-700">{label}</p>
      <p className="mt-1 text-sm font-black capitalize text-stone-950">{value}</p>
    </div>
  );
}
