import Svg, { Circle, Path, Text as SvgText } from 'react-native-svg'
import { theme } from '@/constants/theme'

interface Props {
  size?: number
}

export default function NutriArcLogo({ size = 80 }: Props) {
  const cx = size / 2
  const cy = size / 2
  const rOut = size * 0.42
  const rIn  = size * 0.335
  const gapDeg = 52

  // Arc angles in SVG coords (0° = right, clockwise)
  // Gap is at the top (270° in standard math = -90° in SVG)
  // Arc runs from (270 + gap/2) to (270 - gap/2) going clockwise
  const startDeg = 270 + gapDeg / 2   // = 296
  const endDeg   = 270 - gapDeg / 2   // = 244  (going the long way round)

  function polarToXY(deg: number, r: number) {
    const rad = (deg - 90) * (Math.PI / 180)
    return {
      x: cx + r * Math.cos(rad),
      y: cy + r * Math.sin(rad),
    }
  }

  // Build donut arc path: outer arc CW, inner arc CCW
  const o1 = polarToXY(startDeg, rOut)
  const o2 = polarToXY(endDeg,   rOut)
  const i1 = polarToXY(endDeg,   rIn)
  const i2 = polarToXY(startDeg, rIn)

  const arcPath = [
    `M ${o1.x} ${o1.y}`,
    `A ${rOut} ${rOut} 0 1 1 ${o2.x} ${o2.y}`,
    `L ${i1.x} ${i1.y}`,
    `A ${rIn} ${rIn} 0 1 0 ${i2.x} ${i2.y}`,
    'Z',
  ].join(' ')

  const fontSize = size * 0.28

  return (
    <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {/* Ring */}
      <Path d={arcPath} fill={theme.accent} />
      {/* N — white, slightly left of centre */}
      <SvgText
        x={cx - size * 0.07}
        y={cy + fontSize * 0.35}
        textAnchor="middle"
        fill={theme.textPrimary}
        fontSize={fontSize}
        fontWeight="900"
        fontFamily="Arial Black, Arial"
      >
        N
      </SvgText>
      {/* A — accent, slightly right of centre */}
      <SvgText
        x={cx + size * 0.16}
        y={cy + fontSize * 0.35}
        textAnchor="middle"
        fill={theme.accent}
        fontSize={fontSize}
        fontWeight="900"
        fontFamily="Arial Black, Arial"
      >
        A
      </SvgText>
    </Svg>
  )
}
