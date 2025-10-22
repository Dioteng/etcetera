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

  // NOTE: modal event listeners are attached conditionally later (only on index.html)

  // playful avoidance: move 'no' button when cursor nears
  if (noBtn){
    noBtn.addEventListener('mouseenter', async ()=>{
    // multi-step dodge: attempt at least 3 safe moves around the viewport
    const avoidRects = [];
    if (yesBtn) {
      const yesRect = yesBtn.getBoundingClientRect();
      avoidRects.push(yesRect);
    }
    const footer = document.querySelector('.footer');
    if (footer) avoidRects.push(footer.getBoundingClientRect());
    const modalRect = modal ? modal.getBoundingClientRect() : null;
    if (modalRect && modal.getAttribute('aria-hidden') === 'false') avoidRects.push(modalRect);

    const noRect = noBtn.getBoundingClientRect();
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const margin = 12;
    const minX = 8;
    const maxX = vw - noRect.width - 8;

    function intersectsAnyAt(x, yTop=noRect.top){
      const testRect = {left:x, right:x + noRect.width, top:yTop, bottom:yTop + noRect.height};
      for(const r of avoidRects){
        if (!(testRect.right + margin < r.left || testRect.left - margin > r.right || testRect.bottom + margin < r.top || testRect.top - margin > r.bottom)){
          return true;
        }
      }
      // also ensure within viewport vertically
      if (testRect.top < 8 || testRect.bottom > vh - 8) return true;
      return false;
    }

    // generate many candidate positions across screen (x,y) grid
    const xs = [];
    for(let x = minX; x <= maxX; x += Math.max(40, (maxX-minX)/8)) xs.push(x);
    const ys = [];
    const topLimit = Math.max(60, 80);
    const bottomLimit = Math.max(vh - 160, vh - 120);
    for(let y = Math.max(120, noRect.top - 120); y <= Math.min(vh - noRect.height - 40, noRect.top + 160); y += Math.max(40, (noRect.height+80))) ys.push(y);

    // pick N distinct safe positions (at least 3)
    const safePositions = [];
    for (let x of xs){
      for (let y of ys){
        if (safePositions.length >= 8) break;
        if (!intersectsAnyAt(x,y)) safePositions.push({x,y});
      }
      if (safePositions.length >= 8) break;
    }

    // fallback: sample random positions until we have at least 3
    const rand = ()=> Math.random();
    let attempts = 0;
    while (safePositions.length < 3 && attempts < 80){
      attempts++;
      const x = Math.floor(minX + rand() * (maxX - minX));
      const y = Math.floor(Math.max(40, rand() * (vh - noRect.height - 80)));
      if (!intersectsAnyAt(x,y)) safePositions.push({x,y});
    }

    // ensure uniqueness and at least 3 positions
    const unique = [];
    for(const p of safePositions){
      if (!unique.find(u => Math.abs(u.x-p.x)<10 && Math.abs(u.y-p.y)<10)) unique.push(p);
      if (unique.length >= 3) break;
    }

    if (unique.length === 0) return; // no safe moves

    // animate through the positions (3 moves minimum)
    const moves = unique.slice(0, Math.max(3, unique.length));
    for(const pos of moves){
      // compute translate relative to current button position
      const curRect = noBtn.getBoundingClientRect();
      const dx = pos.x - curRect.left;
      const dy = pos.y - curRect.top;
      noBtn.style.transform = `translate(${dx}px, ${dy}px)`;
      // wait for transition to finish (match CSS transition ~360ms)
      await new Promise(res => setTimeout(res, 420 + Math.floor(Math.random()*180)));
    }

    // briefly pause then reset transform so the layout remains natural
    await new Promise(res => setTimeout(res, 340));
    noBtn.style.transform = '';
  });

    // Reset transforms on window resize so layout can recalc and avoid stuck positions
    window.addEventListener('resize', ()=>{
      noBtn.style.transform = '';
    });
  }

  // Gallery loader: find elements with data-gallery and render images from manifest
  async function tryFetchManifest(paths){
    for(const p of paths){
      try{
        const r = await fetch(p);
        if (r.ok) return {path:p, json: await r.json()};
      }catch(e){
        // continue to next
      }
    }
    return null;
  }

  async function loadGalleries(){
    const galleries = document.querySelectorAll('[data-gallery]');
    for(const g of galleries){
      const id = g.getAttribute('data-gallery');
      const grid = g.querySelector('.gallery-grid');
      if (!grid) continue;

      // possible manifest locations (try absolute and relative)
      const candidatePaths = [
        `/assets/photos/${id}/manifest.json`,
        `assets/photos/${id}/manifest.json`,
        `./assets/photos/${id}/manifest.json`
      ];

      const result = await tryFetchManifest(candidatePaths);
      if (!result){
        grid.innerHTML = `<div class="gallery-placeholder">No manifest found for gallery <strong>${id}</strong>.<br/>Put your images in <code>assets/photos/${id}/</code> and add a JSON manifest at <code>assets/photos/${id}/manifest.json</code> (e.g. ["img1.jpg","img2.jpg"]).<br/><em>If you're opening files directly from the filesystem, run a local server: <code>python -m http.server 8000</code>.</em></div>`;
        continue;
      }

      const list = result.json;
      if (!Array.isArray(list) || list.length === 0){
        grid.innerHTML = `<div class="gallery-placeholder">Gallery manifest for <strong>${id}</strong> is empty. Add filenames to <code>${result.path}</code>.</div>`;
        continue;
      }

      grid.innerHTML = '';
      let missing = 0;
      for(const file of list){
        const img = document.createElement('img');
        // construct src relative to the manifest path
        const base = result.path.replace(/manifest\.json$/,'');
        img.src = base + file;
        img.alt = file;
        img.loading = 'lazy';
        img.className = 'gallery-item';
        img.addEventListener('click', ()=>openLightbox(img.src, img.alt));
        img.onerror = ()=>{
          missing++;
          img.style.display = 'none';
          // if all images missing, show placeholder
          if (missing === list.length){
            grid.innerHTML = `<div class="gallery-placeholder">Images listed in <code>${result.path}</code> could not be found in the folder. Make sure the filenames match and the images are uploaded to <code>assets/photos/${id}/</code>.</div>`;
          }
        };
        grid.appendChild(img);
      }
    }
  }

  // Modal event wiring: only attach when elements exist and only on index/root
  const onIndex = window.location.pathname.endsWith('index.html') || window.location.pathname === '/' || window.location.pathname === '';
  if (onIndex){
    if (yesBtn) yesBtn.addEventListener('click', openModal);
    if (modalClose) modalClose.addEventListener('click', closeModal);
    if (cancelBtn) cancelBtn.addEventListener('click', closeModal);
  }

  function openLightbox(src, alt){
    const lb = document.getElementById('lightbox');
    if(!lb) return;
    lb.innerHTML = `<div class="lightbox-panel"><button class="lightbox-close">✕</button><img src="${src}" alt="${escapeHtml(alt)}"/></div>`;
    lb.setAttribute('aria-hidden','false');
    lb.querySelector('.lightbox-close').addEventListener('click', closeLightbox);
    lb.addEventListener('click', (e)=>{ if(e.target === lb) closeLightbox(); });
  }
  function closeLightbox(){
    const lb = document.getElementById('lightbox');
    if(!lb) return;
    lb.setAttribute('aria-hidden','true');
    lb.innerHTML = '';
  }

  // initialize galleries on DOM ready
  loadGalleries();

  // Submit RSVP (local-only): store to localStorage and show a tiny thank you
  if (rsvpForm){
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
  }

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
