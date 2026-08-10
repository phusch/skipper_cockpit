
const WEATHER_CODES={
  0:["☀️","Klar"],1:["🌤️","Überwiegend klar"],2:["⛅","Teilweise bewölkt"],3:["☁️","Bedeckt"],
  45:["🌫️","Nebel"],48:["🌫️","Reifnebel"],51:["🌦️","Leichter Niesel"],53:["🌦️","Nieselregen"],55:["🌧️","Starker Niesel"],
  61:["🌦️","Leichter Regen"],63:["🌧️","Regen"],65:["🌧️","Starker Regen"],80:["🌦️","Regenschauer"],81:["🌧️","Schauer"],82:["⛈️","Starke Schauer"],
  95:["⛈️","Gewitter"],96:["⛈️","Gewitter mit Hagel"],99:["⛈️","Starkes Gewitter"]
};
let lastWeather=null;
function routeWeatherPoint(day){
  const d=getActiveRoute(day),pts=d.points;
  const p=pts[Math.floor(pts.length/2)];
  return {lat:p[0],lon:p[1],label:d.title};
}
function beaufort(kmh){
  const ms=kmh/3.6;
  const limits=[0.3,1.6,3.4,5.5,8.0,10.8,13.9,17.2,20.8,24.5,28.5,32.7];
  let b=0;while(b<limits.length&&ms>=limits[b])b++;return b;
}
function windDirText(deg){
  if(deg==null)return "—";const dirs=["N","NO","O","SO","S","SW","W","NW"];return `${dirs[Math.round(deg/45)%8]} ${Math.round(deg)}°`;
}
function classifyWeatherRisk(w){
  const gust=w.gust||0,rain=w.rain||0,vis=w.visibility||99999;
  if(gust>=55 || vis<1500)return ["warning","ROT · kritisch prüfen"];
  if(gust>=40 || rain>=4 || vis<4000)return ["attention","GELB · aufmerksam"];
  return ["ok","GRÜN · unauffällig"];
}
async function fetchJson(url){
  const c=new AbortController(),t=setTimeout(()=>c.abort(),15000);
  try{const r=await fetch(url,{signal:c.signal});if(!r.ok)throw new Error("HTTP "+r.status);return await r.json();}finally{clearTimeout(t)}
}
function routeTargetInfo(d){
  const match=d.date&&d.date.match(/(\d{1,2})\.\s*(Aug|Sept)\.\s*2026/),month=match&&match[2]==="Sept"?"09":"08",dayNum=match?String(Number(match[1])).padStart(2,"0"):null;
  const target=dayNum?`2026-${month}-${dayNum}`:null,targetDate=target?new Date(target+"T12:00:00"):null,diffDays=targetDate?Math.ceil((targetDate-new Date())/86400000):0;
  return {target,forecastable:diffDays>=-1&&diffDays<=16};
}
async function loadWeather(){
  const p=routeWeatherPoint(currentDay),d=getActiveRoute(currentDay);
  weatherSummary.textContent="Lädt …";weatherHeroDesc.textContent="Lädt …";
  const {target,forecastable}=routeTargetInfo(d);
  const base=`https://api.open-meteo.com/v1/forecast?latitude=${p.lat}&longitude=${p.lon}&timezone=Europe%2FAmsterdam&current=temperature_2m,weather_code,wind_speed_10m,wind_gusts_10m,wind_direction_10m,precipitation,cloud_cover,visibility&hourly=temperature_2m,weather_code,wind_speed_10m,wind_gusts_10m,wind_direction_10m,precipitation_probability,precipitation,visibility,cloud_cover&daily=temperature_2m_max,temperature_2m_min,sunrise,sunset&forecast_days=16`;
  try{
    const wx=await fetchJson(base),cur=wx.current||{},code=WEATHER_CODES[cur.weather_code]||["🌦️","Wetter"];
    const w={temp:cur.temperature_2m,wind:cur.wind_speed_10m,gust:cur.wind_gusts_10m,dir:cur.wind_direction_10m,rain:cur.precipitation,visibility:cur.visibility,cloud:cur.cloud_cover,code:cur.weather_code};
    lastWeather=w;
    weatherGlyph.textContent=code[0];weatherSummary.textContent=code[1];weatherLocation.textContent=d.title;
    weatherTemp.textContent=w.temp!=null?`${Math.round(w.temp)} °C`:"—";weatherWind.textContent=w.wind!=null?`${Math.round(w.wind)} km/h`:"—";weatherGust.textContent=w.gust!=null?`${Math.round(w.gust)} km/h`:"—";weatherRain.textContent=w.rain!=null?`${w.rain.toFixed(1)} mm`:"—";
    topWeather.textContent=w.temp!=null?`${code[0]} ${Math.round(w.temp)}°`:"—";topWind.textContent=w.wind!=null?`${Math.round(w.wind)} km/h`:"—";
    weatherHeroIcon.textContent=code[0];weatherHeroTemp.textContent=w.temp!=null?`${Math.round(w.temp)} °C`:"—";weatherHeroDesc.textContent=code[1];weatherHeroPlace.textContent=d.title;
    wxWind.textContent=w.wind!=null?`${Math.round(w.wind)} km/h`:"—";wxGust.textContent=w.gust!=null?`${Math.round(w.gust)} km/h`:"—";wxDir.textContent=windDirText(w.dir);wxBft.textContent=w.wind!=null?`${beaufort(w.wind)} Bft`:"—";
    wxRain.textContent=w.rain!=null?`${w.rain.toFixed(1)} mm`:"—";wxVisibility.textContent=w.visibility!=null?`${(w.visibility/1000).toFixed(1)} km`:"—";wxCloud.textContent=w.cloud!=null?`${Math.round(w.cloud)} %`:"—";
    const risk=classifyWeatherRisk(w);
    const riskEl=document.getElementById("weatherRisk");
    riskEl.className=`weatherHeroRisk ${risk[0]}`;
    riskEl.querySelector("strong").textContent=risk[1];
    weatherUpdated.textContent=`Quelle: Open-Meteo · aktualisiert ${new Date().toLocaleTimeString("de-DE",{hour:"2-digit",minute:"2-digit"})}`;
    // Daily target if inside forecast horizon, else current-day daily values.
    let di=0;
    if(forecastable&&target&&wx.daily?.time){const found=wx.daily.time.indexOf(target);if(found>=0)di=found;}
    wxMin.textContent=wx.daily?.temperature_2m_min?.[di]!=null?`${Math.round(wx.daily.temperature_2m_min[di])} °C`:"—";
    wxMax.textContent=wx.daily?.temperature_2m_max?.[di]!=null?`${Math.round(wx.daily.temperature_2m_max[di])} °C`:"—";
    wxSunrise.textContent=wx.daily?.sunrise?.[di]?wx.daily.sunrise[di].slice(11,16):"—";wxSunset.textContent=wx.daily?.sunset?.[di]?wx.daily.sunset[di].slice(11,16):"—";
    // Hourly forecast: target day if available, otherwise next 6 daytime/current hours
    let rows=[];
    if(forecastable&&target&&wx.hourly?.time){
      wx.hourly.time.forEach((t,i)=>{if(t.startsWith(target)&&Number(t.slice(11,13))>=8&&Number(t.slice(11,13))<=20&&Number(t.slice(11,13))%3===0)rows.push(i);});
      forecastWindowNote.textContent=rows.length?`Prognose für ${target}.`:`Der Fahrtag liegt noch außerhalb des verfügbaren Prognosefensters. Aktuell werden Live-Werte angezeigt.`;
    } else {
      const nowIso=new Date().toISOString().slice(0,13);let start=wx.hourly?.time?.findIndex(t=>t>=nowIso);if(start<0)start=0;
      rows=[start,start+2,start+4,start+6,start+8,start+10].filter(i=>i<wx.hourly.time.length);
      forecastWindowNote.textContent=`Der gewählte Fahrtag liegt derzeit noch außerhalb des ca. 16-Tage-Prognosefensters. Die Karten zeigen echte Live-Werte am Routenmittelpunkt; die konkrete Tagesprognose erscheint automatisch näher am Reisetermin.`;
    }
    hourlyForecast.innerHTML=rows.map(i=>{const c=WEATHER_CODES[wx.hourly.weather_code[i]]||["🌦️",""];return `<div class="hourCard"><small>${wx.hourly.time[i].slice(11,16)}</small><strong>${c[0]} ${Math.round(wx.hourly.temperature_2m[i])}°</strong><span>💨 ${Math.round(wx.hourly.wind_speed_10m[i])} km/h</span><span>🌧 ${wx.hourly.precipitation_probability[i]}%</span></div>`}).join("");
    wxRainProb.textContent=rows.length?`${Math.max(...rows.map(i=>wx.hourly.precipitation_probability[i]??0))} %`:"—";
    ijsselmeerWeatherCard.hidden=d.decision!=="weather";
    if(d.decision==="weather")await loadMarineWeather();
  }catch(e){
    console.error("Wetterfehler:",e);
    weatherSummary.textContent="Wetterdaten konnten nicht geladen werden";
    weatherHeroDesc.textContent="Wetterdaten konnten nicht geladen werden";
    weatherUpdated.textContent=`Fehler: ${e && e.message ? e.message : "unbekannt"}`;
    forecastWindowNote.textContent="Bitte Verbindung prüfen und erneut auf „Wetter laden“ tippen. Die übrige App bleibt nutzbar.";
    topWeather.textContent="—";topWind.textContent="—";
  }
}
async function loadMarineWeather(){
  try{
    const url="https://marine-api.open-meteo.com/v1/marine?latitude=52.91&longitude=5.35&timezone=Europe%2FAmsterdam&current=wave_height,wave_direction,wave_period";
    const m=await fetchJson(url),c=m.current||{};
    wxWave.textContent=c.wave_height!=null?`${c.wave_height.toFixed(1)} m`:"—";wxWaveDir.textContent=c.wave_direction!=null?`${Math.round(c.wave_direction)}°`:"—";wxWavePeriod.textContent=c.wave_period!=null?`${c.wave_period.toFixed(1)} s`:"—";
    let s="PRÜFEN";if(c.wave_height!=null){s=c.wave_height<0.4?"RUHIG":c.wave_height<0.8?"AUFMERKSAM":"KRITISCH PRÜFEN";}wxMarineStatus.textContent=s;
  }catch(e){wxMarineStatus.textContent="Marine-Daten nicht erreichbar";}
}

document.querySelectorAll("[data-top-day]").forEach(b=>b.addEventListener("click",()=>{setScreen("cockpit");renderDay(Number(b.dataset.topDay));}));
function syncTopDayButtons(day){document.querySelectorAll("[data-top-day]").forEach(b=>b.classList.toggle("active",Number(b.dataset.topDay)===Number(day)));}


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

let currentDay=1; const maps={}; const routeLayers={}; const nauticalLayers={}; let userMarker=null; let currentUserPos=null; const scannedNautic={};
const ALT_ROUTE_STORAGE="fsc_alternative_routes_v1",ROUTE_CHOICE_STORAGE="fsc_route_choices_v1",ORIGINAL_INFO_STORAGE="fsc_original_route_info_v1",BUILTIN_INFO_DISABLED_STORAGE="fsc_builtin_route_info_disabled_v1";
const ROUTE_PLAN_SPEED_KMH=8,basisWeatherCache={},basisLoading={};
function readStoredObject(key){try{const value=JSON.parse(localStorage.getItem(key)||"{}");return value&&typeof value==="object"?value:{}}catch(e){return {}}}
let alternativeRoutes=readStoredObject(ALT_ROUTE_STORAGE),routeChoices=readStoredObject(ROUTE_CHOICE_STORAGE),originalRouteInfos=readStoredObject(ORIGINAL_INFO_STORAGE),builtInInfoDisabled=readStoredObject(BUILTIN_INFO_DISABLED_STORAGE),activeGpxUrl=null;
function validInfoForRoute(info,day,base){return !!(info&&base&&info.routeFingerprint===routeFingerprint(day,base))}
function builtInInfoForDay(day){
  const route=(window.FSC_BUILTIN_TOUR_INFO?.routes||[]).find(item=>Number(item?.day)===Number(day));if(!route)return null;
  return {day:Number(day),routeFingerprint:route.routeFingerprint,data:route.data||{},generatedAt:route.generatedAt||null,importedAt:null,sources:Array.isArray(route.sources)?route.sources:[],storageSource:"builtin"};
}
function effectiveOriginalRouteInfo(day){
  const key=String(day),base=FSC_ROUTES[key],local=originalRouteInfos[key];if(validInfoForRoute(local,day,base))return {...local,storageSource:"local"};
  if(builtInInfoDisabled[key])return null;const builtIn=builtInInfoForDay(day);return validInfoForRoute(builtIn,day,base)?builtIn:null;
}
function originalRouteWithInfo(day){
  const key=String(day),base=FSC_ROUTES[key],info=effectiveOriginalRouteInfo(day);if(!base||!info)return base;
  const data=info.data||{};return {...base,title:data.title||base.title,subtitle:data.subtitle||base.subtitle,route_text:data.routeText||base.route_text,night:data.night||base.night,waters:data.waters?.length?data.waters:base.waters,passages:data.passages?.length?data.passages:base.passages,landgang:data.landgang?.length?data.landgang:base.landgang,nautic:data.nautic?.title||data.nautic?.items?.length?data.nautic:base.nautic,brief:data.brief?.summary||data.brief?.focus?.length?data.brief:base.brief,originalRouteInfo:info};
}
function getActiveRoute(day){const key=String(day);return routeChoices[key]==="alternative"&&alternativeRoutes[key]?alternativeRoutes[key]:originalRouteWithInfo(day)}
function gpxRouteName(doc,fileName){
  const track=doc.getElementsByTagNameNS("*","trk")[0]||doc.getElementsByTagName("trk")[0];
  const route=doc.getElementsByTagNameNS("*","rte")[0]||doc.getElementsByTagName("rte")[0];
  const parent=track||route,localName=parent&&(parent.getElementsByTagNameNS("*","name")[0]||parent.getElementsByTagName("name")[0]);
  return (localName?.textContent||fileName.replace(/\.gpx$/i,"")||"Waterkaarten-Alternative").trim();
}
function parseGpxAlternative(day,fileName,text){
  const doc=new DOMParser().parseFromString(text,"application/xml");
  if(doc.getElementsByTagName("parsererror").length)throw new Error("Die Datei enthält kein gültiges GPX/XML.");
  let nodes=[...doc.getElementsByTagNameNS("*","trkpt")];
  if(!nodes.length)nodes=[...doc.getElementsByTagNameNS("*","rtept")];
  if(!nodes.length)nodes=[...doc.querySelectorAll("trkpt,rtept")];
  const points=nodes.map(n=>[Number(n.getAttribute("lat")),Number(n.getAttribute("lon"))]).filter(p=>Number.isFinite(p[0])&&Number.isFinite(p[1])&&Math.abs(p[0])<=90&&Math.abs(p[1])<=180);
  if(points.length<2)throw new Error("Die GPX-Datei enthält keine auswertbare Route mit mindestens zwei Punkten.");
  if(points.length>25000)throw new Error("Die GPX-Datei enthält mehr als 25.000 Punkte und ist für die lokale Speicherung zu groß.");
  let km=0;for(let i=1;i<points.length;i++)km+=havKm(points[i-1],points[i]);
  const original=FSC_ROUTES[String(day)],title=gpxRouteName(doc,fileName);
  return {source:"alternative",file:fileName,title,baseTitle:title,subtitle:"Importierte Waterkaarten-Alternative · Basisdaten werden automatisch ergänzt",date:original.date,points,km,count:points.length,plan_time:plannedRouteTime(km),route_text:title,night:"Zielbereich wird automatisch ermittelt",waters:["Gewässerinformationen folgen in Schritt 2b"],landmarks:[],passages:[["info","Waterkaarten-GPX aktiv","Streckenverlauf importiert. Brücken, Sperrungen und Tiefen weiterhin in Waterkaarten prüfen."]],landgang:["Redaktionelle Reiseinformationen folgen in Schritt 2b."],nautic:{level:"info",title:"Importierte Alternativroute",items:["Nautikscan und GPS verwenden automatisch die aktive GPX-Linie.","Waterkaarten bleibt für Navigation und aktuelle Revierdaten maßgeblich."],official:"Alternative lokal aus GPX übernommen"},brief:{character:"ALTERNATIVE",summary:"Die importierte Waterkaarten-Route ist für diesen Fahrtag aktiv.",reserve:"Originalroute bleibt gespeichert und jederzeit auswählbar.",focus:["GPX geprüft","Waterkaarten","Wetter prüfen"]}};
}
function plannedRouteTime(km){
  const total=Math.max(5,Math.round((km/ROUTE_PLAN_SPEED_KMH)*12)*5),hours=Math.floor(total/60),minutes=total%60;
  return hours?`${hours} h ${String(minutes).padStart(2,"0")} min`:`${minutes} min`;
}
function coordLabel(point){return `${Number(point[0]).toFixed(5)}, ${Number(point[1]).toFixed(5)}`}
function delay(ms){return new Promise(resolve=>setTimeout(resolve,ms))}
function alternativeCacheKey(day,d){const a=d.points[0],b=d.points[d.points.length-1];return `${day}:${d.file}:${d.count}:${a[0]}:${a[1]}:${b[0]}:${b[1]}`}
async function reversePlace(point){
  const url=`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${encodeURIComponent(point[0])}&lon=${encodeURIComponent(point[1])}&zoom=14&addressdetails=1&accept-language=de,nl`;
  const data=await fetchJson(url),a=data.address||{};
  return String(a.city||a.town||a.village||a.hamlet||a.municipality||a.locality||data.name||(data.display_name||"").split(",")[0]||"Koordinatenziel").trim();
}
async function fetchBasisWeather(point,d){
  const {target,forecastable}=routeTargetInfo(d);
  const url=`https://api.open-meteo.com/v1/forecast?latitude=${point[0]}&longitude=${point[1]}&timezone=Europe%2FAmsterdam&current=temperature_2m,weather_code,wind_speed_10m,wind_gusts_10m,precipitation,visibility&daily=weather_code,temperature_2m_max,temperature_2m_min,wind_speed_10m_max,wind_gusts_10m_max,precipitation_sum,precipitation_probability_max&forecast_days=16`;
  const wx=await fetchJson(url);let code,temp,wind,gust,rain,visibility,period;
  const di=forecastable&&target&&wx.daily?.time?wx.daily.time.indexOf(target):-1;
  if(di>=0){
    code=wx.daily.weather_code?.[di];const min=wx.daily.temperature_2m_min?.[di],max=wx.daily.temperature_2m_max?.[di];temp=min!=null&&max!=null?`${Math.round(min)}–${Math.round(max)} °C`:"—";wind=wx.daily.wind_speed_10m_max?.[di];gust=wx.daily.wind_gusts_10m_max?.[di];rain=wx.daily.precipitation_sum?.[di];period=`Fahrtag ${target.split("-").reverse().join(".")}`;
  }else{
    const cur=wx.current||{};code=cur.weather_code;temp=cur.temperature_2m!=null?`${Math.round(cur.temperature_2m)} °C`:"—";wind=cur.wind_speed_10m;gust=cur.wind_gusts_10m;rain=cur.precipitation;visibility=cur.visibility;period="Live-Werte aktuell";
  }
  const description=WEATHER_CODES[code]||["🌦️","Wetter"],risk=classifyWeatherRisk({gust,rain,visibility});
  return {headline:`${description[0]} ${description[1]} · ${temp}`,detail:`Wind ${wind!=null?Math.round(wind)+" km/h":"—"} · Böen ${gust!=null?Math.round(gust)+" km/h":"—"} · Regen ${rain!=null?Number(rain).toFixed(1)+" mm":"—"}`,state:risk[0],risk:risk[1],period};
}
function setBasisWeatherCard(kind,value){
  const strong=document.getElementById(`basisWx${kind}`),detail=document.getElementById(`basisWx${kind}Detail`),card=strong.closest("article");
  if(!value){strong.textContent="Wird geladen …";detail.textContent="Wetterdaten werden abgerufen.";card.className="";return}
  if(value.error){strong.textContent="Nicht erreichbar";detail.textContent="Internetverbindung prüfen und erneut aktualisieren.";card.className="attention";return}
  strong.textContent=value.headline;detail.textContent=`${value.detail} · ${value.risk}`;card.className=value.state;
}
function renderAlternativeBasis(d){
  const isAlt=d&&d.source==="alternative";alternativeBasis.hidden=!isAlt;if(!isAlt)return;
  const info=d.autoInfo||{},start=d.points[0],end=d.points[d.points.length-1],key=alternativeCacheKey(currentDay,d),cached=basisWeatherCache[key];
  basisRouteName.textContent=d.title;basisStart.textContent=info.startName||"Wird ermittelt …";basisEnd.textContent=info.endName||"Wird ermittelt …";basisStartCoords.textContent=coordLabel(start);basisEndCoords.textContent=coordLabel(end);basisDistance.textContent=`${d.km.toFixed(1)} km`;basisTime.textContent=d.plan_time||plannedRouteTime(d.km);
  removeRouteInfo.hidden=!d.routeInfo;
  if(d.routeInfo){const sourceCount=d.routeInfo.sources?.length||0,date=d.routeInfo.importedAt?new Date(d.routeInfo.importedAt).toLocaleString("de-DE",{dateStyle:"short",timeStyle:"short"}):"";routeInfoStatus.className="routeInfoStatus active";routeInfoStatus.textContent=`ChatGPT-Routeninformationen aktiv${date?` · importiert ${date}`:""}${sourceCount?` · ${sourceCount} Quellen`:""}.`}
  else{routeInfoStatus.className="routeInfoStatus";routeInfoStatus.textContent="Noch keine von ChatGPT erstellten Routeninformationen importiert."}
  basisStatus.textContent=info.placeError?"Ortsnamen derzeit nicht erreichbar; Koordinaten und GPX bleiben verfügbar.":info.startName&&info.endName?"Start und Ziel erkannt · Wetter wird passend zum Prognosefenster geladen.":"Start und Ziel werden aus der GPX automatisch ermittelt.";
  setBasisWeatherCard("Start",cached?.values?.[0]);setBasisWeatherCard("Mid",cached?.values?.[1]);setBasisWeatherCard("End",cached?.values?.[2]);
  if(cached?.period)basisSource.textContent=`${cached.period} · Ortsnamen: © OpenStreetMap-Mitwirkende/Nominatim · Wetter: Open-Meteo. Online-Daten vor Fahrtantritt aktualisieren.`;
}
async function updateAlternativeBasis(day,force=false){
  const key=String(day),route=alternativeRoutes[key];if(!route||basisLoading[key])return;basisLoading[key]=true;
  if(Number(day)===currentDay&&getActiveRoute(day).source==="alternative"){basisStatus.textContent="Basisinformationen werden aktualisiert …";setBasisWeatherCard("Start",null);setBasisWeatherCard("Mid",null);setBasisWeatherCard("End",null)}
  let working=route,info={...(route.autoInfo||{})};
  if(!info.startName||!info.endName){
    try{
      const start=route.points[0],end=route.points[route.points.length-1];info.startName=await reversePlace(start);if(havKm(start,end)<.3)info.endName=info.startName;else{await delay(1100);info.endName=await reversePlace(end)}delete info.placeError;
    }catch(e){info.placeError=true}
    working={...route,autoInfo:info,plan_time:plannedRouteTime(route.km)};
    if(info.startName&&info.endName&&!route.routeInfo)working={...working,subtitle:`Waterkaarten-Alternative · ${info.startName} → ${info.endName}`,route_text:`${info.startName} → ${info.endName}`,night:`Zielbereich: ${info.endName}`};
    try{saveAlternative(day,working)}catch(e){if(Number(day)===currentDay)basisStatus.textContent="Basisdaten konnten nicht lokal gespeichert werden."}
  }else if(!route.plan_time||route.plan_time==="noch offen"){
    working={...route,plan_time:plannedRouteTime(route.km)};try{saveAlternative(day,working)}catch(e){}
  }
  const points=[working.points[0],working.points[Math.floor(working.points.length/2)],working.points[working.points.length-1]],cacheKey=alternativeCacheKey(day,working);
  try{
    const results=await Promise.allSettled(points.map(point=>fetchBasisWeather(point,working))),values=results.map(result=>result.status==="fulfilled"?result.value:{error:true});
    basisWeatherCache[cacheKey]={time:Date.now(),values,period:values.find(v=>!v.error)?.period||"Wetterdaten nicht erreichbar"};
  }catch(e){basisWeatherCache[cacheKey]={time:Date.now(),values:[{error:true},{error:true},{error:true}],period:"Wetterdaten nicht erreichbar"}}
  basisLoading[key]=false;
  if(Number(day)===currentDay&&getActiveRoute(day).source==="alternative"){renderDay(day);renderAlternativeBasis(getActiveRoute(day))}
}
function saveAlternative(day,route){
  const next={...alternativeRoutes,[String(day)]:route};localStorage.setItem(ALT_ROUTE_STORAGE,JSON.stringify(next));alternativeRoutes=next;
}
function saveRouteChoice(day,choice){
  const next={...routeChoices,[String(day)]:choice};localStorage.setItem(ROUTE_CHOICE_STORAGE,JSON.stringify(next));routeChoices=next;
}
function clearRouteDependentState(day){
  const key=String(day),m=maps[day];
  if(m&&nauticalLayers[day])m.removeLayer(nauticalLayers[day]);nauticalLayers[day]=null;delete scannedNautic[day];
  if(Number(day)===currentDay){scanGreen.textContent="0";scanYellow.textContent="0";scanRed.textContent="0";scanTotal.textContent="0";nauticObjectList.innerHTML='<div class="placeholder">Noch keine Online-Prüfung durchgeführt.</div>';updateNextNautic();}
}
function updateRouteManager(day,d){
  const alt=alternativeRoutes[String(day)],isAlt=d.source==="alternative";
  routeOriginalBtn.classList.toggle("active",!isAlt);routeAlternativeBtn.classList.toggle("active",isAlt);routeAlternativeBtn.disabled=!alt;
  routeAlternativeBtn.textContent=alt?"WATERKAARTEN-ALTERNATIVE":"KEINE ALTERNATIVE";deleteAlternativeRoute.hidden=!alt;
  routeStatusChip.textContent=isAlt?"ALTERNATIV-GPX AKTIV":"ORIGINAL-GPX AKTIV";routeStatusChip.className=`chip ${isAlt?"yellow":"aqua"}`;
  routeManagerStatus.textContent=isAlt?`Alternative: ${d.title}`:"Originalroute ausgewählt";
  routeImportStatus.textContent=alt?`${alt.file} · ${alt.km.toFixed(1)} km · ${alt.count} Punkte`:"Die freigegebene Originalroute bleibt unverändert erhalten.";
}
function selectRoute(day,choice){
  if(choice==="alternative"&&!alternativeRoutes[String(day)])return;
  try{saveRouteChoice(day,choice);clearRouteDependentState(day);renderDay(day);loadWeather()}catch(e){routeImportStatus.textContent="Auswahl konnte lokal nicht gespeichert werden."}
}
function xmlEsc(s){return String(s).replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&apos;"}[m]))}
function alternativeGpxText(d){return `<?xml version="1.0" encoding="UTF-8"?>\n<gpx version="1.1" creator="Friesland Skipper Cockpit V0.18.1" xmlns="http://www.topografix.com/GPX/1/1"><trk><name>${xmlEsc(d.title)}</name><trkseg>${d.points.map(p=>`<trkpt lat="${p[0]}" lon="${p[1]}"></trkpt>`).join("")}</trkseg></trk></gpx>`}
function routeFingerprint(day,d){
  const step=Math.max(1,Math.floor(d.points.length/250));let hash=2166136261;
  for(let i=0;i<d.points.length;i+=step){const value=`${d.points[i][0].toFixed(5)},${d.points[i][1].toFixed(5)};`;for(let n=0;n<value.length;n++){hash^=value.charCodeAt(n);hash=Math.imul(hash,16777619)}}
  const last=d.points[d.points.length-1],tail=`${last[0].toFixed(5)},${last[1].toFixed(5)}`;for(let n=0;n<tail.length;n++){hash^=tail.charCodeAt(n);hash=Math.imul(hash,16777619)}
  return `fsc-route-v1-${day}-${d.count}-${Math.round(d.km*1000)}-${(hash>>>0).toString(16).padStart(8,"0")}`;
}
function sampledRoutePoints(points,max=1000){
  if(points.length<=max)return points.map((p,index)=>({index,lat:p[0],lon:p[1]}));
  const step=Math.ceil((points.length-1)/(max-1)),sample=[];for(let i=0;i<points.length;i+=step)sample.push({index:i,lat:points[i][0],lon:points[i][1]});
  if(sample[sample.length-1].index!==points.length-1){const i=points.length-1;sample.push({index:i,lat:points[i][0],lon:points[i][1]})}return sample;
}
function buildRouteAnalysisPackage(day,d){
  const start=d.points[0],end=d.points[d.points.length-1],mid=d.points[Math.floor(d.points.length/2)],ship=getShipProfile();
  return {schema:"fsc-route-analysis-v1",appVersion:"0.18.1",createdAt:new Date().toISOString(),day:Number(day),date:d.date,routeFingerprint:routeFingerprint(day,d),route:{file:d.file,gpxName:d.baseTitle||d.title,currentTitle:d.title,distanceKm:Number(d.km.toFixed(3)),pointCount:d.count,plannedTime:d.plan_time,start:{lat:start[0],lon:start[1],name:d.autoInfo?.startName||null},mid:{lat:mid[0],lon:mid[1]},end:{lat:end[0],lon:end[1],name:d.autoInfo?.endName||null},sampledPoints:sampledRoutePoints(d.points)},shipProfile:{name:ship.name,type:ship.type,lengthM:ship.length,beamM:ship.beam,draftM:ship.draft,airDraftM:ship.airDraft},requestedInformation:{title:"Präziser, kurzer Routentitel",subtitle:"Knackige Charakterisierung der Tagesetappe",routeText:"Nachvollziehbarer Verlauf über Orte und Gewässer",night:"Ziel- oder Nachtplatzhinweis",waters:"Liste der Gewässer und Kanäle in Fahrreihenfolge",passages:"Wichtige Passagen mit level info, attention oder warning",landgang:"Sinnvolle Stopps, Versorgung und Aktivitäten",nautic:"Nautische Zusammenfassung, Prüfpunkte und offizieller Kontext",brief:"Skipperbriefing mit Charakter, Zusammenfassung, Reserve und Fokusbegriffen",sources:"Verwendete Quellen als direkte URLs"},outputContract:{schema:"fsc-route-info-v1",routeFingerprint:routeFingerprint(day,d),day:Number(day),generatedAt:"ISO-8601",data:{title:"Text",subtitle:"Text",routeText:"Text",night:"Text",waters:["Text"],passages:[{level:"info|attention|warning",title:"Text",text:"Text"}],landgang:["Text"],nautic:{level:"info|attention|warning",title:"Text",items:["Text"],official:"Text"},brief:{character:"Text",summary:"Text",reserve:"Text",focus:["Text"]}},sources:["https://…"]},instructionsForChatGPT:"Analysiere ausschließlich diese Route. Recherchiere belastbare aktuelle Revierinformationen, wenn Internetzugriff vorhanden ist. Erfinde keine Brückenhöhen, Tiefen, Öffnungszeiten oder Sperrungen. Erstelle als Ergebnis ausschließlich eine herunterladbare JSON-Datei nach outputContract. routeFingerprint und day müssen exakt unverändert bleiben. Texte auf Deutsch; Waterkaarten und offizielle Hinweise bleiben maßgeblich."};
}
function safeFilePart(value){return String(value||"Route").normalize("NFKD").replace(/[^a-zA-Z0-9_-]+/g,"_").replace(/^_+|_+$/g,"").slice(0,60)||"Route"}
function downloadJson(data,fileName){
  const url=URL.createObjectURL(new Blob([JSON.stringify(data,null,2)],{type:"application/json"})),a=document.createElement("a");a.href=url;a.download=fileName;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1500);
}
function exportActiveRouteAnalysis(){
  const d=getActiveRoute(currentDay);if(d.source!=="alternative"){routeInfoStatus.className="routeInfoStatus error";routeInfoStatus.textContent="Bitte zuerst die Waterkaarten-Alternative auswählen.";return}
  const pkg=buildRouteAnalysisPackage(currentDay,d);downloadJson(pkg,`FSC_Tag${currentDay}_Analyse_${safeFilePart(d.baseTitle||d.title)}.json`);routeInfoStatus.className="routeInfoStatus";routeInfoStatus.textContent="Analysepaket gesichert. Lade diese JSON-Datei jetzt hier im Chat hoch.";
}
function buildTourAnalysisPackage(){
  const createdAt=new Date().toISOString(),routes=[];for(let day=1;day<=7;day++){const analysis=buildRouteAnalysisPackage(day,FSC_ROUTES[String(day)]);analysis.requestedInformation.landgang="Konkrete Landgangtipps nahe sinnvoller Anlegeplätze: ungefährer Fußweg, Gastronomie und regionale Spezialitäten, Einkauf und Versorgung, Sehenswürdigkeiten, Museen, Mühlen, Spaziergänge sowie mögliche Aktivitäten; Öffnungszeiten nur mit Prüfhinweis";routes.push(analysis)}
  return {schema:"fsc-tour-analysis-v1",appVersion:"0.18.1",createdAt,routeCount:routes.length,routes,outputContract:{schema:"fsc-tour-info-v1",generatedAt:"ISO-8601",routes:"Genau sieben fsc-route-info-v1-Pakete, eines je Fahrtag 1 bis 7"},instructionsForChatGPT:"Analysiere alle sieben Standardrouten als zusammenhängende Friesland-Tour. Recherchiere pro Fahrtag belastbare aktuelle Revier- und besonders konkrete Landganginformationen. Liefere genau eine herunterladbare JSON-Datei nach outputContract. Jeder day- und routeFingerprint-Wert muss exakt aus dem jeweiligen Analysepaket übernommen werden; die sieben Einzelpakete stehen im Feld routes. Keine Navigationswerte erfinden; Waterkaarten und amtliche Hinweise bleiben maßgeblich."};
}
function downloadTourAnalysisPackage(){
  downloadJson(buildTourAnalysisPackage(),"FSC_Tour_Analyse_Standardrouten.json");tourInfoStatus.className="routeInfoStatus";tourInfoStatus.textContent="Tour-Analysepaket mit allen sieben Standardrouten gesichert. Lade diese JSON-Datei jetzt hier im Chat hoch.";
}
function cleanText(value,max=500){return typeof value==="string"?value.trim().slice(0,max):""}
function cleanTextList(value,maxItems=16,maxLength=240){return Array.isArray(value)?value.slice(0,maxItems).map(v=>cleanText(v,maxLength)).filter(Boolean):[]}
function cleanPassages(value){
  if(!Array.isArray(value))return [];return value.slice(0,14).map(item=>{const level=["info","attention","warning"].includes(item?.level)?item.level:"info",title=cleanText(item?.title,120),text=cleanText(item?.text,500);return title||text?[level,title||"Hinweis",text]:null}).filter(Boolean);
}
function sanitizeRouteInfoPackage(pkg,day,d){
  if(!pkg||pkg.schema!=="fsc-route-info-v1")throw new Error("Die Datei ist kein gültiges FSC-Routeninfopaket.");
  if(Number(pkg.day)!==Number(day))throw new Error(`Das Informationspaket gehört zu Tag ${pkg.day}, ausgewählt ist Tag ${day}.`);
  if(pkg.routeFingerprint!==routeFingerprint(day,d))throw new Error("Das Informationspaket gehört nicht zu dieser GPX-Route.");
  const data=pkg.data;if(!data||typeof data!=="object")throw new Error("Im Informationspaket fehlen die Routendaten.");
  const level=value=>["info","attention","warning"].includes(value)?value:"info";
  const clean={title:cleanText(data.title,140),subtitle:cleanText(data.subtitle,260),routeText:cleanText(data.routeText,900),night:cleanText(data.night,350),waters:cleanTextList(data.waters,20,140),passages:cleanPassages(data.passages),landgang:cleanTextList(data.landgang,20,350),nautic:{level:level(data.nautic?.level),title:cleanText(data.nautic?.title,180),items:cleanTextList(data.nautic?.items,18,350),official:cleanText(data.nautic?.official,500)},brief:{character:cleanText(data.brief?.character,80),summary:cleanText(data.brief?.summary,700),reserve:cleanText(data.brief?.reserve,500),focus:cleanTextList(data.brief?.focus,12,80)}};
  if(!clean.routeText&&!clean.waters.length&&!clean.passages.length&&!clean.landgang.length)throw new Error("Das Informationspaket enthält keine verwertbaren Routeninformationen.");
  return {data:clean,generatedAt:cleanText(pkg.generatedAt,60),sources:cleanTextList(pkg.sources,20,600)};
}
function routeWithoutImportedInfo(d){
  const start=d.autoInfo?.startName,end=d.autoInfo?.endName,baseTitle=d.baseTitle||d.title;
  return {...d,title:baseTitle,baseTitle,subtitle:start&&end?`Waterkaarten-Alternative · ${start} → ${end}`:"Importierte Waterkaarten-Alternative · Basisdaten werden automatisch ergänzt",route_text:start&&end?`${start} → ${end}`:baseTitle,night:end?`Zielbereich: ${end}`:"Zielbereich wird automatisch ermittelt",waters:["Gewässerinformationen folgen in Schritt 2b"],passages:[["info","Waterkaarten-GPX aktiv","Streckenverlauf importiert. Brücken, Sperrungen und Tiefen weiterhin in Waterkaarten prüfen."]],landgang:["Redaktionelle Reiseinformationen folgen in Schritt 2b."],nautic:{level:"info",title:"Importierte Alternativroute",items:["Nautikscan und GPS verwenden automatisch die aktive GPX-Linie.","Waterkaarten bleibt für Navigation und aktuelle Revierdaten maßgeblich."],official:"Alternative lokal aus GPX übernommen"},brief:{character:"ALTERNATIVE",summary:"Die importierte Waterkaarten-Route ist für diesen Fahrtag aktiv.",reserve:"Originalroute bleibt gespeichert und jederzeit auswählbar.",focus:["GPX geprüft","Waterkaarten","Wetter prüfen"]},routeInfo:null};
}
function applyRouteInfoPackage(day,pkg){
  const key=String(day),route=alternativeRoutes[key];if(!route)throw new Error("Für diesen Fahrtag ist keine Alternativroute gespeichert.");const clean=sanitizeRouteInfoPackage(pkg,day,route),base=routeWithoutImportedInfo(route),data=clean.data;
  const updated={...base,title:data.title||base.title,subtitle:data.subtitle||base.subtitle,route_text:data.routeText||base.route_text,night:data.night||base.night,waters:data.waters.length?data.waters:base.waters,passages:data.passages.length?data.passages:base.passages,landgang:data.landgang.length?data.landgang:base.landgang,nautic:data.nautic.title||data.nautic.items.length?data.nautic:base.nautic,brief:data.brief.summary||data.brief.focus.length?data.brief:base.brief,routeInfo:{generatedAt:clean.generatedAt||null,importedAt:new Date().toISOString(),sources:clean.sources}};
  saveAlternative(day,updated);return updated;
}
function validOriginalInfoCount(){let count=0;for(let day=1;day<=7;day++)if(effectiveOriginalRouteInfo(day))count++;return count}
function validLocalOriginalInfoCount(){let count=0;for(let day=1;day<=7;day++)if(validInfoForRoute(originalRouteInfos[String(day)],day,FSC_ROUTES[String(day)]))count++;return count}
function disabledBuiltInInfoCount(){let count=0;for(let day=1;day<=7;day++)if(builtInInfoDisabled[String(day)])count++;return count}
function renderTourInfoManager(d){
  const count=validOriginalInfoCount(),current=d?.source!=="alternative"&&d?.originalRouteInfo;
  removeOriginalRouteInfo.hidden=!current;removeAllOriginalRouteInfo.hidden=!count;restoreBuiltInTourInfo.hidden=!disabledBuiltInInfoCount();
  if(current){const sourceCount=current.sources?.length||0,source=current.storageSource==="local"?"lokale Aktualisierung":"dauerhaft integriert";removeOriginalRouteInfo.textContent=current.storageSource==="local"?"UPDATE ENTFERNEN":"ORIGINAL WIEDERHERSTELLEN";tourInfoStatus.className="routeInfoStatus active";tourInfoStatus.textContent=`Standardrouten-Infos für Tag ${current.day} aktiv · ${source} · ${count} von 7 Fahrtagen angereichert${sourceCount?` · ${sourceCount} Quellen für diesen Tag`:""}.`}
  else if(d?.source==="alternative"&&count){tourInfoStatus.className="routeInfoStatus";tourInfoStatus.textContent=`${count} von 7 Standardrouten angereichert. Aktuell ist die Waterkaarten-Alternative ausgewählt.`}
  else if(count){tourInfoStatus.className="routeInfoStatus";tourInfoStatus.textContent=`${count} von 7 Standardrouten angereichert. Für den aktuellen Fahrtag sind die unveränderten Originalinformationen aktiv.`}
  else{tourInfoStatus.className="routeInfoStatus";tourInfoStatus.textContent="Die integrierten Tourinfos sind ausgeblendet. Alle sieben unveränderten Originalrouten sind aktiv."}
}
function sanitizeTourInfoPackage(pkg){
  if(!pkg||pkg.schema!=="fsc-tour-info-v1")throw new Error("Die Datei ist kein gültiges FSC-Tour-Routeninfopaket.");
  if(!Array.isArray(pkg.routes)||pkg.routes.length!==7)throw new Error("Das Tour-Paket muss genau sieben Routeninformationen enthalten.");
  const next={},seen=new Set();for(const routePackage of pkg.routes){const day=Number(routePackage?.day);if(!Number.isInteger(day)||day<1||day>7||seen.has(day))throw new Error("Die Fahrtage im Tour-Paket sind unvollständig oder doppelt.");seen.add(day);const base=FSC_ROUTES[String(day)],clean=sanitizeRouteInfoPackage(routePackage,day,base);next[String(day)]={day,routeFingerprint:routeFingerprint(day,base),data:clean.data,generatedAt:clean.generatedAt||null,importedAt:new Date().toISOString(),sources:clean.sources}}
  if(seen.size!==7)throw new Error("Das Tour-Paket enthält nicht alle Fahrtage 1 bis 7.");return next;
}
function saveOriginalRouteInfos(next){localStorage.setItem(ORIGINAL_INFO_STORAGE,JSON.stringify(next));originalRouteInfos=next}
function saveBuiltInInfoDisabled(next){localStorage.setItem(BUILTIN_INFO_DISABLED_STORAGE,JSON.stringify(next));builtInInfoDisabled=next}
function esc(s){return String(s).replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]));}
function bearing(a,b){const lat1=a[0]*Math.PI/180,lat2=b[0]*Math.PI/180,dLon=(b[1]-a[1])*Math.PI/180;const y=Math.sin(dLon)*Math.cos(lat2),x=Math.cos(lat1)*Math.sin(lat2)-Math.sin(lat1)*Math.cos(lat2)*Math.cos(dLon);return(Math.atan2(y,x)*180/Math.PI+360)%360}
function arrowIcon(deg){return L.divIcon({className:'',html:`<div class="route-arrow" style="transform:rotate(${deg}deg)">➤</div>`,iconSize:[20,20],iconAnchor:[10,10]})}
function waypointIcon(type,label){const cls=type==='start'?' startMarker':type==='finish'?' finishMarker':'';const sym=type==='start'?'🚩':type==='finish'?'🏁':type==='city'?'🏘️':type==='water'?'⛵':type==='mill'?'🌬️':'•';return L.divIcon({className:'',html:`<div class="waypoint${cls}"><div class="wpIcon">${sym}</div><div class="wpLabel">${esc(label)}</div></div>`,iconSize:[180,34],iconAnchor:[15,17]})}
function addDirectionArrows(m,pts){for(let n=1;n<=9;n++){const idx=Math.floor((pts.length-2)*n/10),a=pts[idx],b=pts[Math.min(idx+3,pts.length-1)];L.marker(a,{icon:arrowIcon(bearing(a,b)),interactive:false,zIndexOffset:800}).addTo(m)}}
function initMap(day){
  const d=getActiveRoute(day),pts=d.points.map(p=>[p[0],p[1]]);let m=maps[day];
  if(!m){m=L.map(`map${day}`,{zoomControl:true,attributionControl:true,preferCanvas:true});maps[day]=m;L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:18,attribution:'&copy; OpenStreetMap-Mitwirkende'}).addTo(m)}
  if(routeLayers[day])m.removeLayer(routeLayers[day]);const group=L.layerGroup();routeLayers[day]=group;
  L.polyline(pts,{color:'#fff',weight:10,opacity:.95}).addTo(group);L.polyline(pts,{color:d.source==="alternative"?'#d99b00':'#078ca2',weight:6,opacity:1}).addTo(group);addDirectionArrows(group,pts);L.marker(pts[0],{icon:waypointIcon('start','Start'),zIndexOffset:1000}).addTo(group);L.marker(pts[pts.length-1],{icon:waypointIcon('finish','Ziel'),zIndexOffset:1000}).addTo(group);(d.landmarks||[]).forEach(w=>L.marker([w[2],w[3]],{icon:waypointIcon(w[0],w[1]),zIndexOffset:900}).addTo(group));group.addTo(m);m.fitBounds(L.latLngBounds(pts),{padding:[60,60]});setTimeout(()=>m.invalidateSize(),40)
}
function setScreen(name){document.querySelectorAll('.navbtn').forEach(b=>b.classList.toggle('active',b.dataset.screen===name));document.querySelectorAll('.screen').forEach(s=>s.classList.toggle('active',s.id===`screen-${name}`));if(name==='cockpit')setTimeout(()=>initMap(currentDay),40);if(name==='tagesplan'||name==='landgang'||name==='nacht')renderDetailScreens()}
function passageParts(p){
  if(Array.isArray(p))return {level:p[0]||'info',title:p[1]||'',text:p[2]||''};
  if(p&&typeof p==='object')return {level:p.level||'info',title:p.title||'',text:p.text||''};
  return {level:'info',title:'Hinweis',text:typeof p==='string'?p:''};
}
function renderDay(day){currentDay=Number(day);const d=getActiveRoute(day);updateRouteManager(day,d);renderAlternativeBasis(d);renderTourInfoManager(d);dayKicker.textContent=`TAG ${day} · ${d.date}`;routeTitle.textContent=d.title;subtitle.textContent=d.subtitle;topDay.textContent=`${day} / 7`;topTime.textContent=d.plan_time;topKm.textContent=`${d.km.toFixed(1)} km`;metricKm.textContent=`${d.km.toFixed(1)} km`;metricTime.textContent=d.plan_time;metricPts.textContent=d.count;routeText.textContent=d.route_text;nightText.textContent=d.night;watersText.textContent=(d.waters||[]).join(' · ');
skipperPassages.innerHTML=(d.passages||[]).map(p=>{const item=passageParts(p);return `<div class="passage ${esc(item.level)}"><strong>${esc(item.title)}</strong>${esc(item.text)}</div>`}).join('');
landgangList.innerHTML=(d.landgang||[]).map(x=>`<li>⚓ ${esc(x)}</li>`).join('');
if(d.nautic){
  nautikFlag.textContent=d.nautic.level==='warning'?'WARNUNG':d.nautic.level==='attention'?'ACHTUNG':'NAUTIK';
  nautikFlag.className='nautikFlag '+(d.nautic.level||'info');
  nautikTitle.textContent=d.nautic.title;
  nautikItems.innerHTML=(d.nautic.items||[]).map(x=>`<li>${esc(x)}</li>`).join('');
  nautikOfficial.textContent=d.nautic.official||'';
}
if(typeof nautikRouteName!=='undefined')nautikRouteName.textContent=d.title;
weatherLocation.textContent=d.title;if(typeof ijsselmeerWeatherCard!=='undefined')ijsselmeerWeatherCard.hidden=d.decision!=="weather";
if(typeof nextNauticCard!=='undefined')updateNextNautic();
if(d.brief){
  briefCharacter.textContent=d.brief.character;
  briefSummary.textContent=d.brief.summary;
  briefReserve.textContent=d.brief.reserve;
  briefFocus.innerHTML=(d.brief.focus||[]).map(x=>`<span>${esc(x)}</span>`).join('');
}
if(activeGpxUrl){URL.revokeObjectURL(activeGpxUrl);activeGpxUrl=null}gpxFile.textContent=d.file;if(d.source==="alternative"){activeGpxUrl=URL.createObjectURL(new Blob([alternativeGpxText(d)],{type:"application/gpx+xml"}));gpxOpen.href=activeGpxUrl;gpxDownload.href=activeGpxUrl}else{gpxOpen.href=`routes/${encodeURIComponent(d.file)}`;gpxDownload.href=`routes/${encodeURIComponent(d.file)}`}gpxDownload.download=d.file;daySelect.value=day;syncTopDayButtons(day);syncHeaderDayPicker(day);decisionWeather.hidden=d.decision!=='weather';decisionTime.hidden=d.decision!=='time';document.querySelectorAll('.daymap').forEach(x=>x.hidden=true);document.querySelector(`#map${day}`).hidden=false;initMap(day);renderDetailScreens();if(d.source==="alternative"){const cached=basisWeatherCache[alternativeCacheKey(day,d)];if(!cached||Date.now()-cached.time>600000)setTimeout(()=>updateAlternativeBasis(day),0)}}
document.querySelectorAll('.navbtn').forEach(b=>b.addEventListener('click',()=>setScreen(b.dataset.screen)));daySelect.addEventListener('change',e=>{setScreen('cockpit');renderDay(e.target.value)});document.querySelectorAll('[data-day]').forEach(b=>b.addEventListener('click',()=>{setScreen('cockpit');renderDay(b.dataset.day)}));document.querySelectorAll('.choice').forEach(c=>c.addEventListener('click',()=>{c.parentElement.querySelectorAll('.choice').forEach(x=>x.classList.remove('active'));c.classList.add('active')}));
const OVERPASS_ENDPOINTS=["https://overpass-api.de/api/interpreter","https://overpass.kumi.systems/api/interpreter","https://overpass.nchc.org.tw/api/interpreter"];
async function overpassQuery(q){let lastError=null;for(const endpoint of OVERPASS_ENDPOINTS){const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),18000);try{const r=await fetch(endpoint,{method:"POST",headers:{"Content-Type":"application/x-www-form-urlencoded;charset=UTF-8"},body:"data="+encodeURIComponent(q),signal:controller.signal});clearTimeout(timer);if(!r.ok)throw new Error("HTTP "+r.status);return {data:await r.json(),endpoint};}catch(e){clearTimeout(timer);lastError=e}}throw lastError||new Error("Kein Overpass-Endpunkt erreichbar");}
function havKm(a,b){const R=6371,la1=a[0]*Math.PI/180,la2=b[0]*Math.PI/180,dla=(b[0]-a[0])*Math.PI/180,dlo=(b[1]-a[1])*Math.PI/180;const h=Math.sin(dla/2)**2+Math.cos(la1)*Math.cos(la2)*Math.sin(dlo/2)**2;return 2*R*Math.asin(Math.sqrt(h))}
function minDistToRoute(lat,lon,pts){let best=Infinity;for(let i=0;i<pts.length;i+=Math.max(1,Math.floor(pts.length/180))){best=Math.min(best,havKm([lat,lon],pts[i]))}return best}
function nauticalIcon(kind){return L.divIcon({className:'',html:`<div class="nauticalMarker ${kind==='lock'?'lock':''}">${kind==='lock'?'🔒':'🌉'}</div>`,iconSize:[26,26],iconAnchor:[13,13]})}
async function loadNauticalLayer(){
  const d=getActiveRoute(currentDay),pts=d.points.map(p=>[p[0],p[1]]),m=maps[currentDay];if(!m)return;
  if(nauticalLayers[currentDay]){m.removeLayer(nauticalLayers[currentDay]);nauticalLayers[currentDay]=null;nauticalStatus.textContent='Layer ausgeblendet. Öffnungszeiten weiterhin in Waterkaarten prüfen.';loadNautical.textContent='🌉 OSM-BRÜCKEN / SCHLEUSEN LADEN';return}
  loadNautical.disabled=true;nauticalStatus.textContent='Nautische OSM-Objekte werden entlang der GPX-Route gesucht …';
  try{
    const b=L.latLngBounds(pts).pad(.08),s=b.getSouth(),w=b.getWest(),n=b.getNorth(),e=b.getEast();
    const q=`[out:json][timeout:18];(node["waterway"="lock_gate"](${s},${w},${n},${e});way["waterway"="lock_gate"](${s},${w},${n},${e});node["lock"="yes"](${s},${w},${n},${e});way["lock"="yes"](${s},${w},${n},${e});node["bridge"](${s},${w},${n},${e});way["bridge"](${s},${w},${n},${e}););out center tags;`;
    const oq=await overpassQuery(q);const j=oq.data,group=L.layerGroup();let count=0;
    for(const el of j.elements){
      const lat=el.lat??el.center?.lat,lon=el.lon??el.center?.lon;if(lat==null||lon==null)continue;
      if(minDistToRoute(lat,lon,pts)>.28)continue;
      const kind=(el.tags?.waterway==='lock_gate'||el.tags?.lock==='yes')?'lock':'bridge';
      const name=el.tags?.name||el.tags?.['name:nl']||(kind==='lock'?'Schleuse / Lock':'Brücke');
      L.marker([lat,lon],{icon:nauticalIcon(kind),zIndexOffset:700}).bindPopup(`<strong>${esc(name)}</strong><br>${kind==='lock'?'Schleuse / Lock':'Brücke'}<br><small>OSM-Hinweis – Betriebs-/Öffnungszeit in Waterkaarten verifizieren.</small>`).addTo(group);count++;
    }
    group.addTo(m);nauticalLayers[currentDay]=group;nauticalStatus.textContent=`${count} OSM-Brücken/Schleusen nahe der GPX-Linie eingeblendet. Nicht als Ersatz für Waterkaarten verwenden.`;loadNautical.textContent='🌉 OSM-LAYER AUSBLENDEN';
  }catch(e){nauticalStatus.textContent='OSM-Abfrage über alle verfügbaren Server fehlgeschlagen. Für Brücken/Schleusen bitte Waterkaarten verwenden.'}
  finally{loadNautical.disabled=false}
}
function locateMe(){
  if(!navigator.geolocation){gpsStatus.textContent='GPS/Geolocation wird von diesem Browser nicht unterstützt.';return}
  gpsStatus.textContent='GPS-Position wird ermittelt …';
  navigator.geolocation.getCurrentPosition(pos=>{
    const lat=pos.coords.latitude,lon=pos.coords.longitude,m=maps[currentDay],d=getActiveRoute(currentDay),pts=d.points.map(p=>[p[0],p[1]]);currentUserPos=[lat,lon];
    if(userMarker&&m.hasLayer(userMarker))m.removeLayer(userMarker);
    const ico=L.divIcon({className:'',html:'<div class="userPos"></div>',iconSize:[18,18],iconAnchor:[9,9]});
    userMarker=L.marker([lat,lon],{icon:ico,zIndexOffset:2000}).addTo(m).bindPopup('Meine aktuelle Position');
    m.panTo([lat,lon]);const off=minDistToRoute(lat,lon,pts);gpsStatus.textContent=`GPS aktiv · Abstand zur geplanten GPX-Linie ca. ${Math.round(off*1000)} m`;updateNextNautic();
  },()=>gpsStatus.textContent='GPS-Position konnte nicht gelesen werden. iPad-Berechtigung prüfen.',{enableHighAccuracy:true,timeout:10000});
}
function landgangCategory(text){
  const value=String(text||"").toLowerCase();
  if(/reserve|bei schlechtem|bei verzöger/.test(value))return {label:"RESERVE",icon:"↩",kind:"reserve"};
  if(/einkauf|versorgung|vorrät|proviant|lebensmittel|müll|bordvorr/.test(value))return {label:"VERSORGUNG",icon:"🛒",kind:"supply"};
  if(/essen|restaurant|café|kaffee|bier|terrasse|lunch|frühstück|brotzeit|küchen|pfannkuchen|gastronomie|kochen/.test(value))return {label:"ESSEN & TRINKEN",icon:"🍽️",kind:"food"};
  if(/aktivität|e-bike|e-chopper|spaziergang|rundgang|museum|mühle|kultur|brunnen|waterpoort|stadtbummel|vogel|aussicht|besichtigung/.test(value))return {label:"ERLEBEN",icon:"◎",kind:"activity"};
  return {label:"STOPP & LANDGANG",icon:"⚓",kind:"stop"};
}
function landgangParts(text,index){
  const raw=String(text||"").trim(),split=raw.indexOf(":");
  if(split>0&&split<80)return {title:raw.slice(0,split).trim(),text:raw.slice(split+1).trim(),...landgangCategory(raw)};
  return {title:`Hinweis ${index+1}`,text:raw,...landgangCategory(raw)};
}
function renderDetailDayNav(targetId){
  const el=document.getElementById(targetId);if(!el)return;
  el.innerHTML=Array.from({length:7},(_,i)=>{const day=i+1,d=getActiveRoute(day);return `<button type="button" data-detail-day="${day}" class="${day===currentDay?'active':''}"><strong>TAG ${day}</strong><span>${esc(d.title)}</span></button>`}).join("");
  el.querySelectorAll("[data-detail-day]").forEach(button=>button.addEventListener("click",()=>renderDay(Number(button.dataset.detailDay))));
}
function renderTagesplanDetail(){
  const target=document.getElementById("tagesplanDetail");if(!target)return;const d=getActiveRoute(currentDay),brief=d.brief||{},passages=(d.passages||[]).map(passageParts);
  target.innerHTML=`
    <article class="dayPlanHero">
      <div class="dayPlanCharacter">${esc(brief.character||"FAHRTAG")}</div>
      <div><small>TAG ${currentDay} · ${esc(d.date||"")}</small><h3>${esc(d.title)}</h3><p>${esc(d.subtitle||d.route_text||"")}</p></div>
      <div class="dayPlanMetrics"><div><small>DISTANZ</small><strong>${Number(d.km).toFixed(1)} km</strong></div><div><small>REINE FAHRZEIT</small><strong>${esc(d.plan_time||"—")}</strong></div></div>
    </article>
    <div class="dayTimeline">
      <article class="timelineStep"><div class="timelineNo">1</div><div><small>VOR DEM ABLEGEN</small><h3>Tagesziel und Schwerpunkte</h3><p>${esc(brief.summary||d.route_text||"")}</p><div class="briefFocus">${(brief.focus||[]).map(x=>`<span>${esc(x)}</span>`).join("")}</div></div></article>
      <article class="timelineStep"><div class="timelineNo">2</div><div><small>FAHRTABSCHNITTE</small><h3>Gewässer in Fahrreihenfolge</h3><p>${esc(d.route_text||"")}</p><ol class="routeSequence">${(d.waters||[]).map(x=>`<li>${esc(x)}</li>`).join("")}</ol></div></article>
      <article class="timelineStep"><div class="timelineNo">3</div><div><small>UNTERWEGS</small><h3>Wichtige Passagen und Entscheidungen</h3><div class="timelinePassages">${passages.map(item=>`<div class="passage ${esc(item.level)}"><strong>${esc(item.title)}</strong>${esc(item.text)}</div>`).join("")}</div></div></article>
      <article class="timelineStep"><div class="timelineNo">4</div><div><small>PAUSEN & LANDGANG</small><h3>Sinnvolle Stopps des Tages</h3><ul class="hintList">${(d.landgang||[]).map(x=>`<li>⚓ ${esc(x)}</li>`).join("")}</ul></div></article>
      <article class="timelineStep arrival"><div class="timelineNo">5</div><div><small>ANKUNFT & NACHT</small><h3>Geplanter Tagesabschluss</h3><p>${esc(d.night||"Nachtplatz vor Ort prüfen.")}</p></div></article>
      <article class="timelineStep reserve"><div class="timelineNo">R</div><div><small>RESERVE / TAKTIK</small><h3>Wenn Wetter, Brücken oder Zeit nicht mitspielen</h3><p>${esc(brief.reserve||"Rechtzeitig einen geeigneten Reserveplatz wählen und keine späte Aufholfahrt erzwingen.")}</p></div></article>
    </div>
    <p class="persistentInfoNote">Diese Tagesinformationen stammen aus der fest integrierten App-Datenbasis. Ein geprüftes lokales Tour-Update kann sie ergänzen; nach dem Löschen von Browserdaten steht die integrierte Fassung weiterhin zur Verfügung.</p>`;
}
function renderLandgangDetail(){
  const target=document.getElementById("landgangOverview");if(!target)return;const d=getActiveRoute(currentDay),brief=d.brief||{},items=(d.landgang||[]).map(landgangParts);
  target.innerHTML=`
    <article class="landgangHero card"><div><small>TAG ${currentDay} · ${esc(d.date||"")}</small><h3>${esc(d.title)}</h3><p>${esc(d.subtitle||"")}</p></div><div><small>NACHTZIEL</small><strong>${esc(d.night||"—")}</strong></div></article>
    <div class="landgangCards">${items.map(item=>`<article class="landgangCard ${item.kind}"><div class="landgangCardHead"><span>${item.icon}</span><small>${item.label}</small></div><h3>${esc(item.title)}</h3><p>${esc(item.text)}</p></article>`).join("")}</div>
    <article class="landgangReserve card"><small>TAGES-TAKTIK</small><strong>${esc(brief.reserve||"Landgänge nur mit ausreichender Zeit- und Wetterreserve einplanen.")}</strong></article>
    <p class="persistentInfoNote">Die ausführlichen Landgangtexte sind dauerhaft in der App gespeichert und werden auch ohne Internet angezeigt. Öffnungszeiten, konkrete Anlegemöglichkeit und aktuelle Verfügbarkeit bitte am Fahrtag prüfen.</p>`;
}
function renderNightDetail(){
  const target=document.getElementById("nightOverview");if(!target)return;
  const d=getActiveRoute(currentDay),n=window.FSC_NIGHT_INFO?.entries?.[String(currentDay)];
  if(!n){target.innerHTML=`<article class="card"><h3>TAG ${currentDay}</h3><strong>${esc(d.night||"Nachtplatz vor Ort prüfen")}</strong><p>Für diesen Fahrtag liegen noch keine erweiterten Nachtplatzinformationen vor.</p></article>`;return}
  target.innerHTML=`
    <article class="nightHero">
      <div class="nightPhoto"><img src="${esc(n.image)}" alt="${esc(n.imageAlt)}"><div class="nightPhotoShade"></div><div class="nightPhotoText"><small>TAG ${currentDay} · ${esc(d.date||"")}</small><h3>${esc(n.name)}</h3><span>${esc(n.type)}</span></div><a href="${esc(n.imageSource)}" target="_blank" rel="noopener" class="nightCredit">${esc(n.imageCredit)}</a></div>
      <div class="nightIntro"><small>NACHTPLATZ-CHARAKTER</small><p>${esc(n.mood)}</p><div class="nightRoute"><span>ANKUNFT NACH</span><strong>${esc(d.title)}</strong></div></div>
    </article>
    <div class="nightFacts">${(n.facts||[]).map(x=>`<article><span>${esc(x[0])}</span><div><small>${esc(x[1])}</small><strong>${esc(x[2])}</strong></div></article>`).join("")}</div>
    <div class="nightPractical">
      <article class="card nightTips"><small>VOR DEM FESTMACHEN</small><h3>Das ist heute wichtig</h3><ul>${(n.tips||[]).map(x=>`<li>${esc(x)}</li>`).join("")}</ul></article>
      <article class="card nightReserve"><small>RESERVE / PLAN B</small><h3>Nicht auf den Wunschplatz versteifen</h3><p>${esc(n.reserve)}</p></article>
    </div>
    <div class="nightActions"><a class="action primary" href="${esc(n.map)}" target="_blank" rel="noopener">📍 AUF KARTE ÖFFNEN</a><a class="action aqua" href="${esc(n.source)}" target="_blank" rel="noopener">↗ AKTUELLE QUELLE</a><span>Informationsstand 10.08.2026 · ${esc(n.sourceLabel)}</span></div>
    <p class="persistentInfoNote">Texte und Fotos sind dauerhaft in der App gespeichert und offline sichtbar. Freie Plätze, lokale Beschilderung, Wassertiefe, Windlage, Preise und die konkrete Eignung für Artemis bitte am Fahrtag in Waterkaarten beziehungsweise vor Ort prüfen.</p>`;
}
function renderDetailScreens(){renderDetailDayNav("tagesplanDayNav");renderDetailDayNav("landgangDayNav");renderDetailDayNav("nightDayNav");renderTagesplanDetail();renderLandgangDetail();renderNightDetail()}
function renderOverviews(){
  renderDetailScreens();
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
    const d=getActiveRoute(currentDay),pts=d.points.map(p=>[p[0],p[1]]),cum=cumulativeRouteKm(pts);
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
  const d=getActiveRoute(currentDay),pts=d.points.map(p=>[p[0],p[1]]);
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
    const oq=await overpassQuery(q);const j=oq.data,objs=[],seen=new Set(),cum=cumulativeRouteKm(pts);
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
  }catch(e){scanStatus.textContent="Online-Nautikscan über keinen verfügbaren OSM-Server erreichbar. Bei lokalem file://-Start kann der Browser externe Abfragen blockieren; Waterkaarten bleibt maßgeblich."}
  finally{scanNautical.disabled=false}
}


function syncHeaderDayPicker(day){
  const labels={1:"Sneek",2:"Gaastmaar",3:"Workum",4:"SN15",5:"Marchjepolle",6:"Giethoorn",7:"Sloten"};
  headerDayLabel.textContent=`Tag ${day} · ${labels[day]||""}`;
  document.querySelectorAll("[data-header-day]").forEach(b=>b.classList.toggle("active",Number(b.dataset.headerDay)===Number(day)));
}
document.getElementById("headerDayCurrent").addEventListener("click",(e)=>{
  e.stopPropagation();
  const menu=document.getElementById("headerDayMenu");
  menu.hidden=!menu.hidden;
});
document.querySelectorAll("[data-header-day]").forEach(b=>b.addEventListener("click",()=>{
  const day=Number(b.dataset.headerDay);
  headerDayMenu.hidden=true;
  setScreen("cockpit");
  renderDay(day);
}));
document.addEventListener("click",(e)=>{
  const picker=document.getElementById("headerDayPicker"),menu=document.getElementById("headerDayMenu");
  if(picker && !picker.contains(e.target))menu.hidden=true;
});

document.getElementById("weatherRefresh").addEventListener("click",loadWeather);
document.getElementById("weatherRefreshFull").addEventListener("click",loadWeather);
refreshAlternativeBasis.addEventListener("click",()=>updateAlternativeBasis(currentDay,true));
exportRouteAnalysis.addEventListener("click",exportActiveRouteAnalysis);
routeInfoInput.addEventListener("change",async()=>{
  const file=routeInfoInput.files&&routeInfoInput.files[0];if(!file)return;
  try{
    if(!/\.json$/i.test(file.name))throw new Error("Bitte das von ChatGPT erstellte JSON-Informationspaket auswählen.");
    if(file.size>1000000)throw new Error("Das Informationspaket ist ungewöhnlich groß und wurde aus Sicherheitsgründen nicht importiert.");
    const active=getActiveRoute(currentDay);if(active.source!=="alternative")throw new Error("Bitte zuerst die passende Waterkaarten-Alternative auswählen.");
    if(active.routeInfo&&!confirm("Die bereits importierten Routeninformationen für diesen Fahrtag ersetzen?"))return;
    const pkg=JSON.parse(await file.text()),updated=applyRouteInfoPackage(currentDay,pkg);renderDay(currentDay);routeInfoStatus.className="routeInfoStatus active";routeInfoStatus.textContent=`Routeninformationen für „${updated.title}“ erfolgreich importiert.`;
  }catch(e){routeInfoStatus.className="routeInfoStatus error";routeInfoStatus.textContent=e&&e.message?e.message:"Das Informationspaket konnte nicht importiert werden."}
  finally{routeInfoInput.value=""}
});
removeRouteInfo.addEventListener("click",()=>{
  const route=alternativeRoutes[String(currentDay)];if(!route?.routeInfo)return;if(!confirm("Die importierten ChatGPT-Routeninformationen entfernen? GPX, automatische Basisdaten und Originalroute bleiben erhalten."))return;
  try{saveAlternative(currentDay,routeWithoutImportedInfo(route));renderDay(currentDay);routeInfoStatus.textContent="Importierte Routeninformationen entfernt. Automatische Basisdaten bleiben erhalten."}catch(e){routeInfoStatus.className="routeInfoStatus error";routeInfoStatus.textContent="Die Routeninformationen konnten nicht entfernt werden."}
});
document.getElementById("exportTourAnalysis").addEventListener("click",downloadTourAnalysisPackage);
tourInfoInput.addEventListener("change",async()=>{
  const file=tourInfoInput.files&&tourInfoInput.files[0];if(!file)return;
  try{
    if(!/\.json$/i.test(file.name))throw new Error("Bitte das von ChatGPT erstellte JSON-Tourpaket auswählen.");
    if(file.size>5000000)throw new Error("Das Tour-Paket ist ungewöhnlich groß und wurde aus Sicherheitsgründen nicht importiert.");
    if(validLocalOriginalInfoCount()&&!confirm("Die bereits importierte lokale Aktualisierung der sieben Standardrouten ersetzen?"))return;
    const next=sanitizeTourInfoPackage(JSON.parse(await file.text()));saveOriginalRouteInfos(next);saveBuiltInInfoDisabled({});renderDay(currentDay);tourInfoStatus.className="routeInfoStatus active";tourInfoStatus.textContent="Lokale Tour-Aktualisierung für alle sieben Standardrouten erfolgreich importiert.";
  }catch(e){tourInfoStatus.className="routeInfoStatus error";tourInfoStatus.textContent=e&&e.message?e.message:"Das Tour-Routeninfopaket konnte nicht importiert werden."}
  finally{tourInfoInput.value=""}
});
removeOriginalRouteInfo.addEventListener("click",()=>{
  const key=String(currentDay),current=effectiveOriginalRouteInfo(currentDay);if(!current||getActiveRoute(currentDay).source==="alternative")return;
  const local=current.storageSource==="local",question=local?`Lokale Aktualisierung für Tag ${currentDay} entfernen und auf die dauerhaft integrierten Tourinfos zurückgehen?`:`Integrierte Tourinfos für Tag ${currentDay} ausblenden und die unveränderten Originalinformationen anzeigen?`;if(!confirm(question))return;
  try{if(local){const next={...originalRouteInfos},disabled={...builtInInfoDisabled};delete next[key];delete disabled[key];saveOriginalRouteInfos(next);saveBuiltInInfoDisabled(disabled)}else{saveBuiltInInfoDisabled({...builtInInfoDisabled,[key]:true})}renderDay(currentDay)}catch(e){tourInfoStatus.className="routeInfoStatus error";tourInfoStatus.textContent="Die Informationen für diesen Fahrtag konnten nicht zurückgesetzt werden."}
});
removeAllOriginalRouteInfo.addEventListener("click",()=>{
  if(!validOriginalInfoCount()||!confirm("Alle lokalen und integrierten Tourinfos ausblenden und die sieben unveränderten Originalinformationen anzeigen?"))return;
  try{saveOriginalRouteInfos({});saveBuiltInInfoDisabled({"1":true,"2":true,"3":true,"4":true,"5":true,"6":true,"7":true});renderDay(currentDay)}catch(e){tourInfoStatus.className="routeInfoStatus error";tourInfoStatus.textContent="Die Tour-Routeninformationen konnten nicht zurückgesetzt werden."}
});
restoreBuiltInTourInfo.addEventListener("click",()=>{
  if(!disabledBuiltInInfoCount()||!confirm("Die dauerhaft integrierten Tourinfos für alle sieben Standardrouten wieder anzeigen? Lokale Aktualisierungen bleiben erhalten."))return;
  try{saveBuiltInInfoDisabled({});renderDay(currentDay)}catch(e){tourInfoStatus.className="routeInfoStatus error";tourInfoStatus.textContent="Die integrierten Tourinfos konnten nicht wiederhergestellt werden."}
});
routeOriginalBtn.addEventListener("click",()=>selectRoute(currentDay,"original"));
routeAlternativeBtn.addEventListener("click",()=>selectRoute(currentDay,"alternative"));
routeGpxInput.addEventListener("change",async()=>{
  const file=routeGpxInput.files&&routeGpxInput.files[0];if(!file)return;
  routeImportStatus.textContent="GPX-Alternative wird geprüft …";
  try{
    if(!/\.gpx$/i.test(file.name))throw new Error("Bitte eine Datei mit der Endung .gpx auswählen.");
    if(file.size>2500000)throw new Error("Die GPX-Datei ist größer als 2,5 MB und kann nicht sicher lokal gespeichert werden.");
    if(alternativeRoutes[String(currentDay)]&&!confirm(`Die vorhandene Alternative für Tag ${currentDay} durch „${file.name}“ ersetzen?`)){routeImportStatus.textContent="Vorhandene Alternative bleibt unverändert.";return}
    const route=parseGpxAlternative(currentDay,file.name,await file.text());saveAlternative(currentDay,route);saveRouteChoice(currentDay,"alternative");clearRouteDependentState(currentDay);renderDay(currentDay);await loadWeather();
  }catch(e){routeImportStatus.textContent=e&&e.message?e.message:"Die GPX-Alternative konnte nicht importiert werden."}
  finally{routeGpxInput.value=""}
});
deleteAlternativeRoute.addEventListener("click",()=>{
  const alt=alternativeRoutes[String(currentDay)];if(!alt)return;
  if(!confirm(`Waterkaarten-Alternative „${alt.title}“ für Tag ${currentDay} wirklich löschen? Die Originalroute bleibt erhalten.`))return;
  try{
    const nextRoutes={...alternativeRoutes},nextChoices={...routeChoices,[String(currentDay)]:"original"};delete nextRoutes[String(currentDay)];
    localStorage.setItem(ALT_ROUTE_STORAGE,JSON.stringify(nextRoutes));localStorage.setItem(ROUTE_CHOICE_STORAGE,JSON.stringify(nextChoices));alternativeRoutes=nextRoutes;routeChoices=nextChoices;clearRouteDependentState(currentDay);renderDay(currentDay);loadWeather();
  }catch(e){routeImportStatus.textContent="Die Alternative konnte nicht aus dem lokalen Speicher gelöscht werden."}
});
window.addEventListener('load',()=>{renderDay(1);renderOverviews();const p=getShipProfile();setProfileInputs(p);renderShipProfile(p);saveShipProfile.addEventListener('click',()=>{saveProfile();renderNautikShip();});resetShipProfile.addEventListener('click',()=>{resetProfile();renderNautikShip();});renderNautikShip();scanNautical.addEventListener('click',scanNauticalRoute);loadWeather();});
