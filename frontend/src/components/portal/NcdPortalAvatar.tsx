import { useState, useMemo } from 'react'
import { validateAvatarDefinition, type AvatarDefinition } from '@bible-strong/avatar-core'
import { Avatar } from '@bible-strong/avatar-react'
import '@bible-strong/avatar-react/styles.css'

export interface NcdPortalAvatarProps {
  isTyping?: boolean
  isFocused?: boolean
  hasError?: boolean
  isLoading?: boolean
  isSuccess?: boolean
  size?: number
  className?: string
}

// Procedural Avatar Definition adhering to Bible Strong Avatar Lab schema
const rawAvatarDefinition = {
  schema: 'bible-strong/avatar-definition',
  schemaVersion: 1,
  name: 'NCD-Portal-Guardian',
  body: {
    primary: {
      type: 'sphere',
      width: 240,
      height: 240,
      depth: 240,
      roundness: 1,
    },
    nodes: [],
  },
  colors: {
    body: '#111215',
    eyes: '#00d2ff',
  },
  expressions: {
    neutral: {
      head: { x: 0, y: 0, z: 0 },
      eyes: {
        left: { width: 22, height: 50, x: 0, y: -6, angle: 0 },
        right: { width: 22, height: 50, x: 0, y: -6, angle: 0 },
        spacing: 36,
      },
      perspective: 1,
      motion: { eyes: 'none', body: 'none' },
    },
    hover: {
      head: { x: 8, y: -8, z: 5 },
      eyes: {
        left: { width: 26, height: 48, x: 0, y: -8, angle: 7 },
        right: { width: 26, height: 48, x: 0, y: -8, angle: -7 },
        spacing: 38,
      },
      perspective: 1.05,
      motion: { eyes: 'none', body: 'none' },
    },
    typing: {
      head: { x: -16, y: 0, z: 0 },
      eyes: {
        left: { width: 20, height: 42, x: 0, y: 12, angle: 0 },
        right: { width: 20, height: 42, x: 0, y: 12, angle: 0 },
        spacing: 36,
      },
      perspective: 1,
      motion: { eyes: 'none', body: 'none' },
    },
    'typing-active': {
      head: { x: -18, y: 2, z: -1 },
      eyes: {
        left: { width: 22, height: 40, x: 0, y: 14, angle: 0 },
        right: { width: 22, height: 40, x: 0, y: 14, angle: 0 },
        spacing: 36,
      },
      perspective: 1,
      motion: { eyes: 'none', body: 'none' },
    },
    happy: {
      head: { x: 4, y: 0, z: 0 },
      eyes: {
        left: { width: 28, height: 26, x: 0, y: -10, angle: 14 },
        right: { width: 28, height: 26, x: 0, y: -10, angle: -14 },
        spacing: 38,
      },
      perspective: 1.08,
      motion: { eyes: 'none', body: 'none' },
    },
    skeptical: {
      head: { x: -8, y: 12, z: -8 },
      eyes: {
        left: { width: 22, height: 44, x: 0, y: -4, angle: 0 },
        right: { width: 34, height: 16, x: 0, y: -4, angle: 0 },
        spacing: 40,
      },
      perspective: 1,
      motion: { eyes: 'none', body: 'none' },
    },
  },
  expressionOrder: ['neutral', 'hover', 'typing', 'typing-active', 'happy', 'skeptical'],
  animations: {
    idle: {
      playbackMode: 'loop',
      steps: [
        { expression: 'neutral', holdMs: 3200, transitionMs: 350, transition: 'smooth' },
      ],
      blink: {
        enabled: true,
        initialDelayMs: 1500,
        minIntervalMs: 2500,
        maxIntervalMs: 5000,
        durationMs: 180,
      },
    },
    hover: {
      playbackMode: 'loop',
      steps: [
        { expression: 'hover', holdMs: 2800, transitionMs: 250, transition: 'smooth' },
      ],
      blink: {
        enabled: true,
        initialDelayMs: 1000,
        minIntervalMs: 2000,
        maxIntervalMs: 4000,
        durationMs: 180,
      },
    },
    typing: {
      playbackMode: 'loop',
      steps: [
        { expression: 'typing', holdMs: 1400, transitionMs: 200, transition: 'smooth' },
        { expression: 'typing-active', holdMs: 1400, transitionMs: 200, transition: 'smooth' },
      ],
      blink: {
        enabled: true,
        initialDelayMs: 1800,
        minIntervalMs: 3000,
        maxIntervalMs: 5500,
        durationMs: 160,
      },
    },
    happy: {
      playbackMode: 'loop',
      steps: [
        { expression: 'happy', holdMs: 2500, transitionMs: 300, transition: 'smooth' },
      ],
      blink: {
        enabled: true,
        initialDelayMs: 1000,
        minIntervalMs: 2000,
        maxIntervalMs: 4000,
        durationMs: 180,
      },
    },
    error: {
      playbackMode: 'loop',
      steps: [
        { expression: 'skeptical', holdMs: 2500, transitionMs: 300, transition: 'smooth' },
      ],
      blink: {
        enabled: true,
        initialDelayMs: 1000,
        minIntervalMs: 2000,
        maxIntervalMs: 4000,
        durationMs: 180,
      },
    },
  },
  animationOrder: ['idle', 'hover', 'typing', 'happy', 'error'],
}

// Pre-validate avatar definition
const validationResult = validateAvatarDefinition(rawAvatarDefinition)
const validatedDefinition: AvatarDefinition = validationResult.ok
  ? (validationResult.value as AvatarDefinition)
  : (rawAvatarDefinition as unknown as AvatarDefinition)

export function NcdPortalAvatar({
  isTyping = false,
  isFocused = false,
  hasError = false,
  isLoading = false,
  isSuccess = false,
  size = 104,
  className = '',
}: NcdPortalAvatarProps) {
  const [isSelfHovered, setIsSelfHovered] = useState(false)
  const [clickedHappy, setClickedHappy] = useState(false)

  // Determine active animation based on user interaction states
  const activeAnimation = useMemo(() => {
    if (isSuccess || clickedHappy) return 'happy'
    if (hasError) return 'error'
    if (isLoading || isTyping || isFocused) return 'typing'
    if (isSelfHovered) return 'hover'
    return 'idle'
  }, [isSuccess, clickedHappy, hasError, isLoading, isTyping, isFocused, isSelfHovered])

  const handleClick = () => {
    setClickedHappy(true)
    setTimeout(() => setClickedHappy(false), 2400)
  }

  return (
    <div
      className={`relative inline-flex flex-col items-center justify-center select-none cursor-pointer group ${className}`}
      onMouseEnter={() => setIsSelfHovered(true)}
      onMouseLeave={() => setIsSelfHovered(false)}
      onClick={handleClick}
      title="NCD Portal Guardian (Hover atau ketik token untuk berinteraksi)"
    >
      {/* Ambient Radial Glow around Obsidian Head */}
      <div
        className="absolute inset-0 rounded-full bg-cyan-400/10 blur-xl transition-opacity duration-500 pointer-events-none"
        style={{
          opacity: isSelfHovered || isTyping ? 0.7 : 0.25,
          transform: 'scale(1.15)',
        }}
      />

      {/* 3D Procedural SVG Avatar from Bible Strong Avatar Lab */}
      <div className="relative z-10 transition-transform duration-300 ease-out group-hover:scale-105 active:scale-95">
        <Avatar
          definition={validatedDefinition}
          animation={activeAnimation}
          size={size}
          ariaLabel="Avatar Portal Member NCD"
        />
      </div>

      {/* Ground Contact Shadow */}
      <div
        className="h-1.5 rounded-full bg-[#111215]/15 blur-[2px] transition-all duration-300 pointer-events-none mt-1"
        style={{
          width: `${size * 0.55}px`,
          transform: isSelfHovered ? 'scale(0.85)' : 'scale(1)',
          opacity: isSelfHovered ? 0.35 : 0.2,
        }}
      />
    </div>
  )
}

export default NcdPortalAvatar
