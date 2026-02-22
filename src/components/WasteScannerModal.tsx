import React, { useState, useRef, DragEvent, ChangeEvent } from 'react';
import { Camera } from 'lucide-react';

function getRandomInt(min, max) {
  min = Math.ceil(min); // Ensure minimum is a whole number
  max = Math.floor(max); // Ensure maximum is a whole number
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

interface WasteScannerModalProps {
  onClose: () => void;
}

// Fonction utilitaire pour convertir un fichier en Base64
const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
};

const WasteScannerModal: React.FC<WasteScannerModalProps> = ({ onClose }) => {
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [aiResult, setAiResult] = useState<any | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // ... (Garde tes fonctions handleDragOver, handleDragEnter, handleDragLeave, handleDrop, handleFileChange, triggerFileInput, processFile, handleReset inchangées) ...
  const handleDragOver = (e: DragEvent<HTMLDivElement>) => { e.preventDefault(); e.stopPropagation(); };
  const handleDragEnter = (e: DragEvent<HTMLDivElement>) => { e.preventDefault(); e.stopPropagation(); setIsDragging(true); };
  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => { e.preventDefault(); e.stopPropagation(); setIsDragging(false); };
  
  const randomImages = [
    "https://images.unsplash.com/photo-1595278069441-2cf29f8005a4?auto=format&fit=crop&w=400&q=80",
    "https://images.unsplash.com/photo-1550503192-3bc5505c2194?auto=format&fit=crop&w=400&q=80",
    "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&q=80",
    "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=400&q=80",
    "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&w=400&q=80",
    "https://images.unsplash.com/photo-1595278069441-2cf29f8005a4?auto=format&fit=crop&w=400&q=80"
  ];
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

  const triggerFileInput = () => fileInputRef.current?.click();

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
  };

  const handleAnalyze = async () => {
    if (!selectedFile) return;
    setIsAnalyzing(true);

    try {
      // 1. Récupération du token
      const token = localStorage.getItem("token");
      if (!token) {
        alert("Vous n'êtes pas connecté !");
        setIsAnalyzing(false);
        return;
      }

      // 2. Conversion de l'image en Base64
      const base64Image = await fileToBase64(selectedFile);
// --- ÉTAPE 1 : CRÉATION DU POST ---
      const createResponse = await fetch("/api/v0/waste-posts/create/", {
        method: "POST",
        headers: {
          "accept": "application/json",
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
          "ngrok-skip-browser-warning": "69420",
          'X-CSRFTOKEN': 'lFHtmFYGSV2FRtbjijvzoXrqugh0RSep42P7mzweSJk0sYrrbruu3DWDVM5VtruW'
        },
        body: JSON.stringify({
          // Supprime image_url et utilise 'image' avec le base64
          image: base64Image.split(',')[1], // N'oublie pas d'enlever le préfixe si ton backend plante avec !
          quantity: getRandomInt(1, 100), 
          unit: "kg",
          latitude: getRandomInt(3, 9) + "." + getRandomInt(1000, 9999), 
          longitude: getRandomInt(-5, 5) + "." + getRandomInt(1000, 9999), 
        })
      });
      // --- ÉTAPE 1 : CRÉATION DU POST ---
      

      if (!createResponse.ok) {
        throw new Error(`Erreur lors de la création du post: ${createResponse.status}`);
      }

      const createData = await createResponse.json();
      const postId = createData.id; // On récupère l'ID généré par le backend

      if (!postId) {
        throw new Error("L'API n'a pas renvoyé d'ID pour le post.");
      }

      // --- ÉTAPE 2 : ANALYSE DU POST ---
      const analyzeResponse = await fetch(`/api/v0/waste-posts/${postId}/analyze/`, {
        method: "POST",
        headers: {
          "accept": "application/json",
          "Authorization": `Bearer ${token}`,
          "ngrok-skip-browser-warning": "69420"
        },
        // Un body vide est parfois requis par fetch pour les requêtes POST, même s'il n'y a pas de données
        body: "" 
      });

      if (!analyzeResponse.ok) {
        throw new Error(`Erreur lors de l'analyse IA: ${analyzeResponse.status}`);
      }

      const analyzeData = await analyzeResponse.json();

      // --- ÉTAPE 3 : MISE À JOUR DE L'UI ---
      // On utilise les champs retournés par ton endpoint d'analyse
      setAiResult({
        category: analyzeData.category || 'Inconnu', 
        price: analyzeData.price || 0,
        sorted: analyzeData.sorted, 
        action: analyzeData.sorted ? "Validé pour recyclage" : (analyzeData.rejection_reason || "Déchet non conforme"),
        description: analyzeData.description || ""
      });

    } catch (error) {
      console.error(error);
      alert('Erreur lors de la communication avec le serveur.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm font-sans p-4">
      {/* ... (Reste de ton JSX exactement identique à avant) ... */}
      <main className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden relative animate-[fadeIn_0.2s_ease-out]">
        
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-full p-2 transition-colors z-10">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
        </button>

        <header className="text-center pt-8 pb-4">
          <h1 className="text-2xl font-extrabold text-green-700 tracking-tight">Analyseur de déchets</h1>
          <p className="text-gray-500 mt-2 text-sm">Glissez une photo de déchet pour l'analyser et l'évaluer.</p>
        </header>

        <div className="p-8 pt-4">
          {!previewUrl ? (
            <div
              onDragOver={handleDragOver} onDragEnter={handleDragEnter} onDragLeave={handleDragLeave} onDrop={handleDrop} onClick={triggerFileInput}
              className={`flex flex-col items-center justify-center p-12 border-4 border-dashed rounded-xl cursor-pointer transition-all duration-300 ease-in-out ${isDragging ? 'border-green-500 bg-green-50 scale-[1.02]' : 'border-gray-300 bg-gray-50 hover:bg-gray-100 hover:border-green-400'}`}
            >
              <div className={`text-5xl mb-4 transition-transform ${isDragging ? 'animate-bounce' : ''}`}>
                <Camera className=''/>
              </div>
              <h3 className="text-lg font-bold text-gray-700">{isDragging ? 'Relâchez pour déposer !' : 'Glissez & déposez une photo ici'}</h3>
              <p className="text-gray-500 mt-2 text-sm">ou cliquez pour parcourir vos fichiers</p>
              <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
            </div>
          ) : (
            <div className="flex flex-col items-center">
              <div className="relative w-full max-w-md">
                <img src={previewUrl} alt="Aperçu" className="w-full h-48 object-cover rounded-xl shadow-md border border-gray-200" />
                <button onClick={handleReset} className="absolute -top-3 -right-3 bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold shadow-lg hover:bg-red-600 transition" title="Changer d'image">&times;</button>
              </div>

              {!aiResult && (
                <button
                  onClick={handleAnalyze}
                  disabled={isAnalyzing}
                  className={`mt-6 w-full max-w-md py-3 rounded-xl text-white font-bold text-lg shadow-lg transition-all flex items-center justify-center gap-3 ${isAnalyzing ? 'bg-green-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700 hover:shadow-green-500/30 hover:-translate-y-1'}`}
                >
                  {isAnalyzing ? (
                    <>
                      <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                      Analyse IA en cours...
                    </>
                  ) : "Lancer l'analyse IA"}
                </button>
              )}
            </div>
          )}
        </div>

        {aiResult && (
          <div className="bg-gray-50 border-t border-gray-100 p-8 pt-6 animate-[fadeIn_0.5s_ease-out]">
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2"> Rapport d'analyse</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-100">
                <p className="text-xs text-gray-500 font-semibold uppercase">Catégorie</p>
                <p className={`text-lg font-bold ${aiResult.category?.toLowerCase() === 'trash' ? 'text-red-600' : 'text-blue-600'}`}>{aiResult.category}</p>
              </div>
              {/* <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-100">
                <p className="text-xs text-gray-500 font-semibold uppercase">Confiance</p>
                <p className="text-lg font-bold text-green-600">{aiResult.confidence}%</p>
              </div> */}
              <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-100">
                <p className="text-xs text-gray-500 font-semibold uppercase">Prix estimé</p>
                <p className="text-lg font-bold text-gray-800">{aiResult.price} FCFA</p>
              </div>
              <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-100">
                <p className="text-xs text-gray-500 font-semibold uppercase">Recommandation</p>
                <p className={`text-sm font-bold mt-1 ${aiResult.category?.toLowerCase() === 'trash' ? 'text-red-600' : 'text-orange-600'}`}>{aiResult.action}</p>
              </div>
            </div>

           {/* Si sorted est FALSE, c'est que le déchet est refusé */}
            {!aiResult.sorted ? (
              <button onClick={handleReset} className="mt-6 w-full bg-red-100 hover:bg-red-200 text-red-700 border border-red-300 font-bold py-3 rounded-xl shadow-sm transition flex justify-center items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                Déchet refusé : Analyser une autre image
              </button>
            ) : (
              // Si sorted est TRUE, on peut publier
              <button onClick={() => {  onClose(); }} className="mt-6 w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl shadow-md transition flex justify-center items-center gap-2">
                Publier sur la Marketplace
              </button>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default WasteScannerModal;