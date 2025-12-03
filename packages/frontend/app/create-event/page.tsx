'use client';

import { useState } from 'react';
import { useAccount } from 'wagmi';
import Link from 'next/link';

export default function CreateEventPage() {
  const { address, isConnected } = useAccount();
  const [formData, setFormData] = useState({
    eventName: '',
    description: '',
    eventDate: '',
    location: '',
    ticketPrice: '',
    totalTickets: '',
    ticketType: 'General', // New field for ticket type
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!isConnected || !address) {
      alert('Please connect your wallet first');
      return;
    }

    setIsSubmitting(true);
    try {
      // For a real application, you would get a unique eventId from a backend service.
      // For now, we'll use a placeholder eventId.
      const PLACEHOLDER_EVENT_ID = Math.floor(Math.random() * 1000000);

      const mintData = {
        to: address, // Mint to the connected user's address
        quantity: parseInt(formData.totalTickets),
        eventId: PLACEHOLDER_EVENT_ID,
        ticketType: formData.ticketType,
      };

      // We need to proxy this request through our Next.js API route
      const response = await fetch('/api/mint', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(mintData),
      });

      const result = await response.json();

      if (result.success) {
        console.log('Minting successful:', result.txHash);
        setSuccessMessage(`Event created and ${formData.totalTickets} tickets minted! Tx: ${result.txHash}`);
        setFormData({
          eventName: '',
          description: '',
          eventDate: '',
          location: '',
          ticketPrice: '',
          totalTickets: '',
          ticketType: 'General',
        });
      } else {
        throw new Error(result.error || 'Unknown error from relayer');
      }

      setTimeout(() => setSuccessMessage(''), 5000);
    } catch (error) {
      console.error('Error creating event/minting tickets:', error);
      alert(`Failed to create event/mint tickets: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isConnected) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-dark to-darker p-8">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-4xl font-bold mb-8">Create Event</h1>
          <div className="bg-slate-800 p-8 rounded-lg text-center">
            <p className="text-xl mb-4">Please connect your wallet to create an event</p>
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
      <div className="max-w-2xl mx-auto">
        <Link href="/" className="text-blue-400 hover:text-blue-300 mb-8 inline-block">
          ← Back to Home
        </Link>
        
        <h1 className="text-4xl font-bold mb-8">Create New Event</h1>
        
        {successMessage && (
          <div className="bg-green-900 border border-green-700 text-green-100 px-4 py-3 rounded mb-6">
            {successMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-slate-800 p-8 rounded-lg space-y-6">
          <div>
            <label htmlFor="eventName" className="block text-sm font-medium mb-2">
              Event Name
            </label>
            <input
              type="text"
              id="eventName"
              name="eventName"
              value={formData.eventName}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded text-white focus:outline-none focus:border-blue-500"
              placeholder="Enter event name"
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium mb-2">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
              rows={4}
              className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded text-white focus:outline-none focus:border-blue-500"
              placeholder="Enter event description"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="eventDate" className="block text-sm font-medium mb-2">
                Event Date
              </label>
              <input
                type="datetime-local"
                id="eventDate"
                name="eventDate"
                value={formData.eventDate}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label htmlFor="location" className="block text-sm font-medium mb-2">
                Location
              </label>
              <input
                type="text"
                id="location"
                name="location"
                value={formData.location}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded text-white focus:outline-none focus:border-blue-500"
                placeholder="Event location"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="ticketPrice" className="block text-sm font-medium mb-2">
                Ticket Price (ETH)
              </label>
              <input
                type="number"
                id="ticketPrice"
                name="ticketPrice"
                value={formData.ticketPrice}
                onChange={handleChange}
                required
                step="0.001"
                min="0"
                className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded text-white focus:outline-none focus:border-blue-500"
                placeholder="0.1"
              />
            </div>

            <div>
              <label htmlFor="totalTickets" className="block text-sm font-medium mb-2">
                Total Tickets
              </label>
              <input
                type="number"
                id="totalTickets"
                name="totalTickets"
                value={formData.totalTickets}
                onChange={handleChange}
                required
                min="1"
                className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded text-white focus:outline-none focus:border-blue-500"
                placeholder="100"
              />
            </div>
          </div>

          <div>
            <label htmlFor="ticketType" className="block text-sm font-medium mb-2">
              Ticket Type
            </label>
            <input
              type="text"
              id="ticketType"
              name="ticketType"
              value={formData.ticketType}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded text-white focus:outline-none focus:border-blue-500"
              placeholder="e.g., General, VIP, Backstage"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white font-bold py-3 px-4 rounded transition duration-200"
          >
            {isSubmitting ? 'Creating Event...' : 'Create Event'}
          </button>
        </form>
      </div>
    </main>
  );
}
