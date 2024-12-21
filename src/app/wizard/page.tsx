"use client";

import { useState, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
import { useRouter, useSearchParams } from "next/navigation";
import { createAnonUser, getUser } from "../start/actions";
import { User } from "@prisma/client";
// import { WizardInterface } from "./components/WizardInterface";

export default function WizardIntakePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [userId, setUserId] = useState<string>("");
  const [user, setUser] = useState<User | null>(null);

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
        // Create new anonymous user
        const newUserId = uuidv4();
        const result = await createAnonUser(newUserId);
        if (result.success && result.user) {
          setUserId(result.user.id);
          setUser(result.user);
          router.push(`/wizard?userId=${result.user.id}`);
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
    <div className="container mx-auto max-w-3xl px-4 py-8">
      {/* <WizardInterface userId={userId} /> */}
    </div>
  );
} 