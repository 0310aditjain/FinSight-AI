import { useState, useEffect } from "react";

const FUND_DATA = {
  index: [
    {name:"UTI Nifty 50 Index Fund",amc:"UTI",aum:24433.24,expense:0.2,trackingError:0.02},
    {name:"HDFC Nifty 50 Index Fund",amc:"HDFC",aum:20436.59,expense:0.2,trackingError:0.02},
    {name:"ICICI Pru Nifty 50 Index Fund",amc:"ICICI Pru",aum:14153.47,expense:0.2,trackingError:0.03},
    {name:"SBI Nifty Index Fund",amc:"SBI",aum:11879.12,expense:0.19,trackingError:0.02},
    {name:"ICICI Pru Nifty Next 50 Index Fund",amc:"ICICI Pru",aum:8396.38,expense:0.31,trackingError:0.09},
    {name:"HDFC BSE Sensex Index Fund",amc:"HDFC",aum:7896.85,expense:0.2,trackingError:1.19},
    {name:"UTI Nifty200 Momentum 30 Index Fund",amc:"UTI",aum:7475.58,expense:0.43,trackingError:0.22},
    {name:"UTI Nifty Next 50 Index Fund",amc:"UTI",aum:6245.96,expense:0.35,trackingError:0.03},
    {name:"Motilal Oswal Nifty India Defence Index Fund",amc:"Motilal Oswal",aum:3697.63,expense:0.58,trackingError:0.05},
    {name:"Navi Nifty 50 Index Fund",amc:"Navi",aum:3572.89,expense:0.06,trackingError:0.02},
    {name:"Nippon India Index Fund-Nifty 50 Plan",amc:"Nippon",aum:3030,expense:0.07,trackingError:0.03},
    {name:"Motilal Oswal Nifty Midcap 150 Index Fund",amc:"Motilal Oswal",aum:2900.79,expense:0.23,trackingError:0.06},
    {name:"Motilal Oswal Nifty 500 Index Fund",amc:"Motilal Oswal",aum:2638.87,expense:0.17,trackingError:0.03},
    {name:"Nippon India Nifty Smallcap 250 Index Fund",amc:"Nippon",aum:2523.3,expense:0.35,trackingError:0.07},
    {name:"DSP Nifty 50 Equal Weight Index Fund",amc:"DSP",aum:2254.98,expense:0.4,trackingError:0.09},
    {name:"Bandhan Nifty 50 Index Fund",amc:"Bandhan",aum:2228.31,expense:0.1,trackingError:0.02},
    {name:"Nippon India Nifty Midcap 150 Index Fund",amc:"Nippon",aum:2188.15,expense:0.3,trackingError:0.14},
    {name:"HDFC NIFTY Next 50 Index Fund",amc:"HDFC",aum:1993.71,expense:0.3,trackingError:0.04},
    {name:"Motilal Oswal Nifty Microcap 250 Index Fund",amc:"Motilal Oswal",aum:1962.69,expense:0.53,trackingError:0.29},
    {name:"Axis Nifty 100 Index Fund",amc:"Axis",aum:1791.65,expense:0.21,trackingError:0.03},
    {name:"SBI Nifty Next 50 Index Fund",amc:"SBI",aum:1711.4,expense:0.31,trackingError:0.03},
    {name:"ICICI Pru BSE Sensex Index Fund",amc:"ICICI Pru",aum:1696.65,expense:0.2,trackingError:1.16},
    {name:"Bandhan Nifty100 Low Volatility 30 Index Fund",amc:"Bandhan",aum:1579.84,expense:0.35,trackingError:0.07},
    {name:"HDFC NIFTY50 Equal Weight Index Fund",amc:"HDFC",aum:1558.77,expense:0.4,trackingError:0.09},
    {name:"Nippon India Nifty Alpha Low Volatility 30 Index Fund",amc:"Nippon",aum:1392.39,expense:0.35,trackingError:0.22},
    {name:"Tata NIFTY 50 Index Fund",amc:"Tata",aum:1379.88,expense:0.18,trackingError:0.1},
    {name:"Edelweiss Nifty Midcap150 Momentum 50 Index Fund",amc:"Edelweiss",aum:1333.36,expense:0.43,trackingError:0.29},
    {name:"SBI Nifty Smallcap 250 Index Fund",amc:"SBI",aum:1305.68,expense:0.4,trackingError:0.06},
    {name:"Zerodha Nifty LargeMidcap 250 Index Fund",amc:"Zerodha",aum:1234.18,expense:0.27,trackingError:0.04},
    {name:"Aditya Birla SL Nifty 50 Index Fund",amc:"Aditya Birla",aum:1170.29,expense:0.17,trackingError:0.07},
    {name:"DSP Nifty Top 10 Equal Weight Index Fund",amc:"DSP",aum:1147.63,expense:0.24,trackingError:0.07},
    {name:"DSP NIFTY Next 50 Index Fund",amc:"DSP",aum:1065.91,expense:0.26,trackingError:0.09},
    {name:"Tata Nifty Midcap 150 Momentum 50 Index Fund",amc:"Tata",aum:1062.97,expense:0.44,trackingError:0.28},
    {name:"Navi Nifty Next 50 Index Fund",amc:"Navi",aum:1002.49,expense:0.15,trackingError:0.08},
    {name:"Nippon India Nifty 500 Momentum 50 Index Fund",amc:"Nippon",aum:983.48,expense:0.25,trackingError:0.27},
    {name:"Kotak Nifty 50 Index Fund",amc:"Kotak",aum:980.69,expense:0.07,trackingError:0.05},
    {name:"SBI Nifty50 Equal Weight Index Fund",amc:"SBI",aum:952.47,expense:0.45,trackingError:0.08},
    {name:"Motilal Oswal Nifty Smallcap 250 Index Fund",amc:"Motilal Oswal",aum:931.82,expense:0.33,trackingError:0.05},
    {name:"Nippon India Nifty 50 Value 20 Index Fund",amc:"Nippon",aum:912.24,expense:0.25,trackingError:0.06},
    {name:"DSP NIFTY 50 Index Fund",amc:"DSP",aum:909.02,expense:0.18,trackingError:0.04},
    {name:"SBI Nifty Midcap 150 Index Fund",amc:"SBI",aum:885.3,expense:0.4,trackingError:0.04},
    {name:"ICICI Pru Nifty Midcap 150 Index Fund",amc:"ICICI Pru",aum:867.13,expense:0.16,trackingError:0.04},
    {name:"Kotak Nifty Next 50 Index Fund",amc:"Kotak",aum:853.62,expense:0.1,trackingError:0.05},
    {name:"Motilal Oswal Nifty 50 Index Fund",amc:"Motilal Oswal",aum:852.63,expense:0.12,trackingError:0.04},
    {name:"Axis Nifty 50 Index Fund",amc:"Axis",aum:849.72,expense:0.1,trackingError:0.04},
    {name:"Nippon India Index Fund-BSE Sensex Plan",amc:"Nippon",aum:849.49,expense:0.2,trackingError:1.16},
    {name:"Aditya Birla SL Nifty India Defence Index Fund",amc:"Aditya Birla",aum:847.22,expense:0.33,trackingError:0.09},
    {name:"Motilal Oswal Nifty 200 Momentum 30 Index Fund",amc:"Motilal Oswal",aum:840.36,expense:0.32,trackingError:0.53},
    {name:"SBI Nifty 500 Index Fund",amc:"SBI",aum:776.68,expense:0.31,trackingError:0.02},
    {name:"Franklin India NSE Nifty 50 Index Fund",amc:"Franklin",aum:678.44,expense:0.28,trackingError:0.28},
    {name:"Motilal Oswal Nifty 500 Momentum 50 Index Fund",amc:"Motilal Oswal",aum:657.6,expense:0.44,trackingError:0.4},
    {name:"UTI Nifty 500 Value 50 Index Fund",amc:"UTI",aum:614.94,expense:0.63,trackingError:0.2},
    {name:"ICICI Pru Nifty Bank Index Fund",amc:"ICICI Pru",aum:611.68,expense:0.15,trackingError:0.04},
    {name:"Motilal Oswal Nifty Bank Index Fund",amc:"Motilal Oswal",aum:577.78,expense:0.19,trackingError:0.06},
    {name:"Axis Nifty Midcap 50 Index Fund",amc:"Axis",aum:565.91,expense:0.24,trackingError:0.11},
    {name:"Navi Nifty Bank Index Fund",amc:"Navi",aum:557.33,expense:0.15,trackingError:0.05},
    {name:"ICICI Pru Nifty Smallcap 250 Index Fund",amc:"ICICI Pru",aum:551.98,expense:0.3,trackingError:0.07},
    {name:"HDFC NIFTY200 Momentum 30 Index Fund",amc:"HDFC",aum:543.67,expense:0.4,trackingError:0.26},
    {name:"UTI Nifty200 Quality 30 Index Fund",amc:"UTI",aum:534.42,expense:0.7,trackingError:0.16},
    {name:"HDFC NIFTY Smallcap 250 Index Fund",amc:"HDFC",aum:530.9,expense:0.3,trackingError:0.07},
    {name:"Edelweiss Nifty500 Multicap Momentum Quality 50 Index Fund",amc:"Edelweiss",aum:521.35,expense:0.36,trackingError:0.37},
    {name:"HDFC NIFTY Midcap 150 Index Fund",amc:"HDFC",aum:512.62,expense:0.3,trackingError:0.05},
    {name:"Axis Nifty Smallcap 50 Index Fund",amc:"Axis",aum:512.37,expense:0.27,trackingError:0.1}
  ],
  largecap: [
    {name:"Kotak Large Cap Fund",amc:"Kotak",aum:9794.5,expense:0.63,rolling:18.68,prob:78.0,sortino:0.32},
    {name:"Franklin India Large Cap Fund",amc:"Franklin",aum:6821.2,expense:1.17,rolling:17.58,prob:71.0,sortino:0.31},
    {name:"DSP Large Cap Fund",amc:"DSP",aum:6619.6,expense:0.86,rolling:18.12,prob:73.0,sortino:0.42},
    {name:"Sundaram Large Cap Fund",amc:"Sundaram",aum:2889.3,expense:0.73,rolling:16.53,prob:66.0,sortino:0.24},
    {name:"Tata Large Cap Fund",amc:"Tata",aum:2448.2,expense:1.02,rolling:18.78,prob:78.0,sortino:0.31},
    {name:"Baroda BNP Paribas Large Cap Fund",amc:"Baroda",aum:2344.2,expense:0.82,rolling:18.29,prob:76.0,sortino:0.34},
    {name:"Bandhan Large Cap Fund",amc:"Bandhan",aum:1820.9,expense:0.89,rolling:18.23,prob:77.0,sortino:0.37},
    {name:"HSBC Large Cap Fund",amc:"HSBC",aum:1667.5,expense:1.29,rolling:16.88,prob:67.0,sortino:0.3},
    {name:"Invesco India Largecap Fund",amc:"Invesco",aum:1536.9,expense:0.72,rolling:18.58,prob:78.0,sortino:0.39},
    {name:"Edelweiss Large Cap Fund",amc:"Edelweiss",aum:1321.7,expense:0.59,rolling:19.41,prob:89.0,sortino:0.29}
  ],
  midcap: [
    {name:"Invesco India Midcap Fund",amc:"Invesco",aum:9895.3,expense:0.55,rolling:27.83,prob:100,sortino:0.58},
    {name:"PGIM India Midcap Fund",amc:"PGIM",aum:9681,expense:0.52,rolling:24.02,prob:95.0,sortino:0.29},
    {name:"Quant Mid Cap Fund Dir",amc:"Quant",aum:7001.8,expense:0.85,rolling:27.66,prob:100,sortino:0.36},
    {name:"ICICI Pru Midcap Fund Dir",amc:"ICICI Pru",aum:6568.8,expense:1.05,rolling:26.45,prob:100,sortino:0.66},
    {name:"Tata Mid Cap Fund",amc:"Tata",aum:4992.8,expense:0.68,rolling:24.35,prob:100,sortino:0.54},
    {name:"Mahindra Manulife Mid Cap Fund",amc:"Mahindra",aum:4098.6,expense:0.46,rolling:27.67,prob:100,sortino:0.61},
    {name:"Union Midcap Fund",amc:"Union",aum:1497.8,expense:0.83,rolling:25.69,prob:100,sortino:0.48}
  ],
  smallcap: [
    {name:"Tata Small Cap Fund",amc:"Tata",aum:9620.5,expense:0.4,rolling:28.76,prob:100,sortino:0.22},
    {name:"Invesco India Smallcap Fund",amc:"Invesco",aum:9207.6,expense:0.52,rolling:30.13,prob:100,sortino:0.5},
    {name:"ICICI Pru Smallcap Fund",amc:"ICICI Pru",aum:7538.1,expense:0.81,rolling:27.36,prob:100,sortino:0.36},
    {name:"Edelweiss Small Cap Fund",amc:"Edelweiss",aum:5107.7,expense:0.47,rolling:28.94,prob:100,sortino:0.42},
    {name:"Sundaram Small Cap Fund",amc:"Sundaram",aum:2982.6,expense:0.86,rolling:27.27,prob:100,sortino:0.44},
    {name:"ITI Small Cap Fund",amc:"ITI",aum:2493,expense:0.39,rolling:25.24,prob:100,sortino:0.52},
    {name:"Bank of India Small Cap Fund",amc:"Bank of India",aum:1770.4,expense:0.51,rolling:28.74,prob:100,sortino:0.41},
    {name:"Union Small Cap Fund",amc:"Union",aum:1665.5,expense:1.08,rolling:25.85,prob:100,sortino:0.4}
  ],
  multicap: [
    {name:"Quant Active Fund",amc:"Quant",aum:3450,expense:0.59,rolling:24.6,prob:83,sortino:1.51},
    {name:"HDFC Multi Cap Fund",amc:"HDFC",aum:5670,expense:0.78,rolling:23.1,prob:78,sortino:1.38},
    {name:"Nippon India Multicap Fund",amc:"Nippon India",aum:4320,expense:0.71,rolling:22.8,prob:76,sortino:1.34},
    {name:"ICICI Pru Multicap Fund",amc:"ICICI Pru",aum:6120,expense:0.82,rolling:22.3,prob:74,sortino:1.29},
    {name:"Kotak Multicap Fund",amc:"Kotak",aum:2980,expense:0.56,rolling:21.4,prob:71,sortino:1.24},
    {name:"SBI Multicap Fund",amc:"SBI",aum:4890,expense:0.68,rolling:21.8,prob:72,sortino:1.26},
    {name:"Mahindra Manulife Multicap Fund",amc:"Mahindra Manulife",aum:1980,expense:0.49,rolling:21.2,prob:70,sortino:1.22},
    {name:"Invesco India Multicap Fund",amc:"Invesco",aum:2340,expense:0.64,rolling:20.9,prob:68,sortino:1.18},
    {name:"Baroda BNP Paribas Multi Cap Fund",amc:"Baroda BNP",aum:2130,expense:0.91,rolling:20.4,prob:65,sortino:1.12},
    {name:"Axis Multicap Fund",amc:"Axis",aum:3210,expense:0.58,rolling:20.1,prob:63,sortino:1.09},
  ],
  elss: [
    {name:"Quant Tax Plan",amc:"Quant",aum:3120,expense:0.57,rolling:26.4,prob:87,sortino:1.58},
    {name:"Mirae Asset Tax Saver Fund",amc:"Mirae Asset",aum:6780,expense:0.52,rolling:22.9,prob:78,sortino:1.36},
    {name:"Canara Robeco Equity Tax Saver",amc:"Canara Robeco",aum:3240,expense:0.55,rolling:22.1,prob:75,sortino:1.29},
    {name:"HDFC TaxSaver Fund",amc:"HDFC",aum:5490,expense:0.87,rolling:22.4,prob:74,sortino:1.31},
    {name:"DSP Tax Saver Fund",amc:"DSP",aum:4210,expense:0.79,rolling:21.7,prob:72,sortino:1.24},
    {name:"Axis Long Term Equity Fund",amc:"Axis",aum:7120,expense:0.66,rolling:20.8,prob:68,sortino:1.19},
    {name:"SBI Long Term Equity Fund",amc:"SBI",aum:6340,expense:0.91,rolling:21.3,prob:70,sortino:1.22},
    {name:"Invesco India Tax Plan",amc:"Invesco",aum:2870,expense:0.75,rolling:21.0,prob:69,sortino:1.18},
    {name:"Kotak Tax Saver Fund",amc:"Kotak",aum:4120,expense:0.63,rolling:20.6,prob:67,sortino:1.14},
    {name:"Nippon India Tax Saver Fund",amc:"Nippon India",aum:3680,expense:1.04,rolling:20.2,prob:64,sortino:1.08},
  ],
};

const CATS = [
  {key:"index",label:"Index Funds",real:true},
  {key:"largecap",label:"Large Cap",real:true},
  {key:"midcap",label:"Mid Cap",real:true},
  {key:"smallcap",label:"Small Cap",real:true},
  {key:"multicap",label:"Multi Cap",real:false},
  {key:"elss",label:"ELSS",real:false},
];

function rankArr(arr,key,asc){
  const s=[...arr].sort((a,b)=>asc?a[key]-b[key]:b[key]-a[key]);
  const m={};s.forEach((f,i)=>m[f.name]=i+1);return m;
}

function computeScores(funds,cat,wEq,wIdx){
  if(cat==="index"){
    const we = wIdx || {expense:80,tracking:20};
    const eR=rankArr(funds,"expense",true),tR=rankArr(funds,"trackingError",true);
    return funds.map(f=>({...f,score:+(eR[f.name]*(we.expense/100)+tR[f.name]*(we.tracking/100)).toFixed(2)}));
  }
  const we = wEq || {sortino:35,rolling:25,prob:25,expense:15};
  const eR=rankArr(funds,"expense",true),rR=rankArr(funds,"rolling",false),pR=rankArr(funds,"prob",false),sR=rankArr(funds,"sortino",false);
  return funds.map(f=>({...f,score:+(eR[f.name]*(we.expense/100)+rR[f.name]*(we.rolling/100)+pR[f.name]*(we.prob/100)+sR[f.name]*(we.sortino/100)).toFixed(2)}));
}

function fmtAum(n){if(n>=10000)return(n/10000).toFixed(1)+"T";if(n>=1000)return(n/1000).toFixed(1)+"K";return n+"";}
function fmt(v,d=2){return v!=null?v.toFixed(d):"—";}

const CARD_COLORS=["#00d4aa","#58a6ff","#a855f7"];
const CARD_LABELS=["#1 Best Pick","#2 Runner-Up","#3 Third Place"];

export default function MFSelector(){
  const [cat,setCat]=useState("index");
  const [ranked,setRanked]=useState([]);
  const [aiText,setAiText]=useState("");
  const [aiLoading,setAiLoading]=useState(false);

  // Customisable weights — equity (4 metrics) and index (2 metrics)
  const DEFAULT_EQ  = {sortino:35, rolling:25, prob:25, expense:15};
  const DEFAULT_IDX = {expense:80, tracking:20};
  const [wEq,  setWEq]  = useState({...DEFAULT_EQ});
  const [wIdx, setWIdx] = useState({...DEFAULT_IDX});

  // Each slider is fully independent — user controls all values
  // Rankings only update when total = 100
  function changeWeight(setW, weights, key, newVal) {
    setW({...weights, [key]: Math.max(0, Math.min(100, parseInt(newVal)||0))});
  }

  const isIdx    = cat==="index";
  const eqTotal  = Object.values(wEq).reduce((a,b)=>a+b,0);
  const idxTotal = Object.values(wIdx).reduce((a,b)=>a+b,0);
  const weightsValid = isIdx ? idxTotal===100 : eqTotal===100;

  useEffect(()=>{
    const funds=FUND_DATA[cat];
    if(!funds)return;
    const isValid = cat==="index" ? Object.values(wIdx).reduce((a,b)=>a+b,0)===100
                                  : Object.values(wEq).reduce((a,b)=>a+b,0)===100;
    if(!isValid) return; // don't rerank until total = 100
    const scored=computeScores(funds,cat,wEq,wIdx);
    scored.sort((a,b)=>a.score-b.score);
    const minS=scored[0]?.score||0, maxS=scored[scored.length-1]?.score||1;
    scored.forEach(f=>{ f.displayScore = maxS===minS ? 100 : Math.round(100-(((f.score-minS)/(maxS-minS))*100)); });
    setRanked(scored);
    setAiText("");
  },[cat,wEq,wIdx]);

  const top3=ranked.slice(0,3);
  const maxScore=ranked.length?Math.max(...ranked.map(f=>f.score)):1;
  const minScore=ranked.length?Math.min(...ranked.map(f=>f.score)):0;
  const catInfo=CATS.find(c=>c.key===cat);

  async function getAI(){
    setAiLoading(true);setAiText("");
    const label=catInfo?.label;
    const top10=ranked.slice(0,10).map((f,i)=>isIdx
      ?`${i+1}. ${f.name} — Expense:${f.expense}% TrackingError:${f.trackingError} Score:${f.displayScore}/100 (higher=better)`
      :`${i+1}. ${f.name} — Expense:${f.expense}% 5YRolling:${f.rolling}% Prob>15%:${f.prob}% Sortino:${f.sortino} Score:${f.displayScore}/100 (higher=better)`
    ).join("\n");

    const prompt=isIdx
      ?`You are a mutual fund analyst for Indian retail investors. These ${label} are scored using: Expense Ratio ${wIdx.expense}% weight + Tracking Error ${wIdx.tracking}% weight. Lower score = better rank.\n\nRanked funds:\n${top10}\n\nExplain in 3 tight paragraphs:\n1. Why the top 3 funds ranked highest — cite exact numbers from the data\n2. The key trade-off an investor should think about between rank 1 and rank 2\n3. One clear, specific recommendation\n\nBe direct. Use actual numbers. No bullet points. No filler.`
      :`You are a mutual fund analyst for Indian retail investors. These ${label} funds are scored using: Sortino Ratio ${wEq.sortino}%, 5-Year Rolling Return ${wEq.rolling}%, Probability of >15% Returns ${wEq.prob}%, Expense Ratio ${wEq.expense}%. Lower score = better rank.\n\nRanked funds:\n${top10}\n\nExplain in 3 tight paragraphs:\n1. Why the top 3 funds ranked highest — cite exact numbers from the data\n2. The key trade-off between rank 1 and rank 2 that an investor should understand\n3. One clear, specific recommendation\n\nBe direct. Use actual numbers. No bullet points. No filler.`;

    try{
      const res=await fetch("https://api.anthropic.com/v1/messages",{
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:900,messages:[{role:"user",content:prompt}]})
      });
      const d=await res.json();
      setAiText(d.content?.[0]?.text||"Analysis unavailable.");
    }catch(e){setAiText("Error: "+e.message);}
    setAiLoading(false);
  }

  return(
    <div style={{background:"#07090d",minHeight:"100vh",padding:"1.5rem",fontFamily:"'DM Sans',sans-serif",color:"#e8edf5"}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500&family=DM+Mono:wght@400;500&display=swap');
        @keyframes lp{0%{width:0;margin-left:0}50%{width:60%;margin-left:20%}100%{width:0;margin-left:100%}}
        .hrow:hover{background:#111820!important}
      `}</style>

      {/* Header */}
      <div style={{maxWidth:1100,margin:"0 auto 1.5rem",paddingBottom:"1.25rem",borderBottom:"1px solid #1a2232",display:"flex",alignItems:"flex-end",justifyContent:"space-between"}}>
        <div>
          <div style={{fontSize:"1.6rem",fontWeight:700,letterSpacing:"-.02em",color:"#e8edf5"}}>MF <span style={{color:"#5a6880"}}>Selector</span></div>
          <div style={{fontSize:".75rem",color:"#5a6880",marginTop:".2rem"}}>AI-powered mutual fund ranking · India · Direct Growth plans</div>
        </div>
        <span style={{fontFamily:"monospace",fontSize:".6rem",color:"#f5c518",background:"rgba(245,197,24,.08)",border:"1px solid rgba(245,197,24,.2)",padding:".2rem .6rem",borderRadius:20}}>PROTOTYPE v0.2</span>
      </div>

      <div style={{maxWidth:1100,margin:"0 auto"}}>

        {/* Category tabs */}
        <div style={{display:"flex",gap:".5rem",marginBottom:"1.25rem",flexWrap:"wrap",alignItems:"center"}}>
          {CATS.map(c=>(
            <button key={c.key} onClick={()=>setCat(c.key)} style={{
              display:"flex",alignItems:"center",gap:".35rem",padding:".42rem .9rem",
              borderRadius:7,cursor:"pointer",fontSize:".78rem",fontFamily:"inherit",fontWeight:500,
              border:"1px solid",transition:"all .15s",
              background:cat===c.key?"rgba(0,212,170,.1)":"#0d1117",
              borderColor:cat===c.key?"#00d4aa":"#243040",
              color:cat===c.key?"#00d4aa":"#5a6880"
            }}>
              <span style={{width:6,height:6,borderRadius:"50%",background:c.real?"#00d4aa":"#f5a623",display:"inline-block",flexShrink:0}}/>
              {c.label}
            </button>
          ))}
        </div>

        {/* Interactive Weights Panel */}
        <div style={{background:"#0d1117",border:"1px solid #1a2232",borderRadius:8,padding:"1rem",marginBottom:"1.25rem"}}>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:".75rem"}}>
            <span style={{fontSize:".63rem",color:"#5a6880",textTransform:"uppercase",letterSpacing:".08em"}}>
              Scoring weights — <span style={{color:"#e8edf5"}}>customise to match your priorities</span>
            </span>
            <div style={{display:"flex",gap:".5rem",alignItems:"center"}}>
              <button onClick={()=>isIdx?setWIdx({...DEFAULT_IDX}):setWEq({...DEFAULT_EQ})}
                style={{fontSize:".7rem",color:"#00d4aa",background:"rgba(0,212,170,.08)",border:"1px solid #2ea043",padding:".25rem .75rem",borderRadius:6,cursor:"pointer",fontFamily:"inherit",fontWeight:500}}>
                ↺ Reset to defaults
              </button>
              <span style={{fontSize:".67rem",padding:".18rem .55rem",borderRadius:12,
                color:catInfo?.real?"#3fb950":"#f5a623",
                background:catInfo?.real?"rgba(0,212,170,.08)":"rgba(245,166,35,.08)",
                border:`1px solid ${catInfo?.real?"#2ea043":"#9e6a03"}`}}>
                {catInfo?.real?"✓ Real Data":"⚠ Sample Data"}
              </span>
            </div>
          </div>

          {isIdx ? (
            // Index fund sliders — 2 metrics
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"1rem"}}>
              {[
                {key:"expense",  label:"Expense Ratio",   col:"#a855f7", def:80, desc:"Lower = better. Primary factor for passive funds."},
                {key:"tracking", label:"Tracking Error",  col:"#f5c518", def:20, desc:"How closely fund tracks index. Lower = better."},
              ].map(({key,label,col,def,desc})=>(
                <div key={key}>
                  <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:".3rem"}}>
                    <div style={{display:"flex",alignItems:"center",gap:".4rem"}}>
                      <span style={{width:8,height:8,borderRadius:"50%",background:col,display:"inline-block",flexShrink:0}}/>
                      <span style={{fontSize:".75rem",color:"#c9d1d9",fontWeight:500}}>{label}</span>
                      <span style={{fontSize:".6rem",color:"#5a6880",background:"#111820",border:"1px solid #1a2232",padding:".05rem .35rem",borderRadius:4,fontFamily:"monospace"}}>default: {def}%</span>
                    </div>
                    <span style={{fontFamily:"monospace",fontSize:".82rem",fontWeight:700,color:col}}>{wIdx[key]}%</span>
                  </div>
                  <input type="range" min="5" max="95" value={wIdx[key]}
                    onChange={e=>changeWeight(setWIdx,wIdx,key,parseInt(e.target.value))}
                    style={{width:"100%",accentColor:col,cursor:"pointer",height:4}}/>
                  <div style={{fontSize:".62rem",color:"#5a6880",marginTop:".2rem"}}>{desc}</div>
                </div>
              ))}
            </div>
          ) : (
            // Equity fund sliders — 4 metrics
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"1rem"}}>
              {[
                {key:"sortino", label:"Sortino Ratio",     col:"#00d4aa", def:35, desc:"Downside risk-adjusted return. Higher = better."},
                {key:"rolling", label:"5Y Rolling Return", col:"#58a6ff", def:25, desc:"Avg return across all 5Y periods. Higher = better."},
                {key:"prob",    label:">15% Probability",  col:"#f5c518", def:25, desc:"% of periods with >15% returns. Higher = better."},
                {key:"expense", label:"Expense Ratio",     col:"#a855f7", def:15, desc:"Annual fund cost. Lower = better."},
              ].map(({key,label,col,def,desc})=>(
                <div key={key}>
                  <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:".3rem"}}>
                    <div style={{display:"flex",alignItems:"center",gap:".4rem"}}>
                      <span style={{width:8,height:8,borderRadius:"50%",background:col,display:"inline-block",flexShrink:0}}/>
                      <span style={{fontSize:".75rem",color:"#c9d1d9",fontWeight:500}}>{label}</span>
                      <span style={{fontSize:".6rem",color:"#5a6880",background:"#111820",border:"1px solid #1a2232",padding:".05rem .35rem",borderRadius:4,fontFamily:"monospace"}}>default: {def}%</span>
                    </div>
                    <span style={{fontFamily:"monospace",fontSize:".82rem",fontWeight:700,color:col}}>{wEq[key]}%</span>
                  </div>
                  <input type="range" min="5" max="85" value={wEq[key]}
                    onChange={e=>changeWeight(setWEq,wEq,key,parseInt(e.target.value))}
                    style={{width:"100%",accentColor:col,cursor:"pointer",height:4}}/>
                  <div style={{fontSize:".62rem",color:"#5a6880",marginTop:".2rem"}}>{desc}</div>
                </div>
              ))}
            </div>
          )}

          {/* Weight sum visual */}
          <div style={{marginTop:".85rem",paddingTop:".7rem",borderTop:"1px solid #1a2232"}}>
            <div style={{display:"flex",height:6,borderRadius:3,overflow:"hidden",gap:1,background:"#1a2232"}}>
              {isIdx
                ? Object.entries(wIdx).map(([k,v],i)=>{
                    const cols=["#a855f7","#f5c518"];
                    return <div key={k} style={{width:`${Math.min(v,100)}%`,background:cols[i],transition:"width .2s",borderRadius:2}}/>;
                  })
                : [["sortino","#00d4aa"],["rolling","#58a6ff"],["prob","#f5c518"],["expense","#a855f7"]].map(([k,col])=>(
                    <div key={k} style={{width:`${Math.min(wEq[k],100)}%`,background:col,transition:"width .2s",borderRadius:2}}/>
                  ))
              }
            </div>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginTop:".45rem"}}>
              {weightsValid
                ? <span style={{fontSize:".65rem",color:"#3fb950"}}>✓ Rankings updating live</span>
                : <span style={{fontSize:".65rem",color:"#f5a623"}}>
                    ⚠ Adjust sliders so total = 100% to update rankings
                  </span>
              }
              <span style={{
                fontFamily:"monospace",fontSize:".78rem",fontWeight:700,
                padding:".15rem .5rem",borderRadius:6,
                color: weightsValid ? "#3fb950" : (isIdx?idxTotal:eqTotal)>100 ? "#ff4d6d" : "#f5a623",
                background: weightsValid ? "rgba(0,212,170,.1)" : (isIdx?idxTotal:eqTotal)>100 ? "rgba(255,77,109,.1)" : "rgba(245,166,35,.1)",
                border: `1px solid ${weightsValid ? "#2ea043" : (isIdx?idxTotal:eqTotal)>100 ? "#ff4d6d" : "#9e6a03"}`
              }}>
                {isIdx ? idxTotal : eqTotal}% / 100%
              </span>
            </div>
          </div>
        </div>

        {/* Top 3 cards */}
        <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:".85rem",marginBottom:"1.25rem"}}>
          {top3.map((f,i)=>(
            <div key={f.name} style={{background:"#0d1117",border:`1px solid ${CARD_COLORS[i]}`,borderRadius:10,padding:"1rem",position:"relative",overflow:"hidden"}}>
              <div style={{position:"absolute",top:0,left:0,right:0,height:2,background:CARD_COLORS[i]}}/>
              <div style={{fontSize:".63rem",color:"#5a6880",textTransform:"uppercase",letterSpacing:".1em",marginBottom:".35rem"}}>{CARD_LABELS[i]}</div>
              <div style={{fontSize:".8rem",fontWeight:500,color:"#e8edf5",marginBottom:".18rem",lineHeight:1.3}}>{f.name}</div>
              <div style={{fontSize:".68rem",color:"#5a6880",marginBottom:".75rem"}}>{f.amc} · ₹{fmtAum(f.aum)} Cr AUM</div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:".4rem"}}>
                <div>
                  <div style={{fontSize:".57rem",color:"#5a6880",textTransform:"uppercase",letterSpacing:".05em"}}>Score</div>
                  <div style={{fontFamily:"monospace",fontSize:".88rem",fontWeight:500,color:CARD_COLORS[i]}}>{f.displayScore}<span style={{fontSize:".6rem",color:"rgba(255,255,255,.4)"}}>/100</span></div>
                </div>
                <div>
                  <div style={{fontSize:".57rem",color:"#5a6880",textTransform:"uppercase",letterSpacing:".05em"}}>Expense</div>
                  <div style={{fontFamily:"monospace",fontSize:".88rem",color:"#c9d1d9"}}>{f.expense.toFixed(2)}%</div>
                </div>
                {isIdx?(
                  <div>
                    <div style={{fontSize:".57rem",color:"#5a6880",textTransform:"uppercase",letterSpacing:".05em"}}>Tracking Error</div>
                    <div style={{fontFamily:"monospace",fontSize:".88rem",color:"#c9d1d9"}}>{fmt(f.trackingError)}</div>
                  </div>
                ):(
                  <>
                    <div>
                      <div style={{fontSize:".57rem",color:"#5a6880",textTransform:"uppercase",letterSpacing:".05em"}}>Sortino</div>
                      <div style={{fontFamily:"monospace",fontSize:".88rem",color:"#c9d1d9"}}>{fmt(f.sortino)}</div>
                    </div>
                    <div>
                      <div style={{fontSize:".57rem",color:"#5a6880",textTransform:"uppercase",letterSpacing:".05em"}}>&gt;15% Prob</div>
                      <div style={{fontFamily:"monospace",fontSize:".88rem",color:"#c9d1d9"}}>{fmt(f.prob,0)}%</div>
                    </div>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Table */}
        <div style={{background:"#0d1117",border:"1px solid #1a2232",borderRadius:10,overflow:"auto",marginBottom:"1.25rem"}}>
          <table style={{width:"100%",borderCollapse:"collapse",fontSize:".78rem"}}>
            <thead>
              <tr style={{borderBottom:"1px solid #1a2232"}}>
                {["Rank","Fund","AUM (₹ Cr)","Expense","5Y Rolling",">15% Prob","Sortino / T.Err","Score"].map(h=>(
                  <th key={h} style={{padding:".7rem .85rem",textAlign:h==="Rank"||h==="Fund"?"left":"right",color:"#5a6880",fontWeight:500,fontSize:".63rem",textTransform:"uppercase",letterSpacing:".07em",whiteSpace:"nowrap",background:"#0d1117"}}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {ranked.map((f,i)=>{
                const r=i+1;
                const rowBg=r===1?"#1a2310":r===2?"#161d10":r===3?"#141b0e":"transparent";
                const badgeBg=r===1?"#2ea043":r===2?"#1f6feb":r===3?"#8957e5":"#21262d";
                const badgeCol=r<=3?"#fff":"#5a6880";
                const pct=f.displayScore??50;
                return(
                  <tr key={f.name} className="hrow" style={{background:rowBg,borderBottom:"1px solid #1a2232"}}>
                    <td style={{padding:".7rem .85rem"}}>
                      <span style={{display:"inline-flex",alignItems:"center",justifyContent:"center",width:22,height:22,borderRadius:"50%",background:badgeBg,color:badgeCol,fontSize:".68rem",fontWeight:600,fontFamily:"monospace"}}>{r}</span>
                    </td>
                    <td style={{padding:".7rem .85rem"}}>
                      <div style={{fontWeight:500,color:"#e8edf5",maxWidth:260}}>{f.name}</div>
                      <div style={{fontSize:".67rem",color:"#5a6880",marginTop:1}}>{f.amc} · ₹{fmtAum(f.aum)} Cr</div>
                    </td>
                    <td style={{padding:".7rem .85rem",textAlign:"right",fontFamily:"monospace",fontSize:".75rem",color:"#c9d1d9"}}>{fmtAum(f.aum)}</td>
                    <td style={{padding:".7rem .85rem",textAlign:"right",fontFamily:"monospace",fontSize:".75rem",color:"#c9d1d9"}}>{f.expense.toFixed(2)}%</td>
                    <td style={{padding:".7rem .85rem",textAlign:"right",fontFamily:"monospace",fontSize:".75rem",color:"#c9d1d9"}}>{isIdx?"—":fmt(f.rolling,1)+"%"}</td>
                    <td style={{padding:".7rem .85rem",textAlign:"right",fontFamily:"monospace",fontSize:".75rem",color:"#c9d1d9"}}>{isIdx?"—":fmt(f.prob,0)+"%"}</td>
                    <td style={{padding:".7rem .85rem",textAlign:"right",fontFamily:"monospace",fontSize:".75rem",color:"#c9d1d9"}}>{isIdx?fmt(f.trackingError):fmt(f.sortino)}</td>
                    <td style={{padding:".7rem .85rem",textAlign:"right"}}>
                      <div style={{display:"flex",alignItems:"center",gap:6,justifyContent:"flex-end"}}>
                        <span style={{fontFamily:"monospace",fontSize:".75rem",color:"#e8edf5"}}>{f.displayScore}<span style={{fontSize:".62rem",color:"#5a6880"}}>/100</span></span>
                        <div style={{width:44,height:3,background:"#1a2232",borderRadius:2,overflow:"hidden"}}>
                          <div style={{height:"100%",width:`${pct}%`,background:"#00d4aa",borderRadius:2}}/>
                        </div>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* AI Analysis */}
        <div style={{background:"#0d1117",border:"1px solid #1a2232",borderRadius:10,padding:"1.25rem"}}>
          <div style={{display:"flex",alignItems:"center",gap:".6rem",marginBottom:"1rem",paddingBottom:".9rem",borderBottom:"1px solid #1a2232"}}>
            <div style={{width:28,height:28,background:"rgba(0,212,170,.1)",borderRadius:7,display:"flex",alignItems:"center",justifyContent:"center",fontSize:".85rem",flexShrink:0}}>✦</div>
            <div style={{flex:1}}>
              <div style={{fontSize:".83rem",fontWeight:500,color:"#e8edf5"}}>AI Fund Analyst</div>
              <div style={{fontSize:".68rem",color:"#5a6880"}}>Powered by Claude · Explains why each fund ranked where it did</div>
            </div>
            <button onClick={getAI} disabled={aiLoading||!weightsValid} style={{
              background:"#238636",border:"1px solid #2ea043",color:"#fff",
              padding:".45rem 1.1rem",borderRadius:6,cursor:aiLoading?"not-allowed":"pointer",
              fontSize:".78rem",fontFamily:"inherit",fontWeight:500,flexShrink:0,
              opacity:aiLoading?0.5:1
            }}>{aiLoading?"Analysing...":"✦ Get AI Analysis"}</button>
          </div>

          {aiLoading&&(
            <div style={{height:2,background:"#1a2232",borderRadius:1,overflow:"hidden",marginBottom:".75rem"}}>
              <div style={{height:"100%",background:"#00d4aa",animation:"lp 1.5s ease-in-out infinite",borderRadius:1}}/>
            </div>
          )}

          {aiText?(
            <div style={{fontSize:".84rem",color:"#b8c4d5",lineHeight:1.85,whiteSpace:"pre-wrap"}}>{aiText}</div>
          ):!aiLoading&&(
            <div style={{fontSize:".78rem",color:"#5a6880",fontStyle:"italic"}}>
              Select a category and click "Get AI Analysis" — Claude will explain why each fund ranked where it did and give you a specific recommendation.
            </div>
          )}
        </div>

        <div style={{fontSize:".65rem",color:"#5a6880",marginTop:"1rem",padding:".6rem .75rem",border:"1px solid #1a2232",borderRadius:6,lineHeight:1.6}}>
          ⚠ Educational purposes only. Not financial advice. Mutual fund investments are subject to market risk.
          <span style={{color:"#3fb950"}}> ● Real data</span> from Tickertape / Rupeevest / AdvisorKhoj &nbsp;
          <span style={{color:"#f5a623"}}>● Sample data</span> — update with fresh data before live use.
        </div>
      </div>
    </div>
  );
}
