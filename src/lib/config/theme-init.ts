/**
 * Blocking inline script injected in <head> before first paint.
 * Reads admin state from localStorage and sets CSS custom properties
 * synchronously — zero flash-of-wrong-palette on page load.
 *
 * All token maps are imported from @/lib/design/tokens and serialized
 * via JSON.stringify at build time so the emitted <script> is self-contained
 * (no ES module imports at browser runtime).
 * See ADR-005 for the design token architecture.
 */
import {
  PALETTE_VARS,
  SHADER_GRADS,
  CONTAINER_WIDTHS,
  SECTION_PADDINGS,
  RADIUS_VALUES,
  ANIM_DURATIONS,
  FONT_FAMILIES,
  FONT_SIZE_SCALES,
  SHADOW_INTENSITIES,
  GLOW_INTENSITIES,
  BUTTON_RADIUS,
  GLASS_BLUR,
  GLASS_OPACITY,
  GLASS_BORDER_OPACITY,
} from '@/lib/design/tokens'

// Serialized at build time — each becomes a literal in the emitted script string
const _pv = JSON.stringify(PALETTE_VARS)
const _sg = JSON.stringify(SHADER_GRADS)
const _cw = JSON.stringify(CONTAINER_WIDTHS)
const _sp = JSON.stringify(SECTION_PADDINGS)
const _rv = JSON.stringify(RADIUS_VALUES)
const _ad = JSON.stringify(ANIM_DURATIONS)
const _ff = JSON.stringify(FONT_FAMILIES)
const _fs = JSON.stringify(FONT_SIZE_SCALES)
const _si = JSON.stringify(SHADOW_INTENSITIES)
const _gi = JSON.stringify(GLOW_INTENSITIES)
const _br = JSON.stringify(BUTTON_RADIUS)
const _gb = JSON.stringify(GLASS_BLUR)
const _go = JSON.stringify(GLASS_OPACITY)
const _gbo = JSON.stringify(GLASS_BORDER_OPACITY)

export function getThemeInitScript(): string {
  return `(function(){try{
var raw=localStorage.getItem('jootacee-command-v2');
if(!raw)return;
var s=JSON.parse(raw);
var d=s.design;
var r=document.documentElement;
if(d){
  var pv=${_pv};
  var c=pv[d.palette];
  if(c){Object.keys(c).forEach(function(k){r.style.setProperty(k,c[k]);});}
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
  var cw=${_cw};
  var sp=${_sp};
  var rv=${_rv};
  var ad=${_ad};
  var ff=${_ff};
  var fs=${_fs};
  var si=${_si};
  var gi=${_gi};
  var br=${_br};
  var gb=${_gb};
  var go2=${_go};
  var gbo=${_gbo};
  if(tk.containerWidth&&cw[tk.containerWidth])r.style.setProperty('--container-max',cw[tk.containerWidth]);
  if(tk.sectionPadding&&sp[tk.sectionPadding])r.style.setProperty('--section-py',sp[tk.sectionPadding]);
  if(tk.borderRadius&&rv[tk.borderRadius])r.style.setProperty('--radius-base',rv[tk.borderRadius]);
  if(tk.animationSpeed&&ad[tk.animationSpeed])r.style.setProperty('--anim-duration',ad[tk.animationSpeed]);
  if(tk.typography&&ff[tk.typography])r.style.setProperty('--font-sans',ff[tk.typography]);
  if(tk.fontSizeScale&&fs[tk.fontSizeScale])r.style.setProperty('--font-size-base',fs[tk.fontSizeScale]);
  if(tk.shadowIntensity&&si[tk.shadowIntensity])r.style.setProperty('--shadow-intensity',si[tk.shadowIntensity]);
  if(tk.glowIntensity&&gi[tk.glowIntensity])r.style.setProperty('--glow-intensity',gi[tk.glowIntensity]);
  if(tk.buttonStyle&&br[tk.buttonStyle])r.style.setProperty('--radius-button',br[tk.buttonStyle]);
  if(tk.glassBlur&&gb[tk.glassBlur])r.style.setProperty('--glass-blur',gb[tk.glassBlur]);
  if(tk.glassOpacity&&go2[tk.glassOpacity])r.style.setProperty('--glass-opacity',go2[tk.glassOpacity]);
  if(tk.glassBorderOpacity&&gbo[tk.glassBorderOpacity])r.style.setProperty('--glass-border-opacity',gbo[tk.glassBorderOpacity]);
}
var ve=s.visualEffects;
var sg=${_sg};
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
