"use client";

import { useState, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
import { useRouter, useSearchParams } from "next/navigation";
import { createAnonUser, getUser } from "../../start/actions";
import { User } from "@prisma/client";
import { ConversationalInterface } from "./ConversationalInterface";
import Link from "next/link";

export function ConversationalIntakeContainer() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [userId, setUserId] = useState<string>("");
  const [user, setUser] = useState<User | null>(null);
  const [hasProgram, setHasProgram] = useState(false);

  useEffect(() => {
    const initializeUser = async () => {
      const urlUserId = searchParams.get("userId");
      if (urlUserId) {
        setUserId(urlUserId);
        const result = await getUser(urlUserId);
        if (result.success && result.user) {
          setUser(result.user);
        }
      } else {
        const newUserId = uuidv4();
        const result = await createAnonUser(newUserId);
        if (result.success && result.user) {
          setUserId(result.user.id);
          setUser(result.user);
          router.push(`/hi?userId=${result.user.id}`);
        }
      }
    };

    initializeUser();
  }, []);

  if (!userId) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-6 h-6 border-t-2 border-blue-500 border-solid rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-7xl px-4 py-8 relative">
      <ConversationalInterface 
        userId={userId} 
        user={user}
      />
      
      {/* Admin Testing Corner */}
      <div className="fixed bottom-4 right-4 opacity-50 hover:opacity-100 transition-opacity">
        <Link
          href="/hi"
          onClick={() => window.location.href = '/hi'}
          className="px-3 py-1 text-xs bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors"
        >
          New Session
        </Link>
      </div>
    </div>
  );
} 