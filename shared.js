(function(){
  "use strict";
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var menuBtn = document.getElementById('menuBtn');
  var links = document.querySelector('nav.links');
  /* Menu actif : la page courante reste soulignée */
  (function(){
    var here = (location.pathname.split('/').pop() || 'index.html').toLowerCase();
    Array.prototype.forEach.call(document.querySelectorAll('nav.links a[href]'), function(a){
      var h = (a.getAttribute('href') || '').split('#')[0].toLowerCase();
      if(h === here){ a.classList.add('is-active'); a.setAttribute('aria-current', 'page'); }
    });
  })();
  if(menuBtn){
    menuBtn.addEventListener('click', function(){
      var open = links.style.display === 'flex';
      links.style.display = open ? 'none' : 'flex';
      links.style.flexDirection = 'column';
      links.style.alignItems = 'flex-start';
      links.style.position = 'absolute';
      links.style.top = '100%';
      links.style.left = '0';
      links.style.right = '0';
      links.style.background = 'var(--ivory)';
      links.style.padding = '18px 24px';
      links.style.borderBottom = '1px solid var(--line)';
      links.style.gap = '16px';
    });
  }

  var revealEls = document.querySelectorAll('.reveal');
  if('IntersectionObserver' in window){
    var io = new IntersectionObserver(function(entries){
      entries.forEach(function(e){ if(e.isIntersecting){ e.target.classList.add('in'); io.unobserve(e.target); } });
    }, {threshold:.12});
    revealEls.forEach(function(el){ io.observe(el); });
  } else { revealEls.forEach(function(el){ el.classList.add('in'); }); }

  /* ===== Count-up stats ===== */
  if(!reduceMotion && 'IntersectionObserver' in window){
    var countEls = document.querySelectorAll('[data-countup]');
    var ioCount = new IntersectionObserver(function(entries){
      entries.forEach(function(entry){
        if(!entry.isIntersecting) return;
        ioCount.unobserve(entry.target);
        var el = entry.target;
        var target = parseInt(el.getAttribute('data-countup'), 10);
        var start = null, dur = 1100;
        function step(ts){
          if(!start) start = ts;
          var p = Math.min(1, (ts - start) / dur);
          var eased = 1 - Math.pow(1 - p, 3);
          el.textContent = Math.round(target * eased).toLocaleString('en-US');
          if(p < 1) requestAnimationFrame(step);
          else el.textContent = target.toLocaleString('en-US');
        }
        requestAnimationFrame(step);
      });
    }, {threshold:.5});
    countEls.forEach(function(el){ ioCount.observe(el); });
  }

  /* ===== Minimal Francophone-Africa map: continent silhouette + 4 approved markets ===== */
  var AFRICA = [
    [-9.3,35.8],[-9.8,32.6],[-9.5,30.5],[-11.0,27.9],[-13.0,23.7],[-16.0,21.3],
    [-17.1,20.8],[-17.0,16.6],[-16.3,14.7],[-11.4,9.0],[-13.2,8.5],[-11.0,7.0],
    [-9.4,4.9],[-7.5,4.3],[-3.2,5.0],[-1.0,4.8],[1.6,6.3],[2.7,6.3],[3.4,6.3],
    [5.8,4.0],[7.0,4.3],[8.3,4.0],[9.3,2.2],[9.0,-0.7],[11.0,-3.9],[12.0,-5.7],
    [12.4,-6.0],[13.4,-8.0],[12.6,-15.0],[12.0,-17.9],[14.4,-22.1],[14.6,-26.0],
    [17.0,-28.5],[18.3,-34.1],[19.9,-34.8],[22.1,-34.2],[26.0,-33.6],[27.9,-32.9],
    [30.9,-29.9],[32.6,-27.5],[32.9,-25.9],[35.3,-23.9],[35.2,-18.8],[36.9,-17.0],
    [40.5,-14.8],[39.6,-10.8],[39.3,-6.8],[41.9,-3.0],[41.0,1.9],[42.5,2.0],
    [45.6,2.1],[47.9,5.0],[50.3,7.9],[51.4,10.4],[51.1,11.8],[49.0,11.3],
    [46.2,10.4],[43.4,12.5],[42.8,12.9],[41.7,16.0],[39.0,18.0],[37.2,21.5],
    [35.5,27.8],[34.3,31.0],[32.3,31.3],[29.1,31.1],[25.2,31.2],[20.0,32.2],
    [18.0,32.6],[13.3,32.8],[11.5,33.2],[10.0,37.3],[9.0,37.1],[5.3,36.8],
    [2.2,36.8],[-1.0,35.2],[-2.3,35.2],[-5.3,35.8],[-9.3,35.8]
  ];
  var BOUNDS = {lonMin:-20, lonMax:53, latMin:-37, latMax:38};
  var MARKETS = [
    {code:'SN', name:"Senegal", lon:-14.5, lat:14.5},
    {code:'CI', name:"Côte d'Ivoire", lon:-5.5, lat:7.5},
    {code:'BF', name:"Burkina Faso", lon:-1.5, lat:12.3},
    {code:'CM', name:"Cameroon", lon:12.7, lat:5.5}
  ];

  function pointInPolygon(lon, lat, poly){
    var inside = false;
    for(var i=0, j=poly.length-1; i<poly.length; j=i++){
      var xi=poly[i][0], yi=poly[i][1], xj=poly[j][0], yj=poly[j][1];
      var intersect = ((yi>lat) !== (yj>lat)) && (lon < (xj-xi)*(lat-yi)/(yj-yi)+xi);
      if(intersect) inside = !inside;
    }
    return inside;
  }

  function buildMap(canvas, stage, opts){
    var dpr = Math.min(window.devicePixelRatio||1, 2);
    function project(lon, lat, w, h){
      var x = (lon - BOUNDS.lonMin) / (BOUNDS.lonMax - BOUNDS.lonMin) * w;
      var y = (BOUNDS.latMax - lat) / (BOUNDS.latMax - BOUNDS.latMin) * h;
      return [x, y];
    }
    function draw(){
      var rect = stage.getBoundingClientRect();
      var w = Math.max(1, rect.width), h = Math.max(1, rect.height);
      canvas.width = w * dpr; canvas.height = h * dpr;
      var ctx = canvas.getContext('2d');
      ctx.setTransform(dpr,0,0,dpr,0,0);
      ctx.clearRect(0,0,w,h);

      ctx.fillStyle = opts.dotColor;
      var step = 0.5;
      for(var lon=BOUNDS.lonMin; lon<=BOUNDS.lonMax; lon+=step){
        for(var lat=BOUNDS.latMin; lat<=BOUNDS.latMax; lat+=step){
          if(pointInPolygon(lon, lat, AFRICA)){
            var p = project(lon, lat, w, h);
            ctx.beginPath(); ctx.arc(p[0], p[1], opts.dotR, 0, Math.PI*2); ctx.fill();
          }
        }
      }

      if(opts.markers){
        MARKETS.forEach(function(m){
          var p = project(m.lon, m.lat, w, h);
          ctx.beginPath();
          ctx.fillStyle = opts.markerColor;
          ctx.arc(p[0], p[1], 5, 0, Math.PI*2);
          ctx.fill();
          ctx.beginPath();
          ctx.strokeStyle = opts.markerColor;
          ctx.lineWidth = 1.2;
          ctx.globalAlpha = .45;
          ctx.arc(p[0], p[1], 10, 0, Math.PI*2);
          ctx.stroke();
          ctx.globalAlpha = 1;
          if(opts.labels){
            ctx.fillStyle = opts.labelColor;
            ctx.font = '600 11px "Public Sans", sans-serif';
            ctx.fillText(m.code, p[0]+10, p[1]+4);
          }
        });
      }
    }
    draw();
    var t; window.addEventListener('resize', function(){ clearTimeout(t); t=setTimeout(draw,180); });
  }

  var ctaLayer = document.getElementById('ctaMapLayer');
  var ctaCanvas = document.getElementById('mapBase2');
  if(ctaLayer && ctaCanvas){
    buildMap(ctaCanvas, ctaLayer, {
      dotColor:'rgba(250,246,238,.07)', dotR:1.4,
      markers:false
    });
  }

  /* ===== Hero slider ===== */
  var slider = document.getElementById('heroSlider');
  if(slider){
    var slides = Array.prototype.slice.call(slider.querySelectorAll('.slide'));
    var dots = Array.prototype.slice.call(slider.querySelectorAll('.dot'));
    var infoEl = document.getElementById('heroSlideInfo');
    var current = 0, timer = null;
    var captions = {
      en: [
        {eyebrow:'Market & Consumer Intelligence', text:'Retail & Distribution Research'},
        {eyebrow:'Protecting Data Integrity', text:'Supervision, Back-Checks & Independent QC'},
        {eyebrow:'Senior-Level Oversight', text:'Experienced Research Leadership'}
      ],
      fr: [
        {eyebrow:'Intelligence Marché & Consommateur', text:'Recherche Commerce & Distribution'},
        {eyebrow:"Protection de l'Intégrité des Données", text:'Supervision, Back-Checks & QC Indépendant'},
        {eyebrow:'Supervision par la Direction', text:'Direction de Recherche Expérimentée'}
      ]
    };

    function goTo(i){
      current = (i + slides.length) % slides.length;
      slides.forEach(function(s, idx){ s.classList.toggle('is-active', idx === current); });
      dots.forEach(function(d, idx){
        d.classList.toggle('is-active', idx === current);
        d.setAttribute('aria-selected', idx === current ? 'true' : 'false');
      });
      updateCaption();
    }
    function updateCaption(){
      var set = captions[currentLang] || captions.en;
      if(infoEl && set[current]){
        infoEl.querySelector('.eyebrow').textContent = set[current].eyebrow;
        infoEl.querySelector('p').textContent = set[current].text;
      }
    }
    function next(){ goTo(current + 1); }
    function prev(){ goTo(current - 1); }
    function startAutoplay(){
      if(reduceMotion) return;
      stopAutoplay();
      timer = setInterval(next, 6000);
    }
    function stopAutoplay(){ if(timer){ clearInterval(timer); timer = null; } }

    slider.querySelector('.next').addEventListener('click', function(){ next(); startAutoplay(); });
    slider.querySelector('.prev').addEventListener('click', function(){ prev(); startAutoplay(); });
    dots.forEach(function(d, idx){ d.addEventListener('click', function(){ goTo(idx); startAutoplay(); }); });
    slider.addEventListener('mouseenter', stopAutoplay);
    slider.addEventListener('mouseleave', startAutoplay);
    slider.addEventListener('focusin', stopAutoplay);
    slider.addEventListener('focusout', startAutoplay);

    startAutoplay();
    window.__dmraUpdateHeroCaption = updateCaption;
  }

  /* ===== Hero parallax ===== */
  if(!reduceMotion){
    var heroBg = document.querySelector('.hero-bg');
    var heroEl = document.querySelector('.hero');
    if(heroBg && heroEl){
      var ticking = false;
      function applyParallax(){
        var rect = heroEl.getBoundingClientRect();
        if(rect.bottom > 0 && rect.top < window.innerHeight){
          var y = Math.max(-170, Math.min(170, window.scrollY * 0.42));
          var scale = 1 + Math.min(0.12, window.scrollY * 0.00022);
          heroBg.style.transform = 'translateY(' + y + 'px) scale(' + scale + ')';
        }
        ticking = false;
      }
      window.addEventListener('scroll', function(){
        if(!ticking){ requestAnimationFrame(applyParallax); ticking = true; }
      }, {passive:true});
      applyParallax();
    }
  }


  /* ===== Interactive coverage map ===== */
  (function(){
    var svg = document.getElementById('coverageSvg');
    var wrap = document.getElementById('coverageSvgWrap');
    if(!svg || !wrap) return;

    var COUNTRY_NAMES = {
      AO:{en:'Angola',fr:'Angola'}, BF:{en:'Burkina Faso',fr:'Burkina Faso'}, BI:{en:'Burundi',fr:'Burundi'},
      BJ:{en:'Benin',fr:'Bénin'}, BW:{en:'Botswana',fr:'Botswana'}, CD:{en:'DR Congo',fr:'RD Congo'},
      CF:{en:'Central African Republic',fr:'République Centrafricaine'}, CG:{en:'Congo-Brazzaville',fr:'Congo-Brazzaville'},
      CI:{en:"Côte d'Ivoire",fr:"Côte d'Ivoire"}, CM:{en:'Cameroon',fr:'Cameroun'}, CV:{en:'Cabo Verde',fr:'Cap-Vert'},
      DJ:{en:'Djibouti',fr:'Djibouti'}, DZ:{en:'Algeria',fr:'Algérie'}, EG:{en:'Egypt',fr:'Égypte'},
      EH:{en:'Western Sahara',fr:'Sahara Occidental'}, ER:{en:'Eritrea',fr:'Érythrée'}, ET:{en:'Ethiopia',fr:'Éthiopie'},
      GA:{en:'Gabon',fr:'Gabon'}, GH:{en:'Ghana',fr:'Ghana'}, GM:{en:'Gambia',fr:'Gambie'}, GN:{en:'Guinea',fr:'Guinée'},
      GQ:{en:'Equatorial Guinea',fr:'Guinée Équatoriale'}, GW:{en:'Guinea-Bissau',fr:'Guinée-Bissau'}, KE:{en:'Kenya',fr:'Kenya'},
      KM:{en:'Comoros',fr:'Comores'}, LR:{en:'Liberia',fr:'Liberia'}, LS:{en:'Lesotho',fr:'Lesotho'}, LY:{en:'Libya',fr:'Libye'},
      MA:{en:'Morocco',fr:'Maroc'}, MG:{en:'Madagascar',fr:'Madagascar'}, ML:{en:'Mali',fr:'Mali'},
      MR:{en:'Mauritania',fr:'Mauritanie'}, MU:{en:'Mauritius',fr:'Maurice'}, MW:{en:'Malawi',fr:'Malawi'},
      MZ:{en:'Mozambique',fr:'Mozambique'}, NA:{en:'Namibia',fr:'Namibie'}, NE:{en:'Niger',fr:'Niger'},
      NG:{en:'Nigeria',fr:'Nigéria'}, RE:{en:'Réunion',fr:'Réunion'}, RW:{en:'Rwanda',fr:'Rwanda'},
      SC:{en:'Seychelles',fr:'Seychelles'}, SD:{en:'Sudan',fr:'Soudan'}, SH:{en:'Saint Helena',fr:'Sainte-Hélène'},
      SL:{en:'Sierra Leone',fr:'Sierra Leone'}, SN:{en:'Senegal',fr:'Sénégal'}, SO:{en:'Somalia',fr:'Somalie'},
      SS:{en:'South Sudan',fr:'Soudan du Sud'}, ST:{en:'São Tomé and Príncipe',fr:'Sao Tomé-et-Principe'},
      SZ:{en:'Eswatini',fr:'Eswatini'}, TD:{en:'Chad',fr:'Tchad'}, TG:{en:'Togo',fr:'Togo'}, TN:{en:'Tunisia',fr:'Tunisie'},
      TZ:{en:'Tanzania',fr:'Tanzanie'}, UG:{en:'Uganda',fr:'Ouganda'}, YT:{en:'Mayotte',fr:'Mayotte'},
      ZA:{en:'South Africa',fr:'Afrique du Sud'}, ZM:{en:'Zambia',fr:'Zambie'}, ZW:{en:'Zimbabwe',fr:'Zimbabwe'}
    };

    var LEVEL_LABEL = {
      hub:    {en:'Principal Base of Operations', fr:"Base d'Opérations Principale"},
      active: {en:'Research Experience', fr:'Expérience de Recherche'}
    };
    var LEVEL_COLOR = { hub:'#C1622D', active:'#4A8FD1' };

    var MARKETS = {
      BJ: { level:'active', region:{en:'West Africa',fr:"Afrique de l'Ouest"},
        detail:{
          en:"DMRA has research experience in Benin, contributing to our ability to support research programs across Francophone West African markets.",
          fr:"DMRA dispose d'une expérience de recherche au Bénin, renforçant notre capacité à accompagner des programmes de recherche à travers les marchés d'Afrique de l'Ouest francophone."
        }
      },
      TG: { level:'active', region:{en:'West Africa',fr:"Afrique de l'Ouest"},
        detail:{
          en:"DMRA has research experience in Togo, contributing to our ability to support research programs across Francophone West African markets.",
          fr:"DMRA dispose d'une expérience de recherche au Togo, renforçant notre capacité à accompagner des programmes de recherche à travers les marchés d'Afrique de l'Ouest francophone."
        }
      },
      ML: { level:'active', region:{en:'West Africa',fr:"Afrique de l'Ouest"},
        detail:{
          en:"DMRA has research experience in Mali, contributing to our ability to support research programs across Francophone West African markets.",
          fr:"DMRA dispose d'une expérience de recherche au Mali, renforçant notre capacité à accompagner des programmes de recherche à travers les marchés d'Afrique de l'Ouest francophone."
        }
      },
      NE: { level:'active', region:{en:'West Africa',fr:"Afrique de l'Ouest"},
        detail:{
          en:"DMRA has research experience in Niger, contributing to our ability to support research programs across Francophone West African markets.",
          fr:"DMRA dispose d'une expérience de recherche au Niger, renforçant notre capacité à accompagner des programmes de recherche à travers les marchés d'Afrique de l'Ouest francophone."
        }
      },
      GN: { level:'active', region:{en:'West Africa',fr:"Afrique de l'Ouest"},
        detail:{
          en:"DMRA has research experience in Guinea, contributing to our ability to support research programs across Francophone West African markets.",
          fr:"DMRA dispose d'une expérience de recherche en Guinée, renforçant notre capacité à accompagner des programmes de recherche à travers les marchés d'Afrique de l'Ouest francophone."
        }
      },
      CI: { level:'hub', region:{en:'West Africa',fr:"Afrique de l'Ouest"},
        detail:{
          en:"DMRA's core market and principal base of operations. Our experience spans market and consumer research, social and behavioral research, public health studies, retail and distribution research, qualitative research, large-scale quantitative fieldwork and independent quality control.",
          fr:"Le marché principal et la base d'opérations de DMRA. Notre expérience couvre les études de marché et consommateur, la recherche sociale et comportementale, les études de santé publique, la recherche retail et distribution, la recherche qualitative, le travail de terrain quantitatif à grande échelle et le contrôle qualité indépendant."
        }
      },
      SN: { level:'active', region:{en:'West Africa',fr:"Afrique de l'Ouest"},
        detail:{
          en:'DMRA has supported research activities in Senegal, including assignments requiring local field execution and independent quality-control capabilities. Our experience contributes to our ability to support international research programs operating across multiple Francophone West African markets.',
          fr:"DMRA a soutenu des activités de recherche au Sénégal, y compris des missions nécessitant une exécution terrain locale et des capacités de contrôle qualité indépendant. Cette expérience contribue à notre capacité à accompagner des programmes de recherche internationaux opérant sur plusieurs marchés d'Afrique de l'Ouest francophone."
        }
      },
      CM: { level:'active', region:{en:'Central Africa',fr:'Afrique Centrale'},
        detail:{
          en:'DMRA has research experience in Cameroon, providing local market and field understanding to support assignments within the broader Francophone African research environment.',
          fr:"DMRA dispose d'une expérience de recherche au Cameroun, apportant une compréhension du marché local et du terrain pour accompagner des missions au sein de l'environnement de recherche francophone africain élargi."
        }
      },
      BF: { level:'active', region:{en:'West Africa',fr:"Afrique de l'Ouest"},
        detail:{
          en:"DMRA's experience also extends to Burkina Faso, contributing to our ability to support research programs requiring execution across different Francophone West African contexts.",
          fr:"L'expérience de DMRA s'étend également au Burkina Faso, renforçant notre capacité à accompagner des programmes de recherche nécessitant une exécution dans différents contextes d'Afrique de l'Ouest francophone."
        }
      }
    };

    // ── classify paths ──────────────────────────────────────────
    var paths = Array.prototype.slice.call(svg.querySelectorAll('path'));
    paths.forEach(function(p, idx){
      var id = p.getAttribute('id');
      if(id && MARKETS[id]){
        p.classList.add('market', MARKETS[id].level);
      } else if(id && COUNTRY_NAMES[id]){
        p.classList.add('other-country');
      } else {
        p.classList.add('ctx');
      }
      if(!reduceMotion){
        p.style.transitionDelay = Math.min(900, idx * 9) + 'ms';
      }
    });

    // ── entrance stagger ─────────────────────────────────────────
    if('IntersectionObserver' in window){
      var ioMap = new IntersectionObserver(function(entries){
        entries.forEach(function(e){
          if(e.isIntersecting){ svg.classList.add('is-in'); ioMap.unobserve(e.target); }
        });
      }, {threshold:.15});
      ioMap.observe(svg);
    } else { svg.classList.add('is-in'); }

    // ── hub pulse position (SVG → screen → container %) ──────────
    function positionHubPulse(){
      var hubPath = svg.querySelector('path.hub');
      var pulse = document.getElementById('hubPulse');
      if(!hubPath || !pulse) return;
      try{
        var bbox = hubPath.getBBox();
        var pt = svg.createSVGPoint();
        pt.x = bbox.x + bbox.width/2;
        pt.y = bbox.y + bbox.height/2;
        var screenPt = pt.matrixTransform(hubPath.getScreenCTM());
        var wrapRect = wrap.getBoundingClientRect();
        var leftPct = ((screenPt.x - wrapRect.left) / wrapRect.width) * 100;
        var topPct  = ((screenPt.y - wrapRect.top)  / wrapRect.height) * 100;
        pulse.style.left = leftPct + '%';
        pulse.style.top  = topPct + '%';
      }catch(e){}
    }
    positionHubPulse();
    var hubResizeT;
    window.addEventListener('resize', function(){ clearTimeout(hubResizeT); hubResizeT = setTimeout(positionHubPulse, 150); });

    // ── tooltip ────────────────────────────────────────────────
    var tooltip = document.getElementById('mapTooltip');
    var ttName = document.getElementById('ttName');
    var ttDot = document.getElementById('ttDot');
    var ttBadge = document.getElementById('ttBadge');
    var ttHint = document.getElementById('ttHint');

    function showTooltip(id, clientX, clientY){
      var wrapRect = wrap.getBoundingClientRect();
      var x = clientX - wrapRect.left;
      var y = clientY - wrapRect.top;
      var market = MARKETS[id];
      var name = COUNTRY_NAMES[id];
      if(!name) { hideTooltip(); return; }

      ttName.textContent = name[currentLang] || name.en;
      if(market){
        ttDot.style.background = LEVEL_COLOR[market.level];
        ttBadge.style.display = 'inline-block';
        ttBadge.textContent = (LEVEL_LABEL[market.level][currentLang] || LEVEL_LABEL[market.level].en);
        ttBadge.style.background = LEVEL_COLOR[market.level] + '28';
        ttBadge.style.color = LEVEL_COLOR[market.level];
        ttHint.style.display = 'block';
        ttHint.textContent = currentLang === 'fr' ? 'Cliquez pour en savoir plus' : 'Click to learn more';
      } else {
        ttDot.style.background = '#A9B6C2';
        ttBadge.style.display = 'none';
        ttHint.style.display = 'none';
      }
      tooltip.style.left = (x + 16) + 'px';
      tooltip.style.top  = (y - 14) + 'px';
      if(x > wrapRect.width - 220) tooltip.style.transform = 'translateX(calc(-100% - 32px))';
      else tooltip.style.transform = 'none';
      tooltip.classList.add('is-visible');
    }
    function hideTooltip(){ tooltip.classList.remove('is-visible'); }

    svg.addEventListener('mousemove', function(e){
      var id = e.target.getAttribute && e.target.getAttribute('id');
      if(!id || (!MARKETS[id] && !COUNTRY_NAMES[id])){ hideTooltip(); return; }
      showTooltip(id, e.clientX, e.clientY);
    });
    svg.addEventListener('mouseleave', hideTooltip);

    // ── click → panel ────────────────────────────────────────────
    var panel = document.getElementById('coveragePanel');
    var selectedId = null;

    function renderPanel(id){
      var market = MARKETS[id];
      var name = COUNTRY_NAMES[id];
      if(!market || !name) return;
      var color = LEVEL_COLOR[market.level];
      var closeLabel = currentLang === 'fr' ? 'Fermer' : 'Close';
      var ctaLabel = currentLang === 'fr' ? 'Discuter de Votre Projet de Recherche' : 'Discuss Your Research Project';
      panel.classList.remove('is-empty');
      panel.style.borderLeftColor = color;
      panel.innerHTML =
        '<div class="cp-head">' +
          '<div class="cp-title-row">' +
            '<span class="cp-dot" style="background:' + color + '; box-shadow:0 0 0 3px ' + color + '30;"></span>' +
            '<div>' +
              '<h3>' + (name[currentLang] || name.en) + '</h3>' +
              '<span class="cp-badge" style="background:' + color + '18; color:' + color + ';">' + (LEVEL_LABEL[market.level][currentLang] || LEVEL_LABEL[market.level].en) + '</span>' +
            '</div>' +
          '</div>' +
          '<button class="cp-close" id="cpClose" type="button" aria-label="' + closeLabel + '">&times;</button>' +
        '</div>' +
        '<p class="cp-region">' + (market.region[currentLang] || market.region.en) + '</p>' +
        '<p class="cp-detail">' + (market.detail[currentLang] || market.detail.en) + '</p>' +
        '<a class="cp-cta" href="contact.html">' + ctaLabel + '</a>';
      var closeBtn = document.getElementById('cpClose');
      if(closeBtn) closeBtn.addEventListener('click', resetPanel);
    }
    function resetPanel(){
      selectedId = null;
      paths.forEach(function(p){ p.classList.remove('is-selected'); });
      panel.classList.add('is-empty');
      panel.style.borderLeftColor = '';
      var hintText = currentLang === 'fr'
        ? "Cliquez sur un pays en couleur pour découvrir l'expérience de recherche de DMRA."
        : "Click a highlighted country to see DMRA's research experience there.";
      panel.innerHTML =
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M12 21s7-6.5 7-12a7 7 0 1 0-14 0c0 5.5 7 12 7 12Z"/><circle cx="12" cy="9" r="2.4"/></svg>' +
        '<p class="cp-hint">' + hintText + '</p>';
    }

    svg.addEventListener('click', function(e){
      var id = e.target.getAttribute && e.target.getAttribute('id');
      if(!id || !MARKETS[id]) return;
      paths.forEach(function(p){ p.classList.remove('is-selected'); });
      e.target.classList.add('is-selected');
      selectedId = id;
      renderPanel(id);
    });

    // ── language hook ──────────────────────────────────────────
    window.__dmraUpdateCoverageLang = function(){
      hideTooltip();
      if(selectedId) renderPanel(selectedId);
    };
  })();

  /* ===== Case studies horizontal scroller ===== */
  var casesTrack = document.getElementById('casesTrack');
  if(casesTrack){
    var prevBtn = document.querySelector('.cases-prev');
    var nextBtn = document.querySelector('.cases-next');
    function scrollAmount(){
      var card = casesTrack.querySelector('.case');
      return card ? card.getBoundingClientRect().width + 22 : 320;
    }
    if(prevBtn) prevBtn.addEventListener('click', function(){
      casesTrack.scrollBy({left: -scrollAmount(), behavior:'smooth'});
    });
    if(nextBtn) nextBtn.addEventListener('click', function(){
      casesTrack.scrollBy({left: scrollAmount(), behavior:'smooth'});
    });
    function updateCasesNav(){
      var max = casesTrack.scrollWidth - casesTrack.clientWidth - 12;
      if(prevBtn) prevBtn.disabled = casesTrack.scrollLeft <= 12;
      if(nextBtn) nextBtn.disabled = casesTrack.scrollLeft >= max;
    }
    casesTrack.addEventListener('scroll', updateCasesNav, {passive:true});
    window.addEventListener('resize', updateCasesNav);
    updateCasesNav();
  }

  /* ===== EN / FR language toggle ===== */
  var currentLang = 'en';
  var translatable = Array.prototype.slice.call(document.querySelectorAll('[data-fr]'));
  translatable.forEach(function(el){ el.setAttribute('data-en', el.innerHTML); });

  translatable.forEach(function(el){ el.style.transition = 'opacity .18s ease'; });
  var langBtns = Array.prototype.slice.call(document.querySelectorAll('[data-lang-btn]'));
  function setLang(lang, animate){
    currentLang = lang;
    if(animate && !reduceMotion){
      translatable.forEach(function(el){ el.style.opacity = '0'; });
      setTimeout(function(){
        translatable.forEach(function(el){
          el.innerHTML = el.getAttribute(lang === 'fr' ? 'data-fr' : 'data-en');
          el.style.opacity = '1';
        });
      }, 180);
    } else {
      translatable.forEach(function(el){
        el.innerHTML = el.getAttribute(lang === 'fr' ? 'data-fr' : 'data-en');
      });
    }
    langBtns.forEach(function(b){ b.classList.toggle('is-active', b.getAttribute('data-lang-btn') === lang); });
    document.documentElement.lang = lang;
    if(window.__dmraUpdateHeroCaption) window.__dmraUpdateHeroCaption();
    if(window.__dmraUpdateCoverageLang) window.__dmraUpdateCoverageLang();
    try{ localStorage.setItem('dmra-lang', lang); }catch(e){}
  }
  langBtns.forEach(function(b){
    b.addEventListener('click', function(){ setLang(b.getAttribute('data-lang-btn'), true); });
  });
  try{
    var saved = localStorage.getItem('dmra-lang');
    if(saved === 'fr') setLang('fr', false);
  }catch(e){}
})();
