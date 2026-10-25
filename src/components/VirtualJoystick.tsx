/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef, useState, useCallback, useEffect } from 'react';
import { JoystickInput } from '../types/game';

interface VirtualJoystickProps {
  type: 'movement' | 'camera';
  size?: 'small' | 'medium' | 'large';
  opacity?: number;
  sensitivity?: number;
  labelBn: string;
  labelEn: string;
  onInputChange: (input: JoystickInput) => void;
  className?: string;
}

export const VirtualJoystick: React.FC<VirtualJoystickProps> = ({
  type,
  size = 'medium',
  opacity = 0.9,
  sensitivity = 1.2,
  labelBn,
  labelEn,
  onInputChange,
  className = '',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const activePointerIdRef = useRef<number | null>(null);
  const originPosRef = useRef<{ x: number; y: number } | null>(null);
  
  const [knobPos, setKnobPos] = useState({ x: 0, y: 0 });
  const [isActive, setIsActive] = useState(false);

  // Dimensions based on size preset
  const baseRadius = size === 'small' ? 56 : size === 'large' ? 84 : 70;
  const knobRadius = size === 'small' ? 24 : size === 'large' ? 36 : 30;
  const diameter = baseRadius * 2;

  // Process pointer position relative to center/origin with configurable sensitivity curve & deadzone
  const processPointer = useCallback(
    (clientX: number, clientY: number) => {
      let centerX = 0;
      let centerY = 0;

      if (originPosRef.current) {
        centerX = originPosRef.current.x;
        centerY = originPosRef.current.y;
      } else if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        centerX = rect.left + rect.width / 2;
        centerY = rect.top + rect.height / 2;
      }

      let dx = clientX - centerX;
      let dy = clientY - centerY;
      const dist = Math.hypot(dx, dy);

      // Configurable dead-zone (e.g. 6px) to prevent drift and provide crisp idle state
      const deadZone = 6;
      if (dist < deadZone) {
        dx = 0;
        dy = 0;
        setKnobPos({ x: 0, y: 0 });
        onInputChange({ x: 0, y: 0, active: false });
        return;
      }

      if (dist > baseRadius) {
        dx = (dx / dist) * baseRadius;
        dy = (dy / dist) * baseRadius;
      }

      setKnobPos({ x: dx, y: dy });

      // Normalized analog input (-1 to 1) modulated by sensitivity curve for zero input lag
      const rawX = dx / baseRadius;
      const rawY = -(dy / baseRadius);

      // Non-linear response curve (cubic shaping for fine precision near center & max speed at edge)
      const sens = Math.max(0.5, Math.min(2.0, sensitivity));
      const magnitude = Math.min(1.0, Math.hypot(rawX, rawY) * sens);
      const angle = Math.atan2(rawY, rawX);

      const shapedMag = Math.pow(magnitude, 0.85); // slightly aggressive curve for instant responsiveness
      const finalX = Math.cos(angle) * shapedMag;
      const finalY = Math.sin(angle) * shapedMag;

      onInputChange({
        x: Math.max(-1, Math.min(1, finalX)),
        y: Math.max(-1, Math.min(1, finalY)),
        active: true,
      });
    },
    [baseRadius, sensitivity, onInputChange]
  );

  const resetJoystick = useCallback(() => {
    activePointerIdRef.current = null;
    originPosRef.current = null;
    setIsActive(false);
    setKnobPos({ x: 0, y: 0 });
    onInputChange({ x: 0, y: 0, active: false });
  }, [onInputChange]);

  // Pointer Events API: Native cross-platform capture for Android, iOS, and Desktop
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (activePointerIdRef.current !== null) return;

    activePointerIdRef.current = e.pointerId;
    e.currentTarget.setPointerCapture(e.pointerId);

    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      originPosRef.current = {
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2,
      };
    }

    setIsActive(true);
    processPointer(e.clientX, e.clientY);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (activePointerIdRef.current !== e.pointerId) return;
    e.preventDefault();
    processPointer(e.clientX, e.clientY);
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (activePointerIdRef.current !== e.pointerId) return;
    e.preventDefault();
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {
      // Ignored if already released
    }
    resetJoystick();
  };

  useEffect(() => {
    return () => {
      resetJoystick();
    };
  }, [resetJoystick]);

  return (
    <div
      ref={containerRef}
      className={`touch-zone relative select-none flex items-center justify-center cursor-grab active:cursor-grabbing ${className}`}
      style={{
        width: `${diameter + 24}px`,
        height: `${diameter + 24}px`,
        opacity: opacity,
        touchAction: 'none',
      }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
    >
      {/* Outer Glow Halo when Active */}
      <div
        className={`absolute rounded-full transition-opacity duration-150 pointer-events-none ${
          isActive ? 'opacity-100' : 'opacity-0'
        }`}
        style={{
          width: `${diameter + 16}px`,
          height: `${diameter + 16}px`,
          background: 'radial-gradient(circle, rgba(56, 189, 248, 0.25) 0%, rgba(56, 189, 248, 0) 70%)',
        }}
      />

      {/* SVG Joystick Base Graphic */}
      <svg
        width={diameter}
        height={diameter}
        viewBox={`0 0 ${diameter} ${diameter}`}
        className="absolute pointer-events-none drop-shadow-xl"
      >
        <defs>
          <radialGradient id={`base-grad-${type}`} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#0f172a" stopOpacity="0.85" />
            <stop offset="85%" stopColor="#090d16" stopOpacity="0.95" />
            <stop offset="100%" stopColor="#020617" stopOpacity="1" />
          </radialGradient>
        </defs>

        {/* Base Circle */}
        <circle
          cx={baseRadius}
          cy={baseRadius}
          r={baseRadius - 2}
          fill={`url(#base-grad-${type})`}
          stroke={isActive ? '#38bdf8' : 'rgba(255, 255, 255, 0.35)'}
          strokeWidth={isActive ? '3.5' : '2.5'}
        />

        {/* Inner concentric boundary ring */}
        <circle
          cx={baseRadius}
          cy={baseRadius}
          r={baseRadius * 0.58}
          fill="none"
          stroke={isActive ? 'rgba(56, 189, 248, 0.4)' : 'rgba(255, 255, 255, 0.15)'}
          strokeWidth="1.5"
          strokeDasharray="4 4"
        />

        {/* Cardinal Directional Guides */}
        {type === 'movement' ? (
          <>
            <polygon
              points={`${baseRadius},${6} ${baseRadius - 5},${14} ${baseRadius + 5},${14}`}
              fill={isActive && knobPos.y < -15 ? '#38bdf8' : 'rgba(255,255,255,0.4)'}
            />
            <polygon
              points={`${baseRadius},${diameter - 6} ${baseRadius - 5},${diameter - 14} ${baseRadius + 5},${diameter - 14}`}
              fill={isActive && knobPos.y > 15 ? '#38bdf8' : 'rgba(255,255,255,0.4)'}
            />
            <polygon
              points={`${6},${baseRadius} ${14},${baseRadius - 5} ${14},${baseRadius + 5}`}
              fill={isActive && knobPos.x < -15 ? '#38bdf8' : 'rgba(255,255,255,0.4)'}
            />
            <polygon
              points={`${diameter - 6},${baseRadius} ${diameter - 14},${baseRadius - 5} ${diameter - 14},${baseRadius + 5}`}
              fill={isActive && knobPos.x > 15 ? '#38bdf8' : 'rgba(255,255,255,0.4)'}
            />
          </>
        ) : (
          <path
            d={`M ${baseRadius - 18} ${baseRadius} A 18 18 0 0 1 ${baseRadius + 18} ${baseRadius}`}
            fill="none"
            stroke={isActive ? '#38bdf8' : 'rgba(56, 189, 248, 0.4)'}
            strokeWidth="2.5"
          />
        )}
      </svg>

      {/* Movable High-Contrast SVG Joystick Knob */}
      <div
        className="absolute pointer-events-none flex items-center justify-center drop-shadow-2xl transition-transform duration-75"
        style={{
          width: `${knobRadius * 2}px`,
          height: `${knobRadius * 2}px`,
          transform: `translate3d(${knobPos.x}px, ${knobPos.y}px, 0)`,
        }}
      >
        <svg width={knobRadius * 2} height={knobRadius * 2} viewBox={`0 0 ${knobRadius * 2} ${knobRadius * 2}`}>
          <defs>
            <radialGradient id={`knob-grad-${type}`} cx="35%" cy="30%" r="70%">
              <stop offset="0%" stopColor={isActive ? '#7dd3fc' : '#ffffff'} />
              <stop offset="60%" stopColor={isActive ? '#0284c7' : '#94a3b8'} />
              <stop offset="100%" stopColor={isActive ? '#0369a1' : '#475569'} />
            </radialGradient>
          </defs>
          <circle
            cx={knobRadius}
            cy={knobRadius}
            r={knobRadius - 2}
            fill={`url(#knob-grad-${type})`}
            stroke="#ffffff"
            strokeWidth="2.5"
          />
          {/* Thumb grip center texture */}
          <circle cx={knobRadius} cy={knobRadius} r="5" fill="#ffffff" fillOpacity="0.85" />
          <circle cx={knobRadius} cy={knobRadius} r="2" fill="#0284c7" />
        </svg>
      </div>

      {/* Label Badge below */}
      <div className="absolute -bottom-5 text-center pointer-events-none select-none">
        <span
          className={`text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded-full border transition-colors ${
            isActive
              ? 'text-white bg-cyan-600 border-cyan-400 drop-shadow-[0_0_8px_rgba(56,189,248,0.8)]'
              : 'text-cyan-200 bg-slate-900/90 border-cyan-500/30'
          }`}
        >
          {labelBn}
        </span>
      </div>
    </div>
  );
};
