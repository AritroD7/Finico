import { Link } from "react-router-dom";
import { Icon } from "./Icons";

export default function InsightsSection() {
  const cards = [
    { 
      tag: "Guide • 6 min", 
      icon: "calculator",
      title: "The 50/30/20 rule — still useful in 2025?", 
      blurb: "A quick primer with real-world tweaks for high-inflation periods.", 
      href: "/help",
      color: "blue" 
    },
    { 
      tag: "Guide • 4 min", 
      icon: "chart",
      title: "Nominal vs real returns (and why it matters).", 
      blurb: "See how inflation changes your wealth picture, with a tiny example.", 
      href: "/help",
      color: "indigo" 
    },
    { 
      tag: "Guide • 5 min", 
      icon: "risk",
      title: "Monte-Carlo: plan for best / worst cases.", 
      blurb: "Stress-test your plan so surprises don't derail your goals.", 
      href: "/risk",
      color: "purple" 
    },
  ]
  
  // Icons for cards
  const getIcon = (name) => {
    switch(name) {
      case "calculator":
        return (
          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="4" y="2" width="16" height="20" rx="2" />
            <path d="M8 6h8M8 10h2M14 10h2M8 14h2M14 14h2M8 18h2M14 18h2" />
          </svg>
        );
      case "chart":
        return (
          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 21H3V3M21 9L15 15l-4-4-6 6" />
          </svg>
        );
      case "risk":
        return (
          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 9v2m0 4h.01M12 3a9 9 0 110 18 9 9 0 010-18z" />
          </svg>
        );
      default:
        return null;
    }
  };
  
  return (
    <section className="mx-auto mt-16 max-w-6xl px-4 pb-16">
      {/* Heading with background decoration */}
      <div className="relative">
        <div className="absolute -top-10 -left-10 h-32 w-32 rounded-full bg-blue-100/30 blur-3xl"></div>
        <h2 className="text-2xl font-bold text-slate-900 sm:text-3xl relative">
          Financial Insights
        </h2>
        <p className="mt-2 text-lg text-slate-600 max-w-2xl">
          Bite-sized guides to build confidence with your financial decisions.
        </p>
      </div>

      {/* Enhanced card grid with staggered animation */}
      <div className="mt-8 grid gap-6 md:grid-cols-3">
        {cards.map((c, idx) => (
          <article 
            key={c.title} 
            className={`group relative overflow-hidden rounded-2xl border border-slate-200/70 bg-white p-5 shadow-lg transition-all duration-500 hover:shadow-xl hover:-translate-y-1`}
            style={{ transitionDelay: `${idx * 75}ms` }}
          >
            {/* Background gradient effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-white via-white to-slate-50"></div>
            <div className={`absolute bottom-0 right-0 h-64 w-64 rounded-full ${c.color === "blue" ? "bg-blue-100/30" : c.color === "indigo" ? "bg-indigo-100/30" : "bg-purple-100/30"} blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500`}></div>
            
            {/* Top badge with icon */}
            <div className="relative flex items-center gap-2">
              <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${c.color === "blue" ? "bg-blue-100/80 text-blue-700" : c.color === "indigo" ? "bg-indigo-100/80 text-indigo-700" : "bg-purple-100/80 text-purple-700"} shadow-sm`}>
                {getIcon(c.icon)}
              </div>
              <div className={`text-[12px] font-semibold ${c.color === "blue" ? "text-blue-700 bg-blue-50" : c.color === "indigo" ? "text-indigo-700 bg-indigo-50" : "text-purple-700 bg-purple-50"} rounded-full px-3 py-1`}>
                {c.tag}
              </div>
            </div>
            
            {/* Content */}
            <h3 className="mt-4 text-[17px] font-semibold text-slate-900 relative">{c.title}</h3>
            <p className="mt-2 text-sm text-slate-600 relative leading-relaxed">{c.blurb}</p>
            
            {/* Enhanced CTA */}
            <div className="mt-5 relative">
              <Link 
                to={c.href} 
                className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold ${c.color === "blue" ? "text-blue-700 bg-blue-50/50 hover:bg-blue-50" : c.color === "indigo" ? "text-indigo-700 bg-indigo-50/50 hover:bg-indigo-50" : "text-purple-700 bg-purple-50/50 hover:bg-purple-50"} transition-colors duration-300`}
              >
                Read article
                <svg className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </Link>
            </div>
          </article>
        ))}
      </div>

      {/* Enhanced "View All" button */}
      <div className="mt-10 flex justify-center">
        <Link 
          to="/help" 
          className="group relative inline-flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-6 py-3 text-base font-semibold text-slate-800 shadow-sm hover:shadow-md transition-all duration-300"
        >
          <span className="absolute inset-0 bg-gradient-to-r from-slate-50 to-blue-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
          <span className="relative">View all insights</span>
          <span className="relative flex h-8 w-8 items-center justify-center rounded-full bg-blue-50 text-blue-600 transition-transform duration-300 group-hover:translate-x-1">
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </span>
        </Link>
      </div>
    </section>
  );
}