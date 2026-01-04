'use client';

import { useState, useRef, useEffect } from 'react';
import { ChevronDown, User, AlertCircle, Check, Loader2 } from 'lucide-react';

interface Client {
  id: string;
  coachClientId: string;
  name: string;
  activeProgram: string | null;
  activeProgramId: string | null;
}

interface AssignDropdownProps {
  programId: string;
  programName: string;
  onAssigned?: () => void;
}

export function AssignDropdown({ programId, programName, onAssigned }: AssignDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [clients, setClients] = useState<Client[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [assigningTo, setAssigningTo] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch clients when dropdown opens
  useEffect(() => {
    if (isOpen && clients.length === 0) {
      fetchClients();
    }
  }, [isOpen]);

  const fetchClients = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/coach/clients/list');
      if (!response.ok) {
        throw new Error('Failed to fetch clients');
      }
      const data = await response.json();
      setClients(data.clients || []);
    } catch (err) {
      setError('Failed to load clients');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAssign = async (client: Client) => {
    // Confirm if client has active program
    if (client.activeProgram) {
      const confirmed = window.confirm(
        `${client.name} already has "${client.activeProgram}" active. Replace with "${programName}"?`
      );
      if (!confirmed) return;
    }

    setAssigningTo(client.id);
    setError(null);

    try {
      const response = await fetch('/api/programs/assign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          programId,
          clientId: client.id,
          setAsActive: true
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to assign program');
      }

      setSuccess(`Assigned to ${client.name}`);
      setTimeout(() => {
        setSuccess(null);
        setIsOpen(false);
        onAssigned?.();
      }, 1500);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to assign');
    } finally {
      setAssigningTo(null);
    }
  };

  return (
    <div ref={dropdownRef} className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-[#475569] hover:text-[#0F172A] hover:bg-[#F1F5F9] rounded-lg transition-colors"
      >
        Assign
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-1 w-64 bg-white rounded-xl border border-[#E2E8F0] shadow-lg z-50 overflow-hidden">
          <div className="px-3 py-2 border-b border-[#F1F5F9] bg-[#F8FAFC]">
            <p className="text-xs font-medium text-[#64748B]">Assign to client</p>
          </div>

          {isLoading && (
            <div className="px-4 py-6 text-center">
              <Loader2 className="w-5 h-5 animate-spin text-[#64748B] mx-auto" />
            </div>
          )}

          {error && (
            <div className="px-3 py-2 text-sm text-red-600 bg-red-50 flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              {error}
            </div>
          )}

          {success && (
            <div className="px-3 py-2 text-sm text-green-600 bg-green-50 flex items-center gap-2">
              <Check className="w-4 h-4" />
              {success}
            </div>
          )}

          {!isLoading && !error && !success && clients.length === 0 && (
            <div className="px-4 py-6 text-center text-sm text-[#64748B]">
              No clients yet
            </div>
          )}

          {!isLoading && !success && clients.length > 0 && (
            <div className="max-h-64 overflow-y-auto">
              {clients.map((client) => (
                <button
                  key={client.id}
                  onClick={() => handleAssign(client)}
                  disabled={assigningTo !== null}
                  className="w-full px-3 py-2.5 text-left hover:bg-[#F8FAFC] flex items-center gap-3 transition-colors disabled:opacity-50"
                >
                  <div className="w-8 h-8 rounded-full bg-[#F1F5F9] flex items-center justify-center flex-shrink-0">
                    {assigningTo === client.id ? (
                      <Loader2 className="w-4 h-4 animate-spin text-[#64748B]" />
                    ) : (
                      <User className="w-4 h-4 text-[#64748B]" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[#0F172A] truncate">
                      {client.name}
                    </p>
                    {client.activeProgram ? (
                      <p className="text-xs text-[#94A3B8] truncate flex items-center gap-1">
                        <AlertCircle className="w-3 h-3 text-amber-500" />
                        has: {client.activeProgram}
                      </p>
                    ) : (
                      <p className="text-xs text-[#94A3B8]">No program</p>
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
