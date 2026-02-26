import { getMetricSnapshot, type PrevNet } from '@/lib/metrics';

export const dynamic = 'force-dynamic';

const encoder = new TextEncoder();

export async function GET() {
  let intervalId: ReturnType<typeof setInterval>;
  let aborted = false;

  const stream = new ReadableStream({
    start(controller) {
      let prevNet: PrevNet = null;

      intervalId = setInterval(async () => {
        if (aborted) return;
        try {
          const result = await getMetricSnapshot(prevNet);
          prevNet = result.prevNet;
          if (aborted) return;
          const data = `event: metric\ndata: ${JSON.stringify(result.snapshot)}\n\n`;
          controller.enqueue(encoder.encode(data));
        } catch (err) {
          console.error(err);
          // skip this tick, keep stream open
        }
      }, 1000);
    },
    cancel() {
      aborted = true;
      clearInterval(intervalId);
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  });
}
