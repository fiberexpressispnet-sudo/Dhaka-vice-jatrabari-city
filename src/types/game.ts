/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type GameScreen = 'title' | 'playing' | 'paused' | 'mission_briefing' | 'mission_success' | 'settings';

export type GraphicsQuality = 'low' | 'medium' | 'high';

export interface GameSettings {
  language: 'bn' | 'en';
  graphics: GraphicsQuality;
  musicVolume: number;
  sfxVolume: number;
  radioEnabled: boolean;
  joystickSize: 'small' | 'medium' | 'large';
  joystickOpacity: number;
  cameraSensitivity: number;
  joystickSensitivity: number;
  controlHandedness: 'right' | 'left'; // right = joystick left, actions right
  showFps: boolean;
}

export interface PlayerStats {
  money: number;
  reputation: number;
  currentVehicleId: string | null;
  unlockedBikePaint: string;
  missionsCompleted: number;
}

export interface JoystickInput {
  x: number; // -1 to 1
  y: number; // -1 to 1
  active: boolean;
}

export interface ActionInput {
  sprint: boolean;
  jump: boolean;
  interact: boolean;
  enterExitVehicle: boolean;
  attack: boolean;
  accelerate: boolean;
  brake: boolean;
  handbrake: boolean;
  horn: boolean;
  headlights: boolean;
  recenterCamera: boolean;
}

export interface MissionObjective {
  id: string;
  titleBn: string;
  titleEn: string;
  descriptionBn: string;
  descriptionEn: string;
  targetPosition: [number, number, number];
  targetRadius: number;
  timeLimitSeconds?: number;
  isCompleted: boolean;
}

export interface MissionData {
  id: string;
  nameBn: string;
  nameEn: string;
  synopsisBn: string;
  synopsisEn: string;
  rewardMoney: number;
  rewardReputation: number;
  objectives: MissionObjective[];
  currentObjectiveIndex: number;
  status: 'inactive' | 'active' | 'completed' | 'failed';
  timeRemaining: number;
}
