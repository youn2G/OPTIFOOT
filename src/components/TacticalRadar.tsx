import React from 'react';
import {
    Radar,
    RadarChart,
    PolarGrid,
    PolarAngleAxis,
    PolarRadiusAxis,
    ResponsiveContainer,
} from 'recharts';

// ================================================
// TYPES
// ================================================
interface TacticalMetrics {
    creativity: number;    // SCA, Key Passes (0-100)
    engine: number;        // Distance covered, Recoveries (0-100)
    directness: number;    // Progressive Carries, Take-ons (0-100)
    solidity: number;      // Interceptions, Tackle Win % (0-100)
    precision: number;     // Pass Accuracy, Long Ball % (0-100)
    threat: number;        // xG, Shots on Target (0-100)
}

interface Player {
    id: string;
    name: string;
    metrics: TacticalMetrics;
}

interface TacticalRadarProps {
    players: Player[];
}

// ================================================
// CONSTANTS
// ================================================
const COLORS = {
    playerA: '#0ea5e9',
    playerB: '#f59e0b',
    grid: '#111827',
    label: '#94a3b8',
    border: '#1e293b',
    background: '#000000',
};

const AXES: { key: keyof TacticalMetrics; label: string }[] = [
    { key: 'creativity', label: 'CREATIVITY' },
    { key: 'engine', label: 'ENGINE' },
    { key: 'directness', label: 'DIRECTNESS' },
    { key: 'solidity', label: 'SOLIDITY' },
    { key: 'precision', label: 'PRECISION' },
    { key: 'threat', label: 'THREAT' },
];

// ================================================
// CUSTOM TICK COMPONENT (Monospace Labels)
// ================================================
const CustomTick: React.FC<any> = ({ x, y, payload }) => {
    return (
        <text
            x={x}
            y={y}
            textAnchor="middle"
            dominantBaseline="central"
            style={{
                fontSize: '10px',
                fontFamily: '"IBM Plex Mono", "JetBrains Mono", monospace',
                fill: COLORS.label,
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
            }}
        >
            {payload.value}
        </text>
    );
};

// ================================================
// TACTICAL RADAR COMPONENT
// ================================================
const TacticalRadar: React.FC<TacticalRadarProps> = ({ players }) => {
    // Transform player data into radar format
    const radarData = AXES.map(({ key, label }) => {
        const dataPoint: Record<string, string | number> = { axis: label };
        players.forEach((player, index) => {
            dataPoint[`player_${index}`] = player.metrics[key];
        });
        return dataPoint;
    });

    const getPlayerColor = (index: number): string => {
        return index === 0 ? COLORS.playerA : COLORS.playerB;
    };

    return (
        <div
            className="relative w-full"
            style={{
                backgroundColor: COLORS.background,
                border: `1px solid ${COLORS.border}`,
            }}
        >
            {/* Header */}
            <div
                className="flex items-center justify-between px-4 py-3"
                style={{ borderBottom: `1px solid ${COLORS.border}` }}
            >
                <span
                    className="text-[10px] uppercase tracking-widest"
                    style={{
                        color: COLORS.label,
                        fontFamily: '"IBM Plex Mono", monospace',
                    }}
                >
                    TACTICAL PROFILE // PERCENTILE ANALYSIS
                </span>

                {/* Legend */}
                <div className="flex items-center gap-4">
                    {players.map((player, index) => (
                        <div
                            key={player.id}
                            className="flex items-center gap-2"
                            style={{ fontFamily: '"IBM Plex Mono", monospace' }}
                        >
                            <div
                                className="w-3 h-[2px]"
                                style={{ backgroundColor: getPlayerColor(index) }}
                            />
                            <span
                                className="text-[10px] uppercase"
                                style={{ color: getPlayerColor(index) }}
                            >
                                [ID_{String(index + 1).padStart(2, '0')}: {player.name}]
                            </span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Chart Container */}
            <div className="p-4" style={{ height: '340px' }}>
                <ResponsiveContainer width="100%" height="100%">
                    <RadarChart
                        data={radarData}
                        margin={{ top: 20, right: 30, bottom: 20, left: 30 }}
                    >
                        {/* Grid */}
                        <PolarGrid
                            stroke={COLORS.grid}
                            strokeWidth={0.5}
                            gridType="polygon"
                        />

                        {/* Axis Labels */}
                        <PolarAngleAxis
                            dataKey="axis"
                            tick={<CustomTick />}
                            tickLine={false}
                        />

                        {/* Radius Axis (hidden ticks, just structure) */}
                        <PolarRadiusAxis
                            angle={30}
                            domain={[0, 100]}
                            tick={false}
                            axisLine={false}
                        />

                        {/* Player Radars */}
                        {players.map((player, index) => (
                            <Radar
                                key={player.id}
                                name={player.name}
                                dataKey={`player_${index}`}
                                stroke={getPlayerColor(index)}
                                strokeWidth={2}
                                fill="transparent"
                                fillOpacity={0}
                                dot={{
                                    r: 3,
                                    fill: getPlayerColor(index),
                                    strokeWidth: 0,
                                }}
                                animationDuration={100}
                                animationEasing="step-end"
                            />
                        ))}
                    </RadarChart>
                </ResponsiveContainer>
            </div>

            {/* Footer - Axis Definitions */}
            <div
                className="px-4 py-2 grid grid-cols-6 gap-2 text-[9px]"
                style={{
                    borderTop: `1px solid ${COLORS.border}`,
                    fontFamily: '"IBM Plex Mono", monospace',
                    color: '#475569',
                }}
            >
                <div>CREATIVITY: SCA, KP</div>
                <div>ENGINE: DIST, REC</div>
                <div>DIRECTNESS: PC, TO</div>
                <div>SOLIDITY: INT, TW%</div>
                <div>PRECISION: PA%, LB%</div>
                <div>THREAT: xG, SOT</div>
            </div>
        </div>
    );
};

// ================================================
// EXAMPLE USAGE / DEMO WRAPPER
// ================================================
export const TacticalRadarDemo: React.FC = () => {
    const samplePlayers: Player[] = [
        {
            id: 'player_001',
            name: 'MBAPPÉ',
            metrics: {
                creativity: 88,
                engine: 72,
                directness: 94,
                solidity: 24,
                precision: 82,
                threat: 96,
            },
        },
        {
            id: 'player_002',
            name: 'BELLINGHAM',
            metrics: {
                creativity: 86,
                engine: 92,
                directness: 78,
                solidity: 68,
                precision: 88,
                threat: 74,
            },
        },
    ];

    return (
        <div className="p-6 bg-black min-h-screen">
            <TacticalRadar players={samplePlayers} />
        </div>
    );
};

export default TacticalRadar;

// ================================================
// TYPE EXPORTS
// ================================================
export type { Player, TacticalMetrics, TacticalRadarProps };
