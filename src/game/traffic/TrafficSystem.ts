/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as THREE from 'three';
import { sounds } from '../audio/SoundManager';
import { DhakaCity } from '../city/DhakaCity';

export interface TrafficVehicle {
  mesh: THREE.Group;
  type: 'cng' | 'rickshaw' | 'bus' | 'car';
  position: THREE.Vector3;
  speed: number;
  maxSpeed: number;
  rotation: number;
  lane: 'north' | 'south' | 'east' | 'west';
  boundMin: number;
  boundMax: number;
  // Physics-based collision fields
  isCrashed: boolean;
  crashCooldown: number;
  collisionRadius: number;
  length: number;
  tiltAngle: number;
  tiltVelocity: number;
  pitchAngle: number;
  pitchVelocity: number;
}

export interface Pedestrian {
  mesh: THREE.Group;
  position: THREE.Vector3;
  targetPos: THREE.Vector3;
  speed: number;
  leftLeg: THREE.Group;
  rightLeg: THREE.Group;
  animPhase: number;
}

export class TrafficSystem {
  public group: THREE.Group;
  public vehicles: TrafficVehicle[] = [];
  public pedestrians: Pedestrian[] = [];
  private city: DhakaCity;

  constructor(city: DhakaCity) {
    this.city = city;
    this.group = new THREE.Group();
    this.spawnTraffic();
    this.spawnPedestrians();
  }

  // 1. Procedural Dhaka Green CNG Auto-Rickshaw
  private createCNGMesh(): THREE.Group {
    const group = new THREE.Group();

    const cngGreen = new THREE.MeshStandardMaterial({ color: 0x15803d, roughness: 0.4, metalness: 0.3 });
    const cngYellow = new THREE.MeshStandardMaterial({ color: 0xeab308, roughness: 0.5 });
    const wireMeshMat = new THREE.MeshStandardMaterial({ color: 0x334155, wireframe: true });
    const wheelMat = new THREE.MeshStandardMaterial({ color: 0x18181b, roughness: 0.9 });

    // Lower cabin
    const body = new THREE.Mesh(new THREE.BoxGeometry(1.5, 1.1, 2.5), cngGreen);
    body.position.y = 0.8;
    body.castShadow = true;
    group.add(body);

    // Yellow curved canvas roof
    const roof = new THREE.Mesh(new THREE.BoxGeometry(1.45, 0.4, 2.4), cngYellow);
    roof.position.set(0, 1.55, -0.05);
    group.add(roof);

    // Wire safety cage on side doors (iconic Dhaka CNG feature)
    const leftCage = new THREE.Mesh(new THREE.PlaneGeometry(1.6, 0.7), wireMeshMat);
    leftCage.position.set(-0.76, 1.15, 0);
    leftCage.rotation.y = Math.PI / 2;
    const rightCage = leftCage.clone();
    rightCage.position.x = 0.76;
    rightCage.rotation.y = -Math.PI / 2;
    group.add(leftCage, rightCage);

    // Front windshield
    const glass = new THREE.Mesh(new THREE.PlaneGeometry(1.3, 0.6), new THREE.MeshStandardMaterial({ color: 0x38bdf8, roughness: 0.1, transparent: true, opacity: 0.6 }));
    glass.position.set(0, 1.25, 1.26);
    group.add(glass);

    // 3 Wheels
    const frontWheel = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.25, 0.12, 12), wheelMat);
    frontWheel.rotation.z = Math.PI / 2;
    frontWheel.position.set(0, 0.25, 1.1);
    const rearWheelL = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.28, 0.14, 12), wheelMat);
    rearWheelL.rotation.z = Math.PI / 2;
    rearWheelL.position.set(-0.72, 0.28, -0.85);
    const rearWheelR = rearWheelL.clone();
    rearWheelR.position.x = 0.72;
    group.add(frontWheel, rearWheelL, rearWheelR);

    // Bengali plate: "ঢাকা মেট্রো-থ"
    const plate = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.2, 0.05), new THREE.MeshStandardMaterial({ color: 0x22c55e }));
    plate.position.set(0, 0.5, 1.28);
    group.add(plate);

    return group;
  }

  // 2. Procedural Dhaka Cycle Rickshaw with decorated hood art
  private createRickshawMesh(): THREE.Group {
    const group = new THREE.Group();

    const frameMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, metalness: 0.7, roughness: 0.3 });
    const hoodMat = new THREE.MeshStandardMaterial({ color: 0xdb2777, roughness: 0.6 }); // Floral painted hood
    const seatMat = new THREE.MeshStandardMaterial({ color: 0xfacc15, roughness: 0.7 });
    const spokeMat = new THREE.MeshStandardMaterial({ color: 0xd4d4d8, metalness: 0.9, roughness: 0.1 });

    // Passenger seat
    const seat = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.4, 0.7), seatMat);
    seat.position.set(0, 0.75, -0.3);
    group.add(seat);

    // Folding colorful hood
    const hood = new THREE.Mesh(new THREE.CylinderGeometry(0.6, 0.65, 1.1, 8, 1, false, 0, Math.PI), hoodMat);
    hood.rotation.z = Math.PI / 2;
    hood.position.set(0, 1.35, -0.4);
    group.add(hood);

    // Cycle frame & handlebars
    const bar = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 1.4, 6), frameMat);
    bar.rotation.x = Math.PI / 3;
    bar.position.set(0, 0.7, 0.5);
    group.add(bar);

    // Wheels (Big traditional spoked bicycle wheels)
    const wheelGeo = new THREE.TorusGeometry(0.38, 0.03, 6, 16);
    const wheelL = new THREE.Mesh(wheelGeo, spokeMat);
    wheelL.position.set(-0.6, 0.38, -0.3);
    wheelL.rotation.y = Math.PI / 2;
    const wheelR = wheelL.clone();
    wheelR.position.x = 0.6;
    const frontWheel = new THREE.Mesh(wheelGeo, spokeMat);
    frontWheel.position.set(0, 0.38, 1.1);
    frontWheel.rotation.y = Math.PI / 2;
    group.add(wheelL, wheelR, frontWheel);

    // Rickshaw puller figure
    const pullerMat = new THREE.MeshStandardMaterial({ color: 0x78350f });
    const pullerLungi = new THREE.MeshStandardMaterial({ color: 0x16a34a });
    const puller = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.45, 0.2), pullerMat);
    puller.position.set(0, 1.05, 0.5);
    const lungi = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.24, 0.5, 8), pullerLungi);
    lungi.position.set(0, 0.65, 0.5);
    group.add(puller, lungi);

    return group;
  }

  // 3. Dhaka City Public Bus
  private createBusMesh(): THREE.Group {
    const group = new THREE.Group();

    const busBodyMat = new THREE.MeshStandardMaterial({ color: 0x2563eb, roughness: 0.5 }); // Dhaka blue bus
    const busStripeMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, roughness: 0.4 }); // Yellow side stripe
    const glassMat = new THREE.MeshStandardMaterial({ color: 0x38bdf8, roughness: 0.1, transparent: true, opacity: 0.7 });
    const wheelMat = new THREE.MeshStandardMaterial({ color: 0x18181b, roughness: 0.9 });

    // Main bus body
    const body = new THREE.Mesh(new THREE.BoxGeometry(2.4, 2.4, 8.5), busBodyMat);
    body.position.y = 1.7;
    body.castShadow = true;
    group.add(body);

    // Yellow stripe along sides
    const stripe = new THREE.Mesh(new THREE.BoxGeometry(2.44, 0.35, 8.52), busStripeMat);
    stripe.position.y = 1.5;
    group.add(stripe);

    // Side windows
    const winGeo = new THREE.BoxGeometry(2.45, 0.7, 7.2);
    const win = new THREE.Mesh(winGeo, glassMat);
    win.position.y = 2.15;
    group.add(win);

    // Front windshield
    const windGeo = new THREE.PlaneGeometry(2.2, 1.1);
    const windshield = new THREE.Mesh(windGeo, glassMat);
    windshield.position.set(0, 2.1, 4.26);
    group.add(windshield);

    // Wheels
    const wheelGeo = new THREE.CylinderGeometry(0.48, 0.48, 0.3, 16);
    const w1 = new THREE.Mesh(wheelGeo, wheelMat);
    w1.rotation.z = Math.PI / 2;
    w1.position.set(-1.15, 0.48, 2.6);
    const w2 = w1.clone();
    w2.position.x = 1.15;
    const w3 = w1.clone();
    w3.position.z = -2.6;
    const w4 = w2.clone();
    w4.position.z = -2.6;
    group.add(w1, w2, w3, w4);

    return group;
  }

  // 4. Dhaka Sedan Car
  private createCarMesh(colorHex: number): THREE.Group {
    const group = new THREE.Group();

    const carMat = new THREE.MeshStandardMaterial({ color: colorHex, roughness: 0.3, metalness: 0.7 });
    const glassMat = new THREE.MeshStandardMaterial({ color: 0x38bdf8, roughness: 0.1, transparent: true, opacity: 0.6 });
    const wheelMat = new THREE.MeshStandardMaterial({ color: 0x18181b, roughness: 0.9 });

    // Lower chassis
    const body = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.65, 4.2), carMat);
    body.position.y = 0.55;
    body.castShadow = true;
    group.add(body);

    // Cabin
    const cabin = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.55, 2.2), glassMat);
    cabin.position.set(0, 1.1, -0.2);
    group.add(cabin);

    // Roof
    const roof = new THREE.Mesh(new THREE.BoxGeometry(1.48, 0.08, 2.1), carMat);
    roof.position.set(0, 1.4, -0.2);
    group.add(roof);

    // 4 Wheels
    const wheelGeo = new THREE.CylinderGeometry(0.3, 0.3, 0.18, 14);
    const w1 = new THREE.Mesh(wheelGeo, wheelMat);
    w1.rotation.z = Math.PI / 2;
    w1.position.set(-0.88, 0.3, 1.3);
    const w2 = w1.clone();
    w2.position.x = 0.88;
    const w3 = w1.clone();
    w3.position.z = -1.3;
    const w4 = w2.clone();
    w4.position.z = -1.3;
    group.add(w1, w2, w3, w4);

    return group;
  }

  private addVehicle(
    mesh: THREE.Group,
    type: 'cng' | 'rickshaw' | 'bus' | 'car',
    position: THREE.Vector3,
    speed: number,
    rotation: number,
    lane: 'north' | 'south' | 'east' | 'west',
    boundMin: number,
    boundMax: number
  ) {
    const lengthMap = { cng: 2.5, rickshaw: 2.2, bus: 8.5, car: 4.2 };
    const radiusMap = { cng: 1.1, rickshaw: 0.9, bus: 1.7, car: 1.3 };

    this.vehicles.push({
      mesh,
      type,
      position,
      speed,
      maxSpeed: speed,
      rotation,
      lane,
      boundMin,
      boundMax,
      isCrashed: false,
      crashCooldown: 0,
      collisionRadius: radiusMap[type],
      length: lengthMap[type],
      tiltAngle: 0,
      tiltVelocity: 0,
      pitchAngle: 0,
      pitchVelocity: 0,
    });
    this.group.add(mesh);
  }

  private spawnTraffic() {
    // Lane 1: Main Avenue Northbound (x = 5.5, z moving positive to negative)
    this.addVehicle(this.createCNGMesh(), 'cng', new THREE.Vector3(5.5, 0, 140), 8.5, Math.PI, 'north', -160, 160);
    this.addVehicle(this.createBusMesh(), 'bus', new THREE.Vector3(5.5, 0, 40), 6.5, Math.PI, 'north', -160, 160);
    this.addVehicle(this.createCarMesh(0xf8fafc), 'car', new THREE.Vector3(5.5, 0, -80), 10.5, Math.PI, 'north', -160, 160);

    // Lane 2: Main Avenue Southbound (x = -5.5, z moving negative to positive)
    this.addVehicle(this.createRickshawMesh(), 'rickshaw', new THREE.Vector3(-5.5, 0, -130), 4.2, 0, 'south', -160, 160);
    this.addVehicle(this.createCNGMesh(), 'cng', new THREE.Vector3(-5.5, 0, -30), 8.0, 0, 'south', -160, 160);
    this.addVehicle(this.createCarMesh(0x0ea5e9), 'car', new THREE.Vector3(-5.5, 0, 70), 9.5, 0, 'south', -160, 160);

    // Cross Avenue Eastbound & Westbound
    this.addVehicle(this.createCNGMesh(), 'cng', new THREE.Vector3(-120, 0, 5.5), 8.0, Math.PI / 2, 'east', -140, 140);
    this.addVehicle(this.createRickshawMesh(), 'rickshaw', new THREE.Vector3(80, 0, -5.5), 4.5, -Math.PI / 2, 'west', -140, 140);
  }

  // Spawn walking Dhaka pedestrians
  private spawnPedestrians() {
    const clothesColors = [0xef4444, 0x3b82f6, 0x10b981, 0xf59e0b, 0x8b5cf6, 0xffffff];
    const skinMat = new THREE.MeshStandardMaterial({ color: 0x935f41, roughness: 0.8 });

    for (let i = 0; i < 14; i++) {
      const pGroup = new THREE.Group();
      const clothMat = new THREE.MeshStandardMaterial({ color: clothesColors[i % clothesColors.length], roughness: 0.7 });

      // Torso / Panjabi / Shirt
      const torso = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.6, 0.24), clothMat);
      torso.position.y = 1.0;
      torso.castShadow = true;
      pGroup.add(torso);

      // Head
      const head = new THREE.Mesh(new THREE.SphereGeometry(0.16, 8, 8), skinMat);
      head.position.y = 1.45;
      pGroup.add(head);

      // Legs
      const legGeo = new THREE.BoxGeometry(0.14, 0.6, 0.14);
      legGeo.translate(0, -0.3, 0);

      const leftLeg = new THREE.Group();
      leftLeg.position.set(-0.12, 0.7, 0);
      leftLeg.add(new THREE.Mesh(legGeo, clothMat));
      pGroup.add(leftLeg);

      const rightLeg = new THREE.Group();
      rightLeg.position.set(0.12, 0.7, 0);
      rightLeg.add(new THREE.Mesh(legGeo, clothMat));
      pGroup.add(rightLeg);

      // Position along sidewalk
      const side = i % 2 === 0 ? 14.5 : -14.5;
      const z = -140 + i * 22;
      const initialPos = new THREE.Vector3(side, 0, z);
      const targetPos = new THREE.Vector3(side, 0, z + (i % 2 === 0 ? 80 : -80));

      pGroup.position.copy(initialPos);
      this.group.add(pGroup);

      this.pedestrians.push({
        mesh: pGroup,
        position: initialPos,
        targetPos: targetPos,
        speed: 1.4 + Math.random() * 0.6,
        leftLeg: leftLeg,
        rightLeg: rightLeg,
        animPhase: Math.random() * Math.PI * 2,
      });
    }
  }

  public update(dt: number, playerPos: THREE.Vector3, bikePos?: THREE.Vector3) {
    // 1. Update Traffic Vehicles with Physics-Based Collision Triggers
    for (let i = 0; i < this.vehicles.length; i++) {
      const v = this.vehicles[i];

      // Lane direction unit vector
      let fwdX = 0;
      let fwdZ = 0;
      if (v.lane === 'north') fwdZ = -1;
      else if (v.lane === 'south') fwdZ = 1;
      else if (v.lane === 'east') fwdX = 1;
      else if (v.lane === 'west') fwdX = -1;

      const distToPlayer = v.position.distanceTo(playerPos);

      // --- STATE A: VEHICLE CURRENTLY IN CRASH RECOVERY ---
      if (v.isCrashed) {
        v.crashCooldown -= dt;

        // Decelerate & damp rebound
        v.speed = THREE.MathUtils.damp(v.speed, 0, 7.5, dt);

        // Apply slight physical recoil translation
        v.position.x += fwdX * v.speed * dt;
        v.position.z += fwdZ * v.speed * dt;

        // Damped harmonic oscillation for vehicle body tilt & pitch
        v.tiltAngle += v.tiltVelocity * dt;
        v.tiltVelocity = THREE.MathUtils.damp(v.tiltVelocity, -v.tiltAngle * 35, 14, dt);
        v.tiltAngle = THREE.MathUtils.damp(v.tiltAngle, 0, 6, dt);

        v.pitchAngle += v.pitchVelocity * dt;
        v.pitchVelocity = THREE.MathUtils.damp(v.pitchVelocity, -v.pitchAngle * 35, 14, dt);
        v.pitchAngle = THREE.MathUtils.damp(v.pitchAngle, 0, 6, dt);

        // Recovery finished: honk horn and resume
        if (v.crashCooldown <= 0) {
          v.isCrashed = false;
          v.tiltAngle = 0;
          v.tiltVelocity = 0;
          v.pitchAngle = 0;
          v.pitchVelocity = 0;
          if (distToPlayer < 40) {
            sounds.playHorn();
          }
        }
      } else {
        // --- STATE B: VEHICLE CRUISING & COLLISION CHECKING ---
        // Probe forward position at front bumper
        const probeDist = v.length * 0.5 + 0.45;
        const probeX = v.position.x + fwdX * probeDist;
        const probeZ = v.position.z + fwdZ * probeDist;
        const probePos = new THREE.Vector3(probeX, v.position.y, probeZ);

        let hasCollided = false;

        // 1. Check Collision with City Obstacles (pillars, buildings, barriers)
        if (this.city.checkCollision(probePos, v.collisionRadius * 0.7)) {
          hasCollided = true;
        }

        // 2. Check Collision with Player
        if (!hasCollided && distToPlayer < v.collisionRadius + 0.7) {
          hasCollided = true;
        }

        // 3. Check Collision with Hero Motorcycle (even if dismounted)
        if (!hasCollided && bikePos) {
          const distToBike = probePos.distanceTo(bikePos);
          if (distToBike < v.collisionRadius + 0.9) {
            hasCollided = true;
          }
        }

        // 4. Check Collision with Other Traffic Vehicles
        if (!hasCollided) {
          for (let j = 0; j < this.vehicles.length; j++) {
            if (i === j) continue;
            const other = this.vehicles[j];
            const distOther = probePos.distanceTo(other.position);
            if (distOther < (v.collisionRadius + other.collisionRadius) * 0.92) {
              hasCollided = true;
              // Chain collision reaction to other vehicle if moving
              if (!other.isCrashed && other.speed > 0.4) {
                other.isCrashed = true;
                other.crashCooldown = 2.4 + Math.random() * 0.6;
                other.speed = -1.2;
                other.tiltVelocity = (Math.random() > 0.5 ? 1 : -1) * 1.4;
                other.pitchVelocity = 1.6;
              }
              break;
            }
          }
        }

        // --- TRIGGER CRASH IF HIT ---
        if (hasCollided) {
          v.isCrashed = true;
          v.crashCooldown = 2.6 + Math.random() * 0.8; // Stop vehicle for ~2.6 to 3.4 seconds
          v.speed = -1.6; // Physical backward rebound

          // Physical impact jolt: roll tilt and front compression pitch
          v.tiltVelocity = (Math.random() > 0.5 ? 1 : -1) * (1.6 + Math.random() * 0.8);
          v.pitchVelocity = -2.2;

          // Play procedural crash audio
          sounds.playVehicleCollision(distToPlayer);
        } else {
          // Normal cruising navigation
          let targetSpeed = v.maxSpeed;

          // Gentle stop / slow down if player is directly ahead within 8m
          if (distToPlayer < 8.5) {
            targetSpeed = Math.min(v.maxSpeed, Math.max(0, distToPlayer - 4.2));
          }

          v.speed = THREE.MathUtils.damp(v.speed, targetSpeed, 5.5, dt);

          // Translate along lane
          v.position.x += fwdX * v.speed * dt;
          v.position.z += fwdZ * v.speed * dt;

          // Wrap-around lane limits
          if (v.lane === 'north' && v.position.z < v.boundMin) v.position.z = v.boundMax;
          else if (v.lane === 'south' && v.position.z > v.boundMax) v.position.z = v.boundMin;
          else if (v.lane === 'east' && v.position.x > v.boundMax) v.position.x = v.boundMin;
          else if (v.lane === 'west' && v.position.x < v.boundMin) v.position.x = v.boundMax;
        }
      }

      // Grounding & mesh transforms
      v.position.y = this.city.getGroundHeight(v.position.x, v.position.z);
      v.mesh.position.copy(v.position);
      v.mesh.rotation.y = v.rotation;

      // Apply physics impact roll & pitch
      if (v.lane === 'north' || v.lane === 'south') {
        v.mesh.rotation.x = v.pitchAngle;
        v.mesh.rotation.z = v.tiltAngle;
      } else {
        v.mesh.rotation.z = -v.pitchAngle;
        v.mesh.rotation.x = v.tiltAngle;
      }
    }

    // 2. Update Pedestrians
    for (let p = 0; p < this.pedestrians.length; p++) {
      const ped = this.pedestrians[p];

      // Move toward target
      const dx = ped.targetPos.x - ped.position.x;
      const dz = ped.targetPos.z - ped.position.z;
      const dist = Math.hypot(dx, dz);

      if (dist < 1.0) {
        // Reverse direction along sidewalk
        const temp = ped.position.clone();
        ped.position.copy(ped.targetPos);
        ped.targetPos.copy(temp);
      } else {
        const moveDist = ped.speed * dt;
        ped.position.x += (dx / dist) * moveDist;
        ped.position.z += (dz / dist) * moveDist;

        ped.mesh.rotation.y = Math.atan2(dx, dz);
        ped.animPhase += dt * 6.5;

        // Walking leg swing
        const legSwing = Math.sin(ped.animPhase) * 0.45;
        ped.leftLeg.rotation.x = legSwing;
        ped.rightLeg.rotation.x = -legSwing;
      }

      ped.position.y = this.city.getGroundHeight(ped.position.x, ped.position.z);
      ped.mesh.position.copy(ped.position);
    }
  }
}
