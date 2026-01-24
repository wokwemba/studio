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

export async function GET(request: NextRequest) {
  try {
    const { firestore } = initializeFirebase();
    if (!firestore) {
      throw new Error("Firestore is not initialized.");
    }
    
    const { searchParams } = new URL(request.url);
    const region = searchParams.get('region') || 'global';

    const cacheDocRef = doc(firestore, "ai_cache", `cyber_news_${region}`);
    const cacheSnap = await getDoc(cacheDocRef);

    if (cacheSnap.exists()) {
      const cacheData = cacheSnap.data() as AICache;
      const lastUpdated = cacheData.lastUpdated.toDate();
      const now = new Date();
      const hoursDiff = (now.getTime() - lastUpdated.getTime()) / (1000 * 60 * 60);

      if (hoursDiff < CACHE_TTL_HOURS) {
        return NextResponse.json({ items: cacheData.items, source: 'cache' });
      }
    }

    const result = await generateCyberNews({ region: region.toUpperCase() });
    
    const newCacheData = {
      items: result.items,
      source: "gemini",
      lastUpdated: Timestamp.now(),
    };
    await setDoc(cacheDocRef, newCacheData as any);

    return NextResponse.json({ items: result.items, source: 'gemini' });

  } catch (error: any) {
    console.error(`API route '/api/cyber-news' failed: ${error.message}`);
    return new Response(
      JSON.stringify({ message: "Failed to fetch news data.", error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

    