import React, { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Physics, RigidBody, CapsuleCollider } from "@react-three/rapier";
import { PointerLockControls, KeyboardControls, useKeyboardControls, Environment } from "@react-three/drei";
import * as THREE from "three";
import "./index.css"; // CSS 파일 불러오기

// 1. Player 컴포넌트
function Player() {
  const rigidBody = useRef();
  const [, getKeys] = useKeyboardControls();

  // state를 매개변수로 명확하게 받아야 합니다.
  useFrame((state) => {
    if (!rigidBody.current) return;

    const { forward, backward, left, right } = getKeys();

    // 이동 방향 계산
    const frontVector = new THREE.Vector3(0, 0, (backward ? 1 : 0) - (forward ? 1 : 0));
    const sideVector = new THREE.Vector3((left ? 1 : 0) - (right ? 1 : 0), 0, 0);
    const direction = new THREE.Vector3()
      .subVectors(frontVector, sideVector)
      .normalize()
      .applyEuler(state.camera.rotation);

    // 물리 엔진에 속도 적용
    rigidBody.current.setLinvel({ x: direction.x * 5, y: 0, z: direction.z * 5 });

    // 카메라가 플레이어를 따라가게 설정
    state.camera.position.copy(rigidBody.current.translation());
  });

  return (
    <RigidBody ref={rigidBody} colliders={false} position={[0, 1, 0]}>
      <CapsuleCollider args={[0.5, 0.5]} />
    </RigidBody>
  );
}

// 2. 메인 App 컴포넌트
export default function App() {
  return (
    <KeyboardControls
      map={[
        { name: "forward", keys: ["ArrowUp", "w"] },
        { name: "backward", keys: ["ArrowDown", "s"] },
        { name: "left", keys: ["ArrowLeft", "a"] },
        { name: "right", keys: ["ArrowRight", "d"] },
      ]}
    >
      <Canvas camera={{ position: [0, 2, 5] }}>
        <PointerLockControls />
        <ambientLight intensity={0.5} />
        <Environment preset="city" />
        <Physics>
          <Player />
          {/* 바닥 */}
          <RigidBody type="fixed">
            <mesh rotation={[-Math.PI / 2, 0, 0]}>
              <planeGeometry args={[20, 20]} />
              <meshStandardMaterial color="gray" />
            </mesh>
          </RigidBody>
        </Physics>
      </Canvas>
    </KeyboardControls>
  );
}