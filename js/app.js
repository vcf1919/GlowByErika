/* Glow by Erika: todo lo que se muestra sale de js/config.js */
(function(){
  "use strict";
  var C = window.CONFIG || {};
  function $(s,c){return (c||document).querySelector(s);}
  function $$(s,c){return Array.prototype.slice.call((c||document).querySelectorAll(s));}
  function esc(s){return String(s==null?"":s).replace(/[&<>"]/g,function(c){return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c];});}
  var reduceMotion = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;

  var DAYS_ES = ["domingo","lunes","martes","miércoles","jueves","viernes","sábado"];
  var DAYS_CAP = ["Domingo","Lunes","Martes","Miércoles","Jueves","Viernes","Sábado"];
  var DAYS_SHORT = ["Dom","Lun","Mar","Mié","Jue","Vie","Sáb"];
  var DAY_LETTER = ["D","L","M","X","J","V","S"];
  var DAY_KEYS = ["domingo","lunes","martes","miercoles","jueves","viernes","sabado"];
  var MONTHS = ["enero","febrero","marzo","abril","mayo","junio","julio","agosto","septiembre","octubre","noviembre","diciembre"];
  var TEL = C.telefono || "34653302332";

  function toMin(s){var p=String(s).split(":");return (+p[0])*60+(+(p[1]||0));}
  function hm(m){var h=Math.floor(m/60),mi=m%60;return h+":"+(mi<10?"0":"")+mi;}

  // ---- Horario: SCHEDULE[0..6] = [[inicio,fin],...] en minutos ----
  var SCHEDULE = DAY_KEYS.map(function(k){ return ((C.horario||{})[k]||[]).map(function(r){return [toMin(r[0]),toMin(r[1])];}); });
  function rangesTxt(rs){ return rs.map(function(r){return hm(r[0])+"–"+hm(r[1]);}).join(" y "); }
  function scheduleSummary(){ // "L–V 9:30–13:30 y 16:00–20:00 · S 9:30–13:30"
    var order=[1,2,3,4,5,6,0],groups=[];
    order.forEach(function(d){
      var t=rangesTxt(SCHEDULE[d]); if(!t) return;
      var g=groups[groups.length-1];
      if(g&&g.t===t&&order.indexOf(d)===order.indexOf(g.last)+1){g.last=d;} else groups.push({first:d,last:d,t:t});
    });
    return groups.map(function(g){return DAY_LETTER[g.first]+(g.first!==g.last?"–"+DAY_LETTER[g.last]:"")+" "+g.t;}).join(" · ");
  }

  // ---- Hora de Madrid ----
  function madridNow(){
    try{
      var p=new Intl.DateTimeFormat("en-GB",{timeZone:"Europe/Madrid",year:"numeric",month:"2-digit",day:"2-digit",hour:"2-digit",minute:"2-digit",hour12:false}).formatToParts(new Date());
      var o={};p.forEach(function(x){o[x.type]=x.value;});
      return {date:new Date(+o.year,+o.month-1,+o.day),min:(+o.hour%24)*60+(+o.minute),iso:o.year+"-"+o.month+"-"+o.day};
    }catch(e){var n=new Date();return {date:new Date(n.getFullYear(),n.getMonth(),n.getDate()),min:n.getHours()*60+n.getMinutes(),iso:n.toISOString().slice(0,10)};}
  }
  var NOW = madridNow();

  // ---- Estado de apertura y tabla de horarios ----
  (function(){
    var dow=NOW.date.getDay(),el=$("#openNow"),txt,open=null,next=null;
    SCHEDULE[dow].forEach(function(r){ if(NOW.min>=r[0]&&NOW.min<r[1]) open=r; else if(!next&&NOW.min<r[0]) next=r; });
    if(open){ txt="<strong>Abierto ahora</strong> · cierra a las "+hm(open[1]); }
    else{
      el.classList.add("closed");
      if(next){ txt="<strong>Cerrado</strong> · abrimos hoy a las "+hm(next[0]); }
      else{ for(var i=1;i<8;i++){var d=(dow+i)%7; if(SCHEDULE[d].length){ txt="<strong>Cerrado</strong> · abrimos "+(i===1?"mañana":"el "+DAYS_ES[d])+" a las "+hm(SCHEDULE[d][0][0]); break;} } }
    }
    $("#openTxt").innerHTML=(txt?txt+" · ":"")+scheduleSummary();
    $("#hours").innerHTML=[1,2,3,4,5,6,0].map(function(d){
      return '<div data-d="'+d+'"'+(d===dow?' class="today"':'')+'><dt>'+DAYS_CAP[d]+'</dt><dd>'+(SCHEDULE[d].length?SCHEDULE[d].map(function(r){return hm(r[0])+"–"+hm(r[1]);}).join(" · "):"Cerrado")+'</dd></div>';
    }).join("");
  })();

  // ---- Servicios ----
  var CATS=[],SVC={},SVC_LIST=[];
  (C.servicios||[]).forEach(function(c){
    var items=(c.items||[]).filter(function(s){return s.mostrar!==false;});
    if(!items.length) return;
    var cat={id:c.id,label:c.categoria,sub:c.subtitulo||"",items:[]};
    items.forEach(function(s){
      var num=typeof s.precio==="number"?s.precio:(parseInt(String(s.precio).replace(/[^\d]/g," ").trim(),10)||null);
      var label=typeof s.precio==="number"?s.precio+" €":String(s.precio||"");
      var o={id:s.id,cat:c.id,name:s.nombre,dur:s.duracion||null,detail:s.detalle||"",num:num,label:label,consult:!/\d/.test(label)};
      SVC[o.id]=o;SVC_LIST.push(o);cat.items.push(o);
    });
    CATS.push(cat);
  });

  // ---- Promo (se oculta sola al día siguiente de "hasta") ----
  var P=C.promo||{};
  var promoOn=!!(P.mostrar&&P.precio&&(!P.hasta||NOW.iso<=P.hasta));
  var promoIds=promoOn?(P.servicios||[]):[];
  function priceOf(s){ return promoIds.indexOf(s.id)>-1 ? {label:P.precio,promo:true} : {label:s.label,promo:false}; }
  (function(){
    if(!promoOn) return;
    var month=P.hasta?MONTHS[+P.hasta.slice(5,7)-1]:"";
    var t=esc(P.titulo||""),k=t.lastIndexOf(" y ");
    $("#promo-t").innerHTML=k>-1?t.slice(0,k+3)+"<em>"+t.slice(k+3)+"</em>":t;
    $("#promoEyebrow").textContent="Promo del mes"+(month?" · "+month.charAt(0).toUpperCase()+month.slice(1):"");
    $("#promoPrice").textContent=P.precio;
    var until=P.hasta?" Válida hasta el "+(+P.hasta.slice(8,10))+" de "+month+", no lo dejes para el último día.":"";
    $("#promoTxt").textContent=(P.texto||"")+until;
    if(promoIds[0]) $("#promoBtn").setAttribute("data-book",promoIds[0]);
    $("#stickerPromoPrice").textContent=P.precio;
    $("#stickerPromoTxt").textContent="Promo"+(month?" de "+month:"");
    $("#promo").hidden=false; $("#stickerPromo").hidden=false;
  })();

  // ---- Pegatina "Desde X €": mínimo real de la depilación facial ----
  (function(){
    var cat=CATS.filter(function(c){return c.id==="dep-facial";})[0];
    var el=$("#stickerFrom");
    var nums=cat?cat.items.map(function(s){return s.num;}).filter(function(n){return n!=null;}):[];
    if(!nums.length){ el.hidden=true; return; }
    el.innerHTML="<b>Desde "+Math.min.apply(null,nums)+" €</b>Cejas y depilación facial";
  })();

  // ---- Carta ----
  (function(){
    var tabs=$("#tabs"),menu=$("#menu");
    menu.innerHTML=CATS.map(function(c){
      return '<div class="menu-cat" id="cat-'+c.id+'" role="tabpanel" aria-labelledby="tab-'+c.id+'"><h3>'+esc(c.label)+(c.sub?' <small>'+esc(c.sub)+'</small>':'')+'</h3>'+
        c.items.map(function(s){
          var meta=[s.dur?s.dur+" min":"",s.detail].filter(Boolean).join(" · ");
          return '<div class="svc"><span class="svc-name">'+esc(s.name)+'</span>'+(meta?'<span class="svc-meta">'+esc(meta)+'</span>':'')+'<span class="svc-price">'+esc(s.label)+'</span><a class="btn btn-ghost" href="#reserva" data-book="'+esc(s.id)+'" aria-label="Reservar '+esc(s.name)+'">Reservar</a></div>';
        }).join("")+'</div>';
    }).join("");
    CATS.forEach(function(c,i){
      var b=document.createElement("button");
      b.className="tab";b.type="button";b.setAttribute("role","tab");b.id="tab-"+c.id;b.textContent=c.label;
      b.setAttribute("aria-selected",i===0?"true":"false");b.setAttribute("aria-controls","cat-"+c.id);
      $("#cat-"+c.id).hidden=i!==0;
      b.addEventListener("click",function(){
        $$(".tab",tabs).forEach(function(t){t.setAttribute("aria-selected","false");});
        b.setAttribute("aria-selected","true");
        CATS.forEach(function(x){$("#cat-"+x.id).hidden=x.id!==c.id;});
      });
      tabs.appendChild(b);
    });
  })();

  // ---- Galería ----
  $$("#galTabs .tab").forEach(function(b){
    b.addEventListener("click",function(){
      $$("#galTabs .tab").forEach(function(t){t.setAttribute("aria-pressed","false");});
      b.setAttribute("aria-pressed","true");
      var f=b.dataset.f;
      $$("#gallery figure").forEach(function(fg){fg.hidden=!(f==="all"||fg.dataset.c===f);});
    });
  });

  // ---- Instagram desde config ----
  if(C.instagram) $$("[data-ig]").forEach(function(a){a.href=C.instagram;});

  // ================= RESERVAS =================
  function waUrl(text){ return "https://wa.me/"+TEL+"?text="+encodeURIComponent(text); }
  function waTextFor(id){
    var s=id&&SVC[id];
    if(!s) return "Hola Erika, quería pedir cita";
    var p=priceOf(s);
    var price=p.promo?p.label+", promo":(s.consult?"":p.label);
    return "Hola Erika, quería pedir cita para: "+s.name+(price?" ("+price+")":"");
  }
  var params=new URLSearchParams(location.search);
  var MODE=(params.get("reservas")||(C.reservas&&C.reservas.modo)||"whatsapp").toLowerCase()==="booksy"?"booksy":"whatsapp";
  var BOOKSY_URL=(C.reservas&&C.reservas.booksyUrl)||"";

  function applyMode(){
    $$("[data-mode]").forEach(function(el){el.hidden=el.getAttribute("data-mode")!==MODE;});
    $$("[data-book]").forEach(function(a){
      var id=a.getAttribute("data-book");
      if(MODE==="whatsapp"){ a.href=waUrl(waTextFor(id)); a.target="_blank"; a.rel="noopener"; }
      else if(BOOKSY_URL){ a.href=BOOKSY_URL; a.target="_blank"; a.rel="noopener"; }
      else { a.href="#reserva"; a.removeAttribute("target"); }
    });
    $$("[data-wa]").forEach(function(a){ a.href=waUrl(a.getAttribute("data-wa")==="info"?"Hola Erika, quería pedir información":"Hola Erika, quería pedir cita"); });
    $$("[data-set-mode]").forEach(function(b){b.setAttribute("aria-pressed",b.getAttribute("data-set-mode")===MODE?"true":"false");});
  }
  document.addEventListener("click",function(e){
    var a=e.target.closest&&e.target.closest("[data-book]");
    if(!a||MODE!=="booksy"||BOOKSY_URL) return;
    e.preventDefault(); openSheet(a.getAttribute("data-book"));
  });

  // Interruptor para la presentación (?demo=1)
  if(params.get("demo")==="1"){
    $("#demoSwitch").hidden=false;
    $$("[data-set-mode]").forEach(function(b){
      b.addEventListener("click",function(){
        MODE=b.getAttribute("data-set-mode");
        if(!$("#sheet").hidden) closeSheet();
        applyMode();
        params.set("reservas",MODE);
        try{history.replaceState(null,"",location.pathname+"?"+params.toString()+location.hash);}catch(err){}
      });
    });
  }

  // ---- Próximo hueco (tarjeta de ejemplo del modo booksy) ----
  (function(){
    var d=NOW.date,m=NOW.min+60;
    for(var i=0;i<8;i++){
      var day=new Date(d);day.setDate(d.getDate()+i);
      var rs=SCHEDULE[day.getDay()]||[];
      for(var k=0;k<rs.length;k++){
        var t=Math.max(rs[k][0], i===0?Math.ceil(m/30)*30:0);
        if(t+45<=rs[k][1]){ $("#nextSlot").textContent=(i===0?"Hoy":i===1?"Mañana":DAYS_CAP[day.getDay()])+" · "+hm(t); return; }
      }
    }
  })();

  // ---- Vista de ejemplo de la agenda (modo booksy sin booksyUrl) ----
  var sheet=$("#sheet"),card=$(".sheet-card",sheet),lastFocus=null;
  var ag={step:1,svc:null,cat:CATS[0]&&CATS[0].id,date:null,time:null,week:0};
  var agBody=$("#agBody"),agNext=$("#agNext"),agBack=$("#agBack");
  function ds(d){return d.getFullYear()+"-"+(d.getMonth()+1)+"-"+d.getDate();}
  function addDays(d,n){var x=new Date(d);x.setDate(x.getDate()+n);return x;}
  function monday(d){var x=new Date(d);x.setDate(x.getDate()-((x.getDay()+6)%7));return x;}
  function hash(s){var h=2166136261;for(var i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619);}return (h>>>0)%100;}
  function durOf(id){return (SVC[id]&&SVC[id].dur)||60;}
  function slotsFor(d,dur){
    var out=[],today=ds(d)===ds(NOW.date);
    (SCHEDULE[d.getDay()]||[]).forEach(function(r){
      for(var t=r[0];t+dur<=r[1];t+=30) out.push({t:t,busy:hash(ds(d)+"|"+t)<34||(today&&t<=NOW.min+30)});
    });
    return out;
  }
  function freeCount(d){return slotsFor(d,durOf(ag.svc)).filter(function(s){return !s.busy;}).length;}
  function fmtDate(d){return DAYS_ES[d.getDay()]+" "+d.getDate()+" de "+MONTHS[d.getMonth()];}
  function agFootUpdate(){
    $("#agFoot").hidden=ag.step===5;
    agBack.hidden=ag.step===1;
    agNext.disabled=!((ag.step===1&&ag.svc)||(ag.step===2&&ag.date)||(ag.step===3&&ag.time!==null)||ag.step===4);
    agNext.textContent=ag.step===4?"Confirmar cita":"Siguiente";
    $("#sheetWa").href=waUrl(waTextFor(ag.svc));
  }
  function pick(sel,b){ $$(sel,agBody).forEach(function(x){x.setAttribute("aria-pressed",x===b?"true":"false");}); agFootUpdate(); }
  function agRender(focus){
    $$("#agSteps li").forEach(function(li,i){li.classList.toggle("active",i+1===ag.step);li.classList.toggle("done",i+1<ag.step);});
    $("#agBar").style.width=(Math.min(ag.step,4)/4*100)+"%";
    agFootUpdate();
    var h="",s=ag.svc&&SVC[ag.svc];
    if(ag.step===1){
      h='<div class="pane"><h3>¿Qué te apetece?</h3><div class="tabs" role="group" aria-label="Categoría">'+
        CATS.map(function(c){return '<button type="button" class="tab" data-acat="'+c.id+'" aria-pressed="'+(c.id===ag.cat)+'">'+esc(c.label)+'</button>';}).join("")+
        '</div><div class="opt-list">'+
        SVC_LIST.filter(function(x){return x.cat===ag.cat;}).map(function(x){
          var p=priceOf(x);
          return '<button type="button" class="opt" data-asvc="'+x.id+'" aria-pressed="'+(ag.svc===x.id)+'"><b>'+esc(x.name)+'</b><small>'+(x.dur?x.dur+" min":"Duración a confirmar")+(p.promo?" · ✦ promo":"")+'</small><span class="p">'+esc(p.label)+'</span></button>';
        }).join("")+'</div></div>';
    }
    if(ag.step===2){
      var m=addDays(monday(NOW.date),ag.week*7),end=addDays(m,6);
      var lbl=m.getMonth()===end.getMonth()?m.getDate()+"–"+end.getDate()+" "+MONTHS[m.getMonth()]:m.getDate()+" "+MONTHS[m.getMonth()].slice(0,3)+" – "+end.getDate()+" "+MONTHS[end.getMonth()].slice(0,3);
      h='<div class="pane"><h3>¿Qué día te viene bien?</h3><div class="week-nav"><button type="button" class="icon-btn" data-week="-1" aria-label="Semana anterior" '+(ag.week<=0?"disabled":"")+'>‹</button><strong>'+lbl+'</strong><button type="button" class="icon-btn" data-week="1" aria-label="Semana siguiente" '+(ag.week>=3?"disabled":"")+'>›</button></div><div class="days">';
      for(var i=0;i<7;i++){
        var d=addDays(m,i),closed=!SCHEDULE[d.getDay()].length,past=d<NOW.date,free=(!closed&&!past)?freeCount(d):0,dis=closed||past||free===0;
        var em=closed?"Cerrado":past?"":(free===0?"Completo":(free<=3?"Últimos":free+" libres"));
        h+='<button type="button" class="day" data-date="'+ds(d)+'" '+(dis?"disabled":"")+' aria-pressed="'+(!!ag.date&&ds(ag.date)===ds(d))+'" aria-label="'+fmtDate(d)+(dis?", no disponible":", "+free+" huecos libres")+'"><small>'+DAYS_SHORT[d.getDay()]+'</small><b>'+d.getDate()+'</b><em>'+em+'</em></button>';
      }
      h+='</div><p class="hint">'+esc(s.name)+(s.dur?" · "+s.dur+" min":"")+'</p></div>';
    }
    if(ag.step===3){
      var sl=slotsFor(ag.date,durOf(ag.svc));
      var grp=function(t,arr){ if(!arr.length)return ""; return '<div class="slot-group"><h4>'+t+'</h4><div class="slots">'+arr.map(function(x){return '<button type="button" class="slot" data-t="'+x.t+'" '+(x.busy?'disabled aria-label="'+hm(x.t)+', ocupado"':'')+' aria-pressed="'+(ag.time===x.t)+'">'+hm(x.t)+'</button>';}).join("")+'</div></div>'; };
      h='<div class="pane"><h3>Elige la hora</h3><p class="hint">'+fmtDate(ag.date).replace(/^./,function(c){return c.toUpperCase();})+'</p>'+grp("Mañana",sl.filter(function(x){return x.t<840;}))+grp("Tarde",sl.filter(function(x){return x.t>=840;}))+'<div class="legend"><span><i></i>Libre</span><span><i class="b"></i>Ocupado</span></div></div>';
    }
    if(ag.step===4){
      var p=priceOf(s);
      h='<div class="pane"><h3>Revisa y confirma</h3><dl class="summary"><div><dt>Servicio</dt><dd>'+esc(s.name)+'</dd></div><div><dt>Día</dt><dd>'+fmtDate(ag.date)+'</dd></div><div><dt>Hora</dt><dd>'+hm(ag.time)+(s.dur?" – "+hm(ag.time+s.dur):"")+'</dd></div><div class="total"><dt>Precio</dt><dd>'+esc(p.label)+(p.promo?" · promo":"")+'</dd></div></dl><p class="hint">En Booksy la clienta confirma con su cuenta y recibe un recordatorio el día antes.</p></div>';
    }
    if(ag.step===5){
      h='<div class="pane done-pane"><div class="burst" aria-hidden="true">✦</div><h3>¡Cita confirmada!</h3><p class="lead" style="margin:0 auto">'+fmtDate(ag.date).replace(/^./,function(c){return c.toUpperCase();})+' a las <strong>'+hm(ag.time)+'</strong> · '+esc(s.name)+'</p><p class="hint">Así lo vería tu clienta. En esta vista de ejemplo no se ha reservado ninguna cita.</p><button type="button" class="btn btn-ghost" id="agAgain">Probar otra reserva</button></div>';
    }
    agBody.innerHTML=h;
    if(focus){var f=agBody.querySelector("h3");if(f){f.setAttribute("tabindex","-1");f.focus({preventScroll:true});} card.scrollTop=0;}
  }
  agBody.addEventListener("click",function(e){
    var b=e.target.closest("button"); if(!b||b.disabled) return;
    if(b.dataset.acat){ag.cat=b.dataset.acat;agRender();}
    // al elegir no se redibuja el panel (evita que parpadee): solo se marca la opción
    else if(b.dataset.asvc){ if(ag.svc!==b.dataset.asvc){ag.date=null;ag.time=null;} ag.svc=b.dataset.asvc; pick("[data-asvc]",b); }
    else if(b.dataset.week){ag.week+=+b.dataset.week;agRender();}
    else if(b.dataset.date){var p=b.dataset.date.split("-");ag.date=new Date(+p[0],+p[1]-1,+p[2]);ag.time=null;pick("[data-date]",b);}
    else if(b.dataset.t){ag.time=+b.dataset.t;pick("[data-t]",b);}
    else if(b.id==="agAgain"){ag.step=1;ag.svc=null;ag.date=null;ag.time=null;agRender(true);}
  });
  agNext.addEventListener("click",function(){ if(!agNext.disabled){ag.step++;agRender(true);} });
  agBack.addEventListener("click",function(){ if(ag.step>1){ag.step--;agRender(true);} });

  function openSheet(id){
    lastFocus=document.activeElement;
    ag.date=null;ag.time=null;ag.week=0;
    if(id&&SVC[id]){ag.svc=id;ag.cat=SVC[id].cat;ag.step=2;} else {ag.svc=null;ag.step=1;}
    agRender();
    sheet.hidden=false; document.documentElement.classList.add("lock");
    requestAnimationFrame(function(){sheet.classList.add("open");card.focus();});
  }
  function closeSheet(){
    sheet.classList.remove("open"); document.documentElement.classList.remove("lock");
    setTimeout(function(){sheet.hidden=true;},reduceMotion?0:300);
    if(lastFocus&&lastFocus.focus)lastFocus.focus();
  }
  $$("[data-close]",sheet).forEach(function(b){b.addEventListener("click",closeSheet);});
  document.addEventListener("keydown",function(e){if(e.key==="Escape"&&!sheet.hidden)closeSheet();});

  applyMode();

  // ---- Opiniones ----
  (function(){
    var R=(C.resenas||[]).filter(function(r){return r&&r.texto;}),box=$("#revBox");
    if(R.length){
      $("#rev-t").textContent="Así se van mis clientas";
      $("#revLead").hidden=true;
      // las copias (dup) solo sirven para que el desplazamiento sea continuo: no se leen dos veces
      var revHtml=function(r,dup){return '<article class="rev'+(dup?' dup':'')+'"'+(dup?' aria-hidden="true"':'')+'><p>“'+esc(r.texto)+'”</p><footer>'+esc(r.nombre||"")+(r.servicio?" · "+esc(r.servicio):"")+'</footer></article>';};
      var rows=R.length>=2?[R.filter(function(_,i){return i%2===0;}),R.filter(function(_,i){return i%2===1;})]:[R];
      box.innerHTML='<div class="rev-rows" aria-label="Opiniones de clientas">'+rows.map(function(row,i){
        var list=[]; while(list.length<4){row.forEach(function(r){list.push(r);});}
        var first=list.map(function(r,j){return revHtml(r,j>=row.length);}).join("");
        var second=list.map(function(r){return revHtml(r,true);}).join("");
        return '<div class="rev-row'+(i?' rev-back':'')+'">'+first+second+'</div>';
      }).join("")+'</div>';
    } else {
      box.innerHTML='<div class="rev-cta reveal">'+(C.googleUrl
        ? '<p>Si ya has venido, cuéntanos qué tal en Google. Solo lleva un minuto y nos ayuda muchísimo.</p><a class="btn" href="'+esc(C.googleUrl)+'" target="_blank" rel="noopener">Dejar mi opinión en Google <span class="spark" aria-hidden="true">✦</span></a>'
        : '<p>Mientras tanto, en Instagram puedes ver los últimos trabajos y contarnos qué tal te fue.</p><a class="btn btn-ghost" href="'+esc(C.instagram||"https://www.instagram.com/glow.by.erika/")+'" target="_blank" rel="noopener">Seguir en Instagram</a>')+'</div>';
    }
  })();

  // ---- Datos estructurados para Google (desde config) ----
  (function(){
    var map={1:"Monday",2:"Tuesday",3:"Wednesday",4:"Thursday",5:"Friday",6:"Saturday",0:"Sunday"},spec=[];
    [1,2,3,4,5,6,0].forEach(function(d){SCHEDULE[d].forEach(function(r){spec.push({"@type":"OpeningHoursSpecification","dayOfWeek":map[d],"opens":(hm(r[0]).length<5?"0":"")+hm(r[0]),"closes":(hm(r[1]).length<5?"0":"")+hm(r[1])});});});
    var data={"@context":"https://schema.org","@type":"BeautySalon","name":"Glow by Erika","url":C.urlBase||location.origin+"/",
      "image":(C.urlBase||"")+"img/og-glowbyerika.jpg","telephone":"+"+TEL,"priceRange":"€",
      "address":{"@type":"PostalAddress","streetAddress":"Carrer de la Pau, 2","addressLocality":"Catarroja","addressRegion":"Valencia","postalCode":"46470","addressCountry":"ES"},
      "openingHoursSpecification":spec,"sameAs":[C.instagram].filter(Boolean)};
    var s=document.createElement("script");s.type="application/ld+json";s.textContent=JSON.stringify(data);document.head.appendChild(s);
  })();

  // ---- Copiar teléfono ----
  $("#copyTel").addEventListener("click",function(){
    var b=this,txt=$(".phone strong").textContent;
    function done(){b.textContent="Copiado ✦";setTimeout(function(){b.textContent="Copiar";},1800);}
    function sel(){var r=document.createRange();r.selectNodeContents($(".phone strong"));var s=getSelection();s.removeAllRanges();s.addRange(r);}
    try{navigator.clipboard.writeText(txt).then(done,sel);}catch(e){sel();}
  });

  // ---- Mapa bajo demanda ----
  $("#loadMap").addEventListener("click",function(){
    var f=document.createElement("iframe");
    f.title="Mapa: Carrer de la Pau 2, Catarroja";f.loading="lazy";f.referrerPolicy="no-referrer-when-downgrade";
    f.src="https://www.google.com/maps?q=Carrer%20de%20la%20Pau%202%2C%2046470%20Catarroja%2C%20Valencia&z=17&output=embed";
    $("#map").appendChild(f);$(".map-cover").hidden=true;
  });

  // ---- Nav, botón flotante y animaciones ----
  var nav=$("#nav"),fab=$("#fab"),heroEnd=$(".hero"),bk=$("#reserva"),bkVisible=false;
  function onScroll(){
    nav.classList.toggle("scrolled",window.scrollY>8);
    fab.classList.toggle("show",heroEnd.getBoundingClientRect().bottom<0&&!bkVisible);
  }
  window.addEventListener("scroll",onScroll,{passive:true});
  if("IntersectionObserver" in window){
    new IntersectionObserver(function(es){es.forEach(function(e){bkVisible=e.isIntersecting;});onScroll();},{threshold:.15}).observe(bk);
    var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add("in");io.unobserve(e.target);}});},{rootMargin:"0px 0px -8% 0px"});
    $$(".reveal").forEach(function(el){io.observe(el);});
  }
  onScroll();
})();
