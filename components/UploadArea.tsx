import React, { useCallback, useState } from 'react';
import { Upload, Image as ImageIcon, AlertCircle } from 'lucide-react';

interface UploadAreaProps {
  onImageSelected: (base64: string) => void;
  disabled?: boolean;
}

export const UploadArea: React.FC<UploadAreaProps> = ({ onImageSelected, disabled }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    processFile(file);
  }, [onImageSelected]);

  const processFile = (file: File | undefined) => {
    setError(null);
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError("Please select a valid image file (JPG, PNG, WEBP).");
      return;
    }

    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      setError("File size is too large. Please select an image under 10MB.");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      onImageSelected(result);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div 
        className={`
          relative group cursor-pointer 
          border-2 border-dashed rounded-3xl p-10 
          transition-all duration-300 ease-in-out
          flex flex-col items-center justify-center text-center
          ${isDragging 
            ? 'border-primary bg-primary/10 scale-[1.02]' 
            : 'border-slate-700 bg-surface/50 hover:bg-surface hover:border-slate-500'
          }
          ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        `}
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragging(false);
          if (!disabled) processFile(e.dataTransfer.files[0]);
        }}
      >
        <input 
          type="file" 
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
          onChange={handleFileChange}
          accept="image/*"
          disabled={disabled}
        />
        
        <div className="bg-slate-800 p-4 rounded-full mb-4 shadow-xl ring-1 ring-white/10 group-hover:scale-110 transition-transform duration-300">
          <Upload className={`w-8 h-8 ${isDragging ? 'text-primary' : 'text-slate-400'}`} />
        </div>
        
        <h3 className="text-xl font-semibold text-white mb-2">
          Upload an image to start
        </h3>
        <p className="text-slate-400 max-w-sm mx-auto mb-6">
          Drag and drop your image here, or click to browse files.
          <br/>
          <span className="text-xs opacity-75">Supports JPG, PNG, WEBP up to 10MB</span>
        </p>

        {error && (
          <div className="absolute bottom-4 left-0 right-0 px-4">
             <div className="bg-red-500/20 text-red-200 text-sm py-2 px-3 rounded-lg inline-flex items-center">
                <AlertCircle className="w-4 h-4 mr-2" />
                {error}
             </div>
          </div>
        )}
      </div>
    </div>
  );
};
