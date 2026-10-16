const toggle=document.querySelector('.nav-toggle'),nav=document.querySelector('.nav');if(toggle&&nav){toggle.addEventListener('click',()=>{const expanded=toggle.getAttribute('aria-expanded')==='true';toggle.setAttribute('aria-expanded',String(!expanded));nav.classList.toggle('open',!expanded);});nav.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>{nav.classList.remove('open');toggle.setAttribute('aria-expanded','false')}));}
// Open only the curated images already included in the portfolio.
const photos = document.querySelectorAll('.evidence-photo img, .paw-photo img');
if (photos.length) {
  const dialog = document.createElement('dialog');
  dialog.className = 'photo-dialog';
  dialog.innerHTML = '<button type="button" aria-label="Close photograph">×</button><img alt=""><p></p>';
  document.body.append(dialog);
  const close = dialog.querySelector('button');
  close.addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', e => { if (e.target === dialog) dialog.close(); });
  photos.forEach(photo => {
    const button = document.createElement('button');
    button.type = 'button'; button.className = 'photo-open';
    button.setAttribute('aria-label', 'Enlarge: ' + photo.alt);
    photo.replaceWith(button); button.append(photo);
    button.addEventListener('click', () => {
      dialog.querySelector('img').src = photo.src;
      dialog.querySelector('img').alt = photo.alt;
      dialog.querySelector('p').textContent = photo.closest('figure')?.querySelector('figcaption')?.textContent || photo.alt;
      dialog.showModal();
    });
  });
}

const researchTopics={
 formulation:{kind:'Research experience',title:'Formulation',text:'Hands-on experience in essential oil-based emulsion preparation, processing and physical stability assessment.',link:'projects/emulsion.html',label:'Explore formulation work ↗'},
 computational:{kind:'Undergraduate thesis',title:'Computational discovery',text:'A computational drug-repurposing workflow for Leishmania tropica, spanning target analysis, structural modelling, molecular docking and ADMET screening.',link:'projects/leishmania.html',label:'Explore my thesis ↗'},
 nano:{kind:'Coursework & research interests',title:'Nanotechnology',text:'Literature-based exploration of nanocarriers, cosmetic delivery and nanomaterials, alongside an interest in biomedical applications.',link:'writing.html',label:'Explore nanotechnology writing ↗'},
 regen:{kind:'Review writing & research proposal',title:'Regenerative medicine',text:'Academic writing on nanotechnology and bioprinting, plus review coursework and a brain-organoid proposal. These entries distinguish completed writing from planned experiments.',link:'writing.html',label:'Explore reviews and proposals ↗'}
};
const detail=document.getElementById('map-detail');
if(detail){document.querySelectorAll('.map-node').forEach(button=>button.addEventListener('click',()=>{const topic=researchTopics[button.dataset.topic];document.querySelectorAll('.map-node').forEach(node=>node.setAttribute('aria-pressed',String(node===button)));detail.querySelector('.map-kind').textContent=topic.kind;detail.querySelector('h2').textContent=topic.title;detail.querySelector('p').textContent=topic.text;const a=detail.querySelector('a');a.href=topic.link;a.textContent=topic.label;}));}

// Certificate categories and accessible full-size viewing.
const certFilterButtons=document.querySelectorAll('[data-cert-filter]');
certFilterButtons.forEach(button=>button.addEventListener('click',()=>{
 const category=button.dataset.certFilter;let count=0;
 document.querySelectorAll('.cert-card').forEach(card=>{const show=category==='all'||card.dataset.category===category;card.hidden=!show;if(show)count++;});
 certFilterButtons.forEach(b=>b.setAttribute('aria-pressed',String(b===button)));
 document.querySelector('.cert-result-count').textContent=category==='all'?`Showing all ${count} credentials`:`Showing ${count} credential${count===1?'':'s'}`;
}));
const certViewer=document.querySelector('.cert-viewer');
if(certViewer){let zoom=1;let opener;
 const picture=certViewer.querySelector('.cert-viewer-stage img');
 const stage=certViewer.querySelector('.cert-viewer-stage');
 function applyZoom(){picture.style.maxWidth=zoom===1?'100%':'none';picture.style.width=zoom===1?'auto':`${zoom*100}%`;stage.scrollTop=0;stage.scrollLeft=0;}
 document.querySelectorAll('[data-cert-view]').forEach(button=>button.addEventListener('click',()=>{opener=button;zoom=1;picture.src=button.dataset.image;picture.alt=button.dataset.title;certViewer.querySelector('h2').textContent=button.dataset.title;certViewer.querySelector('.cert-original').href=button.dataset.original;applyZoom();certViewer.showModal();}));
 certViewer.querySelector('.cert-close').addEventListener('click',()=>certViewer.close());
 certViewer.addEventListener('click',e=>{if(e.target===certViewer)certViewer.close();});
 certViewer.addEventListener('close',()=>{opener?.focus();});
 certViewer.querySelectorAll('[data-cert-zoom]').forEach(button=>button.addEventListener('click',()=>{zoom=button.dataset.certZoom==='reset'?1:Math.min(3,Math.max(1,zoom+(button.dataset.certZoom==='in'?.5:-.5)));applyZoom();}));
}

// Muted playback follows the video most visible in the viewport.
const scrollVideos = [...document.querySelectorAll('video')];
if (scrollVideos.length && 'IntersectionObserver' in window) {
  const visibility = new Map();
  const autoPaused = new WeakSet();
  const manuallyPaused = new WeakSet();
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let activeVideo = null;
  function pauseAutomatically(video) {
    if (!video.paused) { autoPaused.add(video); video.pause(); }
  }
  function updateVideoPlayback() {
    if (document.hidden) {
      scrollVideos.forEach(pauseAutomatically);
      return;
    }
    const candidates = scrollVideos.filter(video => (visibility.get(video) || 0) >= 0.55 && !video.ended && !manuallyPaused.has(video));
    candidates.sort((a, b) => (visibility.get(b) || 0) - (visibility.get(a) || 0));
    activeVideo = candidates[0] || null;
    scrollVideos.forEach(video => {
      if (video !== activeVideo) pauseAutomatically(video);
    });
    if (activeVideo && !reduceMotion.matches && !manuallyPaused.has(activeVideo) && !activeVideo.ended && activeVideo.paused) {
      activeVideo.play().catch(() => { /* Native controls remain available if playback is blocked. */ });
    }
  }
  scrollVideos.forEach(video => {
    video.muted = true;
    video.defaultMuted = true;
    video.setAttribute('muted', '');
    video.setAttribute('playsinline', '');
    video.controls = true;
    video.addEventListener('ended', updateVideoPlayback);
    video.addEventListener('pause', () => {
      if (autoPaused.has(video)) autoPaused.delete(video);
      else manuallyPaused.add(video);
    });
    video.addEventListener('play', () => {
      manuallyPaused.delete(video);
      scrollVideos.forEach(other => { if (other !== video) pauseAutomatically(other); });
    });
  });
  const videoObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => visibility.set(entry.target, entry.intersectionRatio));
    updateVideoPlayback();
  }, { threshold: [0, 0.25, 0.55, 0.75, 1], rootMargin: '-80px 0px 0px 0px' });
  scrollVideos.forEach(video => videoObserver.observe(video));
  document.addEventListener('visibilitychange', updateVideoPlayback);
  reduceMotion.addEventListener('change', updateVideoPlayback);
}
