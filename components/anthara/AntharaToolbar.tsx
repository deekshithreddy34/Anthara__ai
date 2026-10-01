'use client';

import React, { useState } from 'react';
import Link from 'next/link';

interface IAntharaToolbarProps {
    onSelectCameraPreset: (preset: string) => void;
    currentScenarioName: string;
    onToggleSidebar?: () => void;
    isSidebarOpen?: boolean;
}

export function AntharaToolbar({
    onSelectCameraPreset,
    currentScenarioName,
    onToggleSidebar,
    isSidebarOpen,
}: IAntharaToolbarProps) {
    const [showInfoModal, setShowInfoModal] = useState(false);

    return (
        <div className="h-12 border-b border-slate-200 bg-white px-4 flex items-center justify-between text-sm text-slate-700 z-10 select-none shadow-xs">
            {/* Left Brand & LLM Link */}
            <div className="flex items-center gap-3">
                {onToggleSidebar && (
                    <button
                        onClick={onToggleSidebar}
                        className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-[12px] font-mono font-medium transition border ${
                            isSidebarOpen
                                ? 'bg-slate-900 text-white border-slate-900'
                                : 'bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-950 border-slate-200'
                        }`}
                        title="Toggle Scenario Steps Drawer"
                    >
                        <span>📑</span>
                        <span>Scenarios</span>
                    </button>
                )}

                <Link
                    href="/"
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-950 transition border border-slate-200"
                    title="Anthara AI 3D Architecture"
                >
                    <span className="text-sky-600">✦</span>
                    <span className="text-[12px] font-mono font-medium">Anthara</span>
                </Link>

                <div className="h-4 w-[1px] bg-slate-200" />

                {/* Core thesis */}
                <div className="hidden sm:flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-xs bg-sky-600" />
                    <span className="text-[12px] font-bold text-slate-900 tracking-tight">Anthara Architecture</span>
                    <span className="text-[11px] text-slate-400 font-mono">• Incubyte AI-Fluent PDLC</span>
                </div>

            </div>

            {/* Center Camera Presets */}
            <div className="hidden md:flex items-center gap-1 bg-slate-100/90 p-1 rounded-md border border-slate-200">
                <span className="text-[11px] uppercase font-mono px-2 text-slate-400 font-semibold">View:</span>
                <button
                    onClick={() => onSelectCameraPreset('overview')}
                    className="px-2.5 py-1 rounded hover:bg-white text-[11px] font-medium text-slate-600 hover:text-slate-900 transition hover:shadow-xs"
                >
                    Overview
                </button>
                <button
                    onClick={() => onSelectCameraPreset('ide_assistants')}
                    className="px-2 py-1 rounded hover:bg-white text-[11px] font-medium text-slate-600 hover:text-orange-700 transition"
                >
                    Assistants & IDE
                </button>
                <button
                    onClick={() => onSelectCameraPreset('conduct')}
                    className="px-2 py-1 rounded hover:bg-white text-[11px] font-medium text-slate-600 hover:text-amber-700 transition"
                >
                    Conduct Layer
                </button>
                <button
                    onClick={() => onSelectCameraPreset('agents')}
                    className="px-2 py-1 rounded hover:bg-white text-[11px] font-medium text-slate-600 hover:text-amber-800 transition"
                >
                    Agents
                </button>
                <button
                    onClick={() => onSelectCameraPreset('mcp_systems')}
                    className="px-2 py-1 rounded hover:bg-white text-[11px] font-medium text-slate-600 hover:text-teal-700 transition"
                >
                    MCP & Systems
                </button>
                <button
                    onClick={() => onSelectCameraPreset('llm_providers')}
                    className="px-2 py-1 rounded hover:bg-white text-[11px] font-medium text-slate-600 hover:text-emerald-700 transition"
                >
                    LLM Providers
                </button>
                <button
                    onClick={() => onSelectCameraPreset('top_down')}
                    className="px-2 py-1 rounded hover:bg-white text-[11px] font-medium text-slate-600 hover:text-slate-900 transition font-mono"
                >
                    Top-Down
                </button>
            </div>

            {/* Right Info & Help */}
            <div className="flex items-center gap-2">
                <button
                    onClick={() => setShowInfoModal(true)}
                    className="flex items-center gap-1.5 px-3 py-1 rounded bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 text-[11px] font-mono transition font-medium"
                >
                    <span>ℹ</span>
                    <span>AI-Fluent Architecture</span>
                </button>
            </div>

            {/* Info Modal */}
            {showInfoModal && (
                <div
                    onClick={(e) => {
                        if (e.target === e.currentTarget) setShowInfoModal(false);
                    }}
                    className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4 sm:p-6 overflow-hidden"
                >
                    <div className="bg-white border border-slate-200 rounded-2xl max-w-xl w-full max-h-[85vh] flex flex-col text-slate-800 shadow-2xl relative animate-in zoom-in-95 duration-200 overflow-hidden">
                        {/* Header (Fixed) */}
                        <div className="flex items-center justify-between p-5 pb-4 border-b border-slate-100 shrink-0">
                            <div className="flex items-center gap-2.5">
                                <span className="w-2.5 h-2.5 rounded-xs bg-sky-600" />
                                <h3 className="text-base font-bold text-slate-900">Anthara AI · The AI-Fluent PDLC</h3>
                            </div>
                            <button
                                onClick={() => setShowInfoModal(false)}
                                className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-100 transition cursor-pointer text-lg leading-none"
                                aria-label="Close modal"
                            >
                                ✕
                            </button>
                        </div>

                        {/* Scrollable Content Body */}
                        <div className="p-5 sm:p-6 overflow-y-auto space-y-4 text-slate-800 flex-1">
                            <div>
                                <p className="text-sm font-semibold text-slate-800 mb-1">Adoption is not fluency.</p>
                                <p className="text-sm text-slate-600 leading-relaxed">
                                    90% of technology professionals use AI daily (DORA 2025), yet coding represents only 6% of the 11.7-week delivery cycle (Incubyte). Accelerating code generation simply shifts constraints downstream to review, verification, and integration. Anthara installs the Conduct Layer as a product deployed within your security boundary to compress the entire cycle without losing trust in what ships.
                                </p>
                            </div>

                            <div className="space-y-2.5 text-sm">
                                <div className="p-3 rounded-lg bg-sky-50 border border-sky-200">
                                    <span className="font-mono text-[10px] font-bold text-sky-600">01</span>
                                    <span className="font-semibold text-slate-900 ml-2">Capability Layer</span>
                                    <p className="text-slate-600 text-[12px] mt-0.5">What the team brings: how it learns, judges, and keeps context written down — ADRs, domain grounding, codified craft & spec authoring.</p>
                                </div>
                                <div className="p-3 rounded-lg bg-violet-50 border border-violet-200">
                                    <span className="font-mono text-[10px] font-bold text-violet-600">02</span>
                                    <span className="font-semibold text-slate-900 ml-2">Conduct Layer (Anthara Engine)</span>
                                    <p className="text-slate-600 text-[12px] mt-0.5">Enforced while AI generates: session-loaded rules, in-flight PHI masking, MCP tool governance, streaming AST verification & real-time auto-remediation.</p>
                                </div>
                                <div className="p-3 rounded-lg bg-amber-50 border border-amber-200">
                                    <span className="font-mono text-[10px] font-bold text-amber-700">03</span>
                                    <span className="font-semibold text-slate-900 ml-2">Engineering Performance</span>
                                    <p className="text-slate-600 text-[12px] mt-0.5">The 4 DORA metrics move together: Deployment frequency ↑, Lead time ↓, Change failure rate held low, MTTR held low. 94% queue compressed.</p>
                                </div>
                                <div className="p-3 rounded-lg bg-blue-50 border border-blue-200">
                                    <span className="font-mono text-[10px] font-bold text-blue-600">04</span>
                                    <span className="font-semibold text-slate-900 ml-2">Business Outcomes & Westrum Foundation</span>
                                    <p className="text-slate-600 text-[12px] mt-0.5">Value delivered, client happiness, and enterprise resilience resting on a generative culture with psychological safety to challenge sloppy AI.</p>
                                </div>
                            </div>

                            <div className="p-3 rounded-lg bg-slate-900 text-slate-100 text-[12px] font-mono flex items-center justify-between">
                                <div>
                                    <span className="text-sky-400 font-bold">Buy it from Anthara:</span> Deployed within your boundary.
                                </div>
                                <div className="text-slate-400 text-[11px]">
                                    incubyte.co
                                </div>
                            </div>
                        </div>

                        {/* Footer (Fixed) */}
                        <div className="flex items-center justify-between p-4 px-5 sm:px-6 border-t border-slate-200 bg-slate-50 shrink-0 text-[11px] text-slate-500 font-mono">
                            <span>Left Drag: Orbit • Right Drag: Pan • Wheel: Zoom</span>
                            <button
                                onClick={() => setShowInfoModal(false)}
                                className="px-4 py-1.5 rounded bg-slate-900 hover:bg-slate-800 text-white font-medium transition cursor-pointer"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
