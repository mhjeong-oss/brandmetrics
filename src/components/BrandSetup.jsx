import { useState, useRef, useCallback } from 'react';
import { Upload, Link, ArrowRight, FileText, X, CheckCircle, Loader2, Sun, Moon } from 'lucide-react';
import { saveBrandConfig } from '../utils/storage';
import { analyzeBrandURL, analyzeFile } from '../utils/gemini';

export default function BrandSetup({ onComplete, onBack, onToggleTheme, isDark }) {
  const [brandName, setBrandName] = useState('');
  const [description, setDescription] = useState('');
  const [url, setUrl] = useState('');
  const [urlAnalysis, setUrlAnalysis] = useState('');
  const [isAnalyzingUrl, setIsAnalyzingUrl] = useState(false);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [fileAnalysis, setFileAnalysis] = useState('');
  const [isAnalyzingFile, setIsAnalyzingFile] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const fileInputRef = useRef(null);

  const handleAnalyzeUrl = async () => {
    if (!url.trim()) return;
    setIsAnalyzingUrl(true);
    try {
      const analysis = await analyzeBrandURL(url.trim());
      setUrlAnalysis(analysis);
    } catch {
      setUrlAnalysis('URL 분석에 실패했습니다.');
    } finally {
      setIsAnalyzingUrl(false);
    }
  };

  const processFile = useCallback(async (file) => {
    const isAllowed = file.type === 'application/pdf' || file.name.endsWith('.md') || file.type === 'text/plain';
    if (!isAllowed) { alert('PDF 또는 MD 파일만 업로드 가능합니다.'); return; }
    setUploadedFile(file);
    setIsAnalyzingFile(true);
    setFileAnalysis('');
    try {
      let fileData, fileType;
      if (file.type === 'application/pdf') {
        const buffer = await file.arrayBuffer();
        const bytes = new Uint8Array(buffer);
        let binary = '';
        for (let i = 0; i < bytes.byteLength; i++) binary += String.fromCharCode(bytes[i]);
        fileData = btoa(binary);
        fileType = 'application/pdf';
      } else {
        fileData = await file.text();
        fileType = 'text/markdown';
      }
      const analysis = await analyzeFile(fileData, fileType);
      setFileAnalysis(analysis);
    } catch {
      setFileAnalysis('파일 분석에 실패했습니다.');
    } finally {
      setIsAnalyzingFile(false);
    }
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) processFile(file);
  }, [processFile]);

  const handleSubmit = async () => {
    if (!brandName.trim()) return;
    setIsSaving(true);
    const config = {
      name: brandName.trim(),
      description: description.trim(),
      url: url.trim(),
      urlAnalysis,
      uploadedFileName: uploadedFile?.name || '',
      fileAnalysis,
      createdAt: Date.now(),
    };
    saveBrandConfig(config);
    await new Promise(r => setTimeout(r, 400));
    onComplete(config);
  };

  const canSubmit = brandName.trim().length > 0 && !isAnalyzingUrl && !isAnalyzingFile && !isSaving;

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--bg)' }}>
      {/* Top nav */}
      <nav className="flex-shrink-0 h-14 flex items-center justify-between px-8 border-b border-black/[0.05]">
        <button
          onClick={onBack}
          className="font-serif text-lg text-black/90 tracking-tight hover:text-black/60 transition-colors"
        >
          BrandMetrics
        </button>
        <div className="flex items-center gap-3">
          {onToggleTheme && (
            <button
              onClick={onToggleTheme}
              className="p-2 rounded-xl hover:bg-black/5 text-black/30 hover:text-black/70 transition-colors"
              title={isDark ? '라이트 모드' : '다크 모드'}
            >
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
          )}
          <span className="label-cap text-black/40">Brand Setup</span>
        </div>
      </nav>

      {/* Content */}
      <div className="flex-1 flex min-h-0">

        {/* Left panel — editorial strip */}
        <div
          className="hidden md:flex flex-col justify-between w-[38%] px-10 py-14 border-r border-black/[0.05] relative overflow-hidden"
          style={{
            backgroundImage: 'url(/brand-setup-bg.jpg)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        >
          {/* Dark overlay for image legibility */}
          <div className="absolute inset-0" style={{ background: 'rgba(10,12,18,0.45)' }} />
          <div className="relative z-10">
            <p className="label-cap mb-8" style={{ color: 'rgba(255,255,255,0.55)' }}>01 / Brand Setup</p>

            <h1
              className="font-serif italic leading-[1.12] mb-5"
              style={{ fontSize: 'clamp(1.75rem, 2.8vw, 2.25rem)', color: 'rgba(255,255,255,0.92)', fontWeight: 400 }}
            >
              "Define your<br />brand identity."
            </h1>

            <p className="font-jakarta text-xs font-light leading-relaxed" style={{ color: 'rgba(255,255,255,0.60)' }}>
              Share your brand's core values —<br />
              we'll turn them into precise<br />
              marketing intelligence.
            </p>
          </div>

          <div className="relative z-10">
            <div className="w-6 h-px mb-5" style={{ background: 'rgba(255,255,255,0.25)' }} />
            <p className="font-jakarta text-[11px] font-light leading-relaxed" style={{ color: 'rgba(255,255,255,0.40)' }}>
              Stored locally only.<br />Never shared externally.
            </p>
          </div>
        </div>

        {/* Right panel — form */}
        <div className="flex-1 flex items-start justify-center px-6 lg:px-16 py-12 overflow-y-auto">
          <div className="w-full max-w-sm animate-slide-up">

            {/* Mobile heading */}
            <div className="lg:hidden mb-10">
              <p className="label-cap mb-4">01 / Brand Setup</p>
              <h1 className="font-serif italic leading-[1.1] mb-3 text-black/90" style={{ fontWeight: 400, fontSize: 'clamp(2rem, 7vw, 3rem)' }}>
                "Define your<br />brand identity."
              </h1>
              <p className="font-jakarta text-sm font-light text-black/35">
                Share your brand's story for better insights.
              </p>
            </div>

            <div className="space-y-6">
              {/* Brand Name */}
              <div>
                <label className="label-cap block mb-2.5">
                  브랜드명 <span className="normal-case text-key text-[10px] tracking-normal">*</span>
                </label>
                <input
                  type="text"
                  value={brandName}
                  onChange={e => setBrandName(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && canSubmit && handleSubmit()}
                  placeholder="Nike, 배달의민족, Notion..."
                  className="input-base"
                />
              </div>

              {/* Description */}
              <div>
                <label className="label-cap block mb-2.5">브랜드 소개</label>
                <textarea
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="핵심 가치, 타겟 고객, 주요 제품/서비스..."
                  rows={4}
                  className="input-base leading-relaxed"
                />
              </div>

              {/* Divider */}
              <div className="divider" />

              {/* URL */}
              <div>
                <label className="label-cap block mb-2.5">홈페이지 URL</label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={url}
                    onChange={e => { setUrl(e.target.value); setUrlAnalysis(''); }}
                    placeholder="https://yourbrand.com"
                    className="input-base flex-1"
                  />
                  <button
                    onClick={handleAnalyzeUrl}
                    disabled={!url.trim() || isAnalyzingUrl}
                    className="btn-ghost flex items-center gap-1.5 whitespace-nowrap text-xs px-3"
                  >
                    {isAnalyzingUrl
                      ? <Loader2 className="w-3 h-3 animate-spin" />
                      : <Link className="w-3 h-3" />}
                    분석
                  </button>
                </div>
                {urlAnalysis && (
                  <div className="mt-2.5 flex items-start gap-2 px-3 py-2.5 rounded-xl border" style={{ background: 'var(--surface2)', borderColor: 'var(--border)' }}>
                    <CheckCircle className="w-3.5 h-3.5 text-key mt-0.5 flex-shrink-0" />
                    <p className="text-xs text-black/40 leading-relaxed">{urlAnalysis}</p>
                  </div>
                )}
              </div>

              {/* File Upload */}
              <div>
                <label className="label-cap block mb-2.5">브랜드 문서 <span className="normal-case text-black/20 text-[10px] tracking-normal font-inter">(PDF, MD)</span></label>
                {!uploadedFile ? (
                  <div
                    onDrop={handleDrop}
                    onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
                    onDragLeave={() => setIsDragging(false)}
                    onClick={() => fileInputRef.current?.click()}
                    className="border border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-200"
                    style={{
                      borderColor: isDragging ? 'rgba(213,41,42,0.4)' : 'var(--border)',
                      background: isDragging ? 'rgba(213,41,42,0.04)' : 'transparent',
                    }}
                  >
                    <Upload className="w-4 h-4 text-black/20 mx-auto mb-2.5" />
                    <p className="text-sm text-black/30">
                      드래그하거나 <span className="text-black/55">클릭</span>해서 업로드
                    </p>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".pdf,.md,.txt"
                      className="hidden"
                      onChange={e => { if (e.target.files[0]) processFile(e.target.files[0]); }}
                    />
                  </div>
                ) : (
                  <div className="rounded-xl p-4 border border-black/[0.06]" style={{ background: 'var(--surface2)' }}>
                    <div className="flex items-center gap-3">
                      <FileText className="w-4 h-4 text-black/25 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-black/60 truncate">{uploadedFile.name}</p>
                        <p className="text-xs text-black/20 mt-0.5 font-inter">{(uploadedFile.size / 1024).toFixed(1)} KB</p>
                      </div>
                      {isAnalyzingFile
                        ? <Loader2 className="w-3.5 h-3.5 text-black/25 animate-spin flex-shrink-0" />
                        : <button onClick={() => { setUploadedFile(null); setFileAnalysis(''); }} className="text-black/20 hover:text-black/50 transition-colors"><X className="w-3.5 h-3.5" /></button>
                      }
                    </div>
                    {fileAnalysis && (
                      <p className="text-xs text-black/30 leading-relaxed mt-3 pt-3 border-t border-black/[0.05]">{fileAnalysis}</p>
                    )}
                    {isAnalyzingFile && (
                      <div className="flex items-center gap-1.5 mt-3">
                        {[0,1,2].map(i => (
                          <span key={i} className="w-1 h-1 bg-black/30 rounded-full dot-bounce" style={{ animationDelay: `${i * 200}ms` }} />
                        ))}
                        <span className="text-xs text-black/25 ml-1">분석 중...</span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Submit */}
              <button
                onClick={handleSubmit}
                disabled={!canSubmit}
                className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl text-sm font-medium transition-all duration-200"
                style={{
                  background: canSubmit ? '#D5292A' : 'rgba(0,0,0,0.05)',
                  color: canSubmit ? '#fff' : 'rgba(26,26,24,0.2)',
                  cursor: canSubmit ? 'pointer' : 'default',
                }}
              >
                {isSaving ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /><span>시작하는 중</span></>
                ) : (
                  <><span>시작하기</span><ArrowRight className="w-4 h-4" /></>
                )}
              </button>

              <p className="text-center text-xs text-black/15">
                설정은 언제든지 변경할 수 있습니다
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
