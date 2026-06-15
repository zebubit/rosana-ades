/* Rosana Ades — interações suaves (mobile-first, respeita reduced-motion) */
(function(){
  document.documentElement.classList.remove('no-js');
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* Nav: sombra ao rolar + menu mobile */
  var nav = document.querySelector('.nav');
  var toggle = document.querySelector('.nav-toggle');
  var links = document.querySelector('.nav-links');
  function onScroll(){ if(nav) nav.classList.toggle('scrolled', window.scrollY > 40); }
  onScroll();
  window.addEventListener('scroll', onScroll, {passive:true});
  if(toggle && links){
    toggle.addEventListener('click', function(){ links.classList.toggle('open'); });
    links.querySelectorAll('a').forEach(function(a){
      a.addEventListener('click', function(){ links.classList.remove('open'); });
    });
  }

  /* Reveal on scroll via IntersectionObserver (leve no mobile e desktop) */
  var els = document.querySelectorAll('.reveal');
  if(reduce || !('IntersectionObserver' in window)){
    els.forEach(function(el){ el.classList.add('in'); });
  } else {
    var io = new IntersectionObserver(function(entries){
      entries.forEach(function(e){
        if(e.isIntersecting){
          var el = e.target;
          var d = el.getAttribute('data-delay');
          if(d) el.style.transitionDelay = d + 'ms';
          el.classList.add('in');
          io.unobserve(el);
        }
      });
    }, {threshold:0.12, rootMargin:'0px 0px -8% 0px'});
    els.forEach(function(el){ io.observe(el); });
  }

  /* Parallax leve no hero — SÓ desktop com ponteiro fino (evita travar scroll no mobile) */
  var fine = window.matchMedia('(min-width:1024px) and (pointer:fine)').matches;
  var media = document.querySelector('.hero-media');
  if(fine && !reduce && media){
    window.addEventListener('scroll', function(){
      var y = window.scrollY;
      if(y < window.innerHeight) media.style.transform = 'translateY(' + (y*0.18) + 'px)';
    }, {passive:true});
  }

  /* Ano dinâmico no rodapé */
  document.querySelectorAll('[data-year]').forEach(function(el){ el.textContent = new Date().getFullYear(); });

  /* ----- Player de música ambiente (contínuo entre páginas) ----- */
  (function(){
    // descobre o caminho de assets/ (raiz usa "assets/", subpastas como /bio usam "../assets/")
    var inSub = /\/(bio)\//.test(location.pathname);
    var base = inSub ? '../assets/' : 'assets/';
    var audio = document.createElement('audio');
    audio.id = 'ambientMusic'; audio.loop = true; audio.preload = 'none'; audio.volume = 0.26;
    var srcEl = document.createElement('source'); srcEl.src = base + 'audio/ambient.mp3'; srcEl.type = 'audio/mpeg';
    audio.appendChild(srcEl); document.body.appendChild(audio);

    var btn = document.createElement('button');
    btn.className = 'music-btn'; btn.type = 'button'; btn.setAttribute('aria-label','Música ambiente');
    btn.innerHTML = '<span class="music-wave" aria-hidden="true"></span>' +
      '<svg class="music-icon-play" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>' +
      '<svg class="music-icon-pause" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><rect x="6" y="5" width="4" height="14" rx="1"/><rect x="14" y="5" width="4" height="14" rx="1"/></svg>';
    document.body.appendChild(btn);

    var KEY_ON='rosanaMusicOn', KEY_TIME='rosanaMusicTime';
    function markPlaying(){ btn.classList.add('playing'); btn.classList.remove('needs-click'); }
    function markPaused(){ btn.classList.remove('playing'); }

    var savedTime = parseFloat(sessionStorage.getItem(KEY_TIME) || '0');
    if(savedTime>0){ audio.addEventListener('loadedmetadata', function(){ try{ if(isFinite(audio.duration) && savedTime<audio.duration) audio.currentTime=savedTime; }catch(e){} }); }

    function startPlay(){
      var p = audio.play();
      if(p && typeof p.then==='function'){
        p.then(function(){ markPlaying(); sessionStorage.setItem(KEY_ON,'1'); })
         .catch(function(){ btn.classList.add('needs-click'); });
      }
    }
    var wasOn = sessionStorage.getItem(KEY_ON);
    if(wasOn==='1') startPlay();
    else if(wasOn===null && !reduce) setTimeout(startPlay, 3000);

    // Fallback: navegadores bloqueiam som automático ate a 1a interacao.
    // Assim que o usuario tocar/rolar/clicar, inicia (se nao pausou de proposito).
    function onFirstInteract(){
      if(sessionStorage.getItem(KEY_ON)!=='0' && audio.paused) startPlay();
      ['pointerdown','touchstart','keydown','scroll'].forEach(function(ev){
        window.removeEventListener(ev, onFirstInteract);
      });
    }
    ['pointerdown','touchstart','keydown','scroll'].forEach(function(ev){
      window.addEventListener(ev, onFirstInteract, {passive:true, once:false});
    });

    btn.addEventListener('click', function(){
      if(audio.paused){ audio.play().then(function(){ markPlaying(); sessionStorage.setItem(KEY_ON,'1'); }).catch(function(){}); }
      else { audio.pause(); sessionStorage.setItem(KEY_ON,'0'); markPaused(); }
    });
    audio.addEventListener('play', markPlaying);
    audio.addEventListener('pause', markPaused);
    setInterval(function(){ if(!audio.paused) sessionStorage.setItem(KEY_TIME, audio.currentTime); }, 1000);
    window.addEventListener('beforeunload', function(){ sessionStorage.setItem(KEY_TIME, audio.currentTime); });
  })();
})();
