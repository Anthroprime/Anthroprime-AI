// AI Infrastructure — hub-and-spoke collaborator model (brief of 18 Nov 2026).
// Content rules: no partner, supplier or client names; no prices, rates,
// margins or live inventory; no guarantees; British spelling.

/** The eight collaborator types ("spokes"). `short` is the diagram label. */
export const SPOKES = [
  {
    id: 'gpu',
    icon: 'Cpu',
    short: 'GPU capacity',
    title: 'GPU capacity and cloud providers',
    description:
      'Hyperscalers, neoclouds and GPU-specialist clouds — H100, H200, B200, B300 and GB300 capacity, reserved, bare-metal or managed.'
  },
  {
    id: 'datacentre',
    icon: 'Building2',
    short: 'Data centres',
    title: 'AI-ready data centres and colocation',
    description:
      'High-density, liquid-cooling-ready halls and colocation space with firm MW and ready-for-service dates.'
  },
  {
    id: 'power',
    icon: 'Zap',
    short: 'Power',
    title: 'Power and energy',
    description:
      'Committed power capacity, grid and renewable options, for AI loads that grow from kW to multi-MW.'
  },
  {
    id: 'cooling',
    icon: 'Snowflake',
    short: 'Cooling',
    title: 'Cooling technology',
    description:
      'Direct-to-chip liquid cooling and advanced heat-transfer solutions for rack-scale AI systems.'
  },
  {
    id: 'oem',
    icon: 'Server',
    short: 'OEMs & integrators',
    title: 'OEMs and system integrators',
    description:
      'Rack-scale systems, build, integration, commissioning and acceptance testing.'
  },
  {
    id: 'network',
    icon: 'Network',
    short: 'Network',
    title: 'Network and connectivity',
    description:
      'InfiniBand and RoCE fabrics, cross-connects, WAN and cloud on-ramps.'
  },
  {
    id: 'capital',
    icon: 'Landmark',
    short: 'Capital',
    title: 'Capital and financing partners',
    description:
      'Structured financing, leasing and offtake-backed models for AI factory builds.'
  },
  {
    id: 'lifecycle',
    icon: 'RefreshCw',
    short: 'Lifecycle & ITAD',
    title: 'Lifecycle and ITAD',
    description:
      'Refresh planning, secondary-market capacity, and secure decommissioning.'
  }
]

/** What the hub (AnthroPrime) does. */
export const HUB_ROLES = [
  {
    icon: 'ClipboardList',
    title: 'Requirement definition',
    description:
      'Workload, sizing, configuration and a cost-of-ownership view.'
  },
  {
    icon: 'Scale',
    title: 'Sourcing and negotiation',
    description:
      'A controlled RFQ across the network, with side-by-side comparison.'
  },
  {
    icon: 'BadgeCheck',
    title: 'Technical and commercial assurance',
    description:
      'Ownership checks, benchmarking, SLA and contract review, provider due diligence.'
  },
  {
    icon: 'ShieldCheck',
    title: 'Security and compliance',
    description: 'ISO 27001, CERT-In, DPDP, facility and OT security.'
  },
  {
    icon: 'Workflow',
    title: 'Programme orchestration',
    description:
      'One plan across compute, facility, network and handover.'
  },
  {
    icon: 'Gauge',
    title: 'Governance',
    description: 'SLA monitoring, utilisation, renewals and scaling.'
  }
]

export const AUDIENCES = [
  ['Enterprises', 'deploying AI training or inference'],
  ['AI startups and labs', 'that need capacity fast'],
  ['Government and sovereign AI programmes', ''],
  ['Neoclouds and GPU providers', 'seeking offtake, space or power'],
  ['Investors and developers', 'building AI data centres and AI factories']
]

/** Services — "Depth where it matters". */
export const INFRA_SERVICES = [
  {
    id: 'readiness',
    title: 'Capacity Readiness Diagnostic',
    points:
      'Workload sizing, accelerator modelling, a comparable spec sheet, a cost-of-ownership range and a sourcing roadmap — delivered in days.'
  },
  {
    id: 'sourcing',
    title: 'GPU Capacity Sourcing',
    points:
      'Multi-provider RFQ across the network; reserved, bare-metal, managed and cluster options; negotiated terms.'
  },
  {
    id: 'ai-factory',
    title: 'AI Factory Build',
    isNew: true,
    points:
      'End-to-end rack-scale deployments (for example NVIDIA GB300 NVL72): colocation, power, liquid cooling, integration, financing and handover — one accountable programme.'
  },
  {
    id: 'colocation',
    title: 'Data Centre and Colocation Sourcing',
    isNew: true,
    points:
      'Find and contract AI-ready space: MW availability, liquid cooling, floor loading, connectivity and lender-friendly terms.'
  },
  {
    id: 'assurance',
    title: 'Technical and Capacity Assurance',
    points:
      'Ownership and entitlement checks, topology review, live benchmarking, SLA and contract review, and an independent validation report.'
  },
  {
    id: 'secure',
    title: 'Secure AI Infrastructure',
    isNew: true,
    points:
      'Our cybersecurity core applied to AI infrastructure: facility and OT security, ISO 27001, CERT-In and DPDP readiness, tenant isolation and audit support.'
  },
  {
    id: 'governance',
    title: 'Managed Capacity Governance',
    points:
      'SLA enforcement, utilisation tracking, renewals, scaling advisory and quarterly capacity reviews.'
  }
]

/** How we work — the five-step path. */
export const INFRA_STEPS = [
  ['Define', 'Workload and capacity brief'],
  ['Source', 'Matched options from the collaborator network'],
  ['Verify', 'Technical, commercial and security assurance'],
  ['Deploy', 'Orchestrated build, integration and handover'],
  ['Govern', 'Ongoing SLA, utilisation and scaling oversight']
]

/** "The GPU is one part of the whole system" explainer. */
export const SYSTEM_LAYERS = [
  ['Workload', 'Model size, precision, training or inference, and the timeline you are working to.'],
  ['Storage', 'A data path fast enough to keep accelerators supplied, from datasets to checkpoints.'],
  ['Network', 'GPU-to-GPU fabric, cluster networking and the connections to your users and data.'],
  ['GPU and memory', 'Compute and memory capacity matched to the model, not just the newest part.'],
  ['Power and cooling', 'Rack density, committed power and the cooling approach the system needs.'],
  ['Software and operations', 'Drivers, orchestration, monitoring and the team that keeps it running.']
]

export const FURTHER_READING = [
  [
    'NVIDIA HGX AI factory reference architecture',
    'https://docs.nvidia.com/enterprise-reference-architectures/hgx-ai-factory-h100-h200-b200/latest/components.html'
  ],
  [
    'NVIDIA GB300 NVL72 system overview',
    'https://www.nvidia.com/en-us/data-center/gb300-nvl72/'
  ],
  [
    'NVIDIA DGX SuperPOD reference architectures',
    'https://docs.nvidia.com/dgx-superpod/index.html'
  ]
]

export const INFRA_FAQ = [
  [
    'Are you a reseller?',
    'No. We act as the accountable hub. We work across multiple providers and select collaborators per requirement; commercial terms are agreed transparently in each engagement.'
  ],
  [
    'Who is accountable if something goes wrong?',
    'We are your single point of contact across collaborators, from sourcing through handover and ongoing governance.'
  ],
  [
    'Can you help with financing?',
    'Yes. Through our capital and financing collaborators we can support structured financing, leasing and offtake-backed models, subject to each project.'
  ],
  [
    'How do providers join the network?',
    'Through the Become a collaborator form. Every collaborator is vetted before joining and re-verified per engagement.'
  ],
  [
    'Are availability and performance guaranteed?',
    'No. Availability, configuration and performance commitments are set per engagement, in the agreed contract and SLA, after verification. Nothing on this site is a guarantee or a live inventory statement.'
  ],
  [
    'How is the right GPU capacity selected?',
    'From the workload, not the newest part. We start with the model, precision, scale, timeline and any regional or compliance constraints, turn them into a comparable requirement, and only then source and verify options across the network.'
  ]
]

export const COLLABORATOR_TYPES = [
  'GPU capacity',
  'Data centre or colocation',
  'Power and energy',
  'Cooling',
  'OEM or system integrator',
  'Network',
  'Capital and financing',
  'Lifecycle and ITAD',
  'Other'
]
