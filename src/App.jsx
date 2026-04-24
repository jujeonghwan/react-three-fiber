import React, { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Physics, RigidBody, CapsuleCollider, CuboidCollider } from "@react-three/rapier";
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

    // Debugging
    if (forward || backward || left || right) {
      console.log("Moving!", { forward, backward, left, right });
    }

    // 이동 방향 계산
    const frontVector = new THREE.Vector3(0, 0, (backward ? 1 : 0) - (forward ? 1 : 0));
    const sideVector = new THREE.Vector3((left ? 1 : 0) - (right ? 1 : 0), 0, 0);

    // 이동 벡터 생성 (정규화 후 속도 곱하기)
    const direction = new THREE.Vector3()
      .subVectors(frontVector, sideVector)
      .normalize()
      .multiplyScalar(5);

    // 카메라의 Y 회전(Yaw)만 가져와서 적용
    const rotaion = new THREE.Euler(0, state.camera.rotation.y, 0);
    direction.applyEuler(rotaion);

    // 물리 엔진에 속도 적용
    const currentLinvel = rigidBody.current.linvel();
    rigidBody.current.setLinvel({
      x: direction.x, 
      y: currentLinvel.y,
      z: direction.z
    });

    // 카메라가 플레이어를 따라가게 설정
    state.camera.position.copy(rigidBody.current.translation());
  });

  return (
    <RigidBody 
      ref={rigidBody} 
      type="dynamic" 
      colliders={false} 
      position={[0, 1, 0]}
      enabledRotations={[false, false, false]}
    >
      <mesh castShadow>
        <capsuleGeometry args={[0.5, 0.5]} />
        <meshStandardMaterial color="mediumpurple" />
      </mesh>
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
      <Canvas shadows camera={{ position: [0, 2, 5] }}>
        <PointerLockControls />
        <ambientLight intensity={0.5} />
        <directionalLight position={[5, 10, 5]} intensity={1.5} castShadow />
        <Environment preset="city" />
        <Physics debug>
          <Player />
          {/* 바닥 */}
          <RigidBody type="fixed">
            <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
              <planeGeometry args={[20, 20]} />
              <meshStandardMaterial color="gray" />
            </mesh>
            <CuboidCollider args={[10, 0.1, 10]} />
          </RigidBody>
        </Physics>
      </Canvas>
    </KeyboardControls>
  );
}