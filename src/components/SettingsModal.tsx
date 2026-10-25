/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { CloseIcon, CheckIcon } from './Icons';
import { GameSettings, GraphicsQuality } from '../types/game';

interface SettingsModalProps {
  settings: GameSettings;
  onUpdateSettings: (updater: (prev: GameSettings) => GameSettings) => void;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  settings,
  onUpdateSettings,
  onClose,
}) => {
  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 pointer-events-auto select-none overflow-y-auto">
      <div className="w-full max-w-md bg-slate-900 border border-slate-700/80 rounded-3xl p-6 shadow-2xl flex flex-col gap-5 max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h2 className="font-bengali font-bold text-xl text-amber-400">
            গেম সেটিংস (Settings)
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-full bg-slate-800 text-slate-400 hover:text-white"
          >
            <CloseIcon size={18} />
          </button>
        </div>

        {/* 1. Graphics Presets */}
        <div className="flex flex-col gap-2">
          <label className="text-xs font-bold text-slate-300 font-bengali">
            গ্রাফিক্স কোয়ালিটি (Graphics Quality):
          </label>
          <div className="grid grid-cols-3 gap-2">
            {(['low', 'medium', 'high'] as GraphicsQuality[]).map(q => (
              <button
                key={q}
                type="button"
                onClick={() => onUpdateSettings(prev => ({ ...prev, graphics: q }))}
                className={`py-2 px-3 rounded-xl border font-game font-bold text-xs uppercase flex items-center justify-center gap-1 transition-all ${
                  settings.graphics === q
                    ? 'bg-amber-500/20 border-amber-400 text-amber-300'
                    : 'bg-slate-800/80 border-slate-700 text-slate-400'
                }`}
              >
                {settings.graphics === q && <CheckIcon size={14} />}
                {q === 'low' ? 'Low (30 FPS)' : q === 'medium' ? 'Med (45 FPS)' : 'High (60 FPS)'}
              </button>
            ))}
          </div>
        </div>

        {/* 2. Control Layout & Joystick Size */}
        <div className="flex flex-col gap-3">
          <label className="text-xs font-bold text-slate-300 font-bengali">
            ভার্চুয়াল জয়স্টিক সাইজ (Joystick Size):
          </label>
          <div className="grid grid-cols-3 gap-2">
            {(['small', 'medium', 'large'] as const).map(s => (
              <button
                key={s}
                type="button"
                onClick={() => onUpdateSettings(prev => ({ ...prev, joystickSize: s }))}
                className={`py-2 px-3 rounded-xl border font-bengali font-bold text-xs capitalize flex items-center justify-center gap-1 ${
                  settings.joystickSize === s
                    ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300'
                    : 'bg-slate-800/80 border-slate-700 text-slate-400'
                }`}
              >
                {settings.joystickSize === s && <CheckIcon size={14} />}
                {s === 'small' ? 'ছোট' : s === 'medium' ? 'মাঝারি' : 'বড়'}
              </button>
            ))}
          </div>

          {/* Handedness Layout Toggle */}
          <div className="flex items-center justify-between mt-1">
            <span className="text-xs text-slate-300 font-bengali">কন্ট্রোল বিন্যাস (Layout):</span>
            <div className="flex items-center gap-1 bg-slate-800 p-1 rounded-xl border border-slate-700">
              <button
                type="button"
                onClick={() => onUpdateSettings(prev => ({ ...prev, controlHandedness: 'right' }))}
                className={`px-3 py-1 rounded-lg text-xs font-bold font-bengali ${
                  settings.controlHandedness === 'right' ? 'bg-cyan-600 text-white' : 'text-slate-400'
                }`}
              >
                ডানহাতি
              </button>
              <button
                type="button"
                onClick={() => onUpdateSettings(prev => ({ ...prev, controlHandedness: 'left' }))}
                className={`px-3 py-1 rounded-lg text-xs font-bold font-bengali ${
                  settings.controlHandedness === 'left' ? 'bg-cyan-600 text-white' : 'text-slate-400'
                }`}
              >
                বামহাতি
              </button>
            </div>
          </div>

          {/* Camera Sensitivity Slider */}
          <div className="flex flex-col gap-1 mt-1">
            <div className="flex items-center justify-between text-xs text-slate-300 font-bengali">
              <span>ক্যামেরা সংবেদনশীলতা (Camera Sensitivity):</span>
              <span className="font-game font-bold text-cyan-300">{settings.cameraSensitivity.toFixed(1)}x</span>
            </div>
            <input
              type="range"
              min="0.5"
              max="2.5"
              step="0.1"
              value={settings.cameraSensitivity}
              onChange={e => {
                const val = parseFloat(e.target.value);
                onUpdateSettings(prev => ({ ...prev, cameraSensitivity: val }));
              }}
              className="w-full accent-cyan-400 cursor-pointer"
            />
          </div>

          {/* Joystick Sensitivity Slider */}
          <div className="flex flex-col gap-1 mt-1">
            <div className="flex items-center justify-between text-xs text-slate-300 font-bengali">
              <span>জয়স্টিক রেসপন্স (Joystick Sensitivity):</span>
              <span className="font-game font-bold text-amber-400">{settings.joystickSensitivity.toFixed(1)}x</span>
            </div>
            <input
              type="range"
              min="0.5"
              max="2.0"
              step="0.1"
              value={settings.joystickSensitivity}
              onChange={e => {
                const val = parseFloat(e.target.value);
                onUpdateSettings(prev => ({ ...prev, joystickSensitivity: val }));
              }}
              className="w-full accent-amber-400 cursor-pointer"
            />
          </div>
        </div>

        {/* 3. Audio Volume Sliders */}
        <div className="flex flex-col gap-3 border-t border-slate-800 pt-3">
          {/* SFX Volume */}
          <div className="flex flex-col gap-1">
            <div className="flex items-center justify-between text-xs text-slate-300 font-bengali">
              <span>সাউন্ড এফেক্ট ভলিউম (SFX / Engine / Horn):</span>
              <span className="font-game font-bold text-amber-400">{Math.round(settings.sfxVolume * 100)}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={settings.sfxVolume}
              onChange={e => {
                const val = parseFloat(e.target.value);
                onUpdateSettings(prev => ({ ...prev, sfxVolume: val }));
              }}
              className="w-full accent-amber-400 cursor-pointer"
            />
          </div>

          {/* Radio Music Volume */}
          <div className="flex flex-col gap-1">
            <div className="flex items-center justify-between text-xs text-slate-300 font-bengali">
              <span>রেডিও মিউজিক ভলিউম (Dhaka FM Radio):</span>
              <span className="font-game font-bold text-emerald-400">{Math.round(settings.musicVolume * 100)}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={settings.musicVolume}
              onChange={e => {
                const val = parseFloat(e.target.value);
                onUpdateSettings(prev => ({ ...prev, musicVolume: val }));
              }}
              className="w-full accent-emerald-400 cursor-pointer"
            />
          </div>
        </div>

        {/* Close & Save Button */}
        <button
          type="button"
          onClick={onClose}
          className="touch-zone w-full py-3 rounded-2xl bg-gradient-to-r from-red-600 to-amber-600 text-white font-bold font-bengali flex items-center justify-center gap-2 shadow-xl active:scale-95 transition-transform"
        >
          <CheckIcon size={18} />
          <span>সেভ ও বন্ধ করুন (Save & Close)</span>
        </button>

      </div>
    </div>
  );
};
