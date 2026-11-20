// Guides, comparisons and glossary — one indexable page per topic.
// Spec numbers come from gpus.js (NVIDIA datasheets) where tables are shown;
// prose figures match that data. No prices, availability or guarantees.
// British spelling throughout.

export const KNOWLEDGE_UPDATED = '2026-11-20'

const NV = {
  h100: 'https://www.nvidia.com/en-us/data-center/h100/',
  h200: 'https://www.nvidia.com/en-us/data-center/h200/',
  a100: 'https://www.nvidia.com/en-us/data-center/a100/',
  l40s: 'https://www.nvidia.com/en-us/data-center/l40s/',
  hgx: 'https://docs.nvidia.com/enterprise-reference-architectures/hgx-ai-factory-h100-h200-b200/latest/components.html',
  gb200: 'https://www.nvidia.com/en-us/data-center/gb200-nvl72/',
  gb300: 'https://www.nvidia.com/en-us/data-center/gb300-nvl72/',
  mig: 'https://docs.nvidia.com/datacenter/tesla/mig-user-guide/',
  nvlink: 'https://www.nvidia.com/en-us/data-center/nvlink/',
  kv: 'https://huggingface.co/docs/transformers/kv_cache',
  memory: 'https://huggingface.co/docs/accelerate/usage_guides/model_size_estimator'
}

/* ------------------------------------------------------------------ */
/* Comparisons                                                         */
/* ------------------------------------------------------------------ */

export const COMPARE_SPECS = [
  'GPU memory',
  'Memory bandwidth',
  'BF16 / FP16 Tensor',
  'FP8 Tensor',
  'FP4 Tensor',
  'NVLink',
  'MIG',
  'Max power'
]

export const COMPARISONS = [
  {
    slug: 'h100-vs-h200',
    a: 'h100',
    b: 'h200',
    title: 'H100 vs H200: which Hopper GPU fits your workload?',
    metaTitle: 'H100 vs H200: Memory, Specs & Which to Choose | AnthroPrime',
    description:
      'H100 vs H200 compared: same Hopper compute, but H200 adds 141 GB HBM3e and 4.8 TB/s. When the extra memory matters for LLM inference and training.',
    lede: 'Both are NVIDIA Hopper GPUs with the same Tensor Core throughput. The difference is memory: H200 carries 141 GB of HBM3e at 4.8 TB/s, against 80 GB of HBM3 at 3.35 TB/s on H100 SXM.',
    points: [
      {
        heading: 'Same compute, more memory',
        text: 'H100 and H200 list identical BF16, FP8 and TF32 Tensor Core figures, the same 4th-generation NVLink at 900 GB/s and the same 700 W maximum in SXM form. H200 adds about 76% more memory capacity and about 43% more memory bandwidth.'
      },
      {
        heading: 'Why that matters for LLMs',
        text: 'Token generation (decode) is usually limited by how fast weights and the KV cache can be read from memory, not by raw compute. Higher bandwidth helps each token; higher capacity lets a model, longer contexts and more concurrent requests fit on fewer GPUs.'
      },
      {
        heading: 'Fewer GPUs for the same model',
        text: 'A 70B-parameter model needs about 140 GB for FP16 weights alone. That spans at least two 80 GB H100s, while an H200 holds the same model at 8-bit with room left for the KV cache. Fewer GPUs per model replica also means less cross-GPU communication.'
      },
      {
        heading: 'Where H100 is enough',
        text: 'If your model and context comfortably fit in 80 GB, or the job is compute-bound (for example, training smaller models at high utilisation), H100 delivers the same Tensor Core performance. H100 also comes in more form factors, including PCIe and H100 NVL.'
      }
    ],
    chooseA: [
      'Models and contexts fit comfortably in 80 GB',
      'Compute-bound training or fine-tuning',
      'You want PCIe or H100 NVL form factors',
      'You are extending an existing H100 cluster'
    ],
    chooseB: [
      'Long-context or high-concurrency LLM serving',
      '70B-class models on fewer GPUs',
      'Memory-bound training and large batch sizes',
      'KV-cache-heavy workloads such as RAG and agents'
    ],
    verdict:
      'Choose on memory, not compute. If memory capacity or bandwidth is your bottleneck, H200 is the better fit; if it is not, H100 offers the same compute.',
    faq: [
      [
        'Is H200 faster than H100?',
        'For memory-bound work such as LLM token generation, the extra capacity and bandwidth usually help. For compute-bound work the Tensor Core figures are the same, so the difference is smaller. Benchmark your own model and serving stack.'
      ],
      [
        'Can a 70B model run on a single H200?',
        'At 8-bit (about 70 GB of weights) it fits with room for the KV cache. At FP16 the weights alone are about 140 GB, which leaves almost nothing for the KV cache on a 141 GB GPU, so two GPUs or lower precision are the practical options.'
      ],
      [
        'Do H200 and H100 use the same servers?',
        'H200 SXM is offered on HGX platforms of the same generation as HGX H100. Confirm the exact system, firmware and power configuration with the provider.'
      ]
    ],
    related: ['h200-vs-b200', 'gpu-memory-for-llms', 'hbm3e']
  },
  {
    slug: 'h200-vs-b200',
    a: 'h200',
    b: 'b200',
    title: 'H200 vs B200: Hopper or Blackwell for your next build?',
    metaTitle: 'H200 vs B200: Hopper vs Blackwell Compared | AnthroPrime',
    description:
      'H200 vs B200: 141 GB vs 180 GB HBM3e, 4.8 vs 8 TB/s, FP4 support and NVLink 5. What Blackwell changes for training, inference and your facility.',
    lede: 'B200 is NVIDIA’s Blackwell generation. Against H200 it adds more memory (180 GB vs 141 GB), much higher bandwidth (8 TB/s vs 4.8 TB/s), FP4 support, roughly double the NVLink bandwidth, and a higher power draw per GPU.',
    points: [
      {
        heading: 'Throughput and precision',
        text: 'HGX B200 lists 4,500 TFLOPS of dense FP8 per GPU against 1,979 on H200, and adds FP4 (9,000 TFLOPS dense) through the second-generation Transformer Engine. FP4 only helps when your model and serving stack support it and accuracy holds.'
      },
      {
        heading: 'Memory and interconnect',
        text: 'B200 carries 180 GB of HBM3e at 8 TB/s per GPU in HGX B200, and 5th-generation NVLink at 1.8 TB/s per GPU, double Hopper’s 900 GB/s. That helps large mixture-of-experts models and tensor-parallel inference.'
      },
      {
        heading: 'Facility impact',
        text: 'HGX B200 GPUs can draw up to 1,000 W each, against 700 W for H200 SXM. Rack power, cooling and floor planning need to be confirmed before you commit; the GPU choice and the facility choice are one decision.'
      },
      {
        heading: 'Software maturity',
        text: 'Hopper has a long-established software stack. Blackwell features such as FP4 depend on recent drivers, CUDA and framework versions, so validate your exact stack before planning around them.'
      }
    ],
    chooseA: [
      'Your facility is planned for 700 W GPUs',
      'Proven Hopper software stack matters most',
      'Models fit within 141 GB per GPU',
      'Extending an existing Hopper environment'
    ],
    chooseB: [
      'Frontier-scale pre-training',
      'Large mixture-of-experts inference',
      'FP4 inference where accuracy is validated',
      'Maximum throughput per GPU and per rack'
    ],
    verdict:
      'B200 offers more performance per GPU, but needs more power, cooling and software validation. H200 suits builds where those constraints dominate.',
    faq: [
      [
        'Is B200 a drop-in replacement for H200?',
        'No. HGX B200 is a different platform with a higher power envelope per GPU. Plan the server platform, rack power and cooling together.'
      ],
      [
        'Does FP4 reduce accuracy?',
        'It can. Results depend on the model, the quantisation method and the task. Evaluate FP4 against your own quality benchmarks before relying on it in production.'
      ],
      [
        'What about GB200 NVL72?',
        'GB200 NVL72 joins 72 Blackwell GPUs and 36 Grace CPUs into one liquid-cooled, rack-scale NVLink domain. It suits workloads that need more GPUs in one NVLink domain than an 8-GPU server provides.'
      ]
    ],
    related: ['h100-vs-h200', 'gb200-nvl72-explained', 'liquid-cooling']
  },
  {
    slug: 'a100-vs-h100',
    a: 'a100',
    b: 'h100',
    title: 'A100 vs H100 for inference: is the newer GPU worth it?',
    metaTitle: 'A100 vs H100 for Inference: Specs Compared | AnthroPrime',
    description:
      'A100 vs H100 for AI inference: HBM2e vs HBM3, 2.0 vs 3.35 TB/s, and FP8 support on Hopper only. When A100 is still enough and when H100 pays off.',
    lede: 'H100 (Hopper) succeeded A100 (Ampere). For inference the headline differences are memory bandwidth (3.35 TB/s vs 2.0 TB/s on SXM), FP8 support on H100 only, and roughly three times the dense BF16 Tensor Core throughput.',
    points: [
      {
        heading: 'Memory bandwidth drives tokens per second',
        text: 'Both 80 GB versions hold the same model sizes, but H100 SXM reads memory about 1.7 times faster. For bandwidth-bound decode that is the difference most users notice.'
      },
      {
        heading: 'FP8 is a Hopper feature',
        text: 'H100 Tensor Cores support FP8, which halves weight memory compared with FP16 and raises throughput when accuracy holds. A100 has no FP8 Tensor Cores; it serves FP16/BF16 or integer-quantised (INT8 or 4-bit) models.'
      },
      {
        heading: 'Prefill and batching',
        text: 'Processing long prompts (prefill) and large batches is compute-heavy. H100 lists 989 dense BF16 TFLOPS against 312 on A100, which helps time-to-first-token on long inputs.'
      },
      {
        heading: 'Where A100 still fits',
        text: 'Smaller models, batch and offline inference, and services whose latency targets A100 already meets can run well on A100. Both support Multi-Instance GPU (MIG) for partitioning one card between services.'
      }
    ],
    chooseA: [
      'Small and mid-size models within your latency target',
      'Batch or offline inference',
      'INT8-quantised serving',
      'Extending an existing Ampere fleet'
    ],
    chooseB: [
      'Latency-sensitive LLM serving',
      'FP8 inference',
      'Long prompts and large batches',
      'Larger models and higher concurrency'
    ],
    verdict:
      'Start from your latency and throughput targets. If A100 meets them for your model, it remains a sound choice; if not, H100’s bandwidth and FP8 are the main gains.',
    faq: [
      [
        'Can A100 run FP8 models?',
        'Not natively: A100 has no FP8 Tensor Cores. Serve the model in FP16/BF16, or quantise it to INT8 or 4-bit formats supported by your inference engine.'
      ],
      [
        'Do A100 and H100 have the same memory?',
        'Both offer 80 GB, but A100 80GB uses HBM2e at about 2.0 TB/s and H100 SXM uses HBM3 at 3.35 TB/s. A 40 GB A100 also exists.'
      ],
      [
        'Is MIG available on both?',
        'Yes. A100 and H100 can each be partitioned into up to seven isolated GPU instances.'
      ]
    ],
    related: ['choosing-gpus-for-inference', 'h100-vs-h200', 'mig']
  }
]

/* ------------------------------------------------------------------ */
/* Guides                                                              */
/* ------------------------------------------------------------------ */

export const GUIDES = [
  {
    slug: 'gpu-memory-for-llms',
    title: 'How much GPU memory does a 70B model need?',
    metaTitle: 'How Much GPU Memory Does a 70B LLM Need? | AnthroPrime',
    description:
      'A 70B model needs about 140 GB for FP16 weights, 70 GB at 8-bit and 35 GB at 4-bit, plus KV cache. Work it out with the formula and calculator.',
    eyebrow: 'Guide · Memory planning',
    lede: 'Short answer: about 140 GB for the weights at FP16/BF16, 70 GB at 8-bit and 35 GB at 4-bit, plus memory for the KV cache and runtime. Training needs far more: roughly 1.1 TB before activations.',
    calculator: true,
    sections: [
      {
        id: 'weights',
        heading: 'Step 1: the weights',
        body: [
          'Weight memory is the parameter count multiplied by the bytes per parameter. FP16 and BF16 use 2 bytes, FP8 and INT8 use 1 byte, and 4-bit formats use half a byte (plus a little metadata).'
        ],
        table: {
          head: ['Precision', 'Bytes per parameter', '70B weights'],
          rows: [
            ['FP16 / BF16', '2', '≈ 140 GB'],
            ['FP8 / INT8', '1', '≈ 70 GB'],
            ['4-bit', '0.5', '≈ 35 GB']
          ]
        }
      },
      {
        id: 'kv-cache',
        heading: 'Step 2: the KV cache',
        body: [
          'During generation the model stores keys and values for every token in every layer. Per token that is 2 × layers × KV heads × head dimension × bytes.',
          'For a Llama 3 70B-style model (80 layers, 8 KV heads with grouped-query attention, head dimension 128) at FP16 that is about 0.33 MB per token. One 8,192-token conversation needs about 2.7 GB; 32 of them at once need about 86 GB, more than the weights at 8-bit.'
        ],
        list: [
          'Longer contexts grow the KV cache linearly',
          'More concurrent users multiply it',
          'FP8 KV cache halves it, where your engine supports it'
        ]
      },
      {
        id: 'overhead',
        heading: 'Step 3: leave headroom',
        body: [
          'Activations, CUDA context, framework buffers and memory fragmentation all take space. This guide adds 15% of the weight size as a planning allowance. Real usage depends on the inference engine and its settings, so treat it as a starting point and measure.'
        ]
      },
      {
        id: 'training',
        heading: 'Training needs much more',
        body: [
          'Full training with mixed precision and the Adam optimiser typically needs about 16 bytes per parameter: BF16 weights and gradients plus an FP32 master copy and two optimiser moments. For 70B that is about 1.1 TB before activations, so training is spread across many GPUs with techniques such as ZeRO or FSDP sharding.',
          'Parameter-efficient fine-tuning (LoRA, QLoRA) needs far less, because the base weights stay frozen and only small adapters are trained.'
        ]
      },
      {
        id: 'what-fits',
        heading: 'What fits where',
        body: [
          'The table below estimates how many GPUs a 70B model needs for inference with one 8K-token conversation in FP16 KV cache, including the 15% allowance, rounded up to 1, 2, 4 or 8 GPUs (the usual tensor-parallel sizes). Use the calculator above for your own context length and concurrency.'
        ],
        fitTable: true,
        note: 'L40S has no NVLink, so multi-GPU tensor parallelism runs over PCIe; for larger models NVLink GPUs are usually the better fit.'
      }
    ],
    faq: [
      [
        'Can a 70B model run on one 80 GB GPU?',
        'At 4-bit (about 35 GB of weights) yes, with room for the KV cache. At 8-bit the weights are about 70 GB, which leaves little room on an 80 GB GPU, so expect short contexts or low concurrency. FP16 needs at least two 80 GB GPUs.'
      ],
      [
        'Does quantisation affect quality?',
        'It can. 8-bit is usually close to FP16 quality; 4-bit saves more memory but needs evaluation on your own tasks.'
      ],
      [
        'Why does my server run out of memory with more users?',
        'Each concurrent request has its own KV cache. With long contexts the KV cache can exceed the weights, so plan memory for peak concurrency, not for one request.'
      ]
    ],
    sources: [
      ['Hugging Face · KV cache', NV.kv],
      ['Hugging Face · Model memory estimation', NV.memory]
    ],
    related: ['choosing-gpus-for-inference', 'h100-vs-h200', 'hbm3e']
  },
  {
    slug: 'choosing-gpus-for-inference',
    title: 'Choosing GPUs for LLM inference',
    metaTitle: 'How to Choose a GPU for LLM Inference | AnthroPrime',
    description:
      'How to choose an inference GPU: memory capacity for the model, bandwidth for tokens per second, FP8/FP4 support, NVLink for multi-GPU and MIG for small models.',
    eyebrow: 'Guide · Inference',
    lede: 'Choose an inference GPU in this order: will the model fit, how fast can it read memory, which precisions does it support, and how will you scale beyond one GPU.',
    sections: [
      {
        id: 'fit',
        heading: '1. Capacity: will the model fit?',
        body: [
          'Add the weights at your chosen precision, the KV cache for your context length and peak concurrency, and some headroom. If that total does not fit on one GPU, you need several GPUs per model replica.'
        ]
      },
      {
        id: 'bandwidth',
        heading: '2. Bandwidth: how fast will tokens come?',
        body: [
          'Generating each token reads the weights and the KV cache from memory, so decode speed tracks memory bandwidth more than compute. Prefill, the processing of the prompt, is compute-heavy. Long prompts favour compute; long outputs favour bandwidth.'
        ],
        table: {
          head: ['GPU', 'Memory', 'Bandwidth'],
          rows: [
            ['L40S', '48 GB GDDR6', '864 GB/s'],
            ['A100 80GB', '80 GB HBM2e', '2.0 TB/s'],
            ['H100 SXM', '80 GB HBM3', '3.35 TB/s'],
            ['H200', '141 GB HBM3e', '4.8 TB/s'],
            ['B200 (HGX)', '180 GB HBM3e', '8 TB/s']
          ]
        }
      },
      {
        id: 'precision',
        heading: '3. Precision support',
        body: [
          'Lower precision shrinks memory and raises throughput when quality holds. Check that both the GPU and your inference engine support the format you plan to use.'
        ],
        table: {
          head: ['GPU', 'FP16 / BF16', 'FP8', 'FP4'],
          rows: [
            ['A100', 'Yes', 'No', 'No'],
            ['L40S', 'Yes', 'Yes', 'No'],
            ['H100 / H200', 'Yes', 'Yes', 'No'],
            ['B200', 'Yes', 'Yes', 'Yes']
          ]
        }
      },
      {
        id: 'scale',
        heading: '4. Scaling past one GPU',
        body: [
          'Tensor parallelism splits each layer across GPUs and exchanges data at every step, so it works best over NVLink. Replicas (copies of the model behind a load balancer) scale throughput without that traffic. L40S has no NVLink, so it suits models that fit on one card and scale out as replicas.'
        ]
      },
      {
        id: 'small-models',
        heading: '5. Small models: share the GPU',
        body: [
          'Multi-Instance GPU (MIG) on A100, H100 and H200 splits one GPU into up to seven isolated instances, each with its own memory and compute. It suits several small models or tenants on one card.'
        ]
      },
      {
        id: 'starting-points',
        heading: 'Starting points',
        body: [
          'These are starting points to benchmark, not guarantees. Concurrency, context length and latency targets change the answer.'
        ],
        table: {
          head: ['Workload', 'Consider'],
          rows: [
            ['Models up to about 20B at 8-bit', 'L40S, or MIG slices of A100/H100'],
            ['70B-class at 8-bit', 'One H200, or two H100s with NVLink'],
            ['70B-class at FP16, long context', 'Two H200s, or one B200'],
            ['Large mixture-of-experts or 400B+', '8-GPU H200/B200 nodes, or GB200 NVL72']
          ]
        }
      }
    ],
    faq: [
      [
        'Is the newest GPU always the best for inference?',
        'Not necessarily. If an older GPU meets your latency and throughput targets for your model, a newer one adds capacity you may not use. Start from the targets.'
      ],
      [
        'What matters more for inference, compute or memory?',
        'For token generation, memory bandwidth and capacity usually matter most. Compute matters more for long prompts and large batches.'
      ],
      [
        'Can I run inference on L40S?',
        'Yes. L40S has 48 GB of memory and FP8 support, and suits models that fit on one card. It has no NVLink or MIG.'
      ]
    ],
    sources: [
      ['NVIDIA · H100', NV.h100],
      ['NVIDIA · H200', NV.h200],
      ['NVIDIA · L40S', NV.l40s],
      ['NVIDIA · MIG user guide', NV.mig]
    ],
    related: ['gpu-memory-for-llms', 'a100-vs-h100', 'mig']
  },
  {
    slug: 'bare-metal-vs-managed-gpu',
    title: 'Bare metal vs managed GPU infrastructure',
    metaTitle: 'Bare Metal vs Managed GPU Infrastructure | AnthroPrime',
    description:
      'Bare metal vs managed GPU infrastructure compared: control, performance isolation, operational effort and security responsibility, and when each fits.',
    eyebrow: 'Guide · Deployment models',
    lede: 'Bare metal gives you dedicated GPU servers and full control of the software stack. Managed infrastructure adds an operator who runs the stack, monitoring and hardware care for you. The right choice depends on who you want operating it.',
    sections: [
      {
        id: 'definitions',
        heading: 'What each means',
        body: [
          'Bare metal: dedicated physical servers, usually with root access and no hypervisor. Your team installs and runs the operating system, drivers, CUDA, orchestration and monitoring.',
          'Managed: the provider or a partner operates the environment, typically including drivers and CUDA, Kubernetes or Slurm, monitoring, and coordinating hardware replacement, often against an agreed SLA.'
        ]
      },
      {
        id: 'compare',
        heading: 'Side by side',
        table: {
          head: ['', 'Bare metal', 'Managed'],
          rows: [
            ['Control', 'Full: you choose every layer', 'Shared: agreed stack and change process'],
            ['Performance isolation', 'Dedicated hardware', 'Dedicated or shared, by agreement'],
            ['Time to first job', 'Depends on your team’s setup', 'Usually faster: stack delivered ready'],
            ['Operational effort', 'Your team', 'Operator, within the SLA'],
            ['Security responsibility', 'Mostly yours above the hardware', 'Split; define it in the contract'],
            ['Best for', 'Teams with infrastructure engineers', 'Teams focused on models, not operations']
          ]
        }
      },
      {
        id: 'when-bare-metal',
        heading: 'When bare metal fits',
        list: [
          'You have engineers experienced with GPU clusters',
          'You need custom kernels, drivers or networking',
          'Strict control over every software layer',
          'Long, stable training programmes'
        ]
      },
      {
        id: 'when-managed',
        heading: 'When managed fits',
        list: [
          'Your team should focus on models and products',
          'You need monitoring and on-call from day one',
          'Faster time to a working cluster',
          'Defined SLAs for availability and response'
        ]
      },
      {
        id: 'questions',
        heading: 'Questions to ask any provider',
        list: [
          'Which driver, CUDA and orchestration versions are supported, and who upgrades them?',
          'What is the cluster network: InfiniBand or RoCE, at what speed and topology?',
          'How are failed GPUs detected and replaced, and how quickly?',
          'What monitoring and logs can your team access?',
          'Where is data stored, who can access it, and how is it deleted at the end?',
          'Which security and compliance standards apply (for example ISO 27001, DPDP)?'
        ]
      }
    ],
    faq: [
      [
        'Is bare metal faster than managed?',
        'Not inherently. Performance depends on the hardware, network and configuration. Managed services can run on dedicated bare-metal hardware too.'
      ],
      [
        'Can I start managed and move to bare metal later?',
        'Often, yes. Agree the exit and handover terms at the start, including data, images and configuration.'
      ],
      [
        'What about virtual machines?',
        'GPU virtual machines add a hypervisor layer. They are convenient for short or variable workloads; dedicated bare metal suits sustained, performance-sensitive jobs.'
      ]
    ],
    sources: [['NVIDIA · HGX reference architecture', NV.hgx]],
    related: ['infiniband-vs-roce', 'choosing-gpus-for-inference', 'liquid-cooling']
  },
  {
    slug: 'gb200-nvl72-explained',
    title: 'GB200 NVL72 explained: a rack-scale GPU system',
    metaTitle: 'GB200 NVL72 Explained: Rack-Scale Blackwell | AnthroPrime',
    description:
      'What GB200 NVL72 is: 72 Blackwell GPUs and 36 Grace CPUs in one liquid-cooled NVLink domain, how it differs from 8-GPU servers, and what it needs.',
    eyebrow: 'Guide · Rack-scale systems',
    lede: 'GB200 NVL72 is a liquid-cooled rack that connects 72 NVIDIA Blackwell GPUs and 36 Grace CPUs into a single NVLink domain. For parallel work, its GPUs behave much more like one very large GPU system than like 18 separate compute trays.',
    sections: [
      {
        id: 'what',
        heading: 'What is inside',
        body: [
          'The rack is built from 36 GB200 superchips, each pairing one Grace CPU with two Blackwell GPUs. Together they provide 72 GPUs and about 13.4 TB of HBM3e, joined by 5th-generation NVLink at 1.8 TB/s per GPU.'
        ]
      },
      {
        id: 'why',
        heading: 'Why one NVLink domain matters',
        body: [
          'In 8-GPU servers, NVLink connects GPUs inside a server and the cluster network connects servers. Work split across servers must cross that slower network. In NVL72 all 72 GPUs share NVLink, so tensor and expert parallelism can span far more GPUs at NVLink speed. That is what makes it suited to very large models and real-time inference on them.'
        ]
      },
      {
        id: 'vs-hgx',
        heading: 'NVL72 vs an 8-GPU HGX B200 server',
        table: {
          head: ['', 'HGX B200 server', 'GB200 NVL72 rack'],
          rows: [
            ['GPUs in one NVLink domain', '8', '72'],
            ['CPUs', 'x86 host CPUs', '36 Grace (Arm)'],
            ['Cooling', 'Air or liquid, by system', 'Liquid-cooled'],
            ['Unit of deployment', 'Server', 'Whole rack']
          ]
        }
      },
      {
        id: 'facility',
        heading: 'What it needs from the facility',
        body: [
          'A liquid-cooled rack at this density needs facility water loops or coolant distribution, rack power far above typical air-cooled racks, and suitable floor loading. Site readiness is usually the longest lead item, so plan the data centre alongside the hardware.'
        ]
      },
      {
        id: 'who',
        heading: 'Who it is for',
        list: [
          'Training and serving trillion-parameter-class models',
          'Large mixture-of-experts models that need wide expert parallelism',
          'Sovereign and national AI programmes building AI factories'
        ],
        body: [
          'Its successor, GB300 NVL72, uses Blackwell Ultra GPUs in the same rack-scale design.'
        ]
      }
    ],
    faq: [
      [
        'Is GB200 NVL72 one computer?',
        'It is a rack of compute and switch trays, but its 72 GPUs share one NVLink domain, so software can treat them as one large accelerator pool for parallel work.'
      ],
      [
        'Can GB200 NVL72 be air-cooled?',
        'No. It is designed as a liquid-cooled rack.'
      ],
      [
        'How does it connect to other racks?',
        'Racks join through the cluster network, such as InfiniBand at up to 800 Gb/s, to build larger clusters.'
      ]
    ],
    sources: [
      ['NVIDIA · GB200 NVL72', NV.gb200],
      ['NVIDIA · GB300 NVL72', NV.gb300]
    ],
    related: ['h200-vs-b200', 'nvlink', 'liquid-cooling']
  }
]

/* ------------------------------------------------------------------ */
/* Glossary                                                            */
/* ------------------------------------------------------------------ */

export const GLOSSARY = [
  {
    slug: 'nvlink',
    term: 'NVLink',
    title: 'What is NVLink?',
    metaTitle: 'What Is NVLink? GPU Interconnect Explained | AnthroPrime',
    short:
      'NVLink is NVIDIA’s high-bandwidth interconnect for moving data directly between GPUs, much faster than PCIe.',
    sections: [
      {
        heading: 'Why it exists',
        body: [
          'When a model is split across GPUs, they exchange data constantly. PCIe was not designed for that volume. NVLink gives each GPU a much wider, direct path to other GPUs.'
        ]
      },
      {
        heading: 'Generations',
        table: {
          head: ['Generation', 'Example GPUs', 'Bandwidth per GPU'],
          rows: [
            ['NVLink 3', 'A100', '600 GB/s'],
            ['NVLink 4', 'H100, H200', '900 GB/s'],
            ['NVLink 5', 'B200, GB200', '1.8 TB/s']
          ]
        }
      },
      {
        heading: 'NVSwitch and NVLink domains',
        body: [
          'NVSwitch chips connect every GPU in a system to every other at full NVLink speed. In HGX servers that domain is 8 GPUs; in GB200 NVL72 it spans 72 GPUs across a rack.'
        ]
      }
    ],
    related: ['infiniband-vs-roce', 'gb200-nvl72-explained', 'h200-vs-b200']
  },
  {
    slug: 'infiniband-vs-roce',
    term: 'InfiniBand vs RoCE',
    title: 'InfiniBand vs RoCE: what’s the difference?',
    metaTitle: 'InfiniBand vs RoCE for AI Clusters Explained | AnthroPrime',
    short:
      'InfiniBand and RoCE are the two main RDMA networks for connecting GPU servers into AI clusters: a purpose-built fabric versus RDMA over Ethernet.',
    sections: [
      {
        heading: 'What both do',
        body: [
          'Both provide RDMA (remote direct memory access), letting servers move data between each other’s memory with very little CPU involvement. That keeps GPUs fed during distributed training and multi-node inference.'
        ]
      },
      {
        heading: 'InfiniBand',
        body: [
          'A fabric designed for high-performance computing, with built-in lossless flow control, adaptive routing and in-network reduction (SHARP) on NVIDIA Quantum switches. Current generations run at 400 Gb/s (NDR) and 800 Gb/s (XDR) per port.'
        ]
      },
      {
        heading: 'RoCE',
        body: [
          'RDMA over Converged Ethernet runs RDMA on Ethernet networks. RoCE v2 is routable over IP. It needs careful configuration of congestion control (for example PFC and ECN) to perform well, and uses familiar Ethernet tooling. Platforms such as NVIDIA Spectrum-X are Ethernet designed for AI.'
        ]
      },
      {
        heading: 'Choosing',
        table: {
          head: ['', 'InfiniBand', 'RoCE'],
          rows: [
            ['Designed for', 'HPC and AI fabrics', 'Ethernet data centres'],
            ['Lossless behaviour', 'Built in', 'Requires tuning'],
            ['Operations', 'Specialist skills', 'Ethernet skills'],
            ['Typical fit', 'Large training clusters', 'Mixed and Ethernet-first estates']
          ]
        }
      }
    ],
    related: ['nvlink', 'bare-metal-vs-managed-gpu', 'gb200-nvl72-explained']
  },
  {
    slug: 'hbm3e',
    term: 'HBM3e',
    title: 'What is HBM3e memory?',
    metaTitle: 'What Is HBM3e? GPU High-Bandwidth Memory | AnthroPrime',
    short:
      'HBM3e is the extended third generation of High Bandwidth Memory: stacked DRAM placed next to the GPU to deliver very high capacity and bandwidth.',
    sections: [
      {
        heading: 'How it works',
        body: [
          'HBM stacks DRAM dies vertically and places the stacks beside the GPU on the same package, connected by a very wide interface. That gives far more bandwidth than conventional graphics memory.'
        ]
      },
      {
        heading: 'Where you find it',
        table: {
          head: ['GPU', 'Memory', 'Bandwidth'],
          rows: [
            ['H100 SXM', '80 GB HBM3', '3.35 TB/s'],
            ['H200', '141 GB HBM3e', '4.8 TB/s'],
            ['B200 (HGX)', '180 GB HBM3e', '8 TB/s']
          ]
        }
      },
      {
        heading: 'Why it matters for AI',
        body: [
          'LLM token generation reads the model weights and KV cache for every token, so it is often limited by memory bandwidth. More HBM capacity also lets larger models and longer contexts fit on fewer GPUs.'
        ]
      }
    ],
    related: ['h100-vs-h200', 'gpu-memory-for-llms', 'nvlink']
  },
  {
    slug: 'mig',
    term: 'MIG (Multi-Instance GPU)',
    title: 'What is MIG (Multi-Instance GPU)?',
    metaTitle: 'What Is MIG? Multi-Instance GPU Explained | AnthroPrime',
    short:
      'MIG (Multi-Instance GPU) partitions one NVIDIA data-centre GPU into up to seven isolated instances, each with dedicated memory and compute.',
    sections: [
      {
        heading: 'What it does',
        body: [
          'Each MIG instance gets its own slice of memory, cache and compute, so one workload cannot slow another or read its memory. To software, each instance looks like a separate, smaller GPU.'
        ]
      },
      {
        heading: 'Which GPUs support it',
        body: [
          'A100, H100 and H200 support up to seven instances, as do Blackwell data-centre GPUs. L40S does not support MIG.'
        ]
      },
      {
        heading: 'When to use it',
        list: [
          'Serving several small models on one GPU',
          'Isolating tenants or teams',
          'Development and testing environments',
          'Right-sizing GPU use for light inference'
        ]
      }
    ],
    related: ['choosing-gpus-for-inference', 'a100-vs-h100', 'bare-metal-vs-managed-gpu']
  },
  {
    slug: 'liquid-cooling',
    term: 'Liquid cooling',
    title: 'What is liquid cooling for AI data centres?',
    metaTitle: 'Liquid Cooling for AI Data Centres Explained | AnthroPrime',
    short:
      'Liquid cooling removes heat from GPUs and racks with liquid instead of air, enabling the rack densities that modern AI systems need.',
    sections: [
      {
        heading: 'Why AI needs it',
        body: [
          'GPU power per chip has risen with each generation, and racks of AI servers concentrate that heat. Air cooling becomes difficult as rack densities climb into the tens of kilowatts; liquid carries heat far more efficiently.'
        ]
      },
      {
        heading: 'Main approaches',
        table: {
          head: ['Approach', 'How it works'],
          rows: [
            ['Direct-to-chip', 'Cold plates on GPUs and CPUs carry heat to a coolant loop'],
            ['Rear-door heat exchangers', 'Liquid-cooled doors capture heat from air-cooled racks'],
            ['Immersion', 'Servers sit in a non-conductive fluid']
          ]
        }
      },
      {
        heading: 'What the facility needs',
        body: [
          'Coolant distribution units, facility water loops, leak detection and maintenance procedures, plus power and floor loading for dense racks. Rack-scale systems such as GB200 NVL72 are liquid-cooled by design.'
        ]
      }
    ],
    related: ['gb200-nvl72-explained', 'h200-vs-b200', 'bare-metal-vs-managed-gpu']
  }
]

/* ------------------------------------------------------------------ */

export const comparisonBySlug = (slug) =>
  COMPARISONS.find((c) => c.slug === slug) || null
export const guideBySlug = (slug) => GUIDES.find((g) => g.slug === slug) || null
export const termBySlug = (slug) => GLOSSARY.find((t) => t.slug === slug) || null

/** Resolve a related slug to { title, to } across all three collections. */
export function relatedLink(slug) {
  const c = comparisonBySlug(slug)
  if (c) return { title: c.title, to: `/compare/${slug}`, kind: 'Comparison' }
  const g = guideBySlug(slug)
  if (g) return { title: g.title, to: `/guides/${slug}`, kind: 'Guide' }
  const t = termBySlug(slug)
  if (t) return { title: t.term, to: `/glossary/${slug}`, kind: 'Glossary' }
  return null
}

export const KNOWLEDGE_ROUTES = [
  '/guides',
  '/glossary',
  ...COMPARISONS.map((c) => `/compare/${c.slug}`),
  ...GUIDES.map((g) => `/guides/${g.slug}`),
  ...GLOSSARY.map((t) => `/glossary/${t.slug}`)
]

/** Rough reading time from all text in an entry. */
export function readingMinutes(entry) {
  const text = JSON.stringify(entry).replace(/https?:\/\/\S+/g, '')
  return Math.max(2, Math.round(text.split(/\s+/).length / 220))
}
