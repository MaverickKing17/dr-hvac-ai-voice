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

  useEffect(() => {
    if (!isActive || !audioContext || !sourceNode || !canvasRef.current) return;

    const analyser = audioContext.createAnalyser();
    analyser.fftSize = 256;
    sourceNode.connect(analyser);
    analyserRef.current = analyser;

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    if (!ctx) return;

    const draw = () => {
      requestRef.current = requestAnimationFrame(draw);

      analyser.getByteFrequencyData(dataArray);

      ctx.fillStyle = 'rgb(248, 250, 252)'; // bg-slate-50
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const barWidth = (canvas.width / bufferLength) * 2.5;
      let barHeight;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        barHeight = dataArray[i] / 2;

        // Gradient for bars (Blue to Teal)
        const gradient = ctx.createLinearGradient(0, canvas.height, 0, 0);
        gradient.addColorStop(0, '#3b82f6'); // Blue-500
        gradient.addColorStop(1, '#06b6d4'); // Cyan-500
        
        ctx.fillStyle = gradient;
        
        // Rounded tops for bars
        ctx.beginPath();
        ctx.roundRect(x, canvas.height - barHeight, barWidth, barHeight, [4, 4, 0, 0]);
        ctx.fill();

        x += barWidth + 1;
      }
    };

    draw();

    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
      // Clean up analyser connection if needed, though usually handled by parent context close
    };
  }, [isActive, audioContext, sourceNode]);

  if (!isActive) {
    return (
      <div className="w-full h-32 flex items-center justify-center bg-slate-100 rounded-lg border border-slate-200">
        <span className="text-slate-400 text-sm">Waiting to connect...</span>
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