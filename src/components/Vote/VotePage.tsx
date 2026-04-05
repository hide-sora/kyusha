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
  const [zone, setZone] = useState('');
  const [number, setNumber] = useState('');
  const [ranking, setRanking] = useState<VoteRanking[]>([]);
  const [filterZone, setFilterZone] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [votingOpen, setVotingOpen] = useState(isVotingOpen);
  const [myVotes, setMyVotes] = useState<string[]>([]);
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

  // 自分の投票済み車番を取得
  const fetchMyVotes = useCallback(async () => {
    try {
      const deviceId = getDeviceId();
      const records = await pb.collection('car_votes').getFullList({
        filter: `device_id = "${deviceId}"`,
        fields: 'car_number',
      });
      setMyVotes(records.map((r: any) => r.car_number));
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    fetchRanking();
    fetchMyVotes();
    const unsub = pb.collection('car_votes').subscribe('*', () => {
      fetchRanking();
    });
    return () => { unsub.then(fn => fn()); };
  }, [fetchRanking, fetchMyVotes]);

  const handleVote = useCallback(async () => {
    if (!zone) {
      setMessage('ゾーンを選択してください');
      return;
    }
    const carNumber = `${zone}${number.padStart(3, '0')}`;
    const numVal = parseInt(number);
    if (!number || numVal < 1 || numVal > 999) {
      setMessage('001〜999の数字を入力してください');
      return;
    }

    if (myVotes.includes(carNumber)) {
      setMessage(`${carNumber} にはすでに投票済みです`);
      setZone('');
      setNumber('');
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
    } catch (e) {
      console.error('Vote failed:', e);
      setMessage('投票に失敗しました。もう一度お試しください。');
    } finally {
      setZone('');
      setNumber('');
      setSubmitting(false);
    }
  }, [zone, number, myVotes]);

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
            好きな車に投票！
          </h2>

          {/* ゾーン選択 */}
          <div className="mb-4">
            <label className="text-[10px] text-on-surface-variant block mb-2 tracking-widest uppercase font-600">ゾーン</label>
            <div className="grid grid-cols-6 gap-1.5">
              {ZONE_IDS.map(z => {
                const zoneData = zones.find(zd => zd.id === z);
                return (
                  <button
                    key={z}
                    onClick={() => setZone(z)}
                    className={`aspect-square rounded-2xl font-display font-800 text-lg transition-all duration-200 flex-center ${
                      zone === z
                        ? 'text-white scale-105 shadow-[0_4px_12px_rgba(0,0,0,0.2)]'
                        : 'bg-surface-container-high text-on-surface-variant hover:bg-surface-container-highest active:scale-90'
                    }`}
                    style={zone === z ? { backgroundColor: zoneData?.color || '#666' } : undefined}
                  >
                    {z}
                  </button>
                );
              })}
            </div>
          </div>

          {/* プレビュー */}
          <div className="bg-surface-container rounded-xl px-4 py-3 mb-3 flex items-center justify-center gap-1">
            <span className={`font-display font-800 text-3xl tabular-nums tracking-tight ${zone ? 'text-on-surface' : 'text-on-surface-variant/20'}`}>
              {zone || '?'}
            </span>
            <span className={`font-display font-800 text-3xl tabular-nums tracking-tight ${number ? 'text-on-surface' : 'text-on-surface-variant/20'}`}>
              {number ? number.padStart(3, '0') : '000'}
            </span>
          </div>

          {/* テンキー + 投票ボタン */}
          <div className="grid grid-cols-3 gap-1.5">
            {[1,2,3,4,5,6,7,8,9].map(n => (
              <button
                key={n}
                onClick={() => setNumber(prev => prev.length >= 3 ? String(n) : prev + n)}
                className="h-12 rounded-xl font-display font-700 text-lg text-on-surface bg-surface-container-high active:scale-90 active:bg-surface-container-highest transition-all duration-100"
              >
                {n}
              </button>
            ))}
            <button
              onClick={() => setNumber('')}
              className="h-12 rounded-xl font-display font-600 text-xs text-on-surface-variant bg-surface-container active:scale-90 transition-all duration-100 uppercase tracking-wider"
            >
              C
            </button>
            <button
              onClick={() => setNumber(prev => prev.length >= 3 ? '0' : prev + '0')}
              className="h-12 rounded-xl font-display font-700 text-lg text-on-surface bg-surface-container-high active:scale-90 active:bg-surface-container-highest transition-all duration-100"
            >
              0
            </button>
            <button
              onClick={() => setNumber(prev => prev.slice(0, -1))}
              className="h-12 rounded-xl font-display font-600 text-on-surface-variant bg-surface-container active:scale-90 transition-all duration-100 flex-center"
            >
              <span className="i-ph-arrow-left-bold text-base" />
            </button>
          </div>
          <button
            onClick={handleVote}
            disabled={submitting || !number || !zone}
            className="btn-primary w-full h-12 disabled:opacity-30 text-sm mt-3"
          >
            {submitting ? '...' : zone && number ? `${zone}${number.padStart(3, '0')} に投票！` : 'ゾーンと番号を入力'}
          </button>

          {message && (
            <p className={`text-xs mt-2 animate-slideInRight ${message.includes('失敗') || message.includes('投票済み') ? 'text-error' : 'text-secondary'}`}>
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
