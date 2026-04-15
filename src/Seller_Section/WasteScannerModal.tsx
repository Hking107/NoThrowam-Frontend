import React, { useState, useRef, type DragEvent, type ChangeEvent } from 'react';
import { Camera, Upload, RefreshCw, CheckCircle } from 'lucide-react';

interface WasteScannerModalProps {
  onClose: () => void;
  onPublish?: (data: any) => void; 
}

const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
};

const WasteScannerModal: React.FC<WasteScannerModalProps> = ({ onClose, onPublish }) => {
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [aiResult, setAiResult] = useState<any | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null); 

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => { e.preventDefault(); e.stopPropagation(); };
  const handleDragEnter = (e: DragEvent<HTMLDivElement>) => { e.preventDefault(); e.stopPropagation(); setIsDragging(true); };
  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => { e.preventDefault(); e.stopPropagation(); setIsDragging(false); };
  
  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault(); e.stopPropagation(); setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFile(e.dataTransfer.files[0]);
      e.dataTransfer.clearData();
    }
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) processFile(e.target.files[0]);
  };

  const processFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Veuillez déposer une image valide (JPG, PNG...).');
      return;
    }
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    setAiResult(null); 
  };

  const handleReset = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setAiResult(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (cameraInputRef.current) cameraInputRef.current.value = '';
  };

  const handleAnalyze = async () => {
    if (!selectedFile) return;
    setIsAnalyzing(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        alert("Session expirée. Veuillez vous reconnecter.");
        setIsAnalyzing(false);
        return;
      }

      const base64Image = await fileToBase64(selectedFile);
      const createResponse = await fetch("/api/v0/waste-posts/create/", {
        method: "POST",
        headers: {
          "Accept": "application/json",
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({
          image: base64Image,
          quantity: Math.floor(Math.random() * 100) + 1, 
          unit: "kg",
          latitude: 3.8500,
          longitude: 11.5083,
        })
      });

      if (!createResponse.ok) throw new Error(`Erreur création: ${createResponse.status}`);
      const { id: postId } = await createResponse.json();

      const analyzeResponse = await fetch(`/api/v0/waste-posts/${postId}/analyze/`, {
        method: "POST",
        headers: { "Accept": "application/json", "Authorization": `Bearer ${token}` }
      });

      if (!analyzeResponse.ok) throw new Error(`Erreur analyse: ${analyzeResponse.status}`);
      const analyzeData = await analyzeResponse.json();

      setAiResult({
        category: analyzeData.category || 'Inconnu',
        price: analyzeData.price || 0,
        sorted: analyzeData.sorted ?? false,
        action: analyzeData.sorted ? "Validé pour recyclage" : (analyzeData.rejection_reason || "Déchet non conforme"),
        description: analyzeData.description || ""
      });
    } catch (error: any) {
      alert(`Erreur: ${error.message}`);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm font-sans p-4">
      <main className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden relative animate-[fadeIn_0.2s_ease-out]">
        
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-full p-2 transition-colors z-10">
          <XIcon />
        </button>

        <header className="text-center pt-8 pb-4 px-4">
          <h1 className="text-2xl font-extrabold text-green-700 tracking-tight">Analyseur de déchets</h1>
          <p className="text-gray-500 mt-2 text-sm">Prenez une photo ou importez un fichier pour l'analyser.</p>
        </header>

        <div className="p-8 pt-4">
          {!previewUrl ? (
            <div className="space-y-4">
              {/* Zone Drag & Drop (Parcourir) */}
              <div
                onDragOver={handleDragOver} onDragEnter={handleDragEnter} onDragLeave={handleDragLeave} onDrop={handleDrop} onClick={() => fileInputRef.current?.click()}
                className={`flex flex-col items-center justify-center p-8 border-4 border-dashed rounded-xl cursor-pointer transition-all ${isDragging ? 'border-green-500 bg-green-50 scale-[1.02]' : 'border-gray-300 bg-gray-50 hover:bg-gray-100 hover:border-green-400'}`}
              >
                <Upload className="text-gray-400 mb-2" size={40} />
                <h3 className="text-lg font-bold text-gray-700">Glissez ou parcourez</h3>
                <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
              </div>

              {/* Bouton Caméra (Mobile Spécifique) */}
              <button 
                onClick={() => cameraInputRef.current?.click()}
                className="w-full flex items-center justify-center gap-3 bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl shadow-lg transition-transform active:scale-95"
              >
                <Camera size={24} />
                Prendre une photo
                <input type="file" ref={cameraInputRef} onChange={handleFileChange} accept="image/*" capture="environment" className="hidden" />
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center">
              <div className="relative w-full max-w-md">
                <img src={previewUrl} alt="Aperçu" className="w-full h-56 object-cover rounded-xl shadow-md border border-gray-200" />
                <button onClick={handleReset} className="absolute -top-3 -right-3 bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold shadow-lg hover:bg-red-600 transition">&times;</button>
              </div>

              {!aiResult && (
                <button
                  onClick={handleAnalyze}
                  disabled={isAnalyzing}
                  className={`mt-6 w-full max-w-md py-4 rounded-xl text-white font-bold text-lg shadow-lg transition-all flex items-center justify-center gap-3 ${isAnalyzing ? 'bg-green-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'}`}
                >
                  {isAnalyzing ? "Analyse IA en cours..." : "Lancer l'analyse IA"}
                </button>
              )}
            </div>
          )}
        </div>

        {aiResult && (
          <div className="bg-gray-50 border-t border-gray-100 p-8 pt-6 animate-[fadeIn_0.5s_ease-out]">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Rapport d'analyse</h2>
            <div className="grid grid-cols-2 gap-4">
              <ResultCard label="Catégorie" value={aiResult.category} color={aiResult.category?.toLowerCase() === 'trash' ? 'text-red-600' : 'text-blue-600'} />
              <ResultCard label="Prix estimé" value={`${aiResult.price} FCFA`} />
              <div className="col-span-2 bg-white p-3 rounded-lg shadow-sm border border-gray-100">
                <p className="text-xs text-gray-500 font-semibold uppercase">Recommandation</p>
                <p className={`text-sm font-bold mt-1 ${aiResult.sorted ? 'text-green-600' : 'text-red-600'}`}>{aiResult.action}</p>
              </div>
            </div>

            <button 
              onClick={() => { if (aiResult.sorted && onPublish) onPublish(aiResult); aiResult.sorted ? onClose() : handleReset(); }} 
              className={`mt-6 w-full py-4 rounded-xl font-bold shadow-md transition flex justify-center items-center gap-2 ${aiResult.sorted ? 'bg-green-600 hover:bg-green-700 text-white' : 'bg-red-100 text-red-700 border border-red-300'}`}
            >
              {aiResult.sorted ? <><CheckCircle size={20}/> Publier sur la Marketplace</> : <><RefreshCw size={20}/> Réessayer avec une autre photo</>}
            </button>
          </div>
        )}
      </main>
    </div>
  );
};

const ResultCard = ({ label, value, color = "text-gray-800" }: { label: string, value: string, color?: string }) => (
  <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-100">
    <p className="text-xs text-gray-500 font-semibold uppercase">{label}</p>
    <p className={`text-lg font-bold ${color}`}>{value}</p>
  </div>
);

const XIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>;

export default WasteScannerModal;