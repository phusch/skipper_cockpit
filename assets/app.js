

const ARTEMIS_PROFILE={
  name:"Artemis",type:"Aquanaut Andante 400 AC Pilothouse",
  length:12.30,beam:3.85,draft:1.15,airDraft:4.15,headroom:2.00,berths:6,
  engine:"Volvo D3 110 PK",fuelMin:6,fuelMax:8,fuelTank:500,waterTank:500,wasteTank:500
};
function getShipProfile(){
  try{
    const saved=JSON.parse(localStorage.getItem("fsc_ship_profile")||"null");
    return saved?{...ARTEMIS_PROFILE,...saved}:{...ARTEMIS_PROFILE};
  }catch(e){return {...ARTEMIS_PROFILE}}
}
function setProfileInputs(p){
  shipName.value=p.name;shipType.value=p.type;shipLength.value=p.length;shipBeam.value=p.beam;shipDraft.value=p.draft;shipAirDraft.value=p.airDraft;
  shipHeadroom.value=p.headroom;shipBerths.value=p.berths;shipEngine.value=p.engine;shipFuelMin.value=p.fuelMin;shipFuelMax.value=p.fuelMax;
  shipFuelTank.value=p.fuelTank;shipWaterTank.value=p.waterTank;shipWasteTank.value=p.wasteTank;
}
function profileFromInputs(){
  return {name:shipName.value.trim()||"Boot",type:shipType.value.trim()||"—",
    length:Number(shipLength.value)||0,beam:Number(shipBeam.value)||0,draft:Number(shipDraft.value)||0,airDraft:Number(shipAirDraft.value)||0,
    headroom:Number(shipHeadroom.value)||0,berths:Number(shipBerths.value)||0,engine:shipEngine.value.trim()||"—",
    fuelMin:Number(shipFuelMin.value)||0,fuelMax:Number(shipFuelMax.value)||0,fuelTank:Number(shipFuelTank.value)||0,
    waterTank:Number(shipWaterTank.value)||0,wasteTank:Number(shipWasteTank.value)||0};
}
function renderShipProfile(p){
  shipHeroName.textContent=p.name;shipHeroType.textContent=p.type;
  profileStatusChip.textContent=`${p.name.toUpperCase()} AKTIV`;
  shipFacts.innerHTML=[
    ["Länge",`${p.length.toFixed(2)} m`],["Breite",`${p.beam.toFixed(2)} m`],["Tiefgang",`${p.draft.toFixed(2)} m`],["Höhe",`${p.airDraft.toFixed(2)} m`],
    ["Motor",p.engine],["Verbrauch",`${p.fuelMin}-${p.fuelMax} l/h`],["Diesel",`${p.fuelTank} l`],["Wasser",`${p.waterTank} l`]
  ].map(x=>`<div class="shipFact"><small>${esc(x[0])}</small><strong>${esc(x[1])}</strong></div>`).join("");
}
function saveProfile(){
  const p=profileFromInputs();localStorage.setItem("fsc_ship_profile",JSON.stringify(p));renderShipProfile(p);
  profileStatusChip.textContent="GESPEICHERT";setTimeout(()=>profileStatusChip.textContent=`${p.name.toUpperCase()} AKTIV`,1200);
}
function resetProfile(){
  localStorage.setItem("fsc_ship_profile",JSON.stringify(ARTEMIS_PROFILE));setProfileInputs(ARTEMIS_PROFILE);renderShipProfile(ARTEMIS_PROFILE);
}

let currentDay=1; const maps={}; const nauticalLayers={}; let userMarker=null; let currentUserPos=null; const scannedNautic={};
function esc(s){return String(s).replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]));}
function bearing(a,b){const lat1=a[0]*Math.PI/180,lat2=b[0]*Math.PI/180,dLon=(b[1]-a[1])*Math.PI/180;const y=Math.sin(dLon)*Math.cos(lat2),x=Math.cos(lat1)*Math.sin(lat2)-Math.sin(lat1)*Math.cos(lat2)*Math.cos(dLon);return(Math.atan2(y,x)*180/Math.PI+360)%360}
function arrowIcon(deg){return L.divIcon({className:'',html:`<div class="route-arrow" style="transform:rotate(${deg}deg)">➤</div>`,iconSize:[20,20],iconAnchor:[10,10]})}
function waypointIcon(type,label){const cls=type==='start'?' startMarker':type==='finish'?' finishMarker':'';const sym=type==='start'?'🚩':type==='finish'?'🏁':type==='city'?'🏘️':type==='water'?'⛵':type==='mill'?'🌬️':'•';return L.divIcon({className:'',html:`<div class="waypoint${cls}"><div class="wpIcon">${sym}</div><div class="wpLabel">${esc(label)}</div></div>`,iconSize:[180,34],iconAnchor:[15,17]})}
function addDirectionArrows(m,pts){for(let n=1;n<=9;n++){const idx=Math.floor((pts.length-2)*n/10),a=pts[idx],b=pts[Math.min(idx+3,pts.length-1)];L.marker(a,{icon:arrowIcon(bearing(a,b)),interactive:false,zIndexOffset:800}).addTo(m)}}
function initMap(day){if(maps[day]){setTimeout(()=>maps[day].invalidateSize(),40);return}const d=FSC_ROUTES[String(day)],pts=d.points.map(p=>[p[0],p[1]]),m=L.map(`map${day}`,{zoomControl:true,attributionControl:true,preferCanvas:true});maps[day]=m;L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:18,attribution:'&copy; OpenStreetMap-Mitwirkende'}).addTo(m);L.polyline(pts,{color:'#fff',weight:10,opacity:.95}).addTo(m);L.polyline(pts,{color:'#078ca2',weight:6,opacity:1}).addTo(m);addDirectionArrows(m,pts);L.marker(pts[0],{icon:waypointIcon('start','Start'),zIndexOffset:1000}).addTo(m);L.marker(pts[pts.length-1],{icon:waypointIcon('finish','Ziel'),zIndexOffset:1000}).addTo(m);(d.landmarks||[]).forEach(w=>L.marker([w[2],w[3]],{icon:waypointIcon(w[0],w[1]),zIndexOffset:900}).addTo(m));m.fitBounds(L.latLngBounds(pts),{padding:[60,60]})}
function setScreen(name){document.querySelectorAll('.navbtn').forEach(b=>b.classList.toggle('active',b.dataset.screen===name));document.querySelectorAll('.screen').forEach(s=>s.classList.toggle('active',s.id===`screen-${name}`));if(name==='cockpit')setTimeout(()=>initMap(currentDay),40)}
function renderDay(day){currentDay=Number(day);const d=FSC_ROUTES[String(day)];dayKicker.textContent=`TAG ${day} · ${d.date}`;routeTitle.textContent=d.title;subtitle.textContent=d.subtitle;topDay.textContent=`${day} / 7`;topTime.textContent=d.plan_time;topKm.textContent=`${d.km.toFixed(1)} km`;metricKm.textContent=`${d.km.toFixed(1)} km`;metricTime.textContent=d.plan_time;metricPts.textContent=d.count;routeText.textContent=d.route_text;nightText.textContent=d.night;watersText.textContent=(d.waters||[]).join(' · ');
skipperPassages.innerHTML=(d.passages||[]).map(p=>`<div class="passage ${p[0]}"><strong>${esc(p[1])}</strong>${esc(p[2])}</div>`).join('');
landgangList.innerHTML=(d.landgang||[]).map(x=>`<li>⚓ ${esc(x)}</li>`).join('');
if(d.nautic){
  nautikFlag.textContent=d.nautic.level==='warning'?'WARNUNG':d.nautic.level==='attention'?'ACHTUNG':'NAUTIK';
  nautikFlag.className='nautikFlag '+(d.nautic.level||'info');
  nautikTitle.textContent=d.nautic.title;
  nautikItems.innerHTML=(d.nautic.items||[]).map(x=>`<li>${esc(x)}</li>`).join('');
  nautikOfficial.textContent=d.nautic.official||'';
}
if(typeof nautikRouteName!=='undefined')nautikRouteName.textContent=d.title;
if(typeof nextNauticCard!=='undefined')updateNextNautic();
if(d.brief){
  briefCharacter.textContent=d.brief.character;
  briefSummary.textContent=d.brief.summary;
  briefReserve.textContent=d.brief.reserve;
  briefFocus.innerHTML=(d.brief.focus||[]).map(x=>`<span>${esc(x)}</span>`).join('');
}
gpxFile.textContent=d.file;gpxOpen.href=`routes/${encodeURIComponent(d.file)}`;gpxDownload.href=`routes/${encodeURIComponent(d.file)}`;gpxDownload.download=d.file;daySelect.value=day;decisionWeather.hidden=d.decision!=='weather';decisionTime.hidden=d.decision!=='time';document.querySelectorAll('.daymap').forEach(x=>x.hidden=true);document.querySelector(`#map${day}`).hidden=false;initMap(day)}
document.querySelectorAll('.navbtn').forEach(b=>b.addEventListener('click',()=>setScreen(b.dataset.screen)));daySelect.addEventListener('change',e=>{setScreen('cockpit');renderDay(e.target.value)});document.querySelectorAll('[data-day]').forEach(b=>b.addEventListener('click',()=>{setScreen('cockpit');renderDay(b.dataset.day)}));document.querySelectorAll('.choice').forEach(c=>c.addEventListener('click',()=>{c.parentElement.querySelectorAll('.choice').forEach(x=>x.classList.remove('active'));c.classList.add('active')}));
function havKm(a,b){const R=6371,la1=a[0]*Math.PI/180,la2=b[0]*Math.PI/180,dla=(b[0]-a[0])*Math.PI/180,dlo=(b[1]-a[1])*Math.PI/180;const h=Math.sin(dla/2)**2+Math.cos(la1)*Math.cos(la2)*Math.sin(dlo/2)**2;return 2*R*Math.asin(Math.sqrt(h))}
function minDistToRoute(lat,lon,pts){let best=Infinity;for(let i=0;i<pts.length;i+=Math.max(1,Math.floor(pts.length/180))){best=Math.min(best,havKm([lat,lon],pts[i]))}return best}
function nauticalIcon(kind){return L.divIcon({className:'',html:`<div class="nauticalMarker ${kind==='lock'?'lock':''}">${kind==='lock'?'🔒':'🌉'}</div>`,iconSize:[26,26],iconAnchor:[13,13]})}
async function loadNauticalLayer(){
  const d=FSC_ROUTES[String(currentDay)],pts=d.points.map(p=>[p[0],p[1]]),m=maps[currentDay];if(!m)return;
  if(nauticalLayers[currentDay]){m.removeLayer(nauticalLayers[currentDay]);nauticalLayers[currentDay]=null;nauticalStatus.textContent='Layer ausgeblendet. Öffnungszeiten weiterhin in Waterkaarten prüfen.';loadNautical.textContent='🌉 OSM-BRÜCKEN / SCHLEUSEN LADEN';return}
  loadNautical.disabled=true;nauticalStatus.textContent='Nautische OSM-Objekte werden entlang der GPX-Route gesucht …';
  try{
    const b=L.latLngBounds(pts).pad(.08),s=b.getSouth(),w=b.getWest(),n=b.getNorth(),e=b.getEast();
    const q=`[out:json][timeout:18];(node["waterway"="lock_gate"](${s},${w},${n},${e});way["waterway"="lock_gate"](${s},${w},${n},${e});node["lock"="yes"](${s},${w},${n},${e});way["lock"="yes"](${s},${w},${n},${e});node["bridge"](${s},${w},${n},${e});way["bridge"](${s},${w},${n},${e}););out center tags;`;
    const r=await fetch('https://overpass-api.de/api/interpreter',{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded;charset=UTF-8'},body:'data='+encodeURIComponent(q)});
    if(!r.ok)throw new Error('Overpass '+r.status);const j=await r.json(),group=L.layerGroup();let count=0;
    for(const el of j.elements){
      const lat=el.lat??el.center?.lat,lon=el.lon??el.center?.lon;if(lat==null||lon==null)continue;
      if(minDistToRoute(lat,lon,pts)>.28)continue;
      const kind=(el.tags?.waterway==='lock_gate'||el.tags?.lock==='yes')?'lock':'bridge';
      const name=el.tags?.name||el.tags?.['name:nl']||(kind==='lock'?'Schleuse / Lock':'Brücke');
      L.marker([lat,lon],{icon:nauticalIcon(kind),zIndexOffset:700}).bindPopup(`<strong>${esc(name)}</strong><br>${kind==='lock'?'Schleuse / Lock':'Brücke'}<br><small>OSM-Hinweis – Betriebs-/Öffnungszeit in Waterkaarten verifizieren.</small>`).addTo(group);count++;
    }
    group.addTo(m);nauticalLayers[currentDay]=group;nauticalStatus.textContent=`${count} OSM-Brücken/Schleusen nahe der GPX-Linie eingeblendet. Nicht als Ersatz für Waterkaarten verwenden.`;loadNautical.textContent='🌉 OSM-LAYER AUSBLENDEN';
  }catch(e){nauticalStatus.textContent='Online-Abfrage gerade nicht verfügbar. Für Brücken/Schleusen bitte Waterkaarten verwenden.'}
  finally{loadNautical.disabled=false}
}
function locateMe(){
  if(!navigator.geolocation){gpsStatus.textContent='GPS/Geolocation wird von diesem Browser nicht unterstützt.';return}
  gpsStatus.textContent='GPS-Position wird ermittelt …';
  navigator.geolocation.getCurrentPosition(pos=>{
    const lat=pos.coords.latitude,lon=pos.coords.longitude,m=maps[currentDay],d=FSC_ROUTES[String(currentDay)],pts=d.points.map(p=>[p[0],p[1]]);currentUserPos=[lat,lon];
    if(userMarker&&m.hasLayer(userMarker))m.removeLayer(userMarker);
    const ico=L.divIcon({className:'',html:'<div class="userPos"></div>',iconSize:[18,18],iconAnchor:[9,9]});
    userMarker=L.marker([lat,lon],{icon:ico,zIndexOffset:2000}).addTo(m).bindPopup('Meine aktuelle Position');
    m.panTo([lat,lon]);const off=minDistToRoute(lat,lon,pts);gpsStatus.textContent=`GPS aktiv · Abstand zur geplanten GPX-Linie ca. ${Math.round(off*1000)} m`;updateNextNautic();
  },()=>gpsStatus.textContent='GPS-Position konnte nicht gelesen werden. iPad-Berechtigung prüfen.',{enableHighAccuracy:true,timeout:10000});
}
function renderOverviews(){
  const all=Object.entries(FSC_ROUTES);
  landgangOverview.innerHTML=all.map(([k,d])=>`<article class="card"><h3>TAG ${k} · ${esc(d.title)}</h3><ul class="hintList">${(d.landgang||[]).map(x=>`<li>⚓ ${esc(x)}</li>`).join('')}</ul></article>`).join('');
  nightOverview.innerHTML=all.map(([k,d])=>`<article class="card"><h3>TAG ${k}</h3><strong style="color:#0b315b">${esc(d.night)}</strong><p>${esc(d.title)}</p></article>`).join('');
}
loadNautical.addEventListener('click',loadNauticalLayer);gpsBtn.addEventListener('click',locateMe);


function parseMeters(v){
  if(v==null)return null;const s=String(v).replace(",",".").trim();const m=s.match(/-?\d+(?:\.\d+)?/);if(!m)return null;
  let n=Number(m[0]);if(!Number.isFinite(n))return null;if(/cm\b/i.test(s))n/=100;return n;
}
function shipFit(tags){
  const ship=getShipProfile();
  const height=parseMeters(tags["seamark:bridge:clearance_height"] ?? tags["clearance_height"] ?? (tags.waterway?tags.maxheight:null));
  const depth=parseMeters(tags["maxdraft"] ?? tags["draft"] ?? tags["depth"]);
  const width=parseMeters(tags["maxwidth"] ?? tags["seamark:bridge:clearance_width"]);
  const checks=[];let state="attention";let had=false;
  if(height!=null){had=true;const margin=height-ship.airDraft;checks.push(`Höhe ${height.toFixed(2)} m · Reserve ${margin.toFixed(2)} m`);if(margin<0)state="stop";else if(margin<0.30)state="attention";else state="ok";}
  if(depth!=null){had=true;const margin=depth-ship.draft;checks.push(`Tiefe/Tiefgang ${depth.toFixed(2)} m · Reserve ${margin.toFixed(2)} m`);if(margin<0)state="stop";else if(margin<0.30&&state!=="stop")state="attention";else if(state==="attention"&&height==null)state="ok";}
  if(width!=null){had=true;const margin=width-ship.beam;checks.push(`Breite ${width.toFixed(2)} m · Reserve ${margin.toFixed(2)} m`);if(margin<0)state="stop";else if(margin<0.50&&state!=="stop")state="attention";else if(state==="attention"&&height==null&&depth==null)state="ok";}
  if(!had)checks.push("Keine belastbaren nautischen Maße in OSM – Waterkaarten prüfen");
  return {state,checks};
}
function renderNautikShip(){
  const p=getShipProfile();nautikShipFacts.innerHTML=[
    ["Höhe",`${p.airDraft.toFixed(2)} m`],["Tiefgang",`${p.draft.toFixed(2)} m`],["Breite",`${p.beam.toFixed(2)} m`],["Länge",`${p.length.toFixed(2)} m`]
  ].map(x=>`<div class="shipFact"><small>${esc(x[0])}</small><strong>${esc(x[1])}</strong></div>`).join("");
}

function nearestRouteIndex(lat,lon,pts){
  let bestI=0,best=Infinity;
  for(let i=0;i<pts.length;i++){
    const d=havKm([lat,lon],pts[i]);
    if(d<best){best=d;bestI=i;}
  }
  return {index:bestI,distance:best};
}
function cumulativeRouteKm(pts){
  const cum=[0];
  for(let i=1;i<pts.length;i++)cum.push(cum[i-1]+havKm(pts[i-1],pts[i]));
  return cum;
}
function formatKm(km){
  if(km==null || !Number.isFinite(km))return "—";
  if(km<1)return `${Math.max(0,Math.round(km*1000))} m`;
  return `${km.toFixed(1)} km`;
}
function updateNextNautic(){
  const objs=scannedNautic[currentDay]||[];
  if(!objs.length){
    nextNauticCard.className="nextNautic cardLite";
    nextNauticIcon.textContent="🧭";
    nextNauticName.textContent="Route noch nicht gescannt";
    nextNauticDetail.textContent="Nautik-Scan starten. Mit GPS kann anschließend das nächste Objekt vor dem Boot hervorgehoben werden.";
    nextNauticDistance.textContent="—";
    return;
  }
  let candidate=null,distKm=null;
  if(currentUserPos){
    const d=FSC_ROUTES[String(currentDay)],pts=d.points.map(p=>[p[0],p[1]]),cum=cumulativeRouteKm(pts);
    const me=nearestRouteIndex(currentUserPos[0],currentUserPos[1],pts);
    candidate=objs.find(o=>o.routeIndex>=me.index-2) || null;
    if(candidate){
      distKm=Math.max(0,(candidate.routeKm??cum[candidate.routeIndex])-cum[me.index]);
    }
  }
  if(!candidate){
    candidate=objs[0];
    distKm=candidate.routeKm??null;
  }
  nextNauticCard.className="nextNautic cardLite "+(candidate.fit.state==="stop"?"stop":candidate.fit.state==="attention"?"alert":"");
  nextNauticIcon.textContent=candidate.kind.startsWith("Schleuse")?"🔒":"🌉";
  nextNauticName.textContent=candidate.name;
  nextNauticDetail.textContent=`${candidate.kind} · ${candidate.fit.checks.join(" · ")}`;
  nextNauticDistance.textContent=formatKm(distKm);
  document.querySelectorAll(".nauticObj").forEach(el=>el.classList.toggle("nextUp",Number(el.dataset.routeIndex)===candidate.routeIndex));
}

async function scanNauticalRoute(){
  const d=FSC_ROUTES[String(currentDay)],pts=d.points.map(p=>[p[0],p[1]]);
  scanStatus.textContent="OSM/Overpass wird entlang der aktuellen GPX-Route abgefragt …";scanNautical.disabled=true;
  try{
    const b=L.latLngBounds(pts).pad(.07),s=b.getSouth(),w=b.getWest(),n=b.getNorth(),e=b.getEast();
    const q=`[out:json][timeout:22];(
      node["waterway"="lock_gate"](${s},${w},${n},${e});
      way["waterway"="lock_gate"](${s},${w},${n},${e});
      node["lock"="yes"](${s},${w},${n},${e});
      way["lock"="yes"](${s},${w},${n},${e});
      node["bridge"](${s},${w},${n},${e});
      way["bridge"](${s},${w},${n},${e});
      way["waterway"]["maxheight"](${s},${w},${n},${e});
      way["waterway"]["maxdraft"](${s},${w},${n},${e});
      way["waterway"]["maxwidth"](${s},${w},${n},${e});
      node["seamark:type"="bridge"](${s},${w},${n},${e});
      way["seamark:type"="bridge"](${s},${w},${n},${e});
    );out center tags;`;
    const r=await fetch("https://overpass-api.de/api/interpreter",{method:"POST",headers:{"Content-Type":"application/x-www-form-urlencoded;charset=UTF-8"},body:"data="+encodeURIComponent(q)});
    if(!r.ok)throw new Error("Overpass "+r.status);
    const j=await r.json(),objs=[],seen=new Set(),cum=cumulativeRouteKm(pts);
    for(const el of j.elements){
      const lat=el.lat??el.center?.lat,lon=el.lon??el.center?.lon;if(lat==null||lon==null)continue;
      const near=nearestRouteIndex(lat,lon,pts);if(near.distance>.25)continue;
      const tags=el.tags||{},kind=(tags.waterway==="lock_gate"||tags.lock==="yes")?"Schleuse / Lock":"Brücke / Durchfahrt";
      const name=tags.name||tags["name:nl"]||kind,key=`${Math.round(lat*10000)}:${Math.round(lon*10000)}:${name}`;if(seen.has(key))continue;seen.add(key);
      objs.push({name,kind,fit:shipFit(tags),lat,lon,routeIndex:near.index,routeKm:cum[near.index],offRouteKm:near.distance});
    }
    objs.sort((a,b)=>a.routeIndex-b.routeIndex);
    scannedNautic[currentDay]=objs;
    const counts={ok:0,attention:0,stop:0};objs.forEach(o=>counts[o.fit.state]++);
    scanGreen.textContent=counts.ok;scanYellow.textContent=counts.attention;scanRed.textContent=counts.stop;scanTotal.textContent=objs.length;
    nauticObjectList.innerHTML=objs.length?objs.map(o=>`<div class="nauticObj ${o.fit.state}" data-route-index="${o.routeIndex}">
      <div class="status">${o.fit.state==="ok"?"GRÜN":o.fit.state==="stop"?"ROT":"PRÜFEN"}</div>
      <div><strong>${esc(o.name)}</strong><small>${esc(o.kind)} · OSM-Zusatzdaten</small><div class="routePos">bei ca. ${formatKm(o.routeKm)} ab Tagesstart</div></div>
      <div class="dims">${o.fit.checks.map(esc).join("<br>")}</div></div>`).join("")
      :`<div class="placeholder">Keine OSM-Brücken-/Schleusenobjekte innerhalb ca. 250 m der GPX-Linie gefunden. Waterkaarten bleibt maßgeblich.</div>`;
    scanStatus.textContent=`Scan abgeschlossen. ${objs.length} Objekte sind jetzt in Fahrreihenfolge sortiert. Mit aktivem GPS wird das nächste vorausliegende Objekt hervorgehoben.`;
    updateNextNautic();
  }catch(e){scanStatus.textContent="Online-Nautikscan momentan nicht erreichbar. Keine Auswirkung auf GPX/Karte; bitte Waterkaarten verwenden."}
  finally{scanNautical.disabled=false}
}

window.addEventListener('load',()=>{renderDay(1);renderOverviews();const p=getShipProfile();setProfileInputs(p);renderShipProfile(p);saveShipProfile.addEventListener('click',()=>{saveProfile();renderNautikShip();});resetShipProfile.addEventListener('click',()=>{resetProfile();renderNautikShip();});renderNautikShip();scanNautical.addEventListener('click',scanNauticalRoute);});
