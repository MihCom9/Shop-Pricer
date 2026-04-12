import { ArrowRight, Search, MapPin, Sparkles, Receipt, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import PromotionCard from '../Promotions/PromotionCard/PromotionCard';

const API_BASE_URL = 'http://localhost:8080/api';

/* ─── Fonts ────────────────────────────────────────────────────────────────
   Add to your index.html <head>:
   <link rel="preconnect" href="https://fonts.googleapis.com" />
   <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
   <link href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300;0,9..144,500;0,9..144,600;1,9..144,400&family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600&display=swap" rel="stylesheet" />
*/

const SAMPLE_LIST = [
  { name: 'Whole milk 1L',       store: 'Kaufland', price: '1.89 лв', old: '2.29 лв' },
  { name: 'Free-range eggs ×10', store: 'Kaufland', price: '4.20 лв', old: '4.89 лв' },
  { name: 'Chicken breast 500g', store: 'Lidl',     price: '6.49 лв', old: '7.99 лв' },
  { name: 'Sourdough bread',     store: 'Billa',    price: '2.99 лв', old: '3.49 лв' },
];

const STEPS = [
  { num: '01', title: 'Add your list',  desc: 'Type in anything you need — in Bulgarian or English.' },
  { num: '02', title: 'We compare',     desc: 'Prices checked across every supermarket instantly.' },
  { num: '03', title: 'You save',       desc: 'Shop at the cheapest stores for your exact list.' },
];

const FEATURES = [
  {
    icon: <MapPin size={16} />,
    color: '#1D9E75',
    bg: '#E1F5EE',
    title: 'Distance optimization',
    desc: 'Balance price and distance — find the cheapest store near you.',
  },
  {
    icon: <Receipt size={16} />,
    color: '#378ADD',
    bg: '#E6F1FB',
    title: 'Scan your list',
    desc: 'Upload a handwritten list — AI extracts every item automatically.',
  },
  {
    icon: <Sparkles size={16} />,
    color: '#BA7517',
    bg: '#FAEEDA',
    title: 'Recipe lists',
    desc: 'Pick a recipe and get all ingredients added automatically.',
  },
];

const STORES = ['Kaufland', 'Lidl', 'Billa', 'Fantastiko', 'T Market'];

const FAKE_DEALS = [
  { store: 'Kaufland', name: 'Greek yogurt 400g', price: '1.29 лв', old: '1.89 лв', disc: '−32%' },
  { store: 'Lidl',     name: 'Olive oil 1L',      price: '8.99 лв', old: '12.49 лв', disc: '−28%' },
  { store: 'Billa',    name: 'Pasta 500g',        price: '0.99 лв', old: '1.39 лв', disc: '−29%' },
];

export default function Home() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState(null);
  const [promotions, setPromotions] = useState([]);
  const [storeNumber, setStoreNumber] = useState(null);
  const [promotionNumber, setPromotionNumber] = useState(null);

  const qs = new URLSearchParams({
    city: '68134', limit: 40, offset: 0,
    minDiscount: 0, sort: 'discount',
    show: 'promotions', search: '', category: '', store: '',
  });

  useEffect(() => {
    const fetchFirst = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`${API_BASE_URL}/promotions?${qs}`);
        if (!res.ok) throw new Error('Failed to load promotions');
        setPromotions(await res.json());
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };
    fetchFirst();
  }, []);

  useEffect(() =>{
    fetch(`${API_BASE_URL}/stores/count`)
      .then(res => res.json()).then(data => Math.floor(data / 10) * 10).then(setStoreNumber).catch((err) =>{setStoreNumber(null);});
    fetch(`${API_BASE_URL}/promotions/count`)
      .then(res => res.json()).then(data => Math.floor(data / 10) * 10).then(setPromotionNumber).catch((err) => {setPromotionNumber(null);});
  },[])

  /* Animate-in on scroll */
  useEffect(() => {
    const els = document.querySelectorAll('[data-reveal]');
    if (!els.length) return;
    const io = new IntersectionObserver(
      (entries) => entries.forEach(e => {
        if (e.isIntersecting) { e.target.classList.add('revealed'); io.unobserve(e.target); }
      }),
      { threshold: 0.1 }
    );
    els.forEach(el => io.observe(el));
    return () => io.disconnect();
  }, []);

  const dealsToShow = promotions.length > 0 ? promotions.slice(0, 3) : null;

  return (
    <>
      <style>{`
        /* ── Tokens ── */
        :root {
          --brand:    #D85A30;
          --brand-lt: #FAECE7;
          --brand-dk: #993C1D;
          --ink:      #1e160f;
          --ink-2:    #6b5248;
          --ink-3:    #c4aa9f;
          --surface:  #fdf8f4;
          --card:     #ffffff;
          --border:   rgba(210,160,130,.18);
          --border-md:rgba(210,160,130,.32);
          --r-sm: 10px;
          --r-md: 14px;
          --r-lg: 20px;
          --ff-serif: 'Fraunces', Georgia, serif;
          --ff-sans:  'DM Sans', system-ui, sans-serif;
        }

        /* ── Reveal animation ── */
        [data-reveal] {
          opacity: 0;
          transform: translateY(20px);
          transition: opacity .5s ease, transform .5s ease;
        }
        [data-reveal].revealed { opacity: 1; transform: none; }
        [data-reveal]:nth-child(2) { transition-delay: .08s; }
        [data-reveal]:nth-child(3) { transition-delay: .16s; }

        /* ── Root ── */
        .hr { font-family: var(--ff-sans); background: var(--surface); color: var(--ink); min-height: 100vh; }

        /* ── Hero ── */
        .hr-hero {
          position: relative; overflow: hidden;
          padding: clamp(3rem,8vw,5.5rem) 1.5rem clamp(2.5rem,6vw,4rem);
          text-align: center;
        }
        .hr-hero::before {
          content: '';
          position: absolute; inset: 0;
          background: radial-gradient(ellipse 70% 55% at 50% 0%, rgba(232,81,42,.09) 0%, transparent 70%);
          pointer-events: none;
        }
        @keyframes hFadeDown {
          from { opacity: 0; transform: translateY(-10px); }
          to   { opacity: 1; transform: none; }
        }
        .hr-badge {
          display: inline-flex; align-items: center; gap: 6px;
          font-size: 12px; font-weight: 500;
          color: var(--brand-dk); background: var(--brand-lt);
          border: 1px solid rgba(216,90,48,.25); border-radius: 20px;
          padding: 4px 14px; margin-bottom: 1.5rem;
          animation: hFadeDown .5s ease both;
        }
        .hr-badge-dot { width: 6px; height: 6px; border-radius: 50%; background: var(--brand); }
        .hr-h1 {
          font-family: var(--ff-serif);
          font-size: clamp(2rem, 5.5vw, 3.4rem);
          font-weight: 500; line-height: 1.15; letter-spacing: -.5px;
          margin-bottom: 1rem;
          animation: hFadeDown .55s .08s ease both;
        }
        .hr-h1 em { font-style: italic; color: var(--brand); }
        .hr-sub {
          font-size: 15px; color: var(--ink-2); line-height: 1.65;
          max-width: 380px; margin: 0 auto 2rem;
          animation: hFadeDown .55s .16s ease both;
        }

        /* Search bar */
        .hr-search {
          display: flex; align-items: center; gap: 8px;
          background: var(--card);
          border: 1px solid var(--border-md); border-radius: var(--r-md);
          padding: 8px 8px 8px 14px;
          max-width: 480px; margin: 0 auto 1rem;
          box-shadow: 0 2px 16px rgba(140,80,40,.07);
          animation: hFadeDown .55s .24s ease both;
        }
        .hr-search input {
          flex: 1; min-width: 0; border: none; outline: none;
          background: transparent; font-size: 14px; color: var(--ink);
          font-family: var(--ff-sans);
        }
        .hr-search input::placeholder { color: var(--ink-3); }

        /* Buttons */
        .btn-p {
          display: inline-flex; align-items: center; gap: 6px;
          background: var(--brand); color: #fff; border: none;
          border-radius: var(--r-sm); padding: 9px 18px;
          font-size: 13px; font-weight: 600; font-family: var(--ff-sans);
          cursor: pointer; white-space: nowrap;
          transition: background .15s, transform .1s;
        }
        .btn-p:hover  { background: var(--brand-dk); }
        .btn-p:active { transform: scale(.97); }
        .btn-g {
          display: inline-flex; align-items: center; gap: 6px;
          background: var(--card); color: var(--ink);
          border: 1px solid var(--border-md); border-radius: var(--r-sm);
          padding: 9px 18px; font-size: 13px; font-weight: 500;
          font-family: var(--ff-sans); cursor: pointer;
          transition: background .15s, border-color .15s;
        }
        .btn-g:hover { background: var(--brand-lt); border-color: rgba(216,90,48,.3); }

        .hr-links {
          display: flex; align-items: center; justify-content: center; gap: 1rem;
          animation: hFadeDown .55s .32s ease both;
        }
        .hr-links a {
          font-size: 13px; color: var(--ink-2); cursor: pointer;
          text-decoration: none; transition: color .15s;
        }
        .hr-links a:hover { color: var(--brand); }
        .hr-sep { color: var(--ink-3); }

        /* ── Container ── */
        .container { max-width: 900px; margin: 0 auto; padding: 0 1.5rem; }

        /* ── Section labels ── */
        .slabel {
          font-size: 11px; font-weight: 600; text-transform: uppercase;
          letter-spacing: .1em; color: var(--ink-3); margin-bottom: 1rem;
        }
        .sheader { display: flex; align-items: center; margin-bottom: 1rem; }
        .sheader .slabel { margin-bottom: 0; }
        .see-all {
          margin-left: auto; font-size: 13px; color: var(--brand);
          cursor: pointer; text-decoration: none; display: flex;
          align-items: center; gap: 2px; font-weight: 500;
          transition: gap .15s;
        }
        .see-all:hover { gap: 5px; }

        /* ── Stats strip ── */
        .stats-strip { display: grid; grid-template-columns: repeat(3,1fr); gap: 10px; margin-bottom: 3rem; }
        .stat-card {
          background: var(--card); border: 1px solid var(--border);
          border-radius: var(--r-md); padding: 1.25rem 1rem; text-align: center;
        }
        .stat-num { font-family: var(--ff-serif); font-size: 2rem; font-weight: 500; color: var(--brand); line-height: 1; margin-bottom: 4px; }
        .stat-lbl { font-size: 12px; color: var(--ink-2); }

        /* ── Steps ── */
        .steps-grid { display: grid; grid-template-columns: repeat(3,1fr); gap: 10px; margin-bottom: 3rem; }
        @media (max-width: 540px) { .steps-grid { grid-template-columns: 1fr; } }
        .step-card {
          background: var(--card); border: 1px solid var(--border);
          border-radius: var(--r-md); padding: 1.25rem;
          position: relative; overflow: hidden;
        }
        .step-card::after {
          content: attr(data-bg);
          position: absolute; right: -4px; top: -8px;
          font-family: var(--ff-serif); font-size: 4rem; font-weight: 600;
          color: rgba(216,90,48,.06); line-height: 1; pointer-events: none;
        }
        .step-num {
          display: inline-block; font-size: 11px; font-weight: 600;
          color: var(--brand); background: var(--brand-lt);
          border-radius: 20px; padding: 2px 10px; margin-bottom: .75rem;
        }
        .step-title { font-size: 14px; font-weight: 600; margin-bottom: 4px; }
        .step-desc  { font-size: 12px; color: var(--ink-2); line-height: 1.55; }

        /* ── List preview ── */
        .list-wrap {
          background: var(--card); border: 1px solid var(--border);
          border-radius: var(--r-lg); overflow: hidden; margin-bottom: 3rem;
        }
        .list-header {
          padding: 1rem 1.25rem; border-bottom: 1px solid var(--border);
          display: flex; align-items: center; gap: 8px;
        }
        .list-dot { width: 8px; height: 8px; border-radius: 50%; }
        .list-row {
          display: flex; align-items: center; gap: 12px;
          padding: 10px 1.25rem; border-bottom: 1px solid var(--border);
          transition: background .12s;
        }
        .list-row:last-of-type { border-bottom: none; }
        .list-row:hover { background: rgba(253,248,244,.7); }
        .chk-circle {
          width: 18px; height: 18px; border-radius: 50%;
          background: var(--brand-lt);
          display: flex; align-items: center; justify-content: center; flex-shrink: 0;
        }
        .chk-mark {
          width: 8px; height: 8px;
          border-right: 2px solid var(--brand); border-bottom: 2px solid var(--brand);
          transform: rotate(45deg) translate(-1px,-1px);
        }
        .row-name  { flex: 1; min-width: 0; font-size: 13px; font-weight: 500; }
        .row-store { font-size: 11px; color: var(--ink-3); }
        .row-price { font-size: 14px; font-weight: 600; }
        .row-old   { font-size: 11px; color: var(--ink-3); text-decoration: line-through; margin-left: 4px; }
        .list-total {
          display: flex; align-items: center; justify-content: space-between;
          padding: 1rem 1.25rem; background: var(--brand-lt);
          border-top: 1px solid rgba(216,90,48,.15); flex-wrap: wrap; gap: 8px;
        }
        .total-lbl  { font-size: 13px; color: var(--brand-dk); font-weight: 500; }
        .total-sub  { font-size: 11px; color: rgba(153,60,29,.55); margin-top: 2px; }
        .total-price{ font-family: var(--ff-serif); font-size: 22px; font-weight: 500; color: var(--brand); }
        .save-pill  { display: inline-block; font-size: 11px; font-weight: 600; background: #E6F4DE; color: #3B6D11; border-radius: 20px; padding: 3px 10px; margin-top: 4px; }

        /* ── Deals ── */
        .deals-grid { display: grid; grid-template-columns: repeat(3,1fr); gap: 10px; margin-bottom: 3rem; }
        @media (max-width: 540px) { .deals-grid { grid-template-columns: repeat(2,1fr); } }
        @media (max-width: 360px) { .deals-grid { grid-template-columns: 1fr; } }
        .deal-card {
          background: var(--card); border: 1px solid var(--border);
          border-radius: var(--r-md); padding: 1rem; cursor: pointer;
          transition: border-color .15s, transform .15s;
        }
        .deal-card:hover { border-color: var(--border-md); transform: translateY(-2px); }
        .deal-store { font-size: 11px; color: var(--ink-3); margin-bottom: 4px; }
        .deal-name  { font-size: 13px; font-weight: 500; margin-bottom: .75rem; line-height: 1.35; min-height: 2.4em; }
        .deal-row   { display: flex; align-items: baseline; gap: 6px; }
        .deal-new   { font-family: var(--ff-serif); font-size: 1.2rem; font-weight: 500; color: var(--brand); }
        .deal-old   { font-size: 11px; color: var(--ink-3); text-decoration: line-through; }
        .deal-badge { margin-left: auto; font-size: 11px; font-weight: 600; background: var(--brand-lt); color: var(--brand-dk); border-radius: 6px; padding: 2px 7px; }

        /* ── Skeleton ── */
        .skel {
          background: linear-gradient(90deg, #f0e8e2 25%, #e8ddd6 50%, #f0e8e2 75%);
          background-size: 200% 100%;
          animation: shimmer 1.4s infinite;
          border-radius: 6px;
        }
        @keyframes shimmer {
          from { background-position: 200% 0; }
          to   { background-position: -200% 0; }
        }

        /* ── Stores ── */
        .stores-row { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 3rem; }
        .store-pill { font-size: 12px; font-weight: 500; color: var(--ink-2); background: var(--card); border: 1px solid var(--border); border-radius: 20px; padding: 5px 14px; }
        .store-pill-new { color: var(--brand); background: var(--brand-lt); border-color: rgba(216,90,48,.25); }

        /* ── Features ── */
        .features-grid { display: grid; grid-template-columns: repeat(3,1fr); gap: 10px; margin-bottom: 3rem; }
        @media (max-width: 620px) { .features-grid { grid-template-columns: 1fr; } }
        .feat-card { background: var(--card); border: 1px solid var(--border); border-radius: var(--r-md); padding: 1.25rem; }
        .feat-icon { width: 34px; height: 34px; border-radius: var(--r-sm); display: flex; align-items: center; justify-content: center; margin-bottom: .75rem; }
        .feat-title { font-size: 14px; font-weight: 600; margin-bottom: 4px; }
        .feat-desc  { font-size: 12px; color: var(--ink-2); line-height: 1.55; }

        /* ── CTA ── */
        .cta-block {
          background: var(--card); border: 1px solid var(--border);
          border-radius: var(--r-lg); padding: clamp(1.75rem,5vw,2.5rem) 1.5rem;
          text-align: center; margin-bottom: 4rem;
          position: relative; overflow: hidden;
        }
        .cta-block::before {
          content: '';
          position: absolute; inset: 0;
          background: radial-gradient(ellipse 80% 60% at 50% 110%, rgba(232,81,42,.07) 0%, transparent 70%);
          pointer-events: none;
        }
        .cta-block h2 { font-family: var(--ff-serif); font-size: clamp(1.4rem,3.5vw,2rem); font-weight: 500; margin-bottom: .5rem; }
        .cta-block p  { font-size: 14px; color: var(--ink-2); margin-bottom: 1.5rem; }
        .cta-btns { display: flex; gap: 8px; justify-content: center; flex-wrap: wrap; }

        /* ── Mobile tweaks ── */
        @media (max-width: 480px) {
          .stats-strip { gap: 8px; }
          .stat-num { font-size: 1.5rem; }
          .hr-search { padding: 7px 7px 7px 12px; }
        }
      `}</style>

      <div className="hr">

        {/* Hero */}
        <div className="hr-hero">
          <h1 className="hr-h1">
            Stop guessing.<br />
            <em>Shop at the cheapest stores.</em>
          </h1>
          <p className="hr-sub">
            Add your shopping list once. We compare total prices across every supermarket and tell you exactly where to go.
          </p>

          <div className="hr-search">
            <Search size={14} color="var(--ink-3)" />
            <input
              type="text"
              placeholder='Try "milk, eggs, bread, chicken..."'
              onKeyDown={e => { if (e.key === 'Enter') navigate('/search'); }}
            />
            <button className="btn-p" onClick={() => navigate('/search')}>
              Build my list <ArrowRight size={13} />
            </button>
          </div>

          <div className="hr-links">
            <a onClick={() => navigate('/browse')}>Browse products</a>
            <span className="hr-sep">·</span>
            <a onClick={() => navigate('/about')}>How it works</a>
          </div>
        </div>

        <div className="container">

          {/* Stats */}
          <div className="stats-strip">
            {[[(promotionNumber ?? '60') + '+','Active promotions'], [(storeNumber ?? '5') + '+','Supermarkets'], ['Real-time','Price updates']].map(([n, l]) => (
              <div key={l} className="stat-card" data-reveal>
                <div className="stat-num">{n}</div>
                <div className="stat-lbl">{l}</div>
              </div>
            ))}
          </div>

          {/* How it works */}
          <div style={{ marginBottom: '3rem' }}>
            <div className="slabel">How it works</div>
            <div className="steps-grid">
              {STEPS.map(({ num, title, desc }) => (
                <div key={num} className="step-card" data-bg={num} data-reveal>
                  <div className="step-num">{num}</div>
                  <div className="step-title">{title}</div>
                  <div className="step-desc">{desc}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Today's deals */}
          <div className="sheader">
            <span className="slabel" style={{ marginBottom: 0 }}>Today's best deals</span>
            <a className="see-all" onClick={() => navigate('/browse')}>
              See all <ChevronRight size={13} />
            </a>
          </div>

          {loading && (
            <div className="deals-grid">
              {[0, 1, 2].map(i => (
                <div key={i} style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 'var(--r-md)', padding: '1rem' }}>
                  <div className="skel" style={{ height: 10, width: '60%', marginBottom: 8 }} />
                  <div className="skel" style={{ height: 12, width: '80%', marginBottom: 16 }} />
                  <div className="skel" style={{ height: 20, width: '50%' }} />
                </div>
              ))}
            </div>
          )}

          {error && (
            <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 'var(--r-md)', padding: '2rem', textAlign: 'center', color: '#c04020', marginBottom: '3rem' }}>
              {error}
            </div>
          )}

          {!loading && !error && (
            <div className="deals-grid">
              {(dealsToShow ?? FAKE_DEALS).map((p, i) =>
                p._fake !== undefined || !dealsToShow ? (
                  <div key={i} className="deal-card" data-reveal onClick={() => navigate('/browse')}>
                    <div className="deal-store">{p.store}</div>
                    <div className="deal-name">{p.name}</div>
                    <div className="deal-row">
                      <span className="deal-new">{p.price}</span>
                      <span className="deal-old">{p.old}</span>
                      <span className="deal-badge">{p.disc}</span>
                    </div>
                  </div>
                ) : (
                  <PromotionCard key={i} promotion={p} onAddToCart={null} onCardClick={null} />
                )
              )}
            </div>
          )}

          {/* Stores */}
          <div className="slabel">Covered supermarkets</div>
          <div className="stores-row" data-reveal>
            {STORES.map(s => <div key={s} className="store-pill">{s}</div>)}
            {storeNumber?
              <div className="store-pill store-pill-new">+ {storeNumber - STORES.length} more</div>
                :
              <div className="store-pill store-pill-new">+ more in future</div>
            }
          </div>

          {/* Coming soon */}
          <div className="slabel">Coming soon</div>
          <div className="features-grid">
            {FEATURES.map(({ icon, color, bg, title, desc }) => (
              <div key={title} className="feat-card" data-reveal>
                <div className="feat-icon" style={{ background: bg, color }}>{icon}</div>
                <div className="feat-title">{title}</div>
                <div className="feat-desc">{desc}</div>
              </div>
            ))}
          </div>

          {/* CTA */}
          <div className="cta-block" data-reveal>
            <h2>Ready to shop smarter?</h2>
            <p>Build your first list and see exactly how much you could save today.</p>
            <div className="cta-btns">
              <button className="btn-p" onClick={() => navigate('/search')}>
                Build my list <ArrowRight size={13} />
              </button>
              <button className="btn-g" onClick={() => navigate('/browse')}>
                Browse deals
              </button>
            </div>
          </div>

        </div>
      </div>
    </>
  );
}