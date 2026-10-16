import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type Language = 'en' | 'my' | 'th' | 'shn';

export interface LanguageOption {
  code: Language;
  name: string;
  nativeName: string;
  flag: string;
  region: string;
}

export const SUPPORTED_LANGUAGES: LanguageOption[] = [
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇬🇧', region: 'Global / Standard' },
  { code: 'my', name: 'Burmese', nativeName: 'မြန်မာစာ', flag: '🇲🇲', region: 'Myanmar' },
  { code: 'th', name: 'Thai', nativeName: 'ภาษาไทย', flag: '🇹🇭', region: 'Thailand' },
  { code: 'shn', name: 'Shan', nativeName: 'လိၵ်ႈတႆး', flag: '🇲🇲', region: 'Shan State / Tai' },
];

export const translations = {
  en: {
    // Brand & App
    appName: 'SHD M Supply',
    dashboardTitle: 'Admin Dashboard',
    tagline: 'Clinic Medicine Stock Management',
    subTagline: 'Report & Requisition Model • Periodic Stock',
    madeBy: 'Made by Saidar (SHD)',

    // Navigation
    navDashboard: 'Dashboard',
    navClinics: 'Clinics',
    navReports: 'Reports Inbox',
    navStock: 'Stock by Batch',
    navRequisitions: 'Requisitions',
    navColdChain: 'Cold Chain',
    navItems: 'Items Catalog',
    navAnalytics: 'Trends & Analytics',
    navSettings: 'Settings',

    // TopBar
    liveClock: 'Live Clock',
    timezone: 'Timezone',
    allDatesFormattedIn: 'All dates & times formatted in this zone',
    restApiConnected: 'REST API Connected',
    localMockEngine: 'Local Mock Engine',
    defaultPasswordActive: 'Default password active',
    changePasswordShort: 'Change pass',
    simulateClinicSync: 'Simulate Clinic Sync',
    signOut: 'Sign Out',
    language: 'Language',

    // Dashboard Overview
    overviewTitle: 'Clinic Medicine & Cold Chain Overview',
    overviewDesc: 'Monitoring periodic stock levels, batch-level expirations, and cold chain telemetry across remote and border clinics in the Special Health Division.',
    activeClinics: 'Active Clinics',
    borderRegional: 'Border & Regional',
    stockReportsSubmitted: 'stock reports submitted',
    coldChainUnits: 'Cold Chain Units',
    safeUnits: 'Safe',
    excursionUnits: 'Excursion',
    overdueUnits: 'overdue',
    batchExpiryStatus: 'Batch Expiry Status',
    trackedLots: 'Tracked Lots',
    redUrgent: 'Red (<3m)',
    amberWarning: 'Amber (<6m)',
    greenHealthy: 'Green Healthy',
    pendingRequisitions: 'Pending Requisitions',
    awaitingApproval: 'Awaiting Approval',
    readyForCarDispatch: 'ready for car dispatch',
    soonestExpiringTitle: 'Soonest-Expiring Batches Across Clinics',
    soonestExpiringSubtitle: 'Batches sorted by urgency (color-coded by expiry window)',
    viewAllBatches: 'View All Batches',
    activeExcursionsTitle: 'Active Temperature Excursion Alert',
    reviewExcursion: 'Review Excursion & Stock at Risk',
    recentReportsTitle: 'Recent Clinic Stock Reports',
    pendingReqsTitle: 'Pending Clinic Requisitions',
    reviewApprove: 'Review & Approve',
    inspectReport: 'Inspect &rarr;',

    // Table Headers & Fields
    itemAndBatch: 'Item & Batch',
    clinic: 'Clinic',
    qtyOnHand: 'Qty on Hand',
    expiryDate: 'Expiry Date',
    status: 'Status',
    actions: 'Actions',
    category: 'Category',
    storage: 'Storage',
    requested: 'Requested',
    approved: 'Approved Quantity',
    location: 'Location',
    code: 'Code',
    unit: 'Unit',
    reorderLevel: 'Reorder Level',
    condition: 'Condition',

    // Statuses
    healthy: 'Healthy',
    expiringSoon: 'Expiring soon',
    expired: 'Expired',
    pending: 'Pending Review',
    approvedStatus: 'Approved',
    fulfilled: 'Fulfilled',
    safe: 'Safe',
    inExcursion: 'In Excursion',
    overdue: 'Overdue',
    active: 'Active',
    inactive: 'Inactive',

    // Cold chain terms
    coldChainTitle: 'Cold Chain Monitoring Module',
    coldChainDesc: 'Comprehensive telemetry for fridges, freezers, temperature excursions, and cold-chain stock at risk',
    equipmentRegistry: 'Equipment Registry',
    tempCharts: 'Temperature Charts',
    readingLogs: 'Reading Logs',
    excursionsAndRisk: 'Excursions & Stock at Risk',
    powerOutages: 'Power & Outage Logs',
    registerEquipment: 'Register Equipment',
    stockAtRisk: 'Stock at Risk',
    resolveExcursion: 'Mark as Resolved',
    printLogSheet: 'Print WHO Log Sheet',
    safeStorageBand: 'WHO Safe Band (2°C - 8°C)',

    // Requisitions & Resupply
    requisitionsTitle: 'Clinic Requisitions & Resupply',
    requisitionsDesc: 'Review stock requests from clinics, adjust approved quantities, and dispatch by car',
    resupplyByCar: 'Resupply by Car',
    noCourier: 'Direct Car Dispatch (No shipping carrier)',
    printPullSheet: 'Print Pull Sheet for Pharmacy',
    resupplyNote: 'Resupply Note',
    pharmacistVerification: 'Pharmacist Verification',
    driverAcceptance: 'Car Driver / Medic Acceptance',

    // Settings
    settingsTitle: 'System & Account Settings',
    settingsDesc: 'Configure admin access credentials, display time zones, language preferences, and REST API backend connection',
    languagePreferences: 'Language Preferences',
    chooseSystemLanguage: 'Choose system interface language (English, Burmese, Thai, Shan)',
    adminCredentials: 'Admin Account Credentials',
    displayTimezone: 'Display Time Zone',
    restApiBackend: 'REST API Backend URL',
    factoryReset: 'Factory Data Reset',
    currentPassword: 'Current Password',
    newUsername: 'New Admin Username',
    newPassword: 'New Password',
    confirmPassword: 'Confirm New Password',
    updateCredentials: 'Update Credentials',

    // Common
    search: 'Search',
    filter: 'Filter',
    all: 'All',
    save: 'Save',
    cancel: 'Cancel',
    close: 'Close',
    edit: 'Edit',
    delete: 'Delete',
    print: 'Print Document',
    loading: 'Loading...',
  },

  my: {
    // Burmese (မြန်မာဘာသာ)
    appName: 'SHD အမ်-ဆပ်ပလိုင်း',
    dashboardTitle: 'စီမံခန့်ခွဲမှု ဒက်ရှ်ဘုတ်',
    tagline: 'ဆေးခန်းသုံး ဆေးဝါးသိုလှောင်မှု စီမံခန့်ခွဲရေးစနစ်',
    subTagline: 'အစီရင်ခံစာနှင့် တောင်းခံလွှာစနစ် (Report & Requisition)',
    madeBy: 'Made by Saidar (SHD)',

    // Navigation
    navDashboard: 'ပင်မဒက်ရှ်ဘုတ်',
    navClinics: 'ဆေးခန်းများ',
    navReports: 'အစီရင်ခံစာများ',
    navStock: 'ဆေးသိုလှောင်မှုစာရင်း',
    navRequisitions: 'ဆေးတောင်းခံလွှာများ',
    navColdChain: 'အအေးလမ်းကြောင်း (Cold Chain)',
    navItems: 'ဆေးဝါးအမျိုးအမည်စာရင်း',
    navAnalytics: 'အချက်အလက်ခွဲခြမ်းစိတ်ဖြာမှု',
    navSettings: 'ချိန်ညှိချက်များ',

    // TopBar
    liveClock: 'လက်ရှိအချိန်',
    timezone: 'စံတော်ချိန်',
    allDatesFormattedIn: 'အချိန်နှင့် ရက်စွဲအားလုံး ဤစံတော်ချိန်ဖြင့် ပြသထားပါသည်',
    restApiConnected: 'REST API ဆာဗာ ချိတ်ဆက်ထားသည်',
    localMockEngine: 'ဒေသတွင်း မိုဘိုင်းသိုလှောင်မှု (Mock Engine)',
    defaultPasswordActive: 'မူလစကားဝှက်ကို အသုံးပြုနေသည်',
    changePasswordShort: 'စကားဝှက်ပြောင်းရန်',
    simulateClinicSync: 'ဆေးခန်းဒေတာပေးပို့မှု စမ်းသပ်ရန်',
    signOut: 'အကောင့်ထွက်ရန်',
    language: 'ဘာသာစကား',

    // Dashboard Overview
    overviewTitle: 'ဆေးခန်းဆေးဝါးနှင့် အအေးလမ်းကြောင်း ခြုံငုံသုံးသပ်ချက်',
    overviewDesc: 'နယ်စပ်နှင့် ဝေးလံခေါင်ဖျား ဆေးခန်းများရှိ ဆေးဝါးပမာဏ၊ သက်တမ်းကုန်ဆုံးမည့် အချိန်နှင့် အအေးလမ်းကြောင်း အခြေအနေကို စောင့်ကြည့်စစ်ဆေးခြင်း။',
    activeClinics: 'ဖွင့်လှစ်ထားသော ဆေးခန်းများ',
    borderRegional: 'နယ်စပ်နှင့် ဒေသန္တရ',
    stockReportsSubmitted: 'ဆေးဝါးစာရင်း အစီရင်ခံထားသည်',
    coldChainUnits: 'အအေးထိန်းစက် ကိရိယာများ',
    safeUnits: 'ပုံမှန်အခြေအနေ',
    excursionUnits: 'အပူချိန်ဖောက်ဖျက်မှု',
    overdueUnits: 'အချိန်လွန်',
    batchExpiryStatus: 'သက်တမ်းကုန်ဆုံးမှု အခြေအနေ',
    trackedLots: 'မှတ်တမ်းတင်ထားသော ဆေးအသုတ်များ',
    redUrgent: 'အနီရောင် (<၃ လ)',
    amberWarning: 'အဝါရောင် (<၆ လ)',
    greenHealthy: 'အစိမ်းရောင် (ကျန်းမာ)',
    pendingRequisitions: 'ဆိုင်းငံ့တောင်းခံလွှာများ',
    awaitingApproval: 'အတည်ပြုချက် စောင့်ဆိုင်းနေသည်',
    readyForCarDispatch: 'မော်တော်ကားဖြင့် ပို့ဆောင်ရန် အဆင်သင့်',
    soonestExpiringTitle: 'သက်တမ်းကုန်ဆုံးရန် အနီးကပ်ဆုံး ဆေးဝါးများ',
    soonestExpiringSubtitle: 'သက်တမ်းကုန်ဆုံးမည့် အရေးတကြီးလိုအပ်မှုအလိုက် စီစဉ်ထားပါသည်',
    viewAllBatches: 'ဆေးဝါးအားလုံးကြည့်ရှုရန်',
    activeExcursionsTitle: 'အအေးလမ်းကြောင်း အပူချိန်ကျော်လွန်မှု သတိပေးချက်',
    reviewExcursion: 'အပူချိန်ကျော်လွန်မှုနှင့် စိုးရိမ်ရသောဆေးဝါးများ စစ်ဆေးရန်',
    recentReportsTitle: 'မကြာသေးမီက ရရှိထားသော ဆေးဝါးအစီရင်ခံစာများ',
    pendingReqsTitle: 'စစ်ဆေးဆဲ ဆေးတောင်းခံလွှာများ',
    reviewApprove: 'စစ်ဆေး၍ အတည်ပြုမည်',
    inspectReport: 'ကြည့်ရှုမည် &rarr;',

    // Table Headers & Fields
    itemAndBatch: 'ဆေးအမည်နှင့် ဆေးအသုတ် (Lot)',
    clinic: 'ဆေးခန်း',
    qtyOnHand: 'လက်ကျန်အရေအတွက်',
    expiryDate: 'သက်တမ်းကုန်ရက်စွဲ',
    status: 'အခြေအနေ',
    actions: 'လုပ်ဆောင်ချက်များ',
    category: 'အမျိုးအစား',
    storage: 'သိုလှောင်မှု အပူချိန်',
    requested: 'တောင်းခံအရေအတွက်',
    approved: 'အတည်ပြုအရေအတွက်',
    location: 'တည်နေရာ',
    code: 'ကုဒ်အမှတ်',
    unit: 'ယူနစ်',
    reorderLevel: 'ပြန်လည်မှာယူရမည့် အဆင့်',
    condition: 'အခြေအနေ',

    // Statuses
    healthy: 'ကောင်းမွန်သည်',
    expiringSoon: 'မကြာမီ သက်တမ်းကုန်မည်',
    expired: 'သက်တမ်းကုန်ဆုံးပြီး',
    pending: 'စိစစ်ဆဲ',
    approvedStatus: 'အတည်ပြုပြီး',
    fulfilled: 'ဆေးပေးပို့ပြီးစီး (Fulfilled)',
    safe: 'ပုံမှန် (Safe)',
    inExcursion: 'အပူချိန်ကျော်လွန် (Excursion)',
    overdue: 'တိုင်းတာချိန်ကျော်လွန် (Overdue)',
    active: 'အသုံးပြုဆဲ',
    inactive: 'ရပ်ဆိုင်းထားသည်',

    // Cold chain terms
    coldChainTitle: 'အအေးလမ်းကြောင်း စောင့်ကြည့်စစ်ဆေးရေးစနစ် (Cold Chain)',
    coldChainDesc: 'ကာကွယ်ဆေးနှင့် အင်ဆူလင်များ ထားရှိရာ ရေခဲသေတ္တာများ၏ အပူချိန်နှင့် ချွတ်ယွင်းမှုများကို အချိန်နှင့်တပြေးညီ မှတ်တမ်းတင်ခြင်း',
    equipmentRegistry: 'ရေခဲသေတ္တာ စာရင်းမှတ်ပုံတင်',
    tempCharts: 'အပူချိန်ဂရပ်ဖ်များ',
    readingLogs: 'အပူချိန် တိုင်းတာချက်မှတ်တမ်းများ',
    excursionsAndRisk: 'အပူချိန်ကျော်လွန်မှုနှင့် ဆေးဝါးအန္တရာယ်',
    powerOutages: 'လျှပ်စစ်မီးပြတ်တောက်မှု မှတ်တမ်း',
    registerEquipment: 'ကိရိယာအသစ် မှတ်ပုံတင်ရန်',
    stockAtRisk: 'အန္တရာယ်ရှိသော ဆေးဝါးများ (Stock at Risk)',
    resolveExcursion: 'ပြဿနာဖြေရှင်းပြီးအဖြစ် မှတ်သားရန်',
    printLogSheet: 'WHO စံချိန်မီ အပူချိန်စာရွက် ထုတ်ယူရန်',
    safeStorageBand: 'WHO သတ်မှတ် အပူချိန်အပိုင်းအခြား (၂°C မှ ၈°C)',

    // Requisitions & Resupply
    requisitionsTitle: 'ဆေးဝါးတောင်းခံလွှာနှင့် ပြန်လည်ဖြည့်တင်းမှု',
    requisitionsDesc: 'ဆေးခန်းများမှ တောင်းခံသည့် ဆေးပမာဏကို စိစစ်အတည်ပြုပြီး မော်တော်ကားဖြင့် ပို့ဆောင်ပေးခြင်း',
    resupplyByCar: 'မော်တော်ကားဖြင့် ပို့ဆောင်သည်',
    noCourier: 'တိုက်ရိုက်ကားဖြင့် ပို့ဆောင်မှု (ချောပို့ကုမ္ပဏီ မသုံးပါ)',
    printPullSheet: 'ဆေးဝါးထုတ်ယူရန် စာရွက်ပုံနှိပ်မည်',
    resupplyNote: 'ပို့ဆောင်ရေးမှတ်ချက်',
    pharmacistVerification: 'ဆေးဝါးကျွမ်းကျင်သူ လက်မှတ်',
    driverAcceptance: 'သယ်ယူပို့ဆောင်သူ/ယာဉ်မောင်း လက်မှတ်',

    // Settings
    settingsTitle: 'စနစ်နှင့် အကောင့်ချိန်ညှိချက်များ',
    settingsDesc: 'စီမံခန့်ခွဲသူ အကောင့်၊ စံတော်ချိန်၊ ဘာသာစကားနှင့် REST API ချိတ်ဆက်မှုများကို ပြင်ဆင်ရန်',
    languagePreferences: 'ဘာသာစကား ရွေးချယ်မှု',
    chooseSystemLanguage: 'စနစ်တစ်ခုလုံးတွင် အသုံးပြုလိုသော ဘာသာစကားကို ရွေးချယ်ပါ (English, မြန်မာ, ไทย, လိၵ်ႈတႆး)',
    adminCredentials: 'စီမံခန့်ခွဲသူ အကောင့်အချက်အလက်',
    displayTimezone: 'ပြသလိုသော စံတော်ချိန်',
    restApiBackend: 'REST API ဆာဗာ လိပ်စာ',
    factoryReset: 'မူလဒေတာ ပြန်လည်သတ်မှတ်ရန်',
    currentPassword: 'လက်ရှိစကားဝှက်',
    newUsername: 'အသုံးပြုသူအမည် အသစ်',
    newPassword: 'စကားဝှက်အသစ်',
    confirmPassword: 'စကားဝှက်အသစ် ပြန်ရိုက်ပါ',
    updateCredentials: 'အချက်အလက် ပြင်ဆင်မည်',

    // Common
    search: 'ရှာဖွေရန်',
    filter: 'စစ်ထုတ်ရန်',
    all: 'အားလုံး',
    save: 'သိမ်းဆည်းမည်',
    cancel: 'ပယ်ဖျက်မည်',
    close: 'ပိတ်မည်',
    edit: 'ပြင်ဆင်မည်',
    delete: 'ဖျက်မည်',
    print: 'ပုံနှိပ်မည် (Print)',
    loading: 'လုပ်ဆောင်နေပါသည်...',
  },

  th: {
    // Thai (ภาษาไทย)
    appName: 'SHD M Supply',
    dashboardTitle: 'แดชบอร์ดผู้ดูแลระบบ',
    tagline: 'ระบบบริหารจัดการคลังเวชภัณฑ์ประจำคลินิก',
    subTagline: 'ระบบรายงานสต็อกและใบเบิกยา (Report & Requisition Model)',
    madeBy: 'Made by Saidar (SHD)',

    // Navigation
    navDashboard: 'แดชบอร์ด',
    navClinics: 'คลินิกทั้งหมด',
    navReports: 'กล่องข้อความรายงาน',
    navStock: 'สต็อกตามล็อต (Lot/Batch)',
    navRequisitions: 'ใบเบิกเวชภัณฑ์',
    navColdChain: 'ระบบลูกโซ่ความเย็น (Cold Chain)',
    navItems: 'บัญชีรายการยา',
    navAnalytics: 'แนวโน้มและสถิติ',
    navSettings: 'การตั้งค่า',

    // TopBar
    liveClock: 'เวลาปัจจุบัน',
    timezone: 'เขตเวลา',
    allDatesFormattedIn: 'วันที่และเวลาทั้งหมดแสดงตามเขตเวลานี้',
    restApiConnected: 'เชื่อมต่อ REST API แล้ว',
    localMockEngine: 'ระบบจำลองข้อมูลในเครื่อง (Mock Engine)',
    defaultPasswordActive: 'กำลังใช้รหัสผ่านเริ่มต้น',
    changePasswordShort: 'เปลี่ยนรหัสผ่าน',
    simulateClinicSync: 'จำลองการซิงค์จากคลินิก',
    signOut: 'ออกจากระบบ',
    language: 'ภาษา',

    // Dashboard Overview
    overviewTitle: 'ภาพรวมคลังเวชภัณฑ์และลูกโซ่ความเย็น',
    overviewDesc: 'ติดตามระดับสต็อกยาตามรอบระยะเวลา การหมดอายุของแตละล็อต และข้อมูลอุณหภูมิลูกโซ่ความเย็นของคลินิกในเครือข่าย SHD',
    activeClinics: 'คลินิกที่เปิดบริการ',
    borderRegional: 'ชายแดนและภูมิภาค',
    stockReportsSubmitted: 'ส่งรายงานสต็อกแล้ว',
    coldChainUnits: 'ตู้เก็บความเย็นทั้งหมด',
    safeUnits: 'ปกติ',
    excursionUnits: 'อุณหภูมิผิดปกติ',
    overdueUnits: 'เกินกำหนดบันทึก',
    batchExpiryStatus: 'สถานะวันหมดอายุของยา',
    trackedLots: 'ล็อตที่ติดตาม',
    redUrgent: 'สีแดง (< 3 เดือน)',
    amberWarning: 'สีเหลือง (< 6 เดือน)',
    greenHealthy: 'สีเขียว ปกติ',
    pendingRequisitions: 'ใบเบิกที่รอดำเนินการ',
    awaitingApproval: 'รอการอนุมัติ',
    readyForCarDispatch: 'พร้อมส่งมอบทางรถยนต์',
    soonestExpiringTitle: 'เวชภัณฑ์ที่ใกล้หมดอายุเร็วที่สุดในระบบ',
    soonestExpiringSubtitle: 'เรียงตามความเร่งด่วนของวันหมดอายุในทุกล็อต',
    viewAllBatches: 'ดูทุกล็อตเวชภัณฑ์',
    activeExcursionsTitle: 'แจ้งเตือนอุณหภูมินอกเกณฑ์มาตรฐาน',
    reviewExcursion: 'ตรวจสอบอุณหภูมิผิดปกติและยามีความเสี่ยง',
    recentReportsTitle: 'รายงานสต็อกล่าสุดจากคลินิก',
    pendingReqsTitle: 'ใบเบิกยาที่รอตรวจสอบ',
    reviewApprove: 'ตรวจสอบและอนุมัติ',
    inspectReport: 'ดูรายละเอียด &rarr;',

    // Table Headers & Fields
    itemAndBatch: 'รายการยาและล็อต',
    clinic: 'คลินิก',
    qtyOnHand: 'ยอดคงเหลือ',
    expiryDate: 'วันหมดอายุ',
    status: 'สถานะ',
    actions: 'จัดการ',
    category: 'หมวดหมู่',
    storage: 'การจัดเก็บ',
    requested: 'จำนวนที่ขอเบิก',
    approved: 'จำนวนที่อนุมัติ',
    location: 'สถานที่ตั้ง',
    code: 'รหัส',
    unit: 'หน่วยบรรจุ',
    reorderLevel: 'จุดสั่งซื้อซ้ำ',
    condition: 'สภาวะ',

    // Statuses
    healthy: 'ปกติ (Healthy)',
    expiringSoon: 'ใกล้หมดอายุ (< 3ด)',
    expired: 'หมดอายุแล้ว',
    pending: 'รอตรวจสอบ',
    approvedStatus: 'อนุมัติแล้ว',
    fulfilled: 'ส่งมอบครบถ้วน (Fulfilled)',
    safe: 'ปลอดภัย (Safe)',
    inExcursion: 'อุณหภูมิผิดปกติ (Excursion)',
    overdue: 'ไม่ได้บันทึกตามกำหนด (Overdue)',
    active: 'เปิดใช้งาน',
    inactive: 'ปิดใช้งาน',

    // Cold chain terms
    coldChainTitle: 'ระบบติดตามลูกโซ่ความเย็น (Cold Chain Monitoring)',
    coldChainDesc: 'ตรวจวัดอุณหภูมิตู้เย็นเก็บวัคซีนและตู้แช่แข็ง ป้องกันการเสื่อมสภาพของยาที่ไวต่ออุณหภูมิ',
    equipmentRegistry: 'ทะเบียนตู้เก็บความเย็น',
    tempCharts: 'กราฟอุณหภูมิ',
    readingLogs: 'บันทึกการวัดอุณหภูมิ',
    excursionsAndRisk: 'อุณหภูมิผิดปกติและเวชภัณฑ์เสี่ยง',
    powerOutages: 'บันทึกไฟฟ้าดับและอุปกรณ์ชำรุด',
    registerEquipment: 'ลงทะเบียนตู้ใหม่',
    stockAtRisk: 'เวชภัณฑ์ที่มีความเสี่ยง (Stock at Risk)',
    resolveExcursion: 'บันทึกว่าแก้ไขแล้ว',
    printLogSheet: 'พิมพ์แบบฟอร์ม WHO บันทึกอุณหภูมิ',
    safeStorageBand: 'ช่วงอุณหภูมิปลอดภัยตามเกณฑ์ WHO (2°C - 8°C)',

    // Requisitions & Resupply
    requisitionsTitle: 'ใบเบิกยาและการเติมเวชภัณฑ์',
    requisitionsDesc: 'ตรวจสอบคำขอเบิกยา ปรับยอดอนุมัติ และจัดส่งโดยรถยนต์ประจำพื้นที่',
    resupplyByCar: 'จัดส่งโดยรถยนต์',
    noCourier: 'จัดส่งทางรถยนต์โดยตรง (ไม่ใช้บริษัทขนส่ง)',
    printPullSheet: 'พิมพ์ใบหยิบยาสำหรับห้องยา (Pull Sheet)',
    resupplyNote: 'บันทึกการส่งมอบ',
    pharmacistVerification: 'ลงชื่อเภสัชกรผู้จัดจ่าย',
    driverAcceptance: 'ลงชื่อพลขับ / บุคลากรผู้รับมอบ',

    // Settings
    settingsTitle: 'การตั้งค่าระบบและบัญชีผู้ใช้',
    settingsDesc: 'จัดการรหัสผ่านผู้ดูแลระบบ เขตเวลา ภาษาที่ใช้งาน และการเชื่อมต่อ REST API',
    languagePreferences: 'การตั้งค่าภาษา (Language Preferences)',
    chooseSystemLanguage: 'เลือกภาษาที่ต้องการใช้ในระบบ (English, မြန်မာ, ภาษาไทย, လိၵ်ႈတႆး)',
    adminCredentials: 'ข้อมูลประจำตัวผู้ดูแลระบบ',
    displayTimezone: 'เขตเวลาแสดงผล',
    restApiBackend: 'URL ของระบบ REST API Backend',
    factoryReset: 'คืนค่าข้อมูลตัวอย่างเริ่มต้น',
    currentPassword: 'รหัสผ่านปัจจุบัน',
    newUsername: 'ชื่อผู้ใช้ใหม่',
    newPassword: 'รหัสผ่านใหม่',
    confirmPassword: 'ยืนยันรหัสผ่านใหม่',
    updateCredentials: 'อัปเดตรหัสผ่าน',

    // Common
    search: 'ค้นหา',
    filter: 'กรอง',
    all: 'ทั้งหมด',
    save: 'บันทึก',
    cancel: 'ยกเลิก',
    close: 'ปิด',
    edit: 'แก้ไข',
    delete: 'ลบ',
    print: 'พิมพ์เอกสาร',
    loading: 'กำลังโหลด...',
  },

  shn: {
    // Shan (လိၵ်ႈတႆး)
    appName: 'SHD ဢႅမ်ႇ-သပ်ႉပလၢႆး',
    dashboardTitle: 'ၽိူၼ်ပွင်ၵၢၼ် ၽူႈၵုမ်းၵမ်',
    tagline: 'လွၵ်းပိူင်ၵုမ်းၵမ် ယႃႈယႃႁူင်းယႃပၢႆးယူႇလီ',
    subTagline: 'လွၵ်းပိူင် လိၵ်ႈတၢင်ႇလၢတ်ႈ လႄႈ လိၵ်ႈယွၼ်း (Report & Requisition)',
    madeBy: 'Made by Saidar (SHD)',

    // Navigation
    navDashboard: 'ၽိူၼ်ပွင်ၵၢၼ် (Dashboard)',
    navClinics: 'ႁူင်းယႃၶလီးၼိၵ်ႉ',
    navReports: 'ဢွင်ႈလိၵ်ႈတၢင်ႇလၢတ်ႈ',
    navStock: 'သဵၼ်ႈမၢႆယႃႈယႃ (Stock by Batch)',
    navRequisitions: 'လိၵ်ႈယွၼ်းယႃႈယႃ',
    navColdChain: 'ၶိူင်ႈၵတ်း (Cold Chain)',
    navItems: 'သဵၼ်ႈၸိုဝ်ႈယႃႈယႃ',
    navAnalytics: 'လွင်ႈထတ်းသၢင်ႈ (Analytics)',
    navSettings: 'လွင်ႈတင်ႈၵႃႈ (Settings)',

    // TopBar
    liveClock: 'ၶၢဝ်းယၢမ်းလႅတ်း',
    timezone: 'ၶွပ်ႇၶၢဝ်းယၢမ်း (Timezone)',
    allDatesFormattedIn: 'ဝၼ်းထိလႄႈၶၢဝ်းယၢမ်း တေၼႄၸွမ်းၶွပ်ႇၶၢဝ်းယၢမ်းၼႆႉ',
    restApiConnected: 'REST API ၵွင်ႉၸပ်းယဝ်ႉ',
    localMockEngine: 'ၸႂ်ႉၶေႃႈမုၼ်းၼႂ်းၶိူင်ႈ (Mock Engine)',
    defaultPasswordActive: 'တိုၵ်ႉၸႂ်ႉၶေႃႈလပ်ႉငဝ်ႈတိုၼ်း',
    changePasswordShort: 'လႅၵ်ႈလၢႆႈၶေႃႈလပ်ႉ',
    simulateClinicSync: 'ၸၢမ်းသူင်ႇၶေႃႈမုၼ်းၶလီးၼိၵ်ႉ',
    signOut: 'ဢွၵ်ႇပၢင်ၸႂ်ႉ',
    language: 'ၽႃႇသႃႇၵႂၢမ်း',

    // Dashboard Overview
    overviewTitle: 'လွင်ႈၵူတ်ႇထတ်း ယႃႈယႃ လႄႈ ၶိူင်ႈၵတ်းႁူင်းယႃ',
    overviewDesc: 'ၵူတ်ႇထတ်းယႃႈယႃၸွမ်းၶၢဝ်းယၢမ်း၊ ဝၼ်းမူတ်းဢႃႇယု ဢိၵ်ႇလူၺ်ႈ မုၵ်ႉၵတ်းသိမ်းယႃႈယႃ ၼႂ်းႁူင်းယႃပၢႆးယူႇလီၸိူဝ်းမီးၸွမ်းလႅၼ်လိၼ်။',
    activeClinics: 'ႁူင်းယႃဢၼ်ပိုတ်ႇဝႆႉ',
    borderRegional: 'လႅၼ်လိၼ် လႄႈ ၼႃႈလိၼ်',
    stockReportsSubmitted: 'လိၵ်ႈတၢင်ႇလၢတ်ႈယႃႈယႃ သူင်ႇယဝ်ႉ',
    coldChainUnits: 'ၶိူင်ႈတူႈၵတ်းတင်းမူတ်း',
    safeUnits: 'လီငၢမ်း',
    excursionUnits: 'မႆႈလိူဝ်/ၵတ်းလိူဝ်',
    overdueUnits: 'ပူၼ်ႉၶၢဝ်းယၢမ်း',
    batchExpiryStatus: 'သၢႆငၢႆဝၼ်းမူတ်းဢႃႇယု',
    trackedLots: 'ယႃႈယႃၸိူဝ်းမၢႆဝႆႉ',
    redUrgent: 'သီလႅင် (< ၃ လိူၼ်)',
    amberWarning: 'သီလိူင် (< ၆ လိူၼ်)',
    greenHealthy: 'သီၶဵဝ် (လီယူႇ)',
    pendingRequisitions: 'လိၵ်ႈယွၼ်းယႃႈယႃ ဢၼ်ပႂ်ႉဝႆႉ',
    awaitingApproval: 'ပႂ်ႉလွင်ႈမၵ်းမၼ်ႈ',
    readyForCarDispatch: 'ႁၢင်ႈႁႅၼ်းသူင်ႇလူၺ်ႈၵႃး',
    soonestExpiringTitle: 'ယႃႈယႃၸမ်မူတ်းဢႃႇယု ဝႆးသုတ်း',
    soonestExpiringSubtitle: 'ၸႅၵ်ႇၸွမ်းၼင်ႇ ဝၼ်းမူတ်းဢႃႇယု ၸမ်/ၵႆ',
    viewAllBatches: 'တူၺ်းယႃႈယႃတင်းမူတ်း',
    activeExcursionsTitle: 'ၶေႃႈၾၢင်ႉ မုၵ်ႉၵတ်းဢပူႇထၢင်ႇပူၼ်ႉပိူင်',
    reviewExcursion: 'ၵူတ်ႇထတ်း တူႈၵတ်း လႄႈ ယႃႈယႃဢၼ်မီးၽေး',
    recentReportsTitle: 'လိၵ်ႈတၢင်ႇလၢတ်ႈ ဢၼ်ႁပ်ႉလႆႈမႂ်ႇ',
    pendingReqsTitle: 'လိၵ်ႈယွၼ်းယႃႈယႃ ဢၼ်တိုၵ်ႉၵူတ်ႇထတ်း',
    reviewApprove: 'ၵူတ်ႇထတ်း လႄႈ မၵ်းမၼ်ႈ',
    inspectReport: 'ၶဝ်ႈတူၺ်း &rarr;',

    // Table Headers & Fields
    itemAndBatch: 'ၸိုဝ်ႈယႃႈယႃ လႄႈ မၢႆယႃႈ (Lot)',
    clinic: 'ႁူင်းယႃ',
    qtyOnHand: 'ယႃႈယႃၵိုတ်းလိူဝ်',
    expiryDate: 'ဝၼ်းမူတ်းဢႃႇယု',
    status: 'သၢႆငၢႆ',
    actions: 'လွင်ႈႁဵတ်းသၢင်ႈ',
    category: 'ထၢၼ်ႈယႃႈယႃ',
    storage: 'လွင်ႈသိမ်းပႅင်း',
    requested: 'ယွၼ်းဢဝ်',
    approved: 'မၵ်းမၼ်ႈပၼ်',
    location: 'ဢွင်ႈတီႈ',
    code: 'မၢႆၶူတ်ႉ',
    unit: 'ဢၼ်/မဵဝ်း',
    reorderLevel: 'ၶၵ်ႉတေလႆႈသင်ႇမႂ်ႇ',
    condition: 'သၢႆငၢႆ',

    // Statuses
    healthy: 'လီယူႇ (Healthy)',
    expiringSoon: 'ၸမ်မူတ်းဢႃႇယု (< ၃လိူၼ်)',
    expired: 'မူတ်းဢႃႇယုယဝ်ႉ',
    pending: 'တိုၵ်ႉၵူတ်ႇထတ်း',
    approvedStatus: 'မၵ်းမၼ်ႈယဝ်ႉ',
    fulfilled: 'သူင်ႇပၼ်ယဝ်ႉတူဝ်ႈ (Fulfilled)',
    safe: 'လီငၢမ်း (Safe)',
    inExcursion: 'ဢပူႇထၢင်ႇပူၼ်ႉပိူင် (Excursion)',
    overdue: 'ပူၼ်ႉၶၢဝ်းယၢမ်းမၢႆ (Overdue)',
    active: 'ၸႂ်ႉတိုဝ်းယူႇ',
    inactive: 'ၵိုတ်းယိုတ်းဝႆႉ',

    // Cold chain terms
    coldChainTitle: 'ၶိူင်ႈၵုမ်းၵမ်လွင်ႈၵတ်း (Cold Chain Monitoring)',
    coldChainDesc: 'ၵူတ်ႇထတ်းတူႈယႃႈယႃၵတ်း၊ တူႈၼမ်ႉၶႅင် လႄႈ ၵႅတ်ႇၶႄယႃႈယႃၶိုၵ်ႉၶႅမ်ႉ တႃႇၵူၼ်းပဵၼ်',
    equipmentRegistry: 'သဵၼ်ႈမၢႆတူႈၵတ်းယႃႈယႃ',
    tempCharts: 'ၵျၢပ်ႉၶၢဝ်းယၢမ်း လွင်ႈၵတ်း',
    readingLogs: 'မၢႆတွင်းလွင်ႈၵူတ်ႇထတ်း ဢပူႇထၢင်ႇ',
    excursionsAndRisk: 'ဢပူႇထၢင်ႇပူၼ်ႉပိူင် လႄႈ ယႃႈယႃဢၼ်မီးၽေး',
    powerOutages: 'မၢႆတွင်းၾႆးၾႃႉမွတ်ႇ',
    registerEquipment: 'မၢႆၶဝ်ႈတူႈၵတ်းမႂ်ႇ',
    stockAtRisk: 'ယႃႈယႃဢၼ်မီးၽေး (Stock at Risk)',
    resolveExcursion: 'မၢႆဝႃႈ မႄးယဝ်ႉတူဝ်ႈ',
    printLogSheet: 'တွၵ်ႇဢွၵ်ႇ ပိူင်ၽၢင် WHO တူၺ်းဢပူႇထၢင်ႇ',
    safeStorageBand: 'ၶွပ်ႇဢပူႇထၢင်ႇလွတ်ႈၽေး WHO (၂°C ထိုင် ၈°C)',

    // Requisitions & Resupply
    requisitionsTitle: 'လိၵ်ႈယွၼ်းယႃႈယႃ လႄႈ လွင်ႈသူင်ႇတၢင်ႇ',
    requisitionsDesc: 'ၵူတ်ႇထတ်းလိၵ်ႈယွၼ်းယႃႈယႃ ႁူင်းယႃၶလီးၼိၵ်ႉ၊ မၵ်းမၼ်ႈသဵၼ်ႈမၢႆ လႄႈ သူင်ႇပၼ်လူၺ်ႈၵႃး',
    resupplyByCar: 'သူင်ႇပၼ်လူၺ်ႈၵႃး',
    noCourier: 'သူင်ႇလူၺ်ႈၵႃးၵမ်းသိုဝ်ႈ (ဢမ်ႇၸႂ်ႉၶွမ်ႇပၼီႇသူင်ႇၶူဝ်း)',
    printPullSheet: 'တွၵ်ႇဢွၵ်ႇ ၽိုၼ်လိၵ်ႈထွတ်ႇယႃႈယႃ (Pull Sheet)',
    resupplyNote: 'မၢႆတွင်းလွင်ႈသူင်ႇ',
    pharmacistVerification: 'လၢႆးမိုဝ်း ၽူႈပၼ်ယႃႈယႃ',
    driverAcceptance: 'လၢႆးမိုဝ်း ၵူၼ်းႁေႃႈၵႃး / ၵူၼ်းႁပ်ႉယႃႈ',

    // Settings
    settingsTitle: 'လွင်ႈတင်ႈၵႃႈ လႄႈ ဢၶွင်ႉ',
    settingsDesc: 'လႅၵ်ႈလၢႆႈ ၶေႃႈလပ်ႉၽူႈၵုမ်းၵမ်၊ ၶွပ်ႇၶၢဝ်းယၢမ်း၊ ၽႃႇသႃႇၵႂၢမ်း လႄႈ လွင်ႈၵွင်ႉၸပ်း REST API',
    languagePreferences: 'လွင်ႈလိူၵ်ႈၽႃႇသႃႇၵႂၢမ်း (Language Preferences)',
    chooseSystemLanguage: 'လိူၵ်ႈၽႃႇသႃႇၵႂၢမ်း ဢၼ်ၶႂ်ႈၸႂ်ႉတိုဝ်းၼႂ်းလွၵ်းပိူင် (English, မြန်မာ, ภาษาไทย, လိၵ်ႈတႆး)',
    adminCredentials: 'ၶေႃႈမုၼ်း ၽူႈၵုမ်းၵမ် (Admin)',
    displayTimezone: 'ၶွပ်ႇၶၢဝ်းယၢမ်း တႃႇၼႄဝၼ်းထိ',
    restApiBackend: 'ႁူဝ်ၼႃႈလဵၵ်ႉ REST API',
    factoryReset: 'ၶိုၼ်းတင်ႈၵႃႈ ငဝ်ႈတိုၼ်း (Factory Reset)',
    currentPassword: 'ၶေႃႈလပ်ႉယၢမ်းလဵဝ်',
    newUsername: 'ၸိုဝ်ႈၽူႈၸႂ်ႉမႂ်ႇ',
    newPassword: 'ၶေႃႈလပ်ႉမႂ်ႇ',
    confirmPassword: 'ယိုၼ်ယၼ်ၶေႃႈလပ်ႉမႂ်ႇ',
    updateCredentials: 'မႄးၶေႃႈလပ်ႉမႂ်ႇ',

    // Common
    search: 'သွၵ်ႈႁႃ',
    filter: 'ထတ်းလိူၵ်ႈ',
    all: 'တင်းမူတ်း',
    save: 'သိမ်းဝႆႉ',
    cancel: 'ယႃႉပႅတ်ႈ',
    close: 'ပိၵ်ႉ',
    edit: 'မႄးထတ်း',
    delete: 'ယႃႉသိမ်း',
    print: 'တွၵ်ႇဢွၵ်ႇ (Print)',
    loading: 'တိုၵ်ႉလူတ်ႇ...',
  },
} as const;

export type TranslationKey = keyof typeof translations.en;

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: TranslationKey) => string;
}

const LanguageContext = createContext<LanguageContextType>({
  language: 'en',
  setLanguage: () => {},
  t: (key) => translations.en[key] || key,
});

const LANGUAGE_STORAGE_KEY = 'shd_msupply_language';

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem(LANGUAGE_STORAGE_KEY) as Language;
    if (saved && (saved === 'en' || saved === 'my' || saved === 'th' || saved === 'shn')) {
      return saved;
    }
    return 'en';
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem(LANGUAGE_STORAGE_KEY, lang);
    // Set lang attribute on html tag
    document.documentElement.lang = lang;
  };

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  const t = (key: TranslationKey): string => {
    const langDict = translations[language] as Record<string, string>;
    if (langDict && langDict[key]) {
      return langDict[key];
    }
    return (translations.en as Record<string, string>)[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
