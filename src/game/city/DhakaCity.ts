/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as THREE from 'three';

export interface CollisionBox {
  min: THREE.Vector3;
  max: THREE.Vector3;
}

export interface LandmarkLocation {
  id: string;
  nameBn: string;
  nameEn: string;
  position: THREE.Vector3;
}

export class DhakaCity {
  public group: THREE.Group;
  public collisionBoxes: CollisionBox[] = [];
  public flyoverMesh: THREE.Mesh | null = null;
  public landmarks: LandmarkLocation[] = [];
  public streetLights: THREE.PointLight[] = [];

  constructor() {
    this.group = new THREE.Group();
    this.buildCity();
  }

  // Procedural canvas texture generator with crisp Bengali typography and graphics
  private createSignTexture(textBn: string, subTextEn: string, bgColor: string, textColor: string, accentColor: string): THREE.CanvasTexture {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 256;
    const ctx = canvas.getContext('2d')!;

    // Background
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Border and accent stripes
    ctx.strokeStyle = accentColor;
    ctx.lineWidth = 12;
    ctx.strokeRect(8, 8, canvas.width - 16, canvas.height - 16);

    ctx.fillStyle = accentColor;
    ctx.fillRect(16, 16, canvas.width - 32, 18);
    ctx.fillRect(16, canvas.height - 34, canvas.width - 32, 18);

    // Bengali Text
    ctx.fillStyle = textColor;
    ctx.font = 'bold 44px "Hind Siliguri", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(textBn, canvas.width / 2, 110);

    // English Subtext
    ctx.font = 'bold 24px "Rajdhani", sans-serif';
    ctx.letterSpacing = '2px';
    ctx.fillText(subTextEn.toUpperCase(), canvas.width / 2, 175);

    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.anisotropy = 4;
    return texture;
  }

  // High-Definition Asphalt procedural texture with crisp Bengali road markings and crosswalks
  private createRoadTexture(lanes: number): THREE.CanvasTexture {
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 1024;
    const ctx = canvas.getContext('2d')!;

    // Rich dark asphalt base
    ctx.fillStyle = '#1c1e22';
    ctx.fillRect(0, 0, 1024, 1024);

    // Micro asphalt aggregate grain noise
    for (let i = 0; i < 9000; i++) {
      const x = Math.random() * 1024;
      const y = Math.random() * 1024;
      const gray = Math.floor(18 + Math.random() * 28);
      ctx.fillStyle = `rgb(${gray},${gray},${gray})`;
      ctx.fillRect(x, y, 2.5, 2.5);
    }

    // Yellow center divider double lines
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 10;
    ctx.setLineDash([48, 36]);
    ctx.beginPath();
    ctx.moveTo(504, 0);
    ctx.lineTo(504, 1024);
    ctx.moveTo(520, 0);
    ctx.lineTo(520, 1024);
    ctx.stroke();

    // White lane divider dashes (4 lanes)
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 7;
    ctx.setLineDash([32, 48]);
    ctx.beginPath();
    ctx.moveTo(260, 0);
    ctx.lineTo(260, 1024);
    ctx.moveTo(764, 0);
    ctx.lineTo(764, 1024);
    ctx.stroke();

    // Solid white shoulder edge lines
    ctx.setLineDash([]);
    ctx.lineWidth = 12;
    ctx.strokeStyle = '#ffffff';
    ctx.beginPath();
    ctx.moveTo(32, 0);
    ctx.lineTo(32, 1024);
    ctx.moveTo(992, 0);
    ctx.lineTo(992, 1024);
    ctx.stroke();

    // Zebra crosswalk marking at intersection top
    ctx.fillStyle = '#ffffff';
    for (let stripe = 60; stripe <= 960; stripe += 60) {
      ctx.fillRect(stripe, 40, 32, 140);
    }

    // Painted Bengali Road Speed Limit: "গতিসীমা ৪০"
    ctx.fillStyle = 'rgba(255, 255, 255, 0.75)';
    ctx.font = 'bold 36px "Hind Siliguri", sans-serif';
    ctx.textAlign = 'center';
    ctx.save();
    ctx.translate(380, 520);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText('গতিসীমা ৪০', 0, 0);
    ctx.restore();

    ctx.save();
    ctx.translate(644, 520);
    ctx.rotate(Math.PI / 2);
    ctx.fillText('গতিসীমা ৪০', 0, 0);
    ctx.restore();

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(1, 10);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.anisotropy = 16;
    return texture;
  }

  private buildCity() {
    // 1. Terrain Base
    const groundGeo = new THREE.PlaneGeometry(600, 600);
    const groundMat = new THREE.MeshStandardMaterial({
      color: 0x1f2421,
      roughness: 0.95,
      metalness: 0.05,
    });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    ground.position.y = -0.05;
    this.group.add(ground);

    // 2. Main Road Network (Mirpur Road, Motijheel Blvd, Gulshan Ave)
    const roadMat = new THREE.MeshStandardMaterial({
      map: this.createRoadTexture(4),
      roughness: 0.85,
      metalness: 0.15,
    });

    // North-South Avenue (Mirpur Road to Motijheel, 400m long, 24m wide)
    const mainAvenueGeo = new THREE.PlaneGeometry(24, 400);
    const mainAvenue = new THREE.Mesh(mainAvenueGeo, roadMat);
    mainAvenue.rotation.x = -Math.PI / 2;
    mainAvenue.position.set(0, 0.01, 0);
    mainAvenue.receiveShadow = true;
    this.group.add(mainAvenue);

    // East-West Cross Avenue (Dhanmondi to Gulshan Avenue)
    const crossAvenueGeo = new THREE.PlaneGeometry(360, 24);
    const crossRoadMat = roadMat.clone();
    (crossRoadMat.map as THREE.CanvasTexture).repeat.set(10, 1);
    const crossAvenue = new THREE.Mesh(crossAvenueGeo, crossRoadMat);
    crossAvenue.rotation.x = -Math.PI / 2;
    crossAvenue.position.set(0, 0.02, 0);
    crossAvenue.receiveShadow = true;
    this.group.add(crossAvenue);

    // Secondary Motijheel Industrial Strip (Z = 120)
    const indusRoadGeo = new THREE.PlaneGeometry(280, 18);
    const indusRoad = new THREE.Mesh(indusRoadGeo, roadMat);
    indusRoad.rotation.x = -Math.PI / 2;
    indusRoad.position.set(30, 0.02, 120);
    indusRoad.receiveShadow = true;
    this.group.add(indusRoad);

    // 3. Sidewalks & Curbs
    this.buildSidewalks();

    // 4. Elevated Flyover (Dhaka Moghbazar-style flyover)
    this.buildFlyover();

    // 5. Districts & Buildings
    this.buildMotijheelDistrict();
    this.buildOldDhakaShophouses();
    this.buildGulshanCommercialTowers();
    this.buildTongTeaStalls();

    // 6. Street Details & Bengali Signage
    this.buildStreetFurniture();

    // 7. Perimeter Vegetation (Trees & Dhaka Palms)
    this.buildVegetation();

    // Register Key Landmarks
    this.landmarks.push(
      { id: 'tong_start', nameBn: 'মতিঝিল টং দোকান (বড় ভাই)', nameEn: 'Motijheel Tong Shop (Rahim Bhai)', position: new THREE.Vector3(18, 0, 80) },
      { id: 'warehouse', nameBn: 'সিন্ডিকেট গোডাউন (মতিঝিল)', nameEn: 'Syndicate Warehouse (Motijheel)', position: new THREE.Vector3(95, 0, 125) },
      { id: 'flyover_ramp', nameBn: 'ফ্লাইওভার প্রবেশপথ', nameEn: 'Flyover Entry Ramp', position: new THREE.Vector3(-12, 0, 150) },
      { id: 'gulshan_safehouse', nameBn: 'গুলশান ড্রপ সেফহাউস', nameEn: 'Gulshan Safehouse Drop', position: new THREE.Vector3(-85, 0, -110) },
    );
  }

  // Elevated Dhaka Flyover
  private buildFlyover() {
    const flyoverGroup = new THREE.Group();
    const deckMat = new THREE.MeshStandardMaterial({
      color: 0x475569,
      roughness: 0.7,
      metalness: 0.2,
    });

    const railMat = new THREE.MeshStandardMaterial({
      color: 0x3b82f6, // Dhaka blue safety guard rails
      roughness: 0.4,
      metalness: 0.8,
    });

    // Elevated Deck: curves slightly from (-15, 6, 140) to (-15, 6, -140)
    const deckLength = 280;
    const deckWidth = 14;
    const flyoverHeight = 5.5;

    // Main flat span
    const spanGeo = new THREE.BoxGeometry(deckWidth, 0.8, deckLength);
    const span = new THREE.Mesh(spanGeo, deckMat);
    span.position.set(-18, flyoverHeight, 0);
    span.receiveShadow = true;
    span.castShadow = true;
    flyoverGroup.add(span);

    // Left and right guardrails
    const railGeo = new THREE.BoxGeometry(0.5, 1.2, deckLength);
    const leftRail = new THREE.Mesh(railGeo, railMat);
    leftRail.position.set(-18 - deckWidth / 2 + 0.25, flyoverHeight + 0.8, 0);
    const rightRail = new THREE.Mesh(railGeo, railMat);
    rightRail.position.set(-18 + deckWidth / 2 - 0.25, flyoverHeight + 0.8, 0);
    flyoverGroup.add(leftRail);
    flyoverGroup.add(rightRail);

    // Flyover Pillars (Every 30m)
    const pillarGeo = new THREE.CylinderGeometry(1.2, 1.4, flyoverHeight, 16);
    const pillarMat = new THREE.MeshStandardMaterial({ color: 0x64748b, roughness: 0.9 });
    for (let z = -120; z <= 120; z += 35) {
      const pillar = new THREE.Mesh(pillarGeo, pillarMat);
      pillar.position.set(-18, flyoverHeight / 2, z);
      pillar.castShadow = true;
      flyoverGroup.add(pillar);
      this.addCollision(pillar.position, 1.5, flyoverHeight, 1.5);
    }

    // South Ramp Up (from Z=180 to Z=140)
    const rampLength = 50;
    const rampGeo = new THREE.BoxGeometry(deckWidth, 0.8, rampLength);
    const southRamp = new THREE.Mesh(rampGeo, deckMat);
    southRamp.position.set(-18, flyoverHeight / 2, 165);
    southRamp.rotation.x = -Math.atan2(flyoverHeight, rampLength);
    flyoverGroup.add(southRamp);

    // North Ramp Down (from Z=-140 to Z=-180)
    const northRamp = new THREE.Mesh(rampGeo, deckMat);
    northRamp.position.set(-18, flyoverHeight / 2, -165);
    northRamp.rotation.x = Math.atan2(flyoverHeight, rampLength);
    flyoverGroup.add(northRamp);

    this.group.add(flyoverGroup);
  }

  // Sidewalks along roads
  private buildSidewalks() {
    const curbMat = new THREE.MeshStandardMaterial({
      color: 0x94a3b8,
      roughness: 0.9,
    });

    // Left and Right sidewalks along main avenue
    const swGeo = new THREE.BoxGeometry(4, 0.2, 400);
    const leftSw = new THREE.Mesh(swGeo, curbMat);
    leftSw.position.set(-14, 0.1, 0);
    leftSw.receiveShadow = true;
    this.group.add(leftSw);

    const rightSw = new THREE.Mesh(swGeo, curbMat);
    rightSw.position.set(14, 0.1, 0);
    rightSw.receiveShadow = true;
    this.group.add(rightSw);
  }

  // Motijheel Commercial & Industrial Zone
  private buildMotijheelDistrict() {
    // Warehouse complex
    const whGroup = new THREE.Group();
    whGroup.position.set(95, 0, 125);

    // Main corrugated shed
    const shedGeo = new THREE.BoxGeometry(32, 9, 24);
    const shedMat = new THREE.MeshStandardMaterial({
      color: 0xb45309, // Dhaka rust-red corrugated industrial color
      roughness: 0.7,
      metalness: 0.3,
    });
    const shed = new THREE.Mesh(shedGeo, shedMat);
    shed.position.set(0, 4.5, 0);
    shed.castShadow = true;
    whGroup.add(shed);

    // Warehouse Sign
    const signTex = this.createSignTexture('মতিঝিল গোডাউন নং ৪', 'Motijheel Syndicate Logistics', '#1e293b', '#f8fafc', '#f59e0b');
    const signGeo = new THREE.PlaneGeometry(16, 4);
    const signMat = new THREE.MeshBasicMaterial({ map: signTex });
    const sign = new THREE.Mesh(signGeo, signMat);
    sign.position.set(0, 7.5, 12.1);
    whGroup.add(sign);

    // Cargo containers
    const colors = [0x0284c7, 0xd97706, 0x16a34a, 0xdc2626];
    for (let i = 0; i < 4; i++) {
      const containerGeo = new THREE.BoxGeometry(6, 3, 2.5);
      const containerMat = new THREE.MeshStandardMaterial({ color: colors[i], roughness: 0.6, metalness: 0.4 });
      const container = new THREE.Mesh(containerGeo, containerMat);
      container.position.set(-10 + i * 7, 1.5, 18);
      container.castShadow = true;
      whGroup.add(container);
      this.addCollision(new THREE.Vector3(95 - 10 + i * 7, 0, 125 + 18), 6, 3, 2.5);
    }

    this.group.add(whGroup);
    this.addCollision(whGroup.position, 33, 9, 25);
  }

  // Old Dhaka Shophouses with colorful balconies and shutter gates
  private buildOldDhakaShophouses() {
    const shopColors = [0xfef08a, 0xfbcfe8, 0xbbf7d0, 0xfde047, 0xbae6fd];
    const shopSigns = [
      { bn: 'ঢাকা বিরিয়ানি অ্যান্ড কাবাব', en: 'Dhaka Biryani & Kebab' },
      { bn: 'হাজী বিরিয়ানি কর্ণার', en: 'Haji Biryani Corner' },
      { bn: 'সোনার বাংলা জুয়েলার্স', en: 'Sonar Bangla Jewellers' },
      { bn: 'জননী ফার্মেসি', en: 'Jononi Pharmacy' },
    ];

    for (let i = 0; i < 6; i++) {
      const shopGroup = new THREE.Group();
      const zPos = -120 + i * 40;
      shopGroup.position.set(30, 0, zPos);

      // 3-tier shophouse
      const baseGeo = new THREE.BoxGeometry(16, 12, 16);
      const baseMat = new THREE.MeshStandardMaterial({
        color: shopColors[i % shopColors.length],
        roughness: 0.85,
      });
      const baseMesh = new THREE.Mesh(baseGeo, baseMat);
      baseMesh.position.y = 6;
      baseMesh.castShadow = true;
      shopGroup.add(baseMesh);

      // Balcony projection
      const balconyGeo = new THREE.BoxGeometry(14, 0.4, 3);
      const balconyMat = new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.5 });
      const balcony = new THREE.Mesh(balconyGeo, balconyMat);
      balcony.position.set(0, 5, -8.5);
      shopGroup.add(balcony);

      // Rooftop water tank (Dhaka signature black plastic tank)
      const tankGeo = new THREE.CylinderGeometry(1.2, 1.2, 2, 16);
      const tankMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.4 });
      const tank = new THREE.Mesh(tankGeo, tankMat);
      tank.position.set(3, 13, 0);
      shopGroup.add(tank);

      // Street neon/lit shop sign
      const signInfo = shopSigns[i % shopSigns.length];
      const signTex = this.createSignTexture(signInfo.bn, signInfo.en, '#991b1b', '#fef08a', '#fbbf24');
      const signGeo = new THREE.PlaneGeometry(10, 2.8);
      const signMat = new THREE.MeshBasicMaterial({ map: signTex });
      const sign = new THREE.Mesh(signGeo, signMat);
      sign.position.set(0, 3.8, -8.1);
      shopGroup.add(sign);

      this.group.add(shopGroup);
      this.addCollision(shopGroup.position, 17, 12, 17);
    }
  }

  // Gulshan High-Rise Commercial Towers
  private buildGulshanCommercialTowers() {
    const towerCoords = [
      { x: -75, z: -80, h: 42, w: 22, color: 0x0284c7 },
      { x: -85, z: -110, h: 48, w: 26, color: 0x0f172a }, // Gulshan Safehouse
      { x: -75, z: -150, h: 36, w: 20, color: 0x059669 },
      { x: -80, z: 40, h: 32, w: 22, color: 0x475569 },
    ];

    towerCoords.forEach((tower, idx) => {
      const towerGroup = new THREE.Group();
      towerGroup.position.set(tower.x, 0, tower.z);

      // Main tower body
      const bodyGeo = new THREE.BoxGeometry(tower.w, tower.h, tower.w);
      const bodyMat = new THREE.MeshStandardMaterial({
        color: tower.color,
        roughness: 0.35,
        metalness: 0.65,
      });
      const body = new THREE.Mesh(bodyGeo, bodyMat);
      body.position.y = tower.h / 2;
      body.castShadow = true;
      towerGroup.add(body);

      // Glass floor accent bands
      const bandCount = Math.floor(tower.h / 4);
      for (let b = 1; b < bandCount; b++) {
        const bandGeo = new THREE.BoxGeometry(tower.w + 0.3, 0.4, tower.w + 0.3);
        const bandMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.2, metalness: 0.9 });
        const band = new THREE.Mesh(bandGeo, bandMat);
        band.position.y = b * 4;
        towerGroup.add(band);
      }

      // Safehouse special signage on Gulshan Safehouse
      if (idx === 1) {
        const signTex = this.createSignTexture('গুলশান সেফহাউস • MJ সিন্ডিকেট', 'Gulshan Safehouse Headquarters', '#0f172a', '#22c55e', '#16a34a');
        const signGeo = new THREE.PlaneGeometry(16, 4.5);
        const signMat = new THREE.MeshBasicMaterial({ map: signTex });
        const sign = new THREE.Mesh(signGeo, signMat);
        sign.position.set(0, 10, tower.w / 2 + 0.2);
        towerGroup.add(sign);
      }

      this.group.add(towerGroup);
      this.addCollision(towerGroup.position, tower.w + 1, tower.h, tower.w + 1);
    });
  }

  // Roadside Tong Tea Stalls (টং দোকান)
  private buildTongTeaStalls() {
    const tongGroup = new THREE.Group();
    tongGroup.position.set(18, 0, 80);

    // Wooden shack base
    const shackGeo = new THREE.BoxGeometry(6, 3.2, 4);
    const shackMat = new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.95 });
    const shack = new THREE.Mesh(shackGeo, shackMat);
    shack.position.y = 1.6;
    shack.castShadow = true;
    tongGroup.add(shack);

    // Corrugated tin roof overhang
    const roofGeo = new THREE.BoxGeometry(7, 0.2, 5.5);
    const roofMat = new THREE.MeshStandardMaterial({ color: 0x64748b, roughness: 0.4, metalness: 0.7 });
    const roof = new THREE.Mesh(roofGeo, roofMat);
    roof.position.set(0, 3.3, 0.5);
    roof.rotation.x = 0.08;
    tongGroup.add(roof);

    // Bench for customers
    const benchGeo = new THREE.BoxGeometry(4.5, 0.5, 0.8);
    const benchMat = new THREE.MeshStandardMaterial({ color: 0x92400e });
    const bench = new THREE.Mesh(benchGeo, benchMat);
    bench.position.set(0, 0.25, 3.2);
    tongGroup.add(bench);

    // Kettle & tea glasses on counter
    const kettleGeo = new THREE.CylinderGeometry(0.3, 0.4, 0.6, 12);
    const kettleMat = new THREE.MeshStandardMaterial({ color: 0xd4d4d8, metalness: 0.9, roughness: 0.2 });
    const kettle = new THREE.Mesh(kettleGeo, kettleMat);
    kettle.position.set(1.5, 1.8, 1.8);
    tongGroup.add(kettle);

    // Signboard: "ভাই ভাই টি স্টল • স্পেশাল মালাই চা"
    const signTex = this.createSignTexture('ভাই ভাই টি স্টল • স্পেশাল মালাই চা', 'Bhai Bhai Special Tea Stall', '#15803d', '#ffffff', '#eab308');
    const signGeo = new THREE.PlaneGeometry(5, 1.5);
    const signMat = new THREE.MeshBasicMaterial({ map: signTex });
    const sign = new THREE.Mesh(signGeo, signMat);
    sign.position.set(0, 2.7, 2.05);
    tongGroup.add(sign);

    this.group.add(tongGroup);
    this.addCollision(tongGroup.position, 6.5, 3.5, 5);
  }

  // Streetlights, overhead Dhaka highway signboards, rickshaw stands
  private buildStreetFurniture() {
    // Overhead highway sign across Mirpur Road
    const overheadSignGroup = new THREE.Group();
    overheadSignGroup.position.set(0, 0, 0);

    const gantryMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.8, roughness: 0.3 });
    const gantryBeam = new THREE.Mesh(new THREE.BoxGeometry(26, 0.6, 0.6), gantryMat);
    gantryBeam.position.y = 8;
    const leftPillar = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.4, 8, 12), gantryMat);
    leftPillar.position.set(-13, 4, 0);
    const rightPillar = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.4, 8, 12), gantryMat);
    rightPillar.position.set(13, 4, 0);

    overheadSignGroup.add(gantryBeam, leftPillar, rightPillar);

    // Highway Signboard: "মতিঝিল সোজা ↑ | গুলশান ডানে → | গতিসীমা ৪০"
    const hwSignTex = this.createSignTexture('↑ মতিঝিল সোজা • গুলশান ডানে →', 'Dhaka Central Express • Speed 40', '#065f46', '#ffffff', '#fbbf24');
    const hwSign = new THREE.Mesh(new THREE.PlaneGeometry(14, 3.2), new THREE.MeshBasicMaterial({ map: hwSignTex }));
    hwSign.position.set(0, 8, 0.35);
    overheadSignGroup.add(hwSign);

    this.group.add(overheadSignGroup);
    this.addCollision(new THREE.Vector3(-13, 0, 0), 1, 8, 1);
    this.addCollision(new THREE.Vector3(13, 0, 0), 1, 8, 1);

    // Streetlights along avenue
    for (let z = -160; z <= 160; z += 40) {
      this.createStreetlight(13.5, z, false);
      this.createStreetlight(-13.5, z, true);
    }
  }

  private createStreetlight(x: number, z: number, mirror: boolean) {
    const poleGroup = new THREE.Group();
    poleGroup.position.set(x, 0, z);

    const poleMat = new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.8, roughness: 0.3 });
    const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.25, 7.5, 8), poleMat);
    pole.position.y = 3.75;
    poleGroup.add(pole);

    const arm = new THREE.Mesh(new THREE.BoxGeometry(2.5, 0.15, 0.15), poleMat);
    arm.position.set(mirror ? 1.2 : -1.2, 7.4, 0);
    poleGroup.add(arm);

    // Lamp bulb head
    const lamp = new THREE.Mesh(
      new THREE.BoxGeometry(0.8, 0.2, 0.4),
      new THREE.MeshStandardMaterial({ color: 0xfef08a, emissive: 0xfef08a, emissiveIntensity: 1.5 })
    );
    lamp.position.set(mirror ? 2.2 : -2.2, 7.3, 0);
    poleGroup.add(lamp);

    // Point Light for night illumination
    const light = new THREE.PointLight(0xfff1aa, 0, 25);
    light.position.set(mirror ? 2.2 : -2.2, 7.0, 0);
    poleGroup.add(light);
    this.streetLights.push(light);

    this.group.add(poleGroup);
    this.addCollision(new THREE.Vector3(x, 0, z), 0.5, 7.5, 0.5);
  }

  // Tropical Trees & Dhaka Roadside Palms
  private buildVegetation() {
    const treeCoords = [
      { x: 16, z: -60 }, { x: 16, z: -20 }, { x: 16, z: 20 }, { x: 16, z: 60 },
      { x: -16, z: -60 }, { x: -16, z: -20 }, { x: -16, z: 20 }, { x: -16, z: 60 },
      { x: 45, z: 20 }, { x: 45, z: -40 }, { x: -45, z: 20 }, { x: -45, z: -40 }
    ];

    const trunkMat = new THREE.MeshStandardMaterial({ color: 0x543d2b, roughness: 0.9 });
    const foliageMat = new THREE.MeshStandardMaterial({ color: 0x15803d, roughness: 0.8 });

    treeCoords.forEach(pos => {
      const treeGroup = new THREE.Group();
      treeGroup.position.set(pos.x, 0, pos.z);

      // Trunk
      const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.45, 4.5, 8), trunkMat);
      trunk.position.y = 2.25;
      trunk.castShadow = true;
      treeGroup.add(trunk);

      // Foliage canopy (layered spheres/cones for tropical look)
      const canopy1 = new THREE.Mesh(new THREE.DodecahedronGeometry(2.2, 1), foliageMat);
      canopy1.position.y = 4.8;
      canopy1.castShadow = true;
      const canopy2 = new THREE.Mesh(new THREE.DodecahedronGeometry(1.6, 1), foliageMat);
      canopy2.position.set(0.4, 6.0, 0.2);
      canopy2.castShadow = true;

      treeGroup.add(canopy1, canopy2);
      this.group.add(treeGroup);
      this.addCollision(treeGroup.position, 1, 5, 1);
    });
  }

  // Register AABB collision bounds
  private addCollision(center: THREE.Vector3, sizeX: number, sizeY: number, sizeZ: number) {
    this.collisionBoxes.push({
      min: new THREE.Vector3(center.x - sizeX / 2, center.y, center.z - sizeZ / 2),
      max: new THREE.Vector3(center.x + sizeX / 2, center.y + sizeY, center.z + sizeZ / 2),
    });
  }

  // Check collision against city obstacles
  public checkCollision(pos: THREE.Vector3, radius: number = 0.6): boolean {
    for (let i = 0; i < this.collisionBoxes.length; i++) {
      const b = this.collisionBoxes[i];
      if (
        pos.x + radius > b.min.x &&
        pos.x - radius < b.max.x &&
        pos.z + radius > b.min.z &&
        pos.z - radius < b.max.z &&
        pos.y < b.max.y &&
        pos.y + 1.8 > b.min.y
      ) {
        return true;
      }
    }
    return false;
  }

  // Calculate ground height (handling flyover ramps & deck)
  public getGroundHeight(x: number, z: number): number {
    // Flyover zone: x between -25 and -11
    if (x >= -25 && x <= -11) {
      // Main span: z between -140 and 140
      if (z >= -140 && z <= 140) {
        return 5.5;
      }
      // South Ramp: z between 140 and 190
      if (z > 140 && z <= 190) {
        const ratio = (190 - z) / 50;
        return ratio * 5.5;
      }
      // North Ramp: z between -190 and -140
      if (z >= -190 && z < -140) {
        const ratio = (z - (-190)) / 50;
        return ratio * 5.5;
      }
    }
    return 0; // Ground plane height
  }

  // Day/Night streetlights toggle
  public setNightMode(isNight: boolean) {
    this.streetLights.forEach(light => {
      light.intensity = isNight ? 18 : 0;
    });
  }
}
