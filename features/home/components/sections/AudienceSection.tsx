'use client';

import React from 'react';

export interface AudienceItem {
  id: string;
  step: string;
  title: string;
  description: string;
}

const DEFAULT_AUDIENCE: AudienceItem[] = [
  {
    id: 'authors',
    step: '01',
    title: 'Authors & Publishers',
    description:
      'Hardcover and paperback books printed with tight tolerances, spine alignment, and archival paper stock.',
  },
  {
    id: 'enterprises',
    step: '02',
    title: 'Enterprises & Startups',
    description:
      'Visiting cards, spot UV finishes, branded letterheads, and collateral with bulk tier discounts.',
  },
  {
    id: 'academics',
    step: '03',
    title: 'Academics & Students',
    description:
      'Project reports, thesis binding, and documentation with rapid turnaround across India.',
  },
];

export interface AudienceSectionProps {
  items?: AudienceItem[];
  className?: string;
}

export function AudienceSection({
  items = DEFAULT_AUDIENCE,
  className = '',
}: AudienceSectionProps) {
  return (
    <section className={`audience section ${className}`.trim()}>
      <div className="section-heading" style={{ maxWidth: 540 }}>
        <p className="eyebrow">WHO WE SERVE</p>
        <h2>Precision print options tailored for every workflow.</h2>
      </div>
      <div className="audience-grid">
        {items.map((item) => (
          <article key={item.id}>
            <span>{item.step}</span>
            <h3>{item.title}</h3>
            <p>{item.description}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

export default AudienceSection;
