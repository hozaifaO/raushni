"use client";

import { useEffect, useState } from "react";

type ServiceStatus = "connected" | "checking" | "error";

export default function HomePage() {
  const [backendStatus, setBackendStatus] = useState<ServiceStatus>("checking");
  const [pythonStatus, setPythonStatus] = useState<ServiceStatus>("checking");

  useEffect(() => {
    fetch("http://localhost:8000/api/")
      .then((res) => {
        setBackendStatus(res.ok ? "connected" : "error");
      })
      .catch(() => setBackendStatus("error"));

    fetch("http://localhost:8000/health")
      .then((res) => {
        setPythonStatus(res.ok ? "connected" : "error");
      })
      .catch(() => setPythonStatus("error"));
  }, []);

  const statusText = (status: ServiceStatus): string => {
    if (status === "connected") return "Connected";
    if (status === "checking") return "Checking...";
    return "Not Available";
  };

  const statusClass = (status: ServiceStatus): string => {
    if (status === "connected") return "text-emerald-600";
    if (status === "checking") return "text-amber-600";
    return "text-red-600";
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-amber-50 px-6 py-16">
      <section className="mx-auto max-w-4xl">
        <h1 className="text-4xl font-bold text-gray-900">Welcome !</h1>
        <p className="mt-2 text-lg text-gray-600">
        </p>

        <div className="mt-8 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-gray-900">System Status</h2>
          <div className="mt-4 space-y-2 text-sm">
            <p>
              <span className="font-medium text-gray-800">Frontend:</span>{" "}
              <span className="text-emerald-600">Connected</span>
            </p>
            <p>
              <span className="font-medium text-gray-800">Backend:</span>{" "}
              <span className={statusClass(backendStatus)}>
                {statusText(backendStatus)}
              </span>
            </p>
            <p>
              <span className="font-medium text-gray-800">Python Service:</span>{" "}
              <span className={statusClass(pythonStatus)}>
                {statusText(pythonStatus)}
              </span>
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
