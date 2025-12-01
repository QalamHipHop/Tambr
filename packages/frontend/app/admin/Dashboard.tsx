'use client';

import { useAccount, useReadContract } from 'wagmi';
import { dbcAbi, dbcAddress } from '@/packages/shared/constants'; // Assuming constants are defined

export default function AdminDashboard() {
  const { isConnected } = useAccount();

  // Mock: Read DBC reserve balance
  const { data: reserveBalance, isLoading: isLoadingReserve } = useReadContract({
    abi: dbcAbi,
    address: dbcAddress,
    functionName: 'reserveBalance',
  });

  // Mock: Read DBC founder fee rate
  const { data: founderFeeRate, isLoading: isLoadingFee } = useReadContract({
    abi: dbcAbi,
    address: dbcAddress,
    functionName: 'founderFeeRate',
  });

  if (!isConnected) {
    return <div className="text-center p-8">لطفاً کیف پول خود را متصل کنید.</div>;
  }

  if (isLoadingReserve || isLoadingFee) {
    return <div className="text-center p-8">در حال بارگذاری اطلاعات...</div>;
  }

  // NOTE: This is a placeholder. Real admin dashboard would require authentication/authorization.
  return (
    <div className="p-8 max-w-4xl mx-auto" dir="rtl">
      <h1 className="text-3xl font-bold mb-6 text-right">داشبورد مدیریت (Admin Dashboard)</h1>
      <p className="text-right mb-8 text-gray-400">
        این یک نمای کلی از وضعیت قراردادهای هوشمند است. دسترسی کامل نیاز به احراز هویت دارد.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Card 1: Reserve Balance */}
        <div className="bg-gray-800 p-6 rounded-lg shadow-xl">
          <h2 className="text-xl font-semibold mb-2 text-right">ذخایر DBC</h2>
          <p className="text-4xl font-extrabold text-green-400 text-right">
            {reserveBalance ? (reserveBalance.toString() / 1e18).toLocaleString('fa-IR') : 'N/A'} IRR
          </p>
          <p className="text-sm text-gray-400 text-right mt-2">
            موجودی توکن IRR در قرارداد Dynamic Bonding Curve.
          </p>
        </div>

        {/* Card 2: Founder Fee Rate */}
        <div className="bg-gray-800 p-6 rounded-lg shadow-xl">
          <h2 className="text-xl font-semibold mb-2 text-right">نرخ کارمزد بنیان‌گذار</h2>
          <p className="text-4xl font-extrabold text-yellow-400 text-right">
            {founderFeeRate ? (founderFeeRate.toString() / 100).toLocaleString('fa-IR') : 'N/A'}%
          </p>
          <p className="text-sm text-gray-400 text-right mt-2">
            درصد کارمزد کسر شده از تراکنش‌های خرید/فروش.
          </p>
        </div>

        {/* Card 3: Total Supply (Placeholder) */}
        <div className="bg-gray-800 p-6 rounded-lg shadow-xl">
          <h2 className="text-xl font-semibold mb-2 text-right">کل عرضه IRR</h2>
          <p className="text-4xl font-extrabold text-blue-400 text-right">
            {/* Replace with actual total supply read */}
            N/A IRR
          </p>
          <p className="text-sm text-gray-400 text-right mt-2">
            تعداد کل توکن‌های IRR در گردش.
          </p>
        </div>

        {/* Card 4: Collateralization Ratio (Placeholder) */}
        <div className="bg-gray-800 p-6 rounded-lg shadow-xl">
          <h2 className="text-xl font-semibold mb-2 text-right">نسبت وثیقه‌گذاری</h2>
          <p className="text-4xl font-extrabold text-red-400 text-right">
            {/* Replace with actual ratio read */}
            N/A%
          </p>
          <p className="text-sm text-gray-400 text-right mt-2">
            نسبت ذخایر فیات به کل عرضه توکن.
          </p>
        </div>
      </div>

      <h2 className="text-2xl font-bold mt-10 mb-4 text-right">تراکنش‌های اخیر (Mock)</h2>
      <div className="bg-gray-800 p-4 rounded-lg">
        <ul className="space-y-2 text-right">
          <li className="border-b border-gray-700 pb-2">
            <span className="font-mono text-sm text-yellow-300">0x123...abc</span>: خرید ۱۰۰,۰۰۰ IRR
          </li>
          <li className="border-b border-gray-700 pb-2">
            <span className="font-mono text-sm text-yellow-300">0x456...def</span>: فروش ۵۰,۰۰۰ IRR
          </li>
          <li>
            <span className="font-mono text-sm text-yellow-300">0x789...ghi</span>: به‌روزرسانی ذخایر فیات
          </li>
        </ul>
      </div>
    </div>
  );
}
