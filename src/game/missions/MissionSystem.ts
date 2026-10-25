/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as THREE from 'three';
import { sounds } from '../audio/SoundManager';
import { MissionData, MissionObjective } from '../../types/game';

export class MissionManager {
  public mission: MissionData;
  public objectiveBeacon: THREE.Group;
  public beaconPosition: THREE.Vector3 = new THREE.Vector3();
  public onMissionStateChange?: (mission: MissionData) => void;
  public onMissionSuccess?: (rewardMoney: number, rewardRep: number) => void;

  private beaconRing: THREE.Mesh | null = null;
  private beaconPillar: THREE.Mesh | null = null;

  constructor() {
    this.mission = this.getInitialMissionData();
    this.objectiveBeacon = new THREE.Group();
    this.buildBeaconMesh();
    this.updateBeacon();
  }

  private getInitialMissionData(): MissionData {
    return {
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
    };
  }

  private buildBeaconMesh() {
    // 3D Glowing Holographic Beacon Ring & Light Beam at target waypoint
    const ringGeo = new THREE.RingGeometry(2.5, 3.2, 32);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.85,
    });
    this.beaconRing = new THREE.Mesh(ringGeo, ringMat);
    this.beaconRing.rotation.x = -Math.PI / 2;
    this.beaconRing.position.y = 0.15;
    this.objectiveBeacon.add(this.beaconRing);

    // Vertical cylinder light column
    const pillarGeo = new THREE.CylinderGeometry(1.5, 2.5, 14, 16, 1, true);
    const pillarMat = new THREE.MeshBasicMaterial({
      color: 0x0284c7,
      transparent: true,
      opacity: 0.35,
      side: THREE.DoubleSide,
    });
    this.beaconPillar = new THREE.Mesh(pillarGeo, pillarMat);
    this.beaconPillar.position.y = 7;
    this.objectiveBeacon.add(this.beaconPillar);
  }

  public startMission() {
    this.mission.status = 'active';
    this.mission.currentObjectiveIndex = 0;
    this.mission.timeRemaining = 140;
    this.updateBeacon();
    this.notifyState();
  }

  public restartMission() {
    this.mission = this.getInitialMissionData();
    this.startMission();
  }

  public update(dt: number, playerPos: THREE.Vector3) {
    // Animate beacon rotation and pulsation
    if (this.beaconRing && this.beaconPillar) {
      this.beaconRing.rotation.z += dt * 1.5;
      this.beaconPillar.rotation.y += dt * 0.8;
    }

    if (this.mission.status !== 'active') return;

    const currentObj = this.mission.objectives[this.mission.currentObjectiveIndex];
    if (!currentObj) return;

    // Check timer for timed objectives
    if (this.mission.currentObjectiveIndex === 2) {
      this.mission.timeRemaining -= dt;
      if (this.mission.timeRemaining <= 0) {
        this.mission.status = 'failed';
        this.notifyState();
        return;
      }
    }

    // Distance to objective
    const dist = Math.hypot(
      playerPos.x - currentObj.targetPosition[0],
      playerPos.z - currentObj.targetPosition[2]
    );

    if (dist <= currentObj.targetRadius) {
      this.completeCurrentObjective();
    }
  }

  private completeCurrentObjective() {
    const currentObj = this.mission.objectives[this.mission.currentObjectiveIndex];
    if (!currentObj) return;

    currentObj.isCompleted = true;
    sounds.playMissionComplete();

    if (this.mission.currentObjectiveIndex < this.mission.objectives.length - 1) {
      this.mission.currentObjectiveIndex++;
      this.updateBeacon();
      this.notifyState();
    } else {
      // All objectives done: Victory!
      this.mission.status = 'completed';
      this.updateBeacon();
      this.notifyState();
      if (this.onMissionSuccess) {
        this.onMissionSuccess(this.mission.rewardMoney, this.mission.rewardReputation);
      }
    }
  }

  private updateBeacon() {
    if (this.mission.status === 'completed' || this.mission.status === 'failed') {
      this.objectiveBeacon.visible = false;
      return;
    }

    const currentObj = this.mission.objectives[this.mission.currentObjectiveIndex];
    if (currentObj) {
      this.objectiveBeacon.visible = true;
      this.beaconPosition.set(
        currentObj.targetPosition[0],
        currentObj.targetPosition[1],
        currentObj.targetPosition[2]
      );
      this.objectiveBeacon.position.copy(this.beaconPosition);

      // Color coding: objective 0 = green (contact), objective 1 = amber (package), objective 2 = cyan (safehouse)
      const colors = [0x22c55e, 0xf59e0b, 0x06b6d4];
      const color = colors[this.mission.currentObjectiveIndex] || 0x38bdf8;
      if (this.beaconRing && this.beaconRing.material instanceof THREE.MeshBasicMaterial) {
        this.beaconRing.material.color.setHex(color);
      }
      if (this.beaconPillar && this.beaconPillar.material instanceof THREE.MeshBasicMaterial) {
        this.beaconPillar.material.color.setHex(color);
      }
    } else {
      this.objectiveBeacon.visible = false;
    }
  }

  private notifyState() {
    if (this.onMissionStateChange) {
      this.onMissionStateChange({ ...this.mission });
    }
  }

  public getCurrentObjective(): MissionObjective | null {
    if (this.mission.status === 'inactive') return this.mission.objectives[0];
    return this.mission.objectives[this.mission.currentObjectiveIndex] || null;
  }
}
