// Liquid Glass motion: the phone tab bar shrinks to a pill while scrolling down (like iOS 26),
// and the selected space tab slides as a glass highlight from the old tab to the new one.
(function(){
 const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches,root=document.documentElement,phone=matchMedia('(max-width:700px)');
 // --- Tab bar minimise on scroll ---
 let lastY=scrollY,ticking=false;
 addEventListener('scroll',()=>{if(ticking)return;ticking=true;requestAnimationFrame(()=>{const y=scrollY,dy=y-lastY;if(phone.matches&&!document.querySelector('dialog[open]')){if(dy>8&&y>140)root.classList.add('bar-min');else if(dy<-8||y<60)root.classList.remove('bar-min')}if(Math.abs(dy)>8)lastY=y;ticking=false})},{passive:true});
 document.querySelector('aside')?.addEventListener('click',e=>{if(root.classList.contains('bar-min')){root.classList.remove('bar-min');if(e.target.closest('nav button.active')){e.preventDefault();e.stopPropagation()}}},true);
 // --- Sliding glass highlight for the space tabs ---
 const box=()=>document.getElementById('spaces');
 function place(thumb,r){thumb.style.transform=`translate(${r.x}px,${r.y}px)`;thumb.style.width=r.w+'px';thumb.style.height=r.h+'px'}
 const rectOf=b=>({x:b.offsetLeft,y:b.offsetTop,w:b.offsetWidth,h:b.offsetHeight});
 const base=window.render;if(typeof base!=='function')return;
 window.render=render=function(){const sel=box()?.querySelector('button.selected'),from=sel?rectOf(sel):null;base.apply(this,arguments);const s=box(),now=s?.querySelector('button.selected');if(!s||!now)return;
  const cs=getComputedStyle(now),thumb=document.createElement('span');thumb.className='spaces-thumb';thumb.setAttribute('aria-hidden','true');
  thumb.style.backgroundImage=cs.backgroundImage;thumb.style.backgroundColor=cs.backgroundColor;thumb.style.boxShadow=cs.boxShadow;thumb.style.borderRadius=cs.borderRadius;
  s.prepend(thumb);now.classList.add('thumbed');const to=rectOf(now);
  if(from&&!reduce&&(from.x!==to.x||from.y!==to.y||from.w!==to.w)){place(thumb,from);thumb.getBoundingClientRect();thumb.classList.add('moving');requestAnimationFrame(()=>place(thumb,to))}else place(thumb,to)};
 // keep the highlight aligned after rotation / resize
 addEventListener('resize',()=>{const s=box(),now=s?.querySelector('button.selected'),t=s?.querySelector('.spaces-thumb');if(now&&t){t.classList.remove('moving');place(t,rectOf(now))}});
 render();
})();
