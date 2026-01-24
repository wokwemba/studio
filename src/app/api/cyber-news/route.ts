
import { NextResponse, type NextRequest } from "next/server";
import { generateCyberNews } from "@/ai/flows/generate-cyber-news-flow";

// This will cache the response for 15 minutes (900 seconds).
// This drastically reduces API calls and prevents hitting rate limits.
export const revalidate = 900; 

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const region = searchParams.get('region') || 'global';

    // The generateCyberNews flow is now resilient and has a fallback,
    // so it will not throw an error on AI failure.
    const result = await generateCyberNews({ region: region.toUpperCase() });
    
    // The result from the flow will have an `items` property.
    // We pass this along in the API response.
    return NextResponse.json({ items: result.items });

  } catch (error: any) {
    // This catch block is for unexpected server errors within the API route itself.
    console.error(`API route '/api/cyber-news' failed unexpectedly: ${error.message}`);
    
    return NextResponse.json(
        { message: "Failed to process news request.", error: error.message },
        { status: 500 }
    );
  }
}
