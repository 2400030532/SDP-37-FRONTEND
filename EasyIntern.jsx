import { useState, useEffect, useRef } from "react";

/* ─── GLOBAL STYLES ─────────────────────────────────────────────────────── */
const GlobalStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500;600&display=swap');

    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    html { scroll-behavior: smooth; }
    body {
      font-family: 'DM Sans', sans-serif;
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
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api/v1";

const C = {
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
function Navbar({ page, setPage, role, setRole, setPage2 }) {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    fetch(`${API_BASE_URL}/internships`)
      .then(res => res.json())
      .then(data => setInternships(data));
  }, []);
  return (
    <nav style={{
      position: "fixed", top: 0, left: 0, right: 0, zIndex: 200,
      height: 64,
      background: scrolled ? "rgba(12,12,15,0.92)" : "transparent",
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
          fontFamily:"'Syne', sans-serif",
        }}>E</div>
        <span style={{ fontFamily:"'Syne', sans-serif", fontWeight:700, fontSize:18, color:C.text }}>Easy<span style={{ color:C.purple }}>Intern</span></span>
      </div>

      {/* Nav links */}
      <div style={{ display:"flex", alignItems:"center", gap:4 }}>
        {[
          { id:"home",        label:"Home" },
          { id:"internships", label:"Browse" },
          ...(role === "student"  ? [{ id:"student",    label:"Dashboard" }] : []),
          ...(role === "employer" ? [{ id:"employer",   label:"Portal" }] : []),
          ...(role === "admin"    ? [{ id:"admin",      label:"Admin" }] : []),
        ].map(({ id, label }) => (
          <button key={id} onClick={() => setPage(id)} style={{
            padding:"7px 16px", borderRadius:8, fontSize:13, fontWeight:500,
            background: page === id ? C.purpleDim : "transparent",
            color: page === id ? C.purpleLight : C.textSoft,
            border: page === id ? `1px solid ${C.purple}44` : "1px solid transparent",
            transition: "all 0.2s",
          }}
          onMouseEnter={e => { if(page!==id){ e.target.style.color=C.text; e.target.style.background="rgba(255,255,255,0.04)"; }}}
          onMouseLeave={e => { if(page!==id){ e.target.style.color=C.textSoft; e.target.style.background="transparent"; }}}
          >{label}</button>
        ))}
      </div>

      {/* Right side */}
      <div style={{ display:"flex", alignItems:"center", gap:10 }}>
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
            <button onClick={() => { setRole(null); setPage("home"); }} style={{ padding:"7px 14px", borderRadius:8, fontSize:12, fontWeight:500, background:"transparent", color:C.textMuted, border:`1px solid ${C.border}` }}>Logout</button>
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
        minHeight:"100vh", display:"flex", alignItems:"center",
        padding:"100px 64px 60px",
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

            {/* <h1 className="fade-up d2" style={{ fontFamily:"ui-sans-serif", fontSize:"clamp(42px,5vw,72px)", fontWeight:800, lineHeight:1.05, letterSpacing:"-2px", marginBottom:28 }}>
              Transform Your<br />
              <span style={{ color:C.text }}>Intern</span><span style={{ color:C.purple }}>ship</span>{" "}
              <span style={{ color:"#3a3a4a" }}>Hunt</span>
            </h1> */}
            <h1 className="fade-up d2"style={{fontFamily: "system-ui, sans-serif", fontSize: "clamp(36px, 5vw, 64px)", fontWeight: 800, lineHeight: 1.1, letterSpacing: "-1.5px", marginBottom: 28}}>
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

          {/* RIGHT — dashboard card */}
          <div className="slide-r d2" style={{ animation:"float 5s ease-in-out infinite" }}>
            <DashboardPreviewCard />
          </div>
        </div>
      </section>

      {/* STATS BAR */}
      <section style={{ borderTop:`1px solid ${C.border}`, borderBottom:`1px solid ${C.border}`, padding:"36px 64px", background:C.surface }}>
        <div style={{ maxWidth:1200, margin:"0 auto", display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:40 }}>
          {[
            { n:"500+", l:"Active Internships" },
            { n:"120+", l:"Partner Companies" },
            { n:"3.2K+", l:"Students Placed" },
            { n:"₹22K", l:"Average Stipend" },
          ].map(({ n, l }) => (
            <div key={l} style={{ textAlign:"center" }}>
              <div style={{ fontFamily:"'Syne',sans-serif", fontSize:36, fontWeight:800, color:C.text, letterSpacing:"-1px" }}>{n}</div>
              <div style={{ fontSize:13, color:C.textMuted, marginTop:4 }}>{l}</div>
            </div>
          ))}
        </div>
      </section>

      {/* FEATURES */}
      <section style={{ padding:"100px 64px", maxWidth:1200, margin:"0 auto" }}>
        <div style={{ textAlign:"center", marginBottom:64 }}>
          <p style={{ fontSize:12, fontWeight:700, letterSpacing:"0.15em", color:C.purple, textTransform:"uppercase", marginBottom:12 }}>PLATFORM FEATURES</p>
          <h2 style={{ fontFamily:"'Syne',sans-serif", fontSize:42, fontWeight:800, letterSpacing:"-1.5px" }}>Everything you need to<br/>land your dream internship</h2>
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
              <div style={{ fontFamily:"'Syne',sans-serif", fontSize:17, fontWeight:700, color:f.color, marginBottom:10 }}>{f.title}</div>
              <div style={{ fontSize:14, color:C.textMuted, lineHeight:1.7 }}>{f.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section style={{ margin:"0 64px 100px", borderRadius:24, background:`linear-gradient(135deg, #1a1028, #0c0c0f)`, border:`1px solid ${C.border}`, padding:"72px 64px", textAlign:"center", position:"relative", overflow:"hidden" }}>
        <div style={{ position:"absolute", top:"-40%", left:"50%", transform:"translateX(-50%)", width:600, height:400, borderRadius:"50%", background:"radial-gradient(circle, rgba(139,92,246,0.12) 0%, transparent 70%)", pointerEvents:"none" }} />
        <p style={{ fontSize:12, fontWeight:700, letterSpacing:"0.15em", color:C.purple, textTransform:"uppercase", marginBottom:16 }}>GET STARTED TODAY</p>
        <h2 style={{ fontFamily:"'Syne',sans-serif", fontSize:48, fontWeight:800, letterSpacing:"-2px", marginBottom:20 }}>Ready to find your<br/>perfect internship?</h2>
        <p style={{ fontSize:16, color:C.textSoft, marginBottom:40, maxWidth:480, margin:"0 auto 40px" }}>Join thousands of students who've already landed internships at top companies using Easy Intern.</p>
        <button onClick={() => setPage("signup")} style={{ padding:"14px 36px", borderRadius:10, fontSize:15, fontWeight:600, background:C.purple, color:"#fff", transition:"all 0.2s", animation:"glow 2s ease infinite" }}>Start for Free →</button>
      </section>

      {/* FOOTER */}
      <footer style={{ borderTop:`1px solid ${C.border}`, padding:"40px 64px", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
        <span style={{ fontFamily:"'Syne',sans-serif", fontWeight:700, color:C.text }}>Easy<span style={{ color:C.purple }}>Intern</span></span>
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
          <span style={{ fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:16 }}>Recent Applications</span>
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
                  <span style={{ fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:15 }}>{a.company}</span>
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
            <div style={{ fontFamily:"'Syne',sans-serif", fontSize:28, fontWeight:800, color:C.textSoft }}>{n}</div>
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
  const isSignup = mode === "signup";

  return (
    <div style={{ minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", padding:"100px 24px 40px", position:"relative" }}>
      <div style={{ position:"absolute", top:"30%", left:"50%", transform:"translateX(-50%)", width:600, height:400, borderRadius:"50%", background:"radial-gradient(circle, rgba(139,92,246,0.06) 0%, transparent 70%)", pointerEvents:"none" }} />

      <div className="fade-up" style={{ width:"100%", maxWidth:440 }}>
        <div style={{ textAlign:"center", marginBottom:36 }}>
          <h1 style={{ fontFamily:"'Syne',sans-serif", fontSize:32, fontWeight:800, marginBottom:8 }}>
            {isSignup ? "Create your account" : "Welcome back"}
          </h1>
          <p style={{ color:C.textMuted, fontSize:14 }}>
            {isSignup ? "Start your internship journey today" : "Sign in to continue your journey"}
          </p>
        </div>

        <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:20, padding:36 }}>
          {/* Role tabs */}
          <div style={{ display:"flex", background:C.surface, borderRadius:10, padding:4, marginBottom:28, gap:4 }}>
            {["student","employer","admin"].map(r => (
              <button key={r} onClick={() => setRole(r)} style={{
                flex:1, padding:"9px 0", borderRadius:8, fontSize:13, fontWeight:600,
                background: role===r ? C.card : "transparent",
                color: role===r ? C.text : C.textMuted,
                border: role===r ? `1px solid ${C.border}` : "1px solid transparent",
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
            <Field label="Email"               id="email"    type="email"    value={form.email}    onChange={v=>setForm({...form,email:v})}    placeholder="you@example.com" />
            <Field label="Password"            id="password" type="password" value={form.password} onChange={v=>setForm({...form,password:v})} placeholder="••••••••" />
            {isSignup && (
              <Field label="Location"          id="location" type="text"    value={form.location} onChange={v=>setForm({...form,location:v})} placeholder="Hyderabad, India" />
            )}

            <button onClick={() => onLogin(role)} style={{
              marginTop:8, padding:"13px", borderRadius:10, fontSize:15, fontWeight:600,
              background:C.purple, color:"#fff", transition:"all 0.2s",
            }}
            onMouseEnter={e=>e.currentTarget.style.background="#7c3aed"}
            onMouseLeave={e=>e.currentTarget.style.background=C.purple}
            >{isSignup?"Create Account →":"Sign In →"}</button>
          </div>

          <p style={{ textAlign:"center", marginTop:20, fontSize:13, color:C.textMuted }}>
            {isSignup?"Already have an account?":"Don't have an account?"}{" "}
            <span style={{ color:C.purple, cursor:"pointer", fontWeight:600 }} onClick={() => setMode(isSignup?"login":"signup")}>
              {isSignup?"Log in":"Sign up"}
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}

function Field({ label, id, type, value, onChange, placeholder }) {
  const [focused, setFocused] = useState(false);
  return (
    <div>
      <label style={{ display:"block", fontSize:12, fontWeight:600, color:C.textMuted, marginBottom:6, letterSpacing:"0.04em", textTransform:"uppercase" }}>{label}</label>
      <input
        type={type} value={value} placeholder={placeholder}
        onChange={e => onChange(e.target.value)}
        onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
        style={{
          width:"100%", padding:"11px 14px", borderRadius:9,
          background:C.surface, border:`1px solid ${focused?C.purple:C.border}`,
          color:C.text, fontSize:14,
          boxShadow: focused?`0 0 0 3px ${C.purpleDim}`:"none",
          transition:"all 0.2s",
        }}
      />
    </div>
  );
}

/* ─── INTERNSHIPS PAGE ───────────────────────────────────────────────────── */
function InternshipsPage({ onApply, role }) {
  const [search, setSearch]   = useState("");
  const [filter, setFilter]   = useState("All");
  const [detail, setDetail]   = useState(null);

  const filtered = INTERNSHIPS.filter(i =>
    (filter==="All" || i.location===filter) &&
    (i.title.toLowerCase().includes(search.toLowerCase()) || i.company.toLowerCase().includes(search.toLowerCase()))
  );

  if (detail) return <InternshipDetail item={detail} onBack={() => setDetail(null)} onApply={() => { onApply(detail); setDetail(null); }} role={role} />;

  return (
    <div style={{ maxWidth:1200, margin:"0 auto", padding:"100px 48px 60px" }}>
      {/* Header */}
      <div className="fade-up" style={{ marginBottom:48 }}>
        <p style={{ fontSize:12, fontWeight:700, letterSpacing:"0.15em", color:C.purple, textTransform:"uppercase", marginBottom:10 }}>OPPORTUNITIES</p>
        <h1 style={{ fontFamily:"'Syne',sans-serif", fontSize:48, fontWeight:800, letterSpacing:"-2px", marginBottom:16 }}>Browse Internships</h1>
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
                <div style={{ width:44, height:44, borderRadius:10, background:item.color+"22", display:"flex", alignItems:"center", justifyContent:"center", fontSize:20, fontWeight:800, color:item.color, fontFamily:"'Syne',sans-serif" }}>{item.logo}</div>
                <div>
                  <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:15 }}>{item.company}</div>
                  <div style={{ fontSize:12, color:C.textMuted }}>{item.posted}</div>
                </div>
              </div>
              <Badge color={item.color}>{item.location}</Badge>
            </div>

            <div style={{ fontWeight:600, fontSize:15, marginBottom:14, lineHeight:1.4 }}>{item.title}</div>

            {/* Skills */}
            <div style={{ display:"flex", gap:6, flexWrap:"wrap", marginBottom:18 }}>
              {item.skills.map(s => <Badge key={s} color={C.textMuted}>{s}</Badge>)}
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
            <div style={{ width:64, height:64, borderRadius:14, background:item.color+"22", display:"flex", alignItems:"center", justifyContent:"center", fontSize:28, fontWeight:800, color:item.color, fontFamily:"'Syne',sans-serif" }}>{item.logo}</div>
            <div>
              <h1 style={{ fontFamily:"'Syne',sans-serif", fontSize:24, fontWeight:800, marginBottom:4 }}>{item.title}</h1>
              <div style={{ fontSize:14, color:C.textMuted }}>{item.company} · {item.location}</div>
            </div>
          </div>
          <div>
            <div style={{ fontSize:22, fontWeight:800, color:C.green, fontFamily:"'Syne',sans-serif" }}>{item.stipend}</div>
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
            {item.skills.map(s=><Badge key={s} color={C.purple}>{s}</Badge>)}
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
function StudentDashboard() {
  const [active, setActive] = useState(MY_APPS[0]);
  const [tab,    setTab]    = useState("overview");

  return (
    <div style={{ maxWidth:1200, margin:"0 auto", padding:"100px 48px 60px" }}>
      <div className="fade-up" style={{ marginBottom:40 }}>
        <p style={{ fontSize:12, fontWeight:700, letterSpacing:"0.15em", color:C.purple, textTransform:"uppercase", marginBottom:10 }}>STUDENT PORTAL</p>
        <h1 style={{ fontFamily:"'Syne',sans-serif", fontSize:40, fontWeight:800, letterSpacing:"-1.5px" }}>My Dashboard</h1>
      </div>

      {/* Stats */}
      <div className="fade-up d2" style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:16, marginBottom:40 }}>
        {[
          { label:"Applications", value:"3",    icon:"📤", color:C.purple },
          { label:"Shortlisted",  value:"1",    icon:"⭐", color:C.yellow },
          { label:"Interviews",   value:"1",    icon:"🎯", color:C.blue },
          { label:"Completed",    value:"1",    icon:"✅", color:C.green },
        ].map(s=>(
          <div key={s.label} style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:14, padding:"20px 24px", display:"flex", alignItems:"center", gap:16 }}>
            <div style={{ width:44, height:44, borderRadius:10, background:s.color+"22", display:"flex", alignItems:"center", justifyContent:"center", fontSize:20 }}>{s.icon}</div>
            <div>
              <div style={{ fontFamily:"'Syne',sans-serif", fontSize:28, fontWeight:800, color:s.color }}>{s.value}</div>
              <div style={{ fontSize:12, color:C.textMuted }}>{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Body */}
      <div className="fade-up d3" style={{ display:"grid", gridTemplateColumns:"300px 1fr", gap:24 }}>
        {/* Sidebar */}
        <div>
          <div style={{ fontSize:11, fontWeight:700, color:C.textMuted, textTransform:"uppercase", letterSpacing:"0.1em", marginBottom:14 }}>My Applications</div>
          <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
            {MY_APPS.map(app=>(
              <div key={app.id} onClick={() => { setActive(app); setTab("overview"); }} style={{
                background:C.card, border:`1px solid ${active?.id===app.id ? C.purple : C.border}`,
                borderRadius:14, padding:"16px 18px", cursor:"pointer", transition:"all 0.2s",
              }}>
                <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:12 }}>
                  <div style={{ width:34, height:34, borderRadius:8, background:app.color+"22", display:"flex", alignItems:"center", justifyContent:"center", fontWeight:800, color:app.color, fontSize:14, fontFamily:"'Syne',sans-serif" }}>{app.company[0]}</div>
                  <div>
                    <div style={{ fontWeight:700, fontSize:14 }}>{app.company}</div>
                    <div style={{ fontSize:11, color:C.textMuted }}>{app.role.split(" ").slice(0,2).join(" ")}…</div>
                  </div>
                </div>
                <StatusDot status={app.status} />
                <div style={{ marginTop:10 }}>
                  <ProgressBar value={app.progress} color={app.color} thin />
                  <div style={{ fontSize:11, color:C.textMuted, marginTop:4 }}>{app.progress}%</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Detail */}
        {active && (
          <div>
            <div style={{ display:"flex", gap:6, marginBottom:24 }}>
              {["overview","tasks","feedback"].map(t=>(
                <button key={t} onClick={()=>setTab(t)} style={{
                  padding:"8px 18px", borderRadius:99, fontSize:13, fontWeight:500, textTransform:"capitalize",
                  background: tab===t ? C.purpleDim : "transparent",
                  color:      tab===t ? C.purpleLight : C.textMuted,
                  border:     tab===t ? `1px solid ${C.purple}44` : `1px solid ${C.border}`,
                  transition:"all 0.2s",
                }}>{t}</button>
              ))}
            </div>

            {tab==="overview" && (
              <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:20, padding:32 }}>
                <div style={{ fontFamily:"'Syne',sans-serif", fontSize:22, fontWeight:800, marginBottom:4 }}>{active.role}</div>
                <div style={{ color:C.textMuted, fontSize:14, marginBottom:28 }}>{active.company} · Applied {active.applied}</div>
                <div style={{ marginBottom:28 }}>
                  <div style={{ display:"flex", justifyContent:"space-between", marginBottom:10 }}>
                    <span style={{ fontSize:14, fontWeight:600 }}>Overall Progress</span>
                    <span style={{ fontSize:14, fontWeight:700, color:active.color }}>{active.progress}%</span>
                  </div>
                  <ProgressBar value={active.progress} color={active.color} />
                </div>
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:16 }}>
                  {[
                    ["Status", <StatusDot status={active.status} />],
                    ["Tasks",  `${active.tasks.filter(t=>t.done).length}/${active.tasks.length} done`],
                    ["Feedback", `${active.feedback.length} message${active.feedback.length!==1?"s":""}`],
                  ].map(([l,v])=>(
                    <div key={l} style={{ background:C.surface, border:`1px solid ${C.border}`, borderRadius:12, padding:"14px 18px" }}>
                      <div style={{ fontSize:11, color:C.textMuted, marginBottom:6, textTransform:"uppercase", letterSpacing:"0.05em" }}>{l}</div>
                      <div style={{ fontWeight:600, fontSize:14 }}>{v}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {tab==="tasks" && (
              <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:20, padding:32 }}>
                <div style={{ fontFamily:"'Syne',sans-serif", fontSize:18, fontWeight:700, marginBottom:24 }}>Task Tracker</div>
                <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
                  {active.tasks.map(task=>(
                    <div key={task.id} style={{ display:"flex", alignItems:"center", gap:14, padding:"16px 20px", background:C.surface, borderRadius:12, border:`1px solid ${task.done?C.green+"33":C.border}` }}>
                      <div style={{ width:26, height:26, borderRadius:7, background:task.done?C.green+"22":C.surface, border:`1.5px solid ${task.done?C.green:C.borderLight}`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:13, color:task.done?C.green:C.textMuted, flexShrink:0 }}>{task.done?"✓":"○"}</div>
                      <div style={{ flex:1 }}>
                        <div style={{ fontSize:14, fontWeight:600, textDecoration:task.done?"line-through":"none", color:task.done?C.textMuted:C.text }}>{task.title}</div>
                        <div style={{ fontSize:12, color:C.textMuted, marginTop:2 }}>Due: {task.due}</div>
                      </div>
                      <Badge color={task.done?C.green:C.yellow}>{task.done?"Done":"Pending"}</Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {tab==="feedback" && (
              <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:20, padding:32 }}>
                <div style={{ fontFamily:"'Syne',sans-serif", fontSize:18, fontWeight:700, marginBottom:24 }}>Mentor Feedback</div>
                {active.feedback.length===0 ? (
                  <div style={{ textAlign:"center", padding:"60px 0", color:C.textMuted }}>
                    <div style={{ fontSize:40, marginBottom:12 }}>💬</div>
                    No feedback yet. Keep up the great work!
                  </div>
                ) : active.feedback.map((f,i)=>(
                  <div key={i} style={{ padding:"20px 24px", background:C.surface, borderRadius:14, borderLeft:`3px solid ${C.purple}`, marginBottom:14 }}>
                    <div style={{ display:"flex", justifyContent:"space-between", marginBottom:10 }}>
                      <span style={{ fontWeight:700, color:C.purple }}>{f.from}</span>
                      <span style={{ fontSize:12, color:C.textMuted }}>{f.date}</span>
                    </div>
                    <div style={{ fontSize:14, color:C.textSoft, lineHeight:1.7 }}>{f.msg}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── EMPLOYER / ADMIN PORTAL ────────────────────────────────────────────── */
function EmployerPortal() {
  const [tab,     setTab]     = useState("interns");
  const [showPost,setShowPost]= useState(false);
  const [form,    setForm]    = useState({ title:"",company:"",stipend:"",duration:"",skills:"",location:"Remote" });
  const [posted,  setPosted]  = useState(false);

  const handlePost = () => { setPosted(true); setShowPost(false); setTimeout(()=>setPosted(false),3000); };

  return (
    <div style={{ maxWidth:1200, margin:"0 auto", padding:"100px 48px 60px" }}>
      <div className="fade-up" style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:40, flexWrap:"wrap", gap:16 }}>
        <div>
          <p style={{ fontSize:12, fontWeight:700, letterSpacing:"0.15em", color:C.purple, textTransform:"uppercase", marginBottom:10 }}>ADMIN PORTAL</p>
          <h1 style={{ fontFamily:"'Syne',sans-serif", fontSize:40, fontWeight:800, letterSpacing:"-1.5px" }}>Employer Dashboard</h1>
        </div>
        <button onClick={()=>setShowPost(true)} style={{ padding:"12px 24px", borderRadius:10, fontSize:14, fontWeight:600, background:C.purple, color:"#fff", display:"inline-flex", alignItems:"center", gap:8 }}>+ Post Internship</button>
      </div>

      {/* Toast */}
      {posted && (
        <div style={{ background:C.green, color:"#fff", padding:"14px 24px", borderRadius:12, fontWeight:600, marginBottom:24, animation:"fadeUp 0.3s ease" }}>
          ✓ Internship posted successfully!
        </div>
      )}

      {/* Post form */}
      {showPost && (
        <div className="fade-up" style={{ background:C.card, border:`1px solid ${C.purple}55`, borderRadius:20, padding:36, marginBottom:32 }}>
          <div style={{ fontFamily:"'Syne',sans-serif", fontSize:20, fontWeight:700, marginBottom:24 }}>Post New Internship</div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:20, marginBottom:24 }}>
            {[["title","Job Title","e.g. Frontend Intern"],["company","Company","e.g. TechCorp"],["stipend","Stipend","e.g. ₹25,000/mo"],["duration","Duration","e.g. 3 months"],["skills","Skills (comma separated)","React, TypeScript"],["location","Location","Remote / Hybrid"]].map(([k,l,p])=>(
              <div key={k}>
                <label style={{ display:"block", fontSize:12, fontWeight:600, color:C.textMuted, marginBottom:6, letterSpacing:"0.04em", textTransform:"uppercase" }}>{l}</label>
                <input value={form[k]} onChange={e=>setForm({...form,[k]:e.target.value})} placeholder={p}
                  style={{ width:"100%", padding:"11px 14px", borderRadius:9, background:C.surface, border:`1px solid ${C.border}`, color:C.text, fontSize:14 }}
                />
              </div>
            ))}
          </div>
          <div style={{ display:"flex", gap:12 }}>
            <button onClick={handlePost} style={{ padding:"12px 28px", borderRadius:10, fontSize:14, fontWeight:600, background:C.purple, color:"#fff" }}>Post Internship</button>
            <button onClick={()=>setShowPost(false)} style={{ padding:"12px 28px", borderRadius:10, fontSize:14, fontWeight:500, background:"transparent", color:C.textMuted, border:`1px solid ${C.border}` }}>Cancel</button>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="fade-up d2" style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:16, marginBottom:40 }}>
        {[
          { label:"Active Interns",       value:"4",   icon:"👥", color:C.purple },
          { label:"Internships Posted",   value:"6",   icon:"📋", color:C.blue },
          { label:"Avg. Progress",        value:"54%", icon:"📈", color:C.green },
          { label:"Evaluations Pending",  value:"3",   icon:"📝", color:C.yellow },
        ].map(s=>(
          <div key={s.label} style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:14, padding:"20px 24px", display:"flex", alignItems:"center", gap:16 }}>
            <div style={{ width:44, height:44, borderRadius:10, background:s.color+"22", display:"flex", alignItems:"center", justifyContent:"center", fontSize:20 }}>{s.icon}</div>
            <div>
              <div style={{ fontFamily:"'Syne',sans-serif", fontSize:26, fontWeight:800, color:s.color }}>{s.value}</div>
              <div style={{ fontSize:12, color:C.textMuted }}>{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div style={{ display:"flex", gap:6, marginBottom:24 }}>
        {["interns","evaluations"].map(t=>(
          <button key={t} onClick={()=>setTab(t)} style={{
            padding:"9px 20px", borderRadius:99, fontSize:13, fontWeight:500, textTransform:"capitalize",
            background: tab===t ? C.purpleDim : "transparent",
            color:      tab===t ? C.purpleLight : C.textMuted,
            border:     tab===t ? `1px solid ${C.purple}44` : `1px solid ${C.border}`,
            transition:"all 0.2s",
          }}>{t}</button>
        ))}
      </div>

      {tab==="interns" && (
        <div className="fade-in" style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:20, overflow:"hidden" }}>
          <table style={{ width:"100%", borderCollapse:"collapse" }}>
            <thead>
              <tr style={{ background:C.surface }}>
                {["Intern","Role","Mentor","Progress","Status","Action"].map(h=>(
                  <th key={h} style={{ padding:"14px 20px", textAlign:"left", fontSize:11, fontWeight:700, color:C.textMuted, textTransform:"uppercase", letterSpacing:"0.08em" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {ADMIN_INTERNS.map((intern,i)=>(
                <tr key={intern.id} style={{ borderTop:`1px solid ${C.border}`, transition:"background 0.15s" }}
                  onMouseEnter={e=>e.currentTarget.style.background=C.cardHover}
                  onMouseLeave={e=>e.currentTarget.style.background="transparent"}
                >
                  <td style={{ padding:"18px 20px" }}>
                    <div style={{ display:"flex", alignItems:"center", gap:12 }}>
                      <div style={{ width:36, height:36, borderRadius:9, background:C.purpleDim, display:"flex", alignItems:"center", justifyContent:"center", fontWeight:700, fontSize:13, color:C.purple, fontFamily:"'Syne',sans-serif" }}>{intern.avatar}</div>
                      <div style={{ fontWeight:600, fontSize:14 }}>{intern.name}</div>
                    </div>
                  </td>
                  <td style={{ padding:"18px 20px", fontSize:13, color:C.textMuted }}>{intern.role}</td>
                  <td style={{ padding:"18px 20px", fontSize:13, color:C.textMuted }}>{intern.mentor}</td>
                  <td style={{ padding:"18px 20px", minWidth:140 }}>
                    <ProgressBar value={intern.progress} color={intern.progress>70?C.green:intern.progress>40?C.yellow:C.red} thin />
                    <div style={{ fontSize:11, color:C.textMuted, marginTop:4 }}>{intern.progress}%</div>
                  </td>
                  <td style={{ padding:"18px 20px" }}>
                    <Badge color={intern.status==="Completed"?C.green:C.blue}>{intern.status}</Badge>
                  </td>
                  <td style={{ padding:"18px 20px" }}>
                    <button style={{ padding:"7px 14px", borderRadius:8, fontSize:12, fontWeight:600, background:C.purpleDim, color:C.purple, border:`1px solid ${C.purple}44` }}>Evaluate</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab==="evaluations" && (
        <div className="fade-in" style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(300px,1fr))", gap:20 }}>
          {ADMIN_INTERNS.filter(i=>i.status==="Active").map(intern=>(
            <div key={intern.id} style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:16, padding:24 }}>
              <div style={{ display:"flex", justifyContent:"space-between", marginBottom:16 }}>
                <div style={{ fontWeight:700 }}>{intern.name}</div>
                <Badge color={C.yellow}>Pending</Badge>
              </div>
              <div style={{ fontSize:13, color:C.textMuted, marginBottom:16 }}>{intern.role} · {intern.company}</div>
              <div style={{ marginBottom:18 }}>
                <div style={{ fontSize:12, color:C.textMuted, marginBottom:6 }}>Tasks: {intern.done}/{intern.tasks} completed</div>
                <ProgressBar value={(intern.done/intern.tasks)*100} color={C.green} />
              </div>
              <textarea placeholder="Write your evaluation feedback here..." style={{ width:"100%", minHeight:90, padding:"12px 14px", borderRadius:10, background:C.surface, border:`1px solid ${C.border}`, color:C.text, fontSize:13, resize:"vertical" }} />
              <button style={{ width:"100%", marginTop:12, padding:"11px", borderRadius:10, fontSize:14, fontWeight:600, background:C.green, color:"#fff" }}>Submit Evaluation</button>
            </div>
          ))}
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

  const showToast = (msg, color = C.green) => {
    setToast({ msg, color });
    setTimeout(() => setToast(null), 3500);
  };

  const handleLogin = (r) => {
    setRole(r);
    if(r==="student")       setPage("student");
    else if(r==="employer") setPage("employer");
    else                    setPage("employer");   // admin uses same portal
    showToast(`Welcome! Signed in as ${r} ✓`);
  };

  const handleApply = (item) => {
    if(!role){ setAuthMode("signup"); setPage("login"); return; }
    showToast(`Applied to ${item.title} at ${item.company}! 🎉`);
    if(role==="student") setPage("student");
  };

  const goLogin = (p) => { setAuthMode(p); setPage("login"); };

  return (
    <>
      <GlobalStyles />
      <div style={{ fontFamily:"'DM Sans',sans-serif", background:C.bg, color:C.text, minHeight:"100vh" }}>
        {/* Toast */}
        {toast && (
          <div style={{ position:"fixed", bottom:28, right:28, background:toast.color, color:"#fff", padding:"14px 24px", borderRadius:14, fontWeight:600, zIndex:999, boxShadow:"0 16px 48px rgba(0,0,0,0.5)", animation:"fadeUp 0.3s ease", maxWidth:360 }}>
            {toast.msg}
          </div>
        )}

        <Navbar page={page} setPage={setPage} role={role} setRole={setRole} setPage2={setPage} />

        {page==="home"       && <HomePage    setPage={(p)=>{ if(p==="signup"){setAuthMode("signup");setPage("login");}else setPage(p); }} />}
        {page==="internships"&& <InternshipsPage onApply={handleApply} role={role} />}
        {page==="login"      && <AuthPage mode={authMode} setMode={setAuthMode} onLogin={handleLogin} />}
        {page==="signup"     && <AuthPage mode="signup"   setMode={setAuthMode} onLogin={handleLogin} />}
        {page==="student"    && <StudentDashboard />}
        {page==="employer"   && <EmployerPortal />}
        {page==="admin"      && <EmployerPortal />}
      </div>
    </>
  );
}
