import { useState } from 'react';

interface Props {
  agreed: boolean;
  onChange: (agreed: boolean) => void;
  id?: string;
}

const LINK_CLASS =
  'flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg bg-surface-container-high text-on-surface-variant text-[11px] font-600 active:scale-95 transition-transform cursor-pointer';

export default function LegalAgreement({ agreed, onChange, id = 'legal-agreement' }: Props) {
  const [showTerms, setShowTerms] = useState(false);

  return (
    <>
      <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/30 p-3 space-y-2.5">
        <div className="flex items-start gap-3">
          <input
            id={id}
            type="checkbox"
            checked={agreed}
            onChange={(e) => onChange(e.target.checked)}
            className="mt-0.5 w-4 h-4 accent-on-surface flex-shrink-0 cursor-pointer"
          />
          <label
            htmlFor={id}
            className="text-xs text-on-surface leading-relaxed cursor-pointer select-none"
          >
            <span className="font-700">特定商取引法に基づく表記</span>
            <span> と </span>
            <span className="font-700">プライバシーポリシー</span>
            <span> に同意します</span>
          </label>
        </div>
        <div className="flex gap-2 pl-7">
          <button
            type="button"
            onClick={() => setShowTerms(true)}
            className={LINK_CLASS}
          >
            <span className="i-ph-scales-duotone text-sm" />
            特商法を見る
          </button>
          <a
            href="https://mito-douraku.com/privacypolicy/"
            target="_blank"
            rel="noopener noreferrer"
            className={LINK_CLASS}
          >
            <span className="i-ph-shield-check-duotone text-sm" />
            プライバシーポリシー
          </a>
        </div>
      </div>

      {/* 特商法ボトムシート */}
      {showTerms && (
        <div
          onClick={() => setShowTerms(false)}
          className="fixed inset-0 bg-black/60 z-[100] flex items-end justify-center"
          role="dialog"
          aria-modal="true"
          aria-label="特定商取引法に基づく表記"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-surface rounded-t-2xl max-w-lg w-full max-h-[85vh] overflow-y-auto shadow-2xl animate-fadeInUp"
          >
            <div className="sticky top-0 bg-surface border-b border-outline-variant/20 px-5 py-3 flex items-center justify-between">
              <h3 className="font-display font-700 text-sm text-on-surface flex items-center gap-1.5">
                <span className="i-ph-scales-duotone text-base" />
                特定商取引法に基づく表記
              </h3>
              <button
                type="button"
                onClick={() => setShowTerms(false)}
                className="w-8 h-8 rounded-full flex-center active:scale-90 transition-transform"
                aria-label="閉じる"
              >
                <span className="i-ph-x-bold text-base text-on-surface-variant" />
              </button>
            </div>
            <div className="p-5 pb-8 text-[12px] leading-relaxed space-y-2">
              <p><span className="text-on-surface-variant/60">会社名：</span>安藏商事合同会社</p>
              <p><span className="text-on-surface-variant/60">代表者名：</span>安藏直幸</p>
              <p><span className="text-on-surface-variant/60">住所：</span>茨城県水戸市堀町2317-1</p>
              <p>
                <span className="text-on-surface-variant/60">メール：</span>
                <a href="mailto:mitodouraku@gmail.com" className="underline underline-offset-2">mitodouraku@gmail.com</a>
              </p>
              <p><span className="text-on-surface-variant/60">販売価格：</span>商品販売ページに記載</p>
              <p><span className="text-on-surface-variant/60">商品代金以外の必要料金：</span>銀行振込手数料（銀行振込の場合）、インターネット接続料金その他の電気通信回線の通信に関する費用</p>
              <p><span className="text-on-surface-variant/60">引渡し時期：</span>決済完了後、直ちにご利用いただけます</p>
              <p><span className="text-on-surface-variant/60">返品・返金：</span>返品・返金はお受けしておりません</p>
              <p>
                <span className="text-on-surface-variant/60">プライバシーポリシー：</span>
                <a href="https://mito-douraku.com/privacypolicy/" target="_blank" rel="noopener noreferrer" className="underline underline-offset-2">こちら</a>
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
