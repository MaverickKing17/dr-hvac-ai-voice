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
    analyser.fftSize = 64; 
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

      ctx.fillStyle = 'white';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const barCount = bufferLength;
      const totalAvailableWidth = canvas.width;
      const gap = 6; 
      const barWidth = (totalAvailableWidth / barCount) - gap;
      
      let x = gap / 2;

      for (let i = 0; i < barCount; i++) {
        const val = dataArrayRef.current[i];
        const targetHeight = (val / 255) * canvas.height * 0.85;
        
        currentHeightsRef.current[i] += (targetHeight - currentHeightsRef.current[i]) * 0.25;
        const drawHeight = Math.max(6, currentHeightsRef.current[i]);

        const intensity = drawHeight / canvas.height;
        const hue = 215 + (intensity * 60);
        const lightness = 55 + (intensity * 15);

        const gradient = ctx.createLinearGradient(0, canvas.height, 0, canvas.height - drawHeight);
        gradient.addColorStop(0, '#2563eb'); 
        gradient.addColorStop(1, `hsl(${hue}, 85%, ${lightness}%)`);

        ctx.fillStyle = gradient;
        
        ctx.beginPath();
        if (ctx.roundRect) {
            ctx.roundRect(x, canvas.height - drawHeight, barWidth, drawHeight, [6, 6, 0, 0]);
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
      <div className="w-full h-32 flex flex-col items-center justify-center bg-slate-50/50 rounded-2xl border border-slate-100 overflow-hidden relative">
        <div className="absolute inset-0 bg-gradient-to-tr from-blue-50/30 to-transparent animate-pulse" style={{ animationDuration: '4s' }}></div>
        <div className="flex items-end gap-1.5 h-6 mb-3 relative z-10">
          {[0.4, 0.7, 1, 0.6, 0.3, 0.8, 0.5].map((scale, i) => (
            <div 
              key={i} 
              className="w-1 bg-slate-200 rounded-full" 
              style={{ height: `${scale * 100}%`, transition: 'height 0.3s ease' }}
            ></div>
          ))}
        </div>
        <span className="text-slate-400 text-xs font-bold uppercase tracking-widest relative z-10">System Ready</span>
      </div>
    );
  }

  return (
    <canvas 
      ref={canvasRef} 
      width={600} 
      height={128} 
      className="w-full h-32 rounded-2xl border border-slate-100 bg-white shadow-inner"
    />
  );
};

export default Visualizer;