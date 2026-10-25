/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { CompassIcon, MapPinIcon } from './Icons';

interface MinimapProps {
  playerPos: THREE.Vector3;
  playerRotation: number;
  bikePos: THREE.Vector3;
  targetPos: THREE.Vector3 | null;
  targetTitleBn?: string;
  isRiding: boolean;
  className?: string;
}

export const Minimap: React.FC<MinimapProps> = ({
  playerPos,
  playerRotation,
  bikePos,
  targetPos,
  targetTitleBn = '',
  isRiding,
  className = '',
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Compute distance to target
  const distanceToTarget = targetPos
    ? Math.round(Math.hypot(playerPos.x - targetPos.x, playerPos.z - targetPos.z))
    : null;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const size = canvas.width;
    const center = size / 2;
    const mapScale = 0.65; // pixels per world meter

    ctx.clearRect(0, 0, size, size);

    // 1. Radar Circular Background
    ctx.save();
    ctx.beginPath();
    ctx.arc(center, center, center - 2, 0, Math.PI * 2);
    ctx.clip();

    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, size, size);

    // 2. City Roads Layout relative to player position
    ctx.save();
    ctx.translate(center, center);
    ctx.rotate(playerRotation); // Map rotates with player heading

    // Draw Main Avenue (Mirpur Road, width 24m)
    const roadOffsetMainX = (0 - playerPos.x) * mapScale;
    ctx.fillStyle = '#334155';
    ctx.fillRect(roadOffsetMainX - 12 * mapScale, -150, 24 * mapScale, 300);

    // Draw Cross Avenue (width 24m)
    const roadOffsetCrossZ = (0 - playerPos.z) * mapScale;
    ctx.fillRect(-150, roadOffsetCrossZ - 12 * mapScale, 300, 24 * mapScale);

    // Draw Flyover overhead structure
    const flyoverX = (-18 - playerPos.x) * mapScale;
    ctx.fillStyle = 'rgba(59, 130, 246, 0.4)';
    ctx.fillRect(flyoverX - 7 * mapScale, -140, 14 * mapScale, 280);

    // 3. Draw Motorcycle Marker (if not currently riding)
    if (!isRiding) {
      const bikeRelX = (bikePos.x - playerPos.x) * mapScale;
      const bikeRelZ = (bikePos.z - playerPos.z) * mapScale;
      ctx.fillStyle = '#ef4444';
      ctx.beginPath();
      ctx.arc(bikeRelX, bikeRelZ, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }

    // 4. Draw Mission Waypoint Beacon
    if (targetPos) {
      const targetRelX = (targetPos.x - playerPos.x) * mapScale;
      const targetRelZ = (targetPos.z - playerPos.z) * mapScale;

      // Draw dashed GPS guidance line
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.5)';
      ctx.lineWidth = 2;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(targetRelX, targetRelZ);
      ctx.stroke();
      ctx.setLineDash([]);

      // Objective glowing dot
      ctx.fillStyle = '#38bdf8';
      ctx.beginPath();
      ctx.arc(targetRelX, targetRelZ, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.stroke();
    }

    ctx.restore(); // Restore map rotation

    // 5. Radar Rings & Grid Lines
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(center, center, center * 0.4, 0, Math.PI * 2);
    ctx.arc(center, center, center * 0.75, 0, Math.PI * 2);
    ctx.stroke();

    // 6. Player Arrow in center (pointing forward)
    ctx.fillStyle = isRiding ? '#22c55e' : '#f59e0b';
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(center, center - 7);
    ctx.lineTo(center - 5, center + 6);
    ctx.lineTo(center, center + 3);
    ctx.lineTo(center + 5, center + 6);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.restore(); // Restore clip
  }, [playerPos, playerRotation, bikePos, targetPos, isRiding]);

  return (
    <div className={`relative flex flex-col items-center select-none ${className}`}>
      {/* Circular Radar Frame */}
      <div className="relative w-28 h-28 rounded-full border-2 border-cyan-500/70 shadow-2xl overflow-hidden bg-slate-950/90">
        <canvas ref={canvasRef} width={112} height={112} className="w-full h-full block" />
        
        {/* Cardinal North Indicator */}
        <div className="absolute top-1 left-1/2 -translate-x-1/2 text-[9px] font-bold text-cyan-400 drop-shadow">
          N
        </div>

        {/* Vehicle / On-Foot Badge */}
        <div className="absolute bottom-1 right-1/2 translate-x-1/2 text-[8px] font-bold px-1.5 py-0.2 rounded-full bg-slate-900/90 text-cyan-200 border border-slate-700/60">
          {isRiding ? 'বাইক' : 'হাঁটছেন'}
        </div>
      </div>

      {/* GPS Target Distance Badge */}
      {distanceToTarget !== null && (
        <div className="mt-1 flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-950/80 border border-cyan-500/40 text-[10px] font-bold text-cyan-300 drop-shadow">
          <MapPinIcon size={12} className="text-cyan-400 shrink-0" />
          <span className="font-game">{distanceToTarget}m</span>
        </div>
      )}
    </div>
  );
};
