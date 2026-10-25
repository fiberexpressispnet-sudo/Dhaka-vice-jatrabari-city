/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as THREE from 'three';
import { sounds } from '../audio/SoundManager';
import { DhakaCity } from '../city/DhakaCity';
import { Motorcycle } from './Motorcycle';

export class Player {
  public mesh: THREE.Group;
  public position: THREE.Vector3 = new THREE.Vector3(12, 0, 72);
  public rotation: number = 0; // Yaw in radians
  public velocity: THREE.Vector3 = new THREE.Vector3();
  
  public isRiding: boolean = false;
  public currentBike: Motorcycle | null = null;
  public isGrounded: boolean = true;
  public isAttacking: boolean = false;
  private attackTimer: number = 0;

  // Realistic human speeds
  public walkSpeed: number = 3.6;
  public runSpeed: number = 7.8;
  public jumpStrength: number = 6.8;
  public gravity: number = 19.5;

  // Realistic Articulated Anatomy Joints
  public headGroup: THREE.Group | null = null;
  public spineGroup: THREE.Group | null = null;
  public chestGroup: THREE.Group | null = null;
  public leftArm: THREE.Group | null = null;
  public rightArm: THREE.Group | null = null;
  public leftForearm: THREE.Group | null = null;
  public rightForearm: THREE.Group | null = null;
  public leftLeg: THREE.Group | null = null;
  public rightLeg: THREE.Group | null = null;
  public leftCalf: THREE.Group | null = null;
  public rightCalf: THREE.Group | null = null;

  private animTime: number = 0;
  private footstepTimer: number = 0;
  private city: DhakaCity;

  constructor(city: DhakaCity) {
    this.city = city;
    this.mesh = new THREE.Group();
    this.buildRealisticCharacter();
    this.updateTransform();
  }

  // Procedural normal/micro-bump canvas texture for realistic denim and leather fabrics
  private createFabricBumpTexture(): THREE.CanvasTexture {
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 128;
    const ctx = canvas.getContext('2d')!;

    ctx.fillStyle = '#808080';
    ctx.fillRect(0, 0, 128, 128);

    // Fine denim diagonal twill weave
    ctx.strokeStyle = '#999999';
    ctx.lineWidth = 1;
    for (let i = -128; i < 256; i += 4) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i + 128, 128);
      ctx.stroke();
    }

    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(8, 8);
    return tex;
  }

  private buildRealisticCharacter() {
    const fabricBump = this.createFabricBumpTexture();

    // High-Resolution Realistic PBR Materials
    const skinMat = new THREE.MeshStandardMaterial({
      color: 0x9c6848, // Natural South Asian olive-tan skin tone
      roughness: 0.65,
      metalness: 0.05,
    });

    const hairMat = new THREE.MeshStandardMaterial({
      color: 0x18181b, // Jet black hair with subtle sheen
      roughness: 0.5,
      metalness: 0.15,
    });

    const jacketMat = new THREE.MeshStandardMaterial({
      color: 0x111827, // Midnight black Dhaka varsity jacket
      roughness: 0.45,
      metalness: 0.2,
      bumpMap: fabricBump,
      bumpScale: 0.02,
    });

    const goldAccentMat = new THREE.MeshStandardMaterial({
      color: 0xf59e0b, // Gold trim & metal zipper
      roughness: 0.25,
      metalness: 0.85,
    });

    const denimMat = new THREE.MeshStandardMaterial({
      color: 0x1e3a5f, // Deep indigo raw denim jeans
      roughness: 0.8,
      metalness: 0.08,
      bumpMap: fabricBump,
      bumpScale: 0.035,
    });

    const leatherMat = new THREE.MeshStandardMaterial({
      color: 0x27272a,
      roughness: 0.4,
      metalness: 0.3,
    });

    const sneakerWhiteMat = new THREE.MeshStandardMaterial({
      color: 0xf8fafc,
      roughness: 0.35,
      metalness: 0.1,
    });

    const sneakerRedMat = new THREE.MeshStandardMaterial({
      color: 0xdc2626, // Dhaka crimson accents
      roughness: 0.4,
    });

    const glassesLensMat = new THREE.MeshStandardMaterial({
      color: 0x050505,
      roughness: 0.05,
      metalness: 0.95,
    });

    // 1. Root Pelvis / Hips
    this.spineGroup = new THREE.Group();
    this.spineGroup.position.set(0, 0.95, 0);

    // Belt & Pelvis
    const pelvisGeo = new THREE.CylinderGeometry(0.24, 0.22, 0.2, 16);
    const pelvis = new THREE.Mesh(pelvisGeo, denimMat);
    pelvis.castShadow = true;
    this.spineGroup.add(pelvis);

    const beltGeo = new THREE.CylinderGeometry(0.25, 0.25, 0.06, 16);
    const belt = new THREE.Mesh(beltGeo, leatherMat);
    belt.position.y = 0.07;
    this.spineGroup.add(belt);

    const buckle = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.06, 0.04), goldAccentMat);
    buckle.position.set(0, 0.07, 0.25);
    this.spineGroup.add(buckle);

    // 2. Athletic Chest & Jacket Torso
    this.chestGroup = new THREE.Group();
    this.chestGroup.position.set(0, 0.15, 0);

    const chestGeo = new THREE.CylinderGeometry(0.28, 0.23, 0.48, 16);
    const chest = new THREE.Mesh(chestGeo, jacketMat);
    chest.position.y = 0.24;
    chest.castShadow = true;
    this.chestGroup.add(chest);

    // Gold front zipper line
    const zipGeo = new THREE.BoxGeometry(0.025, 0.48, 0.04);
    const zip = new THREE.Mesh(zipGeo, goldAccentMat);
    zip.position.set(0, 0.24, 0.27);
    this.chestGroup.add(zip);

    // Ribbed jacket collar
    const collarGeo = new THREE.TorusGeometry(0.16, 0.04, 8, 16);
    const collar = new THREE.Mesh(collarGeo, goldAccentMat);
    collar.rotation.x = Math.PI / 2;
    collar.position.set(0, 0.48, 0);
    this.chestGroup.add(collar);

    // 3. Realistic Head, Neck & Hair
    this.headGroup = new THREE.Group();
    this.headGroup.position.set(0, 0.52, 0);

    // Neck
    const neckGeo = new THREE.CylinderGeometry(0.1, 0.11, 0.14, 12);
    const neck = new THREE.Mesh(neckGeo, skinMat);
    neck.position.y = 0.07;
    neck.castShadow = true;
    this.headGroup.add(neck);

    // Sculpted Head & Face
    const headGeo = new THREE.SphereGeometry(0.17, 16, 16);
    headGeo.scale(0.9, 1.15, 1.0);
    const headMesh = new THREE.Mesh(headGeo, skinMat);
    headMesh.position.y = 0.24;
    headMesh.castShadow = true;
    this.headGroup.add(headMesh);

    // Nose bridge
    const noseGeo = new THREE.ConeGeometry(0.035, 0.08, 6);
    const nose = new THREE.Mesh(noseGeo, skinMat);
    nose.rotation.x = Math.PI / 2;
    nose.position.set(0, 0.24, 0.17);
    this.headGroup.add(nose);

    // Styled modern hair (volumetric pompadour fade)
    const hairGeo = new THREE.SphereGeometry(0.18, 16, 16);
    hairGeo.scale(0.95, 1.1, 1.05);
    const hairMesh = new THREE.Mesh(hairGeo, hairMat);
    hairMesh.position.set(0, 0.28, -0.03);
    this.headGroup.add(hairMesh);

    // Aviator Sunglasses (Wire frames + dark lenses)
    const glassesGroup = new THREE.Group();
    glassesGroup.position.set(0, 0.27, 0.155);

    const leftLens = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.045, 0.02, 12), glassesLensMat);
    leftLens.rotation.x = Math.PI / 2;
    leftLens.position.set(-0.065, 0, 0);
    const rightLens = leftLens.clone();
    rightLens.position.set(0.065, 0, 0);

    const frameBar = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.015, 0.02), goldAccentMat);
    frameBar.position.set(0, 0.035, 0);
    glassesGroup.add(leftLens, rightLens, frameBar);
    this.headGroup.add(glassesGroup);

    this.chestGroup.add(this.headGroup);

    // 4. Articulated Arms (Shoulders, Biceps, Forearms, Hands)
    // Left Arm
    this.leftArm = new THREE.Group();
    this.leftArm.position.set(-0.33, 0.44, 0);

    const upperArmGeo = new THREE.CylinderGeometry(0.08, 0.07, 0.3, 12);
    upperArmGeo.translate(0, -0.15, 0);
    const leftUpperArm = new THREE.Mesh(upperArmGeo, jacketMat);
    leftUpperArm.castShadow = true;
    this.leftArm.add(leftUpperArm);

    this.leftForearm = new THREE.Group();
    this.leftForearm.position.set(0, -0.3, 0);

    const forearmGeo = new THREE.CylinderGeometry(0.065, 0.055, 0.28, 12);
    forearmGeo.translate(0, -0.14, 0);
    const leftForearmMesh = new THREE.Mesh(forearmGeo, skinMat);
    leftForearmMesh.castShadow = true;
    this.leftForearm.add(leftForearmMesh);

    // Gold luxury sports watch on left wrist
    const watch = new THREE.Mesh(new THREE.CylinderGeometry(0.065, 0.065, 0.035, 12), goldAccentMat);
    watch.position.set(0, -0.22, 0);
    this.leftForearm.add(watch);

    // Sculpted hand with fingers
    const handGeo = new THREE.BoxGeometry(0.09, 0.12, 0.07);
    handGeo.translate(0, -0.06, 0);
    const leftHand = new THREE.Mesh(handGeo, skinMat);
    leftHand.position.set(0, -0.28, 0);
    this.leftForearm.add(leftHand);

    this.leftArm.add(this.leftForearm);
    this.chestGroup.add(this.leftArm);

    // Right Arm
    this.rightArm = new THREE.Group();
    this.rightArm.position.set(0.33, 0.44, 0);

    const rightUpperArm = new THREE.Mesh(upperArmGeo, jacketMat);
    rightUpperArm.castShadow = true;
    this.rightArm.add(rightUpperArm);

    this.rightForearm = new THREE.Group();
    this.rightForearm.position.set(0, -0.3, 0);

    const rightForearmMesh = new THREE.Mesh(forearmGeo, skinMat);
    rightForearmMesh.castShadow = true;
    this.rightForearm.add(rightForearmMesh);

    const rightHand = new THREE.Mesh(handGeo, skinMat);
    rightHand.position.set(0, -0.28, 0);
    this.rightForearm.add(rightHand);

    this.rightArm.add(this.rightForearm);
    this.chestGroup.add(this.rightArm);

    this.spineGroup.add(this.chestGroup);
    this.mesh.add(this.spineGroup);

    // 5. Realistic Articulated Legs (Thighs, Knees, Calves, Sneakers)
    const thighGeo = new THREE.CylinderGeometry(0.12, 0.095, 0.42, 14);
    thighGeo.translate(0, -0.21, 0);

    const calfGeo = new THREE.CylinderGeometry(0.095, 0.075, 0.42, 14);
    calfGeo.translate(0, -0.21, 0);

    // Left Leg
    this.leftLeg = new THREE.Group();
    this.leftLeg.position.set(-0.15, 0.9, 0);

    const leftThigh = new THREE.Mesh(thighGeo, denimMat);
    leftThigh.castShadow = true;
    this.leftLeg.add(leftThigh);

    this.leftCalf = new THREE.Group();
    this.leftCalf.position.set(0, -0.42, 0);

    const leftCalfMesh = new THREE.Mesh(calfGeo, denimMat);
    leftCalfMesh.castShadow = true;
    this.leftCalf.add(leftCalfMesh);

    // Sneaker with rubber sole & laces
    const sneakerGroup = new THREE.Group();
    sneakerGroup.position.set(0, -0.42, 0.04);

    const shoeUpper = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.12, 0.28), sneakerWhiteMat);
    shoeUpper.position.set(0, 0.06, 0.03);
    shoeUpper.castShadow = true;

    const shoeSole = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.05, 0.3), sneakerRedMat);
    shoeSole.position.set(0, 0.025, 0.03);

    sneakerGroup.add(shoeUpper, shoeSole);
    this.leftCalf.add(sneakerGroup);

    this.leftLeg.add(this.leftCalf);
    this.mesh.add(this.leftLeg);

    // Right Leg
    this.rightLeg = new THREE.Group();
    this.rightLeg.position.set(0.15, 0.9, 0);

    const rightThigh = new THREE.Mesh(thighGeo, denimMat);
    rightThigh.castShadow = true;
    this.rightLeg.add(rightThigh);

    this.rightCalf = new THREE.Group();
    this.rightCalf.position.set(0, -0.42, 0);

    const rightCalfMesh = new THREE.Mesh(calfGeo, denimMat);
    rightCalfMesh.castShadow = true;
    this.rightCalf.add(rightCalfMesh);

    const rightSneaker = sneakerGroup.clone();
    this.rightCalf.add(rightSneaker);

    this.rightLeg.add(this.rightCalf);
    this.mesh.add(this.rightLeg);

    // Ground Contact Shadow Disc
    const shadowGeo = new THREE.CircleGeometry(0.65, 16);
    const shadowMat = new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.45, depthWrite: false });
    const shadow = new THREE.Mesh(shadowGeo, shadowMat);
    shadow.rotation.x = -Math.PI / 2;
    shadow.position.y = 0.02;
    this.mesh.add(shadow);
  }

  public update(
    dt: number,
    inputMoveX: number, // -1 to 1 (left to right)
    inputMoveY: number, // -1 to 1 (backward to forward)
    cameraYaw: number,
    isSprinting: boolean,
    isJumping: boolean
  ) {
    if (this.isRiding && this.currentBike) {
      // Sync player posture & position to motorcycle seat
      const seatPos = this.currentBike.getSeatPosition();
      this.position.copy(seatPos);
      this.rotation = this.currentBike.rotation;
      this.updateTransform();

      // Realistic motorcycle riding ergonomics:
      // Hands gripping handlebars, elbows bent, chest leaning forward with speed, knees bent on footrests
      const bikeSpeedRatio = Math.min(1.0, Math.abs(this.currentBike.speed) / this.currentBike.maxSpeed);

      if (this.spineGroup) this.spineGroup.rotation.x = 0.22 + bikeSpeedRatio * 0.18;
      if (this.chestGroup) this.chestGroup.rotation.x = 0.18 + bikeSpeedRatio * 0.15;
      if (this.headGroup) this.headGroup.rotation.x = -(0.35 + bikeSpeedRatio * 0.25); // Look forward down road

      if (this.leftArm && this.rightArm && this.leftForearm && this.rightForearm) {
        this.leftArm.rotation.set(-0.75, 0.25, -0.2);
        this.rightArm.rotation.set(-0.75, -0.25, 0.2);
        this.leftForearm.rotation.x = -0.55;
        this.rightForearm.rotation.x = -0.55;
      }

      if (this.leftLeg && this.rightLeg && this.leftCalf && this.rightCalf) {
        this.leftLeg.rotation.set(1.15, -0.2, 0);
        this.rightLeg.rotation.set(1.15, 0.2, 0);
        this.leftCalf.rotation.x = -1.35;
        this.rightCalf.rotation.x = -1.35;
      }

      // Bank player body with motorcycle lean
      this.mesh.rotation.z = this.currentBike.leanAngle * 0.95;
      return;
    }

    // Reset riding tilt when on foot
    this.mesh.rotation.z = 0;
    if (this.spineGroup) this.spineGroup.rotation.x = 0;
    if (this.chestGroup) this.chestGroup.rotation.x = 0;
    if (this.headGroup) this.headGroup.rotation.x = 0;

    // Attack cooldown
    if (this.isAttacking) {
      this.attackTimer -= dt;
      if (this.attackTimer <= 0) {
        this.isAttacking = false;
      }
    }

    // 1. Calculate input magnitude and world direction relative to camera
    const inputMagnitude = Math.hypot(inputMoveX, inputMoveY);
    const hasMoveInput = inputMagnitude > 0.05;

    let targetSpeed = 0;
    if (hasMoveInput) {
      const normalizedMagnitude = Math.min(1.0, inputMagnitude);
      const currentSpeed = isSprinting ? this.runSpeed : this.walkSpeed;
      targetSpeed = currentSpeed * normalizedMagnitude;

      // Joystick angle relative to camera view
      const joystickAngle = Math.atan2(inputMoveX, inputMoveY);
      const moveWorldAngle = cameraYaw + joystickAngle;

      // Shortest angular path interpolation to prevent full-rotation spinning glitches
      let angleDiff = (moveWorldAngle - this.rotation) % (Math.PI * 2);
      if (angleDiff < -Math.PI) angleDiff += Math.PI * 2;
      if (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
      this.rotation += angleDiff * Math.min(1.0, 18 * dt);

      // Move velocity forward
      this.velocity.x = Math.sin(moveWorldAngle) * targetSpeed;
      this.velocity.z = Math.cos(moveWorldAngle) * targetSpeed;
    } else {
      this.velocity.x = THREE.MathUtils.damp(this.velocity.x, 0, 14, dt);
      this.velocity.z = THREE.MathUtils.damp(this.velocity.z, 0, 14, dt);
    }

    // 2. Jump & Vertical Gravity
    const groundY = this.city.getGroundHeight(this.position.x, this.position.z);
    if (this.isGrounded) {
      this.position.y = groundY;
      this.velocity.y = 0;

      if (isJumping) {
        this.velocity.y = this.jumpStrength;
        this.isGrounded = false;
      }
    } else {
      this.velocity.y -= this.gravity * dt;
      this.position.y += this.velocity.y * dt;

      if (this.position.y <= groundY) {
        this.position.y = groundY;
        this.velocity.y = 0;
        this.isGrounded = true;
      }
    }

    // 3. Collision Handling & World Sliding
    const nextX = this.position.x + this.velocity.x * dt;
    const nextZ = this.position.z + this.velocity.z * dt;
    const testPos = new THREE.Vector3(nextX, this.position.y, nextZ);

    if (!this.city.checkCollision(testPos, 0.45)) {
      this.position.x = nextX;
      this.position.z = nextZ;
    } else {
      // Slide along unblocked axis
      if (!this.city.checkCollision(new THREE.Vector3(nextX, this.position.y, this.position.z), 0.45)) {
        this.position.x = nextX;
      } else if (!this.city.checkCollision(new THREE.Vector3(this.position.x, this.position.y, nextZ), 0.45)) {
        this.position.z = nextZ;
      }
    }

    // 4. Realistic Human Locomotion & Skeletal Kinematics
    const horizontalSpeed = Math.hypot(this.velocity.x, this.velocity.z);
    if (horizontalSpeed > 0.3 && this.isGrounded) {
      const animFreq = isSprinting ? 14.5 : 9.2;
      this.animTime += dt * animFreq;

      const legSwing = Math.sin(this.animTime) * (isSprinting ? 0.85 : 0.52);
      const armSwing = Math.sin(this.animTime) * (isSprinting ? 0.95 : 0.6);

      // Thighs & Calves (realistic knee bending during backward stride)
      if (this.leftLeg && this.rightLeg && this.leftCalf && this.rightCalf) {
        this.leftLeg.rotation.x = legSwing;
        this.rightLeg.rotation.x = -legSwing;

        this.leftCalf.rotation.x = legSwing < 0 ? -Math.abs(legSwing) * 0.9 : 0;
        this.rightCalf.rotation.x = -legSwing < 0 ? -Math.abs(legSwing) * 0.9 : 0;
      }

      // Torso natural counter-lean and spine pump
      if (this.spineGroup) {
        this.spineGroup.rotation.x = isSprinting ? 0.18 : 0.08;
        this.spineGroup.rotation.y = Math.sin(this.animTime) * 0.08;
      }

      // Arms swing opposite to legs with elbow flexion
      if (!this.isAttacking && this.leftArm && this.rightArm && this.leftForearm && this.rightForearm) {
        this.leftArm.rotation.x = -armSwing;
        this.rightArm.rotation.x = armSwing;

        this.leftForearm.rotation.x = Math.max(0, -armSwing * 0.6);
        this.rightForearm.rotation.x = Math.max(0, armSwing * 0.6);
      }

      // Realistic footstep audio
      this.footstepTimer += dt;
      const stepInterval = isSprinting ? 0.26 : 0.42;
      if (this.footstepTimer >= stepInterval) {
        sounds.playFootstep();
        this.footstepTimer = 0;
      }
    } else if (this.isGrounded) {
      // Idle human breathing & natural weight shift
      this.animTime += dt * 2.2;
      const breathe = Math.sin(this.animTime) * 0.035;

      if (this.spineGroup) {
        this.spineGroup.rotation.x = THREE.MathUtils.damp(this.spineGroup.rotation.x, breathe, 8, dt);
        this.spineGroup.rotation.y = THREE.MathUtils.damp(this.spineGroup.rotation.y, 0, 8, dt);
      }

      if (this.leftLeg && this.rightLeg && this.leftCalf && this.rightCalf) {
        this.leftLeg.rotation.x = THREE.MathUtils.damp(this.leftLeg.rotation.x, 0, 10, dt);
        this.rightLeg.rotation.x = THREE.MathUtils.damp(this.rightLeg.rotation.x, 0, 10, dt);
        this.leftCalf.rotation.x = THREE.MathUtils.damp(this.leftCalf.rotation.x, 0, 10, dt);
        this.rightCalf.rotation.x = THREE.MathUtils.damp(this.rightCalf.rotation.x, 0, 10, dt);
      }

      if (!this.isAttacking && this.leftArm && this.rightArm && this.leftForearm && this.rightForearm) {
        this.leftArm.rotation.set(breathe, 0, -0.08);
        this.rightArm.rotation.set(-breathe, 0, 0.08);
        this.leftForearm.rotation.set(-0.15, 0, 0);
        this.rightForearm.rotation.set(-0.15, 0, 0);
      }
    } else {
      // In-air jump posture: knee tuck and arms up for balance
      if (this.leftLeg && this.rightLeg && this.leftCalf && this.rightCalf) {
        this.leftLeg.rotation.x = 0.55;
        this.rightLeg.rotation.x = 0.35;
        this.leftCalf.rotation.x = -0.7;
        this.rightCalf.rotation.x = -0.5;
      }
      if (this.leftArm && this.rightArm) {
        this.leftArm.rotation.x = -0.8;
        this.rightArm.rotation.x = -0.8;
      }
    }

    // Attack punch animation
    if (this.isAttacking && this.rightArm && this.rightForearm) {
      this.rightArm.rotation.set(-1.4, 0, 0.3);
      this.rightForearm.rotation.set(-0.3, 0, 0);
    }

    this.updateTransform();
  }

  public triggerAttack() {
    if (this.isRiding) return;
    this.isAttacking = true;
    this.attackTimer = 0.28;
    sounds.playPunchImpact();
  }

  // Mount motorcycle
  public mountBike(bike: Motorcycle) {
    this.isRiding = true;
    this.currentBike = bike;
    bike.isOccupied = true;
    sounds.startMotorcycleEngine();
  }

  // Dismount motorcycle safely on the left side
  public dismountBike() {
    if (!this.isRiding || !this.currentBike) return;

    sounds.stopMotorcycleEngine();
    this.currentBike.isOccupied = false;

    // Offset player 1.4m to the left of the bike
    const exitOffset = new THREE.Vector3(-1.4, 0, 0);
    exitOffset.applyAxisAngle(new THREE.Vector3(0, 1, 0), this.currentBike.rotation);
    const targetPos = this.currentBike.position.clone().add(exitOffset);
    targetPos.y = this.city.getGroundHeight(targetPos.x, targetPos.z);

    // If left side blocked, place on right side
    if (this.city.checkCollision(targetPos, 0.45)) {
      exitOffset.set(1.4, 0, 0);
      exitOffset.applyAxisAngle(new THREE.Vector3(0, 1, 0), this.currentBike.rotation);
      targetPos.copy(this.currentBike.position).add(exitOffset);
      targetPos.y = this.city.getGroundHeight(targetPos.x, targetPos.z);
    }

    this.position.copy(targetPos);
    this.velocity.set(0, 0, 0);
    this.isRiding = false;
    this.currentBike = null;

    // Reset pose
    if (this.spineGroup) this.spineGroup.rotation.set(0, 0, 0);
    if (this.chestGroup) this.chestGroup.rotation.set(0, 0, 0);
    if (this.headGroup) this.headGroup.rotation.set(0, 0, 0);
    if (this.leftArm && this.rightArm) {
      this.leftArm.rotation.set(0, 0, 0);
      this.rightArm.rotation.set(0, 0, 0);
    }
    if (this.leftLeg && this.rightLeg && this.leftCalf && this.rightCalf) {
      this.leftLeg.rotation.set(0, 0, 0);
      this.rightLeg.rotation.set(0, 0, 0);
      this.leftCalf.rotation.set(0, 0, 0);
      this.rightCalf.rotation.set(0, 0, 0);
    }

    this.updateTransform();
  }

  public updateTransform() {
    this.mesh.position.copy(this.position);
    this.mesh.rotation.y = this.rotation;
  }

  public respawn(safePos = new THREE.Vector3(12, 0, 72)) {
    if (this.isRiding && this.currentBike) {
      this.dismountBike();
    }
    this.position.copy(safePos);
    this.velocity.set(0, 0, 0);
    this.isGrounded = true;
    this.updateTransform();
  }
}
