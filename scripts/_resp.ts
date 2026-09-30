import { chromium } from "playwright";
const H="/hotels/cox-s-bazar/hotel-ocean-friends-1";
const Q="?checkIn=2026-10-05&checkOut=2026-10-07&adults=2";
const pages: [string,string][] = [
  ["home","/"],["search","/hotels/search"+Q],["hotel",H+Q],["room",H+"/premium-family-suit-8018575"+Q],
  ["flights","/flights/search"],["login","/auth/login"],["register","/auth/register"],["partner","/auth/register/partner"],
  ["about","/about"],["contact","/contact"],["help","/help"],["terms","/terms"],["404","/zzz-nope"],
];
const vps: [string,number,number][] = [["320",320,640],["375",375,800],["768",768,1024],["1024",1024,768],["1280",1280,800],["1920",1920,1080]];
(async()=>{
  const b=await chromium.launch();
  const issues: string[] = [];
  for (const [vn,w,h] of vps) {
    const ctx=await b.newContext({viewport:{width:w,height:h}});
    for (const [name,path] of pages) {
      const p=await ctx.newPage();
      const errs:string[]=[];
      p.on("pageerror",e=>errs.push(String(e).slice(0,100)));
      try { await p.goto("http://localhost:3000"+path,{waitUntil:"networkidle",timeout:45000}); } catch(e){ issues.push(vn+" "+name+": LOAD FAIL"); await p.close(); continue; }
      await p.waitForTimeout(400);
      const r = await p.evaluate(()=>{
        const vw=document.documentElement.clientWidth;
        const scroll=document.documentElement.scrollWidth-vw;
        const out:string[]=[];
        for (const el of document.querySelectorAll("body *")) {
          const cs=getComputedStyle(el); if(cs.position==="fixed"||cs.display==="none"||cs.visibility==="hidden") continue;
          if (el.closest("[aria-hidden=true]")||el.closest("nextjs-portal")) continue;
          const b=el.getBoundingClientRect(); if(b.width===0||b.height===0) continue;
          // ignore anything inside a horizontally scrollable/overflow-hidden ancestor
          let clipped=false; for(let a=el.parentElement;a&&a!==document.body;a=a.parentElement){const o=getComputedStyle(a); if(/(hidden|auto|scroll|clip)/.test(o.overflowX)){const ab=a.getBoundingClientRect(); if(ab.right<=vw+1){clipped=true;break;}}}
          if(clipped) continue;
          if(b.right>vw+2||b.left<-2) out.push((el.tagName+"."+String(el.className).split(" ").slice(0,3).join(".")).slice(0,70)+" r="+Math.round(b.right));
        }
        const tiny=[...document.querySelectorAll("a[href],button,input,select,textarea")].filter(e=>{const b=e.getBoundingClientRect();const cs=getComputedStyle(e);return b.width>0&&cs.visibility!=="hidden"&&!e.closest("[aria-hidden=true]")&&!e.closest("nextjs-portal")&&(b.height<28||b.width<28)&&!(e.tagName==="A"&&getComputedStyle(e).display==="inline")&&!(e.tagName==="INPUT"&&(e as HTMLInputElement).type==="hidden")&&!e.classList.contains("sr-only")}).length;
        const fs=[...document.querySelectorAll("p,span,a,li,label,td")].filter(e=>{const cs=getComputedStyle(e);return e.children.length===0&&e.textContent!.trim().length>3&&parseFloat(cs.fontSize)<11&&e.getBoundingClientRect().width>0}).length;
        return {scroll,out:[...new Set(out)].slice(0,4),tiny,fs};
      });
      const flag = r.scroll>0 || r.out.length;
      console.log((flag?"!! ":"ok ")+vn.padEnd(5)+name.padEnd(9)+"scrollX="+r.scroll+" outside="+r.out.length+" tiny="+r.tiny+" <11px="+r.fs+(errs.length?" ERR:"+errs[0]:""));
      if (flag) r.out.forEach(o=>console.log("      "+o));
      if (flag || (vn==="320" && ["room","hotel"].includes(name))) await p.screenshot({path:"C:/Users/EXPRES~1/AppData/Local/Temp/claude/c--Projects-seltiv-tofiza/4f4f4281-73d7-4397-a2a5-9b02fb5e61bb/scratchpad/r-"+vn+"-"+name+".png",fullPage:false});
      await p.close();
    }
    await ctx.close();
  }
  await b.close();
})().catch(e=>{console.error(e);process.exit(1)});
