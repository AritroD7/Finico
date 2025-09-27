import React from "react";
import { Link } from "react-router-dom";

/**
 * Finico Footer — refined, decorative, still minimal.
 * - Gradient top rail, soft background gradient, subtle glows
 * - Quick links + tiny policy links
 */
export default function Footer() {
  return (
    <footer className="relative mt-10">
      {/* background & glows */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-white via-slate-50 to-slate-100" />
      <div className="pointer-events-none absolute left-[-120px] top-[-40px] h-40 w-40 rounded-full bg-[radial-gradient(circle_at_center,rgba(99,102,241,0.14),transparent_60%)] blur-2xl" />
      <div className="pointer-events-none absolute right-[-100px] bottom-[-40px] h-40 w-40 rounded-full bg-[radial-gradient(circle_at_center,rgba(56,189,248,0.13),transparent_60%)] blur-2xl" />

      {/* gradient rail */}
      <div className="mx-auto max-w-[1180px] px-4 sm:px-6">
        <div className="h-[2px] w-full bg-gradient-to-r from-violet-500 via-fuchsia-500 to-sky-400 opacity-80" />
      </div>

      <div className="mx-auto max-w-[1180px] px-4 py-8 sm:px-6">
        <div className="grid grid-cols-1 items-start gap-8 sm:grid-cols-3">
          {/* Brand blurb */}
          <div>
            <div className="text-lg font-semibold text-slate-900">Finico</div>
            <p className="mt-1 text-sm text-slate-600">
              Plan, forecast, and stress-test your money — elegantly.
            </p>
          </div>

          {/* Nav groups */}
          <div className="grid grid-cols-2 gap-8 sm:col-span-2 sm:grid-cols-4">
            <FooterCol title="Product">
              <FooterLink to="/budget" label="Budget" />
              <FooterLink to="/forecast" label="Forecast" />
              <FooterLink to="/risk" label="Risk" />
              <FooterLink to="/goal" label="Goal" />
            </FooterCol>

            <FooterCol title="Resources">
              <FooterLink to="/help" label="How it works" />
              <FooterLink to="/help" label="Docs & FAQs" />
              <FooterLink to="/help#contact" label="Support" />
              <FooterLink to="/" label="Changelog" />
            </FooterCol>

            <FooterCol title="Company">
              <FooterLink to="/" label="About" />
              <FooterLink to="/" label="Careers" />
              <FooterLink to="/" label="Blog" />
              <FooterLink to="/" label="Press" />
            </FooterCol>

            <FooterCol title="Legal">
              <FooterLink to="/" label="Privacy" />
              <FooterLink to="/" label="Terms" />
              <FooterLink to="/" label="Security" />
              <FooterLink to="/" label="Cookies" />
            </FooterCol>
          </div>
        </div>

        {/* bottom strip */}
        <div className="mt-8 flex flex-col items-center justify-between gap-3 border-t border-slate-200/70 pt-4 text-sm text-slate-500 sm:flex-row">
          <div>© {new Date().getFullYear()} Finico. All rights reserved.</div>
          <div className="flex items-center gap-4">
            <Link to="/" className="hover:text-slate-700">Status</Link>
            <Link to="/" className="hover:text-slate-700">Privacy</Link>
            <Link to="/" className="hover:text-slate-700">Terms</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({ title, children }) {
  return (
    <div>
      <div className="text-sm font-semibold text-slate-900">{title}</div>
      <ul className="mt-2 space-y-1.5">{children}</ul>
    </div>
  );
}
function FooterLink({ to, label }) {
  return (
    <li>
      <Link to={to} className="text-sm text-slate-600 hover:text-slate-900">
        {label}
      </Link>
    </li>
  );
}
