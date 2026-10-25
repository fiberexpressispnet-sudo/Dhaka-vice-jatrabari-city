/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { GameSettings, PlayerStats } from '../types/game';

const SAVE_KEY = 'dhaka_vice_save_v1';

export interface SavedGameData {
  version: number;
  stats: PlayerStats;
  settings: GameSettings;
  timestamp: number;
}

const DEFAULT_SETTINGS: GameSettings = {
  language: 'bn',
  graphics: 'high',
  musicVolume: 0.5,
  sfxVolume: 0.8,
  radioEnabled: true,
  joystickSize: 'medium',
  joystickOpacity: 0.88,
  cameraSensitivity: 1.0,
  joystickSensitivity: 1.2,
  controlHandedness: 'right',
  showFps: true,
};

const DEFAULT_STATS: PlayerStats = {
  money: 15000, // Starting Dhaka street cash
  reputation: 100,
  currentVehicleId: null,
  unlockedBikePaint: 'crimson',
  missionsCompleted: 0,
};

export class SaveSystem {
  public static load(): { stats: PlayerStats; settings: GameSettings; hasSavedGame: boolean } {
    try {
      const raw = localStorage.getItem(SAVE_KEY);
      if (!raw) {
        return { stats: { ...DEFAULT_STATS }, settings: { ...DEFAULT_SETTINGS }, hasSavedGame: false };
      }

      const parsed = JSON.parse(raw) as SavedGameData;
      if (!parsed || parsed.version !== 1 || !parsed.stats || !parsed.settings) {
        return { stats: { ...DEFAULT_STATS }, settings: { ...DEFAULT_SETTINGS }, hasSavedGame: false };
      }

      return {
        stats: { ...DEFAULT_STATS, ...parsed.stats },
        settings: { ...DEFAULT_SETTINGS, ...parsed.settings },
        hasSavedGame: true,
      };
    } catch {
      return { stats: { ...DEFAULT_STATS }, settings: { ...DEFAULT_SETTINGS }, hasSavedGame: false };
    }
  }

  public static save(stats: PlayerStats, settings: GameSettings) {
    try {
      const data: SavedGameData = {
        version: 1,
        stats,
        settings,
        timestamp: Date.now(),
      };
      localStorage.setItem(SAVE_KEY, JSON.stringify(data));
    } catch {
      // Ignore quota error if any
    }
  }
}
