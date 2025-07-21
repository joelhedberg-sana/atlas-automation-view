// Mock API endpoint for connectors
import { mockConnectors } from "@/lib/mock-data";

export async function GET() {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  return new Response(JSON.stringify(mockConnectors), {
    headers: {
      'Content-Type': 'application/json',
    },
  });
}