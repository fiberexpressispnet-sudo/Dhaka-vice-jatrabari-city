/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef, useState, useCallback } from 'react';
import {
  MotorcycleIcon,
  ExitVehicleIcon,
  SprintIcon,
  JumpIcon,
  PunchIcon,
  AcceleratorIcon,
  BrakeIcon,
  HandbrakeIcon,
  HornIcon,
  HeadlightIcon,
  RecenterIcon,
} from './Icons';
import { VirtualJoystick } from './VirtualJoystick';
import { ActionInput, JoystickInput } from '../types/game';

interface MobileControlsProps {
  isRiding: boolean;
  isNearBike: boolean;
  onMoveChange: (input: JoystickInput) => void;
  onLookChange: (input: JoystickInput) => void;
  onActionChange: (updater: (prev: ActionInput) => ActionInput) => void;
  onEnterExitVehicle: () => void;
  onHorn: () => void;
  onHeadlightToggle: () => void;
  onRecenterCamera: () => void;
  onPunch: () => void;
  joystickSize?: 'small' | 'medium' | 'large';
  opacity?: number;
  joystickSensitivity?: number;
  controlHandedness?: 'right' | 'left';
}

export const MobileControls: React.FC<MobileControlsProps> = ({
  isRiding,
  isNearBike,
  onMoveChange,
  onLookChange,
  onActionChange,
  onEnterExitVehicle,
  onHorn,
  onHeadlightToggle,
  onRecenterCamera,
  onPunch,
  joystickSize = 'medium',
  opacity = 0.9,
  joystickSensitivity = 1.2,
  controlHandedness = 'right',
}) => {
  // Debug visual overlay state for raw X/Y coordinate outputs
  const [moveInputState, setMoveInputState] = useState<JoystickInput>({ x: 0, y: 0, active: false });
  const [lookInputState, setLookInputState] = useState<JoystickInput>({ x: 0, y: 0, active: false });

  const handleMoveInputWrapped = useCallback((input: JoystickInput) => {
    setMoveInputState(input);
    onMoveChange(input);
  }, [onMoveChange]);

  const handleLookInputWrapped = useCallback((input: JoystickInput) => {
    setLookInputState(input);
    onLookChange(input);
  }, [onLookChange]);

  // Swipe-to-look camera tracking on right/upper viewport
  const swipePointerId = useRef<number | null>(null);
  const lastPointerPos = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  const handleSwipePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (swipePointerId.current !== null) return;
    swipePointerId.current = e.pointerId;
    lastPointerPos.current = { x: e.clientX, y: e.clientY };
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handleSwipePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (swipePointerId.current !== e.pointerId) return;
    const dx = e.clientX - lastPointerPos.current.x;
    const dy = e.clientY - lastPointerPos.current.y;
    lastPointerPos.current = { x: e.clientX, y: e.clientY };

    const swipeInput = {
      x: dx * 0.45,
      y: dy * 0.45,
      active: true,
    };
    setLookInputState(swipeInput);
    onLookChange(swipeInput);
  };

  const handleSwipePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (swipePointerId.current !== e.pointerId) return;
    swipePointerId.current = null;
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {
      // Ignored
    }
    const zeroInput = { x: 0, y: 0, active: false };
    setLookInputState(zeroInput);
    onLookChange(zeroInput);
  };

  // Helper for press/release action buttons
  const makePressHandlers = (key: keyof ActionInput, triggerExtra?: () => void) => {
    return {
      onPointerDown: (e: React.PointerEvent) => {
        e.stopPropagation();
        onActionChange(prev => ({ ...prev, [key]: true }));
        if (triggerExtra) triggerExtra();
      },
      onPointerUp: (e: React.PointerEvent) => {
        e.stopPropagation();
        onActionChange(prev => ({ ...prev, [key]: false }));
      },
      onPointerCancel: (e: React.PointerEvent) => {
        e.stopPropagation();
        onActionChange(prev => ({ ...prev, [key]: false }));
      },
    };
  };

  const isRightHanded = controlHandedness === 'right';

  return (
    <div className="absolute inset-0 pointer-events-none select-none z-20 flex flex-col justify-between overflow-hidden">
      
      {/* === TOP-RIGHT SWIPE TO LOOK SCREEN AREA (Full 360 Camera Drag) === */}
      <div
        className="w-full h-2/5 pointer-events-auto cursor-grab active:cursor-grabbing touch-none"
        onPointerDown={handleSwipePointerDown}
        onPointerMove={handleSwipePointerMove}
        onPointerUp={handleSwipePointerUp}
        onPointerCancel={handleSwipePointerUp}
      />

      {/* === DEBUG VISUAL COORDINATE OVERLAY (UI Event Layer vs Engine Processing) === */}
      <div className="absolute top-16 left-1/2 -translate-x-1/2 pointer-events-none bg-slate-950/90 border border-cyan-500/50 rounded-xl px-4 py-2 shadow-2xl backdrop-blur-md flex flex-col gap-1 text-[11px] font-mono text-cyan-300">
        <div className="flex items-center justify-between border-b border-cyan-500/30 pb-1 gap-4">
          <span className="font-bold text-amber-400 uppercase tracking-wider">DEBUG INPUT OVERLAY</span>
          <span className="text-[10px] text-emerald-400">UI EVENT LAYER ACTIVE</span>
        </div>
        <div className="grid grid-cols-2 gap-x-6 gap-y-0.5">
          <div>
            <span className="text-slate-400">Move Joy X:</span> <span className="font-bold text-white">{moveInputState.x.toFixed(2)}</span>
          </div>
          <div>
            <span className="text-slate-400">Move Joy Y:</span> <span className="font-bold text-white">{moveInputState.y.toFixed(2)}</span>
          </div>
          <div>
            <span className="text-slate-400">Look Joy X:</span> <span className="font-bold text-white">{lookInputState.x.toFixed(2)}</span>
          </div>
          <div>
            <span className="text-slate-400">Look Joy Y:</span> <span className="font-bold text-white">{lookInputState.y.toFixed(2)}</span>
          </div>
        </div>
        <div className="text-[9px] text-slate-400 pt-0.5 border-t border-slate-800 flex justify-between">
          <span>Active Move: {String(moveInputState.active)}</span>
          <span>Active Look: {String(lookInputState.active)}</span>
        </div>
      </div>

      {/* === LOWER CONTROL CLUSTER (Joysticks + Pedals / Actions) === */}
      <div className="w-full flex items-end justify-between p-4 md:p-6 pb-6">
        
        {/* === LEFT ZONE: RESPONSIVE VIRTUAL MOVEMENT JOYSTICK === */}
        <div className={`pointer-events-auto flex flex-col items-center gap-2 ${isRightHanded ? 'order-1' : 'order-3'}`}>
          <VirtualJoystick
            type="movement"
            size={joystickSize}
            opacity={opacity}
            sensitivity={joystickSensitivity}
            labelBn={isRiding ? 'স্টিয়ারিং / গতি' : 'চলাচল'}
            labelEn={isRiding ? 'STEER / SPEED' : 'MOVE'}
            onInputChange={handleMoveInputWrapped}
          />
        </div>

        {/* === CENTER UTILITY: RECENTER CAMERA === */}
        <div className="order-2 pointer-events-auto flex items-center gap-3 mb-2">
          <button
            type="button"
            className="touch-zone w-12 h-12 rounded-full bg-slate-900/90 border border-slate-600/80 active:border-cyan-400 active:bg-cyan-950 text-slate-200 flex flex-col items-center justify-center shadow-xl transition-transform active:scale-90"
            onClick={onRecenterCamera}
            title="ক্যামেরা সোজা করুন (Recenter Camera)"
          >
            <RecenterIcon size={20} className="text-cyan-400" />
            <span className="text-[8px] font-bold text-cyan-300">ক্যামেরা</span>
          </button>
        </div>

        {/* === RIGHT ZONE: DYNAMIC ACTION BUTTONS & CAMERA JOYSTICK === */}
        <div className={`pointer-events-auto flex flex-col items-end gap-3 ${isRightHanded ? 'order-3' : 'order-1'}`}>
          
          {/* Camera Look Virtual Joystick */}
          <div className="mb-1">
            <VirtualJoystick
              type="camera"
              size="small"
              opacity={opacity * 0.9}
              labelBn="ক্যামেরা"
              labelEn="LOOK"
              onInputChange={handleLookInputWrapped}
            />
          </div>

          {/* Contextual Action Buttons */}
          {isRiding ? (
            /* =================== DRIVING CONTROLS LAYOUT =================== */
            <div className="flex flex-col items-end gap-2.5">
              {/* Row 1: Horn, Headlight, Exit */}
              <div className="flex items-center gap-2">
                {/* Horn Button */}
                <button
                  type="button"
                  className="touch-zone w-12 h-12 rounded-full bg-amber-500 hover:bg-amber-400 active:bg-amber-600 border-2 border-amber-300 text-slate-950 flex flex-col items-center justify-center font-bold shadow-lg transition-transform active:scale-90"
                  {...makePressHandlers('horn', onHorn)}
                  title="হর্ন (Horn)"
                >
                  <HornIcon size={20} />
                  <span className="text-[8px] leading-tight">হর্ন</span>
                </button>

                {/* Headlight Toggle */}
                <button
                  type="button"
                  className="touch-zone w-12 h-12 rounded-full bg-slate-800/95 active:bg-cyan-600 border border-slate-600 text-yellow-300 flex flex-col items-center justify-center shadow-lg transition-transform active:scale-90"
                  onClick={onHeadlightToggle}
                  title="হেডলাইট (Headlight)"
                >
                  <HeadlightIcon size={20} />
                  <span className="text-[8px] leading-tight text-slate-200">লাইট</span>
                </button>

                {/* Exit Motorcycle Button */}
                <button
                  type="button"
                  className="touch-zone px-3.5 h-12 rounded-full bg-red-600 hover:bg-red-500 active:bg-red-700 border-2 border-red-300 text-white flex items-center gap-1.5 shadow-xl transition-transform active:scale-95"
                  onClick={onEnterExitVehicle}
                  title="বাইক থেকে নামুন (Exit Bike)"
                >
                  <ExitVehicleIcon size={22} />
                  <span className="text-xs font-bold font-bengali">নামুন</span>
                </button>
              </div>

              {/* Row 2: Driving Pedals (Accelerator, Brake, Handbrake) */}
              <div className="flex items-center gap-2.5 mt-1">
                {/* Handbrake / Drift Button */}
                <button
                  type="button"
                  className="touch-zone w-13 h-13 rounded-2xl bg-orange-600 active:bg-orange-700 border-2 border-orange-400 text-white flex flex-col items-center justify-center shadow-lg active:scale-90"
                  {...makePressHandlers('handbrake')}
                  title="হ্যান্ডব্রেক ড্রিফট (Handbrake)"
                >
                  <HandbrakeIcon size={22} />
                  <span className="text-[8px] font-bold">ড্রিফট</span>
                </button>

                {/* Brake / Reverse Pedal */}
                <button
                  type="button"
                  className="touch-zone w-15 h-15 rounded-2xl bg-rose-700 active:bg-rose-800 border-2 border-rose-400 text-white flex flex-col items-center justify-center shadow-xl active:scale-95"
                  {...makePressHandlers('brake')}
                  title="ব্রেক / রিভার্স (Brake / Reverse)"
                >
                  <BrakeIcon size={26} />
                  <span className="text-[10px] font-bold mt-0.5">ব্রেক</span>
                </button>

                {/* Accelerate Gas Pedal */}
                <button
                  type="button"
                  className="touch-zone w-18 h-18 rounded-2xl bg-emerald-600 active:bg-emerald-700 border-2 border-emerald-300 text-white flex flex-col items-center justify-center shadow-2xl active:scale-95"
                  {...makePressHandlers('accelerate')}
                  title="এক্সিলারেটর (Accelerate)"
                >
                  <AcceleratorIcon size={30} />
                  <span className="text-[11px] font-bold mt-0.5 font-bengali">গতি</span>
                </button>
              </div>
            </div>
          ) : (
            /* =================== ON-FOOT CONTROLS LAYOUT =================== */
            <div className="flex flex-col items-end gap-3">
              {/* Prominent Enter Motorcycle Button when near */}
              {isNearBike && (
                <button
                  type="button"
                  className="touch-zone px-4 py-2.5 rounded-full bg-gradient-to-r from-amber-500 to-yellow-500 active:from-amber-600 active:to-yellow-600 text-slate-950 font-bold border-2 border-yellow-200 flex items-center gap-2 shadow-2xl animate-bounce"
                  onClick={onEnterExitVehicle}
                  title="মোটরসাইকেলে উঠুন (Ride Motorcycle)"
                >
                  <MotorcycleIcon size={22} />
                  <span className="text-xs font-bold font-bengali">বাইকে উঠুন</span>
                </button>
              )}

              {/* Action Cluster: Attack, Jump, Sprint */}
              <div className="flex items-center gap-2.5">
                {/* Punch / Attack Button */}
                <button
                  type="button"
                  className="touch-zone w-13 h-13 rounded-full bg-slate-800 active:bg-slate-700 border border-slate-600 text-amber-400 flex flex-col items-center justify-center shadow-lg active:scale-90"
                  onClick={onPunch}
                  title="ঘুষি / অ্যাকশন (Punch / Attack)"
                >
                  <PunchIcon size={22} />
                  <span className="text-[8px] font-bold text-slate-300">অ্যাকশন</span>
                </button>

                {/* Jump Button */}
                <button
                  type="button"
                  className="touch-zone w-15 h-15 rounded-full bg-blue-600 active:bg-blue-700 border-2 border-blue-400 text-white flex flex-col items-center justify-center shadow-xl active:scale-95"
                  {...makePressHandlers('jump')}
                  title="লাফ দিন (Jump)"
                >
                  <JumpIcon size={24} />
                  <span className="text-[10px] font-bold font-bengali">লাফ</span>
                </button>

                {/* Sprint / Run Button */}
                <button
                  type="button"
                  className="touch-zone w-18 h-18 rounded-full bg-emerald-600 active:bg-emerald-700 border-2 border-emerald-300 text-white flex flex-col items-center justify-center shadow-2xl active:scale-95"
                  {...makePressHandlers('sprint')}
                  title="দৌড়ান (Sprint / Run)"
                >
                  <SprintIcon size={28} />
                  <span className="text-[11px] font-bold font-bengali">দৌড়</span>
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
