// LLM memory planning maths used by the GPU memory guide and its calculator.
// Decimal GB (1 GB = 1e9 bytes). Planning estimates, not measurements.

/** Llama-3-style architectures (grouped-query attention). */
export const MODEL_PRESETS = [
  { id: '8b', label: '8B (Llama 3 8B-style)', params: 8, layers: 32, kvHeads: 8, headDim: 128 },
  { id: '70b', label: '70B (Llama 3 70B-style)', params: 70, layers: 80, kvHeads: 8, headDim: 128 },
  { id: '405b', label: '405B (Llama 3.1 405B-style)', params: 405, layers: 126, kvHeads: 8, headDim: 128 }
]

export const WEIGHT_PRECISIONS = [
  { id: 'bf16', label: 'FP16 / BF16', bytes: 2 },
  { id: 'fp8', label: 'FP8 / INT8', bytes: 1 },
  { id: 'int4', label: '4-bit', bytes: 0.5 }
]

/** Allowance for activations, framework buffers and fragmentation. */
export const OVERHEAD = 0.15

/** Mixed-precision Adam: weights + gradients + FP32 master copy + 2 moments. */
export const TRAINING_BYTES_PER_PARAM = 16

export function weightsGB(paramsB, bytes) {
  return paramsB * bytes
}

/** KV cache per token: 2 (K and V) × layers × KV heads × head dim × bytes. */
export function kvBytesPerToken({ layers, kvHeads, headDim }, bytes = 2) {
  return 2 * layers * kvHeads * headDim * bytes
}

export function kvCacheGB(model, tokens, sequences = 1, bytes = 2) {
  return (kvBytesPerToken(model, bytes) * tokens * sequences) / 1e9
}

export function inferenceGB({ model, weightBytes, tokens, sequences, kvBytes = 2 }) {
  const weights = weightsGB(model.params, weightBytes)
  const kv = kvCacheGB(model, tokens, sequences, kvBytes)
  const overhead = weights * OVERHEAD
  return { weights, kv, overhead, total: weights + kv + overhead }
}

/**
 * GPUs needed for a memory total, rounded up to 1, 2, 4 or 8 — the usual
 * tensor-parallel sizes. Returns null above one 8-GPU node.
 */
export function gpusNeeded(totalGB, gpuMemoryGB) {
  const raw = Math.ceil(totalGB / gpuMemoryGB)
  return [1, 2, 4, 8].find((n) => n >= raw) ?? null
}

export const PLANNING_GPUS = [
  { slug: 'l40s', label: 'L40S', memory: 48 },
  { slug: 'h100', label: 'A100 / H100', memory: 80 },
  { slug: 'h200', label: 'H200', memory: 141 },
  { slug: 'b200', label: 'B200', memory: 180 }
]
