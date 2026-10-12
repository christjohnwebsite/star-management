/* STAR MANAGEMENT Supabase frontend.
   Browser publishable/anon keys are intended to be public; security is enforced by RLS.
   Never put a service_role/secret key in this file. */
const SUPABASE_URL = "https://pcblevuflzixdcwnjhtn.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_c6ZvA9rZs1DNuyDKEH3KyQ_osfCCY-e";
const client = window.supabase.createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);
const $ = (id) => document.getElementById(id);
let currentUser = null;
let cachedGroups = [];
let currentIconUrl = "";

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
function renderAdmin(){
  const host=$("adminGroups");host.replaceChildren();
  if(!cachedGroups.length){host.append(el("p","muted","No groups saved yet."));return;}
  cachedGroups.forEach(g=>{
    const row=el("div","admin-row"),name=el("strong","",g.title||"Untitled group"),actions=el("div","actions");
    const edit=el("button","secondary","Edit"),del=el("button","secondary","Delete");
    edit.type=del.type="button";edit.onclick=()=>startEdit(g);
    del.onclick=async()=>{if(!confirm(`Delete “${g.title}”?`))return;const {error}=await client.from("link_groups").delete().eq("id",g.id);if(error){$("saveMessage").textContent=error.message;return;}await loadGroups();};
    actions.append(edit,del);row.append(name,actions);host.append(row);
  });
}
async function loadGroups(){
  setStatus("Loading backup links…");
  const {data,error}=await client.from("link_groups").select("*").order("sort_order",{ascending:true}).order("created_at",{ascending:false});
  if(error){setStatus("Database setup needs attention",true);$("groups").replaceChildren(el("div","empty",`Could not load groups: ${error.message}. Check the SQL setup in SUPABASE-SETUP.sql.`));$("count").textContent="Unavailable";return;}
  cachedGroups=data||[];renderGroups(cachedGroups);if(currentUser)renderAdmin();setStatus("Connected to Supabase");
}
function setSignedIn(user){
  currentUser=user||null;$("editor").classList.toggle("hidden",!user);$("loginForm").classList.toggle("hidden",!!user);$("logoutBtn").classList.toggle("hidden",!user);
  $("authMessage").textContent=user?`Signed in as ${user.email}`:"";
  if(user)renderAdmin();
}
async function refreshSession(){const {data}=await client.auth.getSession();setSignedIn(data.session?.user||null);}
$("loginForm").addEventListener("submit",async e=>{
  e.preventDefault();$("authMessage").textContent="Signing in…";
  const {data,error}=await client.auth.signInWithPassword({email:$("email").value.trim(),password:$("password").value});
  if(error){$("authMessage").textContent=error.message;return;}
  setSignedIn(data.user);await loadGroups();
});
$("logoutBtn").addEventListener("click",async()=>{await client.auth.signOut();setSignedIn(null);$("password").value="";});
client.auth.onAuthStateChange((_event,session)=>{setSignedIn(session?.user||null);});
function startEdit(g){
  $("groupId").value=g.id;$("title").value=g.title||"";$("icon").value=g.icon||"🔗";$("urls").value=(g.urls||[]).join("\n");$("description").value=g.description||"";currentIconUrl=g.icon_url||"";$("iconFile").value="";
  $("formTitle").textContent="Edit backup link group";$("cancelEdit").classList.remove("hidden");$("saveMessage").textContent="";window.scrollTo({top:$("groupForm").getBoundingClientRect().top+window.scrollY-20,behavior:"smooth"});
}
function resetForm(){ $("groupForm").reset();$("groupId").value="";$("icon").value="🔗";currentIconUrl="";$("formTitle").textContent="Add backup link group";$("cancelEdit").classList.add("hidden");$("iconUploadStatus").textContent=""; }
$("cancelEdit").addEventListener("click",resetForm);
$("iconFile").addEventListener("change",()=>{const f=$("iconFile").files[0];$("iconUploadStatus").textContent=f?`${f.name} selected; it will upload when you save.`:"";});
async function uploadIcon(file){
  if(!file)return currentIconUrl||null;
  if(!["image/png","image/jpeg","image/webp"].includes(file.type))throw new Error("Choose a PNG, JPG, or WEBP image.");
  if(file.size>10*1024*1024)throw new Error("Icon must be smaller than 10 MB.");
  const ext=file.type==="image/png"?"png":file.type==="image/webp"?"webp":"jpg";
  const path=`${currentUser.id}/${crypto.randomUUID()}.${ext}`;
  const {error}=await client.storage.from("group-icons").upload(path,file,{upsert:false,contentType:file.type});
  if(error)throw error;
  return client.storage.from("group-icons").getPublicUrl(path).data.publicUrl;
}
$("groupForm").addEventListener("submit",async e=>{
  e.preventDefault();if(!currentUser){$("saveMessage").textContent="Please sign in first.";return;}
  $("saveMessage").textContent="Saving…";
  try{
    const urls=$("urls").value.split(/\r?\n/).map(x=>x.trim()).filter(Boolean);
    if(!urls.length)throw new Error("Enter at least one backup URL.");
    for(const u of urls)if(!safeUrl(u))throw new Error(`Invalid URL: ${u}`);
    const iconUrl=await uploadIcon($("iconFile").files[0]);
    const payload={title:$("title").value.trim(),description:$("description").value.trim(),icon:$("icon").value.trim()||"🔗",icon_url:iconUrl,urls,updated_at:new Date().toISOString()};
    if(!$("groupId").value)payload.sort_order=cachedGroups.length;
    let result;
    if($("groupId").value)result=await client.from("link_groups").update(payload).eq("id",$("groupId").value);
    else result=await client.from("link_groups").insert(payload);
    if(result.error)throw result.error;
    $("saveMessage").textContent="Group saved successfully.";resetForm();await loadGroups();
  }catch(err){$("saveMessage").textContent=err.message||"Could not save group.";}
});
(async()=>{await refreshSession();await loadGroups();})();
