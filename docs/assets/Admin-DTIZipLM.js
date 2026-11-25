import{j as e,r as R,n as ge,m as qe,a as Le,b as ze,c as rr,o as Re,C as Se,p as nr,s as ar,d as Ve,e as Pe,f as tr,g as sr,h as ir,i as or,k as lr,l as dr,q as cr,t as hr,u as Me,v as ur,w as Je,x as mr,y as Xe,_ as $e,z as Ae,A as fr,B as gr,D as pr,E as br,F as xr}from"./index-CkntnPqN.js";var vr=typeof globalThis<"u"?globalThis:typeof window<"u"?window:typeof global<"u"?global:typeof self<"u"?self:{};function yr(a){return a&&a.__esModule&&Object.prototype.hasOwnProperty.call(a,"default")?a.default:a}function me({label:a,children:m}){return e.jsxs("label",{className:"adm-field",children:[e.jsx("span",{children:a}),m]})}function M({label:a,value:m="",change:l,type:d="text",readOnly:i=!1}){return e.jsx(me,{label:a,children:e.jsx("input",{type:d,value:m,onChange:x=>l==null?void 0:l(x.target.value),onInput:d==="date"?x=>l==null?void 0:l(x.currentTarget.value):void 0,onBlur:d==="date"?x=>l==null?void 0:l(x.currentTarget.value):void 0,readOnly:i})})}function oe({label:a,checked:m,change:l}){return e.jsxs("label",{className:"adm-toggle",children:[e.jsx("input",{type:"checkbox",checked:m,onChange:d=>l(d.target.checked)}),a]})}function X({label:a,value:m,change:l,options:d,empty:i}){return e.jsx(me,{label:a,children:e.jsxs("select",{value:m,onChange:x=>l(x.target.value),children:[i!==void 0&&e.jsx("option",{value:"",children:i}),d.map(x=>e.jsx("option",{value:x.id,children:x.label},x.id))]})})}const be=a=>Object.values(a).map(m=>({id:m.slug,label:m.name}));function Be({label:a,options:m,values:l,change:d}){const[i,x]=R.useState(""),o=ge(i),g=m.filter(c=>ge(c.label).includes(o));return e.jsxs("fieldset",{className:"adm-choice-checks",children:[e.jsxs("legend",{children:[a," · выбрано ",l.length]}),e.jsx(M,{label:"Поиск: "+a.toLowerCase(),type:"search",value:i,change:x}),e.jsxs("div",{className:"adm-choice-list",children:[g.map(c=>e.jsx(oe,{label:c.label,checked:l.includes(c.id),change:j=>d(j?[...l,c.id]:l.filter(E=>E!==c.id))},c.id)),!g.length&&e.jsx("small",{children:"Совпадений нет."})]})]})}function Ze({page:a,change:m,dict:l}){return e.jsxs("div",{className:"adm-row",children:[e.jsx(X,{label:"Жанр",value:a.genre??"",empty:"Все жанры",options:be(l.genres),change:d=>m({...a,genre:d||void 0})}),e.jsx(X,{label:"Платформа",value:a.platform??"",empty:"Все платформы",options:be(l.platforms),change:d=>m({...a,platform:d||void 0})}),e.jsx(X,{label:"Год",value:a.year??"",empty:"Все годы",options:(l.catalogYears??l.filter_lists.years).map(d=>{var i;return{id:d,label:((i=l.yearLabels)==null?void 0:i[d])??d}}),change:d=>m({...a,year:d||void 0})})]})}function We({games:a,value:m,change:l,searchLabel:d}){const[i,x]=R.useState(""),o=R.useMemo(()=>[...a].sort((k,v)=>k.name.localeCompare(v.name,"ru")),[a]),g=ge(i),c=o.filter(k=>qe(k,g)||k.id.includes(i.trim().toLowerCase())),j=o.find(k=>k.id===m),E=j&&!c.includes(j)?[j,...c]:c;return e.jsxs("div",{className:"adm-row",children:[e.jsx(M,{label:d,type:"search",value:i,change:x}),e.jsx(X,{label:"Игра",value:m,change:l,empty:c.length?"Выберите игру":"Совпадений нет",options:E.map(k=>({id:k.id,label:k.name+" · "+k.id}))})]})}function Ce({index:a,count:m,change:l}){return e.jsxs("span",{className:"adm-actions",children:[e.jsx("button",{type:"button","aria-label":"Выше",disabled:!a,onClick:()=>l(a-1),children:"↑"}),e.jsx("button",{type:"button","aria-label":"Ниже",disabled:a>=m-1,onClick:()=>l(a+1),children:"↓"})]})}function Ee(a,m,l){const d=[...a],[i]=d.splice(m,1);return d.splice(l,0,i),d}function Te({label:a,value:m,change:l}){const[d,i]=R.useState(""),x=/^data:image\/(png|jpeg|webp|gif|avif);base64,/i;return e.jsxs("fieldset",{className:"adm-image",children:[e.jsx("legend",{children:a}),m&&e.jsx("img",{src:m,alt:"Предпросмотр: "+a,onError:o=>{o.currentTarget.hidden=!0}},m),e.jsx(M,{label:a+" — URL",value:x.test(m??"")?"":m,change:l}),e.jsx(me,{label:a+" — файл",children:e.jsx("input",{type:"file",accept:"image/png,image/jpeg,image/webp,image/gif,image/avif",onChange:async o=>{var E;const g=o.target,c=(E=g.files)==null?void 0:E[0];if(g.value="",!c)return;if(!/^image\/(png|jpeg|webp|gif|avif)$/.test(c.type)||c.size>2*1024**2){i("Допустимы JPEG, PNG, WebP, GIF и AVIF до 2 МБ.");return}const j=new FileReader;j.onload=async()=>{try{const k=new Image;k.src=String(j.result),await k.decode(),l(k.src),i("")}catch{i("Не удалось прочитать файл как изображение.")}},j.onerror=()=>i("Не удалось прочитать файл."),j.readAsDataURL(c)}})}),m&&e.jsx("button",{type:"button",className:"adm-danger",onClick:()=>l(""),children:"Убрать изображение"}),d&&e.jsx("p",{className:"adm-error",role:"alert",children:d})]})}function jr({draft:a,change:m}){const[l,d]=R.useState("platforms"),[i,x]=R.useState(""),[o,g]=R.useState(""),[c,j]=R.useState(""),E=a.filters[l]??Re(l),k=h=>m({...a,filters:{...a.filters,[l]:h}}),v=(h,y)=>k(E.map((w,p)=>p===h?{...w,...y}:w)),b=()=>{const h=i.trim(),y=o.trim();if(!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(h)||/^\d{4}$/.test(h)||!y||["genres","platforms"].some(w=>(a.filters[w]??Re(w)).some(p=>p.id===h))){j("Укажите свободный ID из латинских букв, цифр и дефисов и название.");return}k([...E,{id:h,label:y,visible:!0}]),x(""),g(""),j("")};return e.jsxs("div",{className:"adm-form",children:[e.jsx("h2",{children:"Фильтры"}),e.jsxs("div",{className:"adm-row",children:[e.jsx(X,{label:"Справочник",value:l,change:h=>{d(h),j("")},options:[{id:"platforms",label:"Платформы"},{id:"genres",label:"Жанры"},{id:"years",label:"Годы"},{id:"rating",label:"Оценки"}]}),e.jsx("button",{onClick:()=>{const h=Re(l);k([...h.map(y=>E.find(w=>w.id===y.id)??y),...E.filter(y=>!h.some(w=>w.id===y.id))])},children:"Восстановить исходный порядок"})]}),e.jsx("p",{className:"adm-note",children:"ID определяет адрес. Скрытие значения действует в списке фильтра. Числовые границы баллов фиксированы."}),e.jsx("div",{className:"adm-table",children:e.jsxs("table",{children:[e.jsx("thead",{children:e.jsxs("tr",{children:[e.jsx("th",{children:"ID"}),e.jsx("th",{children:"Название"}),e.jsx("th",{children:"Видимость"}),e.jsx("th",{children:"Порядок"})]})}),e.jsx("tbody",{children:E.map((h,y)=>e.jsxs("tr",{children:[e.jsx("td",{children:h.id}),e.jsx("td",{children:e.jsx(M,{label:"Название",value:h.label,change:w=>v(y,{label:w})})}),e.jsx("td",{children:e.jsx(oe,{label:"Показывать",checked:h.visible,change:w=>v(y,{visible:w})})}),e.jsx("td",{children:e.jsx(Ce,{index:y,count:E.length,change:w=>k(Ee(E,y,w))})})]},h.id))})]})}),(l==="genres"||l==="platforms")&&e.jsxs("div",{className:"adm-row",children:[e.jsx(M,{label:"Новый ID",value:i,change:x}),e.jsx(M,{label:"Новое название",value:o,change:g}),e.jsx("button",{className:"adm-extra",onClick:b,children:"Добавить значение"})]}),c&&e.jsx("p",{role:"alert",className:"adm-error",children:c})]})}function kr({draft:a,games:m,dict:l,change:d,apply:i}){const[x,o]=R.useState(""),[g,c]=R.useState({id:"",gameId:"",position:1,scope:"main",path:Se.base,active:!0,start:"",end:""}),j=m.find(h=>h.id===x),E=nr(g.path,"",l),k=E.kind==="ok"?E.state:{page:1},v=j!=null&&j.rating?ar(m.filter(h=>{var y,w;return((y=h.rating)==null?void 0:y.value)===((w=j.rating)==null?void 0:w.value)})):[],b=h=>c({...g,...h});return e.jsxs("div",{className:"adm-form",children:[e.jsx("h2",{children:"Приоритет при одинаковой оценке"}),e.jsx(We,{games:m,value:x,change:o,searchLabel:"Поиск игры для приоритета"}),j&&e.jsxs(e.Fragment,{children:[e.jsx(M,{label:"Приоритет",type:"number",value:j.priority??0,change:h=>i({...j,priority:+h})}),e.jsxs("p",{children:[v.length," игр с такой оценкой. Текущая позиция в группе: ",v.findIndex(h=>h.id===j.id)+1||"—","."]}),e.jsxs("div",{className:"adm-actions",children:[e.jsx("button",{disabled:!v.length||v[0]===j,onClick:()=>i({...j,priority:Math.max(...v.map(h=>h.priority??0))+1}),children:"В начало группы"}),e.jsx("button",{disabled:!v.length||v[v.length-1]===j,onClick:()=>i({...j,priority:Math.min(...v.map(h=>h.priority??0))-1}),children:"В конец группы"})]})]}),e.jsx("h2",{children:"Временные закрепления"}),e.jsx("p",{className:"adm-note",children:"Закрепление применяется при сортировке «Высокая оценка», если игра соответствует фильтрам и допуску в каталог."}),e.jsx("div",{className:"adm-table",children:e.jsxs("table",{children:[e.jsx("thead",{children:e.jsxs("tr",{children:[e.jsx("th",{children:"Игра"}),e.jsx("th",{children:"Позиция"}),e.jsx("th",{children:"Область"}),e.jsx("th",{children:"Период"}),e.jsx("th",{children:"Активно"}),e.jsx("th",{})]})}),e.jsx("tbody",{children:a.pins.map(h=>{var y;return e.jsxs("tr",{children:[e.jsx("td",{children:((y=m.find(w=>w.id===h.gameId))==null?void 0:y.name)??h.gameId}),e.jsx("td",{children:h.position}),e.jsx("td",{children:h.scope==="all"?"Все подходящие":h.scope==="main"?"Главная":h.path}),e.jsxs("td",{children:[h.start||"—"," → ",h.end||"—"]}),e.jsx("td",{children:h.active?"Да":"Нет"}),e.jsxs("td",{className:"adm-actions",children:[e.jsx("button",{onClick:()=>c(h),children:"Редактировать"}),e.jsx("button",{className:"adm-danger",onClick:()=>{confirm("Удалить закрепление?")&&d({...a,pins:a.pins.filter(w=>w.id!==h.id)})},children:"Удалить"})]})]},h.id)})})]})}),e.jsx(We,{games:m,value:g.gameId,change:h=>b({gameId:h}),searchLabel:"Поиск игры для закрепления"}),e.jsxs("div",{className:"adm-row",children:[e.jsx(M,{label:"Позиция",type:"number",value:g.position,change:h=>b({position:+h})}),e.jsx(M,{label:"Начало",type:"date",value:g.start,change:h=>b({start:h})}),e.jsx(M,{label:"Окончание",type:"date",value:g.end,change:h=>b({end:h})}),e.jsx(X,{label:"Область закрепления",value:g.scope,change:h=>b({scope:h}),options:[{id:"main",label:"Главная"},{id:"page",label:"Конкретная страница"},{id:"all",label:"Все подходящие"}]}),e.jsx(oe,{label:"Активно",checked:g.active,change:h=>b({active:h})})]}),g.scope==="page"&&e.jsx(Ze,{page:k,dict:l,change:h=>b({path:Ve(h)})}),e.jsx("button",{className:"adm-extra",disabled:!g.gameId||!Number.isInteger(g.position)||g.position<1||g.position>200||!!(g.start&&g.end&&g.start>g.end),onClick:()=>{const h={...g,id:g.id||crypto.randomUUID()};d({...a,pins:g.id?a.pins.map(y=>y.id===g.id?h:y):[...a.pins,h]}),c({...g,id:"",gameId:""})},children:g.id?"Применить закрепление":"Добавить закрепление"})]})}function Qe({items:a,change:m,kind:l}){const d=(i,x)=>m(a.map((o,g)=>g===i?{...o,...x}:o));return e.jsxs(e.Fragment,{children:[a.map((i,x)=>e.jsxs("details",{className:"adm-story",children:[e.jsx("summary",{children:i.title||"Новый материал"}),e.jsx(M,{label:"Заголовок материала",value:i.title,change:o=>d(x,{title:o})}),e.jsx(M,{label:"Ссылка",type:"url",value:i.url,change:o=>d(x,{url:o})}),l==="upper"&&e.jsx(M,{label:"Название плашки",value:i.label,change:o=>d(x,{label:o})}),l==="lower"&&e.jsxs(e.Fragment,{children:[e.jsx(M,{label:"Название блога",value:i.blog,change:o=>d(x,{blog:o})}),e.jsx(M,{label:"URL обложки материала",value:i.image,change:o=>d(x,{image:o})})]}),l==="news"&&e.jsx(M,{label:"Подпись даты",value:i.date,change:o=>d(x,{date:o})}),e.jsxs("div",{className:"adm-row",children:[e.jsx(M,{label:"Начало публикации",type:"date",value:i.start,change:o=>d(x,{start:o})}),e.jsx(M,{label:"Окончание публикации",type:"date",value:i.end,change:o=>d(x,{end:o})}),e.jsx(oe,{label:"Показывать",checked:i.visible!==!1,change:o=>d(x,{visible:o})})]}),e.jsxs("div",{className:"adm-actions",children:[e.jsx(Ce,{index:x,count:a.length,change:o=>m(Ee(a,x,o))}),e.jsx("button",{className:"adm-danger",onClick:()=>{confirm("Удалить материал из списка?")&&m(a.filter((o,g)=>x!==g))},children:"Удалить"})]})]},x)),e.jsx("button",{className:"adm-extra",onClick:()=>m([...a,{title:"",url:"",visible:!0}]),children:"Добавить материал"})]})}function wr({draft:a,change:m}){const[l,d]=R.useState("upper");return e.jsxs("div",{className:"adm-form",children:[e.jsx("h2",{children:"Подборки"}),e.jsx(X,{label:"Тип подборок",value:l,change:i=>d(i),options:[{id:"upper",label:"Верхние плашки"},{id:"lower",label:"Нижние материалы"}]}),e.jsx(Qe,{items:a[l],change:i=>m({...a,[l]:i}),kind:l},l)]})}function Sr({draft:a,games:m,change:l}){const[d,i]=R.useState("recent"),[x,o]=R.useState(""),g=a.blocks[d],c=b=>l({...a,blocks:{...a.blocks,[d]:{...g,...b}}}),j=a.blockOrder.indexOf(d),E=d==="recent"||d==="upcoming",k=d==="news"||d==="blogs",v=k?(g.mode==="manual"?g.stories??[]:Le[d]).filter(b=>b.url).map(b=>({id:b.url,label:b.title})):m.map(b=>({id:b.id,label:b.name})).sort((b,h)=>b.label.localeCompare(h.label));return e.jsxs("div",{className:"adm-form",children:[e.jsx("h2",{children:"Блоки страницы"}),e.jsx("ol",{children:a.blockOrder.map(b=>e.jsxs("li",{children:[a.blocks[b].title,!a.blocks[b].visible&&" (скрыт)"]},b))}),e.jsxs("div",{className:"adm-row",children:[e.jsx(X,{label:"Блок",value:d,change:b=>{i(b),o("")},options:ze.map(b=>({id:b,label:rr[b]}))}),e.jsx(Ce,{index:j,count:ze.length,change:b=>l({...a,blockOrder:Ee(a.blockOrder,j,b)})})]}),e.jsxs("div",{className:"adm-row",children:[e.jsx(M,{label:"Заголовок блока",value:g.title,change:b=>c({title:b})}),e.jsx(M,{label:"Количество элементов",type:"number",value:g.limit,change:b=>c({limit:+b})}),e.jsx(oe,{label:"Показывать блок",checked:g.visible,change:b=>c({visible:b})})]}),d==="recent"&&e.jsx(M,{label:"Период недавних релизов, дней",type:"number",value:a.settings.recentDays,change:b=>l({...a,settings:{...a.settings,recentDays:+b}})}),k&&e.jsxs(e.Fragment,{children:[e.jsx(X,{label:"Режим наполнения",value:g.mode,change:b=>c({mode:b}),options:[{id:"auto",label:"Из локального снимка ленты"},{id:"manual",label:"Ручной"}]}),g.mode==="manual"&&e.jsxs(e.Fragment,{children:[e.jsx("button",{className:"adm-extra",onClick:()=>c({stories:[...g.stories??[],...Le[d].filter(b=>{var h;return!((h=g.stories)!=null&&h.some(y=>y.url===b.url))})]}),children:"Добавить материалы из снимка"}),e.jsx(Qe,{items:g.stories??[],change:b=>c({stories:b}),kind:d==="news"?"news":"lower"})]})]}),(k||E)&&e.jsxs(e.Fragment,{children:[e.jsx("h3",{children:d==="blogs"?"Главный материал (первый) и дополнительные":"Закреплённые записи"}),E&&e.jsx("p",{className:"adm-note",children:"Лента заполняется автоматически. В закреплении отображаются игры, подходящие по дате, статусу и фильтрам."}),e.jsxs("div",{className:"adm-row",children:[e.jsx(X,{label:"Запись для закрепления",value:x,empty:"Выберите запись",options:v,change:o}),e.jsx("button",{disabled:!x||g.picks.includes(x),onClick:()=>{c({picks:[...g.picks,x]}),o("")},children:"Закрепить в блоке"})]}),e.jsx("ol",{children:g.picks.map((b,h)=>{var y;return e.jsxs("li",{children:[((y=v.find(w=>w.id===b))==null?void 0:y.label)??b," ",e.jsx(Ce,{index:h,count:g.picks.length,change:w=>c({picks:Ee(g.picks,h,w)})}),e.jsx("button",{className:"adm-danger",onClick:()=>c({picks:g.picks.filter(w=>w!==b)}),children:"Убрать закрепление"})]},b)})})]}),d==="editorial"&&e.jsx(me,{label:"Редактирование",children:e.jsx("span",{children:"Содержание и колонки настраиваются во вкладке «SEO-тексты»."})})]})}const Cr={genre:"Жанр",platform:"Платформа",year:"Год",genre_platform:"Жанр и платформа",genre_year:"Жанр и год",platform_year:"Платформа и год",genre_platform_year:"Жанр, платформа и год"};function Ge({draft:a,dict:m,change:l,onlyText:d=!1}){var A,V,_,n;const[i,x]=R.useState("main"),[o,g]=R.useState({page:1}),[c,j]=R.useState("genre"),k={...i==="main"?{page:1}:i==="page"?o:{page:1,genre:c.includes("genre")?Object.keys(m.genres)[0]:void 0,platform:c.includes("platform")?Object.keys(m.platforms)[0]:void 0,year:c.includes("year")?(m.catalogYears??m.filter_lists.years)[0]:void 0},defaultSort:a.settings.defaultSort},v=Ve(k),b=(i==="template"?a.templates[c]:a.pages[v])??{},h=r=>{l(i==="template"?{...a,templates:{...a.templates,[c]:r}}:{...a,pages:{...a.pages,[v]:r}})},y=a.templates[Pe(k)],w=tr(sr(ir(a),k,a),1,a.settings.perPage),p=or(k,w,m,{minIndexable:a.settings.minIndexable,page:a.pages[v],template:y}),G=lr(a,v,Pe(k)),L=dr(k,G,m),H=r=>h({...b,copy:{...b.copy,...r}});return e.jsxs("div",{className:"adm-form",children:[e.jsx("h2",{children:d?"SEO-тексты":"SEO"}),e.jsxs("div",{className:"adm-row",children:[e.jsx(X,{label:"Уровень SEO",value:i,change:x,options:[{id:"main",label:"Главная каталога"},{id:"page",label:"Конкретная страница"},...d?[]:[{id:"template",label:"Шаблон страниц"}]]}),i==="template"&&e.jsx(X,{label:"Тип шаблона",value:c,change:r=>j(r),options:cr.map(r=>({id:r,label:Cr[r]}))})]}),i==="page"&&e.jsx(Ze,{dict:m,page:o,change:g}),i==="template"&&e.jsxs("p",{className:"adm-note",children:["Переменные: [[жанр]], [[платформа]], [[год]]. Для предпросмотра выбрана страница ",v,"."]}),!d&&e.jsxs(e.Fragment,{children:[["h1","title","description"].map(r=>e.jsxs("div",{children:[e.jsx(me,{label:r==="h1"?"H1":r==="title"?"Title":"Description",children:e.jsx("textarea",{rows:r==="description"?3:1,value:b[r]??"",placeholder:p[r],onChange:t=>h({...b,[r]:t.target.value||void 0})})}),r!=="h1"&&e.jsxs("small",{children:[(b[r]??p[r]).length," симв."]}),e.jsxs("button",{type:"button",disabled:b[r]===void 0,onClick:()=>h({...b,[r]:void 0}),children:["Сбросить ",r]})]},r)),e.jsxs("dl",{className:"adm-preview",children:[e.jsx("dt",{children:"Итоговый URL"}),e.jsx("dd",{children:p.url}),e.jsx("dt",{children:"Canonical"}),e.jsx("dd",{children:p.canonical}),e.jsx("dt",{children:"Robots"}),e.jsx("dd",{children:p.robots}),e.jsx("dt",{children:"H1"}),e.jsx("dd",{children:p.h1}),e.jsx("dt",{children:"Title"}),e.jsx("dd",{children:p.title}),e.jsx("dt",{children:"Description"}),e.jsx("dd",{children:p.description})]})]}),e.jsx(M,{label:"Заголовок SEO-текста",value:(A=b.copy)==null?void 0:A.heading,change:r=>H({heading:r||void 0})}),e.jsx(me,{label:"SEO-текст",children:e.jsx("textarea",{rows:9,value:((V=b.copy)==null?void 0:V.body)??"",placeholder:L==null?void 0:L.paragraphs.join(`

`),onChange:r=>H({body:r.target.value||void 0})})}),e.jsx("small",{children:"Пустая строка отделяет абзацы. ## Подзаголовок, **жирный**, *курсив*, [ссылка](https://…), - элемент списка."}),e.jsxs("div",{className:"adm-actions",children:[e.jsx(oe,{label:"Показывать SEO-текст",checked:((_=b.copy)==null?void 0:_.visible)??(G==null?void 0:G.visible)??!0,change:r=>H({visible:r})}),e.jsx(X,{label:"Количество колонок",value:String(((n=b.copy)==null?void 0:n.columns)??(G==null?void 0:G.columns)??3),change:r=>H({columns:+r}),options:[1,2,3].map(r=>({id:String(r),label:String(r)}))}),e.jsx("button",{type:"button",disabled:!b.copy,onClick:()=>h({...b,copy:void 0}),children:"Сбросить SEO-текст"})]}),L&&e.jsx(hr,{...L}),v!==Se.base&&e.jsx("small",{children:v})]})}const Er=`GTA 5|gta-5|333\r
Standoff 2|standoff-2|200\r
FIFA Online 4|fifa-online-4|136\r
WOT Blitz|wot-blitz|134\r
Hearthstone|hearthstone|122\r
Roblox|roblox|116\r
Fortnite|fortnite|100\r
Free Fire|garena-free-fire|77\r
Counter-Strike: Global Offensive|cs-go|76\r
Valorant|valorant|57\r
Among Us|among-us|38\r
PUBG|pubg|35\r
World of Tanks|world-of-tanks|35\r
Genshin Impact|genshin-impact|33\r
Call of Duty: Warzone|call-of-duty-warzone|33\r
Call of Duty: Modern Warfare (2019)|cod-mw-2019|32\r
Football Manager 2025|football-manager-2025|30\r
FIFA 21|fifa-21|30\r
Dota 2|dota-2|30\r
Overwatch|overwatch|30\r
FIFA 19|fifa-19|28\r
Minecraft|minecraft|28\r
Heroes of Might and Magic 3|heroes-of-might-and-magic-3|27\r
Rainbow Six Siege|rainbow-six|27\r
Brawl Stars|brawl-stars|26\r
GTA 6|gta-6|26\r
Cyberpunk 2077|cyberpunk-2077|26\r
Football Manager 2019|fm-2019|26\r
Football Manager 2024|football-manager-2024|25\r
World of Warcraft|wow|25\r
FIFA 22|fifa-22|24\r
STALKER 2|stalker-2|24\r
Heroes of the Storm|heroes-of-the-storm|24\r
efootball PES|efootball|23\r
FIFA 20|fifa-20|23\r
StarCraft|starcraft|23\r
Adopt me!|adopt-me|19\r
Counter-Strike 2|counter-strike-2|18\r
FIFA 23|fifa-23|18\r
GTA: San Andreas|grand-theft-auto-san-andreas|18\r
Murder Mystery 2|murder-mystery-2|17\r
Far Cry 3|far-cry-3|16\r
PUBG Mobile|pubg-mobile|16\r
Battlefield V|battlefield-5|16\r
Pro Evolution Soccer 2019|pes2019|16\r
Red Dead Redemption 2|rdr-2|15\r
Skyrim|skyrim|15\r
Counter-Strike 1.6|counter-strike-1-6|15\r
PUBG: New State|pubg-new-state|14\r
Mobile Legends: Bang Bang|mobile-legends|13\r
League of Legends|league-of-legends|13\r
Ведьмак 3: Дикая Охота|witcher-3|13\r
GTA Online|gta-online|11\r
Гвинт|gwent|10\r
Football Manager 2021|football-manager-2021|9\r
Mass Effect|mass-effect|9\r
Football Manager 2020|football-manager-2020|9\r
Pro Evolution Soccer 2020|pro-evolution-soccer-2020|9\r
GTA Vice City|grand-theft-auto-vice-city|9\r
Apex Legends|apex-legends|9\r
Call of Duty|call-of-duty|9\r
99 ночей в лесу|99-nights-in-the-forest|8\r
Fishing Clash|fishing-clash|8\r
Dota Underlords|dota-underlords|8\r
Artifact|artifact|8\r
War Thunder|war-thunder|8\r
GTA 4|gta-4|7\r
Warcraft|warcraft|7\r
Football Manager 2023|football-manager-2023|6\r
Muscle Legends|muscle-legends|6\r
Blox Fruits|blox-fruits|6\r
Raid: Shadow Legends|raid-shadow-legends|6\r
Call of Duty: Mobile|call-of-duty-mobile|6\r
Call of Duty: Black Ops 4|cod-bo-4|6\r
FIFA 18|fifa-18|6\r
Warface|warface|6\r
Quake|quake|6\r
Kingdom Come Deliverance 2|kingdom-come-deliverance-2|5\r
Pop It Trading|pop-it-trading|5\r
Выжить убийца|roblox-survive-the-killer|5\r
BeamNG.drive|beamng-drive|5\r
AFK Arena|afk-arena|5\r
Rise of Empires|rise-of-empires|5\r
Mass Effect 4|mass-effect-4|5\r
StarCraft 2|starcraft2|5\r
Battlefield 2042|battlefield-2042|5\r
Diablo 4|diablo-4|5\r
Grand Theft Auto|grand-theft-auto|5\r
Assassin's Creed|assassins-creed|5\r
Rocket League|rocket-league|5\r
Only Up|only-up|4\r
EA Sports FC|ea-sports-fc|4\r
Rush Royale|rush-royale|4\r
Left To Survive|left-to-survive|4\r
Honkai: Star Rail|honkai-star-rail|4\r
Football Manager 2022|football-manager-2022|4\r
Pet Simulator|pet-simulator|4\r
Forza Horizon 5|forza-horizon-5|4\r
NHL 21|nhl-21|4\r
Call of Duty: Black Ops Cold War|cod-black-ops-cold-war|4\r
Rust|rust|4\r
Mass Effect 3|mass-effect-3|4\r
The Last of Us|the-last-of-us|4\r
FIFA Mobile|fifa-mobile|4\r
Mass Effect 2|mass-effect-2|4\r
Assassin's Creed: Odyssey|ac-odyssey|4\r
Ведьмак|the-witcher|4\r
Tekken 7|tekken7|4\r
Mortal Kombat 11|mk-11|4\r
Hamster Kombat|hamster-kombat|3\r
Мир танков|mir-tankov|3\r
The Grand Mafia|the-grand-mafia|3\r
Call of Duty: Warzone 2|call-of-duty-warzone-2|3\r
Shadow Fight 3|shadow-fight-3|3\r
Lords Mobile|lords-mobile|3\r
S.T.A.L.K.E.R.: Тень Чернобыля|stalker-shadow-of-chernobyl|3\r
Metro|metro|3\r
Hogwarts Legacy|hogwarts-legacy|3\r
Far Cry 6|far-cry-6|3\r
Resident Evil Village|resident-evil-village|3\r
Ведьмак 4|witcher-4|3\r
Call of Duty: Modern Warfare 2|call-of-duty-modern-warfare-2|3\r
Mass Effect: Andromeda|mass-effect-andromeda|3\r
Hollow Knight: Silksong|hollow-knight-silksong|3\r
Dragon Age: Origins|dragon-age|3\r
Overwatch 2|overwatch-2|3\r
Resident Evil|resident-evil|3\r
Warhammer|warhammer|3\r
NHL 20|nhl-20|3\r
Dying Light 2: Stay Human|dying-light-2|3\r
Elden Ring|elden-ring|3\r
Starfield|starfield|3\r
Team Fortress 2|team-fortress2|3\r
Star Wars: Battlefront 2|star-wars-battlefront-2|3\r
The Elder Scrolls IV: Oblivion|the-elder-scrolls-iv-oblivion|3\r
The Last of Us 2|the-last-of-us-part-2|3\r
Borderlands 3|borderlands-3|3\r
Horizon Zero Dawn|horizon-zero-dawn|3\r
Atomic Heart|atomic-heart|3\r
Half-Life 3|half-life-3|3\r
Battlefield 1|battlefield-1|3\r
Vainglory|vainglory|3\r
Age of Empires|age-of-empires|3\r
Unreal Tournament|unreal-tournament|3\r
The Strongest Battlegrounds|the-strongest-battlegrounds|2\r
Rivals|rivals|2\r
The Expanse: Osiris Reborn|the-expanse-osiris-reborn|2\r
Дурак онлайн|durak-online|2\r
Grow a Garden|grow-a-garden|2\r
EA Sports FC 25|ea-sports-fc-25|2\r
Deadlock|deadlock|2\r
Doomsday Last Survivors|doomsday-last-survivors|2\r
Metal Gear Solid 3: Snake Eater (Remake)|metal-gear-solid-3-remake|2\r
Wolfenstein (2009)|wolfenstein-2009|2\r
Call of Duty: Modern Warfare 3 (2023)|call-of-duty-modern-warfare-3-2023|2\r
Life Is Strange|life-is-strange|2\r
Call of Duty: Black Ops 3 (2015)|cod-bo-3|2\r
Mighty Party|mighty-party|2\r
Call of Duty: Modern Warfare 2 (2022)|call-of-duty-modern-warfare-2-2022|2\r
Построй корабль и найди сокровище|build-a-boat-for-treasure|2\r
Slayers Unleashed|slayers-unleashed|2\r
Bee Swarm Simulator|bee-swarm-simulator|2\r
Legends of Speed|legends-of-speed|2\r
Sleeping Dogs|sleeping-dogs|2\r
PC Building Simulator|pc-building-simulator|2\r
UFL|ufl|2\r
NHL 22|nhl-22|2\r
Counter-Strike Global Offensive|counter-strike-global-offensive|2\r
Gothic 2|gothic-2|2\r
Puzzles & Survival|puzzles-and-survival|2\r
Клуб Романтики|club-romantiki|2\r
Assassin's Creed 4: Black Flag|assassins-creed-4-black-flag|2\r
Metal Gear Solid V: The Phantom Pain|metal-gear-5|2\r
Gothic 1|gothic-1|2\r
Vikings: War of Clans|vikings-war-of-clans|2\r
Surviving Mars|surviving-mars|2\r
Valheim|valheim|2\r
Warframe|warframe|2\r
Far Cry 4|far-cry-4|2\r
Mass Effect Legendary Edition|mass-effect-legendary-edition|2\r
S.T.A.L.K.E.R.: Чистое небо|stalker-clear-sky|2\r
Age of Empires 3: Definitive Edition|age-of-empires-3-definitive-edition|2\r
Pro Evolution Soccer 2021|pes-2021|2\r
Mafia: Definitive Edition|mafia-definitive-edition|2\r
Marvel’s Spider-Man: Miles Morales|marvels-spider-man-miles-morales|2\r
Europa Universalis 4|europa-universalis-4|2\r
Dead by Daylight|dead-by-daylight|2\r
Resident Evil 4 Remake|resident-evil-4-remake|2\r
Total War: Shogun 2|total-war-shogun-2|2\r
S.T.A.L.K.E.R.: Зов Припяти|stalker-call-of-pripyat|2\r
Escape from Tarkov|escape-from-tarkov|2\r
The Wolf Among Us 2|the-wolf-among-us-2|2\r
Disco Elysium|disco-elysium|2\r
Skull and Bones|skull-and-bones|2\r
Naraka: Bladepoint|naraka-bladepoint|2\r
BioShock|bioshock|2\r
Hitman (2016)|hitman|2\r
Fallout 3|fallout3|2\r
Half-Life|half-life|2\r
Half-Life 2|half-life-2|2\r
Crusader Kings 3|crusader-kings-3|2\r
Total War Saga: Troy|total-war-saga-troy|2\r
Dark Souls|dark-souls|2\r
Teamfight Tactics|teamfight-tactics|2\r
Age of Empires 2: Definitive Edition|age-of-empires-2-definitive-edition|2\r
The Elder Scrolls 6|the-elder-scrolls-6|2\r
Baldur's Gate 3|baldurs-gate-3|2\r
Бесконечное лето|everlasting-summer|2\r
Star Wars: Knights of The Old Republic|star-wars-knights-of-the-old-republic|2\r
Borderlands|borderlands|2\r
Dota Allstars|dota-allstars|2\r
Magic: The Gathering|magic-the-gathering|2\r
Crusader Kings 2|crusader-kings-2|2\r
Forza Horizon 4|forza-horizon-4|2\r
Metro Exodus|metro-exodus|2\r
Diablo|diablo|2\r
Far Cry 5|far-cry-5|2\r
God of War|god-of-war|2\r
Detroit: Become Human|detroit-bh|2\r
NHL 19|nhl-19|2\r
The Elder Scrolls: Legends|the-elder-scrolls-legends|2\r
Fallout 4|fallout-4|2\r
Мир кораблей|world-of-warships|2\r
NBA 2K|nba-2k|2\r
Need for Speed|need-for-speed|2\r
Haxball|haxball|2\r
Stone Simulator|stone-simulator|1\r
Resident Evil 10|resident-evil-10|1\r
Call of Duty: Black Ops 7|call-of-duty-black-ops-7|1\r
The CUBE|the-cube|1\r
Resident Evil Requiem|resident-evil-requiem|1\r
EA Sports FC 26|ea-sports-fc-26|1\r
007 First Light|007-first-light|1\r
Persona 5: The Phantom X|persona-5-the-phantom-x|1\r
Tainted Grail: The Fall of Avalon|tainted-grail-the-fall-of-avalon|1\r
Quarantine Zone: The Last Check|quarantine-zone-the-last-check|1\r
Europa Universalis 5|europa-universalis-5|1\r
Atomfall|atomfall|1\r
Warhammer 40,000: Space Marine 3|warhammer-40000-space-marine-3|1\r
Приключения капитана Блада|captain-blood|1\r
The Blood of Dawnwalker|the-blood-of-dawnwalker|1\r
Dispatch|dispatch|1\r
Dying Light: The Beast|dying-light-the-beast|1\r
Drunken FC|drunken-fc|1\r
Спарта 2035|sparta-2035|1\r
Tanks Blitz|tanks-blitz|1\r
Mafia: The Old Country|mafia-the-old-country|1\r
SchoolBoy Runaway|schoolboy-runaway|1\r
Twilight Wars|twilight-wars|1\r
PixelTap|pixeltap|1\r
Doom: The Dark Ages|doom-the-dark-ages|1\r
Call of Duty: Black Ops 6|call-of-duty-black-ops-6|1\r
В тылу врага 2|men-of-war-2|1\r
Batman: Arkham Shadow|batman-arkham-shadow|1\r
Supernatural: The Game|supernatural-the-game|1\r
AFK Journey|afk-journey|1\r
Marvel Rivals|marvel-rivals|1\r
Terminator: Survivors|terminator-survivors|1\r
Marvel’s Venom|marvels-venom|1\r
Marvel’s Blade|marvel-s-blade|1\r
Exodus|exodus|1\r
L.A. Noire|l-a-noire|1\r
Брукхейвен|brukheven|1\r
Счетчик Блокс|counter-blox|1\r
Good pizza, great pizza|goode-pizza-great-pizza|1\r
The Ants Underground Kingdom|the-ants-underground-kingdom|1\r
Dragon Champions|dragon-champions|1\r
Taxi Boss|taxi-boss|1\r
Pizza Tower|pizza-tower|1\r
Doors|doors|1\r
Pls Donate|pls-donate|1\r
Hijutsu Conflict|hijutsu-conflict|1\r
Fallout|fallout|1\r
Farming Simulator 17|farming-simulator-17|1\r
Mad Max|mad-max|1\r
Dead Island|dead-island|1\r
Project: Playtime|project-playtime|1\r
В тылу врага|behind-enemy-lines|1\r
Albion Online|albion-online|1\r
Dead Rising 4|dead-rising-4|1\r
Dead Rising|dead-rising|1\r
Мор (Утопия)|pathologic|1\r
Red Dead Revolver|red-dead-revolver|1\r
Alpha Protocol|alpha-protocol|1\r
X-Men Origins: Wolverine|x-men-origins-wolverine|1\r
Tennis Clash|tennis-clash|1\r
Delta Force|delta-force|1\r
ELEX|elex|1\r
Myths of Moonrise|myths-of-moonrise|1\r
Idle Awakening|idle-awakening|1\r
Sssnaker|sssnaker|1\r
Modern Warships|modern-warships|1\r
Scarface: The World Is Yours|scarface-the-world-is-yours|1\r
InFamous 2|infamous-2|1\r
Shadow Warrior (2013)|shadow-warrior-2013|1\r
Bulletstorm|bulletstorm|1\r
Vanquish|vanquish|1\r
Resistance 3|resistance-3|1\r
Tom Clancy’s Ghost Recon|ghost-recon|1\r
Totally Spies!|totally-spies|1\r
Asphalt|asphalt|1\r
Mafia City|mafia-city|1\r
Shadowgun Legends|shadowgun-legends|1\r
Soulcalibur|soulcalibur|1\r
Command & Conquer: Red Alert|command-conquer-red-alert|1\r
Prototype 2|prototype-2|1\r
Prototype|prototype|1\r
FIFA Football 2003|fifa-football-2003|1\r
Saints Row IV|saints-row-4|1\r
Saints Row 2|saints-row-2|1\r
Saints Row|saints-row|1\r
Duke Nukem 3D|duke-nukem-3d|1\r
The Amazing Spider-Man 2 (2014)|the-amazing-spider-man-2-2014|1\r
The Amazing Spider-Man (2012)|the-amazing-spider-man-2012|1\r
Spider-Man: Edge of Time|spider-man-edge-of-time|1\r
Spider-Man: Shattered Dimensions|spider-man-shattered-dimensions|1\r
Spider-Man: Web of Shadows|spider-man-web-of-shadows|1\r
Spider-Man: Friend or Foe|spider-man-friend-or-foe|1\r
Spider-Man 3|spider-man-3|1\r
Spider-Man: The Movie Game|spider-man-the-movie-game|1\r
Serious Sam II|serious-sam-2|1\r
Metro: Last Light|metro-last-light|1\r
Killzone|killzone|1\r
Tekken 6|tekken-6|1\r
Tekken 5|tekken-5|1\r
Tekken|tekken|1\r
Pro Evolution Soccer 5|pro-evolution-soccer-5|1\r
Pro Evolution Soccer 2018|pro-evolution-soccer-2018|1\r
Devil May Cry 4|devil-may-cry-4|1\r
Devil May Cry 2|devil-may-cry-2|1\r
Heroes of Might and Magic 5|heroes-of-might-and-magic-5|1\r
Heroes of Might and Magic 4|heroes-of-might-and-magic-4|1\r
Hitman: Blood Money|hitman-blood-money|1\r
Hitman: Contracts|hitman-contracts|1\r
Hitman 2: Silent Assassin|hitman-2-silent-assassin|1\r
Hitman: Codename 47|hitman-codename-47|1\r
Mafia III|mafia-3|1\r
Mafia II|mafia-2|1\r
Star Wars: Battlefront II (2017)|star-wars-battlefront-2-2017|1\r
Star Wars Jedi Knight: Jedi Academy|star-wars-jedi-knight-jedi-academy|1\r
Batman: The Enemy Within|batman-the-enemy-within|1\r
Batman: The Telltale Series|batman-the-telltale-series|1\r
Batman: Arkham Knight|batman-arkham-knight|1\r
Batman: Arkham Origins|batman-arkham-origins|1\r
Batman: Arkham City|batman-arkham-city|1\r
Batman: Arkham Asylum|batman-arkham-asylum|1\r
Sid Meier’s Civilization V|sid-meiers-civilization-5|1\r
God of War III|god-of-war-3|1\r
Warhammer 40,000: Space Marine 2|warhammer-40000-space-marine-2|1\r
Resident Evil 4|resident-evil-4-2005|1\r
Resident Evil 3: Nemesis|resident-evil-3-nemesis-1999|1\r
Resident Evil 2|resident-evil-2-1998|1\r
Call of Duty 4: Modern Warfare (2007)|cod4-mw-2007|1\r
GTA: Vice City Stories|gta-vice-city-stories|1\r
GTA: Liberty City Stories|gta-liberty-city-stories|1\r
Wuthering Waves|wuthering-waves|1\r
Unturned|unturned|1\r
Brotato|brotato|1\r
Atomic Heart 2|atomic-heart-2|1\r
Russian Train Trip 2|russian-train-trip-2|1\r
Choice of Life: Middle Ages 2|choice-of-life-middle-ages-2|1\r
Silent Hill 2|silent-hill-2|1\r
Silent Hill Townfall|silent-hill-townfall|1\r
Neon Prime|neon-prime|1\r
Mafia: The City of Lost Heaven|mafia-1|1\r
Lies of P|lies-of-p|1\r
Marvel’s Spider-Man Remastered|marvel-s-spider-man-remastered|1\r
DISTORTION|distortion|1\r
NHL 23|nhl-23|1\r
Zenless Zone Zero|zenless-zone-zero|1\r
Cities: Skylines|cities-skylines|1\r
Crysis 4|crysis-4|1\r
Serious Sam: Siberian Mayhem|serious-sam-siberian-mayhem|1\r
Endless Journey|endless-journey|1\r
Avatar: Frontiers of Pandora|avatar-frontiers-of-pandora|1\r
Max Payne 3|max-payne-3|1\r
Cult of the Lamb|cult-of-the-lamb|1\r
Любовь, Деньги, Рок-н-Ролл|love-money-rock-n-roll|1\r
theHunter: Call of the Wild|thehunter-call-of-the-wild|1\r
Blue Archive|blue-archive|1\r
Grand Piece Online|grand-piece-online|1\r
Car Dealership Tycoon|car-dealership-tycoon|1\r
Funky Friday|funky-friday|1\r
Принц Персии: Пески времени (ремейк)|princ-persii-peski-vremeni-remejk|1\r
Geometry Dash|geometry-dash|1\r
Battlefield 4|battlefield-4|1\r
GTA The Trilogy: The Definitive Edition|gta-trilogy-definitive-edition|1\r
Free Fire MAX|free-fire-max|1\r
Call of Duty (2023)|call-of-duty-2023|1\r
Forspoken|forspoken|1\r
Marvel's Spider-Man 2|marvels-spider-man-2|1\r
Marvel’s Wolverine|marvels-wolverine|1\r
Lineage2M|lineage2m|1\r
inFamous|infamous|1\r
Battlefield Mobile|battlefield-mobile|1\r
Arsenal Roblox|arsenal-roblox|1\r
Skyblivion|skyblivion|1\r
Anime Warriors|anime-warrior|1\r
Tiny Bunny|tiny-bunny|1\r
Star Stable|star-stable|1\r
Cookie Clicker|cookie-clicker|1\r
Insurgency Sandstorm|insurgency-sandstorm|1\r
Легенда Феникса|legenda-feniksa|1\r
Ведьмак 2|witcher-2|1\r
Doki Doki Literature Club|doki-doki-literature-club|1\r
World of Warcraft: Wrath of the Lich King|wow-wrath-of-the-lich-king|1\r
RoboCop: Rogue City|robocop-rogue-city|1\r
Ghost of Tsushima: Director's Cut|ghost-of-tsushima-directors-cut|1\r
Resident Evil Code: Veronica|resident-evil-code-veronica|1\r
Fallout: London|fallout-london|1\r
GTA 5: Expanded and Enhanced|gta-5-expanded-and-enhanced|1\r
Painkiller|painkiller|1\r
Palia|palia|1\r
Your Bizarre Adventure|your-bizarre-adventure|1\r
Far Cry 2|far-cry-2|1\r
Far Cry|far-cry|1\r
Pioner|pioner|1\r
GTA 3|gta-3|1\r
Final Fantasy XIV|final-fantasy-14|1\r
Resident Evil 6|resident-evil-6|1\r
Resident Evil 5|resident-evil-5|1\r
Dead Island 2|dead-island-2|1\r
The Binding of Isaac: Rebirth|the-binding-of-isaac-rebirth|1\r
SnowRunner|snowrunner|1\r
Battlefield|battlefield|1\r
Apex Legends Mobile|apex-legends-mobile|1\r
Wolfenstein II: The New Colossus|wolfenstein-2-the-new-colossus|1\r
Counter-Strike: Source|cs-source|1\r
Diablo 2|diablo-2|1\r
Summertime Saga|summertime-saga|1\r
The Evil Within 2|the-evil-within-2|1\r
The Elder Scrolls III: Morrowind|the-elder-scrolls-iii-morrowind|1\r
Radmir RP|radmir-rp|1\r
Astro Bot|astro-bot|1\r
Zombie Army 4: Dead War|zombie-army-4-dead-war|1\r
7DS|7ds|1\r
Warpath|warpath|1\r
Assassin’s Creed: Brotherhood|assassins-creed-brotherhood|1\r
Assassin's Creed 2|assassins-creed-2|1\r
Call of Duty Vanguard|call-of-duty-vanguard|1\r
Resident Evil Re:Verse|resident-evil-re-verse|1\r
Racing Master|racing-master|1\r
Mortal Kombat|mortal-kombat|1\r
Teenage Mutant Ninja Turtles: Shredder’s Revenge|teenage-mutant-ninja-turtles-shredders-revenge|1\r
Euro Truck Simulator 2|euro-truck-simulator-2|1\r
Portal 2|portal-2|1\r
Homescapes|homescapes|1\r
Rise of Kingdoms|rise-of-kingdoms|1\r
Six Days in Fallujah|six-days-in-fallujah|1\r
Resident Evil 7|resident-evil-7|1\r
ARK: Survival Evolved|ark-survival-evolved|1\r
Shindo Life|shindo-life|1\r
The Day Before|the-day-before|1\r
Scorn|scorn|1\r
Fallout: New Vegas|fallout-new-vegas|1\r
Age of Empires 4|age-of-empires-4|1\r
Crossout|crossout|1\r
Honkai Impact 3rd|honkai-impact-3rd|1\r
Dead Space|dead-space|1\r
Disco Elysium: The Final Cut|disco-elysium-the-final-cut|1\r
Crimson Desert|crimson-desert|1\r
Lineage 2|lineage-2|1\r
Assassin’s Creed 3|assassins-creed-3|1\r
Enlisted|enlisted|1\r
Phasmophobia|phasmophobia|1\r
Need for Speed: Hot Pursuit Remastered|need-for-speed-hot-pursuit-remastered|1\r
Left 4 Dead 2|left-4-dead-2|1\r
God of War: Ragnarok|god-of-war-ragnarok|1\r
Devil May Cry 5: Special Edition|devil-may-cry-5-special-edition|1\r
War Robots|war-robots|1\r
Prince of Persia: The Sands of Time Remake|prince-of-persia-the-sands-of-time-remake|1\r
Super Mario 3D All-Stars|super-mario-3d-all-stars|1\r
Teardown|teardown|1\r
Gotham Knights|gotham-knights|1\r
Suicide Squad: Kill the Justice League|suicide-squad-kill-the-justice-league|1\r
Black Myth: Wukong|black-myth-wu-kong|1\r
Dying Light|dying-light|1\r
Forza Motorsport|forza-motorsport|1\r
Fall Guys: Ultimate Knockout|fall-guys-ultimate-knockout|1\r
Diabotical|diabotical|1\r
Watch Dogs 2|watch-dogs-2|1\r
Mortal Shell|mortal-shell|1\r
NBA 2K21|nba2k21|1\r
Stray|stray|1\r
Hitman 3|hitman-3|1\r
Final Fantasy 16|final-fantasy-16|1\r
Prey (2017)|prey|1\r
Sherlock Holmes: Chapter One|sherlock-holmes-chapter-one|1\r
Borderlands 4|borderlands-4|1\r
Mafia 2: Definitive Edition|mafia-2-definitive-edition|1\r
Terraria|terraria|1\r
Assassin's Creed Valhalla|ac-valhalla|1\r
Pac-Man|pac-man|1\r
Saints Row: The Third|saints-row-the-third|1\r
Garry’s Mod|garrys-mod|1\r
Assetto Corsa Competizione|assetto-corsa-competizione|1\r
State of Decay 2|state-of-decay-2|1\r
Metro Redux|metro-redux|1\r
Gothic Remake|gothic-remake|1\r
Fast & Furious: Crossroads|fast-furious-crossroads|1\r
Ruined King: A League of Legends Story|ruined-king-a-league-of-legends-story|1\r
Senua's Saga: Hellblade 2|senuas-saga-hellblade-2|1\r
Mount & Blade 2: Bannerlord|mount-blade-2-bannerlord|1\r
Chivalry 2|chivalry-2|1\r
King’s Bounty 2|kings-bounty-2|1\r
Animal Crossing: New Horizons|animal-crossing-new-horizons|1\r
Dreams|dreams|1\r
Resident Evil 3 Remake|resident-evil-3-remake|1\r
Titanfall|titanfall|1\r
Half-Life: Alyx|half-life-alyx|1\r
Path of Exile 2|path-of-exile-2|1\r
We Happy Few|we-happy-few|1\r
Super Smash Bros. Ultimate|super-smash-bros-ultimate|1\r
Warcraft 3: Reforged|warcraft3-reforged|1\r
League of Legends: Wild Rift|league-of-legends-wild-rift|1\r
The Elder Scrolls Online|the-elder-scrolls-online|1\r
Sea of Thieves|sea-of-thieves|1\r
Half-Life: Source|half-life-source|1\r
Terminator: Resistance|terminator-resistance|1\r
NBA 2K20|nba-2k20|1\r
Greedfall|greedfall|1\r
DayZ|dayz|1\r
Microsoft Flight Simulator (2020)|microsoft-flight-simulator|1\r
Minecraft: Dungeons|minecraft-dungeons|1\r
Remember Me|remember-me|1\r
Super Mario Bros.|super-mario|1\r
Cuphead|cuphead|1\r
Pokemon GO|pokemon-go|1\r
Marvel’s Avengers|marvels-avengers-a-day|1\r
Total War: Three Kingdoms|total-war-three-kingdoms|1\r
DmC: Devil May Cry|dmc-devil-may-cry|1\r
World of Warcraft Classic|world-of-warcraft-classic|1\r
Life is Strange 2|life-is-strange-2|1\r
Halo Infinite|halo-infinite|1\r
World War Z|world-war-z|1\r
Assassin's Creed: Unity|assasins-creed-unity|1\r
Star Wars: The Force Unleashed|star-wars-the-force-unleashed|1\r
Shadow of the Tomb Raider|shadow-of-the-tomb-raider|1\r
Sid Meier’s Civilization 6|sid-meier-s-civilization-vi|1\r
Death Stranding|death-stranding|1\r
Chernobylite|chernobylite|1\r
Farming Simulator 20|farming-simulator-20|1\r
Red Dead Redemption|red-dead-redemption|1\r
Doom Eternal|doom-eternal|1\r
Max Payne|max-payne|1\r
Rage 2|rage-2|1\r
The Sims 4|the-sims-4|1\r
Control|control|1\r
Sekiro: Shadows Die Twice|sekiro|1\r
Tom Clancy's The Division 2|the-division-2|1\r
Devil May Cry 5|dmc-5|1\r
Resident Evil 2 Remake|re-2-remake|1\r
Bum Simulator|bum-simulator|1\r
X4: Foundations|x4-foundations|1\r
Diablo Immortal|diablo-immortal|1\r
Stellaris|stellaris|1\r
Hitman 2|hitman-2|1\r
Fallout 76|fallout-76|1\r
Assassin's Creed: Origins|assassiss-creed-origins|1\r
Spider-Man (2018)|spider-man|1\r
Clash of Clans|clash-of-clans|1\r
Paladins|paladins|1\r
Madden NFL 21|madden-nfl-21|1\r
Doom|doom|1\r
Heroes of Newerth|heroes-of-newerth|1\r
Crossfire|crossfire|1\r
Command & Conquer Remastered Collection|command-conquer-remastered-collection|1\r
Halo|halo|1\r
Trackmania|trackmania|1\r
Street Fighter 5|street-fighter-5|1\r
Fields of Mistria|fields-of-mistria|0\r
`,Fe=mr.map(a=>({id:a,label:Je[a]})),He=a=>!a.releaseDate||!a.platforms.length||!a.genres.length,De={id:"",name:"",subscribers:0,year:0,releaseDate:"",datePrecision:"day",genres:[],platforms:[],status:"unconfirmed",wikidata:"",sources:{record:"Ручной ввод"}},Ue=Er.split(/\r?\n/).flatMap(a=>{const[m,l,d]=a.split("|");return m&&l&&/^[a-z0-9-]+$/.test(l)?[{name:m,id:l,subscribers:Number(d)||0}]:[]});function _r({initial:a,existing:m,games:l,dict:d,onApply:i,onCancel:x}){var y,w;const[o,g]=R.useState({...a,cover:a.cover||void 0,url:a.url||void 0,status:Me(a)}),[c,j]=R.useState(((y=a.rating)==null?void 0:y.value.toString())??""),[E,k]=R.useState([]),v=p=>g(G=>({...G,...p})),b=l.find(p=>p.id!==m&&ge(p.name)===ge(o.name)),h=()=>{var n;const p=c.trim()?Number(c.replace(",",".")):void 0,G=p!==((n=a.rating)==null?void 0:n.value),L=p===void 0?void 0:G||!a.rating?{value:p,source:"Редакция",original:p+"/10"}:a.rating,H={...o.sources};G&&(L?H.rating="Ручное изменение редакции":delete H.rating),o.cover!==a.cover&&(o.cover?H.cover="Ручное изменение редакции":delete H.cover);const A=o.releaseDate||(o.datePrecision==="year"&&o.year>=1e3?o.year+"-01-01":""),V={...o,releaseDate:A,id:o.id.trim(),name:o.name.trim(),sources:H,rating:L,tagId:o.tagId||void 0,url:o.url||(o.tagId?"https://cyber.sports.ru/games/"+o.tagId+"/":void 0),coverSource:o.cover!==a.cover?H.cover:o.coverSource},_=Xe(V,d,l,m);k(_.errors),_.game&&!_.errors.length&&i(_.game)};return e.jsxs("form",{onSubmit:p=>{p.preventDefault(),h()},children:[e.jsx("h2",{children:m?"Редактирование игры":"Новая игра"}),e.jsxs("div",{className:"adm-game-form",children:[e.jsxs("div",{className:"adm-form",children:[e.jsx(M,{label:"ID игры",value:o.id,readOnly:!!m,change:p=>v({id:p})}),e.jsx(M,{label:"Основное название",value:o.name,change:p=>v({name:p})}),e.jsx(M,{label:"Название на русском языке",value:o.nameRu,change:p=>v({nameRu:p})}),e.jsx(M,{label:"Синонимы через точку с запятой",value:(w=o.aliases)==null?void 0:w.join(";"),change:p=>v({aliases:p.split(";")})}),e.jsxs("div",{className:"adm-row",children:[e.jsx(M,{label:"ID тега Кибера",value:o.tagId,change:p=>v({tagId:p})}),e.jsx(M,{label:"URL тега Кибера",value:o.url,change:p=>v({url:p})}),e.jsx(M,{label:"Wikidata ID",value:o.wikidata,change:p=>v({wikidata:p})})]}),e.jsx(me,{label:"Описание",children:e.jsx("textarea",{rows:4,value:o.description??"",onChange:p=>v({description:p.target.value})})}),e.jsxs("div",{className:"adm-row",children:[e.jsx(M,{label:"Дата первого релиза",type:"date",value:o.releaseDate,change:p=>v({releaseDate:p,year:p?+p.slice(0,4):o.year})}),e.jsx(X,{label:"Точность даты",value:o.datePrecision,change:p=>v({datePrecision:p}),options:[{id:"day",label:"День"},{id:"month",label:"Месяц"},{id:"year",label:"Год"}]}),e.jsx(M,{label:"Год выхода",type:"number",value:o.year||"",change:p=>v({year:+p})}),e.jsx(X,{label:"Статус релиза",value:o.status??"unconfirmed",options:Fe,change:p=>v({status:p})})]}),e.jsxs("div",{className:"adm-row adm-taxonomy",children:[e.jsx(Be,{label:"Жанры",options:be(d.genres),values:o.genres,change:p=>v({genres:p})}),e.jsx(Be,{label:"Платформы",options:be(d.platforms),values:o.platforms,change:p=>v({platforms:p})})]}),e.jsx(M,{label:"Рейтинг от 0 до 10",value:c,change:j}),e.jsxs("div",{className:"adm-row",children:[e.jsx(M,{label:"Подписчики тега",type:"number",value:o.subscribers,change:p=>v({subscribers:+p})}),e.jsx(M,{label:"Приоритет при равных баллах",type:"number",value:o.priority??0,change:p=>v({priority:+p})})]}),e.jsx(oe,{label:"Исключить из каталога",checked:!!o.excluded,change:p=>v({excluded:p})}),b&&e.jsxs("p",{className:"adm-note",children:["В базе уже есть «",b.name,"» с ID ",b.id,". Проверьте издание."]}),E.length>0&&e.jsx("ul",{className:"adm-error",role:"alert",children:E.map((p,G)=>e.jsx("li",{children:p},G))}),e.jsxs("div",{className:"adm-actions",children:[e.jsx("button",{className:"adm-primary",type:"submit",children:"Применить к черновику"}),e.jsx("button",{type:"button",onClick:x,children:"К списку игр"})]})]}),e.jsxs("aside",{children:[e.jsx(Te,{label:"Обложка",value:o.cover,change:p=>v({cover:p||void 0})}),e.jsx(M,{label:"Альтернативный текст обложки",value:o.coverAlt,change:p=>v({coverAlt:p})}),e.jsx(Te,{label:"Левый фон",value:o.backdropLeft,change:p=>v({backdropLeft:p||void 0})}),e.jsx(Te,{label:"Правый фон",value:o.backdropRight,change:p=>v({backdropRight:p||void 0})})]})]})]})}function Rr({games:a,dict:m,selected:l,setSelected:d,apply:i}){const[x,o]=R.useState(),[g,c]=R.useState(""),[j,E]=R.useState({platform:"",genre:"",status:"",noScore:!1,noCover:!1,incomplete:!1,excluded:!1}),[k,v]=R.useState("name"),[b,h]=R.useState(1),[y,w]=R.useState(""),[p,G]=R.useState(!1),[L,H]=R.useState(""),[A,V]=R.useState(""),_=u=>{E({...j,...u}),h(1)};if(x)return e.jsx(_r,{initial:x.game,existing:x.existing,games:a,dict:m,onApply:u=>{i(u),o(void 0),V("Карточка записана в черновик. Нажмите «Сохранить».")},onCancel:()=>o(void 0)});const n=ge(g),r=a.filter(u=>(!n||qe(u,n)||u.id.includes(g.toLowerCase().trim()))&&(!j.platform||u.platforms.includes(j.platform))&&(!j.genre||u.genres.includes(j.genre))&&(!j.status||Me(u)===j.status)&&(!j.noScore||!u.rating)&&(!j.noCover||!u.cover)&&(!j.incomplete||He(u))&&(!j.excluded||u.excluded)).sort((u,W)=>{var I,$;return k==="score"?(((I=W.rating)==null?void 0:I.value)??-1)-((($=u.rating)==null?void 0:$.value)??-1):k==="date"?W.releaseDate.localeCompare(u.releaseDate):k==="id"?u.id.localeCompare(W.id):u.name.localeCompare(W.name,"ru")}),t=Math.max(1,Math.ceil(r.length/25)),f=Math.min(b,t),s=r.slice((f-1)*25,f*25),C=(u,W)=>{const I=new Set(l);u.forEach($=>{W?I.add($):I.delete($)}),d(I)},K=()=>{const u=Ue.find(W=>W.id===y);if(u){const W=a.find(I=>{var $;return I.id===u.id||I.tagId===u.id||(($=I.url)==null?void 0:$.replace(/\/$/,"").endsWith("/games/"+u.id))});o(W?{game:W,existing:W.id}:{game:{...De,...u,tagId:u.id,url:"https://cyber.sports.ru/games/"+u.id+"/",sources:{record:"Локальный список тегов Кибера"}}})}else o({game:{...De,tagId:y,id:y,sources:{record:"Ручной ввод тега"}}})};return e.jsxs(e.Fragment,{children:[e.jsx("h2",{children:"Игры"}),e.jsxs("p",{children:["Всего ",a.length," · в основном каталоге ",ur(a).length," · без оценки ",a.filter(u=>!u.rating).length," · без обложки ",a.filter(u=>!u.cover).length," · неполные ",a.filter(He).length]}),e.jsxs("div",{className:"adm-actions",children:[e.jsx("button",{className:"adm-primary",onClick:()=>o({game:De}),children:"Добавить игру вручную"}),e.jsx("button",{className:"adm-extra",onClick:()=>G(!p),children:"Добавить по тегу Кибера"})]}),p&&e.jsxs("div",{className:"adm-row",children:[e.jsx(M,{label:"Поиск в локальных тегах",value:L,change:H}),e.jsx(X,{label:"Локальный тег",value:y,change:w,empty:"Выберите из списка",options:Ue.filter(u=>!L||ge(u.name).includes(ge(L))||u.id.includes(L)).slice(0,100).map(u=>({id:u.id,label:u.name}))}),e.jsx(M,{label:"Или укажите ID тега вручную",value:y,change:w}),e.jsx("button",{onClick:K,children:"Открыть карточку тега"})]}),A&&e.jsx("p",{role:"status",children:A}),e.jsxs("div",{className:"adm-row",children:[e.jsx(M,{label:"Название или ID",value:g,change:u=>{c(u),h(1)}}),e.jsx(X,{label:"Платформа",value:j.platform,change:u=>_({platform:u}),options:be(m.platforms),empty:"Все"}),e.jsx(X,{label:"Жанр",value:j.genre,change:u=>_({genre:u}),options:be(m.genres),empty:"Все"}),e.jsx(X,{label:"Статус",value:j.status,change:u=>_({status:u}),options:Fe,empty:"Все"}),e.jsx(X,{label:"Сортировка",value:k,change:u=>{v(u),h(1)},options:[{id:"name",label:"По названию"},{id:"id",label:"По ID"},{id:"score",label:"По баллу"},{id:"date",label:"По дате"}]})]}),e.jsxs("div",{className:"adm-actions",children:[e.jsx(oe,{label:"Без оценки",checked:j.noScore,change:u=>_({noScore:u})}),e.jsx(oe,{label:"Без обложки",checked:j.noCover,change:u=>_({noCover:u})}),e.jsx(oe,{label:"Неполные",checked:j.incomplete,change:u=>_({incomplete:u})}),e.jsx(oe,{label:"Исключённые",checked:j.excluded,change:u=>_({excluded:u})}),e.jsxs("button",{disabled:!l.size,onClick:()=>d(new Set),children:["Снять выделение (",l.size,")"]})]}),e.jsx("div",{className:"adm-table",children:e.jsxs("table",{children:[e.jsx("thead",{children:e.jsxs("tr",{children:[e.jsx("th",{children:e.jsx("input",{type:"checkbox","aria-label":"Выбрать страницу",checked:!!s.length&&s.every(u=>l.has(u.id)),onChange:u=>C(s.map(W=>W.id),u.target.checked)})}),e.jsx("th",{children:"Обложка"}),e.jsx("th",{children:"Игра"}),e.jsx("th",{children:"ID"}),e.jsx("th",{children:"Балл"}),e.jsx("th",{children:"Дата"}),e.jsx("th",{children:"Статус"}),e.jsx("th",{})]})}),e.jsx("tbody",{children:s.map(u=>{var W;return e.jsxs("tr",{children:[e.jsx("td",{children:e.jsx("input",{type:"checkbox","aria-label":"Выбрать "+u.name,checked:l.has(u.id),onChange:I=>C([u.id],I.target.checked)})}),e.jsx("td",{children:u.cover&&e.jsx("img",{className:"adm-thumb",src:u.cover,alt:"",loading:"lazy"})}),e.jsx("td",{children:u.name}),e.jsx("td",{children:u.id}),e.jsx("td",{children:((W=u.rating)==null?void 0:W.value)??"—"}),e.jsx("td",{children:u.releaseDate||"—"}),e.jsxs("td",{children:[Je[Me(u)],u.excluded&&" · исключена"]}),e.jsx("td",{children:e.jsx("button",{onClick:()=>o({game:u,existing:u.id}),children:"Редактировать"})})]},u.id)})})]})}),e.jsxs("div",{className:"adm-actions",children:[e.jsx("button",{disabled:f<=1,onClick:()=>h(f-1),children:"Назад"}),e.jsxs("span",{children:[f," из ",t," · найдено ",r.length]}),e.jsx("button",{disabled:f>=t,onClick:()=>h(f+1),children:"Дальше"})]})]})}var Ye={exports:{}};/* @license
Papa Parse
v5.7.1
https://github.com/mholt/PapaParse
License: MIT
*/(function(a,m){((l,d)=>{a.exports=d()})(vr,function l(){var d=typeof self<"u"?self:typeof window<"u"?window:d!==void 0?d:{},i=!d.document&&!!d.postMessage,x=d.IS_PAPA_WORKER||!1,o={},g=0,c={};function j(n){return n.charCodeAt(0)===65279?n.slice(1):n}function E(n){this._handle=null,this._finished=!1,this._completed=!1,this._halted=!1,this._input=null,this._baseIndex=0,this._partialLine="",this._rowCount=0,this._start=0,this._nextChunk=null,this.isFirstChunk=!0,this._completeResults={data:[],errors:[],meta:{}},(function(r){var t=A(r);t.chunkSize=parseInt(t.chunkSize),r.step||r.chunk||(t.chunkSize=null),this._handle=new y(t),(this._handle.streamer=this)._config=t}).call(this,n),this.parseChunk=function(r,t){var f=parseInt(this._config.skipFirstNLines)||0;if(this.isFirstChunk&&0<f){let C=this._config.newline;C||(s=this._config.quoteChar||'"',C=this._handle.guessLineEndings(r,s)),r=[...r.split(C).slice(f)].join(C)}this.isFirstChunk&&_(this._config.beforeFirstChunk)&&(s=this._config.beforeFirstChunk(r))!==void 0&&(r=s),this.isFirstChunk=!1,this._halted=!1;var f=this._partialLine+r,s=(this._partialLine="",this._handle.parse(f,this._baseIndex,!this._finished));if(!this._handle.paused()&&!this._handle.aborted()){if(r=s.meta.cursor,f=(this._finished||(this._partialLine=f.substring(r-this._baseIndex),this._baseIndex=r),s&&s.data&&(this._rowCount+=s.data.length),this._finished||this._config.preview&&this._rowCount>=this._config.preview),x)d.postMessage({results:s,workerId:c.WORKER_ID,finished:f});else if(_(this._config.chunk)&&!t){if(this._config.chunk(s,this._handle),this._handle.paused()||this._handle.aborted())return void(this._halted=!0);this._completeResults=s=void 0}return this._config.step||this._config.chunk||(this._completeResults.data=this._completeResults.data.concat(s.data),this._completeResults.errors=this._completeResults.errors.concat(s.errors),this._completeResults.meta=s.meta),this._completed||!f||!_(this._config.complete)||s&&s.meta.aborted||(this._config.complete(this._completeResults,this._input),this._completed=!0),f||s&&s.meta.paused||this._nextChunk(),s}this._halted=!0},this._sendError=function(r){_(this._config.error)?this._config.error(r):x&&this._config.error&&d.postMessage({workerId:c.WORKER_ID,error:r,finished:!1})}}function k(n){var r;(n=n||{}).chunkSize||(n.chunkSize=c.RemoteChunkSize),E.call(this,n),this._nextChunk=i?function(){this._readChunk(),this._chunkLoaded()}:function(){this._readChunk()},this.stream=function(t){this._input=t,this._nextChunk()},this._readChunk=function(){if(this._finished)this._chunkLoaded();else{if(r=new XMLHttpRequest,this._config.withCredentials&&(r.withCredentials=this._config.withCredentials),i||(r.onload=V(this._chunkLoaded,this),r.onerror=V(this._chunkError,this)),r.ontimeout=V(this._chunkTimeout,this),r.open(this._config.downloadRequestBody?"POST":"GET",this._input,!i),this._config.downloadTimeout&&!i&&(r.timeout=this._config.downloadTimeout),this._config.downloadRequestHeaders){var t,f=this._config.downloadRequestHeaders;for(t in f)r.setRequestHeader(t,f[t])}var s;this._config.chunkSize&&(s=this._start+this._config.chunkSize-1,r.setRequestHeader("Range","bytes="+this._start+"-"+s));try{r.send(this._config.downloadRequestBody)}catch(C){this._chunkError(C.message)}i&&r.status===0&&this._chunkError()}},this._chunkLoaded=function(){r.readyState===4&&(r.status<200||400<=r.status?this._chunkError():(this._start+=this._config.chunkSize||r.responseText.length,this._finished=!this._config.chunkSize||this._start>=(t=>(t=t.getResponseHeader("Content-Range"))!==null?parseInt(t.substring(t.lastIndexOf("/")+1)):-1)(r),this.parseChunk(r.responseText)))},this._chunkError=function(t){t=r.statusText||t,this._sendError(new Error(t))},this._chunkTimeout=function(){this._chunkError("Request timed out after "+this._config.downloadTimeout+"ms")}}function v(n){(n=n||{}).chunkSize||(n.chunkSize=c.LocalChunkSize),E.call(this,n);var r,t,f=typeof FileReader<"u";this.stream=function(s){this._input=s,t=s.slice||s.webkitSlice||s.mozSlice,f?((r=new FileReader).onload=V(this._chunkLoaded,this),r.onerror=V(this._chunkError,this)):r=new FileReaderSync,this._nextChunk()},this._nextChunk=function(){this._finished||this._config.preview&&!(this._rowCount<this._config.preview)||this._readChunk()},this._readChunk=function(){var s=this._input,C=(this._config.chunkSize&&(C=Math.min(this._start+this._config.chunkSize,this._input.size),s=t.call(s,this._start,C)),r.readAsText(s,this._config.encoding));f||this._chunkLoaded({target:{result:C}})},this._chunkLoaded=function(s){this._start+=this._config.chunkSize,this._finished=!this._config.chunkSize||this._start>=this._input.size,this.parseChunk(s.target.result)},this._chunkError=function(){this._sendError(r.error)}}function b(n){var r;E.call(this,n=n||{}),this.stream=function(t){return r=t,this._nextChunk()},this._nextChunk=function(){var t,f;if(!this._finished)return t=this._config.chunkSize,r=t?(f=r.substring(0,t),r.substring(t)):(f=r,""),this._finished=!r,this.parseChunk(f)}}function h(n){E.call(this,n=n||{});var r=[],t=!0,f=!1;this.pause=function(){E.prototype.pause.apply(this,arguments),this._input.pause()},this.resume=function(){E.prototype.resume.apply(this,arguments),this._input.resume()},this.stream=function(s){this._input=s,this._input.on("data",this._streamData),this._input.on("end",this._streamEnd),this._input.on("error",this._streamError)},this._checkIsFinished=function(){f&&r.length===1&&(this._finished=!0)},this._nextChunk=function(){this._checkIsFinished(),r.length?this.parseChunk(r.shift()):t=!0},this._streamData=V(function(s){try{r.push(typeof s=="string"?s:s.toString(this._config.encoding)),t&&(t=!1,this._checkIsFinished(),this.parseChunk(r.shift()))}catch(C){this._streamError(C)}},this),this._streamError=V(function(s){this._streamCleanUp(),this._sendError(s)},this),this._streamEnd=V(function(){this._streamCleanUp(),f=!0,this._streamData("")},this),this._streamCleanUp=V(function(){this._input.removeListener("data",this._streamData),this._input.removeListener("end",this._streamEnd),this._input.removeListener("error",this._streamError)},this)}function y(n){var r,t,f,s,C=Math.pow(2,53),K=-C,u=/^\s*-?(\d+\.?|\.\d+|\d+\.\d+)([eE][-+]?\d+)?\s*$/,W=/^((\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d\.\d+([+-][0-2]\d:[0-5]\d|Z))|(\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d([+-][0-2]\d:[0-5]\d|Z))|(\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d([+-][0-2]\d:[0-5]\d|Z)))$/,I=this,$=0,T=0,se=!1,F=!1,z=[],S={data:[],errors:[],meta:{}};function ne(B){return n.skipEmptyLines==="greedy"?B.join("").trim()==="":B.length===1&&B[0].length===0}function J(){if(S&&f&&(le("Delimiter","UndetectableDelimiter","Unable to auto-detect delimiting character; defaulted to '"+c.DefaultDelimiter+"'"),f=!1),n.skipEmptyLines&&(S.data=S.data.filter(function(D){return!ne(D)})),Y()){let D=function(ee){z.push(ee)};if(S)if(Array.isArray(S.data[0])){for(var B=0;Y()&&B<S.data.length;B++)S.data[B].forEach(D);S.data.splice(0,1)}else S.data.forEach(D)}function P(D,ee){for(var ae=n.header?{}:[],q=0;q<D.length;q++){var U=q,O=D[q],O=((de,N)=>(Z=>(n.dynamicTypingFunction&&n.dynamicTyping[Z]===void 0&&(n.dynamicTyping[Z]=n.dynamicTypingFunction(Z)),(n.dynamicTyping[Z]||n.dynamicTyping)===!0))(de)?N==="true"||N==="TRUE"||N!=="false"&&N!=="FALSE"&&((Z=>{if(u.test(Z)&&(Z=parseFloat(Z),K<Z&&Z<C))return 1})(N)?parseFloat(N):W.test(N)?new Date(N):N===""?null:N):N)(U=n.header?q>=z.length?"__parsed_extra":z[q]:U,O=n.transform?n.transform(O,U):O);U==="__parsed_extra"?(ae[U]=ae[U]||[],ae[U].push(O)):ae[U]=O}return n.header&&(q>z.length?le("FieldMismatch","TooManyFields","Too many fields: expected "+z.length+" fields but parsed "+q,T+ee):q<z.length&&le("FieldMismatch","TooFewFields","Too few fields: expected "+z.length+" fields but parsed "+q,T+ee)),ae}var Q;S&&(n.header||n.dynamicTyping||n.transform)&&(Q=1,!S.data.length||Array.isArray(S.data[0])?(S.data=S.data.map(P),Q=S.data.length):S.data=P(S.data,0),n.header&&S.meta&&(S.meta.fields=z),T+=Q)}function Y(){return n.header&&z.length===0}function le(B,P,Q,D){B={type:B,code:P,message:Q},D!==void 0&&(B.row=D),S.errors.push(B)}_(n.step)&&(s=n.step,n.step=function(B){S=B,Y()?J():(J(),S.data.length!==0&&($+=B.data.length,n.preview&&$>n.preview?t.abort():(S.data=S.data[0],s(S,I))))}),this.parse=function(B,P,Q){var D=n.quoteChar||'"',D=(n.newline||(n.newline=this.guessLineEndings(B,D)),f=!1,n.delimiter?_(n.delimiter)&&(n.delimiter=n.delimiter(B),S.meta.delimiter=n.delimiter):((D=((ee,ae,q,U,O)=>{var de,N,Z,pe;O=O||[",","	","|",";",c.RECORD_SEP,c.UNIT_SEP];for(var xe=0;xe<O.length;xe++){for(var ce,ke=O[xe],te=0,he=0,re=0,ie=(Z=void 0,new p({comments:U,delimiter:ke,newline:ae,preview:10}).parse(ee)),fe=0;fe<ie.data.length;fe++)q&&ne(ie.data[fe])?re++:(ce=ie.data[fe].length,he+=ce,Z===void 0?Z=ce:0<ce&&(te+=Math.abs(ce-Z),Z=ce));0<ie.data.length&&(he/=ie.data.length-re),1.99<he&&(N===void 0||te<N||te===N&&pe<he)&&(N=te,de=ke,pe=he)}return{successful:!!(n.delimiter=de),bestDelimiter:de}})(B,n.newline,n.skipEmptyLines,n.comments,n.delimitersToGuess)).successful?n.delimiter=D.bestDelimiter:(f=!0,n.delimiter=c.DefaultDelimiter),S.meta.delimiter=n.delimiter),A(n));return D.header=Y(),n.preview&&n.header&&D.preview++,r=B,t=new p(D),S=t.parse(r,P,Q),J(),se?{meta:{paused:!0}}:S||{meta:{paused:!1}}},this.paused=function(){return se},this.pause=function(){se=!0,t.abort(),r=_(n.chunk)?"":r.substring(t.getCharIndex())},this.resume=function(){I.streamer._halted?(se=!1,I.streamer.parseChunk(r,!0)):setTimeout(I.resume,3)},this.aborted=function(){return F},this.abort=function(){F=!0,t.abort(),S.meta.aborted=!0,_(n.complete)&&n.complete(S),r=""},this.guessLineEndings=function(ee,D){ee=ee.substring(0,1048576);var D=new RegExp(w(D)+"([^]*?)"+w(D),"gm"),Q=(ee=ee.replace(D,"")).split("\r"),D=ee.split(`
`),ee=1<D.length&&D[0].length<Q[0].length;if(Q.length===1||ee)return`
`;for(var ae=0,q=0;q<Q.length;q++)Q[q][0]===`
`&&ae++;return ae>=Q.length/2?`\r
`:"\r"}}function w(n){return n.replace(/[.*+?^${}()|[\]\\]/g,"\\$&")}function p(n){var r=(n=n||{}).delimiter,t=n.newline,f=n.comments,s=n.step,C=n.preview,K=n.fastMode,u=null,W=!1,I=n.quoteChar==null?'"':n.quoteChar,$=I;if(n.escapeChar!==void 0&&($=n.escapeChar),(typeof r!="string"||-1<c.BAD_DELIMITERS.indexOf(r))&&(r=","),f===r)throw new Error("Comment character same as delimiter");f===!0?f="#":(typeof f!="string"||-1<c.BAD_DELIMITERS.indexOf(f))&&(f=!1),t!==`
`&&t!=="\r"&&t!==`\r
`&&(t=`
`);var T=0,se=!1;this.parse=function(F,z,S){if(typeof F!="string")throw new Error("Input must be a string");var ne=F.length,J=r.length,Y=t.length,le=f.length,B=_(s),P=[],Q=[],D=[],ee=T=0;if(!F)return te();if(K||K!==!1&&F.indexOf(I)===-1){for(var ae=F.split(t),q=0;q<ae.length;q++){if(D=ae[q],T+=D.length,q!==ae.length-1)T+=t.length;else if(S)return te();if(!f||D.substring(0,le)!==f){if(B){if(P=[],pe(D.split(r)),he(),se)return te()}else pe(D.split(r));if(C&&C<=q)return P=P.slice(0,C),te(!0)}}return te()}for(var U=F.indexOf(r,T),O=F.indexOf(t,T),de=new RegExp(w($)+w(I),"g"),N=F.indexOf(I,T);;)if(F[T]===I)for(N=T,T++;;){if((N=F.indexOf(I,N+1))===-1)return S||Q.push({type:"Quotes",code:"MissingQuotes",message:"Quoted field unterminated",row:P.length,index:T}),ce();if(N===ne-1)return ce(F.substring(T,N).replace(de,I));if(I===$&&F[N+1]===$)N++;else if(I===$||N===0||F[N-1]!==$){U!==-1&&U<N+1&&(U=F.indexOf(r,N+1));var Z=xe((O=O!==-1&&O<N+1?F.indexOf(t,N+1):O)===-1?U:Math.min(U,O));if(F.substr(N+1+Z,J)===r){D.push(F.substring(T,N).replace(de,I)),F[T=N+1+Z+J]!==I&&(N=F.indexOf(I,T)),U!==-1&&U<T&&(U=F.indexOf(r,T)),O!==-1&&O<T&&(O=F.indexOf(t,T));break}if(Z=xe(O),F.substring(N+1+Z,N+1+Z+Y)===t){if(D.push(F.substring(T,N).replace(de,I)),ke(N+1+Z+Y),U!==-1&&U<T&&(U=F.indexOf(r,T)),N=F.indexOf(I,T),B&&(he(),se))return te();if(C&&P.length>=C)return te(!0);break}Q.push({type:"Quotes",code:"InvalidQuotes",message:"Trailing quote on quoted field is malformed",row:P.length,index:T}),N++}}else if(f&&D.length===0&&F.substring(T,T+le)===f){if(O===-1)return te();T=O+Y,O=F.indexOf(t,T),U!==-1&&U<T&&(U=F.indexOf(r,T))}else if(U!==-1&&(U<O||O===-1))D.push(F.substring(T,U)),T=U+J,U=F.indexOf(r,T);else{if(O===-1)break;if(D.push(F.substring(T,O)),ke(O+Y),B&&(he(),se))return te();if(C&&P.length>=C)return te(!0)}return ce();function pe(re){P.push(re),ee=T}function xe(re){var ie=0;return ie=re!==-1&&(re=F.substring(N+1,re))&&re.trim()===""?re.length:ie}function ce(re){return S||(re===void 0&&(re=F.substring(T)),D.push(re),T=ne,pe(D),B&&he()),te()}function ke(re){T=re,pe(D),D=[],O=F.indexOf(t,T)}function te(re){if(n.header&&!z&&P.length&&!W){var ie=P[0],fe=Object.create(null),_e=new Set(ie);let Ie=!1;for(let ve=0;ve<ie.length;ve++){let ue=j(ie[ve]);if(fe[ue=_(n.transformHeader)?n.transformHeader(ue,ve):ue]){let we,Oe=fe[ue];for(;we=ue+"_"+Oe,Oe++,_e.has(we););_e.add(we),ie[ve]=we,fe[ue]++,Ie=!0,(u=u===null?{}:u)[we]=ue}else fe[ue]=1,ie[ve]=ue;_e.add(ue)}Ie&&console.warn("Duplicate headers found and renamed."),W=!0}return{data:P,errors:Q,meta:{delimiter:r,linebreak:t,aborted:se,truncated:!!re,cursor:ee+(z||0),renamedHeaders:u}}}function he(){s(te()),P=[],Q=[]}},this.abort=function(){se=!0},this.getCharIndex=function(){return T}}function G(n){var r=n.data,t=o[r.workerId],f=!1;if(r.error)t.userError(r.error,r.file);else if(r.results&&r.results.data){var s={abort:function(){f=!0,L(r.workerId,{data:[],errors:[],meta:{aborted:!0}})},pause:H,resume:H};if(_(t.userStep)){for(var C=0;C<r.results.data.length&&(t.userStep({data:r.results.data[C],errors:r.results.errors,meta:r.results.meta},s),!f);C++);delete r.results}else _(t.userChunk)&&(t.userChunk(r.results,s,r.file),delete r.results)}r.finished&&!f&&L(r.workerId,r.results)}function L(n,r){var t=o[n];_(t.userComplete)&&t.userComplete(r),t.terminate(),delete o[n]}function H(){throw new Error("Not implemented.")}function A(n){if(typeof n!="object"||n===null)return n;var r,t=Array.isArray(n)?[]:{};for(r in n)t[r]=A(n[r]);return t}function V(n,r){return function(){n.apply(r,arguments)}}function _(n){return typeof n=="function"}return c.parse=function(n,r){var t=(r=r||{}).dynamicTyping||!1;if(_(t)&&(r.dynamicTypingFunction=t,t={}),r.dynamicTyping=t,r.transform=!!_(r.transform)&&r.transform,r.downloadTimeout!==void 0){var t=parseInt(r.downloadTimeout);if(isNaN(t))throw new Error("Config downloadTimeout value ("+r.downloadTimeout+") not parsable by parseInt(val).");r.downloadTimeout=t}if(!r.worker||!c.WORKERS_SUPPORTED)return t=null,c.NODE_STREAM_INPUT,typeof n=="string"?(n=j(n),t=new(r.download?k:b)(r)):n.readable===!0&&_(n.read)&&_(n.on)?t=new h(r):(d.File&&n instanceof File||n instanceof Object)&&(t=new v(r)),t.stream(n);(t=(()=>{var f;return!!c.WORKERS_SUPPORTED&&(f=(()=>{var s=d.URL||d.webkitURL||null,C=l.toString();return c.BLOB_URL||(c.BLOB_URL=s.createObjectURL(new Blob(["var global = (function() { if (typeof self !== 'undefined') { return self; } if (typeof window !== 'undefined') { return window; } if (typeof global !== 'undefined') { return global; } return {}; })(); global.IS_PAPA_WORKER=true; ","(",C,")();"],{type:"text/javascript"})))})(),(f=new d.Worker(f)).onmessage=G,f.id=g++,o[f.id]=f)})()).userStep=r.step,t.userChunk=r.chunk,t.userComplete=r.complete,t.userError=r.error,r.step=_(r.step),r.chunk=_(r.chunk),r.complete=_(r.complete),r.error=_(r.error),delete r.worker,t.postMessage({input:n,config:r,workerId:t.id})},c.unparse=function(n,r){var t=!1,f=!0,s=",",C=`\r
`,K='"',u=K+K,W=!1,I=null,$=!1,T=((()=>{if(typeof r=="object"){if(typeof r.delimiter!="string"||c.BAD_DELIMITERS.filter(function(z){return r.delimiter.indexOf(z)!==-1}).length||(s=r.delimiter),typeof r.quotes!="boolean"&&typeof r.quotes!="function"&&!Array.isArray(r.quotes)||(t=r.quotes),typeof r.skipEmptyLines!="boolean"&&typeof r.skipEmptyLines!="string"||(W=r.skipEmptyLines),typeof r.newline=="string"&&(C=r.newline),typeof r.quoteChar=="string"&&(K=r.quoteChar,u=K+K),typeof r.header=="boolean"&&(f=r.header),Array.isArray(r.columns)){if(r.columns.length===0)throw new Error("Option columns is empty");I=r.columns}r.escapeChar!==void 0&&(u=r.escapeChar+K),r.escapeFormulae instanceof RegExp?$=r.escapeFormulae:typeof r.escapeFormulae=="boolean"&&r.escapeFormulae&&($=/^[=+\-@\t\r].*$/)}})(),new RegExp(w(K),"g"));if(typeof n=="string"&&(n=JSON.parse(n)),Array.isArray(n)){if(!n.length)return se(I,n,W);if(Array.isArray(n[0]))return se(null,n,W);if(typeof n[0]=="object")return se(I||Object.keys(n[0]),n,W)}else if(typeof n=="object")return typeof n.data=="string"&&(n.data=JSON.parse(n.data)),Array.isArray(n.data)&&(n.fields||(n.fields=n.meta&&n.meta.fields||I),n.fields||(n.fields=Array.isArray(n.data[0])?n.fields:typeof n.data[0]=="object"?Object.keys(n.data[0]):[]),Array.isArray(n.data[0])||typeof n.data[0]=="object"||(n.data=[n.data])),se(n.fields||[],n.data||[],W);throw new Error("Unable to serialize unrecognized input");function se(z,S,ne){var J="",Y=(typeof z=="string"&&(z=JSON.parse(z)),typeof S=="string"&&(S=JSON.parse(S)),Array.isArray(z)&&0<z.length),le=!Array.isArray(S[0]);if(Y&&f){for(var B=0;B<z.length;B++)0<B&&(J+=s),J+=F(z[B],B);0<S.length&&(J+=C)}for(var P=0;P<S.length;P++){var Q=(Y?z:S[P]).length,D=!1,ee=Y?Object.keys(S[P]).length===0:S[P].length===0;if(ne&&!Y&&(D=ne==="greedy"?S[P].join("").trim()==="":S[P].length===1&&(S[P][0]==null||S[P][0].length===0)),ne==="greedy"&&Y){for(var ae=[],q=0;q<Q;q++){var U=le?z[q]:q;ae.push(S[P][U])}D=ae.join("").trim()===""}if(!D){for(var O=0;O<Q;O++){0<O&&!ee&&(J+=s);var de=Y&&le?z[O]:O;J+=F(S[P][de],O)}P<S.length-1&&(!ne||0<Q&&!ee)&&(J+=C)}}return J}function F(z,S){var ne,J,Y;return z==null?"":z.constructor===Date?isNaN(z.getTime())?"":z.toISOString():(Y=!1,ne=z.toString(),$&&typeof z!="number"&&typeof z!="bigint"&&typeof z!="boolean"&&$.test(ne)&&(z=ne="'"+ne,Y=!0),J=ne.replace(T,u),(Y=Y||t===!0||typeof t=="function"&&t(z,S)||Array.isArray(t)&&t[S]||((le,B)=>{for(var P=0;P<B.length;P++)if(-1<le.indexOf(B[P]))return!0;return!1})(J,c.BAD_DELIMITERS)||-1<J.indexOf(s)||-1<ne.indexOf(K)||J.charAt(0)===" "||J.charAt(J.length-1)===" ")?K+J+K:J)}},c.RECORD_SEP="",c.UNIT_SEP="",c.BYTE_ORDER_MARK="\uFEFF",c.BAD_DELIMITERS=["\r",`
`,'"',c.BYTE_ORDER_MARK],c.WORKERS_SUPPORTED=!i&&!!d.Worker,c.NODE_STREAM_INPUT=1,c.LocalChunkSize=10485760,c.RemoteChunkSize=5242880,c.DefaultDelimiter=",",c.Parser=p,c.ParserHandle=y,c.NetworkStreamer=k,c.FileStreamer=v,c.StringStreamer=b,c.ReadableStreamStreamer=h,x&&(d.onmessage=function(n){n=n.data,c.WORKER_ID===void 0&&n&&(c.WORKER_ID=n.workerId),typeof n.input=="string"?d.postMessage({workerId:c.WORKER_ID,results:c.parse(n.input,n.config),finished:!0}):(d.File&&n.input instanceof File||n.input instanceof Object)&&(n=c.parse(n.input,n.config))&&d.postMessage({workerId:c.WORKER_ID,results:n,finished:!0})}),(k.prototype=Object.create(E.prototype)).constructor=k,(v.prototype=Object.create(E.prototype)).constructor=v,(b.prototype=Object.create(b.prototype)).constructor=b,(h.prototype=Object.create(E.prototype)).constructor=h,c})})(Ye);var Tr=Ye.exports;const er=yr(Tr),je=["id","name","nameRu","aliases","url","tagId","description","releaseDate","datePrecision","year","status","genres","platforms","rating","ratingUrl","cover","coverAlt","backdropLeft","backdropRight","subscribers","priority","excluded","wikidata","origin"],Ke=a=>a instanceof Date?a.toISOString().slice(0,10):a==null||typeof a=="object"?"":String(a);async function Dr(a){if(a.size>12*1024**2)throw new Error("Допустимый размер таблицы — до 12 МБ.");let m;if(/\.xlsx$/i.test(a.name)){const x=await $e(()=>import("./exceljs.min-Dj-PIaAO.js").then(c=>c.e),[]),o=new x.default.Workbook;await o.xlsx.load(await a.arrayBuffer());const g=o.worksheets[0];if(!g)throw new Error("В книге нет листов.");if(g.rowCount>10001||g.columnCount>200)throw new Error("Допустимы до 10 000 строк и 200 колонок.");m=Array.from({length:g.rowCount},(c,j)=>Array.from({length:g.columnCount},(E,k)=>g.getRow(j+1).getCell(k+1).value))}else if(/\.csv$/i.test(a.name)){const x=er.parse(await a.text(),{skipEmptyLines:"greedy"});if(x.errors.length)throw new Error(x.errors.map(o=>o.message).join(" "));m=x.data}else throw new Error("Выберите файл CSV или XLSX.");const[l,...d]=m,i=(l==null?void 0:l.map(Ke).map(x=>x.trim()))??[];if(!i.some(Boolean)||!d.length||d.length>1e4||i.length>200)throw new Error("Нужны заголовки и от 1 до 10 000 игровых строк.");return{headers:i,rows:d.flatMap((x,o)=>x.some(g=>g!=null&&g!=="")?[{line:o+2,cells:x.map(Ke),error:x.some(g=>g&&typeof g=="object"&&!(g instanceof Date))?"Проверьте формулы, ссылки или сложные ячейки. Используйте обычный текст и числа.":x.slice(i.length).some(g=>g!=null&&g!=="")?"Строка содержит ячейки за пределами заголовка.":void 0}]:[])}}function Mr(a,m,l,d,i){const x=new Map(l.map(c=>[c.id,c])),o=new Map(x),g=new Set;return a.rows.map(({cells:c,line:j,error:E})=>{var _,n,r;const k=m.id===void 0?"":((_=c[m.id])==null?void 0:_.trim())??"",v=x.get(k),b=m.name===void 0?(v==null?void 0:v.name)??"":((n=c[m.name])==null?void 0:n.trim())||(v==null?void 0:v.name)||"",h=t=>({line:j,id:k,name:b,errors:t,action:v?"update":"new"});if(E)return h([E]);if(!k||g.has(k))return h([k?"Повтор ID в таблице.":"Нужен ID игры."]);g.add(k);const y={id:k,name:b,subscribers:0,year:0,releaseDate:"",wikidata:"",datePrecision:"day",genres:[],platforms:[],status:"unconfirmed",...v,sources:{...v==null?void 0:v.sources,record:"Табличный импорт"}},w=t=>{var s;const f=m[t];return f===void 0?void 0:((s=c[f])==null?void 0:s.trim())||(i?"":void 0)};for(const t of je){if(["id","rating","ratingUrl","origin"].includes(t))continue;const f=w(t);if(f!==void 0)if(["genres","platforms","aliases"].includes(t))y[t]=[...new Set(f.split(/[;|]/).map(s=>s.trim()).filter(Boolean))];else if(["subscribers","year","priority"].includes(t))y[t]=f?Number(f):0;else if(t==="excluded"){const s=f.toLowerCase();if(!["","true","false","1","0","да","нет"].includes(s))return h(["Поле excluded принимает да/нет или true/false."]);y.excluded=["true","1","да"].includes(s)}else["url","tagId"].includes(t)?y[t]=f||void 0:t==="status"?y[t]=f||"unconfirmed":t==="datePrecision"?y[t]=f||"day":y[t]=f}y.cover||(y.cover=void 0),y.url||(y.url=void 0),!y.releaseDate&&y.datePrecision==="year"&&Number(y.year)>=1e3&&(y.releaseDate=y.year+"-01-01");const p=y.releaseDate;w("year")===void 0&&p&&(y.year=Number(p.slice(0,4))),w("year")===""&&p&&(y.year=Number(p.slice(0,4))),!y.url&&y.tagId&&(y.url="https://cyber.sports.ru/games/"+y.tagId+"/");const G=w("rating"),L=w("ratingUrl"),H=y.sources;if(G!==void 0)if(G){const t=Number(G.replace(",","."));t===((r=v==null?void 0:v.rating)==null?void 0:r.value)&&v.rating?y.rating={...v.rating,url:L===void 0?v.rating.url:L||void 0}:(y.rating={value:t,source:"Редакция",original:t+"/10",url:L||void 0},H.rating="Табличный импорт редакции")}else y.rating=void 0,delete H.rating;else v!=null&&v.rating&&L!==void 0&&(y.rating={...v.rating,url:L||void 0});w("origin")!==void 0&&(H.record=w("origin")||"Табличный импорт");const A=Xe(y,d,[...o.values()],v==null?void 0:v.id);A.game&&!A.errors.length&&o.set(k,A.game);const V=!v&&l.find(t=>t.name.toLowerCase()===b.toLowerCase());return{...h(A.errors),game:A.game,warning:V?"Совпадает название с "+V.id:void 0}})}function Ar(a){return a.map(m=>je.map(l=>{var i,x;if(l==="rating")return((i=m.rating)==null?void 0:i.value)??"";if(l==="ratingUrl")return((x=m.rating)==null?void 0:x.url)??"";if(l==="origin")return m.sources.record??"";const d=m[l]??"";return Array.isArray(d)?d.join(";"):d}))}function Ne(a,m,l){const d=URL.createObjectURL(new Blob([m],{type:l})),i=document.createElement("a");i.href=d,i.download=a,i.click(),setTimeout(()=>URL.revokeObjectURL(d),1e3)}async function ye(a,m,l=!1){const d=l?[je.map(E=>E==="id"?"example":E==="name"?"Название игры":"")]:Ar(a),i=[[...je],...d],x=l?"catalog-template":"catalog-games";if(m==="csv"){Ne(x+".csv","\uFEFF"+er.unparse(i,{escapeFormulae:/^[\s\uFEFF]*[=+\-@]|^[\t\r\n]/}),"text/csv;charset=utf-8");return}const o=await $e(()=>import("./exceljs.min-Dj-PIaAO.js").then(E=>E.e),[]),g=new o.default.Workbook,c=g.addWorksheet("Игры");c.addRows(i.map(E=>E.map(k=>typeof k=="string"&&k.length>32767?"":k))),c.getRow(1).font={bold:!0};const j=await g.xlsx.writeBuffer();Ne(x+".xlsx",new Uint8Array(j),"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")}function Nr({draft:a,dict:m,games:l,selected:d,change:i}){const[x,o]=R.useState(),[g,c]=R.useState({}),[j,E]=R.useState(!1),[k,v]=R.useState(""),[b,h]=R.useState(""),[y,w]=R.useState("exclude"),[p,G]=R.useState(""),L=l.filter(r=>d.has(r.id)),H=R.useMemo(()=>x?Mr(x,g,l,m,j):[],[x,g,l,m,j]),A=H.flatMap(r=>r.game&&!r.errors.length?[r.game]:[]),V=r=>i({...a,games:{...a.games,...Object.fromEntries(r.map(t=>[t.id,t]))}}),_=async r=>{h("");try{await r()}catch(t){h(t instanceof Error?t.message:String(t))}},n=()=>{const r=(f,s)=>s?[...new Set([...f,p])]:f.filter(C=>C!==p),t=L.map(f=>{const s={...f,url:f.url||void 0,cover:f.cover||void 0};switch(y){case"exclude":return{...s,excluded:!0};case"include":return{...s,excluded:!1};case"status":return{...s,status:p};case"priority":return{...s,priority:+p};case"genre-add":return{...s,genres:r(f.genres,!0)};case"genre-remove":return{...s,genres:r(f.genres,!1)};case"platform-add":return{...s,platforms:r(f.platforms,!0)};case"platform-remove":return{...s,platforms:r(f.platforms,!1)};default:return s}});confirm("Изменить выбранные записи ("+t.length+")?")&&(V(t),v("Массовое изменение: "+t.length+" игр в черновике."))};return e.jsxs("div",{className:"adm-form",children:[e.jsx("h2",{children:"Импорт и экспорт"}),e.jsx("h3",{children:"Массовое редактирование"}),e.jsxs("p",{children:["Выбрано во вкладке «Игры»: ",L.length]}),e.jsxs("div",{className:"adm-row",children:[e.jsx(X,{label:"Операция",value:y,change:r=>{w(r),G("")},options:[["exclude","Исключить"],["include","Включить"],["status","Изменить статус"],["priority","Изменить приоритет"],["genre-add","Добавить жанр"],["genre-remove","Удалить жанр"],["platform-add","Добавить платформу"],["platform-remove","Удалить платформу"]].map(([r,t])=>({id:r,label:t}))}),y==="priority"&&e.jsx(me,{label:"Значение",children:e.jsx("input",{type:"number",value:p,onChange:r=>G(r.target.value)})}),y!=="priority"&&!["include","exclude"].includes(y)&&e.jsx(X,{label:"Значение",value:p,change:G,empty:"Выберите",options:y==="status"?Fe:be(y.startsWith("genre")?m.genres:m.platforms)}),e.jsx("button",{className:"adm-extra",disabled:!L.length||!p&&!["include","exclude"].includes(y)||y==="priority"&&!Number.isInteger(Number(p)),onClick:n,children:"Применить к выбранным"})]}),e.jsx("h3",{children:"Импорт игр"}),e.jsx(me,{label:"Таблица CSV или XLSX",children:e.jsx("input",{type:"file",accept:".csv,.xlsx",onChange:r=>{var s;const t=r.target,f=(s=t.files)==null?void 0:s[0];t.value="",f&&(o(void 0),_(async()=>{const C=await Dr(f);c(Object.fromEntries(je.flatMap(K=>{const u=C.headers.findIndex(W=>W.toLowerCase()===K.toLowerCase());return u>=0?[[K,u]]:[]}))),o(C)}))}})}),x&&e.jsxs(e.Fragment,{children:[e.jsx("div",{className:"adm-mapping",children:je.map(r=>{var t;return e.jsx(X,{label:r,value:((t=g[r])==null?void 0:t.toString())??"",empty:"Не импортировать",options:x.headers.map((f,s)=>({id:String(s),label:s+1+". "+f})),change:f=>c({...g,[r]:f===""?void 0:+f})},r)})}),e.jsx(oe,{label:"Очищать сопоставленные поля пустыми ячейками",checked:j,change:E}),e.jsxs("p",{children:["Новых ",H.filter(r=>r.action==="new"&&!r.errors.length).length," · обновлений ",H.filter(r=>r.action==="update"&&!r.errors.length).length," · с ошибками ",H.length-A.length]}),e.jsx("div",{className:"adm-table",children:e.jsxs("table",{children:[e.jsx("thead",{children:e.jsxs("tr",{children:[e.jsx("th",{children:"Строка"}),e.jsx("th",{children:"Игра"}),e.jsx("th",{children:"ID"}),e.jsx("th",{children:"Операция"}),e.jsx("th",{children:"Проверка"})]})}),e.jsx("tbody",{children:H.map(r=>{var t;return e.jsxs("tr",{children:[e.jsx("td",{children:r.line}),e.jsx("td",{children:((t=r.game)==null?void 0:t.name)??r.name}),e.jsx("td",{children:r.id}),e.jsx("td",{children:r.action==="new"?"Добавление":"Обновление"}),e.jsx("td",{children:r.errors.join(" ")||"warning"in r&&r.warning||"Готово"})]},r.line)})})]})}),e.jsxs("button",{className:"adm-primary",disabled:!A.length,onClick:()=>{confirm("Внести в черновик строки без ошибок ("+A.length+")?")&&(V(A),v("Импортировано "+A.length+" игр в черновик, пропущено "+(H.length-A.length)+"."),o(void 0))},children:["Подтвердить импорт (",A.length,")"]})]}),e.jsx("h3",{children:"Экспорт"}),e.jsx("p",{children:"В таблицах XLSX длинные встроенные изображения пропускаются. Полный архив с изображениями доступен в JSON."}),e.jsxs("div",{className:"adm-actions",children:[e.jsx("button",{onClick:()=>void _(()=>ye(l,"csv")),children:"Все игры CSV"}),e.jsx("button",{onClick:()=>void _(()=>ye(l,"xlsx")),children:"Все игры XLSX"}),e.jsx("button",{disabled:!L.length,onClick:()=>void _(()=>ye(L,"csv")),children:"Выбранные CSV"}),e.jsx("button",{disabled:!L.length,onClick:()=>void _(()=>ye(L,"xlsx")),children:"Выбранные XLSX"}),e.jsx("button",{onClick:()=>void _(()=>ye([],"xlsx",!0)),children:"Шаблон XLSX"}),e.jsx("button",{onClick:()=>void _(()=>ye([],"csv",!0)),children:"Шаблон CSV"}),e.jsx("button",{onClick:()=>Ne("catalog-admin.json",JSON.stringify(a,null,2),"application/json"),children:"Экспорт настроек JSON"})]}),e.jsx(me,{label:"Восстановление настроек из JSON",children:e.jsx("input",{type:"file",accept:".json,application/json",onChange:r=>{var s;const t=r.target,f=(s=t.files)==null?void 0:s[0];t.value="",f&&_(async()=>{const C=Ae(JSON.parse(await f.text()));confirm("Заменить текущий черновик содержимым JSON?")&&(i(C),v("Настройки восстановлены в черновик."))})}})}),b&&e.jsx("p",{className:"adm-error",role:"alert",children:b}),k&&e.jsxs("p",{role:"status",children:[k," Нажмите «Сохранить» для применения."]})]})}const Fr=["SEO","Игры","Порядок игр","Фильтры","Подборки","Блоки страницы","SEO-тексты","Импорт и экспорт","Настройки","История изменений"];function Ir(a){const m=Object.keys(a.before);return Object.fromEntries(m.filter(l=>JSON.stringify(a.before[l])!==JSON.stringify(a.after[l])).map(l=>[l,{previous:a.before[l],next:a.after[l]}]))}function Or({initial:a,warning:m,onSave:l,onPreview:d}){const[i,x]=R.useState(a.state),[o,g]=R.useState("SEO"),[c,j]=R.useState(new Set),[E,k]=R.useState(""),[v,b]=R.useState(""),[h,y]=R.useState(!1),[w,p]=R.useState(0),G=i!==a.state,L=R.useMemo(()=>fr(i),[i]),H=R.useMemo(()=>gr(i),[i]);R.useEffect(()=>{document.title="Управление каталогом — Кибер";let s=document.querySelector('meta[name="robots"]');s||(s=document.createElement("meta"),s.name="robots",document.head.append(s)),s.content="noindex, nofollow"},[]),R.useEffect(()=>{if(!G)return;const s=C=>{C.preventDefault(),C.returnValue=""};return window.addEventListener("beforeunload",s),()=>window.removeEventListener("beforeunload",s)},[G]);const A=s=>{x(s),k(""),b("")},V=s=>A({...i,games:{...i.games,[s.id]:s}}),_=async(s,C,K)=>{if(!h){y(!0),b(""),k("");try{const u=Ae(s),W=await xr(a,u,C,K);l(W),x(W.state),k("Изменения сохранены в этом браузере.")}catch(u){b("Сохранение не выполнено. "+(u instanceof Error?u.message:String(u)))}finally{y(!1)}}},n=()=>{const s=Object.values(i.games).filter(u=>u!==a.state.games[u.id]),C=Object.keys(i).filter(u=>i[u]!==a.state[u]),K=C.length===1?{version:"Настройки",games:"Игры",pages:"SEO страниц",templates:"Шаблоны",filters:"Фильтры",pins:"Закрепления",upper:"Верхние подборки",lower:"Нижние подборки",blocks:"Блоки",blockOrder:"Порядок блоков",settings:"Настройки"}[C[0]]:"Несколько разделов";_(i,K,s.length===1?s[0].name:s.length?"Игры ("+s.length+")":o)},r=s=>{confirm("Восстановить состояние до изменения «"+s.name+"»? Текущая версия останется в истории.")&&(p(w+1),_(s.before,"Восстановление",s.name))},t=(s,C)=>A({...i,blocks:{...i.blocks,[s]:{...i.blocks[s],limit:C}}}),f={SEO:e.jsx(Ge,{draft:i,dict:L,change:A}),Игры:e.jsx(Rr,{games:H,dict:L,selected:c,setSelected:j,apply:V}),"Порядок игр":e.jsx(kr,{games:H,dict:L,draft:i,change:A,apply:V}),Фильтры:e.jsx(jr,{draft:i,change:A}),Подборки:e.jsx(wr,{draft:i,change:A}),"Блоки страницы":e.jsx(Sr,{draft:i,games:H,change:A}),"SEO-тексты":e.jsx(Ge,{onlyText:!0,draft:i,dict:L,change:A}),"Импорт и экспорт":e.jsx(Nr,{draft:i,dict:L,games:H,selected:c,change:A}),Настройки:e.jsxs("div",{className:"adm-form",children:[e.jsx("h2",{children:"Настройки"}),e.jsx(M,{label:"Игр на страницу (1–100)",type:"number",value:i.settings.perPage,change:s=>A({...i,settings:{...i.settings,perPage:+s}})}),e.jsx(M,{label:"Минимум для индексации (3–100)",type:"number",value:i.settings.minIndexable,change:s=>A({...i,settings:{...i.settings,minIndexable:+s}})}),e.jsx("p",{className:"adm-note",children:"Порог можно увеличить. Поиск, пустые страницы и страницы с пользовательскими параметрами закрываются по действующим правилам."}),e.jsx(M,{label:"Недавних релизов в блоке",type:"number",value:i.blocks.recent.limit,change:s=>t("recent",+s)}),e.jsx(M,{label:"Ожидаемых релизов в блоке",type:"number",value:i.blocks.upcoming.limit,change:s=>t("upcoming",+s)}),e.jsx(M,{label:"Период недавних релизов (1–365 дней)",type:"number",value:i.settings.recentDays,change:s=>A({...i,settings:{...i.settings,recentDays:+s}})}),e.jsx(X,{label:"Сортировка по умолчанию",value:i.settings.defaultSort,options:Se.sorts.map(s=>({id:s.key,label:s.label})),change:s=>A({...i,settings:{...i.settings,defaultSort:s}})}),e.jsx("button",{className:"adm-danger",onClick:()=>{confirm("Восстановить исходные игры и настройки в черновике?")&&(p(w+1),A(br))},children:"Восстановить исходные данные"})]}),"История изменений":e.jsxs("div",{className:"adm-form",children:[e.jsx("h2",{children:"История изменений"}),e.jsx("p",{children:"Последние 25 сохранений в этом браузере."}),!a.history.length&&e.jsx("p",{children:"Изменений пока нет."}),a.history.map(s=>e.jsxs("details",{className:"adm-story",children:[e.jsxs("summary",{children:[new Date(s.at).toLocaleString("ru-RU")," · ",s.entity," · ",s.name]}),e.jsx("p",{children:"Предыдущие и новые значения"}),e.jsx("pre",{children:JSON.stringify(Ir(s),(C,K)=>typeof K=="string"&&K.startsWith("data:image/")?"[встроенное изображение]":K,2)}),e.jsx("button",{disabled:h,className:"adm-extra",onClick:()=>r(s),children:"Восстановить предыдущую версию"})]},s.id))]})};return e.jsxs("main",{className:"admin",children:[e.jsxs("header",{className:"adm-header",children:[e.jsx("h1",{children:"Управление каталогом игр"}),e.jsx("p",{children:"Прототип редакционного интерфейса. Изменения хранятся в этом браузере."}),e.jsxs("div",{className:"adm-actions",children:[e.jsx("button",{className:"adm-primary",disabled:!G||h||!!m,onClick:n,children:h?"Сохранение…":"Сохранить"}),e.jsx("button",{className:"adm-extra",disabled:h,onClick:()=>{try{d(Ae(i))}catch(s){b(s instanceof Error?s.message:String(s))}},children:"Предпросмотр каталога"}),e.jsx("button",{disabled:h,onClick:()=>{G&&!confirm("Отменить несохранённые изменения?")||(A(a.state),p(w+1))},children:"Отменить несохранённые изменения"}),e.jsx("a",{href:pr(Se.base),children:"Вернуться в каталог"})]}),G&&e.jsx("p",{className:"adm-note",children:"Есть несохранённые изменения."}),(v||m)&&e.jsx("p",{role:"alert",className:"adm-error",children:v||m}),E&&e.jsx("p",{role:"status",className:"adm-success",children:E})]}),e.jsx("nav",{className:"adm-tabs","aria-label":"Разделы администрирования",children:Fr.map(s=>e.jsx("button",{"aria-current":o===s?"page":void 0,onClick:()=>g(s),children:s},s))}),e.jsx("section",{className:"adm-content",children:f[o]},o+w)]})}const zr=Object.freeze(Object.defineProperty({__proto__:null,Admin:Or},Symbol.toStringTag,{value:"Module"}));export{zr as A,vr as c,yr as g};
