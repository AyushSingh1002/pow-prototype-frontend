'use client';

import React from 'react';
import { OrderHistoryItem } from '../../../types';

interface OrderAuditTimelineProps {
  history: OrderHistoryItem[];
}

export function OrderAuditTimeline({ history }: OrderAuditTimelineProps) {
  return (
    <>
      <h4 style={{ margin: '25px 0 10px', fontSize: 16 }}>Audit Status Transitions History</h4>
      <div className="timeline-list">
        {history.map((h) => (
          <div className="timeline-item active" key={h.id}>
            <b>Status: {h.toStatus}</b>
            <p>{h.reason}</p>
            <time>
              {new Date(h.createdAt).toLocaleTimeString()} ({new Date(h.createdAt).toLocaleDateString()})
            </time>
          </div>
        ))}
      </div>
    </>
  );
}
