/**
 * Blocking inline script injected in <head> before first paint.
 * Reads admin state from localStorage and sets CSS custom properties
 * synchronously so there is zero flash-of-wrong-palette on page load.
 * Mirrors PALETTE_VARS, SHADER_GRADS, and all token maps in ThemeApplicator.tsx — keep in sync.
 */
export function getThemeInitScript(): string {
  return `(function(){try{
var raw=localStorage.getItem('jootacee-command-v2');
if(!raw)return;
var s=JSON.parse(raw);
var d=s.design;
var r=document.documentElement;
if(d){
  var p={
    ocean:['#0ea5e9','#ffffff','#7dd3fc','#03111e','#38bdf8','#0ea5e9','#7dd3fc'],
    emerald:['#059669','#ffffff','#6ee7b7','#03111e','#10b981','#059669','#6ee7b7'],
    amber:['#d97706','#ffffff','#fcd34d','#03111e','#f59e0b','#d97706','#fcd34d'],
    rose:['#e11d48','#ffffff','#fb7185','#ffffff','#f43f5e','#e11d48','#fb7185'],
    violet:['#7c3aed','#ffffff','#a78bfa','#ffffff','#8b5cf6','#7c3aed','#a78bfa'],
    slate:['#475569','#ffffff','#94a3b8','#0c1526','#64748b','#475569','#94a3b8']
  };
  var vn=['--primary','--primary-foreground','--accent','--accent-foreground','--ring','--glow','--glow-secondary'];
  var c=p[d.palette];
  if(c){for(var i=0;i<vn.length;i++)r.style.setProperty(vn[i],c[i]);}
  else if(d.palette==='custom'){
    if(d.customPrimary){r.style.setProperty('--primary',d.customPrimary);r.style.setProperty('--glow',d.customPrimary);}
    if(d.customSecondary)r.style.setProperty('--secondary',d.customSecondary);
    if(d.customAccent){r.style.setProperty('--accent',d.customAccent);r.style.setProperty('--glow-secondary',d.customAccent);}
    if(d.customBackground)r.style.setProperty('--background',d.customBackground);
    if(d.customSurface)r.style.setProperty('--card',d.customSurface);
    if(d.customText)r.style.setProperty('--foreground',d.customText);
    if(d.customBorder)r.style.setProperty('--border',d.customBorder);
  }
  if(d.palette!=='custom'){
    if(d.customBackground)r.style.setProperty('--background',d.customBackground);
    if(d.customSurface)r.style.setProperty('--card',d.customSurface);
    if(d.customText)r.style.setProperty('--foreground',d.customText);
    if(d.customBorder)r.style.setProperty('--border',d.customBorder);
    if(d.customSecondary)r.style.setProperty('--secondary',d.customSecondary);
  }
  if(d.customGlow)r.style.setProperty('--glow',d.customGlow);
  if(d.customGlowSecondary)r.style.setProperty('--glow-secondary',d.customGlowSecondary);
  if(d.customRing)r.style.setProperty('--ring',d.customRing);
  if(d.customMuted)r.style.setProperty('--muted',d.customMuted);
  if(d.customMutedFg)r.style.setProperty('--muted-foreground',d.customMutedFg);
  if(d.gradientStart)r.style.setProperty('--gradient-start',d.gradientStart);
  if(d.gradientMid)r.style.setProperty('--gradient-mid',d.gradientMid);
  if(d.gradientEnd)r.style.setProperty('--gradient-end',d.gradientEnd);
  if(d.btnGradientFrom){r.style.setProperty('--btn-gradient-from',d.btnGradientFrom);r.style.setProperty('--btn-bg','linear-gradient(to right,var(--btn-gradient-from),var(--btn-gradient-to,'+d.btnGradientFrom+'))');}
  if(d.btnGradientTo){r.style.setProperty('--btn-gradient-to',d.btnGradientTo);r.style.setProperty('--btn-bg','linear-gradient(to right,var(--btn-gradient-from,'+d.btnGradientTo+'),var(--btn-gradient-to))');}
  if(d.btnText)r.style.setProperty('--btn-text',d.btnText);
  var da=d.domainAccents;
  if(da){
    if(da.projects)r.style.setProperty('--accent-projects',da.projects);
    if(da.research)r.style.setProperty('--accent-research',da.research);
    if(da.resources)r.style.setProperty('--accent-resources',da.resources);
    if(da.intelligence)r.style.setProperty('--accent-intelligence',da.intelligence);
    if(da.github)r.style.setProperty('--accent-github',da.github);
    if(da.about)r.style.setProperty('--accent-about',da.about);
  }
  if(d.darkModeDefault&&d.darkModeDefault!=='system')r.setAttribute('data-theme',d.darkModeDefault);
  var tk=d.tokens||{};
  var cw={sm:'640px',md:'768px',lg:'1024px',xl:'1280px',full:'100%'};
  var sp={compact:'3rem',normal:'5rem',spacious:'8rem'};
  var rv={none:'0px',sm:'4px',md:'8px',lg:'12px',xl:'16px','2xl':'24px',full:'9999px'};
  var ad={instant:'0ms',fast:'150ms',normal:'300ms',slow:'600ms'};
  var ff={system:'system-ui,-apple-system,sans-serif',modern:'var(--font-inter),"Avenir Next",sans-serif',classic:'Georgia,"Times New Roman",serif',mono:'var(--font-jetbrains-mono),"IBM Plex Mono",monospace'};
  var fs={xs:'12px',sm:'14px',md:'16px',lg:'18px',xl:'20px'};
  var si={none:'0',subtle:'0.6',normal:'1',dramatic:'1.8'};
  var gi={off:'0',subtle:'0.5',normal:'1',vivid:'1.8'};
  var br={sharp:'0px',rounded:'8px',pill:'9999px'};
  if(tk.containerWidth&&cw[tk.containerWidth])r.style.setProperty('--container-max',cw[tk.containerWidth]);
  if(tk.sectionPadding&&sp[tk.sectionPadding])r.style.setProperty('--section-py',sp[tk.sectionPadding]);
  if(tk.borderRadius&&rv[tk.borderRadius])r.style.setProperty('--radius-base',rv[tk.borderRadius]);
  if(tk.animationSpeed&&ad[tk.animationSpeed])r.style.setProperty('--anim-duration',ad[tk.animationSpeed]);
  if(tk.typography&&ff[tk.typography])r.style.setProperty('--font-sans',ff[tk.typography]);
  if(tk.fontSizeScale&&fs[tk.fontSizeScale])r.style.setProperty('--font-size-base',fs[tk.fontSizeScale]);
  if(tk.shadowIntensity&&si[tk.shadowIntensity])r.style.setProperty('--shadow-intensity',si[tk.shadowIntensity]);
  if(tk.glowIntensity&&gi[tk.glowIntensity])r.style.setProperty('--glow-intensity',gi[tk.glowIntensity]);
  if(tk.buttonStyle&&br[tk.buttonStyle])r.style.setProperty('--radius-button',br[tk.buttonStyle]);
  var gb={none:'0px',sm:'8px',md:'20px',lg:'32px',xl:'48px'};
  var go2={ghost:'0.3',light:'0.6',normal:'1',heavy:'1.2',solid:'1.5'};
  var gbo={none:'0',subtle:'0.5',normal:'1',strong:'1.8'};
  if(tk.glassBlur&&gb[tk.glassBlur])r.style.setProperty('--glass-blur',gb[tk.glassBlur]);
  if(tk.glassOpacity&&go2[tk.glassOpacity])r.style.setProperty('--glass-opacity',go2[tk.glassOpacity]);
  if(tk.glassBorderOpacity&&gbo[tk.glassBorderOpacity])r.style.setProperty('--glass-border-opacity',gbo[tk.glassBorderOpacity]);
}
var ve=s.visualEffects;
var sg={
  'cosmic-blue':['rgb(59 130 246/22%)','rgb(34 197 94/13%)','rgb(6 182 212/15%)','rgb(139 92 246/5%)'],
  'aurora-night':['rgb(20 184 166/18%)','rgb(5 150 105/12%)','rgb(34 197 94/14%)','rgb(6 182 212/6%)'],
  'nebula':['rgb(139 92 246/22%)','rgb(124 58 237/12%)','rgb(192 132 252/15%)','rgb(99 102 241/5%)'],
  'cyber-ocean':['rgb(6 182 212/22%)','rgb(14 165 233/13%)','rgb(56 189 248/15%)','rgb(34 211 238/5%)'],
  'solar-flare':['rgb(234 88 12/22%)','rgb(245 158 11/13%)','rgb(252 211 77/15%)','rgb(239 68 68/5%)'],
  'deep-rose':['rgb(225 29 72/22%)','rgb(244 63 94/13%)','rgb(251 113 133/15%)','rgb(192 38 211/5%)'],
  'void':['rgb(30 30 50/15%)','rgb(20 20 40/10%)','rgb(15 15 35/12%)','rgb(10 10 25/4%)'],
  'forest-data':['rgb(22 163 74/22%)','rgb(5 150 105/13%)','rgb(34 197 94/15%)','rgb(16 185 129/5%)']
};
var g=sg[(ve&&ve.activeShaderPreset)||'cosmic-blue']||sg['cosmic-blue'];
var go=(ve&&ve.bgGradientOpacity!==undefined)?ve.bgGradientOpacity:1;
if(go===1){
  r.style.setProperty('--body-grad-1',g[0]);
  r.style.setProperty('--body-grad-2',g[1]);
  r.style.setProperty('--body-grad-3',g[2]);
  r.style.setProperty('--body-grad-4',g[3]);
}else{
  var sc=function(c){return c.replace(/(\\d+(?:\\.\\d+)?)%\\)/,function(_,p){return (parseFloat(p)*go).toFixed(1)+'%)';});};
  r.style.setProperty('--body-grad-1',sc(g[0]));
  r.style.setProperty('--body-grad-2',sc(g[1]));
  r.style.setProperty('--body-grad-3',sc(g[2]));
  r.style.setProperty('--body-grad-4',sc(g[3]));
}
var bg=ve&&ve.bgGrid;
if(bg!==undefined&&bg!==null){
  r.style.setProperty('--grid-opacity',bg.enabled?String(bg.opacity):'0');
  r.style.setProperty('--grid-line-color',bg.color);
  r.style.setProperty('--grid-size',bg.size+'px');
  r.style.setProperty('--grid-mask',bg.mask?'radial-gradient(circle at 50% 35%, #000 22%, transparent 85%)':'none');
}
}catch(e){}}());`
}
