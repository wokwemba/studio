import { NextResponse, type NextRequest } from "next/server";
import { generateCyberNews } from "@/ai/flows/generate-cyber-news-flow";

// This tells Next.js to cache the response for 15 minutes (900 seconds).
// Subsequent requests within this window will receive the cached version.
export const revalidate = 900; 

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const region = searchParams.get('region') || 'en'; // Default to 'en' if not provided

    const result = await generateCyberNews({ region: region.toUpperCase() });
    return NextResponse.json(result);
  } catch (error) {
    console.error("[CYBER_NEWS_API] Error:", error);
    // The flow itself has a fallback, so this catch is for catastrophic errors.
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
