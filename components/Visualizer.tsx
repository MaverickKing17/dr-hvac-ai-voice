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
    // Use a higher smoothing constant for less jittery raw data
    analyser.fftSize = 64; 
    analyser.smoothingTimeConstant = 0.6;
    
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

      // Soft clear for transparency effect
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const barCount = bufferLength;
      const totalAvailableWidth = canvas.width;
      const gap = 8; 
      const barWidth = (totalAvailableWidth / barCount) - gap;
      
      let x = gap / 2;

      for (let i = 0; i < barCount; i++) {
        const val = dataArrayRef.current[i];
        // Scale height slightly smaller for elegance
        const targetHeight = (val / 255) * canvas.height * 0.75;
        
        // Lower LERP factor (0.12 instead of 0.25) makes the "bounce" much more fluid and subtle
        currentHeightsRef.current[i] += (targetHeight - currentHeightsRef.current[i]) * 0.12;
        const drawHeight = Math.max(8, currentHeightsRef.current[i]);

        const intensity = drawHeight / canvas.height;
        // Shift colors more subtly (Blue to Cyan range)
        const hue = 215 + (intensity * 30);
        const lightness = 60 + (intensity * 10);

        const gradient = ctx.createLinearGradient(0, canvas.height, 0, canvas.height - drawHeight);
        gradient.addColorStop(0, '#2563eb'); 
        gradient.addColorStop(1, `hsl(${hue}, 80%, ${lightness}%)`);

        ctx.fillStyle = gradient;
        
        // Adding a subtle shadow to each bar for depth
        ctx.shadowColor = 'rgba(37, 99, 235, 0.1)';
        ctx.shadowBlur = 8;
        ctx.shadowOffsetY = 2;

        ctx.beginPath();
        if (ctx.roundRect) {
            ctx.roundRect(x, canvas.height - drawHeight, barWidth, drawHeight, [8, 8, 8, 8]);
        } else {
            ctx.rect(x, canvas.height - drawHeight, barWidth, drawHeight);
        }
        ctx.fill();
        ctx.shadowBlur = 0; // Reset shadow for next bars

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
      <div className="w-full h-32 flex flex-col items-center justify-center bg-slate-50/40 rounded-3xl border border-slate-100 overflow-hidden relative">
        <div className="absolute inset-0 bg-gradient-to-tr from-blue-50/40 to-transparent animate-pulse" style={{ animationDuration: '6s' }}></div>
        <div className="flex items-end gap-2 h-6 mb-3 relative z-10 opacity-40">
          {[0.4, 0.7, 1, 0.6, 0.3, 0.8, 0.5, 0.9, 0.4].map((scale, i) => (
            <div 
              key={i} 
              className="w-1.5 bg-slate-300 rounded-full" 
              style={{ height: `${scale * 100}%` }}
            ></div>
          ))}
        </div>
        <span className="text-slate-400 text-[10px] font-black uppercase tracking-[0.3em] relative z-10">System Ready</span>
      </div>
    );
  }

  return (
    <canvas 
      ref={canvasRef} 
      width={600} 
      height={128} 
      className="w-full h-32 rounded-3xl border border-slate-50 bg-white/50 backdrop-blur-sm"
    />
  );
};

export default Visualizer;