'use client';

import React, { useEffect, useState } from 'react';
import { IScenario, IWalkthroughStep, SCENARIOS } from './model/antharaArchitecture';

interface IAntharaCommentaryProps {
    currentScenario: IScenario;
    onSelectScenario: (scenario: IScenario) => void;
    activeStepIndex: number;
    onChangeStepIndex: (index: number) => void;
    onInspectPayload?: () => void;
}

export function AntharaCommentary({
    currentScenario,
    onSelectScenario,
    activeStepIndex,
    onChangeStepIndex,
    onInspectPayload,
}: IAntharaCommentaryProps) {
    const [isPlaying, setIsPlaying] = useState<boolean>(false);
    const [isCollapsed, setIsCollapsed] = useState<boolean>(false);

    const activeStep: IWalkthroughStep | undefined = currentScenario.steps[activeStepIndex];
    const totalSteps = currentScenario.steps.length;

    // Autoplay effect
    useEffect(() => {
        if (!isPlaying) return;

        const timer = setInterval(() => {
            if (activeStepIndex + 1 < totalSteps) {
                onChangeStepIndex(activeStepIndex + 1);
            } else {
                setIsPlaying(false);
            }
        }, 4000);

        return () => clearInterval(timer);
    }, [isPlaying, totalSteps, activeStepIndex, onChangeStepIndex]);

    const badgeColor =
        activeStep?.badgeType === 'danger'
            ? 'bg-rose-50 text-rose-700 border-rose-300'
            : activeStep?.badgeType === 'warning'
                ? 'bg-amber-50 text-amber-700 border-amber-300'
                : activeStep?.badgeType === 'success'
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                    : 'bg-sky-50 text-sky-700 border-sky-300';

    return (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-[95%] max-w-4xl z-30 transition-all duration-200">
            {/* Main Commentary Container (Inspired by bbycroft/llm-viz Commentary) */}
            <div className="bg-white/95 backdrop-blur-md rounded-2xl border border-slate-200 shadow-2xl overflow-hidden text-slate-800">
                {/* Top Bar: Scenario Selector & Collapse Toggle */}
                <div className="bg-slate-50/90 px-4 py-2 border-b border-slate-200 flex items-center justify-between gap-3 text-xs">
                    {/* Scenario Pills */}
                    <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
                        <span className="font-mono text-[10px] uppercase font-bold text-slate-400 mr-1">SCENARIO:</span>
                        {SCENARIOS.map((sc) => {
                            const isCurrent = sc.id === currentScenario.id;
                            return (
                                <button
                                    key={sc.id}
                                    onClick={() => {
                                        onSelectScenario(sc);
                                        setIsPlaying(false);
                                    }}
                                    className={`px-2.5 py-1 rounded-full text-[11px] font-medium transition whitespace-nowrap border ${
                                        isCurrent
                                            ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                                            : 'bg-white text-slate-600 hover:text-slate-900 border-slate-200 hover:bg-slate-100'
                                    }`}
                                >
                                    {sc.name}
                                </button>
                            );
                        })}
                    </div>

                    {/* Minimize / Expand Toggle */}
                    <button
                        onClick={() => setIsCollapsed(!isCollapsed)}
                        className="text-slate-400 hover:text-slate-700 px-2 py-0.5 rounded text-xs font-mono transition"
                    >
                        {isCollapsed ? '▲ Expand' : '▼ Minimize'}
                    </button>
                </div>

                {!isCollapsed && (
                    <div className="p-4 sm:p-5">
                        {/* Step Header: Title, Badge & Inspector Button */}
                        <div className="flex items-center justify-between gap-3 mb-2">
                            <div className="flex items-center gap-2.5 flex-wrap">
                                <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
                                    STEP {activeStepIndex + 1} OF {totalSteps}
                                </span>
                                {activeStep?.badgeText && (
                                    <span className={`text-[11px] font-mono font-bold uppercase px-2 py-0.5 rounded-full border ${badgeColor}`}>
                                        {activeStep.badgeText}
                                    </span>
                                )}
                                <h3 className="text-base font-bold text-slate-900 tracking-tight">
                                    {activeStep?.title}
                                </h3>
                            </div>

                            {activeStep?.codeSnippet && onInspectPayload && (
                                <button
                                    onClick={onInspectPayload}
                                    className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-sky-50 hover:bg-sky-100 text-sky-700 border border-sky-200 text-xs font-medium transition"
                                >
                                    <span>🔍</span>
                                    <span>Inspect Payload</span>
                                </button>
                            )}
                        </div>

                        {/* Step Explanation Text */}
                        <p className="text-sm text-slate-600 leading-relaxed mb-4">
                            {activeStep?.explanation}
                        </p>

                        {/* Phase Timeline Scrubber (like PhaseTimeline.tsx in llm-viz) */}
                        <div className="flex items-center gap-2 mb-3">
                            {currentScenario.steps.map((step, idx) => {
                                const isPassed = idx < activeStepIndex;
                                const isCurrent = idx === activeStepIndex;
                                return (
                                    <button
                                        key={step.id}
                                        onClick={() => {
                                            onChangeStepIndex(idx);
                                            setIsPlaying(false);
                                        }}
                                        className="flex-1 group py-1 flex flex-col gap-1 text-left focus:outline-hidden"
                                    >
                                        <div
                                            className={`h-2 rounded-full transition-all duration-200 ${
                                                isCurrent
                                                    ? 'bg-sky-600 ring-2 ring-sky-300'
                                                    : isPassed
                                                        ? 'bg-slate-400 hover:bg-slate-500'
                                                        : 'bg-slate-200 hover:bg-slate-300'
                                            }`}
                                        />
                                        <span className={`text-[10px] font-mono truncate hidden md:block ${
                                            isCurrent ? 'font-bold text-sky-700' : 'text-slate-400'
                                        }`}>
                                            {step.title}
                                        </span>
                                    </button>
                                );
                            })}
                        </div>

                        {/* Bottom Playback Controls */}
                        <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                            <div className="flex items-center gap-2">
                                <button
                                    disabled={activeStepIndex === 0}
                                    onClick={() => {
                                        onChangeStepIndex(Math.max(0, activeStepIndex - 1));
                                        setIsPlaying(false);
                                    }}
                                    className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-medium text-slate-700 hover:bg-slate-100 disabled:opacity-30 disabled:pointer-events-none transition"
                                >
                                    ◀ Previous
                                </button>

                                <button
                                    onClick={() => setIsPlaying(!isPlaying)}
                                    className={`px-4 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                                        isPlaying
                                            ? 'bg-amber-500 text-white hover:bg-amber-600'
                                            : 'bg-slate-900 text-white hover:bg-slate-800'
                                    }`}
                                >
                                    <span>{isPlaying ? '⏸' : '▶'}</span>
                                    <span>{isPlaying ? 'Pause' : 'Play Walkthrough'}</span>
                                </button>

                                <button
                                    disabled={activeStepIndex >= totalSteps - 1}
                                    onClick={() => {
                                        onChangeStepIndex(Math.min(totalSteps - 1, activeStepIndex + 1));
                                        setIsPlaying(false);
                                    }}
                                    className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-medium text-slate-700 hover:bg-slate-100 disabled:opacity-30 disabled:pointer-events-none transition"
                                >
                                    Next ▶
                                </button>
                            </div>

                            <div className="text-[11px] font-mono text-slate-400 hidden sm:block">
                                Click any 3D node to inspect rules & payloads
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
