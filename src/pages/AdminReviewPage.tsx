/**
 * /admin/review — operator dashboard for the HITL queue.
 *
 * Reads /api/v1/admin/review/queue and lets the admin resolve each item
 * (set true price / blacklist comparable / dismiss). Auth is enforced
 * server-side via the adminOnly middleware; this page just renders
 * "Access denied" if the API returns 403.
 */
import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { apiFetch } from '../lib/api';

type ReviewKind = 'valuation_disputed' | 'bad_comparable' | 'low_confidence';
type ReviewStatus = 'pending' | 'in_progress' | 'resolved';

interface ReviewItem {
  _id: string;
  kind: ReviewKind;
  status: ReviewStatus;
  vehicleId?: string;
  comparableId?: string;
  valuationId?: string;
  summary: {
    title?: string;
    priceShown?: number;
    votesTooLow?: number;
    votesRight?: number;
    votesTooHigh?: number;
    userEstimates?: number[];
    flagCount?: number;
    flagReasons?: string[];
    spread?: number;
    note?: string;
  };
  createdAt: string;
}

const KIND_LABEL: Record<ReviewKind, string> = {
  valuation_disputed: 'Valuation disputed',
  bad_comparable:     'Bad comparable',
  low_confidence:     'Low confidence',
};

const KIND_COLOR: Record<ReviewKind, string> = {
  valuation_disputed: '#F59E0B',
  bad_comparable:     '#EF4444',
  low_confidence:     '#3B82F6',
};

export default function AdminReviewPage() {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [items, setItems] = useState<ReviewItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [denied, setDenied] = useState(false);
  const [filter, setFilter] = useState<ReviewKind | 'all'>('all');

  const refresh = useCallback(async () => {
    if (!token) { navigate('/login'); return; }
    setLoading(true);
    try {
      const q = filter === 'all' ? '' : `?kind=${filter}`;
      const r = await apiFetch<{ success: boolean; items: ReviewItem[] }>(
        `/admin/review/queue${q}`,
        { token },
      );
      if (r.success) setItems(r.items);
    } catch (e: any) {
      if (String(e?.message || '').includes('403')) setDenied(true);
    } finally {
      setLoading(false);
    }
  }, [token, filter, navigate]);

  useEffect(() => { refresh(); }, [refresh]);

  if (denied) {
    return (
      <div style={{ padding: 40, maxWidth: 600, margin: '0 auto', textAlign: 'center' }}>
        <h2>Access denied</h2>
        <p>This area is admin-only.</p>
      </div>
    );
  }

  return (
    <div style={{ padding: 24, maxWidth: 1100, margin: '0 auto' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h2 style={{ margin: 0 }}>Review queue</h2>
        <div style={{ display: 'flex', gap: 8 }}>
          {(['all', 'valuation_disputed', 'bad_comparable', 'low_confidence'] as const).map((k) => (
            <button
              key={k}
              onClick={() => setFilter(k)}
              style={{
                padding: '6px 12px',
                borderRadius: 6,
                border: filter === k ? '2px solid #22D3EE' : '1px solid #D1D9E0',
                background: filter === k ? '#22D3EE15' : 'transparent',
                cursor: 'pointer',
                fontSize: 13,
              }}
            >
              {k === 'all' ? 'All' : KIND_LABEL[k as ReviewKind]}
            </button>
          ))}
          <button onClick={refresh} style={btnSecondary}>↻</button>
        </div>
      </header>

      {loading && <p>Loading…</p>}

      {!loading && items.length === 0 && (
        <p style={{ color: '#666', padding: 40, textAlign: 'center' }}>
          Inbox zero — nothing to review right now.
        </p>
      )}

      <div style={{ display: 'grid', gap: 12 }}>
        {items.map((item) => (
          <ItemCard key={item._id} item={item} token={token!} onResolved={refresh} />
        ))}
      </div>
    </div>
  );
}

function ItemCard({
  item, token, onResolved,
}: { item: ReviewItem; token: string; onResolved: () => void }) {
  const [busy, setBusy] = useState(false);
  const [truePrice, setTruePrice] = useState<string>('');
  const [note, setNote] = useState('');

  const resolve = async (action: string, payload: Record<string, any> = {}) => {
    setBusy(true);
    try {
      await apiFetch(`/admin/review/${item._id}/resolve`, {
        method: 'POST',
        token,
        body: { action, note: note || undefined, ...payload },
      });
      onResolved();
    } catch { /* surfaced via stays-visible state */ }
    finally { setBusy(false); }
  };

  return (
    <div style={{
      border: '1px solid #D1D9E0', borderRadius: 12, padding: 16, background: '#fff',
      display: 'flex', flexDirection: 'column', gap: 10,
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{
            padding: '2px 8px', borderRadius: 8, fontSize: 11, fontWeight: 700,
            background: KIND_COLOR[item.kind] + '22', color: KIND_COLOR[item.kind],
          }}>{KIND_LABEL[item.kind]}</span>
          <strong>{item.summary.title || '—'}</strong>
        </div>
        <span style={{ fontSize: 12, color: '#666' }}>
          {new Date(item.createdAt).toLocaleDateString()}
        </span>
      </div>

      {/* Per-kind body */}
      {item.kind === 'valuation_disputed' && (
        <div style={{ fontSize: 13 }}>
          <div>Price shown: <strong>₪{(item.summary.priceShown ?? 0).toLocaleString()}</strong></div>
          <div>
            Votes: 👎 too-low {item.summary.votesTooLow ?? 0} · 👍 right {item.summary.votesRight ?? 0} · 👎 too-high {item.summary.votesTooHigh ?? 0}
          </div>
          {item.summary.userEstimates?.length ? (
            <div>User estimates: {item.summary.userEstimates.map((p) => `₪${p.toLocaleString()}`).join(', ')}</div>
          ) : null}
        </div>
      )}
      {item.kind === 'bad_comparable' && (
        <div style={{ fontSize: 13 }}>
          <div>Distinct flags: <strong>{item.summary.flagCount}</strong></div>
          <div>Reasons: {(item.summary.flagReasons || []).join(', ') || '—'}</div>
        </div>
      )}
      {item.kind === 'low_confidence' && (
        <div style={{ fontSize: 13 }}>
          <div>Price shown: <strong>₪{(item.summary.priceShown ?? 0).toLocaleString()}</strong></div>
          <div>Spread: <strong>{((item.summary.spread ?? 0) * 100).toFixed(0)}%</strong></div>
          {item.summary.note ? <div>Reason: {item.summary.note}</div> : null}
        </div>
      )}

      {/* Action row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4, flexWrap: 'wrap' }}>
        {item.kind === 'valuation_disputed' && (
          <>
            <input
              type="number"
              placeholder="True price ₪"
              value={truePrice}
              onChange={(e) => setTruePrice(e.target.value)}
              style={{ padding: '6px 8px', border: '1px solid #ccc', borderRadius: 6, width: 140 }}
            />
            <button
              disabled={busy || !truePrice || Number(truePrice) <= 0}
              onClick={() => resolve('set_price', { truePrice: Number(truePrice) })}
              style={btnPrimary}
            >Set true price</button>
          </>
        )}
        {item.kind === 'bad_comparable' && (
          <>
            <button disabled={busy} onClick={() => resolve('keep_comparable')} style={btnSecondary}>Keep</button>
            <button disabled={busy} onClick={() => resolve('blacklist_comparable')} style={btnDanger}>Blacklist</button>
          </>
        )}
        <input
          placeholder="Note (optional)"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          style={{ padding: '6px 8px', border: '1px solid #ccc', borderRadius: 6, flex: 1, minWidth: 120 }}
        />
        <button disabled={busy} onClick={() => resolve('dismiss')} style={btnGhost}>Dismiss</button>
      </div>
    </div>
  );
}

const btnBase = {
  padding: '6px 12px',
  borderRadius: 6,
  cursor: 'pointer',
  fontSize: 13,
  fontWeight: 600,
  border: 'none',
} as const;
const btnPrimary  = { ...btnBase, background: '#22D3EE', color: '#fff' };
const btnSecondary = { ...btnBase, background: '#fff', color: '#333', border: '1px solid #D1D9E0' };
const btnDanger   = { ...btnBase, background: '#EF4444', color: '#fff' };
const btnGhost    = { ...btnBase, background: 'transparent', color: '#666' };
