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
})();
