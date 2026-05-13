import React, {
  useState,
  useRef,
  type DragEvent,
  type ChangeEvent,
  useEffect,
} from "react";
import {
  Camera,
  Upload,
  RefreshCw,
  CheckCircle2,
  X,
  ScanText,
  AlertCircle,
  ChevronRight,
  Info,
  DollarSign,
  Recycle,
} from "lucide-react";
import { wasteService } from "../services/wasteService";
import { authService } from "../services/authService";
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

const WasteScannerModal: React.FC<WasteScannerModalProps> = ({
  onClose,
  onPublish,
}) => {
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [aiResult, setAiResult] = useState<any | null>(null);
  const [scanningLinePos, setScanningLinePos] = useState(0);
  const [isCameraActive, setIsCameraActive] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  // Scanning animation effect
  useEffect(() => {
    let interval: any;
    if (isAnalyzing) {
      interval = setInterval(() => {
        setScanningLinePos((prev) => (prev >= 100 ? 0 : prev + 2));
      }, 30);
    } else {
      setScanningLinePos(0);
    }
    return () => clearInterval(interval);
  }, [isAnalyzing]);

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };
  const handleDragEnter = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };
  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };
  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFile(e.dataTransfer.files[0]);
      e.dataTransfer.clearData();
    }
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0)
      processFile(e.target.files[0]);
  };

  const processFile = (file: File) => {
    if (!file.type.startsWith("image/")) {
      alert("Please upload a valid image file (JPG, PNG...).");
      return;
    }
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    setAiResult(null);
  };

  // ── Live Camera ──────────────────────────────────────────────────────
  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setIsCameraActive(false);
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      });
      streamRef.current = stream;
      setIsCameraActive(true);
    } catch (err) {
      console.error("Error accessing camera:", err);
      alert("Unable to access camera. Please upload an image instead.");
    }
  };

  useEffect(() => {
    if (isCameraActive && videoRef.current && streamRef.current) {
      videoRef.current.srcObject = streamRef.current;
      videoRef.current.play().catch(console.error);
    }
  }, [isCameraActive]);

  // Clean up camera on unmount
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  const takePhotoFromStream = () => {
    if (videoRef.current) {
      const canvas = document.createElement("canvas");
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
        canvas.toBlob(
          (blob) => {
            if (blob) {
              const file = new File([blob], "camera-photo.jpg", {
                type: "image/jpeg",
              });
              processFile(file);
              stopCamera();
            }
          },
          "image/jpeg",
          0.8,
        );
      }
    }
  };

  const handleReset = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setAiResult(null);
    stopCamera();
    if (fileInputRef.current) fileInputRef.current.value = "";
    if (cameraInputRef.current) cameraInputRef.current.value = "";
  };

  const handleAnalyze = async () => {
    if (!selectedFile) return;
    setIsAnalyzing(true);
    try {
      const token = authService.getAccessToken();
      if (!token) {
        alert("Session expired. Please log in again.");
        setIsAnalyzing(false);
        return;
      }

      const uploadResponse = await wasteService.uploadImage(selectedFile);

      // Géolocalisation du navigateur
      const coords = await new Promise<{ latitude: number; longitude: number }>(
        (resolve) => {
          if (!navigator.geolocation) {
            resolve({ latitude: 3.85, longitude: 11.5083 });
            return;
          }
          navigator.geolocation.getCurrentPosition(
            (pos) =>
              resolve({
                latitude: pos.coords.latitude,
                longitude: pos.coords.longitude,
              }),
            () => resolve({ latitude: 3.85, longitude: 11.5083 }),
            { timeout: 8000, enableHighAccuracy: true },
          );
        },
      );

      const post = await wasteService.hCreatePost({
        image_url: uploadResponse.url,
        quantity: Math.floor(Math.random() * 100) + 1,
        unit: "kg",
        latitude: coords.latitude,
        longitude: coords.longitude,
      });

      const { id: postId } = post;

      const analyzeData = await wasteService.analyzePost(postId);

      setAiResult({
        category: analyzeData.category || "Unknown",
        price: analyzeData.price || 0,
        sorted: analyzeData.sorted ?? false,
        action: analyzeData.sorted
          ? "Approved for recycling"
          : analyzeData.rejection_reason || "Non-compliant waste",
        description: analyzeData.description || "",
      });
    } catch (error: any) {
      alert(`Error: ${error.message}`);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 backdrop-blur-md font-sans p-4 transition-all duration-300"
      onClick={onClose}
    >
      <main
        className="w-full max-w-2xl bg-white/95 rounded-3xl md:rounded-[2.5rem] shadow-[0_32px_64px_-12px_rgba(0,0,0,0.14)] overflow-hidden relative animate-[scaleIn_0.3s_ease-out] flex flex-col border border-white/20"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-6 right-6 text-gray-400 hover:text-gray-900 bg-gray-100/50 hover:bg-gray-100 rounded-full p-2.5 transition-all duration-300 group z-20"
        >
          <X
            size={20}
            className="group-hover:rotate-90 transition-transform duration-300"
          />
        </button>

        <header className="px-10 pt-10 pb-6 text-center shrink-0">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full text-xs font-black uppercase tracking-wider mb-4 border border-emerald-100">
            <ScanText size={14} />
            AI Waste Analyzer
          </div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">
            Smart Scanning
          </h1>
          <p className="text-gray-500 mt-2 text-sm font-medium">
            Take a photo or upload an image for instant AI analysis
          </p>
        </header>

        {/* Scan animation styles */}
        <style>{`
          @keyframes report-scan-sweep {
            0% { top: -30%; }
            100% { top: 120%; }
          }
          .animate-report-scan-sweep {
            animation: report-scan-sweep 2s linear infinite;
          }
        `}</style>

        <div
          className="p-8 pt-2 flex-1 overflow-y-auto custom-scrollbar scrollbar-customer"
          data-lenis-prevent
        >
          {!previewUrl && !isCameraActive ? (
            <div className="space-y-6">
              {/* Drag & Drop Zone */}
              <div
                onDragOver={handleDragOver}
                onDragEnter={handleDragEnter}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`flex flex-col items-center justify-center p-12 border-4 border-dashed rounded-[2rem] cursor-pointer transition-all duration-500 overflow-hidden relative group ${
                  isDragging
                    ? "border-emerald-500 bg-emerald-50/50 scale-[0.98]"
                    : "border-gray-100 bg-gray-50/50 hover:bg-white hover:border-emerald-200 hover:shadow-xl hover:shadow-emerald-500/5"
                }`}
              >
                <div className="w-20 h-20 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500">
                  <Upload size={32} />
                </div>
                <h3 className="text-xl font-black text-gray-800">
                  Drag or Browse
                </h3>
                <p className="text-gray-400 text-sm mt-1 font-medium italic">
                  Support JPG, PNG, WEBP
                </p>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/*"
                  className="hidden"
                />
              </div>

              {/* Live Camera Button */}
              <button
                type="button"
                onClick={startCamera}
                className="w-full flex items-center justify-between gap-4 bg-gray-900 hover:bg-black text-white font-black py-5 px-8 rounded-2xl shadow-xl shadow-gray-200 transition-all active:scale-95 group"
              >
                <div className="flex items-center gap-3">
                  <div className="bg-white/10 p-2.5 rounded-xl text-emerald-400 group-hover:rotate-12 transition-transform">
                    <Camera size={24} />
                  </div>
                  <span>Take a Photo</span>
                </div>
                <ChevronRight size={20} className="text-gray-500" />
              </button>
            </div>
          ) : isCameraActive ? (
            /* ── Live Camera View ──────────────────────────────────── */
            <div className="flex flex-col items-center">
              <div className="relative w-full max-w-md rounded-[2rem] overflow-hidden shadow-2xl border-4 border-white bg-black aspect-[4/3]">
                <video
                  ref={videoRef}
                  className="w-full h-full object-cover"
                  playsInline
                  muted
                />
                {/* Viewfinder frame */}
                <div className="absolute inset-0 border-4 border-white/20 rounded-[2rem] pointer-events-none" />

                {/* Camera controls */}
                <div className="absolute inset-x-0 bottom-6 flex justify-center items-center gap-8">
                  {/* Cancel */}
                  <button
                    onClick={stopCamera}
                    className="w-14 h-14 bg-black/40 hover:bg-black/60 backdrop-blur-xl rounded-full flex items-center justify-center text-white transition-colors"
                  >
                    <X className="w-6 h-6" />
                  </button>
                  {/* Shutter */}
                  <button
                    onClick={takePhotoFromStream}
                    className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full border-4 border-white flex items-center justify-center hover:scale-105 transition-transform"
                  >
                    <div className="w-14 h-14 bg-white rounded-full shadow-inner" />
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center">
              <div className="relative w-full max-w-md group">
                <div className="relative overflow-hidden rounded-4xl shadow-2xl border-4 border-white">
                  <img
                    src={previewUrl}
                    alt="Preview"
                    className="w-full h-64 object-cover"
                  />

                  {/* Scanning Animation UI */}
                  {isAnalyzing && (
                    <div className="absolute inset-0 z-10 pointer-events-none">
                      {/* Subtle ambient tint */}
                      <div className="absolute rounded-md inset-0 bg-emerald-900/20 backdrop-blur-[2px] pointer-events-none" />

                      {/* Holographic sweep — clipped to image bounds */}
                      <div
                        className="absolute inset-0 overflow-hidden pointer-events-none"
                        style={{ clipPath: "inset(0)" }}
                      >
                        <div className="absolute left-0 right-0 h-32 animate-report-scan-sweep">
                          {/* Glowing scan line */}
                          <div className="absolute bottom-0 w-full h-1 bg-emerald-400 shadow-[0_0_20px_rgba(52,211,153,1)]" />
                          {/* Gradient trail above the line */}
                          <div className="absolute bottom-1 w-full h-32 bg-gradient-to-t from-emerald-400/40 to-transparent" />
                        </div>
                      </div>

                      {/* Analyzing Badge */}
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-30">
                        <div className="bg-black/80 backdrop-blur-md text-white px-6 py-3 rounded-2xl font-black text-sm tracking-widest uppercase flex items-center gap-3 border border-emerald-500/30 shadow-[0_0_30px_rgba(52,211,153,0.2)]">
                          <ScanText
                            size={18}
                            className="animate-spin text-emerald-400"
                          />
                          Analyzing...
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <button
                  onClick={handleReset}
                  className="absolute -top-3 -right-3 bg-red-500 text-white rounded-full w-10 h-10 flex items-center justify-center font-bold shadow-xl hover:bg-black transition-all hover:rotate-90 group active:scale-90 z-50"
                >
                  <X size={20} />
                </button>
              </div>

              {!aiResult && !isAnalyzing && (
                <button
                  onClick={handleAnalyze}
                  className="mt-8 w-full max-w-md py-5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xl shadow-xl shadow-emerald-200 transition-all active:scale-95 flex items-center justify-center gap-3 group"
                >
                  <RefreshCw
                    size={24}
                    className="group-hover:rotate-180 transition-transform duration-700"
                  />
                  Start AI Analysis
                </button>
              )}
            </div>
          )}
        </div>

        {aiResult && (
          <div className="bg-gray-50/80 backdrop-blur-md border-t border-gray-100 p-8 animate-[slideUp_0.5s_ease-out]">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-emerald-100 text-emerald-600 rounded-xl">
                <Info size={20} />
              </div>
              <h2 className="text-xl font-black text-gray-900 tracking-tight">
                Analysis Report
              </h2>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <ResultCard
                label="Category"
                value={aiResult.category}
                icon={<Recycle size={16} />}
                color={
                  aiResult.category?.toLowerCase() === "trash"
                    ? "text-red-500"
                    : "text-emerald-600"
                }
              />
              <ResultCard
                label="Estimated Price"
                value={`${aiResult.price.toLocaleString()} FCFA`}
                icon={<DollarSign size={16} />}
              />

              <div className="col-span-2 bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-start gap-4">
                <div
                  className={`mt-1 p-2 rounded-xl shrink-0 ${aiResult.sorted ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-500"}`}
                >
                  {aiResult.sorted ? (
                    <CheckCircle2 size={24} />
                  ) : (
                    <AlertCircle size={24} />
                  )}
                </div>
                <div>
                  <p className="text-[10px] text-gray-400 font-black uppercase tracking-[0.2em] mb-1">
                    Recommendation
                  </p>
                  <p
                    className={`text-base font-black ${aiResult.sorted ? "text-emerald-700" : "text-red-600"}`}
                  >
                    {aiResult.action}
                  </p>
                  {aiResult.description && (
                    <p className="text-xs text-gray-500 mt-1 font-medium leading-relaxed">
                      {aiResult.description}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <button
              onClick={() => {
                if (aiResult.sorted && onPublish) onPublish(aiResult);
                aiResult.sorted ? onClose() : handleReset();
              }}
              className={`mt-8 w-full py-5 rounded-2xl font-black text-lg transition-all flex justify-center items-center gap-3 shadow-lg ${
                aiResult.sorted
                  ? "bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-200 active:scale-95"
                  : "bg-white text-red-600 border-2 border-red-100 hover:bg-red-50 active:scale-95"
              }`}
            >
              {aiResult.sorted ? (
                <>
                  <CheckCircle2 size={24} /> Publish to Marketplace
                </>
              ) : (
                <>
                  <RefreshCw size={24} /> Try Another Photo
                </>
              )}
            </button>
          </div>
        )}
      </main>
    </div>
  );
};

const ResultCard = ({
  label,
  value,
  icon,
  color = "text-gray-900",
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
  color?: string;
}) => (
  <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 group hover:border-emerald-200 transition-colors">
    <div className="flex items-center gap-2 mb-2">
      <div className="text-gray-400 group-hover:text-emerald-500 transition-colors">
        {icon}
      </div>
      <p className="text-[10px] text-gray-400 font-black uppercase tracking-[0.2em]">
        {label}
      </p>
    </div>
    <p className={`text-xl font-black ${color}`}>{value}</p>
  </div>
);

export default WasteScannerModal;
