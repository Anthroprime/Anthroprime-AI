import React from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowUpRight, ChevronRight, ChevronDown, Check } from 'lucide-react'
import NotFound from './NotFound'
import MemoryCalculator from '../components/MemoryCalculator'
import { GPUS } from '../data/gpus'
import {
  COMPARISONS,
  COMPARE_SPECS,
  GUIDES,
  GLOSSARY,
  KNOWLEDGE_UPDATED,
  comparisonBySlug,
  guideBySlug,
  termBySlug,
  relatedLink,
  readingMinutes
} from '../data/knowledge'
import {
  MODEL_PRESETS,
  WEIGHT_PRECISIONS,
  PLANNING_GPUS,
  inferenceGB,
  gpusNeeded
} from '../data/llm-memory'
import '../components/knowledge.css'

const UPDATED_LABEL = new Date(KNOWLEDGE_UPDATED + 'T00:00:00Z').toLocaleDateString(
  'en-GB',
  { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' }
)

/* ---------------------------- shared pieces ---------------------------- */

function Crumbs({ trail }) {
  return (
    <nav className="breadcrumb mono" aria-label="Breadcrumb">
      <Link to="/" className="hover:text-accent transition-colors">
        Home
      </Link>
      {trail.map(([label, to]) => (
        <React.Fragment key={label}>
          <ChevronRight className="w-3 h-3" />
          {to ? (
            <Link to={to} className="hover:text-accent transition-colors">
              {label}
            </Link>
          ) : (
            <span className="text-muted">{label}</span>
          )}
        </React.Fragment>
      ))}
    </nav>
  )
}

function ArticleHero({ trail, eyebrow, title, lede, minutes }) {
  return (
    <header className="kb-hero">
      <div className="wrap">
        <Crumbs trail={trail} />
        <div className="eyebrow mono">{eyebrow}</div>
        <h1>{title}</h1>
        <p className="kb-lede">{lede}</p>
        <p className="kb-meta mono">
          <time dateTime={KNOWLEDGE_UPDATED}>Updated {UPDATED_LABEL}</time>
          {minutes && <> · {minutes} min read</>}
          {' '}· AnthroPrime
        </p>
      </div>
    </header>
  )
}

function Table({ table, caption }) {
  return (
    <div className="kb-table-wrap">
      <table className="kb-table">
        {caption && <caption className="sr-only">{caption}</caption>}
        <thead>
          <tr>
            {table.head.map((h, i) => (
              <th key={i} scope="col">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {table.rows.map((row, r) => (
            <tr key={r}>
              {row.map((cell, c) =>
                c === 0 ? (
                  <th key={c} scope="row">
                    {cell}
                  </th>
                ) : (
                  <td key={c}>{cell}</td>
                )
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

/** 70B fit table, computed from the same maths as the calculator. */
function FitTable() {
  const model = MODEL_PRESETS.find((m) => m.id === '70b')
  return (
    <Table
      caption="GPUs needed for a 70B model by precision"
      table={{
        head: ['70B weights', ...PLANNING_GPUS.map((g) => `${g.label} (${g.memory} GB)`)],
        rows: WEIGHT_PRECISIONS.map((p) => {
          const { total } = inferenceGB({
            model,
            weightBytes: p.bytes,
            tokens: 8192,
            sequences: 1
          })
          return [
            p.label,
            ...PLANNING_GPUS.map((g) => {
              const n = gpusNeeded(total, g.memory)
              return n ? `${n} GPU${n > 1 ? 's' : ''}` : '8+'
            })
          ]
        })
      }}
    />
  )
}

function Section({ section }) {
  return (
    <section className="kb-section" id={section.id}>
      {section.heading && <h2>{section.heading}</h2>}
      {section.body?.map((p, i) => (
        <p key={i}>{p}</p>
      ))}
      {section.list && (
        <ul className="kb-list">
          {section.list.map((item) => (
            <li key={item}>
              <Check aria-hidden="true" />
              {item}
            </li>
          ))}
        </ul>
      )}
      {section.table && <Table table={section.table} caption={section.heading} />}
      {section.fitTable && <FitTable />}
      {section.note && <p className="kb-note">{section.note}</p>}
    </section>
  )
}

function Faq({ items }) {
  return (
    <section className="kb-section kb-faq" id="faq">
      <h2>Frequently asked questions</h2>
      {items.map(([q, a]) => (
        <details key={q}>
          <summary>
            {q}
            <ChevronDown aria-hidden="true" />
          </summary>
          <p>{a}</p>
        </details>
      ))}
    </section>
  )
}

function Sources({ items }) {
  if (!items?.length) return null
  return (
    <p className="kb-sources">
      Sources:{' '}
      {items.map(([label, href], i) => (
        <React.Fragment key={href}>
          {i > 0 && ' · '}
          <a href={href} target="_blank" rel="noopener noreferrer">
            {label} ↗
          </a>
        </React.Fragment>
      ))}
    </p>
  )
}

function Related({ slugs }) {
  const links = slugs.map(relatedLink).filter(Boolean)
  return (
    <aside className="kb-related" aria-label="Related reading">
      <h2 className="mono">Related reading</h2>
      <div>
        {links.map((l) => (
          <Link key={l.to} to={l.to}>
            <span className="mono">{l.kind}</span>
            {l.title}
            <ArrowUpRight aria-hidden="true" />
          </Link>
        ))}
      </div>
    </aside>
  )
}

function Cta({ state, text = 'Tell us the model, scale and timeline. We source and verify matching GPU capacity across our network.' }) {
  return (
    <aside className="kb-cta">
      <div>
        <h2>Planning GPU capacity?</h2>
        <p>{text}</p>
      </div>
      <Link className="btn btn-gold" to="/find-capacity" state={state}>
        Discuss your capacity requirement
        <ArrowUpRight />
      </Link>
    </aside>
  )
}

function Toc({ items }) {
  return (
    <nav className="kb-toc" aria-label="On this page">
      <span className="mono">On this page</span>
      {items.map(([id, label]) => (
        <a key={id} href={`#${id}`}>
          {label}
        </a>
      ))}
    </nav>
  )
}

/* ------------------------------- pages ------------------------------- */

export function KnowledgeIndex() {
  return (
    <>
      <ArticleHero
        trail={[['Guides']]}
        eyebrow="Guides & comparisons"
        title="GPU guides, comparisons and glossary"
        lede="Practical, vendor-neutral explanations for planning AI infrastructure: which GPU fits a workload, how much memory a model needs, and the terms you will meet along the way."
      />
      <div className="wrap kb-index">
        <section>
          <h2 className="kb-index-title">GPU comparisons</h2>
          <div className="kb-cards">
            {COMPARISONS.map((c) => (
              <Link key={c.slug} to={`/compare/${c.slug}`} className="kb-card">
                <span className="mono">Comparison</span>
                <h3>{c.title}</h3>
                <p>{c.description}</p>
              </Link>
            ))}
          </div>
        </section>
        <section>
          <h2 className="kb-index-title">Guides</h2>
          <div className="kb-cards">
            {GUIDES.map((g) => (
              <Link key={g.slug} to={`/guides/${g.slug}`} className="kb-card">
                <span className="mono">{g.eyebrow.replace('Guide · ', '')}</span>
                <h3>{g.title}</h3>
                <p>{g.description}</p>
              </Link>
            ))}
          </div>
        </section>
        <section>
          <h2 className="kb-index-title">Glossary</h2>
          <div className="kb-cards kb-cards--terms">
            {GLOSSARY.map((t) => (
              <Link key={t.slug} to={`/glossary/${t.slug}`} className="kb-card">
                <h3>{t.term}</h3>
                <p>{t.short}</p>
              </Link>
            ))}
          </div>
          <Link to="/glossary" className="text-link mt-6">
            Browse the glossary
            <ArrowUpRight />
          </Link>
        </section>
        <Cta />
      </div>
    </>
  )
}

export function ComparePage() {
  const { slug } = useParams()
  const c = comparisonBySlug(slug)
  if (!c) return <NotFound />
  const A = GPUS[c.a]
  const B = GPUS[c.b]
  const rows = COMPARE_SPECS.filter((k) => A.specs[k] || B.specs[k]).map((k) => [
    k,
    A.specs[k] || (k === 'FP4 Tensor' ? 'Not supported' : '—'),
    B.specs[k] || (k === 'FP4 Tensor' ? 'Not supported' : '—')
  ])
  return (
    <article className="kb">
      <ArticleHero
        trail={[['Guides', '/guides'], [`${A.name} vs ${B.name}`]]}
        eyebrow="GPU comparison"
        title={c.title}
        lede={c.lede}
        minutes={readingMinutes(c)}
      />
      <div className="wrap kb-layout">
        <Toc
          items={[
            ['specs', 'Specifications'],
            ['differences', 'Key differences'],
            ['choose', 'Which to choose'],
            ['faq', 'FAQ']
          ]}
        />
        <div className="kb-body">
          <section className="kb-section" id="specs">
            <h2>
              {A.name} vs {B.name} specifications
            </h2>
            <Table
              caption={`${A.name} and ${B.name} specifications`}
              table={{ head: ['', A.full, B.full], rows }}
            />
            <p className="kb-note">
              Figures from NVIDIA datasheets; “sparse” values assume structured
              sparsity. Exact figures vary by system and variant.
            </p>
          </section>
          <section className="kb-section" id="differences">
            <h2>Key differences</h2>
            {c.points.map((p) => (
              <React.Fragment key={p.heading}>
                <h3>{p.heading}</h3>
                <p>{p.text}</p>
              </React.Fragment>
            ))}
          </section>
          <section className="kb-section" id="choose">
            <h2>Which should you choose?</h2>
            <div className="kb-choose">
              {[
                [A, c.chooseA],
                [B, c.chooseB]
              ].map(([g, items]) => (
                <div key={g.slug}>
                  <h3>Choose {g.name} for</h3>
                  <ul className="kb-list">
                    {items.map((item) => (
                      <li key={item}>
                        <Check aria-hidden="true" />
                        {item}
                      </li>
                    ))}
                  </ul>
                  <Link to={`/gpu/${g.slug}`} className="text-link">
                    {g.name} details
                    <ArrowUpRight />
                  </Link>
                </div>
              ))}
            </div>
            <p className="kb-verdict">{c.verdict}</p>
          </section>
          <Faq items={c.faq} />
          <Sources
            items={[
              [`NVIDIA · ${A.name}`, `https://www.nvidia.com/en-us/data-center/${c.a}/`],
              [`NVIDIA · ${B.name}`, B.slug === 'b200' ? 'https://docs.nvidia.com/enterprise-reference-architectures/hgx-ai-factory-h100-h200-b200/latest/components.html' : `https://www.nvidia.com/en-us/data-center/${c.b}/`]
            ]}
          />
          <Related slugs={c.related} />
          <Cta
            state={{ gpu: B.name, workload: `Comparing ${A.name} and ${B.name}. ` }}
            text={`Not sure whether ${A.name} or ${B.name} fits? Share your model and targets and we will compare verified options across our network.`}
          />
        </div>
      </div>
    </article>
  )
}

export function GuidePage() {
  const { slug } = useParams()
  const g = guideBySlug(slug)
  if (!g) return <NotFound />
  return (
    <article className="kb">
      <ArticleHero
        trail={[['Guides', '/guides'], [g.title.replace(/[:?].*$/, '')]]}
        eyebrow={g.eyebrow}
        title={g.title}
        lede={g.lede}
        minutes={readingMinutes(g)}
      />
      <div className="wrap kb-layout">
        <Toc
          items={[
            ...(g.calculator ? [['calculator', 'Calculator']] : []),
            ...g.sections.map((s) => [s.id, s.heading]),
            ['faq', 'FAQ']
          ]}
        />
        <div className="kb-body">
          {g.calculator && (
            <div id="calculator">
              <MemoryCalculator />
            </div>
          )}
          {g.sections.map((s) => (
            <Section key={s.id} section={s} />
          ))}
          <Faq items={g.faq} />
          <Sources items={g.sources} />
          <Related slugs={g.related} />
          <Cta />
        </div>
      </div>
    </article>
  )
}

export function GlossaryIndex() {
  return (
    <>
      <ArticleHero
        trail={[['Glossary']]}
        eyebrow="Glossary"
        title="AI infrastructure glossary"
        lede="Plain-English definitions of the GPU, networking, memory and data-centre terms that come up when planning AI infrastructure."
      />
      <div className="wrap kb-index">
        <dl className="kb-terms">
          {GLOSSARY.map((t) => (
            <div key={t.slug}>
              <dt>
                <Link to={`/glossary/${t.slug}`}>{t.term}</Link>
              </dt>
              <dd>{t.short}</dd>
            </div>
          ))}
        </dl>
        <Link to="/guides" className="text-link mt-8">
          Guides and GPU comparisons
          <ArrowUpRight />
        </Link>
      </div>
    </>
  )
}

export function GlossaryTerm() {
  const { slug } = useParams()
  const t = termBySlug(slug)
  if (!t) return <NotFound />
  return (
    <article className="kb">
      <ArticleHero
        trail={[['Glossary', '/glossary'], [t.term]]}
        eyebrow="Glossary"
        title={t.title}
        lede={t.short}
        minutes={readingMinutes(t)}
      />
      <div className="wrap kb-layout kb-layout--narrow">
        <div className="kb-body">
          {t.sections.map((s) => (
            <Section key={s.heading} section={s} />
          ))}
          <Related slugs={t.related} />
          <Cta />
        </div>
      </div>
    </article>
  )
}
