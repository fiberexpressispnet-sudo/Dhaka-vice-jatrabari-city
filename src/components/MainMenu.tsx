/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  PlayIcon,
  SettingsIcon,
  MotorcycleIcon,
  MapPinIcon,
  CompassIcon,
  TakaIcon,
} from './Icons';
import { GraphicsQuality } from '../types/game';

interface MainMenuProps {
  onStartGame: (quality: GraphicsQuality) => void;
  hasSavedGame: boolean;
  onContinueGame: () => void;
  onOpenSettings: () => void;
}

export const MainMenu: React.FC<MainMenuProps> = ({
  onStartGame,
  hasSavedGame,
  onContinueGame,
  onOpenSettings,
}) => {
  const [selectedQuality, setSelectedQuality] = useState<GraphicsQuality>('high');
  const [activePreviewPanel, setActivePreviewPanel] = useState<number>(0);

  const previewPanels = [
    {
      titleBn: 'মোটরসাইকেল রাইডিং',
      titleEn: 'Motorcycle Riding',
      descBn: 'ঢাকার রাজপথে ১৫০সিসি স্পোর্টস বাইক নিয়ে হাই-স্পিড ড্রাইভ করুন',
      bgGradient: 'from-amber-950/80 via-slate-900/90 to-slate-950',
      badge: 'ড্রাইভিং',
    },
    {
      titleBn: 'স্পোর্টস কার ড্রাইভ',
      titleEn: 'Sports Car Driving',
      descBn: 'আধুনিক এক্সপ্রেসওয়েতে লাক্সারি স্পোর্টস কার ও ট্রাফিক ওভারটেক',
      bgGradient: 'from-blue-950/80 via-slate-900/90 to-slate-950',
      badge: 'স্পিড',
    },
    {
      titleBn: 'পুরান ঢাকার গলি',
      titleEn: 'Old Dhaka Exploration',
      descBn: 'রিকশা, সিএনজি, লোকাল দোকান ও ঐতিহাসিক প্রাচীন স্থাপত্য',
      bgGradient: 'from-emerald-950/80 via-slate-900/90 to-slate-950',
      badge: 'ওপেন ওয়ার্ল্ড',
    },
    {
      titleBn: 'এমজে সিন্ডিকেট স্টোরি',
      titleEn: 'MJ Syndicate Story',
      descBn: 'গ্যাং লিডার ও রহস্যময় চরিত্রের সাথে সিনেমাটিক ডায়লগ ও মিশন',
      bgGradient: 'from-purple-950/80 via-slate-900/90 to-slate-950',
      badge: 'স্টোরি মোড',
    },
    {
      titleBn: 'অ্যাকশন ও ফাইট',
      titleEn: 'Action & Combat',
      descBn: 'শত্রু গ্যাং ও পুলিশ এনকাউন্টার, কৌশলগত ডিফেন্স ও মিশন',
      bgGradient: 'from-rose-950/80 via-slate-900/90 to-slate-950',
      badge: 'অ্যাকশন',
    },
    {
      titleBn: 'রাতের ঢাকা স্কাইল্যান্ড',
      titleEn: 'Nighttime Dhaka',
      descBn: 'মেট্রো লাইট, ব্রীজ, ওয়াটার রিফ্লেকশন ও ডাইনামিক নাইট মোড',
      bgGradient: 'from-indigo-950/80 via-slate-900/90 to-slate-950',
      badge: 'ভিজ্যুয়াল',
    },
  ];

  return (
    <div className="absolute inset-0 z-30 flex flex-col justify-between p-4 md:p-8 bg-slate-950 overflow-y-auto pointer-events-auto select-none">
      
      {/* Top Header Bar */}
      <div className="w-full flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-red-600 flex items-center justify-center shadow-lg shadow-red-600/30">
            <MotorcycleIcon size={22} className="text-white" />
          </div>
          <div>
            <div className="font-game font-black text-lg md:text-xl text-white tracking-wider flex items-center gap-2">
              DHAKA <span className="text-red-500">VICE</span> <span className="text-xs px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 border border-amber-500/40">MJ SYNDICATE</span>
            </div>
            <div className="text-xs font-bengali text-slate-400">
              "ঢাকা এখন তোমার, শহর তোমার নিয়মে"
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-xs text-slate-300 font-mono">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>URP 3D ENGINE • 60 FPS</span>
          </div>
          <button
            type="button"
            onClick={onOpenSettings}
            className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 font-bold text-xs flex items-center gap-2 shadow-lg active:scale-95 transition-all"
          >
            <SettingsIcon size={16} />
            <span className="font-bengali">সেটিংস</span>
          </button>
        </div>
      </div>

      {/* Main Hero & Content Showcase Grid */}
      <div className="my-6 grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">
        
        {/* Left Column: Title, Tagline & Start Actions */}
        <div className="lg:col-span-1 flex flex-col gap-5">
          <div className="bg-gradient-to-br from-slate-900/90 to-slate-900/50 p-6 rounded-2xl border border-slate-800 shadow-2xl relative overflow-hidden">
            <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-red-600/10 rounded-full blur-2xl pointer-events-none" />
            
            <span className="text-xs font-bold uppercase tracking-wider text-red-500 font-game mb-1 block">
              ANDROID OPEN-WORLD AAA GAME
            </span>
            <h1 className="font-game font-black text-3xl md:text-5xl text-white italic tracking-tight mb-2">
              DHAKA <span className="text-red-600">VICE</span>
            </h1>
            <div className="text-amber-400 font-bengali font-bold text-lg mb-3">
              এমজে সিন্ডিকেট
            </div>

            <p className="text-xs md:text-sm font-bengali text-slate-300 leading-relaxed mb-6">
              ঢাকার বাস্তবসম্মত ৩ডি ওপেন ওয়ার্ল্ডে প্রবেশ করুন। হাই-স্পিড মোটরসাইকেল রাইডিং, ট্রাফিক এভয়েডেন্স, গ্যাং মিশন এবং পুরান ঢাকা থেকে গুলশান পর্যন্ত অবাধ এক্সপ্লোরেশন।
            </p>

            {/* Graphics Preset Selection */}
            <div className="mb-6">
              <label className="block text-xs font-bengali font-bold text-slate-400 mb-2">
                গ্রাফিক্স কোয়ালিটি নির্বাচন করুন
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['low', 'medium', 'high'] as GraphicsQuality[]).map((q) => (
                  <button
                    key={q}
                    type="button"
                    onClick={() => setSelectedQuality(q)}
                    className={`py-2 rounded-xl text-xs font-bold font-bengali border transition-all ${
                      selectedQuality === q
                        ? 'bg-red-600 text-white border-red-500 shadow-lg shadow-red-600/30'
                        : 'bg-slate-950/60 text-slate-400 border-slate-800 hover:bg-slate-800'
                    }`}
                  >
                    {q === 'low' ? 'লো (Low)' : q === 'medium' ? 'মিডিয়াম (Med)' : 'হাই (High)'}
                  </button>
                ))}
              </div>
            </div>

            {/* Action Start Buttons */}
            <div className="flex flex-col gap-3">
              {hasSavedGame && (
                <button
                  type="button"
                  onClick={onContinueGame}
                  className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-amber-600 to-red-600 hover:from-amber-500 hover:to-red-500 text-white font-bold font-bengali text-sm shadow-xl flex items-center justify-center gap-2 active:scale-95 transition-transform"
                >
                  <PlayIcon size={18} />
                  <span>খেলা চালিয়ে যান (Continue)</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => onStartGame(selectedQuality)}
                className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-red-600 via-rose-600 to-amber-600 hover:opacity-95 text-white font-bold font-bengali text-sm shadow-2xl shadow-red-600/40 flex items-center justify-center gap-2 active:scale-95 transition-transform"
              >
                <PlayIcon size={18} />
                <span>{hasSavedGame ? 'নতুন গেম শুরু করুন' : 'গেম শুরু করুন (Start Game)'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: 6-Panel Interactive Preview Showcase */}
        <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {previewPanels.map((panel, idx) => (
            <div
              key={idx}
              onClick={() => setActivePreviewPanel(idx)}
              className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between bg-gradient-to-b ${panel.bgGradient} ${
                activePreviewPanel === idx
                  ? 'border-red-500 shadow-xl shadow-red-600/20 scale-[1.02]'
                  : 'border-slate-800/80 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold font-bengali bg-red-500/20 text-red-400 border border-red-500/30">
                  {panel.badge}
                </span>
                <span className="text-xs font-mono text-slate-500">0{idx + 1}</span>
              </div>

              <div>
                <h3 className="font-bengali font-bold text-white text-base mb-1">
                  {panel.titleBn}
                </h3>
                <p className="font-bengali text-xs text-slate-300 leading-relaxed">
                  {panel.descBn}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800/60 flex items-center justify-between text-[11px] text-cyan-400 font-bengali font-bold">
                <span>বিস্তারিত দেখুন</span>
                <span>→</span>
              </div>
            </div>
          ))}
        </div>

      </div>

      {/* Bottom Footer HUD Preview Feature Bar */}
      <div className="w-full pt-4 border-t border-slate-800/80 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-400 font-bengali">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-cyan-400" />
            <span>সম্পূর্ণ বাংলা ইউআই</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span>স্মার্ট টাচ কন্ট্রোল ও জয়স্টিক</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-400" />
            <span>রিয়েলিস্টিক ভেহিকল ফিজিক্স</span>
          </div>
        </div>

        <div className="font-mono text-[11px] text-slate-500">
          DHAKA VICE: MJ SYNDICATE © 2026 ANDROID URP
        </div>
      </div>

    </div>
  );
};
