/* DMRA — couche premium (à charger APRÈS shared.js) */
(function(){'use strict';
var d=document,h=d.documentElement,rm=matchMedia('(prefers-reduced-motion: reduce)').matches,fine=matchMedia('(pointer:fine)').matches;
var seen=false;try{seen=sessionStorage.getItem('pSeen')==='1'}catch(e){}
var ld=null,mk=null;
if(!rm){mk=d.createElement('img');mk.id='pMark';mk.alt='';mk.src='assets/logo-navy-transparent.png';if(seen)mk.className='on';d.body.appendChild(mk)}
if(!seen&&!rm){ld=d.createElement('div');ld.id='pLoader';ld.innerHTML='<img src="assets/logo-navy-transparent.png" alt="DMRA — Building on the Best"><i></i>';d.body.appendChild(ld)}
function ready(){h.classList.add('p-ready');if(ld)ld.classList.add('go');if(mk)mk.classList.remove('on');
 setTimeout(function(){h.classList.add('ready')},rm?0:350);setTimeout(function(){if(ld)ld.remove()},900);
 try{sessionStorage.setItem('pSeen','1')}catch(e){}}
setTimeout(ready,rm?0:(seen?300:1350));
/* transitions entre pages */
d.addEventListener('click',function(e){var a=e.target.closest&&e.target.closest('a[href]');
 if(!a||e.defaultPrevented||e.metaKey||e.ctrlKey||e.shiftKey||e.altKey||a.target||a.hasAttribute('download'))return;
 var u;try{u=new URL(a.href,location.href)}catch(x){return}
 if(u.origin!==location.origin||!/\.html?$/.test(u.pathname)||u.pathname===location.pathname)return;
 e.preventDefault();h.classList.add('p-leave');setTimeout(function(){location.href=a.href},rm?0:620)});
addEventListener('pageshow',function(e){if(e.persisted)h.classList.remove('p-leave')});
/* progression, nav, halos */
var nav=d.querySelector('header.nav'),pb=d.createElement('div');pb.id='pProg';d.body.appendChild(pb);
[].forEach.call(d.querySelectorAll('.page-hero,.panel-navy'),function(s){['a','b'].forEach(function(c){var o=d.createElement('div');o.className='orb '+c;s.insertBefore(o,s.firstChild)})});
var orbs=[].slice.call(d.querySelectorAll('.orb')),ly=0,tk=false;
function onScroll(){var y=scrollY,m=h.scrollHeight-innerHeight;pb.style.transform='scaleX('+(m>0?y/m:0)+')';
 if(nav){nav.classList.toggle('is-scrolled',y>20);nav.classList.toggle('is-hidden',y>ly&&y>260)}
 if(!rm)orbs.forEach(function(o,i){o.style.translate='0 '+(y*(.06+(i%2)*.06))+'px'});ly=y;tk=false}
addEventListener('scroll',function(){if(!tk){tk=true;requestAnimationFrame(onScroll)}},{passive:true});onScroll();
/* cascade d'apparition */
[].forEach.call(d.querySelectorAll('.hero-copy>*'),function(el,i){el.style.setProperty('--i',i)});
[].forEach.call(d.querySelectorAll('.reveal'),function(el){var p=el.parentNode,i=0,s=el.previousElementSibling;
 while(s){if(s.classList.contains('reveal'))i++;s=s.previousElementSibling}el.style.transitionDelay=Math.min(i,5)*90+'ms'});
/* cartes */
[].forEach.call(d.querySelectorAll('.cap-card,.stat-card,.insight-card,.contact-card,.case,.testimonial-card'),function(c){
 var sp=d.createElement('span');sp.className='spot';c.appendChild(sp);c.classList.add('p-card');
 var tilt=/cap-card|stat-card|insight-card/.test(c.className)&&fine&&!rm;if(tilt)c.classList.add('p-tilt');
 c.addEventListener('pointermove',function(e){var r=c.getBoundingClientRect(),px=(e.clientX-r.left)/r.width,py=(e.clientY-r.top)/r.height;
  c.style.setProperty('--mx',px*100+'%');c.style.setProperty('--my',py*100+'%');
  if(tilt){if(!c.classList.contains('p-done')&&c.classList.contains('in')){c.style.transitionDelay='0ms';c.classList.add('p-done')}
   c.style.setProperty('--rx',((.5-py)*6)+'deg');c.style.setProperty('--ry',((px-.5)*8)+'deg');c.style.setProperty('--ty','-6px')}});
 c.addEventListener('pointerleave',function(){c.style.setProperty('--rx','0deg');c.style.setProperty('--ry','0deg');c.style.setProperty('--ty','0px')})});
/* boutons magnétiques + curseur */
if(fine&&!rm){
 [].forEach.call(d.querySelectorAll('.btn'),function(b){
  b.addEventListener('pointermove',function(e){var r=b.getBoundingClientRect();b.style.transform='translate('+((e.clientX-r.left-r.width/2)*.22)+'px,'+((e.clientY-r.top-r.height/2)*.3)+'px)'});
  b.addEventListener('pointerleave',function(){b.style.transform=''})});
 var dot=d.createElement('div'),ring=d.createElement('div'),x=0,y=0,rx=0,ry=0,on=false;dot.id='pDot';ring.id='pRing';d.body.appendChild(ring);d.body.appendChild(dot);
 addEventListener('pointermove',function(e){x=e.clientX;y=e.clientY;if(!on){on=true;rx=x;ry=y;dot.style.opacity=ring.style.opacity=1}
  dot.style.transform='translate('+x+'px,'+y+'px)';ring.classList.toggle('hov',!!(e.target.closest&&e.target.closest('a,button,input,textarea,.p-card')))});
 d.addEventListener('mouseleave',function(){dot.style.opacity=ring.style.opacity=0;on=false});
 (function loop(){rx+=(x-rx)*.16;ry+=(y-ry)*.16;ring.style.transform='translate('+rx+'px,'+ry+'px)';requestAnimationFrame(loop)})()}
})();
