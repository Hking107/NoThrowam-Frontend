import React, { useRef } from 'react';
import { ChangeEvent } from 'react';
import { Camera } from 'lucide-react';

interface CameraCaptureProps {
  onImageCaptured: (file: File) => void;
  label?: string;
}

const CameraCapture: React.FC<CameraCaptureProps> = ({ 
  onImageCaptured, 
  label = "Prendre une photo" 
}) => {
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onImageCaptured(file);
      e.target.value = '';
    }
  };

  return (
    <div className="w-full">
      <button 
        type="button"
        onClick={() => cameraInputRef.current?.click()}
        className="w-full flex items-center justify-center gap-3 bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl shadow-lg transition-transform active:scale-95"
      >
        <Camera size={24} />
        {label}
      </button>

      <input 
        type="file" 
        ref={cameraInputRef} 
        onChange={handleFileChange} 
        accept="image/*" 
        capture="environment" 
        className="hidden" 
      />
    </div>
  );
};

export default CameraCapture;