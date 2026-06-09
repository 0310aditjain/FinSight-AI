import { useState } from "react";

const COLORS = ["#00d4aa","#4a9eff","#f5c518","#ff6b9d","#a855f7","#ff8c42"];

function gradeOf(s){ if(s>=75)return{g:"A",col:"#00d4aa"};if(s>=60)return{g:"B",col:"#4a9eff"};if(s>=45)return{g:"C",col:"#f5a623"};return{g:"D",col:"#ff4d6d"}; }
function sc(s){ return s>=75?"#00d4aa":s>=60?"#4a9eff":s>=45?"#f5a623":"#ff4d6d"; }
function pct(v,d=1){ if(v==null||isNaN(v))return"—";return(v>=0?"+":"")+v.toFixed(d)+"%"; }
function money(v,cur){ if(v==null)return"—";const a=Math.abs(v);const sg=v<0?"-":"";if(a>=1e7)return sg+cur+(a/1e7).toFixed(1)+"Cr";if(a>=1e5)return sg+cur+(a/1e5).toFixed(1)+"L";if(a>=1e3)return sg+cur+(a/1e3).toFixed(1)+"K";return sg+cur+a.toFixed(0); }

function sv(v,breaks,scores){ if(v==null||isNaN(v))return null;for(let i=0;i<breaks.length;i++)if(v<=breaks[i])return scores[i];return scores[scores.length-1]; }
function wavg(arr){ const f=arr.filter(x=>x!=null);return f.length?f.reduce((a,b)=>a+b,0)/f.length:null; }

function calcScores(d, w){
  w = w || {val:25,biz:35,mkt:25,smt:15};
  const valS=wavg([sv(d.pe,[10,15,22,35,55],[95,82,65,45,28,12]),sv(d.pb,[1,2,3.5,6],[92,75,58,38,18]),sv(d.peg,[0.5,1,1.8,3],[95,80,60,38,18])])??50;
  const bizS=wavg([sv(d.roe,[5,10,15,20,30],[18,38,58,75,88,97]),sv(d.netMargin,[2,5,10,18,28],[18,38,58,72,85,95]),sv(d.revGrowth,[-5,0,8,15,25],[10,28,50,68,82,95]),sv(d.debtToEquity,[0.2,0.5,1,2],[92,78,60,40,18])])??50;
  const pos52=d.pos52??50;
  const pos52S=pos52<20?62:pos52<40?74:pos52<65?80:pos52<85?66:46;
  const mktS=wavg([pos52S,sv(d.beta,[0.4,0.7,1.2,1.7,2.5],[65,80,88,70,48,28]),sv(d.ret1y,[-25,-10,0,10,25,45],[12,28,44,62,78,90,97])])??50;
  const smtS=wavg([d.instOwn!=null?sv(d.instOwn,[5,15,30,60,80],[32,50,78,88,70,48]):null,d.analystRec!=null?Math.max(8,112-(d.analystRec*22)):null])??50;
  const total=valS*(w.val/100)+bizS*(w.biz/100)+mktS*(w.mkt/100)+smtS*(w.smt/100);
  return{val:Math.round(valS),biz:Math.round(bizS),mkt:Math.round(mktS),smt:Math.round(smtS),total:Math.round(total)};
}

const INIT_ROWS=[{id:0,t:"",p:"",s:""},{id:1,t:"",p:"",s:""},{id:2,t:"",p:"",s:""}];

export default function StockPortfolio(){
  const [country,setCountry]=useState("IN");
  const [rows,setRows]=useState(INIT_ROWS);
  const [nxtId,setNxtId]=useState(3);
  const [phase,setPhase]=useState("idle");
  const [stocks,setStocks]=useState([]);
  const [aiText,setAiText]=useState("");
  const [aiLoading,setAiLoading]=useState(false);
  const [deepLoading,setDeepLoading]=useState(false);
  const [finalLoading,setFinalLoading]=useState(false);
  const [finalText,setFinalText]=useState("");
  const [statusMsg,setStatusMsg]=useState("");

  // Customisable scoring weights
  const DEFAULT_W = {val:25, biz:35, mkt:25, smt:15};
  const [weights, setWeights] = useState({...DEFAULT_W});

  const wTotal = Object.values(weights).reduce((a,b)=>a+b,0);
  const wValid = wTotal === 100;

  function changeWeight(key, newVal) {
    setWeights(w => ({...w, [key]: Math.max(0, Math.min(100, parseInt(newVal)||0))}));
  }

  const cur=country==="IN"?"₹":"$";
  const acc=country==="IN"?"#00d4aa":"#4a9eff";

  function addRow(){ const id=nxtId;setRows(r=>[...r,{id,t:"",p:"",s:""}]);setNxtId(n=>n+1); }
  function removeRow(id){ setRows(r=>r.length>1?r.filter(x=>x.id!==id):r); }
  function updRow(id,k,v){ setRows(r=>r.map(x=>x.id===id?{...x,[k]:v}:x)); }

  function getHoldings(){
    const filled = rows.filter(r=>r.t.trim()&&parseFloat(r.p)>0&&parseFloat(r.s)>0);
    // Warn if any input looks like a company name rather than a ticker
    const suspicious = filled.filter(r => r.t.trim().includes(' ') || r.t.trim().length > 10);
    if (suspicious.length > 0) {
      const names = suspicious.map(r => r.t.trim()).join(', ');
      alert(`"${names}" looks like a company name, not a ticker symbol.\n\nPlease use ticker symbols only:\n• AAPL (not "Apple Inc")\n• MSFT (not "Microsoft")\n• RELIANCE (not "Reliance Industries")\n• BSE (not "BSE Ltd")`);
      return [];
    }
    return filled.map(r=>({ticker:r.t.trim().toUpperCase(),buyPrice:parseFloat(r.p),shares:parseFloat(r.s)}));
  }

  function switchCountry(c){
    setCountry(c);setPhase("idle");setStocks([]);setAiText("");setFinalText("");setStatusMsg("");
    setRows(INIT_ROWS);setNxtId(3);
  }

  function applyWeights(){
    if(!wValid){alert("Weights must total 100% before applying.");return;}
    if(!stocks.length) return;
    const updated=stocks.map(s=>({...s,scores:calcScores(s,weights)}));
    setStocks(updated);
    setAiText("");setFinalText("");
  }

  async function runAnalysis(){
    const holdings=getHoldings();
    if(!holdings.length){alert("Add at least one stock with ticker, buy price and shares.");return;}
    setPhase("loading");setStocks([]);setAiText("");setFinalText("");
    const tickerList=holdings.map(h=>h.ticker).join(", ");
    const mktName=country==="IN"?"Indian NSE":"US NYSE/NASDAQ";
    setStatusMsg(`Claude is searching live data for: ${tickerList}...`);

    const prompt=`You are a financial data assistant. Search the web and find CURRENT real market data for these ${mktName} stocks: ${tickerList}.

For EACH stock, search and find these exact metrics:
- Current stock price (today's live price)
- Full company name and sector/industry
- P/E ratio (trailing twelve months)
- P/B ratio (price to book)
- PEG ratio
- ROE % (return on equity, last year)
- Net profit margin %
- Revenue growth % year-over-year
- Debt to equity ratio
- 1-year price return %
- 3-year CAGR %
- 52-week high price
- 52-week low price
- Beta
- Institutional ownership %
- Analyst consensus rating (1=Strong Buy, 2=Buy, 3=Hold, 4=Sell, 5=Strong Sell)

Search for each ticker individually to get accurate data. For Indian stocks add .NS suffix when searching Yahoo Finance (e.g. BSE.NS, RELIANCE.NS).

Return ONLY a valid JSON array with no other text, markdown, or explanation:
[{"ticker":"SYMBOL","name":"Full Company Name","sector":"Sector","currentPrice":0,"pe":0,"pb":0,"peg":0,"roe":0,"netMargin":0,"revGrowth":0,"debtToEquity":0,"ret1y":0,"ret3y":0,"high52":0,"low52":0,"beta":0,"instOwn":0,"analystRec":0}]

Use null for any value you cannot find. All percentage values as plain numbers (e.g. 15.3 not 0.153). Return ONLY the JSON array, nothing else.`;

    try{
      const res=await fetch("https://api.anthropic.com/v1/messages",{
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify({
          model:"claude-sonnet-4-20250514",max_tokens:2000,
          tools:[{type:"web_search_20250305",name:"web_search"}],
          messages:[{role:"user",content:prompt}]
        })
      });
      const raw=await res.json();
      const textBlocks=(raw.content||[]).filter(b=>b.type==="text").map(b=>b.text).join("");
      let stockData=[];
      try{
        const m=textBlocks.match(/\[\s*\{[\s\S]*?\}\s*\]/);
        if(m)stockData=JSON.parse(m[0]);
      }catch(e){}

      setStatusMsg("Data fetched. Calculating scores...");

      const result=holdings.map(h=>{
        const d=stockData.find(s=>s.ticker?.toUpperCase()===h.ticker)||{};
        const cp=d.currentPrice||null;
        const invested=h.buyPrice*h.shares;
        const currentVal=cp?cp*h.shares:null;
        const pnl=currentVal!=null?currentVal-invested:null;
        const pnlPct=cp?((cp-h.buyPrice)/h.buyPrice)*100:null;
        const pos52=(d.high52&&d.low52&&d.high52>d.low52&&cp)?((cp-d.low52)/(d.high52-d.low52))*100:null;
        const enriched={...d,ticker:h.ticker,pos52,buyPrice:h.buyPrice,shares:h.shares,invested,currentVal,pnl,pnlPct};
        return{...enriched,scores:calcScores(enriched,weights)};
      });

      setStocks(result);setPhase("done");setStatusMsg("");
      runQuickAI(result);
    }catch(e){
      setPhase("idle");
      setStatusMsg("Error: "+e.message);
    }
  }

  async function runQuickAI(stockList){
    setAiLoading(true);
    const totalInv=stockList.reduce((s,x)=>s+(x.invested||0),0);
    const totalPnl=stockList.reduce((s,x)=>s+(x.pnl||0),0);
    const pnlPct=totalInv>0?(totalPnl/totalInv)*100:null;
    const smap={};stockList.forEach(s=>{const sec=s.sector||"Unknown";smap[sec]=(smap[sec]||0)+s.invested;});
    const topSec=Object.entries(smap).sort((a,b)=>b[1]-a[1])[0];

    const prompt=`You are an expert stock portfolio analyst. Give a direct, specific 3-paragraph assessment.

Portfolio (${cur}${totalInv.toFixed(0)}, ${country==="IN"?"India NSE":"US"} stocks):
${stockList.map(s=>`- ${s.ticker} (${s.name||""}): Bought ${cur}${s.buyPrice} × ${s.shares} shares | Current ${cur}${s.currentPrice||"N/A"} | P&L: ${pct(s.pnlPct)} | Score ${s.scores?.total||"N/A"}/100 [Val:${s.scores?.val} Biz:${s.scores?.biz} Mkt:${s.scores?.mkt} Smart:${s.scores?.smt}] | P/E:${s.pe||"N/A"} | ROE:${s.roe!=null?s.roe.toFixed(1)+"%":"N/A"} | Net Margin:${s.netMargin!=null?s.netMargin.toFixed(1)+"%":"N/A"} | Sector:${s.sector||"N/A"}`).join("\n")}

Total P&L: ${pct(pnlPct)} | Top sector: ${topSec?.[0]||"N/A"} (${topSec?(topSec[1]/totalInv*100).toFixed(0)+"%":"N/A"})

Paragraph 1: What the scores and P&L reveal about this portfolio's quality — be specific about which stocks are strong vs weak and why.
Paragraph 2: The single biggest risk in this portfolio right now — concentration, valuation, weak fundamentals, or underperformance — with exact numbers.
Paragraph 3: One clear action — which specific stock to buy more of, trim, or exit and exactly why based on the scoring data.

Direct. Use actual numbers from the data. No bullet points. No filler phrases.`;

    try{
      const res=await fetch("https://api.anthropic.com/v1/messages",{
        method:"POST",headers:{"Content-Type":"application/json"},
        body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:800,messages:[{role:"user",content:prompt}]})
      });
      const d=await res.json();
      setAiText(d.content?.[0]?.text||"Analysis unavailable.");
    }catch(e){setAiText("Error: "+e.message);}
    setAiLoading(false);
  }

  async function runDeepAI(){
    setDeepLoading(true);setAiText("");
  
  async function runFinalRec(){
    setFinalLoading(true);setFinalText("");
    const totalInv=stocks.reduce((s,x)=>s+(x.invested||0),0);
    const totalPnl=stocks.reduce((s,x)=>s+(x.pnl||0),0);
    const pnlPct=totalInv>0?(totalPnl/totalInv)*100:null;

    const prompt=`You are a senior portfolio manager giving final investment recommendations.

Portfolio (${cur}${totalInv.toFixed(0)}, ${country==="IN"?"India NSE":"USA"}):
${stocks.map(s=>`${s.ticker} | ${s.name||""} | ${s.sector||"Unknown"}
  Entry: ${cur}${s.buyPrice} × ${s.shares} shares | Current: ${cur}${s.currentPrice||"?"} | P&L: ${pct(s.pnlPct)}
  Score: ${s.scores?.total}/100 — Val:${s.scores?.val} Biz:${s.scores?.biz} Mkt:${s.scores?.mkt} Smart:${s.scores?.smt}
  P/E:${s.pe||"N/A"} ROE:${s.roe!=null?s.roe.toFixed(1)+"%":"N/A"} Margin:${s.netMargin!=null?s.netMargin.toFixed(1)+"%":"N/A"} RevGrowth:${s.revGrowth!=null?s.revGrowth.toFixed(1)+"%":"N/A"} Beta:${s.beta!=null?s.beta.toFixed(2):"N/A"}`).join("\n\n")}

Total portfolio P&L: ${pct(pnlPct)}

Previous analysis context: ${aiText ? aiText.slice(0,500)+"..." : "Not available"}

Give a final recommendation report with two sections:

SECTION 1 — PORTFOLIO SUMMARY (2 paragraphs):
Paragraph 1: Overall portfolio quality verdict — what does the combination of scores, fundamentals, and P&L tell you about this portfolio as a whole? Be direct and specific.
Paragraph 2: The top 2 risks in this portfolio right now that the investor must act on, with exact numbers.

SECTION 2 — STOCK-BY-STOCK VERDICT:
For each stock give exactly this format:
[TICKER] — ACTION: BUY MORE / HOLD / TRIM / EXIT
Reason: One specific sentence explaining why, using the actual score and fundamental data.
Target: What price level or condition should trigger a review.

Be direct. Use actual numbers. This is actionable advice, not analysis.`;

    try{
      const res=await fetch("https://api.anthropic.com/v1/messages",{
        method:"POST",headers:{"Content-Type":"application/json"},
        body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:1200,messages:[{role:"user",content:prompt}]})
      });
      const d=await res.json();
      setFinalText(d.content?.[0]?.text||"Unavailable.");
    }catch(e){setFinalText("Error: "+e.message);}
    setFinalLoading(false);
  }

  const totalInv=stocks.reduce((s,x)=>s+(x.invested||0),0);
    const mkt=country==="IN"?"Indian stock market, Nifty 50, RBI interest rates, FII flows":"US stock market, S&P 500, Federal Reserve rates, sector rotation";
    const tickers=stocks.slice(0,4).map(s=>s.ticker).join(", ");

    const prompt=`You are a senior equity analyst. Conduct a deep portfolio analysis using current market context.

PORTFOLIO (${cur}${totalInv.toFixed(0)}, ${country==="IN"?"India NSE":"USA"}):
${stocks.map(s=>`${s.ticker} | ${s.name||""} | ${s.sector||"Unknown"} | Buy:${cur}${s.buyPrice}×${s.shares}sh | Current:${cur}${s.currentPrice||"?"} | P&L:${pct(s.pnlPct)}
  Score:${s.scores?.total}/100 — Val:${s.scores?.val} Biz:${s.scores?.biz} Mkt:${s.scores?.mkt} Smart:${s.scores?.smt}
  P/E:${s.pe||"N/A"} P/B:${s.pb||"N/A"} ROE:${s.roe!=null?s.roe.toFixed(1)+"%":"N/A"} Margin:${s.netMargin!=null?s.netMargin.toFixed(1)+"%":"N/A"} RevGrowth:${s.revGrowth!=null?s.revGrowth.toFixed(1)+"%":"N/A"} D/E:${s.debtToEquity!=null?s.debtToEquity.toFixed(2):"N/A"} Beta:${s.beta!=null?s.beta.toFixed(2):"N/A"}`).join("\n\n")}

Search for: current ${mkt} conditions and valuation levels, recent news on ${tickers}.

Write 5 paragraphs:
1. Portfolio quality in the context of current market conditions
2. Valuation analysis — which stocks look expensive or cheap given market levels right now
3. Business quality — who has the strongest fundamentals and who is weakest
4. Key macro or sector risks affecting this portfolio right now
5. Specific recommendation for each stock: buy more / hold / trim / exit — with reasoning

Use actual numbers. No bullet points.`;

    try{
      const res=await fetch("https://api.anthropic.com/v1/messages",{
        method:"POST",headers:{"Content-Type":"application/json"},
        body:JSON.stringify({
          model:"claude-sonnet-4-20250514",max_tokens:1500,
          tools:[{type:"web_search_20250305",name:"web_search"}],
          messages:[{role:"user",content:prompt}]
        })
      });
      const d=await res.json();
      const text=(d.content||[]).filter(b=>b.type==="text").map(b=>b.text).join("\n\n");
      setAiText(text||"Unavailable.");
    }catch(e){setAiText("Error: "+e.message);}
    setDeepLoading(false);
  }


  async function runFinalRec(){
    setFinalLoading(true);setFinalText("");
    const totalInv=stocks.reduce((s,x)=>s+(x.invested||0),0);
    const totalPnl=stocks.reduce((s,x)=>s+(x.pnl||0),0);
    const pnlPct=totalInv>0?(totalPnl/totalInv)*100:null;

    const prompt=`You are a senior portfolio manager giving final investment recommendations.

Portfolio (${cur}${totalInv.toFixed(0)}, ${country==="IN"?"India NSE":"USA"}):
${stocks.map(s=>`${s.ticker} | ${s.name||""} | ${s.sector||"Unknown"}
  Entry: ${cur}${s.buyPrice} × ${s.shares} shares | Current: ${cur}${s.currentPrice||"?"} | P&L: ${pct(s.pnlPct)}
  Score: ${s.scores?.total}/100 — Val:${s.scores?.val} Biz:${s.scores?.biz} Mkt:${s.scores?.mkt} Smart:${s.scores?.smt}
  P/E:${s.pe||"N/A"} ROE:${s.roe!=null?s.roe.toFixed(1)+"%":"N/A"} Margin:${s.netMargin!=null?s.netMargin.toFixed(1)+"%":"N/A"} RevGrowth:${s.revGrowth!=null?s.revGrowth.toFixed(1)+"%":"N/A"} Beta:${s.beta!=null?s.beta.toFixed(2):"N/A"}`).join("\n\n")}

Total portfolio P&L: ${pct(pnlPct)}

Previous analysis context: ${aiText ? aiText.slice(0,500)+"..." : "Not available"}

Give a final recommendation report with two sections:

SECTION 1 — PORTFOLIO SUMMARY (2 paragraphs):
Paragraph 1: Overall portfolio quality verdict — what does the combination of scores, fundamentals, and P&L tell you about this portfolio as a whole? Be direct and specific.
Paragraph 2: The top 2 risks in this portfolio right now that the investor must act on, with exact numbers.

SECTION 2 — STOCK-BY-STOCK VERDICT:
For each stock give exactly this format:
[TICKER] — ACTION: BUY MORE / HOLD / TRIM / EXIT
Reason: One specific sentence explaining why, using the actual score and fundamental data.
Target: What price level or condition should trigger a review.

Be direct. Use actual numbers. This is actionable advice, not analysis.`;

    try{
      const res=await fetch("https://api.anthropic.com/v1/messages",{
        method:"POST",headers:{"Content-Type":"application/json"},
        body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:1200,messages:[{role:"user",content:prompt}]})
      });
      const d=await res.json();
      setFinalText(d.content?.[0]?.text||"Unavailable.");
    }catch(e){setFinalText("Error: "+e.message);}
    setFinalLoading(false);
  }

  const totalInv=stocks.reduce((s,x)=>s+(x.invested||0),0);
  const valid=stocks.filter(s=>s.currentPrice);
  const totalCurr=valid.reduce((s,x)=>s+(x.currentVal||0),0)+stocks.filter(s=>!s.currentPrice).reduce((s,x)=>s+(x.invested||0),0);
  const totalPnl=valid.reduce((s,x)=>s+(x.pnl||0),0);
  const pnlPct=totalInv>0?(totalPnl/totalInv)*100:null;
  const portScore=valid.length?Math.round(valid.reduce((s,x)=>s+x.scores.total*(x.invested/totalInv),0)):0;
  const smap={};stocks.forEach(s=>{const sec=s.sector||"Unknown";smap[sec]=(smap[sec]||0)+(s.invested||0);});
  const secs=Object.entries(smap).sort((a,b)=>b[1]-a[1]);
  const {g:pg,col:pgCol}=gradeOf(portScore);

  return(
    <div style={{background:"#07090d",minHeight:"100vh",padding:"1.5rem",fontFamily:"'DM Sans',sans-serif",color:"#e8edf5"}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500&family=DM+Mono:wght@400;500&display=swap');
        @keyframes lp{0%{width:0;margin-left:0}50%{width:60%;margin-left:20%}100%{width:0;margin-left:100%}}
        @keyframes spin{to{transform:rotate(360deg)}}
      `}</style>

      {/* Header */}
      <div style={{maxWidth:1100,margin:"0 auto 1.5rem",paddingBottom:"1.25rem",borderBottom:"1px solid #1a2232",display:"flex",alignItems:"flex-end",justifyContent:"space-between"}}>
        <div>
          <div style={{fontSize:"1.6rem",fontWeight:700,letterSpacing:"-.02em"}}>Stock Portfolio <span style={{color:"#5a6880"}}>Analyser</span></div>
          <div style={{fontSize:".75rem",color:"#5a6880",marginTop:".2rem"}}>4-dimension scoring · India (NSE) & USA · Live data via Claude web search</div>
        </div>
        <span style={{fontFamily:"monospace",fontSize:".6rem",color:"#f5c518",background:"rgba(245,197,24,.08)",border:"1px solid rgba(245,197,24,.2)",padding:".2rem .6rem",borderRadius:20}}>v2.0</span>
      </div>

      <div style={{maxWidth:1100,margin:"0 auto"}}>

        {/* Country tabs */}
        <div style={{display:"flex",gap:".5rem",marginBottom:"1.5rem"}}>
          {[["IN","🇮🇳 India — NSE","#00d4aa","rgba(0,212,170,.1)"],["US","🇺🇸 USA — NYSE / NASDAQ","#4a9eff","rgba(74,158,255,.1)"]].map(([c,lbl,col,bg])=>(
            <button key={c} onClick={()=>switchCountry(c)} style={{
              display:"flex",alignItems:"center",gap:".4rem",padding:".45rem 1rem",
              borderRadius:8,cursor:"pointer",fontSize:".78rem",fontFamily:"inherit",fontWeight:500,
              border:"1px solid",transition:"all .2s",
              background:country===c?bg:"#0d1117",
              borderColor:country===c?col:"#243040",
              color:country===c?col:"#5a6880"
            }}>{lbl}</button>
          ))}
        </div>

        <div style={{display:"grid",gridTemplateColumns:"310px 1fr",gap:"1.1rem",alignItems:"start"}}>

          {/* Input panel */}
          <div style={{background:"#0d1117",border:"1px solid #1a2232",borderRadius:12,padding:"1.1rem"}}>
            <div style={{fontSize:".65rem",fontWeight:600,textTransform:"uppercase",letterSpacing:".1em",color:"#5a6880",marginBottom:".85rem"}}>Your Holdings</div>

            <div style={{display:"grid",gridTemplateColumns:"80px 72px 62px 22px",gap:".35rem",marginBottom:".3rem"}}>
              {[country==="IN"?"Ticker (NSE)":"Ticker (US)",country==="IN"?"Buy (₹)":"Buy ($)","Shares",""].map(h=>(
                <span key={h} style={{fontSize:".58rem",color:"#5a6880",textTransform:"uppercase",letterSpacing:".05em"}}>{h}</span>
              ))}
            </div>

            {rows.map(r=>(
              <div key={r.id} style={{display:"grid",gridTemplateColumns:"80px 72px 62px 22px",gap:".35rem",marginBottom:".4rem",alignItems:"center"}}>
                <input value={r.t} onChange={e=>updRow(r.id,"t",e.target.value.toUpperCase())}
                  placeholder={country==="IN"?"e.g. BSE, TCS":"e.g. AAPL, MSFT"} autoComplete="off"
                  style={{background:"#07090d",border:"1px solid #1a2232",borderRadius:5,color:"#e8edf5",fontSize:".75rem",padding:".38rem .45rem",outline:"none",width:"100%",fontFamily:"inherit"}}/>
                <input type="number" value={r.p} onChange={e=>updRow(r.id,"p",e.target.value)}
                  placeholder="0.00" min="0" step="0.01"
                  style={{background:"#07090d",border:"1px solid #1a2232",borderRadius:5,color:"#e8edf5",fontSize:".75rem",padding:".38rem .45rem",outline:"none",width:"100%",fontFamily:"inherit"}}/>
                <input type="number" value={r.s} onChange={e=>updRow(r.id,"s",e.target.value)}
                  placeholder="0" min="0" step="1"
                  style={{background:"#07090d",border:"1px solid #1a2232",borderRadius:5,color:"#e8edf5",fontSize:".75rem",padding:".38rem .45rem",outline:"none",width:"100%",fontFamily:"inherit"}}/>
                <button onClick={()=>removeRow(r.id)} style={{background:"none",border:"none",color:"#5a6880",cursor:"pointer",fontSize:"1rem",lineHeight:1,padding:0}}>×</button>
              </div>
            ))}

            <button onClick={addRow} style={{width:"100%",marginTop:".15rem",fontSize:".72rem",padding:".38rem",border:"1px dashed #243040",borderRadius:5,cursor:"pointer",color:"#5a6880",background:"transparent",fontFamily:"inherit"}}>+ Add stock</button>

            <div style={{margin:".85rem 0 .75rem",padding:".65rem",background:"#07090d",borderRadius:7,border:"1px solid #1a2232"}}>
              <div style={{fontSize:".6rem",color:"#5a6880",textTransform:"uppercase",letterSpacing:".07em",marginBottom:".4rem"}}>Scoring — 4 Dimensions</div>
              {[["#f5c518","Valuation (25%) — P/E, P/B, PEG"],["#00d4aa","Business Quality (35%) — ROE, margins, growth, debt"],["#4a9eff","Market Behaviour (25%) — returns, beta, 52W position"],["#a855f7","Smart Money (15%) — institutional ownership, analysts"]].map(([col,lbl])=>(
                <div key={lbl} style={{display:"flex",alignItems:"center",gap:".35rem",fontSize:".65rem",color:"#8a9ab5",marginBottom:".18rem"}}>
                  <span style={{width:6,height:6,borderRadius:"50%",background:col,display:"inline-block",flexShrink:0}}/>
                  {lbl}
                </div>
              ))}
            </div>

            {/* Scoring weights customiser */}
            <div style={{margin:".85rem 0 .75rem",padding:".75rem",background:"#07090d",borderRadius:7,border:"1px solid #1a2232"}}>
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:".6rem"}}>
                <span style={{fontSize:".6rem",color:"#5a6880",textTransform:"uppercase",letterSpacing:".07em"}}>Scoring Weights</span>
                <div style={{display:"flex",alignItems:"center",gap:".5rem"}}>
                  <button onClick={()=>setWeights({...DEFAULT_W})}
                    style={{fontSize:".65rem",color:"#00d4aa",background:"rgba(0,212,170,.08)",border:"1px solid #2ea043",padding:".18rem .5rem",borderRadius:5,cursor:"pointer",fontFamily:"inherit",fontWeight:500}}>
                    ↺ Reset
                  </button>
                  <span style={{
                    fontFamily:"monospace",fontSize:".72rem",fontWeight:700,padding:".12rem .4rem",borderRadius:5,
                    color:wValid?"#3fb950":wTotal>100?"#ff4d6d":"#f5a623",
                    background:wValid?"rgba(0,212,170,.1)":wTotal>100?"rgba(255,77,109,.1)":"rgba(245,166,35,.1)",
                    border:`1px solid ${wValid?"#2ea043":wTotal>100?"#ff4d6d":"#9e6a03"}`
                  }}>{wTotal}%</span>
                </div>
              </div>
              {[
                {key:"val", label:"Valuation",        col:"#f5c518", def:25, desc:"P/E, P/B, PEG"},
                {key:"biz", label:"Business Quality", col:"#00d4aa", def:35, desc:"ROE, margins, growth"},
                {key:"mkt", label:"Market Behaviour", col:"#4a9eff", def:25, desc:"Returns, beta, 52W"},
                {key:"smt", label:"Smart Money",      col:"#a855f7", def:15, desc:"Institutions, analysts"},
              ].map(({key,label,col,def,desc})=>(
                <div key={key} style={{marginBottom:".55rem"}}>
                  <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:".2rem"}}>
                    <div style={{display:"flex",alignItems:"center",gap:".35rem"}}>
                      <span style={{width:7,height:7,borderRadius:"50%",background:col,display:"inline-block",flexShrink:0}}/>
                      <span style={{fontSize:".72rem",color:"#c9d1d9",fontWeight:500}}>{label}</span>
                      <span style={{fontSize:".58rem",color:"#5a6880",background:"#111820",border:"1px solid #1a2232",padding:".02rem .3rem",borderRadius:4,fontFamily:"monospace"}}>default:{def}%</span>
                    </div>
                    <span style={{fontFamily:"monospace",fontSize:".78rem",fontWeight:700,color:col}}>{weights[key]}%</span>
                  </div>
                  <input type="range" min="0" max="100" value={weights[key]}
                    onChange={e=>changeWeight(key,e.target.value)}
                    style={{width:"100%",accentColor:col,cursor:"pointer",height:3}}/>
                  <div style={{fontSize:".58rem",color:"#5a6880",marginTop:".1rem"}}>{desc}</div>
                </div>
              ))}
              {/* Weight bar */}
              <div style={{display:"flex",height:4,borderRadius:2,overflow:"hidden",background:"#1a2232",marginTop:".5rem",gap:1}}>
                {[["val","#f5c518"],["biz","#00d4aa"],["mkt","#4a9eff"],["smt","#a855f7"]].map(([k,col])=>(
                  <div key={k} style={{width:`${Math.min(weights[k],100)}%`,background:col,transition:"width .2s",borderRadius:2}}/>
                ))}
              </div>
              {stocks.length>0&&(
                <button onClick={applyWeights} disabled={!wValid} style={{
                  width:"100%",marginTop:".55rem",padding:".38rem",borderRadius:6,cursor:wValid?"pointer":"not-allowed",
                  fontSize:".72rem",fontFamily:"inherit",fontWeight:500,border:"none",
                  background:wValid?"rgba(0,212,170,.15)":"rgba(255,255,255,.04)",
                  color:wValid?"#00d4aa":"#5a6880"
                }}>
                  {wValid?"↻ Apply weights to current portfolio":"Set weights to 100% to apply"}
                </button>
              )}
              {!wValid&&<div style={{fontSize:".6rem",color:"#f5a623",textAlign:"center",marginTop:".3rem"}}>Adjust sliders so total = 100%</div>}
            </div>

            <button onClick={runAnalysis} disabled={phase==="loading"} style={{
              width:"100%",padding:".58rem",borderRadius:8,cursor:phase==="loading"?"not-allowed":"pointer",
              fontSize:".82rem",fontFamily:"inherit",fontWeight:700,letterSpacing:".04em",border:"none",
              background:acc,color:"#000",opacity:phase==="loading"?0.5:1
            }}>{phase==="loading"?"Fetching live data...":"Analyse Portfolio"}</button>

            <div style={{fontSize:".65rem",color:"#5a6880",marginTop:".5rem",lineHeight:1.55}}>
              {country==="IN"
                ?"Enter NSE ticker symbols only — RELIANCE, TCS, HDFCBANK, BSE, CANBK. Not company names. Enter avg price you paid and number of shares."
                :"Enter US ticker symbols only — AAPL, MSFT, NVDA, GOOGL, AMZN. Not company names. Enter avg price paid and shares held."}
            </div>
          </div>

          {/* Results panel */}
          <div style={{background:"#0d1117",border:"1px solid #1a2232",borderRadius:12,padding:"1.1rem"}}>

            {phase==="idle"&&(
              <div style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",minHeight:320,textAlign:"center",color:"#5a6880"}}>
                <div style={{fontSize:"2rem",opacity:.25,marginBottom:".5rem"}}>◎</div>
                <div style={{fontSize:".8rem",maxWidth:240,lineHeight:1.5}}>Enter your holdings and click Analyse. Claude searches for live market data and scores each stock using 4 dimensions.</div>
              </div>
            )}

            {phase==="loading"&&(
              <div style={{padding:"2rem",textAlign:"center",color:"#5a6880"}}>
                <div style={{fontSize:"1.5rem",display:"inline-block",animation:"spin 1s linear infinite",marginBottom:".75rem",color:acc}}>⟳</div>
                <div style={{fontSize:".82rem",color:"#e8edf5",marginBottom:".4rem"}}>Claude is fetching live market data...</div>
                <div style={{fontSize:".72rem",color:"#5a6880",lineHeight:1.6}}>{statusMsg}</div>
              </div>
            )}

            {phase==="done"&&stocks.length>0&&(
              <>
                {/* Portfolio score */}
                <div style={{display:"flex",alignItems:"center",gap:".9rem",padding:".9rem",background:"#111820",border:"1px solid #1a2232",borderRadius:10,marginBottom:"1rem"}}>
                  <div style={{fontFamily:"monospace",fontSize:"2.2rem",fontWeight:500,color:sc(portScore)}}>{portScore}</div>
                  <div style={{flex:1}}>
                    <div style={{fontSize:".6rem",color:"#5a6880",textTransform:"uppercase",letterSpacing:".07em",marginBottom:".28rem"}}>
                      Portfolio Score <span style={{fontSize:".68rem",fontWeight:700,padding:".1rem .35rem",borderRadius:4,background:"rgba(0,0,0,.3)",color:pgCol,marginLeft:4}}>{pg}</span>
                    </div>
                    <div style={{display:"flex",gap:".6rem",flexWrap:"wrap"}}>
                      {valid.length>0&&[["Val","val"],["Biz","biz"],["Mkt","mkt"],["Smart","smt"]].map(([l,k])=>{
                        const v=Math.round(valid.reduce((s,x)=>s+x.scores[k]*(x.invested/totalInv),0));
                        return <span key={l} style={{fontSize:".67rem",color:"#8a9ab5"}}>{l}<span style={{fontFamily:"monospace",fontWeight:500,marginLeft:2,color:sc(v)}}>{v}</span></span>;
                      })}
                    </div>
                  </div>
                </div>

                {/* Stats */}
                <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:".55rem",marginBottom:"1rem"}}>
                  {[["Invested",money(totalInv,cur),"#e8edf5"],["Current Value",money(totalCurr,cur),totalPnl>=0?"#00d4aa":"#ff4d6d"],["Total P&L",(totalPnl>=0?"+":"")+money(totalPnl,cur),totalPnl>=0?"#00d4aa":"#ff4d6d"],["Return",pct(pnlPct),pnlPct!=null?(pnlPct>=0?"#00d4aa":"#ff4d6d"):"#e8edf5"]].map(([l,v,col])=>(
                    <div key={l} style={{background:"#07090d",border:"1px solid #1a2232",borderRadius:7,padding:".7rem",textAlign:"center"}}>
                      <div style={{fontSize:".57rem",color:"#5a6880",textTransform:"uppercase",letterSpacing:".07em",marginBottom:".25rem"}}>{l}</div>
                      <div style={{fontFamily:"monospace",fontSize:".85rem",fontWeight:500,color:col}}>{v}</div>
                    </div>
                  ))}
                </div>

                {/* Sector allocation */}
                {secs.length>0&&(
                  <div style={{marginBottom:"1rem"}}>
                    <div style={{fontSize:".63rem",color:"#5a6880",textTransform:"uppercase",letterSpacing:".08em",marginBottom:".4rem"}}>Sector Allocation</div>
                    <div style={{height:7,borderRadius:4,background:"#1a2232",overflow:"hidden",display:"flex",marginBottom:".4rem"}}>
                      {secs.map((e,i)=><div key={e[0]} style={{height:"100%",width:`${(e[1]/totalInv*100).toFixed(1)}%`,background:COLORS[i%COLORS.length]}}/>)}
                    </div>
                    <div style={{display:"flex",flexWrap:"wrap",gap:".4rem"}}>
                      {secs.map((e,i)=>(
                        <div key={e[0]} style={{display:"flex",alignItems:"center",gap:".28rem",fontSize:".68rem",color:"#8a9ab5"}}>
                          <span style={{width:6,height:6,borderRadius:"50%",background:COLORS[i%COLORS.length],display:"inline-block"}}/>
                          {e[0]} <strong style={{color:"#e8edf5",marginLeft:2}}>{(e[1]/totalInv*100).toFixed(0)}%</strong>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Stock cards */}
                <div style={{fontSize:".63rem",color:"#5a6880",textTransform:"uppercase",letterSpacing:".08em",marginBottom:".6rem"}}>Individual Stocks</div>
                <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(210px,1fr))",gap:".75rem",marginBottom:"1rem"}}>
                  {stocks.map(s=>{
                    if(!s.currentPrice) return(
                      <div key={s.ticker} style={{background:"#07090d",border:"1px solid rgba(255,77,109,.2)",borderRadius:10,padding:".9rem",position:"relative",overflow:"hidden"}}>
                        <div style={{position:"absolute",top:0,left:0,right:0,height:2,background:"#ff4d6d"}}/>
                        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:".15rem"}}>
                          <span style={{fontFamily:"monospace",fontSize:".7rem",color:"#5a6880"}}>{s.ticker}</span>
                          <span style={{fontSize:".62rem",color:"#ff4d6d"}}>No data</span>
                        </div>
                        <div style={{fontSize:".73rem",color:"#ff4d6d",marginTop:".4rem",lineHeight:1.4}}>No data found. Make sure you entered a ticker symbol (e.g. AAPL, MSFT) not the company name.</div>
                        <div style={{fontSize:".68rem",color:"#5a6880",marginTop:".3rem"}}>Invested: {money(s.invested,cur)}</div>
                      </div>
                    );
                    const sc2=s.scores;
                    const {g,col:gc}=gradeOf(sc2.total);
                    const barCol=country==="IN"?"#00d4aa":"#4a9eff";
                    return(
                      <div key={s.ticker} style={{background:"#07090d",border:"1px solid #1a2232",borderRadius:10,padding:".9rem",position:"relative",overflow:"hidden"}}>
                        <div style={{position:"absolute",top:0,left:0,right:0,height:2,background:barCol}}/>
                        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:".15rem"}}>
                          <span style={{fontFamily:"monospace",fontSize:".7rem",color:"#5a6880"}}>{s.ticker}</span>
                          <span style={{fontSize:".65rem",fontWeight:700,padding:".1rem .35rem",borderRadius:4,background:"rgba(0,0,0,.3)",color:gc}}>{g}</span>
                        </div>
                        <div style={{fontSize:".77rem",fontWeight:500,color:"#e8edf5",marginBottom:".55rem",lineHeight:1.3,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}} title={s.name}>{s.name||s.ticker}</div>

                        {[["Val",sc2.val,"#f5c518"],["Biz",sc2.biz,"#00d4aa"],["Mkt",sc2.mkt,"#4a9eff"],["Smart",sc2.smt,"#a855f7"]].map(([l,v,col])=>(
                          <div key={l} style={{display:"flex",alignItems:"center",gap:".4rem",marginBottom:".25rem"}}>
                            <span style={{fontSize:".57rem",color:"#5a6880",width:45,flexShrink:0,textTransform:"uppercase",letterSpacing:".04em"}}>{l}</span>
                            <div style={{flex:1,height:3,background:"#1a2232",borderRadius:2,overflow:"hidden"}}>
                              <div style={{height:"100%",width:`${v}%`,background:col,borderRadius:2}}/>
                            </div>
                            <span style={{fontFamily:"monospace",fontSize:".6rem",width:22,textAlign:"right",color:col,flexShrink:0}}>{v}</span>
                          </div>
                        ))}

                        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:".38rem .5rem",background:"#0d1117",borderRadius:6,border:"1px solid #1a2232",margin:".55rem 0"}}>
                          <div>
                            <div style={{fontSize:".55rem",color:"#5a6880",textTransform:"uppercase",letterSpacing:".04em"}}>Score</div>
                            <div style={{fontFamily:"monospace",fontSize:".95rem",fontWeight:500,color:sc(sc2.total)}}>{sc2.total}<span style={{fontSize:".58rem",color:"#5a6880"}}>/100</span></div>
                          </div>
                          <span style={{fontFamily:"monospace",fontSize:".68rem",fontWeight:500,padding:".15rem .4rem",borderRadius:4,background:s.pnlPct>=0?"rgba(0,212,170,.12)":"rgba(255,77,109,.12)",color:s.pnlPct>=0?"#00d4aa":"#ff4d6d"}}>
                            {s.pnlPct>=0?"▲":"▼"} {pct(s.pnlPct)}
                          </span>
                        </div>

                        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:".35rem"}}>
                          {[["Buy Price",`${cur}${s.buyPrice?.toFixed(1)}`,"#e8edf5"],["Current",`${cur}${s.currentPrice?.toFixed(1)}`,s.pnlPct>=0?"#00d4aa":"#ff4d6d"],["Invested",money(s.invested,cur),"#e8edf5"],["Value",money(s.currentVal,cur),s.pnlPct>=0?"#00d4aa":"#ff4d6d"],["P/E",s.pe!=null?s.pe.toFixed(1):"—","#e8edf5"],["ROE",s.roe!=null?s.roe.toFixed(1)+"%":"—","#e8edf5"],["Net Margin",s.netMargin!=null?s.netMargin.toFixed(1)+"%":"—","#e8edf5"],["1Y Return",pct(s.ret1y),s.ret1y>=0?"#00d4aa":"#ff4d6d"]].map(([l,v,col])=>(
                            <div key={l}>
                              <div style={{fontSize:".57rem",color:"#5a6880",textTransform:"uppercase",letterSpacing:".04em"}}>{l}</div>
                              <div style={{fontFamily:"monospace",fontSize:".72rem",color:col}}>{v}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* AI section */}
                <div style={{borderTop:"1px solid #1a2232",paddingTop:"1.1rem"}}>
                  <div style={{display:"flex",alignItems:"center",gap:".6rem",marginBottom:".75rem"}}>
                    <div style={{width:26,height:26,background:country==="IN"?"rgba(0,212,170,.1)":"rgba(74,158,255,.1)",borderRadius:7,display:"flex",alignItems:"center",justifyContent:"center",fontSize:".82rem"}}>✦</div>
                    <div>
                      <div style={{fontSize:".8rem",fontWeight:500,color:"#e8edf5"}}>AI Portfolio Analysis</div>
                      <div style={{fontSize:".67rem",color:"#5a6880"}}>Powered by Claude · Based on live fetched data</div>
                    </div>
                    <button onClick={runDeepAI} disabled={deepLoading} style={{
                      marginLeft:"auto",background:"#111820",border:"1px solid #243040",color:"#8a9ab5",
                      padding:".4rem .9rem",borderRadius:6,cursor:deepLoading?"not-allowed":"pointer",
                      fontSize:".72rem",fontFamily:"inherit",opacity:deepLoading?0.5:1
                    }}>{deepLoading?"Searching...":"↓ Deep Analysis + Market Context"}</button>
                    <button onClick={runFinalRec} disabled={finalLoading} style={{
                      background:finalText?"rgba(245,197,24,.1)":"#111820",
                      border:`1px solid ${finalText?"#f5c518":"#243040"}`,
                      color:finalText?"#f5c518":"#8a9ab5",
                      padding:".4rem .9rem",borderRadius:6,cursor:finalLoading?"not-allowed":"pointer",
                      fontSize:".72rem",fontFamily:"inherit",opacity:finalLoading?0.5:1,fontWeight:finalText?600:400
                    }}>{finalLoading?"Generating...":"★ Final Recommendation"}</button>
                  </div>

                  {(aiLoading||deepLoading||finalLoading)&&(
                    <div style={{height:2,background:"#1a2232",borderRadius:1,overflow:"hidden",marginBottom:".65rem"}}>
                      <div style={{height:"100%",background:acc,animation:"lp 1.5s ease-in-out infinite",borderRadius:1}}/>
                    </div>
                  )}

                  {aiText&&<div style={{fontSize:".83rem",color:"#b8c4d5",lineHeight:1.85,whiteSpace:"pre-wrap"}}>{aiText}</div>}

                  {finalText&&(
                    <div style={{marginTop:"1.25rem",borderTop:"1px solid #1a2232",paddingTop:"1.1rem"}}>
                      <div style={{display:"flex",alignItems:"center",gap:".5rem",marginBottom:".75rem"}}>
                        <span style={{fontSize:".65rem",color:"#f5c518",background:"rgba(245,197,24,.08)",border:"1px solid rgba(245,197,24,.2)",padding:".15rem .55rem",borderRadius:12,fontWeight:600,letterSpacing:".05em"}}>★ FINAL RECOMMENDATION</span>
                      </div>
                      <div style={{fontSize:".83rem",color:"#e8edf5",lineHeight:1.9,whiteSpace:"pre-wrap"}}>{finalText}</div>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>

        <div style={{fontSize:".65rem",color:"#5a6880",marginTop:"1rem",padding:".6rem .75rem",border:"1px solid #1a2232",borderRadius:6,lineHeight:1.6}}>
          ⚠ Educational use only. Not financial advice. Stock data fetched live by Claude via web search. Verify before investing.
        </div>
      </div>
    </div>
  );
}
