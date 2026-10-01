'use client';

import React, { useEffect, useState, useRef, useCallback } from 'react';
import {
    IScenario,
    IWalkthroughStep,
    SCENARIOS,
    ARCH_NODES,
    IArchNode,
    FLUENCY_QUADRANTS,
    IFluencyQuadrant,
    AUTONOMY_LEVELS,
    IAutonomyLevel,
    DORA_METRICS_DATA,
    IDoraMetricModel,
    PDLC_CYCLE_DATA,
    EARNED_TRUST_SPECTRUM,
    IEarnedTrustItem,
    CAPABILITY_DIMENSIONS,
    ICapabilityDimension,
    CONDUCT_DIMENSIONS,
    IConductDimension,
    RESEARCH_SOURCES,
    IResearchPaper,
} from './model/antharaArchitecture';

interface IAntharaSidebarProps {
    currentScenario: IScenario;
    onSelectScenario: (scenario: IScenario) => void;
    activeStepIndex: number;
    onChangeStepIndex: (index: number) => void;
    onSelectNode: (node: IArchNode) => void;
}

type SidebarTab = 'walkthrough' | 'matrix' | 'autonomy' | 'pdlc' | 'research';

export function AntharaSidebar({
    currentScenario,
    onSelectScenario,
    activeStepIndex,
    onChangeStepIndex,
    onSelectNode,
}: IAntharaSidebarProps) {
    const [activeTab, setActiveTab] = useState<SidebarTab>('walkthrough');
    const [isPlaying, setIsPlaying] = useState<boolean>(false);
    const [playbackProgress, setPlaybackProgress] = useState<number>(0);
    const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
    const [selectedQuadrant, setSelectedQuadrant] = useState<IFluencyQuadrant>(FLUENCY_QUADRANTS[0]);
    const [selectedTrustItem, setSelectedTrustItem] = useState<IEarnedTrustItem>(EARNED_TRUST_SPECTRUM[1]);
    const [selectedAutonomyLevel, setSelectedAutonomyLevel] = useState<number>(4);
    const [showCompressedPdlc, setShowCompressedPdlc] = useState<boolean>(true);
    const [researchSubTab, setResearchSubTab] = useState<'stack' | 'capability' | 'conduct' | 'citations'>('stack');
    const [selectedCapIndex, setSelectedCapIndex] = useState<number>(0);
    const [selectedCondIndex, setSelectedCondIndex] = useState<number>(0);

    const stepCount = currentScenario.steps.length;
    const currentStep: IWalkthroughStep = currentScenario.steps[activeStepIndex] || currentScenario.steps[0];
    const isAtEnd = activeStepIndex >= stepCount - 1;

    // Stable references to avoid resetting auto-advance timers on parent re-renders
    const activeIndexRef = useRef(activeStepIndex);
    activeIndexRef.current = activeStepIndex;
    const stepCountRef = useRef(stepCount);
    stepCountRef.current = stepCount;
    const onChangeStepRef = useRef(onChangeStepIndex);
    onChangeStepRef.current = onChangeStepIndex;
    const isPlayingRef = useRef(isPlaying);
    isPlayingRef.current = isPlaying;

    const stepDuration = Math.round(3500 / playbackSpeed);

    // Reliable auto-advance ticker with live progress bar (runs smoothly every 50ms)
    useEffect(() => {
        if (!isPlaying || activeTab !== 'walkthrough') {
            setPlaybackProgress(0);
            return;
        }

        const tickInterval = 50;
        let elapsed = 0;

        const interval = setInterval(() => {
            elapsed += tickInterval;
            const pct = Math.min(100, Math.round((elapsed / stepDuration) * 100));
            setPlaybackProgress(pct);

            if (elapsed >= stepDuration) {
                elapsed = 0;
                setPlaybackProgress(0);

                const currentIdx = activeIndexRef.current;
                const total = stepCountRef.current;

                if (currentIdx >= total - 1) {
                    setIsPlaying(false);
                } else {
                    onChangeStepRef.current(currentIdx + 1);
                }
            }
        }, tickInterval);

        return () => clearInterval(interval);
    }, [isPlaying, activeTab, stepDuration]);

    const handleTogglePlay = useCallback(() => {
        if (isPlayingRef.current) {
            setIsPlaying(false);
            setPlaybackProgress(0);
        } else {
            if (activeIndexRef.current >= stepCountRef.current - 1) {
                onChangeStepRef.current(0);
            }
            setPlaybackProgress(0);
            setIsPlaying(true);
        }
    }, []);

    // Keyboard navigation
    useEffect(() => {
        function handleKeyDown(e: KeyboardEvent) {
            if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
            if (e.key === ' ' || e.code === 'Space') {
                e.preventDefault();
                handleTogglePlay();
            } else if (e.key === 'ArrowRight' || e.key === 'd') {
                e.preventDefault();
                setIsPlaying(false);
                setPlaybackProgress(0);
                const currentIdx = activeIndexRef.current;
                const total = stepCountRef.current;
                onChangeStepRef.current(Math.min(currentIdx + 1, total - 1));
            } else if (e.key === 'ArrowLeft' || e.key === 'a') {
                e.preventDefault();
                setIsPlaying(false);
                setPlaybackProgress(0);
                const currentIdx = activeIndexRef.current;
                onChangeStepRef.current(Math.max(currentIdx - 1, 0));
            }
        }
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [handleTogglePlay]);

    return (
        <div className="flex flex-col h-full bg-white border-r border-slate-200 text-slate-800 select-none overflow-hidden font-sans">
            {/* ── Brand Header ──────────────────────────────────── */}
            <div className="px-4 pt-3.5 pb-2.5 border-b border-slate-200 bg-white shrink-0">
                <div className="flex items-start justify-between gap-2">
                    <div>
                        <div className="flex items-center gap-1.5 mb-1">
                            <div className="w-2.5 h-2.5 rounded-xs bg-sky-600 shadow-xs" />
                            <span className="text-[11px] font-mono font-bold tracking-widest uppercase text-slate-500">
                                Incubyte & Anthara · Whitepaper Architecture
                            </span>
                        </div>
                        <h1 className="text-[17px] font-bold text-slate-900 leading-tight tracking-tight">
                            The AI-Fluent PDLC
                        </h1>
                        <p className="text-[13px] text-slate-600 mt-0.5 leading-snug">
                            Compressing the 94% delivery cycle without losing trust in what ships.
                        </p>
                    </div>
                    <span className="shrink-0 text-[12px] font-mono px-2.5 py-0.5 rounded-full bg-sky-50 text-sky-700 border border-sky-200 font-semibold whitespace-nowrap mt-0.5">
                        Conduct Layer 3D
                    </span>
                </div>

                {/* ── Top Navigation Tabs ────────────────────────── */}
                <div className="flex items-center gap-1 mt-2.5 p-1 bg-slate-100 rounded-lg border border-slate-200 text-[11px] font-semibold">
                    <button
                        onClick={() => setActiveTab('walkthrough')}
                        className={`flex-1 py-1.5 px-1 rounded-md transition text-center whitespace-nowrap ${activeTab === 'walkthrough'
                            ? 'bg-white text-slate-900 shadow-xs border border-slate-200/80 font-bold'
                            : 'text-slate-600 hover:text-slate-900'
                            }`}
                        title="3D Walkthrough"
                    >
                        Walkthrough
                    </button>
                    <button
                        onClick={() => setActiveTab('matrix')}
                        className={`flex-1 py-1.5 px-1 rounded-md transition text-center whitespace-nowrap ${activeTab === 'matrix'
                            ? 'bg-white text-slate-900 shadow-xs border border-slate-200/80 font-bold'
                            : 'text-slate-600 hover:text-slate-900'
                            }`}
                        title="Fluency Matrix & Earned Trust"
                    >
                        Matrix
                    </button>
                    <button
                        onClick={() => setActiveTab('autonomy')}
                        className={`flex-1 py-1.5 px-1 rounded-md transition text-center whitespace-nowrap ${activeTab === 'autonomy'
                            ? 'bg-white text-slate-900 shadow-xs border border-slate-200/80 font-bold'
                            : 'text-slate-600 hover:text-slate-900'
                            }`}
                        title="5 Levels of AI Autonomy"
                    >
                        5 Levels
                    </button>
                    <button
                        onClick={() => setActiveTab('pdlc')}
                        className={`flex-1 py-1.5 px-1 rounded-md transition text-center whitespace-nowrap ${activeTab === 'pdlc'
                            ? 'bg-white text-slate-900 shadow-xs border border-slate-200/80 font-bold'
                            : 'text-slate-600 hover:text-slate-900'
                            }`}
                        title="11.7w Delivery Cycle & DORA Metrics"
                    >
                        Cycle
                    </button>
                    <button
                        onClick={() => setActiveTab('research')}
                        className={`flex-1 py-1.5 px-1 rounded-md transition text-center whitespace-nowrap ${activeTab === 'research'
                            ? 'bg-white text-slate-900 shadow-xs border border-slate-200/80 font-bold'
                            : 'text-slate-600 hover:text-slate-900'
                            }`}
                        title="Methodology, Stack & 13 Sources"
                    >
                        Research
                    </button>
                </div>
            </div>

            {/* ── Scrollable Body per Tab ─────────────────────────── */}
            <div className="flex-1 overflow-y-auto">
                {/* ═══════════════════════════════════════════════════════ */}
                {/* ── TAB 1: 3D WALKTHROUGH ─────────────────────────── */}
                {/* ═══════════════════════════════════════════════════════ */}
                {activeTab === 'walkthrough' && (
                    <div className="p-3.5 space-y-3.5">
                        {/* Scenario Selector */}
                        <div>
                            <div className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mb-1.5 font-mono">
                                Select Conduct Scenario
                            </div>
                            <div className="space-y-1.5">
                                {SCENARIOS.map((sc) => {
                                    const isSelected = sc.id === currentScenario.id;
                                    return (
                                        <button
                                            key={sc.id}
                                            onClick={() => {
                                                setIsPlaying(false);
                                                onSelectScenario(sc);
                                                onChangeStepIndex(0);
                                            }}
                                            className={`w-full text-left px-3 py-2.5 rounded-lg transition border ${isSelected
                                                ? 'bg-sky-50 border-sky-300 text-sky-950 font-medium shadow-sm'
                                                : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700'
                                                }`}
                                        >
                                            <div className="flex items-center justify-between">
                                                <span className="font-bold truncate pr-2 text-[14px]">{sc.name}</span>
                                                {isSelected && <span className="w-2.5 h-2.5 rounded-full bg-sky-600 shrink-0" />}
                                            </div>
                                            <div className="text-[13px] text-slate-600 mt-1 line-clamp-1">{sc.shortDesc}</div>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Transport / Phase Player */}
                        <div className="p-3 rounded-lg border border-slate-200 bg-slate-50/90 shadow-xs">
                            <div className="flex items-center justify-between mb-1.5">
                                <span className="text-[12px] font-mono text-slate-800 font-bold">
                                    PHASE {activeStepIndex + 1} OF {stepCount}
                                </span>
                                <span className="text-[12px] font-mono text-slate-500 font-semibold">
                                    {Math.round(((activeStepIndex + 1) / stepCount) * 100)}%
                                </span>
                            </div>

                            {/* Step Segment Indicators */}
                            <div className="flex items-center gap-1 mb-2.5">
                                {currentScenario.steps.map((step, idx) => {
                                    const isCurrent = idx === activeStepIndex;
                                    const isPast = idx < activeStepIndex;
                                    return (
                                        <button
                                            key={step.id}
                                            onClick={() => {
                                                setIsPlaying(false);
                                                setPlaybackProgress(0);
                                                onChangeStepIndex(idx);
                                            }}
                                            className="relative flex-1 h-2 rounded-full overflow-hidden transition-all bg-slate-200 hover:bg-slate-300 cursor-pointer"
                                            title={`Step ${idx + 1}: ${step.title}`}
                                        >
                                            {isPast && <div className="absolute inset-0 bg-sky-500 rounded-full" />}
                                            {isCurrent && (
                                                <div
                                                    className="absolute inset-0 bg-sky-600 rounded-full transition-all duration-75"
                                                    style={{
                                                        width: isPlaying ? `${Math.max(10, playbackProgress)}%` : '100%',
                                                    }}
                                                />
                                            )}
                                        </button>
                                    );
                                })}
                            </div>

                            {/* Control Buttons */}
                            <div className="flex items-center justify-between gap-1.5">
                                <button
                                    onClick={() => {
                                        setIsPlaying(false);
                                        setPlaybackProgress(0);
                                        onChangeStepIndex(Math.max(activeStepIndex - 1, 0));
                                    }}
                                    disabled={activeStepIndex === 0}
                                    className="px-3 py-1.5 rounded bg-white hover:bg-slate-100 disabled:opacity-30 disabled:pointer-events-none text-[13px] text-slate-700 border border-slate-200 transition font-medium cursor-pointer"
                                >
                                    ◀ Prev
                                </button>
                                <button
                                    onClick={handleTogglePlay}
                                    className={`relative overflow-hidden flex-1 py-1.5 rounded text-[13px] font-bold uppercase tracking-wider transition border cursor-pointer select-none ${isPlaying
                                        ? 'bg-sky-50 border-sky-300 text-sky-900 shadow-xs'
                                        : isAtEnd
                                            ? 'bg-amber-500 border-amber-600 text-white hover:bg-amber-600'
                                            : 'bg-slate-900 border-slate-900 text-white hover:bg-slate-800'
                                        }`}
                                >
                                    {/* Live progress fill when playing */}
                                    {isPlaying && (
                                        <div
                                            className="absolute inset-y-0 left-0 bg-sky-200/60 pointer-events-none transition-all duration-75"
                                            style={{ width: `${playbackProgress}%` }}
                                        />
                                    )}
                                    <span className="relative z-10 flex items-center justify-center gap-1.5">
                                        {isPlaying ? (
                                            <>
                                                <span>⏸</span>
                                                <span>Pause</span>
                                            </>
                                        ) : isAtEnd ? (
                                            <>
                                                <span>↺</span>
                                                <span>Replay</span>
                                            </>
                                        ) : (
                                            <>
                                                <span>▶</span>
                                                <span>Play</span>
                                            </>
                                        )}
                                    </span>
                                </button>
                                <button
                                    onClick={() => {
                                        setIsPlaying(false);
                                        setPlaybackProgress(0);
                                        onChangeStepIndex(Math.min(activeStepIndex + 1, stepCount - 1));
                                    }}
                                    disabled={activeStepIndex === stepCount - 1}
                                    className="px-3 py-1.5 rounded bg-white hover:bg-slate-100 disabled:opacity-30 disabled:pointer-events-none text-[13px] text-slate-700 border border-slate-200 transition font-medium cursor-pointer"
                                >
                                    Next ▶
                                </button>

                                {/* Speed toggle (1x / 1.5x / 2x) */}
                                <button
                                    onClick={() => setPlaybackSpeed((s) => (s === 1 ? 1.5 : s === 1.5 ? 2 : 1))}
                                    className="px-2.5 py-1.5 rounded bg-white hover:bg-slate-100 border border-slate-200 text-[12px] font-mono font-bold text-slate-700 transition cursor-pointer"
                                    title="Playback Speed"
                                >
                                    {playbackSpeed}x
                                </button>
                            </div>
                        </div>

                        {/* Step Details & Explanation */}
                        <div className="space-y-3">
                            <div>
                                <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                                    {currentStep.badgeText && (
                                        <span
                                            className={`text-[12px] font-mono px-2.5 py-0.5 rounded border font-bold ${currentStep.badgeType === 'danger'
                                                ? 'bg-rose-50 text-rose-700 border-rose-200'
                                                : currentStep.badgeType === 'warning'
                                                    ? 'bg-amber-50 text-amber-800 border-amber-200'
                                                    : currentStep.badgeType === 'success'
                                                        ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                                        : 'bg-slate-100 text-slate-700 border-slate-200'
                                                }`}
                                        >
                                            {currentStep.badgeText}
                                        </span>
                                    )}
                                    <span className="text-[12px] text-slate-500 font-mono font-medium">
                                        {currentStep.tierId.replace('tier_', 'LAYER: ').toUpperCase()}
                                    </span>
                                </div>
                                <h2 className="text-[16px] font-bold text-slate-900 tracking-tight leading-snug mb-2">
                                    {currentStep.title}
                                </h2>
                            </div>

                            <p className="text-[14px] text-slate-700 leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-200">
                                {currentStep.explanation}
                            </p>

                            {/* Live Code / Payload Stream */}
                            {currentStep.codeSnippet && (
                                <div>
                                    <div className="text-[11px] font-bold text-slate-400 mb-1 font-mono flex items-center justify-between">
                                        <span>IN-FLIGHT CODE STREAM</span>
                                        <span className="text-emerald-600 font-semibold flex items-center gap-1">
                                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                            Live Wire
                                        </span>
                                    </div>
                                    <pre className="text-[12px] font-mono bg-slate-900 p-3 rounded-lg border border-slate-800 text-emerald-400 overflow-x-auto whitespace-pre-wrap leading-relaxed max-h-44">
                                        {currentStep.codeSnippet}
                                    </pre>
                                </div>
                            )}

                            {/* Active Architecture Modules */}
                            <div>
                                <div className="text-[11px] font-bold text-slate-400 mb-1.5 uppercase tracking-wider font-mono">
                                    Active Architecture Modules
                                </div>
                                <div className="space-y-1.5">
                                    {currentStep.activeNodeIds.map((nodeId) => {
                                        const node = ARCH_NODES.find((n) => n.id === nodeId);
                                        if (!node) return null;
                                        return (
                                            <button
                                                key={node.id}
                                                onClick={() => onSelectNode(node)}
                                                className="w-full text-left p-2.5 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 hover:border-slate-300 transition flex items-center justify-between group"
                                            >
                                                <div className="flex items-center gap-2">
                                                    <div
                                                        className="w-2.5 h-2.5 rounded-xs shrink-0"
                                                        style={{ backgroundColor: node.accentColor }}
                                                    />
                                                    <div>
                                                        <div className="text-[13px] font-semibold text-slate-800 group-hover:text-slate-950">
                                                            {node.title}
                                                        </div>
                                                        <div className="text-[12px] text-slate-500">{node.subtitle}</div>
                                                    </div>
                                                </div>
                                                <span className="text-[12px] text-slate-400 group-hover:text-slate-700 font-medium shrink-0 ml-1">
                                                    Inspect ➔
                                                </span>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Whitepaper Context Callout */}
                            <OurTake>
                                Conduct has to live at the point of generation, not at the time of PR reviews or quarterly audits. Live write-time evaluation lets you compress review cycles without increasing delivery instability.
                            </OurTake>
                        </div>
                    </div>
                )}

                {/* ═══════════════════════════════════════════════════════ */}
                {/* ── TAB 2: FLUENCY MATRIX (2x2) & EARNED TRUST ────── */}
                {/* ═══════════════════════════════════════════════════════ */}
                {activeTab === 'matrix' && (
                    <div className="p-3.5 space-y-3.5">
                        <div>
                            <div className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-400">
                                Chapter 06 · Reading Your Fluency (Pages 14-16)
                            </div>
                            <h3 className="text-[17px] font-bold text-slate-900 mt-1">Flow vs. Earned Trust</h3>
                            <p className="text-[14px] text-slate-700 mt-1 leading-relaxed">
                                Fluency has two axes: how fast you move across the cycle (<strong>Flow</strong>), and how much of your trust AI has earned (<strong>Earned Trust</strong>).
                            </p>
                        </div>

                        {/* Interactive 2x2 Matrix */}
                        <div className="grid grid-cols-2 gap-2">
                            {FLUENCY_QUADRANTS.map((quad) => {
                                const isSelected = selectedQuadrant.id === quad.id;
                                return (
                                    <button
                                        key={quad.id}
                                        onClick={() => setSelectedQuadrant(quad)}
                                        className={`text-left p-3 rounded-lg border transition relative cursor-pointer ${isSelected
                                            ? `${quad.bg} ${quad.border} shadow-sm ring-2 ring-sky-500/30`
                                            : 'bg-slate-50 hover:bg-slate-100 border-slate-200'
                                            }`}
                                    >
                                        <div className="flex items-center justify-between mb-1">
                                            <span className="text-[15px] font-bold" style={{ color: quad.color }}>
                                                {quad.title}
                                            </span>
                                            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded border bg-white/90 text-slate-700 font-semibold">
                                                {quad.tag}
                                            </span>
                                        </div>
                                        <div className="text-[13px] text-slate-700 font-medium leading-tight">{quad.subtitle}</div>
                                        <div className="mt-2.5 flex items-center gap-2 text-[11px] font-mono text-slate-500 font-medium">
                                            <span>Flow: {quad.flow}</span>
                                            <span>•</span>
                                            <span>Trust: {quad.trust}</span>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>

                        {/* Quadrant Deep-Dive Card */}
                        <div className={`p-4 rounded-lg border ${selectedQuadrant.bg} ${selectedQuadrant.border} space-y-3`}>
                            <div className="flex items-center justify-between">
                                <h4 className="text-[16px] font-bold text-slate-900">{selectedQuadrant.title}</h4>
                                <span className="text-[12px] font-mono font-bold px-2 py-0.5 rounded bg-white text-slate-700 border border-slate-200">
                                    {selectedQuadrant.tag}
                                </span>
                            </div>

                            <p className="text-[14px] text-slate-800 leading-relaxed font-normal">{selectedQuadrant.description}</p>

                            <div>
                                <div className="text-[11px] font-bold font-mono text-slate-600 uppercase tracking-wider mb-1.5">
                                    Observed Symptoms:
                                </div>
                                <ul className="space-y-1.5">
                                    {selectedQuadrant.symptoms.map((sym, idx) => (
                                        <li key={idx} className="text-[13px] text-slate-700 flex items-start gap-2 leading-snug">
                                            <span className="text-slate-400 shrink-0 font-bold">•</span>
                                            <span>{sym}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <div className="pt-2 border-t border-slate-200/80">
                                <div className="text-[11px] font-bold font-mono text-rose-700 uppercase tracking-wider mb-0.5">
                                    Enterprise Risk:
                                </div>
                                <p className="text-[13px] text-rose-950 leading-snug font-medium">{selectedQuadrant.risk}</p>
                            </div>

                            <div className="pt-2 border-t border-slate-200/80 bg-white/80 p-3 rounded-lg border border-slate-200">
                                <div className="text-[11px] font-bold font-mono text-sky-700 uppercase tracking-wider mb-0.5">
                                    Anthara Conduct Remedy:
                                </div>
                                <p className="text-[13px] text-slate-800 leading-snug">{selectedQuadrant.conductRemedy}</p>
                            </div>
                        </div>

                        {/* ── Earned Trust Calibration Spectrum (Page 16) ──── */}
                        <div className="p-3.5 rounded-lg border border-slate-200 bg-slate-50 space-y-3">
                            <div className="flex items-center justify-between">
                                <div>
                                    <div className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-400">
                                        Page 16 · Earned Trust Spectrum
                                    </div>
                                    <h4 className="text-[15px] font-bold text-slate-900 mt-0.5">Confidence That Matches Reality</h4>
                                </div>
                                <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold border border-emerald-200">
                                    Calibration
                                </span>
                            </div>

                            <p className="text-[13px] text-slate-600 leading-snug">
                                Confidence on its own tells you nothing. What matters is whether that confidence is calibrated: whether what the team believes matches what the code actually does.
                            </p>

                            {/* Spectrum Selector Tabs */}
                            <div className="grid grid-cols-3 gap-1.5">
                                {EARNED_TRUST_SPECTRUM.map((item) => {
                                    const isSel = selectedTrustItem.id === item.id;
                                    return (
                                        <button
                                            key={item.id}
                                            onClick={() => setSelectedTrustItem(item)}
                                            className={`p-2 rounded-lg border text-left transition cursor-pointer ${isSel
                                                ? `${item.bg} ${item.border} ring-2 ring-sky-500/20 shadow-xs font-semibold`
                                                : 'bg-white hover:bg-slate-100 border-slate-200'
                                                }`}
                                        >
                                            <div className="text-[13px] font-bold" style={{ color: item.color }}>
                                                {item.title}
                                            </div>
                                            <div className="text-[10px] font-mono text-slate-500 mt-0.5">
                                                {item.formula}
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>

                            {/* Active Trust Item Details */}
                            <div className={`p-3 rounded-lg border ${selectedTrustItem.bg} ${selectedTrustItem.border}`}>
                                <div className="flex items-center justify-between mb-1">
                                    <span className="text-[14px] font-bold" style={{ color: selectedTrustItem.color }}>
                                        {selectedTrustItem.title}
                                    </span>
                                    <span className="text-[11px] font-mono font-bold px-1.5 py-0.5 rounded bg-white text-slate-700 border border-slate-200">
                                        {selectedTrustItem.formula}
                                    </span>
                                </div>
                                <div className="text-[13px] font-semibold text-slate-800 mb-1">
                                    "{selectedTrustItem.tagline}"
                                </div>
                                <p className="text-[13px] text-slate-700 leading-snug">
                                    {selectedTrustItem.description}
                                </p>
                            </div>
                        </div>

                        {/* Our Take from Whitepaper Page 16 */}
                        <OurTake>
                            You reach the top-right by building capability and enforcing conduct as AI works across the cycle. They’re the only levers that move flow and trust together, faster delivery you don’t have to second-guess.
                        </OurTake>
                    </div>
                )}

                {/* ═══════════════════════════════════════════════════════ */}
                {/* ── TAB 3: 5 AUTONOMY LEVELS (Page 15-16) ─────────── */}
                {/* ═══════════════════════════════════════════════════════ */}
                {activeTab === 'autonomy' && (
                    <div className="p-3.5 space-y-3.5">
                        <div>
                            <div className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-400">
                                Chapter 06 · Lifecycle Progression (Pages 15-16)
                            </div>
                            <h3 className="text-[17px] font-bold text-slate-900 mt-1">5 Levels of AI Autonomy</h3>
                            <p className="text-[14px] text-slate-700 mt-1 leading-relaxed">
                                As AI climbs the levels, it covers more of the delivery cycle. Work is in flow when a unit of work moves without stalling.
                            </p>
                        </div>

                        {/* Key Callout from Page 16 */}
                        <div className="p-3 rounded-lg bg-sky-50 border border-sky-200">
                            <div className="flex items-center gap-1.5 text-[12px] font-mono font-bold text-sky-800 uppercase tracking-wider mb-1">
                                <span>🚀</span> Critical Whitepaper Finding
                            </div>
                            <p className="text-[13px] text-sky-950 font-medium leading-snug">
                                <strong>The jump from Level 3 to Level 4</strong> is the one that has the highest impact on compressing the delivery cycle.
                            </p>
                        </div>

                        {/* Full 6-Stage x 5-Level Visual Table (Verbatim Page 16) */}
                        <div className="border border-slate-200 rounded-lg overflow-hidden bg-white shadow-xs">
                            <div className="p-2.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                                <span className="text-[12px] font-bold text-slate-800 uppercase font-mono">
                                    Lifecycle Coverage Matrix
                                </span>
                                <div className="flex items-center gap-2 text-[10px] font-mono">
                                    <span className="flex items-center gap-1">
                                        <span className="w-2 h-2 rounded-full bg-slate-300" />
                                        Not yet
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <span className="w-2 h-2 rounded-full bg-amber-400" />
                                        AI assists
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <span className="w-2 h-2 rounded-full bg-emerald-600" />
                                        AI owns it
                                    </span>
                                </div>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse text-[12px]">
                                    <thead>
                                        <tr className="border-b border-slate-200 bg-slate-50/70">
                                            <th className="py-2 px-2.5 font-bold text-slate-600">Stage</th>
                                            {AUTONOMY_LEVELS.map((lvl) => (
                                                <th
                                                    key={lvl.level}
                                                    onClick={() => setSelectedAutonomyLevel(lvl.level)}
                                                    className={`py-2 px-1.5 text-center font-mono cursor-pointer transition ${selectedAutonomyLevel === lvl.level
                                                        ? 'bg-sky-100 text-sky-900 font-bold border-b-2 border-sky-600'
                                                        : 'text-slate-700 hover:bg-slate-100'
                                                        }`}
                                                >
                                                    <div>L{lvl.level}</div>
                                                    <div className="text-[10px] font-normal text-slate-500 truncate max-w-[65px]">
                                                        {lvl.title.replace('Level ' + lvl.level + ': ', '')}
                                                    </div>
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {[
                                            { key: 'intake', label: 'Intake' },
                                            { key: 'spec', label: 'Spec & estimate' },
                                            { key: 'coding', label: 'Coding' },
                                            { key: 'review', label: 'Code review' },
                                            { key: 'qa', label: 'QA & testing' },
                                            { key: 'deployment', label: 'Deployment' },
                                        ].map((stageRow) => (
                                            <tr key={stageRow.key} className="hover:bg-slate-50/60">
                                                <td className="py-2 px-2.5 font-medium text-slate-800 whitespace-nowrap">
                                                    {stageRow.label}
                                                </td>
                                                {AUTONOMY_LEVELS.map((lvl) => {
                                                    const status = (lvl.stages as any)[stageRow.key];
                                                    const isHighlightedCol = selectedAutonomyLevel === lvl.level;
                                                    return (
                                                        <td
                                                            key={lvl.level}
                                                            onClick={() => setSelectedAutonomyLevel(lvl.level)}
                                                            className={`py-2 px-1 text-center cursor-pointer ${isHighlightedCol ? 'bg-sky-50/50' : ''
                                                                }`}
                                                        >
                                                            {status === 'owns' ? (
                                                                <span className="inline-block w-4 h-4 rounded-full bg-emerald-600 shadow-xs" title="AI owns it" />
                                                            ) : status === 'assist' ? (
                                                                <span className="inline-block w-4 h-4 rounded-full bg-amber-400 shadow-xs" title="AI assists" />
                                                            ) : (
                                                                <span className="inline-block w-4 h-4 rounded-full bg-slate-200" title="Not yet" />
                                                            )}
                                                        </td>
                                                    );
                                                })}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Level Selector Tabs */}
                        <div className="flex items-center gap-1.5 bg-slate-100 p-1.5 rounded-lg border border-slate-200">
                            {AUTONOMY_LEVELS.map((lvl) => (
                                <button
                                    key={lvl.level}
                                    onClick={() => setSelectedAutonomyLevel(lvl.level)}
                                    className={`flex-1 py-1.5 rounded text-center text-[13px] font-mono font-bold transition cursor-pointer ${selectedAutonomyLevel === lvl.level
                                        ? 'bg-white text-sky-800 shadow-xs border border-slate-200'
                                        : 'text-slate-600 hover:text-slate-900'
                                        }`}
                                >
                                    L{lvl.level}
                                </button>
                            ))}
                        </div>

                        {/* Selected Level Card */}
                        {(() => {
                            const curLvl = AUTONOMY_LEVELS.find((l) => l.level === selectedAutonomyLevel) || AUTONOMY_LEVELS[3];
                            return (
                                <div className="p-4 rounded-lg border border-slate-200 bg-slate-50 space-y-3">
                                    {/* Clean Level Header */}
                                    <div className="space-y-1.5 pb-2 border-b border-slate-200">
                                        <div className="flex items-center justify-between">
                                            <span className="text-[11px] font-mono font-bold text-sky-700 uppercase tracking-wider bg-sky-100/90 px-2 py-0.5 rounded border border-sky-200">
                                                LEVEL {curLvl.level} · {curLvl.title.toUpperCase()}
                                            </span>
                                            {curLvl.level === 4 ? (
                                                <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold border border-emerald-200 shadow-2xs">
                                                    Highest Impact Leap
                                                </span>
                                            ) : (
                                                <span className="text-[11px] font-mono text-slate-400 font-medium">
                                                    Stage {curLvl.level} of 5
                                                </span>
                                            )}
                                        </div>
                                        <div>
                                            <h4 className="text-[18px] font-bold text-slate-900 leading-tight">
                                                {curLvl.title}
                                            </h4>
                                            <p className="text-[13px] font-medium text-slate-500 mt-0.5 leading-snug">
                                                {curLvl.subtitle}
                                            </p>
                                        </div>
                                    </div>

                                    <p className="text-[14px] text-slate-700 leading-snug">{curLvl.description}</p>

                                    <div className="p-3 rounded-lg bg-sky-50 border border-sky-200 text-[13px] text-sky-950 leading-snug">
                                        <strong className="text-sky-800">Delivery Impact:</strong> {curLvl.impact}
                                    </div>

                                    {/* Lifecycle Stage Breakdown */}
                                    <div>
                                        <div className="text-[11px] font-bold font-mono text-slate-500 uppercase tracking-wider mb-2">
                                            Stage Breakdown at Level {curLvl.level}:
                                        </div>
                                        <div className="grid grid-cols-2 gap-2">
                                            {[
                                                { label: 'Intake', state: curLvl.stages.intake },
                                                { label: 'Spec & Estimate', state: curLvl.stages.spec },
                                                { label: 'Coding', state: curLvl.stages.coding },
                                                { label: 'Code Review', state: curLvl.stages.review },
                                                { label: 'QA & Testing', state: curLvl.stages.qa },
                                                { label: 'Deployment', state: curLvl.stages.deployment },
                                            ].map((st) => (
                                                <div
                                                    key={st.label}
                                                    className="flex items-center justify-between px-3 py-2 rounded bg-white border border-slate-200 text-[13px]"
                                                >
                                                    <span className="text-slate-700 font-medium">{st.label}</span>
                                                    <span
                                                        className={`font-mono font-bold px-2 py-0.5 rounded text-[11px] ${st.state === 'owns'
                                                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                                                            : st.state === 'assist'
                                                                ? 'bg-amber-100 text-amber-800 border border-amber-200'
                                                                : 'bg-slate-100 text-slate-500 border border-slate-200'
                                                            }`}
                                                    >
                                                        {st.state === 'owns' ? 'AI Owns' : st.state === 'assist' ? 'AI Assists' : 'Human'}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            );
                        })()}

                        {/* Our Take */}
                        <OurTake>
                            You reach Level 4 and Level 5 without catastrophe only by enforcing conduct as AI works across the cycle. Conduct is what prevents autonomy from turning into reckless outages.
                        </OurTake>
                    </div>
                )}

                {/* ═══════════════════════════════════════════════════════ */}
                {/* ── TAB 4: 11.7w CYCLE & DORA METRICS ─────────────── */}
                {/* ═══════════════════════════════════════════════════════ */}
                {activeTab === 'pdlc' && (
                    <div className="p-3.5 space-y-3.5">
                        <div>
                            <div className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-400">
                                Chapter 01 & 05 · Compressing the 94% (Pages 4, 13)
                            </div>
                            <h3 className="text-[17px] font-bold text-slate-900 mt-1">11.7-Week Delivery Cycle</h3>
                            <p className="text-[14px] text-slate-700 mt-1 leading-relaxed">
                                Coding is only ~6% of the delivery cycle (4.68 days). 11 weeks are spent stuck in queues, manual clarification, verification, reviews, and rework.
                            </p>
                        </div>

                        {/* Visual Breakdown: 6% Coding vs 94% Everything Else */}
                        <div className="p-3.5 rounded-lg border border-slate-200 bg-slate-900 text-white space-y-2.5">
                            <div className="flex items-center justify-between">
                                <span className="text-[12px] font-mono uppercase tracking-wider text-slate-300 font-bold">
                                    The Core Bottleneck
                                </span>
                                <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800">
                                    Incubyte Enterprise Data
                                </span>
                            </div>

                            {/* Proportional Split Bar */}
                            <div className="h-6 w-full rounded-md overflow-hidden flex font-mono text-[11px] font-bold">
                                <div
                                    className="bg-sky-500 text-slate-950 flex items-center justify-center shrink-0 px-2 transition-all"
                                    style={{ width: '6%' }}
                                    title="Coding: 6% (4.68 days)"
                                >
                                    6%
                                </div>
                                <div
                                    className="bg-emerald-600 text-white flex items-center justify-center flex-1 px-2"
                                    title="Everything Else: 94% (11 weeks)"
                                >
                                    94% EVERYTHING ELSE (QUEUES, REVIEWS, QA, STAGING)
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-2 text-[12px] pt-1 border-t border-slate-800">
                                <div>
                                    <span className="text-sky-400 font-bold">6% Coding:</span>
                                    <p className="text-slate-300 text-[11px]">Where 90% of AI tooling spend is currently concentrated.</p>
                                </div>
                                <div>
                                    <span className="text-emerald-400 font-bold">94% Everything Else:</span>
                                    <p className="text-slate-300 text-[11px]">Scoping, code review, testing, staging, and approval queues.</p>
                                </div>
                            </div>
                        </div>

                        {/* Toggle Comparison View */}
                        <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                            <span className="text-[13px] font-semibold text-slate-700">Pipeline View:</span>
                            <div className="flex items-center gap-1.5 text-[12px] font-mono">
                                <button
                                    onClick={() => setShowCompressedPdlc(false)}
                                    className={`px-3 py-1 rounded transition cursor-pointer ${!showCompressedPdlc
                                        ? 'bg-slate-900 text-white font-bold shadow-xs'
                                        : 'text-slate-600 hover:text-slate-900'
                                        }`}
                                >
                                    Baseline (11.7w)
                                </button>
                                <button
                                    onClick={() => setShowCompressedPdlc(true)}
                                    className={`px-3 py-1 rounded transition cursor-pointer ${showCompressedPdlc
                                        ? 'bg-sky-600 text-white font-bold shadow-xs'
                                        : 'text-slate-600 hover:text-slate-900'
                                        }`}
                                >
                                    Anthara (2.1w)
                                </button>
                            </div>
                        </div>

                        {/* PDLC Stage Bar Chart */}
                        <div className="space-y-2.5">
                            {PDLC_CYCLE_DATA.stages.map((stage) => {
                                const baselinePct = (stage.weeks / PDLC_CYCLE_DATA.totalWeeks) * 100;
                                const compressedPct = (stage.antharaCompressedWeeks / PDLC_CYCLE_DATA.totalWeeks) * 100;
                                return (
                                    <div key={stage.label}>
                                        <div className="flex items-center justify-between text-[13px] mb-1">
                                            <div className="flex items-center gap-1.5">
                                                <span className="font-semibold text-slate-800">{stage.label}</span>
                                                {stage.isCodingSliver && (
                                                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-sky-100 text-sky-800 border border-sky-200 font-bold">
                                                        6% Coding Sliver
                                                    </span>
                                                )}
                                            </div>
                                            <span className="font-mono text-slate-700 font-bold">
                                                {showCompressedPdlc ? stage.antharaCompressedTime : stage.timeRaw}
                                            </span>
                                        </div>
                                        <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden">
                                            <div
                                                className="h-full rounded-full transition-all duration-500"
                                                style={{
                                                    width: `${showCompressedPdlc ? compressedPct : baselinePct}%`,
                                                    backgroundColor: stage.color,
                                                }}
                                            />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Four DORA Metrics Matrix (Verbatim from Page 13) */}
                        <div className="pt-2 border-t border-slate-200 space-y-2.5">
                            <div>
                                <div className="text-[11px] font-bold font-mono text-slate-400 uppercase tracking-wider">
                                    Chapter 05 · Engineering Performance
                                </div>
                                <h4 className="text-[15px] font-bold text-slate-900 mt-0.5">
                                    The Four DORA Metrics Move Together
                                </h4>
                                <p className="text-[12px] text-slate-600 mt-0.5 leading-snug">
                                    When capability and conduct are done right, throughput climbs while stability is held or improved.
                                </p>
                            </div>

                            <div className="space-y-2">
                                {DORA_METRICS_DATA.map((dora) => (
                                    <div key={dora.id} className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-[13px]">
                                        <div className="flex items-center justify-between mb-1">
                                            <span className="font-bold text-slate-900">{dora.name}</span>
                                            <span
                                                className={`text-[11px] font-mono font-bold px-2 py-0.5 rounded border ${dora.trend === 'higher'
                                                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                                    : 'bg-sky-50 text-sky-800 border-sky-200'
                                                    }`}
                                            >
                                                {dora.trend.toUpperCase()}
                                            </span>
                                        </div>
                                        <p className="text-slate-700 text-[12px] mb-2 leading-snug">{dora.summary}</p>
                                        <div className="flex items-center gap-1.5 flex-wrap text-[11px] font-mono">
                                            <span className="text-slate-400 font-semibold">Drivers:</span>
                                            {dora.conductDrivers.map((cd) => (
                                                <span key={cd} className="px-2 py-0.5 rounded bg-violet-50 text-violet-800 font-medium border border-violet-200">
                                                    {cd}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Cultural Foundation */}
                            <div className="p-2.5 rounded-lg bg-slate-100 border border-slate-200 text-[12px] text-slate-700 font-mono">
                                <strong>Foundation:</strong> A generative (Westrum) culture is the soil every driver above grows in.
                            </div>
                        </div>
                    </div>
                )}

                {/* ═══════════════════════════════════════════════════════ */}
                {/* ── TAB 5: RESEARCH, STACK & METHODOLOGY ──────────── */}
                {/* ═══════════════════════════════════════════════════════ */}
                {activeTab === 'research' && (
                    <div className="p-3.5 space-y-3.5">
                        <div>
                            <div className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-400">
                                Methodology & Foundations (Pages 3, 6-12, 17)
                            </div>
                            <h3 className="text-[17px] font-bold text-slate-900 mt-1">Research & The Fluency Stack</h3>
                            <p className="text-[14px] text-slate-700 mt-1 leading-relaxed">
                                Combines empirical research across 400+ enterprises with field observations from regulated software teams.
                            </p>
                        </div>

                        {/* 6 Punchy Key Stats Grid */}
                        <div className="grid grid-cols-3 gap-1.5">
                            {[
                                { num: '90%', src: 'DORA 2025', desc: 'use AI day to day' },
                                { num: '7.8%', src: 'DX 2026', desc: 'output vs +65% usage' },
                                { num: '14%', src: 'DX 2026', desc: "dev's day on coding" },
                                { num: '66%', src: 'Stack Overflow', desc: '"almost right" frustration' },
                                { num: '~95%', src: 'MIT NANDA', desc: 'pilots no return' },
                                { num: '$9.4M', src: 'HHS OCR', desc: 'HIPAA penalties (16)' },
                            ].map((s) => (
                                <div key={s.num} className="bg-slate-50 border border-slate-200 rounded-lg p-2 text-center">
                                    <div className="text-[15px] font-bold text-slate-900 leading-none">{s.num}</div>
                                    <div className="text-[10px] text-slate-600 leading-tight mt-1">{s.desc}</div>
                                    <div className="text-[9px] font-mono text-slate-400 mt-0.5 font-bold">{s.src}</div>
                                </div>
                            ))}
                        </div>

                        {/* Research Sub-Tabs */}
                        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg border border-slate-200 text-[11px] font-semibold">
                            <button
                                onClick={() => setResearchSubTab('stack')}
                                className={`flex-1 py-1.5 rounded transition text-center truncate ${researchSubTab === 'stack'
                                    ? 'bg-white text-slate-900 shadow-xs border border-slate-200 font-bold'
                                    : 'text-slate-600 hover:text-slate-900'
                                    }`}
                            >
                                Fig 02 Stack
                            </button>
                            <button
                                onClick={() => setResearchSubTab('capability')}
                                className={`flex-1 py-1.5 rounded transition text-center truncate ${researchSubTab === 'capability'
                                    ? 'bg-white text-slate-900 shadow-xs border border-slate-200 font-bold'
                                    : 'text-slate-600 hover:text-slate-900'
                                    }`}
                            >
                                Capability (4)
                            </button>
                            <button
                                onClick={() => setResearchSubTab('conduct')}
                                className={`flex-1 py-1.5 rounded transition text-center truncate ${researchSubTab === 'conduct'
                                    ? 'bg-white text-slate-900 shadow-xs border border-slate-200 font-bold'
                                    : 'text-slate-600 hover:text-slate-900'
                                    }`}
                            >
                                Conduct (3)
                            </button>
                            <button
                                onClick={() => setResearchSubTab('citations')}
                                className={`flex-1 py-1.5 rounded transition text-center truncate ${researchSubTab === 'citations'
                                    ? 'bg-white text-slate-900 shadow-xs border border-slate-200 font-bold'
                                    : 'text-slate-600 hover:text-slate-900'
                                    }`}
                            >
                                Citations (13)
                            </button>
                        </div>

                        {/* ── Sub-Tab 1: Fig 02 The AI-Fluent Stack ────────── */}
                        {researchSubTab === 'stack' && (
                            <div className="space-y-3">
                                <div className="p-3.5 rounded-lg border border-slate-200 bg-slate-50 space-y-2.5">
                                    <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 font-mono">
                                        Fig 02: The AI-Fluent Stack (Page 6)
                                    </div>
                                    <div className="space-y-2 font-sans">
                                        <div className="p-3 rounded-lg bg-sky-50 border border-sky-200">
                                            <div className="flex items-center justify-between mb-1">
                                                <span className="font-bold text-[14px] text-sky-950">01 · CAPABILITY</span>
                                                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white text-sky-800 border border-sky-200 font-bold">
                                                    Human & Org
                                                </span>
                                            </div>
                                            <p className="text-[12px] text-sky-900 leading-snug">
                                                What the team brings: how it learns, judges, and keeps context written down. Learning, Skill & judgement, Business fluency, Documentation.
                                            </p>
                                        </div>

                                        <div className="flex justify-center text-slate-400 text-[12px]">↓ +</div>

                                        <div className="p-3 rounded-lg bg-violet-50 border border-violet-200">
                                            <div className="flex items-center justify-between mb-1">
                                                <span className="font-bold text-[14px] text-violet-950">02 · CONDUCT</span>
                                                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-violet-600 text-white font-bold">
                                                    ADDED FOR AI ERA
                                                </span>
                                            </div>
                                            <p className="text-[12px] text-violet-900 leading-snug">
                                                New link: how work gets done once a model is in the loop. Standards, Compliance, and Data boundaries enforced as code is generated.
                                            </p>
                                        </div>

                                        <div className="flex justify-center text-slate-400 text-[12px]">↓</div>

                                        <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200">
                                            <div className="flex items-center justify-between mb-1">
                                                <span className="font-bold text-[14px] text-emerald-950">03 · ENGINEERING PERFORMANCE</span>
                                                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white text-emerald-800 border border-emerald-200 font-bold">
                                                    Measurable Result
                                                </span>
                                            </div>
                                            <p className="text-[12px] text-emerald-900 leading-snug">
                                                Flow, stability, and audit readiness. Cycle time & flow, Quality & stability, Compliance posture.
                                            </p>
                                        </div>

                                        <div className="flex justify-center text-slate-400 text-[12px]">↓</div>

                                        <div className="p-3 rounded-lg bg-amber-50 border border-amber-200">
                                            <div className="flex items-center justify-between mb-1">
                                                <span className="font-bold text-[14px] text-amber-950">04 · BUSINESS OUTCOMES</span>
                                                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white text-amber-800 border border-amber-200 font-bold">
                                                    Client Impact
                                                </span>
                                            </div>
                                            <p className="text-[12px] text-amber-900 leading-snug">
                                                What the client actually feels at the end of the chain: Value delivered, Client happiness, Resilience.
                                            </p>
                                        </div>
                                    </div>

                                    <div className="text-[12px] text-slate-600 italic pt-1">
                                        "An organization’s responsibility is to build the capability and conduct layers. What’s below are the outcomes and not the levers."
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* ── Sub-Tab 2: Capability Layer (4 Dimensions) ──── */}
                        {researchSubTab === 'capability' && (
                            <div className="space-y-3">
                                <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                                    {CAPABILITY_DIMENSIONS.map((dim, idx) => (
                                        <button
                                            key={dim.num}
                                            onClick={() => setSelectedCapIndex(idx)}
                                            className={`px-2.5 py-1.5 rounded text-[11px] font-mono font-bold whitespace-nowrap border cursor-pointer ${selectedCapIndex === idx
                                                ? 'bg-sky-600 text-white border-sky-600'
                                                : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border-slate-200'
                                                }`}
                                        >
                                            {dim.num}. {dim.name.split(' ')[0]}
                                        </button>
                                    ))}
                                </div>

                                {(() => {
                                    const dim = CAPABILITY_DIMENSIONS[selectedCapIndex];
                                    return (
                                        <div className="p-4 rounded-lg border border-slate-200 bg-slate-50 space-y-3">
                                            <div>
                                                <span className="text-[11px] font-mono font-bold text-sky-600 uppercase">
                                                    DIMENSION {dim.num}
                                                </span>
                                                <h4 className="text-[16px] font-bold text-slate-900">{dim.name}</h4>
                                                <p className="text-[13px] text-slate-700 mt-1 leading-snug">{dim.tagline}</p>
                                            </div>

                                            <div className="space-y-2">
                                                {dim.items.map((it) => (
                                                    <div key={it.label} className="p-2.5 rounded bg-white border border-slate-200 text-[13px]">
                                                        <div className="font-bold text-slate-800">{it.label}</div>
                                                        <div className="text-slate-600 text-[12px] mt-0.5 leading-snug">{it.detail}</div>
                                                    </div>
                                                ))}
                                            </div>

                                            <OurTake>{dim.quote}</OurTake>
                                        </div>
                                    );
                                })()}
                            </div>
                        )}

                        {/* ── Sub-Tab 3: Conduct Layer (3 Dimensions) ─────── */}
                        {researchSubTab === 'conduct' && (
                            <div className="space-y-3">
                                <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                                    {CONDUCT_DIMENSIONS.map((dim, idx) => (
                                        <button
                                            key={dim.num}
                                            onClick={() => setSelectedCondIndex(idx)}
                                            className={`px-2.5 py-1.5 rounded text-[11px] font-mono font-bold whitespace-nowrap border cursor-pointer ${selectedCondIndex === idx
                                                ? 'bg-violet-600 text-white border-violet-600'
                                                : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border-slate-200'
                                                }`}
                                        >
                                            {dim.num}. {dim.name.split(' ')[0]}
                                        </button>
                                    ))}
                                </div>

                                {(() => {
                                    const dim = CONDUCT_DIMENSIONS[selectedCondIndex];
                                    return (
                                        <div className="p-4 rounded-lg border border-slate-200 bg-slate-50 space-y-3">
                                            <div>
                                                <span className="text-[11px] font-mono font-bold text-violet-600 uppercase">
                                                    CONDUCT DIMENSION {dim.num}
                                                </span>
                                                <h4 className="text-[16px] font-bold text-slate-900">{dim.name}</h4>
                                                <p className="text-[13px] text-slate-700 mt-1 leading-snug">{dim.tagline}</p>
                                            </div>

                                            <div className="space-y-2">
                                                {dim.points.map((pt) => (
                                                    <div key={pt.num} className="p-2.5 rounded bg-white border border-slate-200 text-[13px]">
                                                        <div className="font-bold text-slate-800">
                                                            <span className="text-violet-600 font-mono mr-1.5">{pt.num}</span>
                                                            {pt.title}
                                                        </div>
                                                        <div className="text-slate-600 text-[12px] mt-0.5 leading-snug">{pt.detail}</div>
                                                    </div>
                                                ))}
                                            </div>

                                            <OurTake>{dim.quote}</OurTake>
                                        </div>
                                    );
                                })()}
                            </div>
                        )}

                        {/* ── Sub-Tab 4: 13 Empirical Research Papers (Page 17) */}
                        {researchSubTab === 'citations' && (
                            <div className="space-y-2.5">
                                <div className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-400">
                                    All 13 Empirical Research Sources
                                </div>
                                <div className="space-y-2">
                                    {RESEARCH_SOURCES.map((paper) => (
                                        <div
                                            key={paper.id}
                                            className="p-3 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100/80 transition space-y-1"
                                        >
                                            <div className="flex items-start justify-between gap-2">
                                                <div>
                                                    <span className="text-[10px] font-mono font-bold text-sky-700 uppercase">
                                                        {paper.source} · {paper.year}
                                                    </span>
                                                    <h5 className="text-[13px] font-bold text-slate-900 leading-tight">
                                                        {paper.title}
                                                    </h5>
                                                </div>
                                                {paper.stat && (
                                                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white text-slate-700 border border-slate-200 font-bold shrink-0">
                                                        {paper.stat}
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-[12px] text-slate-600 leading-snug">{paper.finding}</p>
                                            {paper.link && (
                                                <div className="pt-1">
                                                    <a
                                                        href={paper.link}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-[11px] text-sky-600 hover:text-sky-800 font-medium inline-flex items-center gap-1"
                                                    >
                                                        Read paper ↗
                                                    </a>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* ── The Offer (Page 17) ─────────────────────────── */}
                        <div className="pt-2 border-t border-slate-200 space-y-2">
                            <div className="text-[11px] font-bold font-mono text-slate-400 uppercase tracking-wider">
                                Page 17 · Two Ways to Install It
                            </div>
                            <div className="grid grid-cols-2 gap-2 text-[12px]">
                                <div className="p-3 rounded-lg bg-sky-50 border border-sky-200">
                                    <div className="font-bold text-sky-950 mb-1">Buy it from Anthara ↗</div>
                                    <p className="text-sky-900 text-[11px] leading-snug">
                                        Augment your team's capabilities and introduce the conduct layer as a product within your VPC.
                                    </p>
                                </div>
                                <div className="p-3 rounded-lg bg-slate-100 border border-slate-200">
                                    <div className="font-bold text-slate-900 mb-1">Build with Incubyte ↗</div>
                                    <p className="text-slate-700 text-[11px] leading-snug">
                                        Forward deployed engineers build your capability and conduct layers alongside your team.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* ── Bottom Legend ─────────────────────────────────── */}
            <div className="px-3 py-2 border-t border-slate-200 bg-slate-50 shrink-0 text-[11px] font-mono text-slate-500 flex items-center justify-between">
                <span>[Space] Play/Pause</span>
                <span>[← →] Step</span>
                <span>[Click] 3D Inspect</span>
            </div>
        </div>
    );
}

// ── Perspective Highlight Box ─────────────────────────────────────────────
function OurTake({ children }: { children: React.ReactNode }) {
    return (
        <div className="p-3 rounded-lg bg-sky-50 border border-sky-200 text-[13px] text-sky-950 leading-snug">
            <div className="font-bold text-sky-800 text-[11px] uppercase tracking-wider font-mono mb-1 flex items-center gap-1.5">
                <span>💡</span> Anthara / Incubyte Take
            </div>
            <div>{children}</div>
        </div>
    );
}
