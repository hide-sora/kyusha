import { useEffect, useState } from 'react';
import TicketCard from './TicketCard';
import { loadMyTicket, type MyTicket } from '../../lib/myTicket';

export default function MyTicketFAB() {
  const [ticket, setTicket] = useState<MyTicket | null>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const sync = () => setTicket(loadMyTicket());
    sync();
    window.addEventListener('my-ticket-change', sync);
    window.addEventListener('storage', sync);
    return () => {
      window.removeEventListener('my-ticket-change', sync);
      window.removeEventListener('storage', sync);
    };
  }, []);

  // モーダル表示中は body をスクロールロック
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  if (!ticket) return null;

  return (
    <>
      {/* ─ FAB ─ */}
      <button
        onClick={() => setOpen(true)}
        aria-label="マイチケットを表示"
        className="fixed right-4 z-40 flex items-center gap-1.5 pl-2.5 pr-3.5 py-2.5 rounded-full bg-black text-white shadow-[0_12px_28px_rgba(0,0,0,0.35)] active:scale-95 transition-transform"
        style={{
          bottom: 'calc(var(--nav-h, 5rem) + 12px)',
        }}
      >
        <span
          className="w-7 h-7 rounded-full flex-center shrink-0"
          style={{ backgroundColor: '#c6dc4a', color: '#000' }}
        >
          <span className="i-ph-ticket-duotone text-lg" />
        </span>
        <span className="font-display font-800 text-[12px] tracking-wide">
          マイチケット
        </span>
      </button>

      {/* ─ モーダル ─ */}
      {open && (
        <div
          className="fixed inset-0 z-50 flex flex-col bg-black/85 backdrop-blur-sm"
          onClick={() => setOpen(false)}
        >
          {/* ヘッダー */}
          <div
            className="flex items-center justify-between px-4 py-3 text-white"
            style={{ paddingTop: 'calc(env(safe-area-inset-top, 0px) + 12px)' }}
            onClick={e => e.stopPropagation()}
          >
            <div>
              <p className="text-[10px] tracking-[0.3em] opacity-60">MY TICKET</p>
              <p className="font-display font-800 text-sm mt-0.5">電子チケット</p>
            </div>
            <button
              onClick={() => setOpen(false)}
              aria-label="閉じる"
              className="w-9 h-9 rounded-full bg-white/10 flex-center active:scale-90 transition-transform"
            >
              <span className="i-ph-x-bold text-lg" />
            </button>
          </div>

          {/* 案内 */}
          <div
            className="mx-4 rounded-xl bg-white/10 text-white px-4 py-3 flex items-start gap-2.5"
            onClick={e => e.stopPropagation()}
          >
            <span className="i-ph-qr-code-duotone text-2xl shrink-0 mt-0.5" />
            <div className="min-w-0">
              <p className="font-display font-800 text-sm leading-tight">
                この画面を入場時にご提示ください
              </p>
              <p className="text-[10px] opacity-80 mt-1 leading-snug">
                電波が繋がらない場合に備え、
                <span className="font-700">スクリーンショットで保存</span>
                をおすすめします
              </p>
            </div>
          </div>

          {/* チケット本体 */}
          <div
            className="flex-1 overflow-y-auto px-3 py-4"
            onClick={e => e.stopPropagation()}
            style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 20px)' }}
          >
            <TicketCard
              ticketLabel={ticket.ticketLabel}
              name={ticket.name}
              quantity={ticket.quantity}
              childQuantity={ticket.childQuantity}
              ticketCode={ticket.ticketCode}
              orderId={ticket.orderId}
              total={ticket.total}
              notchColor="bg-black"
            />
            <p className="text-[10px] text-white/50 text-center mt-4">
              画面外をタップして閉じる
            </p>
          </div>
        </div>
      )}
    </>
  );
}
