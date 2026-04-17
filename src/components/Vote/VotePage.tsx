import { useState, useEffect, useCallback, useRef } from 'react';
import { getPb } from '../../lib/pb';
import { getDeviceId } from '../../lib/deviceId';
import { zones } from '../../data/zones';

interface VoteRanking {
  car_number: string;
  count: number;
}

// 投票開始: 9:00 / 締切: 13:30 (当日のみ時間制限)
const EVENT_DATE = '2026-04-26';
const VOTE_START = new Date('2026-04-26T09:00:00+09:00');
const VOTE_DEADLINE = new Date('2026-04-26T13:30:00+09:00');

function getVoteState(): 'before' | 'open' | 'closed' {
  const now = new Date();
  const today = now.toLocaleDateString('sv-SE', { timeZone: 'Asia/Tokyo' }); // YYYY-MM-DD
  // イベント当日のみ時間制限を適用
  if (today === EVENT_DATE) {
    if (now.getTime() < VOTE_START.getTime()) return 'before';
    if (now.getTime() >= VOTE_DEADLINE.getTime()) return 'closed';
  }
  return 'open';
}

const ZONE_IDS = zones.map(z => z.id);

export default function VotePage() {
  const [zone, setZone] = useState('');
  const [number, setNumber] = useState('');
  const [ranking, setRanking] = useState<VoteRanking[]>([]);
  const [filterZone, setFilterZone] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const msgTimerRef = useRef<ReturnType<typeof setTimeout>>();
  const [voteState, setVoteState] = useState(getVoteState);
  const [myVotes, setMyVotes] = useState<string[]>([]);
  const [rankingVisible, setRankingVisible] = useState(false);
  const pb = getPb();

  const showMessage = useCallback((msg: string, duration = 4000) => {
    clearTimeout(msgTimerRef.current);
    setMessage(msg);
    msgTimerRef.current = setTimeout(() => setMessage(''), duration);
  }, []);

  // 設定チェック: voting_open が true なら強制 open
  useEffect(() => {
    fetch('/api/config')
      .then(r => r.json())
      .then((cfg: any) => {
        if (cfg.voting_open) setVoteState('open');
        setRankingVisible(!!cfg.ranking_visible);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      // 設定で開いている場合はタイマーで閉じない
      fetch('/api/config')
        .then(r => r.json())
        .then((cfg: any) => {
          setRankingVisible(!!cfg.ranking_visible);
          if (cfg.voting_open) { setVoteState('open'); return; }
          setVoteState(getVoteState());
        })
        .catch(() => setVoteState(getVoteState()));
    }, 15000);
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
      showMessage('ゾーンを選択してください');
      return;
    }
    const carNumber = `${zone}${number.padStart(3, '0')}`;
    const numVal = parseInt(number);
    if (!number || numVal < 1 || numVal > 999) {
      showMessage('001〜999の数字を入力してください');
      return;
    }

    if (myVotes.includes(carNumber)) {
      showMessage(`${carNumber} にはすでに投票済みです`);
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
      showMessage(`✓ ${carNumber} に投票しました！`);
    } catch (e) {
      console.error('Vote failed:', e);
      showMessage('投票に失敗しました。もう一度お試しください。', 6000);
    } finally {
      setZone('');
      setNumber('');
      setSubmitting(false);
    }
  }, [zone, number, myVotes, showMessage]);

  const filteredRanking = filterZone
    ? ranking.filter(r => r.car_number.startsWith(filterZone))
    : ranking;

  return (
    <div className="px-5 max-w-lg mx-auto space-y-5">
      {/* 投票フォーム */}
      {voteState === 'before' ? (
        <div className="card-elevated text-center py-10">
          <div className="w-16 h-16 mx-auto rounded-full bg-tertiary-fixed flex-center mb-5">
            <span className="i-ph-car-profile-duotone text-3xl text-on-tertiary-fixed" />
          </div>
          <h2 className="font-display font-800 text-xl text-on-surface mb-2">
            イベント車両グランプリ
          </h2>
          <p className="text-sm text-on-surface-variant mb-5 leading-relaxed">
            会場内の車に投票できます！<br />
            好きな車に何台でもOK
          </p>
          <div className="inline-flex items-center gap-2 bg-on-surface text-surface rounded-xl px-5 py-3 font-display font-700">
            <span className="i-ph-clock-countdown-duotone text-lg" />
            9:00 START
          </div>
        </div>
      ) : voteState === 'open' ? (
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
            <p className={`text-sm font-600 mt-3 px-3 py-2 rounded-xl text-center animate-slideInRight ${
              message.includes('失敗') || message.includes('投票済み')
                ? 'text-error bg-error/8'
                : message.startsWith('✓')
                  ? 'text-secondary bg-secondary/8'
                  : 'text-on-surface-variant bg-surface-container'
            }`}>
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
      {rankingVisible && (
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
              className={`px-2.5 py-1 rounded-lg text-[10px] font-700 tracking-wider uppercase transition-all duration-150 ${
                !filterZone ? 'bg-on-surface text-surface shadow-sm' : 'bg-surface-container-high text-on-surface-variant hover:text-on-surface'
              }`}
            >
              ALL
            </button>
            {ZONE_IDS.map(z => (
              <button
                key={z}
                onClick={() => setFilterZone(z)}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-700 transition-all duration-150 ${
                  filterZone === z ? 'bg-on-surface text-surface shadow-sm' : 'bg-surface-container-high text-on-surface-variant hover:text-on-surface'
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
      )}
    </div>
  );
}
