/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { GameHUD } from './components/GameHUD';
import { MainMenu } from './components/MainMenu';
import { MissionModal } from './components/MissionModal';
import { MobileControls } from './components/MobileControls';
import { PauseMenu } from './components/PauseMenu';
import { SettingsModal } from './components/SettingsModal';
import { sounds } from './game/audio/SoundManager';
import { GameEngine } from './game/GameEngine';
import { SaveSystem } from './game/SaveSystem';
import { ActionInput, GameScreen, GameSettings, JoystickInput, MissionData, PlayerStats } from './types/game';

export default function App() {
  const canvasMountRef = useRef<HTMLDivElement>(null);
  const engineRef = useRef<GameEngine | null>(null);

  // Load Saved Game & Preferences
  const [saveData] = useState(() => SaveSystem.load());
  const [stats, setStats] = useState<PlayerStats>(saveData.stats);
  const [settings, setSettings] = useState<GameSettings>(saveData.settings);
  const [hasSavedGame, setHasSavedGame] = useState(saveData.hasSavedGame);

  // Screens
  const [currentScreen, setCurrentScreen] = useState<GameScreen>('title');
  const [prevScreen, setPrevScreen] = useState<GameScreen>('title');

  // Live HUD States
  const [fps, setFps] = useState(60);
  const [speedKmH, setSpeedKmH] = useState(0);
  const [isNearBike, setIsNearBike] = useState(false);
  const [isRiding, setIsRiding] = useState(false);
  const [isNight, setIsNight] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [radioActive, setRadioActive] = useState(false);
  const [radioTrackTitle, setRadioTrackTitle] = useState('রেডিও ঢাকা ৯৮.৪ FM');

  // Coordinates for radar
  const [playerPos, setPlayerPos] = useState<THREE.Vector3>(new THREE.Vector3(12, 0, 72));
  const [playerRotation, setPlayerRotation] = useState(0);
  const [bikePos, setBikePos] = useState<THREE.Vector3>(new THREE.Vector3(14, 0, 72));
  const [targetPos, setTargetPos] = useState<THREE.Vector3 | null>(new THREE.Vector3(18, 0, 80));

  // Mission
  const [mission, setMission] = useState<MissionData>(() => ({
    id: 'm1_gulshan_drop',
    nameBn: 'MJ সিন্ডিকেট: গুলশান ড্রপ',
    nameEn: 'MJ Syndicate: Gulshan Drop',
    synopsisBn: 'মতিঝিল গোডাউন থেকে সিন্ডিকেটের গোপন ডেটা ড্রাইভ উদ্ধার করে দ্রুত গুলশান সেফহাউসে পৌঁছে দিন।',
    synopsisEn: 'Retrieve the Syndicate confidential data drive from Motijheel warehouse and deliver it to Gulshan Safehouse.',
    rewardMoney: 50000,
    rewardReputation: 350,
    status: 'inactive',
    timeRemaining: 140,
    currentObjectiveIndex: 0,
    objectives: [
      {
        id: 'obj_meet_rahim',
        titleBn: 'বড় ভাই রহিমের সাথে দেখা করুন',
        titleEn: 'Meet Boss Rahim at Motijheel Tong Stall',
        descriptionBn: 'মতিঝিল টং দোকানে রহিম ভাইয়ের সাথে কথা বলে মিশনের বিস্তারিত জানুন।',
        descriptionEn: 'Speak to Boss Rahim at the roadside Tong stall to receive the mission briefing.',
        targetPosition: [18, 0, 80],
        targetRadius: 4.5,
        isCompleted: false,
      },
      {
        id: 'obj_retrieve_drive',
        titleBn: 'গোডাউন ৪ থেকে ডেটা ড্রাইভটি নিন',
        titleEn: 'Retrieve Secret Drive from Warehouse 4',
        descriptionBn: 'মোটরসাইকেলে চেপে মতিঝিল শিল্প এলাকার ৪ নং গোডাউন থেকে ড্রাইভটি সংগ্রহ করুন।',
        descriptionEn: 'Drive your motorcycle to Warehouse 4 in Motijheel and pick up the Syndicate flash drive.',
        targetPosition: [95, 0, 125],
        targetRadius: 5.5,
        isCompleted: false,
      },
      {
        id: 'obj_deliver_gulshan',
        titleBn: 'ফ্লাইওভার দিয়ে গুলশান সেফহাউসে ড্রপ করুন',
        titleEn: 'Deliver Drive to Gulshan Safehouse via Flyover',
        descriptionBn: 'শত্রুপক্ষ আসার আগেই এলিভেটেড ফ্লাইওভার ব্যবহার করে গুলশান সেফহাউসে নিরাপদে পৌঁছান!',
        descriptionEn: 'Escape via the elevated flyover and reach the Gulshan Safehouse before time expires!',
        targetPosition: [-85, 0, -110],
        targetRadius: 6.5,
        timeLimitSeconds: 120,
        isCompleted: false,
      },
    ],
  }));

  // Initialize Game Engine Once
  useEffect(() => {
    if (!canvasMountRef.current) return;

    const engine = new GameEngine(canvasMountRef.current, settings.graphics);
    engineRef.current = engine;

    // Callbacks
    engine.onFpsUpdate = setFps;
    engine.onSpeedUpdate = setSpeedKmH;
    engine.onVehicleProximity = setIsNearBike;

    // Mission Listeners
    engine.missionManager.onMissionStateChange = newMission => {
      setMission({ ...newMission });
      if (newMission.status === 'completed') {
        setCurrentScreen('mission_success');
      } else if (newMission.status === 'failed') {
        setCurrentScreen('mission_briefing');
      }
    };

    engine.missionManager.onMissionSuccess = (rewardMoney, rewardRep) => {
      setStats(prev => {
        const next = {
          ...prev,
          money: prev.money + rewardMoney,
          reputation: prev.reputation + rewardRep,
          unlockedBikePaint: 'gold',
          missionsCompleted: prev.missionsCompleted + 1,
        };
        SaveSystem.save(next, settings);
        return next;
      });
      // Apply gold bike paint
      engine.motorcycle.setPaintColor(0xfacc15);
    };

    // Radar coordinate tracking interval (100ms)
    const coordInterval = window.setInterval(() => {
      if (!engineRef.current) return;
      const eng = engineRef.current;
      setPlayerPos(eng.player.position.clone());
      setPlayerRotation(eng.cameraYaw);
      setBikePos(eng.motorcycle.position.clone());
      setIsRiding(eng.player.isRiding);

      const currObj = eng.missionManager.getCurrentObjective();
      if (currObj) {
        setTargetPos(new THREE.Vector3(...currObj.targetPosition));
      } else {
        setTargetPos(null);
      }
    }, 100);

    return () => {
      clearInterval(coordInterval);
      engine.dispose();
      engineRef.current = null;
    };
  }, []);

  // Update engine when settings change
  useEffect(() => {
    if (engineRef.current) {
      engineRef.current.setQuality(settings.graphics);
      engineRef.current.cameraSensitivity = settings.cameraSensitivity;
    }
    sounds.setSfxVolume(settings.sfxVolume);
    sounds.setMusicVolume(settings.musicVolume);
    SaveSystem.save(stats, settings);
  }, [settings, stats]);

  // Touch & Joystick Input Handlers
  const handleMoveChange = useCallback((input: JoystickInput) => {
    if (engineRef.current) {
      engineRef.current.moveInput = input;
    }
  }, []);

  const handleLookChange = useCallback((input: JoystickInput) => {
    if (engineRef.current) {
      engineRef.current.lookInput = input;
    }
  }, []);

  const handleActionChange = useCallback((updater: (prev: ActionInput) => ActionInput) => {
    if (engineRef.current) {
      engineRef.current.actionInput = updater(engineRef.current.actionInput);
    }
  }, []);

  const handleEnterExitVehicle = useCallback(() => {
    if (engineRef.current) {
      engineRef.current.triggerEnterExitVehicle();
      setIsRiding(engineRef.current.player.isRiding);
    }
  }, []);

  const handleHorn = useCallback(() => {
    if (engineRef.current) {
      engineRef.current.triggerHorn();
    }
  }, []);

  const handleHeadlightToggle = useCallback(() => {
    if (engineRef.current) {
      engineRef.current.motorcycle.toggleHeadlight();
    }
  }, []);

  const handleRecenterCamera = useCallback(() => {
    if (engineRef.current) {
      engineRef.current.recenterCamera();
    }
  }, []);

  const handlePunch = useCallback(() => {
    if (engineRef.current) {
      engineRef.current.player.triggerAttack();
    }
  }, []);

  // Menu Handlers
  const handleStartNewGame = () => {
    sounds.playClick();
    if (engineRef.current) {
      engineRef.current.player.respawn(new THREE.Vector3(12, 0, 72));
      engineRef.current.motorcycle.resetPosition(new THREE.Vector3(14, 0, 72));
      engineRef.current.missionManager.restartMission();
    }
    setHasSavedGame(true);
    setCurrentScreen('playing');
  };

  const handleContinueGame = () => {
    sounds.playClick();
    if (engineRef.current && mission.status === 'inactive') {
      engineRef.current.missionManager.startMission();
    }
    setCurrentScreen('playing');
  };

  const handlePauseGame = () => {
    sounds.playClick();
    if (engineRef.current) {
      engineRef.current.pause(true);
    }
    setPrevScreen(currentScreen);
    setCurrentScreen('paused');
  };

  const handleResumeGame = () => {
    sounds.playClick();
    if (engineRef.current) {
      engineRef.current.pause(false);
    }
    setCurrentScreen('playing');
  };

  const handleRestartMission = () => {
    sounds.playClick();
    if (engineRef.current) {
      engineRef.current.pause(false);
      engineRef.current.missionManager.restartMission();
    }
    setCurrentScreen('playing');
  };

  const handleUnstuckPlayer = () => {
    sounds.playClick();
    if (engineRef.current) {
      engineRef.current.player.respawn(new THREE.Vector3(12, 0, 72));
      engineRef.current.motorcycle.resetPosition(new THREE.Vector3(14, 0, 72));
      engineRef.current.pause(false);
    }
    setCurrentScreen('playing');
  };

  const handleOpenSettings = () => {
    sounds.playClick();
    setPrevScreen(currentScreen);
    setCurrentScreen('settings');
  };

  const handleCloseSettings = () => {
    sounds.playClick();
    setCurrentScreen(prevScreen === 'settings' ? 'playing' : prevScreen);
  };

  const handleQuitToTitle = () => {
    sounds.playClick();
    if (engineRef.current) {
      engineRef.current.pause(false);
    }
    setCurrentScreen('title');
  };

  // Day/Night & Radio
  const handleToggleDayNight = () => {
    if (engineRef.current) {
      const nightState = engineRef.current.toggleDayNight();
      setIsNight(nightState);
    }
  };

  const handleToggleRadio = () => {
    const active = sounds.toggleRadio();
    setRadioActive(active);
    setRadioTrackTitle(sounds.getRadioTrack().titleBn);
  };

  const handleNextRadioTrack = () => {
    sounds.nextRadioTrack();
    setRadioActive(sounds.isRadioActive());
    setRadioTrackTitle(sounds.getRadioTrack().titleBn);
  };

  const handleToggleMute = () => {
    const nextMute = !isMuted;
    setIsMuted(nextMute);
    sounds.setMuted(nextMute);
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-black select-none touch-none">
      
      {/* Isolated Three.js WebGL Mount Container */}
      <div ref={canvasMountRef} className="absolute inset-0 z-0 pointer-events-auto" />

      {/* Title Screen */}
      {currentScreen === 'title' && (
        <MainMenu
          onStartGame={handleStartNewGame}
          onContinueGame={handleContinueGame}
          hasSavedGame={hasSavedGame}
          onOpenSettings={handleOpenSettings}
        />
      )}

      {/* Active Game HUD (Minimap, Speedometer, Cash, Radio) */}
      {(currentScreen === 'playing' || currentScreen === 'paused') && (
        <GameHUD
          stats={stats}
          mission={mission}
          speedKmH={speedKmH}
          fps={fps}
          isNight={isNight}
          isMuted={isMuted}
          radioActive={radioActive}
          radioTrackTitle={radioTrackTitle}
          isRiding={isRiding}
          playerPos={playerPos}
          playerRotation={playerRotation}
          bikePos={bikePos}
          targetPos={targetPos}
          onPauseClick={handlePauseGame}
          onSettingsClick={handleOpenSettings}
          onToggleDayNight={handleToggleDayNight}
          onToggleRadio={handleToggleRadio}
          onNextRadioTrack={handleNextRadioTrack}
          onToggleMute={handleToggleMute}
        />
      )}

      {/* Mobile Virtual Joysticks & Contextual Controls */}
      {currentScreen === 'playing' && (
        <MobileControls
          isRiding={isRiding}
          isNearBike={isNearBike}
          onMoveChange={handleMoveChange}
          onLookChange={handleLookChange}
          onActionChange={handleActionChange}
          onEnterExitVehicle={handleEnterExitVehicle}
          onHorn={handleHorn}
          onHeadlightToggle={handleHeadlightToggle}
          onRecenterCamera={handleRecenterCamera}
          onPunch={handlePunch}
          joystickSize={settings.joystickSize}
          opacity={settings.joystickOpacity}
          joystickSensitivity={settings.joystickSensitivity}
          controlHandedness={settings.controlHandedness}
        />
      )}

      {/* Pause Menu Modal */}
      {currentScreen === 'paused' && (
        <PauseMenu
          onResume={handleResumeGame}
          onRestartMission={handleRestartMission}
          onUnstuckPlayer={handleUnstuckPlayer}
          onOpenSettings={handleOpenSettings}
          onQuitToTitle={handleQuitToTitle}
        />
      )}

      {/* Settings Modal */}
      {currentScreen === 'settings' && (
        <SettingsModal
          settings={settings}
          onUpdateSettings={setSettings}
          onClose={handleCloseSettings}
        />
      )}

      {/* Mission Success / Briefing Modal */}
      {currentScreen === 'mission_briefing' && (
        <MissionModal
          type="briefing"
          mission={mission}
          onAcceptMission={() => {
            if (engineRef.current) {
              engineRef.current.missionManager.startMission();
            }
            setCurrentScreen('playing');
          }}
          onRestartMission={handleRestartMission}
          onContinueFreeRoam={() => setCurrentScreen('playing')}
        />
      )}

      {currentScreen === 'mission_success' && (
        <MissionModal
          type="success"
          mission={mission}
          onAcceptMission={() => setCurrentScreen('playing')}
          onRestartMission={handleRestartMission}
          onContinueFreeRoam={() => setCurrentScreen('playing')}
        />
      )}

    </div>
  );
}
