import React, { useRef, useEffect, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { PointerLockControls, Sky, Stars } from '@react-three/drei';
import * as THREE from 'three';

const Player = ({ vehicle, onSpeedChange, onScoreChange, onComboChange, onAltitudeChange, onTrickLanded, onMaxSpeedChange, score, comboMultiplier }) => {
  const meshRef = useRef();
  const { camera } = useThree();
  const velocity = useRef(new THREE.Vector3());
  const direction = useRef(new THREE.Vector3());
  const keys = useRef({ w: false, a: false, s: false, d: false, space: false, shift: false });
  const isAirborne = useRef(false);
  const airTime = useRef(0);
  const rotation = useRef({ x: 0, y: 0, z: 0 });
  const trickActive = useRef(false);
  const lastComboTime = useRef(Date.now());

  useEffect(() => {
    const handleKeyDown = (e) => {
      const key = e.key.toLowerCase();
      if (key in keys.current) keys.current[key] = true;
      if (e.code === 'Space') keys.current.space = true;
      if (e.key === 'Shift') keys.current.shift = true;
    };

    const handleKeyUp = (e) => {
      const key = e.key.toLowerCase();
      if (key in keys.current) keys.current[key] = false;
      if (e.code === 'Space') keys.current.space = false;
      if (e.key === 'Shift') keys.current.shift = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  useFrame((state, delta) => {
    if (!meshRef.current) return;

    const speed = vehicle === 'bike' ? 25 : vehicle === 'snowboard' ? 30 : 35;
    const acceleration = 0.3;
    const friction = 0.95;
    const turnSpeed = 2;
    const gravity = vehicle === 'wingsuit' ? 5 : 20;

    direction.current.set(0, 0, 0);

    if (keys.current.w) direction.current.z -= 1;
    if (keys.current.s) direction.current.z += 1;
    if (keys.current.a) direction.current.x -= 1;
    if (keys.current.d) direction.current.x += 1;

    if (direction.current.length() > 0) {
      direction.current.normalize();
      direction.current.applyQuaternion(camera.quaternion);
      direction.current.y = 0;
      direction.current.normalize();

      velocity.current.x += direction.current.x * acceleration;
      velocity.current.z += direction.current.z * acceleration;
    }

    const horizontalSpeed = Math.sqrt(velocity.current.x ** 2 + velocity.current.z ** 2);
    if (horizontalSpeed > speed) {
      velocity.current.x = (velocity.current.x / horizontalSpeed) * speed;
      velocity.current.z = (velocity.current.z / horizontalSpeed) * speed;
    }

    velocity.current.x *= friction;
    velocity.current.z *= friction;

    const groundLevel = 2;
    const currentY = meshRef.current.position.y;

    if (currentY > groundLevel) {
      isAirborne.current = true;
      airTime.current += delta;
      velocity.current.y -= gravity * delta;

      if (keys.current.shift && !trickActive.current) {
        trickActive.current = true;
        rotation.current.x += Math.random() * 2 - 1;
        rotation.current.y += Math.random() * 2 - 1;
        rotation.current.z += Math.random() * 2 - 1;
      }
    } else {
      if (isAirborne.current) {
        const trickScore = Math.floor(airTime.current * 100 * (Math.abs(rotation.current.x) + Math.abs(rotation.current.y) + Math.abs(rotation.current.z)));
        if (trickScore > 50) {
          const now = Date.now();
          const timeSinceLastCombo = (now - lastComboTime.current) / 1000;
          
          if (timeSinceLastCombo < 3) {
            const newCombo = Math.min(comboMultiplier + 1, 10);
            onComboChange(newCombo);
            onScoreChange(score + trickScore * newCombo);
          } else {
            onComboChange(1);
            onScoreChange(score + trickScore);
          }
          
          lastComboTime.current = now;
          onTrickLanded();
        } else {
          onComboChange(1);
        }

        isAirborne.current = false;
        airTime.current = 0;
        rotation.current = { x: 0, y: 0, z: 0 };
        trickActive.current = false;
      }

      meshRef.current.position.y = groundLevel;
      velocity.current.y = 0;

      if (keys.current.space) {
        velocity.current.y = vehicle === 'wingsuit' ? 15 : vehicle === 'bike' ? 12 : 10;
      }
    }

    meshRef.current.position.x += velocity.current.x * delta;
    meshRef.current.position.y += velocity.current.y * delta;
    meshRef.current.position.z += velocity.current.z * delta;

    if (trickActive.current) {
      meshRef.current.rotation.x += rotation.current.x * delta * 2;
      meshRef.current.rotation.y += rotation.current.y * delta * 2;
      meshRef.current.rotation.z += rotation.current.z * delta * 2;
    } else {
      meshRef.current.rotation.x *= 0.9;
      meshRef.current.rotation.y *= 0.9;
      meshRef.current.rotation.z *= 0.9;
    }

    camera.position.copy(meshRef.current.position);
    camera.position.y += 3;
    camera.position.z += 5;

    const displaySpeed = Math.floor(horizontalSpeed * 10);
    onSpeedChange(displaySpeed);
    onMaxSpeedChange(displaySpeed);
    onAltitudeChange(Math.max(0, Math.floor(currentY - groundLevel)));
  });

  const getVehicleGeometry = () => {
    switch (vehicle) {
      case 'bike':
        return <boxGeometry args={[1, 1, 2]} />;
      case 'snowboard':
        return <boxGeometry args={[0.5, 0.3, 1.5]} />;
      case 'wingsuit':
        return <boxGeometry args={[2, 0.3, 1]} />;
      default:
        return <boxGeometry args={[1, 1, 2]} />;
    }
  };

  const getVehicleColor = () => {
    switch (vehicle) {
      case 'bike':
        return '#00E5FF';
      case 'snowboard':
        return '#FF9F0A';
      case 'wingsuit':
        return '#FF3B30';
      default:
        return '#00E5FF';
    }
  };

  return (
    <mesh ref={meshRef} position={[0, 2, 0]} castShadow>
      {getVehicleGeometry()}
      <meshStandardMaterial color={getVehicleColor()} metalness={0.8} roughness={0.2} />
    </mesh>
  );
};

const Terrain = () => {
  const terrainRef = useRef();
  const ramps = [];

  for (let i = 0; i < 50; i++) {
    const x = (Math.random() - 0.5) * 200;
    const z = -Math.random() * 500 - 20;
    const type = Math.random() > 0.5 ? 'ramp' : 'obstacle';
    ramps.push({ x, z, type, key: i });
  }

  return (
    <group>
      <mesh ref={terrainRef} rotation={[-Math.PI / 2, 0, 0]} receiveShadow position={[0, 0, 0]}>
        <planeGeometry args={[500, 1000]} />
        <meshStandardMaterial color="#1a1a1a" roughness={0.8} />
      </mesh>

      {ramps.map((ramp) => (
        ramp.type === 'ramp' ? (
          <mesh key={ramp.key} position={[ramp.x, 0, ramp.z]} rotation={[-Math.PI / 6, 0, 0]} castShadow>
            <boxGeometry args={[8, 0.5, 10]} />
            <meshStandardMaterial color="#FF9F0A" metalness={0.3} roughness={0.7} />
          </mesh>
        ) : (
          <mesh key={ramp.key} position={[ramp.x, 2, ramp.z]} castShadow>
            <boxGeometry args={[3, 4, 3]} />
            <meshStandardMaterial color="#333333" />
          </mesh>
        )
      ))}

      <mesh position={[-50, 5, -100]} castShadow>
        <boxGeometry args={[20, 10, 20]} />
        <meshStandardMaterial color="#555555" />
      </mesh>

      <mesh position={[60, 8, -200]} castShadow>
        <boxGeometry args={[25, 16, 25]} />
        <meshStandardMaterial color="#444444" />
      </mesh>
    </group>
  );
};

const Game3D = ({ gameState, vehicle, onVehicleChange, onSpeedChange, onScoreChange, onComboChange, onAltitudeChange, onTrickLanded, onMaxSpeedChange, score, comboMultiplier }) => {
  const controlsRef = useRef();

  return (
    <Canvas
      shadows
      camera={{ position: [0, 5, 10], fov: 75 }}
      style={{ position: 'absolute', top: 0, left: 0, width: '100vw', height: '100vh' }}
    >
      <Sky sunPosition={[100, 20, 100]} />
      <Stars radius={300} depth={60} count={5000} factor={7} saturation={0} />
      <ambientLight intensity={0.5} />
      <directionalLight
        position={[50, 50, 25]}
        intensity={1}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
      />
      <Terrain />
      {gameState === 'playing' && (
        <>
          <Player
            vehicle={vehicle}
            onSpeedChange={onSpeedChange}
            onScoreChange={onScoreChange}
            onComboChange={onComboChange}
            onAltitudeChange={onAltitudeChange}
            onTrickLanded={onTrickLanded}
            onMaxSpeedChange={onMaxSpeedChange}
            score={score}
            comboMultiplier={comboMultiplier}
          />
          <PointerLockControls ref={controlsRef} />
        </>
      )}
    </Canvas>
  );
};

export default Game3D;
