import {useEffect,useState} from 'react';
import {createPortal} from 'react-dom';
export default function ThemeToggle(){
 const [dark,setDark]=useState(()=>localStorage.getItem('indai_dark')==='true');
 useEffect(()=>{document.documentElement.classList.toggle('dark',dark);document.documentElement.style.colorScheme=dark?'dark':'light';localStorage.setItem('indai_dark',String(dark));},[dark]);
 useEffect(()=>{const sync=e=>{if(e.key==='indai_dark')setDark(e.newValue==='true');};window.addEventListener('storage',sync);return()=>window.removeEventListener('storage',sync);},[]);
 return createPortal(<button id="global-theme-toggle" className="dark-mode-toggle" aria-label="Toggle theme" title={dark?'Switch to light mode':'Switch to dark mode'} aria-pressed={dark} onClick={()=>setDark(v=>!v)}>{dark?'☀':'☾'}</button>,document.body);
}
