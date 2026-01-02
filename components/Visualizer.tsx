import React, { useEffect, useRef } from 'react';

interface VisualizerProps {
  isActive: boolean;
  audioContext: AudioContext | null;
  sourceNode: MediaStreamAudioSourceNode | null;
}

const Visualizer: React.FC<VisualizerProps> = ({ isActive, audioContext, sourceNode }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const requestRef = useRef<number>();
  const analyserRef = useRef<AnalyserNode | null>(null);
  const dataArrayRef = useRef<Uint8Array | null>(null);
  const currentHeightsRef = useRef<Float32Array | null>(null);

  useEffect(() => {
    if (!isActive || !audioContext || !sourceNode || !canvasRef.current) return;

    const analyser = audioContext.createAnalyser();
    // FFT Size 64 gives 32 frequency bins, creating nice chunky bars
    analyser.fftSize = 64; 
    // Native smoothing (we'll also do custom interpolation for better control)
    analyser.smoothingTimeConstant = 0.3;
    
    sourceNode.connect(analyser);
    analyserRef.current = analyser;

    const bufferLength = analyser.frequencyBinCount;
    dataArrayRef.current = new Uint8Array(bufferLength);
    currentHeightsRef.current = new Float32Array(bufferLength).fill(0);

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    if (!ctx) return;

    const draw = () => {
      requestRef.current = requestAnimationFrame(draw);

      if (!analyserRef.current || !dataArrayRef.current || !currentHeightsRef.current) return;

      analyserRef.current.getByteFrequencyData(dataArrayRef.current);

      // Clear canvas
      ctx.fillStyle = 'rgb(248, 250, 252)'; // bg-slate-50
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const barCount = bufferLength;
      const totalAvailableWidth = canvas.width;
      const gap = 4; 
      const barWidth = (totalAvailableWidth / barCount) - gap;
      
      let x = gap / 2; // Start with half gap padding

      for (let i = 0; i < barCount; i++) {
        // Normalize value (0-255)
        const val = dataArrayRef.current[i];
        
        // Calculate target height relative to canvas
        // Multiply by 0.9 to leave some headroom
        const targetHeight = (val / 255) * canvas.height * 0.9;
        
        // LERP for smooth bounce animation
        // current = current + (target - current) * speed
        // 0.25 provides a responsive yet smooth feel
        currentHeightsRef.current[i] += (targetHeight - currentHeightsRef.current[i]) * 0.25;
        
        // Ensure a tiny minimum height so bars don't disappear completely
        const drawHeight = Math.max(4, currentHeightsRef.current[i]);

        // Dynamic Color Calculation
        // Calculate intensity ratio (0 to 1)
        const intensity = drawHeight / canvas.height;
        
        // Shift Hue: Blue (210) -> Purple/Pink (280) based on loudness
        const hue = 210 + (intensity * 70);
        // Increase lightness slightly for "glow" effect at high volumes
        const lightness = 50 + (intensity * 20);

        // Gradient for the bar
        const gradient = ctx.createLinearGradient(0, canvas.height, 0, canvas.height - drawHeight);
        gradient.addColorStop(0, '#3b82f6'); // Base Blue-500
        gradient.addColorStop(1, `hsl(${hue}, 90%, ${lightness}%)`); // Dynamic energetic top

        ctx.fillStyle = gradient;
        
        // Draw Rounded Bar
        ctx.beginPath();
        // Use roundRect if available (modern browsers), otherwise rect
        if (ctx.roundRect) {
            ctx.roundRect(x, canvas.height - drawHeight, barWidth, drawHeight, [4, 4, 0, 0]);
        } else {
            ctx.rect(x, canvas.height - drawHeight, barWidth, drawHeight);
        }
        ctx.fill();

        x += barWidth + gap;
      }
    };

    draw();

    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
      if (analyserRef.current) analyserRef.current.disconnect();
    };
  }, [isActive, audioContext, sourceNode]);

  if (!isActive) {
    return (
      <div className="w-full h-32 flex items-center justify-center bg-slate-100 rounded-lg border border-slate-200">
        <div className="flex flex-col items-center gap-2">
           <div className="flex gap-1">
             <div className="w-1 h-3 bg-slate-300 rounded-full animate-pulse"></div>
             <div className="w-1 h-5 bg-slate-300 rounded-full animate-pulse delay-75"></div>
             <div className="w-1 h-3 bg-slate-300 rounded-full animate-pulse delay-150"></div>
           </div>
           <span className="text-slate-400 text-sm font-medium">Ready to listen</span>
        </div>
      </div>
    );
  }

  return (
    <canvas 
      ref={canvasRef} 
      width={600} 
      height={128} 
      className="w-full h-32 rounded-lg border border-slate-200 bg-slate-50 shadow-inner"
    />
  );
};

export default Visualizer;