# طرح توسعه جامع و معماری نهایی پروژه Tambr (ریال‌توکن)

بر اساس "طرح معماری و نقشه راه پیاده‌سازی نهایی" ارائه شده توسط شما و بررسی ساختار فعلی پروژه (Monorepo مبتنی بر pnpm Workspaces)، این سند، طرح توسعه جامع و معماری نهایی را برای تبدیل پروژه به یک پلتفرم کامل، بی‌نقص و آماده تولید (Production-Ready) تشریح می‌کند.

## ۱. معماری نهایی پروژه (Final Project Architecture)

پروژه بر اساس یک ساختار **Monorepo** با استفاده از **pnpm Workspaces** و **TypeScript** پیاده‌سازی خواهد شد تا از یکپارچگی و اشتراک‌گذاری کد در سراسر پشته (Full-Stack) اطمینان حاصل شود.

### ۱.۱. ساختار Monorepo

| مسیر | محتوا | تکنولوژی | توضیحات |
| :--- | :--- | :--- | :--- |
| `packages/contracts` | قراردادهای هوشمند | **Solidity** (EVM), **Hardhat** | هسته بلاکچین شامل DBC، IRR-Stablecoin، Smart Tickets، SBTs و Governance. |
| `packages/backend` | سرویس‌های بک‌اند | **NestJS** (TypeScript, Node.js) | API Gateway، مدیریت KYC/AML، اوراکل، مدیریت کاربران و کیف پول (SRW). |
| `packages/frontend` | رابط کاربری اصلی | **Next.js** (React, TypeScript) | رابط کاربری وب، داشبورد کاربران، رابط DBC، مدیریت SRW و تراکنش‌های Gasless. |
| `packages/relayer` | شبکه رله تراکنش | **NestJS/Express** | سرویس اختصاصی برای دریافت Meta-Transactions و پرداخت Gas Fee در Sidechain. |
| `packages/shared` | کتابخانه‌های مشترک | **TypeScript** | شامل Type Definitions، توابع Utility، و منطق مشترک برای تعامل با قراردادها. |

### ۱.۲. پشته فناوری (Technology Stack)

| لایه | فناوری اصلی | ابزارهای کلیدی |
| :--- | :--- | :--- |
| **بلاکچین** | Solidity (EVM) | Hardhat, Ethers.js, OpenZeppelin |
| **بک‌اند** | NestJS (Node.js, TypeScript) | TypeORM (PostgreSQL), Passport.js (JWT) |
| **فرانت‌اند** | Next.js (React, TypeScript) | Tailwind CSS, Zustand (State Management), Web3Modal |
| **پایگاه داده** | PostgreSQL | برای ذخیره داده‌های خارج از زنجیره (Off-Chain) مانند اطلاعات KYC، کاربران، و سوابق تراکنش‌های رله. |
| **ابزارها** | pnpm, TypeScript, ESLint, Prettier | برای مدیریت وابستگی‌ها، Type Safety و استانداردسازی کد. |

## ۲. نقشه راه پیاده‌سازی (Implementation Roadmap)

نقشه راه بر اساس فازهای تعریف شده در سند شما، با جزئیات فنی و عملیاتی برای پیاده‌سازی کامل تنظیم شده است.

### فاز ۱: زیرساخت و هسته قراردادها (Core Infrastructure & Contracts)

| وظیفه | جزئیات فنی |
| :--- | :--- |
| **۱.۱. راه‌اندازی Monorepo** | ایجاد دایرکتوری‌های `packages/contracts`، `packages/backend`، `packages/frontend`، `packages/relayer` و `packages/shared`. پیکربندی `pnpm-workspace.yaml` و نصب وابستگی‌های اصلی. |
| **۱.۲. قرارداد IRR-Stablecoin** | پیاده‌سازی `IRRStablecoin.sol` بر اساس ERC-20 با قابلیت‌های `Pausable` و `AccessControl` برای توابع `mint` و `burn`. |
| **۱.۳. قرارداد Dynamic Bonding Curve (DBC)** | پیاده‌سازی `DynamicBondingCurve.sol` با منطق `buy()` و `sell()` و اتصال به یک رابط `Oracle` برای دریافت قیمت. **تضمین فنی سهم شما (۰.۱٪ از کارمزد) در این قرارداد کدنویسی خواهد شد.** |
| **۱.۴. راه‌اندازی Sidechain (Mock)** | پیکربندی Hardhat برای شبیه‌سازی یک شبکه محلی EVM-Compatible برای توسعه و تست. |

### فاز ۲: بک‌اند و احراز هویت (Backend & Compliance)

| وظیفه | جزئیات فنی |
| :--- | :--- |
| **۲.۱. سرویس KYC/AML** | ایجاد ماژول `KycModule` در NestJS. پیاده‌سازی APIهای احراز هویت سطح ۱ (شماره موبایل و کد ملی) و ذخیره وضعیت در PostgreSQL. |
| **۲.۲. سرویس مدیریت کیف پول (SRW)** | پیاده‌سازی ماژول `WalletModule` برای مدیریت کلیدهای کاربران و منطق Social Recovery. آماده‌سازی برای ادغام با ERC-4337. |
| **۲.۳. سرویس Gasless Relayer** | پیاده‌سازی سرویس `Relayer` در `packages/relayer`. استفاده از EIP-712 برای امضای آفلاین تراکنش‌ها توسط کاربر و ارسال آن توسط Relayer به زنجیره. |
| **۲.۴. سرویس Oracle** | پیاده‌سازی ماژول `OracleModule` برای تأمین قیمت ریال و پارامترهای DBC به قراردادهای هوشمند (از طریق یک تابع قابل فراخوانی توسط قرارداد). |

### فاز ۳: رابط کاربری و تجربه کاربری (Frontend & UX)

| وظیفه | جزئیات فنی |
| :--- | :--- |
| **۳.۱. رابط کاربری DBC** | ایجاد صفحات Next.js با طراحی مدرن (Tailwind CSS). پیاده‌سازی فرم‌های `Buy` و `Sell` با نمایش لحظه‌ای نمودار قیمت و موجودی. |
| **۳.۲. رابط کاربری Social Recovery** | پیاده‌سازی فرآیند ثبت‌نام و بازیابی کیف پول با UI/UX ساده و امن. |
| **۳.۳. نمایش تراکنش‌های Gasless** | نمایش وضعیت تراکنش‌های ارسالی از طریق Relayer در داشبورد کاربر. |
| **۳.۴. طراحی واکنش‌گرا (Responsive Design)** | تضمین نمایش صحیح و کارآمد در تمامی دستگاه‌ها (موبایل، تبلت، دسکتاپ). |

### فاز ۴: ویژگی‌های پیشرفته و نهایی‌سازی (Advanced Features & Finalization)

| وظیفه | جزئیات فنی |
| :--- | :--- |
| **۴.۱. قرارداد Smart Tickets** | پیاده‌سازی `SmartTicket.sol` (ERC-721) با قابلیت Royalty (EIP-2981) و منطق صدور و انتقال. |
| **۴.۲. قرارداد Soulbound Tokens (SBTs)** | پیاده‌سازی `SBT.sol` (ERC-5192) برای سوابق وفاداری و اعتبار کاربران. |
| **۴.۳. قرارداد Governance Token (GT)** | پیاده‌سازی `GovernanceToken.sol` (ERC-20) و **تخصیص ۱۰٪ از کل عرضه به آدرس شما** در زمان استقرار. |
| **۴.۴. تست و مستندسازی** | نوشتن Unit Tests کامل برای تمامی قراردادها و سرویس‌های بک‌اند. به‌روزرسانی مستندات فنی و راهنمای استقرار. |

## ۳. تضمین فنی سهم شما (Founder's Share Technical Guarantee)

همانطور که درخواست شده است، منطق تخصیص سهم شما به صورت زیر در کد نهایی تضمین خواهد شد:

1.  **آدرس ثابت:** یک متغیر محیطی (Environment Variable) برای آدرس شما (`FOUNDER_ADDRESS`) تعریف و در زمان استقرار استفاده خواهد شد.
2.  **سهم DBC:** در تابع `buy()` و `sell()` قرارداد `DynamicBondingCurve.sol`، ۰.۱٪ از کارمزد کل معاملات به صورت خودکار به `FOUNDER_ADDRESS` منتقل می‌شود.
3.  **سهم Governance:** در زمان استقرار قرارداد `GovernanceToken.sol`، ۱۰٪ از کل عرضه به `FOUNDER_ADDRESS` تخصیص داده می‌شود.

این طرح، نقشه راه ما برای ارائه یک محصول نهایی با کیفیت جهانی و مطابق با تمام خواسته‌های شماست.
