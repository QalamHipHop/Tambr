'use client';

import { useState } from 'react';
import { useAccount } from 'wagmi';
import AdminDashboard from './Dashboard';

export default function AdminPage() {
  const { address, isConnected } = useAccount();
  const [activeTab, setActiveTab] = useState('overview');
  const [treasuryAddress, setTreasuryAddress] = useState('');
  const [founderFeeRate, setFounderFeeRate] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleUpdateTreasury = async () => {
    if (!treasuryAddress) {
      setMessage('Please enter a treasury address');
      return;
    }

    setLoading(true);
    try {
      // TODO: Implement actual contract interaction
      setMessage(`Updating treasury to ${treasuryAddress}...`);
      
      // Simulate transaction
      setTimeout(() => {
        setMessage('Treasury updated successfully!');
        setTreasuryAddress('');
        setLoading(false);
      }, 2000);
    } catch (error) {
      setMessage(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setLoading(false);
    }
  };

  const handleUpdateFeeRate = async () => {
    if (!founderFeeRate) {
      setMessage('Please enter a fee rate');
      return;
    }

    setLoading(true);
    try {
      // TODO: Implement actual contract interaction
      setMessage(`Updating founder fee rate to ${founderFeeRate}%...`);
      
      // Simulate transaction
      setTimeout(() => {
        setMessage('Fee rate updated successfully!');
        setFounderFeeRate('');
        setLoading(false);
      }, 2000);
    } catch (error) {
      setMessage(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setLoading(false);
    }
  };

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
          <h1 className="text-3xl font-bold text-gray-800 mb-4">Admin Dashboard</h1>
          <p className="text-gray-600 mb-6">Please connect your wallet to access the admin dashboard.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white py-12 px-4" dir="rtl">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-white mb-8 text-right">داشبورد مدیریت</h1>

        {/* Tabs */}
        <div className="flex gap-4 mb-8">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-6 py-2 rounded-lg font-semibold transition ${
              activeTab === 'overview'
                ? 'bg-indigo-600 text-white'
                : 'bg-white text-gray-800 hover:bg-gray-100'
            }`}
          >
            نمای کلی
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`px-6 py-2 rounded-lg font-semibold transition ${
              activeTab === 'settings'
                ? 'bg-indigo-600 text-white'
                : 'bg-white text-gray-800 hover:bg-gray-100'
            }`}
          >
            تنظیمات
          </button>
          <button
            onClick={() => setActiveTab('treasury')}
            className={`px-6 py-2 rounded-lg font-semibold transition ${
              activeTab === 'treasury'
                ? 'bg-indigo-600 text-white'
                : 'bg-white text-gray-800 hover:bg-gray-100'
            }`}
          >
            خزانه‌داری
          </button>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && <AdminDashboard />}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-bold text-white mb-6 text-right">تنظیمات</h2>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2 text-right">
                  نرخ کارمزد بنیان‌گذار (٪)
                </label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={founderFeeRate}
                    onChange={(e) => setFounderFeeRate(e.target.value)}
                    placeholder="5"
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    disabled={loading}
                  />
                  <button
                    onClick={handleUpdateFeeRate}
                    disabled={loading || !founderFeeRate}
                    className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 text-white font-bold rounded-lg transition"
                  >
                    به‌روزرسانی
                  </button>
                </div>
              </div>

              {message && (
                <div className={`p-4 rounded-lg text-right ${message.includes('Error') ? 'bg-red-900 text-red-300' : 'bg-green-900 text-green-300'}`}>
                  {message}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Treasury Tab */}
        {activeTab === 'treasury' && (
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-bold text-white mb-6 text-right">مدیریت خزانه‌داری</h2>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2 text-right">
                  آدرس خزانه‌داری (Multi-sig)
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={treasuryAddress}
                    onChange={(e) => setTreasuryAddress(e.target.value)}
                    placeholder="0x..."
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    disabled={loading}
                  />
                  <button
                    onClick={handleUpdateTreasury}
                    disabled={loading || !treasuryAddress}
                    className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 text-white font-bold rounded-lg transition"
                  >
                    به‌روزرسانی
                  </button>
                </div>
              </div>

              <div className="bg-yellow-900 p-4 rounded-lg border border-yellow-700 text-right">
                <p className="text-sm text-yellow-300">
                  <strong>توجه:</strong> تغییر آدرس خزانه‌داری نیاز به تأیید چند امضایی (Multi-sig) دارد.
                </p>
              </div>

              {message && (
                <div className={`p-4 rounded-lg text-right ${message.includes('Error') ? 'bg-red-900 text-red-300' : 'bg-green-900 text-green-300'}`}>
                  {message}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
