"use client";

export default function PrintStyles() {
  return (
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
  );
}
