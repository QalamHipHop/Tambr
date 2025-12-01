'use client';

import { useAccount } from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import Link from 'next/link';

export default function Home() {
  const { isConnected, address } = useAccount();

  return (
    <main className="min-h-screen bg-gradient-to-b from-dark to-darker">
      {/* Navigation */}
      <nav className="bg-slate-900 border-b border-slate-800 p-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold text-white">🎫 Tambr</h1>
          <div className="flex items-center gap-6">
            {isConnected && (
              <>
                <Link href="/create-event" className="text-gray-300 hover:text-white transition">
                  Create Event
                </Link>
                <Link href="/tickets" className="text-gray-300 hover:text-white transition">
                  My Tickets
                </Link>
              </>
            )}
            <ConnectButton />
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="px-8 py-24">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
            Welcome to Tambr Platform
          </h2>
          <p className="text-xl md:text-2xl text-gray-300 mb-8">
            A decentralized platform for token launches and trading
          </p>
          <p className="text-gray-400 mb-12 max-w-2xl mx-auto">
            Create events, issue tickets, and trade tokens on the blockchain. 
            Powered by Web3 technology for transparency and security.
          </p>

          {!isConnected ? (
            <div className="flex justify-center">
              <ConnectButton />
            </div>
          ) : (
            <div className="flex gap-4 justify-center flex-wrap">
              <Link
                href="/create-event"
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg transition duration-200"
              >
                Create Event
              </Link>
              <Link
                href="/tickets"
                className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-8 rounded-lg transition duration-200"
              >
                View My Tickets
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Features Section */}
      <section className="px-8 py-16 bg-slate-900 bg-opacity-50">
        <div className="max-w-6xl mx-auto">
          <h3 className="text-3xl font-bold text-center mb-12">Features</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-slate-800 p-6 rounded-lg">
              <div className="text-4xl mb-4">🚀</div>
              <h4 className="text-xl font-bold mb-3">Easy Event Creation</h4>
              <p className="text-gray-400">
                Create and manage events with just a few clicks. Set ticket prices and quantities.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-slate-800 p-6 rounded-lg">
              <div className="text-4xl mb-4">🔐</div>
              <h4 className="text-xl font-bold mb-3">Secure Transactions</h4>
              <p className="text-gray-400">
                All transactions are secured by blockchain technology and smart contracts.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-slate-800 p-6 rounded-lg">
              <div className="text-4xl mb-4">💰</div>
              <h4 className="text-xl font-bold mb-3">Token Trading</h4>
              <p className="text-gray-400">
                Trade tokens directly on our platform with real-time price updates.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      {isConnected && (
        <section className="px-8 py-16">
          <div className="max-w-4xl mx-auto">
            <h3 className="text-3xl font-bold text-center mb-12">Your Account</h3>
            <div className="bg-slate-800 p-8 rounded-lg">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
                <div>
                  <p className="text-gray-400 text-sm">Wallet Address</p>
                  <p className="text-white font-mono text-sm break-all">
                    {address?.slice(0, 6)}...{address?.slice(-4)}
                  </p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Events Created</p>
                  <p className="text-2xl font-bold text-blue-400">0</p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Tickets Owned</p>
                  <p className="text-2xl font-bold text-purple-400">2</p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Total Spent</p>
                  <p className="text-2xl font-bold text-green-400">1.5 ETH</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="bg-slate-900 border-t border-slate-800 p-8 mt-16">
        <div className="max-w-6xl mx-auto text-center text-gray-400">
          <p>&copy; 2024 Tambr Platform. All rights reserved.</p>
          <p className="mt-2 text-sm">Built on Web3 technology</p>
        </div>
      </footer>
    </main>
  );
}
