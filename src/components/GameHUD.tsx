/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import * as THREE from 'three';
import {
  TakaIcon,
  PauseIcon,
  SettingsIcon,
  SunIcon,
  MoonIcon,
  RadioIcon,
  VolumeHighIcon,
  VolumeMuteIcon,
  MapPinIcon,
} from './Icons';
import { Minimap } from './Minimap';
import { MissionData, PlayerStats } from '../types/game';

interface GameHUDProps {
  stats: PlayerStats;
  mission: MissionData;
  speedKmH: number;
  fps: number;
  isNight: boolean;
  isMuted: boolean;
  radioActive: boolean;
  radioTrackTitle: string;
  isRiding: boolean;
  playerPos: THREE.Vector3;
  playerRotation: number;
  bikePos: THREE.Vector3;
  targetPos: THREE.Vector3 | null;
  onPauseClick: () => void;
  onSettingsClick: () => void;
  onToggleDayNight: () => void;
  onToggleRadio: () => void;
  onNextRadioTrack: () => void;
  onToggleMute: () => void;
}

export const GameHUD: React.FC<GameHUDProps> = ({
  stats,
  mission,
  speedKmH,
  fps,
  isNight,
  isMuted,
  radioActive,
  radioTrackTitle,
  isRiding,
  playerPos,
  playerRotation,
  bikePos,
  targetPos,
  onPauseClick,
  onSettingsClick,
  onToggleDayNight,
  onToggleRadio,
  onNextRadioTrack,
  onToggleMute,
}) => {
  const [isDockCollapsed, setIsDockCollapsed] = useState(false);

  const currentObj = mission.objectives[mission.currentObjectiveIndex];

  return (
    <div className="absolute inset-0 pointer-events-none select-none z-10 flex flex-col justify-between p-3 md:p-5">
      {/* ================= TOP PERIMETER STATUS CLUSTER ================= */}
      <div className="w-full flex items-start justify-between">
        
        {/* Top-Left: Minimap Radar & City Area */}
        <div className="pointer-events-auto flex flex-col items-start gap-1">
          <Minimap
            playerPos={playerPos}
            playerRotation={playerRotation}
            bikePos={bikePos}
            targetPos={targetPos}
            targetTitleBn={currentObj?.titleBn}
            isRiding={isRiding}
          />
          <div className="bg-slate-950/80 border border-slate-700/60 rounded px-2 py-0.5 mt-0.5 text-[10px] font-bold text-slate-300">
            ঢাকা: {isRiding ? 'মিরপুর এক্সপ্রেসওয়ে' : 'মতিঝিল বাণিজ্যিক এলাকা'}
          </div>
        </div>

        {/* Top-Center: Active Mission Tracker Banner */}
        <div className="pointer-events-auto max-w-sm md:max-w-md w-full mx-2 flex flex-col items-center">
          {mission.status === 'active' && currentObj ? (
            <div className="w-full bg-slate-950/90 border-l-4 border-amber-500 border-y border-r border-slate-800 rounded-r-lg p-2 shadow-2xl flex flex-col gap-1">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="text-amber-400 font-bengali flex items-center gap-1">
                  <MapPinIcon size={14} />
                  মিশন: {currentObj.titleBn}
                </span>
                {mission.currentObjectiveIndex === 2 && (
                  <span className="text-rose-400 font-game font-black text-sm tabular-nums">
                    {Math.ceil(mission.timeRemaining)}s
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-300 leading-snug font-bengali">
                {currentObj.descriptionBn}
              </p>
            </div>
          ) : mission.status === 'completed' ? (
            <div className="bg-emerald-950/90 border border-emerald-500 rounded-lg px-4 py-1.5 shadow-2xl text-center">
              <span className="text-xs font-bold text-emerald-300 font-bengali">
                ✓ গুলশান ড্রপ মিশন সম্পন্ন! আপনি এখন অবাধে ঢাকা শহর এক্সপ্লোর করতে পারেন।
              </span>
            </div>
          ) : (
            <div className="bg-slate-950/80 border border-cyan-500/50 rounded-lg px-3 py-1 shadow-lg text-center">
              <span className="text-[11px] font-bold text-cyan-300 font-bengali">
                টং দোকানে বড় ভাই রহিমের কাছে যান মিশন শুরু করতে।
              </span>
            </div>
          )}
        </div>

        {/* Top-Right: Stats Cluster (Money, Reputation, Speed, Pause) */}
        <div className="pointer-events-auto flex flex-col items-end gap-2">
          
          {/* Pause & Settings Row */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="touch-zone w-10 h-10 rounded-xl bg-slate-900/85 hover:bg-slate-800 border border-slate-700 text-slate-200 flex items-center justify-center shadow-lg active:scale-95"
              onClick={onSettingsClick}
              title="সেটিংস (Settings)"
            >
              <SettingsIcon size={18} />
            </button>
            <button
              type="button"
              className="touch-zone w-10 h-10 rounded-xl bg-slate-900/85 hover:bg-slate-800 border border-slate-700 text-slate-200 flex items-center justify-center shadow-lg active:scale-95"
              onClick={onPauseClick}
              title="পজ মেনু (Pause Menu)"
            >
              <PauseIcon size={18} />
            </button>
          </div>

          {/* Money & Reputation Badges */}
          <div className="flex flex-col items-end gap-1">
            {/* Money (BDT ৳) */}
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-950/90 border border-emerald-500/40 shadow-xl">
              <TakaIcon size={16} className="text-emerald-400" />
              <span className="font-game font-bold text-emerald-300 text-sm tabular-nums">
                {stats.money.toLocaleString()}
              </span>
            </div>

            {/* Reputation (সম্মান) */}
            <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg bg-slate-950/80 border border-amber-500/30 text-[10px] text-amber-300 font-bold">
              <span>সম্মান:</span>
              <span className="font-game text-xs">{stats.reputation} REP</span>
            </div>

            {/* Speedometer */}
            <div className="flex items-baseline gap-1 px-3 py-1 rounded-xl bg-slate-950/90 border border-cyan-500/50 shadow-2xl mt-0.5">
              <span className="font-game font-black text-2xl text-cyan-400 tabular-nums leading-none">
                {speedKmH}
              </span>
              <span className="text-[10px] font-bold text-slate-400">কিমি/ঘণ্টা</span>
            </div>

            {/* FPS Indicator */}
            <div className="text-[9px] font-mono text-slate-500 pr-1">
              {fps} FPS
            </div>
          </div>

        </div>
      </div>

      {/* ================= BOTTOM COLLAPSIBLE DOCK (ZERO VIEWPORT OCCLUSION) ================= */}
      <div className="w-full flex flex-col items-center pointer-events-auto">
        
        {/* Toggle Collapse Edge Button */}
        <button
          type="button"
          onClick={() => setIsDockCollapsed(prev => !prev)}
          className="touch-zone px-3 py-0.5 rounded-t-lg bg-slate-900/90 border-t border-x border-slate-700/80 text-[10px] font-bold text-slate-300 hover:text-white transition-all shadow-md"
        >
          {isDockCollapsed ? '▴ কুইক মেনু দেখান' : '▾ মেনু লুকান'}
        </button>

        {/* Dock Container */}
        {!isDockCollapsed && (
          <div className="w-auto max-w-full px-4 py-2 rounded-2xl bg-slate-950/95 border border-slate-800 shadow-2xl flex flex-wrap items-center justify-center gap-2 md:gap-3 text-xs mb-1">
            
            {/* Day / Night Toggle */}
            <button
              type="button"
              onClick={onToggleDayNight}
              className="touch-zone flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-900 border border-slate-700/80 active:bg-slate-800 text-slate-200"
              title="দিন / রাত পরিবর্তন"
            >
              {isNight ? <MoonIcon size={16} className="text-cyan-300" /> : <SunIcon size={16} className="text-amber-400" />}
              <span className="font-bengali font-bold text-[11px]">{isNight ? 'রাত' : 'দিন'}</span>
            </button>

            {/* Dhaka Radio Station Controls */}
            <div className="flex items-center gap-1 bg-slate-900 border border-slate-700/80 rounded-xl px-2 py-1">
              <button
                type="button"
                onClick={onToggleRadio}
                className={`touch-zone p-1 rounded-lg ${radioActive ? 'text-emerald-400 bg-emerald-950/60' : 'text-slate-400'}`}
                title="রেডিও চালু / বন্ধ"
              >
                <RadioIcon size={16} />
              </button>
              <button
                type="button"
                onClick={onNextRadioTrack}
                className="touch-zone font-bengali font-bold text-[11px] text-slate-200 hover:text-cyan-300 px-1 truncate max-w-[120px]"
                title="পরবর্তী গান"
              >
                {radioActive ? radioTrackTitle : 'রেডিও অফ'}
              </button>
            </div>

            {/* Audio Mute Toggle */}
            <button
              type="button"
              onClick={onToggleMute}
              className="touch-zone flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-900 border border-slate-700/80 active:bg-slate-800 text-slate-200"
              title="মিউট / আনমিউট"
            >
              {isMuted ? <VolumeMuteIcon size={16} className="text-rose-400" /> : <VolumeHighIcon size={16} className="text-emerald-400" />}
            </button>

          </div>
        )}

      </div>
    </div>
  );
};
