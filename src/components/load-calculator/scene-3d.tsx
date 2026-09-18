"use client";

import { useMemo, useRef, useState, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, ContactShadows, Html } from "@react-three/drei";
import * as THREE from "three";
import { BoxInstance, PalletInstance } from "@/lib/load-calculation";
import { ContainerSpec } from "@/lib/containers";
import { useTranslation } from "@/i18n/context";
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

/* --------------------- پالت‌های چوبی سه‌بعدی کف کانتینر --------------------- */

function PalletMeshes({
  pallets,
  container,
}: {
  pallets: PalletInstance[];
  container: ContainerSpec;
}) {
  const cL = container.internalLength;
  const cH = container.internalHeight;
  const cW = container.internalWidth;

  if (!pallets || pallets.length === 0) return null;

  return (
    <group>
      {pallets.map((p) => {
        // مرکز پالت در مختصات Three.js نسبت به مرکز کانتینر
        const cx = p.x + p.l / 2 - cL / 2;
        const cy = -cH / 2 + p.h / 2;
        const cz = p.y + p.w / 2 - cW / 2;

        return (
          <group key={p.id} position={[cx, cy, cz]}>
            {/* تخته‌های رویی پالت (۵ تخته چوبی موازی با فواصل استاندارد) */}
            {[-0.4, -0.2, 0, 0.2, 0.4].map((offsetFactor, i) => (
              <mesh
                key={`top-${i}`}
                position={[0, p.h / 2 - 1.1, offsetFactor * (p.w - 12)]}
                castShadow
                receiveShadow
              >
                <boxGeometry args={[p.l, 2.2, p.w * 0.16]} />
                <meshStandardMaterial
                  color="#d4a373"
                  roughness={0.82}
                  metalness={0.02}
                />
              </mesh>
            ))}

            {/* تیرک‌ها و بلوک‌های تکیه‌گاه پالت با شیار شاخک لیفتراک */}
            {[-p.w / 2 + 5, 0, p.w / 2 - 5].map((zPos, i) => (
              <mesh
                key={`block-${i}`}
                position={[0, 0, zPos]}
                castShadow
                receiveShadow
              >
                <boxGeometry args={[p.l, p.h - 4.4, 9]} />
                <meshStandardMaterial
                  color="#bc8a5f"
                  roughness={0.88}
                  metalness={0.02}
                />
              </mesh>
            ))}

            {/* تخته‌های زیرین پالت (۳ تخته در کف) */}
            {[-p.w / 2 + 5, 0, p.w / 2 - 5].map((zPos, i) => (
              <mesh
                key={`bottom-${i}`}
                position={[0, -p.h / 2 + 1.1, zPos]}
                receiveShadow
              >
                <boxGeometry args={[p.l, 2.2, 11]} />
                <meshStandardMaterial
                  color="#a77338"
                  roughness={0.85}
                  metalness={0.02}
                />
              </mesh>
            ))}
          </group>
        );
      })}
    </group>
  );
}

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
  const { formatNumber, locale, isRtl } = useTranslation();
  const cL = container.internalLength;
  const cH = container.internalHeight;
  const cW = container.internalWidth;
  const labelStyle =
    "pointer-events-none select-none whitespace-nowrap rounded bg-[#15354e]/85 px-2 py-0.5 text-[10px] text-white shadow-sm tabular-nums";

  const lengthLabels: Record<string, string> = {
    fa: "طول",
    en: "Length",
    ar: "الطول",
    zh: "长",
    ru: "Длина",
    tr: "Uzunluk",
    es: "Largo",
    de: "Länge",
    fr: "Longueur",
  };

  const widthLabels: Record<string, string> = {
    fa: "عرض",
    en: "Width",
    ar: "العرض",
    zh: "宽",
    ru: "Ширина",
    tr: "Genişlik",
    es: "Ancho",
    de: "Breite",
    fr: "Largeur",
  };

  const heightLabels: Record<string, string> = {
    fa: "ارتفاع",
    en: "Height",
    ar: "الارتفاع",
    zh: "高",
    ru: "Высота",
    tr: "Yükseklik",
    es: "Alto",
    de: "Höhe",
    fr: "Hauteur",
  };

  const cmUnits: Record<string, string> = {
    fa: "سانتی‌متر",
    en: "cm",
    ar: "سم",
    zh: "厘米",
    ru: "см",
    tr: "cm",
    es: "cm",
    de: "cm",
    fr: "cm",
  };

  const lText = lengthLabels[locale] || lengthLabels.en;
  const wText = widthLabels[locale] || widthLabels.en;
  const hText = heightLabels[locale] || heightLabels.en;
  const unitText = cmUnits[locale] || cmUnits.en;

  return (
    <>
      <Html
        position={[0, -cH / 2 - 4, cW / 2 + 2]}
        center
        zIndexRange={[10, 0]}
        style={{ pointerEvents: "none" }}
      >
        <div className={labelStyle} dir={isRtl ? "rtl" : "ltr"}>
          {lText} {formatNumber(cL, 0)} {unitText}
        </div>
      </Html>
      <Html
        position={[cL / 2 + 3, -cH / 2, 0]}
        center
        zIndexRange={[10, 0]}
        style={{ pointerEvents: "none" }}
      >
        <div className={labelStyle} dir={isRtl ? "rtl" : "ltr"}>
          {wText} {formatNumber(cW, 0)} {unitText}
        </div>
      </Html>
      <Html
        position={[-cL / 2 - 2, 0, -cW / 2 - 2]}
        center
        zIndexRange={[10, 0]}
        style={{ pointerEvents: "none" }}
      >
        <div className={labelStyle} dir={isRtl ? "rtl" : "ltr"}>
          {hText} {formatNumber(cH, 0)} {unitText}
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

/* --------------------- بررسی پشتیبانی WebGL --------------------- */

function detectWebGL(): boolean {
  try {
    const canvas = document.createElement("canvas");
    return !!(
      window.WebGLRenderingContext &&
      (canvas.getContext("webgl2") || canvas.getContext("webgl") || canvas.getContext("experimental-webgl"))
    );
  } catch {
    return false;
  }
}

/* --------------------- کامپوننت اصلی صحنه --------------------- */

export interface Scene3DProps {
  boxes: BoxInstance[];
  container: ContainerSpec;
  pallets?: PalletInstance[];
  usePallets?: boolean;
}

export default function Scene3D({ boxes, container, pallets, usePallets }: Scene3DProps) {
  const { formatNumber, locale } = useTranslation();
  const [resetKey, setResetKey] = useState(0);
  const [playKey, setPlayKey] = useState(0);
  const [autoRotate, setAutoRotate] = useState(false);
  const [animDone, setAnimDone] = useState(false);
  // Scene3D فقط سمت کلاینت بارگذاری می‌شود (dynamic/ssr:false)؛ محاسبه WebGL در اولین رندر امن است
  const [webglOk] = useState(detectWebGL);

  const cL = container.internalLength;
  const maxDim = Math.max(cL, container.internalWidth, container.internalHeight);

  const replay = () => {
    setPlayKey((k) => k + 1);
    setAnimDone(false);
  };

  const labels = {
    rotate: {
      fa: "چرخش",
      en: "Rotate",
      ar: "تدوير",
      zh: "旋转",
      ru: "Вращение",
      tr: "Döndür",
      es: "Girar",
      de: "Drehen",
      fr: "Pivoter",
    }[locale] || "Rotate",
    rotateTitle: {
      fa: autoRotate ? "توقف چرخش خودکار" : "چرخش خودکار",
      en: autoRotate ? "Stop Auto-Rotation" : "Auto-Rotate",
      ar: autoRotate ? "إيقاف التدوير التلقائي" : "تدوير تلقائي",
      zh: autoRotate ? "停止自动旋转" : "自动旋转",
      ru: autoRotate ? "Остановить вращение" : "Автоповорот",
      tr: autoRotate ? "Otomatik Dönüşü Durdur" : "Otomatik Döndür",
      es: autoRotate ? "Detener rotación" : "Giro automático",
      de: autoRotate ? "Drehung anhalten" : "Automatisch drehen",
      fr: autoRotate ? "Arrêter la rotation" : "Rotation auto",
    }[locale] || "Auto-Rotate",
    reset: {
      fa: "بازنشانی",
      en: "Reset",
      ar: "إعادة ضبط",
      zh: "重置视角",
      ru: "Сброс",
      tr: "Sıfırla",
      es: "Restablecer",
      de: "Zurücksetzen",
      fr: "Réinitialiser",
    }[locale] || "Reset",
    resetTitle: {
      fa: "بازنشانی نما",
      en: "Reset View",
      ar: "إعادة ضبط العرض",
      zh: "重置视角",
      ru: "Сбросить вид",
      tr: "Görünümü Sıfırla",
      es: "Restablecer vista",
      de: "Ansicht zurücksetzen",
      fr: "Réinitialiser la vue",
    }[locale] || "Reset View",
    replay: {
      fa: "انیمیشن",
      en: "Animation",
      ar: "حركة",
      zh: "动画回放",
      ru: "Анимация",
      tr: "Animasyon",
      es: "Animación",
      de: "Animation",
      fr: "Animation",
    }[locale] || "Animation",
    replayTitle: {
      fa: "پخش دوباره انیمیشن چیدمان",
      en: "Replay Loading Animation",
      ar: "إعادة تشغيل حركة التحميل",
      zh: "重播装箱动画",
      ru: "Повторить анимацию погрузки",
      tr: "Yükleme animasyonunu tekrar oynat",
      es: "Repetir animación de carga",
      de: "Ladeanimation wiederholen",
      fr: "Rejouer l'animation de chargement",
    }[locale] || "Replay Loading Animation",
    gestureHint: {
      fa: "برای چرخش بکشید • برای بزرگ‌نمایی اسکرول یا با دو انگشت بکشید",
      en: "Drag to rotate • Scroll or pinch to zoom",
      ar: "اسحب للتدوير • استخدم التمرير أو إصبعين للتكبير",
      zh: "按住拖动以旋转 • 滚轮或双指捏合缩放",
      ru: "Тяните для вращения • Колесико или жест пальцами для зума",
      tr: "Döndürmek için sürükleyin • Yakınlaştırmak için kaydırın veya parmaklarınızı kıstırın",
      es: "Arrastra para rotar • Desplaza o pellizca para zoom",
      de: "Ziehen zum Drehen • Scrollen oder Aufziehen zum Zoomen",
      fr: "Faites glisser pour pivoter • Défilez ou pincez pour zoomer",
    }[locale] || "Drag to rotate • Scroll or pinch to zoom",
    boxesUnit: {
      fa: "جعبه",
      en: "boxes",
      ar: "صندوق",
      zh: "箱",
      ru: "коробок",
      tr: "koli",
      es: "cajas",
      de: "Kartons",
      fr: "colis",
    }[locale] || "boxes",
    interactive3d: {
      fa: "نمای سه‌بعدی تعاملی",
      en: "Interactive 3D View",
      ar: "عرض ثلاثي الأبعاد تفاعلي",
      zh: "3D 交互式视图",
      ru: "Интерактивный 3D-вид",
      tr: "Etkileşimli 3B Görünüm",
      es: "Vista 3D Interactiva",
      de: "Interaktive 3D-Ansicht",
      fr: "Vue 3D Interactive",
    }[locale] || "Interactive 3D View",
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
          title={labels.rotateTitle}
        >
          {autoRotate ? <Pause className="size-3.5" /> : <RotateCw className="size-3.5" />}
          <span className="hidden sm:inline">{labels.rotate}</span>
        </button>
        <button
          type="button"
          onClick={() => setResetKey((k) => k + 1)}
          className="inline-flex items-center gap-1 rounded-md border border-[#d9d9d9] bg-white/95 px-2 py-1.5 text-[11px] text-[rgba(0,0,0,0.65)] shadow-sm transition-colors hover:border-[#0088ff] hover:text-[#0088ff]"
          title={labels.resetTitle}
        >
          <Maximize className="size-3.5" />
          <span className="hidden sm:inline">{labels.reset}</span>
        </button>
        <button
          type="button"
          onClick={replay}
          className="inline-flex items-center gap-1 rounded-md border border-[#d9d9d9] bg-white/95 px-2 py-1.5 text-[11px] text-[rgba(0,0,0,0.65)] shadow-sm transition-colors hover:border-[#0088ff] hover:text-[#0088ff]"
          title={labels.replayTitle}
        >
          <Play className="size-3.5" />
          <span className="hidden sm:inline">{labels.replay}</span>
        </button>
      </div>

      {/* راهنمای لمس */}
      {!animDone && boxes.length > 0 && null}
      <div className="pointer-events-none absolute bottom-2 right-2 z-10 hidden sm:block">
        <span className="rounded bg-white/85 px-2 py-1 text-[10px] text-[rgba(0,0,0,0.45)] shadow-sm">
          {labels.gestureHint}
        </span>
      </div>

      {!webglOk ? (
        /* پیام جایگزین برای WebViewهای قدیمی بدون WebGL */
        <div className="flex h-[320px] w-full flex-col items-center justify-center gap-2 bg-[#f4faff] px-6 text-center sm:h-[430px]">
          <BoxIcon className="size-10 text-[rgba(0,0,0,0.35)]" />
          <p className="text-sm font-medium text-[#15354e]">WebGL Not Supported</p>
          <p className="text-xs text-[rgba(0,0,0,0.55)] leading-relaxed max-w-xs">
            Please update your browser to enable 3D rendering.
          </p>
        </div>
      ) : (
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
          {pallets && pallets.length > 0 && (
            <PalletMeshes pallets={pallets} container={container} />
          )}
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
      )}

      {/* راهنمای رنگ‌ها و پالت‌ها */}
      {(boxes.length > 0 || (pallets && pallets.length > 0)) && (
        <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 border-t border-[#f0f0f0] px-3 py-2">
          {pallets && pallets.length > 0 && (
            <span className="inline-flex items-center gap-1.5 text-[10px] text-[#8c6239] font-medium tabular-nums bg-[#fbf6ee] px-2 py-0.5 rounded border border-[#e8d7c0]">
              <span className="inline-block size-2.5 rounded-[2px] bg-[#cba16c] border border-[#a67941]" />
              {formatNumber(pallets.length)} {locale === "fa" ? "پالت چوبی در کف" : "Floor Pallets"}
            </span>
          )}
          {Array.from(new Set(boxes.map((b) => b.productId))).map((pid) => {
            const b = boxes.find((x) => x.productId === pid)!;
            const count = boxes.filter((x) => x.productId === pid).length;
            return (
              <span key={pid} className="inline-flex items-center gap-1.5 text-[10px] text-[rgba(0,0,0,0.65)] tabular-nums">
                <span
                  className="inline-block size-2.5 rounded-[3px] border border-black/10"
                  style={{ backgroundColor: b.color }}
                />
                {formatNumber(count)} {labels.boxesUnit}
              </span>
            );
          })}
          <span className="inline-flex items-center gap-1 text-[10px] text-[rgba(0,0,0,0.45)]">
            <BoxIcon className="size-3" />
            {labels.interactive3d}
          </span>
        </div>
      )}
    </div>
  );
}
