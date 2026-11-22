import React, { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { cloud } from './cloud.js';
import { findSkillPlan, planMilestones, planResources, skillPlanLabel } from './skills.js';
import { LogHome, LayoutPicker, JobWidget, DevStrip, homeStyleOf, LOG_HIDES } from './v9.jsx';
import FrontPage, { JobFace } from './v10.jsx';
import PushCheck from './push.jsx';
import PlannerWizard from './planner.jsx';
import { SITUATIONS, SIT_HINTS, presetPatch, hasSit, comfortOf, ZOOM, LifePanel, EnergyCard, CalmHome, JobHunt, TermPanel, RotaPanel, BudgetCard, CirclePanel, priceNum, budgetLeft, budgetPass, dstr as gDstr } from './groups.jsx';
import {
  ArrowLeft,
  Search,
  Home,
  Clock,
  Calendar,
  Lightbulb,
  GitBranch,
  Users,
  User,
  Bell,
  Mic,
  Plus,
  Check,
  X,
  Star,
  RefreshCw,
  ExternalLink,
  Bot,
  Send,
  Pill,
  Utensils,
  Smile,
  Meh,
  Frown,
  AlertTriangle,
  MapPin,
  Download,
  Share2,
  Trash2,
  Dices,
  Sparkles,
  CheckCircle2,
  Phone,
  MessageSquare,
  Edit3,
  LogOut,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  ChevronDown,
  LayoutGrid,
  Droplets,
  StickyNote,
  CalendarDays,
  ArrowUp,
  Heart, Landmark, Trees, Dumbbell, ShoppingBag, Coffee, Pizza, Beer, Mountain, Film, Music, Palette, BookOpen, Plane
} from 'lucide-react';


// Pre-compiled Tailwind CSS for this app, so it renders the same regardless of the host's Tailwind version.
const ROAM_CSS = "*,:after,:before{--tw-border-spacing-x:0;--tw-border-spacing-y:0;--tw-translate-x:0;--tw-translate-y:0;--tw-rotate:0;--tw-skew-x:0;--tw-skew-y:0;--tw-scale-x:1;--tw-scale-y:1;--tw-pan-x: ;--tw-pan-y: ;--tw-pinch-zoom: ;--tw-scroll-snap-strictness:proximity;--tw-gradient-from-position: ;--tw-gradient-via-position: ;--tw-gradient-to-position: ;--tw-ordinal: ;--tw-slashed-zero: ;--tw-numeric-figure: ;--tw-numeric-spacing: ;--tw-numeric-fraction: ;--tw-ring-inset: ;--tw-ring-offset-width:0px;--tw-ring-offset-color:#fff;--tw-ring-color:rgba(59,130,246,.5);--tw-ring-offset-shadow:0 0 #0000;--tw-ring-shadow:0 0 #0000;--tw-shadow:0 0 #0000;--tw-shadow-colored:0 0 #0000;--tw-blur: ;--tw-brightness: ;--tw-contrast: ;--tw-grayscale: ;--tw-hue-rotate: ;--tw-invert: ;--tw-saturate: ;--tw-sepia: ;--tw-drop-shadow: ;--tw-backdrop-blur: ;--tw-backdrop-brightness: ;--tw-backdrop-contrast: ;--tw-backdrop-grayscale: ;--tw-backdrop-hue-rotate: ;--tw-backdrop-invert: ;--tw-backdrop-opacity: ;--tw-backdrop-saturate: ;--tw-backdrop-sepia: ;--tw-contain-size: ;--tw-contain-layout: ;--tw-contain-paint: ;--tw-contain-style: }::backdrop{--tw-border-spacing-x:0;--tw-border-spacing-y:0;--tw-translate-x:0;--tw-translate-y:0;--tw-rotate:0;--tw-skew-x:0;--tw-skew-y:0;--tw-scale-x:1;--tw-scale-y:1;--tw-pan-x: ;--tw-pan-y: ;--tw-pinch-zoom: ;--tw-scroll-snap-strictness:proximity;--tw-gradient-from-position: ;--tw-gradient-via-position: ;--tw-gradient-to-position: ;--tw-ordinal: ;--tw-slashed-zero: ;--tw-numeric-figure: ;--tw-numeric-spacing: ;--tw-numeric-fraction: ;--tw-ring-inset: ;--tw-ring-offset-width:0px;--tw-ring-offset-color:#fff;--tw-ring-color:rgba(59,130,246,.5);--tw-ring-offset-shadow:0 0 #0000;--tw-ring-shadow:0 0 #0000;--tw-shadow:0 0 #0000;--tw-shadow-colored:0 0 #0000;--tw-blur: ;--tw-brightness: ;--tw-contrast: ;--tw-grayscale: ;--tw-hue-rotate: ;--tw-invert: ;--tw-saturate: ;--tw-sepia: ;--tw-drop-shadow: ;--tw-backdrop-blur: ;--tw-backdrop-brightness: ;--tw-backdrop-contrast: ;--tw-backdrop-grayscale: ;--tw-backdrop-hue-rotate: ;--tw-backdrop-invert: ;--tw-backdrop-opacity: ;--tw-backdrop-saturate: ;--tw-backdrop-sepia: ;--tw-contain-size: ;--tw-contain-layout: ;--tw-contain-paint: ;--tw-contain-style: }/*! tailwindcss v3.4.19 | MIT License | https://tailwindcss.com*/*,:after,:before{box-sizing:border-box;border:0 solid #e5e7eb}:after,:before{--tw-content:\"\"}:host,html{line-height:1.5;-webkit-text-size-adjust:100%;-moz-tab-size:4;-o-tab-size:4;tab-size:4;font-family:ui-sans-serif,system-ui,sans-serif,Apple Color Emoji,Segoe UI Emoji,Segoe UI Symbol,Noto Color Emoji;font-feature-settings:normal;font-variation-settings:normal;-webkit-tap-highlight-color:transparent}body{margin:0;line-height:inherit}hr{height:0;color:inherit;border-top-width:1px}abbr:where([title]){-webkit-text-decoration:underline dotted;text-decoration:underline dotted}h1,h2,h3,h4,h5,h6{font-size:inherit;font-weight:inherit}a{color:inherit;text-decoration:inherit}b,strong{font-weight:bolder}code,kbd,pre,samp{font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,Liberation Mono,Courier New,monospace;font-feature-settings:normal;font-variation-settings:normal;font-size:1em}small{font-size:80%}sub,sup{font-size:75%;line-height:0;position:relative;vertical-align:baseline}sub{bottom:-.25em}sup{top:-.5em}table{text-indent:0;border-color:inherit;border-collapse:collapse}button,input,optgroup,select,textarea{font-family:inherit;font-feature-settings:inherit;font-variation-settings:inherit;font-size:100%;font-weight:inherit;line-height:inherit;letter-spacing:inherit;color:inherit;margin:0;padding:0}button,select{text-transform:none}button,input:where([type=button]),input:where([type=reset]),input:where([type=submit]){-webkit-appearance:button;background-color:transparent;background-image:none}:-moz-focusring{outline:auto}:-moz-ui-invalid{box-shadow:none}progress{vertical-align:baseline}::-webkit-inner-spin-button,::-webkit-outer-spin-button{height:auto}[type=search]{-webkit-appearance:textfield;outline-offset:-2px}::-webkit-search-decoration{-webkit-appearance:none}::-webkit-file-upload-button{-webkit-appearance:button;font:inherit}summary{display:list-item}blockquote,dd,dl,figure,h1,h2,h3,h4,h5,h6,hr,p,pre{margin:0}fieldset{margin:0}fieldset,legend{padding:0}menu,ol,ul{list-style:none;margin:0;padding:0}dialog{padding:0}textarea{resize:vertical}input::-moz-placeholder,textarea::-moz-placeholder{opacity:1;color:#9ca3af}input::placeholder,textarea::placeholder{opacity:1;color:#9ca3af}[role=button],button{cursor:pointer}:disabled{cursor:default}audio,canvas,embed,iframe,img,object,svg,video{display:block;vertical-align:middle}img,video{max-width:100%;height:auto}[hidden]:where(:not([hidden=until-found])){display:none}.container{width:100%}@media (min-width:640px){.container{max-width:640px}}@media (min-width:768px){.container{max-width:768px}}@media (min-width:1024px){.container{max-width:1024px}}@media (min-width:1280px){.container{max-width:1280px}}@media (min-width:1536px){.container{max-width:1536px}}.pointer-events-none{pointer-events:none}.pointer-events-auto{pointer-events:auto}.visible{visibility:visible}.fixed{position:fixed}.absolute{position:absolute}.relative{position:relative}.sticky{position:sticky}.inset-0{inset:0}.inset-x-0{left:0;right:0}.inset-x-3{left:.75rem;right:.75rem}.-left-\\[7px\\]{left:-7px}.-right-1{right:-.25rem}.-right-1\\.5{right:-.375rem}.-top-1{top:-.25rem}.-top-1\\.5{top:-.375rem}.-top-2{top:-.5rem}.bottom-0{bottom:0}.bottom-16{bottom:4rem}.bottom-2{bottom:.5rem}.bottom-20{bottom:5rem}.bottom-24{bottom:6rem}.left-0{left:0}.left-1{left:.25rem}.left-1\\/2{left:50%}.left-2{left:.5rem}.left-2\\.5{left:.625rem}.left-3{left:.75rem}.right-0{right:0}.right-1{right:.25rem}.right-1\\.5{right:.375rem}.right-3{right:.75rem}.right-4{right:1rem}.top-0{top:0}.top-0\\.5{top:.125rem}.top-1{top:.25rem}.top-1\\.5{top:.375rem}.top-1\\/2{top:50%}.top-2{top:.5rem}.z-0{z-index:0}.z-10{z-index:10}.z-20{z-index:20}.z-30{z-index:30}.z-40{z-index:40}.z-50{z-index:50}.z-\\[1\\]{z-index:1}.z-\\[300\\]{z-index:300}.col-span-2{grid-column:span 2/span 2}.m-3{margin:.75rem}.mx-auto{margin-left:auto;margin-right:auto}.-mb-px{margin-bottom:-1px}.-mt-1{margin-top:-.25rem}.mb-0{margin-bottom:0}.mb-0\\.5{margin-bottom:.125rem}.mb-1{margin-bottom:.25rem}.mb-2{margin-bottom:.5rem}.ml-1{margin-left:.25rem}.ml-1\\.5{margin-left:.375rem}.ml-2{margin-left:.5rem}.ml-4{margin-left:1rem}.ml-8{margin-left:2rem}.mr-1{margin-right:.25rem}.mt-0{margin-top:0}.mt-0\\.5{margin-top:.125rem}.mt-1{margin-top:.25rem}.mt-1\\.5{margin-top:.375rem}.mt-2{margin-top:.5rem}.mt-2\\.5{margin-top:.625rem}.mt-3{margin-top:.75rem}.mt-3\\.5{margin-top:.875rem}.mt-4{margin-top:1rem}.mt-5{margin-top:1.25rem}.mt-6{margin-top:1.5rem}.mt-auto{margin-top:auto}.block{display:block}.inline-block{display:inline-block}.inline{display:inline}.flex{display:flex}.inline-flex{display:inline-flex}.table{display:table}.grid{display:grid}.contents{display:contents}.\\!hidden{display:none!important}.hidden{display:none}.h-0{height:0}.h-1{height:.25rem}.h-1\\.5{height:.375rem}.h-10{height:2.5rem}.h-11{height:2.75rem}.h-12{height:3rem}.h-2{height:.5rem}.h-2\\.5{height:.625rem}.h-24{height:6rem}.h-3{height:.75rem}.h-3\\.5{height:.875rem}.h-4{height:1rem}.h-44{height:11rem}.h-5{height:1.25rem}.h-52{height:13rem}.h-56{height:14rem}.h-6{height:1.5rem}.h-7{height:1.75rem}.h-8{height:2rem}.h-9{height:2.25rem}.h-\\[100dvh\\]{height:100dvh}.h-\\[30px\\]{height:30px}.h-\\[34px\\]{height:34px}.h-\\[38px\\]{height:38px}.h-\\[3px\\]{height:3px}.h-full{height:100%}.h-screen{height:100vh}.max-h-48{max-height:12rem}.max-h-56{max-height:14rem}.max-h-72{max-height:18rem}.max-h-80{max-height:20rem}.max-h-\\[88dvh\\]{max-height:88dvh}.max-h-\\[88vh\\]{max-height:88vh}.max-h-\\[90dvh\\]{max-height:90dvh}.max-h-\\[90vh\\]{max-height:90vh}.min-h-full{min-height:100%}.w-1{width:.25rem}.w-1\\.5{width:.375rem}.w-10{width:2.5rem}.w-11{width:2.75rem}.w-12{width:3rem}.w-14{width:3.5rem}.w-16{width:4rem}.w-2{width:.5rem}.w-2\\.5{width:.625rem}.w-3{width:.75rem}.w-3\\.5{width:.875rem}.w-4{width:1rem}.w-5{width:1.25rem}.w-6{width:1.5rem}.w-7{width:1.75rem}.w-8{width:2rem}.w-9{width:2.25rem}.w-\\[22px\\]{width:22px}.w-\\[84px\\]{width:84px}.w-full{width:100%}.min-w-0{min-width:0}.min-w-\\[140px\\]{min-width:140px}.min-w-\\[160px\\]{min-width:160px}.min-w-\\[16px\\]{min-width:16px}.max-w-\\[230px\\]{max-width:230px}.max-w-\\[48\\%\\]{max-width:48%}.max-w-\\[560px\\]{max-width:560px}.max-w-\\[80\\%\\]{max-width:80%}.max-w-md{max-width:28rem}.max-w-sm{max-width:24rem}.flex-1{flex:1 1 0%}.shrink-0{flex-shrink:0}.-translate-x-1{--tw-translate-x:-0.25rem}.-translate-x-1,.-translate-x-1\\/2{transform:translate(var(--tw-translate-x),var(--tw-translate-y)) rotate(var(--tw-rotate)) skewX(var(--tw-skew-x)) skewY(var(--tw-skew-y)) scaleX(var(--tw-scale-x)) scaleY(var(--tw-scale-y))}.-translate-x-1\\/2{--tw-translate-x:-50%}.-translate-y-1{--tw-translate-y:-0.25rem}.-translate-y-1,.-translate-y-1\\/2{transform:translate(var(--tw-translate-x),var(--tw-translate-y)) rotate(var(--tw-rotate)) skewX(var(--tw-skew-x)) skewY(var(--tw-skew-y)) scaleX(var(--tw-scale-x)) scaleY(var(--tw-scale-y))}.-translate-y-1\\/2{--tw-translate-y:-50%}.-translate-y-px{--tw-translate-y:-1px}.-translate-y-px,.transform{transform:translate(var(--tw-translate-x),var(--tw-translate-y)) rotate(var(--tw-rotate)) skewX(var(--tw-skew-x)) skewY(var(--tw-skew-y)) scaleX(var(--tw-scale-x)) scaleY(var(--tw-scale-y))}@keyframes pulse{50%{opacity:.5}}.animate-pulse{animation:pulse 2s cubic-bezier(.4,0,.6,1) infinite}@keyframes spin{to{transform:rotate(1turn)}}.animate-spin{animation:spin 1s linear infinite}.cursor-pointer{cursor:pointer}.select-none{-webkit-user-select:none;-moz-user-select:none;user-select:none}.resize-none{resize:none}.resize{resize:both}.list-disc{list-style-type:disc}.grid-cols-1{grid-template-columns:repeat(1,minmax(0,1fr))}.grid-cols-2{grid-template-columns:repeat(2,minmax(0,1fr))}.grid-cols-3{grid-template-columns:repeat(3,minmax(0,1fr))}.grid-cols-4{grid-template-columns:repeat(4,minmax(0,1fr))}.grid-cols-7{grid-template-columns:repeat(7,minmax(0,1fr))}.grid-cols-\\[46px_1fr\\]{grid-template-columns:46px 1fr}.grid-cols-\\[92px_1fr\\]{grid-template-columns:92px 1fr}.flex-col{flex-direction:column}.flex-wrap{flex-wrap:wrap}.items-start{align-items:flex-start}.items-end{align-items:flex-end}.items-center{align-items:center}.items-baseline{align-items:baseline}.items-stretch{align-items:stretch}.justify-start{justify-content:flex-start}.justify-end{justify-content:flex-end}.justify-center{justify-content:center}.justify-between{justify-content:space-between}.gap-0{gap:0}.gap-0\\.5{gap:.125rem}.gap-1{gap:.25rem}.gap-1\\.5{gap:.375rem}.gap-2{gap:.5rem}.gap-2\\.5{gap:.625rem}.gap-3{gap:.75rem}.gap-3\\.5{gap:.875rem}.gap-4{gap:1rem}.gap-5{gap:1.25rem}.gap-x-2{-moz-column-gap:.5rem;column-gap:.5rem}.gap-x-2\\.5{-moz-column-gap:.625rem;column-gap:.625rem}.gap-x-3{-moz-column-gap:.75rem;column-gap:.75rem}.gap-y-1{row-gap:.25rem}.gap-y-3{row-gap:.75rem}.gap-y-3\\.5{row-gap:.875rem}.gap-y-5{row-gap:1.25rem}.space-y-0>:not([hidden])~:not([hidden]){--tw-space-y-reverse:0;margin-top:calc(0px*(1 - var(--tw-space-y-reverse)));margin-bottom:calc(0px*var(--tw-space-y-reverse))}.space-y-0\\.5>:not([hidden])~:not([hidden]){--tw-space-y-reverse:0;margin-top:calc(.125rem*(1 - var(--tw-space-y-reverse)));margin-bottom:calc(.125rem*var(--tw-space-y-reverse))}.space-y-1>:not([hidden])~:not([hidden]){--tw-space-y-reverse:0;margin-top:calc(.25rem*(1 - var(--tw-space-y-reverse)));margin-bottom:calc(.25rem*var(--tw-space-y-reverse))}.space-y-1\\.5>:not([hidden])~:not([hidden]){--tw-space-y-reverse:0;margin-top:calc(.375rem*(1 - var(--tw-space-y-reverse)));margin-bottom:calc(.375rem*var(--tw-space-y-reverse))}.space-y-2>:not([hidden])~:not([hidden]){--tw-space-y-reverse:0;margin-top:calc(.5rem*(1 - var(--tw-space-y-reverse)));margin-bottom:calc(.5rem*var(--tw-space-y-reverse))}.space-y-2\\.5>:not([hidden])~:not([hidden]){--tw-space-y-reverse:0;margin-top:calc(.625rem*(1 - var(--tw-space-y-reverse)));margin-bottom:calc(.625rem*var(--tw-space-y-reverse))}.space-y-3>:not([hidden])~:not([hidden]){--tw-space-y-reverse:0;margin-top:calc(.75rem*(1 - var(--tw-space-y-reverse)));margin-bottom:calc(.75rem*var(--tw-space-y-reverse))}.space-y-4>:not([hidden])~:not([hidden]){--tw-space-y-reverse:0;margin-top:calc(1rem*(1 - var(--tw-space-y-reverse)));margin-bottom:calc(1rem*var(--tw-space-y-reverse))}.space-y-5>:not([hidden])~:not([hidden]){--tw-space-y-reverse:0;margin-top:calc(1.25rem*(1 - var(--tw-space-y-reverse)));margin-bottom:calc(1.25rem*var(--tw-space-y-reverse))}.space-y-6>:not([hidden])~:not([hidden]){--tw-space-y-reverse:0;margin-top:calc(1.5rem*(1 - var(--tw-space-y-reverse)));margin-bottom:calc(1.5rem*var(--tw-space-y-reverse))}.divide-y>:not([hidden])~:not([hidden]){--tw-divide-y-reverse:0;border-top-width:calc(1px*(1 - var(--tw-divide-y-reverse)));border-bottom-width:calc(1px*var(--tw-divide-y-reverse))}.divide-stone-200>:not([hidden])~:not([hidden]){--tw-divide-opacity:1;border-color:rgb(231 229 228/var(--tw-divide-opacity,1))}.self-center{align-self:center}.self-stretch{align-self:stretch}.overflow-hidden{overflow:hidden}.overflow-x-auto{overflow-x:auto}.overflow-y-auto{overflow-y:auto}.overflow-x-hidden{overflow-x:hidden}.truncate{overflow:hidden;text-overflow:ellipsis}.truncate,.whitespace-nowrap{white-space:nowrap}.whitespace-pre-line{white-space:pre-line}.break-words{overflow-wrap:break-word}.break-all{word-break:break-all}.rounded{border-radius:.25rem}.rounded-\\[3px\\]{border-radius:3px}.rounded-full{border-radius:9999px}.rounded-lg{border-radius:.5rem}.rounded-b{border-bottom-right-radius:.25rem;border-bottom-left-radius:.25rem}.rounded-t{border-top-left-radius:.25rem;border-top-right-radius:.25rem}.border{border-width:1px}.border-2{border-width:2px}.border-\\[1\\.5px\\]{border-width:1.5px}.border-x{border-left-width:1px;border-right-width:1px}.border-b{border-bottom-width:1px}.border-b-\\[1\\.5px\\]{border-bottom-width:1.5px}.border-b-\\[3px\\]{border-bottom-width:3px}.border-l{border-left-width:1px}.border-l-2{border-left-width:2px}.border-l-4{border-left-width:4px}.border-t{border-top-width:1px}.border-t-2{border-top-width:2px}.border-t-\\[3px\\]{border-top-width:3px}.border-dashed{border-style:dashed}.border-dotted{border-style:dotted}.border-double{border-style:double}.border-\\[\\#1B2A22\\]{--tw-border-opacity:1;border-color:rgb(27 42 34/var(--tw-border-opacity,1))}.border-\\[\\#1B2A22\\]\\/30{border-color:rgba(27,42,34,.3)}.border-\\[\\#1B2A22\\]\\/50{border-color:rgba(27,42,34,.5)}.border-\\[\\#1B2A22\\]\\/60{border-color:rgba(27,42,34,.6)}.border-\\[\\#1F3A2E\\]{--tw-border-opacity:1;border-color:rgb(31 58 46/var(--tw-border-opacity,1))}.border-\\[\\#C8643C\\]{--tw-border-opacity:1;border-color:rgb(200 100 60/var(--tw-border-opacity,1))}.border-\\[\\#F4EFE4\\]{--tw-border-opacity:1;border-color:rgb(244 239 228/var(--tw-border-opacity,1))}.border-amber-600{--tw-border-opacity:1;border-color:rgb(217 119 6/var(--tw-border-opacity,1))}.border-blue-100{--tw-border-opacity:1;border-color:rgb(219 234 254/var(--tw-border-opacity,1))}.border-blue-200{--tw-border-opacity:1;border-color:rgb(191 219 254/var(--tw-border-opacity,1))}.border-blue-300{--tw-border-opacity:1;border-color:rgb(147 197 253/var(--tw-border-opacity,1))}.border-blue-400{--tw-border-opacity:1;border-color:rgb(96 165 250/var(--tw-border-opacity,1))}.border-blue-50{--tw-border-opacity:1;border-color:rgb(239 246 255/var(--tw-border-opacity,1))}.border-blue-500{--tw-border-opacity:1;border-color:rgb(59 130 246/var(--tw-border-opacity,1))}.border-blue-600{--tw-border-opacity:1;border-color:rgb(37 99 235/var(--tw-border-opacity,1))}.border-blue-700{--tw-border-opacity:1;border-color:rgb(29 78 216/var(--tw-border-opacity,1))}.border-blue-800{--tw-border-opacity:1;border-color:rgb(30 64 175/var(--tw-border-opacity,1))}.border-blue-900{--tw-border-opacity:1;border-color:rgb(30 58 138/var(--tw-border-opacity,1))}.border-blue-950{--tw-border-opacity:1;border-color:rgb(23 37 84/var(--tw-border-opacity,1))}.border-emerald-300{--tw-border-opacity:1;border-color:rgb(110 231 183/var(--tw-border-opacity,1))}.border-purple-100{--tw-border-opacity:1;border-color:rgb(243 232 255/var(--tw-border-opacity,1))}.border-purple-200{--tw-border-opacity:1;border-color:rgb(233 213 255/var(--tw-border-opacity,1))}.border-purple-300{--tw-border-opacity:1;border-color:rgb(216 180 254/var(--tw-border-opacity,1))}.border-purple-400{--tw-border-opacity:1;border-color:rgb(192 132 252/var(--tw-border-opacity,1))}.border-purple-50{--tw-border-opacity:1;border-color:rgb(250 245 255/var(--tw-border-opacity,1))}.border-purple-500{--tw-border-opacity:1;border-color:rgb(168 85 247/var(--tw-border-opacity,1))}.border-purple-600{--tw-border-opacity:1;border-color:rgb(147 51 234/var(--tw-border-opacity,1))}.border-purple-700{--tw-border-opacity:1;border-color:rgb(126 34 206/var(--tw-border-opacity,1))}.border-purple-800{--tw-border-opacity:1;border-color:rgb(107 33 168/var(--tw-border-opacity,1))}.border-purple-900{--tw-border-opacity:1;border-color:rgb(88 28 135/var(--tw-border-opacity,1))}.border-purple-950{--tw-border-opacity:1;border-color:rgb(59 7 100/var(--tw-border-opacity,1))}.border-rose-100{--tw-border-opacity:1;border-color:rgb(255 228 230/var(--tw-border-opacity,1))}.border-rose-200{--tw-border-opacity:1;border-color:rgb(254 205 211/var(--tw-border-opacity,1))}.border-rose-300{--tw-border-opacity:1;border-color:rgb(253 164 175/var(--tw-border-opacity,1))}.border-rose-400{--tw-border-opacity:1;border-color:rgb(251 113 133/var(--tw-border-opacity,1))}.border-rose-50{--tw-border-opacity:1;border-color:rgb(255 241 242/var(--tw-border-opacity,1))}.border-rose-500{--tw-border-opacity:1;border-color:rgb(244 63 94/var(--tw-border-opacity,1))}.border-rose-600{--tw-border-opacity:1;border-color:rgb(225 29 72/var(--tw-border-opacity,1))}.border-rose-700{--tw-border-opacity:1;border-color:rgb(190 18 60/var(--tw-border-opacity,1))}.border-rose-800{--tw-border-opacity:1;border-color:rgb(159 18 57/var(--tw-border-opacity,1))}.border-rose-900{--tw-border-opacity:1;border-color:rgb(136 19 55/var(--tw-border-opacity,1))}.border-rose-950{--tw-border-opacity:1;border-color:rgb(76 5 25/var(--tw-border-opacity,1))}.border-slate-100{--tw-border-opacity:1;border-color:rgb(241 245 249/var(--tw-border-opacity,1))}.border-slate-200{--tw-border-opacity:1;border-color:rgb(226 232 240/var(--tw-border-opacity,1))}.border-slate-300{--tw-border-opacity:1;border-color:rgb(203 213 225/var(--tw-border-opacity,1))}.border-slate-400{--tw-border-opacity:1;border-color:rgb(148 163 184/var(--tw-border-opacity,1))}.border-slate-50{--tw-border-opacity:1;border-color:rgb(248 250 252/var(--tw-border-opacity,1))}.border-slate-500{--tw-border-opacity:1;border-color:rgb(100 116 139/var(--tw-border-opacity,1))}.border-slate-600{--tw-border-opacity:1;border-color:rgb(71 85 105/var(--tw-border-opacity,1))}.border-slate-700{--tw-border-opacity:1;border-color:rgb(51 65 85/var(--tw-border-opacity,1))}.border-slate-800{--tw-border-opacity:1;border-color:rgb(30 41 59/var(--tw-border-opacity,1))}.border-slate-900{--tw-border-opacity:1;border-color:rgb(15 23 42/var(--tw-border-opacity,1))}.border-slate-950{--tw-border-opacity:1;border-color:rgb(2 6 23/var(--tw-border-opacity,1))}.border-stone-100{--tw-border-opacity:1;border-color:rgb(245 245 244/var(--tw-border-opacity,1))}.border-stone-200{--tw-border-opacity:1;border-color:rgb(231 229 228/var(--tw-border-opacity,1))}.border-stone-200\\/30{border-color:hsla(20,6%,90%,.3)}.border-stone-300{--tw-border-opacity:1;border-color:rgb(214 211 209/var(--tw-border-opacity,1))}.border-stone-400{--tw-border-opacity:1;border-color:rgb(168 162 158/var(--tw-border-opacity,1))}.border-stone-50{--tw-border-opacity:1;border-color:rgb(250 250 249/var(--tw-border-opacity,1))}.border-stone-500{--tw-border-opacity:1;border-color:rgb(120 113 108/var(--tw-border-opacity,1))}.border-stone-600{--tw-border-opacity:1;border-color:rgb(87 83 78/var(--tw-border-opacity,1))}.border-stone-700{--tw-border-opacity:1;border-color:rgb(68 64 60/var(--tw-border-opacity,1))}.border-stone-800{--tw-border-opacity:1;border-color:rgb(41 37 36/var(--tw-border-opacity,1))}.border-stone-900{--tw-border-opacity:1;border-color:rgb(28 25 23/var(--tw-border-opacity,1))}.border-stone-950{--tw-border-opacity:1;border-color:rgb(12 10 9/var(--tw-border-opacity,1))}.border-transparent{border-color:transparent}.border-white{--tw-border-opacity:1;border-color:rgb(255 255 255/var(--tw-border-opacity,1))}.bg-\\[\\#1F3A2E\\]{--tw-bg-opacity:1;background-color:rgb(31 58 46/var(--tw-bg-opacity,1))}.bg-\\[\\#C8643C\\]{--tw-bg-opacity:1;background-color:rgb(200 100 60/var(--tw-bg-opacity,1))}.bg-\\[\\#E6DFCF\\]{--tw-bg-opacity:1;background-color:rgb(230 223 207/var(--tw-bg-opacity,1))}.bg-\\[\\#EDEAE0\\]{--tw-bg-opacity:1;background-color:rgb(237 234 224/var(--tw-bg-opacity,1))}.bg-\\[\\#F4EFE4\\]{--tw-bg-opacity:1;background-color:rgb(244 239 228/var(--tw-bg-opacity,1))}.bg-\\[\\#F5F3EC\\]{--tw-bg-opacity:1;background-color:rgb(245 243 236/var(--tw-bg-opacity,1))}.bg-\\[\\#FAF8F2\\]{--tw-bg-opacity:1;background-color:rgb(250 248 242/var(--tw-bg-opacity,1))}.bg-\\[\\#FAF8F5\\]{--tw-bg-opacity:1;background-color:rgb(250 248 245/var(--tw-bg-opacity,1))}.bg-amber-50{--tw-bg-opacity:1;background-color:rgb(255 251 235/var(--tw-bg-opacity,1))}.bg-black{--tw-bg-opacity:1;background-color:rgb(0 0 0/var(--tw-bg-opacity,1))}.bg-black\\/40{background-color:rgba(0,0,0,.4)}.bg-blue-100{--tw-bg-opacity:1;background-color:rgb(219 234 254/var(--tw-bg-opacity,1))}.bg-blue-200{--tw-bg-opacity:1;background-color:rgb(191 219 254/var(--tw-bg-opacity,1))}.bg-blue-300{--tw-bg-opacity:1;background-color:rgb(147 197 253/var(--tw-bg-opacity,1))}.bg-blue-400{--tw-bg-opacity:1;background-color:rgb(96 165 250/var(--tw-bg-opacity,1))}.bg-blue-50{--tw-bg-opacity:1;background-color:rgb(239 246 255/var(--tw-bg-opacity,1))}.bg-blue-500{--tw-bg-opacity:1;background-color:rgb(59 130 246/var(--tw-bg-opacity,1))}.bg-blue-600{--tw-bg-opacity:1;background-color:rgb(37 99 235/var(--tw-bg-opacity,1))}.bg-blue-700{--tw-bg-opacity:1;background-color:rgb(29 78 216/var(--tw-bg-opacity,1))}.bg-blue-800{--tw-bg-opacity:1;background-color:rgb(30 64 175/var(--tw-bg-opacity,1))}.bg-blue-900{--tw-bg-opacity:1;background-color:rgb(30 58 138/var(--tw-bg-opacity,1))}.bg-blue-950{--tw-bg-opacity:1;background-color:rgb(23 37 84/var(--tw-bg-opacity,1))}.bg-emerald-600{--tw-bg-opacity:1;background-color:rgb(5 150 105/var(--tw-bg-opacity,1))}.bg-purple-100{--tw-bg-opacity:1;background-color:rgb(243 232 255/var(--tw-bg-opacity,1))}.bg-purple-200{--tw-bg-opacity:1;background-color:rgb(233 213 255/var(--tw-bg-opacity,1))}.bg-purple-300{--tw-bg-opacity:1;background-color:rgb(216 180 254/var(--tw-bg-opacity,1))}.bg-purple-400{--tw-bg-opacity:1;background-color:rgb(192 132 252/var(--tw-bg-opacity,1))}.bg-purple-50{--tw-bg-opacity:1;background-color:rgb(250 245 255/var(--tw-bg-opacity,1))}.bg-purple-500{--tw-bg-opacity:1;background-color:rgb(168 85 247/var(--tw-bg-opacity,1))}.bg-purple-600{--tw-bg-opacity:1;background-color:rgb(147 51 234/var(--tw-bg-opacity,1))}.bg-purple-700{--tw-bg-opacity:1;background-color:rgb(126 34 206/var(--tw-bg-opacity,1))}.bg-purple-800{--tw-bg-opacity:1;background-color:rgb(107 33 168/var(--tw-bg-opacity,1))}.bg-purple-900{--tw-bg-opacity:1;background-color:rgb(88 28 135/var(--tw-bg-opacity,1))}.bg-purple-950{--tw-bg-opacity:1;background-color:rgb(59 7 100/var(--tw-bg-opacity,1))}.bg-rose-100{--tw-bg-opacity:1;background-color:rgb(255 228 230/var(--tw-bg-opacity,1))}.bg-rose-200{--tw-bg-opacity:1;background-color:rgb(254 205 211/var(--tw-bg-opacity,1))}.bg-rose-300{--tw-bg-opacity:1;background-color:rgb(253 164 175/var(--tw-bg-opacity,1))}.bg-rose-400{--tw-bg-opacity:1;background-color:rgb(251 113 133/var(--tw-bg-opacity,1))}.bg-rose-50{--tw-bg-opacity:1;background-color:rgb(255 241 242/var(--tw-bg-opacity,1))}.bg-rose-500{--tw-bg-opacity:1;background-color:rgb(244 63 94/var(--tw-bg-opacity,1))}.bg-rose-600{--tw-bg-opacity:1;background-color:rgb(225 29 72/var(--tw-bg-opacity,1))}.bg-rose-700{--tw-bg-opacity:1;background-color:rgb(190 18 60/var(--tw-bg-opacity,1))}.bg-rose-800{--tw-bg-opacity:1;background-color:rgb(159 18 57/var(--tw-bg-opacity,1))}.bg-rose-900{--tw-bg-opacity:1;background-color:rgb(136 19 55/var(--tw-bg-opacity,1))}.bg-rose-950{--tw-bg-opacity:1;background-color:rgb(76 5 25/var(--tw-bg-opacity,1))}.bg-slate-100{--tw-bg-opacity:1;background-color:rgb(241 245 249/var(--tw-bg-opacity,1))}.bg-slate-200{--tw-bg-opacity:1;background-color:rgb(226 232 240/var(--tw-bg-opacity,1))}.bg-slate-300{--tw-bg-opacity:1;background-color:rgb(203 213 225/var(--tw-bg-opacity,1))}.bg-slate-400{--tw-bg-opacity:1;background-color:rgb(148 163 184/var(--tw-bg-opacity,1))}.bg-slate-50{--tw-bg-opacity:1;background-color:rgb(248 250 252/var(--tw-bg-opacity,1))}.bg-slate-500{--tw-bg-opacity:1;background-color:rgb(100 116 139/var(--tw-bg-opacity,1))}.bg-slate-600{--tw-bg-opacity:1;background-color:rgb(71 85 105/var(--tw-bg-opacity,1))}.bg-slate-700{--tw-bg-opacity:1;background-color:rgb(51 65 85/var(--tw-bg-opacity,1))}.bg-slate-800{--tw-bg-opacity:1;background-color:rgb(30 41 59/var(--tw-bg-opacity,1))}.bg-slate-900{--tw-bg-opacity:1;background-color:rgb(15 23 42/var(--tw-bg-opacity,1))}.bg-slate-900\\/85{background-color:rgba(15,23,42,.85)}.bg-slate-950{--tw-bg-opacity:1;background-color:rgb(2 6 23/var(--tw-bg-opacity,1))}.bg-stone-100{--tw-bg-opacity:1;background-color:rgb(245 245 244/var(--tw-bg-opacity,1))}.bg-stone-200{--tw-bg-opacity:1;background-color:rgb(231 229 228/var(--tw-bg-opacity,1))}.bg-stone-300{--tw-bg-opacity:1;background-color:rgb(214 211 209/var(--tw-bg-opacity,1))}.bg-stone-400{--tw-bg-opacity:1;background-color:rgb(168 162 158/var(--tw-bg-opacity,1))}.bg-stone-50{--tw-bg-opacity:1;background-color:rgb(250 250 249/var(--tw-bg-opacity,1))}.bg-stone-500{--tw-bg-opacity:1;background-color:rgb(120 113 108/var(--tw-bg-opacity,1))}.bg-stone-600{--tw-bg-opacity:1;background-color:rgb(87 83 78/var(--tw-bg-opacity,1))}.bg-stone-700{--tw-bg-opacity:1;background-color:rgb(68 64 60/var(--tw-bg-opacity,1))}.bg-stone-800{--tw-bg-opacity:1;background-color:rgb(41 37 36/var(--tw-bg-opacity,1))}.bg-stone-900{--tw-bg-opacity:1;background-color:rgb(28 25 23/var(--tw-bg-opacity,1))}.bg-stone-950{--tw-bg-opacity:1;background-color:rgb(12 10 9/var(--tw-bg-opacity,1))}.bg-transparent{background-color:transparent}.bg-white{--tw-bg-opacity:1;background-color:rgb(255 255 255/var(--tw-bg-opacity,1))}.bg-white\\/40{background-color:hsla(0,0%,100%,.4)}.object-cover{-o-object-fit:cover;object-fit:cover}.p-1{padding:.25rem}.p-2{padding:.5rem}.p-2\\.5{padding:.625rem}.p-3{padding:.75rem}.p-3\\.5{padding:.875rem}.p-4{padding:1rem}.p-5{padding:1.25rem}.px-0{padding-left:0;padding-right:0}.px-0\\.5{padding-left:.125rem;padding-right:.125rem}.px-1{padding-left:.25rem;padding-right:.25rem}.px-1\\.5{padding-left:.375rem;padding-right:.375rem}.px-2{padding-left:.5rem;padding-right:.5rem}.px-2\\.5{padding-left:.625rem;padding-right:.625rem}.px-3{padding-left:.75rem;padding-right:.75rem}.px-3\\.5{padding-left:.875rem;padding-right:.875rem}.px-4{padding-left:1rem;padding-right:1rem}.px-5{padding-left:1.25rem;padding-right:1.25rem}.px-6{padding-left:1.5rem;padding-right:1.5rem}.px-7{padding-left:1.75rem;padding-right:1.75rem}.px-\\[22px\\]{padding-left:22px;padding-right:22px}.py-0{padding-top:0;padding-bottom:0}.py-0\\.5{padding-top:.125rem;padding-bottom:.125rem}.py-1{padding-top:.25rem;padding-bottom:.25rem}.py-1\\.5{padding-top:.375rem;padding-bottom:.375rem}.py-10{padding-top:2.5rem;padding-bottom:2.5rem}.py-2{padding-top:.5rem;padding-bottom:.5rem}.py-2\\.5{padding-top:.625rem;padding-bottom:.625rem}.py-3{padding-top:.75rem;padding-bottom:.75rem}.py-3\\.5{padding-top:.875rem;padding-bottom:.875rem}.py-4{padding-top:1rem;padding-bottom:1rem}.py-px{padding-top:1px;padding-bottom:1px}.pb-0{padding-bottom:0}.pb-0\\.5{padding-bottom:.125rem}.pb-1{padding-bottom:.25rem}.pb-1\\.5{padding-bottom:.375rem}.pb-2{padding-bottom:.5rem}.pb-28{padding-bottom:7rem}.pb-3{padding-bottom:.75rem}.pb-3\\.5{padding-bottom:.875rem}.pb-5{padding-bottom:1.25rem}.pb-6{padding-bottom:1.5rem}.pb-7{padding-bottom:1.75rem}.pb-8{padding-bottom:2rem}.pl-1{padding-left:.25rem}.pl-2{padding-left:.5rem}.pl-3{padding-left:.75rem}.pl-4{padding-left:1rem}.pl-9{padding-left:2.25rem}.pr-1{padding-right:.25rem}.pr-3{padding-right:.75rem}.pr-4{padding-right:1rem}.pt-0{padding-top:0}.pt-0\\.5{padding-top:.125rem}.pt-1{padding-top:.25rem}.pt-1\\.5{padding-top:.375rem}.pt-2{padding-top:.5rem}.pt-3{padding-top:.75rem}.pt-4{padding-top:1rem}.pt-5{padding-top:1.25rem}.pt-6{padding-top:1.5rem}.pt-7{padding-top:1.75rem}.pt-8{padding-top:2rem}.text-left{text-align:left}.text-center{text-align:center}.text-right{text-align:right}.font-mono{font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,Liberation Mono,Courier New,monospace}.font-sans{font-family:ui-sans-serif,system-ui,sans-serif,Apple Color Emoji,Segoe UI Emoji,Segoe UI Symbol,Noto Color Emoji}.text-2xl{font-size:1.5rem;line-height:2rem}.text-3xl{font-size:1.875rem;line-height:2.25rem}.text-5xl{font-size:3rem;line-height:1}.text-\\[10\\.5px\\]{font-size:10.5px}.text-\\[10px\\]{font-size:10px}.text-\\[11\\.5px\\]{font-size:11.5px}.text-\\[11px\\]{font-size:11px}.text-\\[12px\\]{font-size:12px}.text-\\[13px\\]{font-size:13px}.text-\\[14px\\]{font-size:14px}.text-\\[15px\\]{font-size:15px}.text-\\[17px\\]{font-size:17px}.text-\\[22px\\]{font-size:22px}.text-\\[24px\\]{font-size:24px}.text-\\[28px\\]{font-size:28px}.text-\\[30px\\]{font-size:30px}.text-\\[32px\\]{font-size:32px}.text-\\[44px\\]{font-size:44px}.text-\\[9\\.5px\\]{font-size:9.5px}.text-\\[9px\\]{font-size:9px}.text-base{font-size:1rem;line-height:1.5rem}.text-lg{font-size:1.125rem;line-height:1.75rem}.text-sm{font-size:.875rem;line-height:1.25rem}.text-xl{font-size:1.25rem;line-height:1.75rem}.text-xs{font-size:.75rem;line-height:1rem}.\\!font-semibold{font-weight:600!important}.font-bold{font-weight:700}.font-light{font-weight:300}.font-medium{font-weight:500}.font-normal{font-weight:400}.font-semibold{font-weight:600}.uppercase{text-transform:uppercase}.normal-case{text-transform:none}.italic{font-style:italic}.tabular-nums{--tw-numeric-spacing:tabular-nums;font-variant-numeric:var(--tw-ordinal) var(--tw-slashed-zero) var(--tw-numeric-figure) var(--tw-numeric-spacing) var(--tw-numeric-fraction)}.leading-\\[\\.7\\]{line-height:.7}.leading-\\[1\\.02\\]{line-height:1.02}.leading-\\[1\\.05\\]{line-height:1.05}.leading-\\[1\\.06\\]{line-height:1.06}.leading-none{line-height:1}.leading-relaxed{line-height:1.625}.leading-snug{line-height:1.375}.leading-tight{line-height:1.25}.tracking-\\[0\\.08em\\]{letter-spacing:.08em}.tracking-\\[0\\.12em\\]{letter-spacing:.12em}.tracking-\\[0\\.14em\\]{letter-spacing:.14em}.tracking-\\[0\\.16em\\]{letter-spacing:.16em}.tracking-\\[0\\.18em\\]{letter-spacing:.18em}.tracking-\\[0\\.1em\\]{letter-spacing:.1em}.tracking-\\[0\\.2em\\]{letter-spacing:.2em}.tracking-normal{letter-spacing:0}.tracking-wide{letter-spacing:.025em}.tracking-wider{letter-spacing:.05em}.tracking-widest{letter-spacing:.1em}.text-\\[\\#1B2A22\\]{--tw-text-opacity:1;color:rgb(27 42 34/var(--tw-text-opacity,1))}.text-\\[\\#1B2A22\\]\\/50{color:rgba(27,42,34,.5)}.text-\\[\\#1B2A22\\]\\/60{color:rgba(27,42,34,.6)}.text-\\[\\#1B2A22\\]\\/70{color:rgba(27,42,34,.7)}.text-\\[\\#1B2A22\\]\\/75{color:rgba(27,42,34,.75)}.text-\\[\\#1B2A22\\]\\/80{color:rgba(27,42,34,.8)}.text-\\[\\#1F3A2E\\]{--tw-text-opacity:1;color:rgb(31 58 46/var(--tw-text-opacity,1))}.text-\\[\\#C8643C\\]{--tw-text-opacity:1;color:rgb(200 100 60/var(--tw-text-opacity,1))}.text-\\[\\#F4EFE4\\]{--tw-text-opacity:1;color:rgb(244 239 228/var(--tw-text-opacity,1))}.text-black{--tw-text-opacity:1;color:rgb(0 0 0/var(--tw-text-opacity,1))}.text-blue-100{--tw-text-opacity:1;color:rgb(219 234 254/var(--tw-text-opacity,1))}.text-blue-200{--tw-text-opacity:1;color:rgb(191 219 254/var(--tw-text-opacity,1))}.text-blue-300{--tw-text-opacity:1;color:rgb(147 197 253/var(--tw-text-opacity,1))}.text-blue-400{--tw-text-opacity:1;color:rgb(96 165 250/var(--tw-text-opacity,1))}.text-blue-50{--tw-text-opacity:1;color:rgb(239 246 255/var(--tw-text-opacity,1))}.text-blue-500{--tw-text-opacity:1;color:rgb(59 130 246/var(--tw-text-opacity,1))}.text-blue-600{--tw-text-opacity:1;color:rgb(37 99 235/var(--tw-text-opacity,1))}.text-blue-700{--tw-text-opacity:1;color:rgb(29 78 216/var(--tw-text-opacity,1))}.text-blue-800{--tw-text-opacity:1;color:rgb(30 64 175/var(--tw-text-opacity,1))}.text-blue-900{--tw-text-opacity:1;color:rgb(30 58 138/var(--tw-text-opacity,1))}.text-blue-950{--tw-text-opacity:1;color:rgb(23 37 84/var(--tw-text-opacity,1))}.text-purple-100{--tw-text-opacity:1;color:rgb(243 232 255/var(--tw-text-opacity,1))}.text-purple-200{--tw-text-opacity:1;color:rgb(233 213 255/var(--tw-text-opacity,1))}.text-purple-300{--tw-text-opacity:1;color:rgb(216 180 254/var(--tw-text-opacity,1))}.text-purple-400{--tw-text-opacity:1;color:rgb(192 132 252/var(--tw-text-opacity,1))}.text-purple-50{--tw-text-opacity:1;color:rgb(250 245 255/var(--tw-text-opacity,1))}.text-purple-500{--tw-text-opacity:1;color:rgb(168 85 247/var(--tw-text-opacity,1))}.text-purple-600{--tw-text-opacity:1;color:rgb(147 51 234/var(--tw-text-opacity,1))}.text-purple-700{--tw-text-opacity:1;color:rgb(126 34 206/var(--tw-text-opacity,1))}.text-purple-800{--tw-text-opacity:1;color:rgb(107 33 168/var(--tw-text-opacity,1))}.text-purple-900{--tw-text-opacity:1;color:rgb(88 28 135/var(--tw-text-opacity,1))}.text-purple-950{--tw-text-opacity:1;color:rgb(59 7 100/var(--tw-text-opacity,1))}.text-rose-100{--tw-text-opacity:1;color:rgb(255 228 230/var(--tw-text-opacity,1))}.text-rose-200{--tw-text-opacity:1;color:rgb(254 205 211/var(--tw-text-opacity,1))}.text-rose-300{--tw-text-opacity:1;color:rgb(253 164 175/var(--tw-text-opacity,1))}.text-rose-400{--tw-text-opacity:1;color:rgb(251 113 133/var(--tw-text-opacity,1))}.text-rose-50{--tw-text-opacity:1;color:rgb(255 241 242/var(--tw-text-opacity,1))}.text-rose-500{--tw-text-opacity:1;color:rgb(244 63 94/var(--tw-text-opacity,1))}.text-rose-600{--tw-text-opacity:1;color:rgb(225 29 72/var(--tw-text-opacity,1))}.text-rose-700{--tw-text-opacity:1;color:rgb(190 18 60/var(--tw-text-opacity,1))}.text-rose-800{--tw-text-opacity:1;color:rgb(159 18 57/var(--tw-text-opacity,1))}.text-rose-900{--tw-text-opacity:1;color:rgb(136 19 55/var(--tw-text-opacity,1))}.text-rose-950{--tw-text-opacity:1;color:rgb(76 5 25/var(--tw-text-opacity,1))}.text-slate-100{--tw-text-opacity:1;color:rgb(241 245 249/var(--tw-text-opacity,1))}.text-slate-200{--tw-text-opacity:1;color:rgb(226 232 240/var(--tw-text-opacity,1))}.text-slate-300{--tw-text-opacity:1;color:rgb(203 213 225/var(--tw-text-opacity,1))}.text-slate-400{--tw-text-opacity:1;color:rgb(148 163 184/var(--tw-text-opacity,1))}.text-slate-50{--tw-text-opacity:1;color:rgb(248 250 252/var(--tw-text-opacity,1))}.text-slate-500{--tw-text-opacity:1;color:rgb(100 116 139/var(--tw-text-opacity,1))}.text-slate-600{--tw-text-opacity:1;color:rgb(71 85 105/var(--tw-text-opacity,1))}.text-slate-700{--tw-text-opacity:1;color:rgb(51 65 85/var(--tw-text-opacity,1))}.text-slate-800{--tw-text-opacity:1;color:rgb(30 41 59/var(--tw-text-opacity,1))}.text-slate-900{--tw-text-opacity:1;color:rgb(15 23 42/var(--tw-text-opacity,1))}.text-slate-950{--tw-text-opacity:1;color:rgb(2 6 23/var(--tw-text-opacity,1))}.text-stone-100{--tw-text-opacity:1;color:rgb(245 245 244/var(--tw-text-opacity,1))}.text-stone-200{--tw-text-opacity:1;color:rgb(231 229 228/var(--tw-text-opacity,1))}.text-stone-300{--tw-text-opacity:1;color:rgb(214 211 209/var(--tw-text-opacity,1))}.text-stone-400{--tw-text-opacity:1;color:rgb(168 162 158/var(--tw-text-opacity,1))}.text-stone-50{--tw-text-opacity:1;color:rgb(250 250 249/var(--tw-text-opacity,1))}.text-stone-500{--tw-text-opacity:1;color:rgb(120 113 108/var(--tw-text-opacity,1))}.text-stone-600{--tw-text-opacity:1;color:rgb(87 83 78/var(--tw-text-opacity,1))}.text-stone-700{--tw-text-opacity:1;color:rgb(68 64 60/var(--tw-text-opacity,1))}.text-stone-800{--tw-text-opacity:1;color:rgb(41 37 36/var(--tw-text-opacity,1))}.text-stone-900{--tw-text-opacity:1;color:rgb(28 25 23/var(--tw-text-opacity,1))}.text-stone-950{--tw-text-opacity:1;color:rgb(12 10 9/var(--tw-text-opacity,1))}.text-transparent{color:transparent}.text-white{--tw-text-opacity:1;color:rgb(255 255 255/var(--tw-text-opacity,1))}.underline{text-decoration-line:underline}.line-through{text-decoration-line:line-through}.no-underline{text-decoration-line:none}.underline-offset-2{text-underline-offset:2px}.opacity-0{opacity:0}.opacity-50{opacity:.5}.opacity-60{opacity:.6}.opacity-70{opacity:.7}.opacity-75{opacity:.75}.opacity-80{opacity:.8}.opacity-90{opacity:.9}.shadow-2xl{--tw-shadow:0 25px 50px -12px rgba(0,0,0,.25);--tw-shadow-colored:0 25px 50px -12px var(--tw-shadow-color)}.shadow-2xl,.shadow-lg{box-shadow:var(--tw-ring-offset-shadow,0 0 #0000),var(--tw-ring-shadow,0 0 #0000),var(--tw-shadow)}.shadow-lg{--tw-shadow:0 10px 15px -3px rgba(0,0,0,.1),0 4px 6px -4px rgba(0,0,0,.1);--tw-shadow-colored:0 10px 15px -3px var(--tw-shadow-color),0 4px 6px -4px var(--tw-shadow-color)}.shadow-sm{--tw-shadow:0 1px 2px 0 rgba(0,0,0,.05);--tw-shadow-colored:0 1px 2px 0 var(--tw-shadow-color)}.shadow-sm,.shadow-xl{box-shadow:var(--tw-ring-offset-shadow,0 0 #0000),var(--tw-ring-shadow,0 0 #0000),var(--tw-shadow)}.shadow-xl{--tw-shadow:0 20px 25px -5px rgba(0,0,0,.1),0 8px 10px -6px rgba(0,0,0,.1);--tw-shadow-colored:0 20px 25px -5px var(--tw-shadow-color),0 8px 10px -6px var(--tw-shadow-color)}.outline-none{outline:2px solid transparent;outline-offset:2px}.outline{outline-style:solid}.ring{--tw-ring-offset-shadow:var(--tw-ring-inset) 0 0 0 var(--tw-ring-offset-width) var(--tw-ring-offset-color);--tw-ring-shadow:var(--tw-ring-inset) 0 0 0 calc(3px + var(--tw-ring-offset-width)) var(--tw-ring-color);box-shadow:var(--tw-ring-offset-shadow),var(--tw-ring-shadow),var(--tw-shadow,0 0 #0000)}.grayscale{--tw-grayscale:grayscale(100%)}.filter,.grayscale{filter:var(--tw-blur) var(--tw-brightness) var(--tw-contrast) var(--tw-grayscale) var(--tw-hue-rotate) var(--tw-invert) var(--tw-saturate) var(--tw-sepia) var(--tw-drop-shadow)}.backdrop-blur-md{--tw-backdrop-blur:blur(12px);-webkit-backdrop-filter:var(--tw-backdrop-blur) var(--tw-backdrop-brightness) var(--tw-backdrop-contrast) var(--tw-backdrop-grayscale) var(--tw-backdrop-hue-rotate) var(--tw-backdrop-invert) var(--tw-backdrop-opacity) var(--tw-backdrop-saturate) var(--tw-backdrop-sepia);backdrop-filter:var(--tw-backdrop-blur) var(--tw-backdrop-brightness) var(--tw-backdrop-contrast) var(--tw-backdrop-grayscale) var(--tw-backdrop-hue-rotate) var(--tw-backdrop-invert) var(--tw-backdrop-opacity) var(--tw-backdrop-saturate) var(--tw-backdrop-sepia)}.transition-all{transition-property:all;transition-timing-function:cubic-bezier(.4,0,.2,1);transition-duration:.15s}.transition-colors{transition-property:color,background-color,border-color,text-decoration-color,fill,stroke;transition-timing-function:cubic-bezier(.4,0,.2,1);transition-duration:.15s}.duration-300{transition-duration:.3s}.ease-in{transition-timing-function:cubic-bezier(.4,0,1,1)}.ease-in-out{transition-timing-function:cubic-bezier(.4,0,.2,1)}.ease-out{transition-timing-function:cubic-bezier(0,0,.2,1)}.\\[out\\:json\\]{out:json}.\\[timeout\\:20\\]{timeout:20}#root,body,html{margin:0;height:100%;background:#f5f3ec;color-scheme:light}.file\\:mr-2::file-selector-button{margin-right:.5rem}.file\\:border-0::file-selector-button{border-width:0}.file\\:bg-purple-900::file-selector-button{--tw-bg-opacity:1;background-color:rgb(88 28 135/var(--tw-bg-opacity,1))}.file\\:px-2\\.5::file-selector-button{padding-left:.625rem;padding-right:.625rem}.file\\:py-1\\.5::file-selector-button{padding-top:.375rem;padding-bottom:.375rem}.file\\:text-\\[10px\\]::file-selector-button{font-size:10px}.file\\:uppercase::file-selector-button{text-transform:uppercase}.file\\:tracking-wider::file-selector-button{letter-spacing:.05em}.file\\:text-white::file-selector-button{--tw-text-opacity:1;color:rgb(255 255 255/var(--tw-text-opacity,1))}.hover\\:border-blue-800:hover{--tw-border-opacity:1;border-color:rgb(30 64 175/var(--tw-border-opacity,1))}.hover\\:border-purple-400:hover{--tw-border-opacity:1;border-color:rgb(192 132 252/var(--tw-border-opacity,1))}.hover\\:border-purple-600:hover{--tw-border-opacity:1;border-color:rgb(147 51 234/var(--tw-border-opacity,1))}.hover\\:border-purple-700:hover{--tw-border-opacity:1;border-color:rgb(126 34 206/var(--tw-border-opacity,1))}.hover\\:border-purple-900:hover{--tw-border-opacity:1;border-color:rgb(88 28 135/var(--tw-border-opacity,1))}.hover\\:bg-blue-50:hover{--tw-bg-opacity:1;background-color:rgb(239 246 255/var(--tw-bg-opacity,1))}.hover\\:bg-blue-700:hover{--tw-bg-opacity:1;background-color:rgb(29 78 216/var(--tw-bg-opacity,1))}.hover\\:bg-blue-800:hover{--tw-bg-opacity:1;background-color:rgb(30 64 175/var(--tw-bg-opacity,1))}.hover\\:bg-blue-900:hover{--tw-bg-opacity:1;background-color:rgb(30 58 138/var(--tw-bg-opacity,1))}.hover\\:bg-purple-700:hover{--tw-bg-opacity:1;background-color:rgb(126 34 206/var(--tw-bg-opacity,1))}.hover\\:bg-purple-800:hover{--tw-bg-opacity:1;background-color:rgb(107 33 168/var(--tw-bg-opacity,1))}.hover\\:bg-purple-900:hover{--tw-bg-opacity:1;background-color:rgb(88 28 135/var(--tw-bg-opacity,1))}.hover\\:bg-rose-600:hover{--tw-bg-opacity:1;background-color:rgb(225 29 72/var(--tw-bg-opacity,1))}.hover\\:bg-stone-100:hover{--tw-bg-opacity:1;background-color:rgb(245 245 244/var(--tw-bg-opacity,1))}.hover\\:bg-stone-300:hover{--tw-bg-opacity:1;background-color:rgb(214 211 209/var(--tw-bg-opacity,1))}.hover\\:bg-stone-50:hover{--tw-bg-opacity:1;background-color:rgb(250 250 249/var(--tw-bg-opacity,1))}.hover\\:bg-white:hover{--tw-bg-opacity:1;background-color:rgb(255 255 255/var(--tw-bg-opacity,1))}.hover\\:bg-white\\/10:hover{background-color:hsla(0,0%,100%,.1)}.hover\\:text-purple-900:hover{--tw-text-opacity:1;color:rgb(88 28 135/var(--tw-text-opacity,1))}.hover\\:text-rose-700:hover{--tw-text-opacity:1;color:rgb(190 18 60/var(--tw-text-opacity,1))}.hover\\:text-rose-900:hover{--tw-text-opacity:1;color:rgb(136 19 55/var(--tw-text-opacity,1))}.hover\\:text-slate-700:hover{--tw-text-opacity:1;color:rgb(51 65 85/var(--tw-text-opacity,1))}.hover\\:text-slate-900:hover{--tw-text-opacity:1;color:rgb(15 23 42/var(--tw-text-opacity,1))}.hover\\:text-white:hover{--tw-text-opacity:1;color:rgb(255 255 255/var(--tw-text-opacity,1))}.hover\\:opacity-100:hover{opacity:1}.focus\\:border-stone-300:focus{--tw-border-opacity:1;border-color:rgb(214 211 209/var(--tw-border-opacity,1))}.disabled\\:opacity-30:disabled{opacity:.3}.disabled\\:opacity-40:disabled{opacity:.4}.disabled\\:opacity-50:disabled{opacity:.5}@media (max-width:359px){.max-\\[359px\\]\\:text-\\[24px\\]{font-size:24px}.max-\\[359px\\]\\:text-\\[9px\\]{font-size:9px}}@media (min-width:600px){.min-\\[600px\\]\\:max-w-\\[640px\\]{max-width:640px}}@media (min-width:640px){.sm\\:items-center{align-items:center}}@media (min-width:820px){.min-\\[820px\\]\\:max-w-\\[820px\\]{max-width:820px}}";
const V8_CSS = `
.pact-hc [class*="text-stone-"],.pact-hc [class*="text-slate-4"],.pact-hc [class*="text-slate-5"],.pact-hc [class*="text-slate-6"]{color:#1B2A22!important}
.pact-hc [style*="#5A675F"],.pact-hc [style*="#7C857F"],.pact-hc [style*="rgb(90, 103, 95)"],.pact-hc [style*="rgb(124, 133, 127)"]{color:#1B2A22!important}
.pact-hc [class*="border-stone-"]{border-color:#1B2A22!important}
.pact-hc{--rule:#1B2A22}
.pact-bigbtn button:not([data-tiny]),.pact-bigbtn select,.pact-bigbtn input:not([type=checkbox]):not([type=radio]){min-height:46px}
.pact-bigbtn button:not([data-tiny]){min-width:44px}
.pact-bigbtn button.w-9,.pact-bigbtn button.w-10{min-width:0;min-height:0}
.pact-calm *,.pact-calm *::before,.pact-calm *::after{animation:none!important;transition:none!important}
body>[role="dialog"]>div:last-child,body>[data-more-sheet]>div:last-child{zoom:var(--pact-zoom,1);max-height:calc(88dvh / var(--pact-zoom,1))!important}
`;
const PACT_CSS = "\n@import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,500;0,9..144,600;1,9..144,400&family=Inter:wght@400;500;600;700&display=swap');\nhtml, body { margin: 0; height: 100%; overflow: hidden; overscroll-behavior: none; }\nbody { position: fixed; inset: 0; width: 100%; }\n.font-sans, .font-sans input, .font-sans textarea, .font-sans select, .font-sans button { font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; }\n.font-sans { font-weight: 400; }\n.font-light, .font-normal { font-weight: 400 !important; }\n.font-medium { font-weight: 600 !important; }\n.font-semibold { font-weight: 700 !important; }\n.font-editorial { font-family: 'Fraunces', Georgia, serif; font-weight: 500 !important; letter-spacing: -0.01em !important; line-height: 1.12; font-optical-sizing: auto; }\n.font-pact { font-family: 'Fraunces', Georgia, serif; font-weight: 600 !important; text-transform: uppercase; letter-spacing: 0.14em; line-height: 1; }\n.font-mono { font-family: 'Inter', sans-serif !important; font-weight: 600; font-variant-numeric: tabular-nums; }\n.no-scrollbar::-webkit-scrollbar { display: none; }\n.no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }\nbutton { border-radius: 12px; }\ninput, textarea, select { border-radius: 10px; }\ndiv.border:not([class*=\"rounded\"]), form.border:not([class*=\"rounded\"]), label.border:not([class*=\"rounded\"]), section.border:not([class*=\"rounded\"]) { border-radius: 16px; }\ndiv[class*=\"bg-purple-9\"]:not([class*=\"rounded\"]):not([class*=\"border-l\"]), div[class*=\"bg-slate-9\"]:not([class*=\"rounded\"]):not([class*=\"border-l\"]), div[class*=\"bg-blue-9\"]:not([class*=\"rounded\"]) { border-radius: 16px; }\n.shadow-sm, .shadow-xl { box-shadow: none !important; }\n.border-l-4 { border-radius: 4px; }\n@keyframes pact-bob { 0%,100% { transform: translateY(0) } 50% { transform: translateY(-4px) } }\n.pact-bob { animation: pact-bob 3.2s ease-in-out infinite; }\n@media (prefers-reduced-motion: reduce) { .pact-bob { animation: none; } }\n.bg-purple-950{background-color:#12251C!important}\n.hover\\:bg-purple-950:hover{background-color:#12251C!important}\n.text-purple-950{color:#12251C!important}\n.hover\\:text-purple-950:hover{color:#12251C!important}\n.border-purple-950{border-color:#12251C!important}\n.hover\\:border-purple-950:hover{border-color:#12251C!important}\n.focus\\:border-purple-950:focus{border-color:#12251C!important}\n.bg-purple-900{background-color:#1F3A2E!important}\n.hover\\:bg-purple-900:hover{background-color:#1F3A2E!important}\n.text-purple-900{color:#1F3A2E!important}\n.hover\\:text-purple-900:hover{color:#1F3A2E!important}\n.border-purple-900{border-color:#1F3A2E!important}\n.hover\\:border-purple-900:hover{border-color:#1F3A2E!important}\n.focus\\:border-purple-900:focus{border-color:#1F3A2E!important}\n.bg-purple-800{background-color:#2C4A3B!important}\n.hover\\:bg-purple-800:hover{background-color:#2C4A3B!important}\n.text-purple-800{color:#2C4A3B!important}\n.hover\\:text-purple-800:hover{color:#2C4A3B!important}\n.border-purple-800{border-color:#2C4A3B!important}\n.hover\\:border-purple-800:hover{border-color:#2C4A3B!important}\n.focus\\:border-purple-800:focus{border-color:#2C4A3B!important}\n.bg-purple-700{background-color:#3F6B55!important}\n.hover\\:bg-purple-700:hover{background-color:#3F6B55!important}\n.text-purple-700{color:#3F6B55!important}\n.hover\\:text-purple-700:hover{color:#3F6B55!important}\n.border-purple-700{border-color:#3F6B55!important}\n.hover\\:border-purple-700:hover{border-color:#3F6B55!important}\n.focus\\:border-purple-700:focus{border-color:#3F6B55!important}\n.bg-purple-600{background-color:#4F7A63!important}\n.hover\\:bg-purple-600:hover{background-color:#4F7A63!important}\n.text-purple-600{color:#4F7A63!important}\n.hover\\:text-purple-600:hover{color:#4F7A63!important}\n.border-purple-600{border-color:#4F7A63!important}\n.hover\\:border-purple-600:hover{border-color:#4F7A63!important}\n.focus\\:border-purple-600:focus{border-color:#4F7A63!important}\n.bg-purple-500{background-color:#5F8C73!important}\n.hover\\:bg-purple-500:hover{background-color:#5F8C73!important}\n.text-purple-500{color:#5F8C73!important}\n.hover\\:text-purple-500:hover{color:#5F8C73!important}\n.border-purple-500{border-color:#5F8C73!important}\n.hover\\:border-purple-500:hover{border-color:#5F8C73!important}\n.focus\\:border-purple-500:focus{border-color:#5F8C73!important}\n.bg-purple-400{background-color:#8FB09D!important}\n.hover\\:bg-purple-400:hover{background-color:#8FB09D!important}\n.text-purple-400{color:#8FB09D!important}\n.hover\\:text-purple-400:hover{color:#8FB09D!important}\n.border-purple-400{border-color:#8FB09D!important}\n.hover\\:border-purple-400:hover{border-color:#8FB09D!important}\n.focus\\:border-purple-400:focus{border-color:#8FB09D!important}\n.bg-purple-300{background-color:#B5CABD!important}\n.hover\\:bg-purple-300:hover{background-color:#B5CABD!important}\n.text-purple-300{color:#B5CABD!important}\n.hover\\:text-purple-300:hover{color:#B5CABD!important}\n.border-purple-300{border-color:#B5CABD!important}\n.hover\\:border-purple-300:hover{border-color:#B5CABD!important}\n.focus\\:border-purple-300:focus{border-color:#B5CABD!important}\n.bg-purple-200{background-color:#D5E0D8!important}\n.hover\\:bg-purple-200:hover{background-color:#D5E0D8!important}\n.text-purple-200{color:#D5E0D8!important}\n.hover\\:text-purple-200:hover{color:#D5E0D8!important}\n.border-purple-200{border-color:#D5E0D8!important}\n.hover\\:border-purple-200:hover{border-color:#D5E0D8!important}\n.focus\\:border-purple-200:focus{border-color:#D5E0D8!important}\n.bg-purple-100{background-color:#E6EDE8!important}\n.hover\\:bg-purple-100:hover{background-color:#E6EDE8!important}\n.text-purple-100{color:#E6EDE8!important}\n.hover\\:text-purple-100:hover{color:#E6EDE8!important}\n.border-purple-100{border-color:#E6EDE8!important}\n.hover\\:border-purple-100:hover{border-color:#E6EDE8!important}\n.focus\\:border-purple-100:focus{border-color:#E6EDE8!important}\n.bg-purple-50{background-color:#F0F4F1!important}\n.hover\\:bg-purple-50:hover{background-color:#F0F4F1!important}\n.text-purple-50{color:#F0F4F1!important}\n.hover\\:text-purple-50:hover{color:#F0F4F1!important}\n.border-purple-50{border-color:#F0F4F1!important}\n.hover\\:border-purple-50:hover{border-color:#F0F4F1!important}\n.focus\\:border-purple-50:focus{border-color:#F0F4F1!important}\n.bg-rose-950{background-color:#3A1F10!important}\n.hover\\:bg-rose-950:hover{background-color:#3A1F10!important}\n.text-rose-950{color:#3A1F10!important}\n.hover\\:text-rose-950:hover{color:#3A1F10!important}\n.border-rose-950{border-color:#3A1F10!important}\n.hover\\:border-rose-950:hover{border-color:#3A1F10!important}\n.focus\\:border-rose-950:focus{border-color:#3A1F10!important}\n.bg-rose-900{background-color:#6B3A1E!important}\n.hover\\:bg-rose-900:hover{background-color:#6B3A1E!important}\n.text-rose-900{color:#6B3A1E!important}\n.hover\\:text-rose-900:hover{color:#6B3A1E!important}\n.border-rose-900{border-color:#6B3A1E!important}\n.hover\\:border-rose-900:hover{border-color:#6B3A1E!important}\n.focus\\:border-rose-900:focus{border-color:#6B3A1E!important}\n.bg-rose-800{background-color:#8A4A27!important}\n.hover\\:bg-rose-800:hover{background-color:#8A4A27!important}\n.text-rose-800{color:#8A4A27!important}\n.hover\\:text-rose-800:hover{color:#8A4A27!important}\n.border-rose-800{border-color:#8A4A27!important}\n.hover\\:border-rose-800:hover{border-color:#8A4A27!important}\n.focus\\:border-rose-800:focus{border-color:#8A4A27!important}\n.bg-rose-700{background-color:#A65F37!important}\n.hover\\:bg-rose-700:hover{background-color:#A65F37!important}\n.text-rose-700{color:#A65F37!important}\n.hover\\:text-rose-700:hover{color:#A65F37!important}\n.border-rose-700{border-color:#A65F37!important}\n.hover\\:border-rose-700:hover{border-color:#A65F37!important}\n.focus\\:border-rose-700:focus{border-color:#A65F37!important}\n.bg-rose-600{background-color:#B5683A!important}\n.hover\\:bg-rose-600:hover{background-color:#B5683A!important}\n.text-rose-600{color:#B5683A!important}\n.hover\\:text-rose-600:hover{color:#B5683A!important}\n.border-rose-600{border-color:#B5683A!important}\n.hover\\:border-rose-600:hover{border-color:#B5683A!important}\n.focus\\:border-rose-600:focus{border-color:#B5683A!important}\n.bg-rose-500{background-color:#C77E52!important}\n.hover\\:bg-rose-500:hover{background-color:#C77E52!important}\n.text-rose-500{color:#C77E52!important}\n.hover\\:text-rose-500:hover{color:#C77E52!important}\n.border-rose-500{border-color:#C77E52!important}\n.hover\\:border-rose-500:hover{border-color:#C77E52!important}\n.focus\\:border-rose-500:focus{border-color:#C77E52!important}\n.bg-rose-400{background-color:#D9945F!important}\n.hover\\:bg-rose-400:hover{background-color:#D9945F!important}\n.text-rose-400{color:#D9945F!important}\n.hover\\:text-rose-400:hover{color:#D9945F!important}\n.border-rose-400{border-color:#D9945F!important}\n.hover\\:border-rose-400:hover{border-color:#D9945F!important}\n.focus\\:border-rose-400:focus{border-color:#D9945F!important}\n.bg-rose-300{background-color:#E6B38C!important}\n.hover\\:bg-rose-300:hover{background-color:#E6B38C!important}\n.text-rose-300{color:#E6B38C!important}\n.hover\\:text-rose-300:hover{color:#E6B38C!important}\n.border-rose-300{border-color:#E6B38C!important}\n.hover\\:border-rose-300:hover{border-color:#E6B38C!important}\n.focus\\:border-rose-300:focus{border-color:#E6B38C!important}\n.bg-rose-200{background-color:#F0D1B8!important}\n.hover\\:bg-rose-200:hover{background-color:#F0D1B8!important}\n.text-rose-200{color:#F0D1B8!important}\n.hover\\:text-rose-200:hover{color:#F0D1B8!important}\n.border-rose-200{border-color:#F0D1B8!important}\n.hover\\:border-rose-200:hover{border-color:#F0D1B8!important}\n.focus\\:border-rose-200:focus{border-color:#F0D1B8!important}\n.bg-rose-100{background-color:#F6E4D5!important}\n.hover\\:bg-rose-100:hover{background-color:#F6E4D5!important}\n.text-rose-100{color:#F6E4D5!important}\n.hover\\:text-rose-100:hover{color:#F6E4D5!important}\n.border-rose-100{border-color:#F6E4D5!important}\n.hover\\:border-rose-100:hover{border-color:#F6E4D5!important}\n.focus\\:border-rose-100:focus{border-color:#F6E4D5!important}\n.bg-rose-50{background-color:#FAF1EA!important}\n.hover\\:bg-rose-50:hover{background-color:#FAF1EA!important}\n.text-rose-50{color:#FAF1EA!important}\n.hover\\:text-rose-50:hover{color:#FAF1EA!important}\n.border-rose-50{border-color:#FAF1EA!important}\n.hover\\:border-rose-50:hover{border-color:#FAF1EA!important}\n.focus\\:border-rose-50:focus{border-color:#FAF1EA!important}\n.bg-blue-950{background-color:#14282B!important}\n.hover\\:bg-blue-950:hover{background-color:#14282B!important}\n.text-blue-950{color:#14282B!important}\n.hover\\:text-blue-950:hover{color:#14282B!important}\n.border-blue-950{border-color:#14282B!important}\n.hover\\:border-blue-950:hover{border-color:#14282B!important}\n.focus\\:border-blue-950:focus{border-color:#14282B!important}\n.bg-blue-900{background-color:#1E3F44!important}\n.hover\\:bg-blue-900:hover{background-color:#1E3F44!important}\n.text-blue-900{color:#1E3F44!important}\n.hover\\:text-blue-900:hover{color:#1E3F44!important}\n.border-blue-900{border-color:#1E3F44!important}\n.hover\\:border-blue-900:hover{border-color:#1E3F44!important}\n.focus\\:border-blue-900:focus{border-color:#1E3F44!important}\n.bg-blue-800{background-color:#2A5359!important}\n.hover\\:bg-blue-800:hover{background-color:#2A5359!important}\n.text-blue-800{color:#2A5359!important}\n.hover\\:text-blue-800:hover{color:#2A5359!important}\n.border-blue-800{border-color:#2A5359!important}\n.hover\\:border-blue-800:hover{border-color:#2A5359!important}\n.focus\\:border-blue-800:focus{border-color:#2A5359!important}\n.bg-blue-700{background-color:#3A6A70!important}\n.hover\\:bg-blue-700:hover{background-color:#3A6A70!important}\n.text-blue-700{color:#3A6A70!important}\n.hover\\:text-blue-700:hover{color:#3A6A70!important}\n.border-blue-700{border-color:#3A6A70!important}\n.hover\\:border-blue-700:hover{border-color:#3A6A70!important}\n.focus\\:border-blue-700:focus{border-color:#3A6A70!important}\n.bg-blue-600{background-color:#4C7F85!important}\n.hover\\:bg-blue-600:hover{background-color:#4C7F85!important}\n.text-blue-600{color:#4C7F85!important}\n.hover\\:text-blue-600:hover{color:#4C7F85!important}\n.border-blue-600{border-color:#4C7F85!important}\n.hover\\:border-blue-600:hover{border-color:#4C7F85!important}\n.focus\\:border-blue-600:focus{border-color:#4C7F85!important}\n.bg-blue-500{background-color:#639499!important}\n.hover\\:bg-blue-500:hover{background-color:#639499!important}\n.text-blue-500{color:#639499!important}\n.hover\\:text-blue-500:hover{color:#639499!important}\n.border-blue-500{border-color:#639499!important}\n.hover\\:border-blue-500:hover{border-color:#639499!important}\n.focus\\:border-blue-500:focus{border-color:#639499!important}\n.bg-blue-400{background-color:#8FB2B6!important}\n.hover\\:bg-blue-400:hover{background-color:#8FB2B6!important}\n.text-blue-400{color:#8FB2B6!important}\n.hover\\:text-blue-400:hover{color:#8FB2B6!important}\n.border-blue-400{border-color:#8FB2B6!important}\n.hover\\:border-blue-400:hover{border-color:#8FB2B6!important}\n.focus\\:border-blue-400:focus{border-color:#8FB2B6!important}\n.bg-blue-300{background-color:#A8C4C6!important}\n.hover\\:bg-blue-300:hover{background-color:#A8C4C6!important}\n.text-blue-300{color:#A8C4C6!important}\n.hover\\:text-blue-300:hover{color:#A8C4C6!important}\n.border-blue-300{border-color:#A8C4C6!important}\n.hover\\:border-blue-300:hover{border-color:#A8C4C6!important}\n.focus\\:border-blue-300:focus{border-color:#A8C4C6!important}\n.bg-blue-200{background-color:#CADCDD!important}\n.hover\\:bg-blue-200:hover{background-color:#CADCDD!important}\n.text-blue-200{color:#CADCDD!important}\n.hover\\:text-blue-200:hover{color:#CADCDD!important}\n.border-blue-200{border-color:#CADCDD!important}\n.hover\\:border-blue-200:hover{border-color:#CADCDD!important}\n.focus\\:border-blue-200:focus{border-color:#CADCDD!important}\n.bg-blue-100{background-color:#E1ECED!important}\n.hover\\:bg-blue-100:hover{background-color:#E1ECED!important}\n.text-blue-100{color:#E1ECED!important}\n.hover\\:text-blue-100:hover{color:#E1ECED!important}\n.border-blue-100{border-color:#E1ECED!important}\n.hover\\:border-blue-100:hover{border-color:#E1ECED!important}\n.focus\\:border-blue-100:focus{border-color:#E1ECED!important}\n.bg-blue-50{background-color:#EEF4F5!important}\n.hover\\:bg-blue-50:hover{background-color:#EEF4F5!important}\n.text-blue-50{color:#EEF4F5!important}\n.hover\\:text-blue-50:hover{color:#EEF4F5!important}\n.border-blue-50{border-color:#EEF4F5!important}\n.hover\\:border-blue-50:hover{border-color:#EEF4F5!important}\n.focus\\:border-blue-50:focus{border-color:#EEF4F5!important}\n.bg-slate-950{background-color:#0F0F0D!important}\n.hover\\:bg-slate-950:hover{background-color:#0F0F0D!important}\n.text-slate-950{color:#0F0F0D!important}\n.hover\\:text-slate-950:hover{color:#0F0F0D!important}\n.border-slate-950{border-color:#0F0F0D!important}\n.hover\\:border-slate-950:hover{border-color:#0F0F0D!important}\n.focus\\:border-slate-950:focus{border-color:#0F0F0D!important}\n.bg-slate-900{background-color:#1A1A17!important}\n.hover\\:bg-slate-900:hover{background-color:#1A1A17!important}\n.text-slate-900{color:#1A1A17!important}\n.hover\\:text-slate-900:hover{color:#1A1A17!important}\n.border-slate-900{border-color:#1A1A17!important}\n.hover\\:border-slate-900:hover{border-color:#1A1A17!important}\n.focus\\:border-slate-900:focus{border-color:#1A1A17!important}\n.bg-slate-800{background-color:#2A2A26!important}\n.hover\\:bg-slate-800:hover{background-color:#2A2A26!important}\n.text-slate-800{color:#2A2A26!important}\n.hover\\:text-slate-800:hover{color:#2A2A26!important}\n.border-slate-800{border-color:#2A2A26!important}\n.hover\\:border-slate-800:hover{border-color:#2A2A26!important}\n.focus\\:border-slate-800:focus{border-color:#2A2A26!important}\n.bg-slate-700{background-color:#3E3D37!important}\n.hover\\:bg-slate-700:hover{background-color:#3E3D37!important}\n.text-slate-700{color:#3E3D37!important}\n.hover\\:text-slate-700:hover{color:#3E3D37!important}\n.border-slate-700{border-color:#3E3D37!important}\n.hover\\:border-slate-700:hover{border-color:#3E3D37!important}\n.focus\\:border-slate-700:focus{border-color:#3E3D37!important}\n.bg-slate-600{background-color:#55534B!important}\n.hover\\:bg-slate-600:hover{background-color:#55534B!important}\n.text-slate-600{color:#55534B!important}\n.hover\\:text-slate-600:hover{color:#55534B!important}\n.border-slate-600{border-color:#55534B!important}\n.hover\\:border-slate-600:hover{border-color:#55534B!important}\n.focus\\:border-slate-600:focus{border-color:#55534B!important}\n.bg-slate-500{background-color:#6B6960!important}\n.hover\\:bg-slate-500:hover{background-color:#6B6960!important}\n.text-slate-500{color:#6B6960!important}\n.hover\\:text-slate-500:hover{color:#6B6960!important}\n.border-slate-500{border-color:#6B6960!important}\n.hover\\:border-slate-500:hover{border-color:#6B6960!important}\n.focus\\:border-slate-500:focus{border-color:#6B6960!important}\n.bg-slate-400{background-color:#8A877D!important}\n.hover\\:bg-slate-400:hover{background-color:#8A877D!important}\n.text-slate-400{color:#8A877D!important}\n.hover\\:text-slate-400:hover{color:#8A877D!important}\n.border-slate-400{border-color:#8A877D!important}\n.hover\\:border-slate-400:hover{border-color:#8A877D!important}\n.focus\\:border-slate-400:focus{border-color:#8A877D!important}\n.bg-slate-300{background-color:#B5B1A5!important}\n.hover\\:bg-slate-300:hover{background-color:#B5B1A5!important}\n.text-slate-300{color:#B5B1A5!important}\n.hover\\:text-slate-300:hover{color:#B5B1A5!important}\n.border-slate-300{border-color:#B5B1A5!important}\n.hover\\:border-slate-300:hover{border-color:#B5B1A5!important}\n.focus\\:border-slate-300:focus{border-color:#B5B1A5!important}\n.bg-slate-200{background-color:#D6D1C4!important}\n.hover\\:bg-slate-200:hover{background-color:#D6D1C4!important}\n.text-slate-200{color:#D6D1C4!important}\n.hover\\:text-slate-200:hover{color:#D6D1C4!important}\n.border-slate-200{border-color:#D6D1C4!important}\n.hover\\:border-slate-200:hover{border-color:#D6D1C4!important}\n.focus\\:border-slate-200:focus{border-color:#D6D1C4!important}\n.bg-slate-100{background-color:#E7E3D8!important}\n.hover\\:bg-slate-100:hover{background-color:#E7E3D8!important}\n.text-slate-100{color:#E7E3D8!important}\n.hover\\:text-slate-100:hover{color:#E7E3D8!important}\n.border-slate-100{border-color:#E7E3D8!important}\n.hover\\:border-slate-100:hover{border-color:#E7E3D8!important}\n.focus\\:border-slate-100:focus{border-color:#E7E3D8!important}\n.bg-slate-50{background-color:#F1EEE6!important}\n.hover\\:bg-slate-50:hover{background-color:#F1EEE6!important}\n.text-slate-50{color:#F1EEE6!important}\n.hover\\:text-slate-50:hover{color:#F1EEE6!important}\n.border-slate-50{border-color:#F1EEE6!important}\n.hover\\:border-slate-50:hover{border-color:#F1EEE6!important}\n.focus\\:border-slate-50:focus{border-color:#F1EEE6!important}\n.bg-stone-950{background-color:#1A1A17!important}\n.hover\\:bg-stone-950:hover{background-color:#1A1A17!important}\n.text-stone-950{color:#1A1A17!important}\n.hover\\:text-stone-950:hover{color:#1A1A17!important}\n.border-stone-950{border-color:#1A1A17!important}\n.hover\\:border-stone-950:hover{border-color:#1A1A17!important}\n.focus\\:border-stone-950:focus{border-color:#1A1A17!important}\n.bg-stone-900{background-color:#25241F!important}\n.hover\\:bg-stone-900:hover{background-color:#25241F!important}\n.text-stone-900{color:#25241F!important}\n.hover\\:text-stone-900:hover{color:#25241F!important}\n.border-stone-900{border-color:#25241F!important}\n.hover\\:border-stone-900:hover{border-color:#25241F!important}\n.focus\\:border-stone-900:focus{border-color:#25241F!important}\n.bg-stone-800{background-color:#33322B!important}\n.hover\\:bg-stone-800:hover{background-color:#33322B!important}\n.text-stone-800{color:#33322B!important}\n.hover\\:text-stone-800:hover{color:#33322B!important}\n.border-stone-800{border-color:#33322B!important}\n.hover\\:border-stone-800:hover{border-color:#33322B!important}\n.focus\\:border-stone-800:focus{border-color:#33322B!important}\n.bg-stone-700{background-color:#47453D!important}\n.hover\\:bg-stone-700:hover{background-color:#47453D!important}\n.text-stone-700{color:#47453D!important}\n.hover\\:text-stone-700:hover{color:#47453D!important}\n.border-stone-700{border-color:#47453D!important}\n.hover\\:border-stone-700:hover{border-color:#47453D!important}\n.focus\\:border-stone-700:focus{border-color:#47453D!important}\n.bg-stone-600{background-color:#5C5A52!important}\n.hover\\:bg-stone-600:hover{background-color:#5C5A52!important}\n.text-stone-600{color:#5C5A52!important}\n.hover\\:text-stone-600:hover{color:#5C5A52!important}\n.border-stone-600{border-color:#5C5A52!important}\n.hover\\:border-stone-600:hover{border-color:#5C5A52!important}\n.focus\\:border-stone-600:focus{border-color:#5C5A52!important}\n.bg-stone-500{background-color:#6B6960!important}\n.hover\\:bg-stone-500:hover{background-color:#6B6960!important}\n.text-stone-500{color:#6B6960!important}\n.hover\\:text-stone-500:hover{color:#6B6960!important}\n.border-stone-500{border-color:#6B6960!important}\n.hover\\:border-stone-500:hover{border-color:#6B6960!important}\n.focus\\:border-stone-500:focus{border-color:#6B6960!important}\n.bg-stone-400{background-color:#8A877D!important}\n.hover\\:bg-stone-400:hover{background-color:#8A877D!important}\n.text-stone-400{color:#8A877D!important}\n.hover\\:text-stone-400:hover{color:#8A877D!important}\n.border-stone-400{border-color:#8A877D!important}\n.hover\\:border-stone-400:hover{border-color:#8A877D!important}\n.focus\\:border-stone-400:focus{border-color:#8A877D!important}\n.bg-stone-300{background-color:#CFCABD!important}\n.hover\\:bg-stone-300:hover{background-color:#CFCABD!important}\n.text-stone-300{color:#CFCABD!important}\n.hover\\:text-stone-300:hover{color:#CFCABD!important}\n.border-stone-300{border-color:#CFCABD!important}\n.hover\\:border-stone-300:hover{border-color:#CFCABD!important}\n.focus\\:border-stone-300:focus{border-color:#CFCABD!important}\n.bg-stone-200{background-color:#D9D4C6!important}\n.hover\\:bg-stone-200:hover{background-color:#D9D4C6!important}\n.text-stone-200{color:#D9D4C6!important}\n.hover\\:text-stone-200:hover{color:#D9D4C6!important}\n.border-stone-200{border-color:#D9D4C6!important}\n.hover\\:border-stone-200:hover{border-color:#D9D4C6!important}\n.focus\\:border-stone-200:focus{border-color:#D9D4C6!important}\n.bg-stone-100{background-color:#ECE8DD!important}\n.hover\\:bg-stone-100:hover{background-color:#ECE8DD!important}\n.text-stone-100{color:#ECE8DD!important}\n.hover\\:text-stone-100:hover{color:#ECE8DD!important}\n.border-stone-100{border-color:#ECE8DD!important}\n.hover\\:border-stone-100:hover{border-color:#ECE8DD!important}\n.focus\\:border-stone-100:focus{border-color:#ECE8DD!important}\n.bg-stone-50{background-color:#F3F0E8!important}\n.hover\\:bg-stone-50:hover{background-color:#F3F0E8!important}\n.text-stone-50{color:#F3F0E8!important}\n.hover\\:text-stone-50:hover{color:#F3F0E8!important}\n.border-stone-50{border-color:#F3F0E8!important}\n.hover\\:border-stone-50:hover{border-color:#F3F0E8!important}\n.focus\\:border-stone-50:focus{border-color:#F3F0E8!important}\n.bg-white{background-color:#FBF9F3!important}\n.bg-\\[\\#FAF8F5\\]{background-color:#F3F0E8!important}\n.bg-\\[\\#F5F3EC\\]{background-color:#F5F3EC!important}\n.bg-slate-950\\/70{background-color:rgba(26,26,23,.7)!important}\n.border-stone-200\\/30{border-color:rgba(217,212,198,.3)!important}\nhtml{-webkit-text-size-adjust:100%;text-size-adjust:100%}html,body{max-width:100%;overflow-x:hidden}\ninput[type=date],input[type=time],input[type=search],select{-webkit-appearance:none;appearance:none;min-width:0;max-width:100%;box-sizing:border-box}\ninput[type=date],input[type=time]{min-height:2rem;text-align:left}\ninput[type=search]::-webkit-search-decoration,input[type=search]::-webkit-search-cancel-button{-webkit-appearance:none}\n@supports (-webkit-touch-callout:none){input:not([type=checkbox]):not([type=radio]):not([type=file]),select,textarea{font-size:16px!important}}\n\nhtml:not([data-pact-theme]) .bg-\\[\\#F5F3EC\\]{background-color:#F4EFE4!important}\nhtml:not([data-pact-theme]) .bg-\\[\\#EDEAE0\\]{background-color:#EAE3D2!important}\nhtml:not([data-pact-theme]) .bg-\\[\\#FAF8F5\\]{background-color:#F8F3E7!important}\nhtml:not([data-pact-theme]) .bg-white{background-color:#FBF8F0!important}\nhtml:not([data-pact-theme]) .border-stone-200{border-color:#DDD5C2!important}\nhtml:not([data-pact-theme]) .border-stone-300{border-color:#CFC7B4!important}\nhtml:not([data-pact-theme]) [data-pact-glass]{background:rgba(244,239,228,.84)!important}\nhtml:not([data-pact-theme]) [data-pact-glass=\"nav\"]{background:rgba(244,239,228,.97)!important}\n.lg-bg{position:absolute;inset:0;overflow:hidden;pointer-events:none;z-index:0;animation:lg-fade 1s ease-out both}\n.lg-bg>*{position:absolute}\n.lg-blob{border-radius:50%;will-change:transform}\n.lg-clay{background:radial-gradient(circle,rgba(200,100,60,.20),rgba(200,100,60,0) 70%)}\n.lg-forest{background:radial-gradient(circle,rgba(31,58,46,.15),rgba(31,58,46,0) 70%)}\n.lg-rules{left:0;right:0;top:-240px;bottom:0;opacity:.55;background-image:repeating-linear-gradient(to bottom,transparent 0,transparent 39px,rgba(31,58,46,.07) 39px,rgba(31,58,46,.07) 40px);animation:lg-rules 45s linear infinite}\n.lg-hours{left:0;right:0;top:-224px;bottom:0;opacity:.6;background-image:repeating-linear-gradient(to bottom,transparent 0,transparent 55px,rgba(31,58,46,.075) 55px,rgba(31,58,46,.075) 56px);animation:lg-hours 70s linear infinite}\n.lg-spin{animation:lg-spin 140s linear infinite}\n.lg-spin-slow{animation:lg-spin 90s linear infinite reverse}\n.lg-hand{transform-origin:50% 50%;animation:lg-spin 60s linear infinite}\n.lg-sweep{left:0;right:0;height:1px;background:linear-gradient(90deg,transparent,rgba(200,100,60,.45),transparent);animation:lg-sweep 22s ease-in-out infinite alternate}\n.lg-dash{stroke-dasharray:3 9;animation:lg-dash 40s linear infinite}\n.lg-pin{border-radius:50%;background:rgba(200,100,60,.55);width:7px;height:7px}\n.lg-pin::after{content:'';position:absolute;inset:-1px;border-radius:50%;border:1.5px solid rgba(200,100,60,.5);animation:lg-ring 3.6s ease-out infinite;animation-delay:inherit}\n.lg-mote{position:absolute;bottom:-10px;border-radius:50%;opacity:0;animation:lg-mote 26s linear infinite}@keyframes lg-mote{0%{transform:translateY(0);opacity:0}15%{opacity:.22}85%{opacity:.22}100%{transform:translateY(-880px);opacity:0}}.lg-once{stroke-dasharray:420;stroke-dashoffset:0;animation:lg-once 4.5s cubic-bezier(.3,.1,.2,1) both}@keyframes lg-once{from{stroke-dashoffset:420}to{stroke-dashoffset:0}}.lg-leaf-once{transform-box:fill-box;transform-origin:center;animation:lg-leaf-once 1.4s ease-out both}@keyframes lg-leaf-once{from{opacity:0;transform:scale(.2)}to{opacity:1;transform:scale(1)}}.lg-grow{stroke-dasharray:420;stroke-dashoffset:420;animation:lg-grow 16s ease-in-out infinite}\n.lg-leaf{transform-box:fill-box;transform-origin:center;animation:lg-pulse 5s ease-in-out infinite}\n.lg-ringline{border-radius:50%;border:1.5px solid rgba(31,58,46,.12)}\n.lg-ringline.c{border-color:rgba(200,100,60,.22)}\n.lg-mote{width:6px;height:6px;border-radius:50%;background:rgba(200,100,60,.35);animation:lg-float 14s ease-in infinite}\n.lg-ring{position:absolute;border-radius:50%;background:rgba(200,100,60,.45);animation:lg-ring 2.8s ease-out infinite}\n.lg-breathe{animation:lg-breathe 4s ease-in-out infinite}\n@keyframes lg-fade{from{opacity:0}to{opacity:1}}\n@keyframes lg-rules{to{transform:translateY(-240px)}}\n@keyframes lg-hours{to{transform:translateY(-224px)}}\n@keyframes lg-spin{to{transform:rotate(360deg)}}\n@keyframes lg-sweep{from{top:12%}to{top:88%}}\n@keyframes lg-dash{to{stroke-dashoffset:-240}}\n@keyframes lg-ring{0%{transform:scale(1);opacity:.7}100%{transform:scale(3.4);opacity:0}}\n@keyframes lg-grow{0%{stroke-dashoffset:420;opacity:0}12%{opacity:1}55%{stroke-dashoffset:0;opacity:1}85%{stroke-dashoffset:0;opacity:.9}100%{stroke-dashoffset:0;opacity:0}}\n@keyframes lg-pulse{0%,100%{transform:scale(.7);opacity:.35}50%{transform:scale(1.25);opacity:.9}}\n@keyframes lg-float{0%{transform:translateY(0) scale(.6);opacity:0}15%{opacity:.8}100%{transform:translateY(-70vh) scale(1.2);opacity:0}}\n@keyframes lg-d1{0%,100%{transform:translate(-30px,0) scale(1)}50%{transform:translate(40px,60px) scale(1.15)}}\n@keyframes lg-d2{0%,100%{transform:translate(0,0) scale(1.1)}50%{transform:translate(-55px,-45px) scale(.95)}}\n@keyframes lg-l1{0%,100%{transform:translate(0,0)}50%{transform:translate(38px,10px)}}\n@keyframes lg-l2{0%,100%{transform:translate(0,0)}50%{transform:translate(-36px,22px)}}\n@keyframes lg-l3{0%,100%{transform:translate(0,0)}50%{transform:translate(8px,-34px)}}\n@keyframes lg-breathe{0%,100%{box-shadow:0 0 0 0 rgba(200,100,60,0)}50%{box-shadow:0 0 0 6px rgba(200,100,60,.13)}}\n@keyframes lg-rise{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}\n.lg-d1{animation:lg-d1 28s ease-in-out infinite}\n.lg-d2{animation:lg-d2 34s ease-in-out infinite}\n.lg-l1{animation:lg-l1 24s ease-in-out infinite}\n.lg-l2{animation:lg-l2 30s ease-in-out infinite}\n.lg-l3{animation:lg-l3 27s ease-in-out infinite}\n.lg-rise{animation:lg-rise .7s ease-out both}\nhtml[data-pact-theme$=\"-dark\"] .lg-bg{opacity:.55}\n@media (prefers-reduced-motion: reduce){.lg-bg *,.lg-bg,.lg-breathe,.lg-rise,.lg-pulse-dot{animation:none!important}.lg-grow{stroke-dashoffset:0;opacity:.6}}\n.lg-pulse-dot{animation:lg-ring 2.8s ease-out infinite}\n\nbutton:not([class*=\"rounded\"]){border-radius:2px}\ninput:not([class*=\"rounded\"]),textarea:not([class*=\"rounded\"]),select:not([class*=\"rounded\"]){border-radius:3px}\ndiv.border:not([class*=\"rounded\"]),form.border:not([class*=\"rounded\"]),label.border:not([class*=\"rounded\"]),section.border:not([class*=\"rounded\"]){border-radius:3px}\ndiv[class*=\"bg-purple-9\"]:not([class*=\"rounded\"]):not([class*=\"border-l\"]),div[class*=\"bg-slate-9\"]:not([class*=\"rounded\"]):not([class*=\"border-l\"]),div[class*=\"bg-blue-9\"]:not([class*=\"rounded\"]){border-radius:3px}\n\n[class*=\"rounded-\"]:not(.rounded-full):not([class*=\"rounded-t\"]):not([class*=\"rounded-b\"]){border-radius:2px!important}\n[class*=\"rounded-full\"][class*=\"px-\"],[class*=\"rounded-full\"][class*=\"min-w\"]{border-radius:2px!important}\ninput,textarea,select,button,label.border,div.border,form.border,section.border{border-radius:2px}\n.lg-pill{border-radius:2px}\n\n.np-title{font-family:'Fraunces',Georgia,serif;font-weight:600;font-style:italic;font-size:30px;letter-spacing:-.02em;line-height:1;margin:0;color:#1B2A22;text-align:center;flex:1;white-space:nowrap}\n@media (max-width:359px){.np-title{font-size:25px}}\n.np-rule{margin-top:8px;border-top:3px solid #1B2A22;border-bottom:1px solid #1B2A22;height:2px}\n.np-dateline{display:flex;justify-content:space-between;gap:8px;font-size:9.5px;letter-spacing:.12em;text-transform:uppercase;padding:5px 0 4px;border-bottom:1px solid #1B2A22;color:#1B2A22;white-space:nowrap}\n.np-dateline span{overflow:hidden;text-overflow:ellipsis}\n.np-flag,.np-skin [class*=\"text-purple-800\"][class*=\"uppercase\"][class*=\"tracking-widest\"]{background:#1B2A22;color:#F4EFE4!important;padding:3px 8px;display:inline-flex;align-items:center;letter-spacing:.18em;font-size:10px;font-weight:600;text-transform:uppercase;width:fit-content}\n.np-kicker{font-family:'Fraunces',Georgia,serif;font-style:italic;font-weight:400;font-size:11px;letter-spacing:0;text-transform:none;margin-left:8px;opacity:.85}\n.np-skin div[class*=\"p-4\"][class*=\"bg-white\"][class*=\"border\"]{background:#FAF8F2!important;border:1px solid #1B2A22!important;border-top:3px double #1B2A22!important;box-shadow:4px 4px 0 rgba(31,58,46,.10)!important;border-radius:0!important}\n\n.np-sc{font-size:10px;letter-spacing:.14em;text-transform:uppercase;color:#5A675F}\n.np-halftone{background:radial-gradient(circle,rgba(244,239,228,.28) .9px,transparent 1.5px) 0 0/5px 5px}\n.np-barcode{height:26px;background-image:repeating-linear-gradient(90deg,#1B2A22 0,#1B2A22 2px,transparent 2px,transparent 4px,#1B2A22 4px,#1B2A22 5px,transparent 5px,transparent 8px)}\n\n.np-grid{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:12px}\n.np-grid>*{grid-column:span 2}\n.np-grid>.np-tile{grid-column:span 1}\n.font-fr{font-family:'Fraunces',Georgia,serif;font-optical-sizing:auto}\n.np-cols{overflow:hidden}\n.np-dropcap{float:left;font-family:'Fraunces',Georgia,serif;font-weight:600;font-size:38px;line-height:.85;padding:3px 6px 0 0;color:#1B2A22}\n";

// =====================================================================
// ROAM HELPERS: time maths, slot finder, calendar (ICS) parser, accounts
// =====================================================================
const pad2 = (n) => String(n).padStart(2, '0');
const toMins = (t) => { const [h, m] = String(t || '0:0').split(':').map(Number); return (h || 0) * 60 + (m || 0); };
const fromMins = (n) => { const x = ((Math.round(n) % 1440) + 1440) % 1440; return pad2(Math.floor(x / 60)) + ':' + pad2(x % 60); };
const fmtDateObj = (d) => `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
const addDaysStr = (dateStr, n) => { const d = new Date(dateStr + 'T12:00:00'); d.setDate(d.getDate() + n); return fmtDateObj(d); };
const dayKeyOf = (dateStr) => ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][new Date(dateStr + 'T12:00:00').getDay()];
const prettyDate = (dateStr) => new Date(dateStr + 'T12:00:00').toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' });
const roundUpTo = (n, step) => Math.ceil(n / step) * step;

// Everything that makes a time range "busy": scheduled tasks, synced calendar events, work/study hours.
const getBusyIntervals = (date, ctx) => {
  const out = [];
  (ctx.tasks || []).filter(t => t.date === date).forEach(t => {
    const s = toMins(t.startTime);
    let e = toMins(t.endTime);
    if (!(e > s)) e = s + (Number(t.duration) || 60);
    out.push({ s, e, label: t.title, kind: 'task' });
  });
  (ctx.calendarEvents || []).filter(c => c.date === date && !c.allDay).forEach(c => {
    out.push({ s: toMins(c.start), e: c.end === '24:00' ? 1440 : toMins(c.end), label: c.title, kind: 'calendar' });
  });
  const wh = ctx.weeklyHours && ctx.weeklyHours[dayKeyOf(date)];
  if (wh && wh.active) out.push({ s: toMins(wh.start), e: toMins(wh.end), label: 'Work/study hours', kind: 'work' });
  return out;
};

// Free windows on a day that are at least `minLen` minutes long.
const getFreeGaps = (date, ctx, minLen, opts = {}) => {
  const from = opts.from ?? 8 * 60;
  const to = opts.to ?? 22 * 60;
  const buffer = opts.buffer ?? 10;
  const extra = opts.extraBusy || [];
  const busy = [...getBusyIntervals(date, ctx), ...extra]
    .map(b => ({ s: b.s - buffer, e: b.e + buffer }))
    .sort((a, b) => a.s - b.s);
  const gaps = [];
  let cur = from;
  for (const b of busy) {
    if (b.s > cur) gaps.push({ s: cur, e: Math.min(b.s, to) });
    cur = Math.max(cur, b.e);
    if (cur >= to) break;
  }
  if (cur < to) gaps.push({ s: cur, e: to });
  return gaps
    .map(g => ({ s: roundUpTo(g.s, 5), e: g.e }))
    .filter(g => g.e - g.s >= minLen);
};

const overlapWith = (date, startMins, durMins, ctx) =>
  getBusyIntervals(date, ctx).filter(b => startMins < b.e && startMins + durMins > b.s);

// =============================================================
// DATES: today, week starts, demo-data shifting
// =============================================================
const nowHHMM = () => { const d = new Date(); return `${pad2(d.getHours())}:${pad2(d.getMinutes())}`; };
const cleanHandle = (t) => String(t || '').toLowerCase().replace(/^@+/, '').replace(/[^a-z0-9_]/g, '_').slice(0, 24);
// ---------- Your People: personal / business connections you want to stay in touch with ----------
const REMIND_OPTIONS = [{ v: 0, l: 'Never remind me' }, { v: 7, l: 'Every week' }, { v: 14, l: 'Every 2 weeks' }, { v: 30, l: 'Every month' }, { v: 90, l: 'Every 3 months' }, { v: 180, l: 'Every 6 months' }, { v: 365, l: 'Every year' }];
const daysBetweenStr = (a, b) => Math.round((new Date(b + 'T00:00:00') - new Date(a + 'T00:00:00')) / 86400000);
const agoText = (d) => d <= 0 ? 'today' : d === 1 ? 'yesterday' : d < 14 ? `${d} days ago` : d < 60 ? `${Math.round(d / 7)} weeks ago` : d < 700 ? `${Math.round(d / 30)} months ago` : `${Math.round(d / 365)} years ago`;
// days overdue (0 = due today) or null when no reminder is due (blocked, never remind, snoozed, or not due yet)
const personOverdue = (p, today, addDays) => {
  if (!p || p.blocked || !p.remindEvery) return null;
  if (p.snoozeUntil && p.snoozeUntil > today) return null;
  const over = daysBetweenStr(addDays(p.lastContact || p.createdAt || today, p.remindEvery), today);
  return over >= 0 ? over : null;
};
const sharedSig = (t) => JSON.stringify([t.title || '', t.date || '', t.startTime || '', t.endTime || '', t.location || '']);
const todayDateStr = () => fmtDateObj(new Date());
const mondayOf = (dateStr) => { const d = new Date(dateStr + 'T12:00:00'); d.setDate(d.getDate() - ((d.getDay() + 6) % 7)); return fmtDateObj(d); };
const daysBetween = (a, b) => Math.round((new Date(b + 'T12:00:00') - new Date(a + 'T12:00:00')) / 86400000);
// The sample data was authored for the week of 2026-11-16; slide it onto the current week so the demo is never stale.
const SEED_SHIFT = daysBetween('2026-11-16', mondayOf(todayDateStr()));
const shiftSeed = (dateStr) => addDaysStr(dateStr, SEED_SHIFT);
const longDate = (dateStr) => new Date(dateStr + 'T12:00:00').toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' });

// =============================================================
// ROAMIE'S LOCAL BRAIN: answers about the user's own planner without needing any AI service,
// and can actually add / cancel plans. Returns null when a question needs live web knowledge.
// =============================================================
const MONTH_KEYS = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
const WEEKDAY_RE = '(monday|mon|tuesday|tues|tue|wednesday|wed|thursday|thurs|thur|thu|friday|fri|saturday|sat|sunday|sun)';
const weekdayIndex = (w) => ({ sun: 0, mon: 1, tue: 2, wed: 3, thu: 4, fri: 5, sat: 6 }[w.slice(0, 3)]);

const parseDayFromText = (text, baseStr) => {
  const t = text.toLowerCase();
  let m;
  if (/\bday after tomorrow\b/.test(t)) return { date: addDaysStr(baseStr, 2) };
  if (/\btomorrow\b/.test(t)) return { date: addDaysStr(baseStr, 1) };
  if (/\b(today|tonight|this evening|this morning|this afternoon)\b/.test(t)) return { date: baseStr };
  if ((m = t.match(/\b(\d{4})-(\d{2})-(\d{2})\b/))) return { date: m[0] };
  let day = null, mon = -1;
  if ((m = t.match(/\b(\d{1,2})(?:st|nd|rd|th)?\s*(?:of\s+)?(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\b/))) { day = +m[1]; mon = MONTH_KEYS.indexOf(m[2]); }
  else if ((m = t.match(/\b(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\s+(\d{1,2})(?:st|nd|rd|th)?\b/))) { mon = MONTH_KEYS.indexOf(m[1]); day = +m[2]; }
  else if ((m = t.match(/\b(\d{1,2})\/(\d{1,2})\b/))) { day = +m[1]; mon = +m[2] - 1; }
  if (day && mon >= 0 && day <= 31) {
    const b = new Date(baseStr + 'T12:00:00');
    let d = new Date(b.getFullYear(), mon, day, 12);
    if (d < new Date(baseStr + 'T00:00:00')) d = new Date(b.getFullYear() + 1, mon, day, 12);
    return { date: fmtDateObj(d) };
  }
  const wd = t.match(new RegExp('\\b(next\\s+|this\\s+|on\\s+)?' + WEEKDAY_RE + '\\b'));
  if (wd) {
    const target = weekdayIndex(wd[2]);
    const cur = new Date(baseStr + 'T12:00:00').getDay();
    let diff = (target - cur + 7) % 7;
    if (diff === 0 && wd[1] && /next/.test(wd[1])) diff = 7;
    return { date: addDaysStr(baseStr, diff) };
  }
  if (/\bnext week\b/.test(t)) return { date: addDaysStr(mondayOf(baseStr), 7), week: true };
  if (/\bweekend\b/.test(t)) return { date: addDaysStr(mondayOf(baseStr), 5), weekend: true };
  if (/\bthis week\b/.test(t)) return { date: baseStr, week: true };
  return null;
};

const parseDurationFromText = (text) => {
  const t = text.toLowerCase();
  let m;
  if ((m = t.match(/(\d+(?:\.\d+)?)\s*(?:hours?|hrs?|h)\b(?:\s*(?:and\s*)?(\d+)\s*(?:minutes?|mins?|m)\b)?/))) return Math.round(+m[1] * 60 + (m[2] ? +m[2] : 0));
  if ((m = t.match(/(\d+)\s*(?:minutes?|mins?|min)\b/))) return +m[1];
  if (/half an hour|half hour/.test(t)) return 30;
  if (/\ban hour\b|\bone hour\b/.test(t)) return 60;
  return null;
};

const parseTimeFromText = (text) => {
  const t = text.toLowerCase();
  let m;
  if ((m = t.match(/\b(\d{1,2})[:.](\d{2})\s*(am|pm)?\b/))) {
    let h = +m[1]; const mi = +m[2];
    if (m[3] === 'pm' && h < 12) h += 12;
    if (m[3] === 'am' && h === 12) h = 0;
    if (h < 24 && mi < 60) return h * 60 + mi;
  }
  if ((m = t.match(/\b(\d{1,2})\s*(am|pm)\b/))) {
    let h = +m[1];
    if (m[2] === 'pm' && h < 12) h += 12;
    if (m[2] === 'am' && h === 12) h = 0;
    if (h < 24) return h * 60;
  }
  if ((m = t.match(/\b(?:at|@)\s*(\d{1,2})\b(?!\s*(?:min|hour|hr|h\b|%|:))/))) {
    let h = +m[1];
    if (h >= 1 && h <= 7) h += 12;
    if (h < 24) return h * 60;
  }
  if (/\bnoon\b/.test(t)) return 12 * 60;
  return null;
};

const dayPartWindow = (text) => {
  const t = text.toLowerCase();
  if (/\bmorning\b/.test(t)) return [540, 750];
  if (/\bafternoon\b/.test(t)) return [780, 1050];
  if (/\b(evening|tonight)\b/.test(t)) return [1080, 1320];
  return null;
};

const listFreeText = (gaps, max = 4) => gaps.slice(0, max).map(g => `${fromMins(g.s)}–${fromMins(g.e)}`).join(', ');

const classifyTitle = (title) => {
  const t = title.toLowerCase();
  if (/gym|run\b|running|climb|bould|walk|swim|yoga|workout|exercise|football|padel|hike|cycle|ride/.test(t)) return { type: 'physical', categoryColor: 'leisure' };
  if (/study|revis|essay|dissertation|assignment|code|coding|lecture|read|work|project|homework|coursework|deadline|ml\b|python|exam|lab/.test(t)) return { type: 'analytical', categoryColor: 'work' };
  if (/dinner|lunch|coffee|drinks|friend|date|call|catch ?up|party|brunch|meet|birthday|pub|film|movie/.test(t)) return { type: 'social', categoryColor: 'social' };
  return { type: 'social', categoryColor: 'leisure' };
};

const extractTitle = (q) => {
  let s = ' ' + q + ' ';
  const strip = (re) => { s = s.replace(re, ' '); };
  strip(/\b(roamie|please|pls|can you|could you|would you|will you|i want to|i wanna|i'd like to|i would like to|i need to|i have to|let's|lets|just)\b/gi);
  strip(/\b(add|schedule|book|put|slot|plan|block out|block|set up|remind me to|remind me|fit in|squeeze in|pencil in)\b/gi);
  strip(/\b(in|into|to|on|onto)\s+(my\s+|the\s+)?(planner|calendar|schedule|diary|week)\b/gi);
  strip(/\b(day after tomorrow|tomorrow|today|tonight|this evening|this morning|this afternoon|next week|this weekend|this week)\b/gi);
  strip(new RegExp('\\b(next\\s+|this\\s+|on\\s+)?' + WEEKDAY_RE + '\\b', 'gi'));
  strip(/\b(\d{4}-\d{2}-\d{2})\b/g);
  strip(/\b\d{1,2}(?:st|nd|rd|th)?\s*(?:of\s+)?(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\b/gi);
  strip(/\b(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\s+\d{1,2}(?:st|nd|rd|th)?\b/gi);
  strip(/\b\d{1,2}\/\d{1,2}\b/g);
  strip(/\b(?:at|from|@)?\s*\d{1,2}[:.]\d{2}\s*(?:am|pm)?\b/gi);
  strip(/\b(?:at|from|@)?\s*\d{1,2}\s*(?:am|pm)\b/gi);
  strip(/\bat\s+\d{1,2}\b/gi);
  strip(/\b(?:for\s+)?(?:about\s+)?\d+(?:\.\d+)?\s*(?:hours?|hrs?|h|minutes?|mins?|min)\b(?:\s*(?:and\s*)?\d+\s*(?:minutes?|mins?|m)\b)?/gi);
  strip(/\b(?:for\s+)?(?:half an hour|half hour|an hour|one hour)\b/gi);
  strip(/\b(in the|in)\s+(morning|afternoon|evening)\b/gi);
  strip(/\b(morning|afternoon|evening|noon)\b/gi);
  strip(/[.,!?]/g);
  s = s.replace(/\s+/g, ' ').trim();
  for (let k = 0; k < 4; k++) {
    s = s.replace(/^[\s\-\u2013\u2014:;,]+|[\s\-\u2013\u2014:;,]+$/g, '').replace(/^(a|an|the|my|some|me|in|on|at|for|to|up|from|until|till|and|then)\s+/i, '').replace(/\s+(in|on|at|for|to|a|an|the|my|me|from|until|till|and|then|about)$/i, '').trim();
  }
  if (s.length < 2) return '';
  return s.charAt(0).toUpperCase() + s.slice(1);
};

// Turns everyday, chatty, typo-ridden English into the plain phrasing the planner logic understands.
const NUM_WORDS = { one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9, ten: 10, eleven: 11, twelve: 12 };
const roamieNormalise = (raw, baseStr) => {
  let t = ' ' + String(raw || '').toLowerCase().replace(/[\u2018\u2019]/g, "'").replace(/\s+/g, ' ').trim() + ' ';
  const sub = (re, to) => { t = t.replace(re, to); };
  // slang, typos, text-speak
  sub(/\b(tmrw|tmr|tmrrw|tomorow|tommorow|tommorrow|tomoz|2morrow|2moro|2mrw|tmw)\b/g, 'tomorrow');
  sub(/\b(tonite|2nite|tnite)\b/g, 'tonight');
  sub(/\b(wknd|weekned|weeknd)\b/g, 'weekend');
  sub(/\b(sched|shedule|schedual|scedule)\b/g, 'schedule');
  sub(/\b(calender|calandar|calendr)\b/g, 'calendar');
  sub(/\b(appt|appts|apt)\b/g, 'appointment');
  sub(/\b(pls|plz|plss|pleeease|please)\b/g, ' ');
  sub(/\b(rn|right now)\b/g, ' now ');
  sub(/\bgonna\b/g, 'going to'); sub(/\bwanna\b/g, 'want to'); sub(/\bgotta\b/g, 'have to'); sub(/\blemme\b/g, 'let me'); sub(/\bgimme\b/g, 'give me');
  sub(/\bwhats\b/g, "what's"); sub(/\bwhens\b/g, "when's"); sub(/\bim\b/g, "i'm"); sub(/\bive\b/g, "i've"); sub(/\bidk\b/g, "i don't know"); sub(/\bdont\b/g, "don't"); sub(/\bcant\b/g, "can't");
  sub(/\bu\b/g, 'you'); sub(/\bur\b/g, 'your'); sub(/\bthx\b/g, 'thanks'); sub(/\bhw\b/g, 'how');
  sub(/\b(mon|tue|wed|thu|fri|sat|sun)day\b/g, '$1day');
  sub(/\b(sunday|monday|tuesday|wednesday|thursday|friday|saturday)s\b/g, '$1');
  sub(/\b(thurs|thur)\b/g, 'thu'); sub(/\btues\b/g, 'tue');
  // number words in times / durations ("seven pm", "half seven", "quarter past 3", "an hour and a half")
  const NW = Object.keys(NUM_WORDS).join('|');
  sub(new RegExp('\\bhalf (?:past )?(' + NW + ')\\b', 'g'), (_, w) => ` ${NUM_WORDS[w]}:30 `);
  sub(new RegExp('\\bquarter past (' + NW + ')\\b', 'g'), (_, w) => ` ${NUM_WORDS[w]}:15 `);
  sub(new RegExp('\\bquarter to (' + NW + ')\\b', 'g'), (_, w) => ` ${NUM_WORDS[w] - 1 || 12}:45 `);
  sub(new RegExp('\\b(' + NW + ')\\s*(am|pm|o\'?clock)\\b', 'g'), (_, w, ap) => ` ${NUM_WORDS[w]}${ap === "o'clock" || ap === 'oclock' ? '' : ' ' + ap} `);
  sub(new RegExp('\\bat (' + NW + ')\\b', 'g'), (_, w) => ` at ${NUM_WORDS[w]} `);
  sub(new RegExp('\\b(' + NW + ') (hours?|hrs?|minutes?|mins?)\\b', 'g'), (_, w, u) => ` ${NUM_WORDS[w]} ${u} `);
  sub(/\b(\d{1,2})(?::(\d{2}))?\s*ish\b/g, (_, h, m) => ` ${h}${m ? ':' + m : ''} `);
  sub(/\ban hour and a half\b|\b1\.5 hours?\b|\bhour and a half\b/g, ' 90 minutes ');
  sub(/\b(\d{1,2})\s*o'?clock\b/g, ' at $1 ');
  sub(/\b(\d{1,2})\s*(?:in the )?(evening|night)\b/g, (_, h) => ` ${h} pm `);
  sub(/\b(\d{1,2})\s*in the morning\b/g, ' $1 am ');
  sub(/\b(\d{1,2})\s*in the afternoon\b/g, ' $1 pm ');
  sub(/\bmidday\b/g, 'noon');
  // relative days: "in 3 days", "a week on friday", "this coming friday", "the 5th"
  let m;
  if ((m = t.match(/\bin (\d{1,2}|a|one|two|three|four|five|six|seven) days?\b/))) {
    const n = /^\d/.test(m[1]) ? +m[1] : (m[1] === 'a' ? 1 : NUM_WORDS[m[1]]);
    if (baseStr && n >= 1 && n <= 60) t = t.replace(m[0], ' ' + addDaysStr(baseStr, n) + ' ');
  }
  sub(/\b(this coming|coming|upcoming)\b/g, 'this');
  sub(/\bthe (\d{1,2})(st|nd|rd|th)\b(?! of)/g, (x, d, sfx) => baseStr ? ` ${MONTH_KEYS[+baseStr.slice(5, 7) - 1]} ${d} ` : x);
  // chatty openers that hide the real intent
  sub(/^ (?:hey |hi |hello |ok |okay |so |um+ |uh+ |right |oh |ah |hmm+ |yo )+(?:roamie |ro )?/, ' ');
  sub(/(?<!what )(?<!how )(?<!who )\b(?:could|can|would|will) you (?:please )?(?:help me |possibly )?/g, ' ');
  sub(/\b(?:i was wondering|i wonder|do you know|let me know|tell me|can you tell me|i need to know|i'd like to know|i want to know) (?:if |whether |when |what |about )?/g, (x) => /when/.test(x) ? ' when ' : /what/.test(x) ? ' what ' : ' ');
  sub(/\b(?:i'm |am i |i am )?(?:thinking of|thinking about|looking to|hoping to|planning to|trying to|want to|going to|need to|have to|fancy|feel like|in the mood to)\b/g, ' ');
  sub(/\b(?:need|want|require) (?:some |a bit of |a little |an? )?(?:time|space|a slot|a gap) (?:for|to|on)\b/g, ' add ');
  // everyday phrasings for "what's on"
  sub(/\b(?:what am i up to|what'?s up|what'?s happening|what have i got on|what've i got on|do i have anything(?: on| planned)?|have i got anything(?: on| planned)?|anything on|anything planned|am i doing anything|got anything on|what'?s the plan|what'?s the plans|how'?s my (?:day|week)|how busy am i|how busy is|what'?s my day like|what'?s my week like|what do i have on)\b/g, " what's on ");
  // everyday phrasings for "am I free"
  sub(/\b(?:am i free|i'm free|are there any (?:free )?(?:gaps|slots|spaces)|is there (?:any )?(?:space|room|a gap|a slot)|have i got (?:any )?(?:time|space)|do i have (?:any )?(?:time|space)|do i have a (?:gap|slot)|is anything free|what'?s free|where can i fit)\b/g, ' when am i free ');
  // "i've got/have a X (day/time)" statements become a booking
  sub(/^ (?:i'?ve got|i have|i've|i got|got|there'?s|there is|i'?m having|i'?m going to|i'?m meeting|i'?m seeing|i'?m off to) (?:a |an |my |the |to )?(?=[a-z])/, ' add ');
  return t.replace(/\s+/g, ' ').trim();
};

const roamieBrain = (q0, env) => {
  const q = roamieNormalise(q0, env.todayStr);
  const lower = q.toLowerCase().trim();
  const todayStr = env.todayStr;
  const baseNow = env.now;
  const nowMins = baseNow.getHours() * 60 + baseNow.getMinutes();
  const ctx = { tasks: env.tasks, calendarEvents: env.calendarEvents, weeklyHours: env.weeklyHours };
  const parsedDay = parseDayFromText(lower, todayStr);
  const day = parsedDay ? parsedDay.date : null;
  const dur = parseDurationFromText(lower);
  const first = (env.userName || '').split(' ')[0];
  if (/^(hey|hi|hiya|hello|howdy|yo|sup|morning|afternoon|evening|good (morning|afternoon|evening))\b[\s,!.]*(roamie|there|you|mate)?[\s,!.]*[\s!.?]*$/.test(String(q0 || '').toLowerCase().trim())) return { text: `Hi${first ? ' ' + first : ''}! What shall we sort out? Try "What's on tomorrow?", "When am I free on Friday?" or "Book gym on Thursday at 7am".` };
  const webish = /\b(best|near|nearby|open now|opening|weather|forecast|train times|bus times|how do|how to|what is|what's the|who is|where can|where is|price of|cost of|review|reviews|news|latest|compare|recipe|directions)\b/.test(lower);

  // ---- date / time / identity / chit-chat ----
  if (/\b(what('?s| is) (the )?(date|day)( today)?|what day is it|what date is it|today'?s date)\b/.test(lower)) return { text: `It's ${longDate(todayStr)}.` };
  if (/\b(what('?s| is) the time|what time is it|time now|current time)\b/.test(lower)) return { text: `It's ${fromMins(nowMins)} now.` };
  if (/\b(who are you|what are you|your name|what should i call you)\b/.test(lower)) return { text: "I'm Roamie, your planning assistant inside Pact. I can read your plans, find free time, add, move or cancel things, and answer questions about places near you." };
  if (/\b(how are you|how'?s it going|you ok|you alright|how do you do)\b/.test(lower)) return { text: "I'm good, thanks! What shall we sort out? I can check your day, find free time or book something in." };
  if (/^(ok|okay|cool|nice|great|lovely|perfect|brilliant|good|sweet|fab|lol|haha|yes|yeah|yep|no|nope|nvm|never ?mind)[\s!.]*$/.test(lower)) return { text: "No problem. Anything else I can help with?" };
  if (/^(good ?night|night|bye|goodbye|see ya|see you|cya|later)\b/.test(lower)) return { text: "Speak soon! I'll keep your plans safe." };

  // ---- small talk ----
  if (/^(hi|hello|hey|hiya|yo|good (morning|afternoon|evening))\b[\s!.,]*$/.test(lower)) {
    return { text: `Hi${first ? ' ' + first : ''}! I can read your plans, find clash-free time, add or cancel things, and check your fridge, targets and energy. Try: "What's on tomorrow?", "When am I free on Friday?" or "Book climbing on Thursday at 6pm".` };
  }
  if (/^(thanks|thank you|thx|cheers|ta)\b/.test(lower)) return { text: "You're welcome! Anything else I can sort out for you?" };
  if (/what can you do|what do you do|\bhelp\b|how do (i|you) use you/.test(lower)) {
    return { text: 'I can: (1) tell you what is on any day, (2) find free, clash-free times, (3) add or cancel plans for you ("book gym tomorrow at 7am for an hour"), (4) check your weekly targets, energy cap, fridge stock and next skill milestone, and (5) search the web for places, travel and anything else.' };
  }

  // ---- move / reschedule ----
  if (/\b(move|reschedule|push|shift|postpone|change)\b/.test(lower) && /\b(to|until|till|back|forward|later|earlier)\b/.test(lower)) {
    const stopM = new Set(['move', 'reschedule', 'push', 'shift', 'postpone', 'change', 'my', 'the', 'a', 'an', 'to', 'until', 'till', 'back', 'forward', 'later', 'earlier', 'on', 'at', 'from', 'for', 'tomorrow', 'today', 'tonight', 'morning', 'afternoon', 'evening', 'noon', 'time', 'plan', 'session', 'it', 'that', 'this', 'next', 'week', 'weekend', 'one', 'by', 'hour', 'hours', 'minutes', 'mins', 'min', 'am', 'pm']);
    const afterTo = lower.split(/\b(?:to|until|till)\b/);
    const nameWords = (afterTo[0] || lower).replace(/[^a-z0-9 ]/g, ' ').split(/\s+/).filter(w => w.length > 2 && !stopM.has(w) && !new RegExp('^' + WEEKDAY_RE + '$').test(w));
    const fresh = env.tasks.filter(t => t.date >= todayStr && t.status !== 'done');
    const hits = fresh.filter(t => nameWords.some(w => t.title.toLowerCase().includes(w)));
    if (!nameWords.length) return { text: 'Which plan should I move, and to when? For example: "Move gym to Friday at 6pm".' };
    if (hits.length === 0) return { text: `I couldn't find a plan called that coming up. Tell me its name and the new time, e.g. "Move climbing to Friday at 6pm".` };
    if (hits.length > 1) return { text: `That matches ${hits.length} plans: ${hits.slice(0, 5).map(h => `"${h.title}" (${prettyDate(h.date)})`).join(', ')}. Which one should I move?` };
    const t0 = hits[0];
    const target = afterTo.length > 1 ? afterTo.slice(1).join(' ') : lower;
    const pd = parseDayFromText(target, todayStr);
    const newDate = pd ? pd.date : t0.date;
    const newStart = parseTimeFromText(target);
    if (!pd && newStart === null) return { text: `When should I move "${t0.title}" to? Give me a day and/or time, e.g. "Friday at 6pm".` };
    const minutes = t0.duration || (toMins(t0.endTime) - toMins(t0.startTime)) || 60;
    const start = newStart !== null ? newStart : toMins(t0.startTime);
    const others = env.tasks.filter(x => x.id !== t0.id);
    const clashes = overlapWith(newDate, start, minutes, { ...ctx, tasks: others });
    if (clashes.length) {
      const gaps = getFreeGaps(newDate, { ...ctx, tasks: others }, minutes);
      return { text: `${fromMins(start)} on ${prettyDate(newDate)} clashes with "${clashes[0].label}". ${gaps.length ? 'Clash-free windows: ' + listFreeText(gaps) + '.' : 'That day is full.'} Pick another time and I'll move it.` };
    }
    return { text: `Done, I've moved "${t0.title}" to ${prettyDate(newDate)}, ${fromMins(start)}–${fromMins(start + minutes)}.`, updateTask: { ...t0, date: newDate, startTime: fromMins(start), endTime: fromMins(start + minutes) }, openDate: newDate };
  }

  // ---- cancel ----
  if (/\b(cancel|delete|remove|scrap|drop)\b/.test(lower) && !/\b(account|data|target)\b/.test(lower)) {
    let date = day || env.selectedDateStr;
    const stop = new Set(['cancel', 'delete', 'remove', 'scrap', 'drop', 'my', 'the', 'a', 'an', 'on', 'at', 'for', 'please', 'tomorrow', 'today', 'tonight', 'session', 'plan', 'from', 'planner', 'schedule', 'calendar', 'roamie']);
    const words = lower.replace(/[^a-z0-9 ]/g, ' ').split(/\s+/).filter(w => w.length > 2 && !stop.has(w) && !new RegExp('^' + WEEKDAY_RE + '$').test(w));
    let pool = env.tasks.filter(t => t.date === date);
    let hits = pool.filter(t => words.some(w => t.title.toLowerCase().includes(w)));
    if (!day && !hits.length) {   // no day given: look across everything coming up
      const upcoming = env.tasks.filter(t => t.date >= todayStr);
      const wide = upcoming.filter(t => words.some(w => t.title.toLowerCase().includes(w)));
      if (wide.length === 1) { hits = wide; date = wide[0].date; }
      else if (wide.length > 1) return { text: `That matches ${wide.length} plans: ${wide.slice(0, 5).map(h => `"${h.title}" (${prettyDate(h.date)})`).join(', ')}. Which one should I cancel?` };
    }
    if (hits.length === 1) {
      return { text: `Done, I've removed "${hits[0].title}" (${hits[0].startTime}–${hits[0].endTime}) from ${prettyDate(date)}.`, removeTaskId: hits[0].id, openDate: date };
    }
    if (hits.length > 1) return { text: `That matches ${hits.length} plans on ${prettyDate(date)}: ${hits.map(h => `"${h.title}"`).join(', ')}. Which one should I cancel?` };
    return { text: pool.length ? `I couldn't find that on ${prettyDate(date)}. On that day you have: ${pool.map(p => `"${p.title}"`).join(', ')}.` : `You have nothing planned on ${prettyDate(date)}, so there is nothing to cancel.` };
  }

  // ---- add / schedule ----
  const wantsAdd = /\b(add|schedule|book|put|slot|block out|block|set up|fit in|squeeze in|pencil in|remind me)\b/.test(lower) || /^plan\b/.test(lower) || /\bplan (a|an|my|some)\b/.test(lower);
  const isQuestion = /\?\s*$/.test(lower) && /^(what|when|where|how|which|who|can i|could i|do i|am i)\b/.test(lower);
  if (wantsAdd && !isQuestion && !/\b(idea|ideas|suggest|recommend|surprise)\b/.test(lower)) {
    const title = extractTitle(q);
    if (!title) return { text: 'Happy to add that. What should I call it, and when would you like it? For example: "Book climbing on Thursday at 6pm for 90 minutes".' };
    const date = day || env.selectedDateStr;
    const minutes = dur || 60;
    const explicit = parseTimeFromText(lower);
    const part = dayPartWindow(lower);
    let start = null;
    if (explicit !== null) {
      const clashes = overlapWith(date, explicit, minutes, ctx);
      if (clashes.length) {
        const gaps = getFreeGaps(date, ctx, minutes);
        const c = clashes[0];
        return { text: `${fromMins(explicit)} on ${prettyDate(date)} clashes with "${c.label}" (${fromMins(c.s)}–${fromMins(c.e)}). ${gaps.length ? `Clash-free windows that day: ${listFreeText(gaps)}. Tell me a time and I'll book it.` : 'There is no free window long enough that day, so try another day.'}`, openDate: date };
      }
      start = explicit;
    } else {
      let from = part ? part[0] : 9 * 60;
      const to = part ? part[1] + minutes : 22 * 60;
      if (date === todayStr) from = Math.max(from, roundUpTo(nowMins + 15, 15));
      const gaps = getFreeGaps(date, ctx, minutes, { from, to: Math.min(to, 23 * 60 + 30) });
      if (!gaps.length) {
        const alt = getFreeGaps(date, ctx, minutes);
        return { text: `I couldn't find a clash-free ${minutes}-minute window${part ? ' in the ' + (/morning/.test(lower) ? 'morning' : /afternoon/.test(lower) ? 'afternoon' : 'evening') : ''} on ${prettyDate(date)}. ${alt.length ? `Free that day: ${listFreeText(alt)}.` : 'That day is full.'}`, openDate: date };
      }
      start = roundUpTo(gaps[0].s, 5);
    }
    const kind = classifyTitle(title);
    const sameDay = env.tasks.filter(t => t.date === date).length;
    const cap = env.dailyCap || 4;
    const task = {
      id: Date.now(),
      title,
      duration: minutes,
      status: 'pending',
      startTime: fromMins(start),
      endTime: fromMins(start + minutes),
      date,
      type: kind.type,
      categoryColor: kind.categoryColor,
      location: '',
      transportMode: 'Walk',
      travelTime: 10,
      distance: '0.5 mi',
      leaveByNote: '',
      notes: '',
      rating: null,
      reviewNote: '',
      withPerson: null,
      meetingType: 'Friendly'
    };
    let warn = '';
    if (sameDay + 1 > cap) warn = ` Heads up: that makes ${sameDay + 1} plans on ${prettyDate(date)}, above your energy cap of ${cap}/day.`;
    return { text: `Done! I've added "${title}" on ${prettyDate(date)}, ${task.startTime}–${task.endTime}. It's clash-free with your schedule.${warn}`, task, openDate: date };
  }

  // ---- free time ----
  if (/\b(free|available|availability|gap|gaps|spare time|find (me )?(a )?(time|slot|window)|when can i|when could i|any time|got time|have time)\b/.test(lower)) {
    const minutes = dur || 45;
    if (day && !parsedDay.week && !parsedDay.weekend) {
      const gaps = getFreeGaps(day, ctx, minutes);
      const planned = env.tasks.filter(t => t.date === day).length;
      return { text: gaps.length ? `On ${longDate(day)} you're free (${minutes}+ min, no clashes): ${listFreeText(gaps, 6)}. You have ${planned} plan${planned === 1 ? '' : 's'} that day. Want me to book something in?` : `${longDate(day)} has no free window of ${minutes} minutes or more. Try another day?`, openDate: day };
    }
    const start = parsedDay && parsedDay.week ? parsedDay.date : todayStr;
    const lines = [];
    for (let i = 0; i < 7; i++) {
      const d = addDaysStr(start, i);
      if (parsedDay && parsedDay.weekend && !['Sat', 'Sun'].includes(dayKeyOf(d))) continue;
      const gaps = getFreeGaps(d, ctx, minutes);
      lines.push(`${prettyDate(d)}: ${gaps.length ? listFreeText(gaps, 3) : 'full'}`);
    }
    return { text: `Here are your clash-free windows (${minutes}+ min):\n${lines.join('\n')}\nTell me what to book and when.` };
  }

  // ---- what's next ----
  if (/\b(what'?s next|what is next|next up|up next|next thing)\b/.test(lower)) {
    const upcoming = env.tasks.filter(t => t.date === todayStr && toMins(t.startTime) >= nowMins && t.status !== 'done').sort((a, b) => a.startTime.localeCompare(b.startTime));
    if (upcoming.length) { const n = upcoming[0]; return { text: `Next up: "${n.title}" at ${n.startTime} (${n.location}). ${n.leaveByNote || ''}`, openDate: todayStr }; }
    const later = env.tasks.filter(t => t.date > todayStr).sort((a, b) => (a.date + a.startTime).localeCompare(b.date + b.startTime))[0];
    return { text: later ? `Nothing else today. Next is "${later.title}" on ${prettyDate(later.date)} at ${later.startTime}.` : 'Nothing else is planned. Want me to find something for you?' };
  }

  // ---- schedule / what's on ----
  if (/\b(what'?s on|what is on|what do i have|what have i got|what am i doing|what'?s planned|my schedule|my plans|my day|my week|my calendar|agenda|itinerary|busy|plans for|show me|am i doing)\b/.test(lower) || (/\b(schedule|calendar|plans)\b/.test(lower) && /\b(today|tomorrow|tonight|week|weekend|monday|tuesday|wednesday|thursday|friday|saturday|sunday|mon|tue|wed|thu|fri|sat|sun)\b/.test(lower))) {
    const rangeDays = parsedDay && (parsedDay.week || parsedDay.weekend) ? 7 : 1;
    const startD = day || todayStr;
    const out = [];
    for (let i = 0; i < rangeDays; i++) {
      const d = addDaysStr(startD, i);
      if (parsedDay && parsedDay.weekend && !['Sat', 'Sun'].includes(dayKeyOf(d))) continue;
      const items = [
        ...env.tasks.filter(t => t.date === d).map(t => ({ s: t.startTime, line: `${t.startTime}–${t.endTime} ${t.title}${t.location ? ' (' + t.location + ')' : ''}` })),
        ...env.calendarEvents.filter(c => c.date === d && !c.allDay).map(c => ({ s: c.start, line: `${c.start}–${c.end} ${c.title} (calendar)` })),
        ...env.calendarEvents.filter(c => c.date === d && c.allDay).map(c => ({ s: '00:00', line: `All day: ${c.title} (calendar)` }))
      ].sort((a, b) => a.s.localeCompare(b.s));
      if (rangeDays === 1) {
        if (!items.length) return { text: `${longDate(d)} is clear. You're free to plan something; ask me for free times or tell me what to book.`, openDate: d };
        return { text: `${longDate(d)}:\n${items.map(i => i.line).join('\n')}`, openDate: d };
      }
      out.push(`${prettyDate(d)}: ${items.length ? items.map(i => i.line).join('; ') : 'clear'}`);
    }
    return { text: out.join('\n') };
  }

  // ---- targets ----
  if (/\b(target|targets|goal|goals|progress|quota|on track|streak)\b/.test(lower)) {
    const lines = env.weeklyTargets.map(t => `${t.title}: ${t.current}/${t.target} ${t.unit}${t.current >= t.target ? ' (done!)' : `, ${t.target - t.current} to go`}`);
    return { text: lines.length ? `Your weekly targets:\n${lines.join('\n')}\nSay "book <something> on <day>" and I'll slot one in.` : 'You have no weekly targets yet. Add one from the Home tab.' };
  }

  // ---- fridge / meals ----
  if (/\b(fridge|meal prep|batch|batches|portions|what('?s| is) for (lunch|dinner)|what should i eat|what can i eat|leftovers|stock)\b/.test(lower)) {
    const stock = env.mealBatches.filter(b => b.portionsLeft > 0);
    const total = stock.reduce((a, b) => a + b.portionsLeft, 0);
    if (!stock.length) return { text: 'Your fridge stock is empty. Maybe plan a Sunday meal prep session?' };
    return { text: `You have ${total} prepped portion${total === 1 ? '' : 's'}: ${stock.map(b => `${b.portionsLeft} × ${b.name}`).join(', ')}. ${stock[0] ? `I'd have the ${stock[0].name} next.` : ''}` };
  }

  // ---- energy ----
  if (/\b(energy|tired|exhausted|knackered|shattered|drained|wiped|worn out|zonked|fried|stressed|burnout|burnt out|burned out|pacing|cap|mood|overwhelmed|rough day|low)\b/.test(lower)) {
    const cap = env.dailyCap;
    const today = env.tasks.filter(t => t.date === todayStr).length;
    return { text: `${env.todayMood ? `You logged "${env.todayMood}" today. ` : "You haven't logged your energy today (do it on the Home tab). "}Your pacing cap is ${cap} plan${cap === 1 ? '' : 's'} a day and you have ${today} today${today > cap ? ', which is over your cap, so consider moving one.' : '.'}` };
  }

  // ---- development / skills ----
  if (/\b(skill|skills|develop|development|learn|learning|study next|milestone|milestones|course|courses)\b/.test(lower) && env.activeSkill) {
    const sk = env.activeSkill;
    const next = (sk.steps || []).find(s => !s.done);
    const done = (sk.steps || []).filter(s => s.done).length;
    return { text: `Your active skill is "${sk.name}" (${done}/${(sk.steps || []).length} milestones done). ${next ? `Next milestone: ${next.title}.` : 'All milestones are complete! Add a new one in Development.'} ${sk.goal ? 'Goal: ' + sk.goal : ''}` };
  }

  // ---- "what time is my X" / "when is my X" ----
  {
    const mt = lower.match(/^(?:what time|when|where)(?:'s| is| are| was)?(?: is| are)? (?:my |the |our )?(.+?)\??$/);
    if (mt && !/\b(free|open|closed|sunset|sunrise|next)\b/.test(mt[1])) {
      const ws = mt[1].replace(/[^a-z0-9 ]/g, ' ').split(/\s+/).filter(w => w.length > 2 && !['the', 'and', 'for', 'with', 'tomorrow', 'today', 'tonight'].includes(w));
      const found = ws.length ? env.tasks.filter(t => t.date >= todayStr && ws.some(w => t.title.toLowerCase().includes(w))).sort((a, b) => (a.date + a.startTime).localeCompare(b.date + b.startTime)) : [];
      if (found.length) return { text: found.slice(0, 3).map(t => `"${t.title}" is ${prettyDate(t.date)}, ${t.startTime}–${t.endTime}${t.location ? ' at ' + t.location : ''}.`).join('\n'), openDate: found[0].date };
    }
  }

  // ---- bare "gym tomorrow 7am" style statements are treated as a booking ----
  {
    const hasWhen = !!day || parseTimeFromText(lower) !== null;
    const talky = /^(what|when|where|why|how|who|which|is|are|do (?=i|you|we|they|my)|does|did|can|could|should|would|will|tell|show|give|list|find|any)\b|\?/.test(lower);
    if (hasWhen && !talky && !webish) {
      const title = extractTitle(q).replace(/^((go(ing)?( to)?|do(ing)?|have|having|get|some|a bit of|a little|bit of)\s+)+/i, '').trim();
      if (title.length >= 3 && title.split(' ').length <= 8) {
        const t = title.charAt(0).toUpperCase() + title.slice(1);
        return roamieBrain('add ' + t + ' ' + q.replace(/^.*?(?=\b(?:today|tomorrow|tonight|on |at |next |this |in the |\d))/i, ''), env);
      }
    }
  }

  // ---- ideas ----
  if (!webish && /\b(idea|ideas|suggest|suggestion|recommend|something (fun|to do|new)|bored|surprise me|what should i do)\b/.test(lower)) {
    const cats = [['Food', /food|eat|coffee|brunch|dinner|lunch|restaurant|cafe|bake/], ['Outdoor', /outdoor|walk|park|hike|nature|fresh air/], ['Indoor', /indoor|rain|museum|art|gallery|cosy|cozy/], ['Sports', /sport|gym|climb|bould|workout|active|swim/], ['Shopping', /shop|buy|browse/], ['Trips', /trip|weekend away|getaway|travel|holiday/]];
    const hit = cats.find(([, re]) => re.test(lower));
    const pool = env.ideas.filter(i => (!hit || i.category === hit[0]));
    const picks = [...pool].sort((a, b) => ((b.userRating || 0) - (a.userRating || 0)) || (b.rating - a.rating) || (Math.sin(a.id * 9301 + env.now.getMinutes()) - Math.sin(b.id * 9301 + env.now.getMinutes()))).slice(0, 3);
    if (!picks.length) return null;
    return { text: `Here are ${picks.length} ideas${hit ? ' for ' + hit[0].toLowerCase() : ''}:\n${picks.map(p => `• ${p.title} (${p.price}, ${p.rating}★): ${p.desc}`).join('\n')}\nSay "book ${picks[0].title} on Saturday at 11am" and I'll add it.` };
  }

  return null;
};

if (typeof window !== 'undefined') window.__roamie = { roamieBrain, roamieNormalise };

// A friendly answer for when the live AI can't be reached and the question isn't about the planner itself.
const roamieOfflineReply = (reason) =>
  `${reason ? reason + ' ' : ''}I can still help with your own planner. Try "What's on tomorrow?", "When am I free on Friday?", "Book gym on Thursday at 7am", "How are my targets?" or "What's in my fridge?".`;

// More curated ideas so "Refresh ideas" always has something new to show, even without a live web connection.
const XI = (id, category, title, desc, rating, price, sub1, sub2, deal, distance, dest) => ({ id, category, title, desc, rating, userRating: null, price, sub1, sub2, deal, distance, ...(dest ? { dest } : {}) });
const EXTRA_IDEAS = [
  XI(101, 'Food', "Rudy's Neapolitan Pizza", 'Wood-fired Neapolitan pizza with a proper blistered crust, no bookings.', 4.8, '£', 'Dinner & Small Plates', 'Casual', 'Margherita from around £7', '0.5 mi'),
  XI(102, 'Food', 'Mackie Mayor', 'Victorian market hall of independent food stalls, great for a group.', 4.7, '££', 'Dinner & Small Plates', 'Food Hall', 'Try a few stalls and share', '0.4 mi'),
  XI(103, 'Food', 'Ezra & Gil', 'Light-filled Northern Quarter cafe known for brunch plates and flat whites.', 4.8, '££', 'Bakery & Brunch', 'Morning', 'Quieter before 10am', '0.5 mi'),
  XI(104, 'Food', 'Umezushi', 'Compact Japanese spot for sushi sets, katsu and small plates.', 4.7, '££', 'Japanese & Ramen', 'Evening', 'Lunch sets are the best value', '0.4 mi'),
  XI(105, 'Food', 'Tampopo', 'Pan-Asian noodle bar with big bowls of ramen, laksa and pad Thai.', 4.6, '£', 'Japanese & Ramen', 'Lunch / Dinner', 'Student lunch offers', '0.3 mi'),
  XI(106, 'Food', 'Federal Cafe & Bar', 'Australian-style brunch and coffee in the Northern Quarter.', 4.7, '££', 'Bakery & Brunch', 'Morning', 'Brunch served all day', '0.5 mi'),
  XI(107, 'Indoor', 'Manchester Museum', 'Recently reimagined university museum with free galleries and a calm cafe.', 4.8, 'Free', 'Art & Craft Cafe', 'Creative', 'Free entry, open daily', '0.9 mi'),
  XI(108, 'Indoor', "John Rylands Library", 'Neo-Gothic reading rooms on Deansgate that feel like Hogwarts.', 4.9, 'Free', 'Study & Reading', 'Focus', 'Free entry', '0.6 mi'),
  XI(109, 'Indoor', 'HOME Manchester', 'Cinema, theatre and gallery under one roof with a good bar.', 4.7, '££', 'Art & Craft Cafe', 'Creative', 'Cheaper cinema tickets on Mondays', '0.7 mi'),
  XI(110, 'Indoor', 'People’s History Museum', 'The story of democracy and everyday lives in Britain.', 4.7, 'Free', 'Art & Craft Cafe', 'Creative', 'Free entry', '0.5 mi'),
  XI(111, 'Indoor', 'Science and Industry Museum', 'Giant machines and the birthplace of modern railways at Castlefield.', 4.7, 'Free', 'Study & Reading', 'Curious', 'Free entry, book a slot', '0.8 mi'),
  XI(112, 'Outdoor', 'Platt Fields Park', 'Big green park with a boating lake and a weekly parkrun.', 4.6, 'Free', 'Urban Nature', 'Gentle Walk', 'Parkrun every Saturday 9am', '2.3 mi'),
  XI(113, 'Outdoor', 'Chorlton Water Park', 'Lakes and woodland trails along the Mersey, quiet on weekdays.', 4.7, 'Free', 'Botanical Trail', 'Scenic Hike', 'Bring a flask for the lakeside benches', '5.0 mi'),
  XI(114, 'Outdoor', 'Wythenshawe Park', 'Parkland with a historic hall, walled garden and a cafe.', 4.6, 'Free', 'Urban Nature', 'Gentle Walk', 'Free entry', '6.0 mi'),
  XI(115, 'Outdoor', 'Reddish Vale Country Park', 'Viaduct, river and woodland walks just beyond the city.', 4.7, 'Free', 'Botanical Trail', 'Scenic Hike', 'Free parking', '6.5 mi'),
  XI(116, 'Sports', 'Manchester Aquatics Centre', 'Olympic-size pool with open swim sessions and a diving pool.', 4.6, '£', 'Indoor', 'Swim', 'Student swim passes available', '1.4 mi'),
  XI(117, 'Sports', 'Junkyard Golf Club', 'Quirky crazy golf with cocktails, good for a group.', 4.6, '££', 'Indoor', 'Social', 'Cheaper before 6pm', '0.5 mi'),
  XI(118, 'Sports', 'Fallowfield Loop Cycle Ride', 'Traffic-free path on a former railway line, easy for any level.', 4.7, 'Free', 'Outdoor', 'Cycle', 'Free, bring a bike light in winter', '2.5 mi'),
  XI(119, 'Sports', 'Sale Water Park Kayaking', 'Beginner-friendly paddling on open water.', 4.5, '££', 'Outdoor', 'Water', 'Check seasonal opening times', '7.0 mi'),
  XI(120, 'Sports', 'Parkrun at Platt Fields', 'Free weekly 5k, all paces welcome.', 4.8, 'Free', 'Outdoor', 'Run', 'Saturdays 9am, register once', '2.3 mi'),
  XI(121, 'Shopping', 'Piccadilly Records', 'Legendary independent record shop, great for a browse.', 4.9, '££', 'Clothes & Vintage', 'Indie Store', 'Listening posts in store', '0.4 mi'),
  XI(122, 'Shopping', 'Magma Books', 'Art, design and zine bookshop in the Northern Quarter.', 4.7, '££', 'Homeware & Art', 'Indie Store', 'Good for gift ideas', '0.5 mi'),
  XI(123, 'Shopping', 'Pop Boutique', 'Vintage clothing from the 50s to the 90s.', 4.6, '££', 'Clothes & Vintage', 'Vintage', 'Student discount on request', '0.5 mi'),
  XI(124, 'Shopping', 'Oi Polloi', 'Outdoor and streetwear labels in the Northern Quarter.', 4.6, '£££', 'Clothes & Vintage', 'Fashion', 'Seasonal sale rail', '0.5 mi'),
  XI(125, 'Shopping', 'Selfridges Exchange Square', 'Homeware and design floor for when you want something special.', 4.6, '£££', 'Homeware & Art', 'Department', 'Sale starts in the new year', '0.4 mi'),
  XI(126, 'Trips', 'Liverpool Waterfront Day', 'Albert Dock, the Tate and a ferry across the Mersey.', 4.8, 'From £9 each way', 'Day Trip (Train)', 'This Weekend', 'Advance train tickets are cheaper', '55m Train', 'Liverpool'),
  XI(127, 'Trips', 'Chester Walls & Rows', 'Walk the Roman walls and browse the medieval Rows.', 4.7, 'From £12 each way', 'Day Trip (Train)', 'This Weekend', 'Railcard saves a third', '1h 10m Train', 'Chester'),
  XI(128, 'Trips', 'Hebden Bridge Canal Walk', 'Pretty mill town with canal paths and independent cafes.', 4.8, 'From £8 each way', 'Day Trip (Train)', 'This Weekend', 'Off-peak return is cheap', '50m Train', 'Hebden Bridge'),
  XI(129, 'Trips', 'Buxton & Pavilion Gardens', 'Georgian spa town at the edge of the Peak District.', 4.7, 'From £9 each way', 'Day Trip (Train)', 'This Weekend', 'Walk up Solomon’s Temple', '1h Train', 'Buxton'),
  XI(130, 'Trips', 'Lisbon City Break', 'Tiled hills, tram 28 and custard tarts. 3 nights is plenty.', 4.9, 'From ~£80 flights', 'Future Getaway (Flight)', 'Next Month', 'Fly midweek to save', '3h Flight', 'Lisbon'),
  XI(131, 'Trips', 'Copenhagen Weekend', 'Design shops, canals and cycling everywhere.', 4.8, 'From ~£70 flights', 'Future Getaway (Flight)', 'Next Month', 'Hotel + hostels both easy', '2h Flight', 'Copenhagen'),
  XI(132, 'Trips', 'Porto Weekend', 'Riverside wine cellars, azulejo stations and cheap great food.', 4.8, 'From ~£60 flights', 'Future Getaway (Flight)', 'Next Month', 'Book flights 6 weeks ahead', '2h 30m Flight', 'Porto'),
];

const CADENCE_INTERVALS = [['Every week', 7], ['Every 2 weeks', 14], ['Every month', 30], ['Every 2 months', 61], ['Every 3 Months', 91], ['Every 4 Months', 122], ['Every 6 Months', 182], ['Every year', 365]];
const intervalDays = (label) => (CADENCE_INTERVALS.find(i => i[0] === label) || [0, 91])[1];
const CONTACT_DEFAULTS = { url: 'https://', phone: '+44', whatsapp: '+44' };
const CONTACT_PLACEHOLDERS = { url: 'https://example.com/book', phone: '+44 161 234 5678', whatsapp: '+44 7700 900123' };
const COUNTRY_CODES = [
  ['+44', 'United Kingdom'], ['+1', 'USA / Canada'], ['+353', 'Ireland'], ['+33', 'France'], ['+49', 'Germany'], ['+34', 'Spain'], ['+39', 'Italy'], ['+31', 'Netherlands'], ['+32', 'Belgium'], ['+41', 'Switzerland'], ['+43', 'Austria'], ['+45', 'Denmark'], ['+46', 'Sweden'], ['+47', 'Norway'], ['+358', 'Finland'], ['+351', 'Portugal'], ['+30', 'Greece'], ['+48', 'Poland'], ['+90', 'Turkey'], ['+971', 'UAE'], ['+966', 'Saudi Arabia'], ['+91', 'India'], ['+92', 'Pakistan'], ['+880', 'Bangladesh'], ['+62', 'Indonesia'], ['+60', 'Malaysia'], ['+65', 'Singapore'], ['+66', 'Thailand'], ['+84', 'Vietnam'], ['+63', 'Philippines'], ['+86', 'China'], ['+852', 'Hong Kong'], ['+81', 'Japan'], ['+82', 'South Korea'], ['+61', 'Australia'], ['+64', 'New Zealand'], ['+27', 'South Africa'], ['+234', 'Nigeria'], ['+254', 'Kenya'], ['+20', 'Egypt'], ['+55', 'Brazil'], ['+52', 'Mexico'], ['+54', 'Argentina'], ['+7', 'Russia']
];
const splitPhone = (v) => {
  const t = String(v || '').trim();
  const hit = [...COUNTRY_CODES].sort((x, y) => y[0].length - x[0].length).find(c => t.replace(/\s/g, '').startsWith(c[0]));
  if (!hit) return { cc: '+44', rest: t.replace(/^\+/, '') };
  return { cc: hit[0], rest: t.replace(/\s/g, '').slice(hit[0].length) };
};
const PhoneField = ({ value, onChange, placeholder }) => {
  const { cc, rest } = splitPhone(value);
  return (
    <div className="flex gap-1.5" data-phone-field>
      <select aria-label="Country code" value={cc} onChange={e => onChange(e.target.value + ' ' + rest)} className="bg-white border border-stone-300 px-1.5 py-1.5 text-xs max-w-[48%]">
        {COUNTRY_CODES.map(([c, n]) => <option key={c + n} value={c}>{n} ({c})</option>)}
      </select>
      <input type="tel" inputMode="tel" aria-label="Booking details" placeholder={placeholder} value={rest} onChange={e => onChange(cc + ' ' + e.target.value.replace(/[^\d\s()-]/g, ''))} className="flex-1 min-w-0 bg-white border border-stone-300 px-2.5 py-1.5 text-xs" />
    </div>
  );
};
const contactHref = (type, value) => {
  const v = (value || '').trim();
  if (type === 'phone') return 'tel:' + v.replace(/[^\d+]/g, '');
  if (type === 'whatsapp') return 'https://wa.me/' + v.replace(/\D/g, '');
  return /^https?:\/\//i.test(v) ? v : 'https://' + v;
};
// When must you start getting ready? plan start - travel time - getting-ready buffer (from your Profile estimator).
const readyStartFor = (t, startMins, profile) => {
  const serious = /serious|date night|business|interview|formal/i.test(`${t.meetingType || ''} ${t.title || ''}`);
  const needsPrep = t.categoryColor !== 'work' || !!t.location;
  const prep = needsPrep ? Number(serious ? profile.prepTimeSerious : profile.prepTimeCasual) || 0 : 0;
  const travel = Number(t.travelTime) || 0;
  return Math.max(0, startMins - travel - prep);
};
const REMINDER_DEFAULTS = { enabled: true, leadMins: 15, browser: false, plans: true, medicine: true, meals: false, admin: true, water: false, reading: false, mood: false, adminDays: 3, mealLead: 0, waterEvery: 120, readingTime: '20:00', moodTime: '20:00', quiet: false, quietFrom: '22:00', quietTo: '07:00' };
const getReminderCfg = (p) => ({ ...REMINDER_DEFAULTS, ...((p && p.reminders) || {}) });
const WATER_GOAL = 8;

const TARGET_DURATIONS = ['1 Week', '2 Weeks', '3 Weeks', '4 Weeks', '1 Month', '6 Weeks', '2 Months', '3 Months', '6 Months', '1 Year', 'Ongoing'];
const STEP_TARGETS = ['', '1 day', '2 days', '3 days', '1 Week', '2 Weeks', '3 Weeks', '1 Month'];

const BUG_TYPES = ['Bug', 'Feature request', 'Confusing / hard to use', 'Feedback'];
const BUG_AREAS = ['Home widgets', 'Schedule / calendar', 'Smart planner / venues', 'Calendar sync (Google / iPhone)', 'Reminders & notifications', 'Ideas', 'Development (skills)', 'Meals & fridge', 'Medicine', 'Mood & energy', 'Social & friends', 'Roamie', 'Account & login', 'Design / looks', 'Speed / performance', 'Other'];

const HOME_WIDGETS = [
  { id: 'glance', label: 'Today at a glance', desc: 'Next plan, free time and load' },
  { id: 'targets', label: 'Weekly targets', desc: 'Track your weekly goals' },
  { id: 'launchpad', label: 'Smart planning', desc: 'Plan an event, task or surprise' },
  { id: 'mood', label: 'Energy check-in', desc: 'Log your energy and pacing' },
  { id: 'medicine', label: 'Medicine reminders', desc: 'Never miss a dose' },
  { id: 'meals', label: 'Meals & fridge', desc: 'Meal prep stock and daily meals' },
  { id: 'cadence', label: 'Long-term cadence', desc: 'Things to do every few weeks' },
  { id: 'feedback', label: 'Feedback', desc: 'Tell us what to improve' },
  { id: 'weekahead', label: 'Week ahead', desc: 'Seven days at a glance' },
  { id: 'notes', label: 'Quick notes', desc: 'A scratchpad that saves itself' },
  { id: 'hydration', label: 'Hydration', desc: 'Count your glasses of water' },
  { id: 'countdown', label: 'Countdown', desc: 'Days until something that matters' },
  { id: 'reading', label: 'Reading', desc: 'Current book, pages and daily streak' }
];
const HEALTH_IDS = ['medicine', 'mood'];
const SETUP_CARE = [
  { id: 'targets', label: 'Weekly goals', desc: 'Targets to hit each week', widget: 'targets' },
  { id: 'medicine', label: 'Medicine', desc: 'Never miss a dose', widget: 'medicine', rem: 'medicine' },
  { id: 'meals', label: 'Meals & fridge', desc: 'Meal prep and daily meals', widget: 'meals', rem: 'meals' },
  { id: 'cadence', label: 'Life admin', desc: 'Vet, dentist, things every few months', widget: 'cadence', rem: 'admin' },
  { id: 'hydration', label: 'Water', desc: 'Count your glasses', widget: 'hydration', rem: 'water' },
  { id: 'reading', label: 'Reading', desc: 'Your book and daily pages', widget: 'reading', rem: 'reading' },
  { id: 'mood', label: 'Mood & energy', desc: 'Daily check-in', widget: 'mood', rem: 'mood' }
];
const SETUP_DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const SETUP_STATUSES = ['University Student', 'Full-Time Professional', 'Shift / Gig Worker', 'Retired', 'Unemployed / Exploring'];
const DEFAULT_HOME_LAYOUT = { order: HOME_WIDGETS.map(w => w.id), hidden: ['mood', 'medicine', 'meals', 'cadence', 'weekahead', 'notes', 'hydration', 'countdown', 'reading'] };
const mergeHomeLayout = (saved) => {
  const order = (saved && saved.order ? saved.order : []).filter(id => HOME_WIDGETS.some(w => w.id === id));
  HOME_WIDGETS.forEach(w => { if (!order.includes(w.id)) order.push(w.id); });
  const hidden = saved && saved.hidden ? saved.hidden.filter(id => HOME_WIDGETS.some(w => w.id === id)) : DEFAULT_HOME_LAYOUT.hidden;
  return { order, hidden };
};

const DAY_WINDOWS = { morning: [540, 750], afternoon: [780, 1050], evening: [1080, 1290], any: [480, 1290] };

// Splits `totalMins` into `blocks` sessions and places each in a free slot before the deadline
// without clashing with tasks, synced calendar events or work hours. skip[i] > 0 moves block i to another free slot.
const planTaskBlocks = ({ totalMins, blocks, startDate, deadline, earliestStart, pref, ctx, cap, skip }) => {
  const n = Math.max(1, Math.min(10, blocks));
  const lens = Array(n).fill(Math.max(15, Math.floor(totalMins / n / 5) * 5));
  let rem = totalMins - lens.reduce((a, b) => a + b, 0);
  for (let i = 0; rem > 0; i = (i + 1) % n) { const add = Math.min(5, rem); lens[i] += add; rem -= add; }

  const lastDay = deadline && deadline >= startDate ? deadline : startDate;
  const days = [];
  for (let d = startDate; d <= lastDay && days.length < 28; d = addDaysStr(d, 1)) days.push(d);

  // All valid start slots for a block of `len` minutes, given the other blocks already fixed.
  const candidatesFor = (len, others) => {
    const extraFor = (date) => others.filter(p => p.date === date).map(p => ({ s: p.s, e: p.e }));
    const countOn = (date) => (ctx.tasks || []).filter(t => t.date === date).length + others.filter(p => p.date === date).length;
    const candidates = [];
    const collect = (windowKey, spreadOnly) => {
      const [ws, we] = DAY_WINDOWS[windowKey];
      days.forEach(date => {
        const used = others.filter(p => p.date === date).length;
        if (spreadOnly ? used !== 0 : used > 1) return;
        if (cap && countOn(date) >= cap) return;
        getFreeGaps(date, ctx, len, { extraBusy: extraFor(date) }).forEach(g => {
          let start = Math.max(g.s, ws);
          if (date === startDate && earliestStart) start = Math.max(start, toMins(earliestStart));
          start = roundUpTo(start, 5);
          if (start + len <= g.e && start < we) candidates.push({ date, s: start, e: start + len });
        });
      });
    };
    collect(pref, true);
    collect(pref, false);
    if (pref !== 'any') { collect('any', true); collect('any', false); }
    const seen = new Set();
    return candidates.filter(c => { const k = c.date + c.s; if (seen.has(k)) return false; seen.add(k); return true; });
  };

  // 1) best plan, block by block
  let placed = [];
  let failedCount = 0;
  for (let i = 0; i < n; i++) {
    const uniq = candidatesFor(lens[i], placed);
    if (uniq.length === 0) { failedCount++; continue; }
    placed.push({ ...uniq[0], len: lens[i], index: i, options: uniq.length });
  }
  // 2) apply "Other time" choices: move that block to another free slot while everything else stays put
  for (let i = 0; i < n; i++) {
    const k = (skip && skip[i]) || 0;
    const mine = placed.find(p => p.index === i);
    if (!k || !mine) continue;
    const others = placed.filter(p => p.index !== i);
    const uniq = candidatesFor(lens[i], others);
    if (uniq.length === 0) continue;
    const pick = uniq[k % uniq.length];
    placed = [...others, { ...pick, len: lens[i], index: i, options: uniq.length }];
  }

  const warnings = [];
  if (failedCount > 0) warnings.push(`${failedCount} of ${n} block${n > 1 ? 's' : ''} couldn't fit before the deadline without clashing. Try fewer/shorter blocks or a later deadline.`);
  const sorted = placed.slice().sort((a, b) => (a.date + fromMins(a.s)).localeCompare(b.date + fromMins(b.s)));
  return { blocks: sorted, lens, warnings, requested: n, failed: failedCount };
};

// ---------- energy / pacing ----------
const computeCap = (mood, reason) => {
  const base = { Great: 6, Okay: 4, Low: 2 }[mood] ?? 4;
  const adj = {
    'Too much stuff to do today': -1,
    'Poor sleep / low motivation': -1,
    'Great outdoor / social session': 1,
    'Balanced schedule': 0
  }[reason] ?? 0;
  const cap = Math.max(1, Math.min(7, base + adj));
  const why = `${mood || 'Okay'} energy${adj ? ` + "${reason}"` : ''}`;
  return { cap, why };
};

// ---------- text / layout ----------
const wrapLabel = (text, maxChars, maxLines) => {
  const words = String(text).split(/\s+/);
  const lines = [];
  let cur = '';
  words.forEach(w => {
    if ((cur + ' ' + w).trim().length > maxChars && cur) { lines.push(cur); cur = w; } else cur = (cur + ' ' + w).trim();
  });
  if (cur) lines.push(cur);
  if (lines.length > maxLines) { const kept = lines.slice(0, maxLines); kept[maxLines - 1] = kept[maxLines - 1].replace(/.{0,2}$/, '') + '…'; return kept; }
  return lines;
};

// Left-to-right tree: root → branches → skill leaves. Nothing can overlap because every leaf owns its own row.
const layoutForest = (branches) => {
  const ROW = 40, GAP = 10, TOP = 8;
  let y = TOP;
  const placed = branches.map(b => {
    const top = y;
    let yy = top;
    const leafs = b.skills.map(sk => {
      const lines = wrapLabel(sk.name, 21, 3);
      const h = Math.max(ROW, (lines.length + 1) * 10 + 10);
      const leaf = { skill: sk, lines, cy: yy + h / 2 };
      yy += h;
      return leaf;
    });
    const height = Math.max(ROW, yy - top);
    y += height + GAP;
    return { branch: b, cy: top + height / 2, leafs };
  });
  return { placed, height: Math.max(120, y - GAP + TOP) };
};

// ---------- booking links ----------
const getBookingLinks = (idea, home = 'Manchester') => {
  const dest = encodeURIComponent(idea.dest || idea.title);
  const links = [];
  const sub = (idea.sub1 || '').toLowerCase();
  const isFlight = sub.includes('flight') || (idea.distance || '').toLowerCase().includes('flight');
  const isTrain = sub.includes('train') || (idea.distance || '').toLowerCase().includes('train');
  if (isFlight) {
    links.push({ label: 'Flights', url: `https://www.google.com/travel/flights?q=${encodeURIComponent('Flights to ' + (idea.dest || idea.title) + ' from ' + home)}` });
    links.push({ label: 'Skyscanner', url: 'https://www.skyscanner.net/' });
    links.push({ label: 'Stays', url: `https://www.booking.com/searchresults.html?ss=${dest}` });
  } else if (isTrain) {
    links.push({ label: 'Trainline', url: 'https://www.thetrainline.com/' });
    links.push({ label: 'Train times', url: `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(home)}&destination=${dest}&travelmode=transit` });
    links.push({ label: 'Stays', url: `https://www.booking.com/searchresults.html?ss=${dest}` });
  } else {
    links.push({ label: 'Book / info', url: `https://www.google.com/search?q=${encodeURIComponent((idea.title || '') + ' book tickets')}` });
    links.push({ label: 'Stays', url: `https://www.booking.com/searchresults.html?ss=${dest}` });
  }
  return links;
};

// ---------- adventurous ideas (things you don't normally do) ----------
const ADVENTURE_POOL = [
  { title: 'Beginner Fencing Taster', tags: ['fenc'], desc: 'Foil lunges, lights and a surprisingly good workout.', price: '£12', sub1: 'Try Something New', deal: 'First session usually discounted', distance: '2.1 mi' },
  { title: 'Improv Comedy Drop-In Class', tags: ['improv', 'comedy'], desc: 'No experience needed - you will laugh and say "yes, and" a lot.', price: '£10', sub1: 'Try Something New', deal: 'Pay-what-you-can nights', distance: '1.0 mi' },
  { title: 'Kintsugi Pottery Repair Workshop', tags: ['kintsugi', 'pottery', 'ceramic'], desc: 'Mend a broken bowl with gold lacquer and learn the philosophy behind it.', price: '£38', sub1: 'Craft', deal: 'Materials included', distance: '1.7 mi' },
  { title: 'Salsa Social for Total Beginners', tags: ['salsa', 'danc'], desc: 'A free intro lesson then a relaxed social - no partner needed.', price: '£6', sub1: 'Dance', deal: 'Free beginner lesson', distance: '0.9 mi' },
  { title: 'Woodturning Evening: Make a Bowl', tags: ['woodturn', 'wood'], desc: 'Shape a wooden bowl on a lathe with a friendly instructor.', price: '£45', sub1: 'Craft', deal: 'Small groups of 4', distance: '3.4 mi' },
  { title: 'Float Tank Relaxation Session', tags: ['float', 'sensory'], desc: '60 minutes of weightless sensory-deprivation calm.', price: '£39', sub1: 'Wellness', deal: 'First float intro price', distance: '2.6 mi' },
  { title: 'Archery Tag Battle', tags: ['archery'], desc: 'Dodgeball meets archery with foam-tipped arrows.', price: '£18', sub1: 'Active', deal: 'Group-of-4 discount', distance: '3.0 mi' },
  { title: 'Urban Foraging Walk', tags: ['forag'], desc: 'Learn to spot edible plants growing around the city.', price: '£15', sub1: 'Outdoors', deal: 'Seasonal tasting included', distance: '2.2 mi' },
  { title: 'Silent Disco Yoga', tags: ['yoga'], desc: 'Flow to a DJ set on wireless headphones.', price: '£14', sub1: 'Wellness', deal: 'Mat hire free', distance: '1.3 mi' },
  { title: 'Life Drawing & Tea Evening', tags: ['life draw', 'drawing', 'sketch'], desc: 'Relaxed, untutored figure drawing with tea and biscuits.', price: '£9', sub1: 'Art', deal: 'Student rate', distance: '0.8 mi' },
  { title: 'Rock Pool & Coastal Dawn Walk (Day Trip)', tags: ['rock pool', 'coast'], desc: 'Catch an early train to the Lancashire coast and explore the shoreline.', price: '£14 Return', sub1: 'Day Trip (Train)', deal: 'Off-peak fares', distance: '1h 10m Train', dest: 'Southport' },
  { title: 'Stand-Up Paddleboarding on the Canal', tags: ['paddleboard', 'paddle', 'sup'], desc: 'Calm-water paddleboard session with all kit provided.', price: '£25', sub1: 'Active', deal: 'Weekday off-peak price', distance: '2.8 mi' },
  { title: 'Cheese & Natural Wine Pairing Class', tags: ['cheese', 'natural wine'], desc: 'Taste six cheeses with matching pours.', price: '£32', sub1: 'Food & Drink', deal: 'Bring a friend for 10% off', distance: '0.7 mi' },
  { title: 'Aerial Hoop Intro Class', tags: ['aerial', 'hoop', 'circus'], desc: 'Learn basic holds and spins on a hanging hoop.', price: '£16', sub1: 'Active', deal: 'Intro offer', distance: '2.4 mi' },
  { title: 'Murder Mystery Escape Room', tags: ['escape room', 'mystery'], desc: 'Solve the case in 60 minutes with your team.', price: '£18', sub1: 'Games', deal: 'Off-peak team price', distance: '0.6 mi' },
  { title: 'Ceramic Painting Cafe', tags: ['ceramic paint', 'paint your own'], desc: 'Pick a piece, paint it, collect it glazed a week later.', price: '£16', sub1: 'Craft', deal: 'Studio fee included', distance: '1.4 mi' },
  { title: 'Learn to Skate: Roller Disco Beginners', tags: ['roller', 'skat'], desc: 'Rink skating with beginner coaching and disco lights.', price: '£8', sub1: 'Active', deal: 'Student skate hire free', distance: '3.1 mi' },
  { title: 'Astronomy Night at the Observatory', tags: ['astronom', 'stargaz', 'telescope'], desc: 'Look through telescopes at Saturn, craters and clusters.', price: '£7', sub1: 'Science', deal: 'Clear-sky nights only', distance: '9.5 mi' },
  { title: 'Foraged-Herb Cocktail Masterclass', tags: ['cocktail', 'mixolog'], desc: 'Shake three drinks using seasonal botanicals.', price: '£30', sub1: 'Food & Drink', deal: 'Mocktail option', distance: '0.9 mi' },
  { title: 'Bell-Ringing Taster at a Cathedral Tower', tags: ['bell'], desc: 'Climb the tower and learn to ring a bell safely.', price: 'Free', sub1: 'Culture', deal: 'Open ringing practice nights', distance: '0.5 mi' },
  { title: 'Sauna & Cold Plunge Social', tags: ['sauna', 'plunge'], desc: 'Contrast therapy with a relaxed communal vibe.', price: '£22', sub1: 'Wellness', deal: 'Weekday rate', distance: '2.9 mi' },
  { title: 'Tabletop RPG Beginners Night', tags: ['tabletop', 'dungeon', 'rpg', 'd&d'], desc: 'Roll dice, pick a character, no prep required.', price: '£5', sub1: 'Games', deal: 'Starter kits provided', distance: '1.1 mi' },
  { title: 'Linocut Printmaking Evening', tags: ['linocut', 'printmaking'], desc: 'Carve your own design and print a small edition.', price: '£28', sub1: 'Art', deal: 'Materials included', distance: '1.8 mi' },
  { title: 'Night Hike with Head Torches (Day Trip)', tags: ['night hike', 'head torch'], desc: 'Guided evening walk on the edge of the Peak District.', price: '£12 Return', sub1: 'Day Trip (Train)', deal: 'Group tickets', distance: '45m Train', dest: 'Hayfield' }
];

const pickAdventureIdeas = (history, seenIds, count = 3) => {
  const hay = (history || '').toLowerCase();
  const fresh = ADVENTURE_POOL.filter(a => !a.tags.some(t => hay.includes(t)));
  const unseen = fresh.filter(a => !seenIds.includes(a.title));
  const pool = unseen.length >= count ? unseen : fresh;
  const shuffled = pool.slice().sort(() => Math.random() - 0.5).slice(0, count);
  return shuffled.map((a, i) => ({ ...a, id: `adv_${Date.now()}_${i}`, category: 'Adventure', rating: 4.7, userRating: null }));
};

// ---------- Surprise Me: effectively endless generator ----------
const SURPRISE_ACTIVITIES = {
  'Adventurous & Quirky': [
    { t: 'Moonlight Kayaking on Bridgewater Canal', cost: 2, dur: 90, loc: 'Castlefield Basin (M3 4JR)', d: 'Illuminated kayak tour under historic viaducts.', tr: 'Deansgate-Castlefield Tram' },
    { t: 'Urban Axe-Throwing Session', cost: 2, dur: 60, loc: 'Ancoats (M4 6AF)', d: 'Learn the flick and aim for bullseyes.', tr: 'Metrolink to Piccadilly' },
    { t: 'Bumper Car & Retro Arcade Crawl', cost: 1, dur: 90, loc: 'Northern Quarter (M4 1LE)', d: 'Pinball, racing cabinets and a pocketful of 10p coins.', tr: 'Shudehill Interchange' },
    { t: 'Rooftop Stargazing Meetup', cost: 0, dur: 90, loc: 'Salford Quays (M50 3AZ)', d: 'Spot planets with a local astronomy club telescope.', tr: 'MediaCityUK Tram' },
    { t: 'Haunted Manchester Ghost Walk', cost: 1, dur: 90, loc: 'Cathedral Gardens (M4 3BG)', d: 'Lamp-lit stories from the old city.', tr: 'Victoria Station' },
    { t: 'Silent Disco in the Park', cost: 1, dur: 120, loc: 'Platt Fields (M14 5LL)', d: 'Three DJ channels and one dance floor.', tr: 'Bus 42 from Oxford Rd' },
    { t: 'Crazy Golf Tournament in a Bar', cost: 1, dur: 90, loc: 'Spinningfields (M3 3EB)', d: 'Themed holes, cocktails and bragging rights.', tr: 'St Peter\'s Square Tram' },
    { t: 'Vintage Photo Booth Crawl', cost: 0, dur: 60, loc: 'Northern Quarter (M4 1HN)', d: 'Hunt down the city\'s old-school booths and collect strips.', tr: 'Piccadilly Gardens' },
    { t: 'Trampoline Park Dodgeball', cost: 2, dur: 60, loc: 'Trafford Park (M17 1AP)', d: 'Bounce, throw and dodge for an hour.', tr: 'Trafford Centre Bus' },
    { t: 'Geocaching Treasure Hunt Around the Canals', cost: 0, dur: 90, loc: 'Ancoats Canal (M4 5BA)', d: 'Use the app to find hidden containers in plain sight.', tr: 'NCP Ancoats Walk' },
    { t: 'Karaoke Booth Showdown', cost: 2, dur: 90, loc: 'Chinatown (M1 4AH)', d: 'Private room, wild setlist.', tr: 'Piccadilly Gardens' },
    { t: 'Abandoned Mill Photography Walk', cost: 0, dur: 120, loc: 'Ancoats (M4 7DL)', d: 'Golden-hour shots of industrial brickwork.', tr: 'NOMA Walk' },
    { t: 'Crystal Maze-Style Escape Challenge', cost: 2, dur: 90, loc: 'Great Northern (M3 4EW)', d: 'Teamwork puzzles under time pressure.', tr: 'Deansgate Station' },
    { t: 'Neon Mini-Golf Under UV Lights', cost: 1, dur: 60, loc: 'Arndale (M4 3AQ)', d: 'Glow-in-the-dark holes and bad puns.', tr: 'Market Street Tram' },
    { t: 'Ferris Wheel Sunset Ride', cost: 1, dur: 60, loc: 'Piccadilly Gardens (M1 1RG)', d: 'Seasonal skyline views.', tr: 'Piccadilly Station' },
    { t: 'Retro Roller Disco Night', cost: 1, dur: 90, loc: 'Wythenshawe (M23 9LF)', d: 'Lights, hits and rented skates.', tr: 'Metrolink to Wythenshawe' }
  ],
  'Cozy & Cultural': [
    { t: 'Secret Underground Jazz & Tapas Cellar', cost: 2, dur: 120, loc: 'Northern Quarter Vaults (M4 1LW)', d: 'Intimate acoustic quartet with small plates.', tr: 'Shudehill Interchange' },
    { t: 'Free Late-Night Gallery Wander', cost: 0, dur: 90, loc: 'Whitworth Art Gallery (M15 6ER)', d: 'Quiet rooms, big textiles and a park outside.', tr: 'Bus 42/43 Oxford Rd' },
    { t: 'Manchester Museum Tropical Tour', cost: 0, dur: 90, loc: 'Oxford Rd (M13 9PL)', d: 'Vivarium frogs, mummies and the Hall of Natural Wonders.', tr: 'Oxford Rd Station' },
    { t: 'Poetry Open Mic at an Indie Bookshop', cost: 0, dur: 90, loc: 'Chorlton (M21 9AD)', d: 'Warm drink, warm room, brave readers.', tr: 'Chorlton Tram' },
    { t: 'Tea Ceremony & Dumpling Tasting', cost: 2, dur: 90, loc: 'Chinatown (M1 4EE)', d: 'Taste three teas with handmade dumplings.', tr: 'Piccadilly Gardens' },
    { t: 'Chetham\'s Library Hidden Tour', cost: 1, dur: 60, loc: 'Chetham\'s (M3 1SB)', d: 'The oldest public library in the English-speaking world.', tr: 'Victoria Station' },
    { t: 'Vinyl Record Shop Crate-Dive & Coffee', cost: 1, dur: 90, loc: 'Northern Quarter (M4 1HL)', d: 'Pick three records you\'ve never heard of.', tr: 'Piccadilly Gardens' },
    { t: 'Independent Cinema Double Bill', cost: 2, dur: 150, loc: 'HOME (M15 4FN)', d: 'Pick a cult classic plus a new release.', tr: 'St Peter\'s Square Tram' },
    { t: 'Science & Industry Museum Evening', cost: 0, dur: 90, loc: 'Castlefield (M3 4FP)', d: 'Steam engines, textile machines and electric gadgets.', tr: 'Deansgate-Castlefield Tram' },
    { t: 'John Rylands Library Architecture Visit', cost: 0, dur: 60, loc: 'Deansgate (M3 3EH)', d: 'Gothic reading rooms and stained glass.', tr: 'St Peter\'s Square Tram' },
    { t: 'Board Game Cafe Evening', cost: 1, dur: 120, loc: 'Northern Quarter (M4 1NA)', d: 'Hundreds of games with a snack menu.', tr: 'Shudehill Interchange' },
    { t: 'Sunday Roast & Folk Session', cost: 2, dur: 150, loc: 'Chorlton Green (M21 9HR)', d: 'Live fiddle and a proper roast.', tr: 'Chorlton Tram' },
    { t: 'Afternoon Tea in a Historic Hotel', cost: 2, dur: 120, loc: 'Piccadilly (M1 4BD)', d: 'Scones, jam and cake stands.', tr: 'Piccadilly Station' },
    { t: 'Manchester Art Gallery Free Tour', cost: 0, dur: 60, loc: 'Mosley Street (M2 3JL)', d: 'Pre-Raphaelites and contemporary works.', tr: 'St Peter\'s Square Tram' },
    { t: 'Evening Choir Drop-In', cost: 1, dur: 90, loc: 'Deansgate (M3 2GH)', d: 'No auditions - just sing.', tr: 'Deansgate Station' },
    { t: 'Cosy Pub Quiz Night', cost: 1, dur: 120, loc: 'Didsbury Village (M20 6RJ)', d: 'Teams, pens and a pie.', tr: 'East Didsbury Tram' }
  ],
  'Creative & Hands-On': [
    { t: 'Tufting Workshop: Make a Mini Rug', cost: 2, dur: 90, loc: 'Pollard Yard Art Studios (M40 7FS)', d: 'Use a tufting gun in an industrial studio.', tr: 'Holt Town Tram' },
    { t: 'Pottery Wheel Throwing Session', cost: 2, dur: 90, loc: 'Levenshulme (M19 3AP)', d: 'Centre, pull and shape your first bowl.', tr: 'Levenshulme Station' },
    { t: 'Screen-Printing a Tote Bag', cost: 2, dur: 120, loc: 'Ancoats (M4 6DH)', d: 'Design, pull and print your own bag.', tr: 'NOMA Walk' },
    { t: 'Sketch Walk: Draw Five Buildings', cost: 0, dur: 90, loc: 'Spinningfields (M3 3AX)', d: 'Bring a pencil and see the skyline as shapes.', tr: 'Deansgate Station' },
    { t: 'Candle Pouring Workshop', cost: 2, dur: 90, loc: 'Northern Quarter (M4 1QB)', d: 'Create a custom scent blend to take home.', tr: 'Piccadilly Gardens' },
    { t: 'Watercolour in the Botanic Corner', cost: 1, dur: 90, loc: 'Fletcher Moss Gardens (M20 2WD)', d: 'Paint the rock garden in loose washes.', tr: 'Didsbury Village Bus' },
    { t: 'Sewing Machine Basics: Make a Pouch', cost: 2, dur: 150, loc: 'Chorlton (M21 8AA)', d: 'Thread a machine and finish a zip pouch.', tr: 'Chorlton Tram' },
    { t: 'Zine-Making Social', cost: 1, dur: 90, loc: 'Northern Quarter (M4 1EW)', d: 'Cut, paste and staple a pocket zine.', tr: 'Shudehill Interchange' },
    { t: 'Community Cooking: Fresh Pasta from Scratch', cost: 2, dur: 120, loc: 'Ancoats (M4 5AN)', d: 'Roll, cut and sauce three shapes.', tr: 'NOMA Walk' },
    { t: 'Embroidery Evening', cost: 1, dur: 90, loc: 'Chorlton (M21 9JY)', d: 'Stitch a tiny design to hang.', tr: 'Chorlton Tram' },
    { t: 'Terrarium Building', cost: 2, dur: 90, loc: 'Altrincham (WA14 1RF)', d: 'Layer soil, moss and mini plants in glass.', tr: 'Altrincham Tram' },
    { t: 'Free Public Mural Walk with a Sketchbook', cost: 0, dur: 90, loc: 'Northern Quarter (M4 1PW)', d: 'Document street art and draw your favourites.', tr: 'Piccadilly Gardens' },
    { t: 'Bookbinding Basics', cost: 2, dur: 120, loc: 'Salford (M5 4WU)', d: 'Stitch a small notebook by hand.', tr: 'Salford Central' },
    { t: 'Plant Propagation Swap', cost: 0, dur: 60, loc: 'Levenshulme (M19 3AA)', d: 'Bring a cutting, take one home.', tr: 'Levenshulme Station' },
    { t: 'Leathercraft Cardholder', cost: 2, dur: 120, loc: 'Ancoats (M4 7AF)', d: 'Cut, stitch and burnish your own cardholder.', tr: 'NOMA Walk' },
    { t: 'Ink & Wash Drawing Meetup', cost: 1, dur: 90, loc: 'Whitworth Park (M15 6ER)', d: 'Quick sketches with a brush pen.', tr: 'Bus 42 Oxford Rd' }
  ],
  'Outdoor & Refreshing': [
    { t: 'Peak District Sunset Ridge Walk & Pub Pie', cost: 1, dur: 150, loc: 'Edale / Mam Tor (S33 7ZA)', d: 'Direct train from Piccadilly for golden-hour views.', tr: 'Northern Train from Piccadilly' },
    { t: 'Heaton Park Boating Lake Loop', cost: 0, dur: 90, loc: 'Heaton Park (M25 2SW)', d: 'Brisk loop with lake views.', tr: 'Heaton Park Tram' },
    { t: 'Salford Quays Sunrise Walk', cost: 0, dur: 60, loc: 'Salford Quays (M50 3AZ)', d: 'Reflections, bridges and an early coffee.', tr: 'Harbour City Tram' },
    { t: 'Chorlton Water Park Wildlife Spot', cost: 0, dur: 90, loc: 'Chorlton Water Park (M21 7SF)', d: 'Look for herons, swans and kingfishers.', tr: 'Chorlton Tram + walk' },
    { t: 'Open-Water Swim Taster', cost: 2, dur: 90, loc: 'Pennington Flash (WN7 3PA)', d: 'Supervised dip with wetsuit hire.', tr: 'Leigh Bus' },
    { t: 'Canal Towpath Cycle to Sale Water Park', cost: 0, dur: 150, loc: 'Sale Water Park (M33 2LH)', d: 'Flat ride on a quiet towpath.', tr: 'Sale Tram' },
    { t: 'Mersey Valley Stepping Stones Walk', cost: 0, dur: 120, loc: 'Fletcher Moss to Stockport (M20 2WD)', d: 'River path and stepping stones.', tr: 'East Didsbury Tram' },
    { t: 'Bluebell Woods Photography Walk', cost: 0, dur: 90, loc: 'Wythenshawe Park (M23 0AB)', d: 'Golden light between the trees.', tr: 'Wythenshawe Tram' },
    { t: 'Open-Air Boxing Bootcamp', cost: 1, dur: 60, loc: 'Platt Fields (M14 5LL)', d: 'Pads, drills and an outdoor sweat.', tr: 'Bus 42 from Oxford Rd' },
    { t: 'Outdoor Yoga by the Canal', cost: 1, dur: 60, loc: 'Castlefield (M3 4JR)', d: 'Flow with the skyline behind you.', tr: 'Deansgate-Castlefield Tram' },
    { t: 'Lyme Park Deer & Hill Trail', cost: 1, dur: 150, loc: 'Lyme Park (SK12 2NX)', d: 'Spot the red deer on a moorland loop.', tr: 'Bus 199 from Stockport' },
    { t: 'Rock Climbing Taster at the Outdoor Wall', cost: 2, dur: 90, loc: 'Stockport (SK1 3UA)', d: 'Learn the basics on easy routes.', tr: 'Stockport Station' },
    { t: 'Sunset Picnic at Hough End Fields', cost: 0, dur: 90, loc: 'Chorlton (M21 9BL)', d: 'Pack snacks and watch the sky change.', tr: 'Chorlton Tram' },
    { t: 'Dog-Friendly Beach Day on the Wirral', cost: 1, dur: 150, loc: 'West Kirby (CH48 4DL)', d: 'Fresh air and long sand.', tr: 'Liverpool Lime St + Wirral Line' },
    { t: 'River Irwell Wildlife Cleanup', cost: 0, dur: 90, loc: 'Salford (M5 4AZ)', d: 'Help tidy the river bank and meet locals.', tr: 'Salford Central' },
    { t: 'Quiet Birdwatching Hide at Pennington Flash', cost: 0, dur: 90, loc: 'Leigh (WN7 3PA)', d: 'Bring binoculars and a flask.', tr: 'Leigh Bus' }
  ]
};

const SURPRISE_TWISTS = [
  { label: 'Disposable-Camera Edition', text: 'Take photos only on a disposable camera.' },
  { label: 'Old Friend Edition', text: "Bring someone you haven't seen in a while." },
  { label: 'Phone-Free Edition', text: 'Phones stay in your pocket for the first hour.' },
  { label: 'Say-Hello Edition', text: 'Start a conversation with one stranger.' },
  { label: 'New-Route Edition', text: 'Take a route there that you have never used.' },
  { label: 'Bold-Outfit Edition', text: 'Wear something bold you rarely wear.' },
  { label: 'Review-It Edition', text: 'Write a three-line review afterwards.' },
  { label: 'Order-Different Edition', text: "Try the thing you wouldn't normally order." },
  { label: 'First-Timers Edition', text: 'Take a friend who has never done it either.' },
  { label: 'Zero-Extra-Spend Edition', text: 'Challenge: spend nothing beyond the entry cost.' },
  { label: 'Mindful Edition', text: 'Take a 10-minute silent observation moment.' },
  { label: 'Journal Edition', text: 'Write one sentence about what surprised you.' },
  { label: 'Local-Tip Edition', text: "Ask a local for their favourite spot nearby." },
  { label: 'Headphones-Off Edition', text: 'Leave your headphones at home.' }
];

// Picks a fresh activity (never repeats until you have seen them all). `exhausted` tells the caller that
// every base activity was used so it can ask the AI for something brand new, or fall back to a twisted variant.
const generateSurprise = (cfg, seen) => {
  const costMax = cfg.budget === 'Free' ? 0 : cfg.budget === '£' ? 1 : 2;
  let pool = (SURPRISE_ACTIVITIES[cfg.vibe] || []).filter(a => a.cost <= costMax && a.dur <= cfg.duration);
  if (!pool.length) pool = Object.values(SURPRISE_ACTIVITIES).flat().filter(a => a.cost <= costMax && a.dur <= cfg.duration);
  const mk = (act, twist, variant) => ({
    key: act.t + '|' + twist.label,
    actKey: act.t,
    title: variant ? `${act.t} · ${twist.label}` : act.t,
    duration: cfg.duration, location: act.loc,
    desc: `${act.d} Twist: ${twist.text}`, transport: `Leave 30m prior via ${act.tr}`,
    cost: act.cost === 0 ? 'Free' : act.cost === 1 ? '£' : '££',
    link: `https://www.google.com/search?q=${encodeURIComponent(act.t + ' Manchester')}`
  });
  const rnd = (arr) => arr[Math.floor(Math.random() * arr.length)];
  const unseen = pool.filter(a => !seen.has(a.t));
  if (unseen.length) return { ...mk(rnd(unseen), rnd(SURPRISE_TWISTS), false), exhausted: false };
  // everything used once: build an unused activity+twist combination
  const combos = [];
  pool.forEach(a => SURPRISE_TWISTS.forEach(t => { if (!seen.has(a.t + '|' + t.label)) combos.push([a, t]); }));
  const [a, t] = combos.length ? rnd(combos) : [rnd(pool), rnd(SURPRISE_TWISTS)];
  return { ...mk(a, t, true), exhausted: true };
};

// ---------- accounts (email + password, stored on this device) ----------
const b64 = (buf) => btoa(String.fromCharCode(...new Uint8Array(buf)));
const hashPassword = async (pw, saltB64) => {
  try {
    const enc = new TextEncoder();
    const salt = saltB64 ? Uint8Array.from(atob(saltB64), c => c.charCodeAt(0)) : crypto.getRandomValues(new Uint8Array(16));
    const key = await crypto.subtle.importKey('raw', enc.encode(pw), 'PBKDF2', false, ['deriveBits']);
    const bits = await crypto.subtle.deriveBits({ name: 'PBKDF2', salt, iterations: 120000, hash: 'SHA-256' }, key, 256);
    return { salt: b64(salt), hash: b64(bits) };
  } catch (e) {
    let h = 5381; const s = (saltB64 || 'roam') + pw;
    for (let i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) >>> 0;
    return { salt: saltB64 || 'roam', hash: 'x' + h };
  }
};
const memStore = {};
const store = {
  get: (k) => { try { const v = localStorage.getItem(k); return v === null ? (memStore[k] ?? null) : v; } catch (e) { return memStore[k] ?? null; } },
  set: (k, v) => { memStore[k] = v; try { localStorage.setItem(k, v); } catch (e) { /* storage unavailable */ } },
  del: (k) => { delete memStore[k]; try { localStorage.removeItem(k); } catch (e) { /* ignore */ } }
};
// Optional personal Gemini key (stored only in this browser). Lets web search work on any host, even without a Netlify function.
const GKEY = 'roam:gemini-key';
const GEMINI_DIRECT_MODELS = ['gemini-2.5-flash', 'gemini-3-flash-preview', 'gemini-2.0-flash'];
const directGemini = async (payload, key, signal) => {
  let last = null;
  for (const model of GEMINI_DIRECT_MODELS) {
    const attempts = payload.tools ? [{ tools: true, think: true }, { tools: true, think: false }, { tools: false, think: false }] : [{ tools: false, think: true }, { tools: false, think: false }];
    for (const a of attempts) {
      const body = { ...payload };
      if (!a.tools) delete body.tools;
      if (a.think && /2\.5-flash/.test(model)) body.generationConfig = { ...(payload.generationConfig || {}), thinkingConfig: { thinkingBudget: 0 } };
      try {
        const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(key)}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body), signal });
        if (res.ok) return res;
        last = res;
        if (res.status === 400) { let m = ''; try { m = (await res.clone().json()).error.message || ''; } catch (e) { /* ignore */ } if (/API key/i.test(m)) return res; continue; }
        if (res.status === 401 || res.status === 403 || res.status === 429) return res;
        break;
      } catch (e) { if (e && e.name === 'AbortError') throw e; last = last || null; break; }
    }
  }
  if (last) return last;
  throw new Error('NO_SERVICE');
};
// Key order is not stable through the database's JSON type, so compare with sorted keys
const stableJson = (v) => JSON.stringify(v, (k, val) => (val && typeof val === 'object' && !Array.isArray(val) ? Object.fromEntries(Object.keys(val).sort().map(x => [x, val[x]])) : val));
const readAccounts = () => { try { return JSON.parse(store.get('roam:accounts') || '{}'); } catch (e) { return {}; } };
const writeAccounts = (a) => store.set('roam:accounts', JSON.stringify(a));

// ---------- LOCATION ----------
const HOME_LOC = { city: 'Manchester', region: 'England', country: 'United Kingdom', lat: 53.4808, lon: -2.2426 };
const HOME_ASSUMED = { ...HOME_LOC, assumed: true };
const CURRENCY_BY_COUNTRY = { 'United Kingdom': '£', 'United States': '$', Canada: '$', Australia: '$', 'New Zealand': '$', Ireland: '€', France: '€', Germany: '€', Spain: '€', Italy: '€', Netherlands: '€', Belgium: '€', Portugal: '€', Austria: '€', Finland: '€', Greece: '€', Japan: '¥', India: '₹', Switzerland: 'CHF ' };
const getLoc = (p) => {
  const l = (p && p.location && p.location.city) ? p.location : HOME_LOC;
  const label = [l.city, l.country].filter(Boolean).join(', ');
  return { ...l, label, isHome: String(l.city).toLowerCase() === 'manchester' && (!l.country || l.country === 'United Kingdom'), cur: CURRENCY_BY_COUNTRY[l.country] || '' };
};
const CITY_FALLBACK = [
  ['Manchester','England','United Kingdom',53.4808,-2.2426],['London','England','United Kingdom',51.5074,-0.1278],['Birmingham','England','United Kingdom',52.4862,-1.8904],['Leeds','England','United Kingdom',53.8008,-1.5491],['Liverpool','England','United Kingdom',53.4084,-2.9916],['Sheffield','England','United Kingdom',53.3811,-1.4701],['Bristol','England','United Kingdom',51.4545,-2.5879],['Newcastle upon Tyne','England','United Kingdom',54.9783,-1.6178],['Nottingham','England','United Kingdom',52.9548,-1.1581],['Leicester','England','United Kingdom',52.6369,-1.1398],['Oxford','England','United Kingdom',51.752,-1.2577],['Cambridge','England','United Kingdom',52.2053,0.1218],['Brighton','England','United Kingdom',50.8225,-0.1372],['Southampton','England','United Kingdom',50.9097,-1.4044],['Edinburgh','Scotland','United Kingdom',55.9533,-3.1883],['Glasgow','Scotland','United Kingdom',55.8642,-4.2518],['Cardiff','Wales','United Kingdom',51.4816,-3.1791],['Belfast','Northern Ireland','United Kingdom',54.5973,-5.9301],['Dublin','Leinster','Ireland',53.3498,-6.2603],
  ['New York','New York','United States',40.7128,-74.006],['Los Angeles','California','United States',34.0522,-118.2437],['Chicago','Illinois','United States',41.8781,-87.6298],['Houston','Texas','United States',29.7604,-95.3698],['San Francisco','California','United States',37.7749,-122.4194],['Seattle','Washington','United States',47.6062,-122.3321],['Boston','Massachusetts','United States',42.3601,-71.0589],['Washington','District of Columbia','United States',38.9072,-77.0369],['Miami','Florida','United States',25.7617,-80.1918],['Austin','Texas','United States',30.2672,-97.7431],['Toronto','Ontario','Canada',43.6532,-79.3832],['Vancouver','British Columbia','Canada',49.2827,-123.1207],['Montreal','Quebec','Canada',45.5019,-73.5674],
  ['Paris','Ile-de-France','France',48.8566,2.3522],['Berlin','Berlin','Germany',52.52,13.405],['Munich','Bavaria','Germany',48.1351,11.582],['Madrid','Madrid','Spain',40.4168,-3.7038],['Barcelona','Catalonia','Spain',41.3851,2.1734],['Rome','Lazio','Italy',41.9028,12.4964],['Milan','Lombardy','Italy',45.4642,9.19],['Amsterdam','North Holland','Netherlands',52.3676,4.9041],['Lisbon','Lisbon','Portugal',38.7223,-9.1393],['Brussels','Brussels','Belgium',50.8503,4.3517],['Zurich','Zurich','Switzerland',47.3769,8.5417],['Vienna','Vienna','Austria',48.2082,16.3738],['Copenhagen','Capital Region','Denmark',55.6761,12.5683],['Stockholm','Stockholm','Sweden',59.3293,18.0686],['Oslo','Oslo','Norway',59.9139,10.7522],['Prague','Prague','Czechia',50.0755,14.4378],['Warsaw','Masovia','Poland',52.2297,21.0122],['Athens','Attica','Greece',37.9838,23.7275],['Istanbul','Istanbul','Turkey',41.0082,28.9784],
  ['Dubai','Dubai','United Arab Emirates',25.2048,55.2708],['Mumbai','Maharashtra','India',19.076,72.8777],['Delhi','Delhi','India',28.7041,77.1025],['Bangalore','Karnataka','India',12.9716,77.5946],['Singapore','','Singapore',1.3521,103.8198],['Kuala Lumpur','','Malaysia',3.139,101.6869],['Jakarta','Jakarta','Indonesia',-6.2088,106.8456],['Bandung','West Java','Indonesia',-6.9175,107.6191],['Bali','Bali','Indonesia',-8.4095,115.1889],['Bangkok','','Thailand',13.7563,100.5018],['Hong Kong','','Hong Kong',22.3193,114.1694],['Tokyo','Tokyo','Japan',35.6762,139.6503],['Seoul','','South Korea',37.5665,126.978],['Shanghai','','China',31.2304,121.4737],['Beijing','','China',39.9042,116.4074],['Sydney','New South Wales','Australia',-33.8688,151.2093],['Melbourne','Victoria','Australia',-37.8136,144.9631],['Auckland','','New Zealand',-36.8485,174.7633],['Cape Town','Western Cape','South Africa',-33.9249,18.4241],['Johannesburg','Gauteng','South Africa',-26.2041,28.0473],['Lagos','Lagos','Nigeria',6.5244,3.3792],['Nairobi','','Kenya',-1.2921,36.8219],['Cairo','','Egypt',30.0444,31.2357],['Sao Paulo','Sao Paulo','Brazil',-23.5505,-46.6333],['Mexico City','','Mexico',19.4326,-99.1332],['Buenos Aires','','Argentina',-34.6037,-58.3816],
].map(x => ({ city: x[0], region: x[1], country: x[2], lat: x[3], lon: x[4] }));
const normCity = (t) => String(t || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z ]/g, '').trim();
const cityFallback = (q) => { const n = normCity(q); if (!n) return []; return CITY_FALLBACK.filter(c => normCity(c.city).startsWith(n) || normCity(c.city + ' ' + c.country).includes(n)).slice(0, 5); };
const dedupeLoc = (arr) => { const seen = new Set(); return arr.filter(x => { const k = normCity(x.city) + '|' + normCity(x.country); if (!x.city || seen.has(k)) return false; seen.add(k); return true; }); };
// Tries several free lookups in turn (any one working is enough), then a built-in list of big cities so typing a city never dead-ends.
const UK_POSTCODE = /^[A-Za-z]{1,2}\d[A-Za-z\d]?\s*\d[A-Za-z]{2}$/;
// UK postcode -> exact point (free postcodes.io service). Returns [] if it isn't a UK postcode or can't be found.
const lookupPostcode = async (q) => {
  const pc = String(q || '').trim();
  if (!UK_POSTCODE.test(pc)) return [];
  try {
    const j = await fetchJSON(`https://api.postcodes.io/postcodes/${encodeURIComponent(pc.replace(/\s+/g, ''))}`, {}, 7000);
    const r = j && j.result; if (!r || r.latitude == null) return [];
    const region = r.region || '';
    const city = region === 'London' ? 'London' : (r.admin_district || r.parish || r.admin_county || '');
    return city ? [{ city, region: region === 'London' ? '' : (r.admin_county || region), country: 'United Kingdom', lat: r.latitude, lon: r.longitude, postcode: r.postcode }] : [];
  } catch (e) { return []; }
};
const geocodeCity = async (q) => {
  const enc = encodeURIComponent(q);
  const pcHit = await lookupPostcode(q);
  if (pcHit.length) return pcHit;
  const tries = [
    async () => { const j = await fetchJSON(`https://geocoding-api.open-meteo.com/v1/search?name=${enc}&count=5&language=en&format=json`, {}, 7000); return (j.results || []).map(x => ({ city: x.name, region: x.admin1 || '', country: x.country || '', lat: x.latitude, lon: x.longitude })); },
    async () => { const j = await fetchJSON(`https://photon.komoot.io/api/?q=${enc}&limit=6&lang=en`, {}, 7000); return (j.features || []).filter(f => f.geometry && f.properties && f.properties.name).map(f => ({ city: f.properties.name, region: f.properties.state || '', country: f.properties.country || '', lat: f.geometry.coordinates[1], lon: f.geometry.coordinates[0] })); },
    async () => { const j = await fetchJSON(`https://nominatim.openstreetmap.org/search?format=jsonv2&addressdetails=1&limit=6&q=${enc}`, {}, 7000); return (Array.isArray(j) ? j : []).map(x => { const a = x.address || {}; return { city: a.city || a.town || a.village || a.municipality || x.name || '', region: a.state || '', country: a.country || '', lat: parseFloat(x.lat), lon: parseFloat(x.lon) }; }); },
  ];
  let got = null;
  for (const t of tries) { try { const r = dedupeLoc(await t()); if (r.length) { got = r; break; } } catch (e) { /* try the next service */ } }
  return dedupeLoc([...(got || []), ...cityFallback(q)]).slice(0, 6);
};
const reverseGeocode = async (lat, lon) => {
  const tries = [
    async () => { const j = await fetchJSON(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=en`, {}, 7000); return { city: j.city || j.locality || '', region: j.principalSubdivision || '', country: j.countryName || '' }; },
    async () => { const j = await fetchJSON(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&zoom=10&lat=${lat}&lon=${lon}`, {}, 7000); const a = j.address || {}; return { city: a.city || a.town || a.village || a.municipality || a.county || '', region: a.state || a.region || '', country: a.country || '' }; },
  ];
  let pc = '';
  try { const j = await fetchJSON(`https://api.postcodes.io/postcodes?lon=${lon}&lat=${lat}&limit=1`, {}, 6000); pc = (j && j.result && j.result[0] && j.result[0].postcode) || ''; } catch (e) { /* not in the UK, or offline */ }
  for (const t of tries) { try { const r = await t(); if (r.city) return { ...r, lat, lon, ...(pc ? { postcode: pc } : {}) }; } catch (e) { /* next */ } }
  // Offline: name the nearest big city so the app still has somewhere sensible, but keep the exact coordinates.
  let best = null, bd = 1e9; for (const c of CITY_FALLBACK) { const d = haversineKm(lat, lon, c.lat, c.lon); if (d < bd) { bd = d; best = c; } }
  if (best && bd < 60) return { city: best.city, region: best.region, country: best.country, lat, lon, ...(pc ? { postcode: pc } : {}) };
  return { city: 'Current location', region: '', country: '', lat, lon, ...(pc ? { postcode: pc } : {}) };
};
function LocationPicker({ value, onChange }) {
  const cur = value && value.city ? value : HOME_LOC;
  const [q, setQ] = useState('');
  const [results, setResults] = useState([]);
  const [msg, setMsg] = useState('');
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    const t = q.trim();
    if (t.length < 2) { setResults([]); return undefined; }
    let dead = false;
    const id = setTimeout(async () => {
      setBusy(true);
      try { const r = await geocodeCity(t); if (!dead) { setResults(r); setMsg(r.length ? '' : 'No match. Check the spelling, or press Use this to keep what you typed.'); } }
      catch (e) { if (!dead) { setResults([]); setMsg("Couldn't look that up right now. Press Use this to keep what you typed."); } }
      if (!dead) setBusy(false);
    }, 400);
    return () => { dead = true; clearTimeout(id); };
  }, [q]);
  const pick = (l) => { onChange(l); setQ(''); setResults([]); setMsg(''); };
  const useGps = () => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) { setMsg("This browser can't share your location. Type your city instead."); return; }
    setBusy(true); setMsg('Finding you...');
    navigator.geolocation.getCurrentPosition(async (pos) => {
      try { pick(await reverseGeocode(pos.coords.latitude, pos.coords.longitude)); setMsg('Location set.'); }
      catch (e) { setMsg('Could not name the place. Type your city instead.'); }
      setBusy(false);
    }, () => { setBusy(false); setMsg('Location was blocked. Allow it in your browser, or type your city.'); }, { timeout: 10000 });
  };
  return (
    <div data-location-picker className="space-y-2">
      <div className="flex items-center gap-2 bg-white border border-stone-300 px-3 py-2 text-sm"><MapPin size={14} className="text-purple-900 shrink-0" /><span data-location-current className="font-medium">{[cur.city, cur.region && cur.region !== cur.city ? cur.region : '', cur.country].filter(Boolean).join(', ')}{cur.postcode ? ` (${cur.postcode})` : ''}</span></div>
      <div className="flex gap-2">
        <input type="text" aria-label="Search for your city or postcode" placeholder="City, town or postcode" value={q} onChange={e => setQ(e.target.value)} className="flex-1 min-w-0 bg-white border border-stone-300 px-3 py-2 text-xs" />
        <button type="button" data-location-use onClick={async () => { const t = q.trim(); if (!t) return; if (results.length) { pick(results[0]); return; } setBusy(true); let r = []; try { r = await geocodeCity(t); } catch (e) { r = []; } setBusy(false); pick(r.length ? r[0] : { city: t, region: '', country: '' }); }} disabled={!q.trim()} className="px-3 py-2 border border-stone-400 text-[10px] uppercase tracking-wider font-medium shrink-0 disabled:opacity-40">Use this</button>
      </div>
      {results.length > 0 && (
        <div className="border border-stone-300 bg-white divide-y divide-stone-200">
          {results.map((r, i) => <button key={i} type="button" data-location-result onClick={() => pick(r)} className="w-full text-left px-3 py-2 text-xs hover:bg-stone-100">{r.city}<span className="text-stone-500">{[r.region, r.country].filter(Boolean).map(x => ', ' + x).join('')}</span></button>)}
        </div>
      )}
      <button type="button" data-location-gps onClick={useGps} disabled={busy} className="px-3 py-2 border border-stone-400 text-[10px] uppercase tracking-wider font-medium flex items-center gap-1.5"><MapPin size={12} /> Use my current location</button>
      {msg && <p className="text-[11px] text-stone-600 leading-snug">{msg}</p>}
    </div>
  );
}

// ---------- INVITES (work as links, no server needed) ----------
const PENDING_INVITE = 'roam:pending-invite';
const b64e = (o) => btoa(unescape(encodeURIComponent(JSON.stringify(o)))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
const b64d = (t) => JSON.parse(decodeURIComponent(escape(atob(t.replace(/-/g, '+').replace(/_/g, '/')))));
const makeInviteLink = (inv) => `${window.location.origin}${window.location.pathname}#invite=${b64e(inv)}`;
try {
  const m = (typeof window !== 'undefined' && window.location.hash || '').match(/invite=([A-Za-z0-9_-]+)/);
  if (m) {
    const inv = b64d(m[1]);
    if (inv && inv.t && inv.d && inv.s) store.set(PENDING_INVITE, JSON.stringify(inv));
    window.history.replaceState(null, '', window.location.pathname + window.location.search);
  }
} catch (e) { /* ignore a bad link */ }


// ---------- KEYLESS LIVE SEARCH (no API key needed) ----------
// OpenStreetMap (Overpass) for real places, Wikipedia for facts, Open-Meteo for weather. All free, no sign-up, called straight from the browser.
const KM_PER_MI = 1.609344;
const haversineKm = (a, b, c, d) => { const R = 6371, t = (x) => x * Math.PI / 180; const dl = t(c - a), dn = t(d - b); const h = Math.sin(dl / 2) ** 2 + Math.cos(t(a)) * Math.cos(t(c)) * Math.sin(dn / 2) ** 2; return 2 * R * Math.asin(Math.sqrt(h)); };
const fmtDist = (km, country) => ((!country || country === 'United Kingdom' || country === 'United States') ? `${(km / KM_PER_MI).toFixed(1)} mi` : `${km.toFixed(1)} km`);
const fetchJSON = async (url, opts = {}, ms = 15000) => {
  const c = typeof AbortController !== 'undefined' ? new AbortController() : null;
  const t = setTimeout(() => c && c.abort(), ms);
  try { const r = await fetch(url, { ...opts, signal: c ? c.signal : undefined }); if (!r.ok) throw new Error('HTTP ' + r.status); return await r.json(); } finally { clearTimeout(t); }
};
const OVERPASS_URLS = ['https://overpass-api.de/api/interpreter', 'https://overpass.kumi.systems/api/interpreter'];
const overpass = async (ql) => {
  let err = null;
  for (const ep of OVERPASS_URLS) {
    try { const j = await fetchJSON(ep, { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: 'data=' + encodeURIComponent(ql) }, 18000); return j.elements || []; } catch (e) { err = e; }
  }
  throw err || new Error('overpass');
};
// ---------- Colour themes: palette (colour scheme) x mode (light / dark / auto) ----------
// Works by re-mapping the Tailwind colour classes the app already uses, so every screen follows the theme.
const THEME_PALETTES = {
  classic: { name: 'Classic', hint: 'Original blue', nh: 215, ns: 14, p: [221, 70], s: [271, 55], t: [347, 65] },
  ember: { name: 'Autumn Ember', hint: 'Burnt orange & chestnut', nh: 22, ns: 28, p: [18, 76], s: [350, 52], t: [38, 82] },
  maple: { name: 'Maple', hint: 'Burgundy & rust', nh: 355, ns: 22, p: [354, 58], s: [20, 68], t: [40, 72] },
  harvest: { name: 'Harvest', hint: 'Mustard & olive', nh: 42, ns: 24, p: [40, 82], s: [85, 38], t: [16, 62] },
  woodland: { name: 'Woodland', hint: 'Moss & copper', nh: 96, ns: 14, p: [96, 36], s: [28, 55], t: [42, 60] },
  mocha: { name: 'Mocha', hint: 'Coffee & caramel', nh: 28, ns: 20, p: [28, 55], s: [12, 45], t: [42, 70] },
  plum: { name: 'Plum', hint: 'Aubergine & rose', nh: 300, ns: 18, p: [305, 40], s: [335, 55], t: [20, 65] },
  rosewood: { name: 'Rosewood', hint: 'Dusky pink & clay', nh: 345, ns: 20, p: [346, 45], s: [10, 50], t: [28, 55] },
  teal: { name: 'Deep Teal', hint: 'Sea green & sand', nh: 185, ns: 18, p: [184, 55], s: [165, 40], t: [38, 70] },
  midnight: { name: 'Midnight', hint: 'Indigo & violet', nh: 235, ns: 22, p: [240, 55], s: [270, 45], t: [330, 55] },
  sage: { name: 'Sage', hint: 'Soft green & stone', nh: 130, ns: 10, p: [140, 28], s: [90, 30], t: [30, 45] },
  graphite: { name: 'Graphite', hint: 'Neutral grey, minimal', nh: 220, ns: 5, p: [220, 12], s: [220, 8], t: [0, 35] }
};
const THEME_STEPS = ['50', '100', '200', '300', '400', '500', '600', '700', '800', '900', '950'];
const THEME_RAMPS = {
  light: {
    col: { bg: [97, 94, 88, 80, 70, 58, 48, 40, 33, 26, 18], text: [97, 94, 88, 80, 68, 55, 46, 40, 33, 26, 18], border: [95, 92, 86, 78, 68, 58, 48, 40, 34, 28, 20] },
    neu: { bg: [96, 93, 88, 80, 68, 55, 42, 32, 24, 17, 11], text: [97, 94, 88, 80, 54, 42, 34, 28, 22, 15, 10], border: [95, 92, 87, 79, 68, 55, 42, 32, 24, 17, 11] }
  },
  dark: {
    col: { bg: [13, 16, 21, 28, 36, 42, 38, 34, 30, 26, 20], text: [96, 92, 86, 78, 72, 66, 68, 72, 78, 84, 90], border: [18, 22, 28, 34, 42, 48, 44, 40, 36, 30, 24] },
    neu: { bg: [14, 17, 21, 28, 36, 44, 36, 34, 32, 30, 26], text: [96, 93, 88, 80, 58, 64, 72, 80, 88, 93, 96], border: [16, 19, 24, 31, 40, 48, 44, 40, 34, 30, 26] }
  }
};
const FIXED_FAMILIES = { emerald: [160, 70], green: [140, 55], amber: [38, 88], yellow: [48, 85], orange: [24, 85], red: [0, 70], sky: [200, 75], indigo: [239, 60], teal: [175, 60], pink: [330, 65], violet: [262, 60], cyan: [188, 70] };
const resolveThemeMode = (mode) => mode === 'dark' ? 'dark' : mode === 'auto' ? ((typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) ? 'dark' : 'light') : 'light';
const buildThemeCss = (paletteId, mode) => {
  const pal = THEME_PALETTES[paletteId] || THEME_PALETTES.classic;
  const m = resolveThemeMode(mode);
  if (paletteId === 'classic' && m === 'light') return '';   // the original look: no overrides
  const hsl = (h, sat, l) => `hsl(${h} ${sat}% ${l}%)`;
  const ramps = THEME_RAMPS[m];
  const rules = [];
  const PROPS = { bg: 'background-color', text: 'color', border: 'border-color' };
  const VARIANTS = [['', ''], ['hover\\:', ':hover'], ['focus\\:', ':focus'], ['active\\:', ':active'], ['disabled\\:', ':disabled']];
  const emit = (family, hue, sat, kind) => {
    const r = ramps[kind === 'neu' ? 'neu' : 'col'];
    for (const [prop, css] of Object.entries(PROPS)) {
      THEME_STEPS.forEach((step, i) => {
        // neutrals get a faint palette tint; dark-mode neutral buttons (600+) take the primary accent colour
        let v;
        if (kind === 'neu') v = (m === 'dark' && prop === 'bg' && i >= 6) ? hsl(pal.p[0], pal.p[1], r[prop][i]) : hsl(pal.nh, pal.ns, r[prop][i]);
        else v = hsl(hue, sat, r[prop][i]);
        for (const [pre, post] of VARIANTS) rules.push(`html[data-pact-theme] .${pre}${prop}-${family}-${step}${post}{${css}:${v}!important}`);
      });
    }
    rules.push(`html[data-pact-theme] .divide-${family}-200>:not([hidden])~:not([hidden]){border-color:${hsl(kind === 'neu' ? pal.nh : hue, kind === 'neu' ? pal.ns : sat, ramps[kind === 'neu' ? 'neu' : 'col'].border[2])}!important}`);
  };
  emit('slate', 0, 0, 'neu'); emit('stone', 0, 0, 'neu');
  emit('blue', pal.p[0], pal.p[1], 'col'); emit('purple', pal.s[0], pal.s[1], 'col'); emit('rose', pal.t[0], pal.t[1], 'col');
  if (m === 'dark') for (const [f, [h, sa]] of Object.entries(FIXED_FAMILIES)) emit(f, h, sa, 'col');
  // surfaces
  const L = m === 'dark' ? { page: 9, card: 13, soft: 16, soft2: 19, line: 24, fg: 92 } : { page: 95, card: 99, soft: 97, soft2: 91, line: 87, fg: 15 };
  const page = hsl(pal.nh, pal.ns, L.page), card = hsl(pal.nh, pal.ns, L.card), soft = hsl(pal.nh, pal.ns, L.soft), soft2 = hsl(pal.nh, pal.ns, L.soft2);
  rules.push(`html[data-pact-theme] .bg-white{background-color:${card}!important}`);
  rules.push(`html[data-pact-theme] .bg-\\[\\#FAF8F5\\]{background-color:${soft}!important}`);
  rules.push(`html[data-pact-theme] .bg-\\[\\#F5F3EC\\]{background-color:${page}!important}`);
  rules.push(`html[data-pact-theme] .bg-\\[\\#EDEAE0\\]{background-color:${soft2}!important}`);
  rules.push(`html[data-pact-theme] .hover\\:bg-white:hover{background-color:${soft}!important}`);
  rules.push(`html[data-pact-theme] [data-pact-glass]{background:${hsl(pal.nh, pal.ns, L.page).replace(')', ' / .86)')}!important}`);
  rules.push(`html[data-pact-theme] [data-pact-glass="nav"]{background:${hsl(pal.nh, pal.ns, L.page).replace(')', ' / .97)')}!important}`);
  rules.push(`html[data-pact-theme] .border-white{border-color:${card}!important}`);
  rules.push(`html[data-pact-theme],html[data-pact-theme] body{background:${m === 'dark' ? hsl(pal.nh, pal.ns, 6) : hsl(pal.nh, pal.ns, 90)}!important;color-scheme:${m}}`);
  rules.push(`html[data-pact-theme] .bg-black\\/40,html[data-pact-theme] .bg-slate-950\\/70{background-color:rgba(0,0,0,${m === 'dark' ? '.65' : '.4'})!important}`);
  if (m === 'dark') {
    rules.push(`html[data-pact-theme] input,html[data-pact-theme] textarea,html[data-pact-theme] select{color:${hsl(pal.nh, pal.ns, 92)}}`);
    rules.push(`html[data-pact-theme] ::placeholder{color:${hsl(pal.nh, pal.ns, 52)}!important}`);
    rules.push(`html[data-pact-theme] option{background:${card};color:${hsl(pal.nh, pal.ns, 92)}}`);
    rules.push(`html[data-pact-theme] .text-black{color:${hsl(pal.nh, pal.ns, 92)}!important}`);
  }
  return rules.join('\n');
};
const THEME_KEY = 'pact_theme_v1';
const readStoredTheme = () => { try { const t = JSON.parse(localStorage.getItem(THEME_KEY) || 'null'); if (t && THEME_PALETTES[t.palette]) return t; } catch (e) {} return { palette: 'classic', mode: 'light' }; };
const applyTheme = (theme) => {
  if (typeof document === 'undefined') return;
  const t = theme && THEME_PALETTES[theme.palette] ? theme : { palette: 'classic', mode: 'light' };
  let el = document.getElementById('pact-theme-css');
  const css = buildThemeCss(t.palette, t.mode);
  if (!css) { if (el) el.remove(); document.documentElement.removeAttribute('data-pact-theme'); return; }
  if (!el) { el = document.createElement('style'); el.id = 'pact-theme-css'; document.head.appendChild(el); }
  el.textContent = css;
  document.documentElement.setAttribute('data-pact-theme', t.palette + '-' + resolveThemeMode(t.mode));
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute('content', resolveThemeMode(t.mode) === 'dark' ? '#1a1310' : '#F4EFE4');
};
if (typeof window !== 'undefined') applyTheme(readStoredTheme());

// ---------- Ideas filters: each chip maps to real place kinds (database) and OpenStreetMap tags (live search) ----------
// Event planner: turn the words you type ("anniversary", "ramen", "climbing") into the kinds of place to look for.
const FAST_FOOD = /\b(kfc|mcdonald'?s|burger king|subway|domino'?s|pizza hut|papa john'?s|greggs|five guys|wendy'?s|taco bell|popeyes|little caesars|chicken cottage|dixy|wimpy)\b/i;
const PLANNER_RULES = [
  { re: /anniversar|romantic|candlelit|intimate|date night|date|proposal|valentine|fine dining|special occasion|elegant|upscale|fancy|cosy dinner|candle/, cat: 'Food', kinds: ['restaurant'], label: 'restaurants', formal: true },
  { re: /birthday|celebrat|party|group dinner|big group|family meal|family|graduation/, cat: 'Food', kinds: ['restaurant', 'pub', 'bar'], label: 'restaurants and bars', formal: true },
  { re: /brunch|breakfast|coffee|cafe|bakery|pastry|cake|tea\b|afternoon tea/, cat: 'Food', kinds: ['cafe', 'bakery'], label: 'cafes and bakeries' },
  { re: /cocktail|drinks|\bbar\b|wine|pub\b|beer|brewery|nightlife|night out/, cat: 'Food', kinds: ['bar', 'pub'], label: 'bars and pubs' },
  { re: /dessert|ice cream|gelato|sweet|chocolate|waffle|crepe/, cat: 'Food', kinds: ['dessert', 'cafe'], label: 'dessert spots' },
  { re: /dinner|lunch|restaurant|food|eat|meal|business dinner|networking/, cat: 'Food', kinds: ['restaurant'], label: 'restaurants' },
  { re: /walk|stroll|park|garden|picnic|nature|hike|scenic|outdoor|fresh air|sunset|view/, cat: 'Outdoor', kinds: ['park', 'garden', 'nature', 'trail', 'viewpoint'], label: 'parks and outdoor spots' },
  { re: /museum|gallery|exhibition|art visit|heritage|history/, cat: 'Indoor', kinds: ['museum', 'gallery'], label: 'museums and galleries' },
  { re: /cinema|film|movie/, cat: 'Indoor', kinds: ['cinema'], label: 'cinemas' },
  { re: /theatre|theater|show|comedy|concert|gig|live music|musical/, cat: 'Indoor', kinds: ['theatre'], label: 'theatres and venues' },
  { re: /pottery|art cafe|craft|paint|workshop|creative/, cat: 'Indoor', kinds: ['arts_centre', 'cafe'], label: 'creative spaces' },
  { re: /bowling|arcade|escape|games|mini golf|crazy golf|laser/, cat: 'Indoor', kinds: ['fun_venue'], label: 'games venues' },
  { re: /climb|boulder|movement/, cat: 'Sports', kinds: ['climbing'], label: 'climbing walls' },
  { re: /gym|workout|fitness|training/, cat: 'Sports', kinds: ['gym'], label: 'gyms' },
  { re: /swim|pool/, cat: 'Sports', kinds: ['pool'], label: 'pools' },
  { re: /shop|shopping|vintage|thrift|bookshop|records/, cat: 'Shopping', kinds: ['bookshop', 'vintage_shop', 'clothes', 'record_shop'], label: 'shops' }
];
const CUISINES = ['pizza', 'burger', 'sushi', 'ramen', 'japanese', 'italian', 'indian', 'curry', 'thai', 'chinese', 'mexican', 'vegan', 'vegetarian', 'steak', 'seafood', 'korean', 'turkish', 'lebanese', 'greek', 'spanish', 'tapas', 'french', 'vietnamese', 'persian', 'ethiopian', 'indonesian', 'german', 'halal', 'kebab', 'noodle'];
const plannerIntent = (cfg, mode) => {
  const vibe = String(cfg.vibeKeywords || '').toLowerCase();
  const base = mode === 'activity' ? String(cfg.activityDropdown || '').toLowerCase() : String(cfg.eventType || '').toLowerCase();
  const find = (txt) => PLANNER_RULES.find(r => r.re.test(txt));
  // what you typed wins; the dropdown only fills in when your words don't say
  const rule = find(vibe) || find(base + ' ' + vibe);
  const cuisines = CUISINES.filter(c => new RegExp('\\b' + c, 'i').test(vibe));
  const out = { cat: rule ? rule.cat : null, kinds: rule ? rule.kinds : [], queries: cuisines, label: rule ? rule.label : '', formal: !!(rule && rule.formal) || /romantic|anniversar|date|proposal|fine dining|elegant/.test(vibe + ' ' + base) };
  if (cuisines.length && !out.cat) { out.cat = 'Food'; out.kinds = ['restaurant']; out.label = 'restaurants'; }
  if (cuisines.length) out.label = cuisines.join(' / ') + ' ' + (out.label || 'places');
  out.key = [out.cat, out.kinds.join(','), out.queries.join(',')].join('|');
  out.mapped = !!out.cat;
  return out;
};
const NOT_A_PLACE = /\b(auctions?|auctioneers?|bidding|ebay|garden cent(?:re|er)s?|landscap\w*|nurser(?:y|ies)|funeral|crematorium|cemetery|storage|estate agents?|pawn\w*|wholesale|scaffolding|plumbing|recruitment)\b/i;
const IDEA_FILTERS = {
  Food: [
    { label: 'Bakery & Brunch', kinds: ['bakery', 'cafe'] }, { label: 'Restaurants', kinds: ['restaurant'] }, { label: 'Pubs & Bars', kinds: ['pub', 'bar'] },
    { label: 'Desserts', kinds: ['dessert'] }, { label: 'Pizza', query: 'pizza' }, { label: 'Vegan & Veggie', query: 'vegan' }, { label: 'Japanese & Ramen', query: 'japanese' }
  ],
  Indoor: [
    { label: 'Museums & Galleries', kinds: ['museum', 'gallery'] }, { label: 'Cinema & Theatre', kinds: ['cinema', 'theatre'] }, { label: 'Study & Reading', kinds: ['library'] },
    { label: 'Art & Craft Cafe', kinds: ['arts_centre'] }, { label: 'Fun & Games', kinds: ['fun_venue'] }
  ],
  Outdoor: [
    { label: 'Parks & Gardens', kinds: ['park', 'garden'], legacy: ['Urban Nature', 'Botanical Trail'] }, { label: 'Nature & Trails', kinds: ['nature', 'trail'] }, { label: 'Viewpoints & Beaches', kinds: ['viewpoint', 'beach'] }
  ],
  Sports: [
    { label: 'Climbing', kinds: ['climbing'] }, { label: 'Gyms', kinds: ['gym'] }, { label: 'Swimming', kinds: ['pool'] }, { label: 'Sports centres', kinds: ['sports_centre'] }
  ],
  Shopping: [
    { label: 'Books & Records', kinds: ['bookshop', 'record_shop'] }, { label: 'Clothes & Vintage', kinds: ['clothes', 'vintage_shop'] },
    { label: 'Homeware & Art', kinds: ['homeware', 'craft_shop', 'gift_shop'] }, { label: 'Markets', kinds: ['market'] }
  ],
  Trips: [{ label: 'Day Trip (Train)' }, { label: 'Future Getaway (Flight)' }]
};
const KIND_OSM = {
  cafe: ['["amenity"="cafe"]'], bakery: ['["shop"="bakery"]'], restaurant: ['["amenity"="restaurant"]'], pub: ['["amenity"="pub"]'], bar: ['["amenity"="bar"]'], dessert: ['["amenity"="ice_cream"]'],
  museum: ['["tourism"="museum"]'], gallery: ['["tourism"="gallery"]'], arts_centre: ['["amenity"="arts_centre"]'], cinema: ['["amenity"="cinema"]'], theatre: ['["amenity"="theatre"]'], library: ['["amenity"="library"]'],
  fun_venue: ['["leisure"~"^(amusement_arcade|bowling_alley|escape_game|miniature_golf)$"]'],
  park: ['["leisure"="park"]'], garden: ['["leisure"="garden"]'], nature: ['["leisure"="nature_reserve"]'], viewpoint: ['["tourism"="viewpoint"]'], beach: ['["natural"="beach"]'],
  climbing: ['["sport"="climbing"]'], gym: ['["leisure"="fitness_centre"]'], pool: ['["leisure"="swimming_pool"]'], sports_centre: ['["leisure"="sports_centre"]'],
  bookshop: ['["shop"="books"]'], record_shop: ['["shop"="records"]'], vintage_shop: ['["shop"~"^(second_hand|antiques)$"]'], clothes: ['["shop"~"^(clothes|boutique|shoes)$"]'],
  homeware: ['["shop"~"^(furniture|houseware|interior_decoration)$"]'], craft_shop: ['["shop"~"^(craft|art)$"]'], gift_shop: ['["shop"="gift"]'], market: ['["amenity"="marketplace"]']
};
const OSM_KIND_BY_LABEL = { cafe: 'cafe', bakery: 'bakery', restaurant: 'restaurant', pub: 'pub', bar: 'bar', 'ice cream': 'dessert', museum: 'museum', gallery: 'gallery', 'arts centre': 'arts_centre', cinema: 'cinema', theatre: 'theatre', library: 'library',
  park: 'park', garden: 'garden', 'nature reserve': 'nature', viewpoint: 'viewpoint', beach: 'beach', climbing: 'climbing', 'fitness centre': 'gym', 'swimming pool': 'pool', 'sports centre': 'sports_centre',
  books: 'bookshop', records: 'record_shop', 'second hand': 'vintage_shop', antiques: 'vintage_shop', clothes: 'clothes', boutique: 'clothes', shoes: 'clothes', furniture: 'homeware', houseware: 'homeware', 'interior decoration': 'homeware',
  craft: 'craft_shop', art: 'craft_shop', gift: 'gift_shop', marketplace: 'market', 'amusement arcade': 'fun_venue', 'bowling alley': 'fun_venue', 'escape game': 'fun_venue', 'miniature golf': 'fun_venue' };
const filterDefs = (cat, labels) => (IDEA_FILTERS[cat] || []).filter(f => (labels || []).includes(f.label));
const ideaMatchesFilters = (item, defs) => {
  if (!defs.length) return true;
  return defs.some(f => (item.matchLabels && item.matchLabels.includes(f.label)) || (f.kinds && item.kind && f.kinds.includes(item.kind)) || item.sub1 === f.label || (f.legacy || []).includes(item.sub1));
};
const OSM_FILTERS = {
  Food: ['["amenity"~"^(restaurant|cafe|pub|ice_cream)$"]', '["shop"="bakery"]'],
  Indoor: ['["tourism"~"^(museum|gallery)$"]', '["amenity"~"^(cinema|theatre|arts_centre|library)$"]'],
  Outdoor: ['["leisure"~"^(park|garden|nature_reserve)$"]', '["tourism"="viewpoint"]', '["natural"~"^(beach|peak)$"]'],
  Sports: ['["leisure"~"^(sports_centre|fitness_centre|swimming_pool)$"]', '["sport"="climbing"]'],
  Shopping: ['["shop"~"^(books|craft|art|second_hand|gift|antiques|records)$"]', '["amenity"="marketplace"]']
};
const placeQL = (filters, lat, lon, radius, limit) => `[out:json][timeout:20];(${filters.map(f => `nwr${f}["name"](around:${radius},${lat},${lon});`).join('')});out center ${limit};`;
const cap1 = (t) => String(t || '').replace(/_/g, ' ').replace(/^\w/, c => c.toUpperCase());
const elCoords = (el) => ({ lat: el.lat != null ? el.lat : el.center && el.center.lat, lon: el.lon != null ? el.lon : el.center && el.center.lon });
const osmKind = (t) => cap1(t.amenity || t.shop || t.leisure || t.tourism || t.natural || (t.sport ? t.sport : '') || 'Place');
const osmAddress = (t) => [t['addr:housenumber'], t['addr:street']].filter(Boolean).join(' ');
const osmDesc = (t) => [osmKind(t), t.cuisine ? t.cuisine.split(';').slice(0, 2).map(cap1).join(', ') : '', osmAddress(t), t.opening_hours ? 'Open ' + String(t.opening_hours).slice(0, 48) : ''].filter(Boolean).join(' · ');
const mapsDir = (lat, lon) => `https://www.google.com/maps/dir/?api=1&destination=${lat},${lon}`;
const coordCache = {};
const resolveCoords = async (loc) => {
  if (loc && loc.lat != null && loc.lon != null) return { lat: loc.lat, lon: loc.lon };
  const key = String(loc && loc.city).toLowerCase();
  if (coordCache[key]) return coordCache[key];
  const r = await geocodeCity(loc.city);
  if (!r.length) throw new Error('NO_COORDS');
  coordCache[key] = { lat: r[0].lat, lon: r[0].lon };
  return coordCache[key];
};
const osmAddressOf = (idea) => String(idea.desc || '').split(' · ').slice(1, 3).join(', ');
const wikiSummary = async (wikiTag) => {
  const m = String(wikiTag || '').match(/^([a-z-]+):(.+)$/);
  const lang = m ? m[1] : 'en', title = m ? m[2] : wikiTag;
  const j = await fetchJSON(`https://${lang}.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(String(title).replace(/ /g, '_'))}`, {}, 8000);
  return { text: String(j.extract || '').split(/(?<=\.)\s/)[0].slice(0, 190), url: (j.content_urls && j.content_urls.desktop && j.content_urls.desktop.page) || '' };
};
const osmIdeasLive = async ({ cat, loc, seen, n = 3, filters: fdefs = [] }) => {
  const { lat, lon } = await resolveCoords(loc);
  if (cat === 'Trips') {
    const els = await overpass(`[out:json][timeout:20];node["place"~"^(town|village|city)$"]["name"](around:60000,${lat},${lon});out 120;`);
    const cands = els.map(e => ({ e, km: haversineKm(lat, lon, e.lat, e.lon) })).filter(x => x.km >= 8 && !seen.has(String(x.e.tags.name).toLowerCase()))
      .sort((a, b) => (b.e.tags.wikipedia ? 1 : 0) - (a.e.tags.wikipedia ? 1 : 0) || a.km - b.km).slice(0, 12).sort(() => Math.random() - 0.5).slice(0, n);
    const out = [];
    for (let i = 0; i < cands.length; i++) {
      const { e, km } = cands[i]; const t = e.tags; let w = { text: '', url: '' };
      if (t.wikipedia) { try { w = await wikiSummary(t.wikipedia); } catch (err) { /* keep going */ } }
      out.push({ id: Date.now() + i, category: 'Trips', title: t.name, desc: w.text || `${cap1(t.place)} about ${fmtDist(km, loc.country)} from ${loc.city}.`, rating: null, userRating: null, price: '', city: loc.city, sub1: 'Day Trip (Train or car)', sub2: 'OpenStreetMap', deal: w.url ? 'Read more on Wikipedia' : 'Check train and bus times before you go', distance: fmtDist(km, loc.country), dest: t.name, lat: e.lat, lon: e.lon, link: w.url || '' });
    }
    return out;
  }
  let filters = OSM_FILTERS[cat] || OSM_FILTERS.Food;
  if (fdefs.length) {
    const tagged = fdefs.flatMap(f => [...(f.kinds || []).flatMap(k => KIND_OSM[k] || []), ...(f.query ? [`["cuisine"~"${f.query}",i]`, `["name"~"${f.query}",i]["amenity"~"^(restaurant|cafe|fast_food|pub|bar)$"]`] : [])]);
    if (tagged.length) filters = tagged;
  }
  let els = await overpass(placeQL(filters, lat, lon, 3000, 80));
  if (els.length < 6) els = await overpass(placeQL(filters, lat, lon, 8000, 80));
  const rich = (t) => (t.opening_hours ? 1 : 0) + (t.website || t['contact:website'] ? 1 : 0) + (t.cuisine ? 1 : 0);
  const seenLocal = new Set();
  const cands = els.map(e => ({ e, c: elCoords(e) })).filter(x => x.c.lat != null && x.e.tags && x.e.tags.name).map(x => ({ ...x, km: haversineKm(lat, lon, x.c.lat, x.c.lon) }))
    .filter(x => { const k = x.e.tags.name.toLowerCase(); if (NOT_A_PLACE.test(x.e.tags.name) || seen.has(k) || seenLocal.has(k)) return false; seenLocal.add(k); return true; })
    .sort((a, b) => rich(b.e.tags) - rich(a.e.tags) || a.km - b.km).slice(0, 14).sort(() => Math.random() - 0.5).slice(0, n);
  return cands.map(({ e, c, km }, i) => {
    const t = e.tags;
    const kind = OSM_KIND_BY_LABEL[osmKind(t).toLowerCase()] || '';
    const matchLabels = fdefs.filter(f => (f.kinds && f.kinds.includes(kind)) || f.query).map(f => f.label);
    return { kind, matchLabels, id: Date.now() + i, category: cat, title: t.name, desc: osmDesc(t), rating: null, userRating: null, price: '', city: loc.city, sub1: osmKind(t), sub2: 'OpenStreetMap', deal: t.opening_hours ? 'Open ' + String(t.opening_hours).slice(0, 40) : 'Opening hours not listed', distance: fmtDist(km, loc.country), lat: c.lat, lon: c.lon, link: t.website || t['contact:website'] || '' };
  });
};
// ---------- PACT PLACES DATABASE (Overture open data in Supabase) ----------
// Tried first for Ideas, Surprise Me and "what's near me" questions. If it is unavailable or empty,
// everything falls back to the live OpenStreetMap search above, so nothing breaks.
const placeRowToIdea = (r, cat, loc, i) => ({
  id: Date.now() + i, category: cat, title: r.name,
  desc: [cap1(r.kind), r.address].filter(Boolean).join(' · '),
  rating: r.rating_count >= 3 && r.rating_avg ? Math.round(r.rating_avg * 10) / 10 : null,   // only show a rating once Pact users have really rated it
  userRating: null, price: '', city: loc.city, sub1: cap1(r.kind), sub2: 'Overture Maps open data',
  deal: 'Opening hours not listed', distance: fmtDist(r.distance_km, loc.country), lat: r.lat, lon: r.lon, link: r.website || '', placeId: r.id, kind: r.kind
});
const dbIdeas = async ({ cat, loc, seen, n = 3, filters = [], adventurous = false }) => {
  if (!cloud.enabled || cat === 'Trips') return [];
  const { lat, lon } = await resolveCoords(loc);
  const fetchAll = async (radiusKm) => {
    if (!filters.length) return (await cloud.placesNear({ lat, lon, radiusKm, categories: [cat], limit: 80 })).map(r => ({ r, labels: [] }));
    const byId = new Map();
    for (const f of filters) {
      const rows = await cloud.placesNear({ lat, lon, radiusKm, categories: [cat], kinds: f.kinds || null, query: f.query || null, limit: 60 });
      rows.forEach(r => { const cur = byId.get(r.id); if (cur) cur.labels.push(f.label); else byId.set(r.id, { r, labels: [f.label] }); });
    }
    return [...byId.values()].sort((a, b) => (b.r.score || 0) - (a.r.score || 0));
  };
  let rows = await fetchAll(adventurous ? 12 : 4);
  if (rows.length < 8) rows = await fetchAll(15);
  const seenLocal = new Set();
  const fresh = rows.filter(({ r }) => { const k = String(r.name).toLowerCase(); if (NOT_A_PLACE.test(r.name) || seen.has(k) || seenLocal.has(k)) return false; seenLocal.add(k); return true; });
  // Adventurous: skip the obvious top-ranked spots and pick from the less-trodden middle of the list.
  const pool = adventurous ? fresh.slice(Math.floor(fresh.length * 0.3), Math.floor(fresh.length * 0.3) + 24) : fresh.slice(0, 16);
  return pool.sort(() => Math.random() - 0.5).slice(0, n).map(({ r, labels }, i) => ({ ...placeRowToIdea(r, cat, loc, i), matchLabels: labels }));
};
const osmIdeas = async (args) => {
  try { const fromDb = await dbIdeas(args); if (fromDb.length) return fromDb; } catch (e) { /* places database unavailable: use the live search */ }
  return osmIdeasLive(args);
};
// What the places database should search for, for each kind of question Roamie recognises (labels match PLACE_WORDS)
const PLACE_DB = {
  'cafes': { kinds: ['cafe'] }, 'pizza places': { query: 'pizza' }, 'vegan and vegetarian places': { query: 'vegan' },
  'pubs and bars': { kinds: ['pub', 'bar'] }, 'restaurants': { kinds: ['restaurant'] }, 'climbing spots': { kinds: ['climbing'] },
  'gyms': { kinds: ['gym'] }, 'swimming pools': { kinds: ['pool'] }, 'outdoor spots': { categories: ['Outdoor'] },
  'museums and galleries': { kinds: ['museum', 'gallery'] }, 'cinemas': { kinds: ['cinema'] }, 'theatres': { kinds: ['theatre'] },
  'bookshops': { kinds: ['bookshop'] }, 'libraries': { kinds: ['library'] }, 'shops and markets': { categories: ['Shopping'] },
  'things to do': { categories: ['Indoor', 'Outdoor'] }
};
const WMO = { 0: 'clear', 1: 'mostly clear', 2: 'partly cloudy', 3: 'overcast', 45: 'foggy', 48: 'foggy', 51: 'light drizzle', 53: 'drizzle', 55: 'heavy drizzle', 61: 'light rain', 63: 'rain', 65: 'heavy rain', 71: 'light snow', 73: 'snow', 75: 'heavy snow', 80: 'light showers', 81: 'showers', 82: 'heavy showers', 95: 'thunderstorms', 96: 'thunderstorms with hail', 99: 'thunderstorms with hail' };
const weatherText = async (loc) => {
  const { lat, lon } = await resolveCoords(loc);
  const j = await fetchJSON(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weather_code,wind_speed_10m&daily=temperature_2m_max,temperature_2m_min,precipitation_probability_max&timezone=auto&forecast_days=1`, {}, 10000);
  const c = j.current || {}, d = j.daily || {};
  return `Right now in ${loc.city}: ${Math.round(c.temperature_2m)}°C and ${WMO[c.weather_code] || 'mixed'}. Today: high ${Math.round(d.temperature_2m_max[0])}°, low ${Math.round(d.temperature_2m_min[0])}°, ${d.precipitation_probability_max[0]}% chance of rain.`;
};
const PLACE_WORDS = [
  [/coffee|caf[eé]|latte|flat white/, ['["amenity"="cafe"]'], 'cafes'],
  [/pizza/, ['["cuisine"~"pizza"]'], 'pizza places'],
  [/vegan|vegetarian/, ['["diet:vegan"~"yes|only"]', '["diet:vegetarian"~"yes|only"]'], 'vegan and vegetarian places'],
  [/pub\b|bar\b|drinks|cocktail/, ['["amenity"~"^(pub|bar)$"]'], 'pubs and bars'],
  [/restaurant|dinner|lunch|brunch|breakfast|\beat\b|food|takeaway|curry|ramen|sushi|burger/, ['["amenity"="restaurant"]'], 'restaurants'],
  [/climb|boulder/, ['["sport"="climbing"]'], 'climbing spots'],
  [/gym|fitness|workout/, ['["leisure"="fitness_centre"]'], 'gyms'],
  [/pool|swim/, ['["leisure"="swimming_pool"]'], 'swimming pools'],
  [/park|walk|hike|outdoor|garden|nature/, OSM_FILTERS.Outdoor, 'outdoor spots'],
  [/museum|gallery|exhibit|\bart\b/, OSM_FILTERS.Indoor.slice(0, 1), 'museums and galleries'],
  [/cinema|film|movie/, ['["amenity"="cinema"]'], 'cinemas'],
  [/theatre|theater|show\b/, ['["amenity"="theatre"]'], 'theatres'],
  [/book ?shop|bookstore/, ['["shop"="books"]'], 'bookshops'],
  [/librar|study spot|quiet place/, ['["amenity"="library"]'], 'libraries'],
  [/shop|market|vintage|thrift/, OSM_FILTERS.Shopping, 'shops and markets'],
  [/things to do|something to do|activity|activities|what to do/, [...OSM_FILTERS.Outdoor, ...OSM_FILTERS.Indoor], 'things to do']
];
const keylessAnswer = async (q, loc) => {
  const low = q.toLowerCase();
  if (/weather|forecast|rain|umbrella|temperature|how (cold|hot|warm)/.test(low)) {
    return { text: await weatherText(loc), sources: [{ uri: 'https://open-meteo.com/', title: 'Open-Meteo' }] };
  }
  const hit = PLACE_WORDS.find(([re]) => re.test(low));
  if (hit) {
    let here = loc, where = loc.city;
    const m = q.match(/\b(?:in|near|around)\s+([A-Z][A-Za-z'’ -]{2,30})/);
    if (m && !/^(Me|Here|Town)$/i.test(m[1].trim())) {
      try { const g = await geocodeCity(m[1].trim()); if (g.length) { here = g[0]; where = g[0].city; } } catch (e) { /* use home location */ }
    }
    const { lat, lon } = await resolveCoords(here);
    const dbq = PLACE_DB[hit[2]];
    if (dbq && cloud.enabled) {
      try {
        let rows = await cloud.placesNear({ lat, lon, radiusKm: 3, ...dbq, limit: 5 });
        if (rows.length < 3) rows = await cloud.placesNear({ lat, lon, radiusKm: 8, ...dbq, limit: 5 });
        if (rows.length >= 3) {
          return {
            text: `Here are ${hit[2]} near ${where}, best picks first:\n` + rows.map((r, i) => `${i + 1}. ${r.name} (${fmtDist(r.distance_km, here.country || loc.country)})`).join('\n') + '\nTap a source below for directions. Say "book" and a time if you want one on your plan.',
            sources: rows.slice(0, 3).map(r => ({ uri: mapsDir(r.lat, r.lon), title: 'Directions: ' + r.name }))
          };
        }
      } catch (e) { /* places database unavailable: use the live search below */ }
    }
    let els = await overpass(placeQL(hit[1], lat, lon, 2500, 60));
    if (els.length < 3) els = await overpass(placeQL(hit[1], lat, lon, 7000, 60));
    const seenN = new Set();
    const list = els.map(e => ({ e, c: elCoords(e) })).filter(x => x.c.lat != null).map(x => ({ ...x, km: haversineKm(lat, lon, x.c.lat, x.c.lon) }))
      .filter(x => { const k = x.e.tags.name.toLowerCase(); if (seenN.has(k)) return false; seenN.add(k); return true; })
      .sort((a, b) => a.km - b.km).slice(0, 5);
    if (!list.length) return { text: `I couldn't find any ${hit[2]} listed near ${where} on OpenStreetMap. Try a wider area, like a nearby town.`, sources: [] };
    return {
      text: `Here are ${hit[2]} near ${where}, closest first:\n` + list.map((x, i) => `${i + 1}. ${x.e.tags.name} (${fmtDist(x.km, here.country || loc.country)})${x.e.tags.opening_hours ? ', open ' + String(x.e.tags.opening_hours).slice(0, 40) : ''}`).join('\n') + '\nTap a source below for directions. Say "book" and a time if you want one on your plan.',
      sources: list.slice(0, 3).map(x => ({ uri: mapsDir(x.c.lat, x.c.lon), title: 'Directions: ' + x.e.tags.name }))
    };
  }
  const term = q.replace(/[?!.]+$/, '').replace(/^(who|what|where|when|why|how)\s+(is|are|was|were|does|do|did)\s+(the\s+)?/i, '').trim();
  const sr = await fetchJSON(`https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(term || q)}&srlimit=1&format=json&origin=*`, {}, 8000);
  const top = sr && sr.query && sr.query.search && sr.query.search[0];
  if (!top) throw new Error('NO_ANSWER');
  const w = await wikiSummary('en:' + top.title);
  if (!w.text) throw new Error('NO_ANSWER');
  return { text: `${w.text} (From Wikipedia: ${top.title}.)`, sources: w.url ? [{ uri: w.url, title: 'Wikipedia: ' + top.title }] : [] };
};

// ---------- ICS (calendar) parser ----------
const TZ_ALIASES = {
  'GMT Standard Time': 'Europe/London', 'W. Europe Standard Time': 'Europe/Berlin', 'Central Europe Standard Time': 'Europe/Budapest',
  'Romance Standard Time': 'Europe/Paris', 'Eastern Standard Time': 'America/New_York', 'Central Standard Time': 'America/Chicago',
  'Mountain Standard Time': 'America/Denver', 'Pacific Standard Time': 'America/Los_Angeles', 'India Standard Time': 'Asia/Kolkata',
  'AUS Eastern Standard Time': 'Australia/Sydney', 'Tokyo Standard Time': 'Asia/Tokyo', 'China Standard Time': 'Asia/Shanghai',
  'SE Asia Standard Time': 'Asia/Bangkok', 'Singapore Standard Time': 'Asia/Singapore', 'UTC': 'UTC'
};
const zonedToEpoch = (y, mo, d, h, mi, tzRaw) => {
  const tz = TZ_ALIASES[tzRaw] || tzRaw;
  try {
    const guess = Date.UTC(y, mo - 1, d, h, mi);
    const dtf = new Intl.DateTimeFormat('en-US', { timeZone: tz, hourCycle: 'h23', year: 'numeric', month: 'numeric', day: 'numeric', hour: 'numeric', minute: 'numeric', second: 'numeric' });
    const off = (ms) => { const p = {}; dtf.formatToParts(new Date(ms)).forEach(x => { p[x.type] = x.value; }); return Date.UTC(+p.year, +p.month - 1, +p.day, +p.hour, +p.minute, +p.second) - ms; };
    let t = guess - off(guess);
    t = guess - off(t);
    return t;
  } catch (e) {
    return new Date(y, mo - 1, d, h, mi).getTime();
  }
};
const splitICSLine = (line) => {
  let inQ = false, idx = -1;
  for (let i = 0; i < line.length; i++) { const c = line[i]; if (c === '"') inQ = !inQ; else if (c === ':' && !inQ) { idx = i; break; } }
  if (idx < 0) return null;
  const left = line.slice(0, idx), value = line.slice(idx + 1);
  const parts = left.split(';');
  const params = {};
  parts.slice(1).forEach(p => { const [k, ...v] = p.split('='); params[k.toUpperCase()] = v.join('=').replace(/"/g, ''); });
  return { name: parts[0].toUpperCase(), params, value };
};
const parseICSDate = (value, params) => {
  const m = /^(\d{4})(\d\d)(\d\d)(?:T(\d\d)(\d\d)(\d\d)?)?(Z)?$/.exec((value || '').trim());
  if (!m) return null;
  const allDay = params.VALUE === 'DATE' || m[4] === undefined;
  return { y: +m[1], mo: +m[2], d: +m[3], h: +(m[4] || 0), mi: +(m[5] || 0), utc: !!m[7], tzid: params.TZID || null, allDay };
};
const icsToEpoch = (dt) => dt.utc ? Date.UTC(dt.y, dt.mo - 1, dt.d, dt.h, dt.mi)
  : dt.tzid ? zonedToEpoch(dt.y, dt.mo, dt.d, dt.h, dt.mi, dt.tzid)
  : new Date(dt.y, dt.mo - 1, dt.d, dt.h, dt.mi).getTime();
const parseICSDuration = (v) => {
  const m = /^(-)?P(?:(\d+)W)?(?:(\d+)D)?(?:T(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?)?$/.exec(v || '');
  if (!m) return null;
  const ms = ((+m[2] || 0) * 7 * 86400 + (+m[3] || 0) * 86400 + (+m[4] || 0) * 3600 + (+m[5] || 0) * 60 + (+m[6] || 0)) * 1000;
  return m[1] ? -ms : ms;
};
const WD = { SU: 0, MO: 1, TU: 2, WE: 3, TH: 4, FR: 5, SA: 6 };

const parseICS = (text, winStartMs, winEndMs, sourceId = 'cal') => {
  const lines = String(text).replace(/\r?\n[ \t]/g, '').split(/\r?\n/);
  const events = [];
  let cur = null;
  lines.forEach(l => {
    if (l === 'BEGIN:VEVENT') { cur = { props: {} }; return; }
    if (l === 'END:VEVENT') { if (cur) events.push(cur); cur = null; return; }
    if (!cur) return;
    const p = splitICSLine(l);
    if (!p) return;
    if (p.name === 'EXDATE') { (cur.exdates = cur.exdates || []).push(p); return; }
    cur.props[p.name] = p;
  });

  const unesc = (s) => (s || '').replace(/\\n/gi, ' ').replace(/\\,/g, ',').replace(/\;/g, ';').replace(/\\\\/g, '\\');
  const overrides = new Set();
  events.forEach(ev => {
    const rid = ev.props['RECURRENCE-ID'];
    if (rid) { const dt = parseICSDate(rid.value, rid.params); if (dt) overrides.add((ev.props.UID?.value || '') + '|' + icsToEpoch(dt)); }
  });

  const out = [];
  const pushRange = (title, startMs, endMs, allDay, uid) => {
    if (endMs <= winStartMs || startMs >= winEndMs) return;
    if (allDay) {
      for (let t = startMs; t < endMs; t += 86400000) {
        const d = new Date(t + 43200000);
        const date = fmtDateObj(new Date(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), 12));
        out.push({ id: `${sourceId}:${uid}:${date}`, title, date, start: '00:00', end: '24:00', allDay: true });
      }
      return;
    }
    let t = startMs;
    let guard = 0;
    while (t < endMs && guard++ < 14) {
      const sd = new Date(t);
      const midnight = new Date(sd.getFullYear(), sd.getMonth(), sd.getDate() + 1).getTime();
      const segEnd = Math.min(endMs, midnight);
      const ed = new Date(segEnd);
      const endStr = segEnd === midnight ? '24:00' : `${pad2(ed.getHours())}:${pad2(ed.getMinutes())}`;
      out.push({ id: `${sourceId}:${uid}:${t}`, title, date: fmtDateObj(sd), start: `${pad2(sd.getHours())}:${pad2(sd.getMinutes())}`, end: endStr, allDay: false });
      t = segEnd;
    }
  };

  events.forEach(ev => {
    const P = ev.props;
    if (!P.DTSTART) return;
    if ((P.STATUS?.value || '').toUpperCase() === 'CANCELLED') return;
    if ((P.TRANSP?.value || '').toUpperCase() === 'TRANSPARENT') return;
    const dt = parseICSDate(P.DTSTART.value, P.DTSTART.params);
    if (!dt) return;
    const uid = (P.UID?.value || Math.random().toString(36).slice(2)).slice(0, 40);
    const title = unesc(P.SUMMARY?.value) || 'Busy';
    const startMs = icsToEpoch(dt);
    let durMs;
    const dEnd = P.DTEND ? parseICSDate(P.DTEND.value, P.DTEND.params) : null;
    if (dEnd) durMs = icsToEpoch(dEnd) - startMs;
    else if (P.DURATION) durMs = parseICSDuration(P.DURATION.value) ?? 3600000;
    else durMs = dt.allDay ? 86400000 : 0;
    if (durMs <= 0) durMs = dt.allDay ? 86400000 : 30 * 60000;

    const rr = P.RRULE ? Object.fromEntries(P.RRULE.value.split(';').map(x => x.split('='))) : null;
    if (!rr) { pushRange(title, startMs, startMs + durMs, dt.allDay, uid); return; }

    const ex = new Set();
    (ev.exdates || []).forEach(p => p.value.split(',').forEach(v => { const e = parseICSDate(v, p.params); if (e) ex.add(dt.allDay ? `${e.y}-${e.mo}-${e.d}` : icsToEpoch(e)); }));
    const until = rr.UNTIL ? (() => { const u = parseICSDate(rr.UNTIL, {}); return u ? (u.allDay ? Date.UTC(u.y, u.mo - 1, u.d, 23, 59) : icsToEpoch(u)) : Infinity; })() : Infinity;
    const countMax = rr.COUNT ? +rr.COUNT : Infinity;
    const interval = Math.max(1, +rr.INTERVAL || 1);
    const byday = rr.BYDAY ? rr.BYDAY.split(',') : null;
    const bymonthday = rr.BYMONTHDAY ? rr.BYMONTHDAY.split(',').map(Number) : null;
    const bymonth = rr.BYMONTH ? rr.BYMONTH.split(',').map(Number) : null;
    let n = 0;
    const emit = (y, mo, d) => {
      const occ = { ...dt, y, mo, d };
      const ms = icsToEpoch(occ);
      if (ms < startMs) return true;
      if (ms > until) return false;
      n++;
      if (n > countMax) return false;
      const skip = ex.has(dt.allDay ? `${y}-${mo}-${d}` : ms) || overrides.has(uid + '|' + ms);
      if (!skip) pushRange(title, ms, ms + durMs, dt.allDay, uid);
      return ms < winEndMs;
    };
    const base = new Date(Date.UTC(dt.y, dt.mo - 1, dt.d));
    let guard = 0;
    if (rr.FREQ === 'DAILY') {
      for (let i = 0; guard++ < 800; i += interval) {
        const d = new Date(base.getTime() + i * 86400000);
        if (bymonth && !bymonth.includes(d.getUTCMonth() + 1)) continue;
        if (!emit(d.getUTCFullYear(), d.getUTCMonth() + 1, d.getUTCDate())) break;
      }
    } else if (rr.FREQ === 'WEEKLY') {
      const days = (byday || ['SU', 'MO', 'TU', 'WE', 'TH', 'FR', 'SA'].filter((_, i) => i === base.getUTCDay())).map(x => WD[x.slice(-2)]).filter(x => x !== undefined);
      const weekStart = new Date(base.getTime() - ((base.getUTCDay() + 6) % 7) * 86400000);
      outer: for (let w = 0; guard++ < 400; w += interval) {
        const ordered = days.slice().sort((a, b) => ((a + 6) % 7) - ((b + 6) % 7));
        for (const wd of ordered) {
          const d = new Date(weekStart.getTime() + (w * 7 + ((wd + 6) % 7)) * 86400000);
          if (!emit(d.getUTCFullYear(), d.getUTCMonth() + 1, d.getUTCDate())) break outer;
        }
      }
    } else if (rr.FREQ === 'MONTHLY') {
      for (let m = 0; guard++ < 120; m += interval) {
        const first = new Date(Date.UTC(dt.y, dt.mo - 1 + m, 1));
        const y = first.getUTCFullYear(), mo = first.getUTCMonth() + 1;
        const dim = new Date(Date.UTC(y, mo, 0)).getUTCDate();
        let dates = [];
        if (byday) {
          byday.forEach(tok => {
            const mm = /^(-?\d)?([A-Z]{2})$/.exec(tok); if (!mm) return;
            const wd = WD[mm[2]]; const ord = mm[1] ? +mm[1] : 0;
            const all = []; for (let d = 1; d <= dim; d++) if (new Date(Date.UTC(y, mo - 1, d)).getUTCDay() === wd) all.push(d);
            if (ord > 0 && all[ord - 1]) dates.push(all[ord - 1]); else if (ord < 0 && all[all.length + ord]) dates.push(all[all.length + ord]); else if (!ord) dates.push(...all);
          });
        } else dates = (bymonthday || [dt.d]).map(d => d < 0 ? dim + d + 1 : d).filter(d => d <= dim);
        dates.sort((a, b) => a - b);
        let stop = false;
        for (const d of dates) { if (!emit(y, mo, d)) { stop = true; break; } }
        if (stop) break;
      }
    } else if (rr.FREQ === 'YEARLY') {
      for (let y = 0; guard++ < 40; y += interval) { if (!emit(dt.y + y, dt.mo, dt.d)) break; }
    } else {
      pushRange(title, startMs, startMs + durMs, dt.allDay, uid);
    }
  });
  const seen = new Set();
  return out.filter(e => (seen.has(e.id) ? false : (seen.add(e.id), true))).sort((a, b) => (a.date + a.start).localeCompare(b.date + b.start));
};

const CONTOUR = [[[{"v": "M375,150C374,159 378,166 375,173C372,180 364,190 355,193C347,196 334,196 325,193C316,191 305,184 300,177C296,169 296,158 297,150C298,142 302,134 307,128C312,122 319,118 327,113C335,109 348,100 357,101C366,103 379,114 382,122C385,130 376,141 375,150Z;M378,150C380,159 388,172 384,179C380,187 366,195 356,196C347,198 335,192 327,187C319,183 315,176 310,170C304,164 295,158 293,150C291,142 292,128 298,122C303,115 316,112 326,110C335,107 347,104 355,107C363,110 369,121 373,128C376,135 376,141 378,150Z;M387,150C388,158 386,170 381,177C376,184 364,190 355,192C346,194 333,194 326,190C319,186 316,176 311,169C306,163 298,159 294,150C291,141 287,125 292,118C298,112 316,111 326,111C336,110 344,113 352,115C360,118 369,121 375,127C381,133 386,142 387,150Z;M375,150C374,159 378,166 375,173C372,180 364,190 355,193C347,196 334,196 325,193C316,191 305,184 300,177C296,169 296,158 297,150C298,142 302,134 307,128C312,122 319,118 327,113C335,109 348,100 357,101C366,103 379,114 382,122C385,130 376,141 375,150Z", "dur": 16}, {"v": "M422,150C423,166 423,186 415,200C406,214 388,228 370,236C352,243 326,248 307,243C288,238 268,220 258,205C248,189 244,166 247,150C251,134 268,123 279,109C289,95 293,75 310,64C326,53 361,36 378,42C395,48 406,83 413,101C421,119 422,134 422,150Z;M446,150C442,167 418,181 404,193C391,205 381,214 365,222C349,230 328,243 308,241C288,240 255,228 245,213C236,198 247,168 251,150C256,132 262,119 272,104C282,90 294,71 310,66C326,60 348,67 368,71C388,75 417,77 430,90C443,103 450,133 446,150Z;M435,150C434,166 421,184 410,197C399,210 385,220 367,227C350,235 326,246 307,243C288,240 261,225 251,210C241,194 241,166 246,150C252,134 272,126 283,112C293,97 294,73 309,63C325,52 358,43 376,49C393,55 406,83 416,99C425,116 436,134 435,150Z;M422,150C423,166 423,186 415,200C406,214 388,228 370,236C352,243 326,248 307,243C288,238 268,220 258,205C248,189 244,166 247,150C251,134 268,123 279,109C289,95 293,75 310,64C326,53 361,36 378,42C395,48 406,83 413,101C421,119 422,134 422,150Z", "dur": 19}, {"v": "M494,150C496,179 495,223 476,241C457,259 406,255 378,257C349,259 333,255 304,253C274,250 224,259 202,242C180,225 169,178 173,150C177,122 203,91 225,73C246,55 275,49 301,41C328,33 357,22 384,26C411,31 446,47 464,67C482,88 492,121 494,150Z;M497,150C502,177 495,220 476,241C458,262 413,273 384,275C355,277 329,262 304,253C278,244 257,239 232,222C208,205 160,176 157,150C155,124 192,85 216,67C240,48 273,46 301,39C329,32 360,19 384,25C409,32 429,57 448,78C467,99 493,123 497,150Z;M481,150C480,175 467,205 450,224C433,242 407,249 380,262C352,276 314,308 285,305C257,301 218,265 207,239C196,213 213,176 218,150C223,124 227,105 239,83C252,60 267,29 292,15C318,1 366,-11 393,-1C420,9 439,49 454,74C469,99 481,125 481,150Z;M494,150C496,179 495,223 476,241C457,259 406,255 378,257C349,259 333,255 304,253C274,250 224,259 202,242C180,225 169,178 173,150C177,122 203,91 225,73C246,55 275,49 301,41C328,33 357,22 384,26C411,31 446,47 464,67C482,88 492,121 494,150Z", "dur": 22}, {"v": "M541,150C548,182 525,228 503,259C480,289 443,320 405,333C366,347 307,355 273,340C239,325 219,274 202,242C185,211 177,184 173,150C168,116 160,75 176,40C191,5 228,-52 265,-62C303,-72 367,-42 400,-21C433,1 439,40 463,68C486,96 535,118 541,150Z;M529,150C540,184 545,241 525,274C505,307 449,343 409,346C370,349 323,312 289,294C255,277 231,265 204,241C176,217 129,183 125,150C121,117 155,75 180,43C204,11 236,-29 273,-41C310,-52 370,-43 402,-25C434,-7 443,38 464,67C485,96 519,116 529,150Z;M516,150C518,186 528,230 510,264C493,298 450,346 412,354C374,362 316,331 283,312C249,292 233,263 212,236C190,209 167,186 156,150C145,114 125,50 145,20C166,-10 235,-27 276,-31C317,-34 356,-13 393,-0C430,12 476,20 497,45C517,70 514,114 516,150Z;M541,150C548,182 525,228 503,259C480,289 443,320 405,333C366,347 307,355 273,340C239,325 219,274 202,242C185,211 177,184 173,150C168,116 160,75 176,40C191,5 228,-52 265,-62C303,-72 367,-42 400,-21C433,1 439,40 463,68C486,96 535,118 541,150Z", "dur": 25}], "16 -12", 14], [[{"v": "M79,720C80,729 81,744 75,750C69,756 52,756 43,756C33,756 28,752 19,750C10,749 -5,753 -12,748C-19,743 -23,729 -22,720C-21,711 -14,701 -8,695C-2,688 8,684 17,682C25,681 35,681 43,684C51,686 61,689 67,696C73,702 78,711 79,720Z;M74,720C77,728 78,741 73,749C69,757 56,765 46,766C37,767 26,758 18,754C10,750 4,747 -2,742C-9,736 -19,728 -19,720C-20,712 -13,703 -7,695C-2,688 5,677 14,674C22,671 37,674 45,679C52,683 54,694 59,701C64,708 72,712 74,720Z;M87,720C86,728 73,739 65,744C58,749 49,747 41,750C32,753 24,762 15,762C6,762 -7,755 -13,748C-18,741 -21,729 -20,720C-18,711 -10,704 -4,697C2,691 9,686 17,683C25,680 35,679 44,681C52,683 60,688 68,695C75,701 87,712 87,720Z;M79,720C80,729 81,744 75,750C69,756 52,756 43,756C33,756 28,752 19,750C10,749 -5,753 -12,748C-19,743 -23,729 -22,720C-21,711 -14,701 -8,695C-2,688 8,684 17,682C25,681 35,681 43,684C51,686 61,689 67,696C73,702 78,711 79,720Z", "dur": 18}, {"v": "M137,720C139,738 128,763 115,777C102,791 79,802 60,805C41,808 20,802 3,796C-14,790 -32,781 -43,769C-53,756 -57,739 -61,720C-64,701 -73,673 -63,658C-54,642 -22,626 -3,626C16,627 34,651 52,658C70,666 89,661 103,671C117,682 135,702 137,720Z;M123,720C125,737 123,759 114,776C105,793 84,819 66,822C48,824 21,802 5,792C-11,782 -17,772 -30,760C-44,748 -74,736 -78,720C-82,704 -69,677 -56,663C-43,648 -20,637 -1,633C18,629 41,634 58,641C75,648 89,660 100,673C111,686 120,703 123,720Z;M132,720C131,738 121,760 109,773C97,786 75,797 58,800C41,802 26,790 7,786C-13,783 -42,790 -58,779C-74,768 -91,738 -88,720C-85,702 -55,686 -40,673C-24,661 -12,654 5,648C21,642 40,637 59,639C77,642 104,649 116,662C128,676 133,702 132,720Z;M137,720C139,738 128,763 115,777C102,791 79,802 60,805C41,808 20,802 3,796C-14,790 -32,781 -43,769C-53,756 -57,739 -61,720C-64,701 -73,673 -63,658C-54,642 -22,626 -3,626C16,627 34,651 52,658C70,666 89,661 103,671C117,682 135,702 137,720Z", "dur": 21}, {"v": "M191,720C185,748 160,774 140,793C120,812 96,826 70,834C45,843 15,847 -13,842C-41,837 -77,824 -96,804C-115,784 -127,749 -127,720C-128,691 -121,650 -100,633C-80,616 -34,620 -6,617C22,614 37,612 68,613C98,614 155,605 175,623C196,641 197,692 191,720Z;M183,720C192,747 197,799 179,820C161,840 104,840 73,842C42,844 17,838 -9,830C-34,822 -60,812 -80,793C-99,775 -124,746 -127,720C-130,694 -116,656 -98,634C-80,612 -46,594 -17,588C12,581 52,582 75,594C97,606 103,638 121,659C139,680 173,693 183,720Z;M144,720C147,746 165,779 154,803C143,826 109,852 80,861C51,871 8,869 -19,858C-46,847 -67,818 -82,795C-96,772 -107,744 -106,720C-105,696 -92,671 -77,648C-62,626 -44,601 -17,587C10,572 61,549 87,559C112,569 126,622 136,649C145,676 141,694 144,720Z;M191,720C185,748 160,774 140,793C120,812 96,826 70,834C45,843 15,847 -13,842C-41,837 -77,824 -96,804C-115,784 -127,749 -127,720C-128,691 -121,650 -100,633C-80,616 -34,620 -6,617C22,614 37,612 68,613C98,614 155,605 175,623C196,641 197,692 191,720Z", "dur": 24}, {"v": "M206,720C203,754 191,783 173,816C156,849 135,901 100,918C65,934 -3,932 -39,915C-75,899 -104,851 -118,819C-131,786 -116,755 -120,720C-123,685 -151,642 -138,608C-125,574 -80,524 -42,516C-5,507 50,539 88,556C127,572 169,586 189,614C209,641 209,686 206,720Z;M242,720C254,754 245,818 219,847C194,875 132,887 91,892C50,897 9,889 -25,876C-59,863 -88,842 -113,816C-137,790 -168,754 -171,720C-175,686 -158,642 -136,609C-114,576 -77,533 -39,523C-2,514 58,534 89,554C119,574 119,616 144,644C170,671 229,686 242,720Z;M225,720C233,755 237,815 215,844C193,873 132,887 92,894C51,902 5,902 -30,889C-65,877 -103,848 -120,820C-137,792 -126,757 -131,720C-137,683 -169,631 -154,597C-140,563 -82,521 -42,516C-2,512 50,549 84,568C118,588 139,606 162,632C186,657 216,685 225,720Z;M206,720C203,754 191,783 173,816C156,849 135,901 100,918C65,934 -3,932 -39,915C-75,899 -104,851 -118,819C-131,786 -116,755 -120,720C-123,685 -151,642 -138,608C-125,574 -80,524 -42,516C-5,507 50,539 88,556C127,572 169,586 189,614C209,641 209,686 206,720Z", "dur": 27}], "-14 10", 17], [[{"v": "M243,430C246,438 247,451 243,459C238,466 226,475 216,476C207,477 196,470 187,466C179,462 172,458 166,452C161,447 154,438 154,430C153,422 159,414 164,406C169,398 175,385 183,382C191,379 207,384 215,388C222,393 224,404 228,411C233,418 241,422 243,430Z;M249,430C246,439 240,447 234,453C228,459 221,463 213,466C205,469 195,471 186,470C177,468 166,463 160,457C154,450 150,439 150,430C150,421 154,408 160,403C167,398 180,401 189,399C198,398 203,393 213,393C222,393 241,393 246,399C252,405 251,421 249,430Z;M244,430C245,439 250,453 245,460C240,467 224,472 215,472C205,472 197,465 189,461C181,458 173,458 166,453C159,448 149,439 148,430C146,421 150,407 157,401C163,395 178,396 187,394C197,393 205,391 213,393C221,395 231,399 236,406C241,412 243,421 244,430Z;M243,430C246,438 247,451 243,459C238,466 226,475 216,476C207,477 196,470 187,466C179,462 172,458 166,452C161,447 154,438 154,430C153,422 159,414 164,406C169,398 175,385 183,382C191,379 207,384 215,388C222,393 224,404 228,411C233,418 241,422 243,430Z", "dur": 20}, {"v": "M285,430C290,447 300,476 291,491C282,505 251,512 231,517C210,521 186,524 169,518C152,511 135,494 126,479C118,465 120,447 119,430C118,413 113,393 121,377C129,361 147,339 165,332C184,325 217,327 233,337C249,346 251,374 260,390C269,406 280,413 285,430Z;M308,430C309,448 297,472 284,486C271,500 248,511 230,514C211,517 190,512 173,506C156,500 139,491 128,478C117,466 110,449 107,430C103,411 95,382 105,367C116,352 149,340 168,340C188,341 204,363 221,369C239,376 261,369 276,379C290,389 307,412 308,430Z;M294,430C297,447 294,471 284,486C273,501 251,512 231,519C212,525 183,531 167,523C151,515 144,488 136,473C128,457 126,448 121,430C116,412 98,383 106,367C113,351 146,338 167,336C187,333 211,344 228,352C244,360 256,372 267,385C278,398 291,413 294,430Z;M285,430C290,447 300,476 291,491C282,505 251,512 231,517C210,521 186,524 169,518C152,511 135,494 126,479C118,465 120,447 119,430C118,413 113,393 121,377C129,361 147,339 165,332C184,325 217,327 233,337C249,346 251,374 260,390C269,406 280,413 285,430Z", "dur": 23}, {"v": "M359,430C352,454 307,469 288,489C268,509 266,534 242,549C219,565 174,589 146,583C117,578 84,542 71,516C58,491 61,456 66,430C70,404 84,384 98,362C113,340 129,309 154,298C178,288 217,292 246,299C276,306 312,321 331,343C349,365 366,406 359,430Z;M378,430C384,456 359,503 336,521C313,539 267,533 238,536C208,540 187,547 160,542C134,538 101,529 80,510C59,492 35,457 35,430C34,403 59,370 79,349C99,328 128,309 155,303C182,297 217,304 241,314C265,324 276,344 299,364C322,383 372,404 378,430Z;M332,430C333,454 329,485 315,507C300,528 273,549 246,560C218,571 177,582 149,574C121,566 90,537 77,513C63,489 63,454 68,430C73,406 92,391 106,367C119,343 125,303 150,287C175,271 230,260 256,272C282,284 291,334 303,361C316,387 330,406 332,430Z;M359,430C352,454 307,469 288,489C268,509 266,534 242,549C219,565 174,589 146,583C117,578 84,542 71,516C58,491 61,456 66,430C70,404 84,384 98,362C113,340 129,309 154,298C178,288 217,292 246,299C276,306 312,321 331,343C349,365 366,406 359,430Z", "dur": 26}], "10 14", 20]];

function PactSeal({ size = 30 }) {
  return (
    <svg width={size} height={size} viewBox="190 150 640 700" role="img" aria-label="The Pact" className="shrink-0">
      <g transform="translate(-8 60)"><rect x="330" y="193" width="92" height="531" fill="#F4EFE4"/><rect x="248" y="700" width="256" height="26" fill="#F4EFE4"/><polygon points="775.0,400.0 757.5,431.3 764.5,466.4 738.2,490.8 733.9,526.4 701.4,541.4 686.4,573.9 650.8,578.2 626.4,604.5 591.3,597.5 560.0,615.0 528.7,597.5 493.6,604.5 469.2,578.2 433.6,573.9 418.6,541.4 386.1,526.4 381.8,490.8 355.5,466.4 362.5,431.3 345.0,400.0 362.5,368.7 355.5,333.6 381.8,309.2 386.1,273.6 418.6,258.6 433.6,226.1 469.2,221.8 493.6,195.5 528.7,202.5 560.0,185.0 591.3,202.5 626.4,195.5 650.8,221.8 686.4,226.1 701.4,258.6 733.9,273.6 738.2,309.2 764.5,333.6 757.5,368.7" fill="#C8643C"/><circle cx="560" cy="400" r="169.85" fill="none" stroke="#F4EFE4" strokeWidth="9.0"/><circle cx="560" cy="400" r="154.79999999999998" fill="none" stroke="#F4EFE4" strokeWidth="2.5"/><g transform="rotate(35 560 400)"><path d="M560 281.75L587.95 400L560 518.25L532.05 400Z" fill="#F4EFE4"/><path d="M560 281.75L587.95 400L532.05 400Z" fill="#1F3A2E"/></g><circle cx="560" cy="400" r="10.75" fill="#C8643C" stroke="#F4EFE4" strokeWidth="4"/></g>
    </svg>
  );
}

// Ledger background: a different slow, decorative motion for each tab (all CSS, transform/opacity only, switched off by "reduce motion").
function LedgerBg({ tab }) {
  const F = '#1F3A2E', C = '#C8643C';
  if (tab === 'schedule') return (
    <div key="schedule" className="lg-bg" aria-hidden="true" data-lg="schedule">
      <div className="lg-hours" />
      <div className="lg-sweep" />
      <div className="lg-blob lg-clay lg-d1" style={{ width: 280, height: 280, left: -100, bottom: 80 }} />
      <svg width="240" height="240" viewBox="0 0 100 100" style={{ right: -60, top: 60, opacity: 0.09 }}>
        <circle cx="50" cy="50" r="46" fill="none" stroke={F} strokeWidth=".8" />
        {Array.from({ length: 12 }).map((_, i) => <line key={i} x1="50" y1="6" x2="50" y2={i % 3 === 0 ? 14 : 10} stroke={F} strokeWidth={i % 3 === 0 ? 1.2 : 0.7} transform={`rotate(${i * 30} 50 50)`} />)}
        <g className="lg-hand"><line x1="50" y1="50" x2="50" y2="14" stroke={C} strokeWidth="1.2" strokeLinecap="round" /></g>
        <circle cx="50" cy="50" r="2" fill={F} />
      </svg>
    </div>
  );
  if (tab === 'ideas') return (
    <div key="ideas" className="lg-bg" aria-hidden="true" data-lg="ideas">
      <svg viewBox="0 0 390 844" preserveAspectRatio="xMidYMid slice" style={{ inset: 0, width: '100%', height: '100%' }} fill="none" strokeLinecap="round">
        <path className="lg-dash" d="M-20 700 C 80 600, 120 760, 200 620 S 330 480, 420 540" stroke={C} strokeOpacity=".35" strokeWidth="1.6" />
        <path className="lg-dash" style={{ animationDirection: 'reverse' }} d="M-20 230 C 90 160, 150 310, 260 215 S 360 120, 420 165" stroke={F} strokeOpacity=".2" strokeWidth="1.4" />
      </svg>
      {[['22%', '74%', '0s'], ['52%', '71%', '1.1s'], ['82%', '62%', '2.2s'], ['30%', '27%', '.6s'], ['68%', '25%', '1.7s']].map(([l, t, d], i) => <span key={i} className="lg-pin" style={{ left: l, top: t, animationDelay: d }} />)}
      <svg className="lg-spin-slow" width="230" height="230" viewBox="0 0 100 100" style={{ left: -70, bottom: 70, opacity: 0.07 }}>
        <circle cx="50" cy="50" r="46" fill="none" stroke={F} strokeWidth=".8" /><circle cx="50" cy="50" r="38" fill="none" stroke={F} strokeWidth=".4" strokeDasharray="1.5 2" />
        <path d="M50 8 L56 50 L50 92 L44 50 Z" fill={F} /><path d="M8 50 L50 44 L92 50 L50 56 Z" fill="none" stroke={F} strokeWidth=".8" />
      </svg>
    </div>
  );
  if (tab === 'skills') return (
    <div key="skills" className="lg-bg" aria-hidden="true" data-lg="skills">
      {[[8, 7, 0], [20, 5, 9], [33, 6, 4], [47, 5, 15], [58, 7, 2], [70, 5, 11], [82, 6, 6], [92, 5, 18], [26, 5, 21], [64, 6, 13]].map(([l, sz, d], i) => <span key={i} className="lg-mote" style={{ left: l + '%', width: sz, height: sz, background: i % 3 === 0 ? C : F, animationDelay: '-' + d + 's', animationDuration: (22 + (i % 4) * 4) + 's' }} />)}
    </div>
  );
  if (tab === 'social') return (
    <div key="social" className="lg-bg" aria-hidden="true" data-lg="social">
      <div className="lg-blob lg-clay lg-d1" style={{ width: 280, height: 280, left: -90, top: -40 }} />
      <div className="lg-ringline lg-l1" style={{ width: 230, height: 230, left: -50, top: 130 }} />
      <div className="lg-ringline c lg-l2" style={{ width: 230, height: 230, left: 90, top: 190 }} />
      <div className="lg-ringline lg-l3" style={{ width: 200, height: 200, right: -40, top: 340 }} />
      {[['12%', '0s'], ['34%', '3.5s'], ['58%', '7s'], ['76%', '10s'], ['90%', '5s']].map(([l, d], i) => <span key={i} className="lg-mote" style={{ left: l, bottom: -10, animationDelay: d }} />)}
    </div>
  );
  return (
    <div key="home" className="lg-bg" aria-hidden="true" data-lg="home">
      <div className="lg-rules" />
      <div className="lg-blob lg-clay lg-d1" style={{ width: 300, height: 300, left: -90, top: -70 }} />
      <div className="lg-blob lg-forest lg-d2" style={{ width: 340, height: 340, right: -130, bottom: 120 }} />
    </div>
  );
}

function ContourBg() {
  const reduce = typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  return (
    <svg aria-hidden="true" className="absolute inset-0 w-full h-full pointer-events-none z-0" viewBox="0 0 390 844" preserveAspectRatio="xMidYMid slice" fill="none" stroke="#D3CEC0" strokeWidth="1.2">
      {CONTOUR.map(([paths, drift, gdur], gi) => (
        <g key={gi}>
          {!reduce && <animateTransform attributeName="transform" type="translate" values={`0 0;${drift};0 0`} dur={`${gdur}s`} repeatCount="indefinite" />}
          {paths.map((p, pi) => (
            <path key={pi} d={p.v.split(';')[0]}>
              {!reduce && <animate attributeName="d" values={p.v} dur={`${p.dur}s`} repeatCount="indefinite" />}
            </path>
          ))}
        </g>
      ))}
    </svg>
  );
}


// Plain-English privacy notice. Edit the contact line by setting window.PACT_CONTACT in public/config.js (for example 'privacy@yourdomain.com').
// ---- contacts import helpers ----
const decodeQP = (v) => { try { return decodeURIComponent(String(v).replace(/=\r?\n/g, '').replace(/=([0-9A-F]{2})/gi, '%$1')); } catch (e) { return String(v); } };
const parseVcf = (txt) => {
  const out = [];
  String(txt || '').replace(/^\uFEFF/, '').split(/BEGIN:VCARD/i).slice(1).forEach(card => {
    const unfolded = card.replace(/\r?\n[ \t]/g, '').replace(/=\r?\n/g, '');
    let name = '', n2 = '', phone = '', email = '';
    unfolded.split(/\r?\n/).forEach(l => {
      const m = l.match(/^(?:[A-Za-z0-9-]+\.)?([A-Za-z-]+)((?:;[^:]*)?):(.*)$/);
      if (!m) return;
      const k = m[1].toUpperCase(); let v = m[3].trim();
      if (/QUOTED-PRINTABLE/i.test(m[2])) v = decodeQP(v);
      if (k === 'FN' && !name) name = v;
      else if (k === 'N' && !n2) n2 = v.split(';').map(x => x.trim()).filter(Boolean).reverse().join(' ').trim();
      else if (k === 'TEL' && !phone) phone = v.replace(/^tel:/i, '');
      else if (k === 'EMAIL' && !email) email = v;
    });
    name = name || n2;
    if (name) out.push({ name, phone, email });
  });
  return out;
};
const splitCsvLine = (line, sep = ',') => {
  const r = []; let cur = '', q = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (q) { if (c === '"' && line[i + 1] === '"') { cur += '"'; i++; } else if (c === '"') q = false; else cur += c; }
    else if (c === '"') q = true; else if (c === sep) { r.push(cur); cur = ''; } else cur += c;
  }
  r.push(cur); return r.map(x => x.trim());
};
const parseCsvContacts = (txt) => {
  const lines = String(txt || '').replace(/^\uFEFF/, '').split(/\r?\n/).filter(l => l.trim());
  if (lines.length < 2) return [];
  const sep = (lines[0].match(/;/g) || []).length > (lines[0].match(/,/g) || []).length ? ';' : ',';
  const head = splitCsvLine(lines[0], sep).map(h => h.toLowerCase());
  const find = (re, prefer) => { const all = head.map((h, i) => [h, i]).filter(([h]) => re.test(h) && !/prefix|suffix|type|label/.test(h)); const pv = all.find(([h]) => prefer && prefer.test(h)); return (pv || all[0] || [null, -1])[1]; };
  const iName = head.findIndex(h => /^(name|full name|display name)$/.test(h)), iFirst = find(/first|given/), iLast = find(/last|family|surname/), iPhone = find(/phone|mobile|tel|cell/, /value|mobile|cell/), iMail = find(/e-?mail/, /value/);
  return lines.slice(1).map(l => {
    const c = splitCsvLine(l, sep);
    const name = (iName >= 0 && c[iName] ? c[iName] : [iFirst >= 0 ? c[iFirst] : '', iLast >= 0 ? c[iLast] : ''].filter(Boolean).join(' ')) || '';
    return { name: name.trim(), phone: iPhone >= 0 ? (c[iPhone] || '') : '', email: iMail >= 0 ? (c[iMail] || '') : '' };
  }).filter(x => x.name);
};
// Free text: one person per line, "Name, phone, email" in any order
const parseLooseContacts = (txt) => String(txt || '').split(/\r?\n/).map(l => l.trim()).filter(Boolean).map(l => {
  const parts = l.split(/[,;\t]| - /).map(x => x.trim()).filter(Boolean);
  let name = '', phone = '', email = '';
  parts.forEach(x => { if (/@/.test(x) && /\./.test(x)) email = email || x; else if (/^[+()\d][\d\s()+-]{5,}$/.test(x)) phone = phone || x; else name = name || x; });
  return { name, phone, email };
}).map(x => { const m = x.name.match(/^(.*?)\s+([+(]?\d[\d\s()+-]{5,})$/); return m && !x.phone ? { ...x, name: m[1].trim(), phone: m[2].trim() } : x; }).filter(x => x.name && /\p{L}/u.test(x.name) && !/[\u0000-\u0008\u000E-\u001F]/.test(x.name));
const waDigits = (phone) => { let d = String(phone || '').replace(/[^\d+]/g, ''); if (d.startsWith('+')) d = d.slice(1); else if (d.startsWith('00')) d = d.slice(2); else if (d.startsWith('0')) d = '44' + d.slice(1); return d; };
// Square crop, as sharp as the limit allows. Prefers WebP (about 30% smaller at the same sharpness; falls back to JPEG where the browser cannot make it).
// Goes for the biggest size that still keeps good quality, and only then lets the quality drop.
const shrinkImage = (file, size = 720, maxLen = 190000) => new Promise((resolve, reject) => {
  const fr = new FileReader();
  fr.onerror = () => reject(new Error('read failed'));
  fr.onload = () => {
    const img = new Image();
    img.onerror = () => reject(new Error('not an image'));
    img.onload = () => {
      const m = Math.min(img.width, img.height);
      const sizes = [size, 640, 560, 480, 420, 360, 300, 240, 180].filter((v, k, arr) => v <= size && arr.indexOf(v) === k);
      const mk = (px) => { const side = Math.min(px, m); const c = document.createElement('canvas'); c.width = side; c.height = side; const g = c.getContext('2d'); g.imageSmoothingEnabled = true; g.imageSmoothingQuality = 'high'; g.drawImage(img, (img.width - m) / 2, (img.height - m) / 2, m, m, 0, 0, side, side); return c; };
      const enc = (c, q) => { let o = c.toDataURL('image/webp', q); if (!o.startsWith('data:image/webp')) o = c.toDataURL('image/jpeg', q); return o; };
      let out = '';
      for (const q of [[0.9, 0.84, 0.78], [0.72, 0.64, 0.56]]) {
        for (const px of sizes) { const c = mk(px); for (const qq of q) { out = enc(c, qq); if (out.length <= maxLen) { resolve(out); return; } } }
      }
      resolve(out);
    };
    img.src = String(fr.result);
  };
  fr.readAsDataURL(file);
});
const RoamieBell = ({ size = 28, color = '#1B2A22', accent = '#C8643C' }) => (
  <svg width={size} height={size} viewBox="0 0 48 48" aria-hidden="true" style={{ flex: 'none' }}>
    <path d="M9 33C9 20 15 14 24 14s15 6 15 19z" fill="none" stroke={color} strokeWidth="1.7" strokeLinejoin="round" />
    <path d="M5 37h38" stroke={color} strokeWidth="1.7" strokeLinecap="round" />
    <path d="M8 33h32" stroke={color} strokeWidth="1.2" />
    <circle cx="24" cy="10.5" r="2.6" fill={accent} />
    <path d="M24 13v1.5" stroke={color} strokeWidth="1.5" />
    <path d="M13 22c1.5-3 3.5-5 6-6" stroke={color} strokeWidth="1" strokeLinecap="round" opacity=".6" />
    <path d="M40 8l2-2M44 14h2M8 8L6 6M4 14H2" stroke={accent} strokeWidth="1.3" strokeLinecap="round" />
  </svg>
);
const Avatar = ({ src, name, size = 36 }) => (
  src ? <img src={src} alt="" style={{ width: size, height: size }} className="rounded-full object-cover shrink-0 border border-stone-300" />
      : <div style={{ width: size, height: size, fontSize: size * 0.42 }} className="rounded-full bg-purple-800 text-white flex items-center justify-center shrink-0 font-medium">{(String(name || '?').trim()[0] || '?').toUpperCase()}</div>
);

const MUG_TONES = [['#4F7A63', '#1F3A2E'], ['#5F8C73', '#2C4A3B'], ['#3F6B55', '#12251C'], ['#8FB09D', '#3F6B55']];
// Square, halftone-printed portrait (newspaper style). Shows the person's photo if they have one, else their initial.
const Mug = ({ src, name, w = 88, h = 88, dot = false, tone = 0 }) => {
  const [c1, c2] = MUG_TONES[Math.abs(tone) % 4];
  return (
    <div data-mug className="relative shrink-0 flex items-center justify-center overflow-hidden" style={{ width: w, height: h === 'sq' ? undefined : h, aspectRatio: h === 'sq' ? '1 / 1' : undefined, background: src ? '#1F3A2E' : `linear-gradient(135deg,${c1},${c2})` }}>
      {src ? <img src={src} alt="" className="absolute inset-0 w-full h-full object-cover" /> : <span className="font-editorial text-[#F4EFE4]" style={{ fontSize: typeof w === 'number' && typeof h === 'number' ? Math.round(Math.min(w, h) * 0.42) : 34, lineHeight: 1 }}>{(String(name || '?').trim()[0] || '?').toUpperCase()}</span>}
      <span className="np-halftone absolute inset-0 pointer-events-none" style={src ? { opacity: 0.45 } : undefined} />
      {dot && <span className="absolute right-1.5 top-1.5 w-2.5 h-2.5 rounded-full bg-rose-700 border-[1.5px] border-[#F4EFE4]" />}
    </div>
  );
};

const PrivacyNotice = ({ onClose }) => {
  const contact = (typeof window !== 'undefined' && window.PACT_CONTACT) || 'the person who invited you to use Pact';
  const cloudOn = cloud.enabled;
  const H = ({ children }) => <h3 className="text-[10px] uppercase tracking-widest text-purple-800 font-medium mt-4 mb-1">{children}</h3>;
  return (
    <div data-privacy-notice className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-3" onClick={onClose}>
      <div className="bg-white border border-stone-300 w-full max-w-md max-h-[88vh] overflow-y-auto p-5 text-xs text-slate-800 leading-relaxed" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-start">
          <h2 className="font-editorial text-xl font-normal">Privacy notice</h2>
          <button data-privacy-close onClick={onClose} aria-label="Close privacy notice" className="text-stone-500 text-lg leading-none">&times;</button>
        </div>
        <p className="text-[10px] text-stone-500">Last updated 17 November 2026</p>
        <p className="mt-2">Pact is a personal planner. This explains what it stores about you, who can see it and what your choices are. It is written in plain English on purpose.</p>

        <H>Who is responsible</H>
        <p>Pact is run by {contact}, who decides how your data is used (the "data controller" under UK GDPR). Contact them with any privacy question or request.</p>

        <H>What we store</H>
        <p>{cloudOn ? 'When you create an account, we store:' : 'On this device only, in your browser, we store:'}</p>
        <ul className="list-disc ml-4 space-y-0.5 mt-1">
          <li>Your name, email address and username{cloudOn ? ' (your password is handled by our sign-in provider and kept as a hash, we never see it)' : ' (your password is stored as a hash)'}.</li>
          <li>What you put in the app: plans, tasks, targets, meals, medicine reminders, notes, skills, ideas you save, and your home location or postcode.</li>
          <li>"Your People": names and notes about people in your life, so the app can remind you to get in touch. Those people do not need accounts and are never contacted by Pact.</li>
          {cloudOn && <li>Friends, messages and joint events you create with other Pact users.</li>}
        </ul>
        <p className="mt-1">Some of this can be sensitive (for example medicine or mood entries). Only enter what you are comfortable storing.</p>

        <H>Who can see it</H>
        <ul className="list-disc ml-4 space-y-0.5">
          <li>You can. Other users cannot read your plans through the app.</li>
          <li>People you choose to share with can see only what you share: your name and username, messages you send them, and joint events you invite them to.</li>
          <li>{cloudOn ? 'Data is not end-to-end encrypted, so the administrator of this Pact service can technically access stored data, including messages. They should only do so to run or fix the service.' : 'Nobody else, unless they use your device and browser.'}</li>
        </ul>

        <H>Services that receive some data</H>
        <ul className="list-disc ml-4 space-y-0.5">
          {cloudOn && <li>Hosting and database providers (Cloudflare and Supabase) store and serve the data.</li>}
          <li>Place searches send your approximate coordinates to OpenStreetMap search services{cloudOn ? ' and the Pact places database' : ''}. Postcode lookups send your postcode to a postcode service. Weather goes to Open-Meteo. General questions may go to Wikipedia.</li>
          <li>If the owner has switched on the Roamie assistant, your questions and a summary of your planner (name, upcoming plans, free time, targets) are sent to Google's Gemini service to write an answer.</li>
          <li>Your phone's GPS is only used when you tap the location button, or, if you switch on "Keep my location up to date", when you open the app. It is never read in the background.</li>
          <li>Medicine and mood entries are health information. They are only stored after you agree, they are only visible to you, and they are never shared with friends or sent to the assistant.</li>
        </ul>
        <p className="mt-1">We do not sell your data, show adverts or use analytics trackers.</p>

        <H>Your choices and rights</H>
        <ul className="list-disc ml-4 space-y-0.5">
          <li>See or change your data any time in the app, and export it from Profile &gt; Data.</li>
          <li>Delete your account and data with the Delete account button in Profile &gt; Account{cloudOn ? ' (this removes your account and everything stored with it)' : ''}.</li>
          <li>Under UK GDPR you can ask for a copy of your data, a correction, or deletion, and you can complain to the Information Commissioner's Office (ico.org.uk).</li>
          <li>You can stop using location, the assistant or friend features at any time. The app works without them.</li>
        </ul>

        <H>How long we keep it</H>
        <p>Until you delete it or your account. Backups held by the hosting provider may take a short time to clear after deletion.</p>

        <H>Security</H>
        <p>Data travels over HTTPS and access is restricted per account. No service is perfectly secure, and Pact has not had an independent security audit, so please keep your password private and do not store anything you could not bear to be exposed.</p>

        <button onClick={onClose} className="mt-5 w-full py-2.5 bg-purple-900 text-white text-xs uppercase tracking-widest font-medium">Close</button>
      </div>
    </div>
  );
};

const PACT_TAGLINE = 'Live a little louder. We’ll quietly sort the rest.';
function AuthScreen({ onAuth, onGuest }) {
  const [showPriv, setShowPriv] = useState(false);
  const pendingInvite = (() => { try { return JSON.parse(store.get(PENDING_INVITE) || 'null'); } catch (e) { return null; } })();
  const [view, setView] = useState(pendingInvite ? 'signup' : 'cover');   // cover | signup | signin
  const mode = view === 'signin' ? 'signin' : 'signup';
  const [name, setName] = useState('');
  const [handle, setHandle] = useState('');
  const [email, setEmail] = useState('');
  const [pw, setPw] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [err, setErr] = useState('');
  const [notice, setNotice] = useState('');
  const [busy, setBusy] = useState(false);

  const forgot = async () => {
    setErr(''); setNotice('');
    const em = email.trim().toLowerCase();
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(em)) return setErr('Enter your email above first, then tap Forgot password.');
    const r = await cloud.resetPassword(em);
    if (r.error) setErr(r.error); else setNotice('If that email has an account, a reset link is on its way.');
  };

  const submit = async (e) => {
    e.preventDefault();
    setErr(''); setNotice('');
    const em = email.trim().toLowerCase();
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(em)) return setErr('Please enter a valid email address.');
    if (pw.length < 8) return setErr('Your password needs at least 8 characters.');
    if (mode === 'signup') {
      if (!name.trim()) return setErr('Please tell us your name.');
      const h = handle.trim().replace(/^@/, '');
      if (h && !/^[A-Za-z0-9_]{3,24}$/.test(h)) return setErr('Usernames use 3 to 24 letters, numbers or underscores.');
      if (h) store.set('pact:wantHandle', h.toLowerCase()); else store.del('pact:wantHandle');
    }
    setBusy(true);
    try {
      if (cloud.enabled) {
        if (mode === 'signup') {
          const r = await cloud.signUp(em, pw, name.trim());
          if (r.error) setErr(r.error);
          else if (r.needsConfirm) { setNotice('Almost there. We emailed you a confirmation link. Tap it, then come back and sign in.'); setView('signin'); setPw(''); }
          else onAuth(r.user);
        } else {
          const r = await cloud.signIn(em, pw);
          if (r.error) setErr(r.error); else onAuth(r.user);
        }
        return;
      }
      const accounts = readAccounts();
      if (mode === 'signup') {
        if (accounts[em]) { setErr('An account with this email already exists. Sign in instead.'); return; }
        const { salt, hash } = await hashPassword(pw);
        accounts[em] = { name: name.trim(), salt, hash, created: Date.now() };
        writeAccounts(accounts);
        const user = { email: em, name: name.trim(), isNew: true };
        store.set('roam:session', JSON.stringify({ email: em, name: user.name }));
        onAuth(user);
      } else {
        const acc = accounts[em];
        if (!acc) { setErr('No account found for that email. Create one first.'); return; }
        const { hash } = await hashPassword(pw, acc.salt);
        if (hash !== acc.hash) { setErr('Incorrect password.'); return; }
        store.set('roam:session', JSON.stringify({ email: em, name: acc.name }));
        onAuth({ email: em, name: acc.name });
      }
    } finally {
      setBusy(false);
    }
  };

  const INK = '#1B2A22', FOR = '#1F3A2E', PAPER = '#F4EFE4', MUT = '#5A675F', CLAY = '#C8643C';
  const Masthead = ({ size, dark, tag }) => (
    <div className="px-7 text-center" style={{ color: dark ? PAPER : INK }}>
      <div style={{ borderTop: `3px solid ${dark ? PAPER : INK}`, borderBottom: `1px solid ${dark ? PAPER : INK}`, height: 2 }} />
      <div className="font-fr" style={{ fontWeight: 600, fontStyle: 'italic', fontSize: size, letterSpacing: '-0.025em', lineHeight: 1.05, marginTop: 16 }}>The Pact</div>
      <div className="font-fr" data-auth-tagline style={{ fontStyle: 'italic', fontSize: 15, lineHeight: 1.35, color: dark ? '#B9C6BE' : MUT, margin: '8px auto 0', maxWidth: 300 }}>{tag}</div>
      <div style={{ marginTop: 16, borderTop: `1px solid ${dark ? PAPER : INK}`, borderBottom: `3px solid ${dark ? PAPER : INK}`, height: 2 }} />
    </div>
  );

  if (view === 'cover') {
    return (
      <div data-auth-cover className="absolute inset-0 flex flex-col" style={{ background: FOR, zIndex: 20 }}>
        <div style={{ position: 'absolute', right: -110, top: -60, width: 320, height: 320, borderRadius: '50%', background: 'radial-gradient(circle, rgba(200,100,60,.22), rgba(200,100,60,0) 70%)', pointerEvents: 'none' }} />
        <div style={{ flex: 2 }} />
        <div className="flex justify-center" style={{ marginBottom: 22 }}><PactSeal size={120} /></div>
        <Masthead size={56} dark tag={PACT_TAGLINE} />
        <div style={{ flex: 1 }} />
        <div className="px-7 pb-3 space-y-2.5">
          <button data-auth-start type="button" onClick={() => setView('signup')} className="w-full h-12 text-sm font-bold" style={{ background: PAPER, color: FOR, borderRadius: 0 }}>Sign the pact</button>
          <button data-auth-have type="button" onClick={() => setView('signin')} className="w-full h-12 text-sm font-semibold" style={{ border: `1px solid ${PAPER}`, color: PAPER, borderRadius: 0 }}>I already have an account</button>
          <button type="button" onClick={onGuest} className="w-full text-[11px] underline pt-1" style={{ color: '#8FA398', borderRadius: 0 }}>Just looking? Try the demo without an account</button>
        </div>
        <div className="text-center pb-6 text-[10px] uppercase tracking-[0.14em]" style={{ color: '#8FA398' }}>Free &middot; Works on iPhone, Android &amp; laptop</div>
      </div>
    );
  }

  const field = (label, input, right) => (
    <label className="block" style={{ marginTop: 14 }}>
      <span className="text-[10px] uppercase tracking-[0.14em]" style={{ color: MUT }}>{label}</span>
      <div className="flex items-center" style={{ borderBottom: `1.5px solid ${INK}` }}>{input}{right}</div>
    </label>
  );
  const inputCls = 'flex-1 min-w-0 bg-transparent py-2 text-[15px] outline-none';
  return (
    <div className="flex-1 overflow-y-auto relative z-10 flex flex-col" style={{ color: INK }}>
      <div style={{ paddingTop: 28 }}><Masthead size={40} tag={PACT_TAGLINE} /></div>
      <div className="px-7">
        <div className="grid grid-cols-2" style={{ marginTop: 20, borderBottom: `1px solid ${INK}` }}>
          {[{ id: 'signin', label: 'Sign in' }, { id: 'signup', label: 'Sign the pact' }].map(t => (
            <button key={t.id} data-auth-tab={t.id} type="button" onClick={() => { setView(t.id); setErr(''); }} className="py-2 text-[10px] uppercase tracking-[0.16em]" style={{ borderRadius: 0, fontWeight: view === t.id ? 700 : 400, color: view === t.id ? INK : MUT, borderBottom: view === t.id ? `3px solid ${CLAY}` : '3px solid transparent', marginBottom: -1 }}>{t.label}</button>
          ))}
        </div>
        {pendingInvite && <div data-auth-invite className="mt-4 p-3 border border-stone-300 text-xs text-center">{pendingInvite.from} invited you to <span className="font-medium">{pendingInvite.t}</span>. Sign in or create an account to see it.</div>}
        <form onSubmit={submit} noValidate>
          {mode === 'signup' && field('Your name', <input type="text" placeholder="What should we call you?" value={name} onChange={e => setName(e.target.value)} autoComplete="name" className={inputCls} />)}
          {mode === 'signup' && field('Username', <input data-auth-handle type="text" placeholder="@yourname" value={handle} onChange={e => setHandle(e.target.value)} autoCapitalize="none" autoComplete="username" className={inputCls} />, <span className="text-[10px] uppercase tracking-[0.1em] shrink-0" style={{ color: MUT }}>Friends find you here</span>)}
          {field('Email', <input type="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} autoComplete="email" className={inputCls} />)}
          {field('Password', <input type={showPw ? 'text' : 'password'} placeholder={mode === 'signup' ? 'At least 8 characters' : 'Your password'} value={pw} onChange={e => setPw(e.target.value)} autoComplete={mode === 'signup' ? 'new-password' : 'current-password'} className={inputCls} />, <button type="button" data-auth-showpw onClick={() => setShowPw(!showPw)} className="text-[10px] uppercase tracking-[0.1em] shrink-0" style={{ color: MUT, borderRadius: 0 }}>{showPw ? 'Hide' : 'Show'}</button>)}
          {cloud.enabled && mode === 'signin' && <div className="text-right" style={{ marginTop: 10 }}><button type="button" onClick={forgot} className="text-xs underline" style={{ color: MUT, borderRadius: 0 }}>Forgot your password?</button></div>}
          {notice && <div className="mt-3 p-2.5 border border-stone-300 text-xs">{notice}</div>}
          {err && <div className="mt-3 p-2.5 text-white text-xs flex items-start gap-2" style={{ background: '#8A4A27' }}><AlertTriangle size={14} className="shrink-0 mt-0.5" /><span>{err}</span></div>}
          <button type="submit" disabled={busy} className="w-full h-11 text-[13px] font-semibold text-white" style={{ background: FOR, borderRadius: 0, marginTop: 16 }}>{busy ? 'One moment...' : mode === 'signup' ? 'Create my account' : 'Sign in'}</button>
          <p className="text-[11px] leading-relaxed text-center" style={{ color: MUT, marginTop: 12 }}>
            {mode === 'signup' ? <>Takes about two minutes to set up.<br /></> : null}
            {cloud.enabled ? 'Your account and plans are saved securely online, so you can sign in from any device.' : 'Your account and plans are saved on this device and protected by your password. Use the same browser to come back to them.'}
            {' '}By continuing you agree to how your data is used, explained in the <button type="button" data-privacy-link onClick={() => setShowPriv(true)} className="underline" style={{ color: CLAY, borderRadius: 0 }}>privacy notice</button>.
          </p>
        </form>
        <div className="text-center text-xs" style={{ marginTop: 12, color: MUT }}>
          {mode === 'signup' ? <>Already have an account? <button type="button" onClick={() => setView('signin')} className="font-bold underline" style={{ color: CLAY, borderRadius: 0 }}>Sign in</button></> : <>New here? <button type="button" onClick={() => setView('signup')} className="font-bold underline" style={{ color: CLAY, borderRadius: 0 }}>Sign the pact</button></>}
        </div>
        <button type="button" onClick={onGuest} className="block mx-auto text-[11px] underline" style={{ marginTop: 14, marginBottom: 24, color: MUT, borderRadius: 0 }}>Just looking? Try the demo without an account</button>
      </div>
      {showPriv && <PrivacyNotice onClose={() => setShowPriv(false)} />}
    </div>
  );
}

// ---------------------------------------------------------------------------------------------
// Schedule "Listings": a TV-guide grid. Your day first; tap "time matching" to add friends who chose to share.
// ---------------------------------------------------------------------------------------------
const LST_PX = 34;
const WORD_HOURS = ['midnight', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'noon'];
const hourWord = (m) => { const h = Math.floor(m / 60), mm = m % 60, h12 = h === 0 ? 0 : h > 12 ? h - 12 : h; const w = h === 12 ? 'noon' : WORD_HOURS[h12]; return mm === 0 ? w : mm === 30 ? 'half past ' + w : fromMins(m); };
const lstLanes = (blocks) => {
  const sorted = [...blocks].sort((a, b) => a.s - b.s || a.e - b.e);
  const lanes = []; const out = [];
  sorted.forEach(b => {
    let i = lanes.findIndex(end => end <= b.s);
    if (i < 0) { i = lanes.length; lanes.push(0); }
    lanes[i] = b.e; out.push({ ...b, lane: i });
  });
  const n = Math.max(1, lanes.length);
  return out.map(b => ({ ...b, lanes: n }));
};
const HATCH = 'repeating-linear-gradient(135deg,#CFC7B4 0,#CFC7B4 3px,transparent 3px,transparent 7px)';
const Portal = ({ children }) => (typeof document !== 'undefined' ? createPortal(children, document.body) : null);
function KickerRow({ label, right }) {
  return (
    <div className="flex items-center gap-2.5" style={{ margin: '14px 0 0' }}>
      <span style={{ background: '#1B2A22', color: '#F4EFE4', fontSize: 10, letterSpacing: '.18em', textTransform: 'uppercase', padding: '4px 9px', fontWeight: 600 }}>{label}</span>
      <span style={{ flex: 1, borderTop: '1px solid #1B2A22' }} />
      {right}
    </div>
  );
}
const kickerRightStyle = { fontSize: 10, letterSpacing: '.14em', textTransform: 'uppercase', color: '#5A675F' };
function Headline({ title, sub }) {
  return (
    <div style={{ margin: '10px 0 0' }}>
      <h1 className="font-fr" style={{ margin: 0, fontWeight: 600, fontSize: 30, lineHeight: 0.98, letterSpacing: '-.025em', color: '#1B2A22' }}>{title}</h1>
      {sub && <div className="font-fr" style={{ fontStyle: 'italic', fontSize: 15, color: '#5A675F', marginTop: 7, lineHeight: 1.3 }}>{sub}</div>}
    </div>
  );
}
function ScheduleListings({ date, mine, friends, matching, canMatch, onToggleMatch, onTapTask, onShare, onAdd, onSlot, nowMin, isToday }) {
  const [ghost, setGhost] = useState(null);   // { s, e } minutes of the tapped empty slot (drag the bottom handle to resize)
  useEffect(() => { setGhost(null); }, [date]);
  const scrollRef = useRef(null);
  const cols = [{ id: 'me', name: 'You', blocks: mine, ok: true, mine: true }, ...(matching ? friends : [])];
  const all = cols.flatMap(c => c.blocks);
  const H0 = 0, H1 = 24;   // midnight to midnight; the grid scrolls
  const height = (H1 - H0) * LST_PX;
  const top = (m) => ((m - H0 * 60) / 60) * LST_PX;
  const snapAt = (el, clientY) => { const r = el.getBoundingClientRect(); return Math.floor(((clientY - r.top) / LST_PX) * 4) * 15; };
  const firstMine = mine.filter(b => !b.past).sort((a, b) => a.s - b.s)[0];
  useEffect(() => {
    const el = scrollRef.current; if (!el) return;
    const focus = firstMine ? firstMine.s : (nowMin != null ? nowMin : 8 * 60);
    el.scrollTop = Math.max(0, top(Math.max(0, focus - 60)));
  }, [date]);   // eslint-disable-line
  const busyAt = (m) => cols.some(c => c.ok && c.blocks.some(b => m >= b.s && m < b.e));
  const free = []; let cur = null;
  if (matching && friends.some(f => f.ok)) {
    const from = Math.max(H0 * 60, 8 * 60, nowMin != null ? Math.ceil(nowMin / 15) * 15 : 0);
    for (let m = from; m < Math.min(H1 * 60, 22 * 60); m += 15) {
      if (!busyAt(m)) { if (!cur) cur = { s: m, e: m + 15 }; else cur.e = m + 15; } else if (cur) { if (cur.e - cur.s >= 60) free.push(cur); cur = null; }
    }
    if (cur && cur.e - cur.s >= 60) free.push(cur);
  }
  const upcoming = mine.filter(b => !b.past).sort((a, b) => a.s - b.s)[0];
  const title = matching ? (free.length ? `Everyone’s free at ${hourWord(free[0].s)}.` : 'No hour works for everyone.') : mine.length === 0 ? 'A clear day.' : `${mine.length} plan${mine.length === 1 ? '' : 's'} ${isToday ? 'today' : 'that day'}.`;
  const sub = !matching && upcoming ? `Next: ${upcoming.t} at ${fromMins(upcoming.s)}.` : null;
  const grid = `34px repeat(${cols.length}, minmax(${matching ? 104 : 120}px, 1fr))`;
  const hoursLabels = []; for (let h = H0; h < H1; h += 1) hoursLabels.push(h);
  return (
    <section data-listings>
      <KickerRow label="Schedule" right={<span style={kickerRightStyle}>Listings</span>} />
      <Headline title={title} sub={sub} />
      <div style={{ display: 'grid', gridTemplateColumns: canMatch ? '1fr 1fr' : '1fr', gap: 8, marginTop: 14 }}>
        {canMatch && <button data-match-toggle aria-pressed={matching} onClick={onToggleMatch} style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '9px 10px', textAlign: 'left', border: '1.5px solid #1B2A22', borderRadius: 0, background: matching ? '#1F3A2E' : 'transparent', color: matching ? '#F4EFE4' : '#1B2A22' }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}><circle cx="9" cy="8" r="3.2" /><path d="M3 20c0-3.3 2.7-5.5 6-5.5s6 2.2 6 5.5" /><circle cx="17.5" cy="9" r="2.4" /><path d="M17 14.6c2.3.2 4 1.8 4 4.4" /></svg>
          <span><b style={{ display: 'block', fontSize: 12.5, lineHeight: 1.15 }}>{matching ? 'Comparing days' : 'Find a time'}</b><span style={{ display: 'block', fontSize: 10.5, opacity: .75, lineHeight: 1.2, marginTop: 1 }}>{matching ? 'Tap to hide friends' : 'See friends’ free hours'}</span></span>
        </button>}
        <button data-share-open onClick={onShare} style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '9px 10px', textAlign: 'left', border: '1.5px solid #1B2A22', borderRadius: 0, background: 'transparent', color: '#1B2A22' }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}><path d="M2 12s3.6-6.5 10-6.5S22 12 22 12s-3.6 6.5-10 6.5S2 12 2 12z" /><circle cx="12" cy="12" r="2.8" /></svg>
          <span><b style={{ display: 'block', fontSize: 12.5, lineHeight: 1.15 }}>Who sees mine</b><span style={{ display: 'block', fontSize: 10.5, opacity: .75, lineHeight: 1.2, marginTop: 1 }}>Set who can see</span></span>
        </button>
      </div>
      <div className="overflow-x-auto no-scrollbar" style={{ marginTop: 12 }}>
        <div style={{ minWidth: matching ? 34 + cols.length * 104 : undefined }}>
          <div style={{ display: 'grid', gridTemplateColumns: grid, borderTop: '3px solid #1B2A22', borderBottom: '1px solid #1B2A22' }}>
            <div />
            {cols.map(c => <div key={c.id} style={{ textAlign: 'center', borderLeft: '1px solid #1B2A22', padding: '6px 0 5px', fontSize: 10, letterSpacing: '.14em', textTransform: 'uppercase', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.name}</div>)}
          </div>
          <div ref={scrollRef} data-list-scroll style={{ maxHeight: 440, overflowY: 'auto', overscrollBehavior: 'contain', borderBottom: '1px solid #1B2A22' }}>
          <div style={{ position: 'relative', height, display: 'grid', gridTemplateColumns: grid, backgroundImage: `repeating-linear-gradient(to bottom,transparent 0,transparent ${LST_PX - 1}px,#CFC7B4 ${LST_PX - 1}px,#CFC7B4 ${LST_PX}px)`, borderBottom: '1px solid #1B2A22' }}>
            <div style={{ position: 'relative' }}>
              {hoursLabels.map(h => <div key={h} style={{ position: 'absolute', left: 0, top: top(h * 60) + 3, width: 28, textAlign: 'right', fontSize: 10, lineHeight: 1, color: '#7C857F' }}>{pad2(h)}</div>)}
            </div>
            {cols.map(c => (
              <div key={c.id} data-list-col={c.id} onClick={c.mine ? (e) => {
                if (e.target.closest('[data-list-block], [data-slot-ghost]')) return;
                const st = Math.max(H0 * 60, Math.min(H1 * 60 - 15, snapAt(e.currentTarget, e.clientY)));
                setGhost({ s: st, e: Math.min(H1 * 60, st + 60) });
              } : undefined} style={{ position: 'relative', borderLeft: '1px solid #1B2A22', cursor: c.mine ? 'pointer' : undefined }}>
                {c.mine && ghost != null && (
                  <button data-slot-ghost onClick={() => onSlot && onSlot(ghost.s, ghost.e)} style={{ position: 'absolute', top: top(ghost.s), height: Math.max(LST_PX / 4, ((ghost.e - ghost.s) / 60) * LST_PX - 1), left: 1, right: 2, boxSizing: 'border-box', border: '1.5px dashed #C8643C', background: 'rgba(200,100,60,.12)', color: '#1B2A22', textAlign: 'left', padding: '4px 7px 14px', fontSize: 11, lineHeight: 1.2, zIndex: 2, borderRadius: 0, overflow: 'hidden' }}>
                    <b style={{ display: 'block' }}>+ New plan</b><span style={{ color: '#5A675F' }}>{fromMins(ghost.s)}–{ghost.e >= 1440 ? '24:00' : fromMins(ghost.e)}</span>
                    <div data-slot-handle aria-label="Drag to change the length"
                      onClick={(e) => e.stopPropagation()}
                      onPointerDown={(e) => { e.stopPropagation(); e.currentTarget.setPointerCapture(e.pointerId); }}
                      onPointerMove={(e) => { if (!e.currentTarget.hasPointerCapture(e.pointerId)) return; const col = e.currentTarget.closest('[data-list-col]'); const m = Math.round(((e.clientY + 8 - col.getBoundingClientRect().top) / LST_PX) * 4) * 15; setGhost(g => ({ s: g.s, e: Math.max(g.s + 15, Math.min(H1 * 60, m)) })); }}
                      style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: 16, touchAction: 'none', cursor: 'ns-resize', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <span style={{ width: 28, height: 4, borderRadius: 2, background: '#C8643C' }} />
                    </div>
                  </button>
                )}
                {!c.ok && <div style={{ position: 'absolute', inset: 0, backgroundImage: HATCH, opacity: 0.35, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><span style={{ fontSize: 9, letterSpacing: '.14em', textTransform: 'uppercase', background: '#F4EFE4', color: '#5A675F', padding: '2px 5px' }}>Not shared</span></div>}
                {lstLanes(c.blocks).map((b, i) => {
                  const h = Math.max(24, ((b.e - b.s) / 60) * LST_PX - 1);
                  const w = 100 / b.lanes;
                  const base = { position: 'absolute', top: top(b.s), height: h, left: `calc(${b.lane * w}% + 1px)`, width: `calc(${w}% - 3px)`, boxSizing: 'border-box', padding: '4px 7px', fontSize: 11, lineHeight: 1.2, textAlign: 'left', overflow: 'hidden', borderRadius: 0 };
                  const st = c.mine ? (b.past ? { ...base, border: '1px solid #CFC7B4', color: '#7C857F', background: '#F4EFE4' } : { ...base, background: '#1F3A2E', color: '#F4EFE4', border: 0 })
                    : { ...base, backgroundImage: HATCH, border: '1px solid #CFC7B4', color: '#5A675F', background: undefined };
                  return (
                    <button key={i} data-list-block={c.mine ? b.id : undefined} disabled={!c.mine} onClick={() => c.mine && onTapTask(b.id)} style={st}>
                      {c.mine && !b.past ? <><b style={{ display: 'block', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{b.t}</b>{h >= 40 && <span style={{ display: 'block', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{b.loc || (fromMins(b.s) + '–' + fromMins(b.e))}</span>}</> : <span style={{ display: 'block', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{b.t}</span>}
                    </button>
                  );
                })}
              </div>
            ))}
            {mine.length === 0 && !matching && <div style={{ position: 'absolute', left: 34, right: 0, top: 18, textAlign: 'center', fontSize: 12, color: '#7C857F', pointerEvents: 'none' }}>Nothing planned. Tap a time to plan something.</div>}
            {nowMin != null && nowMin >= H0 * 60 && nowMin <= H1 * 60 && <div style={{ position: 'absolute', left: 34, right: 0, top: top(nowMin), borderTop: '1.5px solid #C8643C', pointerEvents: 'none' }} />}
            {free.map((f, i) => (
              <div key={i} data-all-free style={{ position: 'absolute', left: 35, right: 0, top: top(f.s), height: top(f.e) - top(f.s), background: 'rgba(200,100,60,.14)', borderTop: '1.5px dashed #C8643C', borderBottom: '1.5px dashed #C8643C', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, letterSpacing: '.14em', color: '#C8643C', fontWeight: 600, pointerEvents: 'none' }}>ALL FREE &middot; {pad2(Math.floor(f.s / 60))}&ndash;{pad2(Math.floor(f.e / 60))}</div>
            ))}
          </div>
          </div>
        </div>
      </div>
      {matching && free.length > 0
        ? <button data-suggest-plan onClick={onAdd} style={{ marginTop: 12, width: '100%', height: 44, border: 0, background: '#1F3A2E', color: '#F4EFE4', fontSize: 13, fontWeight: 600, borderRadius: 0 }}>Suggest a plan for {fromMins(free[0].s)}&ndash;{fromMins(free[0].e)}</button>
        : <button data-add-plan-cta onClick={onAdd} style={{ marginTop: 12, width: '100%', height: 44, border: 0, background: '#1F3A2E', color: '#F4EFE4', fontSize: 13, fontWeight: 600, borderRadius: 0 }}>Add a plan</button>}
    </section>
  );
}

// Who can see when you're busy, and until when. Each person is chosen separately and it switches itself off.
function ShareSchedulePanel({ friends, grants, onSet, onClose }) {
  const [opts, setOpts] = useState({});
  const getO = (id) => opts[id] || { days: 3, titles: false };
  const setO = (id, p) => setOpts(o => ({ ...o, [id]: { ...getO(id), ...p } }));
  const DUR = [[3, '3 days'], [7, 'A week'], [14, '2 weeks']];
  return (
    <section data-share-panel className="border-[1.5px] border-[#1B2A22] bg-[#F4EFE4]" style={{ borderRadius: 0 }}>
      <div className="flex items-center justify-between px-3 py-2 border-b-[3px] border-double border-[#1B2A22]">
        <div><div className="text-[9px] uppercase tracking-[0.18em] text-[#1F3A2E] font-medium">Your choice</div><div className="font-editorial text-[15px] text-[#1B2A22] leading-tight">Who can see when I'm busy</div></div>
        <button data-share-close onClick={onClose} aria-label="Close" className="w-7 h-7 border border-[#1B2A22] flex items-center justify-center"><X size={14} /></button>
      </div>
      <p className="px-3 pt-2 text-[11px] leading-snug text-[#1B2A22]/80">Friends only see the times you're busy, not the details, unless you tick "show plan titles". Sharing stops by itself on the end date. Plans you mark Private are never included.</p>
      <div className="p-3 space-y-2.5">
        {friends.length === 0 && <div className="text-[11px] text-[#1B2A22]/70">Add friends in the Social tab first.</div>}
        {friends.map(f => {
          const g = grants.find(x => x.friend_id === f.userId);
          const o = getO(f.userId);
          return (
            <div key={f.userId} data-share-row={f.userId} className="border border-[#1B2A22]/50 p-2.5 space-y-2 bg-white/40">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[12px] font-medium text-[#1B2A22] truncate">{f.name}</span>
                {g ? <span className="text-[10px] text-[#1F3A2E] shrink-0">Sharing to {new Date(g.until + 'T12:00:00').toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })}{g.titles ? ' · titles' : ''}</span> : <span className="text-[10px] text-[#1B2A22]/50 shrink-0">Not sharing</span>}
              </div>
              <div className="flex flex-wrap gap-1.5">
                {DUR.map(([d, label]) => <button key={d} data-share-days={d} aria-pressed={o.days === d} onClick={() => setO(f.userId, { days: d })} className={`px-2 py-1 border text-[10px] ${o.days === d ? 'bg-[#1F3A2E] text-[#F4EFE4] border-[#1F3A2E]' : 'border-[#1B2A22]/60'}`}>{label}</button>)}
              </div>
              <label className="flex items-center gap-2 text-[11px] text-[#1B2A22]"><input type="checkbox" checked={o.titles} onChange={e => setO(f.userId, { titles: e.target.checked })} /> Show plan titles (otherwise just "Busy")</label>
              <div className="flex gap-1.5">
                <button data-share-save onClick={() => onSet(f.userId, o.days, o.titles)} className="px-2.5 py-1.5 bg-[#1F3A2E] text-[#F4EFE4] text-[10px] uppercase tracking-wider font-medium">{g ? 'Update' : 'Share'}</button>
                {g && <button data-share-stop onClick={() => onSet(f.userId, 0, false)} className="px-2.5 py-1.5 border border-[#1B2A22] text-[10px] uppercase tracking-wider font-medium">Stop sharing</button>}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

// ---------------------------------------------------------------------------------------------
// Development: an index of skills with sparklines; opening one shows it as a book of chapters.
// ---------------------------------------------------------------------------------------------
const skillSpark = (skill, weeks = 8) => {
  const steps = skill.steps || []; if (!steps.length) return Array(weeks).fill(0);
  const today = todayDateStr();
  return Array.from({ length: weeks }, (_, i) => {
    const end = addDaysStr(today, -(weeks - 1 - i) * 7);
    return steps.filter(s => s.done && (!s.doneDate || s.doneDate <= end)).length / steps.length;
  });
};
const skillStats = (sk) => {
  const total = sk.steps.length, done = sk.steps.filter(s => s.done).length, wk = addDaysStr(todayDateStr(), -7);
  const gained = sk.steps.filter(s => s.done && s.doneDate && s.doneDate > wk).length;
  const next = sk.steps.find(s => !s.done);
  return { pct: total ? Math.round(done / total * 100) : 0, delta: total ? Math.round(gained / total * 100) : 0, next, spark: skillSpark(sk) };
};
function SparkLine({ pts, up }) {
  const w = 70, h = 24, d = pts.map((v, i) => Math.round(i * (w / (pts.length - 1))) + ',' + Math.round(22 - v * 20)).join(' ');
  return <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} aria-hidden="true"><polyline fill="none" stroke={up ? '#C8643C' : '#7C857F'} strokeWidth="1.6" points={d} /></svg>;
}
function SkillIndex({ branches, domain, onDomain, onOpen, invites, onAccept, onDecline, onPlan, onNew, strip }) {
  const rows = branches.flatMap(b => b.skills.map(sk => ({ b, sk, ...skillStats(sk) }))).sort((a, c) => c.delta - a.delta || c.pct - a.pct);
  const top = rows[0];
  const pick = rows.find(r => r.next);
  const title = !top ? 'Start your skills index.' : top.delta > 0 ? `${top.sk.name} up ${top.delta}% this week.` : 'Pick a skill and make a start.';
  return (
    <div data-skill-index>
      <KickerRow label="Development" right={<span style={kickerRightStyle}><button data-domain-work onClick={() => onDomain('work')} style={{ background: 'none', border: 0, padding: 0, letterSpacing: 'inherit', textTransform: 'inherit', color: domain === 'work' ? '#1B2A22' : '#5A675F', fontWeight: domain === 'work' ? 700 : 400, textDecoration: domain === 'work' ? 'underline' : 'none' }}>Work</button> &middot; <button data-domain-personal onClick={() => onDomain('personal')} style={{ background: 'none', border: 0, padding: 0, letterSpacing: 'inherit', textTransform: 'inherit', color: domain === 'personal' ? '#1B2A22' : '#5A675F', fontWeight: domain === 'personal' ? 700 : 400, textDecoration: domain === 'personal' ? 'underline' : 'none' }}>Personal</button></span>} />
      <Headline title={title} />
      {invites.map(v => (
        <div key={v.id} data-buddy-invite style={{ marginTop: 12, border: '3px double #1B2A22', padding: '12px 14px' }}>
          <div style={{ fontSize: 9, letterSpacing: '.2em', textTransform: 'uppercase', color: '#C8643C', fontWeight: 600 }}>Invitation</div>
          <div style={{ fontSize: 13, marginTop: 3 }}><b>{v.friend_name}</b> wants to learn <b>{v.skill}</b> with you.</div>
          <div className="flex gap-2" style={{ marginTop: 8 }}><button data-buddy-join onClick={() => onAccept(v)} style={{ height: 36, padding: '0 14px', border: 0, background: '#1F3A2E', color: '#F4EFE4', fontSize: 12, fontWeight: 600, borderRadius: 0 }}>Join them</button><button data-buddy-decline onClick={() => onDecline(v)} style={{ height: 36, padding: '0 14px', border: '1px solid #1B2A22', background: 'transparent', fontSize: 12, fontWeight: 600, borderRadius: 0 }}>Not now</button></div>
        </div>
      ))}
      {strip}
      <div className="flex justify-between" style={{ marginTop: 14, borderTop: '3px solid #1B2A22', paddingTop: 6 }}>
        <span style={kickerRightStyle}>Skill</span><span style={kickerRightStyle}>Trend &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; Done</span>
      </div>
      <div style={{ borderTop: '1px solid #1B2A22', marginTop: 6 }} />
      {rows.length === 0 && <div style={{ padding: '16px 0', fontSize: 13, color: '#5A675F' }}>No skills yet. Tap "List a new skill" below.</div>}
      {rows.map(({ b, sk, pct, delta, next, spark }) => (
        <button key={sk.id} data-skill-row={sk.id} onClick={() => onOpen(b.id, sk.id)} className="w-full text-left" style={{ display: 'grid', gridTemplateColumns: '1fr 70px 48px', gap: 10, alignItems: 'center', padding: '11px 0', borderBottom: '1px solid #CFC7B4', background: 'none', borderTop: 0, borderLeft: 0, borderRight: 0, borderRadius: 0 }}>
          <div style={{ minWidth: 0 }}><div className="font-fr" style={{ fontWeight: 600, fontSize: 17, lineHeight: 1.1, color: '#1B2A22' }}>{sk.name}</div><div style={{ fontSize: 11, color: '#5A675F', marginTop: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{next ? next.title : 'All chapters done'}</div></div>
          <SparkLine pts={spark} up={delta > 0} />
          <div style={{ textAlign: 'right' }}><div style={{ fontWeight: 600, fontSize: 15, color: '#1B2A22' }}>{pct}%</div><div style={{ fontSize: 10, color: delta > 0 ? '#1F3A2E' : '#7C857F' }}>{delta > 0 ? '▲' : '▼'} {delta}</div></div>
        </button>
      ))}
      <button data-new-skill onClick={onNew} style={{ marginTop: 14, fontSize: 12, color: '#5A675F', background: 'none', border: 0, padding: 0 }}>+ List a new skill</button>
    </div>
  );
}
function SkillChapters({ skill, skills, onPickSkill, onToggle, onPlan, weekText, buddy }) {
  const total = skill.steps.length, done = skill.steps.filter(s => s.done).length, pct = total ? Math.round(done / total * 100) : 0;
  const curIdx = skill.steps.findIndex(s => !s.done);
  const cur = curIdx < 0 ? Math.max(0, total - 1) : curIdx;
  return (
    <section data-skill-chapters>
      <KickerRow label="Development" right={
        <span style={{ position: 'relative', ...kickerRightStyle }}>{skill.name} &#9662;
          <select data-skill-switch aria-label="Choose a skill" value={skill.id} onChange={e => onPickSkill(e.target.value)} style={{ position: 'absolute', inset: 0, opacity: 0, width: '100%' }}>
            <option value="__all">All skills</option>
            {skills.map(x => <option key={x.id} value={x.id}>{x.name}</option>)}
          </select>
        </span>} />
      <button data-skill-back onClick={() => onPickSkill('__all')} style={{ marginTop: 6, fontSize: 10, letterSpacing: '.14em', textTransform: 'uppercase', color: '#5A675F', background: 'none', border: 0, padding: 0 }}>&larr; All skills</button>
      {total === 0 ? <Headline title={skill.name} sub="No chapters yet. Add some below." /> : (<>
        <div className="flex items-end gap-3" style={{ marginTop: 10 }}>
          <span className="font-fr" style={{ fontWeight: 600, fontSize: 92, lineHeight: 0.78, color: '#C8643C' }}>{cur + 1}</span>
          <div style={{ paddingBottom: 4, minWidth: 0 }}>
            <span style={kickerRightStyle}>Chapter {cur + 1} of {total}</span>
            <div className="font-fr" style={{ fontWeight: 600, fontSize: 24, lineHeight: 1, marginTop: 4, overflowWrap: 'anywhere' }}>{skill.steps[cur].title}</div>
          </div>
        </div>
        <div className="flex items-center gap-2.5" style={{ marginTop: 12 }}>
          <div style={{ flex: 1, height: 5, background: '#CFC7B4' }}><div style={{ height: 5, width: pct + '%', background: '#C8643C' }} /></div>
          <span style={{ fontSize: 12, fontWeight: 600 }}>{pct}%</span>
        </div>
        <div style={{ marginTop: 16, borderTop: '3px solid #1B2A22', paddingTop: 6 }}><span style={kickerRightStyle}>Contents</span></div>
        {skill.steps.map((st, i) => {
          const isCur = i === cur && curIdx >= 0;
          return (
            <button key={st.id} data-chapter-row={st.id} onClick={() => onToggle(st)} className="w-full text-left" style={{ display: 'flex', alignItems: 'baseline', gap: 8, padding: isCur ? '10px 10px' : '10px 0', borderBottom: '1px solid #CFC7B4', borderTop: 0, borderLeft: 0, borderRight: 0, borderRadius: 0, background: isCur ? '#1B2A22' : 'none', color: isCur ? '#F4EFE4' : '#1B2A22' }}>
              <span className="font-fr" style={{ fontWeight: 600, fontSize: 16, width: 18, flex: 'none', color: isCur ? undefined : '#C8643C' }}>{i + 1}</span>
              <span style={{ fontSize: 14, fontWeight: isCur ? 600 : 400, minWidth: 0, textDecoration: st.done ? 'none' : 'none' }}>{st.title || 'Untitled chapter'}</span>
              <span style={{ flex: 1, borderBottom: `1.5px dotted ${isCur ? '#6F8A7B' : '#7C857F'}`, transform: 'translateY(-3px)', minWidth: 8 }} />
              <span style={{ fontSize: 12, flex: 'none', color: isCur ? undefined : '#5A675F' }}>{st.done ? 'done' : isCur ? 'you are here' : 'p. ' + (i + 1)}</span>
            </button>
          );
        })}
      </>)}
      <div className="flex justify-between items-center" style={{ marginTop: 14 }}>
        <div><span style={kickerRightStyle}>This week</span><div style={{ fontSize: 13, marginTop: 2 }}>{weekText}</div></div>
        <button data-plan-slot onClick={onPlan} style={{ width: 120, height: 44, border: 0, background: '#1F3A2E', color: '#F4EFE4', fontSize: 13, fontWeight: 600, borderRadius: 0 }}>Plan a slot</button>
      </div>
      {buddy}
    </section>
  );
}

function BuddyPanel({ skill, friends, entry, onInvite, onEnd, onRespond }) {
  const [pick, setPick] = useState(null); const [note, setNote] = useState('');
  const myDone = skill.steps.filter(s => s.done).length, myTotal = skill.steps.length;
  const bar = (label, p) => { const d = p && p.done != null ? p.done : 0, t = p && p.total ? p.total : myTotal; const pc = t ? Math.round(d / t * 100) : 0; return (
    <div><div className="flex justify-between text-[11px] text-[#1B2A22]"><span className="font-medium truncate">{label}</span><span className="tabular-nums">{d}/{t}{p && p.last ? ' · ' + p.last : ''}</span></div><div className="h-1.5 bg-[#E6DFCF] border border-[#1B2A22]/30"><div className="h-full bg-[#1F3A2E]" style={{ width: pc + '%' }} /></div></div>); };
  return (
    <div data-buddy-panel className="mt-5 border-t-[3px] border-double border-[#1B2A22] py-3 space-y-2">
      <div className="text-[9px] uppercase tracking-[0.18em] text-[#C8643C] font-medium">Learn it together</div>
      {!entry && (<>
        {friends.length === 0 ? <p className="text-[11px] text-[#1B2A22]/70">Add friends in the Social tab, then you can learn this with one of them.</p> : (<>
          <p className="text-[11px] text-[#1B2A22]/80 leading-snug">Invite a friend to follow these chapters with you. You each tick your own; you both see how far the other has got.</p>
          <div className="flex flex-wrap gap-1.5">{friends.map(f => <button key={f.userId} data-buddy-pick={f.userId} aria-pressed={pick === f.userId} onClick={() => setPick(pick === f.userId ? null : f.userId)} className={`px-2.5 py-1 text-[10px] border ${pick === f.userId ? 'bg-[#1F3A2E] text-[#F4EFE4] border-[#1F3A2E]' : 'border-[#1B2A22]/60 text-[#1B2A22]'}`}>{f.name}</button>)}</div>
          {pick && <input data-buddy-note type="text" maxLength={200} value={note} onChange={e => setNote(e.target.value)} placeholder="Add a note (optional)" aria-label="Add a note (optional)" className="w-full bg-white border border-[#1B2A22]/50 px-2 py-1.5 text-xs" />}
          <button data-buddy-invite-send disabled={!pick} onClick={() => { onInvite(pick, note); setNote(''); setPick(null); }} className="px-3 py-1.5 bg-[#C8643C] text-white text-[10px] uppercase tracking-wider font-medium disabled:opacity-40">Invite</button>
        </>)}
      </>)}
      {entry && entry.status === 'invited' && entry.is_owner && <p data-buddy-waiting className="text-[11px] text-[#1B2A22]/80">Waiting for {entry.friend_name} to join.</p>}
      {entry && entry.status === 'invited' && !entry.is_owner && (<div className="space-y-1.5"><p className="text-[11px] text-[#1B2A22]">{entry.friend_name} invited you to learn this together.</p><div className="flex gap-1.5"><button onClick={() => onRespond(entry, true)} className="px-2.5 py-1.5 bg-[#1F3A2E] text-[#F4EFE4] text-[10px] uppercase tracking-wider">Join</button><button onClick={() => onRespond(entry, false)} className="px-2.5 py-1.5 border border-[#1B2A22] text-[10px] uppercase tracking-wider">Not now</button></div></div>)}
      {entry && entry.status === 'active' && (<div data-buddy-active className="space-y-2">
        {bar('You', { done: myDone, total: myTotal })}
        {bar(entry.friend_name, entry.their_progress)}
        {entry.note && <p className="text-[11px] italic text-[#1B2A22]/70">"{entry.note}"</p>}
      </div>)}
      {entry && <button data-buddy-end onClick={() => onEnd(entry)} className="text-[10px] uppercase tracking-wider underline text-[#1B2A22]/70">{entry.status === 'active' ? 'Stop learning together' : 'Cancel invitation'}</button>}
    </div>
  );
}

// ---------------------------------------------------------------------------------------------
// Ideas pictures. The places database has no photos, so: a real photo when Wikipedia has one for that exact
// place (checked by name AND distance, so we never show the wrong building), otherwise a newspaper-style illustration.
// ---------------------------------------------------------------------------------------------
const IDEA_ART = {
  Food: { bg: '#C8643C', fg: '#F4EFE4', Icon: Utensils },
  Indoor: { bg: '#1F3A2E', fg: '#F4EFE4', Icon: Landmark },
  Outdoor: { bg: '#4F7A63', fg: '#F4EFE4', Icon: Trees },
  Sports: { bg: '#1B2A22', fg: '#F4EFE4', Icon: Dumbbell },
  Shopping: { bg: '#B08A3E', fg: '#1B2A22', Icon: ShoppingBag },
  Trips: { bg: '#3A6A70', fg: '#F4EFE4', Icon: MapPin }
};
const photoCache = {};
const kmBetween = (a, b, c, d) => { const R = 6371, rad = Math.PI / 180, dl = (c - a) * rad, dn = (d - b) * rad; const x = Math.sin(dl / 2) ** 2 + Math.cos(a * rad) * Math.cos(c * rad) * Math.sin(dn / 2) ** 2; return 2 * R * Math.asin(Math.sqrt(x)); };
function useIdeaPhoto(idea) {
  const key = (idea.title || '') + '|' + (idea.lat != null ? idea.lat.toFixed(2) : '');
  const [src, setSrc] = useState(idea.img || photoCache[key] || null);
  useEffect(() => {
    if (idea.img) { setSrc(idea.img); return; }
    if (key in photoCache) { setSrc(photoCache[key]); return; }
    if (idea.lat == null || !idea.title || typeof fetch === 'undefined') return;
    let dead = false;
    const t = setTimeout(async () => {
      try {
        const r = await fetch('https://en.wikipedia.org/api/rest_v1/page/summary/' + encodeURIComponent(String(idea.title).replace(/\s+/g, '_')), { headers: { Accept: 'application/json' } });
        if (!r.ok) { photoCache[key] = null; return; }
        const j = await r.json();
        const ok = j && j.type === 'standard' && j.thumbnail && j.thumbnail.source && j.coordinates && kmBetween(idea.lat, idea.lon, j.coordinates.lat, j.coordinates.lon) < 1.5;
        photoCache[key] = ok ? j.thumbnail.source : null;
        if (!dead && ok) setSrc(photoCache[key]);
      } catch (e) { photoCache[key] = null; }
    }, 150 + Math.random() * 600);
    return () => { dead = true; clearTimeout(t); };
  }, [key]);
  return src;
}
function IdeaPic({ idea, tall }) {
  const src = useIdeaPhoto(idea);
  const base = IDEA_ART[idea.category] || IDEA_ART.Indoor;
  const kw = String(idea.sub1 || '') + ' ' + String(idea.title || '');
  const pick = [[/bakery|brunch|caf[eé]|coffee|tea/i, Coffee], [/pizza/i, Pizza], [/pub|bar|beer|cocktail/i, Beer], [/hike|walk|park|mountain|trail|climb/i, Mountain], [/cinema|film|theatre/i, Film], [/music|gig|club/i, Music], [/art|gallery|museum|craft|pottery/i, Palette], [/book/i, BookOpen], [/flight|trip|city break|weekend/i, Plane]].find(([r]) => r.test(kw));
  const shades = [0, 1, 2].map(i => i); let h = 0; String(idea.title || '').split('').forEach(ch => { h = (h * 31 + ch.charCodeAt(0)) % 3; });
  const art = { ...base, bg: base.bg, Icon: pick ? pick[1] : base.Icon }; const Icon = art.Icon; const tint = ['rgba(0,0,0,0)', 'rgba(27,42,34,.18)', 'rgba(244,239,228,.14)'][h];
  const [broken, setBroken] = useState(false);
  return (
    <div data-idea-pic={src && !broken ? 'photo' : 'art'} className="relative overflow-hidden border-b-[1.5px] border-[#1B2A22]" style={{ aspectRatio: tall ? '16 / 9' : '4 / 3', background: art.bg, boxShadow: 'inset 0 0 0 999px ' + tint }}>
      {src && !broken ? <img src={src} alt="" loading="lazy" onError={() => setBroken(true)} className="absolute inset-0 w-full h-full object-cover" style={{ filter: 'grayscale(.25) contrast(1.05)' }} /> : (<>
        <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(rgba(244,239,228,.28) 1.2px, transparent 1.6px)', backgroundSize: '7px 7px' }} />
        <Icon size={tall ? 64 : 44} strokeWidth={1.2} color={art.fg} className="absolute right-3 bottom-2 opacity-90" />
        <div className="absolute left-2.5 top-2 text-[9px] uppercase tracking-[0.2em] font-medium" style={{ color: art.fg }}>{idea.category}</div>
      </>)}
    </div>
  );
}
function IdeaTile({ idea, onOpen, fav, onFav }) {
  return (
    <article data-idea-tile className="np-tile border-[1.5px] border-[#1B2A22] bg-[#F4EFE4] flex flex-col min-w-0">
      <button onClick={onOpen} aria-label={'Open ' + idea.title} className="text-left"><IdeaPic idea={idea} /></button>
      <div className="p-2.5 flex-1 flex flex-col gap-1 min-w-0">
        <div className="text-[9px] uppercase tracking-[0.14em] text-[#1F3A2E] font-medium truncate">{idea.sub1}{idea.distance ? ' · ' + idea.distance : ''}</div>
        <button onClick={onOpen} className="text-left"><h4 className="font-editorial text-[14px] leading-tight text-[#1B2A22] break-words" style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{idea.title}</h4></button>
        <p className="text-[11px] leading-snug text-[#1B2A22]/75" style={{ display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{idea.desc}</p>
        <div className="mt-auto pt-1.5 flex items-center justify-between">
          <span className="text-[10px] text-[#1B2A22]/70 tabular-nums">{idea.rating ? '★ ' + idea.rating : ''}{idea.price ? (idea.rating ? ' · ' : '') + idea.price : ''}</span>
          <button data-fav-heart aria-label={fav ? 'Remove ' + idea.title + ' from favourites' : 'Save ' + idea.title + ' to favourites'} aria-pressed={fav} onClick={onFav} className={fav ? 'text-[#C8643C]' : 'text-[#1B2A22]/60'}><Heart size={15} fill={fav ? 'currentColor' : 'none'} /></button>
        </div>
      </div>
    </article>
  );
}

function IdeasFront({ items, cat, cats, onCat, savedCount, showFavs, onFavs, onSearch, onOpen, onAdd, onFav, isFav, onSurprise, adventure, onBack, more, filters }) {
  const hero = items[0], rest = items.slice(1);
  const photo = useIdeaPhoto(hero || {});
  const [broken, setBroken] = useState(false);
  const clip = (d) => { const t = String(d || '').split(/[.!?]\s/)[0].replace(/\.$/, ''); return t.length > 62 ? t.slice(0, 60).replace(/\s+\S*$/, '') : t; };
  const label = showFavs ? 'Saved' : cat;
  return (
    <div data-ideas-front>
      <div className="flex items-stretch" style={{ marginTop: 12, background: '#1B2A22', color: '#F4EFE4' }}>
        <div className="flex flex-1 overflow-x-auto no-scrollbar">
          <button data-fav-chip onClick={onFavs} style={{ padding: '8px 11px', fontSize: 10, letterSpacing: '.12em', textTransform: 'uppercase', whiteSpace: 'nowrap', background: showFavs ? '#C8643C' : 'transparent', color: '#F4EFE4', fontWeight: showFavs ? 600 : 400, border: 0, borderRadius: 0 }}>Saved ({savedCount})</button>
          {cats.map(c => <button key={c} data-idea-cat={c} onClick={() => onCat(c)} style={{ padding: '8px 11px', fontSize: 10, letterSpacing: '.12em', textTransform: 'uppercase', whiteSpace: 'nowrap', background: !showFavs && cat === c ? '#C8643C' : 'transparent', color: '#F4EFE4', fontWeight: !showFavs && cat === c ? 600 : 400, border: 0, borderRadius: 0 }}>{c}</button>)}
        </div>
        <button data-ideas-search-toggle aria-label="Search" onClick={onSearch} style={{ width: 38, display: 'flex', alignItems: 'center', justifyContent: 'center', borderLeft: '1px solid #3a4a41', background: 'transparent', border: 0, borderRadius: 0 }}><Search size={16} color="#F4EFE4" /></button>
      </div>
      {hero && (<>
        <div data-idea-hero onClick={() => onOpen(hero)} style={{ marginTop: 10, height: 196, position: 'relative', cursor: 'pointer', background: photo && !broken ? '#12251C' : 'radial-gradient(circle,rgba(244,239,228,.30) .9px,transparent 1.5px) 0 0/5px 5px,linear-gradient(135deg,#4F7A63,#12251C)' }}>
          {photo && !broken && <img src={photo} alt="" onError={() => setBroken(true)} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', filter: 'grayscale(.25) contrast(1.05)' }} />}
          <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, padding: '40px 16px 14px', background: 'linear-gradient(to top,rgba(18,37,28,.92),rgba(18,37,28,0))', color: '#F4EFE4' }}>
            <div style={{ fontSize: 9, letterSpacing: '.2em', textTransform: 'uppercase', color: '#E7B79F', fontWeight: 600 }}>Top pick &middot; {label}</div>
            <div className="font-fr" style={{ fontWeight: 600, fontSize: 32, lineHeight: 1, marginTop: 4, overflowWrap: 'anywhere' }}>{hero.title}</div>
            <div className="font-fr" style={{ fontStyle: 'italic', fontSize: 14, marginTop: 4, color: '#E6EDE8' }}>{clip(hero.desc)}{hero.distance ? `, ${hero.distance} away.` : '.'}</div>
          </div>
        </div>
        <div className="flex gap-2" style={{ marginTop: 10 }}>
          <button data-idea-add onClick={() => onAdd(hero)} style={{ width: 'calc(100% - 52px)', height: 44, border: 0, background: '#1F3A2E', color: '#F4EFE4', fontSize: 13, fontWeight: 600, borderRadius: 0 }}>Add to a plan</button>
          <button data-fav-heart aria-label={isFav(hero) ? 'Remove from saved' : 'Save'} aria-pressed={isFav(hero)} onClick={() => onFav(hero)} style={{ width: 44, height: 44, border: '1px solid #1B2A22', background: 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 0 }}><Heart size={18} color={isFav(hero) ? '#C8643C' : '#1B2A22'} fill={isFav(hero) ? '#C8643C' : 'none'} /></button>
        </div>
      </>)}
      <div style={{ marginTop: 12, display: 'grid', gridTemplateColumns: '1.25fr 1fr', gap: 14, alignItems: 'start' }}>
        <div style={{ borderTop: '3px solid #1B2A22', minWidth: 0 }}>
          <div className="flex justify-between items-center" style={{ paddingTop: 6 }}>
            <span style={{ fontSize: 10, letterSpacing: '.14em', textTransform: 'uppercase', color: '#5A675F' }}>Also in {label.toLowerCase()}</span>
            {!showFavs && <button data-ideas-filter-toggle onClick={filters.toggle} style={{ fontSize: 10, letterSpacing: '.1em', textTransform: 'uppercase', color: '#1B2A22', background: 'none', border: 0, padding: 0, textDecoration: 'underline' }}>{filters.label}</button>}
          </div>
          {filters.panel}
          {rest.map(it => (
            <button key={it.id} data-idea-item onClick={() => onOpen(it)} className="w-full text-left" style={{ display: 'block', padding: '9px 0', borderBottom: '1px solid #CFC7B4', background: 'none', borderTop: 0, borderLeft: 0, borderRight: 0, borderRadius: 0 }}>
              <div className="font-fr" style={{ fontWeight: 600, fontSize: 15, lineHeight: 1.08, color: '#1B2A22' }}>{it.title}</div>
              <div style={{ fontSize: 10.5, color: '#5A675F', marginTop: 2 }}>{[it.distance, String(it.sub1 || '').toLowerCase()].filter(Boolean).join(' · ')}</div>
            </button>
          ))}
          {rest.length === 0 && <div style={{ padding: '9px 0', fontSize: 11, color: '#5A675F' }}>Nothing else here yet.</div>}
        </div>
        <div style={{ border: '3px double #1B2A22', padding: 12 }}>
          <div style={{ fontSize: 9, letterSpacing: '.2em', textTransform: 'uppercase', color: '#C8643C', fontWeight: 600 }}>Wildcard</div>
          <div className="font-fr" style={{ fontWeight: 600, fontSize: 18, lineHeight: 1.05, marginTop: 4 }}>Feeling adventurous?</div>
          <div style={{ fontSize: 10.5, color: '#5A675F', marginTop: 4 }}>For {cat} only.</div>
          <button data-ideas-surprise onClick={onSurprise} style={{ marginTop: 10, width: '100%', height: 34, border: 0, background: '#1F3A2E', color: '#F4EFE4', borderRadius: 0, fontSize: 11, fontWeight: 600 }}>{adventure ? 'Surprise me again' : 'Surprise me'}</button>
          {adventure && <button data-ideas-adv-back onClick={onBack} style={{ marginTop: 8, fontSize: 10, letterSpacing: '.1em', textTransform: 'uppercase', background: 'none', border: 0, padding: 0, textDecoration: 'underline' }}>Back to top picks</button>}
        </div>
      </div>
      {more}
    </div>
  );
}

function AppInner({ onReset }) {
  // --- NAVIGATION & CLOCK STATE ---
  const [activeTab, setActiveTab] = useState('home'); // 'home', 'schedule', 'ideas', 'skills' (Development), 'social', 'profile'
  const [socialSub, setSocialSub] = useState('plans'); // 'plans','friends','people'
  const [profileScreen, setProfileScreen] = useState(null); // null = the hub, else one small screen
  const setProfileSubTab = (t) => setProfileScreen(t === 'data' ? 'health' : t === 'life' ? 'you' : null);
  // --- real friends (Supabase): username, lookup, requests ---
  const [usernameMsg, setUsernameMsg] = useState('');
  const [friendQuery, setFriendQuery] = useState('');
  const [friendBookQ, setFriendBookQ] = useState('');
  const [delAsk, setDelAsk] = useState(null);   // plan id awaiting a second tap to delete
  const [taskEdit, setTaskEdit] = useState(null);   // { id,title,date,start,end,location } while changing a plan in Schedule
  const [taskInviteId, setTaskInviteId] = useState(null);
  const [myProfile, setMyProfile] = useState({ bio: '', avatar: '' });
  const [profileMsg, setProfileMsg] = useState('');
  const [pressEdit, setPressEdit] = useState(false);
  const [roamieSmall, setRoamieSmall] = useState(false);
  useEffect(() => {
    let last = 0;
    const onScroll = (e) => { const y = (e.target && e.target.scrollTop != null ? e.target.scrollTop : window.scrollY) || 0; if (Math.abs(y - last) < 8) return; setRoamieSmall(y > last && y > 120); last = y; };
    window.addEventListener('scroll', onScroll, true);
    return () => window.removeEventListener('scroll', onScroll, true);
  }, []);
  const [importList, setImportList] = useState(null);   // null | [{name,phone,email,sel}]
  const [contactEditId, setContactEditId] = useState(null);
  const [importMsg, setImportMsg] = useState('');
  const [pasteOpen, setPasteOpen] = useState(false);
  const [pasteText, setPasteText] = useState('');
  const [peopleUserQ, setPeopleUserQ] = useState('');
  const [peopleUserRes, setPeopleUserRes] = useState(null);   // null | 'none' | found user
  const [viewFriend, setViewFriend] = useState(null);         // { fr, data, busy }
  const [friendFound, setFriendFound] = useState(null);   // null | 'none' | { id, display_name, username, relation }
  const [friendMsg, setFriendMsg] = useState('');
  const [friendReqs, setFriendReqs] = useState([]);
  const [friendBusy, setFriendBusy] = useState(false);
  // --- messages + joint events ---
  const [sharedEvents, setSharedEvents] = useState([]);
  const [inboxRows, setInboxRows] = useState([]);
  const [chatWith, setChatWith] = useState(null);      // a friend entry (with userId)
  const [chatMsgs, setChatMsgs] = useState([]);
  const [chatText, setChatText] = useState('');
  const [inviteSel, setInviteSel] = useState([]);      // Pact user ids to invite
  const [inviteNote, setInviteNote] = useState('');
  const [inviteBusy, setInviteBusy] = useState(false);
  const [editEvent, setEditEvent] = useState(null);    // { id, title, date, start, end, location }
  const sharedRef = useRef({ seen: null });
  // Opening Pact from a phone notification lands on the right tab (e.g. /?tab=social).
  useEffect(() => {
    try {
      const t = new URLSearchParams(window.location.search).get('tab');
      if (t && ['home', 'schedule', 'ideas', 'skills', 'social', 'profile'].includes(t)) setActiveTab(t);
    } catch (e) { /* ignore */ }
  }, []);
  const startedParams = useRef(false);
  // --- Your People (stored with the rest of your data) ---
  const [people, setPeople] = useState([]);
  const [peopleFilter, setPeopleFilter] = useState('all');   // all | personal | business | blocked
  const [personDraft, setPersonDraft] = useState({ name: '', kind: 'personal', relation: '', remindEvery: 30, phone: '', whatsapp: '', email: '' });
  const [reclaimedAt, setReclaimedAt] = useState('');
  const [selectedDateStr, setSelectedDateStr] = useState(() => todayDateStr());

  // --- AUTH & CALENDAR SYNC STATE ---
  const [authUser, setAuthUser] = useState(() => { if (cloud.enabled) return null; try { const v = store.get('roam:session'); return v ? JSON.parse(v) : null; } catch (e) { return null; } });
  const authUserRef = useRef(null);
  const [authReady, setAuthReady] = useState(!cloud.enabled);
  const [syncStatus, setSyncStatus] = useState('idle'); // idle | saving | saved | offline | error
  const cloudRef = useRef({ version: null, timer: null, saving: false, pending: null, email: '', synced: '' });
  const [hydrated, setHydrated] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [calendarSources, setCalendarSources] = useState([]);
  const [calForm, setCalForm] = useState({ provider: 'google', url: '' });
  const [calBusy, setCalBusy] = useState(false);
  const [calStatus, setCalStatus] = useState('');
  const calendarEvents = calendarSources.flatMap(src => src.events || []);
  const [taskSkipState, setTaskSkipState] = useState({ sig: '', skip: [] });
  const [surprisePick, setSurprisePick] = useState(null);
  const [surpriseLoading, setSurpriseLoading] = useState(false);
  const [surpriseSeen, setSurpriseSeen] = useState(() => new Set());
  const [adventurePicks, setAdventurePicks] = useState([]);
  const [adventureSeen, setAdventureSeen] = useState([]);
  const [devWeekStart, setDevWeekStart] = useState(() => mondayOf(todayDateStr()));
  const [skillConfirm, setSkillConfirm] = useState('');
  const [newSkillTimeframe, setNewSkillTimeframe] = useState('4 Weeks');
  const [newStepTarget, setNewStepTarget] = useState('');
  const [toasts, setToasts] = useState([]);
  const pushToast = (text, kind = 'info', action = null) => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev.slice(-3), { id, text, kind, action }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 2000);
    return id;
  };
  // ---- Notification centre: invites, messages, new friends, plan changes ----
  const [notifs, setNotifs] = useState([]);
  const [bellOpen, setBellOpen] = useState(false);
  const seenRef = useRef(null);
  const seenKey = () => 'roam:seen:' + ((authUserRef.current && authUserRef.current.email) || '');
  const seen = () => {
    if (!seenRef.current) { let v = {}; try { v = JSON.parse(localStorage.getItem(seenKey()) || '{}') || {}; } catch (e) { v = {}; } seenRef.current = { req: v.req || null, fr: v.fr || null, unread: v.unread || null, sigs: v.sigs || null, invites: v.invites || null }; }
    return seenRef.current;
  };
  const saveSeen = () => { try { localStorage.setItem(seenKey(), JSON.stringify(seenRef.current)); } catch (e) { /* ignore */ } };
  const lastNotifRef = useRef([]);
  const notify = (text, kind = 'info') => {
    lastNotifRef.current = [...lastNotifRef.current.filter(x => Date.now() - x.at < 30000), { kind, text, at: Date.now() }];
    setNotifs(prev => [{ id: Date.now() + Math.random(), text, kind, at: Date.now(), read: false }, ...prev].slice(0, 50));
    pushToast(text, 'info');
    try {
      if (typeof Notification !== 'undefined' && Notification.permission === 'granted' && typeof document !== 'undefined' && document.visibilityState === 'hidden') {
        const opts = { body: text, icon: '/icons/icon-192.png', tag: 'pact-' + kind };
        if (navigator.serviceWorker && navigator.serviceWorker.ready) navigator.serviceWorker.ready.then(reg => reg.showNotification('Pact', opts)).catch(() => { try { new Notification('Pact', opts); } catch (e) { /* ignore */ } });
        else new Notification('Pact', opts);
      }
    } catch (e) { /* ignore */ }
  };
  // ---- Voice: say what you want to add ----
  const [voice, setVoice] = useState(null);   // null | { listening, text, err }
  const recogRef = useRef(null);
  const voiceSupported = () => typeof window !== 'undefined' && !!(window.SpeechRecognition || window.webkitSpeechRecognition);
  const startVoice = () => {
    const SR = typeof window !== 'undefined' && (window.SpeechRecognition || window.webkitSpeechRecognition);
    if (!SR) { setVoice({ listening: false, text: '', err: "Voice typing isn't available in this browser. In Chrome or Safari it works; otherwise you can type to Roamie instead." }); return; }
    try { if (recogRef.current) recogRef.current.abort(); } catch (e) { /* ignore */ }
    const r = new SR(); recogRef.current = r;
    r.lang = 'en-GB'; r.interimResults = true; r.continuous = false;
    r.onresult = (ev) => { let t = ''; for (let i = 0; i < ev.results.length; i++) t += ev.results[i][0].transcript; setVoice(v => ({ ...(v || {}), listening: true, text: t, err: '' })); };
    r.onerror = (ev) => setVoice(v => ({ ...(v || {}), listening: false, err: ev.error === 'not-allowed' || ev.error === 'service-not-allowed' ? 'Microphone access is blocked. Allow it in your browser or phone settings, then try again.' : ev.error === 'no-speech' ? "I didn't hear anything. Tap the mic and try again." : 'Voice typing had a problem. Try again.' }));
    r.onend = () => setVoice(v => (v ? { ...v, listening: false } : v));
    setVoice({ listening: true, text: '', err: '' });
    try { r.start(); } catch (e) { setVoice({ listening: false, text: '', err: 'Could not start the microphone.' }); }
  };
  const stopVoice = () => { try { if (recogRef.current) recogRef.current.stop(); } catch (e) { /* ignore */ } };
  const closeVoice = () => { try { if (recogRef.current) recogRef.current.abort(); } catch (e) { /* ignore */ } setVoice(null); };
  const submitVoice = () => {
    const t = (voice && voice.text || '').trim(); if (!t) return;
    closeVoice(); setRoamieOpen(true); submitRoamie(t);
  };
  const [ideaFresh, setIdeaFresh] = useState([]);
  const [favourites, setFavourites] = useState([]);
  const [showFavs, setShowFavs] = useState(false);
  const favKey = (i) => `${i.category}|${String(i.title || '').toLowerCase()}`;
  const isFav = (i) => favourites.some(f => favKey(f) === favKey(i));
  const toggleFav = (i) => {
    if (isFav(i)) { setFavourites(prev => prev.filter(f => favKey(f) !== favKey(i))); pushToast(`Removed ${i.title} from favourites.`, 'info'); }
    else { setFavourites(prev => [{ ...i }, ...prev]); pushToast(`Saved ${i.title} to favourites.`, 'success'); }
  };
  const [ideaNotice, setIdeaNotice] = useState('');
  const [widgetPanelOpen, setWidgetPanelOpen] = useState(false);
  const [homeLayout, setHomeLayout] = useState(DEFAULT_HOME_LAYOUT);
  const [textScale, setTextScale] = useState(() => { const v = parseFloat(store.get('roam:textscale') || '1'); return [1, 1.15, 1.3].includes(v) ? v : 1; });
  useEffect(() => { try { document.documentElement.style.zoom = textScale === 1 ? '' : String(textScale); } catch (e) { /* ignore */ } store.set('roam:textscale', String(textScale)); }, [textScale]);
  const [homeNotes, setHomeNotes] = useState('');
  const [water, setWater] = useState({ date: todayDateStr(), count: 0 });
  const [countdown, setCountdown] = useState({ title: 'Next deadline', date: '' });
  const [openTile, setOpenTile] = useState(null);
  const [slotEls, setSlotEls] = useState({});
  const registerSlot = useCallback((id, el) => setSlotEls(p => (p[id] === el ? p : { ...p, [id]: el })), []);
  const [reading, setReading] = useState({ title: '', author: '', total: 300, page: 0, dailyGoal: 20, log: {}, finished: [] });

  // The week shown in the Schedule tab follows the selected date, so you can scroll to any week.
  const weekMonday = mondayOf(selectedDateStr);
  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const full = addDaysStr(weekMonday, i);
    return { day: dayKeyOf(full), date: String(Number(full.slice(8))), full };
  });
  const shortDate = (d) => new Date(d + 'T12:00:00').toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
  const weekLabel = `${shortDate(weekDays[0].full)} \u2013 ${shortDate(weekDays[6].full)}${weekDays[0].full.slice(0, 4) !== todayDateStr().slice(0, 4) ? ' ' + weekDays[0].full.slice(0, 4) : ''}`;

  // --- ACCOUNT & PROFILE STATE ---
  const [accountInfo, setAccountInfo] = useState({
    name: 'Alex Rivera',
    username: '@alexroams',
    email: 'alex.rivera@manchester.ac.uk',
    signedUp: true
  });

  const [userProfile, setUserProfile] = useState({
    status: 'University Student',
    googleCalSynced: true,
    prepTimeCasual: 25,
    prepTimeSerious: 65,
    dailyActivityCap: 4,
    weeklyHours: {
      Mon: { active: true, start: '09:00', end: '17:00' },
      Tue: { active: true, start: '10:00', end: '16:00' },
      Wed: { active: true, start: '09:00', end: '13:00' },
      Thu: { active: true, start: '09:00', end: '17:00' },
      Fri: { active: true, start: '09:00', end: '15:00' },
      Sat: { active: false, start: '09:00', end: '17:00' },
      Sun: { active: false, start: '09:00', end: '17:00' }
    }
  });

  const [moreOpen, setMoreOpen] = useState(false);
  const [circleOpen, setCircleOpen] = useState(false);
  const [calmFull, setCalmFull] = useState(false);
  useEffect(() => { try { document.documentElement.style.setProperty('--pact-zoom', String(ZOOM[comfortOf(userProfile).size] || 1)); } catch (e) {} }, [userProfile.comfort]);
  const patchProfile = (o) => setUserProfile(prev => ({ ...prev, ...o }));
  const [friendsList, setFriendsList] = useState([]);
  const [newFriendName, setNewFriendName] = useState('');
  const [inviteCopied, setInviteCopied] = useState(false);

  // --- CUSTOM COLOR CATEGORIES FOR PLANNER ---
  const [customCategories, setCustomCategories] = useState([
    { id: 'work', name: 'Work & Study', color: '#2A5359' }, // Royal Blue
    { id: 'social', name: 'Friends & Social', color: '#B5683A' }, // Crimson Red
    { id: 'leisure', name: 'Solo & Outdoor', color: '#1F3A2E' } // Deep Purple
  ]);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryColor, setNewCategoryColor] = useState('#2F4A3C');

  // --- WEEKLY TARGETS (HOME) ---
  const [weeklyTargets, setWeeklyTargets] = useState([
    { id: 't1', title: 'Get Outdoors', current: 2, target: 3, unit: 'sessions', category: 'leisure' },
    { id: 't2', title: 'Machine Learning Upskilling', current: 2, target: 3, unit: 'blocks', category: 'work' },
    { id: 't3', title: 'Bouldering / Movement', current: 1, target: 2, unit: 'sessions', category: 'leisure' }
  ]);
  const [showAddTarget, setShowAddTarget] = useState(false);
  const [newTargetTitle, setNewTargetTitle] = useState('');
  const [newTargetCount, setNewTargetCount] = useState(3);
  const [editingTargetId, setEditingTargetId] = useState(null);

  // --- DAILY MOOD TRACKER & HISTORICAL LOGS ---
  const [todayMood, setTodayMood] = useState(null);
  const [todayMoodReason, setTodayMoodReason] = useState('Balanced schedule');
  const [moodLogs, setMoodLogs] = useState([
    { date: '2026-11-12', mood: 'Great', score: 5, reason: 'Outdoor walk + finished early', tasksCompleted: 3 },
    { date: '2026-11-13', mood: 'Okay', score: 3, reason: 'Back-to-back lectures', tasksCompleted: 4 },
    { date: '2026-11-14', mood: 'Low', score: 2, reason: 'Too much stuff to do today', tasksCompleted: 6 },
    { date: '2026-11-15', mood: 'Great', score: 5, reason: 'Depot climbing + Sunday meal prep', tasksCompleted: 3 }
  ]);

  // --- MEDICINE REMINDERS & ESSENTIALS ---
  const [medications, setMedications] = useState([
    { id: 'm1', name: 'Vitamin D3 + K2', time: '08:30', taken: true },
    { id: 'm2', name: 'Omega-3 / Daily Med', time: '13:00', taken: false }
  ]);
  const [newMedName, setNewMedName] = useState('');
  const [newMedTime, setNewMedTime] = useState('09:00');
  const [showAddMed, setShowAddMed] = useState(false);

  // --- STANDALONE MEALS & BATCH PREP INVENTORY ---
  const [mealBatches, setMealBatches] = useState([
    { id: 'b1', name: 'Harissa Chicken & Quinoa Bowls', portionsLeft: 3 },
    { id: 'b2', name: 'Roasted Aubergine Miso Curry', portionsLeft: 2 }
  ]);
  const [newBatchName, setNewBatchName] = useState('');
  const [newBatchPortions, setNewBatchPortions] = useState(4);
  const [showAddBatch, setShowAddBatch] = useState(false);

  const [dailyMeals, setDailyMeals] = useState([
    { id: 'meal_b', label: 'Breakfast', time: '08:30', eaten: true, mode: 'Cooked New', detail: 'Overnight oats & berries', selectedBatchId: '' },
    { id: 'meal_l', label: 'Lunch', time: '13:00', eaten: false, mode: 'Meal Prep Stock', detail: '', selectedBatchId: 'b1' },
    { id: 'meal_d', label: 'Dinner', time: '19:30', eaten: false, mode: 'Ate Out', detail: '', selectedBatchId: '' }
  ]);
  const [mealHistoryLogs, setMealHistoryLogs] = useState([
    { date: '2026-11-15', meal: 'Lunch', mode: 'Meal Prep Stock', detail: 'Harissa Chicken & Quinoa Bowls' },
    { date: '2026-11-15', meal: 'Dinner', mode: 'Ate Out', detail: 'Tokyo Ramen (Tonkotsu)' }
  ]);

  // Ticking a meal logs it (using the portions you chose). Un-ticking undoes it completely, so a mis-click never costs stock.
  const handleToggleMealEaten = (mealId) => {
    const m = dailyMeals.find(x => x.id === mealId);
    if (!m) return;
    if (!m.eaten) {
      const wanted = m.mode === 'Meal Prep Stock' ? Math.max(1, m.portions || 1) : 0;
      let deducted = 0;
      if (wanted && m.selectedBatchId) {
        const batch = mealBatches.find(b => b.id === m.selectedBatchId);
        deducted = Math.min(wanted, batch ? batch.portionsLeft : 0);
        if (deducted) setMealBatches(bs => bs.map(b => (b.id === m.selectedBatchId ? { ...b, portionsLeft: b.portionsLeft - deducted } : b)));
      }
      const batchObj = mealBatches.find(b => b.id === m.selectedBatchId);
      const logDetail = m.mode === 'Meal Prep Stock' ? (batchObj?.name || 'Prepped Meal') : (m.detail || m.mode);
      const logId = `ml_${Date.now()}`;
      setMealHistoryLogs(logs => [...logs, { id: logId, date: selectedDateStr, meal: m.label, mode: m.mode, detail: logDetail, portions: wanted || undefined }]);
      setDailyMeals(prev => prev.map(x => (x.id === mealId ? { ...x, eaten: true, deducted, loggedBatchId: x.selectedBatchId, logId } : x)));
    } else {
      if (m.deducted && m.loggedBatchId) setMealBatches(bs => bs.map(b => (b.id === m.loggedBatchId ? { ...b, portionsLeft: b.portionsLeft + m.deducted } : b)));
      if (m.logId) setMealHistoryLogs(logs => logs.filter(l => l.id !== m.logId));
      setDailyMeals(prev => prev.map(x => (x.id === mealId ? { ...x, eaten: false, deducted: 0, loggedBatchId: '', logId: '' } : x)));
    }
  };

  // --- LONG-TERM LIFE CADENCE (HOME) ---
  const [lifeCadenceItems, setLifeCadenceItems] = useState([
    { id: 'lc1', title: 'Cat Booster Vaccination (Mochi)', interval: 'Every 3 Months', dueDate: addDaysStr(todayDateStr(), 5), contactType: 'url', contactValue: 'https://www.google.com/maps/search/?api=1&query=vets4pets+Manchester' },
    { id: 'lc2', title: 'Dental Hygienist Checkup', interval: 'Every 6 Months', dueDate: addDaysStr(todayDateStr(), 30), contactType: 'phone', contactValue: '+441612345678' },
    { id: 'lc3', title: 'Climbing Shoe Resole Drop-off', interval: 'Every 4 Months', dueDate: addDaysStr(todayDateStr(), 14), contactType: 'whatsapp', contactValue: '447700900123' }
  ]);
  const [showAddCadence, setShowAddCadence] = useState(false);
  const blankCadence = () => ({ title: '', interval: 'Every 3 Months', dueDate: addDaysStr(todayDateStr(), 91), contactType: 'url', contactValue: 'https://' });
  const [newCadence, setNewCadence] = useState(blankCadence);
  const [editingCadenceId, setEditingCadenceId] = useState(null);
  const cadenceDueText = (item) => {
    if (!item.dueDate) return item.due || 'No date set';
    const n = daysBetween(todayDateStr(), item.dueDate);
    if (n < 0) return `Overdue by ${-n} day${n === -1 ? '' : 's'}`;
    if (n === 0) return 'Due today';
    if (n === 1) return 'Due tomorrow';
    if (n <= 14) return `Due in ${n} days`;
    return `Due ${shortDate(item.dueDate)}`;
  };

  // --- FEEDBACK WIDGET ---
  const [roamFeedbackRating, setRoamFeedbackRating] = useState(null);
  const [roamFeedbackComment, setRoamFeedbackComment] = useState('');
  const [roamFeedbackSent, setRoamFeedbackSent] = useState(false);

  // --- SCHEDULED TASKS & ACTIVITIES (TODAY & PLAN TABS) ---
  const [tasks, setTasks] = useState([
    {
      id: 101,
      title: 'Python & Decision Trees Study Session',
      duration: 45,
      status: 'pending',
      startTime: '10:00',
      endTime: '10:45',
      date: shiftSeed('2026-11-16'),
      type: 'analytical',
      categoryColor: 'work',
      location: 'Alan Gilbert Learning Commons',
      transportMode: 'Bus 142 (Every 5m)',
      travelTime: 15,
      distance: '1.1 mi',
      leaveByNote: 'Leave by 09:45 via Oxford Rd Bus 142',
      notes: 'Review Gini impurity & scikit-learn tree pruning.',
      rating: null,
      reviewNote: '',
      withPerson: null,
      meetingType: 'Friendly'
    }
  ]);

  const [expandedTaskId, setExpandedTaskId] = useState(101);
  const [sheetTaskId, setSheetTaskId] = useState(null);
  useEffect(() => { const k = (e) => { if (e.key === 'Escape') { setSheetTaskId(null); setIdeaOpenId(null); } }; window.addEventListener('keydown', k); return () => window.removeEventListener('keydown', k); }, []);
  const [skillOpen, setSkillOpen] = useState(false);
  const [buddies, setBuddies] = useState([]);
  // ---- schedule listings: friends who share with me, my own sharing choices ----
  const [matching, setMatching] = useState(false);
  const [sharePanel, setSharePanel] = useState(false);
  const [schedShared, setSchedShared] = useState([]);
  const [schedGrants, setSchedGrants] = useState([]);
  const [schedLoaded, setSchedLoaded] = useState(false);
  const [reclaimedMinutes, setReclaimedMinutes] = useState(null);
  const [showSocialNudge, setShowSocialNudge] = useState(true);
  const [socialNudgeStep, setSocialNudgeStep] = useState('initial');

  const filteredTasks = tasks.filter(t => t.date === selectedDateStr).sort((a, b) => a.startTime.localeCompare(b.startTime));

  const handleLogMood = (moodLabel, score) => {
    setTodayMood(moodLabel);
    const updatedCap = computeCap(moodLabel, todayMoodReason).cap;
    setUserProfile(prev => ({ ...prev, dailyActivityCap: updatedCap }));
    setMoodLogs(prev => {
      const filtered = prev.filter(m => m.date !== selectedDateStr);
      return [...filtered, { date: selectedDateStr, mood: moodLabel, score, reason: todayMoodReason, tasksCompleted: filteredTasks.length }];
    });
    pushToast(`Mood logged: ${moodLabel}. ${authUser && authUser.guest ? 'Saved for this session (create an account to keep it).' : 'Saved to your data.'} Daily cap is now ${updatedCap}.`, 'success');
  };

  // --- COMPREHENSIVE MULTI-MODE SMART PLANNER STATE ---
  const [plannerOpen, setPlannerOpen] = useState(false);
  const [showPrivacyNotice, setShowPrivacyNotice] = useState(false);
  // Install as an app (home screen)
  const [installEvt, setInstallEvt] = useState(null);
  const isStandalone = typeof window !== 'undefined' && ((window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) || window.navigator.standalone === true);
  const isIos = typeof navigator !== 'undefined' && /iphone|ipad|ipod/i.test(navigator.userAgent);
  useEffect(() => {
    const on = (e) => { e.preventDefault(); setInstallEvt(e); };
    window.addEventListener('beforeinstallprompt', on);
    window.addEventListener('appinstalled', () => setInstallEvt(null));
    return () => window.removeEventListener('beforeinstallprompt', on);
  }, []);
  const installApp = async () => { if (!installEvt) return; installEvt.prompt(); try { await installEvt.userChoice; } catch (e) {} setInstallEvt(null); };
  const [plannerMode, setPlannerMode] = useState('event'); // 'event', 'task', 'activity', 'surprise'
  const [linkedTargetId, setLinkedTargetId] = useState(null);
  const [plannerResultsStep, setPlannerResultsStep] = useState(false);
  const [venueSort, setVenueSort] = useState('best');
  const [locBusy, setLocBusy] = useState(false);
  const [locMsg, setLocMsg] = useState('');
  const [pcDraft, setPcDraft] = useState('');
  const [locAsk, setLocAsk] = useState(false);
  const locRef = useRef(null); locRef.current = userProfile.location;
  // Only while the app is open and only if the person switched it on: re-check on open/return and update when they have moved about half a kilometre.
  useEffect(() => {
    if (!userProfile.autoLocation || typeof navigator === 'undefined' || !navigator.geolocation || typeof document === 'undefined') return undefined;
    let busy = false;
    const check = () => {
      if (busy || document.visibilityState !== 'visible') return;
      busy = true;
      navigator.geolocation.getCurrentPosition(async (pos) => {
        try {
          const cur = locRef.current; const la = pos.coords.latitude, lo = pos.coords.longitude;
          if (!cur || cur.lat == null || cur.assumed || haversineKm(la, lo, cur.lat, cur.lon) >= 0.5) {
            const l = await reverseGeocode(la, lo);
            setUserProfile(prev => ({ ...prev, location: l }));
            setEventConfig(c => ({ ...c, postcode: l.postcode || l.city }));
          }
        } catch (e) { /* keep the old place */ }
        busy = false;
      }, () => { busy = false; }, { timeout: 8000, maximumAge: 10000 });
    };
    check();
    document.addEventListener('visibilitychange', check);
    return () => document.removeEventListener('visibilitychange', check);
  }, [userProfile.autoLocation]);
  const [venueRefreshOffset, setVenueRefreshOffset] = useState(0);
  const [isSearchingLiveVenues, setIsSearchingLiveVenues] = useState(false);
  const [isSearchingLiveIdeas, setIsSearchingLiveIdeas] = useState(false);
  const [scheduleConflictWarning, setScheduleConflictWarning] = useState(null);

  const [eventConfig, setEventConfig] = useState({
    eventType: 'Date Night (Serious)',
    activityDropdown: 'Outdoor Scenic Walk',
    vibeKeywords: 'romantic candlelit intimate',
    postcode: 'M1 5GD',
    budget: '££',
    dietary: ['Halal', 'Vegetarian'],
    date: todayDateStr(),
    startTime: '19:30',
    duration: 90,
    selectedVenue: null
  });

  const [colorsOpen, setColorsOpen] = useState(false);
  const [taskConfig, setTaskConfig] = useState({
    title: 'Complete ML Feature Engineering Assignment',
    category: 'Work & Study',
    deadline: addDaysStr(todayDateStr(), 4),
    totalHours: 3,
    blocks: 3,
    pref: 'afternoon', // morning | afternoon | evening | any
    date: todayDateStr(),
    startTime: '09:00'
  });

  const [surpriseConfig, setSurpriseConfig] = useState({
    budget: '££',
    duration: 90,
    vibe: 'Adventurous & Quirky',
    day: addDaysStr(todayDateStr(), 3),
    startTime: '18:30',
    rolledIndex: 0,
    showPopup: false
  });

  const dietaryOptionsList = ['Halal', 'Kosher', 'Vegetarian', 'Vegan', 'Pescatarian', 'No-Beef', 'Nut-Allergy'];

  const [reviewMatchedVenues, setReviewMatchedVenues] = useState([
    {
      id: 'v1',
      name: '20 Stories Rooftop & Terrace',
      postcode: 'M3 3EB (0.5 mi from M1)',
      price: '£££',
      rating: 4.8,
      dietaryAvailable: ['Halal', 'Vegetarian', 'Vegan', 'Pescatarian', 'No-Beef', 'Nut-Allergy'],
      reviewKeywords: ['romantic', 'candlelit', 'intimate', 'date', 'scenic', 'cocktails', 'celebration', 'upscale'],
      reviewSnippet: '“...an effortlessly romantic, candlelit atmosphere overlooking the skyline—our server was super attentive with Halal & nut-allergy options...”',
      transportNote: 'Leave 35m prior via St Peter’s Sq Tram (Every 6m)'
    },
    {
      id: 'v2',
      name: 'Maray Manchester (Albert Square)',
      postcode: 'M2 5PF (0.3 mi from M1)',
      price: '££',
      rating: 4.9,
      dietaryAvailable: ['Halal', 'Kosher', 'Vegetarian', 'Vegan', 'Pescatarian', 'No-Beef'],
      reviewKeywords: ['romantic', 'cozy', 'intimate', 'vibrant', 'warm', 'sharing', 'middle eastern', 'buzzy'],
      reviewSnippet: '“...cozy, dimly-lit corners perfect for an intimate date night. Dedicated vegetarian, vegan and Halal meat menu items...”',
      transportNote: 'Leave 30m prior via Bus 36 / 10m walk from Piccadilly'
    },
    {
      id: 'v3',
      name: 'Dishoom Manchester Hall',
      postcode: 'M3 3BE (0.4 mi from M1)',
      price: '££',
      rating: 4.9,
      dietaryAvailable: ['Halal', 'Vegetarian', 'Vegan', 'No-Beef', 'Nut-Allergy'],
      reviewKeywords: ['lively', 'romantic', 'historic', 'group', 'birthday', 'stained glass', 'warm'],
      reviewSnippet: '“...stunning architectural dining room with warm, romantic lighting and full Halal & allergen menus...”',
      transportNote: 'Leave 30m prior via Victoria Tram / Car (12m drive)'
    },
    {
      id: 'v4',
      name: '7 Spot Pottery & Artisan Studio',
      postcode: 'M4 6JW (0.7 mi from M1)',
      price: '££',
      rating: 4.8,
      dietaryAvailable: ['Vegetarian', 'Vegan', 'Halal', 'Nut-Allergy'],
      reviewKeywords: ['creative', 'relaxing', 'hands-on', 'pottery', 'craft', 'mindful', 'cozy'],
      reviewSnippet: '“...such a mindful, creative indoor escape! Great oat lattes and tactile wheel-throwing sessions...”',
      transportNote: 'Leave 25m prior via New Islington Tram'
    },
    {
      id: 'v5',
      name: 'Erst Natural Wine & Small Plates',
      postcode: 'M4 6WX (0.6 mi from M1)',
      price: '£££',
      rating: 4.8,
      dietaryAvailable: ['Vegetarian', 'Vegan', 'Pescatarian', 'No-Beef', 'Nut-Allergy'],
      reviewKeywords: ['minimalist', 'romantic', 'intimate', 'date', 'modern', 'candlelit', 'quiet'],
      reviewSnippet: '“...sleek minimalist industrial room in Ancoats with warm low lighting, seasonal flatbreads, and thoughtful date-night pacing...”',
      transportNote: 'Leave 20m prior via New Islington Tram'
    },
    {
      id: 'v6',
      name: 'Climat Rooftop Dining & Terrace',
      postcode: 'M3 1AS (0.5 mi from M1)',
      price: '£££',
      rating: 4.7,
      dietaryAvailable: ['Vegetarian', 'Pescatarian', 'No-Beef', 'Nut-Allergy'],
      reviewKeywords: ['scenic', 'romantic', 'birthday', 'anniversary', 'panoramic', 'elevated'],
      reviewSnippet: '“...8th-floor rooftop views across Manchester—super atmospheric at dusk for anniversaries or birthdays...”',
      transportNote: 'Leave 25m prior via Victoria Station Tram'
    },
    {
      id: 'v7',
      name: 'Bundobust Brewery & Street Food',
      postcode: 'M1 4BT (0.2 mi from M1)',
      price: '£',
      rating: 4.8,
      dietaryAvailable: ['Vegetarian', 'Vegan', 'Halal', 'No-Beef', 'Nut-Allergy'],
      reviewKeywords: ['lively', 'fun', 'group', 'casual', 'vibrant', 'friends', 'buzzy'],
      reviewSnippet: '“...100% vegetarian & vegan Gujarati street food with vibrant long-table energy, ideal for group catch-ups...”',
      transportNote: 'Leave 15m prior via St Peter’s Sq Tram'
    },
    {
      id: 'v8',
      name: 'Comptoir Libanais Spinningfields',
      postcode: 'M3 3AE (0.6 mi from M1)',
      price: '££',
      rating: 4.6,
      dietaryAvailable: ['Halal', 'Vegetarian', 'Vegan', 'Pescatarian', 'No-Beef', 'Nut-Allergy'],
      reviewKeywords: ['warm', 'colorful', 'birthday', 'group', 'casual', 'cozy', 'romantic'],
      reviewSnippet: '“...full Halal menu with mezze platters, rose mint tea, and warm lantern lighting...”',
      transportNote: 'Leave 25m prior via Free Bus 1 / Deansgate'
    }
  ]);

  const [selectedVenueMatch, setSelectedVenueMatch] = useState(null);

  const surprisePoolUnused = [
    { title: 'Moonlight Kayaking on Bridgewater Canal', vibe: 'Adventurous & Quirky', budget: '££', duration: 90, location: 'Castlefield Basin (M3 4JR)', desc: 'Guided illuminated kayak tour under historic viaducts with hot spiced apple cider.', transport: 'Leave 30m prior via Deansgate-Castlefield Tram' },
    { title: 'Secret Underground Jazz & Tapas Cellar', vibe: 'Cozy & Cultural', budget: '££', duration: 120, location: 'Northern Quarter Vaults (M4 1LW)', desc: 'Intimate acoustic brass quartet with Halal & Vegetarian small plates.', transport: 'Leave 25m prior via Shudehill Bus/Tram Interchange' },
    { title: 'Tufting Workshop: Make a Mini Rug', vibe: 'Creative & Hands-On', budget: '££', duration: 90, location: 'Pollard Yard Art Studios (M40 7FS)', desc: 'Learn to operate a yarn tufting gun in an industrial shipping container studio.', transport: 'Leave 25m prior via Holt Town Tram' },
    { title: 'Peak District Sunset Ridge Walk & Pub Pie', vibe: 'Outdoor & Refreshing', budget: '£', duration: 150, location: 'Edale / Mam Tor (S33 7ZA)', desc: 'Direct 42-min train from Piccadilly for golden hour ridge views.', transport: 'Catch 16:18 Northern Train from Platform 13' }
  ];

  // --- IDEAS TAB STATE & EXPANDED REAL-WORLD OPTIONS ---
  const loc = getLoc(userProfile);
  const IDEA_CATEGORIES_BASE = ['Food', 'Indoor', 'Outdoor', 'Sports', 'Shopping', 'Trips'];
  const ideaCategories = (() => { const mine = (userProfile.interests || []).filter(c => IDEA_CATEGORIES_BASE.includes(c)); return [...mine, ...IDEA_CATEGORIES_BASE.filter(c => !mine.includes(c))]; })();
  const [selectedIdeaCategory, setSelectedIdeaCategory] = useState('Food');
  // Colour theme: saved with the account and remembered on this device.
  const themeNow = userProfile.theme || readStoredTheme();
  useEffect(() => {
    applyTheme(themeNow);
    try { localStorage.setItem(THEME_KEY, JSON.stringify(themeNow)); } catch (e) {}
    if (themeNow.mode !== 'auto' || !window.matchMedia) return;
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const fn = () => applyTheme(themeNow);
    mq.addEventListener ? mq.addEventListener('change', fn) : mq.addListener(fn);
    return () => { mq.removeEventListener ? mq.removeEventListener('change', fn) : mq.removeListener(fn); };
  }, [themeNow.palette, themeNow.mode]);
  const setTheme = (patch) => setUserProfile(prev => ({ ...prev, theme: { ...(prev.theme || readStoredTheme()), ...patch } }));
  // Filter chips are remembered per category (saved with your account) until you clear them.
  const activeFilterLabels = (userProfile.ideaFilters && userProfile.ideaFilters[selectedIdeaCategory]) || [];
  const activeFilterDefs = filterDefs(selectedIdeaCategory, activeFilterLabels);
  const setActiveFilterLabels = (labels) => setUserProfile(prev => ({ ...prev, ideaFilters: { ...(prev.ideaFilters || {}), [selectedIdeaCategory]: labels } }));
  const toggleIdeaFilter = (label) => setActiveFilterLabels(activeFilterLabels.includes(label) ? activeFilterLabels.filter(x => x !== label) : [...activeFilterLabels, label]);
  const [adventurousMode, setAdventurousMode] = useState(false);
  const [adventureBusy, setAdventureBusy] = useState(false);
  const [userPreferenceBoost, setUserPreferenceBoost] = useState(null);

  const [ideasFeed, setIdeasFeed] = useState([
    // FOOD
    { id: 1, category: 'Food', title: 'Pollen Bakery', desc: 'Sourdough viennoiserie & waterfront seating at New Islington Marina.', rating: 4.9, userRating: null, price: '££', sub1: 'Bakery & Brunch', sub2: 'Morning', deal: '10% off w/ Pact Student ID on Tue', distance: '1.2 mi' },
    { id: 2, category: 'Food', title: 'Maray Albert Square', desc: 'Vibrant Parisian-inspired Middle Eastern plates. Great Halal & Vegan options.', rating: 4.8, userRating: null, price: '££', sub1: 'Dinner & Small Plates', sub2: 'Evening', deal: '50% off Vegetarian plates on Green Mondays', distance: '0.5 mi' },
    { id: 3, category: 'Food', title: 'Tokyo Ramen', desc: 'Intimate no-reservations spot for rich tonkotsu and vegan tantanmen.', rating: 4.9, userRating: null, price: '£', sub1: 'Japanese & Ramen', sub2: 'Lunch / Dinner', deal: 'Lunch combo £11 Mon-Thu', distance: '0.7 mi' },
    { id: 14, category: 'Food', title: 'Companio Bakery', desc: 'Independent artisan micro-bakery in Ancoats famous for savory danishes.', rating: 4.9, userRating: null, price: '£', sub1: 'Bakery & Brunch', sub2: 'Morning', deal: 'Coffee + Pastry bundle £5.50 before 10am', distance: '0.9 mi' },
    { id: 15, category: 'Food', title: 'Erst Ancoats', desc: 'Minimalist seasonal small plates, grilled flatbreads & low-intervention wine.', rating: 4.8, userRating: null, price: '£££', sub1: 'Dinner & Small Plates', sub2: 'Evening', deal: 'Early evening set menu Wed–Thu', distance: '1.0 mi' },
    { id: 16, category: 'Food', title: 'Yuzu Japanese Tapas', desc: 'Authentic family-run Chinatown izakaya serving gyoza, sashimi & katsu.', rating: 4.8, userRating: null, price: '££', sub1: 'Japanese & Ramen', sub2: 'Evening', deal: 'Complimentary green tea with lunch sets', distance: '0.4 mi' },
    // INDOOR
    { id: 4, category: 'Indoor', title: '7 Spot Pottery Cafe', desc: 'Ceramic painting, wheel taster sessions and specialty matcha.', rating: 4.8, userRating: null, price: '££', sub1: 'Art & Craft Cafe', sub2: 'Creative', deal: '2-for-1 Studio Fee on Thursdays', distance: '1.5 mi' },
    { id: 5, category: 'Indoor', title: 'Chapter One Books & Coffee', desc: 'Reading room with typewriters, fountain pens and quiet desks.', rating: 4.7, userRating: null, price: '£', sub1: 'Study & Reading', sub2: 'Focus', deal: 'Free refill for students before 12pm', distance: '0.6 mi' },
    { id: 17, category: 'Indoor', title: 'Whitworth Art Gallery & Park Cafe', desc: 'Contemporary textile & architectural exhibitions overlooking the trees.', rating: 4.9, userRating: null, price: 'Free', sub1: 'Art & Craft Cafe', sub2: 'Creative', deal: 'Free late-Thursday curator talks', distance: '1.6 mi' },
    { id: 18, category: 'Indoor', title: 'Central Library Wolfson Reading Room', desc: 'Iconic domed Pantheon-inspired quiet study hall with power sockets.', rating: 4.9, userRating: null, price: 'Free', sub1: 'Study & Reading', sub2: 'Focus', deal: 'Free archive exhibitions downstairs', distance: '0.3 mi' },
    // OUTDOOR
    { id: 6, category: 'Outdoor', title: 'Castlefield Viaduct Sky Park', desc: 'National Trust elevated industrial garden with flora walks.', rating: 4.8, userRating: null, price: 'Free', sub1: 'Urban Nature', sub2: 'Gentle Walk', deal: 'Free guided botanical tour @ 2pm', distance: '1.1 mi' },
    { id: 7, category: 'Outdoor', title: 'Fletcher Moss Botanical Gardens', desc: 'Tranquil rock gardens and woodland trails in Didsbury.', rating: 4.9, userRating: null, price: 'Free', sub1: 'Botanical Trail', sub2: 'Scenic Hike', deal: 'Community coffee van discount', distance: '4.5 mi' },
    { id: 20, category: 'Outdoor', title: 'Mayfield Park & River Medlock', desc: 'Manchester’s first new city park in 100 years with sunken river walkways.', rating: 4.8, userRating: null, price: 'Free', sub1: 'Urban Nature', sub2: 'Gentle Walk', deal: 'Next to Freight Island food hall', distance: '0.6 mi' },
    { id: 21, category: 'Outdoor', title: 'Heaton Park Woodland & Boat Lake', desc: '600-acre historic park with rowboats, observatory hilltop and animal centre.', rating: 4.8, userRating: null, price: 'Free', sub1: 'Botanical Trail', sub2: 'Scenic Hike', deal: 'Direct Bowker Vale tram stop access', distance: '3.8 mi' },
    // SPORTS
    { id: 8, category: 'Sports', title: 'Depot Climbing Manchester', desc: 'Expansive bouldering walls, kilter board & training gym.', rating: 4.9, userRating: 5, price: '£', sub1: 'Indoor', sub2: 'Strength & Technique', deal: 'Student Discount Days: Wed & Fri (£7.50)', distance: '2.3 mi' },
    { id: 9, category: 'Sports', title: 'Ancoats 5K Run & Mobility Club', desc: 'Paced canal-side social run followed by outdoor stretching.', rating: 4.7, userRating: null, price: 'Free', sub1: 'Outdoor', sub2: 'Cardio & Social', deal: 'Free pastry at Pollen every 5th run', distance: '0.8 mi' },
    { id: 22, category: 'Sports', title: 'Block Workout Northern Quarter', desc: 'Calisthenics, rings, and functional mobility studio.', rating: 4.9, userRating: null, price: '££', sub1: 'Indoor', sub2: 'Strength & Technique', deal: 'First intro class £8', distance: '0.7 mi' },
    { id: 23, category: 'Sports', title: 'Club de Padel Deansgate', desc: 'Outdoor glass-walled panoramic padel courts with equipment hire.', rating: 4.8, userRating: null, price: '££', sub1: 'Outdoor', sub2: 'Cardio & Social', deal: 'Off-peak student court rate 10am–3pm', distance: '0.9 mi' },
    // SHOPPING
    { id: 10, category: 'Shopping', title: 'Fred Aldous & Home Design', desc: 'Curated homeware, architectural stationery, film cameras & fine art supplies.', rating: 4.9, userRating: null, price: '££', sub1: 'Homeware & Art', sub2: 'Indie Store', deal: '20% Student & Pact Member Discount Next Week', distance: '0.6 mi' },
    { id: 11, category: 'Shopping', title: 'Afflecks & Northern Quarter Vintage', desc: 'Independent vintage fashion, streetwear & vinyl boutiques.', rating: 4.7, userRating: null, price: '£', sub1: 'Clothes & Vintage', sub2: 'Fashion', deal: 'Vintage Kilo Sale this Saturday', distance: '0.6 mi' },
    { id: 24, category: 'Shopping', title: 'Manchester Craft & Design Centre', desc: 'Victorian market turned into 30+ independent ceramics, textile & jewelry studios.', rating: 4.9, userRating: null, price: '££', sub1: 'Homeware & Art', sub2: 'Indie Store', deal: 'Meet-the-maker studio open days on Sat', distance: '0.7 mi' },
    // TRIPS
    { id: 12, category: 'Trips', title: 'Edale & Mam Tor Day Escape', desc: 'Direct Hope Valley train for dramatic ridge walks.', rating: 4.9, userRating: null, price: '£12 Return', sub1: 'Day Trip (Train)', sub2: 'This Weekend', deal: 'Off-Peak Railcard fare drop', distance: '42m Train', dest: 'Edale' },
    { id: 13, category: 'Trips', title: 'Milan Architectural & Design Weekend', desc: 'Visit Fondazione Prada & Villa Necchi Campiglio.', rating: 4.9, userRating: null, price: '£48 Return Flights', sub1: 'Future Getaway (Flight)', sub2: 'In 6 Weeks', deal: 'Mid-week flight fare alert', distance: '2h 10m Flight', dest: 'Milan' },
    { id: 26, category: 'Trips', title: 'Hebden Bridge & Steep Canal Walk', desc: 'Bohemian mill town filled with indie bookshops, cafes and woodland trails.', rating: 4.8, userRating: null, price: '£9.80 Return', sub1: 'Day Trip (Train)', sub2: 'This Weekend', deal: 'Direct 28m train from Manchester Victoria', distance: '28m Train', dest: 'Hebden Bridge' },
    { id: 27, category: 'Trips', title: 'Copenhagen Design & Bakery Weekend', desc: 'Explore Louisiana Museum, cycling bridges and cardamom buns.', rating: 4.9, userRating: null, price: '£54 Return Flights', sub1: 'Future Getaway (Flight)', sub2: 'In 8 Weeks', deal: 'Direct flight from MAN T1', distance: '1h 55m Flight', dest: 'Copenhagen' }
  ]);

  const ideaSubFilterOptions = Object.fromEntries(Object.entries(IDEA_FILTERS).map(([k, v]) => [k, v.map(f => f.label)]));

  // --- SKILLS TAB: LIVING BRANCHING TREE ---
  const [skillTreeDomain, setSkillTreeDomain] = useState('work');
  const [selectedBranchId, setSelectedBranchId] = useState('b_data');
  const [selectedSkillId, setSelectedSkillId] = useState('s_ml');
  const [newStepText, setNewStepText] = useState('');
  const [newSkillName, setNewSkillName] = useState('');
  const [showAddSkillModal, setShowAddSkillModal] = useState(false);
  const [showAddBranchModal, setShowAddBranchModal] = useState(false);
  const [newBranchName, setNewBranchName] = useState('');
  const [newBranchFirstSkill, setNewBranchFirstSkill] = useState('');

  const [skillForest, setSkillForest] = useState({
    work: {
      branches: [
        {
          id: 'b_data',
          name: 'AI & Data Systems',
          x: 110,
          y: 120,
          skills: [
            {
              id: 's_ml',
              name: 'Machine Learning',
              goal: 'Build a real-world review-sentiment classifier',
              timeframe: '6 Weeks',
              x: 75,
              y: 45,
              steps: [
                { id: 'st1', title: 'Master Decision Trees & Random Forests', done: true, comment: 'Completed scikit-learn notebook' },
                { id: 'st2', title: 'Train TF-IDF & Word Embeddings on Google Reviews', done: false, comment: '' },
                { id: 'st3', title: 'Deploy FastAPI inference endpoint', done: false, comment: '' }
              ]
            },
            {
              id: 's_py',
              name: 'Python Engineering',
              goal: 'Write clean async backend microservices',
              timeframe: '1 Month',
              x: 145,
              y: 45,
              steps: [
                { id: 'st4', title: 'Pydantic data validation schemas', done: true, comment: 'Used in Pact MVP' },
                { id: 'st5', title: 'AsyncIO & SQLAlchemy ORM pooling', done: false, comment: '' }
              ]
            }
          ]
        },
        {
          id: 'b_prod',
          name: 'Product & Strategy',
          x: 250,
          y: 120,
          skills: [
            {
              id: 's_ux',
              name: 'UX Research',
              goal: 'Run 5 usability interviews & cohort retention analysis',
              timeframe: '3 Weeks',
              x: 215,
              y: 45,
              steps: [
                { id: 'st6', title: 'Design non-leading interview script', done: true, comment: '' },
                { id: 'st7', title: 'Map friction points in onboarding', done: false, comment: '' }
              ]
            },
            {
              id: 's_pitch',
              name: 'Storytelling',
              goal: 'Deliver a 5-minute technical product demo',
              timeframe: '2 Weeks',
              x: 285,
              y: 45,
              steps: [
                { id: 'st8', title: 'Structure narrative arc & live demo', done: false, comment: '' }
              ]
            }
          ]
        }
      ]
    },
    personal: {
      branches: [
        {
          id: 'b_art',
          name: 'Tactile & Visual Arts',
          x: 110,
          y: 120,
          skills: [
            {
              id: 's_sew',
              name: 'Sewing & Garments',
              goal: 'Tailor & hem vintage trousers + sew a lined tote',
              timeframe: '2 Months',
              x: 75,
              y: 45,
              steps: [
                { id: 'st9', title: 'Thread bobbin & practice straight French seams', done: true, comment: 'Practiced on heavyweight cotton' },
                { id: 'st10', title: 'Cut pattern & sew heavy canvas chore pocket', done: false, comment: '' }
              ]
            },
            {
              id: 's_paint',
              name: 'Gouache Painting',
              goal: 'Paint 4 urban Manchester architectural studies',
              timeframe: '6 Weeks',
              x: 145,
              y: 45,
              steps: [
                { id: 'st11', title: 'Color mixing & opaque layering study', done: true, comment: '' },
                { id: 'st12', title: 'Plein-air sketch at Castlefield Viaduct', done: false, comment: '' }
              ]
            }
          ]
        },
        {
          id: 'b_move',
          name: 'Movement & Athletics',
          x: 250,
          y: 120,
          skills: [
            {
              id: 's_climb',
              name: 'Bouldering (V4–V5)',
              goal: 'Send a purple overhang circuit cleanly at Depot',
              timeframe: '2 Months',
              x: 215,
              y: 45,
              steps: [
                { id: 'st13', title: 'Practice silent feet & drop-knee technique', done: true, comment: 'Felt solid on slab wall' },
                { id: 'st14', title: 'Complete 3 overhang heel-hook problems', done: false, comment: '' }
              ]
            },
            {
              id: 's_run',
              name: 'Sub-25m 5K Run',
              goal: 'Run a paced 5K along the Bridgewater Canal',
              timeframe: '5 Weeks',
              x: 285,
              y: 45,
              steps: [
                { id: 'st15', title: 'Zone 2 conversational base run (4km)', done: true, comment: '' },
                { id: 'st16', title: '4x800m track interval session', done: false, comment: '' }
              ]
            }
          ]
        }
      ]
    }
  });

  const [courseSuggestions, setCourseSuggestions] = useState([
    {
      id: 'c_ml_1',
      domain: 'work',
      skillId: 's_ml',
      title: 'DeepLearning.AI Machine Learning Specialization',
      provider: 'Coursera • Aligned to Machine Learning',
      cost: 'Paid (£39/mo)',
      url: 'https://www.coursera.org/specializations/machine-learning-introduction',
      selectedSlot: 'Tue 18:30',
      availableSlots: ['Tue 18:30', 'Wed 10:00', 'Sat 10:30'],
      dismissOpen: false,
      swappedNote: null
    },
    {
      id: 'c_ml_2',
      domain: 'work',
      skillId: 's_ml',
      title: 'HuggingFace NLP & Review Embeddings Course',
      provider: 'HuggingFace Academy • Aligned to Machine Learning',
      cost: 'Free Open-Source',
      url: 'https://huggingface.co/learn/llm-course/chapter1/1',
      selectedSlot: 'Thu 19:30',
      availableSlots: ['Tue 20:00', 'Thu 19:30', 'Sun 14:00'],
      dismissOpen: false,
      swappedNote: null
    },
    {
      id: 'c_py_1',
      domain: 'work',
      skillId: 's_py',
      title: 'FastAPI, Pydantic & Async Python Microservices',
      provider: 'TestDriven.io • Aligned to Python Engineering',
      cost: '£24 Workshop',
      url: 'https://fastapi.tiangolo.com/tutorial/',
      selectedSlot: 'Wed 14:00',
      availableSlots: ['Mon 18:30', 'Wed 14:00', 'Sat 11:00'],
      dismissOpen: false,
      swappedNote: null
    },
    {
      id: 'c_ux_1',
      domain: 'work',
      skillId: 's_ux',
      title: 'Product Analytics, Retention & A/B Experimentation',
      provider: 'Reforge / Amplitude • Aligned to UX Research',
      cost: 'Free Certification',
      url: 'https://academy.amplitude.com/',
      selectedSlot: 'Wed 11:00',
      availableSlots: ['Wed 11:00', 'Fri 14:30'],
      dismissOpen: false,
      swappedNote: null
    },
    {
      id: 'c_pitch_1',
      domain: 'work',
      skillId: 's_pitch',
      title: 'Technical Storytelling & Live Product Demos',
      provider: 'Y Combinator Library • Aligned to Storytelling',
      cost: 'Free Resource',
      url: 'https://www.ycombinator.com/library',
      selectedSlot: 'Fri 16:00',
      availableSlots: ['Thu 17:30', 'Fri 16:00'],
      dismissOpen: false,
      swappedNote: null
    },
    {
      id: 'c_sew_1',
      domain: 'personal',
      skillId: 's_sew',
      title: 'Beginner Sewing Machine & Garment Altering Workshop',
      provider: 'Stitched Up Co-op Chorlton • Aligned to Sewing',
      cost: '£35 Session',
      url: 'https://www.google.com/search?q=Stitched+Up+co-operative+Manchester+workshops',
      selectedSlot: 'Sat 14:00',
      availableSlots: ['Thu 18:30', 'Sat 14:00', 'Sun 11:00'],
      dismissOpen: false,
      swappedNote: null
    },
    {
      id: 'c_paint_1',
      domain: 'personal',
      skillId: 's_paint',
      title: 'Architectural Gouache & Urban Sketching Class',
      provider: 'Cass Art Manchester Studio • Aligned to Painting',
      cost: '£22 Session',
      url: 'https://www.cassart.co.uk/stores/manchester',
      selectedSlot: 'Sun 13:00',
      availableSlots: ['Sat 11:00', 'Sun 13:00'],
      dismissOpen: false,
      swappedNote: null
    },
    {
      id: 'c_climb_1',
      domain: 'personal',
      skillId: 's_climb',
      title: 'Intermediate Overhang & Heel-Hook Coaching Clinic',
      provider: 'Depot Climbing Manchester • Aligned to Bouldering',
      cost: '£15',
      url: 'https://www.depotclimbing.co.uk/manchester/about',
      selectedSlot: 'Wed 19:00',
      availableSlots: ['Wed 19:00', 'Fri 18:30'],
      dismissOpen: false,
      swappedNote: null
    },
    {
      id: 'c_run_1',
      domain: 'personal',
      skillId: 's_run',
      title: 'Manchester Track Intervals & Running Biomechanics',
      provider: 'Regional Athletics Arena • Aligned to 5K Run',
      cost: '£5 Track Entry',
      url: 'https://www.better.org.uk/leisure-centre/manchester/regional-arena-national-squash',
      selectedSlot: 'Thu 18:00',
      availableSlots: ['Tue 18:00', 'Thu 18:00', 'Sat 09:30'],
      dismissOpen: false,
      swappedNote: null
    }
  ]);

  const dismissalReasons = [
    { id: 'expensive', label: 'Too expensive (Find free alternative)' },
    { id: 'format', label: 'Platform not engaging (Prefer hands-on/project)' },
    { id: 'time', label: 'Too long / heavy time commitment' },
    { id: 'level', label: 'Already know this / wrong difficulty level' }
  ];

  const handleDismissCourseWithReason = (courseId, reasonId) => {
    setCourseSuggestions(prev => prev.map(c => {
      if (c.id !== courseId) return c;
      if (reasonId === 'expensive') {
        return {
          ...c,
          title: 'fast.ai Practical Deep Learning & Kaggle Projects',
          provider: 'fast.ai • 100% Free Open Course',
          cost: 'Free',
          url: 'https://course.fast.ai/',
          dismissOpen: false,
          swappedNote: 'Swapped for a 100% free open-access alternative!'
        };
      }
      if (reasonId === 'format') {
        return {
          ...c,
          title: 'Interactive Pair-Programming & Live Project Sprint',
          provider: 'Manchester AI & Makers Guild (In-Person)',
          cost: 'Free Community Lab',
          url: 'https://www.meetup.com/',
          dismissOpen: false,
          swappedNote: 'Swapped for an interactive, hands-on community studio!'
        };
      }
      return {
        ...c,
        title: 'Bite-Sized 25-Min Micro-Project Challenge',
        provider: 'Kaggle Learn Micro-Courses',
        cost: 'Free • Self-Paced',
        url: 'https://www.kaggle.com/learn',
        dismissOpen: false,
        swappedNote: 'Swapped for a compact, self-paced micro-module!'
      };
    }));
  };

  // --- SOCIAL & COMMUNITY TAB STATE ---
  const [communityGoalFilter, setCommunityGoalFilter] = useState('All');
  const [communityQuery, setCommunityQuery] = useState('');
  const [communityGoal, setCommunityGoal] = useState('Meet New Friends');
  const [plansTab, setPlansTab] = useState('joint');
  const [sendSheetOpen, setSendSheetOpen] = useState(false);
  const [peopleAddOpen, setPeopleAddOpen] = useState(false);
  const [addPane, setAddPane] = useState('');
  const [peopleQ, setPeopleQ] = useState('');
  const [peopleOpenId, setPeopleOpenId] = useState(null);
  const [expandedCommunityEventId, setExpandedCommunityEventId] = useState(null);
  const [sharedFriendPlans, setSharedFriendPlans] = useState([]);

  const communityEventsAll = [
    {
      id: 'ce1',
      title: 'Ancoats Run & Pastry Social (5K)',
      goalTag: 'Meet New Friends',
      date: 'Sat 21 Nov • 09:30',
      location: 'Cutting Room Square, Ancoats',
      attendees: 28,
      description: 'Friendly, conversational-pace 5km canal loop around New Islington followed by specialty coffee and sourdough pastries. Open to all paces!',
      joinLabel: 'Join WhatsApp Run Group',
      joinUrl: 'https://www.google.com/search?q=Ancoats+Manchester+social+running+club+group'
    },
    {
      id: 'ce2',
      title: 'Open Source AI & Python Builders Night',
      goalTag: 'Learn a New Skill',
      date: 'Thu 19 Nov • 18:30',
      location: 'Manchester Technology Centre (M1 7ED)',
      attendees: 42,
      description: 'Bring your laptop for lightning talks on decision trees, embeddings, and local LLM agents, followed by hands-on project pairing.',
      joinLabel: 'Reserve Free Spot on Eventbrite',
      joinUrl: 'https://www.google.com/search?q=Manchester+Python+AI+meetup+eventbrite'
    },
    {
      id: 'ce3',
      title: 'Northern Quarter Urban Sketchers & Zine Club',
      goalTag: 'Creative Hangout',
      date: 'Sun 22 Nov • 14:00',
      location: 'Mackie Mayor Market Hall',
      attendees: 19,
      description: 'Casual afternoon sketching historic cast-iron architecture and swapping handmade zines over tea.',
      joinLabel: 'Join Community Discord / RSVP',
      joinUrl: 'https://www.meetup.com/'
    }
  ];
  // Reminder banner: the most overdue person in Your People (not blocked, reminders on, not snoozed).
  const nudgeFriend = (() => {
    const today = todayDateStr(); let best = null;
    for (const pr of people) {
      const over = personOverdue(pr, today, addDaysStr); if (over === null) continue;
      if (!best || over > best.over) best = { id: pr.id, name: pr.name, over, days: daysBetweenStr(pr.lastContact || pr.createdAt || today, today) };
    }
    return best;
  })();
  const updatePerson = (id, patch) => setPeople(prev => prev.map(x => x.id === id ? { ...x, ...patch } : x));
  const communityEvents = ((typeof window !== 'undefined' && window.PACT_BLANK === true) || !getLoc(userProfile).isHome) ? [] : communityEventsAll;

  const handlePushSharedPlan = (planId, minutesToAdd) => {
    setSharedFriendPlans(prev => prev.map(p => {
      if (p.id !== planId) return p;
      const [hh, mm] = p.time.split(':').map(Number);
      const totalMins = hh * 60 + mm + minutesToAdd;
      const newH = String(Math.floor(totalMins / 60) % 24).padStart(2, '0');
      const newM = String(totalMins % 60).padStart(2, '0');
      return {
        ...p,
        time: `${newH}:${newM}`,
        syncStatus: `Moved +${minutesToAdd}m on your side. Send ${p.friend} a fresh invite so they know.`
      };
    }));
  };

  // --- ROAMIE AI AGENT ---
  const [roamieOpen, setRoamieOpen] = useState(false);
  const [roamieBugMode, setRoamieBugMode] = useState(false);
  const [bugForm, setBugForm] = useState({ type: 'Bug', area: 'Smart planner / venues', other: '', details: '', status: 'idle', ticket: '', note: '' });
  const submitBugReport = async () => {
    if (!bugForm.details.trim()) { setBugForm(f => ({ ...f, status: 'error', note: 'Please describe what happened.' })); return; }
    if (bugForm.area === 'Other' && !bugForm.other.trim()) { setBugForm(f => ({ ...f, status: 'error', note: 'Please say which part of the app this is about.' })); return; }
    const ticket = 'PACT-' + String(Date.now()).slice(-5);
    const report = { ticket, type: bugForm.type, area: bugForm.area === 'Other' ? 'Other: ' + bugForm.other.trim() : bugForm.area, details: bugForm.details.trim(), email: (accountInfo && accountInfo.email) || '', page: activeTab, when: new Date().toISOString() };
    setBugForm(f => ({ ...f, status: 'sending', note: '' }));
    let sent = false;
    try {
      const res = await fetch('/', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: new URLSearchParams({ 'form-name': 'pact-report', 'bot-field': '', ...report, userAgent: (typeof navigator !== 'undefined' && navigator.userAgent) || '' }).toString() });
      sent = !!(res && res.ok);
    } catch (e) { sent = false; }
    try { const prev = JSON.parse(store.get('roam:reports') || '[]'); store.set('roam:reports', JSON.stringify([...prev.slice(-49), { ...report, sent }])); } catch (e) { /* ignore */ }
    setBugForm({ type: 'Bug', area: 'Smart planner / venues', other: '', details: '', status: sent ? 'sent' : 'saved', ticket, note: '' });
  };
  const [roamieInput, setRoamieInput] = useState('');
  const [roamieLoading, setRoamieLoading] = useState(false);
  const [roamieMessages, setRoamieMessages] = useState([
    {
      sender: 'roamie',
      text: "Hi! I'm Roamie. Ask me what's on, when you're free, or tell me to book or cancel something (\"book gym tomorrow at 7am\"). I can also look up nearby places, facts and the weather.",
      sources: []
    }
  ]);

  const [roamieStatus, setRoamieStatus] = useState('unknown'); // unknown | live | nokey | offline
  const [gKey, setGKey] = useState(() => store.get(GKEY) || '');
  const saveGKey = (v) => { const t = String(v || '').trim(); if (t) store.set(GKEY, t); else store.del(GKEY); setGKey(t); setRoamieStatus(t ? 'live' : 'unknown'); };
  const geminiReadyCache = useRef({ t: 0, v: false });
  const geminiReady = async () => {
    if ((store.get(GKEY) || '').trim()) return true;
    const c = geminiReadyCache.current;
    if (Date.now() - c.t < (c.v ? 60000 : 2000)) return c.v;
    let v = false;
    try {
      const ctrl = typeof AbortController !== 'undefined' ? new AbortController() : null;
      const timer = setTimeout(() => ctrl && ctrl.abort(), 4000);
      const res = await fetch('/api/gemini', { method: 'GET', signal: ctrl ? ctrl.signal : undefined });
      clearTimeout(timer);
      if (res && res.ok) { const j = await res.json(); v = !!(j && j.hasKey); }
    } catch (e) { v = false; }
    geminiReadyCache.current = { t: Date.now(), v };
    return v;
  };
  const checkRoamieService = async () => {
    if ((store.get(GKEY) || '').trim()) { setRoamieStatus('live'); return; }
    try {
      const ctrl = typeof AbortController !== 'undefined' ? new AbortController() : null;
      const timer = setTimeout(() => ctrl && ctrl.abort(), 6000);
      const res = await fetch('/api/gemini', { method: 'GET', signal: ctrl ? ctrl.signal : undefined });
      clearTimeout(timer);
      if (!res || !res.ok) { setRoamieStatus('offline'); return; }
      const j = await res.json();
      setRoamieStatus(j && j.hasKey ? 'live' : 'nokey');
    } catch (e) { setRoamieStatus('offline'); }
  };
  useEffect(() => { if (roamieOpen) checkRoamieService(); }, [roamieOpen]);
  const [searchTest, setSearchTest] = useState({ busy: false, msg: '' });
  const [gKeyDraft, setGKeyDraft] = useState('');
  const runSearchTest = async () => {
    setSearchTest({ busy: true, msg: 'Testing live web search...' });
    if ((store.get(GKEY) || '').trim()) {
      try {
        const r = await callGeminiWithSearch('Use Google Search: what is the weather headline for Manchester UK today? One short sentence.', 'Be brief.', null, true);
        setSearchTest({ busy: false, msg: r.sources && r.sources.length ? `Web search works with your key (${r.sources.length} sources).` : 'Your key works, but this reply did not cite web sources. Try again in a moment.' });
      } catch (e) {
        const m = String((e && e.message) || '');
        setSearchTest({ busy: false, msg: /API key|API_KEY|403|401/.test(m) ? 'Google rejected that key. Check it was copied in full from aistudio.google.com/apikey.' : /429|quota|rate/i.test(m) ? 'Google says this key is out of free requests for now. Try again later.' : e && e.message === 'TIMEOUT' ? 'Timed out after 28s. Try again.' : 'Could not reach Google: ' + m.slice(0, 160) });
      }
      return;
    }
    const results = [];
    const probe = async (name, fn) => { try { await fn(); results.push(`${name}: works`); } catch (e) { results.push(`${name}: not reachable`); } };
    await Promise.all([
      ...(cloud.enabled ? [probe('Pact places database', async () => { const { lat, lon } = await resolveCoords(loc); const rows = await cloud.placesNear({ lat, lon, radiusKm: 5, limit: 5 }); if (!rows.length) throw new Error('none'); })] : []),
      probe('Places (OpenStreetMap)', async () => { const { lat, lon } = await resolveCoords(loc); const el = await overpass(placeQL(OSM_FILTERS.Food, lat, lon, 1500, 5)); if (!el.length) throw new Error('none'); }),
      probe('Facts (Wikipedia)', () => wikiSummary('en:Manchester')),
      probe('Weather (Open-Meteo)', () => weatherText(loc))
    ]);
    const ai = await geminiReady();
    const bad = results.filter(r => /not reachable/.test(r)).length;
    setSearchTest({ busy: false, msg: (bad === 0 ? 'Web search works. ' : bad === results.length ? 'Could not reach any search service. Check your internet connection or ad blocker. ' : 'Some search services are not reachable. ') + results.join(' · ') + (ai ? ' · AI answers: on' : '') });
  };
  const roamieBoxRef = useRef(null);
  useEffect(() => {
    const el = roamieBoxRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [roamieMessages, roamieLoading, roamieOpen]);

  const callGeminiWithSearch = async (userPrompt, systemInstructionText, structuredSchema = null, quick = false) => {
    // On Netlify the key lives server-side in /api/gemini (env var GEMINI_API_KEY).
    // Anywhere else (e.g. Gemini canvas) we fall back to the direct call, where the host supplies the key.
    const proxyUrl = '/api/gemini';
    const directUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=`;

    const payload = {
      contents: [{ parts: [{ text: userPrompt }] }],
      tools: structuredSchema ? undefined : [{ "google_search": {} }],
      systemInstruction: { parts: [{ text: systemInstructionText }] }
    };

    if (structuredSchema) {
      payload.generationConfig = {
        responseMimeType: "application/json",
        responseSchema: structuredSchema
      };
    }

    const delays = quick ? [] : [1000, 2000];
    for (let attempt = 0; attempt <= delays.length; attempt++) {
      try {
        const reqInit = {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        };
        let response;
        const ctrl = typeof AbortController !== 'undefined' ? new AbortController() : null;
        const timer = setTimeout(() => ctrl && ctrl.abort(), 28000);
        const userKey = (store.get(GKEY) || '').trim();
        if (userKey) {
          try { response = await directGemini(payload, userKey, ctrl ? ctrl.signal : undefined); } catch (e) { clearTimeout(timer); if (e && e.name === 'AbortError') { const te = new Error('TIMEOUT'); te.noRetry = true; throw te; } throw new Error('NO_SERVICE'); }
        } else {
        try { response = await fetch(proxyUrl, { ...reqInit, signal: ctrl ? ctrl.signal : undefined }); } catch (e) { response = null; if (e && e.name === 'AbortError') { clearTimeout(timer); const te = new Error('TIMEOUT'); te.noRetry = true; throw te; } }
        if (!response || response.status === 404 || response.status === 405) {
          // Not on Netlify (no function): try the direct call, which only works where the host supplies a key.
          try { response = await fetch(directUrl, { ...reqInit, signal: ctrl ? ctrl.signal : undefined }); } catch (e) { clearTimeout(timer); throw new Error('NO_SERVICE'); }
          if (!response.ok) { clearTimeout(timer); throw new Error('NO_SERVICE'); }
        }
        }
        clearTimeout(timer);
        if (!response.ok) {
          let detail = '';
          try { const j = await response.json(); detail = (j && (j.error && (j.error.message || j.error))) || ''; } catch (e) { /* ignore */ }
          const err = new Error(String(detail) || `HTTP ${response.status}`);
          err.status = response.status;
          err.noRetry = response.status === 400 || response.status === 401 || response.status === 403 || response.status === 429 || response.status === 504 || /API_KEY/.test(String(detail));
          throw err;
        }
        const result = await response.json();
        const candidate = result.candidates?.[0];
        const text = (candidate?.content?.parts || []).map(p => p.text || '').join('').trim();
        let sources = [];
        const groundingMetadata = candidate?.groundingMetadata;
        if (groundingMetadata?.groundingChunks) {
          sources = groundingMetadata.groundingChunks.map(c => ({ uri: c.web?.uri, title: c.web?.title || c.web?.uri })).filter(x => x.uri);
        } else if (groundingMetadata?.groundingAttributions) {
          sources = groundingMetadata.groundingAttributions.map(a => ({ uri: a.web?.uri, title: a.web?.title })).filter(x => x.uri && x.title);
        }
        if (!text) throw new Error('EMPTY_REPLY');
        return { text, sources };
      } catch (err) {
        if (attempt === delays.length || err.noRetry || err.message === 'NO_SERVICE') throw err;
        await new Promise(r => setTimeout(r, delays[attempt]));
      }
    }
  };

  // Gemini cannot combine Google Search with a JSON schema in one call, so: 1) search for facts, 2) turn them into the structure.
  const callGrounded = async (prompt, system, schema) => {
    let notes = '';
    try {
      const r = await callGeminiWithSearch(prompt + '\n\nUse Google Search to find current, real facts. Reply with brief plain notes (names, places, prices, dates).', system, null, true);
      notes = r.text || '';
    } catch (e) { if (e && (e.noRetry || e.message === 'NO_SERVICE')) throw e; }
    const full = notes ? `Research notes from a live web search:\n${notes.slice(0, 6000)}\n\nTask: ${prompt}\nUse the research notes for real names, prices and details.` : prompt;
    return callGeminiWithSearch(full, system, schema, true);
  };

  const venueIntent = plannerIntent(eventConfig, plannerMode);
  const handleRefreshMoreVenues = async (first = false) => {
    if (first !== true) setVenueRefreshOffset(prev => prev + 3);
    setIsSearchingLiveVenues(true);
    const intent = plannerIntent(eventConfig, plannerMode);
    const asVenue = (r, idx, snippet, transport) => ({
      id: `${intent.key}_${r.id || r.name}_${idx}`, intentKey: intent.key, city: loc.city, name: r.name, postcode: r.postcode || loc.city, price: eventConfig.budget, rating: null,
      dietaryAvailable: eventConfig.dietary, reviewKeywords: [...String(eventConfig.vibeKeywords || '').toLowerCase().split(/[\s,]+/).filter(Boolean), ...intent.kinds, ...intent.queries],
      reviewSnippet: snippet, transportNote: transport, km: r.distance_km != null ? r.distance_km : null
    });
    // 1) the places database and the live map search, always using the keywords and type you chose
    if (intent.mapped) {
      try {
        const have = new Set(reviewMatchedVenues.filter(v => v.intentKey === intent.key).map(v => String(v.name).toLowerCase()));
        const { lat, lon } = await resolveCoords(loc);
        const okName = (nm) => !NOT_A_PLACE.test(nm) && !(intent.formal && FAST_FOOD.test(nm)) && !have.has(String(nm).toLowerCase());
        let found = [];
        if (cloud.enabled) {
          const seenId = new Set();
          const queries = intent.queries.length ? intent.queries : [null];
          for (const q of queries) {
            for (const radius of [4, 12]) {
              const rows = await cloud.placesNear({ lat, lon, radiusKm: radius, categories: [intent.cat], kinds: intent.kinds, query: q, limit: 40 });
              rows.forEach(r => { if (!seenId.has(r.id) && okName(r.name)) { seenId.add(r.id); found.push(r); } });
              if (found.length >= 6) break;
            }
          }
          found = found.sort((a, b) => ((b.quality || 0) - (a.quality || 0)) || (a.distance_km - b.distance_km)).slice(0, 12);
          if (found.length > 3 && have.size) found = found.sort(() => Math.random() - 0.5);
          found = found.slice(0, 6);
        }
        if (found.length) {
          const kindWord = (r) => String(r.kind || '').replace(/_/g, ' ');
          setReviewMatchedVenues(prev => [...found.map((r, idx) => asVenue(r, idx, `${kindWord(r) ? kindWord(r)[0].toUpperCase() + kindWord(r).slice(1) : 'Place'}${r.address ? ' · ' + r.address : ''}`, `${fmtDist(r.distance_km, loc.country)} from ${loc.isHome ? 'you' : 'the centre'}`)), ...prev]);
          setVenueRefreshOffset(0); setIsSearchingLiveVenues(false); return;
        }
        const live = await osmIdeasLive({ cat: intent.cat, loc, seen: have, n: 5, filters: [{ kinds: intent.kinds, query: intent.queries[0] || null }] });
        const liveOk = live.filter(m => okName(m.title));
        if (liveOk.length) {
          setReviewMatchedVenues(prev => [...liveOk.map((m, idx) => asVenue({ id: m.id, name: m.title, postcode: loc.city }, idx, `${m.desc} (OpenStreetMap)`, `${m.distance} from ${loc.isHome ? 'you' : 'the centre'}`)), ...prev]);
          setVenueRefreshOffset(0); setIsSearchingLiveVenues(false); return;
        }
      } catch (e0) { /* fall through to the AI search below */ }
      if (!(await geminiReady())) { setIsSearchingLiveVenues(false); return; }
    }
    try {
      const schema = {
        type: "ARRAY",
        items: {
          type: "OBJECT",
          properties: {
            name: { type: "STRING" },
            postcode: { type: "STRING" },
            price: { type: "STRING" },
            rating: { type: "NUMBER" },
            reviewSnippet: { type: "STRING" },
            transportNote: { type: "STRING" }
          },
          propertyOrdering: ["name", "postcode", "price", "rating", "reviewSnippet", "transportNote"]
        }
      };
      const prompt = `Suggest 3 real restaurants or activity venues in ${loc.label} near ${loc.isHome ? 'postcode ' + eventConfig.postcode : 'the centre of ' + loc.city} matching vibe "${eventConfig.vibeKeywords}", budget "${eventConfig.budget}", and offering "${eventConfig.dietary.join(', ')}" options.`;
      if (!(await geminiReady())) throw new Error('NO_SERVICE');
      const res = await callGrounded(prompt, `You are a ${loc.city} local guide. Return structured venue recommendations.`, schema);
      if (res?.text) {
        const parsed = JSON.parse(res.text);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const formatted = parsed.map((v, idx) => ({
            id: `live_${Date.now()}_${idx}`, intentKey: intent.key,
            city: loc.city,
            name: v.name,
            postcode: v.postcode || eventConfig.postcode,
            price: v.price || eventConfig.budget,
            rating: v.rating || 4.8,
            dietaryAvailable: eventConfig.dietary,
            reviewKeywords: eventConfig.vibeKeywords.toLowerCase().split(/\s+/),
            reviewSnippet: `“${v.reviewSnippet}” (Live Web Match)`,
            transportNote: v.transportNote || '15–25m via Metrolink / Bus'
          }));
          setReviewMatchedVenues(prev => [...formatted, ...prev]);
          setVenueRefreshOffset(0);
        }
      }
    } catch (e) {
      // Nothing more to show for these keywords; the list stays as it is.
    } finally {
      setIsSearchingLiveVenues(false);
    }
  };

  const handleLoadMoreLiveIdeas = async (appendArg?) => {
    const append = appendArg === true;
    setIsSearchingLiveIdeas(true);
    setIdeaNotice('');
    const cat = selectedIdeaCategory;
    const seenTitles = new Set(ideasFeed.map(i => i.title.toLowerCase()));
    let added = [];
    let webNote = '';
    let osmUsed = false;
    try {
      const fromDb = await dbIdeas({ cat, loc, seen: seenTitles, n: 3, filters: activeFilterDefs });
      if (fromDb.length) { added = fromDb; osmUsed = true; }
    } catch (e) { /* places database unavailable: fall through to AI / live search */ }
    try {
      if (added.length >= 3) throw new Error('ENOUGH');
      if (!(await geminiReady())) throw new Error('NO_SERVICE');
      const schema = {
        type: "ARRAY",
        items: {
          type: "OBJECT",
          properties: {
            title: { type: "STRING" }, desc: { type: "STRING" }, price: { type: "STRING" }, sub1: { type: "STRING" },
            deal: { type: "STRING" }, distance: { type: "STRING" }, destination: { type: "STRING" }
          },
          propertyOrdering: ["title", "desc", "price", "sub1", "deal", "distance", "destination"]
        }
      };
      const avoid = ideasFeed.filter(i => i.category === cat).map(i => i.title).slice(0, 14).join('; ');
      const prompt = (cat === 'Trips'
        ? `Give 3 real, specific trip ideas from ${loc.label} ${activeFilterLabels.length ? `of type "${activeFilterLabels.join('" or "')}"` : '(mix of day trips by train and getaways by flight)'}. For sub1 use exactly "Day Trip (Train)" or "Future Getaway (Flight)". Put the destination town/city name in destination.`
        : `Give 3 real, specific places or events in ${loc.label} for category "${cat}" ${activeFilterLabels.length ? `focusing on "${activeFilterLabels.join('" or "')}"` : ''}.`)
        + ` Do not repeat any of these: ${avoid}.`;
      const res = await callGrounded(prompt, `You are an insider ${loc.city} lifestyle curator. Return a JSON array.`, schema);
      const parsed = JSON.parse(res.text || '[]');
      if (Array.isArray(parsed)) {
        added = [...added, ...parsed.filter(p => p && p.title && !seenTitles.has(String(p.title).toLowerCase())).slice(0, 3 - added.length).map((item, i) => ({
          id: Date.now() + i, category: cat, title: item.title, desc: item.desc || '', rating: 4.8, userRating: null,
          price: item.price || (loc.cur ? loc.cur.repeat(2) : '$$'), city: loc.city, sub1: activeFilterLabels[0] || item.sub1 || cat, matchLabels: activeFilterLabels, sub2: 'Live Web Discovery',
          deal: '', distance: item.distance || '1.0 mi', dest: item.destination || undefined
        }))];
      }
    } catch (e) {
      webNote = '';
    }
    if (added.length < 3) {
      try {
        const more = await osmIdeas({ cat, loc, seen: new Set([...seenTitles, ...added.map(a => a.title.toLowerCase())]), n: 3 - added.length, filters: activeFilterDefs });
        if (more.length) { added = [...added, ...more]; osmUsed = true; }
      } catch (e) { webNote = webNote || "Couldn't reach the places search just now."; }
    }
    let from = added.length ? (osmUsed ? (added.some(a => a.placeId) ? 'the Pact places database near ' + loc.city : 'OpenStreetMap near ' + loc.city) : 'live web search') : '';
    if (added.length < 3 && loc.isHome) {
      const pool = EXTRA_IDEAS.filter(x => x.category === cat && !seenTitles.has(x.title.toLowerCase()) && !added.some(a => a.title === x.title));
      const preferred = activeFilterDefs.length ? pool.filter(x => ideaMatchesFilters(x, activeFilterDefs)) : pool;
      const pick = (activeFilterDefs.length ? preferred : [...preferred, ...pool.filter(x => !preferred.includes(x))]).slice(0, 3 - added.length).map((x, i) => ({ ...x, id: Date.now() + 50 + i, sub2: x.sub2 }));
      if (pick.length) { added = [...added, ...pick]; from = from ? from + ' and the curated list' : 'the curated list'; }
    }
    if (activeFilterDefs.length) added = added.filter(a => ideaMatchesFilters(a, activeFilterDefs));   // never show something that doesn't fit the chosen filters
    if (added.length) {
      setIdeasFeed(prev => append ? [...prev, ...added] : [...added, ...prev]);
      setIdeaFresh(added.map(a => a.id));
      setIdeaNotice(append ? '' : `${added.length} new ${cat.toLowerCase()} idea${added.length === 1 ? '' : 's'} from ${from}, shown at the top.${webNote ? ' ' + webNote : ''}`);
    } else if (append) {
      setIdeaNotice(`That's everything I can find for ${activeFilterLabels.length ? activeFilterLabels.join(' / ').toLowerCase() : cat.toLowerCase()} near ${loc.city} right now.${webNote ? ' ' + webNote : ''}`);
    } else if (activeFilterDefs.length) {
      setIdeaFresh([]);
      setIdeaNotice(`I couldn't find any new ${activeFilterLabels.join(' / ').toLowerCase()} near ${loc.city} right now. Try a different filter, clear the filters, or check back later.${webNote ? ' ' + webNote : ''}`);
    } else {
      // Nothing new anywhere: reshuffle what is there so the list visibly changes.
      setIdeasFeed(prev => {
        const inCat = prev.filter(i => i.category === cat);
        const rotated = [...inCat.slice(3), ...inCat.slice(0, 3)];
        let k = 0;
        return prev.map(i => (i.category === cat ? rotated[k++] : i));
      });
      setIdeaFresh([]);
      setIdeaNotice(`You've seen every ${cat.toLowerCase()} idea I have right now, so I reshuffled the order. ${webNote}`.trim());
    }
    setIsSearchingLiveIdeas(false);
    if (!append) { try { const m = document.getElementById('pact-main'); if (m && m.scrollTo) m.scrollTo({ top: 0, behavior: 'smooth' }); } catch (e) { /* ignore */ } }
  };

  const filterKey = selectedIdeaCategory + '|' + activeFilterLabels.join(',');
  const autoIdeasTried = useRef('');
  useEffect(() => {
    if (activeTab !== 'ideas' || showFavs || adventurousMode || isSearchingLiveIdeas) return;
    const haveN = ideasFeed.filter(i => i.category === selectedIdeaCategory && String(i.city || 'Manchester').toLowerCase() === loc.city.toLowerCase() && ideaMatchesFilters(i, activeFilterDefs)).length;
    const key = filterKey + '|' + loc.city;
    if (haveN >= 4 || autoIdeasTried.current === key) return;   // enough to show, or already tried this view
    autoIdeasTried.current = key;
    handleLoadMoreLiveIdeas(haveN > 0);
  }, [filterKey, activeTab, loc.city, ideasFeed.length]);
  useEffect(() => { if (adventurousMode && activeTab === 'ideas') shuffleAdventure(); }, [filterKey]);
  const [ideaShown, setIdeaShown] = useState(4);
  const [ideaSearchOpen, setIdeaSearchOpen] = useState(false);
  const [ideaFiltersOpen, setIdeaFiltersOpen] = useState(false);
  const [ideaOpenId, setIdeaOpenId] = useState(null);
  useEffect(() => { setIdeaShown(4); setIdeaOpenId(null); }, [filterKey]);
  const [budgetFilter, setBudgetFilter] = useState({});
  const ideaListAll = ideasFeed
    .filter(item => item.category === selectedIdeaCategory)
    .filter(item => budgetPass(item, budgetFilter, budgetLeft(userProfile)))
    .filter(item => String(item.city || 'Manchester').toLowerCase() === loc.city.toLowerCase())
    .filter(item => ideaMatchesFilters(item, activeFilterDefs));
  const [ideaSearch, setIdeaSearch] = useState('');
  const [ideaSearchRes, setIdeaSearchRes] = useState(null);   // null | { q, items, busy }
  const runIdeaSearch = async () => {
    const q = ideaSearch.trim().slice(0, 60); if (!q) { setIdeaSearchRes(null); return; }
    setIdeaSearchRes({ q, items: [], busy: true });
    let items = [];
    try {
      const { lat, lon } = await resolveCoords(loc);
      if (cloud.enabled) {
        try {
          let rows = await cloud.placesNear({ lat, lon, radiusKm: 8, query: q, limit: 40 });
          if (rows.length < 5) rows = await cloud.placesNear({ lat, lon, radiusKm: 25, query: q, limit: 40 });
          items = rows.filter(r => !NOT_A_PLACE.test(r.name)).map((r, i) => placeRowToIdea(r, r.category || 'Food', loc, i));
        } catch (e) { items = []; }
      }
      if (items.length < 3) {
        try {
          const safe = q.replace(/[^\w\s'&-]/g, '').trim();
          if (safe) {
            const els = await overpass(`[out:json][timeout:20];nwr["name"~"${safe}",i]["amenity"~"."](around:7000,${lat},${lon});out center 40;`);
            const have = new Set(items.map(x => x.title.toLowerCase()));
            els.map(e => ({ e, c: elCoords(e) })).filter(x => x.c.lat != null && x.e.tags && x.e.tags.name && !have.has(x.e.tags.name.toLowerCase())).slice(0, 20).forEach((x, i) => {
              items.push({ id: Date.now() + 100 + i, category: 'Food', title: x.e.tags.name, desc: osmDesc(x.e.tags), rating: null, userRating: null, price: '', city: loc.city, sub1: osmKind(x.e.tags), sub2: 'OpenStreetMap', deal: '', distance: fmtDist(haversineKm(lat, lon, x.c.lat, x.c.lon), loc.country), lat: x.c.lat, lon: x.c.lon, link: x.e.tags.website || '' });
            });
          }
        } catch (e) { /* live search unavailable */ }
      }
    } catch (e) { /* no coordinates */ }
    const lq = q.toLowerCase();
    const have2 = new Set(items.map(x => x.title.toLowerCase()));
    ideasFeed.filter(i => String(i.city || 'Manchester').toLowerCase() === loc.city.toLowerCase() && (i.title + ' ' + (i.desc || '') + ' ' + (i.sub1 || '')).toLowerCase().includes(lq) && !have2.has(i.title.toLowerCase())).forEach(i => items.push(i));
    setIdeaSearchRes({ q, items: items.slice(0, 40), busy: false });
  };
  const addIdeaToPlan = (idea) => {
                          setTasks(prev => [...prev, {
                            id: Date.now(),
                            title: idea.title,
                            duration: 90,
                            status: 'pending',
                            ...(() => {
                              const g = getFreeGaps(selectedDateStr, calCtx, 100, { from: 540 })[0];
                              const st = g ? roundUpTo(g.s, 15) : 17 * 60 + 30;
                              return { startTime: fromMins(st), endTime: fromMins(st + 90) };
                            })(),
                            date: selectedDateStr,
                            type: 'social',
                            categoryColor: 'leisure',
                            location: idea.title,
                            transportMode: loc.isHome ? 'Metrolink' : 'Public transport',
                            travelTime: 20,
                            distance: idea.distance,
                            leaveByNote: loc.isHome ? 'Leave 20m prior via Metrolink' : 'Leave 20m before to get there',
                            notes: '',
                            rating: null,
                            reviewNote: '',
                            withPerson: null,
                            meetingType: 'Friendly'
                          }]);
                          setActiveTab('schedule');
  };
  const seeMoreIdeas = async () => {
    if (ideaShown < ideaListAll.length) { setIdeaShown(n => n + 8); return; }
    setIdeaShown(n => n + 8);
    await handleLoadMoreLiveIdeas(true);
  };
  const getMatchedVenues = () => {
    const words = eventConfig.vibeKeywords.toLowerCase().split(/[\s,]+/).filter(Boolean);
    return reviewMatchedVenues.filter(v => String(v.city || 'Manchester').toLowerCase() === loc.city.toLowerCase()).map(venue => {
      const matchedHits = venue.reviewKeywords.filter(k =>
        words.some(w => k.includes(w) || w.includes(k))
      );
      const dietaryMatches = eventConfig.dietary.filter(d => venue.dietaryAvailable.includes(d));
      const score = matchedHits.length * 3 + dietaryMatches.length * 2 + (venue.price === eventConfig.budget ? 2 : 0);
      return { ...venue, matchedHits, dietaryMatches, score };
    }).filter(v => !venueIntent.mapped || v.intentKey === venueIntent.key || (!v.intentKey && v.matchedHits.length > 0 && (!venueIntent.formal || !FAST_FOOD.test(v.name))))
      .sort((a, b) => ((b.intentKey === venueIntent.key ? 1 : 0) - (a.intentKey === venueIntent.key ? 1 : 0)) || (venueSort === 'near' ? ((a.km == null ? 1e9 : a.km) - (b.km == null ? 1e9 : b.km)) : 0) || (b.score - a.score));
  };

  const displayedPlannerVenues = (() => {
    const allSorted = getMatchedVenues();
    if (!allSorted.length) return [];
    const start = venueRefreshOffset % Math.max(1, allSorted.length);
    const slice = allSorted.slice(start, start + 4);
    return slice.length < 4 ? [...slice, ...allSorted.slice(0, 4 - slice.length)] : slice;
  })();

  const setPlaceFromLoc = (l) => {
    setUserProfile(prev => ({ ...prev, location: l }));
    setEventConfig(c => ({ ...c, postcode: l.postcode || l.city }));
    setReviewMatchedVenues(prev => prev); setVenueRefreshOffset(0);
  };
  const plannerUseGps = () => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) { setLocMsg("This browser can't share your location. Type a postcode instead."); return; }
    setLocBusy(true); setLocMsg('Finding you...');
    navigator.geolocation.getCurrentPosition(async (pos) => {
      try { const l = await reverseGeocode(pos.coords.latitude, pos.coords.longitude); setPlaceFromLoc(l); setLocMsg(l.postcode ? `Found you near ${l.postcode}.` : `Found you in ${l.city}.`); if (userProfile.autoLocation === undefined) setLocAsk(true); }
      catch (e) { setLocMsg('Could not work out where you are. Type a postcode instead.'); }
      setLocBusy(false);
    }, () => { setLocBusy(false); setLocMsg('Location is blocked. Allow it for this site in your browser settings, or type a postcode.'); }, { timeout: 10000, enableHighAccuracy: true });
  };
  const plannerSetPostcode = async () => {
    const t = pcDraft.trim(); if (!t) return;
    setLocBusy(true); setLocMsg('Looking that up...');
    let r = []; try { r = await geocodeCity(t); } catch (e) { r = []; }
    setLocBusy(false);
    if (!r.length) { setLocMsg("Couldn't find that. Try a full postcode like M1 5GD, or a town."); return; }
    setPlaceFromLoc(r[0]); setPcDraft(''); setLocMsg(r[0].postcode ? `Searching near ${r[0].postcode}.` : `Searching near ${r[0].city}.`);
  };
  const locIsDefault = !(userProfile.location && userProfile.location.city) || !!userProfile.location.assumed;

  const calCtx = { tasks, calendarEvents, weeklyHours: userProfile.weeklyHours };

  // Planner opens on the day you are looking at, not a fixed demo date.
  useEffect(() => {
    if (!plannerOpen) { setEventConfig(p => (p.slotPicked || p.planLabel) ? { ...p, slotPicked: false, planLabel: '' } : p); setPlannerMode('event'); return; }
    setEventConfig(p => ({ ...p, date: selectedDateStr }));
    setTaskConfig(p => ({ ...p, date: selectedDateStr, deadline: p.deadline < selectedDateStr ? addDaysStr(selectedDateStr, 4) : p.deadline }));
    setScheduleConflictWarning(null);
  }, [plannerOpen]);

  // Clash-free start times for one specific day (tasks, synced calendar, work hours and buffers considered).
  const suggestStartTimes = (date, dur) => {
    const isToday = date === todayDateStr();
    const nowM = new Date().getHours() * 60 + new Date().getMinutes();
    const gaps = getFreeGaps(date, calCtx, dur, { from: isToday ? Math.max(8 * 60, roundUpTo(nowM + 30, 15)) : 8 * 60, to: 23 * 60 });
    const cands = [];
    gaps.forEach(g => {
      [roundUpTo(g.s, 15), Math.max(roundUpTo(g.s, 15), 18 * 60), Math.max(roundUpTo(g.s, 15), 12 * 60)].forEach(st => {
        if (st + dur <= g.e && !cands.some(c => c.s === st)) cands.push({ s: st, slack: g.e - (st + dur) });
      });
    });
    return cands
      .sort((a, b) => Math.abs(a.s - 19 * 60) - Math.abs(b.s - 19 * 60))
      .slice(0, 3)
      .sort((a, b) => a.s - b.s)
      .map(c => ({ time: fromMins(c.s), label: `${fromMins(c.s)}\u2013${fromMins(c.s + dur)} \u00b7 ${c.slack >= 120 ? 'Wide open' : c.slack >= 45 ? 'Comfortable' : 'Snug fit'}` }));
  };
  const eventSuggestions = suggestStartTimes(eventConfig.date, Number(eventConfig.duration) || 60);

  const checkScheduleAndPrepConflict = (dateStr, startTimeStr, isSeriousEvent = false) => {
    const dayObj = { day: dayKeyOf(dateStr) };
    {
      const evStart = toMins(startTimeStr);
      const evDur = Number(eventConfig.duration) || 60;
      const clashes = overlapWith(dateStr, evStart, evDur, calCtx).filter(b => b.kind !== 'work');
      if (clashes.length) {
        const c = clashes[0];
        return `That time overlaps "${c.label}" (${fromMins(c.s)}-${fromMins(c.e)}). Pick one of the free times below.`;
      }
    }
    const workDay = userProfile.weeklyHours[dayObj.day];
    const [startH, startM] = startTimeStr.split(':').map(Number);
    const startTotal = startH * 60 + startM;
    const prepMinutes = isSeriousEvent ? userProfile.prepTimeSerious : userProfile.prepTimeCasual;
    const travelMinutes = 25;
    const readyStartTotal = startTotal - prepMinutes - travelMinutes;

    if (workDay && workDay.active) {
      const [workEndH, workEndM] = workDay.end.split(':').map(Number);
      const workEndTotal = workEndH * 60 + workEndM;
      const [workStartH, workStartM] = workDay.start.split(':').map(Number);
      const workStartTotal = workStartH * 60 + workStartM;

      if (startTotal >= workStartTotal && startTotal < workEndTotal) {
        return `Direct clash with your ${dayObj.day} work/study hours (${workDay.start}–${workDay.end}).`;
      }
      if (readyStartTotal < workEndTotal && startTotal >= workEndTotal) {
        const readyH = String(Math.floor(readyStartTotal / 60)).padStart(2, '0');
        const readyM = String(readyStartTotal % 60).padStart(2, '0');
        return `Heads up! With ${prepMinutes}m getting-ready time + ${travelMinutes}m transit, you'd need to start getting ready at ${readyH}:${readyM}, before you finish work at ${workDay.end}. Are you sure that's enough time?`;
      }
    }
    const plannedThatDay = tasks.filter(t => t.date === dateStr).length;
    if (plannedThatDay >= userProfile.dailyActivityCap) {
      return `That day already has ${plannedThatDay} plans, which meets your energy-based pacing cap of ${userProfile.dailyActivityCap}/day. Consider another day.`;
    }
    return null;
  };

  const handleConfirmAddPlan = () => {
    if (plannerMode === 'event' || plannerMode === 'activity') {
      const chosenVenue = displayedPlannerVenues.find(v => selectedVenueMatch && v.id === selectedVenueMatch.id) || displayedPlannerVenues[0];
      if (!chosenVenue) return;
      const [h, m] = eventConfig.startTime.split(':').map(Number);
      const endMins = h * 60 + m + Number(eventConfig.duration);
      const endH = String(Math.floor(endMins / 60) % 24).padStart(2, '0');
      const endM = String(endMins % 60).padStart(2, '0');
      const isSerious = eventConfig.eventType.includes('Serious') || eventConfig.eventType.includes('Date');
      const prepUsed = isSerious ? userProfile.prepTimeSerious : userProfile.prepTimeCasual;

      const newTask = {
        id: Date.now(),
        title: plannerMode === 'event'
          ? `${eventConfig.planLabel || eventConfig.eventType}: ${chosenVenue.name}`
          : `${eventConfig.planLabel || eventConfig.activityDropdown} @ ${chosenVenue.name}`,
        duration: Number(eventConfig.duration),
        status: 'pending',
        startTime: eventConfig.startTime,
        endTime: `${endH}:${endM}`,
        date: eventConfig.date,
        type: plannerMode === 'event' ? 'social' : 'physical',
        categoryColor: plannerMode === 'event' ? 'social' : 'leisure',
        location: `${chosenVenue.name} (${chosenVenue.postcode})`,
        transportMode: 'Metrolink / Bus',
        travelTime: 25,
        distance: '0.8 mi',
        leaveByNote: `${chosenVenue.transportNote} • Prep reminder set (${prepUsed}m buffer)`,
        notes: `Dietary: ${eventConfig.dietary.join(', ')} • Vibe: ${eventConfig.vibeKeywords}`,
        rating: null,
        reviewNote: '',
        withPerson: null,
        meetingType: eventConfig.meetingType || 'Friendly'
      };
      setTasks(prev => [...prev, newTask]);
      setSelectedDateStr(eventConfig.date);
    } else if (plannerMode === 'task') {
      const toAdd = taskPlan ? taskPlan.blocks : [];
      if (toAdd.length === 0) return;
      const total = toAdd.length;
      const newBlocks = toAdd.map((blk, i) => ({
        id: Date.now() + i,
        title: total > 1 ? `${taskConfig.title} (Part ${i + 1}/${total})` : taskConfig.title,
        duration: blk.len,
        status: 'pending',
        startTime: fromMins(blk.s),
        endTime: fromMins(blk.e),
        date: blk.date,
        type: 'analytical',
        categoryColor: 'work',
        location: 'Focus Desk / Library',
        transportMode: 'Walk',
        travelTime: 10,
        distance: '0.4 mi',
        leaveByNote: `Deadline ${taskConfig.deadline} • Block ${i + 1} of ${total}`,
        notes: `Allocated ${taskConfig.totalHours}h across ${total} session${total > 1 ? 's' : ''}, fitted around your calendar and work hours.`,
        rating: null,
        reviewNote: '',
        withPerson: null,
        meetingType: 'Business'
      }));
      setTasks(prev => [...prev, ...newBlocks]);
      setSelectedDateStr(newBlocks[0].date);
    } else if (plannerMode === 'surprise') {
      const pickedSurprise = surprisePick;
      if (!pickedSurprise) return;
      const newSurpriseTask = {
        id: Date.now(),
        title: `Surprise: ${pickedSurprise.title}`,
        duration: pickedSurprise.duration,
        status: 'pending',
        startTime: surpriseConfig.startTime,
        endTime: fromMins(toMins(surpriseConfig.startTime) + pickedSurprise.duration),
        date: surpriseConfig.day,
        type: 'physical',
        categoryColor: 'leisure',
        location: pickedSurprise.location,
        transportMode: 'Metrolink',
        travelTime: 25,
        distance: '1.2 mi',
        leaveByNote: pickedSurprise.transport,
        notes: pickedSurprise.desc,
        rating: null,
        reviewNote: '',
        withPerson: null,
        meetingType: 'Friendly'
      };
      setTasks(prev => [...prev, newSurpriseTask]);
      setSelectedDateStr(surpriseConfig.day);
    }

    if (linkedTargetId) {
      setWeeklyTargets(prev => prev.map(t =>
        t.id === linkedTargetId ? { ...t, current: Math.min(t.target, t.current + 1) } : t
      ));
      setLinkedTargetId(null);
    }

    setPlannerOpen(false);
    setPlannerResultsStep(false);
    setSurpriseConfig(prev => ({ ...prev, showPopup: false }));
  };

  // Add one plan you have already decided on (a booked event, one you host, a place you searched for).
  const addPlanDirect = (p) => {
    const d = Number(p.duration) || 60;
    setTasks(prev => [...prev, {
      id: Date.now(), title: p.title, duration: d, status: 'pending', startTime: p.startTime, endTime: fromMins(toMins(p.startTime) + d), date: p.date,
      type: p.type || 'social', categoryColor: p.categoryColor || 'social', location: p.location || '', transportMode: 'Metrolink / Bus', travelTime: 25, distance: '',
      leaveByNote: '', notes: p.notes || '', rating: null, reviewNote: '', withPerson: null, meetingType: p.meetingType || 'Friendly'
    }]);
    setSelectedDateStr(p.date);
    if (linkedTargetId) { setWeeklyTargets(prev => prev.map(t => t.id === linkedTargetId ? { ...t, current: Math.min(t.target, t.current + 1) } : t)); setLinkedTargetId(null); }
    setPlannerOpen(false); setPlannerResultsStep(false);
  };
  // Look a place up by name near you: our places database first, then the open map search.
  const searchPlacesByName = async (q) => {
    const { lat, lon } = await resolveCoords(loc);
    const out = []; const seen = new Set();
    const push = (name, addr, km) => { const k = String(name).toLowerCase(); if (!name || seen.has(k)) return; seen.add(k); out.push({ name, addr: addr || '', dist: km != null ? fmtDist(km, loc.country) : '' }); };
    if (cloud.enabled) { try { const rows = await cloud.placesNear({ lat, lon, radiusKm: 25, categories: null, kinds: null, query: q, limit: 8 }); rows.forEach(r => push(r.name, r.address, r.distance_km)); } catch (e) { /* try the map search */ } }
    if (out.length < 5) {
      try {
        const j = await fetchJSON(`https://photon.komoot.io/api/?q=${encodeURIComponent(q)}&lat=${lat}&lon=${lon}&limit=8&lang=en`, {}, 7000);
        (j.features || []).forEach(f => { const pr = f.properties || {}; if (!pr.name) return; const addr = [pr.street && (pr.housenumber ? pr.housenumber + ' ' : '') + pr.street, pr.postcode, pr.city].filter(Boolean).join(', '); push(pr.name, addr, null); });
      } catch (e) { /* nothing more to try */ }
    }
    return out.slice(0, 8);
  };
  // What is on near you in the next couple of weeks (live search; empty if the service is unreachable).
  const findEventsNear = async () => {
    if (!(await geminiReady())) return [];
    const schema = { type: "ARRAY", items: { type: "OBJECT", properties: { title: { type: "STRING" }, date: { type: "STRING" }, time: { type: "STRING" }, place: { type: "STRING" }, price: { type: "STRING" }, free: { type: "BOOLEAN" } }, propertyOrdering: ["title", "date", "time", "place", "price", "free"] } };
    const prompt = `List 6 real, upcoming public events (concerts, comedy, markets, exhibitions, sport, festivals) in or near ${loc.label || loc.city} between ${todayDateStr()} and ${addDaysStr(todayDateStr(), 14)}. For each give title, date as YYYY-MM-DD, start time as HH:MM (24h), venue name, price (e.g. Free or £12), and free (true if no charge).`;
    const res = await callGrounded(prompt, 'You list real upcoming local events. Return JSON only.', schema);
    const arr = res && res.text ? JSON.parse(res.text) : [];
    return (Array.isArray(arr) ? arr : []).filter(e => e && e.title && /^\d{4}-\d{2}-\d{2}$/.test(e.date || '') && e.date >= todayDateStr()).slice(0, 8);
  };

  const handleCompleteTaskWithClockCheck = (task) => {
    const [endH, endM] = task.endTime.split(':').map(Number);
    const [nowH, nowM] = nowHHMM().split(':').map(Number);
    const scheduledEndMins = endH * 60 + endM;
    const actualNowMins = nowH * 60 + nowM;
    const diff = scheduledEndMins - actualNowMins;

    setTasks(prev => prev.map(t => t.id === task.id ? { ...t, status: 'completed' } : t));
    if (task.withPerson) setPeople(prev => prev.map(x => String(x.name).trim().toLowerCase() === String(task.withPerson).trim().toLowerCase() ? { ...x, lastContact: todayDateStr(), snoozeUntil: '' } : x));
    setReclaimedAt(nowHHMM());
    if (diff > 0 && diff <= 120) {
      setReclaimedMinutes(diff);
    } else {
      setReclaimedMinutes(15);
    }
  };

  const handleExportCSV = () => {
    const rows = [
      ['Record Type', 'Date', 'Category / Meal', 'Score / Mode', 'Details & Notes'],
      ...moodLogs.map(m => ['Daily Mood', m.date, m.mood, m.score, `"${m.reason} (${m.tasksCompleted} tasks)"`]),
      ...mealHistoryLogs.map(ml => ['Meal Log', ml.date, ml.meal, ml.mode, `"${ml.detail}"`])
    ];
    const csvContent = 'data:text/csv;charset=utf-8,' + rows.map(r => r.join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `roam_life_analytics_${selectedDateStr}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const currentForest = skillForest[skillTreeDomain];
  const activeBranch = currentForest.branches.find(b => b.id === selectedBranchId) || currentForest.branches[0];
  const activeSkill = activeBranch.skills.find(s => s.id === selectedSkillId) || activeBranch.skills[0];

  // --- DEVELOPMENT: edit helpers ---
  const mapForest = (fn) => setSkillForest(prev => ({ ...prev, [skillTreeDomain]: { branches: fn(prev[skillTreeDomain].branches) } }));
  const patchBranch = (id, patch) => mapForest(bs => bs.map(b => (b.id === id ? { ...b, ...patch } : b)));
  const patchSkill = (skillId, patch) => mapForest(bs => bs.map(b => ({ ...b, skills: b.skills.map(sk => (sk.id === skillId ? { ...sk, ...patch } : sk)) })));
  const patchStep = (skillId, stepId, patch) => mapForest(bs => bs.map(b => ({ ...b, skills: b.skills.map(sk => (sk.id === skillId ? { ...sk, steps: sk.steps.map(st => (st.id === stepId ? { ...st, ...patch } : st)) } : sk)) })));
  const removeStep = (skillId, stepId) => mapForest(bs => bs.map(b => ({ ...b, skills: b.skills.map(sk => (sk.id === skillId ? { ...sk, steps: sk.steps.filter(st => st.id !== stepId) } : sk)) })));
  const moveStep = (skillId, stepId, dir) => mapForest(bs => bs.map(b => ({ ...b, skills: b.skills.map(sk => {
    if (sk.id !== skillId) return sk;
    const arr = [...sk.steps]; const i = arr.findIndex(x => x.id === stepId); const j = i + dir;
    if (i < 0 || j < 0 || j >= arr.length) return sk;
    [arr[i], arr[j]] = [arr[j], arr[i]];
    return { ...sk, steps: arr };
  }) })));
  // --- DEVELOPMENT: milestone suggestions (update when a skill is edited) ---
  const skillSig = (sk) => [sk.name, sk.goal, sk.timeframe].join('|');
  const editSkillMeta = (sk, patch) => patchSkill(sk.id, { suggestSig: sk.suggestSig || skillSig(sk), ...patch });
  const [skillSuggest, setSkillSuggest] = useState({ skillId: '', busy: false, items: null, source: '' });
  const SUGGEST_DAYS = { '1 Week': 7, '2 Weeks': 14, '3 Weeks': 21, '4 Weeks': 28, '1 Month': 30, '6 Weeks': 42, '2 Months': 60, '3 Months': 90, '6 Months': 180, '1 Year': 365, 'Ongoing': 60 };
  const suggestTarget = (d) => d <= 1 ? '1 day' : d <= 2 ? '2 days' : d <= 3 ? '3 days' : d <= 10 ? '1 Week' : d <= 17 ? '2 Weeks' : d <= 24 ? '3 Weeks' : '1 Month';
  const localSuggest = (sk) => {
    const n = { '1 Week': 3, '2 Weeks': 4, '3 Weeks': 5, '4 Weeks': 5, '1 Month': 5, '6 Weeks': 6, '2 Months': 6, '3 Months': 7, '6 Months': 8, '1 Year': 8, 'Ongoing': 6 }[sk.timeframe] || 5;
    const plan = findSkillPlan(sk.name, sk.goal);
    return planMilestones(plan, (sk.name || 'this skill').trim(), n, SUGGEST_DAYS[sk.timeframe] || 30, suggestTarget);
  };
  const updateSuggestions = async (sk) => {
    setSkillSuggest({ skillId: sk.id, busy: true, items: null, source: '' });
    let items = null, source = 'template';
    const plan = findSkillPlan(sk.name, sk.goal);
    if (plan) {
      const have0 = new Set(sk.steps.filter(x => x.done).map(x => x.title.trim().toLowerCase()));
      items = localSuggest(sk).filter(it => !have0.has(it.title.trim().toLowerCase()));
      if (items.length >= 2) { source = 'plan:' + skillPlanLabel(plan); setSkillSuggest({ skillId: sk.id, busy: false, items, source }); patchSkill(sk.id, { suggestSig: skillSig(sk) }); return; }
      items = null;
    }
    try {
      const schema = { type: 'ARRAY', items: { type: 'OBJECT', properties: { title: { type: 'STRING' }, target: { type: 'STRING' } }, propertyOrdering: ['title', 'target'] } };
      const done = sk.steps.filter(x => x.done).map(x => x.title).join('; ');
      const prompt = `Suggest 4 to 8 concrete, ordered milestones for learning "${sk.name}". Goal: "${sk.goal}". Total timeframe: ${sk.timeframe}. Already completed (do not repeat): ${done || 'none'}. Each title is one short actionable sentence. target must be exactly one of: ${STEP_TARGETS.filter(Boolean).join(', ')}.`;
      const res = await callGeminiWithSearch(prompt, 'You are a practical learning coach. Return a JSON array.', schema, true);
      const parsed = JSON.parse(res.text || '[]');
      if (Array.isArray(parsed)) {
        const ok = parsed.filter(x => x && x.title).slice(0, 8).map(x => ({ title: String(x.title).trim(), target: STEP_TARGETS.includes(x.target) ? x.target : '' }));
        if (ok.length >= 2) { items = ok; source = 'ai'; }
      }
    } catch (e) { /* fall back to template */ }
    if (!items) items = localSuggest(sk);
    setSkillSuggest({ skillId: sk.id, busy: false, items, source });
    patchSkill(sk.id, { suggestSig: skillSig(sk) });
  };
  const mkStep = (it, k) => ({ id: `st_${Date.now()}_${k}`, title: it.title, done: false, comment: '', target: it.target || '' });
  const addSuggestion = (sk, it) => mapForest(bs => bs.map(b => ({ ...b, skills: b.skills.map(x => (x.id === sk.id ? { ...x, steps: [...x.steps, mkStep(it, x.steps.length)] } : x)) })));
  const addAllSuggestions = (sk, items, replaceUnfinished) => {
    mapForest(bs => bs.map(b => ({ ...b, skills: b.skills.map(x => {
      if (x.id !== sk.id) return x;
      const kept = replaceUnfinished ? x.steps.filter(st => st.done) : x.steps;
      const have = new Set(kept.map(st => st.title.trim().toLowerCase()));
      const fresh = items.filter(it => !have.has(it.title.trim().toLowerCase())).map((it, k) => mkStep(it, k + kept.length));
      return { ...x, steps: [...kept, ...fresh] };
    }) })));
    pushToast(replaceUnfinished ? 'Unfinished milestones replaced. Finished ones are kept.' : 'Suggested milestones added.', 'success');
  };
  const deleteSkillNow = (skillId) => {
    const branch = currentForest.branches.find(b => b.skills.some(sk => sk.id === skillId));
    if (!branch) return;
    if (branch.skills.length <= 1) { pushToast('An area needs at least one skill. Add another skill first, or delete the whole area.', 'info'); setSkillConfirm(''); return; }
    const rest = branch.skills.filter(sk => sk.id !== skillId);
    mapForest(bs => bs.map(b => (b.id === branch.id ? { ...b, skills: rest } : b)));
    setSelectedSkillId(rest[0].id); setSkillConfirm(''); pushToast('Skill deleted.', 'success');
  };
  const deleteBranchNow = (branchId) => {
    if (currentForest.branches.length <= 1) { pushToast('You need at least one area. Add a new area first, then delete this one.', 'info'); setSkillConfirm(''); return; }
    const rest = currentForest.branches.filter(b => b.id !== branchId);
    mapForest(() => rest);
    setSelectedBranchId(rest[0].id); if (rest[0].skills[0]) setSelectedSkillId(rest[0].skills[0].id);
    setSkillConfirm(''); pushToast('Area deleted.', 'success');
  };

  // --- DEVELOPMENT: weekly summary ---
  const devSummary = (() => {
    const wkStart = devWeekStart;
    const wkEnd = addDaysStr(wkStart, 6);
    const inWeek = (d) => !!d && d >= wkStart && d <= wkEnd;
    const all = [];
    ['work', 'personal'].forEach(dom => ((skillForest[dom] && skillForest[dom].branches) || []).forEach(b => b.skills.forEach(sk => all.push({ dom, branch: b, skill: sk }))));
    const doneSteps = [];
    all.forEach(({ branch, skill }) => skill.steps.forEach(st => { if (st.done && inWeek(st.doneDate)) doneSteps.push({ title: st.title, skill: skill.name, area: branch.name, date: st.doneDate }); }));
    const names = all.map(a => a.skill.name.toLowerCase()).filter(Boolean);
    const isDev = (t) => /upskill|study|course|learn|skill|development/i.test(t.title + ' ' + (t.notes || '')) || names.some(n => (t.title || '').toLowerCase().includes(n) || (t.notes || '').toLowerCase().includes(n));
    const sessions = tasks.filter(t => inWeek(t.date) && isDev(t)).sort((a, b) => (a.date + a.startTime).localeCompare(b.date + b.startTime));
    const sessionsDone = sessions.filter(t => t.status === 'done');
    const mins = sessionsDone.reduce((a, t) => a + (Number(t.duration) || 0), 0);
    const touched = {};
    doneSteps.forEach(d => { touched[d.skill] = (touched[d.skill] || 0) + 1; });
    sessions.forEach(t => { const hit = all.find(a => (t.title || '').toLowerCase().includes(a.skill.name.toLowerCase()) || (t.notes || '').toLowerCase().includes(a.skill.name.toLowerCase())); if (hit && touched[hit.skill.name] === undefined) touched[hit.skill.name] = 0; });
    const progress = Object.keys(touched).map(name => {
      const a = all.find(x => x.skill.name === name);
      return { name, area: a.branch.name, gained: touched[name], done: a.skill.steps.filter(x => x.done).length, total: a.skill.steps.length };
    });
    const next = all.map(a => ({ skill: a.skill.name, step: a.skill.steps.find(x => !x.done) })).filter(x => x.step).slice(0, 3);
    return { wkStart, wkEnd, doneSteps: doneSteps.sort((a, b) => a.date.localeCompare(b.date)), sessions, sessionsDone, mins, progress, next };
  })();

  // Courses: real providers and real links for this skill, from the Pact skills library (nothing invented).
  const leafAlignedCourses = (() => {
    if (!activeSkill) return [];
    const plan = findSkillPlan(activeSkill.name, activeSkill.goal);
    const hidden = new Set(activeSkill.hiddenResources || []);
    return planResources(plan, activeSkill.name, loc.city, loc.country).filter(r => !hidden.has(r.id)).map(r => ({ ...r, curated: !!plan }));
  })();
  const planStudySession = (res) => {
    const today = todayDateStr();
    let date = today, start = null;
    for (let i = 0; i < 7 && start === null; i++) {
      date = addDaysStr(today, i);
      const from = i === 0 ? Math.max(9 * 60, roundUpTo(new Date().getHours() * 60 + new Date().getMinutes() + 15, 15)) : 9 * 60;
      const gaps = getFreeGaps(date, calCtx, 45, { from, to: 22 * 60 });
      if (gaps.length) start = roundUpTo(gaps[0].s, 5);
    }
    if (start === null) { pushToast('No free 45-minute window in the next week. Free some time and try again.', 'error'); return; }
    setTasks(prev => [...prev, { id: Date.now(), title: `Learn: ${activeSkill.name}`, duration: 45, status: 'pending', startTime: fromMins(start), endTime: fromMins(start + 45), date, type: 'analytical', categoryColor: 'work', location: res.provider, transportMode: 'Online / Local', travelTime: 0, distance: '0 mi', leaveByNote: '', notes: `${res.title} (${res.url})`, rating: null, reviewNote: '', withPerson: null, meetingType: 'Business' }]);
    pushToast(`Added a 45-minute "${activeSkill.name}" session on ${prettyDate(date)} at ${fromMins(start)}.`, 'success');
  };

  const getCategoryColorHex = (catId) => {
    const found = customCategories.find(c => c.id === catId);
    return found ? found.color : '#1F3A2E';
  };

  const roamieEnv = () => ({
    tasks, calendarEvents, weeklyHours: userProfile.weeklyHours, selectedDateStr, todayStr: todayDateStr(), now: new Date(),
    userName: accountInfo.name, dailyCap: userProfile.dailyActivityCap, weeklyTargets, mealBatches, todayMood, activeSkill, ideas: ideasFeed
  });

  const submitRoamie = async (q) => {
    const lower = q.toLowerCase();
    setRoamieMessages(prev => [...prev, { sender: 'user', text: q, sources: [] }]);

    if (lower.includes('report a bug') || lower === 'bug') {
      setRoamieBugMode(true);
      setRoamieMessages(prev => [...prev, { sender: 'roamie', text: "I've opened the report form. Pick what it's about (or Other), tell me what happened and send it.", sources: [] }]);
      return;
    }

    // 1) Things Roamie can do and answer on its own, using your actual planner.
    let local = null;
    try { local = roamieBrain(q, roamieEnv()); } catch (err) { local = null; }
    if (local) {
      if (local.task) setTasks(prev => [...prev, local.task]);
      if (local.removeTaskId) setTasks(prev => prev.filter(t => t.id !== local.removeTaskId));
      if (local.updateTask) setTasks(prev => prev.map(t => t.id === local.updateTask.id ? local.updateTask : t));
      setRoamieMessages(prev => [...prev, { sender: 'roamie', text: local.text, sources: [], action: local.openDate ? { label: `View ${prettyDate(local.openDate)}`, date: local.openDate } : null }]);
      return;
    }

    // 2) Everything else goes to the live AI with search, given your schedule as context.
    setRoamieLoading(true);
    try {
      const todayS = todayDateStr();
      const next7 = Array.from({ length: 7 }, (_, i) => addDaysStr(todayS, i));
      const userContextSummary = `
        User Name: ${accountInfo.name} (${userProfile.status} in ${loc.label}).
        Today is ${longDate(todayS)} (${todayS}). The user is viewing ${selectedDateStr} in the planner.
        Planned (next 14 days): ${tasks.filter(t => t.date >= todayS && t.date <= addDaysStr(todayS, 13)).sort((a, b) => (a.date + a.startTime).localeCompare(b.date + b.startTime)).map(t => `${t.date} ${t.startTime}-${t.endTime} ${t.title}`).slice(0, 30).join('; ') || 'nothing'}.
        Synced calendar events: ${calendarEvents.filter(c => !c.allDay && c.date >= todayS && c.date <= addDaysStr(todayS, 13)).slice(0, 25).map(c => `${c.date} ${c.start}-${c.end} ${c.title}`).join('; ') || 'none synced'}.
        Free windows with no clashes (45m+): ${next7.map(d => `${prettyDate(d)}: ${getFreeGaps(d, calCtx, 45).map(g => `${fromMins(g.s)}-${fromMins(g.e)}`).join(', ') || 'none'}`).join(' | ')}.
        Weekly targets: ${weeklyTargets.map(t => `${t.title} (${t.current}/${t.target} ${t.unit})`).join(', ')}.
        Fridge stock: ${mealBatches.map(b => `${b.portionsLeft} portions of ${b.name}`).join(', ')}.
        Active skill: ${activeSkill?.name} (goal: ${activeSkill?.goal}).
        Prep buffers: casual ${userProfile.prepTimeCasual}m, serious ${userProfile.prepTimeSerious}m. Energy today: ${todayMood || 'not logged'} (pacing cap ${userProfile.dailyActivityCap}/day).
        Work/study hours: ${Object.entries(userProfile.weeklyHours).filter(([, c]) => c.active).map(([d, c]) => `${d} ${c.start}-${c.end}`).join(', ') || 'none'}.
        Highly rated ideas: ${ideasFeed.filter(i => i.userRating >= 4).map(i => i.title).join(', ') || 'none yet'}.
      `;
      const systemPrompt = `You are Roamie, a warm, practical personal assistant and local concierge inside the Pact app, for a person based in ${loc.label}.
      You can search the web. The user's live planner context:
      ${userContextSummary}
      Answer the user's actual question directly, in warm, concise British English (2-6 sentences, plain text, no markdown headings).
      When asked to plan, suggest specific days and times taken from the free windows above, and mention the pacing cap if a day is full.
      Use ${loc.cur ? loc.cur : 'the local currency'} and local public transport for ${loc.label}. If unsure of something current, search rather than guess.
      Never claim you booked or added anything. Tell the user they can say "book <thing> on <day> at <time>" and you will add it to the planner.`;
      const history = roamieMessages.slice(-6).map(m => `${m.sender === 'user' ? 'User' : 'Roamie'}: ${m.text}`).join('\n');
      let answer = null;
      if (await geminiReady()) { try { answer = await callGeminiWithSearch(`Conversation so far:\n${history}\n\nUser: ${q}\n(The user writes casual, everyday English with slang and typos; interpret their intent generously.)`, systemPrompt, null, true); } catch (e) { answer = null; } }
      if (!answer) answer = await keylessAnswer(q, loc);
      const { text, sources } = answer;
      setRoamieMessages(prev => [...prev, { sender: 'roamie', text, sources: sources ? sources.slice(0, 3) : [] }]);
    } catch (err) {
      const msg = String((err && err.message) || '');
      const aiOn = await geminiReady();
      const reason = !aiOn
        ? "My smart mode isn't switched on for this site yet (the owner needs to add the GEMINI_API_KEY in Cloudflare), so I can only handle planner requests, places, weather and encyclopedia lookups right now."
        : msg === 'NO_ANSWER'
        ? "I couldn't find a clear answer to that. Try rephrasing, or ask about a place near you, the weather, or a topic."
        : "I couldn't reach the search services just now. Check your connection and try again. Planner questions still work offline.";
      setRoamieMessages(prev => [...prev, { sender: 'roamie', text: roamieOfflineReply(reason), sources: [] }]);
    } finally {
      setRoamieLoading(false);
    }
  };

  const handleSendRoamie = (e) => {
    e.preventDefault();
    const q = roamieInput.trim();
    if (!q || roamieLoading) return;
    setRoamieInput('');
    submitRoamie(q);
  };

  // --- CALENDAR SYNC HANDLERS ---
  const PROVIDER_LABELS = { google: 'Google Calendar', apple: 'iPhone / iCloud Calendar', outlook: 'Outlook Calendar', file: 'Uploaded file' };

  const fetchCalendarText = async (url) => {
    let res = null;
    try { res = await fetch('/api/ical?url=' + encodeURIComponent(url)); } catch (e) { res = null; }
    if (res && res.ok) return res.text();
    if (res && res.status !== 404 && res.status !== 405) {
      const msg = await res.text();
      throw new Error(msg || 'The calendar link could not be read.');
    }
    // No server function available (not on Netlify): try the link directly (works only if the provider allows it).
    try {
      const direct = await fetch(url.replace(/^webcals?:\/\//i, 'https://'));
      return await direct.text();
    } catch (e) {
      throw new Error("Couldn't reach that link from here. Live link sync works on the deployed Netlify site; meanwhile use the .ics File tab.");
    }
  };

  const syncCalendarSource = async (src) => {
    try {
      const text = await fetchCalendarText(src.url);
      const events = parseICS(text, Date.now() - 10 * 86400000, Date.now() + 75 * 86400000, src.id);
      return { ...src, events, lastSynced: Date.now(), error: null };
    } catch (e) {
      return { ...src, error: e.message || 'Sync failed' };
    }
  };

  const handleConnectCalendarUrl = async () => {
    const url = calForm.url.trim();
    if (!/^(https?|webcals?):\/\//i.test(url)) { setCalStatus('Paste the full calendar link starting with https:// or webcal://'); return; }
    setCalBusy(true);
    setCalStatus('Syncing your calendar…');
    const src = { id: 'cal_' + Date.now(), kind: calForm.provider, name: PROVIDER_LABELS[calForm.provider], url, events: [], lastSynced: null, error: null };
    const synced = await syncCalendarSource(src);
    if (synced.error) {
      setCalStatus(synced.error);
    } else {
      setCalendarSources(prev => [...prev, synced]);
      setCalForm({ ...calForm, url: '' });
      setCalStatus(`Connected! ${synced.events.length} upcoming events now block your schedule.`);
    }
    setCalBusy(false);
  };

  const handleResyncCalendar = async (id) => {
    const src = calendarSources.find(c => c.id === id);
    if (!src || !src.url) return;
    setCalStatus('Syncing…');
    const synced = await syncCalendarSource(src);
    setCalendarSources(prev => prev.map(c => (c.id === id ? synced : c)));
    setCalStatus(synced.error ? synced.error : `Updated: ${synced.events.length} upcoming events.`);
  };

  const handleCalendarFile = (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const id = 'cal_' + Date.now();
        const events = parseICS(String(reader.result), Date.now() - 10 * 86400000, Date.now() + 75 * 86400000, id);
        setCalendarSources(prev => [...prev, { id, kind: 'file', name: file.name, url: null, events, lastSynced: Date.now(), error: null }]);
        setCalStatus(`Imported ${events.length} upcoming events from ${file.name}.`);
      } catch (err) {
        setCalStatus('That file could not be read as a calendar.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  // --- ACCOUNT HANDLERS ---
  const handleSignOut = async () => {
    if (authUser && authUser.cloud) {
      const c = cloudRef.current;
      if (c.timer) { clearTimeout(c.timer); c.timer = null; }
      if (c.pending && c.version !== null) { try { await cloud.saveState(c.pending, c.version); } catch (e) { /* best effort */ } }
      await cloud.signOut();
    }
    store.del('roam:session');
    onReset();
  };
  const handleDeleteAccount = async () => {
    if (authUser && authUser.cloud) {
      const r = await cloud.deleteAccount();
      if (r.error) { setConfirmDelete(false); pushToast(r.error, 'info'); return; }
      store.del('roam:data:' + authUser.email); store.del('roam:ver:' + authUser.email);
      store.del('roam:session');
      onReset();
      return;
    }
    if (authUser && authUser.email) {
      const accounts = readAccounts();
      delete accounts[authUser.email];
      writeAccounts(accounts);
      store.del('roam:data:' + authUser.email);
    }
    store.del('roam:session');
    onReset();
  };

  // Demo / blank edition: index.html sets window.PACT_BLANK = true so a new user starts with no pre-filled entries.
  const applyBlankStart = () => {
    const starter = (domain) => ({ branches: [{ id: 'b_first_' + domain, name: 'My first area', x: 110, y: 120, skills: [{ id: 's_first_' + domain, name: 'My first skill', goal: 'What do you want to get good at?', timeframe: '1 Month', x: 110, y: 45, steps: [{ id: 'st_first_' + domain, title: 'Add your first milestone', done: false, comment: '' }] }] }] });
    setTasks([]); setWeeklyTargets([]); setMoodLogs([]); setMedications([]); setMealBatches([]); setMealHistoryLogs([]);
    setDailyMeals(prev => prev.map(m => ({ ...m, eaten: false, detail: '', selectedBatchId: '', mode: 'Cooked New' })));
    setLifeCadenceItems([]); setFriendsList([]); setPeople([]); setSharedFriendPlans([]); setCourseSuggestions([]);
    setSkillForest({ work: starter('work'), personal: starter('personal') });
    setSelectedBranchId('b_first_work'); setSelectedSkillId('s_first_work');
  };

  // Calendar connect UI (shared by Profile and first-run setup)
  const calConnectBlock = (
    <div className="space-y-3">
                  <div className="grid grid-cols-4 gap-1">
                    {[
                      { id: 'google', label: 'Google' },
                      { id: 'apple', label: 'iPhone' },
                      { id: 'outlook', label: 'Outlook' },
                      { id: 'file', label: '.ics File' }
                    ].map(p => (
                      <button
                        key={p.id}
                        onClick={() => setCalForm({ ...calForm, provider: p.id })}
                        className={`py-1.5 text-[10px] uppercase border ${calForm.provider === p.id ? 'bg-blue-800 text-white border-blue-800' : 'bg-white border-stone-300'}`}
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>

                  <div className="p-2.5 bg-[#FAF8F5] border border-stone-200 text-[11px] text-slate-700 leading-relaxed">
                    {calForm.provider === 'google' && 'In Google Calendar on a computer: Settings → pick your calendar → Integrate calendar → copy the "Secret address in iCal format" and paste it below.'}
                    {calForm.provider === 'apple' && 'On iPhone/Mac: Calendar app → (i) next to your calendar → turn on Public Calendar → Share Link → paste it below. Anyone with that link can see the calendar, so keep it private. Or export an .ics file and use the .ics File tab.'}
                    {calForm.provider === 'outlook' && 'Outlook.com: Settings → Calendar → Shared calendars → Publish a calendar → choose "Can view all details" → copy the ICS link and paste it below.'}
                    {calForm.provider === 'file' && 'Export your calendar as an .ics file (Google Calendar: Settings → Import & export → Export; iPhone/Mac: File → Export) and upload it here. One-off snapshot.'}
                  </div>

                  {calForm.provider !== 'file' ? (
                    <div className="flex gap-2">
                      <input
                        type="url"
                        placeholder="Paste calendar link (https:// or webcal://)"
                        value={calForm.url}
                        onChange={e => setCalForm({ ...calForm, url: e.target.value })}
                        className="flex-1 min-w-0 bg-[#FAF8F5] border border-stone-300 px-2.5 py-1.5 text-xs"
                      />
                      <button
                        onClick={handleConnectCalendarUrl}
                        disabled={calBusy}
                        className="px-3 py-1.5 bg-purple-900 hover:bg-purple-800 text-white text-[10px] uppercase tracking-wider font-medium shrink-0"
                      >
                        {calBusy ? 'Syncing…' : 'Connect'}
                      </button>
                    </div>
                  ) : (
                    <input
                      type="file"
                      accept=".ics,text/calendar"
                      aria-label="Upload calendar file"
                      onChange={handleCalendarFile}
                      className="w-full text-[11px] file:mr-2 file:px-2.5 file:py-1.5 file:border-0 file:bg-purple-900 file:text-white file:text-[10px] file:uppercase file:tracking-wider"
                    />
                  )}

                  {calStatus && <div className="p-2.5 bg-[#FAF8F5] border-l-4 border-purple-800 text-[11px] text-slate-700">{calStatus}</div>}
    </div>
  );

  // --- FRIEND INVITES (links; the friend accepts in their own account) ---
  const [inviteDraft, setInviteDraft] = useState({ taskId: '', friend: '' });
  const [inviteOut, setInviteOut] = useState(null);
  const [incomingInvite, setIncomingInvite] = useState(null);
  const [inviteAccepted, setInviteAccepted] = useState(false);
  const upcomingTasks = tasks.filter(t => t.date >= todayDateStr() && t.status !== 'done' && t.startTime).sort((a, b) => (a.date + a.startTime).localeCompare(b.date + b.startTime));
  const createInvite = () => {
    const t = tasks.find(x => String(x.id) === String(inviteDraft.taskId));
    if (!t) { pushToast('Pick a plan to invite them to first.', 'info'); return; }
    const link = makeInviteLink({ v: 1, from: accountInfo.name, h: accountInfo.username, t: t.title, d: t.date, s: t.startTime, e: t.endTime || t.startTime, l: t.location || '' });
    const hi = inviteDraft.friend ? `Hey ${inviteDraft.friend}, ` : '';
    const text = `${hi}${accountInfo.name} invited you to "${t.title}" on ${prettyDate(t.date)} at ${t.startTime}${t.location ? ' (' + t.location + ')' : ''}. Open this in Pact to accept: ${link}`;
    setInviteOut({ link, text });
  };
  const copyText = (txt, msg) => { try { navigator.clipboard && navigator.clipboard.writeText(txt); } catch (e) { /* ignore */ } pushToast(msg, 'success'); };
  const shareText = async (txt) => { try { if (navigator.share) { await navigator.share({ text: txt }); return; } } catch (e) { return; } copyText(txt, 'Copied. Paste it into a message.'); };
  const inviteClash = incomingInvite ? overlapWith(incomingInvite.d, toMins(incomingInvite.s), Math.max(15, toMins(incomingInvite.e) - toMins(incomingInvite.s)), { tasks, calendarEvents, weeklyHours: userProfile.weeklyHours }).length > 0 : false;
  const acceptInvite = () => {
    const inv = incomingInvite;
    if (!inv) return;
    setTasks(prev => [...prev, {
      id: Date.now(), title: inv.t, duration: Math.max(15, toMins(inv.e) - toMins(inv.s)), status: 'pending', startTime: inv.s, endTime: inv.e, date: inv.d,
      type: 'social', categoryColor: 'social', location: inv.l || '', transportMode: 'Walk', travelTime: 10, distance: '', leaveByNote: '', notes: `Invited by ${inv.from}`,
      rating: null, reviewNote: '', withPerson: inv.from, meetingType: 'Friendly'
    }]);
    setFriendsList(prev => (prev.some(f => f.name.toLowerCase() === String(inv.from).toLowerCase()) ? prev : [...prev, { id: Date.now() + 1, name: inv.from, handle: inv.h || '@' + String(inv.from).toLowerCase().replace(/\s+/g, ''), lastSeen: 'Just now', type: 'Friend', status: 'Synced' }]));
    setInviteAccepted(true);
    pushToast(`Added "${inv.t}" to your plan.`, 'success', { label: 'View', date: inv.d });
  };
  const replyText = incomingInvite ? `I'm in for "${incomingInvite.t}" on ${prettyDate(incomingInvite.d)} at ${incomingInvite.s}! (${accountInfo.name})` : '';

  // --- FIRST-RUN SETUP ---
  const [setupOpen, setSetupOpen] = useState(false);
  const [setupStep, setSetupStep] = useState(0);
  const [setupCalOpen, setSetupCalOpen] = useState(false);
  const [setupUserQ, setSetupUserQ] = useState('');
  const [setupUserRes, setSetupUserRes] = useState(null);
  const [setupPName, setSetupPName] = useState('');
  const [setupPFreq, setSetupPFreq] = useState(30);
  const [setupAdded, setSetupAdded] = useState([]);
  const [setupDraft, setSetupDraft] = useState({ situations: [], goals: ['out', 'people', 'touch'], travel: ['Walk', 'Bus / tram'], prep: 30, promise: 'To get out more, meet new people and stop putting my life on hold.', peopleOpen: '', importAfter: false, name: '', status: 'University Student', days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'], start: '09:00', end: '17:00', load: 'balanced', care: ['targets', 'medicine', 'meals', 'cadence'], interests: ['Food', 'Outdoor'], location: HOME_ASSUMED });
  const openSetup = () => {
    const wh = userProfile.weeklyHours || {};
    const on = SETUP_DAYS.filter(d => wh[d] && wh[d].active);
    const first = on.length ? wh[on[0]] : null;
    const rem = getReminderCfg(userProfile);
    setSetupDraft({
      situations: userProfile.situations || [], name: accountInfo.name || '', status: userProfile.status || 'University Student', days: on.length ? on : ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
      start: first ? first.start : '09:00', end: first ? first.end : '17:00',
      load: userProfile.dailyActivityCap <= 3 ? 'light' : userProfile.dailyActivityCap >= 6 ? 'full' : 'balanced',
      care: SETUP_CARE.filter(c => !homeLayout.hidden.includes(c.widget) && (!c.rem || rem[c.rem])).map(c => c.id),
      interests: userProfile.interests && userProfile.interests.length ? userProfile.interests : ['Food', 'Outdoor'],
      location: userProfile.location || HOME_ASSUMED,
      goals: userProfile.goals && userProfile.goals.length ? userProfile.goals : ['out', 'people', 'touch'], travel: userProfile.travel || ['Walk', 'Bus / tram'], prep: userProfile.prepTimeCasual || 30, promise: userProfile.promise || 'To get out more, meet new people and stop putting my life on hold.', peopleOpen: '', importAfter: false
    });
    setSetupAdded([]); setSetupUserQ(''); setSetupUserRes(null); setSetupPName('');
    setSetupStep(0); setSetupOpen(true);
  };
  const closeSetup = (apply) => {
    if (apply) {
      const D0 = setupDraft;
      const D = D0.healthOk ? D0 : { ...D0, care: D0.care.filter(x => !HEALTH_IDS.includes(x)) };
      if (D.name.trim()) setAccountInfo(prev => ({ ...prev, name: D.name.trim() }));
      const weeklyHours = {};
      SETUP_DAYS.forEach(d => { weeklyHours[d] = { active: D.days.includes(d), start: D.start, end: D.end }; });
      const rem = {};
      SETUP_CARE.forEach(c => { if (c.rem) rem[c.rem] = D.care.includes(c.id); });
      setUserProfile(prev => ({ ...prev, healthConsent: !!D0.healthOk || !!prev.healthConsent, ...(D0.healthOk ? { healthConsentAt: new Date().toISOString() } : {}), onboarded: true, status: D.status, weeklyHours, dailyActivityCap: D.load === 'light' ? 3 : D.load === 'full' ? 6 : 4, interests: D.interests, location: D.location, goals: D.goals, travel: D.travel, promise: D.promise, prepTimeCasual: D.prep, prepTimeSerious: Math.max(prev.prepTimeSerious || 0, D.prep), reminders: { ...getReminderCfg(prev), ...rem } }));
      setUserProfile(prev => ({ ...prev, ...presetPatch(D.situations || [], prev) }));
      if (D.importAfter) { setActiveTab('social'); setSocialSub('people'); setPeopleAddOpen(true); }
      setHomeLayout(prev => {
        const careWidgets = SETUP_CARE.map(c => c.widget);
        const hidden = prev.hidden.filter(id => !careWidgets.includes(id)).concat(SETUP_CARE.filter(c => !D.care.includes(c.id)).map(c => c.widget));
        return { ...prev, hidden };
      });
      if (D.interests.length && IDEA_CATEGORIES_BASE.includes(D.interests[0])) setSelectedIdeaCategory(D.interests[0]);
    } else {
      setUserProfile(prev => ({ ...prev, onboarded: true }));
    }
    setSetupOpen(false);
  };
  useEffect(() => { if (hydrated && userProfile.onboarded === false && !setupOpen) openSetup(); }, [hydrated, userProfile.onboarded]);
  useEffect(() => {
    if (!hydrated || !authUser || setupOpen || userProfile.onboarded === false) return;
    let pend = null;
    try { pend = JSON.parse(store.get(PENDING_INVITE) || 'null'); } catch (e) { pend = null; }
    if (pend) { store.del(PENDING_INVITE); setInviteAccepted(false); setIncomingInvite(pend); }
  }, [hydrated, setupOpen, userProfile.onboarded, authUser && authUser.email]);

  // Keep the sign-in state in step with Supabase (page reloads, sign-in elsewhere, token refresh)
  useEffect(() => {
    if (!cloud.enabled) return undefined;
    let alive = true;
    cloud.getUser().then(u => { if (!alive) return; if (u) setAuthUser(prev => (prev && prev.guest ? prev : (prev && prev.id === u.id ? prev : u))); setAuthReady(true); })
      .catch(() => { if (alive) setAuthReady(true); });
    const off = cloud.onAuthChange(u => {
      if (!alive) return;
      setAuthUser(prev => (u ? (prev && prev.id === u.id ? prev : u) : (prev && prev.cloud ? null : prev)));
    });
    return () => { alive = false; off(); };
  }, []);

  // Apply a saved data blob to the app state
  const applySaved = (saved) => {
    if (saved.tasks) setTasks(saved.tasks.filter(t => !((t.withPerson === 'Yasho' && t.title === 'Catch up Coffee & Architecture Walk') || (t.withPerson === 'Samir Patel' && /^Bouldering Session @ Depot/.test(t.title)))));
    if (saved.weeklyTargets) setWeeklyTargets(saved.weeklyTargets);
    if (saved.userProfile) setUserProfile({ onboarded: true, ...saved.userProfile });
    if (saved.accountInfo) setAccountInfo(saved.accountInfo);
    if (saved.moodLogs) setMoodLogs(saved.moodLogs);
    if (saved.todayMood !== undefined) setTodayMood(saved.todayMood);
    if (saved.todayMoodReason) setTodayMoodReason(saved.todayMoodReason);
    if (saved.medications) setMedications(saved.medications);
    if (saved.mealBatches) setMealBatches(saved.mealBatches);
    if (saved.dailyMeals) setDailyMeals(saved.dailyMeals);
    if (saved.mealHistoryLogs) setMealHistoryLogs(saved.mealHistoryLogs);
    if (saved.lifeCadenceItems) setLifeCadenceItems(saved.lifeCadenceItems);
    if (saved.ideasFeed) setIdeasFeed(saved.ideasFeed);
    if (Array.isArray(saved.favourites)) setFavourites(saved.favourites);
    if (saved.skillForest) setSkillForest(saved.skillForest);
    // old saved accounts may still hold the three demo friends from early versions: remove them
    if (saved.friendsList) setFriendsList(saved.friendsList.filter(f => f.userId || !['@yasho_m', '@mayalin', '@samirp'].includes(String(f.handle || '').toLowerCase())));
    if (Array.isArray(saved.people)) setPeople(saved.people);
    if (saved.customCategories) setCustomCategories(saved.customCategories);
    if (saved.calendarSources) setCalendarSources(saved.calendarSources);
    if (saved.roamieMessages) setRoamieMessages(saved.roamieMessages);
    if (saved.homeLayout) setHomeLayout(mergeHomeLayout(saved.homeLayout));
    if (typeof saved.homeNotes === 'string') setHomeNotes(saved.homeNotes);
    if (saved.water) setWater(saved.water);
    if (saved.countdown) setCountdown(saved.countdown);
    if (saved.reading) setReading(saved.reading);
  };
  const startFresh = () => {
    if (typeof window !== 'undefined' && window.PACT_BLANK === true) applyBlankStart();
    setUserProfile(prev => ({ ...prev, onboarded: false }));
    setAccountInfo(prev => ({ ...prev, name: authUser.name || prev.name, email: authUser.email, username: '@' + (store.get('pact:wantHandle') || authUser.email.split('@')[0]) }));
  };
  const readLocalBlob = (email) => { try { return JSON.parse(store.get('roam:data:' + email) || 'null'); } catch (e) { return null; } };
  const hasContent = (o) => !!o && typeof o === 'object' && Object.keys(o).length > 0;

  // Claim a unique @username for this account (adds digits if someone already has it).
  const claimHandle = async (raw) => {
    let h = cleanHandle(raw);
    if (h.length < 3) h = (cleanHandle(String((authUser && authUser.email) || 'pact').split('@')[0]) + '_user').slice(0, 24);
    let r = await cloud.claimUsername(h);
    for (let i = 0; i < 5 && r === 'taken'; i++) { const alt = h.slice(0, 20) + '_' + Math.floor(100 + Math.random() * 900); r = await cloud.claimUsername(alt); if (r === 'ok') h = alt; }
    if (r === 'ok') setAccountInfo(prev => (prev.username === '@' + h ? prev : { ...prev, username: '@' + h }));
    return r;
  };
  const saveHandle = async (raw) => {
    if (!authUser || !authUser.cloud) return;
    const h = cleanHandle(raw);
    try {
      const r = await cloud.claimUsername(h);
      setUsernameMsg(r === 'ok' ? `Friends can find you as @${h}.` : r === 'taken' ? 'That username is already taken. Try another.' : 'Use 3 to 24 letters, numbers or underscores.');
      if (r === 'ok') setAccountInfo(prev => ({ ...prev, username: '@' + h }));
    } catch (e) { setUsernameMsg("Couldn't save that right now. Try again."); }
  };
  const refreshFriends = async () => {
    if (!cloud.enabled || !authUser || !authUser.cloud) return;
    try {
      const [fr, rq] = await Promise.all([cloud.friends(), cloud.friendRequests()]);
      { const sn = seen(); const inc = rq.filter(r => r.direction === 'incoming');
        if (sn.req) inc.filter(r => !sn.req.includes(r.id)).forEach(r => notify(`${r.display_name || r.username} sent you a friend request.`, 'friend'));
        sn.req = inc.map(r => r.id);
        if (sn.fr) fr.filter(f => !sn.fr.includes(f.user_id)).forEach(f => notify(`${f.display_name || f.username} is now your friend.`, 'friend'));
        sn.fr = fr.map(f => f.user_id); saveSeen(); }
      setFriendReqs(prev => (stableJson(prev) === stableJson(rq) ? prev : rq));
      setFriendsList(prev => {
        const real = fr.map(f => {
          const old = prev.find(x => x.userId === f.user_id);
          const handle = f.username ? '@' + f.username : '';
          return old ? { ...old, name: f.display_name || old.name, handle, bio: f.bio || '', avatar: f.avatar || '' } : { id: 'u_' + f.user_id, userId: f.user_id, name: f.display_name || f.username || 'Friend', handle, lastSeen: 'Not yet', type: 'Friend', status: 'Synced', bio: f.bio || '', avatar: f.avatar || '' };
        });
        const next = [...real, ...prev.filter(x => !x.userId)];
        return stableJson(next) === stableJson(prev) ? prev : next;
      });
    } catch (e) { /* offline or tables not set up: keep what we have */ }
    try { const mp = await cloud.getMyProfile(); setMyProfile(prev => (prev.bio === mp.bio && prev.avatar === mp.avatar ? prev : { bio: mp.bio || '', avatar: mp.avatar || '' })); } catch (e) { /* profile columns not set up yet */ }
    await syncShared();
    await loadInbox();
  };
  const durationOf = (st, en) => Math.max(15, toMins(en || st) - toMins(st));
  const loadInbox = async () => {
    try {
      const r = await cloud.inbox(); setInboxRows(prev => (stableJson(prev) === stableJson(r) ? prev : r));
      const sn = seen();
      if (sn.unread) r.forEach(row => { if ((row.unread || 0) > (sn.unread[row.user_id] || 0)) { const nm = String(row.display_name || row.username || ''); if (/ (invited you to|updated|cancelled) "/.test(String(row.last_body || '')) && lastNotifRef.current.some(x => (x.kind === 'invite' || x.kind === 'change') && Date.now() - x.at < 30000 && x.text.includes(nm))) return; const b = String(row.last_body || '').replace(/\s+/g, ' '); notify(`${row.display_name || row.username}: ${b.length > 60 ? b.slice(0, 57) + '...' : b || 'sent you a message'}`, 'message'); } });
      sn.unread = Object.fromEntries(r.map(x => [x.user_id, x.unread || 0])); saveSeen();
    } catch (e) { /* messages not set up yet */ }
  };
  // Pull joint events and keep MY calendar in step with them: accepted events appear and follow the owner's edits; declined or cancelled ones disappear.
  const syncShared = async () => {
    if (!cloud.enabled || !authUser || !authUser.cloud) return;
    let evs; try { evs = await cloud.mySharedEvents(); } catch (e) { return; }
    setSharedEvents(prev => (stableJson(prev) === stableJson(evs) ? prev : evs));
    const invitedIds = evs.filter(e => !e.is_owner && e.my_status === 'invited').map(e => e.id);
    { const sn = seen();
      if (sn.invites) invitedIds.filter(id => !sn.invites.includes(id)).forEach(id => { const e = evs.find(x => x.id === id); if (e) notify(`${e.owner_name} invited you to "${e.title}". Open Social to answer.`, 'invite'); });
      sn.invites = invitedIds;
      const sigs = {}; evs.forEach(e => { if (!e.is_owner && e.my_status === 'accepted') { const d = e.details || {}; sigs[e.id] = { sig: sharedSig({ title: e.title, date: d.date || '', startTime: d.start || '', endTime: d.end || d.start || '', location: d.location || '' }), title: e.title, who: e.owner_name }; } });
      if (sn.sigs) { Object.keys(sigs).forEach(id => { if (sn.sigs[id] && sn.sigs[id].sig !== sigs[id].sig) notify(`${sigs[id].who} changed the plan "${sigs[id].title}". Check the new details in your schedule.`, 'change'); });
        Object.keys(sn.sigs).forEach(id => { if (!sigs[id] && !evs.some(e => e.id === id && e.my_status === 'accepted')) notify(`"${sn.sigs[id].title}" is no longer on: it was cancelled or changed.`, 'change'); }); }
      sn.sigs = sigs; saveSeen(); }
    const ids = new Set(evs.map(e => e.id));
    setTasks(prev => {
      let next = prev.slice(); let changed = false;
      for (const e of evs) {
        const d = e.details || {};
        const srv = { title: e.title, date: d.date || '', startTime: d.start || '', endTime: d.end || d.start || '', location: d.location || '' };
        const sig = sharedSig(srv);
        const i = next.findIndex(t => t.sharedId === e.id);
        if (e.is_owner) {
          if (i >= 0 && sharedSig(next[i]) === next[i].sharedSig && sig !== next[i].sharedSig) { next[i] = { ...next[i], ...srv, duration: durationOf(srv.startTime, srv.endTime), sharedSig: sig }; changed = true; }
        } else if (e.my_status === 'accepted') {
          if (i < 0) {
            next.push({ id: Date.now() + next.length, ...srv, duration: durationOf(srv.startTime, srv.endTime), status: 'pending', type: 'social', categoryColor: 'social', transportMode: 'Walk', travelTime: 10, distance: '', leaveByNote: '', notes: `Joint event with ${e.owner_name}`, rating: null, reviewNote: '', withPerson: e.owner_name, meetingType: 'Friendly', sharedId: e.id, sharedRole: 'guest', sharedSig: sig });
            changed = true;
          } else if (sig !== sharedSig(next[i])) { next[i] = { ...next[i], ...srv, duration: durationOf(srv.startTime, srv.endTime), sharedSig: sig }; changed = true; }
        } else if (i >= 0) { next.splice(i, 1); changed = true; }   // declined, or invited but not accepted: not on my calendar
      }
      next = next.flatMap(t => {
        if (!t.sharedId || ids.has(t.sharedId)) return [t];
        changed = true;
        if (t.sharedRole === 'owner') { const { sharedId, sharedRole, sharedSig: _s, ...rest } = t; return [rest]; }   // event gone: keep my own plan
        return [];                                                                                                     // cancelled by the owner
      });
      return changed ? next : prev;
    });
  };
  // Owner edits a plan that is shared: tell the server so everyone's calendar follows.
  useEffect(() => {
    if (!hydrated || !authUser || !authUser.cloud) return undefined;
    const pending = tasks.filter(t => t.sharedId && t.sharedRole === 'owner' && sharedSig(t) !== t.sharedSig);
    if (!pending.length) return undefined;
    const id = setTimeout(async () => {
      for (const t of pending) {
        try {
          await cloud.updateSharedEvent(t.sharedId, t.title, { date: t.date, start: t.startTime, end: t.endTime, location: t.location || '' });
          const sg = sharedSig(t); setTasks(prev => prev.map(x => x.id === t.id ? { ...x, sharedSig: sg } : x));
        } catch (e) { /* try again on the next change */ }
      }
    }, 1200);
    return () => clearTimeout(id);
  }, [tasks, hydrated]);
  const pactFriends = friendsList.filter(f => f.userId);
  const loadSched = async () => {
    if (!authUserRef.current || !authUserRef.current.cloud) return;
    try {
      const [sh, gr] = await Promise.all([cloud.schedulesSharedWithMe(), cloud.myScheduleGrants()]);
      setSchedShared(sh); setSchedGrants(gr); setSchedLoaded(true);
    } catch (e) { /* offline or not set up yet: the grid just shows your own day */ }
  };
  useEffect(() => { if (hydrated && authUser && authUser.cloud && activeTab === 'schedule') loadSched(); }, [activeTab, hydrated, authUser && authUser.email]);
  // Publish only the busy blocks of people I chose to share with. Private plans are never included. Clears itself when sharing stops.
  const publishSchedRef = useRef('');
  useEffect(() => {
    if (!hydrated || !authUser || !authUser.cloud || !schedLoaded) return;
    const t0 = todayDateStr(), t1 = addDaysStr(t0, 31);
    const blocks = schedGrants.length === 0 ? [] : tasks
      .filter(t => t.date && t.date >= t0 && t.date <= t1 && t.startTime && t.endTime && !t.hideFromFriends)
      .slice(0, 240).map(t => ({ d: t.date, s: t.startTime, e: t.endTime, t: String(t.title || 'Busy').slice(0, 60) }));
    const sig = JSON.stringify(blocks);
    if (sig === publishSchedRef.current) return;
    const timer = setTimeout(() => { cloud.setMySchedule(blocks).then(() => { publishSchedRef.current = sig; }).catch(() => {}); }, 2500);
    return () => clearTimeout(timer);
  }, [tasks, schedGrants, schedLoaded, hydrated, authUser && authUser.email]);
  // ---- learn a skill with a friend ----
  const loadBuddies = async () => {
    if (!authUserRef.current || !authUserRef.current.cloud) return;
    try { setBuddies(await cloud.mySkillBuddies()); } catch (e) { /* not set up yet or offline */ }
  };
  useEffect(() => { if (hydrated && authUser && authUser.cloud && activeTab === 'skills') loadBuddies(); }, [activeTab, hydrated, authUser && authUser.email]);
  useEffect(() => { if (!(hydrated && authUser && authUser.cloud && activeTab === 'skills' && skillOpen)) return; const t = setInterval(loadBuddies, 20000); return () => clearInterval(t); }, [activeTab, skillOpen, hydrated, authUser && authUser.email]);
  const skillProgress = (sk) => { const done = sk.steps.filter(x => x.done).length; const last = [...sk.steps].reverse().find(x => x.done); return { done, total: sk.steps.length, pct: sk.steps.length ? Math.round(done / sk.steps.length * 100) : 0, last: last ? String(last.title).slice(0, 40) : '' }; };
  const inviteBuddy = async (sk, friendId, note) => {
    try {
      const r = await cloud.inviteSkillBuddy(friendId, sk.name, { goal: sk.goal, timeframe: sk.timeframe, chapters: sk.steps.map(x => x.title).slice(0, 30) }, skillProgress(sk), note);
      pushToast(r === 'ok' ? 'Invitation sent.' : r === 'exists' ? 'You are already learning this together.' : r === 'not_friends' ? 'You can only invite friends you are connected to.' : 'Could not send the invitation.', 'info');
      loadBuddies();
    } catch (e) { pushToast('Could not send the invitation. Check your connection.', 'info'); }
  };
  const respondBuddy = async (v, accept) => {
    try {
      let mine = {};
      if (accept) {
        // Add the skill to my own map (under "Learning together") if I do not already have it.
        const have = Object.values(skillForest).flatMap(d => d.branches).flatMap(b => b.skills).find(x => x.name.toLowerCase() === v.skill.toLowerCase());
        if (!have) {
          const pl = v.plan || {}, t = Date.now();
          const sk = { id: 's_' + t, name: v.skill, goal: pl.goal || ('Learn ' + v.skill + ' with ' + v.friend_name), timeframe: pl.timeframe || '4 Weeks', x: 180, y: 40, steps: (pl.chapters || []).map((c, i) => ({ id: 'st_' + t + '_' + i, title: c, done: false, comment: '' })) };
          if (!sk.steps.length) sk.steps = [{ id: 'st_' + t, title: 'First steps in ' + v.skill, done: false, comment: '' }];
          setSkillForest(prev => {
            const dom = skillTreeDomain; const d = prev[dom]; const ex = d.branches.find(b => b.name === 'Learning together');
            return { ...prev, [dom]: { branches: ex ? d.branches.map(b => b === ex ? { ...b, skills: [...b.skills, sk] } : b) : [...d.branches, { id: 'br_' + t, name: 'Learning together', x: 180, y: 125, skills: [sk] }] } };
          });
          mine = skillProgress(sk);
        } else mine = skillProgress(have);
      }
      await cloud.respondSkillBuddy(v.id, accept, mine);
      if (accept) pushToast('You are learning ' + v.skill + ' with ' + v.friend_name + '.', 'info');
      loadBuddies();
    } catch (e) { pushToast('Could not answer. Check your connection.', 'info'); }
  };
  const endBuddy = async (v) => { try { await cloud.endSkillBuddy(v.id); loadBuddies(); } catch (e) { pushToast('Could not end it. Check your connection.', 'info'); } };
  // Keep my side of every active buddy skill up to date.
  const buddySigRef = useRef({});
  useEffect(() => {
    if (!hydrated || !authUser || !authUser.cloud) return;
    const all = Object.values(skillForest).flatMap(d => d.branches).flatMap(b => b.skills);
    const timer = setTimeout(() => {
      (buddies || []).filter(v => v.status === 'active').forEach(v => {
        const sk = all.find(x => x.name.toLowerCase() === v.skill.toLowerCase()); if (!sk) return;
        const pr = skillProgress(sk), sig = JSON.stringify(pr);
        if (buddySigRef.current[v.id] === sig || JSON.stringify(v.my_progress) === sig) { buddySigRef.current[v.id] = sig; return; }
        cloud.updateSkillProgress(v.id, pr).then(() => { buddySigRef.current[v.id] = sig; }).catch(() => {});
      });
    }, 2000);
    return () => clearTimeout(timer);
  }, [skillForest, buddies, hydrated, authUser && authUser.email]);
  const setScheduleShare = async (friendId, days, titles) => {
    try {
      const r = await cloud.setScheduleGrant(friendId, days, titles);
      if (r !== 'ok') { pushToast(r === 'not_friends' ? 'You can only share with friends you are connected to.' : 'Could not change sharing.', 'info'); return; }
      pushToast(days > 0 ? 'Schedule shared.' : 'Sharing stopped.', 'info');
      publishSchedRef.current = '';
      await loadSched();
    } catch (e) { pushToast('Could not change sharing. Check your connection.', 'info'); }
  };
  const unreadBy = Object.fromEntries(inboxRows.map(r => [r.user_id, r.unread || 0]));
  const unreadTotal = inboxRows.reduce((n, r) => n + (r.unread || 0), 0);
  const pendingInvites = sharedEvents.filter(e => !e.is_owner && e.my_status === 'invited');
  const loadChat = async (fr) => {
    try { const rows = await cloud.conversation(fr.userId); setChatMsgs(rows.slice().reverse()); await cloud.markRead(fr.userId); loadInbox(); } catch (e) { /* ignore */ }
  };
  const openChat = (fr) => { setChatWith(fr); setChatMsgs([]); loadChat(fr); };
  const sendChat = async () => {
    const b = chatText.trim(); if (!b || !chatWith) return;
    setChatText('');
    try { const r = await cloud.sendMessage(chatWith.userId, b); if (r !== 'sent') pushToast("That message couldn't be sent. You can only message friends.", 'error'); await loadChat(chatWith); }
    catch (e) { pushToast("Couldn't send that right now. Try again.", 'error'); }
  };
  useEffect(() => {
    if (!chatWith) return undefined;
    const id = setInterval(() => { if (typeof document === 'undefined' || document.visibilityState === 'visible') loadChat(chatWith); }, 8000);
    return () => clearInterval(id);
  }, [chatWith && chatWith.userId]);
  const answerEvent = async (eventId, status, note) => {
    try { await cloud.respondToEvent(eventId, status, note); pushToast(status === 'accepted' ? 'Added to your schedule.' : 'Declined.', status === 'accepted' ? 'success' : 'info'); await syncShared(); if (chatWith) loadChat(chatWith); }
    catch (e) { pushToast("Couldn't send your answer right now.", 'error'); }
  };
  const sendPactInvite = async (tid?) => {
    const useId = (typeof tid === 'string' || typeof tid === 'number') ? tid : inviteDraft.taskId;
    const t = tasks.find(x => String(x.id) === String(useId));
    if (!t) { pushToast('Pick a plan first.', 'info'); return; }
    if (!inviteSel.length) { pushToast('Tap at least one friend to invite.', 'info'); return; }
    setInviteBusy(true);
    try {
      if (t.sharedId && t.sharedRole !== 'owner') { pushToast('Only the person who made this plan can invite more people.', 'info'); }
      else if (t.sharedId) { for (const uid of inviteSel) await cloud.inviteToEvent(t.sharedId, uid, inviteNote); pushToast('Invite sent.', 'success'); }
      else {
        const eid = await cloud.createSharedEvent(t.title, { date: t.date, start: t.startTime, end: t.endTime, location: t.location || '' }, inviteSel, inviteNote);
        setTasks(prev => prev.map(x => x.id === t.id ? { ...x, sharedId: eid, sharedRole: 'owner', sharedSig: sharedSig(t) } : x));
        pushToast('Invite sent in Pact. They will see it in their Social tab and messages.', 'success');
      }
      setInviteSel([]); setInviteNote(''); await syncShared(); loadInbox();
    } catch (e) { pushToast("Couldn't send that invite. Check your connection, and that the 0004 database update has been run.", 'error'); }
    setInviteBusy(false);
  };
  const saveEventEdit = async () => {
    const ed = editEvent; if (!ed || !ed.title.trim()) return;
    const details = { date: ed.date, start: ed.start, end: ed.end || ed.start, location: ed.location || '' };
    try {
      const n = await cloud.updateSharedEvent(ed.id, ed.title.trim(), details);
      setTasks(prev => prev.map(x => x.sharedId === ed.id ? { ...x, title: ed.title.trim(), date: ed.date, startTime: ed.start, endTime: ed.end || ed.start, duration: durationOf(ed.start, ed.end), location: ed.location || '', sharedSig: sharedSig({ title: ed.title.trim(), date: ed.date, startTime: ed.start, endTime: ed.end || ed.start, location: ed.location || '' }) } : x));
      pushToast(n > 0 ? `Updated. ${n} ${n === 1 ? 'person was' : 'people were'} told.` : 'Updated.', 'success');
      setEditEvent(null); await syncShared();
    } catch (e) { pushToast("Couldn't save that change right now.", 'error'); }
  };
  const deletePlan = async (task, everyone) => {
    try {
      if (task.sharedId && task.sharedRole === 'owner' && everyone) { await cloud.deleteSharedEvent(task.sharedId); }
      else if (task.sharedId && task.sharedRole !== 'owner') { await cloud.respondToEvent(task.sharedId, 'declined', ''); }
    } catch (er) { pushToast("Couldn't tell your friends just now, so nothing was deleted. Try again.", 'error'); return; }
    setTasks(prev => prev.filter(t => t.id !== task.id));
    setDelAsk(null); setSheetTaskId(null);
    pushToast(task.sharedId && task.sharedRole === 'owner' && everyone ? 'Plan deleted for everyone.' : 'Plan deleted.', 'info');
    if (task.sharedId) { try { await syncShared(); } catch (e) {} }
  };
  const cancelEvent = async (e) => {
    try { await cloud.deleteSharedEvent(e.id); setTasks(prev => prev.map(t => { if (t.sharedId !== e.id) return t; const { sharedId, sharedRole, sharedSig: _s, ...rest } = t; return rest; })); pushToast('Cancelled for everyone.', 'info'); await syncShared(); }
    catch (er) { pushToast("Couldn't cancel that right now.", 'error'); }
  };
  const addEventToMySchedule = (e) => {
    const d = e.details || {}; const srv = { title: e.title, date: d.date || '', startTime: d.start || '', endTime: d.end || d.start || '', location: d.location || '' };
    setTasks(prev => prev.some(t => t.sharedId === e.id) ? prev : [...prev, { id: Date.now(), ...srv, duration: durationOf(srv.startTime, srv.endTime), status: 'pending', type: 'social', categoryColor: 'social', transportMode: 'Walk', travelTime: 10, distance: '', leaveByNote: '', notes: 'Joint event', rating: null, reviewNote: '', withPerson: null, meetingType: 'Friendly', sharedId: e.id, sharedRole: e.is_owner ? 'owner' : 'guest', sharedSig: sharedSig(srv) }]);
  };
  const searchFriend = async (q) => {
    const h = cleanHandle(typeof q === 'string' ? q : friendQuery);
    if (h.length < 3) { setFriendMsg('Type their full username, like @maya_lin.'); setFriendFound(null); return; }
    setFriendBusy(true); setFriendMsg(''); setFriendFound(null);
    try { setFriendFound((await cloud.findUser(h)) || 'none'); } catch (e) { setFriendMsg("Couldn't search right now. Check your connection and try again."); }
    setFriendBusy(false);
  };
  const openFriendProfile = async (fr) => {
    if (!fr) return;
    setViewFriend({ fr, data: null, busy: true });
    let data = null;
    try { if (fr.userId && cloud.enabled) data = await cloud.getFriendProfile(fr.userId); } catch (e) { data = null; }
    setViewFriend({ fr, data, busy: false });
  };
  const shareCfg = { mood: false, acts: 'off', from: '', to: '', ...((userProfile && userProfile.share) || {}) };
  const setShareCfg = (patch) => setUserProfile(prev => ({ ...prev, share: { mood: false, acts: 'off', from: '', to: '', ...(prev.share || {}), ...patch } }));
  const sendFriendReq = async (id) => {
    setFriendBusy(true);
    try {
      const r = await cloud.sendFriendRequest(id);
      setFriendMsg(r === 'sent' ? 'Request sent. They will see it in their Friend Book.' : r === 'accepted' ? "You're now friends!" : r === 'already_friends' ? "You're already friends." : "Couldn't send that request.");
      setFriendFound(null); setFriendQuery('');
      await refreshFriends();
    } catch (e) { setFriendMsg("Couldn't send that right now. Try again."); }
    setFriendBusy(false);
  };
  const answerFriendReq = async (req, ok) => {
    try { await cloud.respondFriendRequest(req.id, ok); pushToast(ok ? `You and ${req.display_name || 'them'} are now friends.` : 'Request declined.', ok ? 'success' : 'info'); await refreshFriends(); }
    catch (e) { pushToast("Couldn't answer that right now.", 'error'); }
  };
  const unfriend = async (fr) => {
    if (!fr.userId) { setFriendsList(prev => prev.filter(x => x.id !== fr.id)); return; }
    try { await cloud.removeFriend(fr.userId); setFriendsList(prev => prev.filter(x => x.id !== fr.id)); pushToast(`Removed ${fr.name}.`, 'info'); }
    catch (e) { pushToast("Couldn't remove them right now.", 'error'); }
  };
  useEffect(() => { if (hydrated && authUser && authUser.cloud && (activeTab === 'social' || activeTab === 'schedule')) { if (activeTab === 'social') refreshFriends(); else { syncShared(); loadInbox(); } } }, [activeTab, socialSub, hydrated]);
  useEffect(() => {
    if (!hydrated || !authUser || !authUser.cloud) return undefined;
    claimHandle(accountInfo.username).catch(() => { /* friends tables not set up yet */ });
    refreshFriends();
    const id = setInterval(() => { if (typeof document === 'undefined' || document.visibilityState === 'visible') refreshFriends(); }, 45000);
    return () => clearInterval(id);
  }, [hydrated, authUser && authUser.email]);

  // Load saved data after sign-in
  useEffect(() => {
    if (!authUser) { setHydrated(false); return undefined; }
    if (authUser.guest) { if (typeof window !== 'undefined' && window.PACT_BLANK === true) applyBlankStart(); setUserProfile(prev => ({ ...prev, onboarded: false })); setHydrated(true); return undefined; }

    if (authUser.cloud) {
      let cancelled = false;
      const c = cloudRef.current;
      c.email = authUser.email; c.pending = null; c.saving = false;
      (async () => {
        const r = await cloud.loadState();
        if (cancelled) return;
        const local = readLocalBlob(authUser.email);
        let saved = null;
        if (r.error) {
          // Server unreachable: work from this device's copy and sync later. Only trust a version we have seen before.
          const v = Number(store.get('roam:ver:' + authUser.email));
          c.version = Number.isFinite(v) && store.get('roam:ver:' + authUser.email) !== null ? v : null;
          saved = local;
          setSyncStatus('offline');
        } else {
          c.version = r.version;
          c.synced = stableJson(r.data || {});
          store.set('roam:ver:' + authUser.email, String(r.version));
          // Server copy wins. If the account is brand new on the server but this device has local data
          // (someone who used Pact before accounts went online), bring that data across.
          saved = hasContent(r.data) ? r.data : (local || null);
          setSyncStatus(hasContent(r.data) ? 'saved' : 'idle');
        }
        if (saved) applySaved(saved); else startFresh();
        setHydrated(true);
      })();
      return () => { cancelled = true; };
    }

    const saved = readLocalBlob(authUser.email);
    if (saved) applySaved(saved); else startFresh();
    setHydrated(true);
    return undefined;
  }, [authUser && authUser.email, authUser && authUser.guest]);

  // Pull the server copy (used when another device saved first)
  const pullRemote = async (announce) => {
    const c = cloudRef.current;
    const r = await cloud.loadState();
    if (r.error) { setSyncStatus('offline'); return false; }
    c.version = r.version; c.pending = null; c.synced = stableJson(r.data || {});
    store.set('roam:ver:' + c.email, String(r.version));
    if (hasContent(r.data)) { store.set('roam:data:' + c.email, JSON.stringify(r.data)); applySaved(r.data); if (announce) pushToast('Updated with your latest changes from another device.', 'info'); }
    setSyncStatus('saved');
    return true;
  };
  const flushCloud = async () => {
    const c = cloudRef.current;
    if (c.timer) { clearTimeout(c.timer); c.timer = null; }
    if (c.saving || !c.pending) return;
    if (c.version === null) { await pullRemote(false); return; }   // never saved from this device and could not load: adopt the server copy
    c.saving = true; setSyncStatus('saving');
    const blob = c.pending; c.pending = null;
    const r = await cloud.saveState(blob, c.version);
    c.saving = false;
    if (r.version !== undefined) {
      c.version = r.version; c.synced = stableJson(blob); store.set('roam:ver:' + c.email, String(r.version)); setSyncStatus('saved');
      if (c.pending) flushCloud();
    } else if (r.conflict) {
      await pullRemote(true);
    } else {
      if (!c.pending) c.pending = blob;
      setSyncStatus(typeof navigator !== 'undefined' && navigator.onLine === false ? 'offline' : 'error');
      c.timer = setTimeout(flushCloud, 15000);
    }
  };

  // Save automatically: on this device straight away, and to the server a moment after the last change
  useEffect(() => {
    if (!authUser || authUser.guest || !hydrated) return;
    const blob = {
      tasks, weeklyTargets, userProfile, accountInfo, moodLogs, todayMood, todayMoodReason, medications, mealBatches,
      dailyMeals, mealHistoryLogs, lifeCadenceItems, ideasFeed, favourites, skillForest, friendsList, people, customCategories, calendarSources,
      roamieMessages: roamieMessages.slice(-30), homeLayout, homeNotes, water, countdown, reading
    };
    store.set('roam:data:' + authUser.email, JSON.stringify(blob));
    if (authUser.cloud) {
      const c = cloudRef.current;
      if (stableJson(blob) === c.synced) { c.pending = null; return; }   // already on the server (e.g. just pulled from another device)
      c.pending = blob;
      if (c.timer) clearTimeout(c.timer);
      c.timer = setTimeout(flushCloud, 1200);
    }
  }, [hydrated, tasks, weeklyTargets, userProfile, accountInfo, moodLogs, todayMood, todayMoodReason, medications, mealBatches,
      dailyMeals, mealHistoryLogs, lifeCadenceItems, ideasFeed, favourites, skillForest, friendsList, people, customCategories, calendarSources, roamieMessages, homeLayout, homeNotes, water, countdown, reading]);

  // Save when the app is backgrounded; check for newer data from another device when it comes back; retry when back online
  useEffect(() => {
    if (!authUser || !authUser.cloud || !hydrated) return undefined;
    const onVis = async () => {
      const c = cloudRef.current;
      if (document.visibilityState === 'hidden') { flushCloud(); return; }
      if (c.pending || c.saving || c.version === null) return;
      const rv = await cloud.remoteVersion();
      if (rv !== null && rv > c.version) pullRemote(true);
    };
    const onOnline = () => { if (cloudRef.current.pending) flushCloud(); };
    document.addEventListener('visibilitychange', onVis);
    window.addEventListener('online', onOnline);
    return () => { document.removeEventListener('visibilitychange', onVis); window.removeEventListener('online', onOnline); };
  }, [authUser && authUser.id, hydrated]);

  // Re-sync linked calendars on load and every 20 minutes while the app is open
  useEffect(() => {
    if (!hydrated) return undefined;
    let cancelled = false;
    const run = async () => {
      const linked = calendarSources.filter(c => c.url && (!c.lastSynced || Date.now() - c.lastSynced > 15 * 60000));
      if (!linked.length) return;
      const updated = await Promise.all(linked.map(syncCalendarSource));
      if (cancelled) return;
      setCalendarSources(prev => prev.map(c => updated.find(u => u.id === c.id) || c));
    };
    run();
    const timer = setInterval(run, 20 * 60000);
    return () => { cancelled = true; clearInterval(timer); };
  }, [hydrated]);

  // --- SMART SLOT HELPERS (task planner, chips, surprise, adventurous) ---
  const taskSig = JSON.stringify([taskConfig.totalHours, taskConfig.blocks, taskConfig.date, taskConfig.deadline, taskConfig.pref, taskConfig.startTime, tasks.length, calendarEvents.length]);
  const taskSkip = taskSkipState.sig === taskSig ? taskSkipState.skip : [];
  const taskPlan = (plannerOpen && plannerMode === 'task')
    ? planTaskBlocks({
        totalMins: Math.round(taskConfig.totalHours * 60),
        blocks: taskConfig.blocks,
        startDate: taskConfig.date,
        deadline: taskConfig.deadline,
        earliestStart: taskConfig.startTime,
        pref: taskConfig.pref,
        ctx: calCtx,
        cap: userProfile.dailyActivityCap,
        skip: taskSkip
      })
    : null;

  const renderSlotChips = (date, dur, current, onPick) => {
    const gaps = getFreeGaps(date, calCtx, dur).slice(0, 6);
    const cur = toMins(current);
    return (
      <div className="space-y-1.5">
        <div className="text-[10px] uppercase tracking-wider text-slate-700 font-medium">Free times that day (no clashes)</div>
        {gaps.length === 0 ? (
          <div className="p-2.5 bg-white border border-stone-300 text-xs text-stone-600">No free {dur}-minute window that day. Try another date.</div>
        ) : (
          <div className="flex flex-wrap gap-1.5">
            {gaps.map(g => {
              const active = cur >= g.s && cur + dur <= g.e;
              return (
                <button
                  key={g.s}
                  type="button"
                  onClick={() => onPick(fromMins(g.s))}
                  className={`px-2.5 py-1 text-[11px] border font-mono ${active ? 'bg-blue-800 text-white border-blue-800' : 'bg-white text-slate-700 border-stone-300 hover:border-blue-800'}`}
                >
                  {fromMins(g.s)}–{fromMins(g.e)}
                </button>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  const rollSurprise = async () => {
    setSurpriseConfig(prev => ({ ...prev, showPopup: true }));
    const local = generateSurprise(surpriseConfig, surpriseSeen);
    const remember = (...keys) => setSurpriseSeen(prev => { const n = new Set(prev); keys.forEach(k => n.add(k)); return n; });
    if (loc.isHome && !local.exhausted) {   // the built-in list is Manchester-only
      setSurprisePick(local);
      remember(local.actKey);
      return;
    }
    if (!loc.isHome) {
      // Pick a real place near the profile location, matched to the chosen vibe.
      setSurpriseLoading(true);
      try {
        const VIBE_CATS = { 'Adventurous & Quirky': ['Sports', 'Indoor', 'Outdoor'], 'Cozy & Cultural': ['Indoor', 'Food'], 'Creative & Hands-On': ['Indoor', 'Shopping'], 'Outdoor & Refreshing': ['Outdoor', 'Sports'] };
        const cats = (VIBE_CATS[surpriseConfig.vibe] || ['Outdoor', 'Indoor']).slice().sort(() => Math.random() - 0.5);
        const seenL = new Set([...surpriseSeen].map(x => String(x).toLowerCase()));
        for (const c of cats) {
          const got = await osmIdeas({ cat: c, loc, seen: seenL, n: 1 }).catch(() => []);
          if (got.length) {
            const g = got[0];
            setSurprisePick({ key: 'near|' + g.title, actKey: g.title, title: g.title, duration: surpriseConfig.duration, location: osmAddressOf(g) || loc.city, desc: g.desc, transport: `${g.distance} from your location`, cost: surpriseConfig.budget, link: g.link || mapsDir(g.lat, g.lon) });
            remember(g.title);
            setSurpriseLoading(false);
            return;
          }
        }
      } catch (e) { /* fall through to the AI idea below */ }
    }
    // All built-in ideas used: ask Roamie's AI for a brand-new one, otherwise use a fresh twisted variant.
    setSurpriseLoading(true);
    try {
      const schema = {
        type: "OBJECT",
        properties: {
          title: { type: "STRING" }, desc: { type: "STRING" }, location: { type: "STRING" },
          transport: { type: "STRING" }, cost: { type: "STRING" }
        },
        propertyOrdering: ["title", "desc", "location", "transport", "cost"]
      };
      const already = [...surpriseSeen].filter(k => !k.includes('|')).slice(-30).join('; ');
      const prompt = `Suggest ONE surprising, real, bookable-or-free activity in ${loc.isHome ? 'Greater Manchester' : loc.label}. Vibe: "${surpriseConfig.vibe}". Max budget: ${surpriseConfig.budget}. Fits within ${surpriseConfig.duration} minutes. Do not repeat any of these: ${already}. Include a one-line twist to make it memorable.`;
      if (!(await geminiReady())) throw new Error('NO_SERVICE');
      const res = await callGrounded(prompt, `You are a witty ${loc.city} local who plans delightful surprise outings. Return JSON.`, schema);
      const parsed = res && res.text ? JSON.parse(res.text) : null;
      if (parsed && parsed.title && !surpriseSeen.has(parsed.title)) {
        setSurprisePick({
          key: 'ai|' + parsed.title, actKey: parsed.title, title: parsed.title, duration: surpriseConfig.duration,
          location: parsed.location || (loc.isHome ? 'Greater Manchester' : loc.label), desc: parsed.desc || '', transport: parsed.transport || (loc.isHome ? 'Check TfGM journey planner' : 'Check local transport'),
          cost: parsed.cost || surpriseConfig.budget,
          link: `https://www.google.com/search?q=${encodeURIComponent(parsed.title + ' ' + loc.city)}`
        });
        remember(parsed.title);
        return;
      }
      throw new Error('no ai idea');
    } catch (e) {
      let done = false;
      try {
        const cats = ['Outdoor', 'Indoor', 'Food', 'Shopping'].sort(() => Math.random() - 0.5);
        for (const c of cats) {
          const got = await osmIdeas({ cat: c, loc, seen: new Set([...surpriseSeen].map(x => String(x).toLowerCase())), n: 1 });
          if (got.length) {
            const g = got[0];
            setSurprisePick({ key: 'osm|' + g.title, actKey: g.title, title: g.title, duration: surpriseConfig.duration, location: osmAddressOf(g) || loc.city, desc: g.desc, transport: `${g.distance} from the centre`, cost: surpriseConfig.budget, link: g.link || mapsDir(g.lat, g.lon) });
            remember(g.title); done = true; break;
          }
        }
      } catch (e2) { /* fall through */ }
      if (!done) {
        if (loc.isHome) { setSurprisePick(local); remember(local.key); }
        else setSurprisePick({ key: 'none', actKey: 'none', title: `Couldn't find a surprise near ${loc.city}`, duration: surpriseConfig.duration, location: loc.city, desc: 'The places search is unreachable right now. Check your connection and roll again.', transport: '', cost: '', link: '' });
      }
    } finally {
      setSurpriseLoading(false);
    }
  };

  const shuffleAdventure = async () => {
    // Adventurous within what you've picked: the chosen category and filters (e.g. an adventurous restaurant).
    if (selectedIdeaCategory && selectedIdeaCategory !== 'Trips') {
      setAdventureBusy(true);
      let got = [];
      try { got = await osmIdeas({ cat: selectedIdeaCategory, loc, seen: new Set(adventureSeen.map(x => String(x).toLowerCase())), n: 3, filters: activeFilterDefs, adventurous: true }); } catch (e) { got = []; }
      if (activeFilterDefs.length) got = got.filter(a => ideaMatchesFilters(a, activeFilterDefs));
      if (got.length) {
        const picks = got.map((x, i) => ({ ...x, id: `adv_${Date.now()}_${i}`, userRating: null, adventurePick: true }));
        setAdventurePicks(picks); setAdventureSeen(prev => [...prev, ...picks.map(x => x.title)]); setAdventureBusy(false);
        return;
      }
      setAdventureBusy(false);
      if (activeFilterDefs.length) { setAdventurePicks([]); return; }
    }
    if (!loc.isHome) {
      // Not in Manchester: the built-in list is Manchester-only, so suggest real places near the profile location instead.
      setAdventureBusy(true);
      const picks = [];
      const seenL = new Set(adventureSeen.map(x => String(x).toLowerCase()));
      for (const cat of ['Sports', 'Indoor', 'Outdoor'].sort(() => Math.random() - 0.5)) {
        let got = [];
        try { got = await osmIdeas({ cat, loc, seen: new Set([...seenL, ...picks.map(x => String(x.title).toLowerCase())]), n: 1 }); } catch (e) { got = []; }
        if (got.length) picks.push({ ...got[0], id: `adv_${Date.now()}_${picks.length}`, category: 'Adventure', userRating: null });
      }
      setAdventurePicks(picks);
      setAdventureSeen(prev => [...prev, ...picks.map(x => x.title)]);
      setAdventureBusy(false);
      return;
    }
    const history = [
      ...tasks.map(t => t.title),
      ...weeklyTargets.map(t => t.title),
      ...ideasFeed.filter(i => i.userRating >= 4).map(i => `${i.title} ${i.sub1}`)
    ].join(' ');
    const picks = pickAdventureIdeas(history, adventureSeen, 3);
    setAdventurePicks(picks);
    setAdventureSeen(prev => [...prev, ...picks.map(p => p.title)]);
  };

  const widgetOrder = (id) => Math.max(0, homeLayout.order.indexOf(id));
  const homeStyle = homeStyleOf(userProfile);
  const widgetHidden = (id) => (homeStyle !== 'classic' && LOG_HIDES.includes(id)) || homeLayout.hidden.includes(id);
  // Non-classic Home shows compact tiles; the full widget opens inside its tile's slot (classic keeps them inline).
  const renderDetail = (id, node) => (homeStyle === 'classic' ? node : (openTile === id && slotEls[id] ? createPortal(node, slotEls[id]) : null));
  const [healthAsk, setHealthAsk] = useState(null);
  const flipWidget = (id) => setHomeLayout(p => ({ ...p, hidden: p.hidden.includes(id) ? p.hidden.filter(x => x !== id) : [...p.hidden, id] }));
  const toggleWidget = (id) => { if (HEALTH_IDS.includes(id) && homeLayout.hidden.includes(id) && !userProfile.healthConsent) { setHealthAsk(id); return; } flipWidget(id); };
  const moveWidget = (id, dir) => setHomeLayout(p => {
    const o = [...p.order];
    const i = o.indexOf(id);
    let j = i + dir;
    while (j >= 0 && j < o.length && p.hidden.includes(o[j])) j += dir;
    if (j < 0 || j >= o.length) return p;
    [o[i], o[j]] = [o[j], o[i]];
    return { ...p, order: o };
  });

  // --- REMINDERS: every planned activity, medicine and due admin item nudges you ---
  const reminderCfg = getReminderCfg(userProfile);
  const latestRef = useRef(null);
  latestRef.current = { profile: userProfile, tasks, medications, lifeCadenceItems, reminderCfg, authUser, hydrated, dailyMeals, water, reading, moodLogs, todayMood, setupOpen: setupOpen || userProfile.onboarded === false };
  const sendReminder = (title, body, date) => {
    pushToast(`${title}: ${body}`, 'reminder', date ? { label: 'View', date } : null);
    setNotifs(prev => [{ id: Date.now() + Math.random(), text: `${title}: ${body}`, kind: 'reminder', at: Date.now(), read: false }, ...prev].slice(0, 50));
    try {
      if (latestRef.current.reminderCfg.browser && typeof Notification !== 'undefined' && Notification.permission === 'granted' && document.visibilityState === 'hidden') {
        const o = { body, icon: '/icons/icon-192.png', tag: 'rem-' + title };
        if (navigator.serviceWorker && navigator.serviceWorker.ready) navigator.serviceWorker.ready.then(reg => reg.showNotification('Pact: ' + title, o)).catch(() => { try { new Notification('Pact: ' + title, o); } catch (e) { /* ignore */ } });
        else new Notification('Pact: ' + title, o);
      }
    } catch (e) { /* ignore */ }
  };
  const runReminders = () => {
    const L = latestRef.current;
    if (!L || !L.authUser || !L.hydrated || !L.reminderCfg.enabled || L.setupOpen) return;
    const now = new Date();
    const todayS = todayDateStr();
    const nowM = now.getHours() * 60 + now.getMinutes();
    const lead = Number(L.reminderCfg.leadMins) || 15;
    const fkey = 'roam:fired:' + (L.authUser.email || 'guest');
    let fired = { date: todayS, keys: [] };
    try { const f = JSON.parse(store.get(fkey) || 'null'); if (f && f.date === todayS) fired = f; } catch (e) { /* ignore */ }
    const out = [];
    const due = (key, title, body, date) => { if (!fired.keys.includes(key)) { fired.keys.push(key); out.push({ title, body, date }); } };
    const C = L.reminderCfg;
    if (C.quiet) {
      const f = toMins(C.quietFrom), t2 = toMins(C.quietTo);
      const inQuiet = f > t2 ? (nowM >= f || nowM < t2) : (nowM >= f && nowM < t2);
      if (inQuiet) return;
    }
    if (C.plans) L.tasks.filter(t => t.date === todayS && t.status !== 'done' && t.startTime).forEach(t => {
      const st = toMins(t.startTime);
      // The reminder lead time counts back from when you need to START GETTING READY, not from the start of the plan.
      const readyAt = readyStartFor(t, st, L.profile);
      const remindAt = readyAt - lead;
      if (nowM >= remindAt && nowM < readyAt) due(`t:${t.id}:pre`, t.title, `starts at ${t.startTime}${t.location ? ' at ' + t.location : ''}. Start getting ready at ${fromMins(readyAt)} (in ${readyAt - nowM} min).`, todayS);
      else if (nowM >= st && nowM < st + 5) due(`t:${t.id}:now`, t.title, `starting now (${t.startTime}).`, todayS);
    });
    if (C.medicine) L.medications.filter(m => !m.taken && m.time).forEach(m => {
      const mt = toMins(m.time);
      if (nowM >= mt && nowM < mt + 60) due(`m:${m.id}`, m.name, `time to take it (scheduled ${m.time}).`, null);
    });
    if (C.meals) (L.dailyMeals || []).filter(m => !m.eaten && m.time).forEach(m => {
      const mt = toMins(m.time) - (Number(C.mealLead) || 0);
      if (nowM >= mt && nowM < mt + 45) due(`meal:${m.id}`, m.label, `meal time (${m.time})${m.detail ? ': ' + m.detail : ''}.`, null);
    });
    if (C.admin && nowM >= 9 * 60) L.lifeCadenceItems.filter(c => c.dueDate && daysBetween(todayS, c.dueDate) <= (Number(C.adminDays) || 3)).forEach(c => {
      const n = daysBetween(todayS, c.dueDate);
      due(`c:${c.id}:${todayS}`, c.title, n < 0 ? `overdue by ${-n} day${n === -1 ? '' : 's'}.` : n === 0 ? 'due today.' : `due in ${n} day${n === 1 ? '' : 's'}.`, null);
    });
    if (C.water && nowM >= 9 * 60 && nowM < 21 * 60) {
      const have = L.water && L.water.date === todayS ? L.water.count : 0;
      const every = Math.max(30, Number(C.waterEvery) || 120);
      if (have < WATER_GOAL) due(`w:${todayS}:${Math.floor(nowM / every)}`, 'Water', `${have} of ${WATER_GOAL} glasses so far. Time for a drink.`, null);
    }
    if (C.reading && L.reading && L.reading.title) {
      const rt = toMins(C.readingTime);
      const lg = (L.reading.log || {})[todayS];
      const did = typeof lg === 'number' ? lg : (lg && Number(lg.pages)) || 0;
      if (nowM >= rt && nowM < rt + 60 && did < (Number(L.reading.dailyGoal) || 1)) due(`r:${todayS}`, 'Reading', `time for a few pages of ${L.reading.title}.`, null);
    }
    if (C.mood) {
      const mt = toMins(C.moodTime);
      const logged = (L.moodLogs || []).some(x => x.date === todayS);
      if (nowM >= mt && nowM < mt + 90 && !logged) due(`mood:${todayS}`, 'Mood check-in', 'how was today? Log your mood on Home.', null);
    }
    if (out.length) {
      store.set(fkey, JSON.stringify(fired));
      out.forEach(o => sendReminder(o.title, o.body, o.date));
    }
  };
  useEffect(() => {
    runReminders();
    const timer = setInterval(runReminders, 20000);
    return () => clearInterval(timer);
  }, [tasks, medications, lifeCadenceItems, dailyMeals, water, reading, moodLogs, userProfile.reminders, hydrated, setupOpen, authUser && authUser.email]);
  const setReminderCfg = (patch) => setUserProfile(prev => ({ ...prev, reminders: { ...getReminderCfg(prev), ...patch } }));
  const enableDeviceNotifications = async () => {
    try {
      if (typeof Notification === 'undefined') { pushToast("This browser can't show device notifications, so Pact will remind you inside the app.", 'info'); return; }
      const perm = await Notification.requestPermission();
      setReminderCfg({ browser: perm === 'granted' });
      if (perm !== 'granted') { pushToast('Notifications are blocked. Allow them in your browser or phone settings.', 'info'); return; }
      const r = await subscribePush();
      if (r === 'ok') { try { store.set('pact:push', '1'); } catch (e) { /* ignore */ } syncFutureReminders(); pushToast('Phone notifications are on.', 'info'); }
      else if (r === 'no-key') pushToast('Alerts will show while Pact is open. Closed-app alerts need the one-time push setup (see README).', 'info');
      else pushToast('Alerts are on while Pact is open. Closed-app alerts could not be set up on this device.', 'info');
    } catch (e) { pushToast('Could not turn on device notifications.', 'info'); }
  };
  // Subscribe this device to Web Push and tell the database where to send alerts. -> 'ok' | 'no-key' | 'unsupported' | 'error'
  const subscribePush = async () => {
    try {
      const key = typeof window !== 'undefined' && window.PACT_CONFIG && window.PACT_CONFIG.vapidPublicKey;
      if (!key) return 'no-key';
      if (!cloud.enabled || !('serviceWorker' in navigator) || !('PushManager' in window)) return 'unsupported';
      const reg = await navigator.serviceWorker.ready;
      let sub = await reg.pushManager.getSubscription();
      if (!sub) {
        const raw = atob(key.replace(/-/g, '+').replace(/_/g, '/').padEnd(Math.ceil(key.length / 4) * 4, '='));
        const bytes = new Uint8Array(raw.length); for (let i = 0; i < raw.length; i++) bytes[i] = raw.charCodeAt(i);
        sub = await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: bytes });
      }
      const res = await cloud.savePushSub(sub);
      return res === 'ok' ? 'ok' : 'error';
    } catch (e) { return 'error'; }
  };
  // Upload the next few days of reminders so the server can send them when Pact is closed.
  const buildFutureReminders = () => {
    const L = latestRef.current; if (!L || !L.hydrated || !L.reminderCfg.enabled) return [];
    const C = L.reminderCfg, lead = Number(C.leadMins) || 15, out = [];
    const base = new Date(); base.setHours(0, 0, 0, 0);
    const iso = (dateStr, mins) => { const [y, m, d] = dateStr.split('-').map(Number); return new Date(y, m - 1, d, 0, mins, 0, 0); };
    const inQuiet = (mins) => { if (!C.quiet) return false; const f = toMins(C.quietFrom), t2 = toMins(C.quietTo); return f > t2 ? (mins >= f || mins < t2) : (mins >= f && mins < t2); };
    const push = (key, at, title, body, url) => { if (at.getTime() > Date.now() + 30000 && at.getTime() < Date.now() + 8 * 864e5) out.push({ key, at: at.toISOString(), title, body, url }); };
    if (C.plans) L.tasks.filter(t => t.date && t.status !== 'done' && t.startTime).forEach(t => {
      const st = toMins(t.startTime), readyAt = readyStartFor(t, st, L.profile), remindAt = readyAt - lead;
      if (!inQuiet(remindAt)) push(`t:${t.id}:pre`, iso(t.date, remindAt), t.title, `starts at ${t.startTime}${t.location ? ' at ' + t.location : ''}. Start getting ready at ${fromMins(readyAt)}.`, '/?tab=schedule');
      if (!inQuiet(st)) push(`t:${t.id}:now`, iso(t.date, st), t.title, `starting now (${t.startTime}).`, '/?tab=schedule');
    });
    if (C.medicine) L.medications.filter(m => m.time).forEach(m => {
      const mt = toMins(m.time);
      for (let i = 0; i < 3; i++) { const d = new Date(base); d.setDate(d.getDate() + i); const ds = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); if (!(i === 0 && m.taken) && !inQuiet(mt)) push(`m:${m.id}:${ds}`, iso(ds, mt), m.name, `time to take it (scheduled ${m.time}).`, '/'); }
    });
    return out;
  };
  const syncTimer = useRef(null);
  const syncFutureReminders = () => {
    if (syncTimer.current) clearTimeout(syncTimer.current);
    syncTimer.current = setTimeout(() => {
      try { if (store.get('pact:push') !== '1' || !cloud.enabled) return; cloud.syncReminders(buildFutureReminders()).catch(() => {}); } catch (e) { /* ignore */ }
    }, 4000);
  };
  useEffect(() => { syncFutureReminders(); }, [tasks, medications, userProfile.reminders, hydrated, authUser && authUser.email]);
  // Keep this device's push address fresh each time the app opens.
  useEffect(() => {
    if (!authUser || !hydrated || typeof Notification === 'undefined' || Notification.permission !== 'granted') return;
    subscribePush().then(r => { if (r === 'ok') { try { store.set('pact:push', '1'); } catch (e) { /* ignore */ } } });
  }, [authUser && authUser.email, hydrated]);


  useEffect(() => {
    if (startedParams.current || !hydrated || !authUser || setupOpen) return;
    startedParams.current = true;
    try {
      const q = new URLSearchParams(window.location.search);
      if (q.get('tab') && ['home', 'schedule', 'ideas', 'skills', 'social', 'profile'].includes(q.get('tab'))) setActiveTab(q.get('tab'));
      if (q.get('voice')) { setTimeout(() => startVoice(), 400); }
      if (q.get('add')) { const said = String(q.get('add')).slice(0, 200); setTimeout(() => { setRoamieOpen(true); submitRoamie(said); }, 700); }
      if (q.get('voice') || q.get('tab') || q.get('add')) window.history.replaceState(null, '', window.location.pathname);
    } catch (e) { /* ignore */ }
  }, [hydrated, authUser, setupOpen]);
  useEffect(() => { authUserRef.current = authUser; seenRef.current = null; try { setNotifs(JSON.parse(localStorage.getItem('roam:notifs:' + ((authUser && authUser.email) || '')) || '[]')); } catch (e) { setNotifs([]); } }, [authUser && authUser.email]);
  useEffect(() => { try { if (authUser && authUser.email) localStorage.setItem('roam:notifs:' + authUser.email, JSON.stringify(notifs.slice(0, 50))); } catch (e) { /* ignore */ } }, [notifs]);

  const statusSentRef = useRef('');
  useEffect(() => {
    if (!hydrated || !authUser || !authUser.cloud || !cloud.enabled) return;
    const sh = shareCfg; const today = todayDateStr();
    const mood = sh.mood ? ((moodLogs.find(m => m.date === today) || {}).mood || '') : '';
    let list = [];
    if (sh.acts === 'busy' || sh.acts === 'titles') {
      const f = sh.from ? toMins(sh.from) : 0, tt = sh.to ? toMins(sh.to) : 1440;
      list = tasks.filter(t => t.date === today && t.startTime && !t.hideFromFriends && toMins(t.endTime || t.startTime) > f && toMins(t.startTime) < tt)
        .sort((a, b) => toMins(a.startTime) - toMins(b.startTime)).slice(0, 20)
        .map(t => ({ s: t.startTime, e: t.endTime || t.startTime, t: sh.acts === 'titles' ? String(t.title || '').slice(0, 60) : 'Busy' }));
    }
    const payload = JSON.stringify([mood, today, list]);
    if (payload === statusSentRef.current) return;
    const h = setTimeout(async () => { try { await cloud.setMyStatus(mood, today, list); statusSentRef.current = payload; } catch (e) { /* status columns not set up yet */ } }, 2500);
    return () => clearTimeout(h);
  }, [hydrated, tasks, moodLogs, userProfile.share, authUser && authUser.email]);
  // ---- Masthead weather (Open-Meteo, cached 30 min) ----
  const [mastWx, setMastWx] = useState(null);
  useEffect(() => {
    if (!authUser) return;
    let dead = false;
    const l = getLoc(userProfile); const key = 'pact:wx:' + String(l.city).toLowerCase();
    try { const c = JSON.parse(localStorage.getItem(key) || 'null'); if (c && Date.now() - c.at < 30 * 60000) { setMastWx(c); return; } } catch (e) { /* ignore */ }
    (async () => {
      try {
        const { lat, lon } = await resolveCoords(l);
        const j = await fetchJSON(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weather_code&timezone=auto`, {}, 8000);
        const c = j.current || {}; const v = { t: Math.round(c.temperature_2m), w: WMO[c.weather_code] || '', at: Date.now() };
        if (!dead && Number.isFinite(v.t)) { setMastWx(v); try { localStorage.setItem(key, JSON.stringify(v)); } catch (e) { /* ignore */ } }
      } catch (e) { /* offline: the masthead just shows the city */ }
    })();
    return () => { dead = true; };
  }, [authUser && authUser.email, userProfile.location && userProfile.location.city]);
  // --- SIGN-IN GATE ---
  if (!authUser && !authReady) return <div className="w-full max-w-md min-[600px]:max-w-[640px] min-[820px]:max-w-[820px] mx-auto bg-[#F5F3EC]" style={{ height: '100dvh' }} />;
  if (!authUser) {
    return (
      <div className="w-full max-w-md min-[600px]:max-w-[640px] min-[820px]:max-w-[820px] mx-auto h-[100dvh] bg-[#F5F3EC] text-slate-900 flex flex-col relative font-sans overflow-hidden shadow-2xl border-x border-stone-200" style={{ height: '100dvh' }}>
      <LedgerBg tab="home" />
        <style dangerouslySetInnerHTML={{__html: ROAM_CSS}} />
        <style dangerouslySetInnerHTML={{__html: PACT_CSS}} />
        <AuthScreen onAuth={setAuthUser} onGuest={() => setAuthUser({ guest: true, name: 'Alex' })} />
      </div>
    );
  }

  const cf = comfortOf(userProfile); const zoomV = ZOOM[cf.size] || 1; const simpleView = !!cf.simpleNav;
  const moveTaskTomorrow = (id) => setTasks(prev => prev.map(t => t.id === id ? { ...t, date: addDaysStr(t.date, 1) } : t));
  const addPlainTask = (o) => setTasks(prev => [...prev, { id: Date.now() + Math.floor(Math.random() * 1000), duration: 60, status: 'pending', transportMode: '', distance: '', leaveByNote: '', notes: '', rating: null, reviewNote: '', withPerson: null, meetingType: 'Friendly', ...o }]);
  return (
    <div className={`w-full max-w-md min-[600px]:max-w-[640px] min-[820px]:max-w-[820px] mx-auto bg-[#F5F3EC] text-slate-900 flex flex-col relative font-sans overflow-hidden shadow-2xl border-x border-stone-200${cf.contrast ? ' pact-hc' : ''}${cf.bigButtons ? ' pact-bigbtn' : ''}${cf.calmMotion ? ' pact-calm' : ''}`} style={{ height: zoomV === 1 ? '100dvh' : `calc(100dvh / ${zoomV})`, ...(zoomV === 1 ? {} : { zoom: zoomV }) }}>
      <LedgerBg tab={activeTab} />
      
      {/* Bundled stylesheet (Tailwind build) so the design looks identical in any previewer */}
      <style dangerouslySetInnerHTML={{__html: ROAM_CSS}} />
      {setupOpen && (() => {
        const D = setupDraft;
        const set = (patch) => setSetupDraft(prev => ({ ...prev, ...patch }));
        const toggle = (key, v) => set({ [key]: D[key].includes(v) ? D[key].filter(x => x !== v) : [...D[key], v] });
        const LAST = 6;
        const INK = '#1B2A22', MUT = '#5A675F', CLAY = '#C8643C', FOR = '#1F3A2E';
        const optBtn = (on) => ({ borderRadius: 0, border: on ? `1.5px solid ${INK}` : `1px solid ${INK}`, background: on ? INK : 'transparent', color: on ? '#F4EFE4' : INK });
        const chip = (on) => `px-3 h-[34px] text-[11.5px] font-semibold ${on ? '' : ''}`;
        const chipSt = (on) => ({ borderRadius: 0, background: on ? FOR : 'transparent', color: on ? '#F4EFE4' : INK, border: `1px solid ${on ? FOR : INK}` });
        const lab = (t) => <div className="text-[10px] uppercase tracking-[0.14em]" style={{ color: MUT }}>{t}</div>;
        const h2 = (t, sub) => (<div><h2 className="font-fr" style={{ fontSize: 32, lineHeight: 1, letterSpacing: '-0.025em', fontWeight: 600 }}>{t}</h2>{sub && <div className="font-fr" style={{ fontStyle: 'italic', fontSize: 15, color: MUT, marginTop: 7, lineHeight: 1.3 }}>{sub}</div>}</div>);
        const GOALS = [
          { id: 'out', t: 'Get out more', s: 'Plans, events and a reason to leave the house' },
          { id: 'people', t: 'Meet new people', s: 'Find things nearby that are actually worth going to' },
          { id: 'learn', t: 'Learn something', s: 'Skills with milestones you can see' },
          { id: 'touch', t: 'Keep in touch', s: 'Never let a good friendship drift' },
          { id: 'week', t: 'Run my week', s: 'Schedule, reminders and a calm head' }
        ];
        const TRAVEL = ['Walk', 'Bus / tram', 'Cycle', 'Drive', 'Train'];
        const PREP = [15, 30, 45, 60];
        const PROMISES = ['I’ll say yes more often.', 'I’ll show up for the people I love.', 'I’ll learn something new every month.'];
        const addSetupPerson = () => {
          const nm = setupPName.trim(); if (!nm) return;
          const td = todayDateStr();
          setPeople(prev => [...prev, { id: 'p_' + Date.now(), name: nm, kind: 'personal', relation: '', remindEvery: Number(setupPFreq) || 0, lastContact: td, createdAt: td, blocked: false, notes: '', linkedUserId: '', phone: '', whatsapp: '', email: '' }]);
          setSetupAdded(prev => [...prev, nm]); setSetupPName('');
        };
        const findSetupUser = async () => {
          const q = setupUserQ.trim(); if (!q) return;
          if (!authUser || !authUser.cloud) { setSetupUserRes('offline'); return; }
          try { const r = await cloud.findUser(q); setSetupUserRes(r || 'none'); } catch (e) { setSetupUserRes('error'); }
        };
        const addSetupUser = (u) => {
          const nm = (u.display_name || u.username || '').trim(); const td = todayDateStr();
          if (u.relation === 'none') sendFriendReq(u.id);
          setPeople(prev => prev.some(x => x.username === u.username) ? prev : [...prev, { id: 'p_' + Date.now(), name: nm, kind: 'personal', relation: '', remindEvery: 30, lastContact: td, createdAt: td, blocked: false, notes: '', linkedUserId: u.relation === 'friends' ? u.id : '', username: u.username, avatar: u.avatar || '', bio: u.bio || '', phone: '', whatsapp: '', email: '' }]);
          setSetupAdded(prev => [...prev, nm]); setSetupUserRes(null); setSetupUserQ('');
        };
        const rowNum = (n, t, sub, onClick, on) => (
          <button type="button" onClick={onClick} className="w-full text-left grid items-center" style={{ gridTemplateColumns: '28px 1fr 14px', gap: 8, padding: '11px 0', borderBottom: '1px solid #CFC7B4', borderRadius: 0 }}>
            <span className="font-fr" style={{ fontSize: 18, fontWeight: 600, color: CLAY }}>{n}</span>
            <span><span className="block text-[14px] font-semibold">{t}</span><span className="block text-[11px]" style={{ color: MUT }}>{sub}</span></span>
            <span style={{ color: '#7C857F' }}>{on ? '✓' : '›'}</span>
          </button>
        );
        return (
          <div data-setup className="absolute inset-0 overflow-y-auto" style={{ zIndex: 45, background: '#F4EFE4', color: INK }} role="dialog" aria-label="Set up The Pact">
            <div className="min-h-full flex flex-col px-7 pt-5 pb-7">
              <div>
                <div className="flex items-baseline justify-between text-[10px] uppercase tracking-[0.16em]" style={{ color: MUT }}>
                  {setupStep > 0 ? <button data-setup-back onClick={() => setSetupStep(setupStep - 1)} style={{ borderRadius: 0, textTransform: 'uppercase', letterSpacing: '0.16em' }}>&larr; Back</button> : <span />}
                  <span>Step {setupStep + 1} of {LAST + 1}</span>
                  <button data-setup-skip onClick={() => closeSetup(false)} style={{ borderRadius: 0, textTransform: 'uppercase', letterSpacing: '0.16em' }}>Skip</button>
                </div>
                <div className="flex gap-1 mt-2.5" aria-label={`Step ${setupStep + 1} of ${LAST + 1}`}>
                  {[0, 1, 2, 3, 4, 5, 6].map(i => <span key={i} style={{ flex: 1, height: 4, background: i <= setupStep ? CLAY : '#CFC7B4' }} />)}
                </div>
              </div>

              <div className="flex-1 pt-5 space-y-4">
                {setupStep === 0 && (
                  <div className="space-y-2">
                    {h2('What\u2019s life like right now?', 'Tick everything that fits. The Pact blends them, and you can change it any time.')}
                    <div className="space-y-1.5 pt-1">
                      {SITUATIONS.map(g => (
                        <button key={g.id} data-setup-sit={g.id} aria-pressed={(D.situations || []).includes(g.id)} onClick={() => toggle('situations', g.id)} className="w-full flex items-center justify-between text-left px-3.5 py-2" style={optBtn((D.situations || []).includes(g.id))}>
                          <span><span className="block font-fr" style={{ fontSize: 15.5, fontWeight: 600, lineHeight: 1.1 }}>{g.t}</span><span className="block text-[11px] mt-0.5" style={{ color: (D.situations || []).includes(g.id) ? '#B9C6BE' : MUT }}>{g.s}</span></span>
                          {(D.situations || []).includes(g.id) && <span style={{ color: CLAY }}>&#10003;</span>}
                        </button>
                      ))}
                    </div>
                    {(D.situations || []).length > 0 && <div data-setup-sit-note className="mt-2 px-3 py-2 text-[11.5px] leading-snug" style={{ border: '1.5px dashed #7C857F', color: MUT }}><b style={{ color: INK }}>You ticked {(D.situations || []).length}.</b> Expect {(D.situations || []).map(x => SIT_HINTS[x]).filter(Boolean).join(', ')}.</div>}
                  </div>
                )}

                {setupStep === 1 && (
                  <div className="space-y-2">
                    {h2('What do you want back?', 'Pick as many as you like. The Pact shapes itself around them.')}
                    {!accountInfo.name && !D.name && <input data-setup-name type="text" value={D.name} onChange={e => set({ name: e.target.value })} aria-label="Your name" placeholder="What should we call you?" className="w-full bg-transparent py-2 text-[15px] outline-none" style={{ borderBottom: `1.5px solid ${INK}` }} />}
                    <div className="space-y-2 pt-2">
                      {GOALS.map(g => (
                        <button key={g.id} data-setup-goal={g.id} aria-pressed={D.goals.includes(g.id)} onClick={() => toggle('goals', g.id)} className="w-full flex items-center justify-between text-left px-3.5 py-2.5" style={optBtn(D.goals.includes(g.id))}>
                          <span><span className="block font-fr" style={{ fontSize: 16, fontWeight: 600, lineHeight: 1.1 }}>{g.t}</span><span className="block text-[11px] mt-0.5" style={{ color: D.goals.includes(g.id) ? '#B9C6BE' : MUT }}>{g.s}</span></span>
                          {D.goals.includes(g.id) && <span>&#10003;</span>}
                        </button>
                      ))}
                    </div>
                    <div className="pt-3 space-y-2">{lab('And what are you into?')}
                      <div className="flex flex-wrap gap-1.5">{IDEA_CATEGORIES_BASE.map(c => <button key={c} data-setup-interest={c} aria-pressed={D.interests.includes(c)} onClick={() => toggle('interests', c)} className={chip(D.interests.includes(c))} style={chipSt(D.interests.includes(c))}>{c}</button>)}</div>
                    </div>
                  </div>
                )}

                {setupStep === 2 && (
                  <div className="space-y-4">
                    {h2('Where are you based?', 'So events, travel times and weather are right.')}
                    <LocationPicker value={D.location} onChange={l => set({ location: l })} />
                    <div className="space-y-2">{lab('How do you usually get about?')}
                      <div className="flex flex-wrap gap-2">{TRAVEL.map(t => <button key={t} data-setup-travel={t} aria-pressed={D.travel.includes(t)} onClick={() => toggle('travel', t)} className={chip(D.travel.includes(t))} style={chipSt(D.travel.includes(t))}>{t}</button>)}</div>
                    </div>
                    <div className="text-[12px] leading-relaxed p-3" style={{ border: '1.5px dashed #7C857F', color: MUT }}>Your location stays on your device unless you share it. Friends only ever see what you choose.</div>
                  </div>
                )}

                {setupStep === 3 && (
                  <div className="space-y-4">
                    {h2('What does a normal day look like?', 'Rough is fine. You can tune it later.')}
                    <div className="space-y-2">{lab('Which describes you best?')}
                      <select value={D.status} onChange={e => set({ status: e.target.value })} aria-label="Your situation" className="w-full bg-transparent px-2 py-2.5 text-sm" style={{ border: `1px solid ${INK}`, borderRadius: 0 }}>
                        {SETUP_STATUSES.map(st => <option key={st} value={st}>{st}</option>)}
                      </select>
                    </div>
                    <div className="space-y-2">{lab('Busy days')}
                      <div className="grid grid-cols-7 gap-1">{SETUP_DAYS.map(d => <button key={d} data-setup-day={d} aria-pressed={D.days.includes(d)} onClick={() => toggle('days', d)} className="h-[38px] text-[11px] font-semibold" style={chipSt(D.days.includes(d))}>{d.slice(0, 1)}</button>)}</div>
                    </div>
                    <div className="grid grid-cols-2 gap-2.5">
                      <label className="block space-y-1">{lab('Work / study from')}<input type="time" value={D.start} aria-label="Day starts" onChange={e => set({ start: e.target.value || '09:00' })} className="w-full bg-transparent px-2 text-center font-fr" style={{ border: `1px solid ${INK}`, borderRadius: 0, height: 42, fontSize: 20, fontWeight: 600 }} /></label>
                      <label className="block space-y-1">{lab('Until')}<input type="time" value={D.end} aria-label="Day ends" onChange={e => set({ end: e.target.value || '17:00' })} className="w-full bg-transparent px-2 text-center font-fr" style={{ border: `1px solid ${INK}`, borderRadius: 0, height: 42, fontSize: 20, fontWeight: 600 }} /></label>
                    </div>
                    <div className="space-y-2">{lab('Getting ready takes')}
                      <div className="flex gap-2">{PREP.map(m => <button key={m} data-setup-prep={m} aria-pressed={D.prep === m} onClick={() => set({ prep: m })} className={chip(D.prep === m)} style={chipSt(D.prep === m)}>{m === 60 ? '1 hr' : m + ' min'}</button>)}</div>
                      <div className="text-[11px] leading-snug" style={{ color: MUT }}>The Pact adds travel and getting-ready time around every plan automatically.</div>
                    </div>
                    <div className="space-y-2">{lab('How full should your days be?')}
                      <div className="grid grid-cols-3 gap-1.5">
                        {[['light', 'Light', 'up to 3 a day'], ['balanced', 'Balanced', 'up to 4'], ['full', 'Full', 'up to 6']].map(([id, l, h]) => (
                          <button key={id} data-setup-load={id} onClick={() => set({ load: id })} className="text-left px-3 py-2" style={optBtn(D.load === id)}><div className="text-xs font-semibold">{l}</div><div className="text-[10px]" style={{ color: D.load === id ? '#B9C6BE' : MUT }}>{h}</div></button>
                        ))}
                      </div>
                    </div>
                    <div className="p-3 space-y-2" data-setup-cal style={{ border: '1px solid #CFC7B4' }}>
                      <div className="flex items-center justify-between gap-2">
                        <div><div className="text-xs font-semibold">Sync your calendar</div><div className="text-[10px]" style={{ color: MUT }}>Google, iPhone or Outlook events become busy time, so nothing gets planned over them.</div></div>
                        <button data-setup-cal-toggle onClick={() => setSetupCalOpen(!setupCalOpen)} className="px-2.5 py-1 text-[10px] uppercase tracking-wider font-semibold shrink-0" style={{ border: `1px solid ${INK}`, borderRadius: 0 }}>{calendarSources.length ? `${calendarSources.length} synced ✓` : setupCalOpen ? 'Hide' : 'Add'}</button>
                      </div>
                      {setupCalOpen && calConnectBlock}
                    </div>
                  </div>
                )}

                {setupStep === 4 && (
                  <div className="space-y-3">
                    {h2('Who matters to you?', 'Add a few now, or skip. It never messages anyone for you.')}
                    <div>
                      {rowNum('1', 'Find friends on Pact', 'Search by @username', () => set({ peopleOpen: D.peopleOpen === 'find' ? '' : 'find' }), D.peopleOpen === 'find')}
                      {D.peopleOpen === 'find' && (
                        <div className="py-2 space-y-2">
                          <div className="flex gap-1.5">
                            <input data-setup-username type="text" aria-label="Pact username" placeholder="@username" value={setupUserQ} onChange={e => { setSetupUserQ(e.target.value); setSetupUserRes(null); }} onKeyDown={e => { if (e.key === 'Enter') findSetupUser(); }} className="flex-1 min-w-0 bg-transparent px-2 py-2 text-sm" style={{ border: `1px solid ${INK}`, borderRadius: 0 }} />
                            <button data-setup-username-find onClick={findSetupUser} disabled={!setupUserQ.trim()} className="px-3 text-[11px] font-semibold text-white disabled:opacity-50" style={{ background: FOR, borderRadius: 0 }}>Find</button>
                          </div>
                          {setupUserRes === 'none' && <p className="text-[11px]" style={{ color: MUT }}>No one found with that username.</p>}
                          {setupUserRes === 'offline' && <p className="text-[11px]" style={{ color: MUT }}>Sign in with an account to look people up.</p>}
                          {setupUserRes === 'error' && <p className="text-[11px]" style={{ color: MUT }}>Couldn't search just now. Try again.</p>}
                          {setupUserRes && typeof setupUserRes === 'object' && (
                            <div className="flex items-center justify-between gap-2 p-2.5" style={{ border: '1px solid #CFC7B4' }}>
                              <div className="flex items-center gap-2 min-w-0"><Avatar src={setupUserRes.avatar} name={setupUserRes.display_name || setupUserRes.username} size={32} /><div className="min-w-0"><div className="text-xs font-semibold truncate">{setupUserRes.display_name || setupUserRes.username}</div><div className="text-[10px]" style={{ color: MUT }}>@{setupUserRes.username}</div></div></div>
                              <button data-setup-username-add onClick={() => addSetupUser(setupUserRes)} className="px-2.5 py-1.5 text-[10px] uppercase tracking-wider font-semibold text-white shrink-0" style={{ background: FOR, borderRadius: 0 }}>{setupUserRes.relation === 'none' ? 'Add + request' : 'Add'}</button>
                            </div>
                          )}
                        </div>
                      )}
                      {rowNum('2', 'Import contacts', 'Phone export (vCard / CSV) or paste a list. Opens after setup.', () => set({ importAfter: !D.importAfter }), D.importAfter)}
                      {rowNum('3', 'Type a name', 'Add someone and how often you’d like to see them', () => set({ peopleOpen: D.peopleOpen === 'type' ? '' : 'type' }), D.peopleOpen === 'type')}
                      {D.peopleOpen === 'type' && (
                        <div className="py-2 flex gap-1.5">
                          <input data-setup-person-name type="text" aria-label="Name" placeholder="Name" value={setupPName} onChange={e => setSetupPName(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') addSetupPerson(); }} className="flex-1 min-w-0 bg-transparent px-2 py-2 text-sm" style={{ border: `1px solid ${INK}`, borderRadius: 0 }} />
                          <select aria-label="How often" value={setupPFreq} onChange={e => setSetupPFreq(Number(e.target.value))} className="bg-transparent px-1.5 text-xs" style={{ border: `1px solid ${INK}`, borderRadius: 0, maxWidth: 110 }}>{REMIND_OPTIONS.map(o => <option key={o.v} value={o.v}>{o.l}</option>)}</select>
                          <button data-setup-person-add onClick={addSetupPerson} disabled={!setupPName.trim()} className="px-3 text-[11px] font-semibold text-white disabled:opacity-50" style={{ background: FOR, borderRadius: 0 }}>Add</button>
                        </div>
                      )}
                    </div>
                    {setupAdded.length > 0 && <div data-setup-added className="space-y-1.5">{lab(`Added so far · ${setupAdded.length}`)}<div className="flex flex-wrap gap-1.5">{setupAdded.map((n, i) => <span key={i} className="inline-flex items-center h-[30px] px-2.5 text-xs font-semibold" style={{ border: `1px solid ${INK}` }}>{n}</span>)}</div></div>}
                    <div className="text-[11px]" style={{ color: MUT }}>Friends only appear once they accept.</div>
                  </div>
                )}

                {setupStep === 5 && (
                  <div className="space-y-3">
                    {h2('Nudges that reach your phone.', 'Reminders arrive even when the app is closed.')}
                    <div className="p-3.5" style={{ border: `3px double ${INK}` }}>
                      <div className="text-[9px] uppercase tracking-[0.2em] font-bold" style={{ color: CLAY }}>Preview</div>
                      <div className="flex items-center gap-2.5 mt-2"><PactSeal size={38} /><div><div className="text-xs font-bold">The Pact &middot; now</div><div className="text-xs" style={{ color: MUT }}>Leave in 10 min for coffee at Pollen.</div></div></div>
                    </div>
                    <div>{lab('Look after')}
                      {SETUP_CARE.map(c => (
                        <button key={c.id} data-setup-care={c.id} aria-pressed={D.care.includes(c.id)} onClick={() => toggle('care', c.id)} className="w-full flex items-center justify-between text-left" style={{ minHeight: 44, borderBottom: '1px solid #CFC7B4', borderRadius: 0 }}>
                          <span><span className="block text-[14px]">{c.label}</span><span className="block text-[10px]" style={{ color: MUT }}>{c.desc}</span></span>
                          <span style={{ width: 40, height: 22, border: `1.5px solid ${INK}`, position: 'relative', background: D.care.includes(c.id) ? FOR : 'transparent', flex: 'none' }}><span style={{ position: 'absolute', top: 2, [D.care.includes(c.id) ? 'right' : 'left']: 2, width: 15, height: 15, background: D.care.includes(c.id) ? '#F4EFE4' : INK }} /></span>
                        </button>
                      ))}
                      {D.care.some(x => HEALTH_IDS.includes(x)) && (
                        <button data-setup-health-consent aria-pressed={!!D.healthOk} onClick={() => set({ healthOk: !D.healthOk })} className="w-full text-left flex gap-3 items-start p-3 mt-3" style={{ border: `1.5px solid ${INK}`, background: D.healthOk ? '#E6EDE8' : 'transparent' }}>
                          <span style={{ width: 20, height: 20, border: `1.5px solid ${INK}`, flex: 'none', marginTop: 1, background: D.healthOk ? FOR : 'transparent', color: '#fff', fontSize: 13, lineHeight: '17px', textAlign: 'center' }}>{D.healthOk ? '\u2713' : ''}</span>
                          <span className="text-[11.5px] leading-relaxed" style={{ color: MUT }}><b style={{ color: INK }}>Medicine and mood are health information.</b> Tick to let The Pact store them. Only you can see them: they are never shared with friends or used for suggestions. You can turn them off and delete them any time. Without a tick, these two are left out.</span>
                        </button>
                      )}
                    </div>
                    <div className="text-[11.5px] leading-relaxed p-3" style={{ border: '1.5px dashed #7C857F', color: MUT }}><b style={{ color: INK }}>On iPhone:</b> tap Share, then Add to Home Screen, then open The Pact from there. Android and laptop work straight away.</div>
                    <button data-setup-notify onClick={enableDeviceNotifications} className="w-full h-11 text-[13px] font-semibold text-white" style={{ background: FOR, borderRadius: 0 }}>Turn on notifications</button>
                    <div className="text-center text-[11px]" style={{ color: MUT }}>Not now &middot; you can do this later in Profile</div>
                  </div>
                )}

                {setupStep === 6 && (
                  <div className="space-y-4">
                    {h2('Sign your pact.', 'One line, in your own words.')}
                    <div className="p-4" style={{ border: `3px double ${INK}` }}>
                      <div className="text-[9px] uppercase tracking-[0.2em] font-bold" style={{ color: CLAY }}>I promise myself</div>
                      <textarea data-setup-promise aria-label="Your promise to yourself" rows={3} value={D.promise} onChange={e => set({ promise: e.target.value })} className="w-full bg-transparent font-fr outline-none resize-none mt-2" style={{ fontStyle: 'italic', fontSize: 21, lineHeight: 1.25 }} />
                      <div className="text-[11px] mt-1" style={{ color: MUT }}>Only you see this.</div>
                    </div>
                    <div className="space-y-2">{lab('Or start from one of these')}
                      <div className="font-fr" style={{ fontStyle: 'italic', fontSize: 14, color: MUT }}>
                        {PROMISES.map(pm => <button key={pm} onClick={() => set({ promise: pm })} className="block w-full text-left py-1.5" style={{ borderBottom: '1px solid #CFC7B4', borderRadius: 0 }}>&ldquo;{pm}&rdquo;</button>)}
                      </div>
                    </div>
                    <div className="flex items-end gap-3 pt-2">
                      <input data-setup-sign type="text" aria-label="Sign with your name" value={D.name} onChange={e => set({ name: e.target.value })} placeholder="Your name" className="flex-1 min-w-0 bg-transparent font-fr outline-none" style={{ fontStyle: 'italic', fontSize: 26, borderBottom: `1.5px solid ${INK}`, paddingBottom: 4 }} />
                      <div className="text-[10px] uppercase tracking-[0.14em] pb-1.5" style={{ color: MUT }}>{prettyDate(todayDateStr())}</div>
                    </div>
                  </div>
                )}
              </div>

              <div className="pt-6">
                <button data-setup-next onClick={() => (setupStep === LAST ? closeSetup(true) : setSetupStep(setupStep + 1))} className="w-full h-12 text-[13px] font-semibold text-white" style={{ background: FOR, borderRadius: 0 }}>{setupStep === LAST ? 'Sign & begin' : 'Continue'}</button>
                <div className="mt-2.5 text-center text-[11px]" style={{ color: MUT }}>{setupStep === 0 ? 'You can change any of this later.' : setupStep === LAST ? 'Your first front page is ready.' : ''}</div>
              </div>
            </div>
          </div>
        );
      })()}

      {incomingInvite && !setupOpen && (
        <div data-incoming-invite className="absolute inset-0 flex items-end sm:items-center justify-center bg-black/40" style={{ zIndex: 46 }} role="dialog" aria-label="You have been invited">
          <div className="w-full max-w-sm bg-[#F5F3EC] border border-stone-300 p-5 m-3 space-y-3">
            <span className="text-[10px] uppercase tracking-widest text-rose-700 font-medium">Invitation</span>
            <h3 className="font-editorial text-xl leading-tight">{incomingInvite.from} invited you to {incomingInvite.t}</h3>
            <div className="text-sm text-stone-700">{prettyDate(incomingInvite.d)} · {incomingInvite.s}{incomingInvite.e && incomingInvite.e !== incomingInvite.s ? '–' + incomingInvite.e : ''}{incomingInvite.l ? ' · ' + incomingInvite.l : ''}</div>
            {!inviteAccepted && inviteClash && <div className="p-2.5 bg-amber-50 border-l-4 border-amber-600 text-[11px] text-slate-800">That overlaps something already in your plan or calendar. You can still add it.</div>}
            {!inviteAccepted ? (
              <div className="flex gap-2">
                <button data-invite-accept onClick={acceptInvite} className="flex-1 py-2.5 bg-purple-900 text-white text-xs uppercase tracking-widest font-medium">{inviteClash ? 'Add anyway' : 'Accept'}</button>
                <button data-invite-decline onClick={() => setIncomingInvite(null)} className="px-4 py-2.5 border border-stone-400 text-xs uppercase tracking-wider font-medium">Decline</button>
              </div>
            ) : (
              <div className="space-y-2">
                <p className="text-xs text-stone-700">Added to your plan. Let {incomingInvite.from} know:</p>
                <div className="flex gap-2 flex-wrap">
                  <button onClick={() => shareText(replyText)} className="px-3 py-2 bg-slate-900 text-white text-[10px] uppercase tracking-wider font-medium">Send reply</button>
                  <button data-invite-close onClick={() => { setIncomingInvite(null); setSelectedDateStr(incomingInvite.d); setActiveTab('schedule'); }} className="px-3 py-2 border border-stone-400 text-[10px] uppercase tracking-wider font-medium">View in my plan</button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {toasts.length > 0 && (
        <div className="absolute top-2 inset-x-3 z-50 space-y-2 pointer-events-none" aria-live="polite">
          {toasts.map(t => (
            <div key={t.id} role="status" className={`pointer-events-auto p-3 flex items-start gap-2.5 text-xs shadow-lg border-l-4 ${t.kind === 'reminder' ? 'bg-slate-900 text-white border-rose-500' : t.kind === 'success' ? 'bg-purple-900 text-white border-emerald-300' : 'bg-white text-slate-900 border-purple-900'}`}>
              <div className="flex-1 min-w-0">
                {t.kind === 'reminder' && <div className="text-[9px] uppercase tracking-widest text-rose-300 mb-0.5">Reminder</div>}
                <div className="leading-snug">{t.text}</div>
                {t.action && (
                  <button onClick={() => { setSelectedDateStr(t.action.date); setActiveTab('schedule'); setToasts(prev => prev.filter(x => x.id !== t.id)); }} className="mt-1.5 underline text-[10px] uppercase tracking-wider">{t.action.label}</button>
                )}
              </div>
              <button aria-label="Dismiss" onClick={() => setToasts(prev => prev.filter(x => x.id !== t.id))} className="shrink-0 opacity-70 hover:opacity-100"><X size={14} /></button>
            </div>
          ))}
        </div>
      )}
      {/* SKINNY, ULTRA-SLEEK MODERN MINIMALIST SANS FONT */}
      <style dangerouslySetInnerHTML={{__html: PACT_CSS}} />
      <style dangerouslySetInnerHTML={{__html: V8_CSS}} />

      {/* =========================================================
          ULTRA-CLEAN SKINNY HEADER (No Logo, "Welcome back, [Name]")
         ========================================================= */}
      <header data-pact-glass className="pt-3 pb-2 sticky top-0 z-20 px-5 backdrop-blur-md" style={{ background: 'rgba(244,239,228,0.84)' }}>
        <div className="relative flex justify-between items-center gap-2">
          <div className="flex items-center gap-1.5 w-[84px]">
            <button
              onClick={() => { setActiveTab('profile'); setProfileScreen(null); }}
              className={`w-9 h-9 border flex items-center justify-center transition-colors ${activeTab === 'profile' ? 'bg-slate-900 text-[#F4EFE4] border-slate-900' : 'bg-transparent border-slate-900 text-slate-900'}`}
              style={{ borderRadius: 0 }}
              title="Profile, Friends & Data"
              aria-label="Profile, friends and data"
            >
              <User size={16} />
            </button>
          </div>
          <h1 data-masthead className="np-title select-none">The Pact</h1>
          <div className="flex items-center gap-1.5 w-[84px] justify-end">
            <button data-bell onClick={() => { setBellOpen(o => !o); setNotifs(prev => prev.map(n => ({ ...n, read: true }))); }} className="relative w-9 h-9 border border-slate-900 text-slate-900 flex items-center justify-center" style={{ borderRadius: 0 }} title="Notifications" aria-label="Notifications">
              <Bell size={16} />
              {notifs.some(n => !n.read) && <span data-bell-dot className="absolute -top-1.5 -right-1.5 min-w-[16px] h-4 px-1 bg-rose-700 text-white text-[9px] flex items-center justify-center">{notifs.filter(n => !n.read).length}</span>}
            </button>
            <button
              onClick={() => { setLinkedTargetId(null); setPlannerResultsStep(false); setScheduleConflictWarning(null); setPlannerOpen(true); }}
              className="w-9 h-9 bg-purple-900 hover:bg-purple-800 text-white flex items-center justify-center transition-all"
              style={{ borderRadius: 0 }}
              title="Plan something"
              aria-label="Plan"
            >
              <Plus size={18} />
            </button>
          </div>
        </div>
        <div className="np-rule" />
        <div data-dateline className="np-dateline">
          <span>{new Date().toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}</span>
          <span>{getLoc(userProfile).city}{mastWx ? ` · ${mastWx.t}°C${mastWx.w ? ' ' + mastWx.w : ''}` : ''}</span>
          <span>No. {Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000)}</span>
        </div>


        {bellOpen && (
          <div data-bell-panel className="mb-2 bg-white border border-stone-300 shadow-lg max-h-80 overflow-y-auto">
            <div className="px-3 py-2 flex justify-between items-center border-b border-stone-200">
              <span className="text-[10px] uppercase tracking-widest text-purple-800 font-medium">Notifications</span>
              <span className="flex gap-3 text-[10px] text-stone-500">{notifs.length > 0 && <button onClick={() => setNotifs([])} className="underline">Clear</button>}<button onClick={() => setBellOpen(false)} className="underline">Close</button></span>
            </div>
            {typeof Notification !== 'undefined' && Notification.permission === 'default' && (
              <div className="px-3 py-2 bg-[#FAF8F5] border-b border-stone-200 text-[11px] text-stone-600 leading-snug">Want a phone alert when something arrives? <button data-notif-enable onClick={enableDeviceNotifications} className="underline text-purple-800">Turn on device alerts</button>. They also arrive when Pact is closed once push is set up.</div>
            )}
            {notifs.length === 0 && <p className="px-3 py-4 text-[11px] text-stone-500">Nothing yet. You'll see friend requests, messages, invites and plan changes here.</p>}
            {notifs.map(n => (
              <button key={n.id} data-notif-item onClick={() => { setBellOpen(false); setActiveTab('social'); setSocialSub(n.kind === 'message' || n.kind === 'friend' ? 'friends' : 'plans'); }} className="w-full text-left px-3 py-2 border-b border-stone-100 text-xs leading-snug hover:bg-stone-50">
                {n.text}
                <span className="block text-[9px] text-stone-400 mt-0.5">{new Date(n.at).toLocaleString([], { weekday: 'short', hour: '2-digit', minute: '2-digit' })}</span>
              </button>
            ))}
          </div>
        )}

        {/* Date Scroller (Shown on Today & Plan tabs) */}
        {showPrivacyNotice && <PrivacyNotice onClose={() => setShowPrivacyNotice(false)} />}
        {activeTab === 'schedule' && (<>
          <div className="flex items-center justify-between pt-1">
            <button aria-label="Previous week" onClick={() => setSelectedDateStr(addDaysStr(selectedDateStr, -7))} className="w-9 h-9 border border-stone-300 flex items-center justify-center text-slate-700 hover:border-purple-900">
              <ChevronLeft size={16} />
            </button>
            <div className="relative text-center px-2">
              <div className="text-[10px] uppercase tracking-widest text-stone-500 font-medium">Week of</div>
              <div className="text-[13px] font-medium text-slate-900 flex items-center justify-center gap-1.5"><CalendarDays size={13} /> {weekLabel}</div>
              <input type="date" aria-label="Jump to a date" value={selectedDateStr} onChange={e => { if (e.target.value) setSelectedDateStr(e.target.value); }} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
            </div>
            <div className="flex gap-1">
              {selectedDateStr !== todayDateStr() && (
                <button onClick={() => setSelectedDateStr(todayDateStr())} className="h-9 px-2.5 bg-purple-900 text-white text-[10px] uppercase tracking-wider font-medium">Today</button>
              )}
              <button aria-label="Next week" onClick={() => setSelectedDateStr(addDaysStr(selectedDateStr, 7))} className="w-9 h-9 border border-stone-300 flex items-center justify-center text-slate-700 hover:border-purple-900">
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
          <div className="flex justify-between items-center gap-1 pt-2 overflow-x-auto no-scrollbar">
            {weekDays.map(d => {
              const isSelected = d.full === selectedDateStr;
              const count = tasks.filter(t => t.date === d.full).length;
              return (
                <button
                  key={d.full}
                  onClick={() => setSelectedDateStr(d.full)}
                  className={`flex-1 py-1.5 px-1 border text-center transition-all ${
                    isSelected
                      ? 'bg-purple-900 text-white border-purple-900'
                      : d.full === todayDateStr() ? 'bg-white text-slate-900 border-purple-900' : 'bg-white text-slate-700 border-stone-200 hover:border-purple-400'
                  }`}
                >
                  <div className="text-[9px] uppercase tracking-widest opacity-75">{d.day}</div>
                  <div className="text-xs font-medium mt-0.5">{d.date}</div>
                  <div className="flex justify-center gap-0.5 mt-0.5">
                    {Array.from({ length: Math.min(3, count) }).map((_, idx) => (
                      <span key={idx} className={`w-1 h-1 rounded-full ${isSelected ? 'bg-rose-300' : 'bg-purple-700'}`} />
                    ))}
                  </div>
                </button>
              );
            })}
          </div>
        </>)}
      </header>

      {/* =========================================================
          MAIN SCROLLABLE BODY
         ========================================================= */}
      <main id="pact-main" className="flex-1 overflow-y-auto px-5 py-4 space-y-5 pb-28 no-scrollbar relative z-10">

        {/* =========================================================
            TAB 1: HOME DASHBOARD
           ========================================================= */}
        {activeTab === 'home' && simpleView && !calmFull && (() => {
          const todayS = todayDateStr(); const nowM = new Date().getHours() * 60 + new Date().getMinutes();
          const tl = tasks.filter(t => t.date === todayS && t.status !== 'done').sort((a, b) => String(a.startTime).localeCompare(String(b.startTime)));
          const nextT = tl.find(t => t.startTime && toMins(t.startTime) >= nowM) || null;
          const dueP = people.find(x => !x.blocked && personOverdue(x, todayS, addDaysStr) !== null) || null;
          const ce = communityEvents[0] || null;
          return (
            <div className="np-skin animate-in fade-in duration-300">
              <CalmHome name={accountInfo.name} nextTask={nextT} todayCount={tl.length} tomorrowCount={tasks.filter(t => t.date === addDaysStr(todayS, 1) && t.status !== 'done').length} duePerson={dueP} treat={ce ? { title: ce.title, when: ce.date } : null} go={(t) => setActiveTab(t)} onFull={() => setCalmFull(true)} startVoice={startVoice} />
            </div>
          );
        })()}
        {activeTab === 'home' && !(simpleView && !calmFull) && (
          <div className="np-skin flex flex-col gap-5 animate-in fade-in duration-300">
            {(homeStyle === 'classic' ? (hasSit(userProfile, 'energy') || (userProfile.energyLog || {})[todayDateStr()]) : (userProfile.energyLog || {})[todayDateStr()] === 'low') && <EnergyCard profile={userProfile} patch={patchProfile} tasks={tasks} today={todayDateStr()} moveTask={moveTaskTomorrow} pushToast={pushToast} />}
            {simpleView && <button data-calm-back onClick={() => setCalmFull(false)} className="text-left text-[13px] underline" style={{ order: -20, color: '#5A675F', borderRadius: 0 }}>&larr; Back to the calm Today</button>}

            <div className="pt-1 flex items-start justify-between gap-3" style={{ order: -10 }}>
              {(() => {
                const todayS = todayDateStr();
                const hr = new Date().getHours();
                const nowM = hr * 60 + new Date().getMinutes();
                const todays = tasks.filter(t => t.date === todayS).sort((a, b) => String(a.startTime).localeCompare(String(b.startTime)));
                const nextT = todays.find(t => t.startTime && toMins(t.startTime) >= nowM && t.status !== 'done');
                const NUM = ['No', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten'];
                const n = todays.length;
                const line = n === 0
                  ? 'Nothing planned yet. A clear day.'
                  : `${NUM[n] || n} thing${n === 1 ? '' : 's'} today.` + (nextT ? ` ${nextT.title} is next, start getting ready at ${fromMins(readyStartFor(nextT, toMins(nextT.startTime), userProfile))}.` : ' All done for today.');
                return (
                  <div className="min-w-0">
                    <div className="text-[11px] uppercase tracking-[0.16em] text-stone-500 font-medium">{new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })}</div>
                    <h2 data-home-greeting className="font-editorial text-[28px] max-[359px]:text-[24px] leading-[1.06] text-slate-900 mt-1.5">{hr < 12 ? 'Good morning' : hr < 18 ? 'Good afternoon' : 'Good evening'},<br /><em>{accountInfo.name.split(' ')[0]}.</em></h2>
                    <p className="text-[14px] leading-snug text-stone-700 mt-2.5">{line}</p>
                  </div>
                );
              })()}
              <div className="shrink-0 mt-1 flex flex-col items-end justify-between self-stretch gap-4">
              <button
                onClick={() => setWidgetPanelOpen(o => !o)}
                aria-label="Customise home widgets"
                className={`h-10 px-3 rounded-full border-[1.5px] flex items-center gap-1.5 text-[10px] uppercase tracking-wider font-medium ${widgetPanelOpen ? 'bg-purple-900 text-white border-purple-900' : 'border-slate-900 text-slate-900'}`}
              >
                <LayoutGrid size={14} /> Widgets
              </button>
                <button data-voice-home onClick={startVoice} aria-label="Add by voice: tap and say it, e.g. gym tomorrow at 6pm" title="Add by voice" className="lg-breathe w-11 h-11 rounded-full bg-purple-900 text-white flex items-center justify-center"><Mic size={18} /></button>
              </div>
            </div>

            {widgetPanelOpen && (
              <div className="p-4 bg-white border border-stone-300 space-y-2" style={{ order: -9 }}>
                <div className="flex justify-between items-center">
                  <div>
                    <span className="text-[10px] uppercase tracking-widest text-purple-800 font-medium">Customise Home</span>
                    <h3 className="font-editorial text-base font-normal">Add, remove and reorder widgets</h3>
                  </div>
                  <button onClick={() => setWidgetPanelOpen(false)} aria-label="Close widget menu" className="text-stone-400 hover:text-slate-900"><X size={16} /></button>
                </div>
                <button data-home-redo-setup onClick={() => { setWidgetPanelOpen(false); openSetup(); }} className="w-full h-11 border-[1.5px] border-slate-900 text-[11px] uppercase tracking-[0.16em] font-medium flex items-center justify-center gap-2" style={{ borderRadius: 0 }}>Redo setup &rarr;</button>
                {healthAsk && (
                  <div data-health-consent className="p-3 space-y-2" style={{ border: '2px solid #1B2A22', background: '#FBF4E0' }}>
                    <div className="text-[10px] uppercase tracking-widest text-purple-800 font-medium">Before you add this</div>
                    <p className="text-xs leading-relaxed text-slate-800"><b>{(HOME_WIDGETS.find(x => x.id === healthAsk) || {}).label}</b> is health information. If you say yes, The Pact stores it with your account so it can sync between your devices. Only you can see it. It is never shared with friends, never sent to the assistant, and never used for suggestions. You can remove the widget and your entries at any time.</p>
                    <div className="flex gap-2">
                      <button data-health-yes onClick={() => { patchProfile({ healthConsent: true, healthConsentAt: new Date().toISOString() }); flipWidget(healthAsk); setHealthAsk(null); }} className="flex-1 py-2 bg-purple-900 text-white text-[10px] uppercase tracking-wider font-medium">I agree, add it</button>
                      <button data-health-no onClick={() => setHealthAsk(null)} className="px-3 py-2 border border-stone-400 text-[10px] uppercase tracking-wider">Not now</button>
                    </div>
                  </div>
                )}
                <LayoutPicker profile={userProfile} patch={patchProfile} jobsOn={(hasSit(userProfile, 'jobs') || ((userProfile.jobs && userProfile.jobs.apps) || []).length > 0) ? userProfile.jobWidget !== false : userProfile.jobWidget === true} openFeedback={() => { setWidgetPanelOpen(false); setRoamieOpen(true); setRoamieBugMode(true); }} />
                <div className="text-[10px] uppercase tracking-widest text-stone-600 font-medium pt-3 border-t border-stone-300">More widgets</div>
                {homeLayout.order.map(id => {
                  const w = HOME_WIDGETS.find(x => x.id === id);
                  if (!w) return null;
                  const on = !homeLayout.hidden.includes(id);
                  return (
                    <div key={id} className="flex items-center gap-2 py-1.5 border-t border-stone-200">
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-medium text-slate-900">{w.label}</div>
                        <div className="text-[10px] text-stone-500">{w.desc}</div>
                      </div>
                      {on && (
                        <>
                          <button aria-label={`Move ${w.label} up`} onClick={() => moveWidget(id, -1)} className="w-7 h-7 border border-stone-300 flex items-center justify-center"><ChevronUp size={13} /></button>
                          <button aria-label={`Move ${w.label} down`} onClick={() => moveWidget(id, 1)} className="w-7 h-7 border border-stone-300 flex items-center justify-center"><ChevronDown size={13} /></button>
                        </>
                      )}
                      <button
                        onClick={() => toggleWidget(id)}
                        aria-label={`${on ? 'Remove' : 'Add'} ${w.label}`}
                        className={`w-16 h-7 text-[10px] uppercase tracking-wider font-medium ${on ? 'border border-stone-300 text-slate-700' : 'bg-purple-900 text-white'}`}
                      >
                        {on ? 'Remove' : '+ Add'}
                      </button>
                    </div>
                  );
                })}
              </div>
            )}

            {homeStyle !== 'classic' && (() => {
              const jobsAvail = hasSit(userProfile, 'jobs') || ((userProfile.jobs && userProfile.jobs.apps) || []).length > 0;
              const jobsOn = jobsAvail ? userProfile.jobWidget !== false : userProfile.jobWidget === true;
              return (<>
                <LogHome variant={homeStyle} profile={userProfile} patch={patchProfile} today={todayDateStr()} water={water} setWater={setWater} waterGoal={WATER_GOAL} reading={reading} setReading={setReading} notes={homeNotes} setNotes={setHomeNotes} targets={weeklyTargets} setTargets={setWeeklyTargets} onPlan={() => { setPlannerMode('task'); setPlannerResultsStep(false); setPlannerOpen(true); }}
                jobSlot={null} />
                <FrontPage hidden={homeLayout.hidden} open={openTile} setOpen={setOpenTile} registerSlot={registerSlot} meds={medications} setMeds={setMedications} meals={dailyMeals} tasks={tasks} cadence={lifeCadenceItems} countdown={countdown} today={todayDateStr()} addDays={addDaysStr} daysBetween={daysBetween}
                  jobNode={jobsOn ? <JobWidget face={<JobFace profile={userProfile} />} profile={userProfile} patch={patchProfile} pushToast={pushToast} addTask={addPlainTask} ai={(p, sys, schema) => callGeminiWithSearch(p, sys, schema, true)} onOpenTab={() => setActiveTab('skills')} /> : null} />
              </>);
            })()}

            {/* 1. WEEKLY TARGETS WIDGET */}
            <div style={{ order: widgetOrder('targets') }} className={widgetHidden('targets') ? 'hidden' : ''}>
            <div className="p-4 bg-white border border-stone-200 shadow-sm space-y-3">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-[10px] uppercase tracking-widest text-purple-800 font-medium">Weekly Targets<span className="np-kicker">The scoreboard</span></span>
                  <h2 className="font-editorial text-lg font-normal text-slate-900 mt-0.5">
                    What do you want to get done this week?
                  </h2>
                </div>
                <button
                  onClick={() => setShowAddTarget(!showAddTarget)}
                  className="px-2.5 py-1 bg-purple-800 text-white text-[10px] uppercase tracking-wider font-medium flex items-center gap-1 shrink-0"
                >
                  <Plus size={11} /> Add Target
                </button>
              </div>

              {showAddTarget && (
                <div className="p-3 bg-[#FAF8F5] border border-stone-300 space-y-2">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="e.g., Visit 2 new study libraries..."
                      value={newTargetTitle}
                      onChange={e => setNewTargetTitle(e.target.value)}
                      className="flex-1 bg-white border border-stone-300 px-2.5 py-1.5 text-xs outline-none"
                    />
                    <input
                      type="number"
                      min="1"
                      max="14"
                      value={newTargetCount}
                      onChange={e => setNewTargetCount(Number(e.target.value))}
                      className="w-14 bg-white border border-stone-300 px-2 py-1.5 text-xs text-center outline-none"
                    />
                  </div>
                  <button
                    onClick={() => {
                      if (!newTargetTitle.trim()) return;
                      setWeeklyTargets(prev => [
                        ...prev,
                        { id: `wt_${Date.now()}`, title: newTargetTitle, current: 0, target: newTargetCount, unit: 'sessions', category: 'leisure' }
                      ]);
                      setNewTargetTitle('');
                      setShowAddTarget(false);
                    }}
                    className="w-full py-1.5 bg-slate-900 text-white text-[10px] uppercase tracking-wider font-medium"
                  >
                    Save Weekly Target
                  </button>
                </div>
              )}

              <div className="space-y-2.5">
                {weeklyTargets.map(wt => {
                  const pct = Math.min(100, Math.round((wt.current / wt.target) * 100));
                  const remaining = Math.max(0, wt.target - wt.current);
                  return (
                    <div key={wt.id} className="p-3 bg-[#FAF8F5] border border-stone-200 space-y-2">
                      <div className="flex justify-between items-center">
                        {editingTargetId === wt.id ? (
                          <input
                            type="text"
                            value={wt.title}
                            onChange={e => setWeeklyTargets(weeklyTargets.map(item => item.id === wt.id ? { ...item, title: e.target.value } : item))}
                            onBlur={() => setEditingTargetId(null)}
                            autoFocus
                            className="bg-white border border-purple-700 px-2 py-0.5 text-xs font-medium"
                          />
                        ) : (
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-medium text-slate-900">{wt.title}</span>
                            <button onClick={() => setEditingTargetId(wt.id)} className="text-stone-400 hover:text-slate-700">
                              <Edit3 size={11} />
                            </button>
                          </div>
                        )}
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] font-mono px-2.5 py-1 rounded-lg text-white font-medium" style={{ background: wt.category === 'work' ? '#2A5359' : wt.category === 'social' ? '#B5683A' : '#1F3A2E' }}>
                            {wt.current}/{wt.target} {wt.unit}
                          </span>
                          <button
                            onClick={() => setWeeklyTargets(weeklyTargets.filter(item => item.id !== wt.id))}
                            className="text-stone-400 hover:text-rose-700"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </div>

                      <div className="w-full h-1.5 bg-stone-200 overflow-hidden">
                        <div className="h-full bg-purple-800 transition-all" style={{ width: `${pct}%` }} />
                      </div>

                      {remaining > 0 && (
                        <div className="flex items-center justify-between pt-1">
                          <span className="text-[10px] text-rose-800 font-medium">
                            Hey! {remaining} more needed to hit your weekly target
                          </span>
                          <button
                            onClick={() => {
                              setLinkedTargetId(wt.id);
                              setPlannerMode('activity');
                              setEventConfig(prev => ({ ...prev, activityDropdown: wt.title }));
                              setPlannerResultsStep(false);
                              setPlannerOpen(true);
                            }}
                            className="px-2.5 py-1 bg-blue-800 hover:bg-blue-900 text-white text-[10px] uppercase tracking-wider font-medium"
                          >
                            + Plan Slot
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
            </div>

            {/* 2. SMART PLANNING LAUNCHPAD */}
            <div style={{ order: widgetOrder('launchpad') }} className={widgetHidden('launchpad') ? 'hidden' : ''}>
            <div className="p-4 bg-purple-900 text-white space-y-3">
              <div className="flex justify-between items-center">
                <div>
                  <span className="text-[10px] uppercase tracking-widest text-rose-300 font-medium">Concierge</span>
                  <h3 className="font-editorial text-lg font-normal">What should I sort for you?</h3>
                </div>
                <Sparkles size={18} className="text-rose-300" />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => { setPlannerMode('event'); setPlannerResultsStep(false); setPlannerOpen(true); }}
                  className="p-2.5 bg-purple-800 hover:bg-purple-700 border border-purple-600 text-left transition-all"
                >
                  <div className="text-xs font-medium">Plan an Event</div>
                  <div className="text-[10px] text-purple-200 mt-0.5">Date night, birthday, dining</div>
                </button>
                <button
                  onClick={() => { setPlannerMode('task'); setPlannerResultsStep(false); setPlannerOpen(true); }}
                  className="p-2.5 bg-blue-900 hover:bg-blue-800 border border-blue-700 text-left transition-all"
                >
                  <div className="text-xs font-medium">Allocate a Task</div>
                  <div className="text-[10px] text-blue-200 mt-0.5">Deadlines & split focus blocks</div>
                </button>
                <button
                  onClick={() => { setPlannerMode('activity'); setPlannerResultsStep(false); setPlannerOpen(true); }}
                  className="p-2.5 bg-purple-800 hover:bg-purple-700 border border-purple-600 text-left transition-all"
                >
                  <div className="text-xs font-medium">New Activity</div>
                  <div className="text-[10px] text-purple-200 mt-0.5">Outdoor, sports, craft</div>
                </button>
                <button
                  onClick={() => { setPlannerMode('surprise'); setSurpriseConfig(prev => ({ ...prev, showPopup: false })); setPlannerOpen(true); }}
                  className="p-2.5 bg-rose-700 hover:bg-rose-600 border border-rose-500 text-left transition-all flex items-center justify-between"
                >
                  <div>
                    <div className="text-xs font-medium">Surprise Me!</div>
                    <div className="text-[10px] text-rose-100 mt-0.5">Roll the adventure dice</div>
                  </div>
                  <Dices size={16} />
                </button>
              </div>
            </div>
            </div>

            {/* 3. DAILY MOOD & BURNOUT PACING TRACKER */}
            <div style={{ order: widgetOrder('mood') }} className={widgetHidden('mood') ? 'hidden' : ''}>
            <div className="p-4 bg-white border border-stone-200 space-y-3">
              <div className="flex justify-between items-center">
                <div>
                  <span className="text-[10px] uppercase tracking-widest text-blue-800 font-medium">Energy & Burnout Pacing</span>
                  <h3 className="font-editorial text-lg font-normal text-slate-900">How is your mood today?</h3>
                </div>
                <button
                  onClick={handleExportCSV}
                  className="px-2.5 py-1 bg-[#FAF8F5] border border-stone-300 text-[10px] uppercase tracking-wider font-medium flex items-center gap-1 hover:border-purple-700"
                >
                  <Download size={11} /> Export CSV
                </button>
              </div>

              <div className="grid grid-cols-3 gap-2">
                {[
                  { label: 'Great', score: 5, icon: Smile, activeCls: 'bg-purple-800 text-white border-purple-800' },
                  { label: 'Okay', score: 3, icon: Meh, activeCls: 'bg-blue-800 text-white border-blue-800' },
                  { label: 'Low', score: 2, icon: Frown, activeCls: 'bg-rose-700 text-white border-rose-700' }
                ].map(item => {
                  const IconComponent = item.icon;
                  const isSelected = todayMood === item.label;
                  return (
                    <button
                      key={item.label}
                      onClick={() => handleLogMood(item.label, item.score)}
                      className={`py-2 px-3 border flex items-center justify-center gap-1.5 text-xs font-medium transition-all ${
                        isSelected ? item.activeCls : 'bg-[#FAF8F5] text-slate-700 border-stone-200 hover:border-purple-600'
                      }`}
                    >
                      <IconComponent size={14} /> {item.label}
                    </button>
                  );
                })}
              </div>

              <div className="flex items-center justify-between gap-2 pt-1">
                <span className="text-[11px] text-stone-600">What impacted your mood?</span>
                <select
                  value={todayMoodReason}
                  onChange={e => { const r = e.target.value; setTodayMoodReason(r); if (todayMood) { setUserProfile(prev => ({ ...prev, dailyActivityCap: computeCap(todayMood, r).cap })); setMoodLogs(prev => prev.map(m => m.date === selectedDateStr ? { ...m, reason: r } : m)); pushToast('Reason updated and saved.', 'success'); } }}
                  className="bg-[#FAF8F5] border border-stone-300 px-2 py-1 text-xs outline-none"
                >
                  <option value="Balanced schedule">Balanced schedule</option>
                  <option value="Too much stuff to do today">Too much stuff to do today</option>
                  <option value="Great outdoor / social session">Great outdoor / social session</option>
                  <option value="Poor sleep / low motivation">Poor sleep / low motivation</option>
                </select>
              </div>

              <div className="p-2.5 bg-[#FAF8F5] border-l-4 border-purple-800 text-[11px] space-y-1">
                <div className="flex justify-between items-center">
                  <span className="text-slate-700">
                    Adaptive Daily Pacing Cap: <strong>{userProfile.dailyActivityCap} activities/day</strong>
                  </span>
                  <button onClick={() => { setActiveTab('profile'); setProfileSubTab('data'); }} className="text-purple-800 font-medium underline">
                    View Logs
                  </button>
                </div>
                <div className="text-stone-600 leading-relaxed">
                  {todayMood ? `${computeCap(todayMood, todayMoodReason).why} sets your cap to ${userProfile.dailyActivityCap}/day.` : 'Log how you feel and Pact will adapt your daily cap.'}{' '}
                  Today: {filteredTasks.length} planned{filteredTasks.length > userProfile.dailyActivityCap ? ' (over your cap - consider moving one)' : ''}. Smart planning avoids days that are already full.
                </div>
              </div>
            </div>
            </div>

            {/* 4. MEDICINE REMINDER WIDGET */}
            {renderDetail('medicine', (
            <div style={{ order: widgetOrder('medicine') }} className={widgetHidden('medicine') ? 'hidden' : ''}>
            <div className="p-4 bg-white border border-stone-200 space-y-3">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Pill size={16} className="text-rose-700" />
                  <div>
                    <span className="text-[10px] uppercase tracking-widest text-rose-700 font-medium">Daily Essentials</span>
                    <h3 className="font-editorial text-base font-normal text-slate-900">Medicine & Supplements</h3>
                  </div>
                </div>
                <button
                  onClick={() => setShowAddMed(!showAddMed)}
                  className="px-2 py-1 bg-slate-900 text-white text-[10px] uppercase tracking-wider font-medium"
                >
                  + Add Med
                </button>
              </div>

              {showAddMed && (
                <div className="flex gap-2 p-2.5 bg-[#FAF8F5] border border-stone-300">
                  <input
                    type="text"
                    placeholder="Medication name..."
                    value={newMedName}
                    onChange={e => setNewMedName(e.target.value)}
                    className="flex-1 bg-white border border-stone-300 px-2 py-1 text-xs"
                  />
                  <input
                    type="time"
                    value={newMedTime}
                    onChange={e => setNewMedTime(e.target.value)}
                    className="bg-white border border-stone-300 px-2 py-1 text-xs"
                  />
                  <button
                    onClick={() => {
                      if (!newMedName.trim()) return;
                      setMedications(prev => [...prev, { id: `m_${Date.now()}`, name: newMedName, time: newMedTime, taken: false }]);
                      setNewMedName('');
                      setShowAddMed(false);
                    }}
                    className="px-2.5 py-1 bg-purple-800 text-white text-xs"
                  >
                    Save
                  </button>
                </div>
              )}

              <div className="space-y-1.5">
                {medications.map(med => (
                  <div key={med.id} className="flex items-center justify-between p-2.5 bg-[#FAF8F5] border border-stone-200">
                    <button
                      onClick={() => setMedications(medications.map(m => m.id === med.id ? { ...m, taken: !m.taken } : m))}
                      className="flex items-center gap-2.5 text-left"
                    >
                      <div className={`w-4 h-4 border flex items-center justify-center ${med.taken ? 'bg-blue-800 border-blue-800 text-white' : 'bg-white border-stone-400'}`}>
                        {med.taken && <Check size={11} />}
                      </div>
                      <div>
                        <div className={`text-xs font-medium ${med.taken ? 'line-through text-stone-400' : 'text-slate-900'}`}>{med.name}</div>
                        <div className="text-[10px] text-stone-500">Scheduled for {med.time}</div>
                      </div>
                    </button>
                    <button onClick={() => setMedications(medications.filter(m => m.id !== med.id))} className="text-stone-400 hover:text-rose-700">
                      <Trash2 size={13} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
            </div>
            ))}

            {/* 5. STANDALONE DAILY MEALS & FRIDGE BATCH PREP STOCK WIDGET */}
            {renderDetail('meals', (
            <div style={{ order: widgetOrder('meals') }} className={widgetHidden('meals') ? 'hidden' : ''}>
            <div className="p-4 bg-white border border-stone-200 space-y-3">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Utensils size={16} className="text-purple-800" />
                  <div>
                    <span className="text-[10px] uppercase tracking-widest text-purple-800 font-medium">Nutrition & Fridge Stock<span className="np-kicker">Food pages</span></span>
                    <h3 className="font-editorial text-base font-normal text-slate-900">Daily Meals & Batch Prep</h3>
                  </div>
                </div>
                <button
                  onClick={() => setDailyMeals(dailyMeals.map(m => ({ ...m, eaten: false, deducted: 0, loggedBatchId: '', logId: '' })))}
                  className="px-2 py-1 bg-[#FAF8F5] border border-stone-300 text-[10px] uppercase tracking-wider"
                >
                  Reset Day
                </button>
              </div>

              <div className="space-y-2">
                {dailyMeals.map(meal => (
                  <div key={meal.id} className="p-2.5 bg-[#FAF8F5] border border-stone-200 space-y-2">
                    <div className="flex items-center justify-between">
                      <button
                        onClick={() => handleToggleMealEaten(meal.id)}
                        className="flex items-center gap-2"
                      >
                        <div className={`w-4 h-4 border flex items-center justify-center ${meal.eaten ? 'bg-purple-800 border-purple-800 text-white' : 'bg-white border-stone-400'}`}>
                          {meal.eaten && <Check size={11} />}
                        </div>
                        <span className={`text-xs font-medium ${meal.eaten ? 'line-through text-stone-400' : 'text-slate-900'}`}>
                          {meal.label} ({meal.time})
                        </span>
                        {meal.eaten && <span className="text-[10px] text-purple-800 underline ml-1">undo</span>}
                      </button>

                      <select
                        value={meal.mode}
                        onChange={e => setDailyMeals(dailyMeals.map(m => m.id === meal.id ? { ...m, mode: e.target.value } : m))}
                        className="bg-white border border-stone-300 px-2 py-1 text-[11px] outline-none"
                      >
                        <option value="Meal Prep Stock">Meal Prep Stock</option>
                        <option value="Cooked New">Cooked Fresh</option>
                        <option value="Ate Out">Ate Out</option>
                      </select>
                    </div>

                    {meal.mode === 'Meal Prep Stock' ? (
                      <div className="space-y-1.5">
                      <select
                        value={meal.selectedBatchId}
                        onChange={e => setDailyMeals(dailyMeals.map(m => m.id === meal.id ? { ...m, selectedBatchId: e.target.value } : m))}
                        className="w-full bg-white border border-stone-300 px-2 py-1 text-xs outline-none"
                      >
                        <option value="">Select a prepped batch from fridge...</option>
                        {mealBatches.map(b => (
                          <option key={b.id} value={b.id}>
                            {b.name} ({b.portionsLeft} portions left)
                          </option>
                        ))}
                      </select>
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-stone-600">{meal.eaten ? `Logged ${meal.deducted || 0} portion${meal.deducted === 1 ? '' : 's'}` : 'How many portions did you eat?'}</span>
                        <div className="flex items-center gap-1.5">
                          <button type="button" disabled={meal.eaten || (meal.portions || 1) <= 1} aria-label={`Fewer portions for ${meal.label}`} onClick={() => setDailyMeals(dailyMeals.map(m => m.id === meal.id ? { ...m, portions: Math.max(1, (m.portions || 1) - 1) } : m))} className="w-6 h-6 border border-stone-300 disabled:opacity-40">−</button>
                          <span className="w-5 text-center font-mono">{meal.eaten ? (meal.deducted || 0) : (meal.portions || 1)}</span>
                          <button type="button" disabled={meal.eaten || (meal.portions || 1) >= Math.max(1, (mealBatches.find(b => b.id === meal.selectedBatchId) || { portionsLeft: 6 }).portionsLeft)} aria-label={`More portions for ${meal.label}`} onClick={() => setDailyMeals(dailyMeals.map(m => m.id === meal.id ? { ...m, portions: (m.portions || 1) + 1 } : m))} className="w-6 h-6 border border-stone-300 disabled:opacity-40">+</button>
                        </div>
                      </div>
                      </div>
                    ) : (
                      <input
                        type="text"
                        placeholder={meal.mode === 'Ate Out' ? 'Where/what did you eat out? (Saved to Data)' : 'What did you cook today?'}
                        value={meal.detail}
                        onChange={e => setDailyMeals(dailyMeals.map(m => m.id === meal.id ? { ...m, detail: e.target.value } : m))}
                        className="w-full bg-white border border-stone-300 px-2 py-1 text-xs outline-none"
                      />
                    )}
                  </div>
                ))}
              </div>

              {/* Batch Prep Inventory Sub-box */}
              <div className="p-3 bg-[#FAF8F5] border border-stone-300 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] uppercase tracking-widest text-slate-700 font-medium">Fridge Batch Prep Stock</span>
                  <button
                    onClick={() => setShowAddBatch(!showAddBatch)}
                    className="text-[10px] text-purple-800 uppercase tracking-wider font-medium"
                  >
                    + Add Prepped Batch
                  </button>
                </div>

                {showAddBatch && (
                  <div className="flex gap-1.5 pt-1">
                    <input
                      type="text"
                      placeholder="Batch dish name..."
                      value={newBatchName}
                      onChange={e => setNewBatchName(e.target.value)}
                      className="flex-1 bg-white border border-stone-300 px-2 py-1 text-xs"
                    />
                    <input
                      type="number"
                      min="1"
                      max="12"
                      value={newBatchPortions}
                      onChange={e => setNewBatchPortions(Number(e.target.value))}
                      className="w-12 bg-white border border-stone-300 px-1.5 py-1 text-xs text-center"
                    />
                    <button
                      onClick={() => {
                        if (!newBatchName.trim()) return;
                        setMealBatches(prev => [...prev, { id: `b_${Date.now()}`, name: newBatchName, portionsLeft: newBatchPortions }]);
                        setNewBatchName('');
                        setShowAddBatch(false);
                      }}
                      className="px-2.5 py-1 bg-purple-800 text-white text-xs"
                    >
                      Add
                    </button>
                  </div>
                )}

                <div className="space-y-1.5">
                  {mealBatches.map(batch => (
                    <div key={batch.id} className="flex justify-between items-center text-xs bg-white px-2.5 py-1.5 border border-stone-200">
                      <span className="font-medium text-slate-800">{batch.name}</span>
                      <div className="flex items-center gap-2">
                        <span className={`text-[11px] font-mono px-1.5 py-0.5 ${batch.portionsLeft <= 1 ? 'bg-rose-700 text-white' : 'bg-stone-100 text-slate-800'}`}>
                          {batch.portionsLeft} left
                        </span>
                        <button
                          onClick={() => setMealBatches(mealBatches.map(b => b.id === batch.id ? { ...b, portionsLeft: b.portionsLeft + 1 } : b))}
                          className="px-1.5 border border-stone-300 text-xs"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            </div>
            ))}

            {/* 6. LONG-TERM LIFE CADENCE WIDGET */}
            {renderDetail('cadence', (
            <div style={{ order: widgetOrder('cadence') }} className={widgetHidden('cadence') ? 'hidden' : ''}>
            <div className="p-4 bg-white border border-stone-200 space-y-3">
              <div className="flex justify-between items-center">
                <div>
                  <span className="text-[10px] uppercase tracking-widest text-blue-800 font-medium">Recurring Life Admin</span>
                  <h3 className="font-editorial text-base font-normal text-slate-900">Long-Term Life Cadence</h3>
                </div>
                <button
                  onClick={() => { setEditingCadenceId(null); setNewCadence(blankCadence()); setShowAddCadence(!showAddCadence); }}
                  className="px-2 py-1 bg-blue-800 text-white text-[10px] uppercase tracking-wider font-medium"
                >
                  + Add
                </button>
              </div>

              {showAddCadence && (
                <div className="p-3 bg-[#FAF8F5] border border-stone-300 space-y-2">
                  <div className="text-[10px] uppercase tracking-wider text-stone-600 font-medium">{editingCadenceId ? 'Edit reminder' : 'New reminder'}</div>
                  <input
                    type="text"
                    placeholder="e.g., Cat Vaccination / Boiler Service..."
                    aria-label="Reminder title"
                    value={newCadence.title}
                    onChange={e => setNewCadence({ ...newCadence, title: e.target.value })}
                    className="w-full bg-white border border-stone-300 px-2.5 py-1.5 text-xs"
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <label className="text-[10px] text-stone-500 space-y-1 block">
                      Repeats
                      <select
                        value={newCadence.interval}
                        aria-label="How often"
                        onChange={e => setNewCadence({ ...newCadence, interval: e.target.value, ...(editingCadenceId ? {} : { dueDate: addDaysStr(todayDateStr(), intervalDays(e.target.value)) }) })}
                        className="w-full bg-white border border-stone-300 px-2 py-1.5 text-xs text-slate-900"
                      >
                        {CADENCE_INTERVALS.map(([label]) => <option key={label} value={label}>{label}</option>)}
                      </select>
                    </label>
                    <label className="text-[10px] text-stone-500 space-y-1 block">
                      Next due
                      <input type="date" value={newCadence.dueDate || ''} aria-label="Next due date" onChange={e => setNewCadence({ ...newCadence, dueDate: e.target.value })} className="w-full bg-white border border-stone-300 px-2 py-1 text-xs text-slate-900" />
                    </label>
                  </div>
                  <label className="text-[10px] text-stone-500 space-y-1 block">
                    How do you book it?
                    <select
                      value={newCadence.contactType}
                      aria-label="Booking method"
                      onChange={e => {
                        const t = e.target.value;
                        const cur = (newCadence.contactValue || '').trim();
                        const looksLikeWeb = /^https?:\/\//i.test(cur) || /[a-z]{3,}\.[a-z]{2,}/i.test(cur);
                        const looksLikeNumber = /^[+\d\s()-]+$/.test(cur);
                        const isDefault = !cur || Object.values(CONTACT_DEFAULTS).includes(cur) || (t !== 'url' && looksLikeWeb) || (t === 'url' && looksLikeNumber);
                        setNewCadence({ ...newCadence, contactType: t, contactValue: isDefault ? CONTACT_DEFAULTS[t] : newCadence.contactValue });
                      }}
                      className="w-full bg-white border border-stone-300 px-2 py-1.5 text-xs text-slate-900"
                    >
                      <option value="url">Website booking link</option>
                      <option value="phone">Phone number</option>
                      <option value="whatsapp">WhatsApp number</option>
                    </select>
                  </label>
                  {newCadence.contactType === 'url' ? (
                    <input type="url" placeholder={CONTACT_PLACEHOLDERS.url} aria-label="Booking details" value={newCadence.contactValue} onChange={e => setNewCadence({ ...newCadence, contactValue: e.target.value })} className="w-full bg-white border border-stone-300 px-2.5 py-1.5 text-xs" />
                  ) : (
                    <PhoneField value={newCadence.contactValue} placeholder="7700 900123" onChange={v => setNewCadence({ ...newCadence, contactValue: v })} />
                  )}
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        if (!newCadence.title.trim()) return;
                        if (editingCadenceId) {
                          setLifeCadenceItems(prev => prev.map(x => x.id === editingCadenceId ? { ...x, ...newCadence } : x));
                          pushToast('Reminder updated.', 'success');
                        } else {
                          setLifeCadenceItems(prev => [...prev, { ...newCadence, id: `lc_${Date.now()}` }]);
                          pushToast('Reminder added.', 'success');
                        }
                        setEditingCadenceId(null);
                        setShowAddCadence(false);
                      }}
                      className="flex-1 py-1.5 bg-slate-900 text-white text-[10px] uppercase tracking-wider font-medium"
                    >
                      {editingCadenceId ? 'Save changes' : 'Save reminder'}
                    </button>
                    <button onClick={() => { setEditingCadenceId(null); setShowAddCadence(false); }} className="px-3 py-1.5 border border-stone-300 text-[10px] uppercase tracking-wider font-medium">Cancel</button>
                  </div>
                </div>
              )}

              <div className="space-y-2">
                {lifeCadenceItems.map(item => {
                  const href = contactHref(item.contactType, item.contactValue);
                  const overdue = item.dueDate && daysBetween(todayDateStr(), item.dueDate) < 0;
                  return (
                    <div key={item.id} className="p-2.5 bg-[#FAF8F5] border border-stone-200 space-y-2">
                      <div className="flex justify-between items-start gap-2">
                        <div className="min-w-0">
                          <div className="text-xs font-medium text-slate-900">{item.title}</div>
                          <div className="text-[10px] text-stone-500">{item.interval} • <span className={`${overdue ? 'text-rose-800' : 'text-rose-700'} font-medium`}>{cadenceDueText(item)}</span></div>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <button aria-label={`Edit ${item.title}`} onClick={() => { setEditingCadenceId(item.id); setNewCadence({ title: item.title, interval: item.interval, dueDate: item.dueDate || addDaysStr(todayDateStr(), intervalDays(item.interval)), contactType: item.contactType, contactValue: item.contactValue }); setShowAddCadence(true); }} className="text-stone-500 hover:text-purple-900">
                            <Edit3 size={13} />
                          </button>
                          <button aria-label={`Delete ${item.title}`} onClick={() => setLifeCadenceItems(lifeCadenceItems.filter(x => x.id !== item.id))} className="text-stone-400 hover:text-rose-700">
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>
                      <div className="flex gap-1.5">
                        <a
                          href={href}
                          target="_blank"
                          rel="noreferrer"
                          className="px-2.5 py-1 bg-purple-800 hover:bg-purple-900 text-white text-[10px] uppercase tracking-wider font-medium flex items-center gap-1"
                        >
                          {item.contactType === 'url' && <><ExternalLink size={10} /> Book</>}
                          {item.contactType === 'phone' && <><Phone size={10} /> Call</>}
                          {item.contactType === 'whatsapp' && <><MessageSquare size={10} /> WhatsApp</>}
                        </a>
                        <button
                          onClick={() => { const next = addDaysStr(todayDateStr(), intervalDays(item.interval)); setLifeCadenceItems(prev => prev.map(x => x.id === item.id ? { ...x, dueDate: next } : x)); pushToast(`Marked done. Next due ${shortDate(next)}.`, 'success'); }}
                          className="px-2.5 py-1 border border-stone-300 text-[10px] uppercase tracking-wider font-medium flex items-center gap-1"
                        >
                          <Check size={10} /> Done
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            </div>
            ))}

            {/* 7. FEEDBACK WIDGET */}
            <div style={{ order: widgetOrder('feedback') }} className={widgetHidden('feedback') ? 'hidden' : ''}>
            <div className="p-4 bg-slate-900 text-white space-y-2.5">
              <div className="flex justify-between items-center">
                <div>
                  <span className="text-[10px] uppercase tracking-widest text-rose-300 font-medium">Co-Design Pact</span>
                  <h3 className="font-editorial text-base font-normal">Liking Pact? Give us feedback!!</h3>
                </div>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map(star => (
                    <button
                      key={star}
                      onClick={() => setRoamFeedbackRating(star)}
                      className={`p-1 ${roamFeedbackRating >= star ? 'text-rose-400' : 'text-stone-600'}`}
                    >
                      <Star size={14} fill={roamFeedbackRating >= star ? 'currentColor' : 'none'} />
                    </button>
                  ))}
                </div>
              </div>
              {roamFeedbackSent ? (
                <div className="text-xs text-rose-300 py-1">Thank you! Your feedback has been logged for our next sprint.</div>
              ) : (
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Tell us what feature or tweak you'd love next..."
                    value={roamFeedbackComment}
                    onChange={e => setRoamFeedbackComment(e.target.value)}
                    className="flex-1 bg-slate-800 border border-slate-700 px-2.5 py-1.5 text-xs text-white outline-none"
                  />
                  <button
                    onClick={() => setRoamFeedbackSent(true)}
                    className="px-3 py-1.5 bg-rose-700 hover:bg-rose-600 text-white text-[10px] uppercase tracking-wider font-medium"
                  >
                    Send
                  </button>
                </div>
              )}
            </div>
            </div>

            {/* NEW WIDGET: TODAY AT A GLANCE */}
            {!widgetHidden('glance') && (() => {
              const todayS = todayDateStr();
              const todays = tasks.filter(t => t.date === todayS).sort((a, b) => a.startTime.localeCompare(b.startTime));
              const nowM = new Date().getHours() * 60 + new Date().getMinutes();
              const nextT = todays.find(t => toMins(t.startTime) >= nowM && t.status !== 'done');
              const free = getFreeGaps(todayS, calCtx, 45, { from: Math.max(8 * 60, roundUpTo(nowM, 15)) });
              return (
                <div data-glance className="space-y-3" style={{ order: -8 }}>
                  <span className="np-flag">Today at a glance<span className="np-kicker">Front page</span></span>
                  {todays.length === 0 && <div className="text-sm text-stone-600">Nothing planned today.</div>}
                  <div>
                    {todays.map((t, i) => {
                      const done = t.status === 'done';
                      const isNext = !!nextT && nextT.id === t.id;
                      const st = toMins(t.startTime);
                      const readyAt = readyStartFor(t, st, userProfile);
                      const travel = Number(t.travelTime) || 0;
                      return (
                        <div key={t.id} className="grid grid-cols-[46px_1fr] gap-x-3">
                          <div className={`text-[13px] pt-0.5 text-right ${isNext ? 'font-semibold text-rose-700' : 'text-stone-500'}`}>{t.startTime}</div>
                          <div className={`relative pl-4 ${i === todays.length - 1 ? 'pb-1' : 'pb-5'} border-l-2 ${isNext ? 'border-purple-900' : 'border-stone-300'}`}>
                            {isNext && <span className="lg-pulse-dot absolute -left-[7px] top-1 w-3.5 h-3.5 rounded-full bg-rose-700 opacity-50" />}
                            <span className={`absolute -left-[7px] top-1 w-3.5 h-3.5 rounded-full ${isNext ? 'bg-rose-700 border-2 border-[#F4EFE4]' : 'bg-stone-300'}`} />
                            {isNext ? (
                              <button data-glance-next onClick={() => { setSelectedDateStr(todayS); setActiveTab('schedule'); }} className="lg-rise block w-full text-left bg-purple-900 text-white p-4 rounded-[3px]">
                                <div className="text-[11px] uppercase tracking-[0.14em] text-rose-300">Next up</div>
                                <div className="font-editorial text-[22px] mt-1 leading-tight">{t.title}</div>
                                <div className="text-[13px] text-purple-200 mt-1">{t.location ? t.location + ' · ' : ''}{t.startTime}{t.endTime && t.endTime !== t.startTime ? '–' + t.endTime : ''}</div>
                                <div className="mt-3 flex gap-2 flex-wrap">
                                  {travel > 0 && <span className="text-[12px] border border-purple-400 rounded-full px-3 py-1">Leave {fromMins(st - travel)}</span>}
                                  <span className="text-[12px] border border-purple-400 rounded-full px-3 py-1">Get ready {fromMins(readyAt)}</span>
                                </div>
                              </button>
                            ) : (
                              <div className={done ? 'opacity-60' : ''}>
                                <div className={`text-[15px] ${done ? 'line-through text-stone-500' : 'text-slate-900 font-medium'}`}>{t.title}</div>
                                <div className="text-[12px] text-stone-500">{done ? 'Done' : (t.location || (t.endTime && t.endTime !== t.startTime ? 'Until ' + t.endTime : ''))}</div>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <div data-glance-stats className="grid grid-cols-3 border-t-[3px] border-b border-slate-900">
                    {[[todays.length, todays.length === 1 ? 'Plan' : 'Plans'], [free.length, 'Free windows'], [nextT ? fromMins(readyStartFor(nextT, toMins(nextT.startTime), userProfile)) : '–', 'Get ready']].map(([n, l], i) => (
                      <div key={l} className={`py-2.5 ${i ? 'pl-3 border-l border-slate-900' : ''}`}><div className="font-editorial text-[28px] leading-none">{n}</div><div className="text-[9.5px] uppercase tracking-[0.12em] text-stone-500 mt-1.5">{l}</div></div>
                    ))}
                  </div>
                </div>
              );
            })()}

            {/* NEW WIDGET: WEEK AHEAD */}
            {!widgetHidden('weekahead') && renderDetail('weekahead', (
              <div className="p-4 bg-white border border-stone-200 space-y-2" style={{ order: widgetOrder('weekahead') }}>
                <span className="text-[10px] uppercase tracking-widest text-purple-800 font-medium">Week ahead<span className="np-kicker">The forecast</span></span>
                {Array.from({ length: 7 }, (_, i) => addDaysStr(todayDateStr(), i)).map(d => {
                  const ts = tasks.filter(t => t.date === d).sort((a, b) => a.startTime.localeCompare(b.startTime));
                  return (
                    <button key={d} onClick={() => { setSelectedDateStr(d); setActiveTab('schedule'); }} className="w-full flex items-center gap-3 py-1.5 border-t border-stone-200 text-left">
                      <span className="w-14 text-[10px] uppercase tracking-wider text-stone-600 shrink-0">{prettyDate(d)}</span>
                      <span className="flex-1 min-w-0 text-xs text-slate-800 truncate">{ts.length ? ts.map(t => t.title).join(', ') : <span className="text-stone-400">Clear</span>}</span>
                      <span className="text-[10px] text-stone-500 shrink-0">{ts.length}</span>
                    </button>
                  );
                })}
              </div>
            ))}

            {/* NEW WIDGET: QUICK NOTES */}
            {!widgetHidden('notes') && (
              <div className="p-4 bg-white border border-stone-200 space-y-2" style={{ order: widgetOrder('notes') }}>
                <span className="text-[10px] uppercase tracking-widest text-purple-800 font-medium flex items-center gap-1.5"><StickyNote size={12} /> Quick notes<span className="np-kicker">Scribbles</span></span>
                <textarea
                  rows={4}
                  value={homeNotes}
                  onChange={e => setHomeNotes(e.target.value)}
                  placeholder="Jot something down. It saves automatically."
                  aria-label="Quick notes"
                  className="w-full bg-[#FAF8F5] border border-stone-300 p-2 text-xs outline-none"
                />
              </div>
            )}

            {/* NEW WIDGET: HYDRATION */}
            {!widgetHidden('hydration') && (() => {
              const count = water.date === todayDateStr() ? water.count : 0;
              const setCount = (n) => setWater({ date: todayDateStr(), count: Math.max(0, Math.min(40, n)) });
              const over = count > WATER_GOAL;
              return (
                <div className="p-4 bg-white border border-stone-200 space-y-2" style={{ order: widgetOrder('hydration') }}>
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] uppercase tracking-widest text-purple-800 font-medium flex items-center gap-1.5"><Droplets size={12} /> Hydration<span className="np-kicker">Tide table</span></span>
                    <span className="text-xs font-medium">{count} / {WATER_GOAL} glasses</span>
                  </div>
                  <div className="flex gap-1 flex-wrap">
                    {Array.from({ length: Math.max(WATER_GOAL, count) }).map((_, i) => (
                      <button key={i} onClick={() => setCount(i + 1 === count ? i : i + 1)} aria-label={`Set ${i + 1} glasses`} className={`h-8 border ${i >= WATER_GOAL ? 'w-8' : 'flex-1'} ${i < count ? (i >= WATER_GOAL ? 'bg-rose-700 border-rose-700' : 'bg-purple-900 border-purple-900') : 'bg-white border-stone-300'}`} />
                    ))}
                  </div>
                  {over && (
                    <div className="p-2 bg-rose-50 border-l-4 border-rose-700 text-[11px] text-rose-900">
                      That's {count - WATER_GOAL} glass{count - WATER_GOAL === 1 ? '' : 'es'} above the usual {WATER_GOAL}. It's still counted. Go by what feels right for you.
                    </div>
                  )}
                  <div className="flex gap-2">
                    <button onClick={() => setCount(count + 1)} className="px-3 py-1 bg-purple-900 text-white text-[10px] uppercase tracking-wider font-medium">+ Glass</button>
                    <button onClick={() => setCount(count - 1)} className="px-3 py-1 border border-stone-300 text-[10px] uppercase tracking-wider font-medium">Undo</button>
                  </div>
                </div>
              );
            })()}

            {/* NEW WIDGET: READING */}
            {!widgetHidden('reading') && (() => {
              const todayS = todayDateStr();
              const pct = reading.total > 0 ? Math.min(100, Math.round((reading.page / reading.total) * 100)) : 0;
              const todayPages = reading.log[todayS] || 0;
              let streak = 0;
              for (let d = (reading.log[todayS] ? todayS : addDaysStr(todayS, -1)); (reading.log[d] || 0) > 0; d = addDaysStr(d, -1)) streak++;
              const addPages = (n) => setReading(r => {
                const page = Math.max(0, Math.min(r.total, r.page + n));
                const delta = page - r.page;
                return { ...r, page, log: { ...r.log, [todayS]: Math.max(0, (r.log[todayS] || 0) + delta) } };
              });
              const finish = () => setReading(r => ({ ...r, finished: [...(r.finished || []), { title: r.title || 'Untitled', author: r.author, date: todayS }], title: '', author: '', page: 0 }));
              return (
                <div className="p-4 bg-white border border-stone-200 space-y-2.5" style={{ order: widgetOrder('reading') }}>
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] uppercase tracking-widest text-purple-800 font-medium">Reading<span className="np-kicker">Book review</span></span>
                    <span className="text-[10px] text-stone-600">{streak > 0 ? `${streak}-day streak` : 'No streak yet'} · {(reading.finished || []).length} finished</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <input type="text" value={reading.title} onChange={e => setReading({ ...reading, title: e.target.value })} placeholder="Book title" aria-label="Book title" className="bg-[#FAF8F5] border border-stone-300 px-2 py-1.5 text-xs" />
                    <input type="text" value={reading.author} onChange={e => setReading({ ...reading, author: e.target.value })} placeholder="Author" aria-label="Author" className="bg-[#FAF8F5] border border-stone-300 px-2 py-1.5 text-xs" />
                  </div>
                  <div>
                    <div className="flex justify-between text-[11px] text-slate-800 mb-1">
                      <span>Page {reading.page} of</span>
                      <span className="flex items-center gap-1"><input type="number" min="1" value={reading.total} onChange={e => setReading({ ...reading, total: Math.max(1, Number(e.target.value) || 1), page: Math.min(reading.page, Math.max(1, Number(e.target.value) || 1)) })} aria-label="Total pages" className="w-14 bg-[#FAF8F5] border border-stone-300 px-1 py-0.5 text-xs text-right" /> ({pct}%)</span>
                    </div>
                    <div className="h-2 bg-[#EDEAE0]"><div className="h-2 bg-purple-900" style={{ width: pct + '%' }} /></div>
                  </div>
                  <div className="text-[11px] text-stone-600">Today: {todayPages} / {reading.dailyGoal} pages{todayPages >= reading.dailyGoal ? ' ✓ goal met' : ''}</div>
                  <div className="flex flex-wrap gap-1.5">
                    {[5, 10, 20].map(n => (
                      <button key={n} onClick={() => addPages(n)} className="px-2.5 py-1 bg-purple-900 text-white text-[10px] uppercase tracking-wider font-medium">+{n} pages</button>
                    ))}
                    <button onClick={() => addPages(-5)} className="px-2.5 py-1 border border-stone-300 text-[10px] uppercase tracking-wider font-medium">−5</button>
                    {reading.page >= reading.total && reading.total > 0 && (
                      <button onClick={finish} className="px-2.5 py-1 bg-rose-700 text-white text-[10px] uppercase tracking-wider font-medium">Finished! Next book</button>
                    )}
                  </div>
                </div>
              );
            })()}

            {/* NEW WIDGET: COUNTDOWN */}
            {!widgetHidden('countdown') && (() => {
              const left = countdown.date ? daysBetween(todayDateStr(), countdown.date) : null;
              return renderDetail('countdown', (
                <div className="p-4 bg-white border border-stone-200 space-y-2" style={{ order: widgetOrder('countdown') }}>
                  <span className="text-[10px] uppercase tracking-widest text-purple-800 font-medium">Countdown</span>
                  <div className="font-editorial text-[44px] leading-none text-slate-900">
                    {left === null ? '--' : left < 0 ? 'Passed' : left}
                    {left !== null && left >= 0 && <span className="text-sm font-sans ml-2 text-stone-600">{left === 1 ? 'day to go' : 'days to go'}</span>}
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <input type="text" value={countdown.title} onChange={e => setCountdown({ ...countdown, title: e.target.value })} aria-label="Countdown title" className="bg-[#FAF8F5] border border-stone-300 px-2 py-1.5 text-xs" />
                    <input type="date" value={countdown.date} onChange={e => setCountdown({ ...countdown, date: e.target.value })} aria-label="Countdown date" className="bg-[#FAF8F5] border border-stone-300 px-2 py-1.5 text-xs" />
                  </div>
                </div>
              ));
            })()}

          </div>
        )}

        {/* =========================================================
            TAB 2: SCHEDULE (merged Today + Plan, any week)
           ========================================================= */}
        {activeTab === 'schedule' && (
          <div className="np-skin space-y-4 animate-in fade-in duration-300">
            {hasSit(userProfile, 'study') && <TermPanel profile={userProfile} patch={patchProfile} goData={() => { setActiveTab('profile'); setProfileSubTab('data'); }} />}
            {hasSit(userProfile, 'shifts') && <RotaPanel profile={userProfile} patch={patchProfile} pushToast={pushToast} />}

            {/* Context-Aware Reclaimed Time Prompt */}
            {reclaimedMinutes && (
              <div className="p-4 bg-purple-900 text-white space-y-2.5 border-l-4 border-rose-500">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[10px] uppercase tracking-widest text-rose-300 font-medium">Time Reclaimed!</span>
                    <h3 className="font-editorial text-base font-normal">
                      You finished {reclaimedMinutes} mins early (at {reclaimedAt})!
                    </h3>
                  </div>
                  <button onClick={() => setReclaimedMinutes(null)} className="text-purple-200 hover:text-white">
                    <X size={15} />
                  </button>
                </div>
                <p className="text-xs text-purple-100 leading-relaxed">
                  {userProfile.status === 'University Student'
                    ? "Looks like you're on campus right now. Want to grab lunch, get a snack at Pollen, or review a 15-min Decision Trees flashcard set?"
                    : "Great momentum! Want to step outside for a 15-min reset walk, hydrate, or pull your next block forward?"}
                </p>
                <div className="flex gap-2 pt-1">
                  <button
                    onClick={() => {
                      setTasks(prev => [...prev, {
                        id: Date.now(),
                        title: userProfile.status === 'University Student' ? 'Campus Coffee & Snack Break' : 'Mindful Reset Walk',
                        duration: reclaimedMinutes,
                        status: 'pending',
                        startTime: reclaimedAt || nowHHMM(),
                        endTime: '11:00',
                        date: selectedDateStr,
                        type: 'social',
                        categoryColor: 'leisure',
                        location: 'Nearby Spot',
                        transportMode: 'Walk',
                        travelTime: 5,
                        distance: '0.2 mi',
                        leaveByNote: 'Immediate reclaimed window',
                        notes: 'Added from Reclaimed Time prompt.',
                        rating: null,
                        reviewNote: '',
                        withPerson: null,
                        meetingType: 'Friendly'
                      }]);
                      setReclaimedMinutes(null);
                    }}
                    className="px-3 py-1.5 bg-rose-700 text-white text-[10px] uppercase tracking-wider font-medium"
                  >
                    + Slot Quick Break
                  </button>
                  <button
                    onClick={() => setReclaimedMinutes(null)}
                    className="px-3 py-1.5 bg-purple-800 border border-purple-600 text-white text-[10px] uppercase tracking-wider"
                  >
                    Bank Free Time
                  </button>
                </div>
              </div>
            )}

            {/* Social CRM Nudge Banner */}
            {showSocialNudge && nudgeFriend && (
              <div className="p-4 bg-rose-800 text-white space-y-3">
                {socialNudgeStep === 'initial' && (
                  <>
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-[10px] uppercase tracking-widest text-rose-200 font-medium">Time to reach out</span>
                        <h3 className="font-editorial text-base font-normal mt-0.5">
                          {nudgeFriend.days > 0 ? `It's been ${nudgeFriend.days} days since you were in touch with ${nudgeFriend.name}.` : `Time to get in touch with ${nudgeFriend.name}.`}
                        </h3>
                      </div>
                      <button onClick={() => setSocialNudgeStep('dismiss')} className="text-rose-200 hover:text-white">
                        <X size={15} />
                      </button>
                    </div>
                    <p className="text-xs text-rose-100">Maybe set up a quick coffee or walk together this week?</p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setSocialNudgeStep('slots')}
                        className="px-3 py-1.5 bg-white text-rose-900 text-[10px] uppercase tracking-wider font-medium"
                      >
                        Find a Free Block
                      </button>
                      <button
                        data-nudge-contacted
                        onClick={() => { updatePerson(nudgeFriend.id, { lastContact: todayDateStr(), snoozeUntil: '' }); pushToast(`Nice. Logged that you were in touch with ${nudgeFriend.name}.`, 'success'); }}
                        className="px-3 py-1.5 bg-rose-900 text-rose-100 text-[10px] uppercase tracking-wider"
                      >
                        Already in touch
                      </button>
                      <button
                        onClick={() => setSocialNudgeStep('dismiss')}
                        className="px-3 py-1.5 bg-rose-900 text-rose-100 text-[10px] uppercase tracking-wider"
                      >
                        Not Now
                      </button>
                    </div>
                  </>
                )}

                {socialNudgeStep === 'slots' && (
                  <div className="space-y-2">
                    <div className="text-xs font-medium">Here are your best conflict-free blocks with {nudgeFriend.name}:</div>
                    <div className="grid grid-cols-1 gap-1.5">
                      {(() => {
                        const out = [];
                        for (let k = 0; k < 14 && out.length < 3; k++) {
                          const d = addDaysStr(todayDateStr(), k);
                          const g = getFreeGaps(d, calCtx, 60, { from: k === 0 ? Math.max(12 * 60, roundUpTo(new Date().getHours() * 60 + new Date().getMinutes() + 30, 15)) : 12 * 60, to: 21 * 60 })[0];
                          if (g) { const st = roundUpTo(g.s, 15); out.push({ label: `${prettyDate(d)} \u2022 ${fromMins(st)}`, date: d, time: fromMins(st) }); }
                        }
                        return out;
                      })().map((slot, idx) => (
                        <button
                          key={idx}
                          onClick={() => {
                            setTasks(prev => [...prev, {
                              id: Date.now(),
                              title: `Catch up with ${nudgeFriend.name}`,
                              duration: 60,
                              status: 'pending',
                              startTime: slot.time,
                              endTime: '20:45',
                              date: slot.date,
                              type: 'social',
                              categoryColor: 'social',
                              location: 'Northern Quarter Cafe',
                              transportMode: 'Metrolink',
                              travelTime: 15,
                              distance: '0.8 mi',
                              leaveByNote: 'Leave 15m prior via Tram',
                              notes: 'Scheduled via Social CRM Nudge',
                              rating: null,
                              reviewNote: '',
                              withPerson: nudgeFriend.name,
                              meetingType: 'Friendly'
                            }]);
                            setSelectedDateStr(slot.date);
                            setShowSocialNudge(false);
                          }}
                          className="p-2 bg-rose-900 hover:bg-white hover:text-rose-900 text-left text-xs transition-colors flex justify-between items-center"
                        >
                          <span>{slot.label}</span>
                          <Plus size={13} />
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {socialNudgeStep === 'dismiss' && (
                  <div className="space-y-2">
                    <div className="text-xs font-medium">Want Pact to remind you about {nudgeFriend.name} at a later date?</div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => { updatePerson(nudgeFriend.id, { snoozeUntil: addDaysStr(todayDateStr(), 7) }); setSocialNudgeStep('initial'); }}
                        className="px-3 py-1.5 bg-white text-rose-900 text-[10px] uppercase tracking-wider font-medium"
                      >
                        Remind Me Next Week
                      </button>
                      <button
                        onClick={() => { updatePerson(nudgeFriend.id, { remindEvery: 0 }); setSocialNudgeStep('initial'); }}
                        className="px-3 py-1.5 bg-rose-950 text-rose-200 text-[10px] uppercase tracking-wider"
                      >
                        Don't Remind Again
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {calendarEvents.filter(c => c.date === selectedDateStr).length > 0 && (
              <div className="p-3 bg-white border border-stone-200 space-y-1.5">
                <span className="text-[10px] uppercase tracking-widest text-blue-800 font-medium">From your synced calendars</span>
                {calendarEvents.filter(c => c.date === selectedDateStr).sort((x, y) => x.start.localeCompare(y.start)).map(c => (
                  <div key={c.id} className="flex justify-between gap-3 text-xs">
                    <span className="font-mono text-stone-500 shrink-0">{c.allDay ? 'All day' : `${c.start}–${c.end === '24:00' ? '00:00' : c.end}`}</span>
                    <span className="text-slate-800 text-right">{c.title}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Listings: your day first; friends' columns only when they chose to share */}
            {(() => {
              const nowM0 = new Date().getHours() * 60 + new Date().getMinutes();
              const mineBlocks = filteredTasks.filter(t => t.startTime && t.endTime).map(t => { const e = Math.max(toMins(t.startTime) + 15, toMins(t.endTime)); const dn = t.status === 'completed' || t.status === 'done'; return { id: t.id, s: toMins(t.startTime), e, t: t.title, loc: t.location && t.location !== t.title ? t.location : '', done: dn, past: dn || selectedDateStr < todayDateStr() || (selectedDateStr === todayDateStr() && e <= nowM0) }; });
              const friendCols = pactFriends.map(f => {
                const sh = schedShared.find(x => x.owner_id === f.userId);
                const ok = !!sh && selectedDateStr <= sh.until;
                const blocks = ok ? (sh.blocks || []).filter(b => b.d === selectedDateStr).map(b => ({ s: toMins(b.s), e: Math.max(toMins(b.s) + 15, toMins(b.e)), t: b.t || 'Busy' })) : [];
                return { id: f.userId, name: f.name, ok, until: sh && sh.until, titles: sh && sh.titles, blocks };
              });
              const nowM = selectedDateStr === todayDateStr() ? new Date().getHours() * 60 + new Date().getMinutes() : null;
              return (<>
                <ScheduleListings date={selectedDateStr} mine={mineBlocks} friends={friendCols} matching={matching} canMatch={!!(authUser && authUser.cloud) && pactFriends.length > 0}
                  onToggleMatch={() => { setMatching(m => !m); loadSched(); }} onShare={() => setSharePanel(true)} nowMin={nowM} isToday={selectedDateStr === todayDateStr()}
                  onTapTask={(id) => setSheetTaskId(id)}
                  onSlot={(m, e2) => { const t = fromMins(m); setEventConfig(c => ({ ...c, date: selectedDateStr, startTime: t, slotPicked: true, duration: Math.max(15, (e2 || m + 60) - m) })); setTaskConfig(c => ({ ...c, date: selectedDateStr, startTime: t })); setPlannerMode('event'); setPlannerResultsStep(false); setPlannerOpen(true); }}
                  onAdd={() => { setPlannerMode('event'); setPlannerResultsStep(false); setPlannerOpen(true); }} />
                {sharePanel && <ShareSchedulePanel friends={pactFriends} grants={schedGrants} onSet={setScheduleShare} onClose={() => setSharePanel(false)} />}
              </>);
            })()}

            {/* Plan details and editing: opens when you tap a block in the listings */}
            {sheetTaskId != null && filteredTasks.some(t => t.id === sheetTaskId) && <Portal>
            <div data-task-sheet className="fixed inset-0 z-[300] bg-black/40 flex items-end justify-center" onClick={() => setSheetTaskId(null)}>
             <div className="np-skin w-full max-w-[560px] max-h-[88vh] overflow-y-auto bg-[#F4EFE4] border-t-[3px] border-double border-[#1B2A22] p-3 space-y-3" onClick={e => e.stopPropagation()}>
              <button data-task-sheet-close onClick={() => setSheetTaskId(null)} className="text-[10px] uppercase tracking-[0.14em] font-medium text-[#1B2A22] flex items-center gap-1"><X size={13} /> Close</button>
              {filteredTasks.filter(t => t.id === sheetTaskId).map(task => {
                const isExpanded = true;
                const borderColor = getCategoryColorHex(task.categoryColor);
                return (
                  <div
                    key={task.id}
                    data-task-card={task.id}
                    className="bg-white border border-stone-200 shadow-sm transition-all"
                    style={{ borderLeftWidth: '5px', borderLeftColor: borderColor }}
                  >
                    <div
                      className="p-3.5 flex justify-between items-start"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono font-medium text-purple-900">
                            {task.startTime} – {task.endTime}
                          </span>
                          <span className="text-[10px] px-2 py-0.5 bg-[#FAF8F5] border border-stone-300 uppercase tracking-wider">
                            {task.duration}m
                          </span>
                          {task.withPerson && (
                            <span className="text-[10px] px-2 py-0.5 bg-rose-700 text-white uppercase tracking-wider">
                              w/ {task.withPerson} ({task.meetingType})
                            </span>
                          )}
                        </div>
                        <h4 className={`text-sm font-medium ${task.status === 'completed' ? 'line-through text-stone-400' : 'text-slate-900'}`}>
                          {task.title}
                        </h4>
                        <div className="flex items-center gap-2 text-[11px] text-stone-500">
                          <MapPin size={12} className="text-purple-800 shrink-0" />
                          <span>{task.location} ({task.distance})</span>
                        </div>
                        <div className="text-[11px] text-blue-900 bg-blue-50 px-2 py-1 border-l-2 border-blue-800">
                          {task.leaveByNote} ({task.transportMode})
                        </div>
                      </div>

                      {task.status !== 'completed' ? (
                        <button
                          onClick={e => {
                            e.stopPropagation();
                            handleCompleteTaskWithClockCheck(task);
                          }}
                          className="px-2.5 py-1 bg-purple-800 hover:bg-purple-900 text-white text-[10px] uppercase tracking-wider font-medium shrink-0"
                        >
                          Finish
                        </button>
                      ) : (
                        <span className="px-2 py-0.5 bg-blue-800 text-white text-[10px] uppercase tracking-wider">Done</span>
                      )}
                    </div>

                    {isExpanded && (
                      <div className="px-3.5 pb-3.5 pt-2 border-t border-stone-200 bg-[#FAF8F5] space-y-3">
                        {/* Notes & Shopping List */}
                        <div>
                          <label className="text-[10px] uppercase tracking-widest text-stone-500 block mb-1">
                            Activity Notes / Shopping List
                          </label>
                          <textarea
                            rows={2}
                            value={task.notes}
                            onChange={e => setTasks(tasks.map(t => t.id === task.id ? { ...t, notes: e.target.value } : t))}
                            placeholder="Write your shopping list, packing notes, or study agenda here..."
                            className="w-full bg-white border border-stone-300 p-2 text-xs outline-none"
                          />
                        </div>

                        {/* Add Person & Business vs Friendly Toggle */}
                        <div className="flex items-center justify-between gap-2">
                          <input
                            type="text"
                            placeholder="Tag a friend by name..."
                            value={task.withPerson || ''}
                            onChange={e => setTasks(tasks.map(t => t.id === task.id ? { ...t, withPerson: e.target.value } : t))}
                            className="flex-1 bg-white border border-stone-300 px-2 py-1 text-xs"
                          />
                          <div className="flex border border-stone-300">
                            {['Friendly', 'Business'].map(mType => (
                              <button
                                key={mType}
                                onClick={() => setTasks(tasks.map(t => t.id === task.id ? { ...t, meetingType: mType } : t))}
                                className={`px-2.5 py-1 text-[10px] uppercase tracking-wider font-medium ${
                                  task.meetingType === mType ? 'bg-purple-800 text-white' : 'bg-white text-slate-700'
                                }`}
                              >
                                {mType}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Change this plan / invite friends */}
                        <div data-task-manage className="space-y-2">
                          {!(taskEdit && taskEdit.id === task.id) ? (
                            <div className="flex flex-wrap gap-1.5">
                              <button data-task-change onClick={() => setTaskEdit({ id: task.id, title: task.title, date: task.date, start: task.startTime, end: task.endTime, location: task.location || '' })} className="px-2.5 py-1 border border-stone-400 text-[10px] uppercase tracking-wider font-medium">Change plan</button>
                              <button data-task-invite onClick={() => { setTaskInviteId(taskInviteId === task.id ? null : task.id); setInviteSel([]); setInviteNote(''); }} className="px-2.5 py-1 border border-stone-400 text-[10px] uppercase tracking-wider font-medium">{task.sharedId ? 'Invite more friends' : 'Invite friends'}</button>
                              <button data-task-private aria-pressed={!!task.hideFromFriends} onClick={() => setTasks(prev => prev.map(x => x.id === task.id ? { ...x, hideFromFriends: !x.hideFromFriends } : x))} className={`px-2.5 py-1 border text-[10px] uppercase tracking-wider font-medium ${task.hideFromFriends ? 'bg-slate-900 text-white border-slate-900' : 'border-stone-400'}`}>{task.hideFromFriends ? 'Private (hidden)' : 'Mark private'}</button>
                              {delAsk !== task.id ? (
                                <button data-task-delete onClick={() => setDelAsk(task.id)} className="px-2.5 py-1 border border-rose-700 text-rose-700 text-[10px] uppercase tracking-wider font-medium">Delete plan</button>
                              ) : (
                                <span data-task-delete-confirm className="flex flex-wrap items-center gap-1.5 w-full p-2 border border-rose-700 bg-white">
                                  <span className="text-[10px] text-slate-800 w-full">{task.sharedId && task.sharedRole === 'owner' ? 'This plan is shared. Delete it for everyone, or just remove it from your schedule?' : task.sharedId ? 'Remove this plan and decline it?' : 'Delete this plan?'}</span>
                                  {task.sharedId && task.sharedRole === 'owner' ? (<>
                                    <button data-task-delete-all onClick={() => deletePlan(task, true)} className="px-2.5 py-1 bg-rose-700 text-white text-[10px] uppercase tracking-wider">Delete for everyone</button>
                                    <button data-task-delete-mine onClick={() => deletePlan(task, false)} className="px-2.5 py-1 border border-rose-700 text-rose-700 text-[10px] uppercase tracking-wider">Just mine</button>
                                  </>) : <button data-task-delete-yes onClick={() => deletePlan(task, false)} className="px-2.5 py-1 bg-rose-700 text-white text-[10px] uppercase tracking-wider">Yes, delete</button>}
                                  <button data-task-delete-no onClick={() => setDelAsk(null)} className="px-2.5 py-1 border border-stone-400 text-[10px] uppercase tracking-wider">Keep it</button>
                                </span>
                              )}
                              {task.sharedId && <span className="text-[10px] text-purple-800 self-center">Shared plan{task.sharedRole === 'owner' ? ': changes you make update for everyone' : ': organised by someone else'}</span>}
                            </div>
                          ) : (
                            <div data-task-edit-form className="p-2.5 bg-white border border-stone-200 space-y-1.5">
                              {task.sharedId && task.sharedRole !== 'owner' && <p className="text-[10px] text-rose-700">This plan belongs to someone else, so a change here only affects the copy on your schedule until they update it.</p>}
                              <input type="text" aria-label="Plan title" value={taskEdit.title} onChange={e => setTaskEdit({ ...taskEdit, title: e.target.value })} className="w-full bg-[#FAF8F5] border border-stone-300 px-2 py-1.5 text-xs" />
                              <div className="grid grid-cols-3 gap-1.5">
                                <input type="date" aria-label="Plan date" value={taskEdit.date} onChange={e => setTaskEdit({ ...taskEdit, date: e.target.value })} className="min-w-0 bg-[#FAF8F5] border border-stone-300 px-1.5 py-1.5 text-xs" />
                                <input type="time" aria-label="Plan start" value={taskEdit.start} onChange={e => setTaskEdit({ ...taskEdit, start: e.target.value })} className="min-w-0 bg-[#FAF8F5] border border-stone-300 px-1.5 py-1.5 text-xs" />
                                <input type="time" aria-label="Plan end" value={taskEdit.end} onChange={e => setTaskEdit({ ...taskEdit, end: e.target.value })} className="min-w-0 bg-[#FAF8F5] border border-stone-300 px-1.5 py-1.5 text-xs" />
                              </div>
                              <input type="text" aria-label="Plan location" placeholder="Location" value={taskEdit.location} onChange={e => setTaskEdit({ ...taskEdit, location: e.target.value })} className="w-full bg-[#FAF8F5] border border-stone-300 px-2 py-1.5 text-xs" />
                              <div className="flex gap-1.5">
                                <button data-task-save onClick={() => {
                                  const ed = taskEdit; if (!ed.title.trim() || !ed.date || !ed.start) { pushToast('A plan needs a title, a date and a start time.', 'info'); return; }
                                  const end = ed.end && toMins(ed.end) > toMins(ed.start) ? ed.end : fromMins(toMins(ed.start) + (task.duration || 60));
                                  setTasks(prev => prev.map(x => x.id === task.id ? { ...x, title: ed.title.trim(), date: ed.date, startTime: ed.start, endTime: end, duration: Math.max(15, toMins(end) - toMins(ed.start)), location: ed.location.trim() } : x));
                                  if (ed.date !== selectedDateStr) setSelectedDateStr(ed.date);
                                  pushToast(task.sharedId && task.sharedRole === 'owner' ? 'Plan changed. Your friends will be told.' : 'Plan changed.', 'success');
                                  setTaskEdit(null);
                                }} className="px-2.5 py-1 bg-purple-800 text-white text-[10px] uppercase tracking-wider">Save changes</button>
                                <button onClick={() => setTaskEdit(null)} className="px-2.5 py-1 border border-stone-400 text-[10px] uppercase tracking-wider">Back</button>
                              </div>
                            </div>
                          )}
                          {taskInviteId === task.id && (
                            <div data-task-invite-panel className="p-2.5 bg-white border border-stone-200 space-y-2">
                              {task.sharedId && task.sharedRole !== 'owner' ? <p className="text-[10px] text-stone-600">Only the person who made this plan can invite more people.</p>
                              : pactFriends.length === 0 ? <p className="text-[10px] text-stone-600">Add friends on Pact first (Social tab, Friend Book), then you can invite them here. Or use the Social tab to send a link to someone who isn't on Pact yet.</p>
                              : (<>
                                <div className="flex flex-wrap gap-1.5">
                                  {pactFriends.map(f => (
                                    <button key={f.userId} data-task-invite-friend={f.userId} aria-pressed={inviteSel.includes(f.userId)} onClick={() => setInviteSel(prev => prev.includes(f.userId) ? prev.filter(x => x !== f.userId) : [...prev, f.userId])} className={`px-2.5 py-1 text-[10px] border ${inviteSel.includes(f.userId) ? 'bg-purple-800 text-white border-purple-800' : 'bg-[#FAF8F5] border-stone-300'}`}>{f.name}</button>
                                  ))}
                                </div>
                                <input type="text" aria-label="Add a note (optional)" placeholder="Add a note (optional)" value={inviteNote} onChange={e => setInviteNote(e.target.value)} className="w-full bg-[#FAF8F5] border border-stone-300 px-2 py-1.5 text-xs" />
                                <button data-task-invite-send onClick={async () => { await sendPactInvite(task.id); setTaskInviteId(null); }} disabled={inviteBusy || inviteSel.length === 0} className="px-3 py-1.5 bg-rose-700 text-white text-[10px] uppercase tracking-wider disabled:opacity-50">Send invite</button>
                              </>)}
                            </div>
                          )}
                        </div>

                        {/* Rate Activity to Train Ideas Feed */}
                        <div className="p-2.5 bg-white border border-stone-200 space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-[10px] uppercase tracking-wider text-purple-900 font-medium">
                              Rate Activity (Trains Ideas Feed)
                            </span>
                            <div className="flex gap-1">
                              {[1, 2, 3, 4, 5].map(st => (
                                <button
                                  key={st}
                                  onClick={() => {
                                    setTasks(tasks.map(t => t.id === task.id ? { ...t, rating: st } : t));
                                    setUserPreferenceBoost(`Rated "${task.title}" ${st}/5 stars — Ideas feed recalibrated!`);
                                  }}
                                  className={task.rating >= st ? 'text-rose-600' : 'text-stone-300'}
                                >
                                  <Star size={14} fill={task.rating >= st ? 'currentColor' : 'none'} />
                                </button>
                              ))}
                            </div>
                          </div>
                          <input
                            type="text"
                            placeholder="What did or didn't you like about this activity?"
                            value={task.reviewNote}
                            onChange={e => setTasks(tasks.map(t => t.id === task.id ? { ...t, reviewNote: e.target.value } : t))}
                            className="w-full bg-[#FAF8F5] border border-stone-200 px-2 py-1 text-xs"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
             </div>
            </div></Portal>}
          </div>
        )}

        {/* =========================================================
            TAB 3: PLAN (COLOR-CODED CALENDAR & COLOR WHEEL CREATOR)
           ========================================================= */}
        {activeTab === 'schedule' && (
          <div className="space-y-4 animate-in fade-in duration-300">
            <div className="p-4 bg-white border border-stone-200 space-y-3">
              <button data-colors-toggle aria-expanded={colorsOpen} onClick={() => setColorsOpen(o => !o)} className="w-full flex justify-between items-center text-left">
                <div>
                  <span className="text-[10px] uppercase tracking-widest text-purple-800 font-medium">Categories</span>
                  <h3 className="font-editorial text-base font-normal text-slate-900">Activity colours</h3>
                </div>
                <span className="flex items-center gap-2">
                  {!colorsOpen && <span className="flex gap-1">{customCategories.slice(0, 5).map(cat => <span key={cat.id} className="w-3 h-3 inline-block" style={{ backgroundColor: cat.color }} />)}</span>}
                  <span className="text-[10px] uppercase tracking-widest text-slate-600">{colorsOpen ? 'Hide ▴' : 'Edit ▾'}</span>
                </span>
              </button>
              {colorsOpen && <>

              <div className="flex flex-wrap gap-2">
                {customCategories.map(cat => (
                  <div key={cat.id} className="flex items-center gap-1.5 px-2.5 py-1 bg-[#FAF8F5] border border-stone-300 text-xs">
                    <span className="w-3 h-3 inline-block" style={{ backgroundColor: cat.color }} />
                    <span>{cat.name}</span>
                  </div>
                ))}
              </div>

              <div className="flex gap-2 pt-1">
                <input
                  type="color"
                  value={newCategoryColor}
                  onChange={e => setNewCategoryColor(e.target.value)}
                  className="w-9 h-8 border border-stone-300 bg-white cursor-pointer"
                  title="Pick category color"
                />
                <input
                  type="text"
                  placeholder="New category name (e.g., Creative Arts)..."
                  value={newCategoryName}
                  onChange={e => setNewCategoryName(e.target.value)}
                  className="flex-1 bg-[#FAF8F5] border border-stone-300 px-2.5 py-1 text-xs"
                />
                <button
                  onClick={() => {
                    if (!newCategoryName.trim()) return;
                    setCustomCategories(prev => [...prev, { id: `cat_${Date.now()}`, name: newCategoryName, color: newCategoryColor }]);
                    setNewCategoryName('');
                  }}
                  className="px-3 py-1 bg-purple-800 text-white text-[10px] uppercase tracking-wider font-medium"
                >
                  + Add
                </button>
              </div>
              </>}
            </div>
          </div>
        )}

        {/* =========================================================
            TAB 4: IDEAS (CURATED DISCOVERY, DEALS & TARGET QUOTA)
           ========================================================= */}
        {activeTab === 'ideas' && (
          <div className="np-skin flex flex-col gap-4 animate-in fade-in duration-300">
            {(hasSit(userProfile, 'study') || userProfile.budget) && <div style={{ order: -30 }}><BudgetCard profile={userProfile} patch={patchProfile} filter={budgetFilter} setFilter={setBudgetFilter} /></div>}

            {/* Unfilled Weekly Target Nudge Banner */}
            {false && weeklyTargets.some(t => t.current < t.target) && (
              <div style={{ order: 40 }} className="p-3.5 bg-blue-900 text-white flex justify-between items-center">
                <div>
                  <span className="text-[10px] uppercase tracking-widest text-rose-300 font-medium">Weekly Target Quota</span>
                  <p className="text-xs mt-0.5">
                    Hey! You still need <strong>1 more Outdoor activity</strong> to hit your weekly target (2/3 planned).
                  </p>
                </div>
                <button
                  onClick={() => { setSelectedIdeaCategory('Outdoor'); }}
                  className="px-2.5 py-1.5 bg-rose-700 text-white text-[10px] uppercase tracking-wider font-medium shrink-0"
                >
                  View Outdoor
                </button>
              </div>
            )}

            {userPreferenceBoost && (
              <div className="p-2.5 bg-purple-900 text-white text-xs flex justify-between items-center">
                <span>{userPreferenceBoost}</span>
                <button onClick={() => setUserPreferenceBoost(null)}><X size={13} /></button>
              </div>
            )}

            {(ideaSearchOpen || ideaSearchRes) && (
            <div data-ideas-search className="flex gap-1.5">
              <input data-ideas-search-input type="search" aria-label="Search places and ideas" placeholder={`Search ${loc.city}, e.g. sushi, climbing, bookshop`} value={ideaSearch} onChange={e => { setIdeaSearch(e.target.value); if (!e.target.value.trim()) setIdeaSearchRes(null); }} onKeyDown={e => { if (e.key === 'Enter') runIdeaSearch(); }} className="flex-1 min-w-0 bg-white border border-stone-300 px-3 py-2 text-xs" />
              <button data-ideas-search-go onClick={runIdeaSearch} disabled={!ideaSearch.trim() || (ideaSearchRes && ideaSearchRes.busy)} className="px-3.5 bg-purple-900 text-white text-[10px] uppercase tracking-wider font-medium disabled:opacity-50">Search</button>
            </div>
            )}
            {(() => {
              const items = ideaSearchRes ? ideaSearchRes.items : showFavs ? favourites : adventurousMode ? adventurePicks : ideaListAll.slice(0, ideaShown);
              return (
                <IdeasFront items={items} cat={selectedIdeaCategory} cats={ideaCategories} savedCount={favourites.length} showFavs={showFavs}
                  onFavs={() => { setShowFavs(!showFavs); setAdventurousMode(false); setIdeaSearchRes(null); }}
                  onCat={(c) => { setShowFavs(false); setIdeaSearchRes(null); setIdeaSearch(''); setAdventurousMode(false); setSelectedIdeaCategory(c); }}
                  onSearch={() => setIdeaSearchOpen(o => !o)}
                  onOpen={(it) => setIdeaOpenId(it.id)} onAdd={addIdeaToPlan} onFav={toggleFav} isFav={isFav}
                  adventure={adventurousMode} onSurprise={() => { setShowFavs(false); setIdeaSearchRes(null); setAdventurousMode(true); shuffleAdventure(); }} onBack={() => setAdventurousMode(false)}
                  filters={{ toggle: () => setIdeaFiltersOpen(o => !o), label: activeFilterLabels.length ? 'Filter (' + activeFilterLabels.length + ')' : 'Filter', panel: ideaFiltersOpen ? (
              <div data-idea-filters className="flex flex-wrap gap-1.5 py-2">
                {(ideaSubFilterOptions[selectedIdeaCategory] || []).map(sub => (
                  <button key={sub} data-idea-filter={sub} aria-pressed={activeFilterLabels.includes(sub)} onClick={() => toggleIdeaFilter(sub)}
                    style={{ borderRadius: 0 }} className={`px-2 py-1 text-[11px] border ${activeFilterLabels.includes(sub) ? 'bg-[#1F3A2E] text-[#F4EFE4] border-[#1F3A2E]' : 'border-[#1B2A22]/50 text-[#1B2A22]'}`}>{sub}</button>
                ))}
                {activeFilterLabels.length > 0 && <button data-idea-filter-clear onClick={() => setActiveFilterLabels([])} style={{ borderRadius: 0 }} className="px-2 py-1 text-[11px] border border-[#C8643C] text-[#C8643C]">&times; Clear</button>}
              </div>
                  ) : null }}
                  more={(!showFavs && !ideaSearchRes && !adventurousMode) ? <button data-ideas-more onClick={seeMoreIdeas} disabled={isSearchingLiveIdeas} style={{ display: 'block', width: '100%', textAlign: 'center', margin: '14px 0 4px', fontSize: 10, letterSpacing: '.16em', textTransform: 'uppercase', background: 'none', border: 0, color: '#1B2A22' }}>{isSearchingLiveIdeas ? 'Finding more...' : 'Tap for more \u2014 continued \u2304'}</button> : null} />
              );
            })()}

            {/* Filtered Ideas Cards: lead story, then a two-column front page of picture cards */}
            <div className="space-y-3">
              {!showFavs && !ideaSearchRes && !adventurousMode && !ideasFeed.some(i => i.category === selectedIdeaCategory && String(i.city || 'Manchester').toLowerCase() === loc.city.toLowerCase()) && (
                <div data-ideas-empty className="p-4 bg-white border border-stone-200 text-xs text-stone-600 leading-relaxed">No {selectedIdeaCategory.toLowerCase()} ideas for {loc.city} yet. Tap "See more" below to find some near you.</div>
              )}
              {!showFavs && !ideaSearchRes && !adventurousMode && activeFilterDefs.length > 0 && ideasFeed.some(i => i.category === selectedIdeaCategory && String(i.city || 'Manchester').toLowerCase() === loc.city.toLowerCase()) && !ideasFeed.some(i => i.category === selectedIdeaCategory && String(i.city || 'Manchester').toLowerCase() === loc.city.toLowerCase() && ideaMatchesFilters(i, activeFilterDefs)) && (
                <div data-ideas-nomatch className="p-4 bg-white border border-stone-200 text-xs text-stone-600 leading-relaxed">Nothing saved here matches {activeFilterLabels.join(' / ')} yet. Tap "See more" below to find some near {loc.city}, or clear the filters.</div>
              )}
              {showFavs && favourites.length === 0 && (
                <div data-fav-empty className="p-4 bg-white border border-stone-200 text-xs text-stone-600 leading-relaxed">Nothing saved yet. Tap the heart on any idea to keep it here.</div>
              )}
              {ideaNotice && !adventurousMode && (
                <div className="p-2.5 bg-[#EDEAE0] border-l-4 border-purple-900 text-[11px] text-slate-800">{ideaNotice}</div>
              )}
              {adventurousMode && (
                <div className="p-3 bg-rose-700 text-white flex items-center justify-between gap-2">
                  <div className="text-xs leading-snug">
                    <span className="text-[10px] uppercase tracking-widest text-rose-200 font-medium block">Feeling Adventurous</span>
                    {`3 less-obvious ${activeFilterLabels.length ? activeFilterLabels.join(' / ').toLowerCase() : selectedIdeaCategory.toLowerCase()} picks near ${loc.city}, away from the usual favourites.`}
                  </div>
                  <button
                    onClick={shuffleAdventure}
                    className="shrink-0 px-2.5 py-1.5 bg-white text-rose-800 text-[10px] uppercase tracking-wider font-medium flex items-center gap-1"
                  >
                    <Dices size={12} /> {adventureBusy ? 'Finding...' : 'Shuffle 3'}
                  </button>
                </div>
              )}
              {adventurousMode && !adventureBusy && adventurePicks.length === 0 && !loc.isHome && (
                <div className="p-3 bg-[#EDEAE0] text-[11px] text-slate-800">Couldn't find places near {loc.city} right now. Check your connection and tap Shuffle 3.</div>
              )}
              {ideaSearchRes && (
                <div data-ideas-search-head className="flex justify-between items-center text-[11px] text-stone-600">
                  <span>{ideaSearchRes.busy ? 'Searching...' : `${ideaSearchRes.items.length} result${ideaSearchRes.items.length === 1 ? '' : 's'} for "${ideaSearchRes.q}" near ${loc.city}`}</span>
                  <button data-ideas-search-clear onClick={() => { setIdeaSearchRes(null); setIdeaSearch(''); }} className="underline text-purple-800">Clear search</button>
                </div>
              )}
              {ideaSearchRes && !ideaSearchRes.busy && ideaSearchRes.items.length === 0 && <div data-ideas-search-empty className="p-4 bg-white border border-stone-200 text-xs text-stone-600 leading-relaxed">Nothing found for "{ideaSearchRes.q}" near {loc.city}. Try a simpler word, like "pizza" or "gym".</div>}
              {(ideaSearchRes ? ideaSearchRes.items : showFavs ? favourites : adventurousMode ? adventurePicks : ideaListAll).filter(it => it.id === ideaOpenId).map((idea, idx) => (
                <Portal key={'sheet' + idea.id}><div data-idea-sheet className="fixed inset-0 z-[300] bg-black/40 flex items-end justify-center" onClick={() => setIdeaOpenId(null)}>
                 <div className="w-full max-w-[560px] max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                  <div
                    key={idea.id}
                    data-idea-full
                    className={`${idx === 0 ? '' : ''} border space-y-2.5 overflow-hidden ${
                      idea.category === 'Trips' ? 'bg-slate-900 text-white border-slate-800' : 'bg-white text-slate-900 border-stone-200'
                    }`}
                  >
                    <IdeaPic idea={idea} tall />
                    <div className="p-4 space-y-2.5">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className={`text-[10px] uppercase tracking-widest font-medium ${idea.category === 'Trips' ? 'text-rose-300' : 'text-purple-800'}`}>
                          {idea.sub1} • {idea.distance}{ideaFresh.includes(idea.id) && <span className="ml-1.5 px-1.5 py-px bg-rose-700 text-white text-[9px] tracking-wider">NEW</span>}
                        </span>
                        <h4 className="font-editorial text-base font-normal mt-0.5">{idea.title}</h4>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <button data-fav-heart aria-label={isFav(idea) ? `Remove ${idea.title} from favourites` : `Save ${idea.title} to favourites`} aria-pressed={isFav(idea)} onClick={() => toggleFav(idea)} className={isFav(idea) ? 'text-rose-600' : (idea.category === 'Trips' ? 'text-stone-300' : 'text-stone-400')}>
                          <Heart size={16} fill={isFav(idea) ? 'currentColor' : 'none'} />
                        </button>
                        {idea.price ? <span className="text-xs font-mono px-2 py-0.5 bg-purple-800 text-white">{idea.price}</span> : null}
                        {idea.rating ? <span className="text-xs font-medium flex items-center gap-0.5 text-rose-600">
                          <Star size={12} fill="currentColor" /> {idea.rating}
                        </span> : null}
                      </div>
                    </div>

                    <p className={`text-xs leading-relaxed ${idea.category === 'Trips' ? 'text-stone-300' : 'text-stone-600'}`}>
                      {idea.desc}
                    </p>

                    <div className="px-2.5 py-1 bg-rose-700 text-white text-[10px] uppercase tracking-wider inline-block font-medium">
                      {idea.sub2 === 'OpenStreetMap' ? 'From OpenStreetMap' : 'Example pick. Check prices and offers with the venue'}
                    </div>

                    {(idea.lat != null || idea.link) && (
                      <div className="flex flex-wrap gap-1.5">
                        {idea.lat != null && <a href={mapsDir(idea.lat, idea.lon)} target="_blank" rel="noopener noreferrer" className={`px-2.5 py-1 border text-[10px] uppercase tracking-wider font-medium inline-flex items-center gap-1 ${idea.category === 'Trips' ? 'border-stone-400 text-white' : 'border-blue-800 text-blue-800'}`}><MapPin size={11} /> Directions</a>}
                        {idea.link && <a href={idea.link} target="_blank" rel="noopener noreferrer" className={`px-2.5 py-1 border text-[10px] uppercase tracking-wider font-medium inline-flex items-center gap-1 ${idea.category === 'Trips' ? 'border-stone-400 text-white' : 'border-blue-800 text-blue-800'}`}><ExternalLink size={11} /> Website</a>}
                      </div>
                    )}

                    {(idea.category === 'Trips' || idea.category === 'Adventure') && (
                      <div className="flex flex-wrap gap-1.5">
                        {getBookingLinks(idea, loc.city).map(l => (
                          <a
                            key={l.label}
                            href={l.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`px-2.5 py-1 border text-[10px] uppercase tracking-wider font-medium inline-flex items-center gap-1 ${
                              idea.category === 'Trips' ? 'border-stone-400 text-white hover:bg-white/10' : 'border-blue-800 text-blue-800 hover:bg-blue-50'
                            }`}
                          >
                            <ExternalLink size={11} /> {l.label}
                          </a>
                        ))}
                      </div>
                    )}

                    <div className="flex justify-between items-center pt-2 border-t border-stone-200/30">
                      <div className="flex items-center gap-1">
                        <span className="text-[10px] uppercase tracking-wider opacity-75 mr-1">Your Rating:</span>
                        {[1, 2, 3, 4, 5].map(st => (
                          <button
                            key={st}
                            onClick={() => {
                              if (idea.placeId && cloud.enabled) cloud.ratePlace(idea.placeId, st);
                              setIdeasFeed(ideasFeed.map(it => it.id === idea.id ? { ...it, userRating: st } : it));
                              setAdventurePicks(prev => prev.map(it => it.id === idea.id ? { ...it, userRating: st } : it));
                              setFavourites(prev => prev.map(it => favKey(it) === favKey(idea) ? { ...it, userRating: st } : it));
                              setUserPreferenceBoost(`Saved ${st}★ rating for ${idea.title}! Prioritizing similar ${idea.sub1} spots.`);
                            }}
                            className={idea.userRating >= st ? 'text-rose-500' : 'text-stone-400'}
                          >
                            <Star size={13} fill={idea.userRating >= st ? 'currentColor' : 'none'} />
                          </button>
                        ))}
                      </div>

                      <button
                        onClick={() => addIdeaToPlan(idea)}
                        className="px-3 py-1 bg-blue-800 hover:bg-blue-700 text-white text-[10px] uppercase tracking-wider font-medium"
                      >
                        + Schedule
                      </button>
                    </div>
                    <button data-idea-collapse onClick={() => setIdeaOpenId(null)} className="text-[10px] uppercase tracking-wider underline opacity-70">Close</button>
                    </div>
                  </div>
                 </div>
                </div></Portal>
              ))}

            </div>
          </div>
        )}

        {/* =========================================================
            TAB 5: SKILLS (LIVING BRANCHING SVG TREE OF LIFE)
           ========================================================= */}
        {activeTab === 'skills' && (
          <div className="np-skin flex flex-col gap-4 animate-in fade-in duration-300">

            <div className="hidden">
              <div>
                <span className="text-[10px] uppercase tracking-widest text-purple-800 font-medium">Development</span>
                <h3 className="font-editorial text-lg font-normal">Grow the skills you care about</h3>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {[
                  ['1', 'Pick a list', 'Work or Personal, grouped by area like Data or Art.'],
                  ['2', 'Open a skill', 'Tap a skill in the list to read it as chapters.'],
                  ['3', 'Tick chapters off', 'Book study time, or learn a skill with a friend.']
                ].map(([n, t, d]) => (
                  <div key={n} className="p-2 bg-white border border-stone-200">
                    <div className="w-5 h-5 bg-purple-900 text-white text-[10px] font-medium flex items-center justify-center">{n}</div>
                    <div className="text-[11px] font-medium text-slate-900 mt-1.5">{t}</div>
                    <div className="text-[10px] text-stone-600 leading-snug mt-0.5">{d}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <div className="hidden">
                <div>
                  <span className="text-[10px] uppercase tracking-widest text-purple-800 font-medium">Your skills</span>
                  <h3 className="font-editorial text-lg font-normal">Your Development map</h3>
                </div>
                <div className="flex border border-stone-300">
                  <button
                    onClick={() => {
                      setSkillTreeDomain('work');
                      setSelectedBranchId('b_data');
                      setSelectedSkillId('s_ml');
                    }}
                    className={`px-3 py-1 text-[10px] uppercase tracking-wider font-medium ${
                      skillTreeDomain === 'work' ? 'bg-blue-800 text-white' : 'bg-white text-slate-700'
                    }`}
                  >
                    Work
                  </button>
                  <button
                    onClick={() => {
                      setSkillTreeDomain('personal');
                      setSelectedBranchId('b_art');
                      setSelectedSkillId('s_sew');
                    }}
                    className={`px-3 py-1 text-[10px] uppercase tracking-wider font-medium ${
                      skillTreeDomain === 'personal' ? 'bg-purple-800 text-white' : 'bg-white text-slate-700'
                    }`}
                  >
                    Personal
                  </button>
                </div>
              </div>

              {/* Interactive SVG Branching Tree Visualization */}
              {!skillOpen && <SkillIndex strip={<DevStrip s={devSummary} current={devSummary.wkStart === mondayOf(todayDateStr())} range={`${shortDate(devSummary.wkStart)} – ${shortDate(devSummary.wkEnd)}`} pd={prettyDate} onPrev={() => setDevWeekStart(addDaysStr(devWeekStart, -7))} onNext={() => setDevWeekStart(addDaysStr(devWeekStart, 7))} nextOff={devWeekStart >= mondayOf(todayDateStr())} onPlan={() => { setPlannerMode('task'); setPlannerResultsStep(false); setPlannerOpen(true); }} />} branches={currentForest.branches} domain={skillTreeDomain}
                onDomain={(d) => { setSkillTreeDomain(d); const b0 = skillForest[d].branches[0]; if (b0) { setSelectedBranchId(b0.id); if (b0.skills[0]) setSelectedSkillId(b0.skills[0].id); } }}
                invites={(buddies || []).filter(v => v.status === 'invited' && !v.is_owner)}
                onOpen={(bid, sid) => { setSelectedBranchId(bid); setSelectedSkillId(sid); setSkillOpen(true); try { document.getElementById('pact-main').scrollTo({ top: 0 }); } catch (e) { /* ignore */ } }}
                onAccept={(v) => respondBuddy(v, true)} onDecline={(v) => respondBuddy(v, false)}
                onPlan={() => { setPlannerMode('task'); setPlannerResultsStep(false); setPlannerOpen(true); }}
                onNew={() => { setShowAddSkillModal(v => !v); setShowAddBranchModal(false); }} />}
              <div data-skill-map className={`${(!skillOpen && (showAddSkillModal || showAddBranchModal)) ? '' : 'hidden'} text-[#1B2A22] relative space-y-2 p-3 border-[1.5px] border-[#1B2A22]`}>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-[10px] uppercase tracking-widest text-[#1F3A2E] font-medium">
                    Tap a skill to open it
                  </span>
                  <div className="flex gap-1.5">
                    <button
                      onClick={() => { setShowAddBranchModal(!showAddBranchModal); setShowAddSkillModal(false); }}
                      className="px-2 py-0.5 bg-[#1F3A2E] text-[#F4EFE4] text-[10px] uppercase tracking-wider"
                    >
                      + New area
                    </button>
                    <button
                      onClick={() => { setShowAddSkillModal(!showAddSkillModal); setShowAddBranchModal(false); }}
                      className="px-2 py-0.5 bg-[#C8643C] text-white text-[10px] uppercase tracking-wider"
                    >
                      + New skill
                    </button>
                  </div>
                </div>

                {showAddBranchModal && (
                  <div className="p-2.5 bg-white border border-[#1B2A22]/50 text-[#1B2A22] space-y-2 mb-2">
                    <div className="text-[10px] uppercase tracking-wider text-[#1F3A2E]">Add a new area (a group of skills)</div>
                    <div className="grid grid-cols-2 gap-1.5">
                      <input
                        type="text"
                        placeholder="Area (e.g. Languages)"
                        value={newBranchName}
                        onChange={e => setNewBranchName(e.target.value)}
                        className="bg-white border border-[#1B2A22]/50 px-2 py-1 text-xs text-[#1B2A22]"
                      />
                      <input
                        type="text"
                        placeholder="First Skill (e.g. Japanese)"
                        value={newBranchFirstSkill}
                        onChange={e => setNewBranchFirstSkill(e.target.value)}
                        className="bg-white border border-[#1B2A22]/50 px-2 py-1 text-xs text-[#1B2A22]"
                      />
                    </div>
                    <button
                      onClick={() => {
                        if (!newBranchName.trim()) return;
                        const existingCount = skillForest[skillTreeDomain].branches.length;
                        const branchX = existingCount % 2 === 0 ? 180 : (existingCount === 1 ? 260 : 95);
                        const branchY = 125;
                        const newBrId = `br_${Date.now()}`;
                        const newSkId = `sk_${Date.now()}`;
                        const firstLeafTitle = newBranchFirstSkill.trim() || `${newBranchName} Basics`;
                        const createdBranch = {
                          id: newBrId,
                          name: newBranchName.trim(),
                          x: branchX,
                          y: branchY,
                          skills: [
                            {
                              id: newSkId,
                              name: firstLeafTitle,
                              goal: `Complete tangible starter project in ${firstLeafTitle}`,
                              timeframe: '4 Weeks',
                              x: Math.max(45, Math.min(315, branchX)),
                              y: 40,
                              steps: [
                                { id: `st_${Date.now()}`, title: `Foundational concepts & first practice in ${firstLeafTitle}`, done: false, comment: '' }
                              ]
                            }
                          ]
                        };
                        setSkillForest(prev => ({
                          ...prev,
                          [skillTreeDomain]: {
                            branches: [...prev[skillTreeDomain].branches, createdBranch]
                          }
                        }));
                        setSelectedBranchId(newBrId);
                        setSelectedSkillId(newSkId);
                        setNewBranchName('');
                        setNewBranchFirstSkill('');
                        setShowAddBranchModal(false);
                      }}
                      className="w-full py-1 bg-[#1F3A2E] text-[#F4EFE4] text-[10px] uppercase tracking-wider font-medium"
                    >
                      Add area
                    </button>
                  </div>
                )}

                {showAddSkillModal && (
                  <div className="flex gap-1.5 mb-2 flex-wrap">
                    <input
                      type="text"
                      placeholder={`New skill in ${activeBranch.name}...`}
                      value={newSkillName}
                      onChange={e => setNewSkillName(e.target.value)}
                      className="flex-1 bg-white border border-[#1B2A22]/50 text-[#1B2A22] px-2 py-1 text-xs text-[#1B2A22]"
                    />
                    <select aria-label="New skill target duration" value={newSkillTimeframe} onChange={e => setNewSkillTimeframe(e.target.value)} className="bg-white border border-[#1B2A22]/50 text-[#1B2A22] px-1.5 py-1 text-xs text-[#1B2A22]">
                      {TARGET_DURATIONS.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                    <button
                      onClick={() => {
                        if (!newSkillName.trim()) return;
                        const newId = `s_${Date.now()}`;
                        setSkillForest(prev => ({
                          ...prev,
                          [skillTreeDomain]: {
                            branches: prev[skillTreeDomain].branches.map(b =>
                              b.id === activeBranch.id
                                ? {
                                    ...b,
                                    skills: [
                                      ...b.skills,
                                      {
                                        id: newId,
                                        name: newSkillName,
                                        goal: `Master fundamentals of ${newSkillName}`,
                                        timeframe: newSkillTimeframe,
                                        x: Math.min(310, b.x + (b.skills.length % 2 === 0 ? -25 : 35)),
                                        y: 35,
                                        steps: [{ id: `st_${Date.now()}`, title: `First foundational module in ${newSkillName}`, done: false, comment: '' }]
                                      }
                                    ]
                                  }
                                : b
                            )
                          }
                        }));
                        setSelectedSkillId(newId);
                        setNewSkillName('');
                        setShowAddSkillModal(false);
                      }}
                      className="px-2.5 py-1 bg-[#1F3A2E] text-[#F4EFE4] text-xs"
                    >
                      Sprout
                    </button>
                  </div>
                )}

              </div>

              {/* Chapters view (a skill opened from the index) */}
              {skillOpen && activeSkill && (
                <SkillChapters skill={activeSkill}
                  skills={currentForest.branches.flatMap(b => b.skills)}
                  onPickSkill={(id) => { if (id === '__all') { setSkillOpen(false); return; } const b = currentForest.branches.find(x => x.skills.some(k => k.id === id)); if (b) { setSelectedBranchId(b.id); setSelectedSkillId(id); } }}
                  onToggle={(st) => patchStep(activeSkill.id, st.id, { done: !st.done, doneDate: st.done ? null : todayDateStr() })}
                  onPlan={() => { setPlannerMode('task'); setPlannerResultsStep(false); setPlannerOpen(true); }}
                  weekText={(() => { const nm = activeSkill.name.toLowerCase(); const ss = (devSummary.sessions || []).filter(t => String(t.title).toLowerCase().includes(nm)); if (!ss.length) return 'No study blocks booked yet'; const avg = Math.round(ss.reduce((a, t) => a + (Number(t.duration) || 0), 0) / ss.length); return `${ss.length} \u00D7 ${avg} min \u00B7 ${ss.filter(t => t.status === 'done').length} done`; })()}
                  buddy={<BuddyPanel skill={activeSkill} friends={pactFriends} entry={(buddies || []).find(v => v.skill.toLowerCase() === activeSkill.name.toLowerCase() && (v.status === 'invited' || v.status === 'active'))}
                    onInvite={(fid, note) => inviteBuddy(activeSkill, fid, note)} onEnd={endBuddy} onRespond={respondBuddy} />} />
              )}

              {/* Selected Skill Leaf Details & Editable Upskilling Plan */}
              {skillOpen && activeSkill && (
                <div className="p-3.5 bg-[#FAF8F5] border border-stone-300 space-y-3">
                  <div className="space-y-2">
                    <span className="text-[10px] uppercase tracking-widest text-blue-800 font-medium">Edit this area and skill</span>
                    <div className="grid grid-cols-2 gap-2">
                      <label className="text-[10px] uppercase tracking-wider text-stone-500 space-y-1 block">
                        Area name
                        <input type="text" aria-label="Area name" value={activeBranch.name} onChange={e => patchBranch(activeBranch.id, { name: e.target.value })} className="w-full bg-white border border-stone-300 px-2 py-1.5 text-xs font-medium text-slate-900 normal-case tracking-normal" />
                      </label>
                      <label className="text-[10px] uppercase tracking-wider text-stone-500 space-y-1 block">
                        Skill name
                        <input type="text" aria-label="Skill name" value={activeSkill.name} onChange={e => editSkillMeta(activeSkill, { name: e.target.value })} className="w-full bg-white border border-stone-300 px-2 py-1.5 text-xs font-medium text-slate-900 normal-case tracking-normal" />
                      </label>
                    </div>
                    <label className="text-[10px] uppercase tracking-wider text-stone-500 space-y-1 block">
                      Target duration for this skill
                      <select aria-label="Skill target duration" value={activeSkill.timeframe} onChange={e => editSkillMeta(activeSkill, { timeframe: e.target.value })} className="w-full bg-white border border-stone-300 px-2 py-1.5 text-xs text-slate-900 normal-case tracking-normal">
                        {[...(TARGET_DURATIONS.includes(activeSkill.timeframe) ? [] : [activeSkill.timeframe]), ...TARGET_DURATIONS].map(d => <option key={d} value={d}>{d}</option>)}
                      </select>
                    </label>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] uppercase tracking-wider text-stone-500">What you're building (your goal)</label>
                    <input
                      type="text"
                      value={activeSkill.goal}
                      aria-label="Skill goal"
                      onChange={e => editSkillMeta(activeSkill, { goal: e.target.value })}
                      className="w-full bg-white border border-stone-300 px-2.5 py-1.5 text-xs font-medium"
                    />
                  </div>

                  {(() => {
                    const sig = skillSig(activeSkill);
                    const changed = !!activeSkill.suggestSig && activeSkill.suggestSig !== sig;
                    const sg = skillSuggest.skillId === activeSkill.id ? skillSuggest : null;
                    const have = new Set(activeSkill.steps.map(x => x.title.trim().toLowerCase()));
                    return (
                      <div data-suggest-panel className={`p-2.5 border space-y-2 ${changed ? 'border-purple-700 bg-purple-50' : 'border-stone-300 bg-white'}`}>
                        <div className="flex items-center justify-between gap-2 flex-wrap">
                          <p className="text-[11px] text-stone-700 leading-snug flex-1 min-w-[160px]">{changed ? 'You changed this skill. Refresh the suggested milestones to match.' : 'Get milestone ideas that fit this skill, goal and timeframe.'}</p>
                          <button data-suggest-update disabled={skillSuggest.busy} onClick={() => updateSuggestions(activeSkill)} className={`px-3 py-1.5 text-[10px] uppercase tracking-wider font-medium ${changed ? 'bg-purple-900 text-white' : 'bg-slate-900 text-white'}`}>{skillSuggest.busy && sg ? 'Updating...' : 'Update suggestions'}</button>
                        </div>
                        {sg && sg.items && (
                          <div className="space-y-1.5">
                            <p className="text-[10px] text-stone-500">{sg.source.startsWith('plan:') ? `Built from the Pact ${sg.source.slice(5)} learning plan, with steps specific to this skill.` : sg.source === 'ai' ? 'Written by Roamie for this skill.' : 'No ready-made plan for this skill yet, so these are general steps. Edit them to fit.'} Your finished milestones are never touched.</p>
                            {sg.items.map((it, k) => (
                              <div key={k} data-suggestion className="flex items-center gap-2 bg-[#FAF8F5] border border-stone-200 px-2 py-1">
                                <span className="flex-1 text-[11px] leading-snug">{it.title}{it.target ? <span className="text-stone-500"> · {it.target}</span> : null}</span>
                                {have.has(it.title.trim().toLowerCase()) ? <span className="text-[10px] text-stone-400">Added</span> : <button onClick={() => addSuggestion(activeSkill, it)} className="px-2 py-0.5 border border-stone-300 text-[10px] uppercase tracking-wider">Add</button>}
                              </div>
                            ))}
                            <div className="flex gap-2 flex-wrap pt-1">
                              <button data-suggest-add-all onClick={() => addAllSuggestions(activeSkill, sg.items, false)} className="px-2.5 py-1 bg-slate-900 text-white text-[10px] uppercase tracking-wider">Add all new</button>
                              <button data-suggest-replace onClick={() => addAllSuggestions(activeSkill, sg.items, true)} className="px-2.5 py-1 border border-stone-400 text-[10px] uppercase tracking-wider">Replace unfinished</button>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })()}

                  {/* Learning Plan Checklist + Comments */}
                  <div className="space-y-2">
                    <div className="text-[10px] uppercase tracking-wider text-slate-700 font-medium">
                      Step 2 · Your milestones (tap to tick off or add a note)
                    </div>
                    {activeSkill.steps.map((step, si) => (
                      <div key={step.id} className="p-2.5 bg-white border border-stone-200 space-y-1.5">
                        <div className="flex items-center gap-2">
                          <button
                            aria-label={`${step.done ? 'Untick' : 'Tick'} milestone ${step.title}`}
                            onClick={() => patchStep(activeSkill.id, step.id, { done: !step.done, doneDate: step.done ? null : todayDateStr() })}
                            className="shrink-0"
                          >
                            <div className={`w-5 h-5 border flex items-center justify-center ${step.done ? 'bg-purple-800 border-purple-800 text-white' : 'bg-white border-stone-400'}`}>
                              {step.done && <Check size={12} />}
                            </div>
                          </button>
                          <input
                            type="text"
                            aria-label={`Milestone ${si + 1} title`}
                            value={step.title}
                            onChange={e => patchStep(activeSkill.id, step.id, { title: e.target.value })}
                            className={`flex-1 min-w-0 bg-transparent border-b border-transparent focus:border-stone-300 px-0.5 py-0.5 text-xs font-medium outline-none ${step.done ? 'line-through text-stone-400' : 'text-slate-900'}`}
                          />
                        </div>
                        <div className="flex items-center gap-2">
                          <label className="text-[10px] text-stone-500 shrink-0">Target</label>
                          <select aria-label={`Milestone ${si + 1} target`} value={step.target || ''} onChange={e => patchStep(activeSkill.id, step.id, { target: e.target.value })} className="bg-[#FAF8F5] border border-stone-200 px-1.5 py-0.5 text-[11px]">
                            {STEP_TARGETS.map(t => <option key={t} value={t}>{t || 'No target'}</option>)}
                          </select>
                          {step.done && step.doneDate && <span className="text-[10px] text-purple-800">Done {prettyDate(step.doneDate)}</span>}
                          <span className="flex-1" />
                          <button aria-label={`Move milestone ${si + 1} up`} disabled={si === 0} onClick={() => moveStep(activeSkill.id, step.id, -1)} className="w-6 h-6 border border-stone-300 flex items-center justify-center disabled:opacity-30"><ChevronUp size={12} /></button>
                          <button aria-label={`Move milestone ${si + 1} down`} disabled={si === activeSkill.steps.length - 1} onClick={() => moveStep(activeSkill.id, step.id, 1)} className="w-6 h-6 border border-stone-300 flex items-center justify-center disabled:opacity-30"><ChevronDown size={12} /></button>
                          <button aria-label={`Delete milestone ${si + 1}`} onClick={() => removeStep(activeSkill.id, step.id)} className="text-stone-400 hover:text-rose-700"><Trash2 size={13} /></button>
                        </div>
                        <input
                          type="text"
                          placeholder="Add progress reflection or repo link..."
                          value={step.comment}
                          onChange={e => patchStep(activeSkill.id, step.id, { comment: e.target.value })}
                          className="w-full bg-[#FAF8F5] border border-stone-200 px-2 py-1 text-[11px]"
                        />
                      </div>
                    ))}

                    <div className="flex gap-1.5 pt-1 flex-wrap">
                      <input
                        type="text"
                        aria-label="New milestone"
                        placeholder="Add a new milestone..."
                        value={newStepText}
                        onChange={e => setNewStepText(e.target.value)}
                        className="flex-1 min-w-[140px] bg-white border border-stone-300 px-2.5 py-1 text-xs"
                      />
                      <select aria-label="New milestone target" value={newStepTarget} onChange={e => setNewStepTarget(e.target.value)} className="bg-white border border-stone-300 px-1.5 py-1 text-[11px]">
                        {STEP_TARGETS.map(t => <option key={t} value={t}>{t || 'No target'}</option>)}
                      </select>
                      <button
                        onClick={() => {
                          if (!newStepText.trim()) return;
                          mapForest(bs => bs.map(b => ({ ...b, skills: b.skills.map(sk => (sk.id === activeSkill.id ? { ...sk, steps: [...sk.steps, { id: `st_${Date.now()}`, title: newStepText.trim(), done: false, comment: '', target: newStepTarget }] } : sk)) })));
                          setNewStepText(''); setNewStepTarget('');
                        }}
                        className="px-3 py-1 bg-slate-900 text-white text-[10px] uppercase tracking-wider font-medium"
                      >
                        + Milestone
                      </button>
                    </div>

                    <div className="flex gap-2 pt-2 border-t border-stone-200 flex-wrap">
                      <button
                        aria-label="Delete this skill"
                        onClick={() => (skillConfirm === 'skill:' + activeSkill.id ? deleteSkillNow(activeSkill.id) : setSkillConfirm('skill:' + activeSkill.id))}
                        className={`px-2.5 py-1 text-[10px] uppercase tracking-wider font-medium border ${skillConfirm === 'skill:' + activeSkill.id ? 'bg-rose-700 text-white border-rose-700' : 'border-stone-300 text-rose-800'}`}
                      >
                        {skillConfirm === 'skill:' + activeSkill.id ? 'Tap again to delete skill' : 'Delete skill'}
                      </button>
                      <button
                        aria-label="Delete this area"
                        onClick={() => (skillConfirm === 'area:' + activeBranch.id ? deleteBranchNow(activeBranch.id) : setSkillConfirm('area:' + activeBranch.id))}
                        className={`px-2.5 py-1 text-[10px] uppercase tracking-wider font-medium border ${skillConfirm === 'area:' + activeBranch.id ? 'bg-rose-700 text-white border-rose-700' : 'border-stone-300 text-rose-800'}`}
                      >
                        {skillConfirm === 'area:' + activeBranch.id ? 'Tap again to delete area' : 'Delete area'}
                      </button>
                      {skillConfirm && <button onClick={() => setSkillConfirm('')} className="px-2.5 py-1 text-[10px] uppercase tracking-wider text-stone-600 underline">Cancel</button>}
                    </div>
                  </div>
                </div>
              )}

              {/* Course & Upskilling Suggestions with Multi-Reason Dismissal */}
              {skillOpen && <div className="space-y-2.5 pt-1">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] uppercase tracking-widest text-purple-800 font-medium">
                    Step 3 · Courses for "{activeSkill?.name}"
                  </span>
                </div>
                <p className="text-[10px] text-stone-500 leading-relaxed">These are links to real providers, not made-up courses. Check the price and reviews on the site before you pay for anything.</p>
                {leafAlignedCourses.map(course => (
                  <div key={course.id} data-resource className="p-3.5 bg-white border border-stone-200 space-y-2">
                    <div className="flex justify-between items-start gap-2">
                      <div className="min-w-0">
                        <span className="text-[10px] uppercase tracking-wider text-stone-500">{course.provider}</span>
                        <h5 className="text-xs font-medium text-slate-900 mt-0.5">{course.title}</h5>
                      </div>
                      <span className="text-[10px] font-mono px-2 py-0.5 bg-[#FAF8F5] border border-stone-300 shrink-0 text-right">{course.cost}</span>
                    </div>
                    <p className="text-[11px] text-stone-600 leading-snug">{course.blurb}</p>
                    <div className="flex justify-between items-center pt-1">
                      <div className="flex gap-2">
                        <a href={course.url} target="_blank" rel="noreferrer" className="px-3 py-1.5 bg-blue-800 hover:bg-blue-900 text-white text-[10px] uppercase tracking-wider font-medium flex items-center gap-1"><ExternalLink size={11} /> Open</a>
                        <button data-plan-session onClick={() => planStudySession(course)} className="px-3 py-1.5 border border-stone-400 text-[10px] uppercase tracking-wider font-medium">Plan a session</button>
                      </div>
                      <button onClick={() => patchSkill(activeSkill.id, { hiddenResources: [...(activeSkill.hiddenResources || []), course.id] })} className="text-[10px] text-rose-700 uppercase tracking-wider font-medium">Not for me</button>
                    </div>
                  </div>
                ))}
                {(activeSkill && (activeSkill.hiddenResources || []).length > 0) && (
                  <button onClick={() => patchSkill(activeSkill.id, { hiddenResources: [] })} className="text-[10px] text-stone-500 underline">Show hidden suggestions again</button>
                )}
              </div>}
            </div>
          </div>
        )}

        {/* =========================================================
            TAB 6: SOCIAL (SHARED FRIEND SYNC & COMMUNITY EVENTS)
           ========================================================= */}
        {activeTab === 'social' && (
          <div className="np-skin space-y-4 animate-in fade-in duration-300">

            <div data-social-subnav className="grid grid-cols-3 border-b border-slate-900">
              {[{ id: 'plans', label: 'Plans' }, { id: 'friends', label: 'Friend Book' }, { id: 'people', label: 'Your People' }].map(tab => (
                <button key={tab.id} data-social-sub={tab.id} onClick={() => setSocialSub(tab.id)} className={`py-2.5 px-0.5 text-[10.5px] whitespace-nowrap uppercase tracking-[0.08em] font-medium ${socialSub === tab.id ? 'border-b-[3px] border-rose-700 text-slate-900 font-semibold -mb-px' : 'text-stone-500'}`}>
                  {tab.label}{tab.id === 'friends' && (friendReqs.filter(r => r.direction === 'incoming').length + unreadTotal) > 0 ? <span data-friend-badge className="ml-1.5 px-1.5 py-px bg-rose-700 text-white text-[9px] tracking-wider">{friendReqs.filter(r => r.direction === 'incoming').length + unreadTotal}</span> : null}
                  {tab.id === 'plans' && pendingInvites.length > 0 ? <span className="ml-1.5 px-1.5 py-px bg-rose-700 text-white text-[9px] tracking-wider">{pendingInvites.length}</span> : null}
                </button>
              ))}
            </div>

            {socialSub === 'plans' && (() => {
              const INK = '#1B2A22', MUT = '#5A675F', CLAY = '#C8643C', FOR = '#1F3A2E';
              const dayBlock = (ds) => { const dt = ds ? new Date(ds + 'T00:00:00') : null; const ok = dt && !isNaN(dt.getTime()); return (
                <div className="text-center" style={{ width: 46, borderRight: '1px solid #CFC7B4', paddingRight: 8 }}>
                  <div className="font-fr" style={{ fontWeight: 600, fontSize: 24, lineHeight: 1, color: CLAY }}>{ok ? dt.getDate() : '–'}</div>
                  <div className="text-[9px] tracking-[0.14em]" style={{ color: MUT, marginTop: 2 }}>{ok ? dt.toLocaleDateString('en-GB', { weekday: 'short' }).toUpperCase() : ''}</div>
                </div>); };
              const goalDefs = [
                { id: 'Meet New Friends', label: 'Meet new friends', terms: 'social meetup', tip: 'walks, games, supper clubs' },
                { id: 'Learn a New Skill', label: 'Learn a skill', terms: 'workshop class', tip: 'taster sessions, workshops' },
                { id: 'Creative Hangout', label: 'Creative hangout', terms: 'art craft creative', tip: 'drawing, pottery, craft' },
                { id: 'Get Moving', label: 'Get moving', terms: 'run club climbing yoga', tip: 'run clubs, climbing, yoga' }
              ];
              const goal = goalDefs.find(g => g.id === communityGoal) || goalDefs[0];
              const city = loc.city; const uk = loc.country === 'United Kingdom';
              const links = (g) => [
                { label: 'Meetup', url: `https://www.meetup.com/find/?keywords=${encodeURIComponent(g.terms)}&location=${encodeURIComponent(city)}&source=EVENTS` },
                { label: 'Eventbrite', url: uk ? `https://www.eventbrite.co.uk/d/united-kingdom--${encodeURIComponent(city.toLowerCase().replace(/\s+/g, '-'))}/${encodeURIComponent(g.terms.split(' ')[0])}/` : `https://www.google.com/search?q=${encodeURIComponent('eventbrite ' + g.terms + ' ' + city)}` },
                { label: 'Google', url: `https://www.google.com/search?q=${encodeURIComponent(g.terms + ' events in ' + city + ' this week')}` }
              ];
              const jointCount = sharedEvents.length + sharedFriendPlans.length;
              return (<>
            {/* Invitations as the front-page story */}
            {pendingInvites.slice(0, 3).map(e => { const d = e.details || {}; const who = e.owner_name || 'A friend'; return (
              <article key={e.id} data-invite-story className="p-3.5" style={{ border: `3px double ${INK}` }}>
                <div className="text-[9px] uppercase tracking-[0.2em] font-bold" style={{ color: CLAY }}>Invitation{d.date ? ' · ' + prettyDate(d.date) : ''}</div>
                <h2 className="font-fr" style={{ fontWeight: 600, fontSize: 22, lineHeight: 1.05, marginTop: 4 }}>{who} invites you to {e.title}.</h2>
                <div className="text-[11px]" style={{ color: MUT, marginTop: 3 }}>{d.start ? d.start + (d.end && d.end !== d.start ? '–' + d.end : '') : 'Time to be confirmed'}{d.location ? ` · ${d.location}` : ''}</div>
                <div className="flex gap-2 mt-2.5">
                  <button data-story-accept onClick={() => answerEvent(e.id, 'accepted')} className="flex-1 h-[38px] text-xs font-semibold text-white" style={{ background: FOR, borderRadius: 0 }}>Accept</button>
                  <button data-story-decline onClick={() => answerEvent(e.id, 'declined')} className="flex-1 h-[38px] text-xs font-semibold" style={{ border: `1px solid ${INK}`, borderRadius: 0 }}>Not this time</button>
                </div>
              </article>
            ); })}

            <button data-send-plan-open onClick={() => setSendSheetOpen(true)} className="w-full h-11 text-[13px] font-semibold text-white" style={{ background: FOR, borderRadius: 0 }}>+ Send a plan</button>

            <div data-plans-tabs className="grid grid-cols-2" style={{ border: `1.5px solid ${INK}` }}>
              {[{ id: 'joint', label: `Joint plans${jointCount ? ' · ' + jointCount : ''}` }, { id: 'events', label: 'Find events' }].map((t, i) => (
                <button key={t.id} data-plans-tab={t.id} onClick={() => setPlansTab(t.id)} className="py-2.5 text-[10px] uppercase tracking-[0.12em] font-semibold" style={{ borderRadius: 0, background: plansTab === t.id ? INK : 'transparent', color: plansTab === t.id ? '#F4EFE4' : INK, borderLeft: i ? `1px solid ${INK}` : 'none' }}>{t.label}</button>
              ))}
            </div>

            {plansTab === 'joint' && (
              <div data-joint-events>
                {jointCount === 0 && <p data-joint-empty className="text-[12px] leading-relaxed py-4" style={{ color: MUT }}>Nothing planned together yet. Tap Send a plan to invite a friend to something on your schedule.</p>}
                {sharedEvents.map(e => {
                  const d = e.details || {};
                  const hasLocal = tasks.some(t => t.sharedId === e.id);
                  const editing = editEvent && editEvent.id === e.id;
                  const parts = (e.participants || []);
                  return (
                    <div key={e.id} data-joint-event className="grid" style={{ gridTemplateColumns: '46px 1fr', gap: 10, padding: '12px 0', borderBottom: '1px solid #CFC7B4' }}>
                      {dayBlock(d.date)}
                      <div className="min-w-0 space-y-1.5">
                        <div>
                          <div className="font-fr" style={{ fontWeight: 600, fontSize: 17, lineHeight: 1.1 }}>{e.title}</div>
                          <div className="text-[11px]" style={{ color: MUT, marginTop: 2 }}>{d.start ? `${d.start}${d.end && d.end !== d.start ? '–' + d.end : ''}` : 'No time yet'}{d.location ? ` · ${d.location}` : ''} &middot; {e.is_owner ? 'You made this' : `from ${e.owner_name}`}</div>
                          {parts.length > 0 && <div className="mt-1.5 text-[11px]">{parts.map((pp, i) => <span key={i} style={{ marginRight: 12, fontWeight: pp.status === 'accepted' ? 700 : 400, color: pp.status === 'accepted' ? INK : MUT }}>{pp.status === 'accepted' ? '✓ ' : '? '}{pp.name}</span>)}</div>}
                        </div>
                        {!e.is_owner && e.my_status === 'invited' && (
                          <div className="flex gap-2">
                            <button data-event-accept onClick={() => answerEvent(e.id, 'accepted')} className="px-3.5 h-[34px] text-xs font-semibold text-white" style={{ background: FOR, borderRadius: 0 }}>Accept</button>
                            <button data-event-decline onClick={() => answerEvent(e.id, 'declined')} className="px-3.5 h-[34px] text-xs font-semibold" style={{ border: `1px solid ${INK}`, borderRadius: 0 }}>Can't make it</button>
                          </div>
                        )}
                        {!e.is_owner && e.my_status === 'accepted' && <div className="text-[10px]" style={{ color: MUT }}>On your schedule. It updates automatically if {e.owner_name} changes it.</div>}
                        {e.is_owner && !editing && (
                          <div className="flex flex-wrap gap-x-3 gap-y-1 text-[10px] uppercase tracking-[0.12em]" style={{ color: MUT }}>
                            <button data-event-edit onClick={() => setEditEvent({ id: e.id, title: e.title, date: d.date || '', start: d.start || '', end: d.end || '', location: d.location || '' })} style={{ borderRadius: 0, textTransform: 'uppercase', letterSpacing: '0.12em' }}>Edit</button>
                            {!hasLocal && <button onClick={() => addEventToMySchedule(e)} style={{ borderRadius: 0, textTransform: 'uppercase', letterSpacing: '0.12em' }}>Add to my schedule</button>}
                            <button data-event-cancel onClick={() => cancelEvent(e)} style={{ borderRadius: 0, textTransform: 'uppercase', letterSpacing: '0.12em', color: CLAY }}>Cancel for everyone</button>
                          </div>
                        )}
                        {editing && (
                          <div data-event-edit-form className="space-y-1.5">
                            <input type="text" aria-label="Event title" value={editEvent.title} onChange={ev => setEditEvent({ ...editEvent, title: ev.target.value })} className="w-full bg-transparent px-2 py-1.5 text-xs" style={{ border: `1px solid ${INK}`, borderRadius: 0 }} />
                            <div className="grid grid-cols-3 gap-1.5">
                              <input type="date" aria-label="Event date" value={editEvent.date} onChange={ev => setEditEvent({ ...editEvent, date: ev.target.value })} className="bg-transparent px-1.5 py-1 text-[11px]" style={{ border: `1px solid ${INK}`, borderRadius: 0 }} />
                              <input type="time" aria-label="Event start" value={editEvent.start} onChange={ev => setEditEvent({ ...editEvent, start: ev.target.value })} className="bg-transparent px-1.5 py-1 text-[11px]" style={{ border: `1px solid ${INK}`, borderRadius: 0 }} />
                              <input type="time" aria-label="Event end" value={editEvent.end} onChange={ev => setEditEvent({ ...editEvent, end: ev.target.value })} className="bg-transparent px-1.5 py-1 text-[11px]" style={{ border: `1px solid ${INK}`, borderRadius: 0 }} />
                            </div>
                            <input type="text" aria-label="Event location" placeholder="Location" value={editEvent.location} onChange={ev => setEditEvent({ ...editEvent, location: ev.target.value })} className="w-full bg-transparent px-2 py-1.5 text-xs" style={{ border: `1px solid ${INK}`, borderRadius: 0 }} />
                            <div className="flex gap-2">
                              <button data-event-save onClick={saveEventEdit} className="px-3 h-[34px] text-xs font-semibold text-white" style={{ background: FOR, borderRadius: 0 }}>Save and tell everyone</button>
                              <button onClick={() => setEditEvent(null)} className="px-3 h-[34px] text-xs font-semibold" style={{ border: `1px solid ${INK}`, borderRadius: 0 }}>Back</button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
                {sharedFriendPlans.map(plan => (
                  <div key={plan.id} className="space-y-2" style={{ padding: '12px 0', borderBottom: '1px solid #CFC7B4' }}>
                    <div>
                      <div className="text-[10px] uppercase tracking-[0.14em] font-bold" style={{ color: CLAY }}>With {plan.friend}</div>
                      <div className="font-fr" style={{ fontWeight: 600, fontSize: 17, lineHeight: 1.1 }}>{plan.title}</div>
                      <div className="text-[11px]" style={{ color: MUT }}>{plan.day} @ {plan.time} &middot; {plan.location}</div>
                    </div>
                    <div className="text-[11px] pl-2" style={{ borderLeft: `2px solid ${FOR}`, color: MUT }}>{plan.syncStatus}</div>
                    <div className="space-y-1">
                      <span className="text-[10px] uppercase tracking-[0.14em] block" style={{ color: MUT }}>Need to push back? Moves it on your side:</span>
                      <div className="grid grid-cols-4 gap-1.5">
                        {[15, 30, 45, 60].map(mins => <button key={mins} onClick={() => handlePushSharedPlan(plan.id, mins)} className="py-1.5 text-[10px] font-semibold" style={{ border: `1px solid ${INK}`, borderRadius: 0 }}>+{mins}m</button>)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {plansTab === 'events' && (
              <div data-community className="space-y-3">
                <div>
                  <h3 className="font-fr" style={{ fontSize: 28, fontWeight: 600, lineHeight: 1, letterSpacing: '-0.025em' }}>What do you fancy?</h3>
                  <p className="font-fr" style={{ fontStyle: 'italic', fontSize: 15, color: MUT, marginTop: 6 }}>Live searches for {city}. Nothing is made up.</p>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {goalDefs.map(g => { const on = g.id === goal.id; return (
                    <button key={g.id} data-community-goal={g.id} aria-pressed={on} onClick={() => setCommunityGoal(g.id)} className="text-left" style={{ padding: '10px 11px', borderRadius: 0, border: on ? `1.5px solid ${INK}` : '1px solid #CFC7B4', background: on ? INK : 'transparent', color: on ? '#F4EFE4' : INK }}>
                      <div className="font-fr" style={{ fontWeight: 600, fontSize: 15, lineHeight: 1.1 }}>{g.label}</div>
                      <div className="text-[10.5px]" style={{ marginTop: 2, color: on ? '#B9C6BE' : MUT }}>{g.tip}</div>
                    </button>); })}
                </div>
                <div style={{ borderTop: `3px solid ${INK}`, paddingTop: 6 }}><span className="text-[10px] uppercase tracking-[0.14em]" style={{ color: MUT }}>Search &ldquo;{goal.label}&rdquo; on</span></div>
                <div className="grid grid-cols-3 gap-2">
                  {links(goal).map((l, i) => <a key={l.label} href={l.url} target="_blank" rel="noopener noreferrer" className="h-11 flex items-center justify-center text-xs font-semibold" style={{ borderRadius: 0, background: i < 2 ? FOR : 'transparent', color: i < 2 ? '#F4EFE4' : INK, border: `1px solid ${i < 2 ? FOR : INK}` }}>{l.label}</a>)}
                </div>
                <div className="space-y-2"><span className="text-[10px] uppercase tracking-[0.14em]" style={{ color: MUT }}>Or search for something else</span>
                  <div className="flex gap-2">
                    <input data-community-q type="search" aria-label="Search events" placeholder="e.g. salsa, running club" value={communityQuery} onChange={e => setCommunityQuery(e.target.value)} onKeyDown={e => { if (e.key === 'Enter' && communityQuery.trim()) window.open(`https://www.google.com/search?q=${encodeURIComponent(communityQuery.trim() + ' events in ' + city)}`, '_blank', 'noopener'); }} className="flex-1 min-w-0 bg-transparent px-3 h-10 text-[13px]" style={{ border: `1.5px solid ${INK}`, borderRadius: 0 }} />
                    <a data-community-go href={communityQuery.trim() ? `https://www.google.com/search?q=${encodeURIComponent(communityQuery.trim() + ' events in ' + city)}` : undefined} target="_blank" rel="noopener noreferrer" className="px-4 h-10 flex items-center text-xs font-semibold text-white" style={{ background: FOR, borderRadius: 0, opacity: communityQuery.trim() ? 1 : 0.5 }}>Search</a>
                  </div>
                </div>
                <p className="text-[11px]" style={{ color: MUT }}>Pact never lists events itself, so it never shows anything out of date.</p>
              </div>
            )}

            {sendSheetOpen && (
              <Portal>
                <div data-send-sheet className="fixed inset-0 flex items-end justify-center" style={{ zIndex: 300 }} role="dialog" aria-label="Send a plan">
                  <div className="absolute inset-0" style={{ background: 'rgba(27,42,34,.5)' }} onClick={() => setSendSheetOpen(false)} />
                  <div className="relative w-full max-w-md max-h-[88dvh] overflow-y-auto px-6 pt-4 pb-6" style={{ background: '#F4EFE4', borderTop: `3px double ${INK}`, color: INK }}>
                    <div className="flex items-baseline justify-between"><div className="font-fr" style={{ fontWeight: 600, fontSize: 24 }}>Send a plan</div><button aria-label="Close" onClick={() => setSendSheetOpen(false)} style={{ fontSize: 22, color: MUT, borderRadius: 0 }}>&times;</button></div>
                    {upcomingTasks.length === 0 ? (
                      <p className="text-[12px] leading-relaxed mt-3" style={{ color: MUT }}>Add a plan to your schedule first, then you can invite someone to it.</p>
                    ) : (<>
                      <div className="mt-3 space-y-1.5"><span className="text-[10px] uppercase tracking-[0.14em]" style={{ color: MUT }}>1 &middot; Plan</span>
                        <select aria-label="Plan to invite them to" value={inviteDraft.taskId} onChange={e => { setInviteDraft({ ...inviteDraft, taskId: e.target.value }); setInviteOut(null); }} className="w-full bg-transparent px-3 py-2.5 text-sm font-fr" style={{ border: `1.5px solid ${INK}`, borderRadius: 0, fontWeight: 600 }}>
                          <option value="">Choose a plan...</option>
                          {upcomingTasks.slice(0, 30).map(t => <option key={t.id} value={t.id}>{prettyDate(t.date)} {t.startTime} · {t.title}</option>)}
                        </select>
                      </div>
                      <div className="mt-3 space-y-2"><span className="text-[10px] uppercase tracking-[0.14em]" style={{ color: MUT }}>2 &middot; Friends</span>
                        {pactFriends.length === 0 ? <p className="text-[12px]" style={{ color: MUT }}>No friends on Pact yet. Add them in Friend Book, or copy an invite link below.</p> : (
                          <div data-pact-invite className="flex gap-1.5 overflow-x-auto pt-2 pl-1 pb-1">
                            {pactFriends.map(f => { const on = inviteSel.includes(f.userId); return (
                              <button key={f.userId} data-invite-friend={f.userId} aria-pressed={on} onClick={() => setInviteSel(prev => prev.includes(f.userId) ? prev.filter(x => x !== f.userId) : [...prev, f.userId])} className="shrink-0 text-center" style={{ width: 62, borderRadius: 0 }}>
                                <div className="relative mx-auto" style={{ width: 54 }}>
                                  <div style={{ outline: on ? `2.5px solid ${CLAY}` : 'none', outlineOffset: 2 }}><Avatar src={f.avatar} name={f.name} size={54} /></div>
                                  {on && <span className="absolute flex items-center justify-center text-[11px]" style={{ right: -5, top: -5, width: 18, height: 18, background: CLAY, color: '#F4EFE4' }}>&#10003;</span>}
                                </div>
                                <div className="text-[10.5px] mt-1.5 truncate" style={{ fontWeight: on ? 700 : 400, color: on ? INK : MUT }}>{String(f.name).split(' ')[0]}</div>
                              </button>); })}
                          </div>
                        )}
                      </div>
                      {pactFriends.length > 0 && (<>
                        <input type="text" aria-label="Add a note (optional)" placeholder="Add a note (optional)" value={inviteNote} onChange={e => setInviteNote(e.target.value)} className="w-full bg-transparent py-2 mt-3 text-[13px] outline-none" style={{ borderBottom: `1.5px solid ${INK}` }} />
                        <button data-invite-send-pact onClick={async () => { await sendPactInvite(); }} disabled={inviteBusy || !inviteDraft.taskId || inviteSel.length === 0} className="w-full h-11 mt-3.5 text-[13px] font-semibold text-white disabled:opacity-50" style={{ background: FOR, borderRadius: 0 }}>{inviteSel.length ? `Send to ${inviteSel.length} friend${inviteSel.length === 1 ? '' : 's'}` : 'Pick a friend to send to'}</button>
                        <p className="text-[10px] mt-1.5 leading-snug" style={{ color: MUT }}>It becomes a joint event: if you change it later, it updates on their calendar too.</p>
                      </>)}
                      <div className="mt-3.5 text-center">
                        <input type="text" aria-label="Friend's name (optional)" list="pact-friend-names" placeholder="Friend's name (optional, for a link)" value={inviteDraft.friend} onChange={e => { setInviteDraft({ ...inviteDraft, friend: e.target.value }); setInviteOut(null); }} className="w-full bg-transparent px-2.5 py-2 text-xs mb-2" style={{ border: '1px solid #CFC7B4', borderRadius: 0 }} />
                        <datalist id="pact-friend-names">{[...friendsList.map(f => f.name), ...people.filter(x => !x.blocked).map(x => x.name)].filter((n, i, a) => n && a.indexOf(n) === i).map(n => <option key={n} value={n} />)}</datalist>
                        <button data-invite-create onClick={createInvite} className="text-[11px] underline" style={{ color: MUT, borderRadius: 0 }}>Not on Pact? Copy an invite link</button>
                      </div>
                      {inviteOut && (
                        <div data-invite-out className="space-y-2 mt-3">
                          <textarea readOnly aria-label="Invite message" value={inviteOut.text} rows={4} onFocus={e => e.target.select()} className="w-full bg-transparent px-2.5 py-2 text-[11px] leading-snug" style={{ border: '1px solid #CFC7B4', borderRadius: 0 }} />
                          <div className="flex gap-2 flex-wrap">
                            <button data-invite-copy onClick={() => copyText(inviteOut.text, 'Invite copied. Paste it into a message.')} className="px-3 h-[34px] text-[10px] uppercase tracking-wider font-semibold text-white" style={{ background: FOR, borderRadius: 0 }}>Copy</button>
                            <button onClick={() => shareText(inviteOut.text)} className="px-3 h-[34px] text-[10px] uppercase tracking-wider font-semibold flex items-center gap-1" style={{ border: `1px solid ${INK}`, borderRadius: 0 }}><Share2 size={11} /> Share</button>
                            <a href={`https://wa.me/?text=${encodeURIComponent(inviteOut.text)}`} target="_blank" rel="noopener noreferrer" className="px-3 h-[34px] flex items-center text-[10px] uppercase tracking-wider font-semibold" style={{ border: `1px solid ${INK}`, borderRadius: 0 }}>WhatsApp</a>
                          </div>
                        </div>
                      )}
                    </>)}
                  </div>
                </div>
              </Portal>
            )}
              </>);
            })()}

            {socialSub === 'friends' && (
              <div data-friendbook className="space-y-4">
                <div className="flex justify-between items-center gap-2">
                  <span className="np-flag">Friend Book<span className="np-kicker">Who&rsquo;s who</span></span>
                  <button
                    onClick={() => {
                      navigator.clipboard?.writeText('Join me on Pact: ' + window.location.origin);
                      setInviteCopied(true);
                      setTimeout(() => setInviteCopied(false), 2500);
                    }}
                    className="px-2.5 py-1.5 border border-slate-900 text-[10px] uppercase tracking-wider font-medium flex items-center gap-1"
                    style={{ borderRadius: 0 }}
                  >
                    <Share2 size={11} /> {inviteCopied ? 'Link copied' : 'Invite link'}
                  </button>
                </div>

                <div className="relative">
                  <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-500" />
                  <input data-friendbook-search type="search" aria-label="Search friends and requests" placeholder="Search friends, requests or @username" value={friendBookQ} onChange={e => setFriendBookQ(e.target.value)} className="w-full border border-slate-900 bg-transparent pl-9 pr-3 h-11 text-[13px]" style={{ borderRadius: 0 }} />
                </div>

                {(() => {
                  const fq = friendBookQ.trim().toLowerCase();
                  const hit = (r) => !fq || (String(r.display_name || '') + ' ' + r.username).toLowerCase().includes(fq);
                  const ins = friendReqs.filter(r => r.direction === 'incoming').filter(hit);
                  const outs = friendReqs.filter(r => r.direction === 'outgoing').filter(hit);
                  if (!ins.length && !outs.length) return null;
                  return (
                    <div data-friend-requests className="space-y-2">
                      <div className="border-t-[3px] border-slate-900 pt-1.5 np-sc">Friend requests &middot; {ins.length + outs.length}</div>
                      {ins.map(r => (
                        <div key={r.id} data-friend-request className="border border-slate-900 bg-[#FAF8F2] p-3 flex items-center gap-3">
                          <Mug src={r.avatar} name={r.display_name || r.username} w={44} h={44} />
                          <div className="flex-1 min-w-0 text-[13px] leading-snug"><span className="font-semibold">{r.display_name || r.username}</span> <span className="text-stone-500">@{r.username}</span> wants to be friends</div>
                          <div className="flex flex-col gap-1.5 shrink-0">
                            <button data-friend-accept onClick={() => answerFriendReq(r, true)} className="px-2.5 py-1.5 bg-purple-900 text-white text-[10px] uppercase tracking-wider" style={{ borderRadius: 0 }}>Accept</button>
                            <button data-friend-decline onClick={() => answerFriendReq(r, false)} className="px-2.5 py-1.5 border border-slate-900 text-[10px] uppercase tracking-wider" style={{ borderRadius: 0 }}>Decline</button>
                          </div>
                        </div>
                      ))}
                      {outs.length > 0 && <p data-friend-waiting className="text-[11px] text-stone-500">Waiting for a reply from: {outs.map(r => r.display_name || '@' + r.username).join(', ')}</p>}
                    </div>
                  );
                })()}

                {authUser && authUser.cloud ? (
                  <div data-friend-search className="p-3 bg-[#FAF8F5] border border-stone-200 space-y-2">
                    <div className="text-[10px] uppercase tracking-widest text-purple-800 font-medium">Find a friend on Pact</div>
                    <div className="flex gap-2">
                      <input type="text" aria-label="Friend's username" placeholder="Their @username, e.g. @maya_lin" value={friendQuery} onChange={e => setFriendQuery(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') searchFriend(); }} className="flex-1 min-w-0 bg-white border border-stone-300 px-2.5 py-1.5 text-xs" />
                      <button data-friend-find onClick={() => searchFriend()} disabled={friendBusy || !friendQuery.trim()} className="px-3 py-1.5 bg-purple-800 text-white text-[10px] uppercase tracking-wider font-medium disabled:opacity-50">{friendBusy ? '...' : 'Find'}</button>
                    </div>
                    <p className="text-[10px] text-stone-500 leading-snug">Your username: <strong>{accountInfo.username || '(not set)'}</strong>. Share it so friends can find you. They need to type it exactly.</p>
                    {friendFound === 'none' && <p data-friend-none className="text-[11px] text-stone-600">No one found with that username. Check the spelling with them.</p>}
                    {friendFound && friendFound !== 'none' && (
                      <div data-friend-result className="p-2.5 bg-white border border-stone-200 flex justify-between items-center gap-2">
                        <div className="flex items-center gap-2 min-w-0"><Avatar src={friendFound.avatar} name={friendFound.display_name || friendFound.username} size={32} /><div className="min-w-0"><div className="text-xs font-medium text-slate-900">{friendFound.display_name || friendFound.username} <span className="text-stone-400 font-normal">@{friendFound.username}</span></div>{friendFound.bio && <div className="text-[10px] text-stone-600 leading-snug">{friendFound.bio}</div>}</div></div>
                        {friendFound.relation === 'friends' ? <span className="text-[10px] text-stone-500 uppercase tracking-wider">Already friends</span>
                          : friendFound.relation === 'pending_out' ? <span className="text-[10px] text-stone-500 uppercase tracking-wider">Request sent</span>
                          : <button data-friend-send onClick={() => sendFriendReq(friendFound.id)} disabled={friendBusy} className="px-2.5 py-1 bg-rose-700 text-white text-[10px] uppercase tracking-wider font-medium">{friendFound.relation === 'pending_in' ? 'Accept their request' : 'Send request'}</button>}
                      </div>
                    )}
                    {friendMsg && <p data-friend-msg className="text-[11px] text-stone-600">{friendMsg}</p>}
                  </div>
                ) : (
                  <p className="text-[11px] text-stone-500 leading-snug">Sign in with an account to find friends by username.</p>
                )}

                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Add someone who isn't on Pact yet (name)..."
                    value={newFriendName}
                    onChange={e => setNewFriendName(e.target.value)}
                    className="flex-1 bg-[#FAF8F5] border border-stone-300 px-2.5 py-1.5 text-xs"
                  />
                  <button
                    onClick={() => {
                      if (!newFriendName.trim()) return;
                      setFriendsList(prev => [...prev, { id: Date.now(), name: newFriendName, handle: `@${newFriendName.toLowerCase().replace(/\s+/g, '')}`, lastSeen: 'Just added', type: 'Friend', status: 'Synced' }]);
                      setNewFriendName('');
                    }}
                    className="px-3 py-1.5 bg-purple-800 text-white text-[10px] uppercase tracking-wider font-medium"
                  >
                    + Add
                  </button>
                </div>

                {(() => {
                  const fq = friendBookQ.trim().toLowerCase();
                  const list = friendsList.filter(fr => !fq || (fr.name + ' ' + fr.handle + ' ' + (fr.bio || '')).toLowerCase().includes(fq));
                  return (<>
                    <div className="border-t-[3px] border-slate-900 pt-1.5 np-sc">Your friends &middot; {list.length}</div>
                    {fq && list.length === 0 && (
                      <div className="space-y-2">
                        <p data-friendbook-empty className="text-[12px] text-stone-600">No friends match &ldquo;{friendBookQ}&rdquo;.</p>
                        {authUser && authUser.cloud && <button data-friendbook-findpact onClick={() => { setFriendQuery(friendBookQ); searchFriend(friendBookQ); }} className="px-3 py-2 border border-slate-900 text-[11px] uppercase tracking-wider font-medium" style={{ borderRadius: 0 }}>Search Pact for {friendBookQ.trim()}</button>}
                      </div>
                    )}
                    <div data-friend-wall className="grid grid-cols-3 gap-x-2.5 gap-y-5">
                      {list.map((fr, i) => (
                        <div key={fr.id} data-friend-row className="min-w-0">
                          <div data-friend-open onClick={() => fr.userId && openFriendProfile(fr)} className={fr.userId ? 'cursor-pointer' : ''}>
                            <Mug src={fr.avatar} name={fr.name} w="100%" h="sq" tone={i} dot={!!(fr.userId && unreadBy[fr.userId])} />
                            <div className="font-editorial text-[14px] leading-tight mt-1.5 break-words">{fr.name}</div>
                            <div className="text-[10.5px] text-stone-500 leading-snug mt-0.5 break-words" style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{fr.bio ? <span data-friend-bio>{fr.bio}</span> : `${fr.type} • ${fr.lastSeen}`}</div>
                          </div>
                          <div className="mt-1.5 flex flex-wrap gap-x-2.5 gap-y-1 text-[10px] uppercase tracking-wider">
                            {fr.userId && <button data-friend-message onClick={() => openChat(fr)} className="font-semibold underline" style={{ borderRadius: 0 }}>Message{unreadBy[fr.userId] ? <span className="ml-1 px-1 bg-rose-700 text-white no-underline">{unreadBy[fr.userId]}</span> : null}</button>}
                            <button data-friend-invite onClick={() => { setInviteDraft({ taskId: '', friend: fr.name }); setInviteOut(null); setSocialSub('plans'); setActiveTab('social'); }} className="underline" style={{ borderRadius: 0 }}>Invite</button>
                            <button data-friend-remove onClick={() => unfriend(fr)} aria-label={`Remove ${fr.name}`} className="text-stone-400" style={{ borderRadius: 0 }}>Remove</button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>);
                })()}

                {chatWith && (
                  <div data-chat className="border border-purple-300 bg-white">
                    <div className="px-3 py-2 bg-purple-900 text-white flex justify-between items-center">
                      <span className="text-xs font-medium">Chat with {chatWith.name} {chatWith.handle}</span>
                      <button data-chat-close onClick={() => setChatWith(null)} className="text-[10px] uppercase tracking-wider text-purple-200 hover:text-white">Close</button>
                    </div>
                    <div className="p-3 space-y-2 max-h-72 overflow-y-auto bg-[#FAF8F5]">
                      {chatMsgs.length === 0 && <p className="text-[11px] text-stone-500">No messages yet. Say hello, or invite them to a plan from the Social tab.</p>}
                      {chatMsgs.map(m => m.kind === 'text' ? (
                        <div key={m.id} data-chat-msg className={`flex ${m.mine ? 'justify-end' : 'justify-start'}`}>
                          <div className={`max-w-[80%] px-2.5 py-1.5 text-xs leading-snug ${m.mine ? 'bg-purple-800 text-white' : 'bg-white border border-stone-200 text-slate-900'}`}>{m.body}</div>
                        </div>
                      ) : (
                        <div key={m.id} data-chat-event className="p-2 bg-white border border-rose-200 text-[11px] leading-snug space-y-1.5">
                          <div><span className="text-[9px] uppercase tracking-widest text-rose-700 font-medium">{m.kind === 'invite' ? 'Invite' : m.kind === 'update' ? 'Event updated' : m.kind === 'cancel' ? 'Cancelled' : 'Reply'}</span><br />{m.body}</div>
                          {m.kind === 'invite' && !m.mine && m.my_status === 'invited' && m.activity_id && (
                            <div className="flex gap-1.5">
                              <button data-chat-accept onClick={() => answerEvent(m.activity_id, 'accepted')} className="px-2 py-1 bg-purple-800 text-white text-[10px] uppercase tracking-wider">Accept</button>
                              <button data-chat-decline onClick={() => answerEvent(m.activity_id, 'declined')} className="px-2 py-1 border border-stone-400 text-[10px] uppercase tracking-wider">Can't make it</button>
                            </div>
                          )}
                          {m.kind === 'invite' && !m.mine && m.my_status && m.my_status !== 'invited' && <div className="text-[10px] text-stone-500">You {m.my_status === 'accepted' ? 'accepted' : 'declined'} this.</div>}
                        </div>
                      ))}
                    </div>
                    <div className="p-2 flex gap-2 border-t border-stone-200">
                      <input data-chat-input type="text" aria-label="Message" placeholder="Write a message..." value={chatText} onChange={e => setChatText(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') sendChat(); }} className="flex-1 min-w-0 bg-[#FAF8F5] border border-stone-300 px-2.5 py-1.5 text-xs" />
                      <button data-chat-send onClick={sendChat} disabled={!chatText.trim()} className="px-3 py-1.5 bg-purple-800 text-white text-[10px] uppercase tracking-wider disabled:opacity-50">Send</button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {socialSub === 'people' && (() => {
              const today = todayDateStr();
              const shown = people.filter(x => peopleFilter === 'blocked' ? x.blocked : !x.blocked && (peopleFilter === 'all' || x.kind === peopleFilter))
                .sort((a, b) => (personOverdue(b, today, addDaysStr) ?? -1) - (personOverdue(a, today, addDaysStr) ?? -1) || String(a.name).localeCompare(String(b.name)));
              const blockedN = people.filter(x => x.blocked).length;
              const addPerson = () => {
                const nm = personDraft.name.trim(); if (!nm) return;
                setPeople(prev => [...prev, { id: 'p_' + Date.now(), name: nm, kind: personDraft.kind, relation: personDraft.relation.trim(), remindEvery: Number(personDraft.remindEvery) || 0, lastContact: today, createdAt: today, blocked: false, notes: '', linkedUserId: '', phone: personDraft.phone.trim(), whatsapp: personDraft.whatsapp.trim(), email: personDraft.email.trim() }]);
                setPersonDraft({ name: '', kind: personDraft.kind, relation: '', remindEvery: personDraft.remindEvery, phone: '', whatsapp: '', email: '' });
              };
              const addImported = () => {
                const chosen = (importList || []).filter(x => x.sel);
                if (!chosen.length) { setImportList(null); return; }
                const have = new Set(people.map(x => String(x.name).trim().toLowerCase()));
                const fresh = chosen.filter(x => !have.has(x.name.trim().toLowerCase()));
                setPeople(prev => [...prev, ...fresh.map((x, i) => ({ id: 'p_' + Date.now() + '_' + i, name: x.name.trim(), kind: personDraft.kind, relation: '', remindEvery: Number(personDraft.remindEvery) || 0, lastContact: today, createdAt: today, blocked: false, notes: '', linkedUserId: '', phone: x.phone || '', whatsapp: '', email: x.email || '' }))]);
                pushToast(`Added ${fresh.length} ${fresh.length === 1 ? 'person' : 'people'}${chosen.length > fresh.length ? ` (${chosen.length - fresh.length} already in your list)` : ''}.`, 'success');
                setImportList(null);
              };
              const pickContacts = async () => {
                setImportMsg('');
                const nav: any = navigator;
                let res = null;
                try { res = await nav.contacts.select(['name', 'tel', 'email'], { multiple: true }); }
                catch (e) {
                  if (e && e.name === 'AbortError') return;
                  try { res = await nav.contacts.select(['name', 'tel'], { multiple: true }); }
                  catch (e2) { setImportMsg("Your phone wouldn't open its contacts list. Use \"Import a file\" or \"Paste a list\" instead."); return; }
                }
                const list = (res || []).map(c => ({ name: String((c.name && c.name[0]) || '').trim(), phone: (c.tel && c.tel[0]) || '', email: (c.email && c.email[0]) || '', sel: true })).filter(x => x.name);
                if (list.length) setImportList(list); else setImportMsg('No contacts with names were picked.');
              };
              const onContactFile = async (e) => {
                const files = Array.from(e.target.files || []); if (!files.length) return;
                setImportMsg('');
                let list = []; let tried = 0;
                for (const f of files) {
                  tried++;
                  let txt = '';
                  try { txt = await f.text(); } catch (err) { continue; }
                  if (/\u0000/.test(txt.slice(0, 200))) { try { txt = new TextDecoder('utf-16').decode(await f.arrayBuffer()); } catch (err) { /* keep */ } }
                  list = list.concat(/BEGIN:VCARD/i.test(txt) ? parseVcf(txt) : /,|;/.test(txt.split(/\r?\n/)[0] || '') && /name|phone|mobile|e-?mail/i.test(txt.split(/\r?\n/)[0] || '') ? parseCsvContacts(txt) : parseLooseContacts(txt));
                }
                const seenN = new Set(); list = list.filter(x => { const k = x.name.toLowerCase() + '|' + x.phone; if (seenN.has(k)) return false; seenN.add(k); return true; }).map(x => ({ ...x, sel: true }));
                if (!list.length) setImportMsg(`I couldn't find any contacts in ${tried === 1 ? 'that file' : 'those files'}. It should be a contacts export (.vcf or .csv). You can also use "Paste a list".`); else setImportList(list);
                e.target.value = '';
              };
              const importPasted = () => {
                const t = pasteText;
                const list = (/BEGIN:VCARD/i.test(t) ? parseVcf(t) : parseLooseContacts(t)).map(x => ({ ...x, sel: true }));
                if (!list.length) { setImportMsg('Nothing found. Put one person per line, like: Maya Lin, 07700 900123, maya@example.com'); return; }
                setImportMsg(''); setImportList(list); setPasteOpen(false); setPasteText('');
              };
              const findPersonByUsername = async () => {
                const q = peopleUserQ.trim(); if (!q) return;
                if (!authUser || !authUser.cloud) { setPeopleUserRes('offline'); return; }
                try { const r = await cloud.findUser(q); setPeopleUserRes(r || 'none'); } catch (e) { setPeopleUserRes('error'); }
              };
              const addUserAsPerson = (u) => {
                const nm = (u.display_name || u.username || '').trim();
                if (people.some(x => x.username === u.username || String(x.name).trim().toLowerCase() === nm.toLowerCase())) { pushToast(`${nm} is already in Your People.`, 'info'); return; }
                setPeople(prev => [...prev, { id: 'p_' + Date.now(), name: nm, kind: personDraft.kind, relation: personDraft.relation.trim(), remindEvery: Number(personDraft.remindEvery) || 0, lastContact: today, createdAt: today, blocked: false, notes: '', linkedUserId: u.relation === 'friends' ? u.id : '', username: u.username, avatar: u.avatar || '', bio: u.bio || '', phone: '', whatsapp: '', email: '' }]);
                pushToast(`${nm} added to Your People.`, 'success');
                setPeopleUserRes(null); setPeopleUserQ('');
              };
              const hasPicker = typeof navigator !== 'undefined' && !!(navigator as any).contacts && !!(navigator as any).contacts.select;
              const INK = '#1B2A22', MUT = '#5A675F', CLAY = '#C8643C', FOR = '#1F3A2E';
              const q = peopleQ.trim().toLowerCase();
              const vis = shown.filter(x => !q || String(x.name).toLowerCase().includes(q) || String(x.relation || '').toLowerCase().includes(q) || String(x.username || '').toLowerCase().includes(q));
              const dueList = peopleFilter === 'blocked' ? [] : vis.filter(x => personOverdue(x, today, addDaysStr) !== null);
              const restList = peopleFilter === 'blocked' ? vis : vis.filter(x => personOverdue(x, today, addDaysStr) === null);
              const tint = ['#4F7A63|#1F3A2E', '#C8643C|#7A3418', '#3A6A70|#17323A', '#B08A3E|#6B5320', '#7A3418|#3E1B0D'];
              const tile = (pr, i) => { const [c1, c2] = tint[(String(pr.name).charCodeAt(0) || i) % tint.length].split('|'); return pr.avatar ? <Avatar src={pr.avatar} name={pr.name} size={40} /> : <div style={{ width: 40, height: 40, flex: 'none', background: `radial-gradient(circle,rgba(244,239,228,.30) .9px,transparent 1.5px) 0 0/5px 5px,linear-gradient(135deg,${c1},${c2})`, color: '#F4EFE4', display: 'flex', alignItems: 'center', justifyContent: 'center' }} className="font-fr"><span style={{ fontSize: 17, fontWeight: 600 }}>{String(pr.name).trim()[0] || '?'}</span></div>; };
              const freqLabel = (n) => (REMIND_OPTIONS.find(o => o.v === n) || { l: n ? `Every ${n} days` : 'No reminders' }).l;
              const subLine = (pr) => {
                const over = personOverdue(pr, today, addDaysStr);
                const since = daysBetweenStr(pr.lastContact || pr.createdAt || today, today);
                const next = pr.remindEvery ? daysBetweenStr(today, addDaysStr(pr.lastContact || pr.createdAt || today, pr.remindEvery)) : null;
                const kind = pr.kind === 'business' ? 'Business' : 'Personal';
                if (pr.blocked) return { t: `${kind} · Blocked, no reminders`, hot: false };
                if (over !== null) return { t: `${kind} · ${over > 0 ? `${over} day${over === 1 ? '' : 's'} overdue` : `last spoke ${agoText(since)}`}`, hot: true };
                if (pr.snoozeUntil && pr.snoozeUntil > today) return { t: `${kind} · snoozed`, hot: false };
                return { t: pr.remindEvery ? `${freqLabel(pr.remindEvery)} · in ${next} day${next === 1 ? '' : 's'}` : `${kind} · no reminders`, hot: false };
              };
              const detail = (pr) => {
                const linked = pactFriends.find(f => f.userId === pr.linkedUserId);
                return (
                  <div data-person-card className="space-y-2.5 pb-3" style={{ borderBottom: '1px solid #CFC7B4' }}>
                    {pr.username && <div data-person-username className="flex items-center gap-1.5"><Avatar src={pr.avatar} name={pr.name} size={20} /><span className="text-[11px]" style={{ color: MUT }}>@{pr.username}{pr.bio ? ' • ' + pr.bio : ''}</span></div>}
                    {pr.relation && <div className="text-[11px]" style={{ color: MUT }}>{pr.relation}</div>}
                    {linked && <button data-person-view-profile onClick={() => openFriendProfile(linked)} className="text-[11px] underline" style={{ color: FOR, borderRadius: 0 }}>View profile</button>}
                    <div className="text-[11px]" style={{ color: MUT }}>Last in touch: {agoText(daysBetweenStr(pr.lastContact || pr.createdAt || today, today))}</div>
                    <div data-person-contact className="flex flex-wrap gap-1.5 items-center">
                      {pr.phone && <a data-contact-call href={`tel:${pr.phone}`} className="px-2.5 py-1.5 text-[10px] uppercase tracking-wider font-semibold" style={{ border: `1px solid ${INK}` }}>Call</a>}
                      {(pr.whatsapp || pr.phone) && <a data-contact-wa href={`https://wa.me/${waDigits(pr.whatsapp || pr.phone)}`} target="_blank" rel="noopener noreferrer" className="px-2.5 py-1.5 text-[10px] uppercase tracking-wider font-semibold" style={{ border: `1px solid ${INK}` }}>WhatsApp</a>}
                      {pr.email && <a data-contact-mail href={`mailto:${pr.email}`} className="px-2.5 py-1.5 text-[10px] uppercase tracking-wider font-semibold" style={{ border: `1px solid ${INK}` }}>Email</a>}
                      <button data-contact-edit onClick={() => setContactEditId(contactEditId === pr.id ? null : pr.id)} className="px-2 py-1 text-[10px] underline" style={{ color: MUT, borderRadius: 0 }}>{(pr.phone || pr.whatsapp || pr.email) ? 'Edit contact info' : 'Add contact info'}</button>
                    </div>
                    {contactEditId === pr.id && (
                      <div data-contact-form className="grid grid-cols-1 gap-1.5">
                        <input type="tel" aria-label={`Phone for ${pr.name}`} placeholder="Phone" value={pr.phone || ''} onChange={e => updatePerson(pr.id, { phone: e.target.value })} className="bg-transparent px-2 py-1.5 text-xs" style={{ border: `1px solid ${INK}`, borderRadius: 0 }} />
                        <input type="tel" aria-label={`WhatsApp for ${pr.name}`} placeholder="WhatsApp (leave blank to use their phone)" value={pr.whatsapp || ''} onChange={e => updatePerson(pr.id, { whatsapp: e.target.value })} className="bg-transparent px-2 py-1.5 text-xs" style={{ border: `1px solid ${INK}`, borderRadius: 0 }} />
                        <input type="email" aria-label={`Email for ${pr.name}`} placeholder="Email" value={pr.email || ''} onChange={e => updatePerson(pr.id, { email: e.target.value })} className="bg-transparent px-2 py-1.5 text-xs" style={{ border: `1px solid ${INK}`, borderRadius: 0 }} />
                      </div>
                    )}
                    {!pr.blocked && (
                      <div className="flex flex-wrap gap-1.5 items-center">
                        <button data-person-contacted onClick={() => { updatePerson(pr.id, { lastContact: today, snoozeUntil: '' }); pushToast(`Logged: in touch with ${pr.name} today.`, 'success'); }} className="px-2.5 py-1.5 text-[10px] uppercase tracking-wider font-semibold text-white" style={{ background: FOR, borderRadius: 0 }}>In touch today</button>
                        <select data-person-freq aria-label={`How often to be reminded about ${pr.name}`} value={pr.remindEvery || 0} onChange={e => updatePerson(pr.id, { remindEvery: Number(e.target.value), snoozeUntil: '' })} className="bg-transparent px-1.5 py-1 text-[10px]" style={{ border: `1px solid ${INK}`, borderRadius: 0 }}>
                          {REMIND_OPTIONS.map(o => <option key={o.v} value={o.v}>{o.l}</option>)}
                        </select>
                        <button data-person-block onClick={() => updatePerson(pr.id, { blocked: true })} className="px-2.5 py-1.5 text-[10px] uppercase tracking-wider font-semibold" style={{ border: `1px solid ${INK}`, borderRadius: 0 }}>Block</button>
                      </div>
                    )}
                    {pr.blocked ? (
                      <button data-person-unblock onClick={() => updatePerson(pr.id, { blocked: false, lastContact: today })} className="px-2.5 py-1.5 text-[10px] uppercase tracking-wider font-semibold" style={{ border: `1px solid ${INK}`, borderRadius: 0 }}>Unblock</button>
                    ) : (<>
                      {pactFriends.length > 0 && (
                        <select data-person-link aria-label={`Link ${pr.name} to a Pact friend`} value={pr.linkedUserId || ''} onChange={e => updatePerson(pr.id, { linkedUserId: e.target.value })} className="w-full bg-transparent px-1.5 py-1.5 text-[10px]" style={{ border: '1px solid #CFC7B4', borderRadius: 0 }}>
                          <option value="">Not linked to a Pact user</option>
                          {pactFriends.map(f => <option key={f.userId} value={f.userId}>Same person as {f.name} {f.handle}</option>)}
                        </select>
                      )}
                      <input type="text" aria-label={`Notes about ${pr.name}`} placeholder="Notes (company, birthday, what to ask about...)" defaultValue={pr.notes || ''} onBlur={e => { if (e.target.value !== (pr.notes || '')) updatePerson(pr.id, { notes: e.target.value }); }} className="w-full bg-transparent px-2 py-1.5 text-[11px]" style={{ border: '1px solid #CFC7B4', borderRadius: 0 }} />
                    </>)}
                    <button data-person-delete aria-label={`Delete ${pr.name}`} onClick={() => setPeople(prev => prev.filter(x => x.id !== pr.id))} className="text-[10px] uppercase tracking-wider" style={{ color: CLAY, borderRadius: 0 }}>Delete</button>
                  </div>
                );
              };
              const row = (pr, i, due) => {
                const open = peopleOpenId === pr.id; const sl = subLine(pr);
                return (
                  <div key={pr.id}>
                    <div data-person-row className="grid items-center" style={{ gridTemplateColumns: '40px 1fr auto', gap: 12, padding: '10px 0', borderBottom: open ? 'none' : '1px solid #CFC7B4' }}>
                      <button onClick={() => setPeopleOpenId(open ? null : pr.id)} aria-label={`Open ${pr.name}`} style={{ borderRadius: 0 }}>{tile(pr, i)}</button>
                      <button onClick={() => setPeopleOpenId(open ? null : pr.id)} className="text-left min-w-0" style={{ borderRadius: 0 }}>
                        <div className="font-fr truncate" style={{ fontWeight: 600, fontSize: 16, lineHeight: 1.1 }}>{pr.name}</div>
                        <div className="text-[11px] truncate" style={{ marginTop: 2, color: sl.hot ? CLAY : MUT, fontWeight: sl.hot ? 600 : 400 }}>{sl.t}</div>
                      </button>
                      {due && !open ? <button data-person-nudge onClick={() => setPeopleOpenId(pr.id)} className="px-3 h-[30px] text-[11px] font-semibold" style={{ border: `1px solid ${INK}`, borderRadius: 0 }}>Nudge</button> : <button onClick={() => setPeopleOpenId(open ? null : pr.id)} aria-label="Toggle details" style={{ color: '#7C857F', fontSize: 16, borderRadius: 0 }}>{open ? '‹' : '›'}</button>}
                    </div>
                    {open && detail(pr)}
                  </div>
                );
              };
              const optRow = (n, t, sub, k) => (
                <button data-add-opt={k} onClick={() => setAddPane(addPane === k ? '' : k)} className="w-full text-left grid items-center" style={{ gridTemplateColumns: '28px 1fr 14px', gap: 8, padding: '11px 0', borderBottom: '1px solid #CFC7B4', borderRadius: 0 }}>
                  <span className="font-fr" style={{ fontSize: 18, fontWeight: 600, color: CLAY }}>{n}</span>
                  <span><span className="block text-[14px] font-semibold">{t}</span><span className="block text-[11px]" style={{ color: MUT }}>{sub}</span></span>
                  <span style={{ color: '#7C857F' }}>{addPane === k ? '‹' : '›'}</span>
                </button>
              );
              const closeAdd = () => { setPeopleAddOpen(false); setAddPane(''); };
              return (
              <div data-people-tab className="space-y-3">
                <div className="flex gap-2">
                  <div className="flex-1 min-w-0 flex items-center gap-2 px-3 h-10" style={{ border: `1.5px solid ${INK}` }}>
                    <Search size={15} style={{ color: '#7C857F', flex: 'none' }} />
                    <input data-people-search type="search" aria-label="Search people" placeholder="Search people" value={peopleQ} onChange={e => setPeopleQ(e.target.value)} className="flex-1 min-w-0 bg-transparent text-[13px] outline-none" />
                  </div>
                  <button data-people-add-open onClick={() => setPeopleAddOpen(true)} className="px-4 h-10 text-xs font-semibold text-white" style={{ background: FOR, borderRadius: 0 }}>+ Add</button>
                </div>
                <div className="flex justify-between items-center text-[10px] uppercase tracking-[0.14em]">
                  <span className="flex gap-4">
                    {[{ id: 'all', label: 'All' }, { id: 'personal', label: 'Personal' }, { id: 'business', label: 'Business' }].map(f => (
                      <button key={f.id} data-people-filter={f.id} onClick={() => setPeopleFilter(f.id)} style={{ borderRadius: 0, textTransform: 'uppercase', letterSpacing: '0.14em', fontWeight: peopleFilter === f.id ? 700 : 400, color: peopleFilter === f.id ? INK : MUT, borderBottom: peopleFilter === f.id ? `2px solid ${CLAY}` : '2px solid transparent', paddingBottom: 2 }}>{f.label}</button>
                    ))}
                  </span>
                  <span style={{ color: MUT }}>Due first</span>
                </div>
                {peopleFilter === 'blocked' && <div className="text-[11px]" style={{ color: MUT }}>Showing blocked people. <button data-people-filter="all" onClick={() => setPeopleFilter('all')} className="underline" style={{ borderRadius: 0 }}>Back to everyone</button></div>}
                {vis.length === 0 && <p data-people-empty className="text-[12px] leading-relaxed py-3" style={{ color: MUT }}>{peopleFilter === 'blocked' ? 'No one is blocked.' : q ? 'No one matches that search.' : 'No one here yet. Tap + Add to bring in the people who matter.'}</p>}
                {dueList.length > 0 && (<div><div style={{ borderTop: `3px solid ${INK}`, paddingTop: 6 }}><span className="text-[10px] uppercase tracking-[0.14em]" style={{ color: CLAY }}>Due for a catch-up &middot; {dueList.length}</span></div>{dueList.map((pr, i) => row(pr, i, true))}</div>)}
                {restList.length > 0 && (<div><div style={{ borderTop: `3px solid ${INK}`, paddingTop: 6 }}><span className="text-[10px] uppercase tracking-[0.14em]" style={{ color: MUT }}>{peopleFilter === 'blocked' ? 'Blocked' : dueList.length ? 'Everyone else' : 'Everyone'} &middot; {restList.length}</span></div>{restList.map((pr, i) => row(pr, i, false))}</div>)}
                <div className="flex justify-between items-center text-[11px] pt-1" style={{ color: MUT }}>
                  <button data-people-filter="blocked" onClick={() => setPeopleFilter('blocked')} style={{ borderRadius: 0 }}>Blocked &middot; {blockedN} &nbsp;&rsaquo;</button>
                </div>
                <div className="pt-1">
                  <button data-circle-open aria-expanded={circleOpen} onClick={() => setCircleOpen(v => !v)} className="w-full flex justify-between items-center py-2.5 text-left" style={{ borderTop: `3px solid ${INK}`, borderRadius: 0 }}><span className="text-[10px] uppercase tracking-[0.14em]" style={{ color: MUT }}>Family circle{(userProfile.circle && userProfile.circle.members && userProfile.circle.members.length) ? ` \u00b7 ${userProfile.circle.members.length}` : ''}</span><span style={{ color: MUT }}>{circleOpen ? '\u2212' : '+'}</span></button>
                  {circleOpen && <CirclePanel profile={userProfile} patch={patchProfile} people={people} today={today} tasks={tasks} />}
                </div>
                <p className="text-[10px] leading-snug" style={{ color: MUT }}>Blocked people never trigger reminders. Finishing a plan you tagged with someone counts as being in touch.</p>

                {peopleAddOpen && (
                  <Portal>
                    <div data-add-sheet className="fixed inset-0 flex items-end justify-center" style={{ zIndex: 300 }} role="dialog" aria-label="Add someone">
                      <div className="absolute inset-0" style={{ background: 'rgba(27,42,34,.5)' }} onClick={closeAdd} />
                      <div className="relative w-full max-w-md max-h-[90dvh] overflow-y-auto px-6 pt-4 pb-6" style={{ background: '#F4EFE4', borderTop: `3px double ${INK}`, color: INK }}>
                        <div className="flex items-baseline justify-between"><div className="font-fr" style={{ fontWeight: 600, fontSize: 24 }}>Add someone</div><button aria-label="Close" onClick={closeAdd} style={{ fontSize: 22, color: MUT, borderRadius: 0 }}>&times;</button></div>
                        <div className="mt-1.5">
                          {optRow('1', 'On Pact', 'Find them by @username and fill in their details', 'pact')}
                          {addPane === 'pact' && (
                            <div data-add-username className="py-2.5 space-y-2">
                              <div className="flex gap-1.5">
                                <input data-people-username type="text" aria-label="Pact username" placeholder="@username" value={peopleUserQ} onChange={e => { setPeopleUserQ(e.target.value); setPeopleUserRes(null); }} onKeyDown={e => { if (e.key === 'Enter') findPersonByUsername(); }} className="flex-1 min-w-0 bg-transparent px-2.5 py-2 text-sm" style={{ border: `1px solid ${INK}`, borderRadius: 0 }} />
                                <button data-people-username-find onClick={findPersonByUsername} disabled={!peopleUserQ.trim()} className="px-3.5 text-[11px] font-semibold text-white disabled:opacity-50" style={{ background: FOR, borderRadius: 0 }}>Find</button>
                              </div>
                              {peopleUserRes === 'none' && <p className="text-[11px]" style={{ color: MUT }}>No one found with that username. Check the spelling with them.</p>}
                              {peopleUserRes === 'offline' && <p className="text-[11px]" style={{ color: MUT }}>Sign in with an account to look people up.</p>}
                              {peopleUserRes === 'error' && <p className="text-[11px]" style={{ color: MUT }}>Couldn't search just now. Try again.</p>}
                              {peopleUserRes && typeof peopleUserRes === 'object' && (
                                <div data-people-username-result className="p-2.5 space-y-2" style={{ border: '1px solid #CFC7B4' }}>
                                  <div className="flex items-center gap-2.5"><Avatar src={peopleUserRes.avatar} name={peopleUserRes.display_name || peopleUserRes.username} size={40} /><div className="min-w-0"><div className="text-xs font-semibold">{peopleUserRes.display_name || peopleUserRes.username}</div><div className="text-[10px]" style={{ color: MUT }}>@{peopleUserRes.username}{peopleUserRes.bio ? ' • ' + peopleUserRes.bio : ''}</div></div></div>
                                  <div className="flex flex-wrap gap-1.5">
                                    <button data-people-username-add onClick={() => { addUserAsPerson(peopleUserRes); closeAdd(); }} className="px-3 h-[34px] text-[10px] uppercase tracking-wider font-semibold text-white" style={{ background: FOR, borderRadius: 0 }}>Add to Your People</button>
                                    {peopleUserRes.relation === 'none' && <button onClick={() => { sendFriendReq(peopleUserRes.id); }} className="px-3 h-[34px] text-[10px] uppercase tracking-wider font-semibold" style={{ border: `1px solid ${INK}`, borderRadius: 0 }}>Also send friend request</button>}
                                  </div>
                                  <p className="text-[10px] leading-snug" style={{ color: MUT }}>Phone and email stay private unless you type them in yourself.</p>
                                </div>
                              )}
                            </div>
                          )}
                          {optRow('2', 'Import contacts', 'From a phone export (vCard or CSV), or paste a list', 'import')}
                          {addPane === 'import' && (
                            <div className="py-2.5 space-y-2">
                              <div data-import-bar className="flex flex-wrap gap-1.5">
                                {hasPicker && <button data-import-picker onClick={pickContacts} className="px-3 h-[34px] text-[10px] uppercase tracking-wider font-semibold text-white" style={{ background: FOR, borderRadius: 0 }}>Add from phone contacts</button>}
                                <label className="px-3 h-[34px] flex items-center text-[10px] uppercase tracking-wider font-semibold cursor-pointer" style={{ border: `1px solid ${INK}` }}>Import a file<input data-import-file type="file" multiple className="hidden" onChange={onContactFile} /></label>
                                <button data-import-paste-toggle onClick={() => setPasteOpen(o => !o)} className="px-3 h-[34px] text-[10px] uppercase tracking-wider font-semibold" style={{ border: `1px solid ${INK}`, borderRadius: 0 }}>Paste a list</button>
                              </div>
                              {pasteOpen && (
                                <div data-import-paste className="space-y-1.5">
                                  <textarea aria-label="Paste contacts" rows={5} placeholder={'One person per line:\nMaya Lin, 07700 900123, maya@example.com\nSam Patel, 07911 123456'} value={pasteText} onChange={e => setPasteText(e.target.value)} className="w-full bg-transparent px-2.5 py-2 text-xs" style={{ border: `1px solid ${INK}`, borderRadius: 0 }} />
                                  <button data-import-paste-go onClick={importPasted} disabled={!pasteText.trim()} className="px-3.5 h-[34px] text-[10px] uppercase tracking-wider font-semibold text-white disabled:opacity-50" style={{ background: FOR, borderRadius: 0 }}>Review</button>
                                </div>
                              )}
                              {importMsg && <p data-import-msg className="text-[11px] leading-snug" style={{ color: CLAY }}>{importMsg}</p>}
                              <p className="text-[10px] leading-snug" style={{ color: MUT }}>{hasPicker ? 'Add from phone contacts opens your phone\'s own list so you can tick several people. ' : 'This browser can\'t open your phone contacts directly (only Chrome on Android can). '}On iPhone, export from icloud.com/contacts (Select all, then Export vCard) and import the file here.</p>
                              {importList && (
                                <div data-import-preview className="p-3 space-y-2" style={{ border: `1px solid ${INK}` }}>
                                  <div className="flex justify-between items-center">
                                    <span className="text-[10px] uppercase tracking-[0.14em] font-semibold">Choose who to add ({importList.filter(x => x.sel).length}/{importList.length})</span>
                                    <span className="flex gap-2 text-[10px] underline" style={{ color: MUT }}><button onClick={() => setImportList(importList.map(x => ({ ...x, sel: true })))}>All</button><button onClick={() => setImportList(importList.map(x => ({ ...x, sel: false })))}>None</button></span>
                                  </div>
                                  <div className="max-h-48 overflow-y-auto space-y-1">
                                    {importList.map((x, i) => (
                                      <label key={i} data-import-row className="flex items-center gap-2 text-xs px-2 py-1.5" style={{ border: '1px solid #CFC7B4' }}>
                                        <input type="checkbox" checked={x.sel} onChange={() => setImportList(importList.map((y, j) => j === i ? { ...y, sel: !y.sel } : y))} />
                                        <span className="min-w-0"><span className="font-semibold">{x.name}</span><span className="block text-[10px] truncate" style={{ color: MUT }}>{[x.phone, x.email].filter(Boolean).join(' • ')}</span></span>
                                      </label>
                                    ))}
                                  </div>
                                  <div className="flex gap-1.5"><button data-import-confirm onClick={() => { addImported(); closeAdd(); }} className="px-3.5 h-[34px] text-[10px] uppercase tracking-wider font-semibold text-white" style={{ background: FOR, borderRadius: 0 }}>Add selected</button><button onClick={() => setImportList(null)} className="px-3.5 h-[34px] text-[10px] uppercase tracking-wider font-semibold" style={{ border: `1px solid ${INK}`, borderRadius: 0 }}>Cancel</button></div>
                                </div>
                              )}
                            </div>
                          )}
                          {optRow('3', 'Type it in', 'Name, how you know them, how often to nudge', 'type')}
                        </div>
                        <div className="mt-3 space-y-2" data-add-quick>
                          <span className="text-[10px] uppercase tracking-[0.14em]" style={{ color: MUT }}>Quick add</span>
                          <div className="flex gap-2">
                            <input data-person-name type="text" aria-label="Name" placeholder="Name" value={personDraft.name} onChange={e => setPersonDraft({ ...personDraft, name: e.target.value })} onKeyDown={e => { if (e.key === 'Enter') { addPerson(); closeAdd(); } }} className="flex-1 min-w-0 bg-transparent px-3 h-10 text-[13px]" style={{ border: `1.5px solid ${INK}`, borderRadius: 0 }} />
                            <div className="flex">
                              {[{ id: 'personal', label: 'Personal' }, { id: 'business', label: 'Business' }].map(k => <button key={k.id} data-person-kind={k.id} onClick={() => setPersonDraft({ ...personDraft, kind: k.id })} className="px-2.5 h-10 text-[11px] font-semibold" style={{ borderRadius: 0, background: personDraft.kind === k.id ? FOR : 'transparent', color: personDraft.kind === k.id ? '#F4EFE4' : INK, border: `1px solid ${personDraft.kind === k.id ? FOR : INK}` }}>{k.label}</button>)}
                            </div>
                          </div>
                          {(addPane === 'type' || personDraft.relation || personDraft.phone || personDraft.whatsapp || personDraft.email) ? (
                            <div className="space-y-1.5">
                              <input type="text" aria-label="Relationship" placeholder={personDraft.kind === 'business' ? 'e.g. Client, Recruiter, Mentor, Supplier' : 'e.g. Cousin, Old friend, Neighbour'} value={personDraft.relation} onChange={e => setPersonDraft({ ...personDraft, relation: e.target.value })} className="w-full bg-transparent px-3 h-9 text-xs" style={{ border: '1px solid #CFC7B4', borderRadius: 0 }} />
                              <div className="grid grid-cols-3 gap-1.5">
                                <input data-person-phone type="tel" aria-label="Phone" placeholder="Phone" value={personDraft.phone} onChange={e => setPersonDraft({ ...personDraft, phone: e.target.value })} className="min-w-0 bg-transparent px-2 h-9 text-xs" style={{ border: '1px solid #CFC7B4', borderRadius: 0 }} />
                                <input data-person-whatsapp type="tel" aria-label="WhatsApp" placeholder="WhatsApp" value={personDraft.whatsapp} onChange={e => setPersonDraft({ ...personDraft, whatsapp: e.target.value })} className="min-w-0 bg-transparent px-2 h-9 text-xs" style={{ border: '1px solid #CFC7B4', borderRadius: 0 }} />
                                <input data-person-email type="email" aria-label="Email" placeholder="Email" value={personDraft.email} onChange={e => setPersonDraft({ ...personDraft, email: e.target.value })} className="min-w-0 bg-transparent px-2 h-9 text-xs" style={{ border: '1px solid #CFC7B4', borderRadius: 0 }} />
                              </div>
                            </div>
                          ) : <button onClick={() => setAddPane('type')} className="text-[11px]" style={{ color: MUT, borderRadius: 0 }}>+ Phone, WhatsApp, email (optional)</button>}
                          <div className="flex gap-2">
                            <select aria-label="How often to be reminded" value={personDraft.remindEvery} onChange={e => setPersonDraft({ ...personDraft, remindEvery: Number(e.target.value) })} className="flex-1 min-w-0 bg-transparent px-3 h-10 text-[13px]" style={{ border: `1.5px solid ${INK}`, borderRadius: 0 }}>
                              {REMIND_OPTIONS.map(o => <option key={o.v} value={o.v}>{o.l}</option>)}
                            </select>
                            <button data-person-add onClick={() => { addPerson(); closeAdd(); }} disabled={!personDraft.name.trim()} className="px-6 h-10 text-xs font-semibold text-white disabled:opacity-50" style={{ background: FOR, borderRadius: 0 }}>Add</button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Portal>
                )}
              </div>
              );
            })()}

          </div>
        )}

        {/* =========================================================
            TAB 7: PROFILE (ACCOUNT, FRIENDS, RETIRED/UNEMPLOYED, DATA)
           ========================================================= */}
        {activeTab === 'profile' && (
          <div className="np-skin space-y-4 animate-in fade-in duration-300">

            {profileScreen !== null && (
              <div data-profile-screen={profileScreen}>
                <button data-profile-back onClick={() => setProfileScreen(null)} className="flex items-center gap-1 text-[13px] font-semibold"><span className="text-xl leading-none -translate-y-px">&lsaquo;</span>Profile</button>
                <div className="border-t-[3px] border-double border-slate-900 mt-2.5" />
                <h2 className="font-editorial !font-semibold text-[30px] leading-[1.02] mt-3" style={{ letterSpacing: '-0.02em' }}>{({ home: 'Home and look', reminders: 'Reminders', calendar: 'Calendar and hours', place: 'Location and places', you: 'About you', friends: 'What friends can see', health: 'Health records', privacy: 'Privacy and data', advanced: 'Assistant and advanced' })[profileScreen]}</h2>
              </div>
            )}
            {profileScreen === 'you' && <LifePanel profile={userProfile} patch={patchProfile} />}

            {true && (
              <div className="space-y-4">
                {/* Press pass */}
                {profileScreen === null && (
                <>
                <div data-press-pass className="border border-slate-900 bg-[#FAF8F2]">
                  <div className="bg-slate-900 text-[#F4EFE4] px-3 py-1.5 text-[10px] tracking-[0.2em] uppercase flex justify-between items-center"><span>The Pact · Press</span><button data-press-edit aria-label={pressEdit ? 'Close editing' : 'Edit your press card'} onClick={() => { setPressEdit(v => !v); setProfileMsg(''); }} className="uppercase tracking-[0.2em] underline underline-offset-2">{pressEdit ? 'Close' : 'Edit'}</button></div>
                  <div className="p-3.5 flex gap-3.5">
                    {pressEdit ? (
                      <label data-press-photo className="relative shrink-0 cursor-pointer block" style={{ width: 104, height: 124 }}>
                        <Mug src={myProfile.avatar} name={accountInfo.name} w={104} h={124} />
                        <input data-avatar-input type="file" accept="image/*" className="hidden" onChange={async e => { const f = e.target.files && e.target.files[0]; if (!f) return; try { const d = await shrinkImage(f); const dLow = await shrinkImage(f, 480, 58000); setMyProfile(prev => ({ ...prev, avatar: d, avatarLow: dLow })); setProfileMsg(''); } catch (err) { setProfileMsg("That file couldn't be used as a picture."); } e.target.value = ''; }} />
                        <span className="absolute left-0 right-0 bottom-0 text-center text-[9px] uppercase tracking-wider bg-slate-900/85 text-[#F4EFE4] py-1.5">{myProfile.avatar ? 'Change photo' : 'Add photo'}</span>
                      </label>
                    ) : (
                      <button type="button" onClick={() => setPressEdit(true)} aria-label="Edit your photo" className="shrink-0 block"><Mug src={myProfile.avatar} name={accountInfo.name} w={104} h={124} /></button>
                    )}
                    <div className="min-w-0 flex-1">
                      {pressEdit ? (
                        <input data-press-name type="text" aria-label="Your name" placeholder="Your name" value={accountInfo.name} onChange={e => setAccountInfo({ ...accountInfo, name: e.target.value })} className="w-full font-editorial text-[22px] leading-[1.05] bg-white border border-slate-900 px-2 py-1" style={{ fontFamily: "Fraunces, serif", fontWeight: 600 }} />
                      ) : (
                        <div className="font-editorial text-[24px] leading-[1.02] break-words">{accountInfo.name || 'Your name'}</div>
                      )}
                      <div className="text-[12px] text-stone-500 mt-1 break-all">{accountInfo.username ? String(accountInfo.username).replace(/^@?/, '@') : ''}</div>
                      <div className="np-sc mt-2.5">Editor of</div><div className="text-[13px]">Your own life</div>
                      <div className="np-sc mt-2">Based in</div><div className="text-[13px]">{getLoc(userProfile).city}</div>
                      {pressEdit && myProfile.avatar && <button type="button" onClick={() => setMyProfile(prev => ({ ...prev, avatar: '' }))} className="block text-[10px] text-stone-500 underline mt-2">Remove photo</button>}
                    </div>
                  </div>
                  <div className="px-3.5 pb-3.5"><div className="np-barcode" /></div>
                </div>
                </>
                )}
                {profileScreen === null && (
                <>
                {pressEdit ? (
                  <div data-profile-card className="space-y-2">
                    <textarea data-bio-input aria-label="A short description of you" rows={3} maxLength={280} placeholder="A short description friends will see (up to 280 characters)" value={myProfile.bio} onChange={e => { setMyProfile(prev => ({ ...prev, bio: e.target.value })); setProfileMsg(''); }} className="w-full bg-[#FAF8F2] border border-slate-900 px-3 py-2 text-[14px] font-editorial italic" />
                    <div className="flex items-center gap-2">
                      <button data-profile-save onClick={async () => {
                      if (!authUser || !authUser.cloud) { setProfileMsg('Sign in with an account to share your picture and description with friends.'); return; }
                      try { let r = await cloud.setMyProfile(myProfile.bio, myProfile.avatar); let small = false; if (r === 'picture_too_big' && myProfile.avatarLow && myProfile.avatarLow !== myProfile.avatar) { r = await cloud.setMyProfile(myProfile.bio, myProfile.avatarLow); if (r === 'ok') { small = true; setMyProfile(prev => ({ ...prev, avatar: prev.avatarLow })); } } if (small) { setProfileMsg('Saved, at a smaller size. Run the photo upgrade in Supabase for sharper pictures.'); return; } setProfileMsg(r === 'ok' ? 'Saved. Your friends can now see it.' : r === 'picture_too_big' ? 'That picture is too large. Try a different one.' : 'Could not save. Try again.'); } catch (e) { setProfileMsg("Couldn't save. If this keeps happening, the latest database update hasn't been run yet."); }
                    }} className="px-4 py-2 bg-slate-900 text-[#F4EFE4] text-[10px] uppercase tracking-[0.18em] font-medium">Save</button>
                      {profileMsg && <span data-profile-msg className="text-[11px] text-stone-600">{profileMsg}</span>}
                    </div>
                    <p className="text-[10px] text-stone-500 leading-snug">Only your friends on Pact can see your photo and description.</p>
                  </div>
                ) : myProfile.bio ? (
                  <div className="flex gap-2.5 items-start"><span className="font-editorial text-[44px] leading-[.7] text-rose-700 select-none">&ldquo;</span><p data-press-bio className="font-editorial italic text-[15px] leading-snug" style={{ fontWeight: 400 }}>{myProfile.bio}</p></div>
                ) : (
                  <button onClick={() => setPressEdit(true)} className="text-[12px] text-stone-500 underline text-left">Add a short description friends will see</button>
                )}
                </>
                )}
                {profileScreen === null && (
                  <div data-profile-hub>
                    <div className="border-t-[3px] border-slate-900 pt-1.5 np-sc">The app</div>
                    {[
                      ['home', 'Home and look', (homeLayout.order.length - homeLayout.hidden.length) + ' widgets on, text size, voice button'],
                      ['reminders', 'Reminders', reminderCfg.enabled ? reminderCfg.leadMins + ' min before plans' : 'Off'],
                      ['calendar', 'Calendar and hours', 'Sync, work and study times'],
                      ['place', 'Location and places', [getLoc(userProfile).city, userProfile.location && userProfile.location.postcode].filter(Boolean).join(' · ') + (userProfile.autoLocation ? ' · auto' : '')],
                      ['you', 'About you', 'Account, situation, getting-ready times']
                    ].map(([id, t, d]) => (
                      <button key={id} data-profile-row={id} onClick={() => setProfileScreen(id)} className="w-full flex items-center gap-2 py-3 border-b border-stone-300 text-left">
                        <span className="flex-1 min-w-0"><span className="block font-editorial !font-semibold text-[17px] leading-tight">{t}</span><span className="block text-[11.5px] text-stone-500 mt-0.5 truncate">{d}</span></span>
                        <span className="text-stone-400 text-xl leading-none">&rsaquo;</span>
                      </button>
                    ))}
                    <div className="border-t-[3px] border-slate-900 pt-1.5 np-sc mt-4">Your people and data</div>
                    {[
                      ['friends', 'What friends can see', shareCfg.acts === 'off' ? 'Private' : shareCfg.acts === 'busy' ? 'Busy only' : 'With titles'],
                      ['health', 'Health records and exports', userProfile.healthConsent ? 'Mood, nutrition, medicine · you agreed' : 'Mood and nutrition records, export'],
                      ['privacy', 'Privacy and data', 'How it works, your rights']
                    ].map(([id, t, d]) => (
                      <button key={id} data-profile-row={id} onClick={() => setProfileScreen(id)} className="w-full flex items-center gap-2 py-3 border-b border-stone-300 text-left">
                        <span className="flex-1 min-w-0"><span className="block font-editorial !font-semibold text-[17px] leading-tight">{t}</span><span className="block text-[11.5px] text-stone-500 mt-0.5 truncate">{d}</span></span>
                        <span className="text-stone-400 text-xl leading-none">&rsaquo;</span>
                      </button>
                    ))}
                    <div className="flex justify-between text-[12px] text-stone-500 pt-3">
                      <button data-profile-row="advanced" onClick={() => setProfileScreen('advanced')} className="underline">Assistant and advanced</button>
                      <button data-profile-signout onClick={handleSignOut} className="underline">{authUser && authUser.guest ? 'Create a real account' : 'Sign out'}</button>
                    </div>
                  </div>
                )}
                {/* Install */}
                {profileScreen === 'home' && (
                  <button data-profile-widgets onClick={() => { setActiveTab('home'); setProfileScreen(null); setWidgetPanelOpen(true); }} className="w-full flex items-center gap-2 py-3 border-b border-stone-300 text-left">
                    <span className="flex-1"><span className="block font-editorial !font-semibold text-[17px] leading-tight">Widgets</span><span className="block text-[11.5px] text-stone-500 mt-0.5">Add, remove and reorder what shows on Home</span></span>
                    <span className="text-stone-400 text-xl leading-none">&rsaquo;</span>
                  </button>
                )}
                {profileScreen === 'health' && (
                  <div data-health-consent-card className="p-4 bg-white border border-stone-200 space-y-2">
                    <span className="text-[10px] uppercase tracking-widest text-purple-800 font-medium">Your agreement</span>
                    <p className="text-[11.5px] text-stone-700 leading-snug">{userProfile.healthConsent ? 'You agreed to let The Pact store health information (medicine and energy or mood). Only you can see it. It is never shared with friends or sent to the assistant.' : 'You have not agreed to store health information, so Medicine and Energy check-in are off. You can switch them on from Home > Widgets and will be asked then.'}</p>
                    {userProfile.healthConsent && <button data-health-withdraw onClick={() => { patchProfile({ healthConsent: false, healthConsentAt: '' }); setHomeLayout(p => ({ ...p, hidden: Array.from(new Set([...p.hidden, ...HEALTH_IDS])) })); pushToast('Agreement withdrawn. Medicine and Energy check-in are hidden.', 'success'); }} className="px-3 py-1.5 border border-stone-400 text-[10px] uppercase tracking-wider font-medium">Withdraw and hide them</button>}
                  </div>
                )}
                {profileScreen === 'home' && (
                <>
                {!isStandalone && (
                  <div data-install-card className="p-4 bg-white border border-stone-200 space-y-2">
                    <span className="text-[10px] uppercase tracking-widest text-purple-800 font-medium">Add Pact to your home screen</span>
                    {installEvt ? (
                      <button data-install-btn onClick={installApp} className="w-full py-2 bg-purple-900 text-white text-[11px] uppercase tracking-widest font-medium">Install Pact</button>
                    ) : isIos ? (
                      <p className="text-[11px] text-stone-600 leading-relaxed">On iPhone or iPad, open Pact in Safari, tap the Share button, then "Add to Home Screen".</p>
                    ) : (
                      <p className="text-[11px] text-stone-600 leading-relaxed">In Chrome, open the browser menu (three dots) and choose "Install app" or "Add to Home screen". On Samsung Internet, use the menu and "Add page to" then "Home screen".</p>
                    )}
                  </div>
                )}
                </>
                )}

                {/* Privacy & your data */}
                {profileScreen === 'privacy' && (
                <>
                <div className="p-4 bg-white border border-stone-200 space-y-2">
                  <span className="text-[10px] uppercase tracking-widest text-purple-800 font-medium">Privacy &amp; your data</span>
                  <p className="text-[11px] text-stone-600 leading-relaxed">What Pact stores, who can see it, and your rights. Export your data under the Data tab. Delete your account with the button in Personal Account below.</p>
                  <div className="flex gap-2">
                    <button data-open-privacy onClick={() => setShowPrivacyNotice(true)} className="px-3 py-1.5 border border-stone-400 text-[10px] uppercase tracking-wider font-medium">Read the privacy notice</button>
                    <button onClick={() => setProfileScreen('health')} className="px-3 py-1.5 border border-stone-400 text-[10px] uppercase tracking-wider font-medium">Export my data</button>
                  </div>
                </div>
                </>
                )}

                {/* Appearance */}
                {profileScreen === 'home' && (
                <>
                <div data-theme-card className="p-4 bg-white border border-stone-200 space-y-3">
                  <span className="text-[10px] uppercase tracking-widest text-purple-800 font-medium">Appearance</span>
                  <div className="grid grid-cols-3 gap-1.5">
                    {[['light', 'Light'], ['dark', 'Dark'], ['auto', 'Match my device']].map(([id, label]) => (
                      <button key={id} data-theme-mode={id} aria-pressed={themeNow.mode === id} onClick={() => setTheme({ mode: id })}
                        className={`px-2 py-2 text-[11px] border ${themeNow.mode === id ? 'bg-blue-800 text-white border-blue-800' : 'bg-[#FAF8F5] text-slate-700 border-stone-200'}`}>{label}</button>
                    ))}
                  </div>
                  <div className="space-y-1.5">
                    {['ember', 'maple', 'harvest', 'woodland', 'mocha', 'plum', 'rosewood', 'teal', 'midnight', 'sage', 'graphite', 'classic'].map(id => {
                      const pal = THEME_PALETTES[id];
                      const dk = resolveThemeMode(themeNow.mode) === 'dark';
                      const sw = [`hsl(${pal.nh} ${pal.ns}% ${dk ? 10 : 94}%)`, `hsl(${pal.p[0]} ${pal.p[1]}% ${dk ? 40 : 38}%)`, `hsl(${pal.s[0]} ${pal.s[1]}% ${dk ? 40 : 38}%)`, `hsl(${pal.t[0]} ${pal.t[1]}% ${dk ? 45 : 48}%)`];
                      return (
                        <button key={id} data-theme-palette={id} aria-pressed={themeNow.palette === id} onClick={() => setTheme({ palette: id })}
                          className={`w-full flex items-center gap-3 p-2 border text-left ${themeNow.palette === id ? 'border-blue-800 border-2' : 'border-stone-200'}`}>
                          <span className="flex shrink-0 border border-stone-300">{sw.map((c, i) => <span key={i} style={{ background: c, width: 18, height: 26, display: 'block' }} />)}</span>
                          <span className="flex-1 min-w-0"><span className="block text-xs font-medium text-slate-900">{pal.name}</span><span className="block text-[10px] text-stone-500">{pal.hint}</span></span>
                          {themeNow.palette === id && <span className="text-[10px] uppercase tracking-wider text-blue-800 font-medium">On</span>}
                        </button>
                      );
                    })}
                  </div>
                </div>
                </>
                )}

                {profileScreen === 'friends' && (
                <>
                <div data-share-card className="p-4 bg-white border border-stone-200 space-y-3">
                  <span className="text-[10px] uppercase tracking-widest text-purple-800 font-medium">What friends can see today</span>
                  <p className="text-[11px] text-stone-600 leading-snug">Friends can open your profile and see a daily mood and what you're up to. Everything starts switched off. Only what you allow here is ever sent, and plans you mark Private never are.</p>
                  <label className="flex items-center justify-between gap-3 text-xs"><span>Show my mood for the day</span><input data-share-mood type="checkbox" checked={!!shareCfg.mood} onChange={e => setShareCfg({ mood: e.target.checked })} /></label>
                  <div className="space-y-1.5">
                    <div className="text-xs">Show my plans for today</div>
                    <div className="grid grid-cols-3 border border-stone-300">
                      {[{ id: 'off', l: 'Off' }, { id: 'busy', l: 'Busy only' }, { id: 'titles', l: 'With titles' }].map(o => <button key={o.id} data-share-acts={o.id} onClick={() => setShareCfg({ acts: o.id })} className={`py-1.5 text-[10px] uppercase tracking-wider ${shareCfg.acts === o.id ? 'bg-purple-900 text-white' : 'hover:bg-stone-100'}`}>{o.l}</button>)}
                    </div>
                    {shareCfg.acts !== 'off' && (
                      <div className="flex items-center gap-2 text-[11px] text-stone-600 flex-wrap">Only between <input data-share-from type="time" aria-label="Show plans from" value={shareCfg.from} onChange={e => setShareCfg({ from: e.target.value })} className="bg-[#FAF8F5] border border-stone-300 px-1.5 py-1 text-xs" /> and <input data-share-to type="time" aria-label="Show plans until" value={shareCfg.to} onChange={e => setShareCfg({ to: e.target.value })} className="bg-[#FAF8F5] border border-stone-300 px-1.5 py-1 text-xs" /><button onClick={() => setShareCfg({ from: '', to: '' })} className="underline">all day</button></div>
                    )}
                    <p className="text-[10px] text-stone-500 leading-snug">"Busy only" shows time blocks with no titles. You can also mark any single plan Private from the Schedule tab.</p>
                  </div>
                </div>
                </>
                )}

                {profileScreen === 'home' && (
                <>
                <div data-voice-help className="p-4 bg-white border border-stone-200 space-y-2">
                  <span className="text-[10px] uppercase tracking-widest text-purple-800 font-medium">One-tap voice button on your home screen</span>
                  <p className="text-[11px] text-stone-600 leading-snug">A web app can't put a real widget on your phone, but these do the same job:</p>
                  <p className="text-[11px] text-slate-800 leading-snug"><strong>iPhone:</strong> open the Shortcuts app, make a new shortcut with three actions: Dictate Text, then URL Encode (of the Dictated Text), then Open URLs with <span className="font-mono break-all">{typeof window !== 'undefined' ? window.location.origin : ''}/?add=</span> followed by the encoded text. Name it "Add to Pact", then add it to your Home Screen or as a Shortcuts widget. You speak, it opens Pact and adds the plan.</p>
                  <p className="text-[11px] text-slate-800 leading-snug"><strong>Android (Chrome):</strong> open <span className="font-mono break-all">{typeof window !== 'undefined' ? window.location.origin : ''}/?voice=1</span>, tap the menu, then Add to Home screen. That icon opens straight to the microphone. If Pact is installed, long-pressing its icon also shows "Add a plan by voice".</p>
                  <button onClick={() => copyText((typeof window !== 'undefined' ? window.location.origin : '') + '/?add=', 'Link copied.')} className="px-3 py-1.5 border border-stone-400 text-[10px] uppercase tracking-wider">Copy the iPhone link</button>
                </div>
                </>
                )}

                {/* Account Details & Sign-Up */}
                {profileScreen === 'you' && (
                <>
                <div className="p-4 bg-white border border-stone-200 space-y-3">
                  <span className="text-[10px] uppercase tracking-widest text-purple-800 font-medium">Personal Account</span>
                  <div className="space-y-2">
                    <input
                      type="text"
                      placeholder="Full Name"
                      value={accountInfo.name}
                      onChange={e => setAccountInfo({ ...accountInfo, name: e.target.value })}
                      className="w-full bg-[#FAF8F5] border border-stone-300 px-2.5 py-1.5 text-xs"
                    />
                    <input
                      type="text"
                      placeholder="Username (@handle)"
                      value={accountInfo.username}
                      onChange={e => setAccountInfo({ ...accountInfo, username: e.target.value })}
                      onBlur={e => saveHandle(e.target.value)}
                      className="w-full bg-[#FAF8F5] border border-stone-300 px-2.5 py-1.5 text-xs"
                    />
                    {usernameMsg && <p data-username-msg className="text-[11px] text-stone-600 leading-snug">{usernameMsg}</p>}
                    {authUser && authUser.guest ? (
                      <input
                        type="email"
                        placeholder="Email Address"
                        value={accountInfo.email}
                        onChange={e => setAccountInfo({ ...accountInfo, email: e.target.value })}
                        className="w-full bg-[#FAF8F5] border border-stone-300 px-2.5 py-1.5 text-xs"
                      />
                    ) : (
                      <div className="w-full bg-stone-100 border border-stone-300 px-2.5 py-1.5 text-xs text-slate-600 flex justify-between gap-2">
                        <span className="truncate">{authUser ? authUser.email : accountInfo.email}</span>
                        <span className="text-[10px] uppercase tracking-wider text-purple-800 font-medium shrink-0">Your login</span>
                      </div>
                    )}
                  </div>
                  {authUser && authUser.cloud && <p data-sync-status className="text-[10px] text-stone-500">{{ idle: 'Signed in. Your data syncs online.', saving: 'Saving...', saved: 'All changes saved online.', offline: 'Offline. Changes are kept on this device and will sync when you reconnect.', error: 'Could not sync just now. Retrying. Your changes are safe on this device.' }[syncStatus]}</p>}
                  <div className="flex gap-2 pt-1">
                    <button
                      onClick={handleSignOut}
                      className="flex-1 py-1.5 bg-slate-900 hover:bg-purple-900 text-white text-[10px] uppercase tracking-widest font-medium flex items-center justify-center gap-1.5"
                    >
                      <LogOut size={12} /> {authUser && authUser.guest ? 'Create a real account' : 'Sign out'}
                    </button>
                    {authUser && !authUser.guest && (
                      <button
                        onClick={() => { if (confirmDelete) handleDeleteAccount(); else setConfirmDelete(true); }}
                        className="px-3 py-1.5 border border-rose-300 text-rose-800 text-[10px] uppercase tracking-widest font-medium"
                      >
                        {confirmDelete ? 'Tap again to delete' : 'Delete account'}
                      </button>
                    )}
                  </div>
                </div>
                </>
                )}

                {/* Current Life Status (Includes Retired & Unemployed) */}
                {profileScreen === 'you' && (
                <>
                <div className="p-4 bg-white border border-stone-200 space-y-2.5">
                  <span className="text-[10px] uppercase tracking-widest text-blue-800 font-medium">Current Context Status</span>
                  <div className="grid grid-cols-2 gap-1.5">
                    {[
                      'University Student',
                      'Full-Time Professional',
                      'Shift / Gig Worker',
                      'Retired',
                      'Unemployed / Exploring'
                    ].map(st => (
                      <button
                        key={st}
                        onClick={() => setUserProfile({ ...userProfile, status: st })}
                        className={`p-2 text-xs text-left border ${
                          userProfile.status === st ? 'bg-blue-800 text-white border-blue-800' : 'bg-[#FAF8F5] text-slate-700 border-stone-200'
                        }`}
                      >
                        {st}
                      </button>
                    ))}
                  </div>
                </div>
                </>
                )}

                {/* Getting Ready Buffer Times */}
                {profileScreen === 'calendar' && (
                <>
                <div className="p-4 bg-white border border-stone-200 space-y-3">
                  <span className="text-[10px] uppercase tracking-widest text-rose-700 font-medium">Getting-Ready Buffer Estimator</span>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-2.5 bg-[#FAF8F5] border border-stone-200">
                      <label className="text-[10px] text-stone-500 block">Casual Meetup Prep</label>
                      <div className="flex items-center gap-1 mt-1">
                        <input
                          type="number"
                          value={userProfile.prepTimeCasual}
                          onChange={e => setUserProfile({ ...userProfile, prepTimeCasual: Number(e.target.value) })}
                          className="w-14 bg-white border border-stone-300 px-2 py-1 text-xs font-mono"
                        />
                        <span className="text-xs">mins</span>
                      </div>
                    </div>
                    <div className="p-2.5 bg-[#FAF8F5] border border-stone-200">
                      <label className="text-[10px] text-stone-500 block">Serious / Date Night Prep</label>
                      <div className="flex items-center gap-1 mt-1">
                        <input
                          type="number"
                          value={userProfile.prepTimeSerious}
                          onChange={e => setUserProfile({ ...userProfile, prepTimeSerious: Number(e.target.value) })}
                          className="w-14 bg-white border border-stone-300 px-2 py-1 text-xs font-mono"
                        />
                        <span className="text-xs">mins</span>
                      </div>
                    </div>
                  </div>
                </div>
                </>
                )}

                {profileScreen === 'place' && (
                <>
                <div data-profile-location className="p-4 bg-white border border-stone-200 space-y-2">
                  <span className="text-[10px] uppercase tracking-widest text-purple-800 font-medium">Location</span>
                  <h4 className="text-xs font-medium">Where you are right now</h4>
                  <p className="text-[11px] text-stone-600 leading-relaxed">Ideas, Surprise Me, event venues and Roamie's answers are all tuned to this place. Changing it also switches the suggestions list.</p>
                  <LocationPicker value={userProfile.location} onChange={l => { setUserProfile(prev => ({ ...prev, location: l })); pushToast(`Location set to ${l.city}.`, 'success'); }} />
                  <button type="button" data-auto-location aria-pressed={!!userProfile.autoLocation} onClick={() => patchProfile({ autoLocation: !userProfile.autoLocation })} className="mt-2 w-full flex items-center justify-between text-left p-2.5 border border-stone-300 bg-white"><span><span className="block text-xs font-medium">Keep my location up to date</span><span className="block text-[10px] text-stone-500">Only while the app is open. Updates when you move about half a kilometre.</span></span><span className={`w-10 h-5 border border-slate-900 relative shrink-0 ${userProfile.autoLocation ? 'bg-purple-900' : ''}`}><span className="absolute top-0.5 w-3.5 h-3.5 bg-white border border-slate-900" style={{ left: userProfile.autoLocation ? 22 : 2 }} /></span></button>
                </div>
                </>
                )}

                {profileScreen === 'advanced' && (
                <>
                <div data-gkey-card className="p-4 bg-white border border-stone-200 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div><span className="text-[10px] uppercase tracking-widest text-purple-800 font-medium">Web search</span><h4 className="text-xs font-medium mt-0.5">Works out of the box</h4></div>
                    <span className={`px-2.5 py-1 text-[10px] uppercase tracking-wider font-medium shrink-0 ${gKey ? 'bg-purple-900 text-white' : 'bg-stone-200 text-slate-700'}`}>{gKey ? 'AI key saved' : 'No key needed'}</span>
                  </div>
                  <p className="text-[11px] text-stone-600 leading-relaxed">Roamie and Ideas find real places (OpenStreetMap), facts (Wikipedia) and the weather (Open-Meteo) with no key or sign-up. Optional: add a free Gemini key from aistudio.google.com/apikey for richer, conversational AI answers. It is saved only in this browser.</p>
                  <div className="flex gap-2">
                    <input type="password" autoComplete="off" aria-label="Gemini API key" placeholder="Optional AI key (starts with AIza)" value={gKeyDraft} onChange={e => setGKeyDraft(e.target.value)} className="flex-1 min-w-0 bg-[#FAF8F5] border border-stone-300 px-2.5 py-1.5 text-xs" />
                    <button data-gkey-save onClick={() => { saveGKey(gKeyDraft); setGKeyDraft(''); runSearchTest(); }} disabled={!gKeyDraft.trim()} className="px-3 py-1.5 bg-purple-900 text-white text-[10px] uppercase tracking-wider font-medium shrink-0 disabled:opacity-40">Save &amp; test</button>
                  </div>
                  <div className="flex gap-3 items-center flex-wrap">
                    <button onClick={runSearchTest} disabled={searchTest.busy} className="text-[10px] uppercase tracking-wider underline text-purple-900">{searchTest.busy ? 'Testing...' : 'Test web search'}</button>
                    {gKey && <button data-gkey-remove onClick={() => { saveGKey(''); setSearchTest({ busy: false, msg: 'Key removed.' }); }} className="text-[10px] uppercase tracking-wider underline text-rose-800">Remove key</button>}
                  </div>
                  {searchTest.msg && <p className="text-[11px] text-slate-700 leading-snug">{searchTest.msg}</p>}
                </div>
                </>
                )}

                {profileScreen === 'home' && (
                <>
                <div data-text-size className="p-4 bg-white border border-stone-200 space-y-2">
                  <div><span className="text-[10px] uppercase tracking-widest text-purple-800 font-medium">Text size</span><p className="text-[11px] text-stone-600 mt-0.5">Make everything bigger and easier to read. Saved on this device.</p></div>
                  <div className="flex gap-2">
                    {[[1, 'Standard'], [1.15, 'Large'], [1.3, 'Extra large']].map(([v, l]) => (
                      <button key={v} data-text-size-opt={v} onClick={() => setTextScale(v)} className={`flex-1 py-2 border text-[11px] font-medium ${textScale === v ? 'bg-purple-900 text-white border-purple-900' : 'border-stone-300'}`}>{l}</button>
                    ))}
                  </div>
                </div>
                </>
                )}

                {profileScreen === 'advanced' && (
                <>
                <div className="p-4 bg-white border border-stone-200 flex items-center justify-between gap-3">
                  <div><span className="text-[10px] uppercase tracking-widest text-purple-800 font-medium">Quick setup</span><p className="text-[11px] text-stone-600 mt-0.5">Redo the welcome questions any time.</p></div>
                  <button data-rerun-setup onClick={() => { setActiveTab('home'); openSetup(); }} className="px-3 py-1.5 border border-stone-300 text-[10px] uppercase tracking-wider font-medium shrink-0">Run setup</button>
                </div>
                </>
                )}

                {/* Reminders */}
                {profileScreen === 'reminders' && <PushCheck cloud={cloud} enable={enableDeviceNotifications} standalone={isStandalone} />}
                {profileScreen === 'reminders' && (
                <>
                <div className="p-4 bg-white border border-stone-200 space-y-3">
                  <div className="flex justify-between items-start gap-2">
                    <div>
                      <span className="text-[10px] uppercase tracking-widest text-purple-800 font-medium">Reminders</span>
                      <h4 className="text-xs font-medium mt-0.5">Choose what you get nudged about</h4>
                    </div>
                    <button
                      onClick={() => setReminderCfg({ enabled: !reminderCfg.enabled })}
                      aria-label="Toggle reminders"
                      className={`px-2.5 py-1 text-[10px] uppercase tracking-wider font-medium shrink-0 ${reminderCfg.enabled ? 'bg-purple-900 text-white' : 'bg-stone-200 text-slate-700'}`}
                    >
                      {reminderCfg.enabled ? 'On' : 'Off'}
                    </button>
                  </div>
                  <div data-reminder-cats className="space-y-1.5">
                    {[
                      { k: 'plans', label: 'Plans & activities', hint: 'before you need to start getting ready, and at the start' },
                      { k: 'medicine', label: 'Medicine', hint: 'at the scheduled time' },
                      { k: 'meals', label: 'Meals', hint: 'at each meal time' },
                      { k: 'admin', label: 'Life admin', hint: 'before items are due' },
                      { k: 'water', label: 'Water', hint: 'until you hit the goal' },
                      { k: 'reading', label: 'Reading', hint: 'if you have not hit your goal' },
                      { k: 'mood', label: 'Mood check-in', hint: 'if not logged yet' }
                    ].map(c => (
                      <div key={c.k} className="border border-stone-200 bg-[#FAF8F5] px-2.5 py-2">
                        <div className="flex items-center justify-between gap-2">
                          <div><div className="text-[11px] font-medium">{c.label}</div><div className="text-[10px] text-stone-500">{c.hint}</div></div>
                          <button data-rem-toggle={c.k} aria-pressed={!!reminderCfg[c.k]} onClick={() => setReminderCfg({ [c.k]: !reminderCfg[c.k] })} className={`px-2.5 py-1 text-[10px] uppercase tracking-wider font-medium shrink-0 ${reminderCfg[c.k] ? 'bg-purple-900 text-white' : 'bg-stone-200 text-slate-700'}`}>{reminderCfg[c.k] ? 'On' : 'Off'}</button>
                        </div>
                        {reminderCfg[c.k] && c.k === 'plans' && (
                          <select value={reminderCfg.leadMins} aria-label="Reminder lead time" onChange={e => setReminderCfg({ leadMins: Number(e.target.value) })} className="mt-1.5 bg-white border border-stone-300 px-2 py-1 text-xs">
                            {[5, 10, 15, 30, 45, 60, 90].map(m => <option key={m} value={m}>{m} min before getting ready</option>)}
                          </select>
                        )}
                        {reminderCfg[c.k] && c.k === 'meals' && (
                          <select value={reminderCfg.mealLead} aria-label="Meal reminder lead" onChange={e => setReminderCfg({ mealLead: Number(e.target.value) })} className="mt-1.5 bg-white border border-stone-300 px-2 py-1 text-xs">
                            {[0, 15, 30, 60].map(m => <option key={m} value={m}>{m ? m + ' min before' : 'At meal time'}</option>)}
                          </select>
                        )}
                        {reminderCfg[c.k] && c.k === 'admin' && (
                          <select value={reminderCfg.adminDays} aria-label="Admin reminder days" onChange={e => setReminderCfg({ adminDays: Number(e.target.value) })} className="mt-1.5 bg-white border border-stone-300 px-2 py-1 text-xs">
                            {[1, 3, 7, 14].map(m => <option key={m} value={m}>{m} day{m > 1 ? 's' : ''} before due</option>)}
                          </select>
                        )}
                        {reminderCfg[c.k] && c.k === 'water' && (
                          <select value={reminderCfg.waterEvery} aria-label="Water reminder interval" onChange={e => setReminderCfg({ waterEvery: Number(e.target.value) })} className="mt-1.5 bg-white border border-stone-300 px-2 py-1 text-xs">
                            {[60, 90, 120, 180].map(m => <option key={m} value={m}>Every {m / 60} h (9am to 9pm)</option>)}
                          </select>
                        )}
                        {reminderCfg[c.k] && c.k === 'reading' && (
                          <input type="time" value={reminderCfg.readingTime} aria-label="Reading reminder time" onChange={e => setReminderCfg({ readingTime: e.target.value || '20:00' })} className="mt-1.5 bg-white border border-stone-300 px-2 py-1 text-xs" />
                        )}
                        {reminderCfg[c.k] && c.k === 'mood' && (
                          <input type="time" value={reminderCfg.moodTime} aria-label="Mood reminder time" onChange={e => setReminderCfg({ moodTime: e.target.value || '20:00' })} className="mt-1.5 bg-white border border-stone-300 px-2 py-1 text-xs" />
                        )}
                      </div>
                    ))}
                    <div className="border border-stone-200 bg-[#FAF8F5] px-2.5 py-2">
                      <div className="flex items-center justify-between gap-2">
                        <div><div className="text-[11px] font-medium">Quiet hours</div><div className="text-[10px] text-stone-500">no reminders in this window</div></div>
                        <button data-rem-toggle="quiet" aria-pressed={!!reminderCfg.quiet} onClick={() => setReminderCfg({ quiet: !reminderCfg.quiet })} className={`px-2.5 py-1 text-[10px] uppercase tracking-wider font-medium shrink-0 ${reminderCfg.quiet ? 'bg-purple-900 text-white' : 'bg-stone-200 text-slate-700'}`}>{reminderCfg.quiet ? 'On' : 'Off'}</button>
                      </div>
                      {reminderCfg.quiet && (
                        <div className="mt-1.5 flex items-center gap-2 text-xs">
                          <input type="time" value={reminderCfg.quietFrom} aria-label="Quiet from" onChange={e => setReminderCfg({ quietFrom: e.target.value || '22:00' })} className="bg-white border border-stone-300 px-2 py-1" />
                          <span>to</span>
                          <input type="time" value={reminderCfg.quietTo} aria-label="Quiet until" onChange={e => setReminderCfg({ quietTo: e.target.value || '07:00' })} className="bg-white border border-stone-300 px-2 py-1" />
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button onClick={enableDeviceNotifications} className="px-3 py-1.5 border border-stone-300 text-[10px] uppercase tracking-wider font-medium">
                      {reminderCfg.browser ? 'Device notifications on ✓' : 'Turn on device notifications'}
                    </button>
                    <button onClick={() => sendReminder('Test reminder', 'this is how Pact will nudge you.', null)} className="px-3 py-1.5 bg-slate-900 text-white text-[10px] uppercase tracking-wider font-medium">Send a test</button>
                  </div>
                  <p className="text-[10px] text-stone-500 leading-relaxed">Switch each category on or off. Only the ones you choose will nudge you. Reminders appear while Pact is open; device notifications also show on your lock screen if the app is open in the background.</p>
                </div>
                </>
                )}

                {/* Calendar Sync (Google / iPhone / Outlook / .ics) */}
                {profileScreen === 'calendar' && (
                <>
                <div className="p-4 bg-white border border-stone-200 space-y-3">
                  <div className="flex justify-between items-start gap-2">
                    <div>
                      <span className="text-[10px] uppercase tracking-widest text-purple-800 font-medium">Calendar Sync</span>
                      <h4 className="text-xs font-medium mt-0.5">Google, iPhone &amp; Outlook calendars</h4>
                    </div>
                    <span className={`px-2.5 py-1 text-[10px] uppercase tracking-wider font-medium shrink-0 ${calendarSources.length ? 'bg-blue-800 text-white' : 'bg-stone-200 text-slate-700'}`}>
                      {calendarSources.length ? `${calendarSources.length} synced ✓` : 'Not connected'}
                    </span>
                  </div>
                  <p className="text-[11px] text-stone-600 leading-relaxed">
                    Synced events become busy time: Pact will never plan over them, and Roamie knows when you're free.
                  </p>

                  {calConnectBlock}

                  {calendarSources.map(src => (
                    <div key={src.id} className="flex items-center justify-between gap-2 p-2.5 bg-[#FAF8F5] border border-stone-200 text-xs">
                      <div className="min-w-0">
                        <div className="font-medium truncate">{src.name}</div>
                        <div className="text-[10px] text-stone-500">
                          {src.error ? <span className="text-rose-700">{src.error}</span> : `${(src.events || []).length} events • synced ${src.lastSynced ? new Date(src.lastSynced).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }) : 'never'}`}
                        </div>
                      </div>
                      <div className="flex gap-1 shrink-0">
                        {src.url && (
                          <button onClick={() => handleResyncCalendar(src.id)} className="px-2 py-1 bg-stone-200 hover:bg-stone-300 text-[10px] uppercase tracking-wider font-medium">Sync</button>
                        )}
                        <button onClick={() => setCalendarSources(prev => prev.filter(c => c.id !== src.id))} className="px-2 py-1 border border-stone-300 text-[10px] uppercase tracking-wider font-medium text-rose-800">Remove</button>
                      </div>
                    </div>
                  ))}
                </div>
                </>
                )}

                {/* Weekly Blocked Hours */}
                {profileScreen === 'calendar' && (
                <>
                <div className="p-4 bg-white border border-stone-200 space-y-3">
                  <div>
                    <span className="text-[10px] uppercase tracking-widest text-purple-800 font-medium">Blocked Hours</span>
                    <h4 className="text-xs font-medium mt-0.5">Work / Study Weekly Schedule</h4>
                  </div>

                  <div className="space-y-1.5">
                    {Object.entries(userProfile.weeklyHours).map(([dayKey, cfg]) => (
                      <div key={dayKey} className="flex items-center justify-between p-2 bg-[#FAF8F5] border border-stone-200 text-xs">
                        <button
                          onClick={() => setUserProfile({
                            ...userProfile,
                            weeklyHours: {
                              ...userProfile.weeklyHours,
                              [dayKey]: { ...cfg, active: !cfg.active }
                            }
                          })}
                          className="flex items-center gap-2 font-medium"
                        >
                          <div className={`w-3.5 h-3.5 border ${cfg.active ? 'bg-purple-800 border-purple-800' : 'bg-white border-stone-400'}`} />
                          <span>{dayKey}</span>
                        </button>
                        {cfg.active ? (
                          <div className="flex items-center gap-1">
                            <input
                              type="time"
                              value={cfg.start}
                              onChange={e => setUserProfile({
                                ...userProfile,
                                weeklyHours: { ...userProfile.weeklyHours, [dayKey]: { ...cfg, start: e.target.value } }
                              })}
                              className="bg-white border border-stone-300 px-1.5 py-0.5 text-[11px]"
                            />
                            <span>to</span>
                            <input
                              type="time"
                              value={cfg.end}
                              onChange={e => setUserProfile({
                                ...userProfile,
                                weeklyHours: { ...userProfile.weeklyHours, [dayKey]: { ...cfg, end: e.target.value } }
                              })}
                              className="bg-white border border-stone-300 px-1.5 py-0.5 text-[11px]"
                            />
                          </div>
                        ) : (
                          <span className="text-[11px] text-stone-400">Free / Unblocked Day</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
                </>
                )}
              </div>
            )}

            {profileScreen === 'health' && (
              <div className="p-4 bg-white border border-stone-200 space-y-4">
                <div className="flex justify-between items-center">
                  <div>
                    <span className="text-[10px] uppercase tracking-widest text-blue-800 font-medium">Personal Analytics Vault</span>
                    <h3 className="font-editorial text-base font-normal">Mood & Nutrition Records</h3>
                  </div>
                  <button
                    onClick={handleExportCSV}
                    className="px-3 py-1.5 bg-purple-800 text-white text-[10px] uppercase tracking-wider font-medium flex items-center gap-1"
                  >
                    <Download size={12} /> Export Excel CSV
                  </button>
                </div>

                {/* Visual Bar Chart for Mood Logs */}
                <div className="p-3 bg-[#FAF8F5] border border-stone-200 space-y-2">
                  <div className="text-[10px] uppercase tracking-wider text-stone-500">Weekly Mood Score Trend</div>
                  <div className="flex items-end gap-3 h-24 pt-4 px-2">
                    {moodLogs.map((log, i) => (
                      <div key={i} className="flex-1 flex flex-col items-center gap-1">
                        <div
                          className="w-full bg-purple-800 transition-all"
                          style={{ height: `${log.score * 16}px` }}
                          title={log.reason}
                        />
                        <span className="text-[9px] font-mono text-stone-500">{log.date.slice(8)} Nov</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Meal History Table */}
                <div className="space-y-1.5">
                  <div className="text-[10px] uppercase tracking-wider text-stone-500">Logged Meals & Dining History</div>
                  {mealHistoryLogs.map((ml, idx) => (
                    <div key={idx} className="p-2 bg-[#FAF8F5] border border-stone-200 flex justify-between text-xs">
                      <span><strong>{ml.date}</strong> • {ml.meal} ({ml.mode})</span>
                      <span className="text-purple-900 font-medium">{ml.detail}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* =========================================================
          MULTI-MODE SMART PLANNER MODAL (EVENT / TASK / ACTIVITY / SURPRISE)
         ========================================================= */}
      {plannerOpen && <PlannerWizard c={{
        plannerMode, setPlannerMode, linkedTargetId, eventConfig, setEventConfig, setTaskConfig, taskPlan, surpriseConfig, setSurpriseConfig, surprisePick, surpriseLoading, rollSurprise,
        loc, userProfile, locIsDefault, locBusy, locMsg, locAsk, pcDraft, setPcDraft, plannerUseGps, plannerSetPostcode,
        autoYes: () => { patchProfile({ autoLocation: true }); setLocAsk(false); setLocMsg('Done. Your location will refresh when you open the app.'); },
        autoNo: () => { patchProfile({ autoLocation: false }); setLocAsk(false); },
        venues: displayedPlannerVenues, selectedVenue: selectedVenueMatch, setSelectedVenue: setSelectedVenueMatch, setSelectedVenueMatch, refreshVenues: handleRefreshMoreVenues,
        searchingVenues: isSearchingLiveVenues, venueSort, setVenueSort, setVenueRefreshOffset, venueIntent, dietaryOptionsList,
        suggestStartTimes, checkScheduleAndPrepConflict, scheduleConflictWarning, setScheduleConflictWarning,
        selectedDateStr, todayStr: todayDateStr(), addDays: addDaysStr, prettyDate, fromMins, toMins, dayWord: (d) => new Date(d + 'T12:00:00').toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric' }),
        friendNames: pactFriends.map(f => f.name).filter(Boolean), searchPlaces: searchPlacesByName, findEvents: findEventsNear, addPlan: addPlanDirect, confirmPlan: handleConfirmAddPlan,
        otherTime: (idx) => { const next = [...taskSkip]; next[idx] = (next[idx] || 0) + 1; setTaskSkipState({ sig: taskSig, skip: next }); },
        onClose: () => { setPlannerOpen(false); setPlannerResultsStep(false); setLinkedTargetId(null); setEventConfig(p => ({ ...p, slotPicked: false, planLabel: '' })); }
      }} />}

      {/* =========================================================
          ROAMIE AI ASSISTANT & BUG REPORT DRAWER
         ========================================================= */}
      <button
        onClick={() => setRoamieOpen(!roamieOpen)}
        data-roamie-fab
        aria-label="Ask Roamie"
        className="pact-bob absolute right-4 z-30 flex items-center"
        style={{ gap: 9, padding: roamieSmall ? '6px 8px' : '6px 15px 6px 9px', background: '#FBF4E0', border: '1.5px solid #1B2A22', outline: '1px solid #1B2A22', outlineOffset: 2, borderRadius: 0, boxShadow: '0 2px 0 rgba(27,42,34,.22)', bottom: 'calc(88px + env(safe-area-inset-bottom, 0px))', color: '#1B2A22' }}
      >
        <RoamieBell size={28} />
        {!roamieSmall && <span style={{ fontFamily: 'Fraunces, serif', fontStyle: 'italic', fontWeight: 600, fontSize: 16, whiteSpace: 'nowrap' }}>Ask Roamie</span>}
      </button>

      {viewFriend && (
        <div data-friend-profile className="fixed inset-0 z-50 flex justify-center bg-black/40" onClick={() => setViewFriend(null)}>
          <div className="relative w-full max-w-md min-[600px]:max-w-[640px] h-full bg-[#F4EFE4] text-slate-900 overflow-y-auto overflow-x-hidden" style={{ paddingBottom: 'calc(24px + env(safe-area-inset-bottom, 0px))' }} onClick={e => e.stopPropagation()}>
            <div className="lg-bg" aria-hidden="true"><div className="lg-blob lg-clay lg-d1" style={{ width: 260, height: 260, left: -90, top: -60 }} /><div className="lg-ringline lg-l1" style={{ width: 210, height: 210, right: -60, top: 260 }} /><div className="lg-ringline c lg-l2" style={{ width: 210, height: 210, right: 40, top: 320 }} /></div>
            {(() => {
              const fr = viewFriend.fr, d = viewFriend.data, today = todayDateStr();
              const name = (d && d.display_name) || fr.name;
              const first = String(name).split(' ')[0];
              const bio = (d && d.bio) || fr.bio || '', avatar = (d && d.avatar) || fr.avatar || '';
              const moodNow = d && d.mood && String(d.mood_day || '').slice(0, 10) === today ? d.mood : '';
              const todays = d && Array.isArray(d.today) && String(d.today_day || '').slice(0, 10) === today ? d.today : null;
              const nowM = new Date().getHours() * 60 + new Date().getMinutes();
              return (<div className="relative z-[1] px-[22px] pt-5">
                <div className="flex items-center justify-between">
                  <button data-friend-profile-close onClick={() => setViewFriend(null)} aria-label="Back" className="w-11 h-11 border border-slate-900 flex items-center justify-center" style={{ borderRadius: 0 }}><ArrowLeft size={20} strokeWidth={1.7} /></button>
                  <span className="text-[12px] uppercase tracking-[0.16em] text-stone-500">Friend</span>
                  <span className="w-11" />
                </div>
                <div className="flex items-center gap-4 mt-6">
                  <Avatar src={avatar} name={name} size={84} />
                  <div className="min-w-0">
                    <h3 className="font-editorial text-[32px] leading-[1.05] break-words">{name}</h3>
                    <div className="text-[13px] text-stone-500 mt-1">{fr.handle || (d && d.username ? '@' + d.username : '')}</div>
                  </div>
                </div>
                {bio ? <p data-friend-profile-bio className="text-[15px] leading-relaxed text-stone-700 mt-4">{bio}</p> : <p className="text-[13px] text-stone-400 mt-4">No description yet.</p>}
                <div className="flex gap-2.5 mt-5">
                  {fr.userId && <button data-friend-profile-message onClick={() => { setViewFriend(null); setActiveTab('social'); setSocialSub('friends'); openChat(fr); }} className="flex-1 h-12 bg-purple-900 text-white text-[13px] font-semibold" style={{ borderRadius: 0 }}>Message</button>}
                  <button onClick={() => { setViewFriend(null); setInviteDraft({ taskId: '', friend: fr.name }); setInviteOut(null); setSocialSub('plans'); setActiveTab('social'); }} className="flex-1 h-12 border border-slate-900 text-[13px] font-semibold" style={{ borderRadius: 0 }}>Invite to a plan</button>
                </div>
                {viewFriend.busy ? <p className="text-[12px] text-stone-500 mt-6">Loading...</p> : (<>
                  <div className="mt-6 border-t border-stone-300 pt-4">
                    <div className="text-[11px] uppercase tracking-[0.14em] text-stone-500">Mood today</div>
                    <div className="mt-2 flex items-center gap-2.5">{moodNow && <span className="w-3 h-3 rounded-full bg-rose-700" />}<span data-friend-profile-mood className="font-editorial text-[24px]">{moodNow || <span className="font-sans text-[13px] text-stone-400">Not shared today</span>}</span></div>
                  </div>
                  <div className="mt-6 border-t border-stone-300 pt-4">
                    <div className="text-[11px] uppercase tracking-[0.14em] text-stone-500">{first}'s day</div>
                    {todays === null ? <div className="text-[13px] text-stone-400 mt-3">Not shared today</div> : todays.length === 0 ? <div className="text-[13px] text-stone-600 mt-3">Nothing shared for today</div> : (
                      <div data-friend-profile-today className="grid grid-cols-[92px_1fr] gap-y-3.5 mt-3.5 text-[15px]">{todays.map((a, i) => { const on = toMins(a.s) <= nowM && nowM < toMins(a.e || a.s) + 1; return (<React.Fragment key={i}><div className={`text-[13px] pt-0.5 ${on ? 'text-rose-700 font-semibold' : 'text-stone-500'}`}>{a.s}{a.e && a.e !== a.s ? '–' + a.e : ''}</div><div className={on ? 'font-semibold' : ''}>{a.t}{on && <span className="font-normal text-rose-700 text-[12px]"> · now</span>}</div></React.Fragment>); })}</div>
                    )}
                    <p className="text-[12px] leading-snug text-stone-400 mt-4">{first} chooses what to show here and can turn it off at any time.</p>
                  </div>
                </>)}
              </div>);
            })()}
          </div>
        </div>
      )}

      {voice && (
        <div data-voice-sheet className="fixed inset-x-0 bottom-0 z-50 flex justify-center" role="dialog" aria-label="Add by voice">
          <div className="w-full max-w-md min-[600px]:max-w-[640px] bg-white border-t-2 border-purple-900 shadow-2xl p-4 space-y-3" style={{ paddingBottom: 'calc(16px + env(safe-area-inset-bottom, 0px))' }}>
            <div className="flex justify-between items-center">
              <span className="text-[10px] uppercase tracking-widest text-purple-800 font-medium">Add by voice</span>
              <button onClick={closeVoice} aria-label="Close" className="text-stone-400"><X size={16} /></button>
            </div>
            <p className="text-[11px] text-stone-600 leading-snug">Say something like "dinner with Sam on Friday at 7pm" or "dentist tomorrow at 9". Check the words, then tap Add it.</p>
            <div className="flex items-center gap-2">
              <button data-voice-mic onClick={() => (voice.listening ? stopVoice() : startVoice())} aria-label={voice.listening ? 'Stop listening' : 'Start listening'} className={`w-12 h-12 shrink-0 flex items-center justify-center text-white rounded-full ${voice.listening ? 'bg-rose-700 animate-pulse' : 'bg-purple-900'}`}><Mic size={20} /></button>
              <input data-voice-text type="text" aria-label="What you said" placeholder={voice.listening ? 'Listening...' : 'Tap the mic, or type here'} value={voice.text || ''} onChange={e => setVoice({ ...voice, text: e.target.value })} onKeyDown={e => { if (e.key === 'Enter') submitVoice(); }} className="flex-1 min-w-0 bg-[#FAF8F5] border border-stone-300 px-2.5 py-2 text-sm" />
            </div>
            {voice.err && <p data-voice-err className="text-[11px] text-rose-700 leading-snug">{voice.err}</p>}
            <button data-voice-add onClick={submitVoice} disabled={!(voice.text || '').trim()} className="w-full py-2.5 bg-purple-900 text-white text-[11px] uppercase tracking-widest font-medium disabled:opacity-50">Add it</button>
          </div>
        </div>
      )}

      {roamieOpen && (
        <div className="fixed inset-x-0 mx-auto max-w-md min-[600px]:max-w-[640px] min-[820px]:max-w-[820px] bg-white border-t-2 border-purple-900 shadow-2xl z-40 p-4 space-y-3 overflow-y-auto" style={{ bottom: 'calc(64px + env(safe-area-inset-bottom, 0px))', maxHeight: 'calc(100dvh - 140px)' }}>
          <div className="flex justify-between items-center border-b border-stone-200 pb-2">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 flex items-center justify-center" style={{ border: '1.5px solid #1B2A22', background: '#FBF4E0' }}>
                <RoamieBell size={22} />
              </div>
              <div>
                <h4 className="text-xs font-medium uppercase tracking-wider">Roamie</h4>
                <span className="text-[10px] text-stone-500 flex items-center gap-1" data-roamie-status={roamieStatus}>
                  <span className={`inline-block w-1.5 h-1.5 rounded-full ${roamieStatus === 'live' ? 'bg-emerald-600' : roamieStatus === 'unknown' ? 'bg-stone-400' : 'bg-rose-700'}`} />
                  {roamieStatus === 'live' ? 'Planner + live search (AI)' : 'Planner + live search (places, facts, weather)'}
                </span>
                <button data-search-test onClick={runSearchTest} disabled={searchTest.busy} className="block text-[10px] underline text-purple-900 mt-0.5">{searchTest.busy ? 'Testing...' : 'Test web search'}</button>
                {searchTest.msg && <p data-search-test-result className="text-[10px] text-stone-600 leading-snug mt-0.5 max-w-[230px]">{searchTest.msg}</p>}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setRoamieBugMode(!roamieBugMode)}
                className="px-2 py-0.5 bg-rose-700 text-white text-[10px] uppercase tracking-wider"
              >
                {roamieBugMode ? 'Back to Chat' : 'Report Bug'}
              </button>
              <button onClick={() => setRoamieOpen(false)} className="text-stone-400 hover:text-slate-900">
                <X size={16} />
              </button>
            </div>
          </div>

          {roamieBugMode ? (
            <div className="space-y-2.5 p-2 bg-[#FAF8F5] border border-stone-300">
              <div className="text-xs font-medium text-slate-900">Report a bug or suggest something</div>
              {bugForm.status === 'sent' || bugForm.status === 'saved' ? (
                <div className="p-2.5 bg-blue-900 text-white text-xs space-y-1.5">
                  <div>{bugForm.status === 'sent' ? `Thanks! Report ${bugForm.ticket} was sent.` : `Report ${bugForm.ticket} is saved on this device.`}</div>
                  {bugForm.status === 'saved' && <div className="text-[10px] opacity-80">It couldn't be sent from here. Reports send automatically once the app is live on Netlify.</div>}
                  <button onClick={() => setBugForm({ ...bugForm, status: 'idle', ticket: '' })} className="underline text-[10px] uppercase tracking-wider">Send another</button>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-2 gap-2">
                    <select aria-label="Report type" value={bugForm.type} onChange={e => setBugForm({ ...bugForm, type: e.target.value })} className="bg-white border border-stone-300 px-2 py-1.5 text-xs">
                      {BUG_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                    <select aria-label="Report area" value={bugForm.area} onChange={e => setBugForm({ ...bugForm, area: e.target.value })} className="bg-white border border-stone-300 px-2 py-1.5 text-xs">
                      {BUG_AREAS.map(a => <option key={a} value={a}>{a}</option>)}
                    </select>
                  </div>
                  {bugForm.area === 'Other' && (
                    <input type="text" aria-label="Which part of the app" placeholder="Which part of the app?" value={bugForm.other} onChange={e => setBugForm({ ...bugForm, other: e.target.value })} className="w-full bg-white border border-stone-300 px-2 py-1.5 text-xs" />
                  )}
                  <textarea
                    rows={3}
                    aria-label="Describe the issue"
                    placeholder={bugForm.type === 'Feature request' ? 'What would you like Pact to do?' : 'What happened, and what did you expect?'}
                    value={bugForm.details}
                    onChange={e => setBugForm({ ...bugForm, details: e.target.value })}
                    className="w-full bg-white border border-stone-300 p-2 text-xs"
                  />
                  {bugForm.status === 'error' && <div className="text-[11px] text-rose-800">{bugForm.note}</div>}
                  <button
                    onClick={submitBugReport}
                    disabled={bugForm.status === 'sending'}
                    className="w-full py-1.5 bg-rose-700 text-white text-[10px] uppercase tracking-widest font-medium"
                  >
                    {bugForm.status === 'sending' ? 'Sending...' : `Submit ${bugForm.type.toLowerCase()}`}
                  </button>
                </>
              )}
            </div>
          ) : (
            <>
              <div ref={roamieBoxRef} className="h-56 overflow-y-auto space-y-2 pr-1">
                {roamieMessages.map((msg, i) => (
                  <div
                    key={i}
                    className={`p-2.5 text-xs leading-relaxed ${
                      msg.sender === 'roamie'
                        ? 'bg-[#FAF8F5] border-l-4 border-purple-800 text-slate-800'
                        : 'bg-blue-900 text-white ml-8'
                    }`}
                  >
                    <div className="whitespace-pre-line">{msg.text}</div>
                    {msg.action && (
                      <button
                        onClick={() => { setSelectedDateStr(msg.action.date); setActiveTab('schedule'); setRoamieOpen(false); }}
                        className="mt-1.5 px-2.5 py-1 bg-purple-900 text-white text-[10px] uppercase tracking-wider font-medium"
                      >
                        {msg.action.label}
                      </button>
                    )}
                    {msg.sources && msg.sources.length > 0 && (
                      <div className="mt-1.5 pt-1.5 border-t border-stone-200 flex flex-wrap gap-1.5">
                        {msg.sources.map((src, sIdx) => (
                          <a
                            key={sIdx}
                            href={src.uri}
                            target="_blank"
                            rel="noreferrer"
                            className="text-[10px] text-blue-800 underline flex items-center gap-0.5"
                          >
                            <ExternalLink size={9} /> {src.title}
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
                {roamieLoading && (
                  <div className="p-2 text-[11px] text-purple-800 bg-[#FAF8F5] border-l-4 border-purple-800 animate-pulse">
                    Roamie is checking your schedule and searching...
                  </div>
                )}
              </div>

              <div className="flex gap-1.5 overflow-x-auto no-scrollbar pb-0.5">
                {["What's on today?", 'When am I free tomorrow?', 'Book a run tomorrow at 7am', 'How are my targets?', "What's in my fridge?"].map(chip => (
                  <button key={chip} type="button" disabled={roamieLoading} onClick={() => submitRoamie(chip)} className="shrink-0 px-2.5 py-1 border border-stone-300 bg-white text-[10px] text-slate-700 hover:border-purple-900">
                    {chip}
                  </button>
                ))}
              </div>
              <form onSubmit={handleSendRoamie} className="flex gap-1.5">
                <input
                  type="text"
                  placeholder="Ask or tell Roamie, e.g. 'book gym Friday 6pm'..."
                  value={roamieInput}
                  onChange={e => setRoamieInput(e.target.value)}
                  className="flex-1 bg-[#FAF8F5] border border-stone-300 px-2.5 py-1.5 text-xs outline-none"
                />
                <button type="button" data-roamie-mic onClick={() => { setRoamieOpen(false); startVoice(); }} aria-label="Speak to add" className="px-2.5 border border-stone-300 text-purple-900"><Mic size={14} /></button>
                <button type="submit" className="px-3 bg-purple-900 text-white">
                  <Send size={13} />
                </button>
              </form>
            </>
          )}
        </div>
      )}

      {/* =========================================================
          BOTTOM 5-TAB NAVIGATION BAR
         ========================================================= */}
      {simpleView ? (
        <>
          <nav data-simple-nav data-pact-glass="nav" className="border-t border-stone-300 px-2 pt-2 grid grid-cols-4 items-stretch z-20 relative shrink-0" style={{ background: 'rgba(244,239,228,0.97)', paddingBottom: 'calc(0.5rem + env(safe-area-inset-bottom, 0px))' }}>
            {[
              { id: 'home', label: 'Today', on: activeTab === 'home', go: () => setActiveTab('home') },
              { id: 'schedule', label: 'Plans', on: activeTab === 'schedule', go: () => setActiveTab('schedule') },
              { id: 'social', label: 'People', on: activeTab === 'social', go: () => { setActiveTab('social'); setSocialSub('people'); } },
              { id: 'more', label: 'More', on: ['ideas', 'skills', 'profile'].includes(activeTab), go: () => setMoreOpen(true) }
            ].map(n => (
              <button key={n.id} data-simple-tab={n.id} aria-current={n.on ? 'page' : undefined} onClick={n.go} className="py-3.5 text-[15px]" style={{ borderRadius: 0, borderRight: n.id === 'more' ? 0 : '1px solid #1B2A22', background: n.on ? '#1B2A22' : 'transparent', color: n.on ? '#F4EFE4' : '#1B2A22', fontWeight: n.on ? 700 : 500 }}>{n.label}</button>
            ))}
          </nav>
          {moreOpen && (
            <Portal>
              <div data-more-sheet style={{ position: 'fixed', inset: 0, zIndex: 300, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
                <div onClick={() => setMoreOpen(false)} style={{ position: 'absolute', inset: 0, background: 'rgba(27,42,34,.5)' }} />
                <div style={{ position: 'relative', background: '#F4EFE4', borderTop: '3px double #1B2A22', padding: '16px 22px 26px', maxWidth: 640, width: '100%', margin: '0 auto' }}>
                  <div className="font-fr" style={{ fontWeight: 600, fontSize: 26 }}>More</div>
                  {[['ideas', 'Ideas', 'Things to do, near you'], ['skills', 'Development', 'Skills and what you are learning'], ['profile', 'Profile and comfort', 'Text size, settings, your account']].map(([id, l, sub]) => (
                    <button key={id} data-more-item={id} onClick={() => { setMoreOpen(false); setActiveTab(id); if (id === 'profile') setProfileSubTab('life'); }} className="w-full text-left" style={{ borderRadius: 0, padding: '14px 0', borderBottom: '1px solid #CFC7B4' }}><div className="font-fr" style={{ fontWeight: 600, fontSize: 21 }}>{l}</div><div style={{ fontSize: 14, color: '#5A675F' }}>{sub}</div></button>
                  ))}
                  <button data-more-fullapp onClick={() => { patchProfile({ comfort: { ...(userProfile.comfort || {}), size: 'normal', bigButtons: false, simpleNav: false } }); setMoreOpen(false); setCalmFull(false); setActiveTab('home'); }} className="w-full" style={{ marginTop: 14, height: 52, background: '#1B2A22', color: '#F4EFE4', fontWeight: 700, fontSize: 16, borderRadius: 0 }}>Back to the full app</button>
                  <button data-more-close onClick={() => setMoreOpen(false)} className="w-full" style={{ marginTop: 10, height: 52, border: '2px solid #1B2A22', fontWeight: 700, fontSize: 16, borderRadius: 0 }}>Close</button>
                </div>
              </div>
            </Portal>
          )}
        </>
      ) : (
      <nav data-pact-glass="nav" className="border-t border-stone-300 px-1 pt-2 flex justify-between items-stretch z-20 relative backdrop-blur-md shrink-0" style={{ background: 'rgba(244,239,228,0.97)', paddingBottom: 'calc(0.5rem + env(safe-area-inset-bottom, 0px))', minHeight: 64 }}>
        {[
          { id: 'home', label: 'Home', icon: Home },
          { id: 'schedule', label: 'Schedule', icon: Calendar },
          { id: 'ideas', label: 'Ideas', icon: Lightbulb },
          { id: 'skills', label: 'Development', icon: GitBranch },
          { id: 'social', label: 'Social', icon: Users }
        ].map(item => {
          const IconComponent = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`relative flex-1 py-2 flex flex-col items-center gap-1.5 transition-all ${
                isActive ? 'text-purple-900' : 'text-slate-400 hover:text-slate-900'
              }`}
              style={{ borderRadius: 0 }}
            >
              {isActive && <span className="absolute -top-2 left-1/2 -translate-x-1/2 w-[22px] h-[3px] bg-rose-700" />}
              <IconComponent size={19} strokeWidth={isActive ? 2.2 : 1.7} />
              <span className="text-[10px] max-[359px]:text-[9px] tracking-normal font-semibold">{item.label}</span>
            </button>
          );
        })}
      </nav>
      )}
    </div>
  );
}

export default function App() {
  const [instance, setInstance] = useState(0);
  return <AppInner key={instance} onReset={() => setInstance(i => i + 1)} />;
}
