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

  // 投票締切チェック
  useEffect(() => {
    const timer = setInterval(() => setVotingOpen(isVotingOpen()), 10000);
    return () => clearInterval(timer);
  }, []);

  // ランキング取得
  const fetchRanking = useCallback(async () => {
    try {
      // PocketBase から全投票を取得し、クライアント側で集計
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
      // PB未接続時はデモデータなし
    }
  }, []);

  useEffect(() => {
    fetchRanking();

    // リアルタイム購読
    const unsub = pb.collection('car_votes').subscribe('*', () => {
      fetchRanking();
    });

    return () => { unsub.then(fn => fn()); };
  }, [fetchRanking]);

  // 投票送信
  const handleVote = useCallback(async () => {
    // レート制限（10秒）
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

  // フィルターされたランキング
  const filteredRanking = filterZone
    ? ranking.filter(r => r.car_number.startsWith(filterZone))
    : ranking;

  return (
    <div className="px-4 max-w-lg mx-auto space-y-5">
      {/* 投票フォーム */}
      {votingOpen ? (
        <div className="card-base bg-gradient-to-br from-red-600/10 to-pink-600/10">
          <h2 className="font-display font-700 text-sm text-primary mb-4 flex items-center gap-2">
            <span className="i-ph-car-profile-duotone text-lg" />
            お気に入りの一台に投票
          </h2>

          <div className="flex gap-2 items-end">
            {/* ゾーン選択 */}
            <div className="shrink-0">
              <label className="text-[10px] text-muted-foreground block mb-1">ゾーン</label>
              <div className="flex gap-1">
                {ZONE_IDS.map(z => (
                  <button
                    key={z}
                    onClick={() => setZone(z)}
                    className={`w-10 h-10 rounded-lg font-display font-700 text-sm transition-all ${
                      zone === z
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-secondary border border-border text-muted-foreground hover:border-primary/40'
                    }`}
                  >
                    {z}
                  </button>
                ))}
              </div>
            </div>

            {/* 番号入力 */}
            <div className="flex-1">
              <label className="text-[10px] text-muted-foreground block mb-1">番号 (01〜99)</label>
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
                className="w-full bg-secondary border border-border rounded-button px-4 py-2 text-center font-display font-700 text-xl text-foreground placeholder:text-muted-foreground/30 outline-none focus:border-primary transition-colors tabular-nums"
              />
            </div>

            {/* 投票ボタン */}
            <button
              onClick={handleVote}
              disabled={submitting || !number}
              className="btn-primary h-10 px-5 shrink-0 disabled:opacity-50"
            >
              {submitting ? '...' : '投票'}
            </button>
          </div>

          {/* プレビュー */}
          {number && (
            <p className="text-center mt-3 font-display font-700 text-2xl text-foreground">
              {zone}{number.padStart(2, '0')}
            </p>
          )}

          {message && (
            <p className={`text-xs mt-2 ${message.includes('失敗') || message.includes('間を') ? 'text-destructive' : 'text-primary'}`}>
              {message}
            </p>
          )}
        </div>
      ) : (
        <div className="card-base text-center py-6">
          <span className="i-ph-flag-checkered-duotone text-4xl text-muted-foreground/30 block mb-2" />
          <p className="font-700 text-foreground">投票は締め切りました</p>
          <p className="text-xs text-muted-foreground mt-1">13:30をもって終了しました</p>
        </div>
      )}

      {/* 自分の投票 */}
      {myVotes.length > 0 && (
        <div className="flex flex-wrap gap-1.5 px-1">
          <span className="text-[10px] text-muted-foreground mr-1 self-center">あなたの投票:</span>
          {myVotes.map((v, i) => (
            <span key={i} className="text-xs font-display font-700 bg-primary/10 text-primary px-2 py-0.5 rounded-md">
              {v}
            </span>
          ))}
        </div>
      )}

      {/* ランキング */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-display font-700 text-sm text-muted-foreground tracking-wider uppercase flex items-center gap-2">
            <span className="i-ph-trophy-duotone text-primary text-lg" />
            ランキング
          </h2>
          {/* ゾーンフィルター */}
          <div className="flex gap-1">
            <button
              onClick={() => setFilterZone(null)}
              className={`px-2 py-0.5 rounded-md text-[10px] font-600 transition-colors ${
                !filterZone ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              ALL
            </button>
            {ZONE_IDS.map(z => (
              <button
                key={z}
                onClick={() => setFilterZone(z)}
                className={`px-2 py-0.5 rounded-md text-[10px] font-600 transition-colors ${
                  filterZone === z ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {z}
              </button>
            ))}
          </div>
        </div>

        {filteredRanking.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-sm text-muted-foreground">まだ投票がありません</p>
          </div>
        ) : (
          <div className="space-y-1.5">
            {filteredRanking.slice(0, 30).map((entry, i) => {
              const zoneData = zones.find(z => entry.car_number.startsWith(z.id));
              const isTop3 = i < 3;
              return (
                <div
                  key={entry.car_number}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${
                    isTop3 ? 'bg-primary/5 border border-primary/20' : 'bg-card border border-border'
                  }`}
                >
                  {/* 順位 */}
                  <span className={`font-display font-700 text-sm w-6 text-center ${
                    i === 0 ? 'text-amber-400' : i === 1 ? 'text-gray-400' : i === 2 ? 'text-amber-700' : 'text-muted-foreground'
                  }`}>
                    {i + 1}
                  </span>
                  {/* ゾーンバッジ */}
                  <span
                    className="w-6 h-6 rounded text-[10px] font-700 text-white flex-center shrink-0"
                    style={{ backgroundColor: zoneData?.color || '#666' }}
                  >
                    {entry.car_number.charAt(0)}
                  </span>
                  {/* 車番号 */}
                  <span className="font-display font-700 text-foreground flex-1">
                    {entry.car_number}
                  </span>
                  {/* 得票数 */}
                  <div className="flex items-center gap-1.5">
                    <div
                      className="h-2 rounded-full bg-primary/30"
                      style={{ width: `${Math.min(entry.count / (filteredRanking[0]?.count || 1) * 60, 60)}px` }}
                    />
                    <span className="font-display font-700 text-sm text-primary tabular-nums w-8 text-right">
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
