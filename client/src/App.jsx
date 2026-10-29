import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "./api";

const money = n => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 2 }).format(Number(n || 0));
const initials = name => (name || "?").split(" ").map(s => s[0]).join("").slice(0, 2).toUpperCase();

function AuthScreen({ onAuth }) {
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  async function submit(e) {
    e.preventDefault(); setError(""); setBusy(true);
    try {
      const result = await api(`/auth/${mode}`, { method: "POST", body: JSON.stringify(form) });
      localStorage.setItem("splitsmart_token", result.token); onAuth(result.user);
    } catch (err) { setError(err.message); } finally { setBusy(false); }
  }
  return <main className="auth-shell"><div className="auth-card"><Brand /><p className="eyebrow">SHARED EXPENSES, SIMPLIFIED</p><h1>{mode === "login" ? "Welcome back" : "Create your account"}</h1><p className="muted">Keep every shared bill clear, fair, and organized.</p>
    <form onSubmit={submit} className="form-stack">
      {mode === "register" && <label>Full name<input required value={form.name} onChange={e => setForm({...form,name:e.target.value})} placeholder="e.g. Priya Sharma" /></label>}
      <label>Email address<input required type="email" value={form.email} onChange={e => setForm({...form,email:e.target.value})} placeholder="you@example.com" /></label>
      <label>Password<input required minLength="8" type="password" value={form.password} onChange={e => setForm({...form,password:e.target.value})} placeholder="At least 8 characters" /></label>
      {error && <p className="error">{error}</p>}<button className="primary wide" disabled={busy}>{busy ? "Please wait…" : mode === "login" ? "Log in" : "Create account"} <span>→</span></button>
    </form>
    <p className="auth-switch">{mode === "login" ? "New to SplitSmart?" : "Already have an account?"} <button className="text-button" onClick={() => {setMode(mode === "login" ? "register" : "login");setError("");}}>{mode === "login" ? "Create account" : "Log in"}</button></p>
  </div><div className="auth-aside"><div className="aside-orb"></div><span className="aside-kicker">LESS CHASING. MORE LIVING.</span><h2>Good times shouldn't come with complicated math.</h2><p>Track group spending, settle up fairly, and focus on what matters.</p><div className="mini-transaction"><div className="avatar green">P</div><div><b>Weekend trip</b><small>Hotel · shared expense</small></div><strong>₹3,000</strong></div><div className="mini-transaction"><div className="avatar peach">R</div><div><b>Food & groceries</b><small>Paid by Rahul</small></div><strong>₹1,200</strong></div></div></main>;
}
function Brand(){return <Link to="/" className="brand"><span className="brand-mark">s</span><span>split<span className="brand-light">smart</span></span></Link>}
function Avatar({name,index=0}) { const cls=["green","purple","peach","blue","pink"][index%5]; return <span className={`avatar ${cls}`}>{initials(name)}</span>; }

export default function App() {
  const [user, setUser] = useState(null);
  const [groups, setGroups] = useState([]);
  const [selected, setSelected] = useState(null);
  const [summary, setSummary] = useState(null);
  const [page, setPage] = useState("overview");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [showGroup, setShowGroup] = useState(false);
  const [showExpense, setShowExpense] = useState(false);
  const [showMember, setShowMember] = useState(false);
  const [groupName, setGroupName] = useState("");
  const [expenseForm, setExpenseForm] = useState({description:"",amount:"",paidBy:"",splitType:"equal"});
  const [memberEmail, setMemberEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();

  async function loadGroups() {
    const data = await api("/groups"); setGroups(data.groups);
    if (selected) {
      const found = data.groups.find(g => g._id === selected._id);
      if (found) setSelected(found);
    } else if (data.groups.length) setSelected(data.groups[0]);
  }
  async function loadSummary(group = selected) {
    if (!group) { setSummary(null); return; }
    const data = await api(`/groups/${group._id}/summary`); setSummary(data);
  }
  useEffect(() => {
    api("/auth/me").then(d => setUser(d.user)).catch(() => localStorage.removeItem("splitsmart_token")).finally(() => setLoading(false));
  }, []);
  useEffect(() => { if (user) loadGroups().catch(e => setError(e.message)); }, [user]);
  useEffect(() => { if (selected && user) loadSummary(selected).catch(e => setError(e.message)); }, [selected?._id, user]);
  const totalSpent = summary?.expenses?.reduce((a,e)=>a+e.amount,0) || 0;
  const myBalance = summary?.balances?.find(b=>b.user._id===user?.id)?.balance || 0;
  const myExpenses = summary?.expenses?.filter(e=>e.paidBy?._id===user?.id).length || 0;

  async function createGroup(e) {
    e.preventDefault(); setBusy(true); setError("");
    try { const d=await api("/groups",{method:"POST",body:JSON.stringify({name:groupName})}); setGroups([d.group,...groups]); setSelected(d.group); setGroupName("");setShowGroup(false);setPage("overview"); }
    catch(err){setError(err.message)}finally{setBusy(false)}
  }
  async function addMember(e) {
    e.preventDefault();setBusy(true);setError("");
    try { await api(`/groups/${selected._id}/members`,{method:"POST",body:JSON.stringify({email:memberEmail})});await loadSummary(selected);await loadGroups();setMemberEmail("");setShowMember(false);}
    catch(err){setError(err.message)}finally{setBusy(false)}
  }
  async function addExpense(e) {
    e.preventDefault();setBusy(true);setError("");
    try { await api("/expenses",{method:"POST",body:JSON.stringify({groupId:selected._id,description:expenseForm.description,amount:Number(expenseForm.amount),paidBy:expenseForm.paidBy||user.id,splitType:expenseForm.splitType})});await loadSummary(selected);setExpenseForm({description:"",amount:"",paidBy:user.id,splitType:"equal"});setShowExpense(false); }
    catch(err){setError(err.message)}finally{setBusy(false)}
  }
  function logout(){localStorage.removeItem("splitsmart_token");setUser(null);setGroups([]);setSelected(null);setSummary(null);}
  if(loading) return <div className="loading-screen"><Brand/><span className="spinner"/></div>;
  if(!user) return <AuthScreen onAuth={setUser}/>;

  return <div className="app-shell">
    <aside className="sidebar"><Brand/><div className="workspace-label">WORKSPACE</div><button className={`nav-item ${page==="overview"?"active":""}`} onClick={()=>setPage("overview")}><span>▦</span> Overview</button><button className={`nav-item ${page==="expenses"?"active":""}`} onClick={()=>setPage("expenses")}><span>↔</span> Expenses</button><button className={`nav-item ${page==="balances"?"active":""}`} onClick={()=>setPage("balances")}><span>◎</span> Balances</button>
      <div className="sidebar-section"><div className="section-heading">YOUR GROUPS <button onClick={()=>setShowGroup(true)} aria-label="Create group">+</button></div>
      {groups.map((g,i)=><button key={g._id} className={`group-link ${selected?._id===g._id?"selected":""}`} onClick={()=>{setSelected(g);setPage("overview");}}><span className={`group-icon color-${i%4}`}>{g.name.slice(0,1).toUpperCase()}</span><span className="group-name">{g.name}</span><span className="group-count">{g.members.length}</span></button>)}
      {!groups.length && <p className="sidebar-empty">Your groups will appear here.</p>}</div>
      <div className="sidebar-bottom"><div className="user-row"><Avatar name={user.name}/><div className="user-meta"><b>{user.name}</b><small>{user.email}</small></div></div><button className="logout" onClick={logout}>↗ Log out</button></div>
    </aside>
    <main className="main-content"><header className="topbar"><div className="breadcrumb">Workspace <span>/</span> <b>{page==="overview"?"Overview":page==="expenses"?"Expenses":"Balances"}</b></div><div className="top-actions"><span className="online-dot"/> All changes saved <Avatar name={user.name}/></div></header>
      <div className="page-wrap">
        {error && <div className="notice-error">{error}<button onClick={()=>setError("")}>×</button></div>}
        <div className="welcome-row"><div><p className="eyebrow">YOUR MONEY, MADE CLEAR</p><h1>{selected?.name || "Welcome to SplitSmart"} <span className="wave">✳</span></h1><p className="muted">{selected ? "Here's what's happening with your shared expenses." : "Create your first group to start tracking shared expenses."}</p></div><div className="welcome-actions"><button className="secondary" onClick={()=>setShowMember(true)} disabled={!selected}>＋ Add member</button><button className="primary" onClick={()=>{setExpenseForm({...expenseForm,paidBy:user.id});setShowExpense(true)}} disabled={!selected}>＋ Add expense</button></div></div>
        {!selected ? <section className="empty-state"><div className="empty-illustration">＋</div><h2>Start your first group</h2><p>Create a group for a trip, shared home, or weekend plans.</p><button className="primary" onClick={()=>setShowGroup(true)}>Create a group</button></section> :
        <>
          <section className="stats-grid">
            <article className="stat-card dark-stat"><div className="stat-top"><span>Total group spending</span><span className="stat-icon">↗</span></div><h2>{money(totalSpent)}</h2><p>Across {summary?.expenses?.length||0} recorded expenses</p><div className="stat-decoration">₹</div></article>
            <article className="stat-card"><div className="stat-top"><span>Your net balance</span><span className="stat-icon soft">◎</span></div><h2 className={myBalance>=0?"positive":"negative"}>{myBalance>0?"+":""}{money(myBalance)}</h2><p>{myBalance>0?"You are owed money":myBalance<0?"You owe money":"You're all settled up"}</p><div className="balance-bar"><span style={{width:`${Math.min(100,Math.abs(myBalance)/(totalSpent||1)*100)}%`}}/></div></article>
            <article className="stat-card"><div className="stat-top"><span>Group members</span><span className="stat-icon soft">♧</span></div><h2>{summary?.group?.members?.length||0}</h2><div className="avatar-stack">{summary?.group?.members?.slice(0,5).map((m,i)=><Avatar key={m._id} name={m.name} index={i}/>)}</div><p>People sharing expenses</p></article>
            <article className="stat-card"><div className="stat-top"><span>Expenses you paid</span><span className="stat-icon soft">↗</span></div><h2>{myExpenses}</h2><p>Payments made by you</p><div className="mini-bars"><i/><i/><i/><i/><i/><i/><i/></div></article>
          </section>
          <div className="content-grid">
            <section className="panel expenses-panel"><div className="panel-heading"><div><h2>{page==="balances"?"Member balances":page==="expenses"?"All expenses":"Recent expenses"}</h2><p>{page==="balances"?"See who owes and who is owed.":"Your group's latest activity"}</p></div><button className="quiet-button" onClick={()=>setPage(page==="expenses"?"overview":"expenses")}>{page==="expenses"?"Overview":"View all"} →</button></div>
              {page==="balances" ? <div className="balance-list">{(summary?.balances||[]).map((b,i)=><div className="balance-row" key={b.user._id}><Avatar name={b.user.name} index={i}/><div className="row-main"><b>{b.user.name}{b.user._id===user.id?" (you)":""}</b><small>{b.balance>0?"gets back":b.balance<0?"owes":"settled"}</small></div><strong className={b.balance>0?"positive":b.balance<0?"negative":""}>{money(Math.abs(b.balance))}</strong></div>)}</div>
              : <div className="expense-list">{(summary?.expenses||[]).slice(0,page==="expenses"?100:5).map((e,i)=><div className="expense-row" key={e._id}><div className={`expense-symbol symbol-${i%5}`}>{["⌂","☕","↗","✦","▣"][i%5]}</div><div className="row-main"><b>{e.description}</b><small>Paid by {e.paidBy?.name||"member"} · {new Date(e.createdAt).toLocaleDateString()}</small></div><div className="expense-amount"><b>{money(e.amount)}</b><small>{e.splits.length} members</small></div></div>)}{!summary?.expenses?.length&&<div className="empty-inline"><span>↗</span><b>No expenses yet</b><small>Add your first shared expense to get started.</small></div>}</div>}
            </section>
            <section className="panel side-panel"><div className="panel-heading"><div><h2>Settle up</h2><p>Suggested repayments</p></div><span className="tiny-badge">SMART</span></div>
              {(summary?.suggestions||[]).slice(0,5).map((s,i)=><div className="settle-row" key={i}><div className="settle-people"><Avatar name={s.from.name} index={i}/><span className="arrow-small">→</span><Avatar name={s.to.name} index={i+2}/></div><div className="row-main"><b>{s.from.name} → {s.to.name}</b><small>Suggested settlement</small></div><strong>{money(s.amount)}</strong></div>)}
              {!summary?.suggestions?.length&&<div className="settled-note"><span>✓</span><b>All balanced for now</b><p>Once expenses are added, we'll suggest the simplest repayments.</p></div>}
              <button className="settle-button" onClick={()=>setPage("balances")}>Review balances <span>→</span></button>
              <div className="tip-card"><span>✦</span><div><b>Keep it fair</b><p>Split expenses equally or choose custom shares to reflect what each person used.</p></div></div>
            </section>
          </div>
        </>}
        <footer>Made for good times, not complicated math. <span>SplitSmart © {new Date().getFullYear()}</span></footer>
      </div>
    </main>
    {showGroup&&<Modal title="Create a group" subtitle="Trips, roommates, dinners — bring your people together." onClose={()=>setShowGroup(false)}><form className="form-stack" onSubmit={createGroup}><label>Group name<input autoFocus required value={groupName} onChange={e=>setGroupName(e.target.value)} placeholder="e.g. Goa Trip 2026"/></label><button className="primary wide" disabled={busy}>{busy?"Creating…":"Create group"}</button></form></Modal>}
    {showMember&&selected&&<Modal title="Add a member" subtitle="They need a SplitSmart account first." onClose={()=>setShowMember(false)}><form className="form-stack" onSubmit={addMember}><label>Member's email<input autoFocus required type="email" value={memberEmail} onChange={e=>setMemberEmail(e.target.value)} placeholder="friend@example.com"/></label><button className="primary wide" disabled={busy}>{busy?"Adding…":"Add member"}</button></form></Modal>}
    {showExpense&&selected&&<Modal title="Add an expense" subtitle="Record a shared purchase for this group." onClose={()=>setShowExpense(false)}><form className="form-stack" onSubmit={addExpense}><label>Description<input autoFocus required value={expenseForm.description} onChange={e=>setExpenseForm({...expenseForm,description:e.target.value})} placeholder="e.g. Dinner, groceries"/></label><label>Amount (₹)<input required type="number" min="0.01" step="0.01" value={expenseForm.amount} onChange={e=>setExpenseForm({...expenseForm,amount:e.target.value})} placeholder="0.00"/></label><label>Paid by<select value={expenseForm.paidBy||user.id} onChange={e=>setExpenseForm({...expenseForm,paidBy:e.target.value})}>{summary?.group?.members?.map(m=><option key={m._id} value={m._id}>{m.name}{m._id===user.id?" (you)":""}</option>)}</select></label><div className="form-note">This expense will be split equally among all {summary?.group?.members?.length||1} group member(s). Custom splits can be added as a next enhancement.</div><button className="primary wide" disabled={busy}>{busy?"Saving…":"Save expense"}</button></form></Modal>}
  </div>;
}
function Modal({title,subtitle,children,onClose}){return <div className="modal-backdrop" onMouseDown={e=>{if(e.target===e.currentTarget)onClose()}}><section className="modal-card"><button className="modal-close" onClick={onClose}>×</button><p className="eyebrow">SPLITSMART</p><h2>{title}</h2><p className="muted">{subtitle}</p>{children}</section></div>}
