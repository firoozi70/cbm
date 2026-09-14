"use client";

import { useMemo, useRef, useState, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, ContactShadows, Html } from "@react-three/drei";
import * as THREE from "three";
import { BoxInstance } from "@/lib/load-calculation";
import { ContainerSpec, faNumber } from "@/lib/containers";
import { RotateCw, Maximize, Play, Pause, Box as BoxIcon } from "lucide-react";

/* ------------------------- ابزارهای کمکی ------------------------- */

// انیمیشن easeOutBack برای ظاهرشدن جعبه‌ها
function easeOutBack(t: number): number {
  const c1 = 1.70158;
  const c3 = c1 + 1;
  return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
}

const dummy = new THREE.Object3D();
const tmpColor = new THREE.Color();

/* --------------------- جعبه‌های بار (Instanced) --------------------- */

function CargoBoxes({
  boxes,
  container,
  playKey,
  onProgress,
}: {
  boxes: BoxInstance[];
  container: ContainerSpec;
  playKey: number;
  onProgress?: (done: boolean) => void;
}) {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const startTime = useRef(0);
  const announced = useRef(false);

  // مرکز کانتینر در مبدأ صحنه
  const cL = container.internalLength;
  const cH = container.internalHeight;
  const cW = container.internalWidth;

  const maxSeq = Math.max(...boxes.map((b) => b.seq), 0);
  // کل زمان انیمیشن حدود ۲.۵ ثانیه؛ هر جعبه ۰.۴ ثانیه می‌رسد
  const stagger = maxSeq > 0 ? Math.min(2.2 / maxSeq, 0.06) : 0;
  const DURATION = 0.45;

  // رنگ‌ها یکبار ست می‌شوند
  useEffect(() => {
    const mesh = meshRef.current;
    if (!mesh) return;
    boxes.forEach((b, i) => {
      tmpColor.set(b.color);
      mesh.setColorAt(i, tmpColor);
    });
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
  }, [boxes, playKey]);

  useEffect(() => {
    startTime.current = performance.now();
    announced.current = false;
  }, [playKey]);

  useFrame(() => {
    const mesh = meshRef.current;
    if (!mesh) return;
    const now = performance.now();
    const t = (now - startTime.current) / 1000;

    let allDone = true;
    for (let i = 0; i < boxes.length; i++) {
      const b = boxes[i];
      const appearAt = b.seq * stagger;
      let p = (t - appearAt) / DURATION;
      if (p < 0) p = 0;
      if (p > 1) p = 1;
      else allDone = false;

      const e = easeOutBack(p);
      const scale = Math.max(e, 0.0001);
      // مرکز جعبه - کانتینر حول مبدأ
      const cx = b.x + b.l / 2 - cL / 2;
      const cy = b.z + (b.h / 2) * e - cH / 2;
      const cz = b.y + b.w / 2 - cW / 2;

      dummy.position.set(cx, cy, cz);
      // ابعاد واقعی جعبه × ضریب انیمیشن
      // محورها: x=طول، y=ارتفاع، z=عرض
      dummy.scale.set(b.l * scale, b.h * scale, b.w * scale);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
    }
    mesh.instanceMatrix.needsUpdate = true;

    if (allDone && !announced.current) {
      announced.current = true;
      onProgress?.(true);
    }
  });

  return (
    <instancedMesh
      key={playKey}
      ref={meshRef}
      args={[undefined, undefined, Math.max(boxes.length, 1)]}
      castShadow
      receiveShadow
    >
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial roughness={0.55} metalness={0.05} />
    </instancedMesh>
  );
}

/* --------------------- قاب کانتینر --------------------- */

function ContainerShell({ container }: { container: ContainerSpec }) {
  const cL = container.internalLength;
  const cH = container.internalHeight;
  const cW = container.internalWidth;

  const edges = useMemo(() => {
    const geo = new THREE.EdgesGeometry(new THREE.BoxGeometry(cL, cH, cW));
    return geo;
  }, [cL, cH, cW]);

  return (
    <group>
      {/* بدنه نیمه‌شفاف (فقط دیواره داخلی) */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[cL, cH, cW]} />
        <meshStandardMaterial
          color="#9ec9e8"
          transparent
          opacity={0.07}
          side={THREE.BackSide}
          depthWrite={false}
        />
      </mesh>
      {/* یال‌ها */}
      <lineSegments geometry={edges}>
        <lineBasicMaterial color="#7fa8c9" transparent opacity={0.9} />
      </lineSegments>
      {/* کف */}
      <mesh position={[0, -cH / 2 + 0.01, 0]} receiveShadow>
        <boxGeometry args={[cL, 0.5, cW]} />
        <meshStandardMaterial color="#c3d9ea" roughness={0.9} />
      </mesh>
    </group>
  );
}

/* --------------------- برچسب ابعاد --------------------- */

function DimensionLabels({ container }: { container: ContainerSpec }) {
  const cL = container.internalLength;
  const cH = container.internalHeight;
  const cW = container.internalWidth;
  const labelStyle =
    "pointer-events-none select-none whitespace-nowrap rounded bg-[#15354e]/85 px-2 py-0.5 text-[10px] text-white shadow-sm";
  return (
    <>
      <Html
        position={[0, -cH / 2 - 4, cW / 2 + 2]}
        center
        zIndexRange={[10, 0]}
        style={{ pointerEvents: "none" }}
      >
        <div className={labelStyle} dir="rtl">
          طول {faNumber(cL, 0)} سانتی‌متر
        </div>
      </Html>
      <Html
        position={[cL / 2 + 3, -cH / 2, 0]}
        center
        zIndexRange={[10, 0]}
        style={{ pointerEvents: "none" }}
      >
        <div className={labelStyle} dir="rtl">
          عرض {faNumber(cW, 0)}
        </div>
      </Html>
      <Html
        position={[-cL / 2 - 2, 0, -cW / 2 - 2]}
        center
        zIndexRange={[10, 0]}
        style={{ pointerEvents: "none" }}
      >
        <div className={labelStyle} dir="rtl">
          ارتفاع {faNumber(cH, 0)}
        </div>
      </Html>
    </>
  );
}

/* --------------------- کنترل دوربین --------------------- */

function CameraRig({
  container,
  resetKey,
  autoRotate,
}: {
  container: ContainerSpec;
  resetKey: number;
  autoRotate: boolean;
}) {
  const controlsRef = useRef<any>(null);
  const maxDim = Math.max(
    container.internalLength,
    container.internalWidth,
    container.internalHeight
  );
  const dist = maxDim * 1.45;

  useEffect(() => {
    const c = controlsRef.current;
    if (!c) return;
    c.object.position.set(dist * 0.85, dist * 0.5, dist * 0.85);
    c.target.set(0, 0, 0);
    c.update();
  }, [resetKey, dist]);

  return (
    <OrbitControls
      ref={controlsRef}
      makeDefault
      enableDamping
      dampingFactor={0.08}
      autoRotate={autoRotate}
      autoRotateSpeed={1.2}
      minDistance={maxDim * 0.35}
      maxDistance={maxDim * 3.5}
      maxPolarAngle={Math.PI / 1.9}
      target={[0, 0, 0]}
    />
  );
}

/* --------------------- کامپوننت اصلی صحنه --------------------- */

export interface Scene3DProps {
  boxes: BoxInstance[];
  container: ContainerSpec;
}

export default function Scene3D({ boxes, container }: Scene3DProps) {
  const [resetKey, setResetKey] = useState(0);
  const [playKey, setPlayKey] = useState(0);
  const [autoRotate, setAutoRotate] = useState(false);
  const [animDone, setAnimDone] = useState(false);

  const cL = container.internalLength;
  const maxDim = Math.max(cL, container.internalWidth, container.internalHeight);

  const replay = () => {
    setPlayKey((k) => k + 1);
    setAnimDone(false);
  };

  return (
    <div className="relative w-full">
      {/* نوار ابزار */}
      <div className="absolute top-2 left-2 z-10 flex items-center gap-1.5">
        <button
          type="button"
          onClick={() => setAutoRotate((v) => !v)}
          className={`inline-flex items-center gap-1 rounded-md border px-2 py-1.5 text-[11px] shadow-sm transition-colors ${
            autoRotate
              ? "border-[#0088ff] bg-[#0088ff] text-white"
              : "border-[#d9d9d9] bg-white/95 text-[rgba(0,0,0,0.65)] hover:border-[#0088ff] hover:text-[#0088ff]"
          }`}
          title={autoRotate ? "توقف چرخش خودکار" : "چرخش خودکار"}
        >
          {autoRotate ? <Pause className="size-3.5" /> : <RotateCw className="size-3.5" />}
          <span className="hidden sm:inline">چرخش</span>
        </button>
        <button
          type="button"
          onClick={() => setResetKey((k) => k + 1)}
          className="inline-flex items-center gap-1 rounded-md border border-[#d9d9d9] bg-white/95 px-2 py-1.5 text-[11px] text-[rgba(0,0,0,0.65)] shadow-sm transition-colors hover:border-[#0088ff] hover:text-[#0088ff]"
          title="بازنشانی نما"
        >
          <Maximize className="size-3.5" />
          <span className="hidden sm:inline">بازنشانی</span>
        </button>
        <button
          type="button"
          onClick={replay}
          className="inline-flex items-center gap-1 rounded-md border border-[#d9d9d9] bg-white/95 px-2 py-1.5 text-[11px] text-[rgba(0,0,0,0.65)] shadow-sm transition-colors hover:border-[#0088ff] hover:text-[#0088ff]"
          title="پخش دوباره انیمیشن چیدمان"
        >
          <Play className="size-3.5" />
          <span className="hidden sm:inline">انیمیشن</span>
        </button>
      </div>

      {/* راهنمای لمس */}
      {!animDone && boxes.length > 0 && null}
      <div className="pointer-events-none absolute bottom-2 right-2 z-10 hidden sm:block">
        <span className="rounded bg-white/85 px-2 py-1 text-[10px] text-[rgba(0,0,0,0.45)] shadow-sm">
          برای چرخش بکشید • برای بزرگ‌نمایی اسکرول یا با دو انگشت بکشید
        </span>
      </div>

      <Canvas
        dpr={[1, 2]}
        shadows
        camera={{ position: [maxDim * 1.2, maxDim * 0.7, maxDim * 1.2], fov: 38, near: 1, far: maxDim * 12 }}
        gl={{ antialias: true, alpha: true }}
        performance={{ min: 0.4 }}
        style={{ touchAction: "none" }}
        className="!h-[320px] w-full sm:!h-[430px]"
      >
        <color attach="background" args={["#f4faff"]} />
        <fog attach="fog" args={["#f4faff", maxDim * 3, maxDim * 6]} />
        <ambientLight intensity={0.75} />
        <directionalLight
          position={[maxDim, maxDim * 1.5, maxDim * 0.8]}
          intensity={1.15}
          castShadow
          shadow-mapSize={[1024, 1024]}
        />
        <directionalLight position={[-maxDim, maxDim, -maxDim]} intensity={0.35} />

        <group position={[0, 0, 0]}>
          <ContainerShell container={container} />
          {boxes.length > 0 && (
            <CargoBoxes
              boxes={boxes}
              container={container}
              playKey={playKey}
              onProgress={(done) => setAnimDone(done)}
            />
          )}
          <ContactShadows
            position={[0, -container.internalHeight / 2 - 0.4, 0]}
            opacity={0.35}
            scale={maxDim * 2.2}
            blur={2.2}
            far={maxDim * 0.8}
            resolution={512}
            color="#26435e"
          />
          <DimensionLabels container={container} />
        </group>

        <CameraRig container={container} resetKey={resetKey} autoRotate={autoRotate} />
      </Canvas>

      {/* راهنمای رنگ‌ها */}
      {boxes.length > 0 && (
        <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 border-t border-[#f0f0f0] px-3 py-2">
          {Array.from(new Set(boxes.map((b) => b.productId))).map((pid) => {
            const b = boxes.find((x) => x.productId === pid)!;
            const count = boxes.filter((x) => x.productId === pid).length;
            return (
              <span key={pid} className="inline-flex items-center gap-1.5 text-[10px] text-[rgba(0,0,0,0.65)]">
                <span
                  className="inline-block size-2.5 rounded-[3px] border border-black/10"
                  style={{ backgroundColor: b.color }}
                />
                {faNumber(count)} جعبه
              </span>
            );
          })}
          <span className="inline-flex items-center gap-1 text-[10px] text-[rgba(0,0,0,0.45)]">
            <BoxIcon className="size-3" />
            نمای سه‌بعدی تعاملی
          </span>
        </div>
      )}
    </div>
  );
}
