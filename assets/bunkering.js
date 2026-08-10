(function(){
  "use strict";
  const data=window.FSC_BUNKERING_DATA;
  if(!data)return;

  const STORAGE_KEY="fsc_bunkering_state_v1";
  const EMPTY={items:{},custom:[]};
  const byId=id=>document.getElementById(id);
  const esc=value=>String(value??"").replace(/[&<>"']/g,char=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[char]));

  function loadState(){
    try{
      const stored=JSON.parse(localStorage.getItem(STORAGE_KEY)||"null");
      if(!stored||typeof stored!=="object")return structuredCloneFallback(EMPTY);
      return {
        items:stored.items&&typeof stored.items==="object"?stored.items:{},
        custom:Array.isArray(stored.custom)?stored.custom.filter(validCustom):[]
      };
    }catch(error){return structuredCloneFallback(EMPTY)}
  }
  function structuredCloneFallback(value){return JSON.parse(JSON.stringify(value))}
  function validCustom(item){return item&&typeof item.id==="string"&&typeof item.label==="string"&&data.categories.some(category=>category.id===item.categoryId)}

  let state=loadState();
  let filter="all";

  function saveState(){
    try{
      localStorage.setItem(STORAGE_KEY,JSON.stringify(state));
      const status=byId("bunkerSaveStatus");
      status.textContent=`Auf diesem Gerät gespeichert · ${new Date().toLocaleTimeString("de-DE",{hour:"2-digit",minute:"2-digit"})}`;
      status.classList.remove("error");
      return true;
    }catch(error){
      const status=byId("bunkerSaveStatus");
      status.textContent="Speichern nicht möglich – Browserspeicher prüfen.";
      status.classList.add("error");
      return false;
    }
  }

  function allItems(){
    const builtIn=data.categories.flatMap(category=>category.items.map(item=>({...item,categoryId:category.id,custom:false})));
    return builtIn.concat(state.custom.map(item=>({...item,custom:true})));
  }
  function itemState(id){
    const current=state.items[id];
    return current&&typeof current==="object"?current:{done:false,amount:"",owner:""};
  }
  function categoryItems(categoryId){return allItems().filter(item=>item.categoryId===categoryId)}
  function visible(item){const done=!!itemState(item.id).done;return filter==="all"||(filter==="open"&&!done)||(filter==="done"&&done)}

  function renderProgress(){
    const items=allItems(),done=items.filter(item=>itemState(item.id).done).length,total=items.length,percent=total?Math.round(done/total*100):0;
    byId("bunkerDoneCount").textContent=done;
    byId("bunkerTotalCount").textContent=total;
    byId("bunkerPercent").textContent=`${percent} %`;
    byId("bunkerProgressBar").style.width=`${percent}%`;
    byId("bunkerProgressBar").parentElement.setAttribute("aria-valuenow",String(percent));
    byId("bunkerProgressText").textContent=done===total&&total?"Alles erledigt – klar zum Ablegen!":`${total-done} Einträge noch offen`;
  }

  function itemMarkup(item){
    const current=itemState(item.id),done=!!current.done;
    return `<article class="bunkerItem${done?" done":""}" data-bunker-id="${esc(item.id)}">
      <label class="bunkerCheck"><input type="checkbox" data-field="done" ${done?"checked":""}><span aria-hidden="true"></span><strong>${esc(item.label)}</strong></label>
      <label class="bunkerMeta"><small>MENGE / HINWEIS</small><input type="text" data-field="amount" value="${esc(current.amount||"")}" placeholder="z. B. 2 Stück"></label>
      <label class="bunkerMeta"><small>ZUSTÄNDIG</small><input type="text" data-field="owner" value="${esc(current.owner||"")}" placeholder="Name"></label>
      ${item.custom?'<button class="bunkerDelete" type="button" data-delete-custom aria-label="Eigenen Eintrag löschen" title="Eigenen Eintrag löschen">×</button>':''}
    </article>`;
  }

  function renderCategories(){
    const oldOpen=new Set([...document.querySelectorAll(".bunkerCategory[open]")].map(element=>element.dataset.category));
    const firstRender=!document.querySelector(".bunkerCategory");
    byId("bunkerCategories").innerHTML=data.categories.map((category,index)=>{
      const items=categoryItems(category.id),shown=items.filter(visible),done=items.filter(item=>itemState(item.id).done).length;
      const shouldOpen=firstRender?index===0:oldOpen.has(category.id);
      return `<details class="bunkerCategory" data-category="${esc(category.id)}" ${shouldOpen?"open":""}>
        <summary><span class="bunkerCategoryIcon">${esc(category.icon)}</span><div><strong>${esc(category.title)}</strong><small>${done} von ${items.length} erledigt</small></div><span class="bunkerCategoryCount">${shown.length}</span></summary>
        <div class="bunkerItems">${shown.length?shown.map(itemMarkup).join(""):'<p class="bunkerEmpty">In diesem Filter gibt es hier keine Einträge.</p>'}</div>
      </details>`;
    }).join("");
    renderProgress();
  }

  function updateItem(id,field,value){
    const current={...itemState(id)};
    current[field]=field==="done"?!!value:String(value);
    state.items[id]=current;
    saveState();
    if(field==="done")renderCategories();else renderProgress();
  }

  function makeCustomId(){
    if(window.crypto&&typeof window.crypto.randomUUID==="function")return `custom-${window.crypto.randomUUID()}`;
    return `custom-${Date.now()}-${Math.random().toString(36).slice(2,9)}`;
  }
  function addCustomItem(){
    const input=byId("bunkerNewItem"),select=byId("bunkerNewCategory"),label=input.value.trim();
    if(!label){input.focus();return}
    const categoryId=data.categories.some(category=>category.id===select.value)?select.value:data.categories[0].id;
    state.custom.push({id:makeCustomId(),label,categoryId});
    if(saveState()){
      input.value="";
      filter="all";
      syncFilterButtons();
      renderCategories();
      const category=document.querySelector(`.bunkerCategory[data-category="${categoryId}"]`);if(category)category.open=true;
      input.focus();
    }
  }
  function deleteCustomItem(id){
    const item=state.custom.find(entry=>entry.id===id);if(!item)return;
    if(!confirm(`Eigenen Eintrag „${item.label}“ löschen?`))return;
    state.custom=state.custom.filter(entry=>entry.id!==id);delete state.items[id];saveState();renderCategories();
  }
  function resetProgress(){
    if(!confirm("Alle Häkchen, Mengen und Zuständigkeiten zurücksetzen? Eigene Ergänzungen bleiben erhalten."))return;
    state.items={};saveState();renderCategories();
  }
  function syncFilterButtons(){document.querySelectorAll("[data-bunker-filter]").forEach(button=>button.classList.toggle("active",button.dataset.bunkerFilter===filter))}

  function init(){
    const root=byId("screen-bunkern");if(!root)return;
    const select=byId("bunkerNewCategory");
    select.innerHTML=data.categories.map(category=>`<option value="${esc(category.id)}">${esc(category.title)}</option>`).join("");
    byId("bunkerAddItem").addEventListener("click",addCustomItem);
    byId("bunkerNewItem").addEventListener("keydown",event=>{if(event.key==="Enter"){event.preventDefault();addCustomItem()}});
    byId("bunkerReset").addEventListener("click",resetProgress);
    document.querySelectorAll("[data-bunker-filter]").forEach(button=>button.addEventListener("click",()=>{filter=button.dataset.bunkerFilter;syncFilterButtons();renderCategories()}));
    byId("bunkerCategories").addEventListener("change",event=>{
      const row=event.target.closest("[data-bunker-id]");if(!row)return;
      const field=event.target.dataset.field;if(field)updateItem(row.dataset.bunkerId,field,event.target.type==="checkbox"?event.target.checked:event.target.value);
    });
    byId("bunkerCategories").addEventListener("input",event=>{
      const row=event.target.closest("[data-bunker-id]");if(!row||event.target.type==="checkbox")return;
      const field=event.target.dataset.field;if(field)updateItem(row.dataset.bunkerId,field,event.target.value);
    });
    byId("bunkerCategories").addEventListener("click",event=>{
      const button=event.target.closest("[data-delete-custom]");if(!button)return;
      const row=button.closest("[data-bunker-id]");if(row)deleteCustomItem(row.dataset.bunkerId);
    });
    syncFilterButtons();renderCategories();
  }

  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init);else init();
})();
