"use strict";
const translations={
  en:{skip:"Skip to content",navOverview:"Overview",navMethod:"Method",navResults:"Results",navPaper:"Read the paper ↗",paperType:"RESEARCH PROJECT",heroIntro:"Connecting source reliability with token-level decoding under noisy and conflicting evidence.",affiliation:"Institute of Intelligent Information Processing<br>Beijing Information Science and Technology University",readPaper:"Read the paper",downloadPdf:"Download PDF",citeLink:"Cite this work ↘",fullManuscript:"FULL MANUSCRIPT",pageCount:"13 pages · PDF",overviewTitle:"When evidence conflicts,<br>source reliability matters.",overviewP1:"Retrieved passages can be noisy, outdated, or mutually inconsistent. Amplifying all context can reinforce unreliable evidence and combine incompatible facts.",overviewP2:"S-CAD connects source-level reliability assessment with token-level probability control. It estimates which sources to trust, traces their use during generation, and calibrates a decoding gate to balance retrieved evidence with parametric knowledge.",readMotivation:"Read the motivation in the paper ↗",methodTitle:"From source trust to decoding control",methodAside:"A reliability prior, token-level attribution,<br>and a calibrated posterior gate.",frameworkCaption:"Figure 2. The S-CAD framework. Original figure from the paper.",figureSource:"Paper, p. 4 ↗",step1Title:"Estimate source reliability",step1Text:"Combine query relevance, factual consistency, and the distributional influence of each source to build a reliability prior.",step2Title:"Trace token-level trust",step2Text:"Use attention attribution to track which sources contribute to the current token, combining local reliability with global trust.",step3Title:"Calibrate the decoding gate",step3Text:"Combine token trust with a JSD-driven gate to balance context-free and context-conditioned probability distributions.",resultsTitle:"Evaluated under knowledge conflicts",fullResults:"Full results in the paper ↗",resultLead:"RealtimeQA accuracy on Qwen2.5-7B-Inst",resultDetail:"+12.45 percentage points over Origin and +7.05 points over FaithfulRAG in mixed retrieval.",tableTitle:"Mixed-retrieval accuracy",tableUnit:"ACC (%) · Table 1",tableMethod:"Method",tableAverage:"Average",resultsNote:"The paper evaluates three instruction-tuned backbones on FaithEval, RealtimeQA, SQuAD, and MuSiQue. S-CAD has the highest ACC in all 12 mixed-retrieval comparisons in Table 1. Golden retrieval has mixed ACC/F1 tradeoffs (Table 2).",paperLabel:"Full paper",readTitle:"Read the complete study.",readDescription:"Explore the method, all benchmark results, ablations, and mechanistic analysis in the original 13-page paper.",openReader:"Open PDF reader ↗",pages:"PAGES",citationLabel:"Citation",citationTitle:"Cite S-CAD",citationDescription:"Use the paper title and author information below.",downloadBib:"Download BibTeX ↓",copyBib:"Copy BibTeX",copied:"Copied",copyFailure:"Select and copy the citation below.",footerDescription:"Source-Calibrated Adaptive Decoding<br>for Trustworthy Retrieval-Augmented Generation",contactLabel:"CONTACT",corresponding:"* Corresponding author",funding:"Supported by the Major Project of the National Social Science Fund of China (No. 24&ZD170) and Beijing Natural Science Foundation (No. L233008)."},
  "zh-CN":{skip:"跳至正文",navOverview:"论文简介",navMethod:"方法",navResults:"实验结果",navPaper:"阅读全文 ↗",paperType:"论文工作介绍",heroIntro:"将来源可靠性与词元级解码相结合，改善噪声与冲突证据下的检索增强生成。",affiliation:"北京信息科技大学<br>智能信息处理研究所",readPaper:"在线阅读论文",downloadPdf:"下载 PDF",citeLink:"引用本工作 ↘",fullManuscript:"论文全文",pageCount:"13 页 · PDF",overviewTitle:"当证据产生冲突，<br>来源可靠性至关重要。",overviewP1:"检索片段可能包含噪声、过时信息或彼此矛盾的事实。统一放大所有上下文可能强化不可靠证据，并拼接互不相容的事实。",overviewP2:"S-CAD 将来源级可靠性评估与词元级概率控制连接起来。方法首先评估哪些来源可信，再跟踪生成过程中实际使用的来源，通过校准解码门控动态平衡检索证据与参数化知识。",readMotivation:"阅读论文中的研究动机 ↗",methodTitle:"从来源信任到解码控制",methodAside:"来源可靠性先验、词元级归因，<br>以及校准后的后验门控。",frameworkCaption:"图 2. S-CAD 方法框架，摘自论文原图。",figureSource:"论文第 4 页 ↗",step1Title:"估计来源可靠性",step1Text:"综合查询相关性、事实一致性和各来源的分布影响，构建来源可靠性先验。",step2Title:"跟踪词元级信任",step2Text:"通过注意力归因跟踪各来源对当前词元的贡献，将局部可靠性与全局信任结合。",step3Title:"校准解码门控",step3Text:"将词元信任与 JSD 驱动的门控结合，动态平衡无上下文和有上下文的概率分布。",resultsTitle:"在知识冲突场景下评估",fullResults:"查看论文完整结果 ↗",resultLead:"Qwen2.5-7B-Inst 的 RealtimeQA 准确率",resultDetail:"在混合检索条件下，较 Origin 提升 12.45 个百分点，较 FaithfulRAG 提升 7.05 个百分点。",tableTitle:"混合检索准确率",tableUnit:"ACC（%）· 表 1",tableMethod:"方法",tableAverage:"平均值",resultsNote:"论文在 FaithEval、RealtimeQA、SQuAD 和 MuSiQue 上评估了三个指令微调模型。S-CAD 在表 1 的 12 项混合检索对比中均取得最高 ACC。Golden retrieval 条件下的 ACC/F1 存在不同权衡（表 2）。",paperLabel:"论文全文",readTitle:"阅读全文，了解完整研究。",readDescription:"通过 13 页原始论文了解完整方法、基准结果、消融实验及机制分析。",openReader:"打开 PDF 阅读器 ↗",pages:"页",citationLabel:"引用",citationTitle:"引用 S-CAD",citationDescription:"可使用以下论文标题与作者信息。",downloadBib:"下载 BibTeX ↓",copyBib:"复制 BibTeX",copied:"已复制",copyFailure:"请选中并复制下方引用。",footerDescription:"来源校准的自适应解码<br>面向可信检索增强生成",contactLabel:"联系作者",corresponding:"* 通讯作者",funding:"本研究获国家社会科学基金重大项目（No. 24&ZD170）和北京市自然科学基金（No. L233008）资助。"}
};
const benchmarkData={
  "Llama3.1-8B-Inst":[["Origin",63.30,67.30,85.44,81.35,74.35],["CAD",66.20,61.90,85.56,78.64,73.08],["AdaCAD",67.70,62.80,85.50,79.15,73.79],["CoCoA",70.40,60.18,85.53,78.64,73.69],["FaithfulRAG",79.80,81.40,88.72,84.76,83.67],["S-CAD",82.20,84.07,89.86,84.93,85.27]],
  "Qwen2.5-7B-Inst":[["Origin",53.10,78.70,86.75,80.70,74.81],["CAD",60.50,77.00,86.35,82.82,76.67],["AdaCAD",62.30,78.80,86.21,82.68,77.50],["CoCoA",65.42,83.19,86.18,82.45,79.31],["FaithfulRAG",71.80,84.10,86.35,83.58,81.46],["S-CAD",75.70,91.15,88.64,85.47,85.24]],
  "Mistral-7B-Inst":[["Origin",61.90,52.20,86.10,78.22,69.61],["CAD",60.20,55.80,86.04,75.88,69.48],["AdaCAD",62.80,58.40,85.61,76.16,70.74],["CoCoA",76.70,66.37,86.10,74.75,75.98],["FaithfulRAG",81.70,77.00,88.58,82.14,82.36],["S-CAD",82.40,80.53,89.86,83.02,83.95]]
};
let language="en";
try{if(localStorage.getItem("scad-language")==="zh-CN")language="zh-CN";}catch{}
const languageSwitch=document.getElementById("language-switch");
function setLanguage(next){
  language=next;
  document.documentElement.lang=next;
  document.querySelectorAll("[data-i18n]").forEach(el=>{const value=translations[next][el.dataset.i18n];if(value!==undefined)el.innerHTML=value;});
  languageSwitch.textContent=next==="en"?"中文":"EN";
  languageSwitch.setAttribute("aria-label",next==="en"?"切换为中文":"Switch to English");
  try{localStorage.setItem("scad-language",next);}catch{}
}
languageSwitch.addEventListener("click",()=>setLanguage(language==="en"?"zh-CN":"en"));
setLanguage(language);
document.querySelectorAll("[data-backbone]").forEach(button=>button.addEventListener("click",()=>{
  const backbone=button.dataset.backbone;
  const rows=benchmarkData[backbone];
  if(!rows)return;
  const fragment=document.createDocumentFragment();
  for(const [name,...values] of rows){
    const tr=document.createElement("tr");if(name==="S-CAD")tr.className="our-method";
    const th=document.createElement("th");th.scope="row";th.textContent=name;tr.append(th);
    for(const value of values){const td=document.createElement("td");td.textContent=value.toFixed(2);tr.append(td);}
    fragment.append(tr);
  }
  document.getElementById("results-body").replaceChildren(fragment);
  document.getElementById("results-caption").textContent=`${backbone} mixed retrieval, ACC (%), paper Table 1`;
  document.querySelectorAll("[data-backbone]").forEach(el=>{const active=el===button;el.classList.toggle("active",active);el.setAttribute("aria-pressed",String(active));});
}));
const copyButton=document.getElementById("copy-citation");
let copyTimer;
copyButton.addEventListener("click",async()=>{
  const code=document.getElementById("citation-code");
  const status=document.getElementById("copy-status");
  let copied=false;
  try{await navigator.clipboard.writeText(code.textContent);copied=true;}catch{
    const selection=window.getSelection();const range=document.createRange();range.selectNodeContents(code);selection.removeAllRanges();selection.addRange(range);
    try{copied=document.execCommand("copy");}catch{}
  }
  status.textContent=copied?translations[language].copied:translations[language].copyFailure;
  copyButton.textContent=copied?translations[language].copied:translations[language].copyFailure;
  clearTimeout(copyTimer);copyTimer=setTimeout(()=>{copyButton.textContent=translations[language].copyBib;},2400);
});
