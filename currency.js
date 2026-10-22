// Automatic currency conversion. Live rates from open.er-api.com (free, no key),
// cached on this device so conversion keeps working offline.
const FX_KEY='faru-fx-rates-v1',FX_MAX_AGE=6*3600*1000,FX_URL='https://open.er-api.com/v6/latest/USD';
const FX_CODES=['USD','MVR','EUR','GBP','INR','LKR','THB','SGD','MYR','AED','SAR','QAR','AUD','JPY','CNY','IDR','TRY','CHF','CAD','NZD','HKD','KRW','PKR','BDT','NPR','PHP','VND','EGP','ZAR'];
let fx={rates:{USD:1,MVR:15.42},updated:0,source:'built-in'},fxLoading=null;
try{const saved=JSON.parse(localStorage.getItem(FX_KEY));if(saved&&saved.rates&&saved.rates.USD===1&&saved.rates.MVR>0)fx=saved}catch{}
function refreshRates(force=false){
 if(!force&&fx.source!=='built-in'&&Date.now()-fx.fetched<FX_MAX_AGE)return Promise.resolve(fx);
 if(fxLoading)return fxLoading;
 if(navigator.onLine===false)return Promise.resolve(fx);
 const ctrl=new AbortController(),timer=setTimeout(()=>ctrl.abort(),8000);
 fxLoading=fetch(FX_URL,{signal:ctrl.signal,cache:'no-store'}).then(r=>r.json()).then(j=>{
  if(j.result!=='success'||!j.rates||!(j.rates.MVR>0))throw Error('Bad rates');
  fx={rates:j.rates,updated:(j.time_last_update_unix||0)*1000||Date.now(),fetched:Date.now(),source:'live'};
  try{localStorage.setItem(FX_KEY,JSON.stringify(fx))}catch{}
  return fx}).catch(()=>fx).finally(()=>{clearTimeout(timer);fxLoading=null});
 return fxLoading}
function fxRate(from,to){const a=fx.rates[from],b=fx.rates[to];return a>0&&b>0?b/a:null}
function convertAmount(n,from,to){const r=fxRate(from,to);return r==null?null:Math.round(n*r*100)/100}
function fxAge(){if(fx.source==='built-in')return 'approximate built-in rate (go online to update)';const mins=Math.round((Date.now()-fx.fetched)/60000);const when=mins<2?'just now':mins<60?mins+' min ago':mins<1440?Math.round(mins/60)+' h ago':Math.round(mins/1440)+' days ago';return (navigator.onLine===false?'saved rate, ':'rate ')+'updated '+when}
function fxBlock(t={},travel=false){return `<details id="fx-block" class="foreign-expense" ${t.originalCurrency?'open':''}><summary>${travel?'Paid in another currency? Convert automatically':'In another currency? Convert automatically'}</summary><p class="hint">Enter the price in its own currency and the amount above is filled in for you. You can still adjust it to match what your bank actually charged.</p><div class="two">${field('Currency (e.g. THB)','originalCurrency',t.originalCurrency,'text','list="fx-codes" pattern="[A-Za-z]{3}" maxlength="3" autocomplete="off" autocapitalize="characters"')}${field('Original amount','originalAmount',t.originalAmount,'number','min="0.01" step="0.01" max="999999999"')}</div><p class="hint fx-hint" id="fx-hint" aria-live="polite"></p><datalist id="fx-codes">${FX_CODES.map(c=>`<option>${c}</option>`).join('')}</datalist></details>`}
// target(): the currency the amount field is in (account or trip currency).
function bindFx(target){
 const f=$('#form'),cur=f.elements.originalCurrency,orig=f.elements.originalAmount,amt=f.elements.amount,hint=$('#fx-hint');let manual=false;
 const update=(write=true)=>{
  const code=cur.value.trim().toUpperCase(),n=Number(orig.value),to=target();
  if(!code||!to){hint.textContent='';return}
  if(!/^[A-Z]{3}$/.test(code)){hint.textContent='Use a three-letter currency code, like THB or EUR.';return}
  if(code===to){hint.textContent='This is already the '+to+' amount; no conversion needed.';if(write&&!manual&&n>0)amt.value=n.toFixed(2);return}
  const r=fxRate(code,to);
  if(r==null){hint.textContent='No rate found for '+code+'. Enter the '+to+' amount yourself.';return}
  const rate='1 '+code+' = '+(r>=1?r.toFixed(4):r.toPrecision(4))+' '+to+' · '+fxAge();
  if(!(n>0)){hint.textContent=rate;return}
  const v=convertAmount(n,code,to);
  if(write&&!manual)amt.value=v.toFixed(2);
  hint.textContent=(manual||!write)&&Math.abs(Number(amt.value)-v)>0.004?`At today's rate ${code} ${money(n)} ≈ ${to} ${money(v)} (you entered ${money(Number(amt.value)||0)}). ${rate}`:`${code} ${money(n)} → ${to} ${money(v)} · ${rate}`};
 cur.addEventListener('input',()=>{manual=false;update()});
 orig.addEventListener('input',()=>{manual=false;update()});
 amt.addEventListener('input',()=>{if(cur.value&&orig.value){manual=true;update(false)}});
 f.elements.account?.addEventListener('change',()=>update(!manual));
 update(false);
 refreshRates().then(()=>{if(document.body.contains(hint))update(false)})}
// Normalise the optional original-currency fields on a saved record.
function cleanFx(item,accountCurrency){
 const code=String(item.originalCurrency||'').trim().toUpperCase(),n=item.originalAmount;
 delete item.originalCurrency;delete item.originalAmount;
 if(!accountCurrency||(!code&&!n))return item;
 if(!code||!n)throw Error('Enter both the original currency and amount, or leave both blank.');
 if(!/^[A-Z]{3}$/.test(code))throw Error('Use a three-letter currency code.');
 if(code===accountCurrency)return item;
 item.originalCurrency=code;item.originalAmount=Math.round(Number(n)*100)/100;return item}
refreshRates();window.addEventListener('online',()=>refreshRates(true));
