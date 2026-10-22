// Quick log: open straight into a ready-to-fill form from a link (?quick=expense|income|transfer|trip),
// the app icon's long-press menu, an iPhone Shortcuts widget, or on every launch (optional).
const QUICK_KEY=KEY+':quick';
const quickPrefs=()=>{try{return JSON.parse(localStorage.getItem(QUICK_KEY))||{}}catch{return {}}};
const quickTypes={expense:'Add expense',income:'Add income',transfer:'Transfer',trip:'Trip expense'};
function activeTrip(){const d=today();return data.trips.filter(t=>t.start<=d&&d<=t.end).sort((a,b)=>b.start.localeCompare(a.start))[0]}
function quickLog(type='expense'){
 if(demo)exitDemo();
 if(type==='trip'){const t=activeTrip();if(t){page='travel';selectedTrip=t.id;space=t.space;$('#currency').value=t.currency;render();return travelExpenseForm(t.id)}toast('No trip is happening today, so this is a normal expense.');type='expense'}
 if(!data.accounts.length)return transactionForm();
 transactionForm();const f=$('#form');if(!f)return;
 f.elements.type.value=type;f.elements.type.dispatchEvent(new Event('change'));
 // Start from the account last used for this kind of entry.
 const last=[...data.transactions].filter(t=>t.type===type&&!t.tripId&&account(t.account)).sort((a,b)=>b.date.localeCompare(a.date))[0];
 if(last){f.elements.account.value=last.account;f.elements.account.dispatchEvent(new Event('change'));if(type==='transfer'&&last.to&&account(last.to)){f.elements.to.value=last.to;f.elements.to.dispatchEvent(new Event('change'))}}
 $('#modal-content h2').textContent=quickTypes[type]||'Add a transaction';
 // Recent categories as one-tap chips.
 if(type!=='transfer'){const cats=[...new Set([...data.transactions].filter(t=>t.type===type&&!t.tripId).sort((a,b)=>b.date.localeCompare(a.date)).map(t=>t.category))].slice(0,6);if(cats.length){const box=document.createElement('div');box.className='quick-chips';box.innerHTML=cats.map(c=>`<button type="button">${esc(c)}</button>`).join('');box.onclick=e=>{const b=e.target.closest('button');if(!b)return;f.elements.category.value=b.textContent;box.querySelectorAll('button').forEach(x=>x.classList.toggle('selected',x===b))};f.elements.category.closest('label').after(box)}}
 setTimeout(()=>{if(!document.documentElement.classList.contains('app-locked'))f.elements.amount.focus()},250)}
function quickSettings(){const p=quickPrefs(),base=location.origin+location.pathname;modal('Quick log',`<p class="hint">Jump straight into a new entry. A true Home Screen widget isn’t possible for web apps, but these get you close.</p><div class="settings-actions"><label class="secondary lock-toggle"><input type="checkbox" id="quick-launch" ${p.launch?'checked':''}> Open Faru straight to “Add expense”</label>${Object.entries(quickTypes).map(([k,l])=>`<button class="secondary" onclick="closeModal();quickLog('${k}')">⚡ ${l}</button>`).join('')}</div><h3 class="quick-h">Links for iPhone Shortcuts or bookmarks</h3>${Object.entries(quickTypes).map(([k,l])=>`<div class="quick-link"><span><b>${l}</b><small>${esc(base)}?quick=${k}</small></span><button class="text-button" onclick="navigator.clipboard?.writeText('${esc(base)}?quick=${k}').then(()=>toast('Link copied'),()=>toast('Copy not available'))">Copy</button></div>`).join('')}<p class="hint">In the Shortcuts app: New shortcut → “Open URLs” → paste a link, then add the Shortcuts widget to your Home Screen or Lock Screen.</p>`);$('#quick-launch').onchange=e=>{localStorage.setItem(QUICK_KEY,JSON.stringify({...quickPrefs(),launch:e.target.checked}));toast(e.target.checked?'Faru will open to Add expense':'Faru will open to Home')}}
(function(){const q=new URLSearchParams(location.search).get('quick');if(q&&quickTypes[q]){history.replaceState(null,'',location.pathname+location.hash);setTimeout(()=>quickLog(q),60)}else if(quickPrefs().launch&&!location.hash){setTimeout(()=>quickLog('expense'),60)}})();
