export type Locale = "fa" | "en" | "ar" | "zh" | "ru" | "es" | "tr" | "de" | "fr";

export interface LanguageInfo {
  code: Locale;
  name: string;
  nativeName: string;
  flag: string;
  dir: "rtl" | "ltr";
}

export const LANGUAGES: LanguageInfo[] = [
  { code: "fa", name: "Persian", nativeName: "فارسی", flag: "🇮🇷", dir: "rtl" },
  { code: "en", name: "English", nativeName: "English", flag: "🇬🇧", dir: "ltr" },
  { code: "ar", name: "Arabic", nativeName: "العربية", flag: "🇸🇦", dir: "rtl" },
  { code: "zh", name: "Chinese", nativeName: "中文 (简体)", flag: "🇨🇳", dir: "ltr" },
  { code: "ru", name: "Russian", nativeName: "Русский", flag: "🇷🇺", dir: "ltr" },
  { code: "es", name: "Spanish", nativeName: "Español", flag: "🇪🇸", dir: "ltr" },
  { code: "tr", name: "Turkish", nativeName: "Türkçe", flag: "🇹🇷", dir: "ltr" },
  { code: "de", name: "German", nativeName: "Deutsch", flag: "🇩🇪", dir: "ltr" },
  { code: "fr", name: "French", nativeName: "Français", flag: "🇫🇷", dir: "ltr" },
];

export interface TranslationDictionary {
  meta: {
    title: string;
    description: string;
    keywords: string[];
    ogTitle: string;
    ogDesc: string;
  };
  nav: {
    brand: string;
    subBrand: string;
    tools: string;
    guide: string;
    about: string;
    cbmCalculator: string;
    containerLoad: string;
    openMenu: string;
    closeMenu: string;
    switchLang: string;
    parentSite: string;
    freeBadge: string;
  };
  hero: {
    title: string;
    description: string;
    freeHighlight: string;
    btnLoad: string;
    btnCbm: string;
  };
  steps: {
    products: string;
    containers: string;
    result: string;
  };
  products: {
    title: string;
    subtitle: string;
    usePallets: string;
    addGroup: string;
    group: string;
    item: string;
    type: string;
    name: string;
    length: string;
    width: string;
    height: string;
    weight: string;
    quantity: string;
    color: string;
    stackable: string;
    maxStack: string;
    noLimit: string;
    addCargo: string;
    importExcel: string;
    exportExcel: string;
    nextToContainers: string;
    fillRequired: string;
    productTypes: Record<string, string>;
  };
  containers: {
    title: string;
    subtitle: string;
    tabContainers: string;
    tabTrucks: string;
    internalDims: string;
    externalDims: string;
    maxPayload: string;
    tareWeight: string;
    grossWeight: string;
    volumeCapacity: string;
    nextToResult: string;
    backToProducts: string;
    items: Record<string, { name: string; desc: string }>;
  };
  result: {
    title: string;
    exportPdf: string;
    totalPlaced: string;
    volumeUtil: string;
    weightUtil: string;
    placedWeight: string;
    containerCapacity: string;
    maxPayload: string;
    packingSequence: string;
    stepByStep: string;
    cargoList: string;
    name: string;
    qtyPlaced: string;
    qtyTotal: string;
    status: string;
    allFit: string;
    partialFit: string;
    playAnimation: string;
    pauseAnimation: string;
    resetView: string;
    back: string;
    restart: string;
  };
  cbm: {
    title: string;
    subtitle: string;
    modeSea: string;
    modeAir: string;
    modeRoad: string;
    modeRail: string;
    unitMm: string;
    unitCm: string;
    addPackage: string;
    pkgType: string;
    palletStandard: string;
    length: string;
    width: string;
    height: string;
    diameter: string;
    weightPerPkg: string;
    quantity: string;
    totalCbm: string;
    totalWeight: string;
    grossWeight: string;
    volumetricWeight: string;
    chargeableWeight: string;
    compareModes: string;
    proformaBtn: string;
    types: Record<string, string>;
    pallets: Record<string, string>;
    modes: Record<string, { title: string; hint: string }>;
  };
  proforma: {
    dialogTitle: string;
    invoiceNo: string;
    issueDate: string;
    issuerInfo: string;
    customerInfo: string;
    issuerName: string;
    customerName: string;
    phone: string;
    notes: string;
    freightCalculation: string;
    rateBasis: string;
    basisCbm: string;
    basisWeight: string;
    rateUsd: string;
    dollarExchangeRate: string;
    totalUsd: string;
    totalLocal: string;
    printBtn: string;
    closeBtn: string;
  };
  faq: {
    title: string;
    q1: string;
    a1: string;
    q2: string;
    a2: string;
    q3: string;
    a3: string;
    q4: string;
    a4: string;
  };
  benefits: {
    title: string;
    b1Title: string;
    b1Desc: string;
    b2Title: string;
    b2Desc: string;
    b3Title: string;
    b3Desc: string;
  };
  tableSpecs: {
    title: string;
    colType: string;
    colInternal: string;
    colDoor: string;
    colVolume: string;
    colPayload: string;
  };
  footer: {
    desc: string;
    disclaimer: string;
    rights: string;
  };
}
