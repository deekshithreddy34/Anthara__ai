'use client';

import React, { useState } from 'react';
import { IArchNode, ARCH_TIERS } from './model/antharaArchitecture';

interface INodeInspectorProps {
    node: IArchNode | null;
    onClose: () => void;
    onFocusNode: (node: IArchNode) => void;
}

export function NodeInspector({ node, onClose, onFocusNode }: INodeInspectorProps) {
    const [copied, setCopied] = useState<boolean>(false);

    if (!node) return null;

    const tier = ARCH_TIERS.find((t) => t.id === node.tierId);

    function handleCopyPayload() {
        if (!node?.samplePayload) return;
        navigator.clipboard.writeText(node.samplePayload.codeOrJson);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    }

    return (
        <div className="absolute top-0 right-0 w-96 max-w-[90vw] h-full bg-white/98 border-l border-slate-200 backdrop-blur-xl z-30 shadow-2xl flex flex-col text-slate-800 select-none animate-in slide-in-from-right duration-300">
            {/* Header */}
            <div className="p-4 border-b border-slate-200 flex items-start justify-between bg-slate-50/80">
                <div className="pr-4">
                    <div className="flex items-center gap-2 mb-1">
                        <span
                            className="w-2.5 h-2.5 rounded-xs"
                            style={{ backgroundColor: node.accentColor }}
                        />
                        <span className="text-[11px] uppercase font-mono tracking-wider text-slate-500 font-semibold">
                            {tier?.title || node.tierId}
                        </span>
                    </div>
                    <h3 className="text-sm font-bold text-slate-900 leading-tight">{node.title}</h3>
                    <p className="text-[12px] text-slate-500 mt-0.5">{node.subtitle}</p>
                </div>
                <button
                    onClick={onClose}
                    className="w-7 h-7 rounded bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 flex items-center justify-center transition border border-slate-200"
                    title="Close Inspector"
                >
                    ✕
                </button>
            </div>

            {/* Scrollable Body */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 text-sm">
                {/* Architectural Description */}
                <div>
                            <h4 className="text-[11px] font-bold text-slate-500 uppercase tracking-wider font-mono mb-1.5">
                                Architectural Role & Function
                            </h4>
                            <p className="text-[12px] text-slate-700 leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-200">
                                {node.description}
                            </p>
                </div>

                {/* Performance & Security Metrics */}
                {node.metrics && node.metrics.length > 0 && (
                    <div>
                            <h4 className="text-[11px] font-bold text-slate-500 uppercase tracking-wider font-mono mb-1.5">
                                Performance & Guarantees
                            </h4>
                            <div className="grid grid-cols-2 gap-2">
                                {node.metrics.map((m, idx) => (
                                    <div
                                        key={idx}
                                        className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 flex flex-col justify-between"
                                    >
                                        <span className="text-[11px] text-slate-500">{m.label}</span>
                                        <span className="text-xs font-bold text-slate-900 font-mono mt-1">
                                            {m.value}
                                        </span>
                                    </div>
                                ))}
                            </div>
                    </div>
                )}

                {/* Compliance Frameworks Handled */}
                {node.complianceRegulations && node.complianceRegulations.length > 0 && (
                    <div>
                            <h4 className="text-[11px] font-bold text-slate-500 uppercase tracking-wider font-mono mb-1.5">
                                Enforced Compliance Standards
                            </h4>
                            <div className="flex flex-wrap gap-1.5">
                                {node.complianceRegulations.map((reg, idx) => (
                                    <span
                                        key={idx}
                                        className="px-2 py-0.5 rounded bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] font-mono font-medium"
                                    >
                                        {reg}
                                    </span>
                                ))}
                            </div>
                    </div>
                )}

                {/* Input / Output Contracts */}
                <div>
                            <h4 className="text-[11px] font-bold text-slate-500 uppercase tracking-wider font-mono mb-1.5">
                                I/O Data Contracts
                            </h4>
                            <div className="space-y-2">
                                <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                                    <span className="text-[11px] font-mono text-sky-700 font-bold block mb-1">
                                        INBOUND INPUTS:
                                    </span>
                                    <ul className="list-disc list-inside text-[12px] text-slate-700 space-y-0.5">
                                        {node.inputs.map((inp, idx) => (
                                            <li key={idx}>{inp}</li>
                                        ))}
                                    </ul>
                                </div>

                                <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                                    <span className="text-[11px] font-mono text-emerald-700 font-bold block mb-1">
                                        OUTBOUND OUTPUTS:
                                    </span>
                                    <ul className="list-disc list-inside text-[12px] text-slate-700 space-y-0.5">
                                        {node.outputs.map((out, idx) => (
                                            <li key={idx}>{out}</li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                </div>

                {/* Sample Live Wire Payload */}
                {node.samplePayload && (
                    <div>
                        <div className="flex items-center justify-between mb-1.5">
                            <h4 className="text-[11px] font-bold text-slate-500 uppercase tracking-wider font-mono">
                                {node.samplePayload.type}
                            </h4>
                            <button
                                onClick={handleCopyPayload}
                                className="text-[11px] text-sky-700 hover:text-sky-900 font-mono transition font-medium"
                            >
                                {copied ? '✔ Copied' : 'Copy'}
                            </button>
                        </div>
                        <pre className="text-[12px] font-mono bg-slate-900 p-3 rounded-lg border border-slate-800 text-slate-200 overflow-x-auto whitespace-pre-wrap leading-relaxed max-h-48 shadow-xs">
                            {node.samplePayload.codeOrJson}
                        </pre>
                    </div>
                )}
            </div>

            {/* Bottom Action Footer */}
            <div className="p-3 border-t border-slate-200 bg-slate-50 flex items-center gap-2">
                <button
                    onClick={() => onFocusNode(node)}
                    className="flex-1 py-1.5 rounded-md bg-slate-900 hover:bg-slate-800 text-white font-medium text-sm transition shadow-xs"
                >
                    Focus in 3D
                </button>
                <button
                    onClick={onClose}
                    className="px-3 py-1.5 rounded-md bg-white hover:bg-slate-100 text-slate-700 hover:text-slate-900 text-sm transition border border-slate-200 font-medium"
                >
                    Dismiss
                </button>
            </div>
        </div>
    );
}
