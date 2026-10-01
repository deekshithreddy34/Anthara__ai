export interface IArchNode {
    id: string;
    tierId: string;
    title: string;
    subtitle: string;
    description: string;
    category: 'client' | 'context' | 'gateway' | 'verification' | 'governance';
    position: [number, number, number]; // [x, y, z] in 3D world units
    size: [number, number, number]; // [w, h, d]
    color: string;
    accentColor: string;
    inputs: string[];
    outputs: string[];
    complianceRegulations?: string[];
    metrics?: { label: string; value: string }[];
    samplePayload?: {
        type: string;
        codeOrJson: string;
    };
    iconType?: 'ide' | 'plugin' | 'assistant' | 'context' | 'compliance' | 'mask' | 'governor' | 'mcp' | 'agent' | 'llm' | 'system';
}

export interface IArchTier {
    id: string;
    title: string;
    subtitle: string;
    position: [number, number, number];
    size: [number, number, number];
    color: string;
    borderColor: string;
    tagText?: string;
    tagColor?: string;
    tagBg?: string;
}

export interface IDataPath {
    id: string;
    fromNode: string;
    toNode: string;
    label: string;
    color: string;
    activeInSteps: number[]; // which walkthrough steps this path lights up
    scenario: 'all' | 'compliant' | 'phi_block' | 'remediation' | 'mcp_action';
    packetLabel?: string;
}

export interface IWalkthroughStep {
    id: number;
    title: string;
    tierId: string;
    activeNodeIds: string[];
    cameraPosition: [number, number, number];
    cameraTarget: [number, number, number];
    explanation: string;
    codeSnippet?: string;
    badgeText?: string;
    badgeType?: 'info' | 'success' | 'warning' | 'danger';
}

export interface IScenario {
    id: 'compliant' | 'phi_block' | 'remediation' | 'mcp_action';
    name: string;
    shortDesc: string;
    badge: string;
    steps: IWalkthroughStep[];
}

// ═════════════════════════════════════════════════════════════════════════════
// ── ARCHITECTURAL TIERS / ZONES (Direct from Anthara Website) ───────────────
// ═════════════════════════════════════════════════════════════════════════════

export const ARCH_TIERS: IArchTier[] = [
    // 1. Top Row: Coding Assistants & Developer IDE
    {
        id: 'tier_ide_assistants',
        title: 'CODING ASSISTANTS & IDE',
        subtitle: 'Your engineers, their IDE & AI coding assistants',
        position: [0, 68, 0],
        size: [184, 28, 2],
        color: '#ffffff',
        borderColor: '#e2e8f0',
        tagText: 'YOUR NETWORK / VPC / ON-PREMISES',
        tagColor: '#9a3412',
        tagBg: '#fef3c7',
    },

    // 2. Center: [anthara] THE CONDUCT LAYER
    {
        id: 'tier_conduct',
        title: '[anthara] THE CONDUCT LAYER',
        subtitle: 'Inside every moment AI decides, generates or acts. Held to the rules in real time.',
        position: [-31, 10, 0],
        size: [108, 48, 2],
        color: '#fffbeb',
        borderColor: '#f59e0b',
        tagText: 'THE CONDUCT LAYER',
        tagColor: '#9a3412',
        tagBg: '#ffedd5',
    },

    // 3. Center-Right: [anthara] AGENTS & AUTOMATION
    {
        id: 'tier_agents',
        title: 'AGENTS & AUTOMATION',
        subtitle: 'Autonomous workflows held to conduct standards',
        position: [59, 10, 0],
        size: [66, 48, 2],
        color: '#fff7ed',
        borderColor: '#f59e0b',
        tagText: 'AGENTS & AUTOMATION',
        tagColor: '#9a3412',
        tagBg: '#ffedd5',
    },

    // 4. Middle-Bottom Left: YOUR DATA & TOOLS, VIA MCP
    {
        id: 'tier_mcp',
        title: 'YOUR DATA & TOOLS, VIA MCP',
        subtitle: 'query-level governance · DELETE blocked org-wide',
        position: [-46, -42, 0],
        size: [82, 36, 2],
        color: '#f0fdfa',
        borderColor: '#14b8a6',
        tagText: 'VIA MCP',
        tagColor: '#0f766e',
        tagBg: '#ccfbf1',
    },

    // 5. Middle-Bottom Right: SYSTEMS YOUR AGENTS ACT ON
    {
        id: 'tier_systems',
        title: 'SYSTEMS YOUR AGENTS ACT ON',
        subtitle: 'Git, Jira, Azure DevOps, Teams, Figma, ServiceNow',
        position: [46, -42, 0],
        size: [96, 36, 2],
        color: '#f0f9ff',
        borderColor: '#0284c7',
        tagText: 'SYSTEM INTEGRATIONS',
        tagColor: '#0369a1',
        tagBg: '#e0f2fe',
    },

    // 6. Bottom: OUTSIDE YOUR BOUNDARY · LLM PROVIDERS
    {
        id: 'tier_llm_providers',
        title: 'OUTSIDE YOUR BOUNDARY · LLM PROVIDERS',
        subtitle: 'Masked prompts leave the boundary · Zero PHI or raw secrets egress',
        position: [0, -96, 0],
        size: [184, 36, 2],
        color: '#f0fdf4',
        borderColor: '#22c55e',
        tagText: 'OUTSIDE YOUR BOUNDARY · LLM PROVIDERS',
        tagColor: '#dc2626',
        tagBg: '#fee2e2',
    },
];

// ═════════════════════════════════════════════════════════════════════════════
// ── ARCHITECTURAL NODES (Every component from the website diagram) ───────────
// ═════════════════════════════════════════════════════════════════════════════

export const ARCH_NODES: IArchNode[] = [
    // ── Row 1: Developer IDE & Coding Assistants (Y: 68) ───────────────────
    {
        id: 'node_engineers_ide',
        tierId: 'tier_ide_assistants',
        title: 'Your engineers, their IDE',
        subtitle: 'VS Code · JetBrains · Cursor',
        description: 'Where human engineering intent originates. Developers write code, execute tests, and prompt AI assistants directly from VS Code, Cursor, and JetBrains.',
        category: 'client',
        position: [-66, 68, 2],
        size: [26, 18, 4],
        color: '#ffffff',
        accentColor: '#9a3412',
        inputs: ['Developer Keystroke', 'Prompt Intent'],
        outputs: ['Raw Intent', 'Local File Context'],
        metrics: [{ label: 'Integration', value: 'VS Code, JetBrains, Cursor' }, { label: 'Latency Overhead', value: '< 2.5ms' }],
        iconType: 'ide',
        samplePayload: {
            type: 'Client Intercept Event',
            codeOrJson: `{\n  "event": "code_generation_prompt",\n  "file": "src/services/patientVitals.ts",\n  "cursor": { "line": 42, "col": 18 },\n  "intent": "Implement batch ingestion for HL7 FHIR observation records"\n}`,
        },
    },
    {
        id: 'node_anthara_plugin',
        tierId: 'tier_ide_assistants',
        title: 'Anthara Plugin',
        subtitle: 'In-IDE Conduct Interceptor',
        description: 'Lightweight client plugin embedded in developer IDEs. Intercepts outgoing prompts and streaming responses at write-time, enabling continuous compliance without slow post-PR bottlenecks.',
        category: 'client',
        position: [-33, 68, 2],
        size: [22, 18, 4],
        color: '#ffffff',
        accentColor: '#ea580c',
        inputs: ['Raw Developer Prompt', 'Streaming Tokens'],
        outputs: ['Sanitized Envelope', 'Gutter Verification Badges'],
        metrics: [{ label: 'Mode', value: 'In-IDE Write-Time' }, { label: 'Rework Drop', value: '-68%' }],
        iconType: 'plugin',
    },
    {
        id: 'node_coding_assistants',
        tierId: 'tier_ide_assistants',
        title: 'CODING ASSISTANTS',
        subtitle: 'Claude Code · Cursor · Copilot · Codex',
        description: 'The AI coding tools engineers use day to day. Claude Code, Cursor, GitHub Copilot, and Codex are unified under the Anthara Conduct Layer without altering developer workflows.',
        category: 'client',
        position: [32, 68, 2],
        size: [96, 18, 4],
        color: '#ffffff',
        accentColor: '#0284c7',
        inputs: ['Anthara Plugin Hook', 'Developer Context'],
        outputs: ['Candidate Code Generation Requests'],
        metrics: [{ label: 'Supported Tools', value: 'Claude Code, Cursor, Copilot, Codex' }, { label: 'Tool Adoption', value: '90% DORA 2025' }],
        iconType: 'assistant',
    },

    // ── Row 2: [anthara] THE CONDUCT LAYER (Y: 3) ────────────────────────
    {
        id: 'node_org_context',
        tierId: 'tier_conduct',
        title: 'Org-wide context',
        subtitle: 'Injected into every session',
        description: 'Injects architectural guidelines, ADRs (Architectural Decision Records), vetted internal packages, and domain glossary terms automatically into every AI generation session so the model generates idiomatic company code.',
        category: 'context',
        position: [-72, 3, 2],
        size: [23, 32, 4],
        color: '#ffffff',
        accentColor: '#d97706',
        inputs: ['Repo ADRs', 'Company Coding Standards', 'Design System'],
        outputs: ['Architectural Directives', 'Approved SDK Patterns'],
        metrics: [{ label: 'ADR Adherence', value: '94.2%' }, { label: 'Hallucination Drop', value: '-85%' }],
        iconType: 'context',
        samplePayload: {
            type: 'Context Injection Block',
            codeOrJson: `{\n  "adrs": ["ADR-041: All medical payloads must use AES-GCM-256"],\n  "approvedLibraries": ["@company/crypto-vault", "@company/audit-trail"],\n  "forbiddenModules": ["crypto-js", "node-uuid", "native-md5"]\n}`,
        },
    },
    {
        id: 'node_compliance_packs',
        tierId: 'tier_conduct',
        title: 'Compliance packs',
        subtitle: 'HIPAA · PCI · WCAG · SOC 2 · FDA · ISO',
        description: 'Live regulatory rule sets encoded directly into generation constraints: HIPAA, PCI-DSS, WCAG, SOC 2 Type II, FDA SaMD 21 CFR Part 11, ISO 27001, and custom internal infosec guardrails.',
        category: 'verification',
        position: [-45, 3, 2],
        size: [23, 32, 4],
        color: '#ffffff',
        accentColor: '#7c3aed',
        inputs: ['Compliance Matrix Configuration'],
        outputs: ['Live Policy Rules', 'AST Assertions'],
        complianceRegulations: ['HIPAA §164.312', 'PCI-DSS v4.0', 'SOC 2 Type II', 'FDA SaMD', 'ISO 27001'],
        metrics: [{ label: 'Pre-configured Packs', value: '7 Major Frameworks' }, { label: 'Enforcement Mode', value: 'Point-of-Generation' }],
        iconType: 'compliance',
        samplePayload: {
            type: 'Compliance Rule Assertion',
            codeOrJson: `[HIPAA Directive §164.312(a)(2)(iv)]:\nAll data transmission containing ePHI must enforce TLS 1.3 + AES-GCM.\n[PCI-DSS Directive 3.4]:\nPrimary Account Numbers (PAN) must never appear in logs or plaintext memory buffers.`,
        },
    },
    {
        id: 'node_phi_pii_masked',
        tierId: 'tier_conduct',
        title: 'PHI / PII masked',
        subtitle: 'Across 30+ entity types (Zero Egress)',
        description: 'Scans prompts and files for Protected Health Information (PHI), PII, API tokens, database credentials, and secrets in-flight. Replaces them with synthetic cryptographic placeholders before outbound network dispatch.',
        category: 'gateway',
        position: [-18, 3, 2],
        size: [23, 32, 4],
        color: '#ffffff',
        accentColor: '#e11d48',
        inputs: ['Augmented Prompt Envelope', 'Active Editor Slices'],
        outputs: ['Sanitized Masked Prompt Stream', 'Redaction Audit Receipt'],
        complianceRegulations: ['HIPAA Safe Harbor (18 Identifiers)', 'GDPR Art. 9', 'CCPA PII'],
        metrics: [{ label: 'Detection Rate', value: '99.98%' }, { label: 'Entity Scanners', value: '30+ Types (SSN, MRN, Keys, IPs)' }],
        iconType: 'mask',
        samplePayload: {
            type: 'Synthetic Redaction',
            codeOrJson: `// Before Masking:\nconst patient = { name: "Jane Doe", ssn: "000-45-6789", diagnosis: "Acute Myocardial Infarction" };\n\n// Masked by Anthara Boundary:\nconst patient = { name: "{{SYNTH_NAME_1}}", ssn: "{{SYNTH_SSN_1}}", diagnosis: "{{SYNTH_DIAG_1}}" };`,
        },
    },
    {
        id: 'node_tool_governance',
        tierId: 'tier_conduct',
        title: 'Tool & agent governance',
        subtitle: 'Query-level on every tool call',
        description: 'Deliberately governs what every agent, tool, and MCP call is allowed to execute. Prohibits destructive operations (DROP table, format, rm, credential dump) and enforces step-up human verification.',
        category: 'governance',
        position: [9, 3, 2],
        size: [23, 32, 4],
        color: '#ffffff',
        accentColor: '#f43f5e',
        inputs: ['Agent Tool Call Spec', 'MCP Protocol Invocation'],
        outputs: ['Sandboxed Execution', 'Blocked Action Audit Event'],
        complianceRegulations: ['OWASP LLM08 (Excessive Agency)', 'SOC 2 CC6.1', 'Least-Privilege RBAC'],
        metrics: [{ label: 'Destructive Calls Blocked', value: '100%' }, { label: 'Inspection Mode', value: 'Pre-Execution Intercept' }],
        iconType: 'governor',
        samplePayload: {
            type: 'MCP Tool Block Event',
            codeOrJson: `{\n  "tool": "mcp__postgres_exec",\n  "status": "BLOCKED_BY_CONDUCT_POLICY",\n  "reason": "Destructive command 'DROP TABLE patient_audit_logs CASCADE' violates rule SEC-04.",\n  "escalation": "Step-up Human Review Required"\n}`,
        },
    },

    // ── Row 2 Right: [anthara] AGENTS & AUTOMATION (Y: 13 & Y: -5) ────────
    {
        id: 'node_agent_pr_reviews',
        tierId: 'tier_agents',
        title: 'PR reviews',
        subtitle: 'Autonomous Conduct Gate',
        description: 'Autonomous pull request review agent that verifies architecture alignment, compliance guardrails, and coding standards before merge.',
        category: 'governance',
        position: [44, 13, 2],
        size: [24, 15, 4],
        color: '#ffffff',
        accentColor: '#9a3412',
        inputs: ['Git PR Diffs', 'Conduct Rule Matrix'],
        outputs: ['Automated PR Annotations', 'Audit Badges'],
        metrics: [{ label: 'PR Review Acceleration', value: '+4.5x Faster' }],
        iconType: 'agent',
    },
    {
        id: 'node_agent_jira_pr',
        tierId: 'tier_agents',
        title: 'Jira to PR',
        subtitle: 'Spec-Driven Agentic Pipeline',
        description: 'Transforms Jira user stories and acceptance criteria directly into spec-governed pull requests with built-in compliance assertions.',
        category: 'client',
        position: [74, 13, 2],
        size: [24, 15, 4],
        color: '#ffffff',
        accentColor: '#9a3412',
        inputs: ['Jira Ticket Specifications'],
        outputs: ['Generated Implementation PR'],
        metrics: [{ label: 'Spec Adherence', value: '98.7%' }],
        iconType: 'agent',
    },
    {
        id: 'node_agent_rca_docs',
        tierId: 'tier_agents',
        title: 'RCA docs',
        subtitle: 'Automated Post-Mortem Agent',
        description: 'Synthesizes incident timelines, logs, and telemetry into detailed Root Cause Analysis (RCA) documentation under privacy boundaries.',
        category: 'context',
        position: [44, -5, 2],
        size: [24, 15, 4],
        color: '#ffffff',
        accentColor: '#9a3412',
        inputs: ['Incident Logs', 'APM Telemetry'],
        outputs: ['Structured RCA Post-Mortem'],
        metrics: [{ label: 'Documentation Time', value: '-80%' }],
        iconType: 'agent',
    },
    {
        id: 'node_agent_custom_yaml',
        tierId: 'tier_agents',
        title: 'Custom YAML agents',
        subtitle: 'Team-Defined Task Automations',
        description: 'Enables engineering teams to define custom autonomous agent workflows via declarative YAML manifests with enforced conduct guardrails.',
        category: 'client',
        position: [74, -5, 2],
        size: [24, 15, 4],
        color: '#ffffff',
        accentColor: '#9a3412',
        inputs: ['Custom Agent YAML Spec'],
        outputs: ['Autonomous Task Execution'],
        metrics: [{ label: 'Config Format', value: 'Declarative YAML' }],
        iconType: 'agent',
    },

    // ── Row 3 Left: YOUR DATA & TOOLS, VIA MCP (Y: -42) ───────────────────
    {
        id: 'node_mcp_databases',
        tierId: 'tier_mcp',
        title: 'Databases',
        subtitle: 'Postgres · MongoDB · Snowflake',
        description: 'Direct database connections via Model Context Protocol (MCP). Governed at query-level: unilateral DELETE and DROP operations are blocked org-wide.',
        category: 'context',
        position: [-72, -42, 2],
        size: [23, 20, 4],
        color: '#ffffff',
        accentColor: '#0d9488',
        inputs: ['Governed MCP SQL Query'],
        outputs: ['Sanitized Schema & Data Slice'],
        metrics: [{ label: 'Protection', value: 'DELETE Blocked Org-Wide' }],
        iconType: 'mcp',
    },
    {
        id: 'node_mcp_github',
        tierId: 'tier_mcp',
        title: 'GitHub',
        subtitle: 'Repos · Commits · Issues',
        description: 'Repo context access via MCP server. Exposes codebase AST, commit history, and existing PR templates to agents under least-privilege scoping.',
        category: 'context',
        position: [-46, -42, 2],
        size: [23, 20, 4],
        color: '#ffffff',
        accentColor: '#0d9488',
        inputs: ['Repo Query Intent'],
        outputs: ['Contextual Code Files'],
        metrics: [{ label: 'Access Level', value: 'Least-Privilege Scoped' }],
        iconType: 'mcp',
    },
    {
        id: 'node_mcp_internal_apis',
        tierId: 'tier_mcp',
        title: 'Internal APIs',
        subtitle: 'Microservices & Enterprise SDKs',
        description: 'Internal corporate REST and gRPC endpoints reachable by coding agents with strict token boundary enforcement and zero sensitive credential leaks.',
        category: 'context',
        position: [-20, -42, 2],
        size: [23, 20, 4],
        color: '#ffffff',
        accentColor: '#0d9488',
        inputs: ['API Call Specification'],
        outputs: ['Filtered API Response'],
        metrics: [{ label: 'Credential Masking', value: 'Enforced' }],
        iconType: 'mcp',
    },

    // ── Row 3 Right: SYSTEMS YOUR AGENTS ACT ON (Y: -42) ──────────────────
    {
        id: 'node_systems_acted_on',
        tierId: 'tier_systems',
        title: 'SYSTEMS YOUR AGENTS ACT ON',
        subtitle: 'Git · Jira · Azure DevOps · Teams · Figma · ServiceNow',
        description: 'Enterprise execution targets that autonomous agents interact with. Every stateful mutation is governed by Anthara to guarantee safety, reversibility, and audit evidence.',
        category: 'governance',
        position: [46, -42, 2],
        size: [88, 20, 4],
        color: '#ffffff',
        accentColor: '#0284c7',
        inputs: ['Governed Agent Action Request'],
        outputs: ['Audited State Mutation in Enterprise System'],
        metrics: [{ label: 'Platforms', value: 'Git, Jira, Azure, Teams, ServiceNow' }, { label: 'Audit Trail', value: '100% Cryptographically Logged' }],
        iconType: 'system',
    },

    // ── Row 4: OUTSIDE YOUR BOUNDARY · LLM PROVIDERS (Y: -96) ────────────
    {
        id: 'node_llm_bedrock',
        tierId: 'tier_llm_providers',
        title: 'AWS Bedrock',
        subtitle: 'Claude 3.5 Sonnet / VPC Private',
        description: 'Frontier models hosted within dedicated enterprise AWS Bedrock virtual private enclaves under zero data retention BAA agreements.',
        category: 'gateway',
        position: [-58, -96, 2],
        size: [48, 20, 4],
        color: '#ffffff',
        accentColor: '#059669',
        inputs: ['Sanitized Masked Prompt Stream'],
        outputs: ['Streaming Raw Token Chunks'],
        metrics: [{ label: 'Data Retention', value: 'Strict 0-Day' }],
        iconType: 'llm',
    },
    {
        id: 'node_llm_anthropic',
        tierId: 'tier_llm_providers',
        title: 'ANTHROPIC',
        subtitle: 'Claude 3.5 Sonnet Frontier API',
        description: 'Direct frontier inference with Claude 3.5 Sonnet. Only cryptographically masked prompts cross the network boundary; raw PHI never leaves.',
        category: 'gateway',
        position: [0, -96, 2],
        size: [52, 20, 4],
        color: '#ffffff',
        accentColor: '#059669',
        inputs: ['Masked Prompt Payload'],
        outputs: ['Candidate Token Stream'],
        metrics: [{ label: 'Frontier Model', value: 'Claude 3.5 Sonnet' }],
        iconType: 'llm',
    },
    {
        id: 'node_llm_azure_openai',
        tierId: 'tier_llm_providers',
        title: 'Azure OpenAI',
        subtitle: 'GPT-4o Enterprise Enclave',
        description: 'Microsoft Azure OpenAI private tenant hosting GPT-4o with dedicated HIPAA BAA compliance and enterprise data governance.',
        category: 'gateway',
        position: [58, -96, 2],
        size: [48, 20, 4],
        color: '#ffffff',
        accentColor: '#059669',
        inputs: ['Masked Prompt Payload'],
        outputs: ['Candidate Token Stream'],
        metrics: [{ label: 'Enclave', value: 'Azure Gov / Enterprise' }],
        iconType: 'llm',
    },
];

// ═════════════════════════════════════════════════════════════════════════════
// ── DATA PATHS (Connecting website architecture flow) ───────────────────────
// ═════════════════════════════════════════════════════════════════════════════

export const ARCH_DATA_PATHS: IDataPath[] = [
    // 1. Engineers IDE -> Anthara Plugin
    {
        id: 'p_ide_to_plugin',
        fromNode: 'node_engineers_ide',
        toNode: 'node_anthara_plugin',
        label: 'Developer Keystroke Intercept',
        color: '#ea580c',
        activeInSteps: [1],
        scenario: 'all',
        packetLabel: 'Raw Prompt & Keystroke',
    },

    // 2. Anthara Plugin -> Coding Assistants
    {
        id: 'p_plugin_to_assistants',
        fromNode: 'node_anthara_plugin',
        toNode: 'node_coding_assistants',
        label: 'Assisted Generation Session',
        color: '#0284c7',
        activeInSteps: [1, 2],
        scenario: 'all',
        packetLabel: 'Claude Code / Cursor Prompt',
    },

    // 3. Coding Assistants -> Conduct Layer (Inbound generation request)
    {
        id: 'p_assistants_to_conduct',
        fromNode: 'node_coding_assistants',
        toNode: 'node_compliance_packs',
        label: 'Inbound Generation Request',
        color: '#7c3aed',
        activeInSteps: [2],
        scenario: 'all',
        packetLabel: 'Generation Request',
    },

    // 4. MCP Data Tools -> Org-wide Context
    {
        id: 'p_mcp_to_context',
        fromNode: 'node_mcp_databases',
        toNode: 'node_org_context',
        label: 'ADRs & Schema Context',
        color: '#0d9488',
        activeInSteps: [2],
        scenario: 'all',
        packetLabel: 'ADR-12 / DB Schema Slice',
    },

    // 5. Org-wide context -> Compliance packs
    {
        id: 'p_context_to_compliance',
        fromNode: 'node_org_context',
        toNode: 'node_compliance_packs',
        label: 'Context & Rule Fusion',
        color: '#d97706',
        activeInSteps: [2, 3],
        scenario: 'all',
        packetLabel: 'Rules + Context Envelope',
    },

    // 6. Compliance packs -> PHI/PII masked
    {
        id: 'p_compliance_to_mask',
        fromNode: 'node_compliance_packs',
        toNode: 'node_phi_pii_masked',
        label: 'In-Flight Redaction Check',
        color: '#e11d48',
        activeInSteps: [3],
        scenario: 'all',
        packetLabel: 'Safe Harbor Scanning',
    },

    // 7. PHI/PII Masked -> OUTSIDE BOUNDARY (Masked prompts leave the boundary)
    {
        id: 'p_mask_to_llm',
        fromNode: 'node_phi_pii_masked',
        toNode: 'node_llm_anthropic',
        label: 'Masked Prompts Leave Boundary',
        color: '#059669',
        activeInSteps: [4],
        scenario: 'all',
        packetLabel: '{{SYNTH_SSN}} Masked Prompt',
    },

    // 8. LLM Providers -> Conduct Layer (Streaming Tokens returned)
    {
        id: 'p_llm_to_conduct',
        fromNode: 'node_llm_anthropic',
        toNode: 'node_tool_governance',
        label: 'Streaming Raw Token Chunks',
        color: '#10b981',
        activeInSteps: [5],
        scenario: 'all',
        packetLabel: 'Streaming Tokens',
    },

    // 9. Tool Governance -> MCP / Systems
    {
        id: 'p_tool_to_systems',
        fromNode: 'node_tool_governance',
        toNode: 'node_systems_acted_on',
        label: 'Governed Safe Tool Execution',
        color: '#0284c7',
        activeInSteps: [3, 4],
        scenario: 'mcp_action',
        packetLabel: 'Governed Action',
    },

    // 10. Conduct Layer <-> Agents & Automation
    {
        id: 'p_conduct_to_agents',
        fromNode: 'node_tool_governance',
        toNode: 'node_agent_pr_reviews',
        label: 'Agent Task Delegation',
        color: '#9a3412',
        activeInSteps: [5, 6],
        scenario: 'all',
        packetLabel: 'Agent Action Review',
    },

    // 11. Agents -> Systems Acted On
    {
        id: 'p_agents_to_systems',
        fromNode: 'node_agent_pr_reviews',
        toNode: 'node_systems_acted_on',
        label: 'Automated PR & Status Update',
        color: '#0284c7',
        activeInSteps: [6],
        scenario: 'all',
        packetLabel: 'Git PR / Jira Updated',
    },

    // 12. Conduct Layer -> Anthara Plugin (Write-Time Delivery)
    {
        id: 'p_conduct_to_plugin',
        fromNode: 'node_phi_pii_masked',
        toNode: 'node_anthara_plugin',
        label: 'Verified Ship-Ready Code',
        color: '#ea580c',
        activeInSteps: [6, 7],
        scenario: 'all',
        packetLabel: 'Compliant Code Stream',
    },
];

// ═════════════════════════════════════════════════════════════════════════════
// ── SCENARIOS (Walkthroughs mapped to the website architecture) ─────────────
// ═════════════════════════════════════════════════════════════════════════════

export const SCENARIOS: IScenario[] = [
    {
        id: 'compliant',
        name: 'Standard Compliant Code Generation',
        shortDesc: 'A developer prompts in Cursor; Anthara attaches context & compliance rules, masks entities, and delivers compliant code at write-time.',
        badge: 'Zero Violations • Fast Track',
        steps: [
            {
                id: 1,
                title: 'Developer Prompts in Coding Assistant (Cursor / IDE)',
                tierId: 'tier_ide_assistants',
                activeNodeIds: ['node_engineers_ide', 'node_anthara_plugin', 'node_coding_assistants'],
                cameraPosition: [0, 80, 160],
                cameraTarget: [0, 80, 0],
                explanation: 'An engineer in Cursor types: "Implement batch patient vitals ingestion for cardiology records". The Anthara Plugin intercepts the prompt locally before it leaves the developer workstation.',
                codeSnippet: `// Developer Prompt in Cursor:\n"Implement aggregateVitals(patientId: UUID) returning average systolic blood pressure"`,
                badgeText: 'Intercepted In-IDE',
                badgeType: 'info',
            },
            {
                id: 2,
                title: 'Attaching Org-Wide Context & Compliance Packs',
                tierId: 'tier_conduct',
                activeNodeIds: ['node_org_context', 'node_compliance_packs', 'node_mcp_databases'],
                cameraPosition: [-48, 16, 140],
                cameraTarget: [-48, 16, 0],
                explanation: 'Anthara queries internal ADRs via MCP: attaches ADR-041 (mandatory AES-256 field encryption) and HIPAA §164.312 regulatory compliance directives into the prompt envelope.',
                codeSnippet: `// Attached Conduct Directives:\n- Must call auditLogger.recordAccess({ patientId, reason: 'VITALS_READ' })\n- Must use internal @health/crypto-vault\n- Must enforce TLS 1.3 on all transmission`,
                badgeText: 'Conduct Rules Attached',
                badgeType: 'info',
            },
            {
                id: 3,
                title: 'In-Flight PHI / PII Masking (Zero Egress)',
                tierId: 'tier_conduct',
                activeNodeIds: ['node_phi_pii_masked'],
                cameraPosition: [-14, 16, 120],
                cameraTarget: [-14, 16, 0],
                explanation: 'Scans prompt across 30+ entity types. Verifies zero real patient health records or secrets cross the boundary, substituting synthetic cryptographic tokens.',
                codeSnippet: `// Scanned: 0 PHI leaks detected, 0 hardcoded credentials found. Status: OK.`,
                badgeText: 'Entities Clean / Masked',
                badgeType: 'success',
            },
            {
                id: 4,
                title: 'Masked Prompts Leave Boundary to LLM Provider',
                tierId: 'tier_llm_providers',
                activeNodeIds: ['node_llm_anthropic', 'node_llm_bedrock'],
                cameraPosition: [0, -114, 140],
                cameraTarget: [0, -114, 0],
                explanation: 'Only the sanitized masked prompt leaves your network boundary to Claude 3.5 Sonnet on Anthropic / AWS Bedrock under zero data retention BAA agreements.',
                codeSnippet: `POST /v1/messages HTTP/1.3\nHost: api.anthropic.com\nX-Anthara-Boundary: Masked\nX-Audit-Digest: 9f8a32b...`,
                badgeText: 'Masked Boundary Egress',
                badgeType: 'success',
            },
            {
                id: 5,
                title: 'Token Stream Governed in Real-Time',
                tierId: 'tier_conduct',
                activeNodeIds: ['node_tool_governance', 'node_agent_pr_reviews'],
                cameraPosition: [20, 16, 130],
                cameraTarget: [20, 16, 0],
                explanation: 'Streaming code tokens are validated against AST compliance rules in real-time. Verified clean code is authorized to enter the developer editor.',
                codeSnippet: `Conduct Gate Passed:\n✔ Access logging call present\n✔ Encryption cipher verified (AES-GCM-256)\n✔ Zero banned algorithms detected`,
                badgeText: 'Conduct Gate Passed',
                badgeType: 'success',
            },
            {
                id: 6,
                title: 'Verified Code Rendered In-Editor at Write-Time',
                tierId: 'tier_ide_assistants',
                activeNodeIds: ['node_anthara_plugin', 'node_engineers_ide'],
                cameraPosition: [-46, 80, 140],
                cameraTarget: [-46, 80, 0],
                explanation: 'Compliant code streams directly into the active editor file with an inline Anthara Conduct verification badge. Zero downstream review rework required.',
                codeSnippet: `export async function aggregateVitals(patientId: UUID): Promise<number> {\n  await auditLogger.recordAccess({ patientId, action: 'VITALS_READ' });\n  const records = await db.vitals.findByPatient(patientId);\n  return records.reduce((acc, v) => acc + v.systolic, 0) / records.length;\n}`,
                badgeText: 'Ship-Ready Code',
                badgeType: 'success',
            },
        ],
    },
    {
        id: 'phi_block',
        name: 'PHI Leak Interception (Zero Egress Enforced)',
        shortDesc: 'A developer accidentally pastes a live patient SSN and diagnostic report; Anthara intercepts and masks it in-flight before network egress.',
        badge: 'Critical Defense • Zero Breach',
        steps: [
            {
                id: 1,
                title: 'Developer Prompts with Unsanitized Patient Data',
                tierId: 'tier_ide_assistants',
                activeNodeIds: ['node_engineers_ide', 'node_anthara_plugin'],
                cameraPosition: [-46, 80, 140],
                cameraTarget: [-46, 80, 0],
                explanation: 'A developer pastes a test snippet containing real patient records: "Fix this parsing error for patient Jane Doe (SSN: 000-45-6789, MRN: #8921)".',
                codeSnippet: `// Accidental PHI in prompt:\n"Help me parse: { patient: 'Jane Doe', ssn: '000-45-6789', diagnosis: 'Acute Myocardial Infarction' }"`,
                badgeText: 'Risk Detected',
                badgeType: 'danger',
            },
            {
                id: 2,
                title: 'Conduct Layer Flags HIPAA Safe-Harbor Violation',
                tierId: 'tier_conduct',
                activeNodeIds: ['node_phi_pii_masked'],
                cameraPosition: [-14, 16, 120],
                cameraTarget: [-14, 16, 0],
                explanation: 'The Anthara PHI Masking engine immediately intercepts outbound transmission! Named Entity Recognition (NER) detects Name, SSN, and Diagnosis.',
                codeSnippet: `[BLOCK EVENT - Anthara Data Boundary]\nDetected HIPAA §164.514 Violations:\n• Full Name: "Jane Doe"\n• Social Security Number: "000-45-6789"\n• Diagnostic Description: "Acute Myocardial Infarction"`,
                badgeText: 'Egress Blocked',
                badgeType: 'danger',
            },
            {
                id: 3,
                title: 'Cryptographic Synthetic Masking Applied Locally',
                tierId: 'tier_conduct',
                activeNodeIds: ['node_phi_pii_masked', 'node_org_context'],
                cameraPosition: [-38, 16, 130],
                cameraTarget: [-38, 16, 0],
                explanation: 'Anthara substitutes high-fidelity synthetic tokens locally. The real patient PHI never leaves your network boundary or VPC.',
                codeSnippet: `// Sanitized Outbound Prompt:\n"Help me parse: { patient: '{{SYNTH_NAME_1}}', ssn: '{{SYNTH_SSN_1}}', diagnosis: '{{SYNTH_DIAG_1}}' }"`,
                badgeText: 'Entities Masked',
                badgeType: 'warning',
            },
            {
                id: 4,
                title: 'Safe Enclave Inference & Zero Egress Proof',
                tierId: 'tier_llm_providers',
                activeNodeIds: ['node_llm_anthropic'],
                cameraPosition: [0, -114, 130],
                cameraTarget: [0, -114, 0],
                explanation: 'Only the synthetic structure reaches the external LLM provider. Patient identities and HIPAA liability remain completely safeguarded.',
                codeSnippet: `// Model processes synthetic structure without exposure of real patient identity.`,
                badgeText: 'Zero Leakage',
                badgeType: 'success',
            },
            {
                id: 5,
                title: 'Local Re-hydration & IDE Notification',
                tierId: 'tier_ide_assistants',
                activeNodeIds: ['node_anthara_plugin', 'node_engineers_ide'],
                cameraPosition: [-46, 80, 140],
                cameraTarget: [-46, 80, 0],
                explanation: 'The code is safely re-hydrated in the editor while displaying a non-intrusive warning: "Anthara masked 3 PHI entities before transmission."',
                codeSnippet: `// Notice: 3 PHI identifiers (Name, SSN, Diagnosis) were masked to safeguard HIPAA compliance.`,
                badgeText: 'Developer Educated',
                badgeType: 'warning',
            },
        ],
    },
    {
        id: 'remediation',
        name: 'In-Flight Auto-Remediation (SQL & Crypto Fix)',
        shortDesc: 'The LLM suggests an insecure raw SQL query and unapproved hashing; Anthara rewrites it into parameterized queries and approved crypto on the fly.',
        badge: 'CWE-89 Remediation • Real-Time Rewrite',
        steps: [
            {
                id: 1,
                title: 'External Model Streams Candidate Code',
                tierId: 'tier_llm_providers',
                activeNodeIds: ['node_llm_anthropic'],
                cameraPosition: [0, -114, 130],
                cameraTarget: [0, -114, 0],
                explanation: 'The LLM streams code containing SQL string concatenation and md5 hashing (violating SOC 2 CC6 and HIPAA encryption directives).',
                codeSnippet: `// Generated Candidate Code from Model:\nconst hash = crypto.createHash('md5').update(token).digest('hex');\nawait db.query(\`SELECT * FROM users WHERE auth_hash = '\${hash}'\`);`,
                badgeText: 'Vulnerabilities In-Flight',
                badgeType: 'danger',
            },
            {
                id: 2,
                title: 'Compliance Packs Flag Prohibited Patterns',
                tierId: 'tier_conduct',
                activeNodeIds: ['node_compliance_packs', 'node_tool_governance'],
                cameraPosition: [-14, 16, 130],
                cameraTarget: [-14, 16, 0],
                explanation: 'Anthara AST verification triggers: (1) MD5 is banned under SOC 2 cryptographic rules; (2) String interpolation into query method constitutes CWE-89 SQL Injection.',
                codeSnippet: `[VIOLATIONS DETECTED]:\n1. RULE-CRYPTO-BANNED: MD5 is prohibited. Approved: SHA-256.\n2. RULE-INJECTION-SQL: Raw template string passed into query method.`,
                badgeText: '2 Rules Triggered',
                badgeType: 'danger',
            },
            {
                id: 3,
                title: 'Auto-Remediation Rewrites AST in Real-Time',
                tierId: 'tier_conduct',
                activeNodeIds: ['node_tool_governance', 'node_org_context'],
                cameraPosition: [-26, 16, 130],
                cameraTarget: [-26, 16, 0],
                explanation: 'Anthara rewrites the AST in-flight: transforms query to parameterized prepared statement and upgrades hash function to company-approved @health/crypto-vault.',
                codeSnippet: `// In-Flight AST Rewrite:\nconst hash = await cryptoVault.sha256(token);\nawait db.query('SELECT * FROM users WHERE auth_hash = $1', [hash]);`,
                badgeText: 'AST Transformed',
                badgeType: 'warning',
            },
            {
                id: 4,
                title: 'Clean Code Delivered to IDE at Write-Time',
                tierId: 'tier_ide_assistants',
                activeNodeIds: ['node_anthara_plugin', 'node_engineers_ide'],
                cameraPosition: [-46, 80, 140],
                cameraTarget: [-46, 80, 0],
                explanation: 'The developer receives safe, compliant code immediately in Cursor/VS Code. Zero security triage or PR rework needed.',
                codeSnippet: `// Gutter notification: Code automatically remediated for HIPAA/SOC 2 compliance.`,
                badgeText: 'Verified Compliant',
                badgeType: 'success',
            },
        ],
    },
    {
        id: 'mcp_action',
        name: 'Tool & MCP Action Governance (Level 4 Agentic Defense)',
        shortDesc: 'An autonomous coding agent attempts to execute a destructive DB command; Anthara intercepts and enforces step-up verification.',
        badge: 'OWASP LLM08 • Tool Sandbox Intercept',
        steps: [
            {
                id: 1,
                title: 'Agent Proposes Autonomous MCP Tool Execution',
                tierId: 'tier_agents',
                activeNodeIds: ['node_agent_custom_yaml', 'node_coding_assistants'],
                cameraPosition: [58, 40, 140],
                cameraTarget: [58, 40, 0],
                explanation: 'In agent mode, an AI agent tackling an issue autonomously issues a tool call: `mcp__postgres_exec("DROP TABLE patient_audit_logs CASCADE;")` under the guise of schema clean-up.',
                codeSnippet: `// Inbound Agent Tool Invocation:\nawait mcp.callTool("postgres_exec", {\n  sql: "DROP TABLE patient_audit_logs CASCADE;"\n});`,
                badgeText: 'Destructive Action In-Flight',
                badgeType: 'danger',
            },
            {
                id: 2,
                title: 'Tool & Agent Governor Halts Execution',
                tierId: 'tier_conduct',
                activeNodeIds: ['node_tool_governance'],
                cameraPosition: [10, 14, 120],
                cameraTarget: [10, 14, 0],
                explanation: 'Anthara halts execution before network dispatch to PostgreSQL. The rule engine matches against prohibited destructive commands (SEC-04: No unilateral DDL DROPs).',
                codeSnippet: `[BLOCK EVENT - Anthara Tool Governor]:\nRule: SEC-04 (Destructive DDL Command Prohibited)\nTarget: patient_audit_logs\nAction: Immediate Pre-Execution Intercept`,
                badgeText: 'Action Intercepted',
                badgeType: 'danger',
            },
            {
                id: 3,
                title: 'Step-Up Verification & Safe Schema Migration Proposed',
                tierId: 'tier_mcp',
                activeNodeIds: ['node_tool_governance', 'node_mcp_databases'],
                cameraPosition: [-24, -20, 140],
                cameraTarget: [-24, -20, 0],
                explanation: 'The destructive action is blocked from database execution. Anthara synthesizes a non-destructive reversible archive migration plan requiring dual-engineer sign-off.',
                codeSnippet: `// Safe Migration Proposed by Anthara Sandbox:\n-- Requires Step-Up Dual Sign-Off:\nALTER TABLE patient_audit_logs RENAME TO patient_audit_logs_archive_2026;`,
                badgeText: 'Safe Alternative Synthesized',
                badgeType: 'warning',
            },
            {
                id: 4,
                title: 'Audit Record Sealed in Enterprise System',
                tierId: 'tier_systems',
                activeNodeIds: ['node_systems_acted_on', 'node_anthara_plugin'],
                cameraPosition: [10, -10, 160],
                cameraTarget: [10, -10, 0],
                explanation: 'The intercepted incident is recorded with cryptographic proof for SOC 2 CC6.1 compliance, and an alert is posted to the engineering team dashboard.',
                codeSnippet: `// Gutter Alert: Destructive operation prevented. Dual sign-off workflow initiated.`,
                badgeText: 'Database Protected',
                badgeType: 'success',
            },
        ],
    },
];

// Re-export white paper metrics models
export interface IFluencyQuadrant {
    id: 'fluent' | 'safe_stuck' | 'stalled' | 'reckless';
    title: string;
    flow: 'Slow' | 'Fast';
    trust: 'Low' | 'High';
    subtitle: string;
    tag: string;
    description: string;
    symptoms: string[];
    risk: string;
    conductRemedy: string;
    color: string;
    bg: string;
    border: string;
}

export const FLUENCY_QUADRANTS: IFluencyQuadrant[] = [
    {
        id: 'fluent',
        title: 'Fluent',
        flow: 'Fast',
        trust: 'High',
        subtitle: 'Fast, and you can trust it.',
        tag: 'The Target',
        description: 'Fast and trusted at once. High delivery flow coupled with calibrated earned trust. The entire cycle compresses while quality, stability, and audit posture improve.',
        symptoms: [
            'All four DORA metrics move together in harmony',
            'Conduct guardrails shift left to write-time in the IDE',
            'Small, attributable, reversible changes ship continuously',
            'Zero PR review bottlenecks or compliance triage crises',
        ],
        risk: 'Maintaining vigilance against regression as frontier models update.',
        conductRemedy: 'Anthara Conduct Layer maintains continuous write-time AST verification, zero-retention boundary enforcement, and cryptographic audit proofs.',
        color: '#059669',
        bg: 'bg-emerald-50',
        border: 'border-emerald-300',
    },
    {
        id: 'safe_stuck',
        title: 'Safe but Stuck',
        flow: 'Slow',
        trust: 'High',
        subtitle: 'Correct, but slow. Trust without speed.',
        tag: 'False Comfort',
        description: 'Correct and sure of it, but slow. Careful teams live here and mistake it for fluency. The work is to speed up without giving up the feeling of safety.',
        symptoms: [
            'Tickets spend weeks in manual queues, reviews, and sign-offs',
            'Coding takes only 6% of cycle; review & QA take weeks',
            'High quality maintained via heavy manual scrutiny',
            'Teams afraid of granting AI higher autonomy',
        ],
        risk: 'High delivery costs and inability to compete with faster-moving engineering teams.',
        conductRemedy: 'Automate manual verification with in-flight AST parsing and automated remediation to safely compress downstream review queues.',
        color: '#0284c7',
        bg: 'bg-sky-50',
        border: 'border-sky-300',
    },
    {
        id: 'stalled',
        title: 'Stalled',
        flow: 'Slow',
        trust: 'Low',
        subtitle: 'Slow and unsure. Neither speed nor trust.',
        tag: 'Double Dysfunction',
        description: 'The pace is aligned with low confidence. Neither speed nor trust exist. AI tools are purchased but sit idle or generate endless discarded diffs.',
        symptoms: [
            'High AI license spend with negligible throughput lift (< 7.8%)',
            'Teams do not trust AI suggestions (~75% ask humans)',
            'Developers spend hours untangling hallucinated architectures',
            'Legacy codebases lack documentation, tests, or context',
        ],
        risk: 'Loss of engineering morale, high developer turnover, wasted AI budgets.',
        conductRemedy: 'Build the Capability Layer (tribal knowledge ADRs, documentation) and establish baseline Conduct boundaries.',
        color: '#64748b',
        bg: 'bg-slate-50',
        border: 'border-slate-300',
    },
    {
        id: 'reckless',
        title: 'Reckless',
        flow: 'Fast',
        trust: 'Low',
        subtitle: 'Fast on unearned confidence.',
        tag: 'The Danger Zone',
        description: 'Fast on confidence that hasn\'t been verified. It looks like success while quality degrades quietly. High throughput combined with delivery instability.',
        symptoms: [
            'High AI adoption rate (> 90%) with rising Change Failure Rates',
            'AI-generated pull requests rubber-stamped without deep review',
            'Technical debt and architectural incoherence exploding',
            'PHI or credentials leaked into public model APIs',
        ],
        risk: 'Catastrophic production outages, compliance regulatory fines ($9.4M+ HHS penalties), loss of AI mandate.',
        conductRemedy: 'Immediate installation of Anthara In-IDE Conduct Layer to enforce real-time AST compliance, PHI zero-egress, and tool boundaries.',
        color: '#e11d48',
        bg: 'bg-rose-50',
        border: 'border-rose-300',
    },
];

export interface IAutonomyLevel {
    level: number;
    title: string;
    subtitle: string;
    description: string;
    impact: string;
    stages: {
        intake: 'none' | 'assist' | 'owns';
        spec: 'none' | 'assist' | 'owns';
        coding: 'none' | 'assist' | 'owns';
        review: 'none' | 'assist' | 'owns';
        qa: 'none' | 'assist' | 'owns';
        deployment: 'none' | 'assist' | 'owns';
    };
}

export const AUTONOMY_LEVELS: IAutonomyLevel[] = [
    {
        level: 1,
        title: 'Prompting',
        subtitle: 'Inline copilot completions',
        description: 'AI assists developer keystrokes within the editor. Scope is strictly localized to lines or single methods.',
        impact: 'Compacts a fraction of the 6% coding time. Zero downstream cycle compression.',
        stages: {
            intake: 'none',
            spec: 'none',
            coding: 'assist',
            review: 'none',
            qa: 'none',
            deployment: 'none',
        },
    },
    {
        level: 2,
        title: 'Plan Mode',
        subtitle: 'Multi-file plan authoring',
        description: 'AI assists in creating multi-file plans and takes ownership of generating code blocks across files.',
        impact: 'Speeds up coding, but shifts review burden downstream to humans.',
        stages: {
            intake: 'none',
            spec: 'assist',
            coding: 'owns',
            review: 'none',
            qa: 'none',
            deployment: 'none',
        },
    },
    {
        level: 3,
        title: 'Spec-Driven',
        subtitle: 'Rigorous intent specifications',
        description: 'Human developers author unambiguous specifications, constraints, and acceptance criteria. AI owns specification breakdown and code implementation, and assists in QA & testing.',
        impact: 'Substantially reduces rework; code generation aligns with team standards.',
        stages: {
            intake: 'none',
            spec: 'owns',
            coding: 'owns',
            review: 'none',
            qa: 'assist',
            deployment: 'none',
        },
    },
    {
        level: 4,
        title: 'Agentic',
        subtitle: 'Full-lifecycle autonomy with conduct guardrails',
        description: 'The critical leap with highest impact on cycle compression! AI owns intake, spec, coding, and automated review, and assists QA under in-flight conduct governance.',
        impact: 'Compresses the 94% queue/review/rework sliver from 11.7 weeks down to 2.1 weeks.',
        stages: {
            intake: 'owns',
            spec: 'owns',
            coding: 'owns',
            review: 'owns',
            qa: 'assist',
            deployment: 'none',
        },
    },
    {
        level: 5,
        title: 'Autonomous',
        subtitle: 'Self-governing delivery loop',
        description: 'AI agents own intake through deployment with humans acting exclusively as strategic reviewers and policy arbiters.',
        impact: 'Near zero cycle friction with continuous autonomous verification.',
        stages: {
            intake: 'owns',
            spec: 'owns',
            coding: 'owns',
            review: 'owns',
            qa: 'owns',
            deployment: 'owns',
        },
    },
];

export interface IDoraMetricModel {
    id: string;
    name: string;
    category: 'throughput' | 'stability';
    trend: 'higher' | 'lower' | 'held or lower';
    summary: string;
    capabilityDrivers: string[];
    conductDrivers: string[];
    antharaImpact: string;
}

export const DORA_METRICS_DATA: IDoraMetricModel[] = [
    {
        id: 'df',
        name: 'Deployment Frequency',
        category: 'throughput',
        trend: 'higher',
        summary: 'Small changes ship continuously without waiting on manual verification gates.',
        capabilityDrivers: ['Skill & Judgement', 'Craft Mindset'],
        conductDrivers: ['Coding Standards', 'Data Boundaries'],
        antharaImpact: '+3.4x deployment cadence via in-flight write-time compliance proofs.',
    },
    {
        id: 'lt',
        name: 'Lead Time for Changes',
        category: 'throughput',
        trend: 'lower',
        summary: 'The 94% non-coding delivery cycle compresses: scoping, manual review, integration.',
        capabilityDrivers: ['Business Fluency', 'Knowledge & Docs (ADRs)'],
        conductDrivers: ['Coding Standards'],
        antharaImpact: 'Compresses cycle from 11.7 weeks to 2.1 weeks by eliminating review rework.',
    },
    {
        id: 'cfr',
        name: 'Change Failure Rate',
        category: 'stability',
        trend: 'held or lower',
        summary: 'Coding standards and compliance rules enforced automatically as code is generated.',
        capabilityDrivers: ['Reading & Judging AI Output', 'Spec Authoring'],
        conductDrivers: ['Coding Standards', 'Compliance Posture', 'Data Boundaries'],
        antharaImpact: 'Zero compliance escapes to production; AST verifier halts vulnerabilities in-flight.',
    },
    {
        id: 'mttr',
        name: 'Time to Restore Service',
        category: 'stability',
        trend: 'held or lower',
        summary: 'Changes stay small, attributable, and reversible, enabling rapid rollback or hotfix.',
        capabilityDrivers: ['Knowledge & Docs Systems'],
        conductDrivers: ['Compliance Posture', 'Data Boundaries'],
        antharaImpact: 'Tamper-proof cryptographic audit ledger pinpoints exact model changes in seconds.',
    },
];

export interface IPdlcStage {
    label: string;
    timeRaw: string;
    weeks: number;
    color: string;
    isCodingSliver: boolean;
    description: string;
    antharaCompressedWeeks: number;
    antharaCompressedTime: string;
}

export const PDLC_CYCLE_DATA: { totalWeeks: number; compressedTotalWeeks: number; stages: IPdlcStage[] } = {
    totalWeeks: 11.7,
    compressedTotalWeeks: 2.1,
    stages: [
        {
            label: 'New Ticket in Queue',
            timeRaw: '4.0 wks',
            weeks: 4.0,
            color: '#94a3b8',
            isCodingSliver: false,
            description: 'Tickets waiting in triage, backlog refinement, and prioritization queues.',
            antharaCompressedWeeks: 0.6,
            antharaCompressedTime: '3.0d',
        },
        {
            label: 'Refine & Estimate',
            timeRaw: '1.59 wks',
            weeks: 1.59,
            color: '#64748b',
            isCodingSliver: false,
            description: 'Clarifying requirements, technical spikes, and manual estimation meetings.',
            antharaCompressedWeeks: 0.3,
            antharaCompressedTime: '1.5d',
        },
        {
            label: 'Coding (AI Budget Focused Here)',
            timeRaw: '4.68d',
            weeks: 0.94,
            color: '#0284c7',
            isCodingSliver: true,
            description: 'Writing code in editor. Only 6% of the 11.7-week cycle!',
            antharaCompressedWeeks: 0.4,
            antharaCompressedTime: '2.0d',
        },
        {
            label: 'Code Review & Scrutiny',
            timeRaw: '2.7d',
            weeks: 0.54,
            color: '#4f46e5',
            isCodingSliver: false,
            description: 'Senior engineers manually reviewing large AI diffs, hunting for subtle bugs.',
            antharaCompressedWeeks: 0.1,
            antharaCompressedTime: '4.0h',
        },
        {
            label: 'QA & Compliance Testing',
            timeRaw: '2.6d',
            weeks: 0.52,
            color: '#7c3aed',
            isCodingSliver: false,
            description: 'Testing edge cases, regulatory checks (HIPAA/PCI/SOC2), and rework cycles.',
            antharaCompressedWeeks: 0.1,
            antharaCompressedTime: '4.0h',
        },
        {
            label: 'Staging & Integration',
            timeRaw: '6.9d',
            weeks: 1.38,
            color: '#059669',
            isCodingSliver: false,
            description: 'Merging into monolithic environments, fixing integration regressions.',
            antharaCompressedWeeks: 0.3,
            antharaCompressedTime: '1.5d',
        },
        {
            label: 'Ready → Prod Deployment',
            timeRaw: '1.77 wks',
            weeks: 1.77,
            color: '#d97706',
            isCodingSliver: false,
            description: 'Change Advisory Board (CAB) review, release window scheduling, manual sign-offs.',
            antharaCompressedWeeks: 0.3,
            antharaCompressedTime: '1.5d',
        },
    ],
};

// ═════════════════════════════════════════════════════════════════════════════
// ── EARNED TRUST SPECTRUM (Chapter 06, Page 16) ──────────────────────────────
// ═════════════════════════════════════════════════════════════════════════════

export interface IEarnedTrustItem {
    id: 'under_trust' | 'earned_trust' | 'overconfidence';
    title: string;
    formula: string;
    tagline: string;
    description: string;
    color: string;
    bg: string;
    border: string;
}

export const EARNED_TRUST_SPECTRUM: IEarnedTrustItem[] = [
    {
        id: 'under_trust',
        title: 'Under-trust',
        formula: 'confidence < reality',
        tagline: 'Great tools sit idle. Speed you never use.',
        description: 'Teams distrust AI output due to lack of transparent guardrails. Highly capable models are restricted to trivial tasks while cycle time remains bogged down in manual work.',
        color: '#64748b',
        bg: 'bg-slate-50',
        border: 'border-slate-300',
    },
    {
        id: 'earned_trust',
        title: 'Earned Trust',
        formula: 'confidence = reality',
        tagline: 'Fast, and you can trust it. The target.',
        description: 'Earned trust is confidence you can defend, because your verification catches bad outputs in-flight, your track record meets your AI stance, rework dropped, and system stability never slips.',
        color: '#059669',
        bg: 'bg-emerald-50',
        border: 'border-emerald-300',
    },
    {
        id: 'overconfidence',
        title: 'Overconfidence',
        formula: 'confidence > reality',
        tagline: 'AI output rubber-stamped. The bill arrives later.',
        description: 'Teams rush to merge AI-generated PRs without automated AST verification or architectural grounding. Codebase quality quietly degrades until catastrophic outages strike.',
        color: '#e11d48',
        bg: 'bg-rose-50',
        border: 'border-rose-300',
    },
];

// ═════════════════════════════════════════════════════════════════════════════
// ── THE CAPABILITY LAYER (Chapter 03, Pages 7-9) ─────────────────────────────
// ═════════════════════════════════════════════════════════════════════════════

export interface ICapabilityDimension {
    num: string;
    name: string;
    tagline: string;
    items: { label: string; detail: string }[];
    quote: string;
}

export const CAPABILITY_DIMENSIONS: ICapabilityDimension[] = [
    {
        num: '01',
        name: 'Learning and continuous improvement',
        tagline: 'How much your team collectively knows and grows to catch AI mistakes before they ship.',
        items: [
            { label: 'Slack time', detail: 'Protected hours for hackathons, learning sessions, and trainings, counted as real capacity on the plan.' },
            { label: 'Learning budget', detail: 'Continuous learning carried as an organizational responsibility, with real budget and cadence behind it.' },
            { label: 'AI-centric hiring', detail: 'Interviews that test whether a candidate can read and critique a large AI-generated plan, which now matters as much as writing code from scratch.' },
            { label: 'Cross-functional pairing', detail: 'Active pairing across product, development and QA, so teams think of business outcomes and not just ticket completion.' },
        ],
        quote: 'Apprenticeship matters more in the AI era. AI is doing the work juniors used to learn from, so you have to maintain a healthy senior-to-junior ratio and build new learning loops on purpose, or you’ll have no senior engineers in five years.',
    },
    {
        num: '02',
        name: 'Skill and judgement',
        tagline: 'The center of gravity is shifting from producing code to directing AI well and evaluating it with minimal rework.',
        items: [
            { label: 'Reading & judging AI output', detail: 'Evaluating large AI-generated plans, diffs, and code for correctness and fit. Fast becoming the core engineering skill.' },
            { label: 'Spec and intent authoring', detail: 'Telling AI what to build clearly enough to get the right result: specifications, constraints, and acceptance criteria. Spec-driven development.' },
            { label: 'Architecture & systems judgment', detail: 'Recognizing good structure when you see it and steering AI toward maintainable design instead of plausible mess.' },
            { label: 'Generalist breadth', detail: 'A wide surface area across the stack and SDLC, so one person can direct AI across more work and connect the parts.' },
            { label: 'Craft mindset', detail: 'Caring enough to ensure that the bar is set high for AI generated code, and quality of the codebase doesn’t degrade over time.' },
        ],
        quote: 'One of DORA’s seven AI capabilities is a Clear and communicated AI stance. The stance is enforced when the team has the skills and judgement to do so.',
    },
    {
        num: '03',
        name: 'Business fluency',
        tagline: 'Grounded in what problems you are solving for end users, predicting rework rate and value delivered.',
        items: [
            { label: 'Domain grounding', detail: 'How the business actually makes money, how this organization actually works, and the rules of the domain.' },
            { label: 'Shared outcomes', detail: 'Role boundaries blurring across product, eng, and QA so each person owns end outcomes rather than isolated tickets.' },
            { label: 'User-centric focus', detail: 'Another of DORA’s 7 capabilities: ensures AI-accelerated teams are moving in the right direction.' },
        ],
        quote: 'Codifying craft is how a team\'s best practices stop being tribal knowledge and become the default.',
    },
    {
        num: '04',
        name: 'Knowledge and documentation systems',
        tagline: 'Treating knowledge as infrastructure so models produce context-aware code instead of generic guesses.',
        items: [
            { label: 'DORA’s AI-accessible internal data', detail: 'Making code, tickets, docs, and design history reachable at generation time and always updated.' },
            { label: 'DORA’s healthy data ecosystems', detail: 'Clean, well-structured internal data amplifies AI success across all engineering tiers.' },
            { label: 'Captured decisions (ADRs)', detail: 'With the reasoning behind choices written down, the "why" survives past the author and is available to agents as context.' },
            { label: 'Codified craft', detail: 'Best practices, patterns, and domain rules become reusable skills, commands, hooks, and shared memory that agents inherit.' },
        ],
        quote: 'What’s good for your engineers is good for your agents. Clear documentation and clean code help both; the messy kind drags both down.',
    },
];

// ═════════════════════════════════════════════════════════════════════════════
// ── THE CONDUCT LAYER (Chapter 04, Pages 10-12) ──────────────────────────────
// ═════════════════════════════════════════════════════════════════════════════

export interface IConductDimension {
    num: string;
    name: string;
    tagline: string;
    points: { num: string; title: string; detail: string }[];
    quote: string;
}

export const CONDUCT_DIMENSIONS: IConductDimension[] = [
    {
        num: '01',
        name: 'Coding standards',
        tagline: 'Steering the agent to produce code that your team can continue to own, read, and change months later.',
        points: [
            { num: '01.', title: 'Session-loaded rules', detail: 'Standards that load into every AI session automatically and render into each tool\'s native format, present as code is written.' },
            { num: '02.', title: 'Org-wide and repo-specific layers', detail: 'Clarity around what applies across the company versus to this codebase, so the agent applies the right rules contextually.' },
            { num: '03.', title: 'Craft with AI', detail: 'Practices like Spec-driven development and working in small batches help you shift left on reviews and keep cognitive load low.' },
        ],
        quote: 'Conduct warrants a layer of its own in the AI era because human reviews can no longer keep pace with what AI generates.',
    },
    {
        num: '02',
        name: 'Compliance posture',
        tagline: 'Regulations encoded directly into rule sets for healthcare, fintech, and regulated domains.',
        points: [
            { num: '01.', title: 'Regulations encoded as guardrails', detail: 'The frameworks that apply to you (HIPAA, PCI-DSS, SOC 2, WCAG, FDA) written into rule sets the agent works to as it generates.' },
            { num: '02.', title: 'Audit trails and logging', detail: 'Logging every prompt, action, and policy decision as the work happens ensures the evidence is always available.' },
            { num: '03.', title: 'DORA\'s strong version control practices', detail: 'When every change is small, attributable, and logged with its reasoning, version history becomes the compliance record.' },
        ],
        quote: 'Compliance checked only at review is you relying on the judgement of one human. It takes just one incident to put your business at a serious risk.',
    },
    {
        num: '03',
        name: 'Data and security boundaries',
        tagline: 'An agent does not just read, it acts. Intentionally govern what is allowed to cross the perimeter.',
        points: [
            { num: '01.', title: 'In-flight detection', detail: 'Define what happens when sensitive data is detected before it leaves the network (synthetic PHI/PII masking).' },
            { num: '02.', title: 'Tool and action governance', detail: 'Deliberately define what every tool and MCP call is allowed to do, with destructive operations blocked across the organization.' },
            { num: '03.', title: 'Own the data boundary', detail: 'Ensure the whole path runs in your VPC or on-prem, so code and data stay inside.' },
        ],
        quote: 'One prompt with real patient data in a public model is enough to lose your AI mandate. Boundaries are what let you go faster with higher trust in autonomy.',
    },
];

// ═════════════════════════════════════════════════════════════════════════════
// ── EMPIRICAL RESEARCH SOURCES (Chapter 07, Page 17) ─────────────────────────
// ═════════════════════════════════════════════════════════════════════════════

export interface IResearchPaper {
    id: string;
    source: string;
    title: string;
    year: string;
    finding: string;
    stat?: string;
    link?: string;
}

export const RESEARCH_SOURCES: IResearchPaper[] = [
    {
        id: 'incubyte_healthtech',
        source: 'Incubyte Field Analysis',
        title: 'Enterprise Healthtech Delivery Pipeline Analysis',
        year: '2025/2026',
        finding: 'Coding represents only ~6% of the 11.7-week delivery cycle (4.68 days). 11 weeks are lost in queues, reviews, and rework.',
        stat: '6% Coding / 94% Queue',
        link: 'https://incubyte.co',
    },
    {
        id: 'dora_2025',
        source: 'DORA (Google Cloud)',
        title: 'State of AI-Assisted Software Development Report',
        year: '2025',
        finding: '90% of tech professionals use AI at work. Higher AI adoption is associated with higher delivery throughput AND higher delivery instability. AI is fundamentally an amplifier.',
        stat: '90% Daily Usage',
        link: 'https://dora.dev',
    },
    {
        id: 'dx_2026',
        source: 'DX Research',
        title: 'AI and Engineering Velocity: A Longitudinal Analysis across 400+ Companies',
        year: 'Feb 2026',
        finding: 'AI usage rose 65%, but the quantum of work delivered rose just 7.76%. Coding is only ~14% of a developer\'s day; extra scrutiny on AI output eats the time saved.',
        stat: '+7.8% Output vs +65% Usage',
    },
    {
        id: 'stackoverflow_2025',
        source: 'Stack Overflow',
        title: '2025 Developer Survey',
        year: '2025',
        finding: '66% cite "almost right, but not quite" as their top AI frustration. 75% would still ask a person when they don\'t trust an AI answer.',
        stat: '66% Frustration / 75% Verification',
    },
    {
        id: 'mit_nanda_2025',
        source: 'MIT NANDA & McKinsey',
        title: 'State of AI in Business / State of AI 2025',
        year: '2025',
        finding: 'Roughly 95% of generative-AI pilots show no measurable return, despite 88% enterprise adoption in at least one function.',
        stat: '~95% Pilots No Return',
    },
    {
        id: 'coderabbit_2025',
        source: 'CodeRabbit',
        title: 'State of AI vs Human Code Generation',
        year: 'Dec 2025',
        finding: 'AI-generated pull requests averaged 10.83 issues per PR vs 6.45 issues for human code across 470 PRs analyzed.',
        stat: '10.83 vs 6.45 Issues/PR',
    },
    {
        id: 'sonar_2026',
        source: 'SonarSource',
        title: 'False-Positive Analysis across 137 Million Issues',
        year: '2026',
        finding: 'Only 3.2% false-positive rate across 137M issues analyzed, demonstrating high reliability of automated AST static analysis.',
        stat: '3.2% False-Positive Rate',
    },
    {
        id: 'metr_2025',
        source: 'METR',
        title: 'Measuring the Impact of Early-2025 AI on Experienced Open-Source Developer Productivity',
        year: 'July 2025',
        finding: 'Empirical measurement of frontier models on complex multi-hour developer tasks in mature open-source repositories.',
        stat: 'Multi-Hour Task Study',
    },
    {
        id: 'hhs_ocr_hipaa',
        source: 'HHS OCR & HIPAA Journal',
        title: 'HIPAA Security Rule NPRM & Enforcement Actions Tracker',
        year: '2024/2025',
        finding: '16 HIPAA enforcement actions in 2024 totaling $9.4M in penalties. Proposed Security Rule update published Jan 2025 tightens ePHI encryption and resilience for AI teams.',
        stat: '$9.4M Penalties / 16 Actions',
    },
    {
        id: 'dora_2024',
        source: 'DORA',
        title: 'Accelerate State of DevOps Report 2024',
        year: '2024',
        finding: 'Throughput, stability, cluster distribution, and documentation findings validating culture and capability models.',
        link: 'https://dora.dev/research/2024',
    },
    {
        id: 'robbes_2026',
        source: 'Robbes et al. / SWE-PRBench',
        title: 'Agentic Much? Adoption of Coding Agents on GitHub',
        year: 'arXiv 2026',
        finding: 'Longitudinal study on real-world coding agent usage patterns, PR merge rates, and autonomous loop completions.',
    },
    {
        id: 'peng_cui_copilot',
        source: 'Peng, Cui, Demirer, Jaffe, Musolff, Salz',
        title: 'The Impact of AI on Developer Productivity: Evidence from GitHub Copilot',
        year: '2023',
        finding: 'Controlled field experiments measuring task completion speedup on isolated programming tasks.',
    },
    {
        id: 'github_octoverse',
        source: 'GitHub',
        title: 'Octoverse 2025',
        year: '2025',
        finding: 'Rapid adoption of Copilot and generative tools among new developers and open-source maintainers worldwide.',
    },
];
