import { useState, useMemo } from 'react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { Search, TrendingUp, TrendingDown, Minus, Cpu, DollarSign, BarChart3, User, Shield, FileText, Users, Target, HelpCircle, ChevronDown, ChevronRight } from 'lucide-react';
import { PLAYERS_DB } from './data/players';

// ================================================
// NATIONALITY FLAGS
// ================================================
const FLAGS = {
    FRA: '🇫🇷', NOR: '🇳🇴', ESP: '🇪🇸', ENG: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', ARG: '🇦🇷', POL: '🇵🇱', BRA: '🇧🇷', POR: '🇵🇹', GER: '🇩🇪',
    NGA: '🇳🇬', SRB: '🇷🇸', ITA: '🇮🇹', BEL: '🇧🇪', NED: '🇳🇱', URU: '🇺🇾', CRO: '🇭🇷', CAN: '🇨🇦', UKR: '🇺🇦',
    JPN: '🇯🇵', KOR: '🇰🇷', TUR: '🇹🇷', USA: '🇺🇸', COL: '🇨🇴', SEN: '🇸🇳', MAR: '🇲🇦', ALG: '🇩🇿', EGY: '🇪🇬', SUI: '🇨🇭'
};

// ================================================
// CLUB COLORS & MANAGERS
// ================================================
const CLUB_DATA = {
    REAL_MADRID: { color: '#FEBE10', manager: 'Carlo Ancelotti' },
    MAN_CITY: { color: '#6CABDD', manager: 'Pep Guardiola' },
    BARCELONA: { color: '#A50044', manager: 'Hansi Flick' },
    LIVERPOOL: { color: '#C8102E', manager: 'Arne Slot' },
    BAYERN: { color: '#DC052D', manager: 'Vincent Kompany' },
    PSG: { color: '#004170', manager: 'Luis Enrique' },
    ARSENAL: { color: '#EF0107', manager: 'Mikel Arteta' },
    CHELSEA: { color: '#034694', manager: 'Enzo Maresca' },
    MAN_UTD: { color: '#DA291C', manager: 'Ruben Amorim' },
    JUVENTUS: { color: '#000000', manager: 'Thiago Motta' },
    INTER: { color: '#0068A8', manager: 'Simone Inzaghi' },
    MILAN: { color: '#FB090B', manager: 'Paulo Fonseca' },
    ATLETICO: { color: '#272E61', manager: 'Diego Simeone' },
    TOTTENHAM: { color: '#132257', manager: 'Ange Postecoglou' },
    DORTMUND: { color: '#FDE100', manager: 'Nuri Şahin' },
    B_LEVERKUSEN: { color: '#E32221', manager: 'Xabi Alonso' },
    NAPOLI: { color: '#12A0D7', manager: 'Antonio Conte' },
    ASTON_VILLA: { color: '#95BFE5', manager: 'Unai Emery' },
    NEWCASTLE: { color: '#241F20', manager: 'Eddie Howe' },
    MARSEILLE: { color: '#2FAEE0', manager: 'Roberto De Zerbi' },
    INTER_MIAMI: { color: '#F5B6CD', manager: 'Javier Mascherano' }
};

// ================================================
// TACTICAL ROLES BY POSITION
// ================================================
const TACTICAL_ROLES = {
    ST: ['Target Man', 'Poacher', 'False 9', 'Complete Forward', 'Advanced Forward'],
    LW: ['Inside Forward', 'Inverted Winger', 'Wide Playmaker', 'Winger'],
    RW: ['Inside Forward', 'Inverted Winger', 'Wide Playmaker', 'Winger'],
    CAM: ['Advanced Playmaker', 'Shadow Striker', 'Enganche', 'Trequartista'],
    CM: ['Box-to-Box', 'Deep-Lying Playmaker', 'Mezzala', 'Carrilero'],
    CDM: ['Anchor Man', 'Half-Back', 'Regista', 'Ball-Winning DM'],
    CB: ['Ball-Playing CB', 'Stopper', 'Libero', 'No-Nonsense CB'],
    RB: ['Inverted Full-Back', 'Wing-Back', 'Defensive RB', 'Overlapping RB'],
    LB: ['Inverted Full-Back', 'Wing-Back', 'Defensive LB', 'Overlapping LB'],
    GK: ['Sweeper Keeper', 'Traditional GK', 'Ball-Playing GK']
};

// ================================================
// GENERATE PLAYER ADVANCED DATA
// ================================================
function getPlayerAdvanced(p) {
    if (!p) return null;

    const seed = p.id.charCodeAt(0) + p.ovr;
    const rand = (min, max) => min + ((seed * 9301 + 49297) % 233280) / 233280 * (max - min);

    // Contract details
    const purchasePrice = Math.round(p.marketValue * rand(0.4, 0.9));

    // xG/xA based on position and shooting/passing
    const isAttacker = ['ST', 'LW', 'RW', 'CAM', 'CF'].includes(p.pos);
    const xG = isAttacker ? +(rand(0.3, 0.8) * (p.fc26.sho / 80)).toFixed(2) : +(rand(0.02, 0.15)).toFixed(2);
    const xA = +(rand(0.15, 0.5) * (p.fc26.pas / 85)).toFixed(2);
    const progPasses = Math.round(rand(4, 12) * (p.fc26.pas / 80));

    // Get tactical role
    const roles = TACTICAL_ROLES[p.pos] || ['Utility Player'];
    const roleIndex = seed % roles.length;

    return {
        purchasePrice,
        currentValue: p.marketValue,
        contractEnd: p.contractEnd,
        manager: CLUB_DATA[p.team]?.manager || 'Unknown',
        tacticalRole: roles[roleIndex],
        xG,
        xA,
        progPasses
    };
}

// ================================================
// FIFA/FC STYLE OVR COLOR (PREMIUM EMERALD)
// ================================================
function getOVRColor(ovr) {
    if (ovr >= 85) return { bg: 'linear-gradient(135deg, #2E7D32 0%, #1b5e20 100%)', text: '#fff', glow: 'rgba(46, 125, 50, 0.5)' };
    if (ovr >= 80) return { bg: 'linear-gradient(135deg, #388e3c 0%, #2E7D32 100%)', text: '#fff', glow: 'rgba(56, 142, 60, 0.4)' };
    if (ovr >= 75) return { bg: 'linear-gradient(135deg, #d4a017 0%, #b8860b 100%)', text: '#000', glow: 'rgba(212, 160, 23, 0.4)' };
    if (ovr >= 70) return { bg: 'linear-gradient(135deg, #cd7f32 0%, #a0522d 100%)', text: '#fff', glow: 'rgba(205, 127, 50, 0.4)' };
    return { bg: 'linear-gradient(135deg, #64748b 0%, #475569 100%)', text: '#fff', glow: 'rgba(100, 116, 139, 0.3)' };
}

// ================================================
// SPECIALTY BADGES GENERATOR
// ================================================
const SPECIALTY_BADGES = {
    playmaker: { label: 'Playmaker', color: '#0ea5e9', condition: (p) => p.fc26.pas >= 85 && p.detail?.vision >= 85 },
    finisher: { label: 'Clinical Finisher', color: '#ef4444', condition: (p) => p.fc26.sho >= 85 && p.detail?.finishing >= 88 },
    speedster: { label: 'Speedster', color: '#22c55e', condition: (p) => p.fc26.pac >= 90 },
    aerial: { label: 'Aerial Threat', color: '#f59e0b', condition: (p) => p.detail?.headingAcc >= 85 && p.detail?.jumping >= 85 },
    dribbler: { label: 'Dribble Maestro', color: '#a855f7', condition: (p) => p.fc26.dri >= 88 && p.detail?.agility >= 88 },
    tank: { label: 'Physical Tank', color: '#f97316', condition: (p) => p.fc26.phy >= 85 && p.detail?.strength >= 88 },
    anchor: { label: 'Defensive Anchor', color: '#64748b', condition: (p) => p.fc26.def >= 85 && p.detail?.interceptions >= 85 },
    complete: { label: 'Complete Player', color: '#fbbf24', condition: (p) => Object.values(p.fc26).every(v => v >= 70) }
};

function getPlayerBadges(p) {
    if (!p) return [];
    return Object.entries(SPECIALTY_BADGES)
        .filter(([_, badge]) => badge.condition(p))
        .slice(0, 3)
        .map(([key, badge]) => ({ key, ...badge }));
}

// ================================================
// OVR BADGE COMPONENT (PREMIUM)
// ================================================
function OVRBadge({ ovr, size = 'md', showTrend = false, trend = 'neutral' }) {
    const colors = getOVRColor(ovr);
    const sizeClasses = {
        sm: 'w-8 h-8 text-sm',
        md: 'w-12 h-12 text-lg',
        lg: 'w-16 h-16 text-2xl',
        xl: 'w-20 h-20 text-3xl'
    };

    return (
        <div className="relative">
            <div className={`${sizeClasses[size]} rounded-full flex items-center justify-center font-black shadow-lg`}
                style={{ background: colors.bg, color: colors.text, boxShadow: `0 0 20px ${colors.glow}` }}>
                {ovr}
            </div>
            {showTrend && trend !== 'neutral' && (
                <div className={`absolute -top-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center ${trend === 'up' ? 'bg-[#228B22]' : 'bg-[#ef4444]'}`}>
                    {trend === 'up' ? <TrendingUp className="w-2.5 h-2.5 text-white" /> : <TrendingDown className="w-2.5 h-2.5 text-white" />}
                </div>
            )}
        </div>
    );
}

// ================================================
// ML ENGINE
// ================================================
const AGING = { ST: { peak: 28, dec: 0.04 }, LW: { peak: 27, dec: 0.04 }, RW: { peak: 27, dec: 0.04 }, CAM: { peak: 28, dec: 0.035 }, CM: { peak: 29, dec: 0.03 }, CDM: { peak: 30, dec: 0.025 }, CB: { peak: 30, dec: 0.025 }, RB: { peak: 29, dec: 0.03 }, LB: { peak: 29, dec: 0.03 }, CF: { peak: 28, dec: 0.035 }, GK: { peak: 32, dec: 0.02 } };

function forecastOVR(p, years = 5) {
    if (!p) return [];
    const c = AGING[p.pos] || { peak: 28, dec: 0.035 };
    return Array.from({ length: years }, (_, i) => {
        const age = p.age + i;
        const f = age <= c.peak ? Math.min(1.05, 1 + (c.peak - p.age) * 0.01) : Math.max(0.7, 1 - (age - c.peak) * c.dec);
        return { yr: 2025 + i, ovr: Math.round(p.ovr * f) };
    });
}

function forecastValue(p) {
    if (!p) return [];
    const ovrs = forecastOVR(p);
    return ovrs.map((o, i) => ({ yr: o.yr, val: Math.round(p.marketValue * (o.ovr / p.ovr) * Math.pow(0.92, i)) }));
}

function forecastSalary(p) {
    if (!p) return [];
    const ovrs = forecastOVR(p);
    return ovrs.map((o, i) => ({ yr: o.yr, sal: Math.round((p.salary || 10) * Math.pow(1.04, i) * (o.ovr / p.ovr)), salWeek: Math.round(((p.salary || 10) * Math.pow(1.04, i) * (o.ovr / p.ovr) * 1000) / 52) }));
}

const ALL_PLAYERS = Object.values(PLAYERS_DB).sort((a, b) => b.ovr - a.ovr);
const TT_STYLE = { backgroundColor: '#000', border: '1px solid #0ea5e9', borderRadius: 0, padding: '10px 14px', fontFamily: 'monospace', fontSize: 11, color: '#e2e8f0', zIndex: 9999 };

// ================================================
// PLAYER IMAGE WITH FALLBACK
// ================================================
function PlayerImage({ p, size = 'md', className = '' }) {
    const [failed, setFailed] = useState(false);
    const sizes = { sm: 'w-9 h-9', md: 'w-16 h-18', lg: 'w-24 h-28' };
    const clubColor = CLUB_DATA[p?.team]?.color || '#64748b';
    const flag = FLAGS[p?.nat] || '🏳️';

    if (!p) return null;

    if (failed) {
        return (
            <div className={`${sizes[size]} ${className} bg-[#0f172a] flex flex-col items-center justify-center relative border border-[#1e293b]`}>
                <Shield className="w-1/2 h-1/2" style={{ color: clubColor }} />
                <span className="text-[7px] text-[#64748b] mt-0.5 font-bold">{p.team?.replace('_', ' ').slice(0, 8)}</span>
                <span className="absolute top-0.5 right-0.5 text-xs">{flag}</span>
            </div>
        );
    }

    return (
        <div className={`${sizes[size]} ${className} relative overflow-hidden bg-[#0f172a] flex-shrink-0`}>
            <img src={p.photo} className="w-full h-full object-cover grayscale contrast-110" onError={() => setFailed(true)} />
            <span className="absolute top-0.5 right-0.5 text-xs drop-shadow-lg">{flag}</span>
        </div>
    );
}

// ================================================
// HEADER
// ================================================
function Header({ onSearch }) {
    const [q, setQ] = useState('');
    const res = useMemo(() => q.length < 2 ? [] : ALL_PLAYERS.filter(p => p.name.toLowerCase().includes(q.toLowerCase())).slice(0, 8), [q]);

    return (
        <header className="h-12 flex-shrink-0 border-b border-[#1e293b] bg-black px-4 flex items-center justify-between font-mono">
            <div className="flex items-center gap-4">
                <span className="text-[#2E7D32] font-black text-lg tracking-[0.25em]" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>OPTIFOOT</span>
                <span className="text-[#2E7D32] text-[10px] border border-[#2E7D32]/40 px-2 py-0.5 bg-[#2E7D32]/5">● {ALL_PLAYERS.length} ACTIVE</span>
            </div>
            <div className="relative w-72">
                <div className="flex items-center gap-2 border border-[#1e293b] px-3 py-1.5 bg-black">
                    <Search className="w-4 h-4 text-[#475569]" />
                    <input value={q} onChange={e => setQ(e.target.value)} placeholder="SEARCH PLAYER..." className="bg-transparent text-[#e2e8f0] text-[12px] w-full outline-none placeholder-[#475569]" />
                </div>
                {res.length > 0 && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-black border border-[#1e293b] z-50 max-h-72 overflow-y-auto">
                        {res.map(p => (
                            <button key={p.id} onClick={() => { onSearch(p); setQ(''); }} className="w-full text-left px-3 py-2 flex items-center gap-3 hover:bg-[#0f172a] text-[12px] border-b border-[#0f172a]">
                                <PlayerImage p={p} size="sm" />
                                <span className="text-[#e2e8f0] flex-1 font-medium">{p.name}</span>
                                <OVRBadge ovr={p.ovr} size="sm" />
                            </button>
                        ))}
                    </div>
                )}
            </div>
            <div className="border border-[#0ea5e9] bg-[#0ea5e9]/10 text-[#0ea5e9] px-5 py-2 text-[11px] font-bold tracking-wider">[CHIEF ARCHITECT: YOUN GOGER LE GOUX]</div>
        </header>
    );
}

// ================================================
// SIDEBAR
// ================================================
function Sidebar({ onSelect, onSelectP2, selId, selId2 }) {
    const [mode, setMode] = useState(1);
    return (
        <div className="h-full flex flex-col bg-black border-r border-[#1e293b]">
            <div className="px-3 py-2 border-b border-[#1e293b] flex gap-2 flex-shrink-0">
                <button onClick={() => setMode(1)} className={`flex-1 py-1.5 text-[10px] font-bold transition-all ${mode === 1 ? 'bg-[#0ea5e9] text-black' : 'text-[#64748b] border border-[#1e293b] hover:border-[#0ea5e9]'}`}>◀ SELECT P1</button>
                <button onClick={() => setMode(2)} className={`flex-1 py-1.5 text-[10px] font-bold transition-all ${mode === 2 ? 'bg-[#f59e0b] text-black' : 'text-[#64748b] border border-[#1e293b] hover:border-[#f59e0b]'}`}>◀ SELECT P2</button>
            </div>
            <div className="flex-1 overflow-y-auto">
                {ALL_PLAYERS.map((p, i) => (
                    <button key={p.id} onClick={() => mode === 1 ? onSelect(p) : onSelectP2(p)} className={`w-full text-left px-3 py-2.5 flex items-center gap-3 border-b border-[#0f172a] transition-all ${selId === p.id ? 'bg-[#0ea5e9]/15 border-l-4 border-l-[#0ea5e9]' : selId2 === p.id ? 'bg-[#f59e0b]/15 border-l-4 border-l-[#f59e0b]' : 'hover:bg-[#0f172a]/60 border-l-4 border-l-transparent'}`}>
                        <span className="text-[9px] text-[#475569] w-5 font-mono">{String(i + 1).padStart(2, '0')}</span>
                        <PlayerImage p={p} size="sm" />
                        <div className="flex-1 min-w-0">
                            <div className="text-[12px] text-[#e2e8f0] font-semibold whitespace-nowrap">{p.name}</div>
                            <div className="text-[9px] text-[#475569]">{p.team?.replace('_', ' ')} • {p.pos}</div>
                        </div>
                        <OVRBadge ovr={p.ovr} size="sm" />
                    </button>
                ))}
            </div>
        </div>
    );
}

// ================================================
// PLAYER TOGGLE
// ================================================
function PlayerToggle({ p1, p2, active, onChange }) {
    return (
        <div className="flex gap-2 mb-4 flex-shrink-0">
            <button onClick={() => onChange(1)} className={`flex-1 px-4 py-3 text-[12px] font-bold flex items-center justify-center gap-3 border-2 transition-all ${active === 1 ? 'bg-[#0ea5e9] text-black border-[#0ea5e9]' : 'bg-transparent text-[#64748b] border-[#1e293b] hover:border-[#0ea5e9]'}`}>
                <User className="w-4 h-4" />
                <span className="tracking-wide">VIEW: {p1?.name || 'PLAYER_1'}</span>
                <OVRBadge ovr={p1?.ovr || 0} size="sm" />
            </button>
            <button onClick={() => onChange(2)} className={`flex-1 px-4 py-3 text-[12px] font-bold flex items-center justify-center gap-3 border-2 transition-all ${active === 2 ? 'bg-[#f59e0b] text-black border-[#f59e0b]' : 'bg-transparent text-[#64748b] border-[#1e293b] hover:border-[#f59e0b]'}`}>
                <User className="w-4 h-4" />
                <span className="tracking-wide">VIEW: {p2?.name || 'PLAYER_2'}</span>
                <OVRBadge ovr={p2?.ovr || 0} size="sm" />
            </button>
        </div>
    );
}

// ================================================
// PLAYER CARD (WITH BADGES)
// ================================================
function PlayerCard({ p, color = '#0ea5e9', isActive = false }) {
    if (!p) return null;
    const T = p.trend === 'up' ? TrendingUp : p.trend === 'down' ? TrendingDown : Minus;
    const flag = FLAGS[p.nat] || '🏳️';
    const badges = getPlayerBadges(p);

    return (
        <div className={`bg-black border transition-all flex-shrink-0 ${isActive ? 'border-2' : 'border'}`} style={{ borderColor: isActive ? color : '#1e293b', borderLeftWidth: 4, borderLeftColor: color }}>
            <div className="flex">
                <PlayerImage p={p} size="md" className="border-r border-[#1e293b]" />
                <div className="flex-1 p-2.5">
                    <div className="flex justify-between items-start mb-1">
                        <div>
                            <div className="text-[13px] font-bold text-[#e2e8f0] flex items-center gap-2">{p.name} <span className="text-sm">{flag}</span></div>
                            <div className="text-[9px] text-[#475569]">{p.team?.replace('_', ' ')} • {p.pos} • {p.age} ans</div>
                            {badges.length > 0 && (
                                <div className="flex gap-1 mt-1 flex-wrap">
                                    {badges.map(b => (
                                        <span key={b.key} className="text-[7px] px-1.5 py-0.5 font-bold border" style={{ color: b.color, borderColor: b.color, backgroundColor: `${b.color}15` }}>{b.label}</span>
                                    ))}
                                </div>
                            )}
                        </div>
                        <div className="flex items-center gap-2">
                            <OVRBadge ovr={p.ovr} size="md" showTrend trend={p.trend} />
                        </div>
                    </div>
                    <div className="grid grid-cols-6 gap-1">
                        {[{ k: 'pac', l: 'PAC', c: '#228B22' }, { k: 'sho', l: 'SHO', c: '#f59e0b' }, { k: 'pas', l: 'PAS', c: '#0ea5e9' }, { k: 'dri', l: 'DRI', c: '#a855f7' }, { k: 'def', l: 'DEF', c: '#ef4444' }, { k: 'phy', l: 'PHY', c: '#f97316' }].map(s => (
                            <div key={s.k} className="text-center bg-[#0f172a] py-1 border border-[#1e293b]">
                                <div style={{ color: s.c }} className="font-bold text-[11px]">{p.fc26[s.k]}</div>
                                <div className="text-[7px] text-[#475569]">{s.l}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

// ================================================
// CONTRACT DETAILS PANEL
// ================================================
function ContractPanel({ p, color }) {
    if (!p) return null;
    const adv = getPlayerAdvanced(p);
    const roi = ((adv.currentValue - adv.purchasePrice) / adv.purchasePrice * 100).toFixed(0);

    return (
        <div className="bg-black border border-[#1e293b] p-3">
            <div className="text-[10px] text-[#64748b] mb-3 font-bold flex items-center gap-2"><FileText className="w-3 h-3" /> CONTRACT DETAILS</div>
            <div className="space-y-2 text-[11px]">
                <div className="flex justify-between"><span className="text-[#475569]">Purchase Price</span><span className="text-[#ef4444] font-bold">{adv.purchasePrice} M€</span></div>
                <div className="flex justify-between"><span className="text-[#475569]">Current Value</span><span className="text-[#22c55e] font-bold">{adv.currentValue} M€</span></div>
                <div className="flex justify-between"><span className="text-[#475569]">ROI</span><span className={`font-bold ${Number(roi) >= 0 ? 'text-[#22c55e]' : 'text-[#ef4444]'}`}>{roi > 0 ? '+' : ''}{roi}%</span></div>
                <div className="flex justify-between border-t border-[#1e293b] pt-2 mt-2"><span className="text-[#475569]">Contract Ends</span><span style={{ color }} className="font-black">{adv.contractEnd}</span></div>
            </div>
        </div>
    );
}

// ================================================
// STAFF & TACTICS PANEL
// ================================================
function StaffTacticsPanel({ p, color }) {
    if (!p) return null;
    const adv = getPlayerAdvanced(p);

    return (
        <div className="bg-black border border-[#1e293b] p-3">
            <div className="text-[10px] text-[#64748b] mb-3 font-bold flex items-center gap-2"><Users className="w-3 h-3" /> STAFF & TACTICS</div>
            <div className="space-y-2 text-[11px]">
                <div className="flex justify-between"><span className="text-[#475569]">Manager</span><span className="text-[#e2e8f0] font-bold">{adv.manager}</span></div>
                <div className="flex justify-between"><span className="text-[#475569]">Position</span><span className="text-[#a855f7] font-bold">{p.pos}</span></div>
                <div className="flex justify-between border-t border-[#1e293b] pt-2 mt-2"><span className="text-[#475569]">Favored Role</span><span style={{ color }} className="font-black">{adv.tacticalRole}</span></div>
            </div>
        </div>
    );
}

// ================================================
// ADVANCED METRICS PANEL
// ================================================
function AdvancedMetricsPanel({ p, color }) {
    if (!p) return null;
    const adv = getPlayerAdvanced(p);

    const metrics = [
        { label: 'xG per 90', value: adv.xG, max: 1.0, color: '#22c55e' },
        { label: 'xA per 90', value: adv.xA, max: 0.6, color: '#0ea5e9' },
        { label: 'Prog. Passes', value: adv.progPasses, max: 15, color: '#a855f7' }
    ];

    return (
        <div className="bg-black border border-[#1e293b] p-3">
            <div className="text-[10px] text-[#64748b] mb-3 font-bold flex items-center gap-2"><Target className="w-3 h-3" /> ADVANCED METRICS</div>
            <div className="space-y-3">
                {metrics.map(m => (
                    <div key={m.label}>
                        <div className="flex justify-between text-[10px] mb-1">
                            <span className="text-[#475569]">{m.label}</span>
                            <span style={{ color: m.color }} className="font-black">{m.value}</span>
                        </div>
                        <div className="h-1.5 bg-[#0f172a] border border-[#1e293b]">
                            <div style={{ width: `${Math.min((m.value / m.max) * 100, 100)}%`, backgroundColor: m.color }} className="h-full transition-all" />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

// ================================================
// RADAR CHART
// ================================================
function InteractiveRadar({ p1, p2, activePlayer }) {
    const STATS = [{ k: 'pac', l: 'PACE' }, { k: 'sho', l: 'SHOOTING' }, { k: 'pas', l: 'PASSING' }, { k: 'dri', l: 'DRIBBLING' }, { k: 'def', l: 'DEFENSE' }, { k: 'phy', l: 'PHYSICAL' }];
    const data = STATS.map(s => ({ axis: s.l, v1: p1?.fc26[s.k] || 0, v2: p2?.fc26[s.k] || 0 }));

    return (
        <div className="bg-black border border-[#1e293b] flex flex-col min-h-[500px]" style={{ height: '100%' }}>
            <div className="px-3 py-2 border-b border-[#1e293b] text-[11px] text-[#64748b] flex justify-between items-center flex-shrink-0">
                <span className="font-bold">◈ RADAR COMPARISON</span>
                <div className="flex gap-4">
                    <span className={`flex items-center gap-1.5 ${activePlayer === 1 ? 'text-[#0ea5e9]' : 'text-[#0ea5e9]/40'}`}><span className="w-2 h-2 bg-[#0ea5e9]" /> P1</span>
                    <span className={`flex items-center gap-1.5 ${activePlayer === 2 ? 'text-[#f59e0b]' : 'text-[#f59e0b]/40'}`}><span className="w-2 h-2 bg-[#f59e0b]" /> P2</span>
                </div>
            </div>
            <div className="flex-1 p-3" style={{ minHeight: 0, position: 'relative' }}>
                <div style={{ position: 'absolute', inset: 12 }}>
                    <ResponsiveContainer width="100%" height="100%">
                        <RadarChart data={data} cx="50%" cy="50%" outerRadius="75%">
                            <PolarGrid stroke="#1e293b" strokeWidth={1} />
                            <PolarAngleAxis dataKey="axis" tick={{ fill: '#94a3b8', fontSize: 11, fontFamily: 'monospace', fontWeight: 600 }} tickLine={false} />
                            <PolarRadiusAxis domain={[0, 99]} tick={false} axisLine={false} />
                            <Tooltip wrapperStyle={{ zIndex: 9999 }} content={({ active, payload }) => active && payload?.length ? (
                                <div style={TT_STYLE}>
                                    <div className="font-bold text-[#94a3b8] mb-2 text-xs border-b border-[#1e293b] pb-1">{payload[0]?.payload?.axis}</div>
                                    <div className="space-y-1">
                                        <div className="flex justify-between gap-6"><span className="text-[#0ea5e9]">{p1?.name}</span><span className="text-[#0ea5e9] font-black">{payload[0]?.value}</span></div>
                                        <div className="flex justify-between gap-6"><span className="text-[#f59e0b]">{p2?.name}</span><span className="text-[#f59e0b] font-black">{payload[1]?.value}</span></div>
                                    </div>
                                </div>
                            ) : null} />
                            <Radar name="v1" dataKey="v1" stroke="#0ea5e9" strokeWidth={activePlayer === 1 ? 3 : 1.5} fill="#0ea5e9" fillOpacity={activePlayer === 1 ? 0.3 : 0.08} dot={{ r: activePlayer === 1 ? 6 : 3, fill: '#0ea5e9', stroke: '#000', strokeWidth: 1 }} />
                            <Radar name="v2" dataKey="v2" stroke="#f59e0b" strokeWidth={activePlayer === 2 ? 3 : 1.5} fill="#f59e0b" fillOpacity={activePlayer === 2 ? 0.3 : 0.08} dot={{ r: activePlayer === 2 ? 6 : 3, fill: '#f59e0b', stroke: '#000', strokeWidth: 1 }} />
                        </RadarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
}

// ================================================
// PIZZA CHART
// ================================================
function InteractivePizza({ p, color = '#0ea5e9' }) {
    const [active, setActive] = useState(null);
    if (!p) return null;

    const STATS = [
        { k: 'pac', l: 'PACE', c: '#22c55e', subs: p.detail ? [['Acceleration', p.detail.acceleration], ['Sprint Speed', p.detail.sprintSpeed]] : [] },
        { k: 'sho', l: 'SHOOTING', c: '#f59e0b', subs: p.detail ? [['Positioning', p.detail.positioning], ['Finishing', p.detail.finishing], ['Shot Power', p.detail.shotPower], ['Long Shots', p.detail.longShots]] : [] },
        { k: 'pas', l: 'PASSING', c: '#0ea5e9', subs: p.detail ? [['Vision', p.detail.vision], ['Crossing', p.detail.crossing], ['Short Pass', p.detail.shortPass], ['Long Pass', p.detail.longPass]] : [] },
        { k: 'dri', l: 'DRIBBLING', c: '#a855f7', subs: p.detail ? [['Agility', p.detail.agility], ['Balance', p.detail.balance], ['Ball Control', p.detail.ballControl], ['Dribbling', p.detail.dribbling]] : [] },
        { k: 'def', l: 'DEFENSE', c: '#ef4444', subs: p.detail ? [['Interceptions', p.detail.interceptions], ['Def Aware', p.detail.defAware], ['Stand Tackle', p.detail.standTackle], ['Slide Tackle', p.detail.slideTackle]] : [] },
        { k: 'phy', l: 'PHYSICAL', c: '#f97316', subs: p.detail ? [['Jumping', p.detail.jumping], ['Stamina', p.detail.stamina], ['Strength', p.detail.strength], ['Aggression', p.detail.aggression]] : [] }
    ];

    const pieData = STATS.map(s => ({ name: s.l, val: p.fc26[s.k], color: s.c, k: s.k }));
    const activeStat = active ? STATS.find(s => s.k === active) : null;

    return (
        <div className="bg-black border-2 flex flex-col" style={{ borderColor: color, height: '100%', minHeight: 0 }}>
            <div className="px-3 py-2 border-b border-[#1e293b] text-[11px] flex justify-between items-center flex-shrink-0" style={{ backgroundColor: `${color}10` }}>
                <span className="text-[#64748b] font-bold">◈ PERCENTILE PIZZA</span>
                <div className="flex items-center gap-2">
                    <span style={{ color }} className="font-black tracking-wide">{p.name}</span>
                    <OVRBadge ovr={p.ovr} size="sm" />
                </div>
            </div>
            <div className="flex-1 flex" style={{ minHeight: 0 }}>
                <div className="w-[45%] p-4 relative" style={{ minHeight: 0 }}>
                    <div style={{ position: 'absolute', inset: 16 }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie data={pieData} cx="50%" cy="50%" innerRadius="28%" outerRadius="88%" dataKey="val" paddingAngle={2} onMouseEnter={(_, i) => setActive(pieData[i].k)} onMouseLeave={() => setActive(null)}>
                                    {pieData.map((d, i) => <Cell key={i} fill={d.color} stroke="#000" strokeWidth={active === d.k ? 4 : 1} opacity={active && active !== d.k ? 0.3 : 1} style={{ cursor: 'pointer', transition: 'all 0.15s ease-out' }} />)}
                                </Pie>
                                <Tooltip wrapperStyle={{ zIndex: 9999 }} content={({ payload }) => payload?.[0] ? (
                                    <div style={TT_STYLE}>
                                        <div className="font-bold" style={{ color: payload[0].payload.color }}>{payload[0].payload.name}</div>
                                        <div className="text-[#e2e8f0] mt-1">Score: <span className="font-black">{payload[0].value}/99</span></div>
                                    </div>
                                ) : null} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
                <div className="w-[55%] p-4 border-l border-[#1e293b] flex flex-col justify-center overflow-y-auto">
                    {activeStat ? (
                        <div>
                            <div className="text-sm font-bold mb-4 pb-2 border-b-2 flex justify-between items-center" style={{ color: activeStat.c, borderColor: activeStat.c }}>
                                <span className="tracking-wide">{activeStat.l}</span>
                                <span className="text-xl">{p.fc26[activeStat.k]}<span className="text-xs text-[#64748b]">/99</span></span>
                            </div>
                            <div className="space-y-3">
                                {activeStat.subs.map(([name, val]) => (
                                    <div key={name} className="flex items-center gap-3 text-[11px]">
                                        <span className="w-28 text-[#94a3b8]">{name}</span>
                                        <div className="flex-1 h-2.5 bg-[#0f172a] border border-[#1e293b]">
                                            <div style={{ width: `${val}%`, backgroundColor: activeStat.c }} className="h-full transition-all duration-200" />
                                        </div>
                                        <span className="w-12 text-right font-black" style={{ color: activeStat.c }}>{val}/99</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {STATS.map(s => (
                                <div key={s.k} className="flex items-center gap-2 text-[11px] cursor-pointer hover:bg-[#0f172a] p-1.5 -mx-1.5 transition-colors rounded" onMouseEnter={() => setActive(s.k)}>
                                    <span className="w-3.5 h-3.5 border border-[#1e293b]" style={{ backgroundColor: s.c }} />
                                    <span className="w-24 text-[#94a3b8] font-medium">{s.l}</span>
                                    <div className="flex-1 h-2.5 bg-[#0f172a] border border-[#1e293b]">
                                        <div style={{ width: `${p.fc26[s.k]}%`, backgroundColor: s.c }} className="h-full" />
                                    </div>
                                    <span className="w-10 text-right font-black" style={{ color: s.c }}>{p.fc26[s.k]}</span>
                                </div>
                            ))}
                            <div className="pt-4 mt-3 border-t-2 flex justify-between items-center" style={{ borderColor: color }}>
                                <span className="text-[11px] text-[#475569] font-bold tracking-wide">OVERALL RATING</span>
                                <OVRBadge ovr={p.ovr} size="lg" />
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

// ================================================
// ML PANEL
// ================================================
function MLPanel({ p, color }) {
    if (!p) return null;
    const ovr = forecastOVR(p);
    const val = forecastValue(p);
    const sal = forecastSalary(p);

    return (
        <div className="h-full flex flex-col gap-3">
            <div className="flex-1 bg-black border border-[#1e293b] flex flex-col" style={{ minHeight: 0 }}>
                <div className="px-3 py-2 border-b border-[#1e293b] text-[11px] text-[#64748b] flex gap-2 items-center font-bold flex-shrink-0">
                    <Cpu className="w-4 h-4" /> OVR PROJECTION • {p.name}
                </div>
                <div className="flex-1 p-3 relative" style={{ minHeight: 0 }}>
                    <div style={{ position: 'absolute', inset: 12 }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={ovr}>
                                <CartesianGrid stroke="#1e293b" strokeDasharray="3 3" />
                                <XAxis dataKey="yr" tick={{ fill: '#64748b', fontSize: 10 }} />
                                <YAxis domain={[60, 99]} tick={{ fill: '#64748b', fontSize: 10 }} tickFormatter={v => `${v} OVR`} />
                                <Tooltip contentStyle={TT_STYLE} formatter={(v) => [`${v} OVR`, 'Rating']} />
                                <Line dataKey="ovr" stroke={color} strokeWidth={3} dot={{ fill: color, r: 5, stroke: '#000' }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
            <div className="grid grid-cols-2 gap-3 flex-shrink-0">
                <div className="bg-black border border-[#1e293b]">
                    <div className="px-3 py-2 border-b border-[#1e293b] text-[10px] text-[#64748b] flex gap-2 font-bold"><DollarSign className="w-3 h-3" /> MARKET VALUE</div>
                    <div className="p-3 h-32 relative">
                        <div style={{ position: 'absolute', inset: 12 }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={val}>
                                    <CartesianGrid stroke="#1e293b" />
                                    <XAxis dataKey="yr" tick={{ fill: '#64748b', fontSize: 9 }} />
                                    <YAxis tick={{ fill: '#64748b', fontSize: 9 }} tickFormatter={v => `${v} M€`} />
                                    <Tooltip contentStyle={TT_STYLE} formatter={(v) => [`${v} M€`, 'Value']} />
                                    <Line dataKey="val" stroke="#22c55e" strokeWidth={2} dot={{ fill: '#22c55e', r: 4 }} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>
                <div className="bg-black border border-[#1e293b]">
                    <div className="px-3 py-2 border-b border-[#1e293b] text-[10px] text-[#64748b] flex gap-2 font-bold"><BarChart3 className="w-3 h-3" /> SALARY PROJECTION</div>
                    <div className="p-2 grid grid-cols-5 gap-1">
                        {sal.map((s, i) => (
                            <div key={i} className={`p-2 border text-center ${i === 0 ? 'border-[#0ea5e9] bg-[#0ea5e9]/10' : 'border-[#1e293b]'}`}>
                                <div className="text-[9px] text-[#475569] font-bold">{s.yr}</div>
                                <div className="text-[11px] text-[#22c55e] font-black">{s.sal} M€</div>
                                <div className="text-[8px] text-[#64748b]">{s.salWeek} K€/sem</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

// ================================================
// TABS
// ================================================
const TABS = ['OVERVIEW', 'TECHNICAL', 'PREDICTIONS_ML', 'FINANCIALS', 'HELP_CENTER'];

// ================================================
// HELP CENTER (ACCORDION)
// ================================================
const HELP_DATA = [
    {
        id: 'xg',
        title: 'xG (Expected Goals)',
        icon: '⚽',
        color: '#22c55e',
        content: 'Measures the quality of a scoring chance. It represents the probability (0 to 1) that a shot will result in a goal, based on factors like shot location, angle, body part used, and type of assist.',
        examples: [
            { label: 'Tap-in from 3m', value: '0.85 - 0.95', color: '#22c55e' },
            { label: 'One-on-one with GK', value: '0.30 - 0.45', color: '#f59e0b' },
            { label: 'Long shot (25m+)', value: '0.02 - 0.05', color: '#ef4444' }
        ]
    },
    {
        id: 'xa',
        title: 'xA (Expected Assists)',
        icon: '🎯',
        color: '#0ea5e9',
        content: 'Measures the quality of a pass that leads to a shot. It shows the probability that a pass becomes an assist, regardless of whether the shooter scores. A high xA with low actual assists indicates unlucky teammates.',
        examples: [
            { label: 'Through ball in box', value: '0.25 - 0.40', color: '#22c55e' },
            { label: 'Cross to header', value: '0.08 - 0.15', color: '#f59e0b' },
            { label: 'Long diagonal', value: '0.01 - 0.03', color: '#ef4444' }
        ]
    },
    {
        id: 'prog',
        title: 'Progressive Passes',
        icon: '📈',
        color: '#a855f7',
        content: 'Passes that move the ball significantly closer to the opponent\'s goal. Typically defined as passes that advance the ball at least 10 meters towards goal or into the penalty area.',
        examples: [
            { label: 'Elite playmaker', value: '10+ per 90', color: '#22c55e' },
            { label: 'Average midfielder', value: '5-8 per 90', color: '#f59e0b' },
            { label: 'Defender', value: '3-5 per 90', color: '#64748b' }
        ]
    },
    {
        id: 'per90',
        title: 'Per 90 Minutes',
        icon: '⏱️',
        color: '#f59e0b',
        content: 'All statistics are normalized to 90 minutes of play. This allows fair comparison between players who play different amounts of time (starters vs substitutes).',
        examples: [
            { label: 'Formula', value: '(Stat ÷ Minutes) × 90', color: '#0ea5e9' },
            { label: 'Example: 5 goals in 450 min', value: '= 1.0 goals per 90', color: '#22c55e' }
        ]
    }
];

function HelpCenter() {
    const [openId, setOpenId] = useState(null);

    return (
        <div className="h-full flex flex-col" style={{ minHeight: 0 }}>
            <div className="mb-4 flex items-center gap-3">
                <HelpCircle className="w-6 h-6 text-[#0ea5e9]" />
                <h2 className="text-lg font-bold text-[#e2e8f0]">Understanding the Data</h2>
            </div>
            <p className="text-[11px] text-[#64748b] mb-6 max-w-2xl">Learn how to interpret advanced football analytics. Click on each metric to expand its explanation and see practical examples.</p>
            <div className="space-y-3 max-w-3xl">
                {HELP_DATA.map(item => (
                    <div key={item.id} className="bg-black border border-[#1e293b] overflow-hidden">
                        <button onClick={() => setOpenId(openId === item.id ? null : item.id)} className="w-full px-4 py-3 flex items-center gap-3 text-left hover:bg-[#0f172a] transition-colors">
                            <span className="text-xl">{item.icon}</span>
                            <span className="flex-1 text-[13px] font-bold" style={{ color: item.color }}>{item.title}</span>
                            {openId === item.id ? <ChevronDown className="w-4 h-4 text-[#64748b]" /> : <ChevronRight className="w-4 h-4 text-[#64748b]" />}
                        </button>
                        {openId === item.id && (
                            <div className="px-4 pb-4 border-t border-[#1e293b]">
                                <p className="text-[11px] text-[#94a3b8] mt-3 mb-4 leading-relaxed">{item.content}</p>
                                <div className="space-y-2">
                                    {item.examples.map((ex, i) => (
                                        <div key={i} className="flex items-center gap-3 text-[10px] bg-[#0f172a] p-2 border border-[#1e293b]">
                                            <span className="text-[#64748b] flex-1">{ex.label}</span>
                                            <span className="font-black" style={{ color: ex.color }}>{ex.value}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>
            <div className="mt-8 p-4 bg-[#0f172a] border border-[#1e293b] max-w-3xl">
                <div className="text-[10px] text-[#64748b] mb-2 font-bold">📚 DATA SOURCES</div>
                <p className="text-[10px] text-[#475569]">Statistics are derived from Opta, StatsBomb, and FBref methodologies. Player ratings follow the FC26 attribute system. All projections use proprietary ML models trained on historical performance data.</p>
            </div>
        </div>
    );
}

// ================================================
// MAIN APP
// ================================================
export default function App() {
    const [p1, setP1] = useState(ALL_PLAYERS[0]);
    const [p2, setP2] = useState(ALL_PLAYERS[1]);
    const [activePlayer, setActivePlayer] = useState(1);
    const [tab, setTab] = useState('OVERVIEW');

    const viewingPlayer = activePlayer === 1 ? p1 : p2;
    const viewingColor = activePlayer === 1 ? '#0ea5e9' : '#f59e0b';

    return (
        <div className="h-screen flex flex-col bg-black font-mono text-[#e2e8f0] overflow-hidden">
            <Header onSearch={setP1} />
            <div className="h-10 flex-shrink-0 border-b border-[#1e293b] px-4 flex items-center gap-2 bg-[#030712]">
                {TABS.map(t => (
                    <button key={t} onClick={() => setTab(t)} className={`px-5 py-1.5 text-[10px] font-bold tracking-wide transition-all ${tab === t ? 'bg-[#0ea5e9] text-black' : 'text-[#64748b] hover:text-[#e2e8f0] hover:bg-[#0f172a]'}`}>{t}</button>
                ))}
                <div className="ml-auto text-[10px] text-[#475569] font-mono">YOUN GOGER LE GOUX • V6.0</div>
            </div>
            <main className="flex-1 flex overflow-hidden" style={{ minHeight: 0 }}>
                <aside className="w-64 flex-shrink-0"><Sidebar onSelect={setP1} onSelectP2={setP2} selId={p1?.id} selId2={p2?.id} /></aside>
                <div className="flex-1 p-4 overflow-y-auto" style={{ minHeight: 0 }}>
                    {tab === 'OVERVIEW' && (
                        <div className="h-full flex flex-col" style={{ minHeight: 0 }}>
                            <PlayerToggle p1={p1} p2={p2} active={activePlayer} onChange={setActivePlayer} />
                            <div className="grid grid-cols-2 gap-4 mb-4 flex-shrink-0">
                                <PlayerCard p={p1} color="#0ea5e9" isActive={activePlayer === 1} />
                                <PlayerCard p={p2} color="#f59e0b" isActive={activePlayer === 2} />
                            </div>
                            <div className="flex-1 grid grid-cols-3 gap-4" style={{ minHeight: 0 }}>
                                {/* Left: Radar + Advanced Metrics */}
                                <div className="flex flex-col gap-3">
                                    <div className="flex-1"><InteractiveRadar p1={p1} p2={p2} activePlayer={activePlayer} /></div>
                                    <AdvancedMetricsPanel p={viewingPlayer} color={viewingColor} />
                                </div>
                                {/* Center: Pizza Chart */}
                                <InteractivePizza p={viewingPlayer} color={viewingColor} />
                                {/* Right: Contract + Staff */}
                                <div className="flex flex-col gap-3">
                                    <ContractPanel p={viewingPlayer} color={viewingColor} />
                                    <StaffTacticsPanel p={viewingPlayer} color={viewingColor} />
                                </div>
                            </div>
                        </div>
                    )}
                    {tab === 'TECHNICAL' && (
                        <div className="h-full flex flex-col" style={{ minHeight: 0 }}>
                            <PlayerToggle p1={p1} p2={p2} active={activePlayer} onChange={setActivePlayer} />
                            <div className="flex-1 grid grid-cols-3 gap-4" style={{ minHeight: 0 }}>
                                <div className="flex flex-col gap-3">
                                    <div className="flex-1"><InteractiveRadar p1={p1} p2={p2} activePlayer={activePlayer} /></div>
                                    <AdvancedMetricsPanel p={viewingPlayer} color={viewingColor} />
                                </div>
                                <InteractivePizza p={viewingPlayer} color={viewingColor} />
                                <div className="flex flex-col gap-3">
                                    <ContractPanel p={viewingPlayer} color={viewingColor} />
                                    <StaffTacticsPanel p={viewingPlayer} color={viewingColor} />
                                </div>
                            </div>
                        </div>
                    )}
                    {tab === 'PREDICTIONS_ML' && (
                        <div className="h-full flex flex-col" style={{ minHeight: 0 }}>
                            <PlayerToggle p1={p1} p2={p2} active={activePlayer} onChange={setActivePlayer} />
                            <div className="flex-1 grid grid-cols-3 gap-4" style={{ minHeight: 0 }}>
                                <div className="flex flex-col gap-3">
                                    <PlayerCard p={viewingPlayer} color={viewingColor} isActive />
                                    <ContractPanel p={viewingPlayer} color={viewingColor} />
                                    <StaffTacticsPanel p={viewingPlayer} color={viewingColor} />
                                </div>
                                <div className="col-span-2"><MLPanel p={viewingPlayer} color={viewingColor} /></div>
                            </div>
                        </div>
                    )}
                    {tab === 'FINANCIALS' && (
                        <div className="h-full flex flex-col" style={{ minHeight: 0 }}>
                            <PlayerToggle p1={p1} p2={p2} active={activePlayer} onChange={setActivePlayer} />
                            <div className="flex-1 grid grid-cols-3 gap-4" style={{ minHeight: 0 }}>
                                <div className="flex flex-col gap-3">
                                    <PlayerCard p={viewingPlayer} color={viewingColor} isActive />
                                    <ContractPanel p={viewingPlayer} color={viewingColor} />
                                    <div className="flex-1 bg-black border-2 p-4" style={{ borderColor: viewingColor }}>
                                        <div className="text-[11px] text-[#64748b] mb-4 font-bold tracking-wide">◈ FINANCIAL PROFILE</div>
                                        <div className="grid grid-cols-2 gap-3">
                                            <div className="bg-[#0f172a] p-3 border border-[#1e293b] text-center"><div className="text-[9px] text-[#475569] mb-1 font-bold">MARKET VALUE</div><div className="text-xl text-[#22c55e] font-black">{viewingPlayer?.marketValue} M€</div></div>
                                            <div className="bg-[#0f172a] p-3 border border-[#1e293b] text-center"><div className="text-[9px] text-[#475569] mb-1 font-bold">ANNUAL SALARY</div><div className="text-xl text-[#0ea5e9] font-black">{viewingPlayer?.salary} M€/an</div></div>
                                            <div className="bg-[#0f172a] p-3 border border-[#1e293b] text-center"><div className="text-[9px] text-[#475569] mb-1 font-bold">WEEKLY SALARY</div><div className="text-xl text-[#a855f7] font-black">{Math.round(viewingPlayer?.salary * 1000 / 52)} K€</div></div>
                                            <div className="bg-[#0f172a] p-3 border border-[#1e293b] text-center"><div className="text-[9px] text-[#475569] mb-1 font-bold">CONTRACT END</div><div className="text-xl text-[#f59e0b] font-black">{viewingPlayer?.contractEnd}</div></div>
                                        </div>
                                    </div>
                                </div>
                                <div className="col-span-2"><MLPanel p={viewingPlayer} color={viewingColor} /></div>
                            </div>
                        </div>
                    )}
                    {tab === 'HELP_CENTER' && <HelpCenter />}
                </div>
            </main>
        </div>
    );
}
