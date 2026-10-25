/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { sounds } from './audio/SoundManager';
import { DhakaCity } from './city/DhakaCity';
import { Motorcycle } from './entities/Motorcycle';
import { Player } from './entities/Player';
import { MissionManager } from './missions/MissionSystem';
import { TrafficSystem } from './traffic/TrafficSystem';
import { ActionInput, GraphicsQuality, JoystickInput } from '../types/game';

// Reusable math vectors to guarantee zero garbage collection in render loop
const _cameraOffset = new THREE.Vector3();
const _targetLookAt = new THREE.Vector3();
const _desiredCamPos = new THREE.Vector3();

export class GameEngine {
  public container: HTMLElement;
  public renderer: THREE.WebGLRenderer;
  public scene: THREE.Scene;
  public camera: THREE.PerspectiveCamera;
  
  public city: DhakaCity;
  public player: Player;
  public motorcycle: Motorcycle;
  public traffic: TrafficSystem;
  public missionManager: MissionManager;

  // Camera Orbit Settings
  public cameraYaw: number = 0; // Horizontal angle in radians
  public cameraPitch: number = 0.28; // Vertical tilt in radians
  public cameraSensitivity: number = 1.0;
  private cameraDistance: number = 4.8;
  private cameraHeight: number = 2.2;

  // Day/Night & Lighting
  public isNight: boolean = false;
  private dirSunLight: THREE.DirectionalLight;
  private hemiLight: THREE.HemisphereLight;

  // Game Loop
  private clock: THREE.Clock;
  private frameId: number = 0;
  private isRunning: boolean = false;
  private isPaused: boolean = false;
  private isSoftwareGl: boolean = false;

  // Current inputs
  public moveInput: JoystickInput = { x: 0, y: 0, active: false };
  public lookInput: JoystickInput = { x: 0, y: 0, active: false };
  private smoothedMoveX: number = 0;
  private smoothedMoveY: number = 0;
  public actionInput: ActionInput = {
    sprint: false,
    jump: false,
    interact: false,
    enterExitVehicle: false,
    attack: false,
    accelerate: false,
    brake: false,
    handbrake: false,
    horn: false,
    headlights: false,
    recenterCamera: false,
  };

  // Keyboard state
  private keys: Record<string, boolean> = {};

  // Telemetry callback
  public onFpsUpdate?: (fps: number) => void;
  public onVehicleProximity?: (isNearBike: boolean) => void;
  public onSpeedUpdate?: (speedKmH: number) => void;

  private fpsFrames: number = 0;
  private fpsLastTime: number = 0;

  constructor(container: HTMLElement, graphicsQuality: GraphicsQuality = 'high') {
    this.container = container;
    this.clock = new THREE.Clock();

    // 1. Detect Software WebGL
    this.isSoftwareGl = (() => {
      const gl = document.createElement('canvas').getContext('webgl2');
      if (!gl) return true;
      const ext = gl.getExtension('WEBGL_debug_renderer_info');
      const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
      const gpu = String(gl.getParameter(param));
      gl.getExtension('WEBGL_lose_context')?.loseContext();
      return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
    })();

    // 2. Renderer setup with high graphics regulation & PBR pipeline
    this.renderer = new THREE.WebGLRenderer({
      antialias: !this.isSoftwareGl && graphicsQuality !== 'low',
      powerPreference: 'high-performance',
    });
    this.renderer.setSize(container.clientWidth, container.clientHeight);
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.25;
    this.renderer.setPixelRatio(
      this.isSoftwareGl
        ? 1
        : graphicsQuality === 'low'
        ? 1
        : graphicsQuality === 'medium'
        ? Math.min(window.devicePixelRatio, 1.75)
        : Math.min(window.devicePixelRatio, 2.5)
    );
    this.renderer.shadowMap.enabled = !this.isSoftwareGl && graphicsQuality !== 'low';
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    container.appendChild(this.renderer.domElement);

    // 3. Scene & Camera
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(65, container.clientWidth / container.clientHeight, 0.1, 800);

    // Procedural Studio Environment Reflection
    const pmrem = new THREE.PMREMGenerator(this.renderer);
    this.scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    pmrem.dispose();

    // Fog: Atmospheric Dhaka Golden/Horizon Mist
    this.scene.fog = new THREE.FogExp2(0x94a3b8, 0.0035);

    // 4. Studio Lighting Rig with 4096 high-resolution soft shadows
    this.hemiLight = new THREE.HemisphereLight(0xbae6fd, 0x1e293b, 1.45);
    this.scene.add(this.hemiLight);

    this.dirSunLight = new THREE.DirectionalLight(0xfff7ed, 2.4);
    this.dirSunLight.position.set(70, 110, 50);
    this.dirSunLight.castShadow = !this.isSoftwareGl && graphicsQuality !== 'low';
    this.dirSunLight.shadow.mapSize.width = graphicsQuality === 'high' ? 4096 : 2048;
    this.dirSunLight.shadow.mapSize.height = graphicsQuality === 'high' ? 4096 : 2048;
    this.dirSunLight.shadow.camera.near = 10;
    this.dirSunLight.shadow.camera.far = 300;
    this.dirSunLight.shadow.camera.left = -90;
    this.dirSunLight.shadow.camera.right = 90;
    this.dirSunLight.shadow.camera.top = 90;
    this.dirSunLight.shadow.camera.bottom = -90;
    this.dirSunLight.shadow.bias = -0.0003;
    this.dirSunLight.shadow.normalBias = 0.02;
    this.scene.add(this.dirSunLight);

    // 5. Initialize City, Entities, Traffic, Mission
    this.city = new DhakaCity();
    this.scene.add(this.city.group);

    this.motorcycle = new Motorcycle(this.city, new THREE.Vector3(14, 0, 72));
    this.scene.add(this.motorcycle.mesh);

    this.player = new Player(this.city);
    this.scene.add(this.player.mesh);

    this.traffic = new TrafficSystem(this.city);
    this.scene.add(this.traffic.group);

    this.missionManager = new MissionManager();
    this.scene.add(this.missionManager.objectiveBeacon);

    // 6. Event Listeners
    window.addEventListener('resize', this.onResize);
    window.addEventListener('keydown', this.onKeyDown);
    window.addEventListener('keyup', this.onKeyUp);

    // Set initial camera behind player
    this.cameraYaw = Math.PI;
    this.cameraPitch = 0.25;

    this.start();
  }

  public setQuality(quality: GraphicsQuality) {
    this.renderer.setPixelRatio(
      this.isSoftwareGl
        ? 1
        : quality === 'low'
        ? 1
        : quality === 'medium'
        ? Math.min(window.devicePixelRatio, 1.75)
        : Math.min(window.devicePixelRatio, 2.5)
    );
    this.renderer.shadowMap.enabled = !this.isSoftwareGl && quality !== 'low';
    this.dirSunLight.castShadow = !this.isSoftwareGl && quality !== 'low';
    this.dirSunLight.shadow.mapSize.width = quality === 'high' ? 4096 : 2048;
    this.dirSunLight.shadow.mapSize.height = quality === 'high' ? 4096 : 2048;
  }

  public toggleDayNight(): boolean {
    this.isNight = !this.isNight;
    if (this.isNight) {
      // Night lighting
      this.scene.background = new THREE.Color(0x020617);
      if (this.scene.fog instanceof THREE.FogExp2) {
        this.scene.fog.color.setHex(0x030712);
        this.scene.fog.density = 0.0045;
      }
      this.hemiLight.color.setHex(0x1e1b4b);
      this.hemiLight.groundColor.setHex(0x020617);
      this.hemiLight.intensity = 0.45;

      this.dirSunLight.color.setHex(0x60a5fa);
      this.dirSunLight.intensity = 0.6;
      this.city.setNightMode(true);
    } else {
      // Day lighting
      this.scene.background = new THREE.Color(0x93c5fd);
      if (this.scene.fog instanceof THREE.FogExp2) {
        this.scene.fog.color.setHex(0x94a3b8);
        this.scene.fog.density = 0.0035;
      }
      this.hemiLight.color.setHex(0xbae6fd);
      this.hemiLight.groundColor.setHex(0x1e293b);
      this.hemiLight.intensity = 1.4;

      this.dirSunLight.color.setHex(0xfffbeb);
      this.dirSunLight.intensity = 2.2;
      this.city.setNightMode(false);
    }
    return this.isNight;
  }

  private onResize = () => {
    if (!this.container) return;
    const width = this.container.clientWidth;
    const height = this.container.clientHeight;
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  };

  private onKeyDown = (e: KeyboardEvent) => {
    this.keys[e.code] = true;

    if (e.code === 'KeyF' || e.code === 'KeyE') {
      this.triggerEnterExitVehicle();
    }
    if (e.code === 'KeyH') {
      this.triggerHorn();
    }
    if (e.code === 'KeyL') {
      this.motorcycle.toggleHeadlight();
    }
    if (e.code === 'KeyC') {
      this.recenterCamera();
    }
    if (e.code === 'KeyR') {
      this.player.triggerAttack();
    }
  };

  private onKeyUp = (e: KeyboardEvent) => {
    this.keys[e.code] = false;
  };

  public triggerEnterExitVehicle() {
    if (this.player.isRiding) {
      this.player.dismountBike();
      sounds.playClick();
    } else {
      const dist = this.player.position.distanceTo(this.motorcycle.position);
      if (dist <= 3.2) {
        this.player.mountBike(this.motorcycle);
        sounds.playClick();
      }
    }
  }

  public triggerHorn() {
    sounds.playHorn();
  }

  public recenterCamera() {
    if (this.player.isRiding) {
      this.cameraYaw = this.motorcycle.rotation;
    } else {
      this.cameraYaw = this.player.rotation;
    }
    this.cameraPitch = 0.25;
  }

  public start() {
    if (this.isRunning) return;
    this.isRunning = true;
    this.clock.start();
    this.tick();
  }

  public pause(paused: boolean) {
    this.isPaused = paused;
    if (paused) {
      sounds.stopMotorcycleEngine();
    } else {
      if (this.player.isRiding) {
        sounds.startMotorcycleEngine();
      }
    }
  }

  private tick = () => {
    if (!this.isRunning) return;

    const rawDt = this.clock.getDelta();
    const dt = Math.min(rawDt, 0.05); // Clamp dt to prevent simulation explosion

    if (!this.isPaused) {
      this.updateSimulation(dt);
    }

    this.renderer.render(this.scene, this.camera);

    // FPS Telemetry
    this.fpsFrames++;
    const now = performance.now();
    if (now - this.fpsLastTime >= 1000) {
      if (this.onFpsUpdate) {
        this.onFpsUpdate(Math.round((this.fpsFrames * 1000) / (now - this.fpsLastTime)));
      }
      this.fpsFrames = 0;
      this.fpsLastTime = now;
    }

    if (this.isSoftwareGl) {
      this.afterDraw(this.tick);
    } else {
      this.frameId = requestAnimationFrame(this.tick);
    }
  };

  private afterDraw(cb: () => void) {
    const gl = this.renderer.getContext() as WebGL2RenderingContext;
    const sync = gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0);
    gl.flush();
    const poll = () => {
      const state = sync && gl.getSyncParameter(sync, gl.SYNC_STATUS);
      if (state === gl.UNSIGNALED) {
        this.frameId = window.setTimeout(poll, 5);
      } else {
        if (sync) gl.deleteSync(sync);
        this.frameId = window.setTimeout(cb, 80);
      }
    };
    this.frameId = window.setTimeout(poll, 5);
  }

  private updateSimulation(dt: number) {
    // 1. Merge Mobile Joystick & Desktop Keyboard Inputs
    let moveX = this.moveInput.x;
    let moveY = this.moveInput.y;

    if (this.keys['KeyA'] || this.keys['ArrowLeft']) moveX -= 1;
    if (this.keys['KeyD'] || this.keys['ArrowRight']) moveX += 1;
    if (this.keys['KeyW'] || this.keys['ArrowUp']) moveY += 1;
    if (this.keys['KeyS'] || this.keys['ArrowDown']) moveY -= 1;

    // Clamp diagonal input
    const inputMag = Math.hypot(moveX, moveY);
    if (inputMag > 1.0) {
      moveX /= inputMag;
      moveY /= inputMag;
    }

    // Exponential low-pass input smoothing for zero input lag and buttery-smooth steering
    this.smoothedMoveX = THREE.MathUtils.damp(this.smoothedMoveX, moveX, 32, dt);
    this.smoothedMoveY = THREE.MathUtils.damp(this.smoothedMoveY, moveY, 32, dt);

    // Camera look input (seamlessly handles both virtual camera joystick and screen swipe delta)
    if (this.lookInput.active) {
      const isSwipe = Math.abs(this.lookInput.x) > 1.0 || Math.abs(this.lookInput.y) > 1.0;
      const factor = isSwipe ? 0.005 : 3.0 * dt;
      this.cameraYaw -= this.lookInput.x * this.cameraSensitivity * factor;
      this.cameraPitch -= this.lookInput.y * this.cameraSensitivity * factor;
      this.cameraPitch = Math.max(0.05, Math.min(1.2, this.cameraPitch));
      if (isSwipe) {
        this.lookInput.x = 0;
        this.lookInput.y = 0;
      }
    }

    // Sprint & Jump
    const isSprinting = this.actionInput.sprint || this.keys['ShiftLeft'] || this.keys['ShiftRight'];
    const isJumping = this.actionInput.jump || this.keys['Space'];

    // 2. Vehicle Proximity Check
    const distToBike = this.player.position.distanceTo(this.motorcycle.position);
    const isNearBike = distToBike <= 3.2 && !this.player.isRiding;
    if (this.onVehicleProximity) {
      this.onVehicleProximity(isNearBike);
    }

    // 3. Update Player & Motorcycle
    if (this.player.isRiding) {
      // Vehicle driving mode
      const accelerate = this.actionInput.accelerate || this.smoothedMoveY > 0.2 || this.keys['KeyW'] || this.keys['ArrowUp'];
      const brake = this.actionInput.brake || this.smoothedMoveY < -0.2 || this.keys['KeyS'] || this.keys['ArrowDown'];
      const handbrake = this.actionInput.handbrake || this.keys['Space'];
      const steer = this.smoothedMoveX;

      this.motorcycle.update(dt, steer, accelerate, brake, handbrake);
      this.player.update(dt, 0, 0, this.cameraYaw, false, false);

      if (this.onSpeedUpdate) {
        this.onSpeedUpdate(Math.round(Math.abs(this.motorcycle.speed) * 3.6));
      }
    } else {
      // On-foot mode
      this.motorcycle.update(dt, 0, false, false, false);
      this.player.update(dt, this.smoothedMoveX, this.smoothedMoveY, this.cameraYaw, isSprinting, isJumping);

      if (this.onSpeedUpdate) {
        const footSpeed = Math.hypot(this.player.velocity.x, this.player.velocity.z);
        this.onSpeedUpdate(Math.round(footSpeed * 3.6));
      }
    }

    // 4. Update Dhaka Traffic & Pedestrians
    const activePos = this.player.isRiding ? this.motorcycle.position : this.player.position;
    this.traffic.update(dt, activePos, this.motorcycle.position);

    // 5. Update Story Mission
    this.missionManager.update(dt, activePos);

    // 6. Smooth Third-Person Chase Camera
    this.updateCamera(dt);
  }

  private updateCamera(dt: number) {
    if (this.player.isRiding) {
      // Riding camera: smoothly orbits with motorcycle speed and leans slightly
      this.cameraDistance = THREE.MathUtils.damp(
        this.cameraDistance,
        5.2 + Math.abs(this.motorcycle.speed) * 0.08,
        8,
        dt
      );
      this.cameraHeight = THREE.MathUtils.damp(this.cameraHeight, 2.3, 8, dt);

      _targetLookAt.copy(this.motorcycle.position);
      _targetLookAt.y += 1.4;

      // When riding and not manually swiping look, smoothly trail behind the motorcycle
      if (!this.lookInput.active) {
        this.cameraYaw = THREE.MathUtils.damp(this.cameraYaw, this.motorcycle.rotation, 5, dt);
      }
    } else {
      // On-foot camera
      this.cameraDistance = THREE.MathUtils.damp(this.cameraDistance, 4.4, 8, dt);
      this.cameraHeight = THREE.MathUtils.damp(this.cameraHeight, 2.0, 8, dt);

      _targetLookAt.copy(this.player.position);
      _targetLookAt.y += 1.5;
    }

    // Spherical polar coordinate position behind target
    const horizontalDist = this.cameraDistance * Math.cos(this.cameraPitch);
    const camY = _targetLookAt.y + this.cameraDistance * Math.sin(this.cameraPitch);
    const camX = _targetLookAt.x - Math.sin(this.cameraYaw) * horizontalDist;
    const camZ = _targetLookAt.z - Math.cos(this.cameraYaw) * horizontalDist;

    _desiredCamPos.set(camX, Math.max(0.4, camY), camZ);

    // Camera obstacle collision avoidance
    const groundHeightAtCam = this.city.getGroundHeight(_desiredCamPos.x, _desiredCamPos.z);
    if (_desiredCamPos.y < groundHeightAtCam + 0.6) {
      _desiredCamPos.y = groundHeightAtCam + 0.6;
    }

    this.camera.position.lerp(_desiredCamPos, Math.min(1.0, 18 * dt));
    this.camera.lookAt(_targetLookAt);
  }

  public dispose() {
    this.isRunning = false;
    cancelAnimationFrame(this.frameId);
    clearTimeout(this.frameId);

    window.removeEventListener('resize', this.onResize);
    window.removeEventListener('keydown', this.onKeyDown);
    window.removeEventListener('keyup', this.onKeyUp);

    sounds.dispose();
    this.renderer.dispose();
    if (this.container && this.renderer.domElement.parentNode === this.container) {
      this.container.removeChild(this.renderer.domElement);
    }
  }
}
