import React from 'react'
import { Link } from 'react-router-dom'
import { ArrowUpRight, Cpu, Workflow, SlidersHorizontal } from 'lucide-react'
import { Reveal } from './ui'

export default function LearningTeaser() {
  return (
    <section className="section learning-teaser" id="learn">
      <div className="wrap learning-teaser-grid">
        <Reveal className="learning-teaser-image">
          <img
            src="/images/gpu-silicon.jpg"
            alt="Generated concept artwork of an AI accelerator with a silicon die, memory packages, and gold circuit traces"
            width="1536"
            height="1024"
            loading="lazy"
            decoding="async"
          />
          <div className="teaser-image-caption mono">
            <span className="status-dot" />
            Inside the intelligence / Concept artwork
          </div>
          <div className="teaser-orbit" aria-hidden="true" />
        </Reveal>
        <Reveal delay={0.12} className="learning-teaser-copy">
          <div className="eyebrow mono">The GPU Lab / Now exploring</div>
          <h2 className="editorial-title">
            Power is interesting.
            <br />
            <em>Understanding it is better.</em>
          </h2>
          <p>
            Look inside a GPU. Watch work happen in parallel. See why model size
            and memory belong in the same conversation.
          </p>
          <div className="teaser-topics">
            {[
              [Cpu, 'Explore the architecture'],
              [Workflow, 'Watch parallel work'],
              [SlidersHorizontal, 'Experiment with model memory']
            ].map(([Icon, text]) => (
              <div key={text}>
                <Icon size={16} />
                {text}
                <span>↗</span>
              </div>
            ))}
          </div>
          <Link to="/gpu-lab" className="btn btn-primary">
            Enter the GPU Lab
            <ArrowUpRight />
          </Link>
          <span className="teaser-note">
            Interactive. No sign-up. Curiosity encouraged.
          </span>
        </Reveal>
      </div>
    </section>
  )
}

export function InfrastructureStory() {
  return (
    <section className="infrastructure-story">
      <img
        src="/images/compute-horizon.jpg"
        alt="Generated conceptual interior of a GPU data centre with blue-lit cooling pipes and gold status lights"
        width="2048"
        height="768"
        loading="lazy"
        decoding="async"
      />
      <div className="story-sweep" aria-hidden="true" />
      <Reveal className="wrap story-content">
        <div className="eyebrow mono">Beyond the silicon</div>
        <h2>
          The chip is the beginning.
          <br />
          <em>The system makes it possible.</em>
        </h2>
        <p>
          Compute. Memory. Fabric. Cooling. Operations.
          <br />
          Understand how the pieces work together before you scale.
        </p>
        <Link to="/gpu-lab#workflows" className="btn btn-gold">
          Follow an AI workload
          <ArrowUpRight />
        </Link>
        <span className="story-caption mono">
          AI-generated concept environment · Not an AnthroPrime facility
          photograph
        </span>
      </Reveal>
    </section>
  )
}
