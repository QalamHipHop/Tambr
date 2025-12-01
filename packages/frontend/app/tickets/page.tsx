'use client';

import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import Link from 'next/link';

interface Ticket {
  id: string;
  eventName: string;
  eventDate: string;
  location: string;
  ticketNumber: string;
  price: string;
  status: 'active' | 'used' | 'expired';
}

export default function TicketsPage() {
  const { address, isConnected } = useAccount();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isConnected && address) {
      // TODO: Fetch tickets from smart contract or backend
      const mockTickets: Ticket[] = [
        {
          id: '1',
          eventName: 'Web3 Conference 2024',
          eventDate: '2024-03-15',
          location: 'San Francisco, CA',
          ticketNumber: '#001',
          price: '0.5 ETH',
          status: 'active',
        },
        {
          id: '2',
          eventName: 'Crypto Summit',
          eventDate: '2024-04-20',
          location: 'New York, NY',
          ticketNumber: '#042',
          price: '1.0 ETH',
          status: 'active',
        },
      ];
      setTickets(mockTickets);
      setIsLoading(false);
    }
  }, [isConnected, address]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-900 text-green-100';
      case 'used':
        return 'bg-gray-700 text-gray-200';
      case 'expired':
        return 'bg-red-900 text-red-100';
      default:
        return 'bg-slate-700 text-slate-200';
    }
  };

  if (!isConnected) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-dark to-darker p-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold mb-8">My Tickets</h1>
          <div className="bg-slate-800 p-8 rounded-lg text-center">
            <p className="text-xl mb-4">Please connect your wallet to view your tickets</p>
            <Link href="/" className="text-blue-400 hover:text-blue-300">
              Go back to home
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-dark to-darker p-8">
      <div className="max-w-4xl mx-auto">
        <Link href="/" className="text-blue-400 hover:text-blue-300 mb-8 inline-block">
          ← Back to Home
        </Link>

        <h1 className="text-4xl font-bold mb-8">My Tickets</h1>

        {isLoading ? (
          <div className="text-center py-12">
            <p className="text-gray-400">Loading tickets...</p>
          </div>
        ) : tickets.length === 0 ? (
          <div className="bg-slate-800 p-8 rounded-lg text-center">
            <p className="text-xl text-gray-400 mb-4">You don't have any tickets yet</p>
            <Link href="/create-event" className="text-blue-400 hover:text-blue-300">
              Create an event or browse available events
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {tickets.map(ticket => (
              <div key={ticket.id} className="bg-slate-800 rounded-lg overflow-hidden hover:shadow-lg transition duration-200">
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <h2 className="text-2xl font-bold">{ticket.eventName}</h2>
                    <span className={`px-3 py-1 rounded text-sm font-semibold ${getStatusColor(ticket.status)}`}>
                      {ticket.status.charAt(0).toUpperCase() + ticket.status.slice(1)}
                    </span>
                  </div>

                  <div className="space-y-3 text-gray-300">
                    <div>
                      <p className="text-sm text-gray-400">Date</p>
                      <p className="font-semibold">{ticket.eventDate}</p>
                    </div>

                    <div>
                      <p className="text-sm text-gray-400">Location</p>
                      <p className="font-semibold">{ticket.location}</p>
                    </div>

                    <div className="flex justify-between pt-4 border-t border-slate-700">
                      <div>
                        <p className="text-sm text-gray-400">Ticket Number</p>
                        <p className="font-semibold">{ticket.ticketNumber}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-400">Price</p>
                        <p className="font-semibold">{ticket.price}</p>
                      </div>
                    </div>
                  </div>

                  <button className="w-full mt-6 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition duration-200">
                    View Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
