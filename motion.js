// Liquid Glass motion: the selected space tab slides as a glass highlight from the old tab to the new one.
(function(){
 const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
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
