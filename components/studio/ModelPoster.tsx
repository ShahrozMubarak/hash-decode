import { useId } from 'react';

export type PosterModel = 'cube' | 'crystal' | 'halo' | 'eva' | 'fixer';

type PosterProps = {
  model: PosterModel;
  className?: string;
};

const names: Record<PosterModel, string> = {
  cube: 'Hash Cube',
  crystal: 'Enchanted Crystal',
  halo: 'Titanium Halo',
  eva: 'Eva Autonomous Robot',
  fixer: 'Fixer Autonomous Robot',
};

// Each instance has its own gradients so the hero and the gallery can coexist.
export default function ModelPoster({ model, className }: PosterProps) {
  const id = useId().replace(/[^a-zA-Z0-9_-]/g, '');
  const paint = (key: string) => 'url(#' + id + '-' + key + ')';
  return (
    <svg className={className} viewBox="0 0 480 450" role="img" aria-label={names[model] + ' studio model'} preserveAspectRatio="xMidYMid meet">
      <defs>
        <linearGradient id={id + '-ice'} x1="0" y1="0" x2=".9" y2="1" gradientUnits="objectBoundingBox">
          <stop stopColor="var(--snow)" /><stop offset=".25" stopColor="var(--snow)" stopOpacity=".88" />
          <stop offset=".56" stopColor="var(--azure)" stopOpacity=".52" /><stop offset=".92" stopColor="var(--snow)" stopOpacity=".96" />
          <stop offset="1" stopColor="var(--azure)" />
        </linearGradient>
        <linearGradient id={id + '-left'} x2="1" y2=".82">
          <stop stopColor="var(--navy)" /><stop offset=".17" stopColor="var(--azure)" />
          <stop offset=".56" stopColor="var(--azure)" stopOpacity=".72" /><stop offset=".85" stopColor="var(--snow)" stopOpacity=".65" />
          <stop offset="1" stopColor="var(--azure)" />
        </linearGradient>
        <linearGradient id={id + '-right'} x1=".13" y1="1" x2="1" y2=".04">
          <stop stopColor="var(--navy)" /><stop offset=".27" stopColor="var(--navy)" stopOpacity=".86" />
          <stop offset=".72" stopColor="var(--azure)" /><stop offset="1" stopColor="var(--snow)" stopOpacity=".94" />
        </linearGradient>
        <linearGradient id={id + '-core'} x1="0" y1="0" x2="1" y2="1">
          <stop stopColor="var(--snow)" /><stop offset=".26" stopColor="var(--coral)" />
          <stop offset=".78" stopColor="var(--coral)" /><stop offset="1" stopColor="var(--navy)" />
        </linearGradient>
        <linearGradient id={id + '-metal'} x1="0" y1="0" x2=".96" y2="1">
          <stop stopColor="var(--navy)" /><stop offset=".18" stopColor="var(--azure)" />
          <stop offset=".28" stopColor="var(--snow)" /><stop offset=".39" stopColor="var(--azure)" />
          <stop offset=".55" stopColor="var(--navy)" /><stop offset=".73" stopColor="var(--azure)" />
          <stop offset=".84" stopColor="var(--snow)" /><stop offset="1" stopColor="var(--navy)" />
        </linearGradient>
        <radialGradient id={id + '-shadow'}>
          <stop stopColor="var(--navy)" stopOpacity=".25" /><stop offset="1" stopColor="var(--navy)" stopOpacity="0" />
        </radialGradient>
        <radialGradient id={id + '-light'}>
          <stop stopColor="var(--coral)" stopOpacity=".62" /><stop offset="1" stopColor="var(--coral)" stopOpacity="0" />
        </radialGradient>
        {model === 'cube' && <CubeDefinitions id={id} paint={paint} />}
      </defs>
      <ellipse cx="240" cy="409" rx={model === 'crystal' ? 88 : 143} ry="12" fill={paint('shadow')} />
      {model === 'cube' && <Cube id={id} />}
      {model === 'crystal' && <Crystal paint={paint} />}
      {model === 'halo' && <Halo paint={paint} />}
      {(model === 'eva' || model === 'fixer') && <Eva paint={paint} />}
    </svg>
  );
}

type Paint = (key: string) => string;

const cubeTop = 'M3 -25 Q0 -27 -4 -25 L-41 -6 Q-44 -4 -40 -2 L-2 16 Q1 18 5 16 L43 -2 Q46 -4 42 -6 Z';
const cubeLeft = 'M-45 -2 Q-45 -5 -41 -3 L-3 15 Q0 17 0 21 L0 62 Q0 66 -4 64 L-42 46 Q-45 44 -45 40 Z';
const cubeRight = 'M3 20 Q3 17 7 15 L44 -3 Q48 -5 48 -1 L48 39 Q48 43 45 45 L7 64 Q3 66 3 62 Z';

function CubeDefinitions({ id, paint }: { id: string; paint: Paint }) {
  return <>{['glass', 'core'].map((surface) => {
    const core = surface === 'core';
    return <g id={id + '-cell-' + surface} key={surface} strokeLinejoin="round">
      <path d={cubeTop} fill={paint(core ? 'core' : 'ice')} />
      <path d={cubeLeft} fill={core ? 'var(--coral)' : paint('left')} fillOpacity={core ? 1 : .9} />
      <path d={cubeRight} fill={paint(core ? 'core' : 'right')} />
      <path d="M-42 -3 L-1 17 Q1 18 5 16 L45 -3 M1 21 L1 62" stroke="var(--snow)" strokeOpacity=".86" strokeWidth="1.5" fill="none" />
      <path d="M-41 -6 L-3 -24 Q0 -25 3 -24 L38 -8 M-42 4 V39 Q-42 42 -39 43 L-6 59 M44 4 V37" stroke="var(--snow)" strokeOpacity=".53" strokeWidth="1.1" fill="none" />
      {!core && <path d="M-38 1 L-29 5 -40 28 Z M35 4 L42 1 40 20 Z" fill="var(--snow)" opacity=".21" />}
    </g>;
  })}</>;
}

const cubeCells = Array.from({ length: 27 }, (_, i) => {
  const u = i % 3 - 1;
  const v = Math.floor(i / 3) % 3 - 1;
  const z = Math.floor(i / 9) - 1;
  return { u, v, z, depth: u + v + z };
}).sort((a, b) => a.depth - b.depth);

function Cube({ id }: { id: string }) {
  return <g transform="translate(239 212) rotate(-8) scale(1.13)" strokeWidth="1">
    {cubeCells.map(({ u, v, z }) => {
      const core = !u && !v && !z;
      // Three near panes transmit the central colour through the glass.
      const window = u >= 0 && v >= 0 && z >= 0 && u + v + z >= 2;
      return <use key={u + ':' + v + ':' + z} href={'#' + id + (core ? '-cell-core' : '-cell-glass')}
        x={u * 48 - v * 48} y={u * 23 + v * 24 - z * 51 - 16}
        opacity={window ? .48 : core ? 1 : .92} />;
    })}
    <g transform="translate(0 -16)" pointerEvents="none">
      <ellipse cx="0" cy="13" rx="63" ry="59" fill={'url(#' + id + '-light)'} opacity=".72" />
      <use href={'#' + id + '-cell-core'} opacity=".83" />
      <path d="M-42 -4 -2 16 Q1 18 6 15 L43 -3 M2 19 L2 61" fill="none" stroke="var(--snow)" strokeOpacity=".78" strokeWidth="1.1" />
    </g>
  </g>;
}

function Crystal({ paint }: { paint: Paint }) {
  return <g transform="translate(240 218) rotate(13) scale(1.12)">
    <path d="M-10 -158 42 -132 58 -90 66 66 48 119 15 151 -32 142 -60 103 -70 0 -52 -125Z" fill={paint('right')} />
    <path d="M-52 -125 -10 -158 42 -132 9 -102 -26 -110Z" fill={paint('ice')} />
    <path d="M42 -132 58 -90 66 66 40 90 25 21 9 -102Z" fill={paint('left')} />
    <path d="M-52 -125 -26 -110 -32 -65 -49 34 -60 103 -70 0Z" fill={paint('ice')} />
    <path d="M-26 -110 9 -102 25 21 12 79 -22 100 -49 34Z" fill={paint('left')} />
    <path d="M-15 -52 15 -24 24 19 6 69 -14 40 -28 -7Z" fill={paint('light')} />
    <path d="M-12 -23 4 -10 11 19 2 42 -8 22Z" fill={paint('core')} />
    <path d="M-49 34 -22 100 12 79 40 90 48 119 15 151 -32 142 -60 103Z" fill={paint('right')} />
    <path d="M-32 142 -22 100 12 79 40 90 15 151Z" fill={paint('ice')} opacity=".52" />
    <path d="M-52 -125 -10 -158 42 -132 M9 -102 25 21 12 79 M-60 103 -32 142 15 151 M-26 -110 -49 34" fill="none" stroke="var(--snow)" strokeOpacity=".7" strokeWidth="1.2" />
  </g>;
}

function Halo({ paint }: { paint: Paint }) {
  return <g transform="translate(240 213) rotate(-28) scale(1 .77)" fill="none">
    <ellipse cy="34" rx="137" ry="137" stroke={paint('metal')} strokeWidth="55" />
    <ellipse cy="28" rx="127" ry="127" stroke="var(--navy)" opacity=".79" strokeWidth="29" />
    <ellipse cy="24" rx="149" ry="149" stroke={paint('metal')} strokeWidth="26" />
    <ellipse cy="12" rx="144" ry="144" stroke="var(--navy)" strokeWidth="39" />
    <circle r="135" stroke={paint('metal')} strokeWidth="55" />
    <circle r="153" stroke={paint('ice')} strokeWidth="8" />
    <circle r="131" stroke={paint('right')} strokeWidth="27" />
    <circle r="112" stroke={paint('metal')} strokeWidth="13" />
    <circle r="107" stroke="var(--coral)" strokeWidth="2.2" opacity=".9" />
    {Array.from({ length: 8 }, (_, i) => <g key={i} transform={'rotate(' + (i * 45) + ')'}>
      <path d="M-48 -148 Q0 -166 48 -148 L40 -123 Q0 -136 -40 -123Z" fill={paint('metal')} stroke="var(--snow)" strokeOpacity=".57" />
      <path d="M-28 -145 Q0 -153 28 -145" stroke="var(--snow)" strokeOpacity=".67" />
      <circle cx="0" cy="-139" r="4.2" fill="var(--navy)" stroke={paint('ice')} strokeWidth="1.5" />
    </g>)}
    <ellipse cy="16" rx="139" ry="139" stroke={paint('ice')} strokeWidth="1.2" opacity=".5" />
  </g>;
}

function Eva({ paint }: { paint: Paint }) {
  return (
    <g transform="translate(240 215) scale(0.95)">
      <ellipse cx="0" cy="0" rx="140" ry="170" fill="var(--azure)" opacity="0.18" />
      <path d="M-65 -110 C-65 -160, 65 -160, 65 -110 C65 -50, 75 70, 45 130 C20 160, -20 160, -45 130 C-75 70, -65 -50, -65 -110 Z" fill={paint('metal')} />
      <ellipse cx="0" cy="-60" rx="46" ry="34" fill="var(--navy)" stroke="var(--azure)" strokeWidth="2" />
      <ellipse cx="-16" cy="-60" rx="10" ry="5" fill="#FD614B" opacity="0.9" />
      <ellipse cx="16" cy="-60" rx="10" ry="5" fill="#FD614B" opacity="0.9" />
      <path d="M-75 -40 C-95 10, -90 60, -70 90 C-65 95, -55 70, -62 30 Z" fill={paint('ice')} />
      <path d="M75 -40 C95 10, 90 60, 70 90 C65 95, 55 70, 62 30 Z" fill={paint('left')} />
      <ellipse cx="0" cy="25" rx="14" ry="14" fill="#FD614B" opacity="0.45" />
      <circle cx="0" cy="25" r="7" fill="#FD614B" />
    </g>
  );
}
