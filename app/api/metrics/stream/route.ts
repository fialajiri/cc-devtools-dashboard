import { getMetricSnapshot } from '@/lib/metrics';

export async function GET() {
  let intervalId: ReturnType<typeof setInterval>;

  const stream = new ReadableStream({
    start(controller) {
      intervalId = setInterval(async () => {
        try {
          const snapshot = await getMetricSnapshot();
          const data = `event: metric\ndata: ${JSON.stringify(snapshot)}\n\n`;
          controller.enqueue(new TextEncoder().encode(data));
        } catch {
          // skip this tick, keep stream open
        }
      }, 1000);
    },
    cancel() {
      clearInterval(intervalId);
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}
