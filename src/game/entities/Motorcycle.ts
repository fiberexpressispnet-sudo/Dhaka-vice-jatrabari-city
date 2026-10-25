/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as THREE from 'three';
import { sounds } from '../audio/SoundManager';
import { DhakaCity } from '../city/DhakaCity';

export class Motorcycle {
  public mesh: THREE.Group;
  public position: THREE.Vector3 = new THREE.Vector3(15, 0, 70);
  public rotation: number = 0; // Yaw in radians
  public leanAngle: number = 0; // Roll in radians
  public speed: number = 0; // Meters per second
  public maxSpeed: number = 28; // ~100 km/h
  public reverseMaxSpeed: number = -6;
  public acceleration: number = 18;
  public brakeDecel: number = 24;
  public naturalFriction: number = 4.5;
  public turnSpeed: number = 2.4;
  
  public isOccupied: boolean = false;
  public headlightOn: boolean = false;
  public headlightMesh: THREE.SpotLight | null = null;
  public frontWheel: THREE.Mesh | null = null;
  public rearWheel: THREE.Mesh | null = null;
  public handlebarGroup: THREE.Group | null = null;

  private city: DhakaCity;
  private wheelRotation: number = 0;

  constructor(city: DhakaCity, initialPos = new THREE.Vector3(15, 0, 70)) {
    this.city = city;
    this.position.copy(initialPos);
    this.mesh = new THREE.Group();
    this.buildBikeMesh();
    this.updateTransform();
  }

  private buildBikeMesh() {
    // Motorcycle Body Materials
    const crimsonPaint = new THREE.MeshStandardMaterial({
      color: 0xdc2626, // Dhaka Crimson Red
      roughness: 0.25,
      metalness: 0.85,
    });

    const darkMetal = new THREE.MeshStandardMaterial({
      color: 0x18181b,
      roughness: 0.45,
      metalness: 0.9,
    });

    const chromeMat = new THREE.MeshStandardMaterial({
      color: 0xf4f4f5,
      roughness: 0.1,
      metalness: 0.98,
    });

    const rubberMat = new THREE.MeshStandardMaterial({
      color: 0x09090b,
      roughness: 0.9,
      metalness: 0.05,
    });

    const leatherMat = new THREE.MeshStandardMaterial({
      color: 0x27272a,
      roughness: 0.7,
      metalness: 0.1,
    });

    // 1. Chassis Frame
    const frameGeo = new THREE.BoxGeometry(0.35, 0.4, 1.4);
    const frame = new THREE.Mesh(frameGeo, darkMetal);
    frame.position.set(0, 0.55, 0);
    frame.castShadow = true;
    this.mesh.add(frame);

    // 2. Fuel Tank (Sculpted Dhaka 150cc silhouette)
    const tankGeo = new THREE.BoxGeometry(0.48, 0.35, 0.8);
    const tank = new THREE.Mesh(tankGeo, crimsonPaint);
    tank.position.set(0, 0.85, 0.15);
    tank.castShadow = true;
    this.mesh.add(tank);

    // 3. Engine Block with cooling fins
    const engineGeo = new THREE.BoxGeometry(0.42, 0.45, 0.5);
    const engine = new THREE.Mesh(engineGeo, chromeMat);
    engine.position.set(0, 0.38, 0.05);
    engine.castShadow = true;
    this.mesh.add(engine);

    // 4. Contoured Rider & Pillion Seat
    const seatGeo = new THREE.BoxGeometry(0.38, 0.15, 0.75);
    const seat = new THREE.Mesh(seatGeo, leatherMat);
    seat.position.set(0, 0.82, -0.45);
    seat.castShadow = true;
    this.mesh.add(seat);

    // 5. Dual Chrome Exhaust Pipe
    const exhaustGeo = new THREE.CylinderGeometry(0.06, 0.08, 1.1, 12);
    const exhaust = new THREE.Mesh(exhaustGeo, chromeMat);
    exhaust.rotation.x = Math.PI / 2 + 0.1;
    exhaust.position.set(0.24, 0.35, -0.45);
    exhaust.castShadow = true;
    this.mesh.add(exhaust);

    // 6. Rear Swingarm & Rear Wheel (Radius 0.32m, width 0.14m)
    const rearWheelGroup = new THREE.Group();
    rearWheelGroup.position.set(0, 0.35, -0.75);

    const wheelTireGeo = new THREE.CylinderGeometry(0.34, 0.34, 0.14, 16);
    this.rearWheel = new THREE.Mesh(wheelTireGeo, rubberMat);
    this.rearWheel.rotation.z = Math.PI / 2;
    this.rearWheel.castShadow = true;
    rearWheelGroup.add(this.rearWheel);

    const rimGeo = new THREE.CylinderGeometry(0.22, 0.22, 0.15, 8);
    const rearRim = new THREE.Mesh(rimGeo, chromeMat);
    rearRim.rotation.z = Math.PI / 2;
    rearWheelGroup.add(rearRim);
    this.mesh.add(rearWheelGroup);

    // 7. Front Fork & Steerable Handlebars
    this.handlebarGroup = new THREE.Group();
    this.handlebarGroup.position.set(0, 0.35, 0.75);

    this.frontWheel = new THREE.Mesh(wheelTireGeo, rubberMat);
    this.frontWheel.rotation.z = Math.PI / 2;
    this.frontWheel.castShadow = true;
    this.handlebarGroup.add(this.frontWheel);

    const frontRim = new THREE.Mesh(rimGeo, chromeMat);
    frontRim.rotation.z = Math.PI / 2;
    this.handlebarGroup.add(frontRim);

    // Fork tubes
    const forkGeo = new THREE.CylinderGeometry(0.035, 0.035, 0.85, 8);
    const leftFork = new THREE.Mesh(forkGeo, chromeMat);
    leftFork.position.set(-0.12, 0.35, 0);
    const rightFork = new THREE.Mesh(forkGeo, chromeMat);
    rightFork.position.set(0.12, 0.35, 0);
    this.handlebarGroup.add(leftFork, rightFork);

    // Handlebar horizontal crossbar & grips
    const barGeo = new THREE.CylinderGeometry(0.025, 0.025, 0.75, 8);
    const bar = new THREE.Mesh(barGeo, darkMetal);
    bar.rotation.z = Math.PI / 2;
    bar.position.set(0, 0.75, 0);
    this.handlebarGroup.add(bar);

    // Headlight housing
    const lampGeo = new THREE.BoxGeometry(0.25, 0.22, 0.2);
    const lamp = new THREE.Mesh(lampGeo, crimsonPaint);
    lamp.position.set(0, 0.65, 0.12);
    this.handlebarGroup.add(lamp);

    // Headlight bulb lens
    const lensGeo = new THREE.CylinderGeometry(0.1, 0.1, 0.05, 12);
    const lens = new THREE.Mesh(
      lensGeo,
      new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: 0xfff0aa, emissiveIntensity: 1.2 })
    );
    lens.rotation.x = Math.PI / 2;
    lens.position.set(0, 0.65, 0.22);
    this.handlebarGroup.add(lens);

    // Working Night Spotlight
    this.headlightMesh = new THREE.SpotLight(0xfff7cc, 0, 45, Math.PI / 6, 0.35, 1.2);
    this.headlightMesh.position.set(0, 0.65, 0.3);
    const targetObj = new THREE.Object3D();
    targetObj.position.set(0, 0, 15);
    this.handlebarGroup.add(targetObj);
    this.headlightMesh.target = targetObj;
    this.handlebarGroup.add(this.headlightMesh);

    this.mesh.add(this.handlebarGroup);

    // Taillight
    const tailMat = new THREE.MeshStandardMaterial({ color: 0xef4444, emissive: 0xdc2626, emissiveIntensity: 1.0 });
    const tailGeo = new THREE.BoxGeometry(0.2, 0.08, 0.08);
    const taillight = new THREE.Mesh(tailGeo, tailMat);
    taillight.position.set(0, 0.75, -0.9);
    this.mesh.add(taillight);

    // Ground contact shadow disc
    const shadowGeo = new THREE.CircleGeometry(0.9, 16);
    const shadowMat = new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.45, depthWrite: false });
    const shadow = new THREE.Mesh(shadowGeo, shadowMat);
    shadow.rotation.x = -Math.PI / 2;
    shadow.position.y = 0.02;
    this.mesh.add(shadow);
  }

  public update(
    dt: number,
    steerInput: number, // -1 to 1 (left to right)
    accelerate: boolean,
    brake: boolean,
    handbrake: boolean
  ) {
    if (!this.isOccupied) {
      // Natural idle friction when empty
      if (Math.abs(this.speed) > 0.01) {
        this.speed *= Math.max(0, 1 - this.naturalFriction * dt);
      } else {
        this.speed = 0;
      }
      this.leanAngle = THREE.MathUtils.damp(this.leanAngle, 0, 10, dt);
      this.updateTransform();
      return;
    }

    // 1. Acceleration / Braking
    if (accelerate) {
      this.speed += this.acceleration * dt;
      if (this.speed > this.maxSpeed) this.speed = this.maxSpeed;
    } else if (brake) {
      if (this.speed > 0.5) {
        this.speed -= this.brakeDecel * dt;
      } else {
        // Reverse
        this.speed -= this.acceleration * 0.6 * dt;
        if (this.speed < this.reverseMaxSpeed) this.speed = this.reverseMaxSpeed;
      }
    } else if (handbrake) {
      this.speed *= Math.max(0, 1 - this.brakeDecel * 1.5 * dt);
    } else {
      // Coasting friction
      if (this.speed > 0) {
        this.speed -= this.naturalFriction * dt;
        if (this.speed < 0) this.speed = 0;
      } else if (this.speed < 0) {
        this.speed += this.naturalFriction * dt;
        if (this.speed > 0) this.speed = 0;
      }
    }

    // 2. Turning & Dynamic Leaning (Aligned with joystick: Right = turn right, Left = turn left)
    if (Math.abs(this.speed) > 0.2) {
      const speedFactor = Math.min(1.0, Math.abs(this.speed) / 10);
      const direction = this.speed >= 0 ? 1 : -1;
      
      // Rotate clockwise on right input, counter-clockwise on left input
      this.rotation += steerInput * this.turnSpeed * speedFactor * direction * dt;

      // Target lean angle: leaning into the turn (right steer = negative Z lean roll)
      const targetLean = -steerInput * Math.min(0.48, (Math.abs(this.speed) / this.maxSpeed) * 0.65);
      this.leanAngle = THREE.MathUtils.damp(this.leanAngle, targetLean, 12, dt);

      // Handlebar steering rotation visual
      if (this.handlebarGroup) {
        this.handlebarGroup.rotation.y = -steerInput * 0.45;
      }
    } else {
      this.leanAngle = THREE.MathUtils.damp(this.leanAngle, 0, 8, dt);
      if (this.handlebarGroup) {
        this.handlebarGroup.rotation.y = 0;
      }
    }

    // 3. Position Translation & Collision Check
    const forwardX = Math.sin(this.rotation);
    const forwardZ = Math.cos(this.rotation);

    const nextX = this.position.x + forwardX * this.speed * dt;
    const nextZ = this.position.z + forwardZ * this.speed * dt;
    const groundY = this.city.getGroundHeight(nextX, nextZ);

    const testPos = new THREE.Vector3(nextX, groundY, nextZ);

    if (this.city.checkCollision(testPos, 0.7)) {
      // Hit obstacle: bounce back and decelerate
      this.speed = -this.speed * 0.35;
      sounds.playPunchImpact();
    } else {
      this.position.x = nextX;
      this.position.z = nextZ;
      this.position.y = groundY;
    }

    // 4. Wheels rotation
    const travelDist = this.speed * dt;
    this.wheelRotation += travelDist / 0.34;
    if (this.frontWheel) this.frontWheel.rotation.x = this.wheelRotation;
    if (this.rearWheel) this.rearWheel.rotation.x = this.wheelRotation;

    // 5. Engine Sound Audio Update
    const speedRatio = Math.abs(this.speed) / this.maxSpeed;
    sounds.updateMotorcycleEngine(speedRatio, accelerate);

    this.updateTransform();
  }

  public setPaintColor(colorHex: number) {
    this.mesh.traverse(child => {
      if (child instanceof THREE.Mesh && child.material) {
        if (child.material.color && child.material.color.getHex() === 0xdc2626) {
          child.material.color.setHex(colorHex);
        }
      }
    });
  }

  public toggleHeadlight(): boolean {
    this.headlightOn = !this.headlightOn;
    if (this.headlightMesh) {
      this.headlightMesh.intensity = this.headlightOn ? 25 : 0;
    }
    return this.headlightOn;
  }

  public updateTransform() {
    this.mesh.position.copy(this.position);
    this.mesh.rotation.y = this.rotation;
    this.mesh.rotation.z = this.leanAngle;
  }

  public getSeatPosition(): THREE.Vector3 {
    // Rider seat offset in world space
    const offset = new THREE.Vector3(0, 0.85, -0.2);
    offset.applyAxisAngle(new THREE.Vector3(0, 0, 1), this.leanAngle);
    offset.applyAxisAngle(new THREE.Vector3(0, 1, 0), this.rotation);
    return this.position.clone().add(offset);
  }

  public resetPosition(safePos: THREE.Vector3) {
    this.position.copy(safePos);
    this.speed = 0;
    this.leanAngle = 0;
    this.updateTransform();
  }
}
