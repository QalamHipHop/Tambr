'use client';

import { useState } from 'react';
import { useAccount } from 'wagmi';
import { parseEther } from 'ethers';

export default function SellTokensPage() {
  const { address, isConnected } = useAccount();
  const [tokensToSell, setTokensToSell] = useState('');
  const [minAmount, setMinAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleSellTokens = async () => {
    if (!tokensToSell || !minAmount) {
      setMessage('Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      // TODO: Implement actual contract interaction
      // This is a placeholder for the actual implementation
      const tokensInWei = parseEther(tokensToSell);
      const minAmountInWei = parseEther(minAmount);

      setMessage(`Attempting to sell ${tokensToSell} tokens with minimum ${minAmount} ETH output...`);
      
      // Simulate transaction
      setTimeout(() => {
        setMessage('Transaction completed successfully!');
        setTokensToSell('');
        setMinAmount('');
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
          <h1 className="text-3xl font-bold text-gray-800 mb-4">Sell Tokens</h1>
          <p className="text-gray-600 mb-6">Please connect your wallet to sell tokens.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Sell Tokens</h1>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tokens to Sell
            </label>
            <input
              type="number"
              value={tokensToSell}
              onChange={(e) => setTokensToSell(e.target.value)}
              placeholder="100"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Minimum Amount (ETH)
            </label>
            <input
              type="number"
              value={minAmount}
              onChange={(e) => setMinAmount(e.target.value)}
              placeholder="0.05"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              disabled={loading}
            />
          </div>

          <button
            onClick={handleSellTokens}
            disabled={loading || !tokensToSell || !minAmount}
            className="w-full bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white font-bold py-2 px-4 rounded-lg transition duration-200"
          >
            {loading ? 'Processing...' : 'Sell Tokens'}
          </button>

          {message && (
            <div className={`p-4 rounded-lg ${message.includes('Error') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
              {message}
            </div>
          )}
        </div>

        <div className="mt-6 pt-6 border-t border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800 mb-2">Connected Account</h2>
          <p className="text-sm text-gray-600 break-all">{address}</p>
        </div>
      </div>
    </div>
  );
}
