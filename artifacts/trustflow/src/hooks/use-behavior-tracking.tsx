import { useEffect, useRef, useCallback } from "react";
import { useRecordBehaviorEvent } from "@workspace/api-client-react";
import { useAuth } from "./use-auth";

export function useBehaviorTracking() {
  const { session } = useAuth();
  const sessionToken = session?.sessionToken || localStorage.getItem("trustflow_session");
  const recordMutation = useRecordBehaviorEvent();
  const mutationRef = useRef(recordMutation.mutate);
  mutationRef.current = recordMutation.mutate;

  const eventQueue = useRef<{
    keystrokes: number;
    mouseMoves: number;
    clicks: number;
    scrolls: number;
    lastKeystrokeTime: number | null;
    keystrokeIntervals: number[];
    lastMouseX: number | null;
    lastMouseY: number | null;
    lastMouseMoveTime: number | null;
    mouseVelocities: number[];
    startTime: number;
  }>({
    keystrokes: 0,
    mouseMoves: 0,
    clicks: 0,
    scrolls: 0,
    lastKeystrokeTime: null,
    keystrokeIntervals: [],
    lastMouseX: null,
    lastMouseY: null,
    lastMouseMoveTime: null,
    mouseVelocities: [],
    startTime: Date.now(),
  });

  const sendBatch = useCallback(() => {
    if (!sessionToken) return;

    const q = eventQueue.current;
    if (q.keystrokes === 0 && q.mouseMoves === 0 && q.clicks === 0 && q.scrolls === 0) {
      return; // Nothing to send
    }

    const now = Date.now();
    const duration = (now - q.startTime) / 1000;
    
    let avgKeystrokeInterval = 0;
    if (q.keystrokeIntervals.length > 0) {
      avgKeystrokeInterval = q.keystrokeIntervals.reduce((a, b) => a + b, 0) / q.keystrokeIntervals.length;
    }

    let avgMouseVelocity = 0;
    if (q.mouseVelocities.length > 0) {
      avgMouseVelocity = q.mouseVelocities.reduce((a, b) => a + b, 0) / q.mouseVelocities.length;
    }

    // Determine primary event type for this batch based on highest activity or default to a generic one
    // For simplicity, we just send a generic 'idle' if nothing dominant, or whatever was most frequent
    // Alternatively we can just send multiple events. We'll send one aggregate event.

    let eventType: 'keystroke' | 'mouse_move' | 'click' | 'scroll' = 'mouse_move';
    if (q.keystrokes > q.mouseMoves && q.keystrokes > q.clicks) eventType = 'keystroke';
    else if (q.clicks > q.mouseMoves && q.clicks > q.keystrokes) eventType = 'click';
    else if (q.scrolls > q.mouseMoves) eventType = 'scroll';

    mutationRef.current({
      data: {
        sessionToken,
        eventType,
        typingSpeed: q.keystrokes / duration,
        keystrokeInterval: avgKeystrokeInterval,
        mouseVelocity: avgMouseVelocity,
        clickCount: q.clicks,
        scrollSpeed: q.scrolls / duration,
      }
    });

    // Reset queue
    eventQueue.current = {
      keystrokes: 0,
      mouseMoves: 0,
      clicks: 0,
      scrolls: 0,
      lastKeystrokeTime: null,
      keystrokeIntervals: [],
      lastMouseX: null,
      lastMouseY: null,
      lastMouseMoveTime: null,
      mouseVelocities: [],
      startTime: Date.now(),
    };
  }, [sessionToken]);

  useEffect(() => {
    const handleKeyDown = () => {
      const now = Date.now();
      const q = eventQueue.current;
      q.keystrokes++;
      if (q.lastKeystrokeTime) {
        q.keystrokeIntervals.push(now - q.lastKeystrokeTime);
      }
      q.lastKeystrokeTime = now;
    };

    const handleMouseMove = (e: MouseEvent) => {
      const now = Date.now();
      const q = eventQueue.current;
      q.mouseMoves++;
      
      if (q.lastMouseX !== null && q.lastMouseY !== null && q.lastMouseMoveTime !== null) {
        const dx = e.clientX - q.lastMouseX;
        const dy = e.clientY - q.lastMouseY;
        const dt = now - q.lastMouseMoveTime;
        if (dt > 0) {
          const velocity = Math.sqrt(dx * dx + dy * dy) / (dt / 1000);
          q.mouseVelocities.push(velocity);
        }
      }
      
      q.lastMouseX = e.clientX;
      q.lastMouseY = e.clientY;
      q.lastMouseMoveTime = now;
    };

    const handleClick = () => {
      eventQueue.current.clicks++;
    };

    const handleScroll = () => {
      eventQueue.current.scrolls++;
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("click", handleClick);
    window.addEventListener("scroll", handleScroll);

    const interval = setInterval(sendBatch, 3000);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("click", handleClick);
      window.removeEventListener("scroll", handleScroll);
      clearInterval(interval);
    };
  }, [sendBatch]);
}