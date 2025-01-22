import { useGLTF } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
} from 'react';
import * as THREE from 'three';

type GLTFResult = {
  scene: THREE.Group;
};

// 부모 컴포넌트에서 조작할 메서드를 정의:
export interface BasketballModelHandle {
  triggerBounce: () => void;
  applyRotation: (deltaX: number, deltaY: number) => void;
}

/**
 * 농구공 모델 컴포넌트
 * - Plane 없이, 오직 3D 애니메이션(회전, 바운스)만 담당
 * - 부모가 ref를 통해 triggerBounce & applyRotation을 호출
 */
const BasketballModel = forwardRef<BasketballModelHandle>((_, ref) => {
  // GLTF 모델 로드
  const { scene } = useGLTF('/basketball.glb') as GLTFResult;
  const groupRef = useRef<THREE.Group>(null);

  // --- 회전 관성 ---
  const rotationVelocity = useRef({ x: 0, y: 0 });
  const friction = 0.97;

  // --- 바운스 (중력) ---
  const bounceY = useRef(0);
  const bounceVel = useRef(0);
  const gravity = -0.03;
  const bounceDamping = 0.6;
  const floorY = 0;

  // 부모에서 제어할 메서드를 ref로 노출
  useImperativeHandle(ref, () => ({
    // 탭으로 바운스 트리거
    triggerBounce() {
      bounceVel.current = 0.5;
    },
    // 드래그 중 회전/관성 적용
    applyRotation(deltaX, deltaY) {
      if (!groupRef.current) return;
      const rotationMultiplier = 0.01;
      // 실제 회전
      groupRef.current.rotation.y += deltaX * rotationMultiplier;
      groupRef.current.rotation.x += deltaY * rotationMultiplier;
      // 관성 업데이트
      rotationVelocity.current = {
        x: deltaY * rotationMultiplier,
        y: deltaX * rotationMultiplier,
      };
    },
  }));

  // 컴포넌트 마운트 시, 초기에 살짝 튀어오르도록
  useEffect(() => {
    bounceVel.current = 0.5;
  }, []);

  // 매 프레임마다 계속 회전 + 중력 시뮬레이션
  useFrame(() => {
    if (!groupRef.current) return;

    // 1) 농구공이 계속 조금씩 천천히 회전
    const constantRotationSpeed = -0.007;
    groupRef.current.rotation.y += constantRotationSpeed;

    // 2) 드래그 관성 회전
    groupRef.current.rotation.y += rotationVelocity.current.y;
    groupRef.current.rotation.x += rotationVelocity.current.x;

    rotationVelocity.current.x *= friction;
    rotationVelocity.current.y *= friction;
    if (Math.abs(rotationVelocity.current.x) < 0.0001) rotationVelocity.current.x = 0;
    if (Math.abs(rotationVelocity.current.y) < 0.0001) rotationVelocity.current.y = 0;

    // 3) 중력 + 바운스
    bounceVel.current += gravity;
    bounceY.current += bounceVel.current;
    if (bounceY.current < floorY) {
      bounceY.current = floorY;
      bounceVel.current = -bounceVel.current * bounceDamping;
      if (Math.abs(bounceVel.current) < 0.01) {
        bounceVel.current = 0;
      }
    }
    groupRef.current.position.y = bounceY.current;
  });

  // 실제 모델 렌더
  return <primitive ref={groupRef} object={scene} />;
});

export default BasketballModel;
