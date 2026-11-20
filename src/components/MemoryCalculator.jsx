import React, { useId, useState } from 'react'
import {
  MODEL_PRESETS,
  WEIGHT_PRECISIONS,
  PLANNING_GPUS,
  inferenceGB,
  gpusNeeded
} from '../data/llm-memory'

const fmt = (gb) => (gb >= 100 ? Math.round(gb) : Math.round(gb * 10) / 10)

/** Inference memory estimate: weights + KV cache + 15% allowance. */
export default function MemoryCalculator() {
  const id = useId().replace(/:/g, '')
  const [modelId, setModelId] = useState('70b')
  const [precisionId, setPrecisionId] = useState('bf16')
  const [tokens, setTokens] = useState(8192)
  const [sequences, setSequences] = useState(1)
  const [kvBytes, setKvBytes] = useState(2)
  const model = MODEL_PRESETS.find((m) => m.id === modelId)
  const precision = WEIGHT_PRECISIONS.find((p) => p.id === precisionId)
  const est = inferenceGB({
    model,
    weightBytes: precision.bytes,
    tokens,
    sequences,
    kvBytes
  })
  const max = Math.max(est.total, 1)
  return (
    <section className="kb-calc" aria-labelledby={`${id}-title`}>
      <div className="kb-calc-head">
        <span className="mono">Calculator</span>
        <h2 id={`${id}-title`}>Estimate inference memory</h2>
      </div>
      <div className="kb-calc-grid">
        <label>
          Model
          <select value={modelId} onChange={(e) => setModelId(e.target.value)}>
            {MODEL_PRESETS.map((m) => (
              <option key={m.id} value={m.id}>
                {m.label}
              </option>
            ))}
          </select>
        </label>
        <label>
          Weight precision
          <select
            value={precisionId}
            onChange={(e) => setPrecisionId(e.target.value)}
          >
            {WEIGHT_PRECISIONS.map((p) => (
              <option key={p.id} value={p.id}>
                {p.label}
              </option>
            ))}
          </select>
        </label>
        <label>
          Context length (tokens)
          <select
            value={tokens}
            onChange={(e) => setTokens(Number(e.target.value))}
          >
            {[2048, 4096, 8192, 32768, 131072].map((t) => (
              <option key={t} value={t}>
                {t.toLocaleString('en-GB')}
              </option>
            ))}
          </select>
        </label>
        <label>
          Concurrent conversations
          <select
            value={sequences}
            onChange={(e) => setSequences(Number(e.target.value))}
          >
            {[1, 4, 8, 16, 32, 64].map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </label>
        <label>
          KV cache precision
          <select
            value={kvBytes}
            onChange={(e) => setKvBytes(Number(e.target.value))}
          >
            <option value={2}>FP16 / BF16</option>
            <option value={1}>FP8</option>
          </select>
        </label>
      </div>
      <div className="kb-calc-result" aria-live="polite">
        <div className="kb-calc-total">
          <span className="mono">Estimated total</span>
          <strong>≈ {fmt(est.total)} GB</strong>
        </div>
        <div className="kb-calc-bar" aria-hidden="true">
          <span style={{ width: `${(est.weights / max) * 100}%` }} className="kb-w" />
          <span style={{ width: `${(est.kv / max) * 100}%` }} className="kb-k" />
          <span style={{ width: `${(est.overhead / max) * 100}%` }} className="kb-o" />
        </div>
        <dl className="kb-calc-parts">
          <div>
            <dt>
              <i className="kb-w" /> Weights
            </dt>
            <dd>{fmt(est.weights)} GB</dd>
          </div>
          <div>
            <dt>
              <i className="kb-k" /> KV cache
            </dt>
            <dd>{fmt(est.kv)} GB</dd>
          </div>
          <div>
            <dt>
              <i className="kb-o" /> 15% allowance
            </dt>
            <dd>{fmt(est.overhead)} GB</dd>
          </div>
        </dl>
        <table className="kb-table kb-calc-fit">
          <caption className="sr-only">GPUs needed for this estimate</caption>
          <thead>
            <tr>
              {PLANNING_GPUS.map((g) => (
                <th key={g.slug} scope="col">
                  {g.label}
                  <span>{g.memory} GB</span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr>
              {PLANNING_GPUS.map((g) => {
                const n = gpusNeeded(est.total, g.memory)
                return (
                  <td key={g.slug}>
                    {n ? `${n} GPU${n > 1 ? 's' : ''}` : 'More than 8'}
                  </td>
                )
              })}
            </tr>
          </tbody>
        </table>
        <p className="kb-calc-note">
          Planning estimate for inference, rounded to 1, 2, 4 or 8 GPUs. Real
          usage depends on the inference engine and its settings; measure before
          you commit.
        </p>
      </div>
    </section>
  )
}
