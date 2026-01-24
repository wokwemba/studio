import { NextResponse, type NextRequest } from "next/server";
import { generateCyberNews } from "@/ai/flows/generate-cyber-news-flow";
import { initializeFirebase } from "@/firebase";
import { doc, getDoc, setDoc, Timestamp } from "firebase/firestore";

type AICache = {
  items: string[];
  source: string;
  lastUpdated: Timestamp;
};

const CACHE_TTL_HOURS = 24;

// This function now uses Firestore as a cache instead of ISR's file-based cache.
export async function GET(request: NextRequest) {
  try {
    // Initialize Firebase services
    const { firestore } = initializeFirebase();
    if (!firestore) {
      // This should not happen if Firebase is configured correctly
      throw new Error("Firestore is not initialized.");
    }
    
    const { searchParams } = new URL(request.url);
    const region = searchParams.get('region') || 'en';

    const cacheDocRef = doc(firestore, "ai_cache", "cyber_news");
    const cacheSnap = await getDoc(cacheDocRef);

    if (cacheSnap.exists()) {
      const cacheData = cacheSnap.data() as AICache;
      // Firestore Timestamps need to be converted to JS Dates to work with them
      const lastUpdated = (cacheData.lastUpdated as Timestamp).toDate();
      const now = new Date();
      const hoursDiff = (now.getTime() - lastUpdated.getTime()) / (1000 * 60 * 60);

      if (hoursDiff < CACHE_TTL_HOURS) {
        // Return fresh data from cache
        return NextResponse.json({ headlines: cacheData.items });
      }
    }

    // Data is stale or doesn't exist, generate fresh data
    const result = await generateCyberNews({ region: region.toUpperCase() });
    
    const newCacheData = {
      items: result.headlines,
      source: "gemini",
      lastUpdated: Timestamp.now(),
    };
    await setDoc(cacheDocRef, newCacheData as any);

    return NextResponse.json(result);

  } catch (error: any) {
    console.error(`API route '/api/cyber-news' failed: ${error.message}`);
    return new Response(
      JSON.stringify({ message: "Failed to fetch news data.", error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
