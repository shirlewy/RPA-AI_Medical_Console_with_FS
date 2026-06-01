import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Factory, ShieldPlus, Truck, Zap, Microscope, TrendingUp, Calculator, X, Loader2, Copy, Check, Download, ChevronDown, Send, AlertCircle, FileText, Scan, Info } from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';
import { literatureData, getMockResults } from '../data';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';


const departments = [
  { name: '研发与质量', icon: Microscope, processCount: 22, rate: '99', aiRate: '75%', err: 1, items: ['文献检索与初筛', 'OOS/OOT异常监控', '法规与研发资料关联'] },
  { name: '注册与合规', icon: ShieldPlus, processCount: 15, rate: '100', aiRate: '85%', err: 0, items: ['监管码采集上传', '药检网站信息抓取', '注册状态跟踪'] },
  { name: '生产制造', icon: Factory, processCount: 28, rate: '98', aiRate: '32%', err: 5, items: ['创建生产订单', '库存盘点', '物料主数据维护'] },
  { name: '供应链与仓储', icon: Truck, processCount: 36, rate: '97', aiRate: '45%', err: 8, items: ['药品追溯与流向协同', '价格趋势预测与采购时机决策', '物流异常预警'] },
  { name: '市场营销', icon: TrendingUp, processCount: 42, rate: '99', aiRate: '68%', err: 2, items: ['销售数据自动汇总', '广告投放与监管', '连锁客户数据采集'] },
  { name: '财务', icon: Calculator, processCount: 31, rate: '99', aiRate: '72%', err: 0, items: ['SAP财务对账', '发票识别与录入', '月结报表自动生成'] },
];

export function DepartmentMatrix() {
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  const [selectedGeneric, setSelectedGeneric] = useState(literatureData[0][0]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedQuery, setGeneratedQuery] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState(false);
  const [screeningResults, setScreeningResults] = useState<any[] | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [oosLogs, setOosLogs] = useState<string[]>([]);
  const [isOosRunning, setIsOosRunning] = useState(false);
  const [oosComplete, setOosComplete] = useState(false);
  const [showReviewInput, setShowReviewInput] = useState(false);
  const [reviewRemark, setReviewRemark] = useState("");
  const [isReviewSubmitted, setIsReviewSubmitted] = useState(false);
  const [isSendingToGroup, setIsSendingToGroup] = useState(false);
  const [isSentToGroup, setIsSentToGroup] = useState(false);
  const [showWebhookDialog, setShowWebhookDialog] = useState(false);
  const [webhookUrl, setWebhookUrl] = useState(() => localStorage.getItem('alert_webhook_url') || '');
  
  const [traceCodeLogs, setTraceCodeLogs] = useState<string[]>([]);
  const [isTraceCodeRunning, setIsTraceCodeRunning] = useState(false);
  const [traceCodeComplete, setTraceCodeComplete] = useState(false);
  const [traceCodeStep, setTraceCodeStep] = useState(0);
  const [traceCodeStats, setTraceCodeStats] = useState({ count: 0, rate: '--' });
  const [showTraceAnomaly, setShowTraceAnomaly] = useState(false);

  const [createOrderLogs, setCreateOrderLogs] = useState<string[]>([]);
  const [isCreateOrderRunning, setIsCreateOrderRunning] = useState(false);
  const [createOrderComplete, setCreateOrderComplete] = useState(false);
  const [createOrderStep, setCreateOrderStep] = useState(0);
  const [createOrderStats, setCreateOrderStats] = useState({ active: 126, batch: 842, rate: 91 });
  const [showCreateOrderAnomaly, setShowCreateOrderAnomaly] = useState(false);
  const [selectedProdOrders, setSelectedProdOrders] = useState<number[]>([]);
  const [productionOrders, setProductionOrders] = useState([
    { product: '阿莫西林胶囊', materialCode: 'MAT-100238', batchNo: 'B2026051201', plannedOutput: '50,000盒', factory: '苏州工厂', line: 'Line-03', startTime: '2026-05-12 08:00', orderType: '标准生产' },
    { product: '头孢克肟片', materialCode: 'MAT-100517', batchNo: 'B2026051202', plannedOutput: '80,000盒', factory: '成都工厂', line: 'Line-01', startTime: '2026-05-12 09:30', orderType: '标准生产' },
    { product: '布洛芬缓释胶囊', materialCode: 'MAT-100842', batchNo: 'B2026051203', plannedOutput: '120,000盒', factory: '天津工厂', line: 'Line-05', startTime: '2026-05-12 10:00', orderType: '加急生产' },
    { product: '奥美拉唑肠溶片', materialCode: 'MAT-101126', batchNo: 'B2026051204', plannedOutput: '65,000盒', factory: '苏州工厂', line: 'Line-02', startTime: '2026-05-12 13:00', orderType: '标准生产' },
    { product: '盐酸左氧氟沙星片', materialCode: 'MAT-101509', batchNo: 'B2026051205', plannedOutput: '40,000盒', factory: '武汉工厂', line: 'Line-04', startTime: '2026-05-12 15:30', orderType: '返工生产' },
  ]);
  
  const terminalEndRef = useRef<HTMLDivElement>(null);

  const [selectedInspectionRow, setSelectedInspectionRow] = useState<number | null>(null);
  const [inspectionLogs, setInspectionLogs] = useState<string[]>([]);
  const [isInspectionRunning, setIsInspectionRunning] = useState(false);
  const [inspectionComplete, setInspectionComplete] = useState(false);
  const [inspectionStep, setInspectionStep] = useState(0);
  const [inspectionStats, setInspectionStats] = useState({ fetch: 0, error: 0, aiRate: 0 });
  const [showInspectionResults, setShowInspectionResults] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState('国家药监局');

  const [isPriceTrendRunning, setIsPriceTrendRunning] = useState(false);
  const [priceTrendComplete, setPriceTrendComplete] = useState(false);
  const [priceTrendStep, setPriceTrendStep] = useState(0);
  const [priceTrendLogs, setPriceTrendLogs] = useState<string[]>([]);
  const [priceTrendStats, setPriceTrendStats] = useState({ itemsAnalyzed: 0, highRisk: 0, saved: 0 });
  const [priceTrendResults, setPriceTrendResults] = useState<{name: string, price: string, trend: string, advice: string, risk: boolean, aiReason: string, history?: any[]}[]>([]);
  const [selectedPriceTrendRow, setSelectedPriceTrendRow] = useState<number | null>(null);

  const [isChainDataRunning, setIsChainDataRunning] = useState(false);
  const [chainDataComplete, setChainDataComplete] = useState(false);
  const [chainDataStep, setChainDataStep] = useState(0);
  const [chainDataLogs, setChainDataLogs] = useState<string[]>([]);
  const [chainDataStats, setChainDataStats] = useState({ customers: 0, stores: 0, highRiskSku: 0, tasks: 0 });
  const [chainDataResults, setChainDataResults] = useState<{name: string, pur_trend: string, days: string, sales_trend: string, status: string, isAnomaly: boolean, aiReason: string}[]>([]);
  const [selectedChainDataRow, setSelectedChainDataRow] = useState<number | null>(null);

  
  const getPlatformRecordsMock = () => {
    if (selectedPlatform === 'FDA') {
      return [
        { product: 'Amoxicillin Capsules', batchNo: 'FDA-847291', result: 'Pass', status: 'normal', reason: '' },
        { product: 'Cefixime Oral', batchNo: 'FDA-847292', result: 'Warning', status: 'error', reason: 'AI detected inactive ingredient discrepancy. Further review required.' },
        { product: 'Ibuprofen XR', batchNo: 'FDA-847293', result: 'Pass', status: 'normal', reason: '' },
        { product: 'Metformin HCl', batchNo: 'FDA-847294', result: 'Pass', status: 'normal', reason: '' },
        { product: 'Atorvastatin', batchNo: 'FDA-847295', result: 'Out of Spec', status: 'error', reason: 'Dissolution profile failure detected.' },
        { product: 'Losartan Potassium', batchNo: 'FDA-847296', result: 'Pass', status: 'normal', reason: '' },
        { product: 'Albuterol Sulfate', batchNo: 'FDA-847297', result: 'Pass', status: 'normal', reason: '' },
        { product: 'Lisinopril', batchNo: 'FDA-847298', result: 'Failed', status: 'error', reason: 'Impurity levels exceed USP limits.' },
        { product: 'Gabapentin', batchNo: 'FDA-847299', result: 'Pass', status: 'normal', reason: '' },
        { product: 'Amlodipine', batchNo: 'FDA-847300', result: 'Pass', status: 'normal', reason: '' },
        { product: 'Omeprazole', batchNo: 'FDA-847301', result: 'Pass', status: 'normal', reason: '' },
        { product: 'Sertraline HCl', batchNo: 'FDA-847302', result: 'Pass', status: 'normal', reason: '' },
      ];
    }
    if (selectedPlatform === 'EMA') {
      return [
        { product: 'Amoxicilline', batchNo: 'EU-20491A', result: 'Compliant', status: 'normal', reason: '' },
        { product: 'Céfixime', batchNo: 'EU-20491B', result: 'Non-compliant', status: 'error', reason: 'European Pharmacopoeia standard deviation found in dissolution test.' },
        { product: 'Ibuprofène', batchNo: 'EU-20491C', result: 'Compliant', status: 'normal', reason: '' },
        { product: 'Metformine', batchNo: 'EU-20491D', result: 'Compliant', status: 'normal', reason: '' },
        { product: 'Atorvastatine', batchNo: 'EU-20491E', result: 'Non-compliant', status: 'error', reason: 'Active pharmaceutical ingredient purity below threshold.' },
        { product: 'Losartan', batchNo: 'EU-20491F', result: 'Compliant', status: 'normal', reason: '' },
        { product: 'Salbutamol', batchNo: 'EU-20491G', result: 'Compliant', status: 'normal', reason: '' },
        { product: 'Lisinopril', batchNo: 'EU-20491H', result: 'Compliant', status: 'normal', reason: '' },
        { product: 'Gabapentine', batchNo: 'EU-20491I', result: 'Non-compliant', status: 'error', reason: 'Residual solvents above Annex I specifications.' },
        { product: 'Amlodipine', batchNo: 'EU-20491J', result: 'Compliant', status: 'normal', reason: '' },
        { product: 'Oméprazole', batchNo: 'EU-20491K', result: 'Compliant', status: 'normal', reason: '' },
        { product: 'Sertraline', batchNo: 'EU-20491L', result: 'Compliant', status: 'normal', reason: '' },
      ];
    }
    return [
      { product: '阿莫西林', batchNo: 'B20260512', result: '合格', status: 'normal', reason: '' },
      { product: '头孢克肟', batchNo: 'B20260513', result: '异常', status: 'error', reason: 'AI检测到含量指标异常，建议复核原始检验数据。' },
      { product: '布洛芬缓释胶囊', batchNo: 'B20260514', result: '合格', status: 'normal', reason: '' },
      { product: '对乙酰氨基酚', batchNo: 'B20260515', result: '合格', status: 'normal', reason: '' },
      { product: '二甲双胍', batchNo: 'B20260516', result: '异常', status: 'error', reason: '溶出度不符合中国药典规定规范。' },
      { product: '阿托伐他汀钙', batchNo: 'B20260517', result: '合格', status: 'normal', reason: '' },
      { product: '奥美拉唑', batchNo: 'B20260518', result: '合格', status: 'normal', reason: '' },
      { product: '阿司匹林', batchNo: 'B20260519', result: '合格', status: 'normal', reason: '' },
      { product: '氨氯地平', batchNo: 'B20260520', result: '异常', status: 'error', reason: '有关物质检测超标，已自动触发OOS流程。' },
      { product: '左氧氟沙星', batchNo: 'B20260521', result: '合格', status: 'normal', reason: '' },
      { product: '氯沙坦钾', batchNo: 'B20260522', result: '合格', status: 'normal', reason: '' },
      { product: '维生素C', batchNo: 'B20260523', result: '合格', status: 'normal', reason: '' },
    ];
  };

  const inspectionRecordsMock = getPlatformRecordsMock();
  
  const inspectionTerminalEndRef = useRef<HTMLDivElement>(null);
  const traceTerminalEndRef = useRef<HTMLDivElement>(null);
  const createOrderTerminalEndRef = useRef<HTMLDivElement>(null);
  const priceTrendTerminalEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (terminalEndRef.current) {
      terminalEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [oosLogs]);

  useEffect(() => {
    if (inspectionTerminalEndRef.current) {
      inspectionTerminalEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [inspectionLogs]);

  useEffect(() => {
    if (traceTerminalEndRef.current) {
      traceTerminalEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [traceCodeLogs]);

  useEffect(() => {
    if (createOrderTerminalEndRef.current) {
      createOrderTerminalEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [createOrderLogs]);

  useEffect(() => {
    if (priceTrendTerminalEndRef.current) {
      priceTrendTerminalEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [priceTrendLogs]);

  const currentLiterature = literatureData.find(d => d[0] === selectedGeneric) || literatureData[0];
  const searchTerms = currentLiterature[3];
  const synonym = currentLiterature[2];

  const handleCopy = async () => {
    if (generatedQuery) {
      try {
        await navigator.clipboard.writeText(generatedQuery);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
      } catch (err) {
        console.error('Failed to copy text: ', err);
      }
    }
  };

  const isValidWebhook = (url: string) => {
    try {
      const parsed = new URL(url);
      return parsed.protocol.startsWith('http') && parsed.pathname.length > 0;
    } catch {
      return false;
    }
  };

  const handleSendToGroupClick = () => {
    if (isSendingToGroup || isSentToGroup) return;
    executeSendToGroup();
  };

  const executeSendToGroup = async (url?: string) => {
    setIsSendingToGroup(true);
    try {
      let summaryText = "";
      
      if (selectedItem === '监管码采集上传') {
        summaryText = `【监管码采集上传异常预警】\n\n通用品种名：${selectedGeneric}\n批次号：${selectedGeneric}-20260527\n\n【异常详情】\n发现 3 条重复监管码，可能存在串货或扫码异常情况，请及时核查。\n\n请登录系统查看详情。`;
      } else {
        summaryText = `【新药初筛报告】\n通用品种名：${selectedGeneric}\n检索式：${generatedQuery || '尚未生成'}\n本次共筛出高优文献 ${screeningResults?.length || 0} 篇。`;
        
        if (screeningResults && screeningResults.length > 0) {
          summaryText += `\n\n【初筛文献列表】`;
          screeningResults.forEach((row, i) => {
            summaryText += `\n\n--- 文献 ${i + 1} ---`;
            summaryText += `\nPMID: ${row.pmid}`;
            summaryText += `\n标题: ${row.title}`;
            summaryText += `\n不良反应: ${row.hasAdverseEvent}`;
            summaryText += `\nAI置信度: ${row.confidence}%`;
            summaryText += `\nAI判断理由: ${row.reason}`;
          });
        }

        summaryText += `\n\n请登录系统查看详情。`;
      }
      
      const payload = {
        msgtype: "text",
        text: {
          content: summaryText
        }
      };

      const response = await fetch('/api/webhook/proxy', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url, payload })
      });

      if (!response.ok) {
        const errorText = await response.text();
        if (!url && (errorText.includes('Missing url') || errorText.includes('Missing webhook url') || errorText.includes('FEISHU_WEBHOOK_URL'))) {
          setShowWebhookDialog(true);
          return;
        }
        throw new Error(errorText || `Failed to send: ${response.statusText}`);
      }

      setIsSentToGroup(true);
      setTimeout(() => setIsSentToGroup(false), 3000);
    } catch (e) {
      console.error(e);
      alert('发送失败，请检查网络或 Webhook 地址配置。');
    } finally {
      setIsSendingToGroup(false);
    }
  };

  const handleExport = () => {
    if (!screeningResults || !generatedQuery) return;
    const headers = ['通用品种名', '检索式', 'PMID', '文献标题', '文献摘要', '不良反应', 'AI置信度', 'AI判断理由'];
    const escapeCsv = (str: string) => `"${String(str).replace(/"/g, '""')}"`;
    const csvRows = screeningResults.map(row => [
      escapeCsv(selectedGeneric),
      escapeCsv(generatedQuery),
      escapeCsv(row.pmid),
      escapeCsv(row.title),
      escapeCsv(row.abstract),
      escapeCsv(row.hasAdverseEvent),
      escapeCsv(row.confidence),
      escapeCsv(row.reason)
    ].join(','));
    const csvContent = [headers.join(','), ...csvRows].join('\n');
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `文献初筛结果_${selectedGeneric}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleProcess = () => {
    setIsGenerating(true);
    setGeneratedQuery(null);
    setScreeningResults(null);
    setIsSentToGroup(false);
    setIsSendingToGroup(false);
    const delay = Math.floor(Math.random() * (3000 - 2000 + 1) + 2000); // 2 to 3 seconds
    setTimeout(() => {
      setGeneratedQuery(searchTerms);
      setScreeningResults(getMockResults(selectedGeneric));
      setIsGenerating(false);
    }, delay);
  };

  const handleGenericChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedGeneric(e.target.value);
    setGeneratedQuery(null);
    setScreeningResults(null);
  };

  const handleClose = () => {
    setSelectedItem(null);
    setGeneratedQuery(null);
    setIsGenerating(false);
    setScreeningResults(null);
    setIsDropdownOpen(false);
    
    setInspectionLogs([]);
    setIsInspectionRunning(false);
    setInspectionComplete(false);
    setInspectionStep(0);
    setShowInspectionResults(false);
    setSelectedInspectionRow(null);

    setPriceTrendLogs([]);
    setIsPriceTrendRunning(false);
    setPriceTrendComplete(false);
    setPriceTrendStep(0);
    setPriceTrendResults([]);
    setSelectedPriceTrendRow(null);

    setOosLogs([]);
    setIsOosRunning(false);
    setOosComplete(false);
    setShowReviewInput(false);
    setReviewRemark("");
    setIsReviewSubmitted(false);
    
    setTraceCodeLogs([]);
    setIsTraceCodeRunning(false);
    setTraceCodeComplete(false);
    setTraceCodeStep(0);
    setTraceCodeStats({ count: 0, rate: '--' });
    setShowTraceAnomaly(false);
    
    setCreateOrderLogs([]);
    setIsCreateOrderRunning(false);
    setCreateOrderComplete(false);
    setCreateOrderStep(0);
    setCreateOrderStats({ active: 126, batch: 842, rate: 91 });
    setShowCreateOrderAnomaly(false);
    setSelectedProdOrders([]);

    setIsSentToGroup(false);
    setIsSendingToGroup(false);
  };

  const handleProcessTraceCode = () => {
    setIsTraceCodeRunning(true);
    setTraceCodeLogs([]);
    setTraceCodeComplete(false);
    setTraceCodeStep(0);
    setTraceCodeStats({ count: 0, rate: '--' });
    setShowTraceAnomaly(false);

    const now = new Date();
    const formatTime = (addSec: number) => {
      const t = new Date(now.getTime() + addSec * 1000);
      return `[${t.getHours().toString().padStart(2, '0')}:${t.getMinutes().toString().padStart(2, '0')}:${t.getSeconds().toString().padStart(2, '0')}]`;
    };

    const flow = [
      { step: 1, text: `${formatTime(0)} 已读取监管码文件`, delay: 1000 },
      { step: 2, text: `${formatTime(2)} OCR识别完成`, delay: 1500 },
      { step: 3, text: `${formatTime(5)} AI校验通过`, delay: 1500 },
      { step: 4, text: `${formatTime(9)} SAP批次同步成功`, delay: 1500 },
      { step: 5, text: `${formatTime(13)} 已上传国家药监平台`, delay: 1000 }
    ];

    let currentDelay = 0;
    
    // Stats animation (from 0 to 12481, taking ~5-6 seconds)
    const startTime = Date.now();
    const duration = 6500;
    const finalCount = 12481;
    
    let animationFrameId: number;
    const animateStats = () => {
       const elapsed = Date.now() - startTime;
       if (elapsed < duration) {
         setTraceCodeStats({ 
           count: Math.floor((elapsed / duration) * finalCount),
           rate: '--'
         });
         animationFrameId = requestAnimationFrame(animateStats);
       } else {
         setTraceCodeStats({ count: finalCount, rate: '99.7%' });
         setShowTraceAnomaly(true);
       }
    };
    animationFrameId = requestAnimationFrame(animateStats);

    flow.forEach((f, index) => {
      currentDelay += f.delay;
      setTimeout(() => {
        setTraceCodeStep(f.step);
        setTraceCodeLogs(prev => [...prev, f.text]);
        if (index === flow.length - 1) {
          setIsTraceCodeRunning(false);
          setTraceCodeComplete(true);
        }
      }, currentDelay);
    });
  };

  const handleProcessInspectionInfo = () => {
    setIsInspectionRunning(true);
    setInspectionLogs([]);
    setInspectionComplete(false);
    setInspectionStep(0);
    setInspectionStats({ fetch: 0, error: 0, aiRate: 0 });
    setShowInspectionResults(false);
    setSelectedInspectionRow(null);

    const now = new Date();
    const formatTime = (addSec: number) => {
      const t = new Date(now.getTime() + addSec * 1000);
      return `[${t.getHours().toString().padStart(2, '0')}:${t.getMinutes().toString().padStart(2, '0')}:${t.getSeconds().toString().padStart(2, '0')}]`;
    };

    const flow = [
      { step: 1, text: `${formatTime(0)} 已连接${selectedPlatform}平台`, delay: 1000 },
      { step: 2, text: `${formatTime(3)} 已抓取12份药检报告`, delay: 1500 },
      { step: 3, text: `${formatTime(6)} OCR识别完成`, delay: 1500 },
      { step: 4, text: `${formatTime(9)} AI字段提取成功`, delay: 1000 }
    ];

    let currentDelay = 0;
    
    const startTime = Date.now();
    const duration = 5000;
    
    let animationFrameId: number;
    const animateStats = () => {
       const elapsed = Date.now() - startTime;
       if (elapsed < duration) {
         const progress = elapsed / duration;
         setInspectionStats({ 
           fetch: Math.floor(progress * 12),
           error: Math.floor(progress * 3),
           aiRate: parseFloat((progress * 98.7).toFixed(1))
         });
         animationFrameId = requestAnimationFrame(animateStats);
       } else {
         setInspectionStats({ fetch: 12, error: 3, aiRate: 98.7 });
       }
    };
    animationFrameId = requestAnimationFrame(animateStats);

    flow.forEach((f, index) => {
      currentDelay += f.delay;
      setTimeout(() => {
        setInspectionStep(f.step);
        setInspectionLogs(prev => [...prev, f.text]);
        
        if (index === flow.length - 1) {
          setTimeout(() => {
            setIsInspectionRunning(false);
            setInspectionComplete(true);
            setShowInspectionResults(true);
            setInspectionStep(5); // Final step
          }, 500); // Small delay before finishing to show "提取成功" before finish
        }
      }, currentDelay);
    });
  };

  const handleProcessCreateOrder = () => {
    setIsCreateOrderRunning(true);
    setCreateOrderLogs([]);
    setCreateOrderComplete(false);
    setCreateOrderStep(0);
    setCreateOrderStats({ active: 126, batch: 842, rate: 91 });
    setShowCreateOrderAnomaly(false);

    const now = new Date();
    const formatTime = (addSec: number) => {
      const t = new Date(now.getTime() + addSec * 1000);
      return `[${t.getHours().toString().padStart(2, '0')}:${t.getMinutes().toString().padStart(2, '0')}:${t.getSeconds().toString().padStart(2, '0')}]`;
    };

    const flow = [
      { step: 1, text: `${formatTime(0)} 已读取今日生产计划`, delay: 1000 },
      { step: 2, text: `${formatTime(1)} 物料库存校验完成`, delay: 1200 },
      { step: 3, text: `${formatTime(2)} SAP生产订单创建成功`, delay: 1000 },
      { step: 4, text: `${formatTime(3)} MES工单同步完成`, delay: 1000 },
      { step: 5, text: `${formatTime(4)} 已下发车间生产任务`, delay: 800 }
    ];

    let currentDelay = 0;
    
    // Stats animation (5 seconds)
    const startTime = Date.now();
    const duration = 5000;
    
    let animationFrameId: number;
    const animateStats = () => {
       const elapsed = Date.now() - startTime;
       if (elapsed < duration) {
         const progress = elapsed / duration;
         setCreateOrderStats({ 
           active: 126 + Math.floor(progress * 1),
           batch: 842 + Math.floor(progress * 1),
           rate: 91 + Math.floor(progress * 1)
         });
         animationFrameId = requestAnimationFrame(animateStats);
       } else {
         setCreateOrderStats({ active: 127, batch: 843, rate: 92 });
         setShowCreateOrderAnomaly(true);
       }
    };
    animationFrameId = requestAnimationFrame(animateStats);

    flow.forEach((f, index) => {
      currentDelay += f.delay;
      setTimeout(() => {
        setCreateOrderStep(f.step);
        setCreateOrderLogs(prev => [...prev, f.text]);
        if (index === flow.length - 1) {
          setIsCreateOrderRunning(false);
          setCreateOrderComplete(true);
          setProductionOrders(prev => prev.filter((_, i) => !selectedProdOrders.includes(i)));
          setSelectedProdOrders([]);
        }
      }, currentDelay);
    });
  };

  const handleProcessChainData = () => {
    setIsChainDataRunning(true);
    setChainDataLogs([]);
    setChainDataComplete(false);
    setChainDataStep(0);
    setSelectedChainDataRow(null);
    setChainDataStats({ customers: 36, stores: 2481, highRiskSku: 12, tasks: 148 });
    setChainDataResults([]);

    const now = new Date();
    const formatTime = (addSec: number) => {
      const t = new Date(now.getTime() + addSec * 1000);
      return `[${t.getHours().toString().padStart(2, '0')}:${t.getMinutes().toString().padStart(2, '0')}:${t.getSeconds().toString().padStart(2, '0')}]`;
    };

    const flow = [
      { step: 1, text: `${formatTime(0)} 已连接老百姓大药房系统`, delay: 1000 },
      { step: 2, text: `${formatTime(2)} 已采集采购订单数据`, delay: 1200 },
      { step: 3, text: `${formatTime(4)} 已同步门店库存数据`, delay: 1200 },
      { step: 4, text: `${formatTime(6)} 已获取区域流向数据`, delay: 1200 },
      { step: 5, text: `${formatTime(8)} AI正在分析纯销趋势`, delay: 1200 },
      { step: 6, text: `${formatTime(10)} 已生成渠道经营预警`, delay: 1000 }
    ];
    let currentDelay = 0;

    const startTime = Date.now();
    const duration = 6800;
    
    const startStats = { customers: 36, stores: 2481, highRiskSku: 12, tasks: 148 };
    const targetStats = { customers: 42, stores: 3126, highRiskSku: 18, tasks: 173 };

    let animationFrameId: number;
    const animateStats = () => {
       const elapsed = Date.now() - startTime;
       if (elapsed < duration) {
         const progress = elapsed / duration;
         setChainDataStats({ 
           customers: Math.floor(startStats.customers + progress * (targetStats.customers - startStats.customers)),
           stores: Math.floor(startStats.stores + progress * (targetStats.stores - startStats.stores)),
           highRiskSku: Math.floor(startStats.highRiskSku + progress * (targetStats.highRiskSku - startStats.highRiskSku)),
           tasks: Math.floor(startStats.tasks + progress * (targetStats.tasks - startStats.tasks))
         });
         animationFrameId = requestAnimationFrame(animateStats);
       } else {
         setChainDataStats(targetStats);
       }
    };
    animationFrameId = requestAnimationFrame(animateStats);
    
    flow.forEach((f, index) => {
      currentDelay += f.delay;
      setTimeout(() => {
        setChainDataStep(f.step);
        setChainDataLogs(prev => [...prev, f.text]);

        if (index === 5) { // step 6
             const initialItems = [
                 { name: '老百姓大药房', pur_trend: '↑12%', days: '14天', sales_trend: '↑增长', status: '正常', isAnomaly: false, aiReason: '库存周转率处于行业健康水平，当前采购频次可较好满足终端动销需求。近期重点SKU销售稳中有升。' },
                 { name: '益丰药房', pur_trend: '↓8%', days: '38天', sales_trend: '↓下降', status: '库存偏高', isAnomaly: true, aiReason: 'AI检测到华东区域头孢产品纯销下降12%，\n当前库存周转天数高于区域平均值，\n建议降低补货频率并加强终端动销。' },
                 { name: '大参林', pur_trend: '↑21%', days: '7天', sales_trend: '↑增长', status: '建议补货', isAnomaly: true, aiReason: 'AI检测到核心品类库存告急。多款主推产品库存周转天数不足7天，存在明显的断货风险，请尽快安排批量补货。' },
             ];
             
             const randomNames = ['一心堂', '国大药房', '桐君阁', '海王星辰', '漱玉平民', '健之佳', '老百姓连锁', '德生堂', '成大方圆', '张仲景大药房'];
             const generatedItems = Array.from({ length: 15 }, (_, i) => {
               const isAnomaly = Math.random() > 0.8;
               const name = randomNames[i % randomNames.length] + (i >= randomNames.length ? ` ${Math.floor(i / randomNames.length) + 1}` : '');
               const pur_trend_val = Math.floor(Math.random() * 20) + 1;
               const pur_trend = Math.random() > 0.5 ? `↑${pur_trend_val}%` : `↓${pur_trend_val}%`;
               const days_val = Math.floor(Math.random() * 40 + 8);
               const days = `${days_val}天`;
               const salesNum = Math.random();
               const sales_trend = salesNum > 0.6 ? '↑增长' : (salesNum > 0.3 ? '→持平' : '↓下降');
               
               let status = '正常';
               let aiReason = `目前${name}终端纯销平稳，各个主力SKU的库存配比合理，进销存数据未见明显异常。可维持当前的采购供货方案。`;
               if (isAnomaly) {
                  if (days_val > 35) {
                    status = '库存积压'; aiReason = `AI指标预警：${name}的整体库存天数高达${days}，显著高于警戒线。建议销售团队重点介入，帮助设计终端促销活动以加快动销，并暂停盲目补货。`;
                  } else if (days_val < 12) {
                    status = '区域断货风险'; aiReason = `AI监测到${name}部分区域门店存在短缺风险。高毛利品种纯销加快，当前库存难以覆盖下一个采购周期，请主动跟进调拨催单。`;
                  } else if (sales_trend === '↓下降') {
                    status = '动销下滑'; aiReason = `AI对比历史模型发现${name}近2周纯销流水出现持续下滑。请排查是否遭遇竞品强力拦截，或门店执行出现偏差。`;
                  } else {
                    status = '采购异常下降'; aiReason = `AI分析显示，在终端动销稳定的前提下${name}的采购订单金额环比收缩，可能渠道存在价格纠纷或其他原因，建议进行实地调研。`;
                  }
               }

               return {
                 name,
                 pur_trend,
                 days,
                 sales_trend,
                 status,
                 isAnomaly,
                 aiReason
               };
             });

             setChainDataResults([...initialItems, ...generatedItems]);
        }
        
        if (index === flow.length - 1) {
          setTimeout(() => {
            setIsChainDataRunning(false);
            setChainDataComplete(true);
            setChainDataStep(6);
          }, 300); 
        }
      }, currentDelay);
    });
  };

  const handleProcessPriceTrend = () => {
    setIsPriceTrendRunning(true);
    setPriceTrendLogs([]);
    setPriceTrendComplete(false);
    setPriceTrendStep(0);
    setSelectedPriceTrendRow(null);
    setPriceTrendStats({ itemsAnalyzed: 0, highRisk: 0, saved: 0 });
    setPriceTrendResults([]);

    const generateHistory = (trend: string, basePrice: number) => {
      const history = [];
      let current = basePrice;
      for (let j = 14; j >= 1; j--) {
        history.push({ day: `-D${j}`, price: Math.round(current) });
        if (trend === '↑上涨') current += (Math.random() * 2 + 1);
        else if (trend === '↓下降') current -= (Math.random() * 1.5 + 0.5);
        else current += (Math.random() * 2 - 1);
      }
      return history;
    };

    const initialItems = [
        { name: '维生素C', basePrice: 96, trend: '↑上涨', advice: '建议提前采购', risk: true, aiReason: 'AI检测到维生素C原料近14天持续上涨，预计未来7日涨幅约8%-12%，建议提前锁定采购合同。', history: generateHistory('↑上涨', 80) },
        { name: '头孢原料', basePrice: 210, trend: '→稳定', advice: '正常采购', risk: false, aiReason: '近期价格平稳，供需结构正常。建议按季度正常节奏补库即可。', history: generateHistory('→稳定', 210) },
        { name: '乳糖辅料', basePrice: 18, trend: '↓下降', advice: '建议延后采购', risk: false, aiReason: '受上游产能释放影响，乳糖价格持续回落。建议观望，延迟大宗采购节点。', history: generateHistory('↓下降', 22) },
    ];
    
    const randomNames = ['阿莫西林原料', '对乙酰氨基酚', '布洛芬原料', '大环内酯类', '右美沙芬', '微晶纤维素', '硬脂酸镁', '聚乙二醇', '葡萄糖酸钙', '替米沙坦原料', '奥美拉唑', '阿托伐他汀类', '盐酸二甲双胍', '扑热息痛', '克拉霉素'];
    const generatedItems = Array.from({ length: 55 }, (_, i) => {
      const isHighRisk = i < 4; // Add 4 more high risk to make a total of 5 high risk items in the list
      const name = randomNames[i % randomNames.length] + (i >= randomNames.length ? ` ${Math.floor(i / randomNames.length) + 1}` : '');
      const basePrice = Math.floor(Math.random() * 100) + 20;
      const trend = isHighRisk ? '↑上涨' : (Math.random() > 0.5 ? '→稳定' : '↓下降');
      const advice = isHighRisk ? '建议提前采购' : (trend === '→稳定' ? '正常采购' : '建议延后采购');
      return {
        name,
        basePrice,
        trend,
        advice,
        risk: isHighRisk,
        aiReason: isHighRisk 
          ? `AI检测到${name}存在供应短缺风险，价格呈上升趋势，建议尽早备货。`
          : `目前${name}市场供应充足，价格${trend.includes('下降') ? '持续走低' : '波动较小'}，可维持常规采购周期。`,
        history: generateHistory(trend, basePrice - (isHighRisk ? 10 : 0))
      };
    });

    const fullData = [...initialItems, ...generatedItems].map(item => {
       // Estimate future price based on trend
       let futurePrice = item.basePrice;
       if (item.trend === '↑上涨') futurePrice = item.basePrice * (1 + Math.random() * 0.1 + 0.05); // 5-15% increase
       
       // Fixed mockup volume in kg for calculation purposes
       const volumeKg = Math.floor(Math.random() * 50) * 100 + 1000; 

       // Calculate savings if we buy now instead of later
       let savedRmb = 0;
       if (item.risk && futurePrice > item.basePrice) {
          savedRmb = (futurePrice - item.basePrice) * volumeKg;
       }

       return {
         ...item,
         price: `￥${item.basePrice}/kg`,
         savedRmb
       };
    });

    const targetItemsAnalyzed = fullData.length;
    const targetHighRisk = fullData.filter(item => item.risk).length;
    
    // Total savings in ten thousands RMB (万)
    const targetSaved = Math.round(fullData.reduce((acc, item) => acc + item.savedRmb, 0) / 10000);

    const now = new Date();
    const formatTime = (addSec: number) => {
      const t = new Date(now.getTime() + addSec * 1000);
      return `[${t.getHours().toString().padStart(2, '0')}:${t.getMinutes().toString().padStart(2, '0')}:${t.getSeconds().toString().padStart(2, '0')}]`;
    };

    const flow = [
      { step: 1, text: `${formatTime(0)} 已连接卓创资讯`, delay: 1000 },
      { step: 2, text: `${formatTime(3)} 已抓取维生素C原料价格`, delay: 1200 },
      { step: 3, text: `${formatTime(6)} 已同步生意社行情数据`, delay: 1200 },
      { step: 4, text: `${formatTime(10)} AI正在分析价格趋势`, delay: 1200 },
      { step: 5, text: `${formatTime(15)} 已生成采购建议`, delay: 1000 }
    ];
    let currentDelay = 0;

    const startTime = Date.now();
    const duration = 5600;

    let animationFrameId: number;
    const animateStats = () => {
       const elapsed = Date.now() - startTime;
       if (elapsed < duration) {
         const progress = elapsed / duration;
         setPriceTrendStats({ 
           itemsAnalyzed: Math.floor(progress * targetItemsAnalyzed),
           highRisk: Math.floor(progress * targetHighRisk),
           saved: Math.floor(progress * targetSaved)
         });
         animationFrameId = requestAnimationFrame(animateStats);
       } else {
         setPriceTrendStats({ itemsAnalyzed: targetItemsAnalyzed, highRisk: targetHighRisk, saved: targetSaved });
       }
    };
    animationFrameId = requestAnimationFrame(animateStats);
    
    flow.forEach((f, index) => {
      currentDelay += f.delay;
      setTimeout(() => {
        setPriceTrendStep(f.step);
        setPriceTrendLogs(prev => [...prev, f.text]);

        if (index === 4) { // step 5
             setPriceTrendResults(fullData);
        }
        
        if (index === flow.length - 1) {
          setTimeout(() => {
            setIsPriceTrendRunning(false);
            setPriceTrendComplete(true);
            setPriceTrendStep(5); // Final completed step
          }, 400); 
        }
      }, currentDelay);
    });
  };

  const handleProcessOos = () => {
    setIsOosRunning(true);
    setOosLogs([]);
    setOosComplete(false);
    setShowReviewInput(false);
    setReviewRemark("");
    setIsReviewSubmitted(false);
    
    const getOosLines = (generic: string) => {
      const configs: Record<string, any> = {
        "布洛芬": {
          project: "含量测定",
          lsl: 98.5,
          usl: 101.5,
          method: "HPLC法, C18柱, 乙腈-0.1%磷酸(55:45)",
          batch: "Lot-20260527",
          result: 97.8,
          mean: 100.2,
          lwl: 99.4,
          uwl: 101.0,
          reason: "结果 97.8% 低于法定下限 98.5%",
          causes: [
            "1. 样品称量误差（检查天平记录）",
            "2. 流动相比例配制偏离（乙腈挥发导致比例失调）",
            "3. 色谱柱柱效下降或存在死体积"
          ]
        },
        "阿司匹林": {
          project: "有关物质",
          lsl: 0,
          usl: 1.0,
          method: "HPLC法, 游离水杨酸限度控制",
          batch: "Lot-20260520",
          result: 1.5,
          mean: 0.3,
          lwl: 0.1,
          uwl: 0.6,
          reason: "单杂(游离水杨酸)测试结果 1.5% 高于法定上限 1.0%",
          causes: [
            "1. 样品放置环境温湿度偏高，引发部分水解",
            "2. 溶剂配制过程受污染，带入酸碱性杂质",
            "3. 色谱仪进样针残留累积，系统清洗不充分"
          ]
        },
        "二甲双胍": {
          project: "溶出度",
          lsl: 80.0,
          usl: 100.0,
          method: "桨法, 50rpm, 水(1000ml), UV法测定吸光度",
          batch: "Lot-20260515",
          result: 75.2,
          mean: 92.5,
          lwl: 85.0,
          uwl: 99.0,
          reason: "45min 溶出量 75.2% 低于规范要求下限 80.0%",
          causes: [
            "1. 压片工艺硬度偏大，导致崩解与溶出迟缓",
            "2. 制粒阶段黏合剂(如HPMC)浓度异常增加",
            "3. 溶出仪转速标定存在机械误差"
          ]
        }
      };

      const defaultConf = {
        project: "水分测定",
        lsl: 0,
        usl: 2.0,
        method: "卡尔费休法(容量法), 混合溶剂",
        batch: "Lot-20260501",
        result: 2.4,
        mean: 1.1,
        lwl: 0.8,
        uwl: 1.6,
        reason: "结果 2.4% 高于法定上限 2.0%",
        causes: [
          "1. 环境相对湿度过高导致样品吸潮",
          "2. 滴定剂标定错误或试剂过期",
          "3. 包装材料密封完整性验证异常"
        ]
      };

      const conf = configs[generic] || defaultConf;

      return [
        "[SYSTEM] 启动每日自动化 OOS/OOT 监控流水线...",
        `[RAG_DB] 正在从知识库调取限度基准 -> 品种: [${generic}], 项目: [${conf.project}]`,
        `[RAG_DB] 基准提取成功: 法定下限(LSL) = ${conf.lsl}%, 法定上限(USL) = ${conf.usl}%`,
        `[RAG_DB] 附带方法信息: ${conf.method}`,
        "[RPA_BOT] 正在连接 LIMS 系统及色谱工作站数据库...",
        `[RPA_BOT] 抓取到最新待判定数据: 批号 [${conf.batch}], 检验结果: [${conf.result}%]`,
        "[DATABASE] 正在提取过去 30 批次历史检验数据计算控制限...",
        "[PYTHON] 统计基线计算完成:",
        `                 - 历史均值 (Mean): ${conf.mean}%`,
        `                 - 超常警戒下限 (LWL, -3σ): ${conf.lwl}%`,
        `                 - 超常警戒上限 (UWL, +3σ): ${conf.uwl}%`,
        "[ENGINE] 正在执行偏差判定逻辑...",
        `[ALERT] 触发 OOS 异常 (超标)！`,
        `                 原因: ${conf.reason}`,
        "[SYSTEM] 已在 LIMS 系统中自动拦截该批次放行流程！",
        "[AI_AGENT] 正在唤醒大模型，结合 RAG 检验方法生成《Phase I 实验室排查指南》...",
        "[AI_AGENT] 报告生成完毕。推测高风险失误点：",
        ...conf.causes.map((c: string) => `                 ${c}`),
        "[NOTIFY] 已通过 发送 OOS 警报及 AI 排查指南...",
        "[NOTIFY] 警报已成功推送至: [质量总监群], [QC经理], [当班化验员]",
        "[SYSTEM] 本次判定日志及 AI 报告已存入 MySQL 数据库，等待人工复核。",
        "[SYSTEM] 当前产品监控完成。"
      ];
    };

    const lines = getOosLines(selectedGeneric);
    
    let currentDelay = 0;
    lines.forEach((line, index) => {
      // 模拟真实的输出停顿
      let stepDelay = Math.floor(Math.random() * 600) + 300; // 默认停顿：300-900ms
      
      if (line.includes("正在")) {
        // 模拟请求、查询等耗时操作
        stepDelay = Math.floor(Math.random() * 1500) + 1000; // 1000-2500ms
      } else if (line.trim().startsWith("-") || line.trim().match(/^\d+\./) || line.trim().startsWith("原因:")) {
        // 列表或子条目，输出极快
        stepDelay = Math.floor(Math.random() * 200) + 100; // 100-300ms
      } else if (line.includes("[ALERT]")) {
        // 警报触发几乎无延迟
        stepDelay = 200;
      }

      currentDelay += stepDelay;
      setTimeout(() => {
        setOosLogs(prev => [...prev, line]);
        if (index === lines.length - 1) {
          setIsOosRunning(false);
          setOosComplete(true);
        }
      }, currentDelay);
    });
  };

  return (
    <>
      <div className="bg-white border border-slate-200 rounded-[12px] shadow-sm flex flex-col overflow-hidden w-full">
        <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between bg-slate-50/50 w-full">
           <h3 className="text-[13px] font-semibold text-slate-800 flex items-center gap-2">
              业务域协同总览
           </h3>
           <button className="text-[11px] font-medium text-blue-600 hover:underline">查看跨域流转日志</button>
        </div>
        <div className="grid grid-cols-6 divide-x divide-slate-100">
          {departments.map((dept, i) => (
            <div key={i} className="p-4 hover:bg-slate-50/50 transition-colors flex flex-col h-full">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded shrink-0 bg-slate-100 flex items-center justify-center text-slate-600">
                  <dept.icon className="w-4 h-4" />
                </div>
                <div className="font-semibold text-[13px] text-slate-800">{dept.name}</div>
              </div>
              
              <div className="flex flex-col gap-1.5 flex-1">
                 {dept.items.map((item, idx) => {
                   const isSpecial = item === '文献检索与初筛' || item === '创建生产订单' || item === '监管码采集上传' || item === '药检网站信息抓取' || item === '价格趋势预测与采购时机决策' || item === '连锁客户数据采集';
                   return (
                     <button 
                       key={idx} 
                       onClick={() => setSelectedItem(item)}
                       className={cn(
                         "text-left text-[11px] leading-tight break-words transition-all cursor-pointer rounded-md px-2.5 py-2 relative shadow-sm",
                         isSpecial 
                           ? "bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-800 font-medium border border-blue-200 hover:border-blue-300 hover:shadow-md pr-8 group/btn"
                           : "text-slate-600 bg-white hover:bg-slate-50 hover:text-blue-600 border border-slate-100 hover:border-blue-200"
                       )}
                       title={item}
                     >
                       <span className="relative z-10">{item}</span>
                       {isSpecial && (
                         <div className="absolute right-2 top-1/2 -translate-y-1/2 flex h-4 w-4 items-center justify-center rounded-full bg-blue-100/80 group-hover/btn:bg-blue-200/80 transition-colors">
                           <Zap className="w-2.5 h-2.5 text-blue-600 group-hover/btn:scale-110 transition-transform" />
                         </div>
                       )}
                     </button>
                   );
                 })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Detail Modal */}
      {selectedItem && (
        <div className="fixed inset-0 z-[100] flex items-start justify-center overflow-y-auto bg-slate-900/40 backdrop-blur-sm p-4 sm:items-center">
          <div className={cn("my-4 bg-white rounded-xl shadow-xl w-full flex flex-col transition-all duration-300 animate-in fade-in zoom-in-95", selectedItem === '文献检索与初筛' ? (screeningResults ? "max-w-5xl h-[90vh] overflow-hidden" : "max-w-xl overflow-visible") : selectedItem === 'OOS/OOT异常监控' ? (oosLogs.length > 0 ? "max-w-4xl h-[80vh] overflow-hidden" : "max-w-xl overflow-visible") : selectedItem === '监管码采集上传' ? (traceCodeLogs.length > 0 ? "max-w-4xl h-[80vh] overflow-hidden" : "max-w-xl overflow-visible") : selectedItem === '创建生产订单' ? (createOrderLogs.length > 0 ? "max-w-4xl h-[80vh] overflow-hidden" : "max-w-xl overflow-visible") : selectedItem === '药检网站信息抓取' ? (showInspectionResults ? "max-w-5xl h-[90vh] overflow-hidden" : inspectionLogs.length > 0 ? "max-w-4xl h-[80vh] overflow-hidden" : "max-w-xl overflow-visible") : selectedItem === '价格趋势预测与采购时机决策' ? (priceTrendResults.length > 0 ? "max-w-5xl h-[90vh] overflow-hidden" : priceTrendLogs.length > 0 ? "max-w-4xl h-[80vh] overflow-hidden" : "max-w-xl overflow-visible") : selectedItem === '连锁客户数据采集' ? (chainDataResults.length > 0 ? "max-w-5xl h-[90vh] overflow-hidden" : chainDataLogs.length > 0 ? "max-w-4xl h-[80vh] overflow-hidden" : "max-w-xl overflow-visible") : "max-w-md max-h-[90vh] overflow-hidden")}>
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50 shrink-0 rounded-t-xl z-20">
              <h3 className="text-[14px] font-semibold text-slate-800">{selectedItem} 详细看板</h3>
              <button 
                onClick={handleClose}
                className="text-slate-400 hover:text-slate-600 p-1 bg-white border border-slate-200 hover:bg-slate-100 rounded-md transition-colors shadow-sm"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className={cn("p-5 flex flex-col gap-4 min-h-0 flex-1 relative custom-scrollbar", selectedItem === '文献检索与初筛' ? (screeningResults ? "overflow-y-auto" : "overflow-visible") : selectedItem === 'OOS/OOT异常监控' ? (oosLogs.length > 0 ? "overflow-hidden" : "overflow-visible") : selectedItem === '监管码采集上传' ? (traceCodeLogs.length > 0 ? "overflow-y-auto" : "overflow-visible") : selectedItem === '创建生产订单' ? (createOrderLogs.length > 0 ? "overflow-hidden" : "overflow-visible") : selectedItem === '药检网站信息抓取' ? (showInspectionResults ? "overflow-y-auto" : inspectionLogs.length > 0 ? "overflow-y-auto" : "overflow-visible") : selectedItem === '价格趋势预测与采购时机决策' ? (priceTrendResults.length > 0 ? "overflow-y-auto" : priceTrendLogs.length > 0 ? "overflow-y-auto" : "overflow-visible") : selectedItem === '连锁客户数据采集' ? (chainDataResults.length > 0 ? "overflow-y-auto" : chainDataLogs.length > 0 ? "overflow-y-auto" : "overflow-visible") : "overflow-hidden")}>
              {selectedItem === '文献检索与初筛' ? (
                <div className="flex flex-col gap-4 w-full flex-1 min-h-0">
                  <div className="flex gap-4 w-full shrink-0 relative z-[60]">
                    <div className="flex flex-col gap-1.5 w-[240px] shrink-0">
                      <label className="text-[12px] font-medium text-slate-700">通用品种名</label>
                      <div className="relative">
                        <button
                          type="button"
                          className="w-full bg-white border border-slate-200 rounded-md px-3 py-2 text-[13px] text-slate-800 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-shadow flex justify-between items-center"
                          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                          onBlur={() => setTimeout(() => setIsDropdownOpen(false), 200)}
                        >
                          <span className="truncate">{selectedGeneric}</span>
                          <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        </button>
                        {isDropdownOpen && (
                          <div className="absolute z-50 w-full mt-1 bg-white border border-slate-200 rounded-md shadow-lg max-h-[160px] overflow-y-auto py-1">
                            {literatureData.map((item, idx) => (
                              <div 
                                key={idx}
                                className={cn("px-3 py-1.5 text-[13px] cursor-pointer transition-colors", selectedGeneric === item[0] ? "bg-blue-50 text-blue-700" : "text-slate-700 hover:bg-slate-50")}
                                onClick={() => {
                                  setSelectedGeneric(item[0]);
                                  setGeneratedQuery(null);
                                  setScreeningResults(null);
                                  setIsDropdownOpen(false);
                                  setOosLogs([]);
                                  setOosComplete(false);
                                  setShowReviewInput(false);
                                  setReviewRemark("");
                                  setIsReviewSubmitted(false);
                                }}
                              >
                                {item[0]}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-col gap-1.5 flex-1 min-w-0">
                      <label className="text-[12px] font-medium text-slate-700">同义词</label>
                      <div 
                        className="w-full bg-slate-50 border border-slate-200 rounded-md px-3 py-2 text-[13px] text-slate-500 truncate min-h-[36px] flex items-center"
                        title={synonym}
                      >
                        {synonym}
                      </div>
                    </div>
                  </div>
                  
                  {generatedQuery && (
                    <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 mt-2 animate-in fade-in slide-in-from-bottom-2 duration-300 shrink-0">
                       <div className="flex justify-between items-center mb-2">
                         <div className="text-[11px] font-medium text-slate-500">系统推荐检索式</div>
                         <button 
                           onClick={handleCopy} 
                           className={cn("text-[11px] font-medium flex items-center gap-1 bg-white border px-2 py-1 rounded shadow-sm transition-colors", isCopied ? "text-emerald-600 border-emerald-200" : "text-slate-600 border-slate-200 hover:text-blue-600 hover:border-blue-200")}
                         >
                           {isCopied ? <><Check className="w-3 h-3" /> 已复制</> : <><Copy className="w-3 h-3" /> 复制</>}
                         </button>
                       </div>
                       <div className="text-[12px] text-slate-700 font-mono bg-white border border-slate-100 p-2.5 rounded max-h-32 overflow-y-auto w-full break-all">
                         {generatedQuery}
                       </div>
                    </div>
                  )}

                  {screeningResults && (
                    <div className="mt-2 border border-slate-200 rounded-lg animate-in fade-in slide-in-from-bottom-2 duration-300 flex flex-col bg-white flex-1 min-h-[400px]">
                      <div className="px-3 py-2 bg-slate-50 border-b border-slate-200 flex items-center justify-between shrink-0">
                        <span className="text-[12px] font-medium text-slate-700">初筛结果 ({screeningResults.length})</span>
                        <div className="flex items-center gap-2">
                          <button 
                            onClick={handleSendToGroupClick}
                            disabled={isSendingToGroup || isSentToGroup}
                            className={cn(
                              "flex items-center gap-1.5 px-2.5 py-1.5 border rounded text-[11px] font-medium transition-colors shadow-sm disabled:opacity-80 disabled:cursor-not-allowed",
                              isSentToGroup 
                                ? "bg-emerald-50 border-emerald-200 text-emerald-600" 
                                : "bg-white border-slate-200 hover:bg-slate-50 hover:text-blue-600 hover:border-blue-200 text-slate-600"
                            )}
                          >
                            {isSentToGroup ? (
                              <>
                                <Check className="w-3 h-3" />
                                已发送
                              </>
                            ) : isSendingToGroup ? (
                              <>
                                <Loader2 className="w-3 h-3 animate-spin" />
                                发送中...
                              </>
                            ) : (
                              <>
                                <Send className="w-3 h-3" />
                                一键发送到群
                              </>
                            )}
                          </button>
                          <button 
                            onClick={handleExport}
                            className="flex items-center gap-1.5 px-2.5 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 hover:text-blue-600 hover:border-blue-200 text-slate-600 rounded text-[11px] font-medium transition-colors shadow-sm"
                          >
                            <Download className="w-3 h-3" />
                            导出表格
                          </button>
                          <button 
                            onClick={() => {
                              setScreeningResults(null);
                              setGeneratedQuery(null);
                            }}
                            className="p-1 hover:bg-slate-200 rounded text-slate-500 transition-colors"
                            title="关闭"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      <div className="w-full bg-white relative overflow-auto rounded-b-lg flex-1 min-h-0">
                        <table className="w-full text-left text-[12px] text-slate-600">
                          <thead className="bg-slate-50 text-slate-700 sticky top-0 z-10 shadow-sm border-b border-slate-200">
                            <tr>
                              <th className="px-3 py-2 font-medium break-keep">PMID</th>
                              <th className="px-3 py-2 font-medium min-w-[200px]">文献标题</th>
                              <th className="px-3 py-2 font-medium min-w-[250px]">文献摘要</th>
                              <th className="px-3 py-2 font-medium break-keep">不良反应</th>
                              <th className="px-3 py-2 font-medium break-keep">AI置信度</th>
                              <th className="px-3 py-2 font-medium min-w-[140px]">AI判断理由</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 bg-white">
                            {screeningResults.map((row, i) => (
                              <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                                <td className="px-3 py-2 align-top">{row.pmid}</td>
                                <td className="px-3 py-2 align-top font-medium text-slate-800 leading-tight">{row.title}</td>
                                <td className="px-3 py-2 align-top leading-relaxed"><div className="line-clamp-3" title={row.abstract}>{row.abstract}</div></td>
                                <td className="px-3 py-2 align-top">
                                  <span className={cn("px-1.5 py-0.5 rounded text-[10px] font-medium border", row.hasAdverseEvent === '是' ? 'bg-amber-50 text-amber-700 border-amber-200' : row.hasAdverseEvent === '疑似' ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-slate-50 text-slate-600 border-slate-200')}>
                                    {row.hasAdverseEvent}
                                  </span>
                                </td>
                                <td className="px-3 py-2 align-top">
                                  <span className={cn("px-1.5 py-0.5 rounded text-[10px] font-medium border", row.confidence === '高' ? 'bg-rose-50 text-rose-700 border-rose-200' : row.confidence === '中' ? 'bg-indigo-50 text-indigo-700 border-indigo-200' : 'bg-slate-50 text-slate-600 border-slate-200')}>
                                    {row.confidence}
                                  </span>
                                </td>
                                <td className="px-3 py-2 align-top text-[11px] leading-tight">{row.reason}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              ) : selectedItem === 'OOS/OOT异常监控' ? (
                <div className="flex flex-col gap-4 w-full flex-1 min-h-0">
                  <div className="flex gap-4 w-full shrink-0 relative z-[60]">
                    <div className="flex flex-col gap-1.5 w-[240px] shrink-0">
                      <label className="text-[12px] font-medium text-slate-700">通用品种名</label>
                      <div className="relative">
                        <button
                          type="button"
                          className="w-full bg-white border border-slate-200 rounded-md px-3 py-2 text-[13px] text-slate-800 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-shadow flex justify-between items-center"
                          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                          onBlur={() => setTimeout(() => setIsDropdownOpen(false), 200)}
                        >
                          <span className="truncate">{selectedGeneric}</span>
                          <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        </button>
                        {isDropdownOpen && (
                          <div className="absolute z-50 w-full mt-1 bg-white border border-slate-200 rounded-md shadow-lg max-h-[160px] overflow-y-auto py-1">
                            {literatureData.map((item, idx) => (
                              <div 
                                key={idx}
                                className={cn("px-3 py-1.5 text-[13px] cursor-pointer transition-colors", selectedGeneric === item[0] ? "bg-blue-50 text-blue-700" : "text-slate-700 hover:bg-slate-50")}
                                onClick={() => {
                                  setSelectedGeneric(item[0]);
                                  setIsDropdownOpen(false);
                                  setOosLogs([]);
                                  setOosComplete(false);
                                  setShowReviewInput(false);
                                  setReviewRemark("");
                                  setIsReviewSubmitted(false);
                                }}
                              >
                                {item[0]}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {oosLogs.length > 0 && (
                    <div className="mt-2 border border-slate-200 rounded-lg bg-slate-950 flex-1 min-h-[300px] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-300 shadow-inner">
                      <div className="px-3 py-2 bg-slate-900 border-b border-slate-800 flex items-center justify-between shrink-0">
                        <div className="flex items-center gap-2">
                          <div className="w-2.5 h-2.5 rounded-full bg-red-500"></div>
                          <div className="w-2.5 h-2.5 rounded-full bg-yellow-500"></div>
                          <div className="w-2.5 h-2.5 rounded-full bg-green-500"></div>
                          <span className="text-[11px] font-mono text-slate-400 ml-2">oos_oot_pipeline.sh</span>
                        </div>
                        {isOosRunning && <Loader2 className="w-3.5 h-3.5 text-blue-400 animate-spin" />}
                      </div>
                      <div className="p-4 overflow-y-auto font-mono text-[12px] flex-1 text-slate-300 leading-relaxed space-y-1 scroll-smooth">
                        {oosLogs.map((log, i) => (
                          <div key={i} className={cn(
                            "break-all",
                            log.includes('[ALERT]') ? "text-red-400 font-semibold" :
                            log.includes('[SYSTEM]') ? "text-blue-400" :
                            log.includes('[AI_AGENT]') ? "text-purple-400" :
                            log.includes('[NOTIFY]') ? "text-emerald-400" :
                            log.includes('[RAG_DB]') ? "text-cyan-400" :
                            "text-slate-300"
                          )}>
                            {log}
                          </div>
                        ))}
                        <div ref={terminalEndRef} />
                      </div>
                    </div>
                  )}
                </div>
              ) : selectedItem === '监管码采集上传' ? (
                <div className="flex flex-col gap-4 w-full flex-1 min-h-0">
                  <div className="flex gap-4 w-full shrink-0 relative z-[60]">
                    <div className="flex flex-col gap-1.5 w-[240px] shrink-0">
                      <label className="text-[12px] font-medium text-slate-700">通用品种名</label>
                      <div className="relative">
                        <button
                          type="button"
                          className="w-full bg-white border border-slate-200 rounded-md px-3 py-2 text-[13px] text-slate-800 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-shadow flex justify-between items-center"
                          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                          onBlur={() => setTimeout(() => setIsDropdownOpen(false), 200)}
                        >
                          <span className="truncate">{selectedGeneric}</span>
                          <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        </button>
                        {isDropdownOpen && (
                          <div className="absolute z-50 w-full mt-1 bg-white border border-slate-200 rounded-md shadow-lg max-h-[160px] overflow-y-auto py-1">
                            {literatureData.map((item, idx) => (
                              <div 
                                key={idx}
                                className={cn("px-3 py-1.5 text-[13px] cursor-pointer transition-colors", selectedGeneric === item[0] ? "bg-blue-50 text-blue-700" : "text-slate-700 hover:bg-slate-50")}
                                onClick={() => {
                                  setSelectedGeneric(item[0]);
                                  setIsDropdownOpen(false);
                                  setTraceCodeLogs([]);
                                  setTraceCodeComplete(false);
                                  setTraceCodeStep(0);
                                  setTraceCodeStats({ count: 0, rate: '--' });
                                  setShowTraceAnomaly(false);
                                }}
                              >
                                {item[0]}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {traceCodeLogs.length > 0 && (
                    <div className="flex flex-col gap-4 flex-1 min-h-0 animate-in fade-in zoom-in-95 mt-2">
                      <div className="grid grid-cols-2 gap-4 shrink-0">
                        <div className="bg-white border border-slate-200 rounded-lg p-3 shadow-sm flex flex-col justify-center">
                          <div className="text-[11px] text-slate-500 mb-1">处理数量</div>
                          <div className={cn("text-xl font-bold tracking-tight", traceCodeComplete ? "text-emerald-600" : "text-slate-800")}>{traceCodeStats.count.toLocaleString()}</div>
                        </div>
                        <div className="bg-white border border-slate-200 rounded-lg p-3 shadow-sm flex flex-col justify-center">
                          <div className="text-[11px] text-slate-500 mb-1">成功率</div>
                          <div className={cn("text-xl font-bold tracking-tight", traceCodeComplete ? "text-emerald-600" : "text-slate-800")}>
                            {traceCodeStats.rate === '--' ? '--' : traceCodeStats.rate}
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-4 flex-1 min-h-0 relative">
                        {/* Flow Nodes (Left) */}
                        <div className="w-[220px] shrink-0 border border-slate-200 rounded-lg bg-white p-5 flex flex-col justify-between relative shadow-sm z-0">
                          <div className="absolute left-[34px] top-10 bottom-10 w-[2px] bg-slate-100 -z-10 rounded-full overflow-hidden">
                             {isTraceCodeRunning && (
                               <motion.div 
                                 className="w-full bg-blue-500 blur-[1px]"
                                 animate={{ top: ['-20%', '120%'] }}
                                 transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
                                 style={{ height: '30%', position: 'absolute' }}
                               />
                             )}
                          </div>
                          
                          {['读取监管码文件', 'OCR识别', 'AI校验药检报告', '同步SAP数据', '上传药监平台'].map((n, i) => {
                             const isCurrent = traceCodeStep === i + 1 && isTraceCodeRunning;
                             const isCompleted = traceCodeStep > i || (traceCodeStep === 5 && traceCodeComplete);
                             const finalGreen = traceCodeComplete ? true : false;
                             
                             return (
                               <div key={i} className="flex items-center gap-3.5 relative">
                                 <div className={cn(
                                     "w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all duration-300 z-10 bg-white shadow-sm shrink-0",
                                     finalGreen ? "border-emerald-500 text-emerald-500 bg-emerald-50" : 
                                     isCompleted ? "border-emerald-500 text-emerald-500" : 
                                     isCurrent ? "border-blue-500 text-blue-600 bg-blue-50 shadow-[0_0_12px_rgba(59,130,246,0.3)] ring-2 ring-blue-100" : 
                                     "border-slate-200 text-slate-400"
                                 )}>
                                   {finalGreen || isCompleted ? <Check className="w-4 h-4" /> : i + 1}
                                 </div>
                                 <div className={cn(
                                     "text-[12px] transition-colors duration-300 leading-tight",
                                     finalGreen ? "text-emerald-700 font-semibold" : 
                                     isCompleted ? "text-emerald-600 font-medium" : 
                                     isCurrent ? "text-blue-700 font-bold" : 
                                     "text-slate-400"
                                 )}>
                                   {n}
                                 </div>
                               </div>
                             );
                          })}
                        </div>
                        
                        {/* Terminal (Right) */}
                        <div className="flex-1 border border-slate-200 rounded-lg bg-slate-950 flex flex-col overflow-hidden shadow-inner relative z-0">
                          <div className="px-3 py-2 bg-slate-900 border-b border-slate-800 flex items-center justify-between shrink-0">
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 rounded-full bg-slate-700"></div>
                              <span className="text-[10px] font-mono text-slate-400 ml-1">TERMINAL OUTPUT</span>
                            </div>
                            {isTraceCodeRunning && <Loader2 className="w-3.5 h-3.5 text-blue-400 animate-spin" />}
                          </div>
                          <div className="p-4 overflow-y-auto font-mono text-[12px] flex-1 text-slate-300 leading-relaxed space-y-1.5 scroll-smooth">
                            {traceCodeLogs.map((log, i) => (
                              <div key={i} className={cn(
                                "break-all",
                                log.includes('已上传') || log.includes('成功') || log.includes('完成') || log.includes('通过') ? "text-emerald-400" :
                                "text-slate-300"
                              )}>
                                {log}
                              </div>
                            ))}
                            <div ref={traceTerminalEndRef} />
                          </div>
                        </div>

                        {/* Anomaly Modal */}
                        {showTraceAnomaly && (
                           <div className="absolute bottom-4 right-4 bg-white border border-red-200 shadow-[0_4px_20px_rgba(239,68,68,0.15)] rounded-lg p-3.5 w-[240px] animate-in slide-in-from-right-4 fade-in flex gap-3 z-10 text-red-600">
                             <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                             <div className="flex flex-col gap-1">
                               <div className="text-[12px] font-bold leading-tight">发现3条重复监管码</div>
                               <div 
                                 className="text-[11px] text-slate-500 hover:text-red-500 cursor-pointer flex items-center gap-1 font-medium transition-colors"
                                 onClick={handleSendToGroupClick}
                               >
                                 <Send className="w-3 h-3" />
                                 {isSentToGroup ? '已发送' : isSendingToGroup ? '发送中...' : '一键发送到群'}
                               </div>
                             </div>
                           </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ) : selectedItem === '药检网站信息抓取' ? (
                <div className="flex flex-col gap-4 w-full flex-1 min-h-0">
                  <div className="flex gap-4 w-full shrink-0 relative z-[60]">
                    <div className="flex flex-col gap-1.5 w-[240px] shrink-0">
                      <label className="text-[12px] font-medium text-slate-700">信息抓取平台</label>
                      <div className="relative">
                        <button
                          type="button"
                          className="w-full bg-white border border-slate-200 rounded-md px-3 py-2 text-[13px] text-slate-800 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-shadow flex justify-between items-center"
                          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                          onBlur={() => setTimeout(() => setIsDropdownOpen(false), 200)}
                        >
                          <span className="truncate">{selectedPlatform}</span>
                          <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        </button>
                        {isDropdownOpen && (
                          <div className="absolute z-50 w-full mt-1 bg-white border border-slate-200 rounded-md shadow-lg max-h-[160px] overflow-y-auto py-1">
                            {['国家药监局', 'FDA', 'EMA'].map((item, idx) => (
                              <div 
                                key={idx}
                                className={cn("px-3 py-1.5 text-[13px] cursor-pointer transition-colors", selectedPlatform === item ? "bg-blue-50 text-blue-700" : "text-slate-700 hover:bg-slate-50")}
                                onClick={() => {
                                  setSelectedPlatform(item);
                                  setIsDropdownOpen(false);
                                  setInspectionLogs([]);
                                  setInspectionComplete(false);
                                  setInspectionStep(0);
                                  setInspectionStats({ fetch: 0, error: 0, aiRate: 0 });
                                  setShowInspectionResults(false);
                                  setSelectedInspectionRow(null);
                                }}
                              >
                                {item}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {inspectionLogs.length > 0 && (
                    <div className="flex flex-col gap-4 flex-1 min-h-0 animate-in fade-in zoom-in-95 mt-2">
                      <div className="grid grid-cols-3 gap-3 shrink-0">
                        <div className="bg-white border border-slate-200 rounded-lg p-3 shadow-sm flex flex-col gap-1 relative overflow-hidden">
                          <div className="absolute top-0 right-0 p-3 opacity-10">
                            <TrendingUp className="w-8 h-8 text-blue-600" />
                          </div>
                          <span className="text-[11px] font-medium text-slate-500">已抓取报告</span>
                          <div className="flex items-baseline gap-2">
                            <span className="text-2xl font-bold text-slate-800 tabular-nums">{inspectionStats.fetch}</span>
                            <span className="text-[11px] text-emerald-600 font-medium">份</span>
                          </div>
                        </div>
                        <div className="bg-white border border-slate-200 rounded-lg p-3 shadow-sm flex flex-col gap-1 relative overflow-hidden">
                          <div className="absolute top-0 right-0 p-3 opacity-10">
                            <AlertCircle className="w-8 h-8 text-amber-600" />
                          </div>
                          <span className="text-[11px] font-medium text-slate-500">异常报告</span>
                          <div className="flex items-baseline gap-2">
                            <span className="text-2xl font-bold text-slate-800 tabular-nums">{inspectionStats.error}</span>
                            <span className="text-[11px] text-red-600 font-medium">份</span>
                          </div>
                        </div>
                        <div className="bg-white border border-slate-200 rounded-lg p-3 shadow-sm flex flex-col gap-1 relative overflow-hidden">
                          <div className="absolute top-0 right-0 p-3 opacity-10">
                            <ShieldPlus className="w-8 h-8 text-emerald-600" />
                          </div>
                          <span className="text-[11px] font-medium text-slate-500">AI识别成功率</span>
                          <div className="flex items-baseline gap-2">
                            <span className="text-2xl font-bold text-slate-800 tabular-nums">{inspectionStats.aiRate.toFixed(1)}</span>
                            <span className="text-[11px] text-slate-400 font-medium">%</span>
                          </div>
                        </div>
                      </div>

                      <div className={cn("flex gap-4 min-h-0 relative transition-all duration-300", showInspectionResults ? "h-[240px] shrink-0" : "flex-1")}>
                        {/* Flow Nodes (Left) */}
                        <div className="w-[220px] shrink-0 border border-slate-200 rounded-lg bg-white px-5 py-3.5 flex flex-col justify-between relative shadow-sm z-0">
                          <div className="absolute left-[34px] top-7 bottom-7 w-[2px] bg-slate-100 -z-10 rounded-full overflow-hidden">
                             {isInspectionRunning && (
                               <motion.div 
                                 className="w-full bg-blue-500 blur-[1px]"
                                 animate={{ top: ['-20%', '120%'] }}
                                 transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
                                 style={{ height: '30%', position: 'absolute' }}
                               />
                             )}
                          </div>
                          
                          {['连接药监平台', '抓取药检报告', 'OCR识别', 'AI字段提取', '同步质量系统'].map((n, i) => {
                             const isCurrent = inspectionStep === i + 1 && isInspectionRunning;
                             const isCompleted = inspectionStep > i || (inspectionStep === 5 && inspectionComplete);
                             const finalGreen = inspectionComplete ? true : false;
                             
                             return (
                               <div key={i} className="flex items-center gap-3.5 relative">
                                 <div className={cn(
                                     "w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all duration-300 z-10 bg-white shadow-sm shrink-0",
                                     finalGreen ? "border-emerald-500 text-emerald-500 bg-emerald-50" : 
                                     isCompleted ? "border-emerald-500 text-emerald-500" : 
                                     isCurrent ? "border-blue-500 text-blue-600 bg-blue-50 shadow-[0_0_12px_rgba(59,130,246,0.3)] ring-2 ring-blue-100" : 
                                     "border-slate-200 text-slate-400"
                                 )}>
                                   {isCompleted ? <Check className="w-3.5 h-3.5" /> : i + 1}
                                 </div>
                                 <span className={cn(
                                   "text-[13px] font-medium transition-colors duration-300",
                                   finalGreen ? "text-slate-800" :
                                   isCurrent ? "text-blue-700" :
                                   isCompleted ? "text-slate-700" : "text-slate-400"
                                 )}>{n}</span>
                               </div>
                             );
                          })}
                        </div>
                        
                        {/* Terminal (Right) */}
                        <div className="flex-1 bg-slate-900 rounded-lg shadow-sm overflow-hidden flex flex-col border border-slate-800 min-w-0">
                          <div className="px-3 py-2 bg-slate-900 border-b border-slate-800 flex items-center justify-between shrink-0">
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 rounded-full bg-slate-700"></div>
                              <span className="text-[10px] font-mono text-slate-400 ml-1">TERMINAL OUTPUT</span>
                            </div>
                            {isInspectionRunning && <Loader2 className="w-3.5 h-3.5 text-blue-400 animate-spin" />}
                          </div>
                          <div className="p-4 overflow-y-auto font-mono text-[12px] flex-1 text-slate-300 leading-relaxed space-y-1.5 scroll-smooth">
                            {inspectionLogs.map((log, i) => (
                              <div key={i} className={cn(
                                "break-all",
                                log.includes('完成') || log.includes('成功') ? "text-emerald-400" :
                                "text-slate-300"
                              )}>
                                {log}
                              </div>
                            ))}
                            <div ref={inspectionTerminalEndRef} />
                          </div>
                        </div>
                      </div>
                      
                      {showInspectionResults && (
                        <div className="flex gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500 min-h-[280px] shrink-0">
                          <div className={cn(
                            "flex flex-col bg-white border border-slate-200 rounded-lg shadow-sm transition-all duration-300 min-h-0 flex-1 overflow-hidden",
                            selectedInspectionRow !== null ? "w-2/3" : "w-full"
                          )}>
                             <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between shrink-0">
                               <h4 className="text-[13px] font-semibold text-slate-800 flex items-center gap-1.5">
                                 <Microscope className="w-4 h-4 text-slate-500" />
                                 药检结果列表
                               </h4>
                             </div>
                             <div className="overflow-y-auto p-0 flex-1">
                               <table className="w-full text-left text-[12px] text-slate-600">
                                 <thead className="bg-slate-50 text-slate-700 sticky top-0 z-10 shadow-sm border-b border-slate-200">
                                   <tr>
                                     <th className="px-4 py-2 font-medium">药品名称</th>
                                     <th className="px-4 py-2 font-medium">批次号</th>
                                     <th className="px-4 py-2 font-medium">检验结果</th>
                                     <th className="px-4 py-2 font-medium">状态</th>
                                   </tr>
                                 </thead>
                                 <tbody className="divide-y divide-slate-100 bg-white">
                                   {inspectionRecordsMock.map((row, i) => (
                                     <tr 
                                       key={i} 
                                       className={cn(
                                         "transition-colors cursor-pointer",
                                         row.status === 'error' ? "bg-red-50 hover:bg-red-100" : "hover:bg-slate-50/50",
                                         selectedInspectionRow === i ? "ring-1 ring-inset ring-blue-500 z-10 relative bg-blue-50/50" : ""
                                       )}
                                       onClick={() => setSelectedInspectionRow(i)}
                                     >
                                       <td className="px-4 py-2.5 font-medium text-slate-800">{row.product}</td>
                                       <td className="px-4 py-2.5 font-mono text-[11px]">{row.batchNo}</td>
                                       <td className="px-4 py-2.5">{row.result}</td>
                                       <td className="px-4 py-2.5">
                                         {row.status === 'error' ? (
                                           <AlertCircle className="w-4 h-4 text-red-500 inline" />
                                         ) : (
                                           <Check className="w-4 h-4 text-emerald-500 inline" />
                                         )}
                                       </td>
                                     </tr>
                                   ))}
                                 </tbody>
                               </table>
                             </div>
                          </div>
                          
                          {selectedInspectionRow !== null && (
                            <div className="w-[360px] flex-shrink-0 flex flex-col bg-slate-50 border-l border-slate-200 shadow-[inset_1px_0_10px_rgba(0,0,0,0.02)] animate-in slide-in-from-right-4 duration-300 overflow-y-auto">
                               <div className="px-5 py-3.5 bg-white border-b border-slate-200 flex items-center justify-between sticky top-0 z-10 shadow-sm">
                                 <h4 className="text-[14px] font-bold text-slate-800 flex items-center gap-2">
                                   <FileText className="w-4 h-4 text-blue-600" />
                                   质检报告结构化提取
                                 </h4>
                                 <button 
                                   onClick={(e) => { e.stopPropagation(); setSelectedInspectionRow(null); }}
                                   className="text-slate-400 hover:text-slate-600 bg-white hover:bg-slate-100 p-1 rounded-md transition-colors border border-slate-200 shadow-sm"
                                 >
                                   <X className="w-4 h-4" />
                                 </button>
                               </div>

                               <div className="p-5 flex flex-col gap-4">
                                 {/* Report Header */}
                                 <div className="flex flex-col items-center justify-center border-b border-slate-200 pb-4">
                                   <h5 className="font-bold text-[16px] text-slate-900">{inspectionRecordsMock[selectedInspectionRow].product}</h5>
                                   <span className="text-[12px] font-mono text-slate-500 mt-1">批号: {inspectionRecordsMock[selectedInspectionRow].batchNo}</span>
                                 </div>

                                 {/* AI OCR Badge info */}
                                 <div className="flex flex-col gap-2">
                                   <div className="flex items-center gap-1.5 text-[11px] font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-1 rounded-md w-fit">
                                      <Scan className="w-3.5 h-3.5" /> AI+OCR 智能结构化抽取成功 (置信度 99.2%)
                                   </div>
                                   <p className="text-[11px] text-slate-500 leading-relaxed">
                                      系统已使用OCR技术识别原报告盖章扫描件，并通过大语言模型提取关键检验项。
                                      检验合格的自动判定依据为：比对提取的<b>[实际检验结果]</b>与当前国家药典的<b>[法定法定限度与内控标准]</b>。
                                   </p>
                                 </div>

                                 {/* Data grid */}
                                 <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-sm">
                                   <div className="grid grid-cols-[1fr_1.5fr] bg-slate-50 border-b border-slate-200">
                                      <div className="px-3 py-2 text-[11px] font-medium text-slate-500 border-r border-slate-200">检验项目</div>
                                      <div className="px-3 py-2 text-[11px] font-medium text-slate-500">法定标准与实测结果</div>
                                   </div>
                                   <div className="grid grid-cols-[1fr_1.5fr] border-b border-slate-100">
                                      <div className="px-3 py-2.5 text-[12px] text-slate-700 border-r border-slate-100 font-medium leading-tight">性状<br/><span className="text-[10px] font-normal text-slate-400">Appearance</span></div>
                                      <div className="px-3 py-2.5 text-[12px] text-slate-600">本品为胶囊剂<br/><span className="text-[11px] text-slate-400">标准: 应为胶囊剂内含白色颗粒</span></div>
                                   </div>
                                   <div className="grid grid-cols-[1fr_1.5fr] border-b border-slate-100">
                                      <div className="px-3 py-2.5 text-[12px] text-slate-700 border-r border-slate-100 font-medium leading-tight">鉴别<br/><span className="text-[10px] font-normal text-slate-400">Identification</span></div>
                                      <div className="px-3 py-2.5 text-[12px] text-slate-600">呈正反应<br/><span className="text-[11px] text-slate-400">标准: 显相同色谱峰</span></div>
                                   </div>
                                   <div className="grid grid-cols-[1fr_1.5fr]">
                                      <div className="px-3 py-2.5 text-[12px] text-slate-700 border-r border-slate-100 font-medium leading-tight">含量测定<br/><span className="text-[10px] font-normal text-slate-400">Assay</span></div>
                                      <div className="px-3 py-2.5 text-[12px] font-mono text-slate-600 flex flex-col justify-center">
                                        <div className={inspectionRecordsMock[selectedInspectionRow].status === 'error' ? "text-red-600 font-semibold" : "text-emerald-600 font-semibold"}>
                                          {inspectionRecordsMock[selectedInspectionRow].status === 'error' ? '92.4% (超标)' : '99.1% (合格)'}
                                        </div>
                                        <span className="text-[11px] font-sans text-slate-400">限度: 95.0% - 105.0%</span>
                                      </div>
                                   </div>
                                 </div>

                                 {inspectionRecordsMock[selectedInspectionRow].status === 'error' && (
                                   <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex flex-col gap-1.5 mt-2 shadow-sm">
                                     <div className="flex items-center gap-1.5 text-[12px] font-bold text-red-700">
                                       <AlertCircle className="w-3.5 h-3.5" />
                                       AI 自动判定拦截
                                     </div>
                                     <div className="text-[12px] text-red-600 leading-relaxed">
                                       {inspectionRecordsMock[selectedInspectionRow].reason} 本报告已拦截并触发OOS复核流程。
                                     </div>
                                   </div>
                                 )}

                            <div className="flex justify-center mt-2 pb-4 border-b border-slate-200 border-dashed">
                               <button 
                                 onClick={() => {
                                   const record = inspectionRecordsMock[selectedInspectionRow];
                                   const content = `[模拟数据] 药检报告扫描件摘要\n\n药品名称: ${record.product}\n批次号: ${record.batchNo}\n平台: ${selectedPlatform}\n结果: ${record.result}\n\n详细扫描内容...`;
                                   const blob = new Blob([content], { type: 'text/plain' });
                                   const url = URL.createObjectURL(blob);
                                   const link = document.createElement('a');
                                   link.href = url;
                                   link.download = `药检报告_${record.product}_${record.batchNo}.txt`;
                                   document.body.appendChild(link);
                                   link.click();
                                   document.body.removeChild(link);
                                   URL.revokeObjectURL(url);
                                 }}
                                 className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-[12px] font-medium rounded-md shadow-sm transition-colors flex gap-1.5 items-center"
                               >
                                 <Download className="w-3.5 h-3.5" />
                                 下载原始检测机构扫描件
                               </button>
                            </div>
                               </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ) : selectedItem === '创建生产订单' ? (
                <div className="flex flex-col gap-4 w-full flex-1 min-h-0">
                  {createOrderLogs.length === 0 ? (
                    <div className="flex-1 border border-slate-200 rounded-lg overflow-hidden flex flex-col bg-white">
                      <div className="overflow-y-auto">
                        <table className="w-full text-left border-collapse text-[12px]">
                          <thead>
                            <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-medium whitespace-nowrap">
                              <th className="px-4 py-3 font-medium w-10">
                                <div 
                                  className={cn(
                                    "w-4 h-4 rounded-[3px] border flex items-center justify-center cursor-pointer transition-colors",
                                    selectedProdOrders.length > 0 && selectedProdOrders.length === productionOrders.length ? "border-blue-600 bg-blue-600" : 
                                    selectedProdOrders.length > 0 ? "border-blue-600 bg-blue-50" : "border-slate-300 bg-white"
                                  )}
                                  onClick={() => {
                                    if (selectedProdOrders.length === productionOrders.length) {
                                      setSelectedProdOrders([]);
                                    } else {
                                      setSelectedProdOrders(productionOrders.map((_, i) => i));
                                    }
                                  }}
                                >
                                  {selectedProdOrders.length > 0 && selectedProdOrders.length === productionOrders.length && <Check className="w-3 h-3 text-white" />}
                                  {selectedProdOrders.length > 0 && selectedProdOrders.length < productionOrders.length && <div className="w-2 h-2 bg-blue-600 rounded-[1px]" />}
                                </div>
                              </th>
                              <th className="px-4 py-3 font-medium">产品名称</th>
                              <th className="px-4 py-3 font-medium">物料编码</th>
                              <th className="px-4 py-3 font-medium">批次号</th>
                              <th className="px-4 py-3 font-medium">计划产量</th>
                              <th className="px-4 py-3 font-medium">工厂</th>
                              <th className="px-4 py-3 font-medium">生产线</th>
                              <th className="px-4 py-3 font-medium">计划开始时间</th>
                              <th className="px-4 py-3 font-medium">订单类型</th>
                            </tr>
                          </thead>
                          <tbody>
                            {productionOrders.map((row, index) => {
                              const isSelected = selectedProdOrders.includes(index);
                              return (
                              <tr 
                                key={index} 
                                className={cn(
                                  "border-b border-slate-100 last:border-b-0 cursor-pointer transition-all",
                                  isSelected ? "bg-blue-50/80 outline outline-1 outline-blue-400 -outline-offset-1 z-10 relative" : "hover:bg-slate-50"
                                )}
                                onClick={() => setSelectedProdOrders(prev => prev.includes(index) ? prev.filter(i => i !== index) : [...prev, index])}
                              >
                                <td className="px-4 py-3 text-center">
                                  <div className={cn(
                                    "w-4 h-4 rounded-[3px] border flex items-center justify-center transition-colors",
                                    isSelected ? "border-blue-600 bg-blue-600" : "border-slate-300 bg-white"
                                  )}>
                                    {isSelected && <Check className="w-3 h-3 text-white" />}
                                  </div>
                                </td>
                                <td className="px-4 py-3 font-medium text-slate-800">{row.product}</td>
                                <td className="px-4 py-3 text-slate-600 font-mono text-[11px]">{row.materialCode}</td>
                                <td className="px-4 py-3 text-slate-600 font-mono text-[11px]">{row.batchNo}</td>
                                <td className="px-4 py-3 text-slate-600">{row.plannedOutput}</td>
                                <td className="px-4 py-3 text-slate-600">{row.factory}</td>
                                <td className="px-4 py-3 text-slate-600">{row.line}</td>
                                <td className="px-4 py-3 text-slate-600">{row.startTime}</td>
                                <td className="px-4 py-3">
                                  <span className={cn(
                                    "px-2 py-0.5 rounded text-[11px] font-medium whitespace-nowrap",
                                    row.orderType === '标准生产' ? "bg-slate-100 text-slate-600" :
                                    row.orderType === '加急生产' ? "bg-amber-100 text-amber-700" :
                                    row.orderType === '返工生产' ? "bg-red-100 text-red-700" :
                                    "bg-blue-100 text-blue-700"
                                  )}>
                                    {row.orderType}
                                  </span>
                                </td>
                              </tr>
                            )})}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  ) : null}

                  {createOrderLogs.length > 0 && (
                    <div className="flex flex-col gap-4 flex-1 min-h-0 animate-in fade-in zoom-in-95 mt-2">
                      <div className="grid grid-cols-3 gap-4 shrink-0">
                        <div className="bg-white border border-slate-200 rounded-lg p-3 shadow-sm flex flex-col justify-center">
                          <div className="text-[11px] text-slate-500 mb-1">在线工单</div>
                          <div className={cn("text-xl font-bold tracking-tight", createOrderComplete ? "text-emerald-600" : "text-slate-800")}>{createOrderStats.active.toLocaleString()}</div>
                        </div>
                        <div className="bg-white border border-slate-200 rounded-lg p-3 shadow-sm flex flex-col justify-center">
                          <div className="text-[11px] text-slate-500 mb-1">今日生产批次</div>
                          <div className={cn("text-xl font-bold tracking-tight", createOrderComplete ? "text-emerald-600" : "text-slate-800")}>{createOrderStats.batch.toLocaleString()}</div>
                        </div>
                        <div className="bg-white border border-slate-200 rounded-lg p-3 shadow-sm flex flex-col justify-center">
                          <div className="text-[11px] text-slate-500 mb-1">自动化处理率</div>
                          <div className={cn("text-xl font-bold tracking-tight", createOrderComplete ? "text-emerald-600" : "text-slate-800")}>{createOrderStats.rate}%</div>
                        </div>
                      </div>

                      <div className="flex gap-4 flex-1 min-h-0 relative">
                        {/* Flow Nodes (Left) */}
                        <div className="w-[220px] shrink-0 border border-slate-200 rounded-lg bg-white p-5 flex flex-col justify-between relative shadow-sm z-0">
                          <div className="absolute left-[34px] top-10 bottom-10 w-[2px] bg-slate-100 -z-10 rounded-full overflow-hidden">
                             {isCreateOrderRunning && (
                               <motion.div 
                                 className="w-full bg-blue-500 blur-[1px]"
                                 animate={{ top: ['-20%', '120%'] }}
                                 transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
                                 style={{ height: '30%', position: 'absolute' }}
                               />
                             )}
                          </div>
                          
                          {['读取生产计划', '校验物料库存', '创建SAP生产订单', '同步MES工单', '下发生产任务'].map((n, i) => {
                             const isCurrent = createOrderStep === i + 1 && isCreateOrderRunning;
                             const isCompleted = createOrderStep > i || (createOrderStep === 5 && createOrderComplete);
                             const finalGreen = createOrderComplete ? true : false;
                             
                             return (
                               <div key={i} className="flex items-center gap-3.5 relative">
                                 <div className={cn(
                                     "w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all duration-300 z-10 bg-white shadow-sm shrink-0",
                                     finalGreen ? "border-emerald-500 text-emerald-500 bg-emerald-50" : 
                                     isCompleted ? "border-emerald-500 text-emerald-500" : 
                                     isCurrent ? "border-blue-500 text-blue-600 bg-blue-50 shadow-[0_0_12px_rgba(59,130,246,0.3)] ring-2 ring-blue-100" : 
                                     "border-slate-200 text-slate-400"
                                 )}>
                                   {finalGreen || isCompleted ? <Check className="w-4 h-4" /> : i + 1}
                                 </div>
                                 <div className={cn(
                                     "text-[12px] transition-colors duration-300 leading-tight",
                                     finalGreen ? "text-emerald-700 font-semibold" : 
                                     isCompleted ? "text-emerald-600 font-medium" : 
                                     isCurrent ? "text-blue-700 font-bold" : 
                                     "text-slate-400"
                                 )}>
                                   {n}
                                 </div>
                               </div>
                             );
                          })}
                        </div>
                        
                        {/* Terminal (Right) */}
                        <div className="flex-1 border border-slate-200 rounded-lg bg-slate-950 flex flex-col overflow-hidden shadow-inner relative z-0">
                          <div className="px-3 py-2 bg-slate-900 border-b border-slate-800 flex items-center justify-between shrink-0">
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 rounded-full bg-slate-700"></div>
                              <span className="text-[10px] font-mono text-slate-400 ml-1">TERMINAL OUTPUT</span>
                            </div>
                            {isCreateOrderRunning && <Loader2 className="w-3.5 h-3.5 text-blue-400 animate-spin" />}
                          </div>
                          <div className="p-4 overflow-y-auto font-mono text-[12px] flex-1 text-slate-300 leading-relaxed space-y-1.5 scroll-smooth">
                            {createOrderLogs.map((log, i) => (
                              <div key={i} className={cn(
                                "break-all",
                                log.includes('完成') || log.includes('成功') ? "text-emerald-400" :
                                "text-slate-300"
                              )}>
                                {log}
                              </div>
                            ))}
                            <div ref={createOrderTerminalEndRef} />
                          </div>
                        </div>

                        {/* Anomaly Modal */}
                        {showCreateOrderAnomaly && (
                           <div className="absolute bottom-4 right-4 bg-white border border-amber-200 shadow-[0_4px_20px_rgba(245,158,11,0.15)] rounded-lg p-3.5 w-[240px] animate-in slide-in-from-right-4 fade-in flex gap-3 z-10 text-amber-600">
                             <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                             <div className="flex flex-col gap-1">
                               <div className="text-[12px] font-bold leading-tight text-amber-600">发现1个物料库存不足</div>
                               <div className="text-[11px] text-amber-700/80">系统已自动触发补料流程</div>
                             </div>
                           </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ) : selectedItem === '价格趋势预测与采购时机决策' ? (
                <div className="flex flex-col gap-4 w-full flex-1 min-h-0">
                  <div className="grid grid-cols-3 gap-3 shrink-0">
                     <div className="bg-slate-50 border border-slate-100 rounded-lg p-3 flex flex-col gap-1 transition-all">
                       <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">已分析原料数量</span>
                       <span className="text-[20px] font-bold text-slate-800">{priceTrendStats.itemsAnalyzed}</span>
                     </div>
                     <div className="bg-orange-50 border border-orange-100 rounded-lg p-3 flex flex-col gap-1 transition-all">
                       <span className="text-[10px] uppercase font-bold text-orange-600 tracking-wider">高风险提醒</span>
                       <span className="text-[20px] font-bold text-orange-700">{priceTrendStats.highRisk} <span className="text-[11px] font-medium opacity-80 ml-0.5">项</span></span>
                     </div>
                     <div className="bg-emerald-50 border border-emerald-100 rounded-lg p-3 flex flex-col gap-1 transition-all">
                       <div className="flex items-center justify-between">
                         <span className="text-[10px] uppercase font-bold text-emerald-600 tracking-wider">预计节省成本</span>
                         <div className="relative group/tooltip flex z-10">
                           <Info className="w-3.5 h-3.5 text-emerald-500/70 hover:text-emerald-500 cursor-help transition-colors" />
                           <div className="absolute top-full right-0 mt-2 w-[220px] bg-slate-800 text-white text-[11px] p-2.5 rounded-lg shadow-xl opacity-0 -translate-y-1 pointer-events-none group-hover/tooltip:opacity-100 group-hover/tooltip:translate-y-0 transition-all z-[100] leading-relaxed">
                              基于高风险原料预测未来7天可能上涨的幅度（5%-15%），乘以系统的模拟采购量计算得出的潜法规避成本。
                              <div className="absolute -top-1 right-1 w-2 h-2 bg-slate-800 rotate-45"></div>
                           </div>
                         </div>
                       </div>
                       <span className="text-[20px] font-bold text-emerald-700 mt-0.5">￥{priceTrendStats.saved} <span className="text-[12px] font-medium opacity-80 ml-0.5">万</span></span>
                     </div>
                  </div>

                  <div className={cn("flex gap-4 min-h-0 relative transition-all duration-300", priceTrendResults.length > 0 ? "h-[240px] shrink-0" : "flex-1")}>
                    <div className="w-[220px] shrink-0 border border-slate-200 rounded-lg bg-white px-5 py-3.5 flex flex-col justify-between relative shadow-sm z-0">
                      <div className="absolute left-[34px] top-7 bottom-7 w-[2px] bg-slate-100 -z-10 rounded-full overflow-hidden">
                         {isPriceTrendRunning && (
                           <motion.div 
                             className="w-full bg-blue-500 blur-[1px]"
                             animate={{ top: ['-20%', '120%'] }}
                             transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
                             style={{ height: '30%', position: 'absolute' }}
                           />
                         )}
                      </div>
                      
                      {['连接卓创资讯', '抓取原料价格', '同步生意社行情', 'AI分析趋势', '生成采购建议'].map((n, i) => {
                         const isCurrent = priceTrendStep === i + 1 && isPriceTrendRunning;
                         const isCompleted = priceTrendStep > i || (priceTrendStep === 5 && priceTrendComplete);
                         const finalGreen = priceTrendComplete ? true : false;
                         
                         return (
                           <div key={i} className="flex items-center gap-3.5 relative">
                             <div className={cn(
                                 "w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all duration-300 z-10 bg-white shadow-sm shrink-0",
                                 isCompleted 
                                  ? (finalGreen ? "bg-emerald-50 border-emerald-500 text-emerald-600" : "bg-blue-50 border-blue-500 text-blue-600")
                                  : isCurrent
                                  ? "border-blue-400 text-blue-600 shadow-[0_0_10px_rgba(59,130,246,0.3)]"
                                  : "border-slate-200 text-slate-400"
                               )}>
                               {isCompleted ? <Check className="w-3.5 h-3.5" /> : i + 1}
                             </div>
                             <span className={cn(
                               "text-[12px] font-medium transition-colors duration-300",
                               isCompleted ? (finalGreen ? "text-emerald-700" : "text-slate-800") : isCurrent ? "text-blue-600 font-bold" : "text-slate-400"
                             )}>
                               {n}
                             </span>
                           </div>
                         );
                      })}
                    </div>

                    <div className="flex-1 flex flex-col bg-slate-900 rounded-lg overflow-hidden shadow-inner border border-slate-800">
                      <div className="px-3 py-2 border-b border-slate-700 bg-slate-800/50 flex items-center gap-2">
                         <div className="flex gap-1.5">
                           <div className="w-2.5 h-2.5 rounded-full bg-red-500" />
                           <div className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                           <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                         </div>
                         <div className="text-[10px] text-slate-400 font-mono ml-2">price-trend-analyzer.log</div>
                      </div>
                      <div className="p-4 overflow-y-auto font-mono text-[12px] flex-1 text-slate-300 leading-relaxed space-y-1.5 scroll-smooth">
                        {priceTrendLogs.map((log, i) => (
                          <div key={i} className={cn(
                            "break-all",
                            log.includes('生成采购建议') ? "text-emerald-400" :
                            log.includes('分析') ? "text-blue-300" :
                            "text-slate-300"
                          )}>
                            {log}
                          </div>
                        ))}
                        <div ref={priceTrendTerminalEndRef} />
                      </div>
                    </div>
                  </div>

                  {priceTrendResults.length > 0 && (
                    <div className="flex gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500 min-h-[220px] shrink-0">
                      <div className={cn(
                        "flex flex-col bg-white border border-slate-200 rounded-lg shadow-sm transition-all duration-300 min-h-0 flex-1 overflow-hidden",
                        selectedPriceTrendRow !== null ? "w-[40%]" : "w-full"
                      )}>
                         <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between shrink-0">
                           <h4 className="text-[13px] font-semibold text-slate-800 flex items-center gap-1.5">
                             <TrendingUp className="w-4 h-4 text-slate-500" />
                             原料行情监控列表
                           </h4>
                         </div>
                         <div className="overflow-y-auto p-0 flex-1">
                           <table className="w-full text-left text-[12px] text-slate-600">
                             <thead className="bg-slate-50 text-slate-700 sticky top-0 z-10 shadow-sm border-b border-slate-200">
                               <tr>
                                 <th className="px-4 py-2 font-medium">原料名称</th>
                                 <th className="px-4 py-2 font-medium">当前价格</th>
                                 <th className="px-4 py-2 font-medium">7日趋势</th>
                                 <th className="px-4 py-2 font-medium">AI建议</th>
                               </tr>
                             </thead>
                             <tbody className="divide-y divide-slate-100 bg-white">
                               {priceTrendResults.map((row, i) => (
                                 <tr 
                                   key={i} 
                                   className={cn(
                                     "transition-colors cursor-pointer",
                                     row.risk ? "bg-orange-50/60 hover:bg-orange-100/60" : "hover:bg-slate-50/50",
                                     selectedPriceTrendRow === i ? "ring-1 ring-inset ring-blue-500 z-10 relative bg-blue-50/50" : ""
                                   )}
                                   onClick={() => setSelectedPriceTrendRow(i)}
                                 >
                                   <td className="px-4 py-3 font-medium text-slate-800">{row.name}</td>
                                   <td className="px-4 py-3 font-mono">{row.price}</td>
                                   <td className={cn("px-4 py-3 font-semibold", row.trend.includes('上涨') ? "text-red-600" : row.trend.includes('下降') ? "text-emerald-600" : "text-slate-500")}>{row.trend}</td>
                                   <td className="px-4 py-3">{row.advice}</td>
                                 </tr>
                               ))}
                             </tbody>
                           </table>
                         </div>
                      </div>

                      {selectedPriceTrendRow !== null && (
                        <div className="flex-shrink-0 flex flex-col bg-slate-50 border border-slate-200 rounded-lg shadow-sm animate-in slide-in-from-right-4 duration-300" style={{ width: '60%' }}>
                           <div className="px-4 py-2.5 bg-white border-b border-slate-200 flex items-center justify-between shrink-0 sticky top-0 z-20">
                             <h4 className="text-[13px] font-bold text-slate-800 flex items-center gap-2">
                               <TrendingUp className="w-4 h-4 text-blue-600" />
                               AI 分析与对比
                             </h4>
                             <button 
                               onClick={(e) => { e.stopPropagation(); setSelectedPriceTrendRow(null); }}
                               className="text-slate-400 hover:text-slate-600 bg-white hover:bg-slate-100 p-1 rounded-md transition-colors border border-slate-200 shadow-sm"
                             >
                               <X className="w-4 h-4" />
                             </button>
                           </div>
                           <div className="flex flex-1 min-h-0 overflow-hidden">
                             {/* Left: Fixed Info */}
                             <div className="w-[55%] p-5 flex flex-col gap-3 overflow-y-auto border-r border-slate-200 shrink-0 bg-white">
                                <h5 className="font-bold text-[15px] text-slate-900 border-b border-slate-200 pb-2">{priceTrendResults[selectedPriceTrendRow].name}</h5>
                                <p className="text-[12px] text-slate-600 leading-relaxed whitespace-pre-wrap mt-1">{priceTrendResults[selectedPriceTrendRow].aiReason}</p>
                                
                                {priceTrendResults[selectedPriceTrendRow].history && (
                                  <div className="mt-4 flex flex-col gap-2 shrink-0">
                                    <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center justify-between">
                                      <span>过去 14 天价格趋势</span>
                                      <span className="bg-white border border-slate-200 px-1.5 py-0.5 rounded shadow-sm text-slate-600">￥/kg</span>
                                    </div>
                                    <div className="w-full h-[160px] bg-white border border-slate-200 rounded-lg shadow-sm p-3">
                                      <ResponsiveContainer width="100%" height="100%">
                                        <LineChart data={priceTrendResults[selectedPriceTrendRow].history}>
                                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                                          <XAxis 
                                            dataKey="day" 
                                            fontSize={10} 
                                            tickMargin={8} 
                                            tickLine={false} 
                                            axisLine={false}
                                            interval="preserveEnd"
                                          />
                                          <YAxis 
                                            domain={['dataMin - 10', 'auto']} 
                                            fontSize={10} 
                                            tickLine={false} 
                                            axisLine={false}
                                            width={25}
                                          />
                                          <Tooltip 
                                            contentStyle={{ borderRadius: '8px', fontSize: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)' }}
                                            labelStyle={{ color: '#64748B', marginBottom: '2px' }}
                                            itemStyle={{ color: '#0F172A', fontWeight: 600 }}
                                          />
                                          <Line 
                                            type="monotone" 
                                            dataKey="price" 
                                            stroke={priceTrendResults[selectedPriceTrendRow].risk ? "#EF4444" : "#3B82F6"} 
                                            strokeWidth={2}
                                            dot={{ r: 3, fill: priceTrendResults[selectedPriceTrendRow].risk ? "#EF4444" : "#3B82F6", strokeWidth: 0 }}
                                            activeDot={{ r: 5, strokeWidth: 0 }}
                                            animationDuration={1000}
                                          />
                                        </LineChart>
                                      </ResponsiveContainer>
                                    </div>
                                  </div>
                                )}
                             </div>

                             {/* Right: Scrolling Snapshots */}
                             <div className="w-[45%] bg-slate-50/50 flex flex-col min-h-0">
                                <div className="p-3 bg-slate-100/50 border-b border-slate-200 font-semibold text-[12px] text-slate-700 shrink-0 sticky top-0 shadow-sm z-10 flex items-center gap-1.5">
                                   <Scan className="w-3.5 h-3.5 text-blue-500" />
                                   重点关注原料快照
                                </div>
                                <div className="p-3 overflow-y-auto flex flex-col gap-2.5">
                                  {priceTrendResults.filter(item => item.risk || item.trend === '↑上涨').slice(0, 10).map((item, idx) => {
                                    const origIdx = priceTrendResults.indexOf(item);
                                    return (
                                      <div 
                                        key={idx} 
                                        className={cn(
                                          "bg-white border rounded-lg p-2.5 flex flex-col gap-1.5 shadow-sm cursor-pointer transition-all hover:-translate-y-0.5 hover:shadow-md",
                                          origIdx === selectedPriceTrendRow ? "border-blue-400 ring-1 ring-blue-400 bg-blue-50/30" : "border-slate-200 hover:border-blue-300"
                                        )}
                                        onClick={() => setSelectedPriceTrendRow(origIdx)}
                                      >
                                        <div className="flex justify-between items-center font-bold text-[12px]">
                                          <span className="text-slate-800 break-all w-[70px] leading-tight">{item.name}</span>
                                          <span className={cn(
                                            "text-[13px] font-mono",
                                            item.risk ? "text-red-600" : "text-blue-600"
                                          )}>{item.price}</span>
                                        </div>
                                        <div className="flex items-center justify-between text-[11px]">
                                          <span className="text-slate-500">7日趋势:</span>
                                          <span className={cn(
                                            "font-semibold px-1.5 py-0.5 rounded text-[10px]",
                                            item.trend.includes('上涨') ? "bg-red-50 text-red-600" :
                                            item.trend.includes('下降') ? "bg-emerald-50 text-emerald-600" : "bg-slate-100 text-slate-600"
                                          )}>{item.trend}</span>
                                        </div>
                                        {item.history && (
                                           <div className="h-[40px] w-full mt-1 opacity-70">
                                              <ResponsiveContainer width="100%" height="100%">
                                                <LineChart data={item.history}>
                                                  <Line 
                                                    type="monotone" 
                                                    dataKey="price" 
                                                    stroke={item.risk ? "#EF4444" : "#3B82F6"} 
                                                    strokeWidth={1.5}
                                                    dot={false}
                                                    isAnimationActive={false}
                                                  />
                                                  <YAxis domain={['dataMin', 'dataMax']} hide />
                                                </LineChart>
                                              </ResponsiveContainer>
                                           </div>
                                        )}
                                      </div>
                                    )
                                  })}
                                </div>
                             </div>
                           </div>
                        </div>
                      )}
                    </div>
                  )}

                </div>
              ) : selectedItem === '连锁客户数据采集' ? (
                <div className="flex flex-col gap-4 w-full flex-1 min-h-0">
                  <div className="grid grid-cols-4 gap-3 shrink-0">
                     <div className="bg-slate-50 border border-slate-100 rounded-lg p-3 flex flex-col gap-1 transition-all">
                       <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">已采集客户</span>
                       <span className="text-[20px] font-bold text-slate-800">{chainDataStats.customers}</span>
                     </div>
                     <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 flex flex-col gap-1 transition-all">
                       <span className="text-[10px] uppercase font-bold text-blue-600 tracking-wider">同步门店</span>
                       <span className="text-[20px] font-bold text-blue-700">{chainDataStats.stores.toLocaleString()}</span>
                     </div>
                     <div className="bg-orange-50 border border-orange-100 rounded-lg p-3 flex flex-col gap-1 transition-all">
                       <span className="text-[10px] uppercase font-bold text-orange-600 tracking-wider">高风险SKU</span>
                       <span className="text-[20px] font-bold text-orange-700">{chainDataStats.highRiskSku}</span>
                     </div>
                     <div className="bg-emerald-50 border border-emerald-100 rounded-lg p-3 flex flex-col gap-1 transition-all">
                       <span className="text-[10px] uppercase font-bold text-emerald-600 tracking-wider">AI分析任务</span>
                       <span className="text-[20px] font-bold text-emerald-700">{chainDataStats.tasks}</span>
                     </div>
                  </div>

                  <div className={cn("flex gap-4 min-h-0 relative transition-all duration-300", chainDataResults.length > 0 ? "h-[240px] shrink-0" : "flex-1")}>
                    <div className="w-[220px] shrink-0 border border-slate-200 rounded-lg bg-white px-5 py-3.5 flex flex-col justify-between relative shadow-sm z-0">
                      <div className="absolute left-[34px] top-7 bottom-7 w-[2px] bg-slate-100 -z-10 rounded-full overflow-hidden">
                         {isChainDataRunning && (
                           <motion.div 
                             className="w-full bg-blue-500 blur-[1px]"
                             animate={{ top: ['-20%', '120%'] }}
                             transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
                             style={{ height: '30%', position: 'absolute' }}
                           />
                         )}
                      </div>
                      
                      {['连接NKA/LKA门户', '采集采购数据', '同步库存报表', '抓取流向数据', 'AI分析动销趋势', '生成经营预警'].map((n, i) => {
                         const isCurrent = chainDataStep === i + 1 && isChainDataRunning;
                         const isCompleted = chainDataStep > i || (chainDataStep === 6 && chainDataComplete);
                         const finalGreen = chainDataComplete ? true : false;
                         
                         return (
                           <div key={i} className="flex items-center gap-3.5 relative">
                             <div className={cn(
                                 "w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all duration-300 z-10 bg-white shadow-sm shrink-0",
                                 finalGreen ? "border-emerald-500 text-emerald-500 bg-emerald-50" :
                                 isCompleted ? "border-emerald-500 text-emerald-500" : 
                                 isCurrent ? "border-blue-500 text-blue-600 bg-blue-50 shadow-[0_0_12px_rgba(59,130,246,0.3)] ring-2 ring-blue-100" : "border-slate-200 text-slate-400"
                               )}>
                               {finalGreen || isCompleted ? <Check className="w-4 h-4" /> : i + 1}
                             </div>
                             <span className={cn(
                               "text-[12px] transition-colors duration-300 leading-tight",
                               finalGreen ? "text-emerald-700 font-semibold" :
                               isCompleted ? "text-emerald-600 font-medium" :
                               isCurrent ? "text-blue-700 font-bold" : "text-slate-400"
                             )}>{n}</span>
                           </div>
                         );
                      })}
                    </div>

                    <div className="flex-1 bg-slate-900 rounded-lg overflow-hidden flex flex-col border border-slate-800 shadow-inner">
                      <div className="px-3 py-2 bg-slate-900 border-b border-slate-800 flex items-center justify-between shrink-0">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-slate-700"></div>
                          <span className="text-[10px] font-mono text-slate-400 ml-1">TERMINAL OUTPUT</span>
                        </div>
                        {isChainDataRunning && <Loader2 className="w-3.5 h-3.5 text-blue-400 animate-spin" />}
                      </div>
                      
                      <div className="p-4 overflow-y-auto font-mono text-[12px] flex-1 text-slate-300 leading-relaxed space-y-1.5 scroll-smooth">
                        {chainDataLogs.length === 0 && !isChainDataRunning && !chainDataComplete ? (
                          <div className="flex-1 flex items-center justify-center text-slate-600 font-sans text-[13px] h-full">
                            等待执行...
                          </div>
                        ) : (
                          <>
                            {chainDataLogs.map((log, i) => (
                              <motion.div 
                                key={i}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                className={cn(
                                  "break-all",
                                  log.includes('完成') || log.includes('成功') ? "text-emerald-400" :
                                  log.includes('AI') ? "text-blue-300" : "text-slate-300"
                                )}
                              >
                                {log}
                              </motion.div>
                            ))}
                          </>
                        )}
                        <div ref={priceTrendTerminalEndRef} />
                      </div>
                    </div>
                  </div>

                  {chainDataResults.length > 0 && (
                    <div className="flex gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500 min-h-[220px] shrink-0">
                      <div className={cn(
                        "flex flex-col bg-white border border-slate-200 rounded-lg shadow-sm transition-all duration-300 min-h-0 flex-1 overflow-hidden",
                        selectedChainDataRow !== null ? "w-[65%]" : "w-full"
                      )}>
                         <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between shrink-0">
                           <h4 className="text-[13px] font-semibold text-slate-800 flex items-center gap-1.5">
                             <FileText className="w-4 h-4 text-slate-500" />
                             连锁客户经营看板
                           </h4>
                         </div>
                         <div className="flex-1 overflow-y-auto custom-scrollbar">
                           <table className="w-full text-[12px] text-left border-collapse">
                             <thead className="bg-slate-50/50 sticky top-0 z-10 backdrop-blur-sm shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
                               <tr>
                                 <th className="px-4 py-2 font-medium text-slate-500 border-b border-slate-200">客户名称</th>
                                 <th className="px-4 py-2 font-medium text-slate-500 border-b border-slate-200">采购趋势</th>
                                 <th className="px-4 py-2 font-medium text-slate-500 border-b border-slate-200">库存天数</th>
                                 <th className="px-4 py-2 font-medium text-slate-500 border-b border-slate-200">纯销趋势</th>
                                 <th className="px-4 py-2 font-medium text-slate-500 border-b border-slate-200">风险状态</th>
                               </tr>
                             </thead>
                             <tbody>
                               {chainDataResults.map((item, idx) => (
                                 <tr 
                                   key={idx} 
                                   onClick={() => setSelectedChainDataRow(idx)}
                                   className={cn(
                                     "border-b border-slate-100 last:border-0 hover:bg-blue-50/50 cursor-pointer transition-colors",
                                     item.isAnomaly ? "bg-orange-50/40" : "",
                                     selectedChainDataRow === idx ? "bg-blue-50/80 shadow-[inset_2px_0_0_#3b82f6]" : ""
                                   )}
                                 >
                                   <td className="px-4 py-2.5 text-slate-800 font-medium">{item.name}</td>
                                   <td className={cn("px-4 py-2.5 font-mono", item.pur_trend.includes('↑') ? "text-emerald-600" : "text-red-500")}>{item.pur_trend}</td>
                                   <td className="px-4 py-2.5 text-slate-600 font-mono">{item.days}</td>
                                   <td className={cn("px-4 py-2.5 font-medium", item.sales_trend.includes('增长') ? "text-emerald-600" : item.sales_trend.includes('下降') ? "text-red-500" : "text-slate-500")}>{item.sales_trend}</td>
                                   <td className="px-4 py-2.5">
                                      <span className={cn(
                                        "px-2 py-0.5 rounded text-[11px] font-medium whitespace-nowrap",
                                        item.isAnomaly ? "bg-orange-100 text-orange-700" : "bg-slate-100 text-slate-600"
                                      )}>
                                        {item.status}
                                      </span>
                                   </td>
                                 </tr>
                               ))}
                             </tbody>
                           </table>
                         </div>
                      </div>

                      {selectedChainDataRow !== null && (
                        <div className="flex-shrink-0 flex flex-col bg-slate-50 border border-slate-200 rounded-lg shadow-sm animate-in slide-in-from-right-4 duration-300" style={{ width: '35%' }}>
                           <div className="px-4 py-2.5 bg-white border-b border-slate-200 flex items-center justify-between shrink-0 sticky top-0 z-20">
                             <h4 className="text-[13px] font-bold text-slate-800 flex items-center gap-2">
                               <TrendingUp className="w-4 h-4 text-blue-600" />
                               AI 经营分析
                             </h4>
                             <button 
                               onClick={(e) => { e.stopPropagation(); setSelectedChainDataRow(null); }}
                               className="text-slate-400 hover:text-slate-600 bg-white hover:bg-slate-100 p-1 rounded-md transition-colors border border-slate-200 shadow-sm"
                             >
                               <X className="w-4 h-4" />
                             </button>
                           </div>
                           <div className="flex flex-1 min-h-0 overflow-hidden">
                             <div className="w-full p-5 flex flex-col gap-3 overflow-y-auto bg-white">
                                <h5 className="font-bold text-[15px] text-slate-900 border-b border-slate-200 pb-2">{chainDataResults[selectedChainDataRow].name}</h5>
                                <p className="text-[13px] text-slate-700 leading-relaxed whitespace-pre-wrap mt-1">{chainDataResults[selectedChainDataRow].aiReason}</p>
                             </div>
                           </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    这是关于「<span className="font-semibold text-slate-700">{selectedItem}</span>」环节的实时运营指标和健康状况，您可以查看它在整体自动化链路中的表现。
                  </p>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                      <div className="text-[10px] font-medium text-slate-500 uppercase tracking-widest mb-1">今日运行次数</div>
                      <div className="text-xl font-semibold text-slate-800 tracking-tight">3,429</div>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                      <div className="text-[10px] font-medium text-slate-500 uppercase tracking-widest mb-1">自动化成功率</div>
                      <div className="text-xl font-semibold text-emerald-600 tracking-tight">99.8%</div>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                      <div className="text-[10px] font-medium text-slate-500 uppercase tracking-widest mb-1">累计节省工时</div>
                      <div className="text-xl font-semibold text-slate-800 tracking-tight">42.5h</div>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                      <div className="text-[10px] font-medium text-slate-500 uppercase tracking-widest mb-1">AI 模型参与度</div>
                      <div className="text-xl font-semibold text-purple-600 tracking-tight">85.0%</div>
                    </div>
                  </div>
                </>
              )}
            </div>
            <div className="px-5 py-3 border-t border-slate-100 bg-slate-50 shrink-0 rounded-b-xl relative z-0 flex flex-col gap-3">
              {showReviewInput && !isReviewSubmitted && (
                <div className="flex flex-col gap-2 animate-in fade-in slide-in-from-bottom-2">
                  <label className="text-[12px] font-medium text-slate-700">复核备注</label>
                  <textarea 
                    value={reviewRemark}
                    onChange={(e) => setReviewRemark(e.target.value)}
                    className="w-full text-[13px] border border-slate-200 bg-white rounded-md p-2.5 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 resize-none h-20 transition-all font-mono"
                    placeholder="请输入人工复核的意见、判定依据或下一步指示..."
                  />
                </div>
              )}
              {isReviewSubmitted && (
                <div className="bg-emerald-50 text-emerald-700 text-[13px] px-3 py-2.5 rounded-md border border-emerald-100 flex items-center gap-2 animate-in fade-in zoom-in-95">
                  <Check className="w-4 h-4" /> 
                  <span className="font-medium">人工复核要求已记录</span>，流程已转交至对应专员处理。
                </div>
              )}
<div className="flex justify-end gap-2 w-full">
                <button 
                  onClick={handleClose}
                  className="px-4 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 text-xs font-medium rounded-md transition-colors"
                >
                  {(selectedItem === '文献检索与初筛' && screeningResults) || (selectedItem === 'OOS/OOT异常监控' && oosComplete) || (selectedItem === '监管码采集上传' && traceCodeComplete) || (selectedItem === '药检网站信息抓取' && inspectionComplete) || (selectedItem === '价格趋势预测与采购时机决策' && priceTrendComplete) || (selectedItem === '连锁客户数据采集' && chainDataComplete) ? '关闭' : '取消'}
                </button>
                
                {selectedItem === '文献检索与初筛' ? (
                  screeningResults ? (
                    <button 
                      onClick={handleClose}
                      className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded-md transition-colors shadow-sm"
                    >
                      完成
                    </button>
                  ) : (
                    <button 
                      onClick={handleProcess}
                      disabled={isGenerating}
                      className="px-4 py-1.5 flex items-center justify-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded-md transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed min-w-[96px]"
                    >
                      {isGenerating ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> 处理中...</> : '进行文档初筛'}
                    </button>
                  )
                ) : selectedItem === 'OOS/OOT异常监控' ? (
                  oosComplete ? (
                    showReviewInput ? (
                      isReviewSubmitted ? (
                        <button 
                          onClick={handleClose}
                          className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded-md transition-colors shadow-sm"
                        >
                          完成
                        </button>
                      ) : (
                        <button 
                          onClick={() => {
                            setIsReviewSubmitted(true);
                            setOosLogs(prev => [...prev, `[SYSTEM] 发起联合评估。人工复核备注: ${reviewRemark || '无'}`]);
                          }}
                          className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded-md transition-colors shadow-sm"
                        >
                          提交复核
                        </button>
                      )
                    ) : (
                      <>
                        <button 
                          onClick={() => setShowReviewInput(true)}
                          className="px-4 py-1.5 bg-yellow-500 hover:bg-yellow-600 text-white text-xs font-medium rounded-md transition-colors shadow-sm"
                        >
                          发起人工复核
                        </button>
                        <button 
                          onClick={handleClose}
                          className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded-md transition-colors shadow-sm"
                        >
                          完成
                        </button>
                      </>
                    )
                  ) : (
                    <button 
                      onClick={handleProcessOos}
                      disabled={isOosRunning}
                      className="px-4 py-1.5 flex items-center justify-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded-md transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed min-w-[96px]"
                    >
                      {isOosRunning ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> 执行中...</> : '运行监控'}
                    </button>
                  )
                ) : selectedItem === '监管码采集上传' ? (
                  traceCodeComplete ? (
                    <button 
                      onClick={handleClose}
                      className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium rounded-md transition-colors shadow-sm"
                    >
                      处理完成
                    </button>
                  ) : (
                    <button 
                      onClick={handleProcessTraceCode}
                      disabled={isTraceCodeRunning}
                      className="px-4 py-1.5 flex items-center justify-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded-md transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed min-w-[120px]"
                    >
                      {isTraceCodeRunning ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> 执行中...</> : '开始采集与上传'}
                    </button>
                  )
                ) : selectedItem === '药检网站信息抓取' ? (
                  inspectionComplete ? (
                    <button 
                      onClick={handleClose}
                      className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium rounded-md transition-colors shadow-sm"
                    >
                      药检信息同步完成
                    </button>
                  ) : (
                    <button 
                      onClick={handleProcessInspectionInfo}
                      disabled={isInspectionRunning}
                      className="px-4 py-1.5 flex items-center justify-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded-md transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed min-w-[120px]"
                    >
                      {isInspectionRunning ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> 执行中...</> : '开始信息抓取'}
                    </button>
                  )
                ) : selectedItem === '创建生产订单' ? (
                  createOrderComplete ? (
                    <button 
                      onClick={handleClose}
                      className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium rounded-md transition-colors shadow-sm"
                    >
                      生产订单创建完成
                    </button>
                  ) : (
                    <button 
                      onClick={handleProcessCreateOrder}
                      disabled={isCreateOrderRunning || selectedProdOrders.length === 0}
                      className="px-4 py-1.5 flex items-center justify-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded-md transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed min-w-[120px]"
                    >
                      {isCreateOrderRunning ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> 执行中...</> : '开始创建生产订单'}
                    </button>
                  )
                ) : selectedItem === '价格趋势预测与采购时机决策' ? (
                  priceTrendComplete ? (
                    <button 
                      onClick={handleClose}
                      className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium rounded-md transition-colors shadow-sm"
                    >
                      价格趋势分析完成
                    </button>
                  ) : (
                    <button 
                      onClick={handleProcessPriceTrend}
                      disabled={isPriceTrendRunning}
                      className="px-4 py-1.5 flex items-center justify-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded-md transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed min-w-[120px]"
                    >
                      {isPriceTrendRunning ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> 市场价格监测中...</> : '价格趋势预测与采购决策'}
                    </button>
                  )
                ) : selectedItem === '连锁客户数据采集' ? (
                  chainDataComplete ? (
                    <button 
                      onClick={handleClose}
                      className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium rounded-md transition-colors shadow-sm"
                    >
                      渠道数据分析完成
                    </button>
                  ) : (
                    <button 
                      onClick={handleProcessChainData}
                      disabled={isChainDataRunning}
                      className="px-4 py-1.5 flex items-center justify-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded-md transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed min-w-[120px]"
                    >
                      {isChainDataRunning ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> 渠道动销分析中...</> : '连锁客户数据采集'}
                    </button>
                  )
                ) : (
                  <button 
                    onClick={handleClose}
                    className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded-md transition-colors shadow-sm min-w-[96px]"
                  >
                    查看完整报告
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Webhook Configuration Dialog */}
      {showWebhookDialog && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md flex flex-col transition-all duration-300 animate-in fade-in zoom-in-95">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50 shrink-0 rounded-t-xl z-20">
              <h3 className="text-[14px] font-semibold text-slate-800">配置 Webhook</h3>
              <button 
                onClick={() => setShowWebhookDialog(false)}
                className="text-slate-400 hover:text-slate-600 p-1 bg-white border border-slate-200 hover:bg-slate-100 rounded-md transition-colors shadow-sm"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-5 flex flex-col gap-4">
              <p className="text-xs text-slate-500 leading-relaxed">
                当前未检测到可用的默认 Webhook，请填写群机器人的 Webhook URL 后继续发送。填写后会保存在当前浏览器，后续可直接复用。
              </p>
              <div className="flex flex-col gap-2">
                <label className="text-[12px] font-medium text-slate-700">Webhook URL</label>
                <input 
                  type="text"
                  value={webhookUrl}
                  onChange={(e) => {
                    setWebhookUrl(e.target.value);
                    localStorage.setItem('alert_webhook_url', e.target.value);
                  }}
                  className="w-full text-[13px] border border-slate-200 bg-white rounded-md p-2.5 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-mono"
                  placeholder="https://open.feishu.cn/open-apis/bot/v2/hook/..."
                />
              </div>
            </div>
            <div className="px-5 py-3 border-t border-slate-100 bg-slate-50 flex justify-end gap-2 shrink-0 rounded-b-xl">
              <button 
                onClick={() => setShowWebhookDialog(false)}
                className="px-4 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 text-xs font-medium rounded-md transition-colors"
              >
                取消
              </button>
              <button 
                onClick={() => {
                  if (!webhookUrl || !isValidWebhook(webhookUrl)) {
                    alert('请输入有效的 Webhook 地址。');
                    return;
                  }
                  setShowWebhookDialog(false);
                  executeSendToGroup(webhookUrl);
                }}
                disabled={!webhookUrl}
                className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded-md transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                保存并发送
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
