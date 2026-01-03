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
  const freqDataRef = useRef<Uint8Array | null>(null);
  const timeDataRef = useRef<Uint8Array | null>(null);
  const currentHeightsRef = useRef<Float32Array | null>(null);

  useEffect(() => {
    if (!isActive || !audioContext || !sourceNode || !canvasRef.current) return;

    const analyser = audioContext.createAnalyser();
    // Slightly larger FFT for smoother waveform and bars
    analyser.fftSize = 128; 
    analyser.smoothingTimeConstant = 0.75;
    
    sourceNode.connect(analyser);
    analyserRef.current = analyser;

    const bufferLength = analyser.frequencyBinCount;
    freqDataRef.current = new Uint8Array(bufferLength);
    timeDataRef.current = new Uint8Array(bufferLength);
    currentHeightsRef.current = new Float32Array(bufferLength).fill(0);

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    if (!ctx) return;

    const draw = () => {
      requestRef.current = requestAnimationFrame(draw);

      if (!analyserRef.current || !freqDataRef.current || !timeDataRef.current || !currentHeightsRef.current) return;

      const analyser = analyserRef.current;
      analyser.getByteFrequencyData(freqDataRef.current);
      analyser.getByteTimeDomainData(timeDataRef.current);

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // 1. Draw Waveform (Time Domain)
      ctx.lineWidth = 2;
      ctx.strokeStyle = '#f37021'; // Dr. HVAC Orange
      ctx.shadowBlur = 12;
      ctx.shadowColor = 'rgba(243, 112, 33, 0.4)';
      ctx.beginPath();

      const sliceWidth = canvas.width * 1.0 / timeDataRef.current.length;
      let tx = 0;

      for (let i = 0; i < timeDataRef.current.length; i++) {
        const v = timeDataRef.current[i] / 128.0;
        const ty = v * canvas.height / 2;

        if (i === 0) {
          ctx.moveTo(tx, ty);
        } else {
          ctx.lineTo(tx, ty);
        }

        tx += sliceWidth;
      }
      ctx.stroke();
      ctx.shadowBlur = 0; // Reset for bars

      // 2. Draw Frequency Bars
      const barCount = freqDataRef.current.length;
      const gap = 6; 
      const barWidth = (canvas.width / barCount) - gap;
      
      let bx = gap / 2;

      for (let i = 0; i < barCount; i++) {
        const val = freqDataRef.current[i];
        const targetHeight = (val / 255) * canvas.height * 0.8;
        
        currentHeightsRef.current[i] += (targetHeight - currentHeightsRef.current[i]) * 0.15;
        const drawHeight = Math.max(4, currentHeightsRef.current[i]);

        const intensity = drawHeight / canvas.height;
        const hue = 210 + (intensity * 20); // Blue range
        
        const gradient = ctx.createLinearGradient(0, canvas.height, 0, canvas.height - drawHeight);
        gradient.addColorStop(0, 'rgba(0, 74, 153, 0.8)'); // Dr. HVAC Blue
        gradient.addColorStop(1, `hsla(${hue}, 80%, 60%, 0.9)`);

        ctx.fillStyle = gradient;
        
        // Rounded bars if supported
        if (ctx.roundRect) {
            ctx.beginPath();
            ctx.roundRect(bx, canvas.height - drawHeight, barWidth, drawHeight, [4, 4, 4, 4]);
            ctx.fill();
        } else {
            ctx.fillRect(bx, canvas.height - drawHeight, barWidth, drawHeight);
        }

        bx += barWidth + gap;
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