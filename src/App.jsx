import { useState, useEffect } from "react";
import API from "./Api";
import { getInternships } from "./internshipService";

/* ─── GLOBAL STYLES ─────────────────────────────────────────────────────── */
const GlobalStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&display=swap');

    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    html { scroll-behavior: smooth; }
    body {
      font-family: 'Manrope', sans-serif;
      background: #0c0c0f;
      color: #e8e8ed;
      min-height: 100vh;
      overflow-x: hidden;
    }
    ::-webkit-scrollbar { width: 6px; }
    ::-webkit-scrollbar-track { background: #111116; }
    ::-webkit-scrollbar-thumb { background: #333; border-radius: 99px; }

    @keyframes fadeUp {
      from { opacity: 0; transform: translateY(28px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    @keyframes fadeIn {
      from { opacity: 0; }
      to   { opacity: 1; }
    }
    @keyframes slideRight {
      from { opacity: 0; transform: translateX(40px); }
      to   { opacity: 1; transform: translateX(0); }
    }
    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.5; }
    }
    @keyframes shimmer {
      0%   { background-position: -200% center; }
      100% { background-position:  200% center; }
    }
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
    @keyframes float {
      0%, 100% { transform: translateY(0px); }
      50% { transform: translateY(-12px); }
    }
    @keyframes glow {
      0%, 100% { box-shadow: 0 0 20px rgba(139,92,246,0.3); }
      50% { box-shadow: 0 0 40px rgba(139,92,246,0.6); }
    }

    .fade-up   { animation: fadeUp   0.6s ease both; }
    .fade-in   { animation: fadeIn   0.5s ease both; }
    .slide-r   { animation: slideRight 0.7s ease both; }

    .d1 { animation-delay: 0.05s; }
    .d2 { animation-delay: 0.15s; }
    .d3 { animation-delay: 0.25s; }
    .d4 { animation-delay: 0.35s; }
    .d5 { animation-delay: 0.45s; }
    .d6 { animation-delay: 0.55s; }

    button { cursor: pointer; border: none; outline: none; font-family: inherit; }
    input, textarea, select { font-family: inherit; outline: none; }
    a { text-decoration: none; color: inherit; }

    .hover-lift {
      transition: transform 0.22s ease, box-shadow 0.22s ease;
    }
    .hover-lift:hover {
      transform: translateY(-3px);
      box-shadow: 0 16px 48px rgba(0,0,0,0.5);
    }
  `}</style>
);

/* ─── DESIGN TOKENS ─────────────────────────────────────────────────────── */
// Dark mode colors (default)
const colorsDark = {
  bg:        "#0c0c0f",
  surface:   "#111116",
  card:      "#18181f",
  cardHover: "#1e1e28",
  border:    "#2a2a38",
  borderLight:"#333348",
  purple:    "#8b5cf6",
  purpleLight:"#a78bfa",
  purpleDim: "rgba(139,92,246,0.15)",
  green:     "#22c55e",
  greenDim:  "rgba(34,197,94,0.15)",
  yellow:    "#eab308",
  yellowDim: "rgba(234,179,8,0.15)",
  red:       "#ef4444",
  blue:      "#3b82f6",
  text:      "#e8e8ed",
  textMuted: "#6b6b80",
  textSoft:  "#9999b0",
};

// Light mode colors
const colorsLight = {
  bg:        "#ffffff",
  surface:   "#f5f5f7",
  card:      "#ffffff",
  cardHover: "#f0f0f5",
  border:    "#e5e5ec",
  borderLight:"#d9d9e3",
  purple:    "#8b5cf6",
  purpleLight:"#a78bfa",
  purpleDim: "rgba(139,92,246,0.08)",
  green:     "#22c55e",
  greenDim:  "rgba(34,197,94,0.08)",
  yellow:    "#eab308",
  yellowDim: "rgba(234,179,8,0.08)",
  red:       "#ef4444",
  blue:      "#3b82f6",
  text:      "#000000",
  textMuted: "#666666",
  textSoft:  "#888888",
};

const getColors = (isDark = true) => isDark ? colorsDark : colorsLight;
const C = colorsDark; // Default to dark

/* ─── TINY UI ATOMS ─────────────────────────────────────────────────────── */
const Badge = ({ children, color = C.purple }) => (
  <span style={{
    display: "inline-flex", alignItems: "center",
    padding: "3px 10px", borderRadius: 99,
    fontSize: 11, fontWeight: 600, letterSpacing: "0.04em",
    background: color + "22", color, border: `1px solid ${color}44`,
  }}>{children}</span>
);

const Divider = () => (
  <div style={{ height: 1, background: C.border, margin: "0" }} />
);

const StatusDot = ({ status }) => {
  const map = {
    "Interview":  { color: C.yellow,  icon: "★" },
    "Applied":    { color: C.textMuted,icon: "○" },
    "Completed":  { color: C.green,   icon: "✓" },
    "Shortlisted":{ color: C.purple,  icon: "◆" },
    "Rejected":   { color: C.red,     icon: "✕" },
    "Under Review":{ color: C.blue,   icon: "◎" },
  };
  const s = map[status] || { color: C.textMuted, icon: "·" };
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 13, fontWeight: 600, color: s.color }}>
      <span style={{ fontSize: 15 }}>{s.icon}</span> {status}
    </span>
  );
};

const ProgressBar = ({ value, color = C.purple, thin }) => (
  <div style={{ background: C.border, borderRadius: 99, height: thin ? 4 : 6, overflow: "hidden" }}>
    <div style={{
      width: `${Math.min(value, 100)}%`, height: "100%",
      background: `linear-gradient(90deg, ${color}, ${color}cc)`,
      borderRadius: 99, transition: "width 0.6s ease",
    }} />
  </div>
);

/* ─── MOCK DATA ─────────────────────────────────────────────────────────── */
const INTERNSHIPS = [
  { id:1, company:"Google",    logo:"G", color:"#4285f4", title:"Software Engineering Intern",   location:"Remote",  stipend:"₹28,000/mo", duration:"3 months", skills:["React","Python","DSA"],   deadline:"Mar 15", applicants:142, status:"Interview",   posted:"2d ago" },
  { id:2, company:"Microsoft", logo:"M", color:"#00a4ef", title:"Product Management Intern",     location:"Hybrid",  stipend:"₹25,000/mo", duration:"4 months", skills:["PM","Analytics","SQL"],   deadline:"Mar 14", applicants:89,  status:"Applied",     posted:"5d ago" },
  { id:3, company:"Amazon",    logo:"A", color:"#ff9900", title:"Frontend Developer Intern",     location:"Remote",  stipend:"₹30,000/mo", duration:"6 months", skills:["React","TypeScript","CSS"],deadline:"Mar 12", applicants:203, status:"Completed",   posted:"1w ago" },
  { id:4, company:"Zomato",    logo:"Z", color:"#e23744", title:"Backend Developer Intern",      location:"Remote",  stipend:"₹20,000/mo", duration:"3 months", skills:["Node.js","MongoDB"],      deadline:"Apr 01", applicants:55,  status:"Shortlisted", posted:"3d ago" },
  { id:5, company:"AWS",       logo:"A", color:"#ff9900", title:"Cloud Engineering Intern",      location:"Remote",  stipend:"₹32,000/mo", duration:"6 months", skills:["AWS","DevOps","Python"],   deadline:"Apr 10", applicants:67,  status:"Under Review",posted:"1d ago" },
  { id:6, company:"Neftero",   logo:"N", color:"#22c55e", title:"ML Engineering Intern",         location:"Remote",  stipend:"₹22,000/mo", duration:"4 months", skills:["Python","TensorFlow"],    deadline:"Apr 05", applicants:44,  status:"Applied",     posted:"4d ago" },
];

const RECENT_APPS = [
  { company:"Google",    role:"Software Engineering Intern", date:"Mar 15", status:"Interview",  color:"#4285f4" },
  { company:"Microsoft", role:"Product Management Intern",   date:"Mar 14", status:"Applied",    color:"#00a4ef" },
  { company:"Amazon",    role:"Frontend Developer Intern",   date:"Mar 12", status:"Completed",  color:"#ff9900" },
];

const MY_APPS = [
  { id:1, company:"Google",    color:"#4285f4", role:"Software Engineering Intern", applied:"Feb 10", status:"Interview",   progress:65,
    tasks:[
      { id:1, title:"Complete coding assessment", done:true, due:"Feb 18" },
      { id:2, title:"Technical interview prep",   done:true, due:"Feb 25" },
      { id:3, title:"Final HR round",             done:false,due:"Mar 20" },
    ],
    feedback:[{ from:"Priya (Mentor)", msg:"Strong DSA skills. Focus more on system design concepts and scalability questions.", date:"Feb 22" }]
  },
  { id:2, company:"Microsoft", color:"#00a4ef", role:"Product Management Intern",   applied:"Feb 05", status:"Applied",     progress:30,
    tasks:[
      { id:1, title:"Submit PM case study",  done:true, due:"Feb 15" },
      { id:2, title:"Analytics assignment",  done:false,due:"Mar 01" },
    ],
    feedback:[]
  },
  { id:3, company:"Amazon",    color:"#ff9900", role:"Frontend Developer Intern",   applied:"Jan 28", status:"Completed",   progress:100,
    tasks:[
      { id:1, title:"React project",     done:true, due:"Feb 10" },
      { id:2, title:"Code review round", done:true, due:"Feb 20" },
    ],
    feedback:[{ from:"Raj (Tech Lead)", msg:"Excellent React skills and attention to UI detail. Highly recommend for full-time.", date:"Mar 12" }]
  },
];

const ADMIN_INTERNS = [
  { id:1, name:"Rahul Sharma",  avatar:"RS", role:"Frontend Intern",    company:"Google",    progress:65,  status:"Active",    mentor:"Sarah K.", tasks:3, done:2 },
  { id:2, name:"Priya Patel",   avatar:"PP", role:"Data Intern",        company:"Microsoft", progress:40,  status:"Active",    mentor:"John M.",  tasks:2, done:1 },
  { id:3, name:"Amit Singh",    avatar:"AS", role:"Backend Intern",     company:"Amazon",    progress:100, status:"Completed", mentor:"Lisa R.",  tasks:5, done:5 },
  { id:4, name:"Sneha Gupta",   avatar:"SG", role:"ML Intern",          company:"Neftero",   progress:20,  status:"Active",    mentor:"Alex T.",  tasks:4, done:1 },
  { id:5, name:"Kiran Reddy",   avatar:"KR", role:"Cloud Intern",       company:"AWS",       progress:55,  status:"Active",    mentor:"Maya S.",  tasks:3, done:2 },
];

/* ─── NAV ───────────────────────────────────────────────────────────────── */
function Navbar({ page, setPage, role, setRole, setPage2, isDark, setIsDark }) {
  const [scrolled, setScrolled] = useState(false);
  const C = getColors(isDark || true);
  
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);

  return (
    <nav style={{
      position: "fixed", top: 0, left: 0, right: 0, zIndex: 200,
      height: 64,
      background: scrolled ? `rgba(${isDark ? "12,12,15" : "255,255,255"},0.92)` : "transparent",
      backdropFilter: scrolled ? "blur(20px)" : "none",
      borderBottom: scrolled ? `1px solid ${C.border}` : "1px solid transparent",
      display: "flex", alignItems: "center", justifyContent: "space-between",
      padding: "0 48px",
      transition: "all 0.3s ease",
    }}>
      {/* Logo */}
      <div onClick={() => setPage("home")} style={{ display:"flex", alignItems:"center", gap:10, cursor:"pointer" }}>
        <div style={{
          width:32, height:32, borderRadius:8,
          background:`linear-gradient(135deg, ${C.purple}, #6d28d9)`,
          display:"flex", alignItems:"center", justifyContent:"center",
          fontSize:16, fontWeight:800, color:"#fff",
          fontFamily:"'Manrope', sans-serif",
        }}>E</div>
        <span style={{ fontFamily:"'Manrope', sans-serif", fontWeight:700, fontSize:18, color:C.text }}>Easy<span style={{ color:C.purple }}>Intern</span></span>
      </div>

      {/* Nav links */}
      <div style={{ display:"flex", alignItems:"center", gap:4 }}>
        {[
          { id:"home",        label:"Home" },
          { id:"internships", label:"Browse" },
          ...(role === "student"  ? [{ id:"student",    label:"Dashboard" }, { id:"profile", label:"Profile" }] : []),
          ...(role === "employer" ? [{ id:"employer",   label:"Portal" }, { id:"profile", label:"Profile" }] : []),
          ...(role === "admin"    ? [{ id:"admin",      label:"Admin" }, { id:"profile", label:"Profile" }] : []),
        ].map(({ id, label }) => (
          <button key={id} onClick={() => setPage(id)} style={{
            padding:"7px 16px", borderRadius:8, fontSize:13, fontWeight:500,
            background: page === id ? C.purpleDim : "transparent",
            color: page === id ? C.purpleLight : C.textSoft,
            border: page === id ? `1px solid ${C.purple}44` : `1px solid transparent`,
            transition: "all 0.2s",
          }}
          onMouseEnter={e => { if(page!==id){ e.target.style.color=C.text; e.target.style.background="rgba(255,255,255,0.04)"; }}}
          onMouseLeave={e => { if(page!==id){ e.target.style.color=C.textSoft; e.target.style.background="transparent"; }}}
          >{label}</button>
        ))}
      </div>

      {/* Right side */}
      <div style={{ display:"flex", alignItems:"center", gap:10 }}>
        <button onClick={() => setIsDark(!isDark)} style={{ padding:"8px 12px", borderRadius:8, fontSize:16, background:"transparent", color:C.textSoft, border:`1px solid ${C.border}`, transition:"all 0.2s", cursor:"pointer" }} title={isDark ? "Light Mode" : "Dark Mode"}>
          {isDark ? "☀️" : "🌙"}
        </button>
        {!role ? (
          <>
            <button onClick={() => setPage("login")} style={{ padding:"8px 18px", borderRadius:8, fontSize:13, fontWeight:500, background:"transparent", color:C.textSoft, border:`1px solid ${C.border}`, transition:"all 0.2s" }}>Log in</button>
            <button onClick={() => setPage("signup")} style={{ padding:"8px 18px", borderRadius:8, fontSize:13, fontWeight:600, background:C.purple, color:"#fff", transition:"all 0.2s" }}>Get Started</button>
          </>
        ) : (
          <div style={{ display:"flex", alignItems:"center", gap:10 }}>
            <div style={{ width:32, height:32, borderRadius:8, background:C.purpleDim, border:`1px solid ${C.purple}44`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:13, fontWeight:700, color:C.purple }}>
              {role[0].toUpperCase()}
            </div>
            <button onClick={() => setPage("settings")} style={{ padding:"7px 14px", borderRadius:8, fontSize:12, fontWeight:500, background:"transparent", color:C.textMuted, border:`1px solid ${C.border}` }}>⚙️ Settings</button>
            <button onClick={() => { localStorage.removeItem("easyintern_token"); localStorage.removeItem("easyintern_user"); setRole(null); setPage("home"); }} style={{ padding:"7px 14px", borderRadius:8, fontSize:12, fontWeight:500, background:"transparent", color:C.textMuted, border:`1px solid ${C.border}` }}>Logout</button>
          </div>
        )}
      </div>
    </nav>
  );
}

/* ─── HOME PAGE ─────────────────────────────────────────────────────────── */
function HomePage({ setPage }) {
  return (
    <div style={{ paddingTop:0, minHeight:"100vh" }}>
      {/* HERO */}
      <section style={{
        minHeight:"auto", display:"flex", alignItems:"center",
        padding:"100px 64px 36px",
        position:"relative", overflow:"hidden",
      }}>
        {/* Background blobs */}
        <div style={{ position:"absolute", top:"20%", left:"10%", width:500, height:500, borderRadius:"50%", background:"radial-gradient(circle, rgba(139,92,246,0.08) 0%, transparent 70%)", pointerEvents:"none" }} />
        <div style={{ position:"absolute", bottom:"10%", right:"5%", width:400, height:400, borderRadius:"50%", background:"radial-gradient(circle, rgba(139,92,246,0.05) 0%, transparent 70%)", pointerEvents:"none" }} />

        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:80, maxWidth:1200, margin:"0 auto", width:"100%", alignItems:"center" }}>
          {/* LEFT */}
          <div>
            <div className="fade-up d1" style={{ display:"inline-flex", alignItems:"center", gap:8, padding:"7px 16px", borderRadius:99, background:"rgba(255,255,255,0.04)", border:`1px solid ${C.border}`, fontSize:13, color:C.textSoft, marginBottom:32 }}>
              <span style={{ fontSize:14 }}>✦</span> Your Internship Journey Starts Here
            </div>

            <h1 className="fade-up d2" style={{ fontFamily:"system-ui, sans-serif", fontSize:"clamp(36px, 5vw, 64px)", fontWeight:800, lineHeight:1.1, letterSpacing:"-1.5px", marginBottom:28 }}>
              SDP-S5 PROJECT<br />
              <span style={{ color:C.text }}>Intern</span><span style={{ color:C.purple }}>ship</span>{" "}
              <span style={{ color:"#3a3a4a" }}>Management</span>
            </h1>

            <p className="fade-up d3" style={{ fontSize:17, color:C.textSoft, lineHeight:1.75, maxWidth:480, marginBottom:44, fontWeight:300 }}>
              Track applications, deadlines, and progress all in one place. Take control of your future with our intelligent tracking system.
            </p>

            <div className="fade-up d4" style={{ display:"flex", gap:14, marginBottom:52 }}>
              <button onClick={() => setPage("signup")} style={{
                display:"inline-flex", alignItems:"center", gap:8,
                padding:"13px 28px", borderRadius:10, fontSize:15, fontWeight:600,
                background:"#fff", color:"#111", transition:"all 0.2s",
              }}
              onMouseEnter={e => e.currentTarget.style.background="#e8e8f0"}
              onMouseLeave={e => e.currentTarget.style.background="#fff"}
              >Get Started Free <span style={{ fontSize:18 }}>→</span></button>
              <button onClick={() => setPage("internships")} style={{
                display:"inline-flex", alignItems:"center", gap:8,
                padding:"13px 28px", borderRadius:10, fontSize:15, fontWeight:500,
                background:"transparent", color:C.text, border:`1px solid ${C.border}`, transition:"all 0.2s",
              }}
              onMouseEnter={e => e.currentTarget.style.borderColor=C.borderLight}
              onMouseLeave={e => e.currentTarget.style.borderColor=C.border}
              >Learn More 🗂</button>
            </div>

            <div className="fade-up d5" style={{ display:"flex", flexDirection:"column", gap:14 }}>
              {[
                "Track Multiple Applications",
                "Smart Deadline Reminders",
                "Real-time Progress Analytics",
              ].map(f => (
                <div key={f} style={{ display:"flex", alignItems:"center", gap:12, color:C.textSoft, fontSize:14 }}>
                  <div style={{ width:20, height:20, borderRadius:99, border:`1.5px solid ${C.border}`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:10, color:C.purple }}>✓</div>
                  {f}
                </div>
              ))}
            </div>
          </div>

          <div style={{
            background:C.card,
            border:`1px solid ${C.border}`,
            borderRadius:20,
            padding:30,
            maxWidth:520,
            marginLeft:"auto",
            width:"100%"
          }}>
            <div style={{ display:"inline-flex", alignItems:"center", gap:8, padding:"6px 12px", borderRadius:99, background:"rgba(255,255,255,0.03)", border:`1px solid ${C.border}`, fontSize:11, letterSpacing:"0.08em", textTransform:"uppercase", color:C.textMuted, marginBottom:14 }}>
              Project Details
            </div>
            <div style={{ fontFamily:"'Manrope',sans-serif", fontWeight:800, fontSize:34, lineHeight:1.1, letterSpacing:"-1px", marginBottom:20, color:C.purpleLight }}>
              Project Information
            </div>
            <div style={{ display:"flex", flexDirection:"column", gap:14, color:C.textSoft, lineHeight:1.6, fontSize:16 }}>
              <div>
                <span style={{ color:C.textMuted, textTransform:"uppercase", letterSpacing:"0.06em", fontSize:11, display:"block", marginBottom:4 }}>Developers</span>
                LANKA NAGAMOHAN id:2400030532, VEERLA LATEESH id:2400030541
              </div>
              <div>
                <span style={{ color:C.textMuted, textTransform:"uppercase", letterSpacing:"0.06em", fontSize:11, display:"block", marginBottom:4 }}>Section</span>
                05
              </div>
              <div>
                <span style={{ color:C.textMuted, textTransform:"uppercase", letterSpacing:"0.06em", fontSize:11, display:"block", marginBottom:4 }}>Project Number</span>
                37
              </div>
              <div>
                <span style={{ color:C.textMuted, textTransform:"uppercase", letterSpacing:"0.06em", fontSize:11, display:"block", marginBottom:4 }}>Technologies Used</span>
                React, Spring Boot, GitHub
              </div>
              <div>
                <span style={{ color:C.textMuted, textTransform:"uppercase", letterSpacing:"0.06em", fontSize:11, display:"block", marginBottom:4 }}>Frontend Link</span>
                <a href="https://github.com/2400030532/SDP-37-FRONTEND.git" target="_blank" rel="noreferrer" style={{ color:C.purpleLight, wordBreak:"break-all" }}>https://github.com/2400030532/SDP-37-FRONTEND.git</a>
              </div>
              <div>
                <span style={{ color:C.textMuted, textTransform:"uppercase", letterSpacing:"0.06em", fontSize:11, display:"block", marginBottom:4 }}>Backend Link</span>
                <a href="https://github.com/2400030532/SDP-37-BACKEND.git" target="_blank" rel="noreferrer" style={{ color:C.purpleLight, wordBreak:"break-all" }}>https://github.com/2400030532/SDP-37-BACKEND.git</a>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* FEATURES */}
      <section style={{ padding:"72px 64px 100px", maxWidth:1200, margin:"24px auto 0" }}>
        <div style={{ textAlign:"center", marginBottom:64 }}>
          <p style={{ fontSize:12, fontWeight:700, letterSpacing:"0.15em", color:C.purple, textTransform:"uppercase", marginBottom:12 }}>PLATFORM FEATURES</p>
          <h2 style={{ fontFamily:"'Manrope',sans-serif", fontSize:42, fontWeight:800, letterSpacing:"-1.5px" }}>Everything you need to<br/>land your dream internship</h2>
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(240px,1fr))", gap:24 }}>
          {[
            { icon:"📋", title:"Task Tracking",       desc:"Track deadlines, assignments, and milestones across all your internships in one unified view.", color:C.purple },
            { icon:"📊", title:"Progress Reports",     desc:"Visual analytics and progress reports to keep you and your mentor aligned at every step.", color:C.blue },
            { icon:"💬", title:"Mentor Feedback",      desc:"Receive structured, actionable feedback from assigned mentors through a clean feedback system.", color:C.green },
            { icon:"📄", title:"Resume Builder",       desc:"Auto-generate a professional resume from your skills, projects and internship experience.", color:C.yellow },
          ].map(f => (
            <div key={f.title} className="hover-lift" style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:16, padding:28, transition:"border-color 0.2s" }}
              onMouseEnter={e => e.currentTarget.style.borderColor=f.color+"55"}
              onMouseLeave={e => e.currentTarget.style.borderColor=C.border}
            >
              <div style={{ fontSize:32, marginBottom:18 }}>{f.icon}</div>
              <div style={{ fontFamily:"'Manrope',sans-serif", fontSize:17, fontWeight:700, color:f.color, marginBottom:10 }}>{f.title}</div>
              <div style={{ fontSize:14, color:C.textMuted, lineHeight:1.7 }}>{f.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section style={{ margin:"0 64px 100px", borderRadius:24, background:`linear-gradient(135deg, #1a1028, #0c0c0f)`, border:`1px solid ${C.border}`, padding:"72px 64px", textAlign:"center", position:"relative", overflow:"hidden" }}>
        <div style={{ position:"absolute", top:"-40%", left:"50%", transform:"translateX(-50%)", width:600, height:400, borderRadius:"50%", background:"radial-gradient(circle, rgba(139,92,246,0.12) 0%, transparent 70%)", pointerEvents:"none" }} />
        <p style={{ fontSize:12, fontWeight:700, letterSpacing:"0.15em", color:C.purple, textTransform:"uppercase", marginBottom:16 }}>GET STARTED TODAY</p>
        <h2 style={{ fontFamily:"'Manrope',sans-serif", fontSize:48, fontWeight:800, letterSpacing:"-2px", marginBottom:20 }}>Ready to find your<br/>perfect internship?</h2>
        <p style={{ fontSize:16, color:C.textSoft, marginBottom:40, maxWidth:480, margin:"0 auto 40px" }}>Join thousands of students who've already landed internships at top companies using Easy Intern.</p>
        <button onClick={() => setPage("signup")} style={{ padding:"14px 36px", borderRadius:10, fontSize:15, fontWeight:600, background:C.purple, color:"#fff", transition:"all 0.2s", animation:"glow 2s ease infinite" }}>Start for Free →</button>
      </section>

      {/* FOOTER */}
      <footer style={{ borderTop:`1px solid ${C.border}`, padding:"40px 64px", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
        <span style={{ fontFamily:"'Manrope',sans-serif", fontWeight:700, color:C.text }}>Easy<span style={{ color:C.purple }}>Intern</span></span>
        <span style={{ fontSize:13, color:C.textMuted }}>FSAD-PS37 · Remote Internship Management & Evaluation Platform</span>
        <span style={{ fontSize:13, color:C.textMuted }}>© 2026</span>
      </footer>
    </div>
  );
}

/* ─── DASHBOARD PREVIEW CARD (hero right side) ──────────────────────────── */
function DashboardPreviewCard() {
  return (
    <div style={{
      background:C.card, border:`1px solid ${C.border}`, borderRadius:20,
      padding:28, boxShadow:"0 40px 80px rgba(0,0,0,0.6)",
      maxWidth:420, marginLeft:"auto",
    }}>
      {/* Header */}
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:24 }}>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <span style={{ fontSize:16 }}>📅</span>
          <span style={{ fontFamily:"'Manrope',sans-serif", fontWeight:700, fontSize:16 }}>Recent Applications</span>
        </div>
        <span style={{ fontSize:12, color:C.textMuted, display:"flex", alignItems:"center", gap:6 }}>
          <span>🕐</span> Last 7 days
        </span>
      </div>

      {/* Apps */}
      <div style={{ display:"flex", flexDirection:"column", gap:0 }}>
        {RECENT_APPS.map((a, i) => (
          <div key={i}>
            <div style={{ padding:"16px 0" }}>
              <div style={{ display:"flex", justifyContent:"space-between", marginBottom:6 }}>
                <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                  <span style={{ fontFamily:"'Manrope',sans-serif", fontWeight:700, fontSize:15 }}>{a.company}</span>
                  {i === 0 && <Badge color={C.green}>New</Badge>}
                </div>
                <span style={{ fontSize:12, color:C.textMuted }}>{a.date}</span>
              </div>
              <div style={{ fontSize:13, color:C.textMuted, marginBottom:10 }}>{a.role}</div>
              <StatusDot status={a.status} />
            </div>
            {i < RECENT_APPS.length - 1 && <Divider />}
          </div>
        ))}
      </div>

      {/* Stats row */}
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:0, borderTop:`1px solid ${C.border}`, marginTop:8, paddingTop:20 }}>
        {[{ n:"12", l:"Applied" }, { n:"5", l:"In Progress" }, { n:"3", l:"Completed" }].map(({ n, l }, i) => (
          <div key={l} style={{ textAlign:"center", borderRight: i<2 ? `1px solid ${C.border}` : "none" }}>
            <div style={{ fontFamily:"'Manrope',sans-serif", fontSize:28, fontWeight:800, color:C.textSoft }}>{n}</div>
            <div style={{ fontSize:12, color:C.textMuted, marginTop:2 }}>{l}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── AUTH PAGES ─────────────────────────────────────────────────────────── */
function AuthPage({ mode, setMode, onLogin }) {
  const [role, setRole] = useState("student");
  const [form, setForm] = useState({ name:"", pen:"", phone:"", email:"", password:"", location:"" });
  const [errors, setErrors] = useState({});
  const [authError, setAuthError] = useState("");
  const isSignup = mode === "signup";
  const visibleRoles = isSignup ? ["student"] : ["student", "employer", "admin"];

  useEffect(() => {
    if (isSignup && role !== "student") {
      setRole("student");
    }
  }, [isSignup, role]);

  const validate = () => {
    setAuthError("");
    const newErrors = {};
    // Email/User ID validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!form.email) {
      newErrors.email = isSignup ? "Email is required" : "User ID or email is required";
    } else if (isSignup && !emailRegex.test(form.email)) {
      newErrors.email = "Please enter a valid email address";
    }
    // Password validation
    if (!form.password) {
      newErrors.password = "Password is required";
    } else {
      const password = form.password;
      if (password.length < 8) {
        newErrors.password = "Password must be at least 8 characters";
      } else if (!/[A-Z]/.test(password)) {
        newErrors.password = "Password must contain at least one uppercase letter";
      } else if (!/[a-z]/.test(password)) {
        newErrors.password = "Password must contain at least one lowercase letter";
      } else if (!/\d/.test(password)) {
        newErrors.password = "Password must contain at least one number";
      } else if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
        newErrors.password = "Password must contain at least one special character";
      }
    }
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) {
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validate()) {
      return;
    }

    try {
      // Build payload based on signup vs login
      const payload = isSignup ? {
        fullName: form.name,
        pen: form.pen,
        phone: form.phone,
        email: form.email.toLowerCase(),
        password: form.password,
        location: form.location,
        role,
      } : {
        loginId: form.email.trim(),
        password: form.password,
        role,
      };

      const endpoint = isSignup ? "/auth/signup" : "/auth/login";
      const response = await API.post(endpoint, payload);
      const userData = response.data;
      setAuthError("");
      onLogin({ id: userData.id, fullName: userData.fullName, email: userData.email, role: userData.role, token: userData.token });
    } catch (error) {
      const status = error?.response?.status;
      const message = error?.response?.data?.message || error?.message || "Authentication failed";
      
      // Display specific error messages
      if (status === 409 || message.includes("already")) {
        setAuthError(`❌ ${message}`);
      } else if (status === 401 || message.includes("Invalid user ID/email or password")) {
        setAuthError("❌ Invalid user ID/email or password.");
      } else if (status === 401 || message.includes("Incorrect password")) {
        setAuthError("❌ Incorrect password.");
      } else if (status === 404 || message.includes("not found")) {
        setAuthError("❌ User not found. Please check your email or sign up.");
      } else if (status === 400) {
        setAuthError(`❌ ${message}`);
      } else {
        setAuthError(`❌ ${message}`);
      }
    }
  };

  return (
    <div style={{ minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", padding:"100px 24px 40px", position:"relative" }}>
      <div style={{ position:"absolute", top:"30%", left:"50%", transform:"translateX(-50%)", width:600, height:400, borderRadius:"50%", background:"radial-gradient(circle, rgba(139,92,246,0.06) 0%, transparent 70%)", pointerEvents:"none" }} />

      <div className="fade-up" style={{ width:"100%", maxWidth:440 }}>
        <div style={{ textAlign:"center", marginBottom:36 }}>
          <h1 style={{ fontFamily:"'Manrope',sans-serif", fontSize:32, fontWeight:800, marginBottom:8 }}>
            {isSignup ? "Create your account" : "Welcome back"}
          </h1>
          <p style={{ color:C.textMuted, fontSize:14 }}>
            {isSignup ? "Start your internship journey today" : "Sign in to continue your journey"}
          </p>
          {isSignup && (
            <p style={{ color:C.textMuted, fontSize:12, marginTop:8 }}>
              Employer accounts are created by admin only.
            </p>
          )}
        </div>

        <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:20, padding:36 }}>
          {/* Role tabs */}
          <div style={{ display:"flex", background:C.surface, borderRadius:10, padding:4, marginBottom:28, gap:4 }}>
            {visibleRoles.map(r => (
              <button key={r} onClick={() => setRole(r)} style={{
                flex:1, padding:"9px 0", borderRadius:8, fontSize:13, fontWeight:600,
                background: role===r ? C.card : "transparent",
                color: role===r ? C.text : C.textMuted,
                border: role===r ? `1px solid ${C.border}` : `1px solid transparent`,
                transition:"all 0.2s", textTransform:"capitalize",
              }}>
                {r==="student"?"👨‍🎓":r==="employer"?"🏢":"⚙️"} {r}
              </button>
            ))}
          </div>

          <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
            {isSignup && (
              <>
                <Field label="Full Name"       id="name"  type="text"     value={form.name}     onChange={v=>setForm({...form,name:v})}     placeholder="Rahul Sharma" />
                <Field label="PEN / Student ID" id="pen"  type="text"     value={form.pen}      onChange={v=>setForm({...form,pen:v})}      placeholder="2021CS001" />
                <Field label="Phone Number"    id="phone" type="tel"      value={form.phone}    onChange={v=>setForm({...form,phone:v})}    placeholder="+91 98765 43210" />
              </>
            )}
            <Field label={isSignup ? "Email" : "User ID or Email"}               id="email"    type="text"    value={form.email}    onChange={v=>setForm({...form,email:v})}    placeholder={isSignup ? "you@example.com" : "e.g. 27 or you@example.com"} error={errors.email} />
            <Field label="Password"            id="password" type="password" value={form.password} onChange={v=>setForm({...form,password:v})} placeholder="••••••••" error={errors.password} />
            {isSignup && (
              <Field label="Location"          id="location" type="text"    value={form.location} onChange={v=>setForm({...form,location:v})} placeholder="Hyderabad, India" />
            )}

            {authError && <div style={{ color: C.red, marginBottom: 12, fontSize: 13, fontWeight: 600 }}>{authError}</div>}
            <button onClick={handleSubmit} style={{
              marginTop:8, padding:"13px", borderRadius:10, fontSize:15, fontWeight:600,
              background:C.purple, color:"#fff", transition:"all 0.2s",
            }}
            onMouseEnter={e=>e.currentTarget.style.background="#7c3aed"}
            onMouseLeave={e=>e.currentTarget.style.background=C.purple}
            >{isSignup?"Create Account →":"Sign In →"}</button>
          </div>

          <p style={{ textAlign:"center", marginTop:20, fontSize:13, color:C.textMuted }}>
            {isSignup ? (
              <>
                Already have an account?{" "}
                <span style={{ color:C.purple, cursor:"pointer", fontWeight:600 }} onClick={() => setMode("login")}>
                  Log in
                </span>
              </>
            ) : role === "admin" ? (
              <span>Admin accounts are login only.</span>
            ) : (
              <>
                Don't have an account?{" "}
                <span style={{ color:C.purple, cursor:"pointer", fontWeight:600 }} onClick={() => setMode("signup")}>
                  Sign up
                </span>
              </>
            )}
          </p>
        </div>
      </div>
    </div>
  );
}

function Field({ label, id, type, value, onChange, placeholder, error }) {
  const [focused, setFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === "password";
  const inputType = isPassword && showPassword ? "text" : type;

  return (
    <div style={{ position: "relative" }}>
      <label style={{ display:"block", fontSize:12, fontWeight:600, color:C.textMuted, marginBottom:6, letterSpacing:"0.04em", textTransform:"uppercase" }}>{label}</label>
      <input
        type={inputType} value={value} placeholder={placeholder}
        onChange={e => onChange(e.target.value)}
        onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
        style={{
          width:"100%", padding:"11px 14px", paddingRight: isPassword ? 40 : 14, borderRadius:9,
          background:C.surface, border:`1px solid ${focused?C.purple:error?C.red:C.border}`,
          color:C.text, fontSize:14,
          boxShadow: focused?`0 0 0 3px ${C.purpleDim}`:error?`0 0 0 3px ${C.red}22`:"none",
          transition:"all 0.2s",
        }}
      />
      {isPassword && (
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          style={{
            position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)",
            background: "none", border: "none", color: C.textMuted, fontSize: 16, cursor: "pointer",
            padding: 0, width: 20, height: 20, display: "flex", alignItems: "center", justifyContent: "center",
          }}
        >
          {showPassword ? "🙈" : "👁️"}
        </button>
      )}
      {error && <div style={{ fontSize:12, color:C.red, marginTop:4 }}>{error}</div>}
    </div>
  );
}

/* ─── INTERNSHIPS PAGE ───────────────────────────────────────────────────── */
function InternshipsPage({ onApply, role }) {
  const [search, setSearch]   = useState("");
  const [filter, setFilter]   = useState("All");
  const [detail, setDetail]   = useState(null);
  const [internships, setInternships] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  const fetchInternships = async () => {
    setLoading(true);
    setLoadError("");
    try {
      const response = await getInternships();
      setInternships(response.data || []);
    } catch {
      setInternships([]);
      setLoadError("Could not load internships. Please make sure backend is running and try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInternships();
  }, []);

  const filtered = internships.filter(i =>
    (filter==="All" || i.location===filter) &&
    ((i.title || "").toLowerCase().includes(search.toLowerCase()) || (i.company || "").toLowerCase().includes(search.toLowerCase()))
  );

  if (detail) return <InternshipDetail item={detail} onBack={() => setDetail(null)} onApply={() => { onApply(detail); setDetail(null); }} role={role} />;

  if (loading) {
    return (
      <div style={{ maxWidth:1200, margin:"0 auto", padding:"100px 48px 60px", textAlign:"center" }}>
        <div style={{ fontSize:18, color:C.textMuted }}>Loading internships...</div>
      </div>
    );
  }

  if (loadError) {
    return (
      <div style={{ maxWidth:1200, margin:"0 auto", padding:"100px 48px 60px", textAlign:"center" }}>
        <div style={{ fontSize:18, color:C.red, marginBottom:14 }}>{loadError}</div>
        <button onClick={fetchInternships} style={{ padding:"10px 16px", borderRadius:8, background:C.purple, color:"#fff", fontWeight:700 }}>
          Retry
        </button>
      </div>
    );
  }

  return (
    <div style={{ maxWidth:1200, margin:"0 auto", padding:"100px 48px 60px" }}>
      {/* Header */}
      <div className="fade-up" style={{ marginBottom:48 }}>
        <p style={{ fontSize:12, fontWeight:700, letterSpacing:"0.15em", color:C.purple, textTransform:"uppercase", marginBottom:10 }}>OPPORTUNITIES</p>
        <h1 style={{ fontFamily:"'Manrope',sans-serif", fontSize:48, fontWeight:800, letterSpacing:"-2px", marginBottom:16 }}>Browse Internships</h1>
        <p style={{ color:C.textMuted, fontSize:16 }}>Discover top internship opportunities at leading companies</p>
      </div>

      {/* Filters */}
      <div className="fade-up d2" style={{ display:"flex", gap:12, marginBottom:40, flexWrap:"wrap", alignItems:"center" }}>
        <div style={{ position:"relative", flex:"1", maxWidth:400 }}>
          <span style={{ position:"absolute", left:14, top:"50%", transform:"translateY(-50%)", color:C.textMuted, fontSize:16 }}>🔍</span>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search internships..."
            style={{ width:"100%", padding:"11px 14px 11px 42px", borderRadius:9, background:C.card, border:`1px solid ${C.border}`, color:C.text, fontSize:14 }}
          />
        </div>
        {["All","Remote","Hybrid"].map(f => (
          <button key={f} onClick={() => setFilter(f)} style={{
            padding:"10px 20px", borderRadius:99, fontSize:13, fontWeight:500,
            background: filter===f ? C.purpleDim : "transparent",
            color:      filter===f ? C.purpleLight : C.textMuted,
            border:     filter===f ? `1px solid ${C.purple}44` : `1px solid ${C.border}`,
            transition:"all 0.2s",
          }}>{f}</button>
        ))}
      </div>

      {/* Grid */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(340px,1fr))", gap:20 }}>
        {filtered.map((item, idx) => (
          <div key={item.id} className={`fade-up hover-lift`} style={{ animationDelay:`${idx*0.07}s`, background:C.card, border:`1px solid ${C.border}`, borderRadius:16, padding:24, cursor:"pointer", transition:"border-color 0.2s" }}
            onMouseEnter={e => e.currentTarget.style.borderColor=item.color+"55"}
            onMouseLeave={e => e.currentTarget.style.borderColor=C.border}
            onClick={() => setDetail(item)}
          >
            {/* Top row */}
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:18 }}>
              <div style={{ display:"flex", alignItems:"center", gap:12 }}>
                <div style={{ width:44, height:44, borderRadius:10, background:item.color+"22", display:"flex", alignItems:"center", justifyContent:"center", fontSize:20, fontWeight:800, color:item.color, fontFamily:"'Manrope',sans-serif" }}>{item.logo}</div>
                <div>
                  <div style={{ fontFamily:"'Manrope',sans-serif", fontWeight:700, fontSize:15 }}>{item.company}</div>
                  <div style={{ fontSize:12, color:C.textMuted }}>{item.posted}</div>
                </div>
              </div>
              <Badge color={item.color}>{item.location}</Badge>
            </div>

            <div style={{ fontWeight:600, fontSize:15, marginBottom:14, lineHeight:1.4 }}>{item.title}</div>

           {/* Skills */}
<div style={{ display:"flex", gap:6, flexWrap:"wrap", marginBottom:18 }}>
  {(Array.isArray(item.skills)
    ? item.skills
    : typeof item.skills === "string"
      ? item.skills.split(",")
      : []
  ).map((s, i) => (
    <Badge key={i} color={C.textMuted}>{String(s).trim()}</Badge>
  ))}
</div>
            {/* Footer */}
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", paddingTop:16, borderTop:`1px solid ${C.border}` }}>
              <span style={{ fontSize:14, fontWeight:700, color:C.green }}>{item.stipend}</span>
              <span style={{ fontSize:12, color:C.textMuted }}>{item.duration} · {item.applicants} applicants</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function InternshipDetail({ item, onBack, onApply, role }) {
  return (
    <div style={{ maxWidth:800, margin:"0 auto", padding:"100px 48px 60px" }}>
      <button onClick={onBack} style={{ display:"inline-flex", alignItems:"center", gap:8, padding:"9px 16px", borderRadius:8, background:"transparent", color:C.textMuted, border:`1px solid ${C.border}`, fontSize:13, marginBottom:32, transition:"all 0.2s" }}>← Back to listings</button>

      <div className="fade-up" style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:20, padding:40 }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:32, flexWrap:"wrap", gap:16 }}>
          <div style={{ display:"flex", alignItems:"center", gap:20 }}>
            <div style={{ width:64, height:64, borderRadius:14, background:item.color+"22", display:"flex", alignItems:"center", justifyContent:"center", fontSize:28, fontWeight:800, color:item.color, fontFamily:"'Manrope',sans-serif" }}>{item.logo}</div>
            <div>
              <h1 style={{ fontFamily:"'Manrope',sans-serif", fontSize:24, fontWeight:800, marginBottom:4 }}>{item.title}</h1>
              <div style={{ fontSize:14, color:C.textMuted }}>{item.company} · {item.location}</div>
            </div>
          </div>
          <div>
            <div style={{ fontSize:22, fontWeight:800, color:C.green, fontFamily:"'Manrope',sans-serif" }}>{item.stipend}</div>
            <div style={{ fontSize:12, color:C.textMuted, textAlign:"right" }}>per month</div>
          </div>
        </div>

        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:16, marginBottom:32 }}>
          {[["Duration",item.duration],["Applicants",item.applicants],["Deadline",item.deadline]].map(([l,v])=>(
            <div key={l} style={{ background:C.surface, borderRadius:12, padding:"16px 20px", border:`1px solid ${C.border}` }}>
              <div style={{ fontSize:12, color:C.textMuted, marginBottom:4 }}>{l}</div>
              <div style={{ fontWeight:700 }}>{v}</div>
            </div>
          ))}
        </div>

        <div style={{ marginBottom:28 }}>
          <div style={{ fontWeight:700, marginBottom:12 }}>Required Skills</div>
          <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
            {(Array.isArray(item.skills) ? item.skills : []).map(s=><Badge key={s} color={C.purple}>{s}</Badge>)}
          </div>
        </div>

        <div style={{ marginBottom:32 }}>
          <div style={{ fontWeight:700, marginBottom:12 }}>About the Role</div>
          <div style={{ fontSize:14, color:C.textMuted, lineHeight:1.8 }}>
            Join {item.company} as a {item.title} and work on real-world projects with experienced engineers and mentors. You'll collaborate with cross-functional teams, gain hands-on experience with cutting-edge technologies, and receive structured mentorship throughout your internship. This role offers a competitive stipend of {item.stipend} and strong potential for a full-time conversion.
          </div>
        </div>

        <button onClick={onApply} style={{ width:"100%", padding:"14px", borderRadius:12, fontSize:15, fontWeight:700, background:C.purple, color:"#fff", transition:"all 0.2s" }}
          onMouseEnter={e=>e.currentTarget.style.background="#7c3aed"}
          onMouseLeave={e=>e.currentTarget.style.background=C.purple}
        >{role ? "Apply Now →" : "Sign in to Apply →"}</button>
      </div>
    </div>
  );
}

/* ─── STUDENT DASHBOARD ─────────────────────────────────────────────────── */
function StudentDashboard({ onToast }) {
  const [applications, setApplications] = useState([]);
  const [active, setActive] = useState(null);
  const [tab, setTab] = useState("overview");
  const [loading, setLoading] = useState(true);

  const loadApplications = async () => {
    try {
      const res = await API.get("/applications/me");
      const items = res.data || [];
      setApplications(items);
      setActive(items[0] || null);
    } catch {
      setApplications([]);
      setActive(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadApplications();
  }, []);

  const completeTask = async (taskId) => {
    await API.put(`/applications/tasks/${taskId}/complete`);
    onToast("Task marked complete");
    await loadApplications();
  };

  const stats = {
    applications: applications.length,
    shortlisted: applications.filter((a) => a.resumeRound === "ALLOWED").length,
    interviews: applications.filter((a) => a.technicalRound === "ALLOWED").length,
    completed: applications.filter((a) => a.hrRound === "ALLOWED").length,
  };

  if (loading) {
    return <div style={{ maxWidth:1200, margin:"0 auto", padding:"100px 48px 60px", color:C.textMuted }}>Loading dashboard...</div>;
  }

  return (
    <div style={{ maxWidth:1200, margin:"0 auto", padding:"100px 48px 60px" }}>
      <div className="fade-up" style={{ marginBottom:40 }}>
        <p style={{ fontSize:12, fontWeight:700, letterSpacing:"0.15em", color:C.purple, textTransform:"uppercase", marginBottom:10 }}>STUDENT PORTAL</p>
        <h1 style={{ fontFamily:"'Manrope',sans-serif", fontSize:40, fontWeight:800, letterSpacing:"-1.5px" }}>My Dashboard</h1>
      </div>

      <div className="fade-up d2" style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:16, marginBottom:40 }}>
        {[
          { label:"Applications", value:String(stats.applications), icon:"📤", color:C.purple },
          { label:"Resume Allowed", value:String(stats.shortlisted), icon:"📄", color:C.yellow },
          { label:"Technical Allowed", value:String(stats.interviews), icon:"💻", color:C.blue },
          { label:"HR Allowed", value:String(stats.completed), icon:"✅", color:C.green },
        ].map((s) => (
          <div key={s.label} style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:14, padding:"20px 24px", display:"flex", alignItems:"center", gap:16 }}>
            <div style={{ width:44, height:44, borderRadius:10, background:s.color+"22", display:"flex", alignItems:"center", justifyContent:"center", fontSize:20 }}>{s.icon}</div>
            <div>
              <div style={{ fontFamily:"'Manrope',sans-serif", fontSize:28, fontWeight:800, color:s.color }}>{s.value}</div>
              <div style={{ fontSize:12, color:C.textMuted }}>{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="fade-up d3" style={{ display:"grid", gridTemplateColumns:"300px 1fr", gap:24 }}>
        <div>
          <div style={{ fontSize:11, fontWeight:700, color:C.textMuted, textTransform:"uppercase", letterSpacing:"0.1em", marginBottom:14 }}>My Applications</div>
          <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
            {applications.map((app) => (
              <div key={app.id} onClick={() => { setActive(app); setTab("overview"); }} style={{ background:C.card, border:`1px solid ${active?.id===app.id ? C.purple : C.border}`, borderRadius:14, padding:"16px 18px", cursor:"pointer", transition:"all 0.2s" }}>
                <div style={{ fontWeight:700, fontSize:14 }}>{app.company}</div>
                <div style={{ fontSize:12, color:C.textMuted, marginBottom:8 }}>{app.internshipTitle}</div>
                <StatusDot status={app.status} />
                <div style={{ marginTop:10 }}>
                  <ProgressBar value={app.progress || 0} color={C.purple} thin />
                </div>
              </div>
            ))}
          </div>
        </div>

        {active && (
          <div>
            <div style={{ display:"flex", gap:6, marginBottom:24 }}>
              {["overview","tasks"].map((t) => (
                <button key={t} onClick={() => setTab(t)} style={{ padding:"8px 18px", borderRadius:99, fontSize:13, fontWeight:500, textTransform:"capitalize", background: tab===t ? C.purpleDim : "transparent", color: tab===t ? C.purpleLight : C.textMuted, border: tab===t ? `1px solid ${C.purple}44` : `1px solid ${C.border}` }}>{t}</button>
              ))}
            </div>

            {tab === "overview" && (
              <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:20, padding:32 }}>
                <div style={{ fontFamily:"'Manrope',sans-serif", fontSize:22, fontWeight:800, marginBottom:4 }}>{active.internshipTitle}</div>
                <div style={{ color:C.textMuted, fontSize:14, marginBottom:20 }}>{active.company}</div>
                <div style={{ marginBottom:20 }}>
                  <div style={{ marginBottom:8, fontSize:13 }}>Resume: <Badge color={active.resumeRound === "ALLOWED" ? C.green : active.resumeRound === "REJECTED" ? C.red : C.yellow}>{active.resumeRound}</Badge></div>
                  <div style={{ marginBottom:8, fontSize:13 }}>Technical: <Badge color={active.technicalRound === "ALLOWED" ? C.green : active.technicalRound === "REJECTED" ? C.red : C.yellow}>{active.technicalRound}</Badge></div>
                  <div style={{ marginBottom:8, fontSize:13 }}>HR: <Badge color={active.hrRound === "ALLOWED" ? C.green : active.hrRound === "REJECTED" ? C.red : C.yellow}>{active.hrRound}</Badge></div>
                </div>
                {active.resumeUrl && <a href={`http://localhost:8080${active.resumeUrl}`} target="_blank" rel="noreferrer" style={{ color:C.purple }}>View Uploaded Resume</a>}
              </div>
            )}

            {tab === "tasks" && (
              <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:20, padding:32 }}>
                <div style={{ fontFamily:"'Manrope',sans-serif", fontSize:18, fontWeight:700, marginBottom:24 }}>Assigned Tasks</div>
                <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
                  {(active.tasks || []).map((task) => (
                    <div key={task.id} style={{ display:"flex", alignItems:"center", gap:12, padding:"14px 16px", border:`1px solid ${C.border}`, borderRadius:12, background:C.surface }}>
                      <div style={{ flex:1 }}>
                        <div style={{ fontSize:14, fontWeight:600, textDecoration:task.completed ? "line-through" : "none" }}>{task.title}</div>
                        <div style={{ fontSize:11, color:C.textMuted }}>Due: {task.dueDate || "Not set"}</div>
                      </div>
                      {!task.completed && <button onClick={() => completeTask(task.id)} style={{ padding:"7px 12px", borderRadius:8, background:C.green, color:"#fff", fontSize:12, fontWeight:700 }}>Complete</button>}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── EMPLOYER / ADMIN PORTAL ────────────────────────────────────────────── */
function EmployerPortal({ roleType = "employer", onToast }) {
  const [tab, setTab] = useState("interns");
  const [showPost, setShowPost] = useState(false);
  const [form, setForm] = useState({ title:"", company:"", stipend:"", duration:"", skills:"", location:"Remote" });
  const [apps, setApps] = useState([]);
  const [selectedApp, setSelectedApp] = useState(null);
  const [rounds, setRounds] = useState({ resumeRound: "PENDING", technicalRound: "PENDING", hrRound: "PENDING" });
  const [taskTitle, setTaskTitle] = useState("");
  const [creatingEmployer, setCreatingEmployer] = useState(false);
  const [employerForm, setEmployerForm] = useState({ fullName:"", phone:"", email:"", password:"", location:"" });
  const [employers, setEmployers] = useState([]);
  const [loadingEmployers, setLoadingEmployers] = useState(false);
  const [savingEmployerId, setSavingEmployerId] = useState(null);
  const [employerEdits, setEmployerEdits] = useState({});

  const tabs = roleType === "admin"
    ? ["interns", "resume", "rounds", "evaluations", "employers"]
    : ["interns", "resume"];

  const loadApps = async () => {
    try {
      const endpoint = roleType === "admin" ? "/admin/applications" : "/employer/applications";
      const res = await API.get(endpoint);
      setApps(res.data || []);
      if (!selectedApp && (res.data || []).length > 0) {
        setSelectedApp(res.data[0]);
      }
    } catch {
      setApps([]);
    }
  };

  const loadEmployers = async () => {
    if (roleType !== "admin") {
      return;
    }
    setLoadingEmployers(true);
    try {
      const res = await API.get("/admin/users/employers");
      const employerList = Array.isArray(res.data) ? res.data : [];
      setEmployers(employerList);
      setEmployerEdits((prev) => {
        const next = { ...prev };
        employerList.forEach((employer) => {
          if (!next[employer.id]) {
            next[employer.id] = {
              fullName: employer.fullName || "",
              phone: employer.phone || "",
              email: employer.email || "",
              location: employer.location || "",
              password: "",
            };
          }
        });
        return next;
      });
    } catch {
      setEmployers([]);
    } finally {
      setLoadingEmployers(false);
    }
  };

  useEffect(() => {
    loadApps();
  }, [roleType]);

  useEffect(() => {
    if (roleType === "admin") {
      loadEmployers();
    }
  }, [roleType]);

  const evaluateResume = async (applicationId, decision) => {
    try {
      await API.put(`/employer/applications/${applicationId}/resume-decision`, { resumeRound: decision });
      onToast(decision === "ALLOWED" ? "Candidate moved to next round" : "Candidate rejected at resume round");
      await loadApps();
    } catch (err) {
      const message = err?.response?.data?.message || "Could not update resume decision";
      onToast(message, C.red);
    }
  };

  const createEmployer = async () => {
    if (!employerForm.fullName || !employerForm.email || !employerForm.password) {
      onToast("Full name, email and password are required", C.yellow);
      return;
    }
    setCreatingEmployer(true);
    try {
      await API.post("/admin/users/employer", employerForm);
      setEmployerForm({ fullName:"", phone:"", email:"", password:"", location:"" });
      onToast("Employer account created by admin");
      await loadEmployers();
    } catch (err) {
      const message = err?.response?.data?.message || "Could not create employer account";
      onToast(message, C.red);
    } finally {
      setCreatingEmployer(false);
    }
  };

  const updateEmployer = async (employerId) => {
    const edit = employerEdits[employerId];
    if (!edit) return;

    setSavingEmployerId(employerId);
    try {
      await API.put(`/admin/users/employers/${employerId}`, edit);
      onToast("Employer credentials updated");
      await loadEmployers();
    } catch (err) {
      const message = err?.response?.data?.message || "Could not update employer";
      onToast(message, C.red);
    } finally {
      setSavingEmployerId(null);
    }
  };

  const deleteEmployer = async (employerId) => {
    const confirmed = window.confirm("Delete this employer account? This will remove the login and employer profile.");
    if (!confirmed) {
      return;
    }

    setSavingEmployerId(employerId);
    try {
      await API.delete(`/admin/users/employers/${employerId}`);
      onToast("Employer deleted");
      await loadEmployers();
    } catch (err) {
      const message = err?.response?.data?.message || "Could not delete employer";
      onToast(message, C.red);
    } finally {
      setSavingEmployerId(null);
    }
  };

  const handlePost = async () => {
    await API.post("/internships", {
      ...form,
      duration: Number(form.duration || 0),
      skills: form.skills.split(",").map((s) => s.trim()).filter(Boolean),
      active: true,
    });
    setShowPost(false);
    onToast("Internship posted successfully");
  };

  const updateRounds = async () => {
    if (!selectedApp) return;
    const res = await API.put(`/admin/applications/${selectedApp.id}/rounds`, rounds);
    setSelectedApp(res.data);
    onToast("Round status updated and email triggered");
    await loadApps();
  };

  const assignTask = async () => {
    if (!selectedApp || !taskTitle.trim()) return;
    await API.post(`/admin/applications/${selectedApp.id}/tasks`, { title: taskTitle });
    setTaskTitle("");
    onToast("Task assigned and email triggered");
    await loadApps();
  };

  return (
    <div style={{ maxWidth:1200, margin:"0 auto", padding:"100px 48px 60px" }}>
      <div className="fade-up" style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:40, flexWrap:"wrap", gap:16 }}>
        <div>
          <p style={{ fontSize:12, fontWeight:700, letterSpacing:"0.15em", color:C.purple, textTransform:"uppercase", marginBottom:10 }}>ADMIN PORTAL</p>
          <h1 style={{ fontFamily:"'Manrope',sans-serif", fontSize:40, fontWeight:800, letterSpacing:"-1.5px" }}>{roleType === "admin" ? "Admin Dashboard" : "Employer Dashboard"}</h1>
        </div>
        <button onClick={() => setShowPost(true)} style={{ padding:"12px 24px", borderRadius:10, fontSize:14, fontWeight:600, background:C.purple, color:"#fff" }}>+ Post Internship</button>
      </div>

      {showPost && (
        <div className="fade-up" style={{ background:C.card, border:`1px solid ${C.purple}55`, borderRadius:20, padding:24, marginBottom:24 }}>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
            {[["title","Title"],["company","Company"],["stipend","Stipend"],["duration","Duration in months"],["skills","Skills comma separated"],["location","Location"]].map(([k,l]) => (
              <input key={k} value={form[k]} onChange={(e) => setForm({ ...form, [k]: e.target.value })} placeholder={l} style={{ width:"100%", padding:"11px 14px", borderRadius:9, background:C.surface, border:`1px solid ${C.border}`, color:C.text, fontSize:14 }} />
            ))}
          </div>
          <div style={{ marginTop:12, display:"flex", gap:8 }}>
            <button onClick={handlePost} style={{ padding:"10px 16px", borderRadius:8, background:C.green, color:"#fff", fontWeight:700 }}>Post</button>
            <button onClick={() => setShowPost(false)} style={{ padding:"10px 16px", borderRadius:8, background:C.surface, color:C.text, border:`1px solid ${C.border}` }}>Cancel</button>
          </div>
        </div>
      )}

      <div style={{ display:"flex", gap:6, marginBottom:24 }}>
        {tabs.map((t) => (
          <button key={t} onClick={() => setTab(t)} style={{ padding:"9px 20px", borderRadius:99, fontSize:13, fontWeight:500, textTransform:"capitalize", background: tab===t ? C.purpleDim : "transparent", color: tab===t ? C.purpleLight : C.textMuted, border: tab===t ? `1px solid ${C.purple}44` : `1px solid ${C.border}` }}>{t}</button>
        ))}
      </div>

      {tab === "interns" && (
        <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:16, padding:18 }}>
          {apps.length === 0 ? <div style={{ color:C.textMuted }}>No applications yet.</div> : apps.map((a) => (
            <div key={a.id} style={{ padding:"10px 0", borderBottom:`1px solid ${C.border}` }}>
              <div style={{ fontWeight:700 }}>{a.company} - {a.internshipTitle}</div>
              <div style={{ fontSize:12, color:C.textMuted }}>Status: {a.status} | Resume: {a.resumeRound} | Technical: {a.technicalRound} | HR: {a.hrRound}</div>
            </div>
          ))}
        </div>
      )}

      {tab === "resume" && (
        <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:16, padding:18 }}>
          {apps.length === 0 ? <div style={{ color:C.textMuted }}>No applications available for resume evaluation.</div> : apps.map((a) => (
            <div key={a.id} style={{ padding:"12px 0", borderBottom:`1px solid ${C.border}` }}>
              <div style={{ fontWeight:700, marginBottom:4 }}>{a.company} - {a.internshipTitle}</div>
              <div style={{ fontSize:12, color:C.textMuted, marginBottom:8 }}>Resume Round: {a.resumeRound} | Status: {a.status}</div>
              <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
                {a.resumeUrl && (
                  <a href={`http://localhost:8080${a.resumeUrl}`} target="_blank" rel="noreferrer" style={{ padding:"7px 12px", borderRadius:8, background:C.surface, color:C.text, border:`1px solid ${C.border}`, fontSize:12 }}>
                    View Resume
                  </a>
                )}
                <button onClick={() => evaluateResume(a.id, "ALLOWED")} style={{ padding:"7px 12px", borderRadius:8, background:C.green, color:"#fff", fontSize:12, fontWeight:700 }}>
                  Allow Next Round
                </button>
                <button onClick={() => evaluateResume(a.id, "REJECTED")} style={{ padding:"7px 12px", borderRadius:8, background:C.red, color:"#fff", fontSize:12, fontWeight:700 }}>
                  Reject Resume
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === "rounds" && roleType === "admin" && (
        <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:16, padding:20 }}>
          <select value={selectedApp?.id || ""} onChange={(e) => { const next = apps.find((a) => String(a.id) === e.target.value); setSelectedApp(next || null); if (next) setRounds({ resumeRound: next.resumeRound, technicalRound: next.technicalRound, hrRound: next.hrRound }); }} style={{ width:"100%", padding:"10px", borderRadius:8, marginBottom:12, background:C.surface, color:C.text, border:`1px solid ${C.border}` }}>
            <option value="">Select application</option>
            {apps.map((a) => <option key={a.id} value={a.id}>{a.company} - {a.internshipTitle}</option>)}
          </select>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:8 }}>
            {["resumeRound", "technicalRound", "hrRound"].map((k) => (
              <select key={k} value={rounds[k]} onChange={(e) => setRounds({ ...rounds, [k]: e.target.value })} style={{ padding:"10px", borderRadius:8, background:C.surface, color:C.text, border:`1px solid ${C.border}` }}>
                {["PENDING","ALLOWED","REJECTED"].map((v) => <option key={v} value={v}>{k} - {v}</option>)}
              </select>
            ))}
          </div>
          <button onClick={updateRounds} style={{ marginTop:12, padding:"10px 16px", borderRadius:8, background:C.purple, color:"#fff", fontWeight:700 }}>Update Rounds</button>
        </div>
      )}

      {tab === "evaluations" && roleType === "admin" && (
        <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:16, padding:20 }}>
          <input value={taskTitle} onChange={(e) => setTaskTitle(e.target.value)} placeholder="Task title" style={{ width:"100%", padding:"10px", borderRadius:8, marginBottom:10, background:C.surface, color:C.text, border:`1px solid ${C.border}` }} />
          <button onClick={assignTask} style={{ padding:"10px 16px", borderRadius:8, background:C.green, color:"#fff", fontWeight:700 }}>Assign Task</button>
        </div>
      )}

      {tab === "employers" && roleType === "admin" && (
        <div style={{ display:"grid", gap:16 }}>
          <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:16, padding:20 }}>
          <div style={{ fontWeight:700, marginBottom:12 }}>Create Employer Account (Admin Only)</div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
            <input value={employerForm.fullName} onChange={(e) => setEmployerForm({ ...employerForm, fullName: e.target.value })} placeholder="Full Name" style={{ width:"100%", padding:"10px", borderRadius:8, background:C.surface, color:C.text, border:`1px solid ${C.border}` }} />
            <input value={employerForm.phone} onChange={(e) => setEmployerForm({ ...employerForm, phone: e.target.value })} placeholder="Phone" style={{ width:"100%", padding:"10px", borderRadius:8, background:C.surface, color:C.text, border:`1px solid ${C.border}` }} />
            <input value={employerForm.email} onChange={(e) => setEmployerForm({ ...employerForm, email: e.target.value })} placeholder="Email" style={{ width:"100%", padding:"10px", borderRadius:8, background:C.surface, color:C.text, border:`1px solid ${C.border}` }} />
            <input type="password" value={employerForm.password} onChange={(e) => setEmployerForm({ ...employerForm, password: e.target.value })} placeholder="Temporary Password" style={{ width:"100%", padding:"10px", borderRadius:8, background:C.surface, color:C.text, border:`1px solid ${C.border}` }} />
            <input value={employerForm.location} onChange={(e) => setEmployerForm({ ...employerForm, location: e.target.value })} placeholder="Location" style={{ width:"100%", padding:"10px", borderRadius:8, background:C.surface, color:C.text, border:`1px solid ${C.border}` }} />
          </div>
          <button disabled={creatingEmployer} onClick={createEmployer} style={{ marginTop:12, padding:"10px 16px", borderRadius:8, background:C.purple, color:"#fff", fontWeight:700 }}>
            {creatingEmployer ? "Creating..." : "Create Employer"}
          </button>
        </div>
          <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:16, padding:20 }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", gap:12, marginBottom:12, flexWrap:"wrap" }}>
              <div style={{ fontWeight:700 }}>Created Employer Logins</div>
              <button onClick={loadEmployers} style={{ padding:"8px 12px", borderRadius:8, background:C.surface, color:C.text, border:`1px solid ${C.border}` }}>
                {loadingEmployers ? "Refreshing..." : "Refresh"}
              </button>
            </div>
            {loadingEmployers && employers.length === 0 ? (
              <div style={{ color:C.textMuted }}>Loading employer accounts...</div>
            ) : employers.length === 0 ? (
              <div style={{ color:C.textMuted }}>No employer accounts created yet.</div>
            ) : (
              <div style={{ display:"grid", gap:12 }}>
                {employers.map((employer) => {
                  const edit = employerEdits[employer.id] || { fullName:"", phone:"", email:"", location:"", password:"" };
                  return (
                    <div key={employer.id} style={{ background:C.surface, border:`1px solid ${C.border}`, borderRadius:14, padding:16 }}>
                      <div style={{ display:"flex", justifyContent:"space-between", gap:12, flexWrap:"wrap", marginBottom:12 }}>
                        <div>
                          <div style={{ fontWeight:700 }}>{employer.fullName || "Employer"}</div>
                          <div style={{ fontSize:12, color:C.textMuted }}>User ID: {employer.userId} · Created: {employer.createdAt || "-"}</div>
                        </div>
                        <Badge color={C.purple}>Employer Login</Badge>
                      </div>
                      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
                        <input value={edit.fullName} onChange={(e) => setEmployerEdits({ ...employerEdits, [employer.id]: { ...edit, fullName: e.target.value } })} placeholder="Full Name" style={{ width:"100%", padding:"10px", borderRadius:8, background:C.card, color:C.text, border:`1px solid ${C.border}` }} />
                        <input value={edit.phone} onChange={(e) => setEmployerEdits({ ...employerEdits, [employer.id]: { ...edit, phone: e.target.value } })} placeholder="Phone" style={{ width:"100%", padding:"10px", borderRadius:8, background:C.card, color:C.text, border:`1px solid ${C.border}` }} />
                        <input value={edit.email} onChange={(e) => setEmployerEdits({ ...employerEdits, [employer.id]: { ...edit, email: e.target.value } })} placeholder="Email / Login Email" style={{ width:"100%", padding:"10px", borderRadius:8, background:C.card, color:C.text, border:`1px solid ${C.border}` }} />
                        <input value={edit.location} onChange={(e) => setEmployerEdits({ ...employerEdits, [employer.id]: { ...edit, location: e.target.value } })} placeholder="Location" style={{ width:"100%", padding:"10px", borderRadius:8, background:C.card, color:C.text, border:`1px solid ${C.border}` }} />
                        <input type="password" value={edit.password} onChange={(e) => setEmployerEdits({ ...employerEdits, [employer.id]: { ...edit, password: e.target.value } })} placeholder="New Temporary Password (optional)" style={{ width:"100%", padding:"10px", borderRadius:8, background:C.card, color:C.text, border:`1px solid ${C.border}` }} />
                      </div>
                      <div style={{ marginTop:12, display:"flex", gap:8, flexWrap:"wrap" }}>
                        <button onClick={() => updateEmployer(employer.id)} disabled={savingEmployerId === employer.id} style={{ padding:"10px 16px", borderRadius:8, background:C.green, color:"#fff", fontWeight:700 }}>
                          {savingEmployerId === employer.id ? "Saving..." : "Save Changes"}
                        </button>
                        <button onClick={() => deleteEmployer(employer.id)} disabled={savingEmployerId === employer.id} style={{ padding:"10px 16px", borderRadius:8, background:C.red, color:"#fff", fontWeight:700 }}>
                          {savingEmployerId === employer.id ? "Deleting..." : "Delete Employer"}
                        </button>
                        <div style={{ fontSize:12, color:C.textMuted, alignSelf:"center" }}>Login email: {employer.email}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function ProfilePage({ onToast }) {
  const [profile, setProfile] = useState(null);
  const [apps, setApps] = useState([]);
  const [selected, setSelected] = useState("");
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const profileResponse = await API.get("/profile/me");
      const nextProfile = profileResponse.data;
      setProfile(nextProfile);

      if ((nextProfile?.role || "").toLowerCase() === "student") {
        try {
          const applicationsResponse = await API.get("/applications/me");
          const applicationList = Array.isArray(applicationsResponse.data) ? applicationsResponse.data : [];
          setApps(applicationList);
          if (applicationList.length > 0) {
            setSelected((prev) => prev || String(applicationList[0].id));
          }
        } catch {
          // Keep profile usable even if the applications endpoint is temporarily unavailable.
          setApps([]);
        }
      } else {
        setApps([]);
        setSelected("");
      }
    } catch (err) {
      const status = err?.response?.status;
      if (status === 401 || status === 403) {
        setError("Please log in again to view your profile.");
      } else {
        setError("Could not load profile details right now. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const uploadResume = async () => {
    if (!file || !selected) {
      onToast("Select an application and a file first", C.yellow);
      return;
    }
    const fd = new FormData();
    fd.append("file", file);
    try {
      await API.post(`/applications/${selected}/resume`, fd, { headers: { "Content-Type": "multipart/form-data" } });
      onToast("Resume uploaded successfully");
      await load();
    } catch (err) {
      const message = err?.response?.data?.message || "Resume upload failed";
      onToast(message, C.red);
    }
  };

  if (loading) return <div style={{ maxWidth:900, margin:"0 auto", padding:"100px 48px 60px", color:C.textMuted }}>Loading profile...</div>;

  if (error) {
    return (
      <div style={{ maxWidth:900, margin:"0 auto", padding:"100px 48px 60px" }}>
        <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:16, padding:20 }}>
          <div style={{ color:C.red, marginBottom:12 }}>{error}</div>
          <button onClick={load} style={{ padding:"10px 16px", borderRadius:8, background:C.purple, color:"#fff", fontWeight:700 }}>
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!profile) {
    return <div style={{ maxWidth:900, margin:"0 auto", padding:"100px 48px 60px", color:C.textMuted }}>No profile data found.</div>;
  }

  return (
    <div style={{ maxWidth:900, margin:"0 auto", padding:"100px 48px 60px" }}>
      <h1 style={{ fontFamily:"'Manrope',sans-serif", fontSize:36, fontWeight:800, marginBottom:16 }}>
        {(profile.role || "").toLowerCase() === "employer" ? "Employer Profile" : (profile.role || "user").toLowerCase() === "admin" ? "Admin Profile" : "My Profile"}
      </h1>
      <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:16, padding:20, marginBottom:20 }}>
        <div style={{ marginBottom:6 }}>Name: {profile.fullName}</div>
        <div style={{ marginBottom:6 }}>Email: {profile.email}</div>
        <div style={{ marginBottom:6 }}>Phone: {profile.phone || "-"}</div>
        <div style={{ marginBottom:6 }}>Location: {profile.location || "-"}</div>
        <div style={{ marginBottom:6 }}>Role: {(profile.role || "-").toUpperCase()}</div>
        {(profile.role || "").toLowerCase() === "student" ? (
          <>
            <div style={{ marginBottom:6 }}>Internships Applied: {profile.internshipsCount}</div>
            <div>Current Resume: {profile.resumeUrl ? <a href={`http://localhost:8080${profile.resumeUrl}`} target="_blank" rel="noreferrer" style={{ color:C.purple }}>View CV</a> : "Not uploaded"}</div>
          </>
        ) : (
          <div style={{ color:C.textMuted }}>Employer accounts do not use the resume upload flow.</div>
        )}
      </div>
      {(profile.role || "").toLowerCase() === "student" && (
        <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:16, padding:20 }}>
          <div style={{ marginBottom:10, fontWeight:700 }}>Upload CV / Resume</div>
          <select value={selected} onChange={(e) => setSelected(e.target.value)} style={{ width:"100%", padding:"10px", borderRadius:8, marginBottom:10, background:C.surface, color:C.text, border:`1px solid ${C.border}` }}>
            <option value="">Select application</option>
            {apps.map((a) => <option key={a.id} value={a.id}>{a.company} - {a.internshipTitle}</option>)}
          </select>
          <input type="file" accept=".pdf,.doc,.docx" onChange={(e) => setFile(e.target.files?.[0] || null)} style={{ marginBottom:10 }} />
          <button onClick={uploadResume} style={{ padding:"10px 16px", borderRadius:8, background:C.purple, color:"#fff", fontWeight:700 }}>Upload</button>
        </div>
      )}
    </div>
  );
}

/* ─── SETTINGS PAGE ───────────────────────────────────────────────────────── */
function SettingsPage({ onToast, setPage, setRole, isDark, setIsDark, user }) {
  const [tab, setTab] = useState("general");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  
  const C = getColors(isDark);

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      onToast("❌ All fields are required", C.red);
      return;
    }

    if (newPassword !== confirmPassword) {
      onToast("❌ New passwords do not match", C.red);
      return;
    }

    if (newPassword.length < 8) {
      onToast("❌ Password must be at least 8 characters", C.red);
      return;
    }

    setLoading(true);
    try {
      await API.post("/auth/change-password", {
        currentPassword,
        newPassword,
        confirmPassword,
      });
      onToast("✓ Password changed successfully", C.green);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error) {
      onToast(`❌ ${error?.response?.data?.message || "Failed to change password"}`, C.red);
    } finally {
      setLoading(false);
    }
  };

  const handleSendLoginNotification = async () => {
    setLoading(true);
    try {
      await API.post("/auth/send-login-notification");
      onToast("✓ Login notification sent to your email", C.green);
    } catch (error) {
      onToast(`❌ ${error?.response?.data?.message || "Failed to send notification"}`, C.red);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    setLoading(true);
    try {
      await API.delete("/auth/delete-account");
      onToast("✓ Account deleted successfully", C.green);
      setTimeout(() => {
        localStorage.removeItem("easyintern_token");
        localStorage.removeItem("easyintern_user");
        setRole(null);
        setPage("home");
      }, 1000);
    } catch (error) {
      onToast(`❌ ${error?.response?.data?.message || "Failed to delete account"}`, C.red);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: "100px 48px 60px" }}>
      <div style={{ marginBottom: 48 }}>
        <h1 style={{ fontFamily: "'Manrope',sans-serif", fontSize: 42, fontWeight: 800, marginBottom: 8 }}>Settings & Account</h1>
        <p style={{ color: C.textMuted, fontSize: 16 }}>Manage your account security and preferences</p>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 16, marginBottom: 32, borderBottom: `1px solid ${C.border}`, paddingBottom: 16 }}>
        {[
          { id: "general", label: "⚙️ General" },
          { id: "security", label: "🔐 Security" },
          { id: "notifications", label: "📧 Notifications" },
          { id: "danger", label: "⚠️ Danger Zone" },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            style={{
              padding: "10px 16px",
              borderRadius: 8,
              fontSize: 14,
              fontWeight: tab === t.id ? 700 : 500,
              background: tab === t.id ? C.purple : "transparent",
              color: tab === t.id ? "#fff" : C.textMuted,
              border: "none",
              cursor: "pointer",
              transition: "all 0.2s",
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* General Tab */}
      {tab === "general" && (
        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, padding: 28 }}>
          <h2 style={{ marginBottom: 20, fontWeight: 700 }}>Account Information</h2>
          <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 16 }}>
            <div>
              <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: C.textMuted, marginBottom: 6 }}>Full Name</label>
              <input type="text" value={user?.fullName || ""} disabled style={{ width: "100%", padding: "10px", borderRadius: 8, background: C.surface, color: C.text, border: `1px solid ${C.border}` }} />
            </div>
            <div>
              <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: C.textMuted, marginBottom: 6 }}>Email</label>
              <input type="email" value={user?.email || ""} disabled style={{ width: "100%", padding: "10px", borderRadius: 8, background: C.surface, color: C.text, border: `1px solid ${C.border}` }} />
            </div>
            <div>
              <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: C.textMuted, marginBottom: 6 }}>Role</label>
              <input type="text" value={(user?.role || "student").toUpperCase()} disabled style={{ width: "100%", padding: "10px", borderRadius: 8, background: C.surface, color: C.text, border: `1px solid ${C.border}` }} />
            </div>
            <div>
              <label style={{ display: "flex", alignItems: "center", gap: 12, cursor: "pointer", padding: "12px 0" }}>
                <input type="checkbox" checked={!isDark} onChange={() => setIsDark(!isDark)} style={{ width: 18, height: 18, cursor: "pointer" }} />
                <span style={{ fontWeight: 600 }}>Light Mode {isDark ? "(Off)" : "(On)"}</span>
              </label>
            </div>
          </div>
        </div>
      )}

      {/* Security Tab */}
      {tab === "security" && (
        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, padding: 28 }}>
          <h2 style={{ marginBottom: 20, fontWeight: 700 }}>Change Password</h2>
          <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 16, maxWidth: 400 }}>
            <div>
              <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: C.textMuted, marginBottom: 6 }}>Current Password</label>
              <input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} placeholder="Enter current password" style={{ width: "100%", padding: "10px", borderRadius: 8, background: C.surface, color: C.text, border: `1px solid ${C.border}` }} />
            </div>
            <div>
              <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: C.textMuted, marginBottom: 6 }}>New Password</label>
              <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="Enter new password" style={{ width: "100%", padding: "10px", borderRadius: 8, background: C.surface, color: C.text, border: `1px solid ${C.border}` }} />
            </div>
            <div>
              <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: C.textMuted, marginBottom: 6 }}>Confirm New Password</label>
              <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Confirm new password" style={{ width: "100%", padding: "10px", borderRadius: 8, background: C.surface, color: C.text, border: `1px solid ${C.border}` }} />
            </div>
            <button onClick={handleChangePassword} disabled={loading} style={{ padding: "12px", borderRadius: 8, background: C.purple, color: "#fff", fontWeight: 600, border: "none", cursor: "pointer", marginTop: 8 }}>
              {loading ? "Updating..." : "Change Password"}
            </button>
          </div>
        </div>
      )}

      {/* Notifications Tab */}
      {tab === "notifications" && (
        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, padding: 28 }}>
          <h2 style={{ marginBottom: 20, fontWeight: 700 }}>Email Notifications</h2>
          <p style={{ color: C.textMuted, marginBottom: 20 }}>Receive a confirmation email for every login to your account</p>
          <button onClick={handleSendLoginNotification} disabled={loading} style={{ padding: "12px 28px", borderRadius: 8, background: C.purple, color: "#fff", fontWeight: 600, border: "none", cursor: "pointer" }}>
            {loading ? "Sending..." : "Send Test Email"}
          </button>
        </div>
      )}

      {/* Danger Zone Tab */}
      {tab === "danger" && (
        <div style={{ background: C.card, border: `1px solid ${C.red}44`, borderRadius: 16, padding: 28 }}>
          <h2 style={{ marginBottom: 20, fontWeight: 700, color: C.red }}>Danger Zone</h2>
          <p style={{ color: C.textMuted, marginBottom: 20 }}>Permanently delete your account and all associated data. This action cannot be undone.</p>
          {!deleteConfirm ? (
            <button onClick={() => setDeleteConfirm(true)} style={{ padding: "12px 28px", borderRadius: 8, background: C.red, color: "#fff", fontWeight: 600, border: "none", cursor: "pointer" }}>
              Delete Account
            </button>
          ) : (
            <div style={{ background: C.surface, border: `1px solid ${C.red}`, borderRadius: 8, padding: 16 }}>
              <p style={{ color: C.text, marginBottom: 16, fontWeight: 600 }}>Are you sure? This cannot be undone.</p>
              <div style={{ display: "flex", gap: 12 }}>
                <button onClick={handleDeleteAccount} disabled={loading} style={{ padding: "10px 20px", borderRadius: 8, background: C.red, color: "#fff", fontWeight: 600, border: "none", cursor: "pointer" }}>
                  {loading ? "Deleting..." : "Yes, Delete Everything"}
                </button>
                <button onClick={() => setDeleteConfirm(false)} style={{ padding: "10px 20px", borderRadius: 8, background: C.border, color: C.text, fontWeight: 600, border: "none", cursor: "pointer" }}>
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ─── ROOT APP ───────────────────────────────────────────────────────────── */
export default function App() {
  const [page,    setPage]    = useState("home");
  const [role,    setRole]    = useState(null);
  const [authMode,setAuthMode]= useState("signup");
  const [toast,   setToast]   = useState(null);
  const [isDark,  setIsDark]  = useState(() => {
    const saved = localStorage.getItem("easyintern_theme");
    return saved ? JSON.parse(saved) : true;
  });
  const [user, setUser] = useState(null);

  const C = getColors(isDark);

  const showToast = (msg, color = C.green) => {
    setToast({ msg, color });
    setTimeout(() => setToast(null), 3500);
  };

  useEffect(() => {
    const savedToken = localStorage.getItem("easyintern_token");
    const savedUser = localStorage.getItem("easyintern_user");
    if (savedToken && savedUser) {
      const parsed = JSON.parse(savedUser);
      setRole(parsed.role);
      setUser(parsed);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("easyintern_theme", JSON.stringify(isDark));
  }, [isDark]);

  const handleLogin = (userData) => {
    const normalizedRole = (userData.role || "student").toLowerCase();
    const normalized = { ...userData, role: normalizedRole };
    setRole(normalizedRole);
    setUser(normalized);
    if (userData.token) {
      localStorage.setItem("easyintern_token", userData.token);
    }
    localStorage.setItem("easyintern_user", JSON.stringify(normalized));

    if (normalizedRole === "student") {
      setPage("student");
    } else if (normalizedRole === "employer") {
      setPage("employer");
    } else {
      setPage("admin");
    }

    showToast(`Welcome! Signed in as ${normalizedRole} ✓`);
  };

  const handleApply = async (item) => {
    if (!role) {
      setAuthMode("signup");
      setPage("login");
      return;
    }
    if (role !== "student") {
      showToast("Only students can apply for internships", C.yellow);
      return;
    }

    const internshipId = Number(item?.id);
    if (!Number.isFinite(internshipId)) {
      showToast("Invalid internship selected. Please refresh and try again.", C.red);
      return;
    }

    try {
      await API.post("/applications/apply", { internshipId });
      showToast(`Applied to ${item.title} at ${item.company}! 🎉`);
      setPage("student");
    } catch (error) {
      const status = error?.response?.status;
      const backendMessage = error?.response?.data?.message || error?.response?.data?.error;
      let message = backendMessage;

      if (!message && status === 400) message = "You may have already applied to this internship.";
      if (!message && (status === 401 || status === 403)) message = "Your session expired. Please log in again.";
      if (!message && status === 404) message = "Selected internship was not found.";
      if (!message) message = "Could not apply right now. Please try again.";

      showToast(message, C.red);
    }
  };

  const goLogin = (p) => { setAuthMode(p); setPage("login"); };

  return (
    <>
      <GlobalStyles isDark={isDark} />
      <div style={{ fontFamily:"'Manrope',sans-serif", background:C.bg, color:C.text, minHeight:"100vh" }}>
        {/* Toast */}
        {toast && (
          <div style={{ position:"fixed", bottom:28, right:28, background:toast.color, color:"#fff", padding:"14px 24px", borderRadius:14, fontWeight:600, zIndex:999, boxShadow:"0 16px 48px rgba(0,0,0,0.5)", animation:"fadeUp 0.3s ease", maxWidth:360 }}>
            {toast.msg}
          </div>
        )}

        <Navbar page={page} setPage={setPage} role={role} setRole={setRole} setPage2={setPage} isDark={isDark} setIsDark={setIsDark} />

        {page==="home"       && <HomePage    setPage={(p)=>{ if(p==="signup"){setAuthMode("signup");setPage("login");}else setPage(p); }} />}
        {page==="internships"&& <InternshipsPage onApply={handleApply} role={role} />}
        {page==="login"      && <AuthPage mode={authMode} setMode={setAuthMode} onLogin={handleLogin} />}
        {page==="signup"     && <AuthPage mode="signup"   setMode={setAuthMode} onLogin={handleLogin} />}
        {page==="student"    && <StudentDashboard onToast={showToast} />}
        {page==="employer"   && <EmployerPortal roleType="employer" onToast={showToast} />}
        {page==="admin"      && <EmployerPortal roleType="admin" onToast={showToast} />}
        {page==="profile"    && <ProfilePage onToast={showToast} />}
        {page==="settings"   && <SettingsPage onToast={showToast} setPage={setPage} setRole={setRole} isDark={isDark} setIsDark={setIsDark} user={user} />}
      </div>
    </>
  );
}

