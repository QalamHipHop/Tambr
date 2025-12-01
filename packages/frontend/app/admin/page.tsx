'use client';

import { useState } from 'react';
import { useAccount } from 'wagmi';

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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-800 mb-8">Admin Dashboard</h1>

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
            Overview
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`px-6 py-2 rounded-lg font-semibold transition ${
              activeTab === 'settings'
                ? 'bg-indigo-600 text-white'
                : 'bg-white text-gray-800 hover:bg-gray-100'
            }`}
          >
            Settings
          </button>
          <button
            onClick={() => setActiveTab('treasury')}
            className={`px-6 py-2 rounded-lg font-semibold transition ${
              activeTab === 'treasury'
                ? 'bg-indigo-600 text-white'
                : 'bg-white text-gray-800 hover:bg-gray-100'
            }`}
          >
            Treasury
          </button>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">System Overview</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-indigo-50 p-6 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Total Supply</h3>
                <p className="text-3xl font-bold text-indigo-600">1,000,000 IRR</p>
              </div>
              
              <div className="bg-green-50 p-6 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Reserve Balance</h3>
                <p className="text-3xl font-bold text-green-600">500,000 IRR</p>
              </div>
              
              <div className="bg-blue-50 p-6 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Founder Fee Rate</h3>
                <p className="text-3xl font-bold text-blue-600">5%</p>
              </div>
              
              <div className="bg-purple-50 p-6 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Active Users</h3>
                <p className="text-3xl font-bold text-purple-600">1,234</p>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Connected Account</h3>
              <p className="text-sm text-gray-600 break-all">{address}</p>
            </div>
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Settings</h2>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Founder Fee Rate (%)
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
                    Update
                  </button>
                </div>
              </div>

              {message && (
                <div className={`p-4 rounded-lg ${message.includes('Error') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                  {message}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Treasury Tab */}
        {activeTab === 'treasury' && (
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Treasury Management</h2>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Treasury Address
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
                    Update
                  </button>
                </div>
              </div>

              <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                <p className="text-sm text-yellow-800">
                  <strong>Note:</strong> Changing the treasury address requires multi-sig approval.
                </p>
              </div>

              {message && (
                <div className={`p-4 rounded-lg ${message.includes('Error') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
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
