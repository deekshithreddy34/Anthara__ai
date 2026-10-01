'use client';

import React, { useState } from 'react';
import { AntharaCanvas3D } from './AntharaCanvas3D';
import { AntharaSidebar } from './AntharaSidebar';
import { NodeInspector } from './NodeInspector';
import { AntharaToolbar } from './AntharaToolbar';
import { SCENARIOS, IScenario, IArchNode } from './model/antharaArchitecture';

export function AntharaView() {
    const [currentScenario, setCurrentScenario] = useState<IScenario>(SCENARIOS[0]);
    const [activeStepIndex, setActiveStepIndex] = useState<number>(0);
    const [selectedNode, setSelectedNode] = useState<IArchNode | null>(null);
    const [cameraPreset, setCameraPreset] = useState<string | null>(null);
    const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(true);

    const handleStepChange = React.useCallback((idx: number) => {
        setActiveStepIndex(idx);
    }, []);

    const handleSelectScenario = React.useCallback((sc: IScenario) => {
        setCurrentScenario(sc);
        setActiveStepIndex(0);
        setSelectedNode(null);
    }, []);

    const handleSelectNode = React.useCallback((node: IArchNode | null) => {
        setSelectedNode(node);
    }, []);

    const activeStep = currentScenario.steps[activeStepIndex] || null;

    return (
        <div className="flex flex-col h-screen w-screen overflow-hidden bg-white text-slate-900 font-sans">
            {/* Top Toolbar */}
            <div className="relative z-30">
                <AntharaToolbar
                    onSelectCameraPreset={(preset) => setCameraPreset(preset)}
                    currentScenarioName={currentScenario.name}
                    onToggleSidebar={() => setIsSidebarOpen((prev) => !prev)}
                    isSidebarOpen={isSidebarOpen}
                />
            </div>

            {/* Main Interactive Stage: Side-by-Side like bbycroft/llm-viz */}
            <div className="flex-1 flex flex-col md:flex-row relative overflow-hidden">
                {/* Left Walkthrough & Commentary Sidebar (Cleanly docked, NEVER covering the 3D model) */}
                {isSidebarOpen && (
                    <div className="w-full md:w-[410px] lg:w-[440px] h-[45vh] md:h-full flex-shrink-0 border-r border-slate-200 z-20 bg-white shadow-sm flex flex-col">
                        <AntharaSidebar
                            currentScenario={currentScenario}
                            onSelectScenario={handleSelectScenario}
                            activeStepIndex={activeStepIndex}
                            onChangeStepIndex={handleStepChange}
                            onSelectNode={handleSelectNode}
                        />
                    </div>
                )}

                {/* Right: 100% Unobstructed Fullscreen 3D Canvas */}
                <div className="flex-1 h-full relative overflow-hidden bg-white">
                    <AntharaCanvas3D
                        activeStep={activeStep}
                        selectedNodeId={selectedNode ? selectedNode.id : null}
                        onSelectNode={(node) => setSelectedNode(node)}
                        activeScenarioId={currentScenario.id}
                        cameraPreset={cameraPreset}
                        onResetCameraPreset={() => setCameraPreset(null)}
                    />

                    {/* Sliding Node Deep-Dive Inspector (Only opens when node is clicked) */}
                    <NodeInspector
                        node={selectedNode}
                        onClose={() => setSelectedNode(null)}
                        onFocusNode={(node) => setSelectedNode({ ...node })}
                    />
                </div>
            </div>
        </div>
    );
}
