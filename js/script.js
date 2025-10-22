document.addEventListener('DOMContentLoaded', ()=>{
  const yesBtn = document.getElementById('yesBtn');
  const noBtn = document.getElementById('noBtn');
  const modal = document.getElementById('rsvpModal');
  const modalClose = document.getElementById('modalClose');
  const cancelBtn = document.getElementById('cancelBtn');
  const rsvpForm = document.getElementById('rsvpForm');

  function openModal(){
    modal.setAttribute('aria-hidden','false');
    document.body.style.overflow = 'hidden';
    document.getElementById('name').focus();
  }
  function closeModal(){
    modal.setAttribute('aria-hidden','true');
    document.body.style.overflow = '';
  }

  yesBtn.addEventListener('click', openModal);
  modalClose.addEventListener('click', closeModal);
  cancelBtn.addEventListener('click', closeModal);

  // playful avoidance: move 'no' button when cursor nears
  noBtn.addEventListener('mouseenter', ()=>{
    const w = window.innerWidth;
    const randX = Math.random() * (w - 140) + 40;
    noBtn.style.transform = `translateX(${randX - noBtn.getBoundingClientRect().left}px)`;
  });

  // Submit RSVP (local-only): store to localStorage and show a tiny thank you
  rsvpForm.addEventListener('submit', (e)=>{
    e.preventDefault();
    const name = document.getElementById('name').value.trim();
    const message = document.getElementById('message').value.trim();
    const rsvps = JSON.parse(localStorage.getItem('rsvps') || '[]');
    rsvps.push({name, message, ts: Date.now()});
    localStorage.setItem('rsvps', JSON.stringify(rsvps));
    closeModal();
    showThanks(name);
  });

  function showThanks(name){
    const node = document.createElement('div');
    node.className = 'card';
    node.style.textAlign = 'center';
    node.innerHTML = `<strong>Thanks, ${escapeHtml(name || 'friend')}!</strong><div style="font-size:.9rem;color:var(--muted);margin-top:6px">I'll be waiting 💕</div>`;
    document.querySelector('.container').prepend(node);
    setTimeout(()=>{ node.style.opacity = '0'; node.style.transform='translateY(-6px)'; }, 3500);
    setTimeout(()=>node.remove(),4200);
    burstHearts();
  }

  function burstHearts(){
    for(let i=0;i<12;i++){
      const h = document.createElement('div');
      h.textContent = '❤';
      h.style.position='fixed';
      h.style.left = (window.innerWidth/2 + (Math.random()*200-100))+'px';
      h.style.top = (window.innerHeight/2 + (Math.random()*200-100))+'px';
      h.style.pointerEvents='none';
      h.style.fontSize = (10+Math.random()*20)+'px';
      h.style.opacity = '1';
      h.style.transition = 'transform 900ms ease-out, opacity 900ms linear';
      document.body.appendChild(h);
      requestAnimationFrame(()=>{
        h.style.transform = `translate(${Math.random()*200-100}px,${-120 - Math.random()*180}px) rotate(${Math.random()*180-90}deg)`;
        h.style.opacity = '0';
      });
      setTimeout(()=>h.remove(),1100);
    }
  }

  // very small XSS-safe escape
  function escapeHtml(s){return s.replace(/[&<>"']/g, c=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"})[c]);}

});
