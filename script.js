/* STAR MANAGEMENT Supabase frontend.
   Browser publishable/anon keys are intended to be public; security is enforced by RLS.
   Never put a service_role/secret key in this file. */
const SUPABASE_URL = "https://pcblevuflzixdcwnjhtn.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_c6ZvA9rZs1DNuyDKEH3KyQ_osfCCY-e";
const client = window.supabase.createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);
const $ = (id) => document.getElementById(id);
let cachedGroups = [];
function setStatus(text, bad=false){ $("status").textContent=text; $("status").style.color=bad?"#ff9caa":"#dfc8f5"; }
function safeUrl(raw){ try { const u = new URL(raw); return ["http:","https:"].includes(u.protocol) ? u.href : null; } catch { return null; } }
function el(tag, cls, text){ const node=document.createElement(tag); if(cls) node.className=cls; if(text!==undefined) node.textContent=text; return node; }
function renderGroups(groups){
  const host=$("groups"); host.replaceChildren(); $("count").textContent=`${groups.length} group${groups.length===1?"":"s"}`;
  if(!groups.length){host.append(el("div","empty","No backup links have been added yet."));return;}
  for(const g of groups){
    const card=el("article","group-card"), top=el("div","group-top");
    if(g.icon_url){const img=el("img","group-icon");img.src=g.icon_url;img.alt="";top.append(img);}
    else top.append(el("div","group-icon",""+(g.icon||"🔗")));
    const heading=el("h3","",g.title||"Untitled group");top.append(heading);card.append(top);
    if(g.description) card.append(el("p","",g.description));
    const links=el("div","url-list");
    (Array.isArray(g.urls)?g.urls:[]).forEach((raw,i)=>{
      const u=safeUrl(raw);if(!u)return;
      const item=el("div","url-item");
      const a=el("a","url-link",u);a.href=u;a.target="_blank";a.rel="noopener noreferrer";a.title=u;
      const actions=el("div","url-actions");
      const open=el("a","url-action open-link","OPEN");open.href=u;open.target="_blank";open.rel="noopener noreferrer";open.setAttribute("aria-label",`Open link ${i+1}`);
      const copy=el("button","url-action copy-link","COPY");copy.type="button";copy.setAttribute("aria-label",`Copy link ${i+1}`);
      copy.addEventListener("click",async()=>{
        try {
          if(navigator.clipboard && window.isSecureContext) await navigator.clipboard.writeText(u);
          else {
            const field=el("textarea","");field.value=u;field.setAttribute("readonly","");field.style.position="fixed";field.style.opacity="0";document.body.append(field);field.select();
            const ok=document.execCommand("copy");field.remove();if(!ok)throw new Error("copy failed");
          }
          copy.textContent="COPIED!";copy.classList.add("copied");
          setTimeout(()=>{copy.textContent="COPY";copy.classList.remove("copied");},1800);
        } catch { copy.textContent="COPY FAILED";setTimeout(()=>copy.textContent="COPY",1800); }
      });
      actions.append(open,copy);item.append(a,actions);links.append(item);
    });
    if(!links.childElementCount) card.append(el("p","muted","No valid URLs in this group.")); else card.append(links);
    host.append(card);
  }
}
async function loadGroups(){
  setStatus("Loading backup links…");
  const {data,error}=await client.from("link_groups").select("*").order("sort_order",{ascending:true}).order("created_at",{ascending:false});
  if(error){setStatus("Database setup needs attention",true);$("groups").replaceChildren(el("div","empty",`Could not load groups: ${error.message}. Check the SQL setup in SUPABASE-SETUP.sql.`));$("count").textContent="Unavailable";return;}
  cachedGroups=data||[];renderGroups(cachedGroups);setStatus("Connected to Supabase");
}
// Public-only page: no admin session is needed. Load public groups directly.
loadGroups().catch((error)=>{
  console.error("Failed to load backup links:", error);
  setStatus("Could not connect to database", true);
  $("groups").replaceChildren(el("div","empty", "Could not load backup links. Please refresh and try again."));
  $("count").textContent = "Unavailable";
});
