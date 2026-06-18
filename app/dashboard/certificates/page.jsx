"use client";

import { useState, useEffect } from "react";
import {
  Award, CheckCircle2, XCircle, FileText,
  Hash, Calendar, ChevronRight, LayoutGrid, LayoutList,
} from "lucide-react";
import { useLocale } from "@/context/LocaleContext";
import { fetchMyCertificates } from "@/utils/academyApi";

const STATUS_STYLE = {
  ISSUED:  { icon: CheckCircle2, bg: "rgba(52,211,153,0.15)",  text: "#34d399", border: "rgba(52,211,153,0.3)"  },
  DRAFT:   { icon: FileText,     bg: "rgba(148,163,184,0.15)", text: "#94a3b8", border: "rgba(148,163,184,0.3)" },
  REVOKED: { icon: XCircle,      bg: "rgba(248,113,113,0.15)", text: "#f87171", border: "rgba(248,113,113,0.3)" },
};

/* ── Skeletons ─────────────────────────────────────────────────── */

function CertSkeleton() {
  return (
    <div className="dash-card p-5 animate-pulse flex items-center gap-4">
      <div className="w-12 h-12 rounded-xl shrink-0" style={{ background: "rgba(var(--dash-border-a),0.1)" }} />
      <div className="flex-1 space-y-2">
        <div className="h-4 rounded-full" style={{ background: "rgba(var(--dash-border-a),0.1)", width: "60%" }} />
        <div className="h-3 rounded-full" style={{ background: "rgba(var(--dash-border-a),0.07)", width: "40%" }} />
        <div className="h-3 rounded-full" style={{ background: "rgba(var(--dash-border-a),0.07)", width: "30%" }} />
      </div>
      <div className="w-16 h-6 rounded-full shrink-0" style={{ background: "rgba(var(--dash-border-a),0.1)" }} />
    </div>
  );
}

function CertRowSkeleton() {
  return (
    <tr className="animate-pulse">
      {[28, 36, 18, 20, 14].map((w, i) => (
        <td key={i} className="px-4 py-3">
          <div className="h-3 rounded-full" style={{ background: "rgba(var(--dash-border-a),0.1)", width: `${w}%` }} />
        </td>
      ))}
    </tr>
  );
}

/* ── Grid card ─────────────────────────────────────────────────── */

function CertCard({ cert, index }) {
  const { t } = useLocale();
  const style = STATUS_STYLE[cert.status] ?? STATUS_STYLE.DRAFT;
  const StatusIcon = style.icon;

  const issuedDate = cert.issued_at
    ? new Date(cert.issued_at).toLocaleDateString(undefined, {
        year: "numeric", month: "long", day: "numeric",
      })
    : null;

  return (
    <div className="dash-card p-5 flex items-start gap-4 dash-anim-up" style={{ animationDelay: `${index * 0.07}s` }}>
      {/* Icon */}
      <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
        style={{ background: style.bg, border: `1px solid ${style.border}` }}>
        <Award size={22} style={{ color: style.text }} strokeWidth={1.6} />
      </div>

      {/* Body */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2 mb-1.5">
          <h3 className="text-sm font-semibold leading-snug line-clamp-2" style={{ color: "var(--dt-primary)" }}>
            {cert.enrollment_id}
          </h3>
          <span className="shrink-0 flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full"
            style={{ background: style.bg, color: style.text, border: `1px solid ${style.border}` }}>
            <StatusIcon size={9} />
            {t(`dash_cert_status_${cert.status.toLowerCase()}`)}
          </span>
        </div>

        <div className="flex flex-col gap-1">
          <p className="text-xs flex items-center gap-1.5" style={{ color: "var(--dt-muted)" }}>
            <Hash size={10} />
            <span className="font-mono">{cert.certificate_number}</span>
          </p>
          {issuedDate && (
            <p className="text-xs flex items-center gap-1.5" style={{ color: "var(--dt-muted)" }}>
              <Calendar size={10} />
              {t("dash_cert_issued_on")}: {issuedDate}
            </p>
          )}
        </div>

        {cert.status === "ISSUED" && (
          <div className="flex items-center gap-2 mt-3">
            <a
              href={`/api/v1/certificates/verify/${cert.certificate_number}`}
              target="_blank"
              rel="noopener noreferrer"
              className="dash-pill-btn flex items-center gap-1 text-[11px] font-medium px-2.5 py-1.5"
              style={{ color: "var(--dt-secondary)" }}
            >
              {t("dash_verify_cert")} <ChevronRight size={10} />
            </a>
            {cert.file_url && (
              <a
                href={cert.file_url}
                download
                className="dash-pill-btn flex items-center gap-1 text-[11px] font-medium px-2.5 py-1.5"
                style={{ color: "#34d399", borderColor: "rgba(52,211,153,0.3)" }}
              >
                {t("dash_download_cert")}
              </a>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

/* ── List row ──────────────────────────────────────────────────── */

function CertRow({ cert, index }) {
  const { t } = useLocale();
  const style      = STATUS_STYLE[cert.status] ?? STATUS_STYLE.DRAFT;
  const StatusIcon = style.icon;

  const issuedDate = cert.issued_at
    ? new Date(cert.issued_at).toLocaleDateString(undefined, {
        year: "numeric", month: "short", day: "numeric",
      })
    : "—";

  return (
    <tr
      className="dash-anim-up transition-colors duration-150"
      style={{ animationDelay: `${index * 0.04}s`, borderBottom: "1px solid var(--dash-border)" }}
      onMouseEnter={(e) => e.currentTarget.style.background = "rgba(var(--dash-border-a),0.04)"}
      onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
    >
      {/* Certificate No. */}
      <td className="px-4 py-3">
        <span className="font-mono text-xs" style={{ color: "var(--dt-secondary)" }}>
          {cert.certificate_number}
        </span>
      </td>

      {/* Enrollment */}
      <td className="px-4 py-3 min-w-[180px]">
        <p className="text-sm font-semibold line-clamp-1" style={{ color: "var(--dt-primary)" }}>
          {cert.enrollment_id}
        </p>
      </td>

      {/* Status */}
      <td className="px-4 py-3">
        <span className="flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full w-fit whitespace-nowrap"
          style={{ background: style.bg, color: style.text, border: `1px solid ${style.border}` }}>
          <StatusIcon size={9} />
          {t(`dash_cert_status_${cert.status.toLowerCase()}`)}
        </span>
      </td>

      {/* Issued On */}
      <td className="px-4 py-3">
        <span className="text-xs flex items-center gap-1 whitespace-nowrap" style={{ color: "var(--dt-muted)" }}>
          <Calendar size={11} /> {issuedDate}
        </span>
      </td>

      {/* Actions */}
      <td className="px-4 py-3">
        {cert.status === "ISSUED" ? (
          <div className="flex items-center gap-2">
            <a
              href={`/api/v1/certificates/verify/${cert.certificate_number}`}
              target="_blank"
              rel="noopener noreferrer"
              className="dash-pill-btn inline-flex items-center gap-1 text-[11px] font-medium px-2.5 py-1.5 whitespace-nowrap"
              style={{ color: "var(--dt-secondary)" }}
            >
              {t("dash_verify_cert")} <ChevronRight size={10} />
            </a>
            {cert.file_url && (
              <a
                href={cert.file_url}
                download
                className="dash-pill-btn inline-flex items-center gap-1 text-[11px] font-medium px-2.5 py-1.5 whitespace-nowrap"
                style={{ color: "#34d399", borderColor: "rgba(52,211,153,0.3)" }}
              >
                {t("dash_download_cert")}
              </a>
            )}
          </div>
        ) : (
          <span style={{ color: "var(--dt-muted)" }}>—</span>
        )}
      </td>
    </tr>
  );
}

/* ── Page ──────────────────────────────────────────────────────── */

export default function CertificatesPage() {
  const { t } = useLocale();
  const [certificates, setCertificates]       = useState([]);
  const [allCertificates, setAllCertificates] = useState([]);
  const [loading, setLoading]                 = useState(true);
  const [filter, setFilter]                   = useState("ALL");
  const [view, setView]                       = useState("grid");

  useEffect(() => {
    fetchMyCertificates().then((data) => setAllCertificates(data));
  }, []);

  useEffect(() => {
    setLoading(true);
    fetchMyCertificates({ status: filter !== "ALL" ? filter : undefined }).then((data) => {
      setCertificates(data);
      setLoading(false);
    });
  }, [filter]);

  const statuses = ["ALL", "ISSUED", "DRAFT", "REVOKED"];
  const issued   = allCertificates.filter((c) => c.status === "ISSUED").length;

  const TABLE_COLS = [
    t("dash_col_cert_number"),
    t("dash_col_enrollment"),
    t("dash_col_status"),
    t("dash_col_issued_on"),
    t("dash_col_action"),
  ];

  return (
    <div className="max-w-[900px] mx-auto space-y-6">

      {/* ── Header ── */}
      <div className="dash-anim-up" style={{ animationDelay: "0s" }}>
        <h1 className="text-2xl font-bold" style={{ color: "var(--dt-primary)" }}>
          {t("dash_my_certificates")}
        </h1>
        <p className="text-sm mt-0.5" style={{ color: "var(--dt-muted)" }}>
          {t("dash_certificates_desc")}
        </p>
      </div>

      {/* ── Mini stats ── */}
      {allCertificates.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 dash-anim-up" style={{ animationDelay: "0.06s" }}>
          {[
            { icon: Award,        label: t("dash_stat_certificates"),  value: allCertificates.length,                                              color: "#14b8a6" },
            { icon: CheckCircle2, label: t("dash_cert_status_issued"), value: issued,                                                              color: "#34d399" },
            { icon: FileText,     label: t("dash_cert_status_draft"),
              value: allCertificates.filter((c) => c.status === "DRAFT").length, color: "#94a3b8" },
          ].map(({ icon: Icon, label, value, color }, i) => (
            <div key={i} className="dash-card p-4 flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                style={{ background: `${color}22`, border: `1px solid ${color}33` }}>
                <Icon size={16} style={{ color }} strokeWidth={1.8} />
              </div>
              <div>
                <p className="text-lg font-bold leading-none" style={{ color: "var(--dt-primary)" }}>{value}</p>
                <p className="text-[10px] mt-0.5" style={{ color: "var(--dt-muted)" }}>{label}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Filter bar ── */}
      <div className="flex flex-wrap items-center gap-3 dash-anim-up" style={{ animationDelay: "0.1s" }}>
        {/* Status filter */}
        <div className="flex items-center gap-1 dash-glass p-1 rounded-xl">
          {statuses.map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className="px-3 py-1.5 rounded-lg text-[11px] font-semibold capitalize transition-all duration-150"
              style={filter === s
                ? { background: "linear-gradient(135deg,#14b8a6,#0d9488)", color: "#fff" }
                : { color: "var(--dt-muted)" }}
            >
              {s === "ALL" ? t("dash_all") : t(`dash_cert_status_${s.toLowerCase()}`)}
            </button>
          ))}
        </div>

        {/* View toggle */}
        <div
          className="flex items-center p-1 rounded-xl gap-0.5"
          style={{ background: "var(--dash-glass-bg)", border: "1px solid var(--dash-border)" }}
        >
          <button
            onClick={() => setView("grid")}
            className="p-1.5 rounded-lg transition-all duration-150"
            style={view === "grid"
              ? { background: "linear-gradient(135deg,#14b8a6,#0d9488)", color: "#fff" }
              : { color: "var(--dt-muted)" }}
            title={t("dash_view_grid")}
          >
            <LayoutGrid size={14} />
          </button>
          <button
            onClick={() => setView("list")}
            className="p-1.5 rounded-lg transition-all duration-150"
            style={view === "list"
              ? { background: "linear-gradient(135deg,#14b8a6,#0d9488)", color: "#fff" }
              : { color: "var(--dt-muted)" }}
            title={t("dash_view_list")}
          >
            <LayoutList size={14} />
          </button>
        </div>
      </div>

      {/* ── Grid view ── */}
      {view === "grid" && (
        <div className="space-y-3">
          {loading
            ? Array.from({ length: 3 }).map((_, i) => <CertSkeleton key={i} />)
            : certificates.length > 0
              ? certificates.map((c, i) => <CertCard key={c.id} cert={c} index={i} />)
              : (
                <div className="dash-card p-10 flex flex-col items-center gap-3 text-center">
                  <Award size={36} style={{ color: "var(--dt-muted)" }} strokeWidth={1.2} />
                  <p className="text-sm font-medium" style={{ color: "var(--dt-secondary)" }}>
                    {t("dash_no_certificates")}
                  </p>
                  <p className="text-xs" style={{ color: "var(--dt-muted)" }}>
                    {t("dash_no_certificates_desc")}
                  </p>
                </div>
              )
          }
        </div>
      )}

      {/* ── List view ── */}
      {view === "list" && (
        <div className="dash-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr style={{ borderBottom: "1px solid var(--dash-border)", background: "rgba(var(--dash-border-a),0.04)" }}>
                  {TABLE_COLS.map((col) => (
                    <th
                      key={col}
                      className="px-4 py-3 text-start text-[11px] font-semibold uppercase tracking-wider whitespace-nowrap"
                      style={{ color: "var(--dt-muted)" }}
                    >
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading
                  ? Array.from({ length: 3 }).map((_, i) => <CertRowSkeleton key={i} />)
                  : certificates.length > 0
                    ? certificates.map((c, i) => <CertRow key={c.id} cert={c} index={i} />)
                    : (
                      <tr>
                        <td colSpan={TABLE_COLS.length} className="px-4 py-10 text-center">
                          <div className="flex flex-col items-center gap-3">
                            <Award size={28} style={{ color: "var(--dt-muted)" }} strokeWidth={1.2} />
                            <p className="text-sm font-medium" style={{ color: "var(--dt-secondary)" }}>
                              {t("dash_no_certificates")}
                            </p>
                            <p className="text-xs" style={{ color: "var(--dt-muted)" }}>
                              {t("dash_no_certificates_desc")}
                            </p>
                          </div>
                        </td>
                      </tr>
                    )
                }
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
