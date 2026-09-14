"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ContainerSpec, faNumber } from "@/lib/containers";
import { CalculationResult } from "@/lib/load-calculation";
import { CartonForm } from "./cargo-form";
import {
  Boxes,
  Ruler,
  Weight,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Package2,
  Layers3,
  Box,
} from "lucide-react";

interface Props {
  carton: CartonForm;
  result: CalculationResult;
  container: ContainerSpec;
}

// بصری‌سازی چیدمان - نمایش ایزومتریک کانتینر و کارتن‌ها
function PackingVisualization({ result, container }: { result: CalculationResult; container: ContainerSpec }) {
  // مقیاس: طول کانتینر رو به ۳۸۰ پیکسل تبدیل می‌کنیم
  const SCALE = 380 / container.internalLength;
  const cw = container.internalWidth * SCALE;
  const ch = container.internalHeight * SCALE;
  const cl = 380;

  // ابعاد هر کارتن در حالت انتخاب شده
  const bw = result.effectiveWidth * SCALE;
  const bh = result.effectiveHeight * SCALE;
  const bl = result.effectiveLength * SCALE;

  // تعداد در طول، عرض، ارتفاع
  const nL = result.layoutLength;
  const nW = result.layoutWidth;
  const nH = result.layoutHeight;

  // نمایش ایزومتریک با زاویه ۳۰ درجه
  const angle = Math.PI / 6; // 30°
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);
  // فاکتور عمق برای افکت 3D
  const depth = 0.7;

  const W = cl * cos + cw * cos + 60;
  const H = ch + Math.max(cl, cw) * sin + 40;

  // تولید مختصات کارتن‌ها - نمایش حداکثر ۳ لایه اول (جلو-بالا)
  const cartons: { x: number; y: number; z: number; isFront: boolean }[] = [];
  const MAX_DRAW = 200; // حداکثر تعداد برای رسم
  let drawn = 0;
  for (let i = 0; i < nL && drawn < MAX_DRAW; i++) {
    for (let j = 0; j < nW && drawn < MAX_DRAW; j++) {
      for (let k = 0; k < nH && drawn < MAX_DRAW; k++) {
        cartons.push({
          x: i * bl,
          y: j * bw,
          z: k * bh,
          isFront: i < 4 && j < 4 && k < 3, // فقط اولین‌ها را در جلو رنگ می‌کنیم
        });
        drawn++;
      }
    }
  }

  // تبدیل مختصات 3D به 2D ایزومتریک
  // مبدا: پایین-چپ کانتینر
  const originX = 30 + cw * cos;
  const originY = H - ch - 20;
  const project = (x: number, y: number, z: number) => {
    // x در طول کانتینر، y در عرض، z در ارتفاع
    // در نمای ایزومتریک: x → +x*cos + y*sin ... 
    // مختصات نهایی:
    //   px = originX + x*cos - y*cos  (در جهت L + در جهت -W)
    //   py = originY - z + x*sin + y*sin (ارتفاع + عمق طول + عمق عرض)
    // توجه: در RTL، x ما معکوس است
    const px = originX + x * cos - y * cos;
    const py = originY - z + x * sin + y * sin;
    return { px, py };
  };

  // رسم یک جعبه
  const drawBox = (
    x: number,
    y: number,
    z: number,
    w: number,
    d: number,
    h: number,
    fill: string,
    stroke: string,
    opacity = 1
  ) => {
    // ۸ گوشه جعبه
    const corners = [
      project(x, y, z), // 0 پایین جلو
      project(x + w, y, z), // 1 پایین جلو راست
      project(x + w, y + d, z), // 2 پایین عقب راست
      project(x, y + d, z), // 3 پایین عقب چپ
      project(x, y, z + h), // 4 بالا جلو چپ
      project(x + w, y, z + h), // 5 بالا جلو راست
      project(x + w, y + d, z + h), // 6 بالا عقب راست
      project(x, y + d, z + h), // 7 بالا عقب چپ
    ];

    // رویه‌ها (به ترتیب از دور به نزدیک برای z-order)
    const faces = [
      { pts: [0, 1, 5, 4], fill: fill, op: opacity * 1.0, name: "front" }, // جلو
      { pts: [1, 2, 6, 5], fill: fill, op: opacity * 0.8, name: "right" }, // راست
      { pts: [3, 2, 6, 7], fill: fill, op: opacity * 0.6, name: "back" }, // عقب
      { pts: [0, 3, 7, 4], fill: fill, op: opacity * 0.85, name: "left" }, // چپ
      { pts: [4, 5, 6, 7], fill: fill, op: opacity * 1.1, name: "top" }, // بالا
    ];

    const paths = faces.map((f) => ({
      d: `M ${corners[f.pts[0]].px},${corners[f.pts[0]].py} ` +
        f.pts.slice(1).map((i) => `L ${corners[i].px},${corners[i].py}`).join(" ") +
        " Z",
      fill: f.fill,
      op: f.op,
    }));

    return paths;
  };

  // رسم کانتینر (قاب) - رنگ کمرنگ
  const containerFaces = drawBox(
    0,
    0,
    0,
    cl,
    cw,
    ch,
    "transparent",
    "oklch(0.6 0.02 220)",
    1
  );

  // رسم کارتن‌ها - فقط در لایه اول (z=0) و در جلو (i=0 و j=0) و در بالا (k=0)
  // برای جلوگیری از شلوغی، فقط گوشه‌ها رسم می‌شوند
  // اولین لایه پایین
  const cartonElements: React.ReactNode[] = [];
  // انتخاب رنگ کارتن‌ها
  const cartonColors = ["#0d9488", "#14b8a6", "#5eead4"];

  // برای جلوگیری از سنگین شدن SVG، فقط در لایه اول رسم می‌کنیم
  // تعداد نهایی = layoutL * layoutW * layoutH
  // نما: پایین-جلو (z=0) + یک ردیف از ارتفاع برای نمایش لایه‌بندی
  const showCount = Math.min(cartons.length, MAX_DRAW);
  // مرتب‌سازی بر اساس موقعیت - دورترین‌ها اول
  const sorted = [...cartons].sort((a, b) => {
    // اول کسانی که دورتر هستند (x و y بزرگتر) رسم می‌شوند
    return b.x + b.y - a.x - a.y;
  });

  sorted.forEach((c, idx) => {
    const faces = drawBox(
      c.x,
      c.y,
      c.z,
      bl,
      bw,
      bh,
      cartonColors[c.z > 0 ? 1 : 0],
      "oklch(0.3 0.05 200)",
      0.95
    );
    faces.forEach((f, fi) => {
      cartonElements.push(
        <path
          key={`cart-${idx}-${fi}`}
          d={f.d}
          fill={f.fill}
          stroke="oklch(0.3 0.05 200)"
          strokeWidth={0.5}
          opacity={f.op}
        />
      );
    });
  });

  return (
    <div className="w-full overflow-x-auto scrollbar-fa rounded-lg bg-gradient-to-br from-sky-50 to-emerald-50 dark:from-slate-900 dark:to-slate-800 p-2">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="w-full h-auto max-h-[420px]"
        preserveAspectRatio="xMidYMid meet"
      >
        {/* سایه زمین */}
        <ellipse
          cx={W / 2}
          cy={H - 10}
          rx={W / 2.4}
          ry={6}
          fill="oklch(0 0 0 / 0.1)"
        />
        {/* کانتینر - قاب */}
        {containerFaces.map((f, i) => (
          <path
            key={`cont-${i}`}
            d={f.d}
            fill={f.fill}
            stroke={f.fill === "transparent" ? "oklch(0.6 0.02 220)" : f.fill}
            strokeWidth={1.5}
            strokeDasharray="2,2"
            opacity={0.6}
          />
        ))}
        {/* کارتن‌ها */}
        {cartonElements}
        {/* برچسب ابعاد */}
        <text
          x={W / 2}
          y={H - 2}
          textAnchor="middle"
          fontSize="9"
          fill="oklch(0.4 0.02 220)"
          fontFamily="var(--font-vazirmatn), sans-serif"
        >
          طول: {faNumber(container.internalLength, 0)} سانتی‌متر
        </text>
      </svg>
    </div>
  );
}

export function ResultsPanel({ carton, result, container }: Props) {
  const isOk = result.volumeUtilization >= 70 && result.weightUtilization <= 95;
  const isWarning = result.volumeUtilization < 60 || result.weightUtilization > 95;

  return (
    <div className="space-y-4 animate-fade-in-up">
      {/* نتیجه کلی */}
      <Card className="border-primary/30">
        <CardHeader className="bg-gradient-to-l from-primary/15 via-primary/5 to-transparent">
          <CardTitle className="flex items-center justify-between text-primary">
            <span className="flex items-center gap-2">
              <Boxes className="size-5" />
              نتیجه محاسبه
            </span>
            {result.allFits ? (
              <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-200">
                <CheckCircle2 className="size-3 ml-1" />
                همه جا می‌شوند
              </Badge>
            ) : (
              <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-200">
                <AlertTriangle className="size-3 ml-1" />
                فضای کافی نیست
              </Badge>
            )}
          </CardTitle>
          <CardDescription>
            کانتینر انتخاب‌شده: {container.nameFa} | نام کارتن: {carton.name}
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-4 space-y-4">
          {/* شاخص‌های اصلی */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-card border rounded-lg p-3 text-center">
              <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground mb-1">
                <Package2 className="size-3.5" />
                تعداد جاگرفته
              </div>
              <div className="text-2xl font-bold text-primary">
                {faNumber(result.fittingCount)}
              </div>
              <div className="text-[10px] text-muted-foreground mt-0.5">
                از {faNumber(parseInt(carton.quantity) || 0)} کارتن
              </div>
            </div>
            <div className="bg-card border rounded-lg p-3 text-center">
              <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground mb-1">
                <Layers3 className="size-3.5" />
                درصد حجم
              </div>
              <div className={`text-2xl font-bold ${result.volumeUtilization >= 70 ? "text-emerald-600" : result.volumeUtilization >= 50 ? "text-amber-600" : "text-red-600"}`}>
                {faNumber(result.volumeUtilization, 1)}٪
              </div>
              <div className="text-[10px] text-muted-foreground mt-0.5">
                از حجم کانتینر
              </div>
            </div>
            <div className="bg-card border rounded-lg p-3 text-center">
              <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground mb-1">
                <Weight className="size-3.5" />
                درصد وزن
              </div>
              <div className={`text-2xl font-bold ${result.weightUtilization <= 95 ? "text-emerald-600" : "text-red-600"}`}>
                {faNumber(result.weightUtilization, 1)}٪
              </div>
              <div className="text-[10px] text-muted-foreground mt-0.5">
                از وزن مجاز
              </div>
            </div>
            <div className="bg-card border rounded-lg p-3 text-center">
              <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground mb-1">
                <TrendingUp className="size-3.5" />
                استفاده کلی
              </div>
              <div className="text-2xl font-bold text-primary">
                {faNumber(result.overallUtilization, 1)}٪
              </div>
              <div className="text-[10px] text-muted-foreground mt-0.5">
                حد بهینه
              </div>
            </div>
          </div>

          {/* نوارهای پیشرفت */}
          <div className="space-y-3">
            <div>
              <div className="flex items-center justify-between mb-1.5 text-sm">
                <span className="flex items-center gap-1.5">
                  <Box className="size-3.5" />
                  اشغال حجم
                </span>
                <span className="font-medium">
                  {faNumber(result.totalVolume, 2)} / {faNumber(container.capacity, 1)} مترمکعب
                </span>
              </div>
              <Progress value={result.volumeUtilization} className="h-2.5" />
            </div>
            <div>
              <div className="flex items-center justify-between mb-1.5 text-sm">
                <span className="flex items-center gap-1.5">
                  <Weight className="size-3.5" />
                  اشغال وزن
                </span>
                <span className="font-medium">
                  {faNumber(result.totalWeight)} / {faNumber(container.maxPayload)} کیلوگرم
                </span>
              </div>
              <Progress
                value={result.weightUtilization}
                className="h-2.5"
              />
            </div>
          </div>

          <Separator />

          {/* چیدمان */}
          <div className="grid grid-cols-3 gap-2 text-sm">
            <div className="flex flex-col gap-1">
              <span className="text-xs text-muted-foreground">چیدمان</span>
              <span className="font-medium text-right">{result.orientationLabel}</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-xs text-muted-foreground">تعداد در طول/عرض/ارتفاع</span>
              <span className="font-medium text-right">
                {faNumber(result.layoutLength)} × {faNumber(result.layoutWidth)} × {faNumber(result.layoutHeight)}
              </span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-xs text-muted-foreground">ابعاد مؤثر کارتن</span>
              <span className="font-medium text-right">
                {faNumber(result.effectiveLength, 1)} × {faNumber(result.effectiveWidth, 1)} × {faNumber(result.effectiveHeight, 1)} سانت
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* بصری‌سازی چیدمان */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-primary">
            <Ruler className="size-5" />
            نمایش چیدمان
          </CardTitle>
          <CardDescription>
            نحوه چیده شدن کارتن‌ها در کانتینر (نمای ایزومتریک)
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-4">
          {result.fittingCount > 0 ? (
            <PackingVisualization result={result} container={container} />
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <AlertTriangle className="size-10 mx-auto mb-2" />
              کارتن در کانتینر نمی‌گنجد. ابعاد را بررسی کنید.
            </div>
          )}
          <p className="text-xs text-muted-foreground mt-2 text-center">
            * این نمایش نمایی است و برای درک بهتر چیدمان ساده شده است.
          </p>
        </CardContent>
      </Card>

      {/* هشدارها */}
      {result.warnings.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-amber-600">
              <AlertTriangle className="size-5" />
              هشدارها و یادآوری‌ها
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {result.warnings.map((w, i) => (
              <Alert key={i} className="border-amber-200 bg-amber-50 dark:bg-amber-950/30">
                <AlertTriangle className="size-4 text-amber-600" />
                <AlertDescription className="text-amber-900 dark:text-amber-200">
                  {w}
                </AlertDescription>
              </Alert>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
