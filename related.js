// Tap a transaction → details sheet with automatic filters:
// "Same shop" (matching description / merchant) and "Same category", across all dates.
const normShop=s=>String(s||'').toLowerCase().replace(/[^a-z0-9ހ-޿]+/g,' ').trim();
const shopOf=t=>normShop(t.merchant||t.note);
const sameShop=(a,b)=>a&&b&&(a===b||(Math.min(a.length,b.length)>=4&&(a.includes(b)||b.includes(a))));
function relatedOf(t,mode){
 if(mode==='shop'){const k=shopOf(t);if(!k)return null;return data.transactions.filter(x=>x.type===t.type&&sameShop(shopOf(x),k))}
 if(t.type==='transfer')return data.transactions.filter(x=>x.type==='transfer'&&x.account===t.account&&x.to===t.to);
 return data.transactions.filter(x=>x.type===t.type&&x.category===t.category)}
const txCur=t=>account(t.account)?.currency||'';
function relatedSummary(list){const by={},month_={};const m=month();for(const x of list){const c=txCur(x);by[c]=(by[c]||0)+x.amount;if(x.date.startsWith(m))month_[c]=(month_[c]||0)+x.amount}
 const fmt=o=>Object.entries(o).map(([c,v])=>`<span class="rel-amt"><small>${c}</small> ${money(v)}</span>`).join('')||'<span class="rel-amt">—</span>';
 const avg=Object.entries(by).map(([c,v])=>{const n=list.filter(x=>txCur(x)===c).length;return `<span class="rel-amt"><small>${c}</small> ${money(v/n)}</span>`}).join('')||'—';
 return `<div class="card-stats rel-stats"><div class="cstat"><label>Times</label><strong>${list.length}</strong><p>all dates</p></div><div class="cstat"><label>Total</label><strong>${fmt(by)}</strong><p>avg ${avg}</p></div><div class="cstat"><label>This month</label><strong>${fmt(month_)}</strong><p>${esc(month())}</p></div></div>`}
function txDetails(id,mode){const t=data.transactions.find(x=>x.id===id);if(!t)return;const a=account(t.account),to=account(t.to);
 const shopKey=shopOf(t);mode=mode||(shopKey?'shop':'cat');if(mode==='shop'&&!shopKey)mode='cat';
 const list=(relatedOf(t,mode)||[]).sort((x,y)=>y.date.localeCompare(x.date)||(x.id===t.id?-1:1));
 const sign=t.type==='income'?'+':t.type==='expense'?'−':'⇄ ',cls=t.type==='income'?'income':t.type==='expense'?'expense':'';
 const shopLabel=t.merchant||t.note||'';
 const catLabel=t.type==='transfer'?'Same accounts':'Same category';
 modal('Transaction',`<div class="tx-detail"><div class="tx-detail-amt ${cls}"><small>${esc(txCur(t))}</small> ${sign}${money(t.amount)}</div><b>${esc(t.note||t.category)}</b><p class="hint">${esc(t.category)} · ${esc(a?.name)}${to?' → '+esc(to.name):''} · ${esc(t.date)}${t.merchant?' · '+esc(t.merchant):''}${t.originalCurrency?` · original ${esc(t.originalCurrency)} ${money(t.originalAmount)}`:''}${t.toAmount?` · received ${esc(to?.currency)} ${money(t.toAmount)}`:''}</p><button type="button" class="secondary" onclick="transactionForm('${t.id}')">✎ Edit transaction</button></div>
 <div class="cat-tabs rel-tabs"><button type="button" class="${mode==='shop'?'selected':''}" ${shopKey?'':'disabled'} onclick="txDetails('${t.id}','shop')">Same shop${shopLabel?`<small>${esc(shopLabel.slice(0,22))}</small>`:''}</button><button type="button" class="${mode==='cat'?'selected':''}" onclick="txDetails('${t.id}','cat')">${catLabel}<small>${esc(t.type==='transfer'?(a?.name||'')+' → '+(to?.name||''):t.category)}</small></button></div>
 ${shopKey||mode==='cat'?relatedSummary(list):''}
 <div class="rel-list">${list.slice(0,60).map(x=>{const xa=account(x.account);return `<button class="ledger-row ${x.id===t.id?'rel-current':''}" onclick="txDetails('${x.id}','${mode}')"><span class="tx-icon">${x.type==='income'?'↙':x.type==='expense'?'↗':'⇄'}</span><span class="ledger-description"><b>${esc(x.note||x.category)}</b><small>${esc(x.date)} · ${esc(mode==='shop'?x.category:xa?.name)}${mode==='shop'?' · '+esc(xa?.name):''}</small></span><strong class="${x.type==='income'?'income':x.type==='expense'?'expense':''}"><small>${esc(txCur(x))}</small> ${money(x.amount)}</strong></button>`}).join('')}${list.length>60?`<p class="hint">Showing the newest 60 of ${list.length}.</p>`:''}</div>
 ${!shopKey?'<p class="hint">Add a description to this transaction to match it with the same shop.</p>':''}`)}
