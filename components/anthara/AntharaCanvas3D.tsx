'use client';

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import {
    ARCH_NODES,
    ARCH_TIERS,
    ARCH_DATA_PATHS,
    IArchNode,
    IArchTier,
    IDataPath,
    IWalkthroughStep,
} from './model/antharaArchitecture';

interface IAntharaCanvas3DProps {
    activeStep: IWalkthroughStep | null;
    selectedNodeId: string | null;
    onSelectNode: (node: IArchNode | null) => void;
    activeScenarioId: string;
    cameraPreset?: string | null;
    onResetCameraPreset?: () => void;
}

export function AntharaCanvas3D({
    activeStep,
    selectedNodeId,
    onSelectNode,
    activeScenarioId,
    cameraPreset,
    onResetCameraPreset,
}: IAntharaCanvas3DProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    const [hoveredNode, setHoveredNode] = useState<IArchNode | null>(null);
    const [mousePos, setMousePos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

    // Live Three.js references
    const sceneRef = useRef<THREE.Scene | null>(null);
    const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
    const controlsRef = useRef<OrbitControls | null>(null);
    const clickableMeshesRef = useRef<THREE.Mesh[]>([]);
    const nodeMeshesRef = useRef<
        Map<
            string,
            {
                group: THREE.Group;
                boxMesh: THREE.Mesh;
                faceMesh: THREE.Mesh;
                outline: THREE.LineSegments;
            }
        >
    >(new Map());

    const packetsRef = useRef<
        {
            mesh: THREE.Mesh;
            glowMesh: THREE.Mesh;
            curve: THREE.CatmullRomCurve3;
            progress: number;
            speed: number;
            path: IDataPath;
        }[]
    >([]);
    const pathsCurvesRef = useRef<Map<string, { curve: THREE.CatmullRomCurve3; line: THREE.Line }>>(new Map());
    const activeStepRef = useRef<IWalkthroughStep | null>(activeStep);

    // Smooth camera tween
    const cameraAnimRef = useRef<{
        isAnimating: boolean;
        startPos: THREE.Vector3;
        targetPos: THREE.Vector3;
        startLookAt: THREE.Vector3;
        targetLookAt: THREE.Vector3;
        startTime: number;
        duration: number;
    } | null>(null);

    useEffect(() => {
        activeStepRef.current = activeStep;
    }, [activeStep]);

    // Initialize Three.js scene
    useEffect(() => {
        const container = containerRef.current;
        const canvas = canvasRef.current;
        if (!container || !canvas) return;

        // 1. Scene & Camera (Soft studio background for slab contrast)
        const scene = new THREE.Scene();
        sceneRef.current = scene;
        scene.background = new THREE.Color(0xf8fafc); // Clean off-white studio canvas

        const width = container.clientWidth;
        const height = container.clientHeight;
        const camera = new THREE.PerspectiveCamera(40, width / height, 1, 3000);
        cameraRef.current = camera;
        // Perfect front-on architectural framing: slabs are large, prominent, and legible
        camera.position.set(0, -15, 215);
        camera.lookAt(0, -15, 0);

        // 2. WebGL Renderer
        const renderer = new THREE.WebGLRenderer({
            canvas,
            antialias: true,
            powerPreference: 'high-performance',
        });
        renderer.setSize(width, height);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.toneMapping = THREE.NoToneMapping;
        renderer.outputColorSpace = THREE.SRGBColorSpace;

        // 3. Orbit Controls
        const controls = new OrbitControls(camera, canvas);
        controlsRef.current = controls;
        controls.enableDamping = true;
        controls.dampingFactor = 0.08;
        controls.rotateSpeed = 0.8;
        controls.zoomSpeed = 1.2;
        controls.panSpeed = 0.8;
        controls.maxDistance = 800;
        controls.minDistance = 40;
        controls.target.set(0, -12, 0);

        // 4. Lighting: Clean studio light setup
        const ambientLight = new THREE.AmbientLight(0xffffff, 1.8);
        scene.add(ambientLight);

        const dirLight = new THREE.DirectionalLight(0xffffff, 1.2);
        dirLight.position.set(60, 100, 180);
        scene.add(dirLight);

        // 5. Top Header Badge: "🛡️ YOUR NETWORK / VPC / ON-PREMISES"
        const vpcBadgeMesh = createVpcBadgeMesh('🛡️  YOUR NETWORK / VPC / ON-PREMISES', 114, 8.5);
        vpcBadgeMesh.position.set(0, 88, 0.5);
        scene.add(vpcBadgeMesh);

        // 6. Outside Boundary Background Tint Plate (Bottom zone: Y < -66)
        const boundaryBgGeo = new THREE.PlaneGeometry(210, 68);
        const boundaryBgMat = new THREE.MeshBasicMaterial({
            color: new THREE.Color(0xecfdf5), // Soft pastel emerald
            side: THREE.DoubleSide,
            transparent: false,
            opacity: 1.0,
            depthWrite: true,
        });
        const boundaryBgMesh = new THREE.Mesh(boundaryBgGeo, boundaryBgMat);
        boundaryBgMesh.position.set(0, -96, -4.0);
        scene.add(boundaryBgMesh);

        // Boundary Division Line & Label: "Masked prompts leave the boundary"
        const boundaryLineGeo = new THREE.BufferGeometry().setFromPoints([
            new THREE.Vector3(-100, -66, -1.0),
            new THREE.Vector3(100, -66, -1.0),
        ]);
        const boundaryLineMat = new THREE.LineDashedMaterial({
            color: new THREE.Color(0x059669),
            dashSize: 3,
            gapSize: 2,
            linewidth: 2,
        });
        const boundaryLine = new THREE.Line(boundaryLineGeo, boundaryLineMat);
        boundaryLine.computeLineDistances();
        scene.add(boundaryLine);

        // Boundary Division Text Plaque in 3D
        const boundaryLabel = createPlaqueMesh(
            'Masked prompts leave the boundary  ↓',
            'Zero PHI / secrets cross this perimeter',
            84,
            6.8,
            '#059669',
            true
        );
        boundaryLabel.position.set(-28, -66, 0.5);
        scene.add(boundaryLabel);

        // Red Outer Boundary Badge
        const llmBadgeMesh = createRedBoundaryBadge('☁  OUTSIDE YOUR BOUNDARY · LLM PROVIDERS', 110, 7.5);
        llmBadgeMesh.position.set(0, -119, 0.6);
        scene.add(llmBadgeMesh);

        // 7. Anthara Brackets: stylized "[" and "]" framing Conduct Layer & Agents
        const bracketsGroup = createAntharaBracketsGroup();
        scene.add(bracketsGroup);

        // Brand Mark: "[anthara]" on top left of Conduct Layer
        const brandMarkMesh = createBrandMarkMesh();
        brandMarkMesh.position.set(-72, 38, 0.5);
        scene.add(brandMarkMesh);

        // 8. Build Architectural Tiers (3D Slabs with border outlines & dimension brackets)
        ARCH_TIERS.forEach((tier) => {
            const tierGroup = new THREE.Group();
            tierGroup.position.set(tier.position[0], tier.position[1], tier.position[2]);

            const [w, h] = [tier.size[0], tier.size[1]];

            // 3D Slab Box Body with clean tint
            const slabGeo = new THREE.BoxGeometry(w, h, 2.0);
            const slabMat = new THREE.MeshBasicMaterial({
                color: new THREE.Color(tier.color || 0xffffff),
                transparent: false,
                opacity: 1.0,
                depthWrite: true,
            });
            const slabMesh = new THREE.Mesh(slabGeo, slabMat);
            slabMesh.position.z = -1.5;
            tierGroup.add(slabMesh);

            // Crisp Slab Border Outline
            const borderGeo = new THREE.EdgesGeometry(slabGeo);
            const borderMat = new THREE.LineBasicMaterial({
                color: new THREE.Color(tier.borderColor),
                transparent: false,
                opacity: 1.0,
            });
            const borderLine = new THREE.LineSegments(borderGeo, borderMat);
            borderLine.position.z = -1.5;
            tierGroup.add(borderLine);

            // 3D Tier Label Plaque at top center of tier bracket (dynamically sized to fit title text)
            const tierTitlePlaque = createTierTitlePlaque(tier.title, tier.borderColor, tier.tagColor || '#475569');
            tierTitlePlaque.position.set(0, h / 2 - 0.5, 0.4);
            tierGroup.add(tierTitlePlaque);

            const plaqueW = (tierTitlePlaque.userData?.plaqueWidth as number) || 44;
            const halfPlaqueW = plaqueW / 2 + 1.5;

            // 3D Section Dimension Bracket Line: split into left & right wings so line never cuts through the plaque
            const leftPoints = [
                new THREE.Vector3(-w / 2 + 4, h / 2 - 2, 0.2),
                new THREE.Vector3(-w / 2 + 4, h / 2 - 0.5, 0.2),
                new THREE.Vector3(-halfPlaqueW, h / 2 - 0.5, 0.2),
            ];
            const rightPoints = [
                new THREE.Vector3(halfPlaqueW, h / 2 - 0.5, 0.2),
                new THREE.Vector3(w / 2 - 4, h / 2 - 0.5, 0.2),
                new THREE.Vector3(w / 2 - 4, h / 2 - 2, 0.2),
            ];
            const bracketLineMat = new THREE.LineBasicMaterial({
                color: new THREE.Color(tier.borderColor),
                linewidth: 2,
            });
            const leftLine = new THREE.Line(new THREE.BufferGeometry().setFromPoints(leftPoints), bracketLineMat);
            const rightLine = new THREE.Line(new THREE.BufferGeometry().setFromPoints(rightPoints), bracketLineMat);
            tierGroup.add(leftLine);
            tierGroup.add(rightLine);

            scene.add(tierGroup);
        });

        // 9. Build Architecture 3D Nodes (Pure 3D Volumetric Blocks with high-res CanvasTextures)
        const nodeMap = new Map<
            string,
            {
                group: THREE.Group;
                boxMesh: THREE.Mesh;
                faceMesh: THREE.Mesh;
                outline: THREE.LineSegments;
            }
        >();
        const nodePositionMap = new Map<string, THREE.Vector3>();
        const clickableMeshes: THREE.Mesh[] = [];

        ARCH_NODES.forEach((node) => {
            const group = new THREE.Group();
            group.position.set(node.position[0], node.position[1], node.position[2]);
            nodePositionMap.set(node.id, new THREE.Vector3(...node.position));

            const [w, h, d] = node.size;

            // 3D Box Body
            const boxGeo = new THREE.BoxGeometry(w, h, d);
            const boxMat = new THREE.MeshBasicMaterial({
                color: new THREE.Color(0xffffff),
                transparent: false,
                opacity: 1.0,
            });
            const boxMesh = new THREE.Mesh(boxGeo, boxMat);
            boxMesh.userData = { nodeId: node.id };
            group.add(boxMesh);
            clickableMeshes.push(boxMesh);

            // Crisp Box Edge Outline
            const edgesGeo = new THREE.EdgesGeometry(boxGeo);
            const edgesMat = new THREE.LineBasicMaterial({
                color: new THREE.Color(node.accentColor),
                transparent: false,
                opacity: 1.0,
            });
            const outline = new THREE.LineSegments(edgesGeo, edgesMat);
            group.add(outline);

            // Front Face High-Resolution Canvas Card Texture (Bold, Crystal-Clear Vector Text)
            const faceGeo = new THREE.PlaneGeometry(w - 0.2, h - 0.2);
            const faceTexture = createNodeFaceTexture(node);
            const faceMat = new THREE.MeshBasicMaterial({
                map: faceTexture,
                transparent: false,
                depthWrite: true,
                polygonOffset: true,
                polygonOffsetFactor: -1,
                polygonOffsetUnits: -1,
            });
            const faceMesh = new THREE.Mesh(faceGeo, faceMat);
            faceMesh.position.set(0, 0, d / 2 + 0.05);
            faceMesh.userData = { nodeId: node.id };
            group.add(faceMesh);
            clickableMeshes.push(faceMesh);

            // Status Beacon (LED sphere in top right corner)
            const beaconGeo = new THREE.SphereGeometry(0.75, 12, 12);
            const beaconMat = new THREE.MeshBasicMaterial({ color: new THREE.Color(node.accentColor) });
            const beaconMesh = new THREE.Mesh(beaconGeo, beaconMat);
            beaconMesh.position.set(w / 2 - 1.4, h / 2 - 1.4, d / 2 + 0.35);
            group.add(beaconMesh);

            scene.add(group);
            nodeMap.set(node.id, { group, boxMesh, faceMesh, outline });
        });

        nodeMeshesRef.current = nodeMap;
        clickableMeshesRef.current = clickableMeshes;

        // 10. Build Conduits / Splines between Nodes with in-flight packet labels
        const pathMap = new Map<string, { curve: THREE.CatmullRomCurve3; line: THREE.Line }>();
        ARCH_DATA_PATHS.forEach((path) => {
            const fromPos = nodePositionMap.get(path.fromNode);
            const toPos = nodePositionMap.get(path.toNode);
            if (!fromPos || !toPos) return;

            const midPos = new THREE.Vector3().addVectors(fromPos, toPos).multiplyScalar(0.5);
            const dist = fromPos.distanceTo(toPos);
            midPos.z += Math.min(dist * 0.16, 12);

            const curve = new THREE.CatmullRomCurve3([
                fromPos.clone().add(new THREE.Vector3(0, 0, 3)),
                midPos,
                toPos.clone().add(new THREE.Vector3(0, 0, 3)),
            ]);

            const points = curve.getPoints(40);
            const lineGeo = new THREE.BufferGeometry().setFromPoints(points);
            const lineMat = new THREE.LineBasicMaterial({
                color: new THREE.Color(path.color),
                transparent: true,
                opacity: 0.45,
            });
            const line = new THREE.Line(lineGeo, lineMat);
            scene.add(line);
            pathMap.set(path.id, { curve, line });

            // Core packet sphere
            const packetGeo = new THREE.SphereGeometry(1.2, 12, 12);
            const packetMat = new THREE.MeshBasicMaterial({
                color: new THREE.Color(path.color),
                transparent: false,
                opacity: 1.0,
            });
            const packetMesh = new THREE.Mesh(packetGeo, packetMat);
            packetMesh.position.copy(fromPos);
            scene.add(packetMesh);

            // Surrounding luminous glow sphere
            const glowGeo = new THREE.SphereGeometry(2.0, 10, 10);
            const glowMat = new THREE.MeshBasicMaterial({
                color: new THREE.Color(path.color),
                transparent: true,
                opacity: 0.35,
            });
            const glowMesh = new THREE.Mesh(glowGeo, glowMat);
            glowMesh.position.copy(fromPos);
            scene.add(glowMesh);

            packetsRef.current.push({
                mesh: packetMesh,
                glowMesh,
                curve,
                progress: Math.random(),
                speed: 0.003,
                path,
            });
        });
        pathsCurvesRef.current = pathMap;

        // 11. Mouse Raycaster for Hover and Click Interaction
        const raycaster = new THREE.Raycaster();
        const pointer = new THREE.Vector2();

        function handlePointerMove(e: MouseEvent) {
            const rect = canvas!.getBoundingClientRect();
            pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
            pointer.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

            setMousePos({ x: e.clientX - rect.left, y: e.clientY - rect.top });

            raycaster.setFromCamera(pointer, camera);
            const intersects = raycaster.intersectObjects(clickableMeshesRef.current);

            if (intersects.length > 0) {
                const hit = intersects[0];
                const nodeId = hit.object.userData?.nodeId;
                const found = ARCH_NODES.find((n) => n.id === nodeId);
                if (found) {
                    setHoveredNode(found);
                    canvas!.style.cursor = 'pointer';
                    return;
                }
            }

            setHoveredNode(null);
            canvas!.style.cursor = 'default';
        }

        function handlePointerDown(e: MouseEvent) {
            if (e.button !== 0) return; // Left click only

            const rect = canvas!.getBoundingClientRect();
            pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
            pointer.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

            raycaster.setFromCamera(pointer, camera);
            const intersects = raycaster.intersectObjects(clickableMeshesRef.current);

            if (intersects.length > 0) {
                const hit = intersects[0];
                const nodeId = hit.object.userData?.nodeId;
                const found = ARCH_NODES.find((n) => n.id === nodeId);
                if (found) {
                    onSelectNode(found);
                    focusCameraOnNode(found);
                }
            }
        }

        canvas.addEventListener('mousemove', handlePointerMove);
        canvas.addEventListener('mousedown', handlePointerDown);

        // 12. Resize Observer
        const resizeObserver = new ResizeObserver(() => {
            if (!containerRef.current || !renderer || !camera) return;
            const w = containerRef.current.clientWidth;
            const h = containerRef.current.clientHeight;
            camera.aspect = w / h;
            camera.updateProjectionMatrix();
            renderer.setSize(w, h);
        });
        resizeObserver.observe(container);

        // 13. Animation Loop
        let animationFrameId: number;

        function animate() {
            animationFrameId = requestAnimationFrame(animate);

            // Smooth Camera Transition Tween
            if (cameraAnimRef.current && cameraAnimRef.current.isAnimating) {
                const anim = cameraAnimRef.current;
                const elapsed = performance.now() - anim.startTime;
                const t = Math.min(elapsed / anim.duration, 1.0);
                const ease = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

                camera.position.lerpVectors(anim.startPos, anim.targetPos, ease);
                controls.target.lerpVectors(anim.startLookAt, anim.targetLookAt, ease);

                if (t >= 1.0) {
                    anim.isAnimating = false;
                }
            }

            controls.update();

            // Animate In-Flight Packets along conduits
            packetsRef.current.forEach((p) => {
                p.progress += p.speed;
                if (p.progress > 1) p.progress = 0;
                const point = p.curve.getPointAt(p.progress);
                p.mesh.position.copy(point);
                p.glowMesh.position.copy(point);
            });

            renderer.render(scene, camera);
        }

        animate();

        return () => {
            cancelAnimationFrame(animationFrameId);
            resizeObserver.disconnect();
            canvas.removeEventListener('mousemove', handlePointerMove);
            canvas.removeEventListener('mousedown', handlePointerDown);
            renderer.dispose();
        };
    }, []);

    // Focus camera on node helper
    function focusCameraOnNode(node: IArchNode) {
        if (!cameraRef.current || !controlsRef.current) return;
        const targetLookAt = new THREE.Vector3(...node.position);
        const targetPos = targetLookAt.clone().add(new THREE.Vector3(0, 0, 75));

        cameraAnimRef.current = {
            isAnimating: true,
            startPos: cameraRef.current.position.clone(),
            targetPos,
            startLookAt: controlsRef.current.target.clone(),
            targetLookAt,
            startTime: performance.now(),
            duration: 900,
        };
    }

    // React to Walkthrough Step Changes (Highlights nodes & conduits without moving camera away)
    useEffect(() => {
        if (!activeStep) return;

        // Highlight active nodes in this step
        nodeMeshesRef.current.forEach((val, id) => {
            const isActive = activeStep.activeNodeIds.includes(id);
            if (isActive) {
                val.group.position.z = 3.0; // elevate active node in 3D
                val.outline.scale.set(1.05, 1.05, 1.05);
            } else {
                val.group.position.z = 0;
                val.outline.scale.set(1.0, 1.0, 1.0);
            }
        });

        // Highlight active paths in this step
        packetsRef.current.forEach((p) => {
            const isPathActive =
                p.path.activeInSteps.includes(activeStep.id) &&
                (p.path.scenario === 'all' || p.path.scenario === activeScenarioId);
            p.mesh.visible = isPathActive;
            p.glowMesh.visible = isPathActive;
            const pathEntry = pathsCurvesRef.current.get(p.path.id);
            if (pathEntry) {
                (pathEntry.line.material as THREE.LineBasicMaterial).opacity = isPathActive ? 0.95 : 0.2;
            }
            p.speed = isPathActive ? 0.005 : 0.002;
        });
    }, [activeStep, activeScenarioId]);

    // React to Selected Node
    useEffect(() => {
        if (!selectedNodeId) return;
        const node = ARCH_NODES.find((n) => n.id === selectedNodeId);
        if (node) {
            focusCameraOnNode(node);
        }
    }, [selectedNodeId]);

    // React to Camera Presets
    useEffect(() => {
        if (!cameraPreset || !cameraRef.current || !controlsRef.current) return;

        let targetPos = new THREE.Vector3(0, -15, 215);
        let targetLookAt = new THREE.Vector3(0, -15, 0);

        if (cameraPreset === 'overview') {
            targetPos.set(0, -15, 215);
            targetLookAt.set(0, -15, 0);
        } else if (cameraPreset === 'isometric') {
            // Gentle, iconic 3D Isometric View (like bbycroft/llm-viz)
            targetPos.set(-35, -45, 250);
            targetLookAt.set(0, -10, 0);
        } else if (cameraPreset === 'ide_assistants' || cameraPreset === 'tier_ide') {
            targetPos.set(0, 68, 140);
            targetLookAt.set(0, 68, 0);
        } else if (cameraPreset === 'conduct' || cameraPreset === 'tier_context') {
            targetPos.set(-31, 10, 150);
            targetLookAt.set(-31, 10, 0);
        } else if (cameraPreset === 'agents') {
            targetPos.set(59, 10, 130);
            targetLookAt.set(59, 10, 0);
        } else if (cameraPreset === 'mcp_systems' || cameraPreset === 'tier_ast') {
            targetPos.set(0, -42, 150);
            targetLookAt.set(0, -42, 0);
        } else if (cameraPreset === 'llm_providers' || cameraPreset === 'tier_governance') {
            targetPos.set(0, -96, 140);
            targetLookAt.set(0, -96, 0);
        } else if (cameraPreset === 'top_down') {
            targetPos.set(0, 240, 50);
            targetLookAt.set(0, -12, 0);
        }

        cameraAnimRef.current = {
            isAnimating: true,
            startPos: cameraRef.current.position.clone(),
            targetPos,
            startLookAt: controlsRef.current.target.clone(),
            targetLookAt,
            startTime: performance.now(),
            duration: 1000,
        };

        if (onResetCameraPreset) {
            onResetCameraPreset();
        }
    }, [cameraPreset, onResetCameraPreset]);

    return (
        <div ref={containerRef} className="relative w-full h-full select-none overflow-hidden bg-slate-50">
            {/* The 3D WebGL Canvas */}
            <canvas ref={canvasRef} className="w-full h-full block focus:outline-none" />

            {/* Orbit / Navigation Reminder (Floating Top Right) */}
            <div className="absolute top-3 right-4 pointer-events-none z-10 text-[11px] text-slate-500 bg-white/90 backdrop-blur px-3 py-1.5 rounded-lg border border-slate-200 shadow-xs flex items-center gap-2 font-mono">
                <span>Left Drag: Orbit</span>
                <span>•</span>
                <span>Right Drag: Pan</span>
                <span>•</span>
                <span>Wheel: Zoom</span>
            </div>

            {/* Interactive Vector Hover Tooltip (HUD) */}
            {hoveredNode && (
                <div
                    className="absolute pointer-events-none z-40 bg-white/95 backdrop-blur-md rounded-xl border-2 shadow-2xl p-3.5 max-w-sm transition-opacity duration-150 animate-fade-in text-slate-900"
                    style={{
                        left: `${Math.min(mousePos.x + 18, (containerRef.current?.clientWidth || 800) - 340)}px`,
                        top: `${Math.min(mousePos.y + 18, (containerRef.current?.clientHeight || 600) - 220)}px`,
                        borderColor: hoveredNode.accentColor,
                    }}
                >
                    <div className="flex items-center justify-between gap-2 pb-2 mb-2 border-b border-slate-100">
                        <div className="flex items-center gap-1.5">
                            <span className="text-base font-bold" style={{ color: hoveredNode.accentColor }}>
                                {getNodeIcon(hoveredNode.id)}
                            </span>
                            <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400">
                                {hoveredNode.category}
                            </span>
                        </div>
                        <span className="text-[10px] px-1.5 py-0.5 rounded font-mono font-bold bg-slate-100 text-slate-600">
                            Click to Inspect
                        </span>
                    </div>

                    <div className="text-sm font-extrabold text-slate-950 mb-0.5">{hoveredNode.title}</div>
                    <div className="text-xs font-semibold text-slate-600 mb-2">{hoveredNode.subtitle}</div>

                    <p className="text-[11px] text-slate-500 leading-relaxed mb-2 line-clamp-3">
                        {hoveredNode.description}
                    </p>

                    {hoveredNode.metrics && hoveredNode.metrics.length > 0 && (
                        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 text-[11px] font-mono">
                            {hoveredNode.metrics.slice(0, 2).map((m, idx) => (
                                <div key={idx} className="bg-slate-50 p-1.5 rounded border border-slate-100">
                                    <div className="text-[9px] uppercase text-slate-400 truncate">{m.label}</div>
                                    <div className="font-bold text-slate-800 truncate">{m.value}</div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

// ── Node Title & Subtitle Line Splitters (Maximizes Legible Font Size) ───────
function getTitleLines(node: IArchNode): string[] {
    if (node.id === 'node_engineers_ide') {
        return ['Your engineers,', 'their IDE'];
    }
    if (node.id === 'node_anthara_plugin') {
        return ['Anthara', 'Plugin'];
    }
    if (node.id === 'node_coding_assistants') {
        return ['Coding Assistants'];
    }
    if (node.id === 'node_org_context') {
        return ['Org-Wide', 'Context'];
    }
    if (node.id === 'node_compliance_packs') {
        return ['Compliance', 'Packs'];
    }
    if (node.id === 'node_phi_pii_masked') {
        return ['PHI / PII', 'Masked'];
    }
    if (node.id === 'node_tool_governance') {
        return ['Tool & Agent', 'Governance'];
    }
    if (node.id === 'node_agent_pr_reviews') {
        return ['PR Reviews', 'Gate'];
    }
    if (node.id === 'node_agent_jira_pr') {
        return ['Jira to PR', 'Pipeline'];
    }
    if (node.id === 'node_agent_rca_docs') {
        return ['RCA Docs', 'Agent'];
    }
    if (node.id === 'node_agent_custom_yaml') {
        return ['Custom YAML', 'Agents'];
    }
    if (node.id === 'node_mcp_databases') {
        return ['Databases', '(via MCP)'];
    }
    if (node.id === 'node_mcp_github') {
        return ['GitHub Context', '(via MCP)'];
    }
    if (node.id === 'node_mcp_internal_apis') {
        return ['Internal APIs', '(via MCP)'];
    }
    if (node.id === 'node_systems_acted_on') {
        return ['SYSTEMS YOUR AGENTS ACT ON'];
    }
    if (node.id === 'node_llm_bedrock') {
        return ['AWS Bedrock'];
    }
    if (node.id === 'node_anthropic') {
        return ['Anthropic Direct'];
    }
    if (node.id === 'node_azure_openai') {
        return ['Azure OpenAI'];
    }
    return [node.title];
}

function getSubtitleLines(node: IArchNode): string[] {
    if (node.id === 'node_engineers_ide') {
        return ['VS Code · Cursor', 'JetBrains'];
    }
    if (node.id === 'node_anthara_plugin') {
        return ['In-IDE Conduct Engine', 'Zero Latency'];
    }
    if (node.id === 'node_org_context') {
        return ['Architecture Decisions', 'ADRs & Domain Rules'];
    }
    if (node.id === 'node_compliance_packs') {
        return ['HIPAA · PCI · WCAG', 'SOC 2 · FDA'];
    }
    if (node.id === 'node_phi_pii_masked') {
        return ['30+ Entity Types', 'Zero PHI Egress'];
    }
    if (node.id === 'node_tool_governance') {
        return ['DELETE Blocked Org-Wide', 'Query Governance'];
    }
    if (node.id === 'node_agent_pr_reviews') {
        return ['Autonomous Gate', 'AST Verification'];
    }
    if (node.id === 'node_agent_jira_pr') {
        return ['Spec-Driven Pipeline', 'Automated PRs'];
    }
    if (node.id === 'node_agent_rca_docs') {
        return ['Post-Mortem Synthesis', 'Privacy Boundaries'];
    }
    if (node.id === 'node_agent_custom_yaml') {
        return ['Domain-Specific', 'YAML Workflows'];
    }
    if (node.id === 'node_mcp_databases') {
        return ['Postgres · Mongo', 'Snowflake'];
    }
    if (node.id === 'node_mcp_github') {
        return ['Repos · Commits', 'Issues · Diffs'];
    }
    if (node.id === 'node_mcp_internal_apis') {
        return ['Microservices &', 'Enterprise SDKs'];
    }
    if (node.id === 'node_llm_bedrock') {
        return ['Claude 3.5 Sonnet', 'VPC Private Enclave'];
    }
    if (node.id === 'node_anthropic') {
        return ['Claude 3.5 Sonnet', 'Zero Data Retention'];
    }
    if (node.id === 'node_azure_openai') {
        return ['GPT-4o Enterprise', 'Private Endpoint'];
    }
    return [node.subtitle];
}

// ── High-Resolution Canvas Card Texture Generator (Crystal Clear Bold Text) ───
function createNodeFaceTexture(node: IArchNode): THREE.CanvasTexture {
    const [width, height] = [node.size[0], node.size[1]];
    const isWide = width > 60;
    const W = isWide ? 1600 : 1024;
    const H = Math.round((height / width) * W);
    const canvas = document.createElement('canvas');
    canvas.width = W;
    canvas.height = H;
    const ctx = canvas.getContext('2d')!;

    // 1. Pure white background card
    ctx.fillStyle = '#ffffff';
    roundRect(ctx, 4, 4, W - 8, H - 8, 20);
    ctx.fill();

    // 2. Accent border stroke
    ctx.strokeStyle = node.accentColor;
    ctx.lineWidth = 6;
    roundRect(ctx, 4, 4, W - 8, H - 8, 20);
    ctx.stroke();

    // 3. Top accent strip
    ctx.fillStyle = node.accentColor;
    roundRect(ctx, 4, 4, W - 8, isWide ? 20 : 16, 8);
    ctx.fill();

    const hasPills =
        node.id === 'node_coding_assistants' ||
        node.id === 'node_systems_acted_on' ||
        node.id === 'node_anthropic' ||
        node.id === 'node_aws_bedrock' ||
        node.id === 'node_azure_openai';

    // 4. Compact Category Badge in top-left
    const iconChar = getNodeIcon(node.id);
    const badgeW = isWide ? 300 : 250;
    const badgeH = isWide ? 48 : 42;
    ctx.fillStyle = node.accentColor + '18';
    roundRect(ctx, 28, 24, badgeW, badgeH, 10);
    ctx.fill();
    ctx.strokeStyle = node.accentColor + '50';
    ctx.lineWidth = 2.5;
    roundRect(ctx, 28, 24, badgeW, badgeH, 10);
    ctx.stroke();

    ctx.font = `bold ${isWide ? 28 : 24}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
    ctx.fillStyle = node.accentColor;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText(`${iconChar}  ${node.category.toUpperCase()}`, 40, 24 + badgeH / 2);

    // 5. Title (Bold, High Contrast, Deep Black)
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#090d16';

    const titleLines = getTitleLines(node);
    let titleFontSize = isWide ? 72 : titleLines.length === 1 ? 135 : 120;
    if (node.id === 'node_systems_acted_on') {
        titleFontSize = 70;
    }
    if (node.id === 'node_coding_assistants') {
        titleFontSize = 72;
    }

    ctx.font = `bold ${titleFontSize}px -apple-system, BlinkMacSystemFont, "Inter", "Segoe UI", Roboto, sans-serif`;

    // Ensure title lines fit comfortably within available width
    for (const line of titleLines) {
        while (ctx.measureText(line).width > W - 70 && titleFontSize > 50) {
            titleFontSize -= 2;
            ctx.font = `bold ${titleFontSize}px -apple-system, BlinkMacSystemFont, "Inter", "Segoe UI", Roboto, sans-serif`;
        }
    }

    if (hasPills) {
        // Wide card layout with bottom badges: Title centered in upper portion
        const titleY = isWide ? Math.round(H * 0.38) : Math.round(H * 0.34);
        const titleLineHeight = Math.round(titleFontSize * 1.15);
        if (titleLines.length === 1) {
            ctx.fillText(titleLines[0], W / 2, titleY);
        } else {
            const startY = titleY - ((titleLines.length - 1) * titleLineHeight) / 2;
            titleLines.forEach((line, idx) => {
                ctx.fillText(line, W / 2, startY + idx * titleLineHeight);
            });
        }
    } else {
        // Standard card layout: Title centered in upper section
        const titleCenterY = Math.round(H * 0.40);
        const titleLineHeight = Math.round(titleFontSize * 1.16);
        if (titleLines.length === 1) {
            ctx.fillText(titleLines[0], W / 2, titleCenterY);
        } else {
            const startY = titleCenterY - ((titleLines.length - 1) * titleLineHeight) / 2;
            titleLines.forEach((line, idx) => {
                ctx.fillText(line, W / 2, startY + idx * titleLineHeight);
            });
        }

        // 6. Clean Divider Line
        const dividerY = Math.round(H * 0.62);
        ctx.strokeStyle = '#cbd5e1';
        ctx.lineWidth = 3.5;
        ctx.beginPath();
        ctx.moveTo(36, dividerY);
        ctx.lineTo(W - 36, dividerY);
        ctx.stroke();

        // 7. Subtitle
        const subLines = getSubtitleLines(node);
        let subFontSize = subLines.length > 1 ? 58 : 64;
        ctx.font = `bold ${subFontSize}px -apple-system, BlinkMacSystemFont, "Inter", "Segoe UI", Roboto, sans-serif`;

        for (const line of subLines) {
            while (ctx.measureText(line).width > W - 70 && subFontSize > 34) {
                subFontSize -= 2;
                ctx.font = `bold ${subFontSize}px -apple-system, BlinkMacSystemFont, "Inter", "Segoe UI", Roboto, sans-serif`;
            }
        }

        ctx.fillStyle = '#1e293b';
        const subCenterY = Math.round((dividerY + H) / 2);
        const subLineHeight = Math.round(subFontSize * 1.22);
        if (subLines.length === 1) {
            ctx.fillText(subLines[0], W / 2, subCenterY);
        } else {
            const startY = subCenterY - ((subLines.length - 1) * subLineHeight) / 2;
            subLines.forEach((line, idx) => {
                ctx.fillText(line, W / 2, startY + idx * subLineHeight);
            });
        }
    }

    // 8. Specialized Badges for Coding Assistants
    if (node.id === 'node_coding_assistants') {
        const assistants = [
            { name: 'Claude Code', bg: '#fef3c7', text: '#92400e', border: '#fde68a' },
            { name: 'Cursor', bg: '#f1f5f9', text: '#0f172a', border: '#cbd5e1' },
            { name: 'GitHub Copilot', bg: '#f3e8ff', text: '#6b21a8', border: '#e9d5ff' },
            { name: 'Codex', bg: '#e0f2fe', text: '#0369a1', border: '#bae6fd' },
        ];
        const pillH = isWide ? 62 : 46;
        const pillY = isWide ? H - 88 : H - 58;
        const pillGap = isWide ? 20 : 14;
        const sidePad = isWide ? 44 : 26;
        const pillW = Math.round((W - sidePad * 2 - (assistants.length - 1) * pillGap) / assistants.length);
        assistants.forEach((a, i) => {
            const x = sidePad + i * (pillW + pillGap);
            ctx.fillStyle = a.bg;
            roundRect(ctx, x, pillY, pillW, pillH, 10);
            ctx.fill();
            ctx.strokeStyle = a.border;
            ctx.lineWidth = 2.5;
            roundRect(ctx, x, pillY, pillW, pillH, 10);
            ctx.stroke();

            ctx.fillStyle = a.text;
            ctx.font = `bold ${isWide ? 38 : 28}px -apple-system, BlinkMacSystemFont, "Inter", "Segoe UI", Roboto, sans-serif`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(a.name, x + pillW / 2, pillY + pillH / 2);
        });
    }

    // 9. Specialized Badges for Systems Acted On
    if (node.id === 'node_systems_acted_on') {
        const systems = [
            { name: 'git', bg: '#fff7ed', text: '#c2410c', border: '#fdba74' },
            { name: 'Jira', bg: '#eff6ff', text: '#1d4ed8', border: '#bfdbfe' },
            { name: 'Azure DevOps', bg: '#f0f9ff', text: '#0284c7', border: '#bae6fd' },
            { name: 'Teams', bg: '#f5f3ff', text: '#6d28d9', border: '#ddd6fe' },
            { name: 'Figma', bg: '#fdf2f8', text: '#be185d', border: '#fbcfe8' },
            { name: 'ServiceNow', bg: '#ecfdf5', text: '#047857', border: '#a7f3d0' },
            { name: '+ More', bg: '#f8fafc', text: '#475569', border: '#cbd5e1' },
        ];
        const pillH = isWide ? 58 : 42;
        const pillY = isWide ? H - 80 : H - 54;
        const pillGap = isWide ? 16 : 10;
        const sidePad = isWide ? 36 : 24;
        const pillW = Math.round((W - sidePad * 2 - (systems.length - 1) * pillGap) / systems.length);
        systems.forEach((s, i) => {
            const x = sidePad + i * (pillW + pillGap);
            ctx.fillStyle = s.bg;
            roundRect(ctx, x, pillY, pillW, pillH, 10);
            ctx.fill();
            ctx.strokeStyle = s.border;
            ctx.lineWidth = 2.5;
            roundRect(ctx, x, pillY, pillW, pillH, 10);
            ctx.stroke();

            ctx.fillStyle = s.text;
            ctx.font = `bold ${isWide ? 34 : 24}px -apple-system, BlinkMacSystemFont, "Inter", "Segoe UI", Roboto, sans-serif`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(s.name, x + pillW / 2, pillY + pillH / 2);
        });
    }

    // 10. Specialized Badges for LLM Providers
    if (node.id === 'node_anthropic' || node.id === 'node_aws_bedrock' || node.id === 'node_azure_openai') {
        const pillH = 48;
        const pillY = H - 66;
        ctx.fillStyle = '#dcfce7';
        ctx.strokeStyle = '#86efac';
        ctx.lineWidth = 2.5;
        roundRect(ctx, W / 2 - 190, pillY, 380, pillH, 10);
        ctx.fill();
        ctx.stroke();

        ctx.font = 'bold 28px -apple-system, BlinkMacSystemFont, "Inter", "Segoe UI", Roboto, sans-serif';
        ctx.fillStyle = '#15803d';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('✓ ZERO PHI EGRESS', W / 2, pillY + pillH / 2);
    }

    // Sharp, crisp texture without mipmap blurring
    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.minFilter = THREE.LinearFilter;
    texture.magFilter = THREE.LinearFilter;
    texture.generateMipmaps = false;
    texture.needsUpdate = true;
    return texture;
}

// ── Tier Title Plaque in 3D ──────────────────────────────────────────────────
function createTierTitlePlaque(title: string, borderColor: string, tagColor: string) {
    // 1. Measure text to dynamically calculate canvas width and avoid any clipping
    const testCanvas = document.createElement('canvas');
    const testCtx = testCanvas.getContext('2d')!;
    const fontSize = 42;
    testCtx.font = `bold ${fontSize}px -apple-system, BlinkMacSystemFont, "Inter", "Segoe UI", Roboto, sans-serif`;
    const measuredTextWidth = Math.ceil(testCtx.measureText(title).width);

    // Provide generous side padding (48px each side) so text is never near border
    const sidePadding = 48;
    const W = Math.max(512, measuredTextWidth + sidePadding * 2);
    const H = 84;

    const canvas = document.createElement('canvas');
    canvas.width = W;
    canvas.height = H;
    const ctx = canvas.getContext('2d')!;

    // Pure white background pill
    ctx.fillStyle = '#ffffff';
    roundRect(ctx, 4, 4, W - 8, H - 8, 16);
    ctx.fill();

    // Accent border
    ctx.strokeStyle = borderColor;
    ctx.lineWidth = 4;
    roundRect(ctx, 4, 4, W - 8, H - 8, 16);
    ctx.stroke();

    // High contrast crisp text centered
    ctx.font = `bold ${fontSize}px -apple-system, BlinkMacSystemFont, "Inter", "Segoe UI", Roboto, sans-serif`;
    ctx.fillStyle = tagColor;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(title, W / 2, H / 2);

    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.minFilter = THREE.LinearFilter;
    texture.magFilter = THREE.LinearFilter;
    texture.generateMipmaps = false;

    // 3D width proportional to pixel width (~11.5 px per 3D unit)
    const geoWidth = Math.round((W / 11.5) * 10) / 10;
    const geoHeight = 6.8;
    const geo = new THREE.PlaneGeometry(geoWidth, geoHeight);
    const mat = new THREE.MeshBasicMaterial({
        map: texture,
        transparent: false,
        depthWrite: true,
        polygonOffset: true,
        polygonOffsetFactor: -1,
        polygonOffsetUnits: -1,
    });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.userData = { plaqueWidth: geoWidth };
    return mesh;
}

// ── Anthara Brackets Group: stylized "[" and "]" around conduct layer & agents
function createAntharaBracketsGroup() {
    const group = new THREE.Group();
    const bracketColor = 0x9a3412;
    const bracketMat = new THREE.LineBasicMaterial({
        color: new THREE.Color(bracketColor),
        linewidth: 4,
    });

    // Left bracket: X = -89, Y from -16 to 36
    const leftBracketPoints = [
        new THREE.Vector3(-82, 36, 0.2),
        new THREE.Vector3(-89, 36, 0.2),
        new THREE.Vector3(-89, -16, 0.2),
        new THREE.Vector3(-82, -16, 0.2),
    ];
    const leftBracketGeo = new THREE.BufferGeometry().setFromPoints(leftBracketPoints);
    const leftBracketLine = new THREE.Line(leftBracketGeo, bracketMat);
    group.add(leftBracketLine);

    // Right bracket: X = 95, Y from -16 to 36
    const rightBracketPoints = [
        new THREE.Vector3(88, 36, 0.2),
        new THREE.Vector3(95, 36, 0.2),
        new THREE.Vector3(95, -16, 0.2),
        new THREE.Vector3(88, -16, 0.2),
    ];
    const rightBracketGeo = new THREE.BufferGeometry().setFromPoints(rightBracketPoints);
    const rightBracketLine = new THREE.Line(rightBracketGeo, bracketMat);
    group.add(rightBracketLine);

    return group;
}

// ── Brand Mark "[anthara]" on top left ───────────────────────────────────────
function createBrandMarkMesh() {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 64;
    const ctx = canvas.getContext('2d')!;

    ctx.font = 'bold 48px -apple-system, BlinkMacSystemFont, "Inter", "Segoe UI", Roboto, sans-serif';
    ctx.fillStyle = '#9a3412';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText('[anthara]', 10, 32);

    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.minFilter = THREE.LinearFilter;
    texture.magFilter = THREE.LinearFilter;
    texture.generateMipmaps = false;

    const geo = new THREE.PlaneGeometry(24, 6.0);
    const mat = new THREE.MeshBasicMaterial({
        map: texture,
        transparent: true,
        depthWrite: false,
    });
    return new THREE.Mesh(geo, mat);
}

// ── Top VPC Badge Mesh ───────────────────────────────────────────────────────
function createVpcBadgeMesh(text: string, width: number, height: number) {
    const scale = 24;
    const W = Math.round(width * scale);
    const H = Math.round(height * scale);
    const canvas = document.createElement('canvas');
    canvas.width = W;
    canvas.height = H;
    const ctx = canvas.getContext('2d')!;

    ctx.fillStyle = '#9a3412';
    roundRect(ctx, 4, 4, W - 8, H - 8, 16);
    ctx.fill();

    ctx.font = 'bold 68px -apple-system, BlinkMacSystemFont, "Inter", "Segoe UI", Roboto, sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, W / 2, H / 2);

    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.minFilter = THREE.LinearFilter;
    texture.magFilter = THREE.LinearFilter;
    texture.generateMipmaps = false;

    const geo = new THREE.PlaneGeometry(width, height);
    const mat = new THREE.MeshBasicMaterial({
        map: texture,
        transparent: false,
        depthWrite: true,
    });
    return new THREE.Mesh(geo, mat);
}

// ── Red LLM Boundary Badge ───────────────────────────────────────────────────
function createRedBoundaryBadge(text: string, width: number, height: number) {
    const scale = 24;
    const W = Math.round(width * scale);
    const H = Math.round(height * scale);
    const canvas = document.createElement('canvas');
    canvas.width = W;
    canvas.height = H;
    const ctx = canvas.getContext('2d')!;

    ctx.fillStyle = '#e11d48';
    roundRect(ctx, 4, 4, W - 8, H - 8, 16);
    ctx.fill();

    ctx.font = 'bold 60px -apple-system, BlinkMacSystemFont, "Inter", "Segoe UI", Roboto, sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, W / 2, H / 2);

    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.minFilter = THREE.LinearFilter;
    texture.magFilter = THREE.LinearFilter;
    texture.generateMipmaps = false;

    const geo = new THREE.PlaneGeometry(width, height);
    const mat = new THREE.MeshBasicMaterial({
        map: texture,
        transparent: false,
        depthWrite: true,
    });
    return new THREE.Mesh(geo, mat);
}

// ── Generic Plaque Mesh ──────────────────────────────────────────────────────
function createPlaqueMesh(
    title: string,
    subtitle: string,
    width: number,
    height: number,
    accentColor: string,
    centerAlign = false
) {
    const scale = 24;
    const W = Math.round(width * scale);
    const H = Math.round(height * scale);
    const canvas = document.createElement('canvas');
    canvas.width = W;
    canvas.height = H;
    const ctx = canvas.getContext('2d')!;

    ctx.fillStyle = '#ffffff';
    roundRect(ctx, 4, 4, W - 8, H - 8, 16);
    ctx.fill();

    ctx.strokeStyle = accentColor;
    ctx.lineWidth = 4;
    roundRect(ctx, 4, 4, W - 8, H - 8, 16);
    ctx.stroke();

    ctx.textAlign = centerAlign ? 'center' : 'left';
    ctx.textBaseline = 'middle';
    ctx.font = 'bold 50px -apple-system, BlinkMacSystemFont, "Inter", "Segoe UI", Roboto, sans-serif';
    ctx.fillStyle = '#000000';
    ctx.fillText(title, centerAlign ? W / 2 : 36, H * 0.35);

    ctx.font = 'bold 36px -apple-system, BlinkMacSystemFont, "Inter", "Segoe UI", Roboto, sans-serif';
    ctx.fillStyle = '#0f172a';
    ctx.fillText(subtitle, centerAlign ? W / 2 : 36, H * 0.72);

    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.minFilter = THREE.LinearFilter;
    texture.magFilter = THREE.LinearFilter;
    texture.generateMipmaps = false;

    const geo = new THREE.PlaneGeometry(width, height);
    const mat = new THREE.MeshBasicMaterial({
        map: texture,
        transparent: false,
        depthWrite: true,
    });

    return new THREE.Mesh(geo, mat);
}

// ── Helper: Canvas Rounded Rectangle ────────────────────────────────────────
function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
    if (w < 2 * r) r = w / 2;
    if (h < 2 * r) r = h / 2;
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
}

function getNodeIcon(id: string): string {
    switch (id) {
        case 'node_engineers_ide':
            return '💻';
        case 'node_anthara_plugin':
            return '🔌';
        case 'node_coding_assistants':
            return '⚡';
        case 'node_org_context':
            return '🏛️';
        case 'node_compliance_packs':
            return '🛡️';
        case 'node_phi_masking':
            return '🔒';
        case 'node_tool_governance':
            return '⚖️';
        case 'node_pr_reviews':
            return '📝';
        case 'node_jira_to_pr':
            return '🔄';
        case 'node_rca_docs':
            return '📋';
        case 'node_custom_agents':
            return '🤖';
        case 'node_databases':
            return '🗄️';
        case 'node_github':
            return '🐙';
        case 'node_internal_apis':
            return '☁️';
        case 'node_systems_acted_on':
            return '⚙️';
        case 'node_aws_bedrock':
            return '☁️';
        case 'node_anthropic':
            return '✳️';
        case 'node_azure_openai':
            return '🔷';
        default:
            return '📦';
    }
}
