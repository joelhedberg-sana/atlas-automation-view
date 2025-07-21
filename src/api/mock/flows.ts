// Mock API endpoint for flows
import { mockFlows } from "@/lib/mock-data";

export async function GET() {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  return new Response(JSON.stringify(mockFlows), {
    headers: {
      'Content-Type': 'application/json',
    },
  });
}