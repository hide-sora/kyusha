import { useState, useEffect, useCallback, useRef } from 'react';
import { getPb } from '../../lib/pb';
import { getDeviceId } from '../../lib/deviceId';
import { zones } from '../../data/zones';

interface VoteRanking {
  car_number: string;
  count: number;
}

// 投票締切: 13:30
const VOTE_DEADLINE = new Date('2026-04-26T13:30:00+09:00');

function isVotingOpen(): boolean {
  return Date.now() < VOTE_DEADLINE.getTime();
}

const ZONE_IDS = zones.map(z => z.id);

export default function VotePage() {
  const [zone, setZone] = useState('A');
  const [number, setNumber] = useState('');
  const [ranking, setRanking] = useState<VoteRanking[]>([]);
  const [filterZone, setFilterZone] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [votingOpen, setVotingOpen] = useState(isVotingOpen);
  const [myVotes, setMyVotes] = useState<string[]>([]);
  const lastVoteTime = useRef(0);

  const pb = getPb();

  useEffect(() => {
    const timer = setInterval(() => setVotingOpen(isVotingOpen()), 10000);
    return () => clearInterval(timer);
  }, []);

  const fetchRanking = useCallback(async () => {
    try {
      const records = await pb.collection('car_votes').getFullList({
        fields: 'car_number',
      });
      const counts: Record<string, number> = {};
      for (const r of records) {
        const cn = (r as any).car_number;
        counts[cn] = (counts[cn] || 0) + 1;
      }
      const sorted = Object.entries(counts)
        .map(([car_number, count]) => ({ car_number, count }))
        .sort((a, b) => b.count - a.count);
      setRanking(sorted);
    } catch {
      // PB未接続時
    }
  }, []);

  useEffect(() => {
    fetchRanking();
    const unsub = pb.collection('car_votes').subscribe('*', () => {
      fetchRanking();
    });
    return () => { unsub.then(fn => fn()); };
  }, [fetchRanking]);

  const handleVote = useCallback(async () => {
    if (Date.now() - lastVoteTime.current < 10000) {
      setMessage('少し間をあけてから投票してください');
      return;
    }

    const carNumber = `${zone}${number.padStart(2, '0')}`;
    const numVal = parseInt(number);
    if (!number || numVal < 1 || numVal > 99) {
      setMessage('01〜99の数字を入力してください');
      return;
    }

    setSubmitting(true);
    setMessage('');

    try {
      await pb.collection('car_votes').create({
        car_number: carNumber,
        device_id: getDeviceId(),
      });
      setMyVotes(prev => [...prev, carNumber]);
      setMessage(`${carNumber} に投票しました!`);
      setNumber('');
      lastVoteTime.current = Date.now();
    } catch {
      setMessage('投票に失敗しました。もう一度お試しください。');
    } finally {
      setSubmitting(false);
    }
  }, [zone, number]);

  const filteredRanking = filterZone
    ? ranking.filter(r => r.car_number.startsWith(filterZone))
    : ranking;

  return (
    <div className="px-5 max-w-lg mx-auto space-y-5">
      {/* 投票フォーム */}
      {votingOpen ? (
        <div className="card-elevated p-6">
          <h2 className="font-display font-700 text-sm text-on-surface mb-4 flex items-center gap-2">
            <div className="w-8 h-8 rounded-full flex-center bg-tertiary-fixed">
              <span className="i-ph-car-profile-duotone text-lg text-on-tertiary-fixed" />
            </div>
            お気に入りの一台に投票
          </h2>

          {/* ゾーン選択 */}
          <div className="mb-4">
            <label className="text-[10px] text-on-surface-variant block mb-2 tracking-widest uppercase font-600">ゾーン</label>
            <div className="flex flex-wrap gap-1.5">
              {ZONE_IDS.map(z => (
                <button
                  key={z}
                  onClick={() => setZone(z)}
                  className={`min-w-10 h-10 px-3 rounded-xl font-display font-700 text-sm transition-all duration-200 ${
                    zone === z
                      ? 'bg-on-surface text-surface scale-105 shadow-[0_4px_12px_rgba(46,51,54,0.15)]'
                      : 'bg-surface-container-high text-on-surface-variant hover:bg-surface-container-highest active:scale-90'
                  }`}
                >
                  {z}
                </button>
              ))}
            </div>
          </div>

          {/* 番号入力 + 投票ボタン */}
          <div className="flex gap-3 items-end">
            <div>
              <label className="text-[10px] text-on-surface-variant block mb-1 tracking-widest uppercase font-600">番号 (01〜99)</label>
              <input
                type="number"
                placeholder="01"
                value={number}
                onChange={(e) => {
                  const v = e.target.value;
                  if (v.length <= 2) setNumber(v);
                }}
                min={1}
                max={99}
                className="w-20 h-12 bg-surface-container-highest rounded-xl px-3 text-center font-display font-700 text-xl text-on-surface placeholder:text-on-surface-variant/30 outline-none focus:ring-2 focus:ring-primary/30 transition-all tabular-nums"
              />
            </div>
            <button
              onClick={handleVote}
              disabled={submitting || !number}
              className="btn-primary h-12 px-6 disabled:opacity-50 text-sm"
            >
              {submitting ? '...' : '投票'}
            </button>
          </div>

          {/* プレビュー */}
          {number && (
            <p className="text-center mt-3 font-display font-800 text-2xl text-on-surface animate-scaleIn">
              {zone}{number.padStart(2, '0')}
            </p>
          )}

          {message && (
            <p className={`text-xs mt-2 animate-slideInRight ${message.includes('失敗') || message.includes('間を') ? 'text-error' : 'text-secondary'}`}>
              {message.includes('投票しました') && <span className="inline-block vote-success mr-1">✓</span>}
              {message}
            </p>
          )}
        </div>
      ) : (
        <div className="card-elevated text-center py-6">
          <span className="i-ph-flag-checkered-duotone text-4xl text-on-surface-variant/20 block mb-2" />
          <p className="font-display font-700 text-on-surface">投票は締め切りました</p>
          <p className="text-xs text-on-surface-variant mt-1">13:30をもって終了しました</p>
        </div>
      )}

      {/* 自分の投票 */}
      {myVotes.length > 0 && (
        <div className="flex flex-wrap gap-1.5 px-1">
          <span className="text-[10px] text-on-surface-variant mr-1 self-center tracking-widest uppercase font-600">あなたの投票:</span>
          {myVotes.map((v, i) => (
            <span key={i} className="text-xs font-display font-700 bg-secondary-container text-on-secondary-container px-2 py-0.5 rounded-lg animate-popIn" style={{ animationDelay: `${i * 0.05}s` }}>
              {v}
            </span>
          ))}
        </div>
      )}

      {/* ランキング */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-display font-700 text-sm text-on-surface tracking-tight flex items-center gap-2">
            <div className="w-7 h-7 rounded-full flex-center bg-secondary-fixed">
              <span className="i-ph-trophy-duotone text-on-secondary-fixed text-sm" />
            </div>
            ランキング
          </h2>
          {/* ゾーンフィルター */}
          <div className="flex gap-1">
            <button
              onClick={() => setFilterZone(null)}
              className={`px-2.5 py-1 rounded-lg text-[10px] font-700 tracking-wider uppercase transition-colors ${
                !filterZone ? 'bg-on-surface text-surface' : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              ALL
            </button>
            {ZONE_IDS.map(z => (
              <button
                key={z}
                onClick={() => setFilterZone(z)}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-700 transition-colors ${
                  filterZone === z ? 'bg-on-surface text-surface' : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                {z}
              </button>
            ))}
          </div>
        </div>

        {filteredRanking.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-sm text-on-surface-variant">まだ投票がありません</p>
          </div>
        ) : (
          <div className="space-y-2">
            {filteredRanking.slice(0, 30).map((entry, i) => {
              const zoneData = zones.find(z => entry.car_number.startsWith(z.id));
              const isTop3 = i < 3;
              return (
                <div
                  key={entry.car_number}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all card-press ${
                    isTop3
                      ? 'bg-surface-container-lowest shadow-[0_20px_40px_rgba(46,51,54,0.04)]'
                      : 'bg-surface-container-low'
                  }`}
                  style={{ animation: `fadeInUp 0.4s ${i * 0.04}s both cubic-bezier(0.16,1,0.3,1)` }}
                >
                  <span className={`font-display font-800 text-sm w-6 text-center ${
                    i === 0 ? 'text-amber-500' : i === 1 ? 'text-zinc-400' : i === 2 ? 'text-amber-700' : 'text-on-surface-variant'
                  }`}>
                    {i + 1}
                  </span>
                  <span
                    className="w-7 h-7 rounded-full text-[10px] font-700 text-white flex-center shrink-0"
                    style={{ backgroundColor: zoneData?.color || '#666' }}
                  >
                    {entry.car_number.charAt(0)}
                  </span>
                  <span className="font-display font-700 text-on-surface flex-1">
                    {entry.car_number}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <div
                      className="h-1.5 rounded-full bg-secondary-fixed-dim bar-grow"
                      style={{
                        width: `${Math.min(entry.count / (filteredRanking[0]?.count || 1) * 60, 60)}px`,
                        animationDelay: `${i * 0.04}s`,
                      }}
                    />
                    <span className="font-display font-700 text-sm text-secondary tabular-nums w-8 text-right">
                      {entry.count}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
