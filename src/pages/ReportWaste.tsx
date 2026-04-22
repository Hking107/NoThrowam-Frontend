import React, { useState, useRef, useEffect } from "react";
import {
  Camera,
  MapPin,
  CheckCircle,
  UploadCloud,
  Navigation,
  Loader2,
  ArrowLeft,
  X,
  XCircle,
  RotateCcw,
  Sparkles,
  AlertTriangle,
  Leaf,
  ShieldCheck,
} from "lucide-react";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { Logo } from "../components/Logo";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import {
  depositService,
  type ReportDepositResponse,
  type DepositInsights,
} from "../services/depositService";

// Fix for default Leaflet marker icons not showing up due to webpack/vite issues
import iconUrl from "leaflet/dist/images/marker-icon.png";
import iconRetinaUrl from "leaflet/dist/images/marker-icon-2x.png";
import shadowUrl from "leaflet/dist/images/marker-shadow.png";

// @ts-ignore
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl,
  iconUrl,
  shadowUrl,
});

type Step = 1 | 2 | 3;

interface LocationData {
  lat: number;
  lng: number;
}

// Helper component to capture map clicks and update marker
function LocationSelector({
  location,
  setLocation,
}: {
  location: LocationData | null;
  setLocation: (loc: LocationData) => void;
}) {
  useMapEvents({
    click(e) {
      setLocation({ lat: e.latlng.lat, lng: e.latlng.lng });
    },
  });

  return location ? <Marker position={[location.lat, location.lng]} /> : null;
}

// ── Severity helpers ─────────────────────────────────────────────────────────

function severityLabel(score: number): string {
  if (score >= 80) return "Critical";
  if (score >= 60) return "High";
  if (score >= 40) return "Moderate";
  if (score >= 20) return "Low";
  return "Minimal";
}

function severityColor(score: number): string {
  if (score >= 80) return "text-red-500";
  if (score >= 60) return "text-orange-500";
  if (score >= 40) return "text-yellow-500";
  if (score >= 20) return "text-brand-green";
  return "text-emerald-400";
}

function severityBarColor(score: number): string {
  if (score >= 80) return "bg-red-500";
  if (score >= 60) return "bg-orange-500";
  if (score >= 40) return "bg-yellow-500";
  if (score >= 20) return "bg-brand-green";
  return "bg-emerald-400";
}

// ── Insights Panel ───────────────────────────────────────────────────────────

function InsightsPanel({ insights }: { insights: DepositInsights }) {
  return (
    <div className="space-y-6">
      {/* Waste Type */}
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 bg-brand-yellow/15 rounded-2xl flex items-center justify-center text-brand-yellow shrink-0">
          <Leaf size={22} />
        </div>
        <div>
          <p className="text-xs font-bold text-brand-text/40 uppercase tracking-widest">
            Waste Type
          </p>
          <p className="text-xl font-black text-brand-text mt-0.5">
            {insights.waste_type}
          </p>
        </div>
      </div>

      {/* Severity */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <AlertTriangle
              size={16}
              className={severityColor(insights.severity)}
            />
            <span className="text-xs font-bold text-brand-text/40 uppercase tracking-widest">
              Severity
            </span>
          </div>
          <span
            className={`text-sm font-black ${severityColor(insights.severity)}`}
          >
            {severityLabel(insights.severity)} ({insights.severity}/100)
          </span>
        </div>
        <div className="w-full h-2.5 bg-black/5 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-1000 ease-out ${severityBarColor(insights.severity)}`}
            style={{ width: `${insights.severity}%` }}
          />
        </div>
      </div>

      {/* Confidence */}
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 bg-brand-green/15 rounded-2xl flex items-center justify-center text-brand-green shrink-0">
          <ShieldCheck size={22} />
        </div>
        <div>
          <p className="text-xs font-bold text-brand-text/40 uppercase tracking-widest">
            AI Confidence
          </p>
          <p className="text-xl font-black text-brand-text mt-0.5">
            {(insights.confidence * 100).toFixed(0)}%
          </p>
        </div>
      </div>

      {/* Recommendation */}
      {insights.recommendation && (
        <div className="bg-brand-surface border border-black/5 rounded-2xl p-5">
          <p className="text-xs font-bold text-brand-text/40 uppercase tracking-widest mb-2">
            Recommendation
          </p>
          <p className="text-brand-text/80 font-medium leading-relaxed text-sm">
            {insights.recommendation}
          </p>
        </div>
      )}
    </div>
  );
}

// ── Main Component ───────────────────────────────────────────────────────────

export function ReportWaste() {
  const [currentStep, setCurrentStep] = useState<Step>(1);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [_file, setFile] = useState<File | null>(null);
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState<LocationData | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);

  const [submissionStatus, setSubmissionStatus] = useState<
    "idle" | "submitting" | "success" | "error"
  >("idle");
  const [submitErrorMessage, setSubmitErrorMessage] = useState("");
  const [apiResponse, setApiResponse] = useState<ReportDepositResponse | null>(
    null,
  );

  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const streamRef = useRef<MediaStream | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const tl = gsap.timeline();
      tl.fromTo(
        ".step-content",
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.6, ease: "power3.out" },
      ).fromTo(
        ".step-item",
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.4, stagger: 0.08, ease: "power2.out" },
        "-=0.3",
      );
    },
    { scope: containerRef, dependencies: [currentStep, submissionStatus] },
  );

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setIsCameraActive(false);
  };

  useEffect(() => {
    return () => {
      if (photoPreview) URL.revokeObjectURL(photoPreview);
      stopCamera();
    };
  }, [photoPreview]);

  useEffect(() => {
    if (isCameraActive && videoRef.current && streamRef.current) {
      videoRef.current.srcObject = streamRef.current;
      videoRef.current.play().catch(console.error);
    }
  }, [isCameraActive]);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      const url = URL.createObjectURL(selectedFile);
      setPhotoPreview(url);
    }
  };

  const capturePhoto = () => {
    fileInputRef.current?.click();
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
              setFile(file);
              setPhotoPreview(URL.createObjectURL(blob));
              stopCamera();
            }
          },
          "image/jpeg",
          0.8,
        );
      }
    }
  };

  const removePhoto = () => {
    setFile(null);
    setPhotoPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const getCurrentLocation = () => {
    setIsLocating(true);
    setLocationError(null);

    if (!navigator.geolocation) {
      setLocationError("Geolocation is not supported by your browser");
      setIsLocating(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
        setIsLocating(false);
      },
      (_error) => {
        setLocationError(
          "Unable to retrieve your location. Please drop a pin on the map.",
        );
        setIsLocating(false);
        setLocation({ lat: 3.848, lng: 11.502 }); // Default somewhere in Yaoundé
      },
    );
  };

  const handleNext = () => {
    if (currentStep < 3) setCurrentStep((prev) => (prev + 1) as Step);
  };

  const handleBack = () => {
    if (currentStep > 1) setCurrentStep((prev) => (prev - 1) as Step);
  };

  // ── Submit using the depositService ──────────────────────────────────────

  const [submitPhase, setSubmitPhase] = useState<
    "idle" | "uploading" | "analyzing"
  >("idle");

  const handleSubmit = async () => {
    if (!_file) {
      alert("Please select a photo first.");
      return;
    }

    setSubmissionStatus("submitting");
    setSubmitPhase("uploading");
    setSubmitErrorMessage("");

    try {
      // Step 1 – upload the image and get a hosted URL
      const imageUrl = await depositService.uploadImage(_file);

      // Step 2 – submit the report using the image URL
      setSubmitPhase("analyzing");
      const result = await depositService.report({
        image: imageUrl,
        description: description || undefined,
        latitude: location?.lat,
        longitude: location?.lng,
      });

      console.log("Deposit reported successfully:", result);
      setApiResponse(result);
      setSubmissionStatus("success");
    } catch (error: any) {
      console.error("Error submitting report:", error);
      setSubmissionStatus("error");
      setSubmitErrorMessage(
        error.message || "An unexpected error occurred. Please try again.",
      );
    } finally {
      setSubmitPhase("idle");
    }
  };

  // ── SUCCESS STATE ────────────────────────────────────────────────────────

  if (submissionStatus === "success") {
    const insights = apiResponse?.insights ?? null;
    const depositId = apiResponse?.deposit?.id;

    return (
      <div
        ref={containerRef}
        className="min-h-screen bg-brand-surface flex items-center justify-center p-4 sm:p-6 relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-brand-green/5 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-brand-yellow/5 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2 pointer-events-none" />

        <div className="step-content card-tactile max-w-lg w-full relative z-10 p-6! sm:p-10!">
          {/* Header */}
          <div className="step-item text-center mb-8">
            <div className="w-20 h-20 bg-brand-green/10 rounded-full flex items-center justify-center mx-auto mb-6 relative">
              <div className="absolute inset-0 bg-brand-green/20 rounded-full animate-ping opacity-75" />
              <CheckCircle className="w-10 h-10 text-brand-green relative z-10" />
            </div>
            <h2 className="text-3xl font-black text-brand-text tracking-tight mb-2">
              Report Received!
            </h2>
            {depositId && (
              <p className="text-brand-text/30 font-mono text-xs">
                Deposit #{depositId}
              </p>
            )}
            <p className="text-brand-text/60 font-medium mt-3 leading-relaxed">
              Thank you for helping keep the community clean. Our team will
              verify and take action shortly.
            </p>
          </div>

          {/* AI Insights Card */}
          {insights && (
            <div className="step-item mb-8">
              <div className="flex items-center gap-2 mb-5">
                <Sparkles size={18} className="text-brand-yellow" />
                <h3 className="font-black text-brand-text uppercase tracking-widest text-xs">
                  AI Analysis
                </h3>
              </div>
              <InsightsPanel insights={insights} />
            </div>
          )}

          {/* Action Buttons */}
          <div className="step-item flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => {
                // Reset everything for a new report
                setSubmissionStatus("idle");
                setApiResponse(null);
                setFile(null);
                setPhotoPreview(null);
                setDescription("");
                setLocation(null);
                setCurrentStep(1);
              }}
              className="flex-1 px-6 py-4 border-2 border-black/5 hover:border-black/10 bg-white text-brand-text/70 rounded-2xl font-bold transition-all cursor-pointer text-center"
            >
              Report Another
            </button>
            <button
              onClick={() => (window.location.href = "/")}
              className="flex-1 btn-primary py-4 text-lg cursor-pointer"
            >
              Return Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── ERROR STATE ──────────────────────────────────────────────────────────

  if (submissionStatus === "error") {
    return (
      <div
        ref={containerRef}
        className="min-h-screen bg-brand-surface flex items-center justify-center p-6 relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-brand-red/5 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-brand-yellow/5 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2 pointer-events-none" />

        <div className="step-content card-tactile max-w-md w-full text-center relative z-10 p-10!">
          <div className="step-item w-24 h-24 bg-brand-red/10 rounded-full flex items-center justify-center mx-auto mb-8 border border-brand-red/20">
            <XCircle className="w-12 h-12 text-brand-red" />
          </div>
          <h2 className="step-item text-3xl font-black text-brand-text tracking-tight mb-4">
            Submission Failed
          </h2>
          <p className="step-item text-brand-red/80 font-medium mb-2 p-3 bg-brand-red/5 rounded-xl border border-brand-red/10">
            {submitErrorMessage}
          </p>
          <p className="step-item text-brand-text/60 text-sm mb-10 mt-4 font-medium leading-relaxed">
            Something went wrong while sending your report. Please check your
            connection and try again.
          </p>
          <div className="step-item flex gap-4">
            <button
              onClick={() => (window.location.href = "/")}
              className="flex-1 px-6 py-4 border-2 border-black/5 hover:border-black/10 bg-white text-brand-text/70 rounded-2xl font-bold transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={() => setSubmissionStatus("idle")}
              className="flex-1 btn-primary py-4 flex items-center justify-center gap-2 cursor-pointer"
            >
              <RotateCcw size={20} />
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── WIZARD ───────────────────────────────────────────────────────────────

  return (
    <div
      ref={containerRef}
      className="min-h-screen bg-brand-surface flex flex-col relative overflow-hidden"
    >
      {/* Background Decor */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-brand-green/5 rounded-full blur-[120px] -translate-y-1/3 translate-x-1/3 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-brand-yellow/5 rounded-full blur-[120px] translate-y-1/3 -translate-x-1/3 pointer-events-none" />

      {/* Header */}
      <header className="bg-white/80 backdrop-blur-xl border-b border-black/5 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-6 h-20 flex items-center justify-between">
          <button
            onClick={() => window.history.back()}
            className="w-12 h-12 flex items-center justify-center rounded-full hover:bg-black/5 transition-colors text-brand-text cursor-pointer"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <Logo />
          <div className="w-12" /> {/* Spacer */}
        </div>
      </header>

      {/* Progress Bar */}
      <div className="bg-white/60 backdrop-blur-md border-b border-black/5 py-6">
        <div className="max-w-md mx-auto px-6">
          <div className="flex items-center justify-between relative">
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1.5 bg-black/5 rounded-full" />
            <div
              className="absolute left-0 top-1/2 -translate-y-1/2 h-1.5 bg-brand-green rounded-full transition-all duration-700 ease-in-out"
              style={{ width: `${((currentStep - 1) / 2) * 100}%` }}
            />

            {[1, 2, 3].map((stepNumber) => (
              <div
                key={stepNumber}
                className={`relative flex items-center justify-center w-10 h-10 rounded-full border-4 transition-colors duration-500 z-10 ${
                  currentStep >= stepNumber
                    ? "bg-brand-green border-brand-green text-white shadow-lg shadow-brand-green/20"
                    : "bg-white border-black/5 text-brand-text/30"
                }`}
              >
                {stepNumber < currentStep ? (
                  <CheckCircle className="w-6 h-6" />
                ) : (
                  <span className="font-bold">{stepNumber}</span>
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-3 text-xs font-bold text-brand-text/50 uppercase tracking-widest px-1">
            <span className={currentStep >= 1 ? "text-brand-green" : ""}>
              Photo
            </span>
            <span className={currentStep >= 2 ? "text-brand-green" : ""}>
              Location
            </span>
            <span className={currentStep >= 3 ? "text-brand-green" : ""}>
              Confirm
            </span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-8 flex flex-col relative z-10 mb-10">
        <div className="step-content flex-1 card-tactile p-8! flex flex-col">
          {/* STEP 1: PHOTO */}
          {currentStep === 1 && (
            <div className="flex flex-col h-full">
              <div className="step-item text-center mb-8">
                <h2 className="text-3xl font-black text-brand-text tracking-tight">
                  Capture the Waste
                </h2>
                <p className="text-brand-text/60 mt-3 font-medium">
                  Provide a clear photo so our team knows what to look for.
                </p>
              </div>

              <div className="step-item flex-1 flex flex-col justify-center min-h-[300px]">
                {!photoPreview && !isCameraActive ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <button
                      onClick={startCamera}
                      className="group flex flex-col items-center justify-center p-8 border-2 border-dashed border-black/10 rounded-4xl bg-brand-surface hover:bg-brand-green/5 hover:border-brand-green/40 transition-all cursor-pointer aspect-square"
                    >
                      <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm mb-4 group-hover:scale-110 transition-transform">
                        <Camera className="w-8 h-8 text-brand-green" />
                      </div>
                      <span className="font-bold text-brand-text group-hover:text-brand-green transition-colors">
                        Use Camera
                      </span>
                    </button>
                    <button
                      onClick={capturePhoto}
                      className="group flex flex-col items-center justify-center p-8 border-2 border-dashed border-black/10 rounded-4xl bg-brand-surface hover:bg-brand-yellow/5 hover:border-brand-yellow/40 transition-all cursor-pointer aspect-square"
                    >
                      <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm mb-4 group-hover:scale-110 transition-transform">
                        <UploadCloud className="w-8 h-8 text-brand-yellow" />
                      </div>
                      <span className="font-bold text-brand-text group-hover:text-brand-yellow transition-colors">
                        Upload Photo
                      </span>
                    </button>
                  </div>
                ) : isCameraActive ? (
                  <div className="relative rounded-4xl overflow-hidden aspect-4/3 bg-black shadow-xl ring-1 ring-black/5">
                    <video
                      ref={videoRef}
                      className="w-full h-full object-cover"
                      playsInline
                      muted
                    />
                    <div className="absolute inset-0 border-4 border-white/20 rounded-4xl pointer-events-none" />
                    <div className="absolute inset-x-0 bottom-6 flex justify-center items-center gap-8">
                      <button
                        onClick={stopCamera}
                        className="w-14 h-14 bg-black/40 hover:bg-black/60 backdrop-blur-xl rounded-full flex items-center justify-center text-white transition-colors cursor-pointer"
                      >
                        <X className="w-6 h-6" />
                      </button>
                      <button
                        onClick={takePhotoFromStream}
                        className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full border-4 border-white flex items-center justify-center hover:scale-105 transition-transform cursor-pointer"
                      >
                        <div className="w-14 h-14 bg-white rounded-full shadow-inner" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="relative rounded-4xl overflow-hidden aspect-4/3 shadow-lg ring-1 ring-black/5 group">
                    <img
                      src={photoPreview!}
                      alt="Waste preview"
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                      <button
                        onClick={removePhoto}
                        className="px-6 py-3 bg-white text-brand-red rounded-full font-bold hover:scale-105 transition-transform shadow-xl flex items-center gap-2 cursor-pointer"
                      >
                        <RotateCcw size={18} /> Retake Photo
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <input
                type="file"
                accept="image/*"
                capture="environment"
                className="hidden"
                ref={fileInputRef}
                onChange={handlePhotoUpload}
              />

              {/* Optional description */}
              <div className="step-item mt-6">
                <label className="text-xs font-bold text-brand-text/40 uppercase tracking-widest mb-2 block">
                  Description (optional)
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="e.g. Pile of plastic bags near the road…"
                  rows={2}
                  className="w-full px-5 py-3 rounded-2xl border border-black/5 bg-brand-surface focus:ring-4 focus:ring-brand-green/10 focus:border-brand-green/30 outline-none transition-all font-medium text-sm resize-none"
                />
              </div>

              <div className="step-item mt-6">
                <button
                  disabled={!photoPreview && !isCameraActive}
                  onClick={handleNext}
                  className="w-full btn-primary py-4 flex items-center justify-center gap-2 disabled:opacity-50 disabled:shadow-none cursor-pointer"
                >
                  <span className="text-lg">Continue</span>{" "}
                  <ArrowLeft className="w-5 h-5 rotate-180" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: LOCATION */}
          {currentStep === 2 && (
            <div className="flex flex-col h-full">
              <div className="step-item text-center mb-8">
                <h2 className="text-3xl font-black text-brand-text tracking-tight">
                  Pinpoint Location
                </h2>
                <p className="text-brand-text/60 mt-3 font-medium">
                  Where exactly did you find this waste?
                </p>
              </div>

              <div className="step-item flex-1 relative rounded-4xl overflow-hidden border-4 border-brand-surface shadow-xl bg-gray-100 min-h-[400px]">
                {!location ? (
                  <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center z-10 bg-white/50 backdrop-blur-sm">
                    <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mb-6 text-blue-500 shadow-inner">
                      <Navigation className="w-10 h-10" />
                    </div>
                    <p className="text-brand-text font-medium mb-8 text-lg">
                      We need your location to map the report accurately.
                    </p>
                    <button
                      onClick={getCurrentLocation}
                      disabled={isLocating}
                      className="btn-accent bg-blue-600 hover:bg-blue-700 shadow-blue-600/20 px-8 py-4 flex items-center gap-3 text-lg disabled:opacity-70 cursor-pointer"
                    >
                      {isLocating ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        <MapPin className="w-5 h-5" />
                      )}
                      {isLocating ? "Locating..." : "Use Current Location"}
                    </button>
                    {locationError && (
                      <p className="text-brand-red mt-6 font-bold bg-brand-red/10 px-4 py-2 rounded-xl">
                        {locationError}
                      </p>
                    )}
                  </div>
                ) : (
                  <MapContainer
                    center={[location.lat, location.lng]}
                    zoom={17}
                    attributionControl={false}
                    style={{
                      height: "100%",
                      minHeight: "400px",
                      width: "100%",
                      zIndex: 1,
                    }}
                  >
                    <TileLayer
                      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    <LocationSelector
                      location={location}
                      setLocation={setLocation}
                    />
                  </MapContainer>
                )}

                {location && (
                  <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-400 bg-white/90 backdrop-blur-md px-6 py-4 rounded-full shadow-2xl border border-black/5 flex items-center gap-3 whitespace-nowrap">
                    <div className="w-8 h-8 rounded-full bg-brand-green/20 flex items-center justify-center text-brand-green">
                      <MapPin className="w-4 h-4" />
                    </div>
                    <span className="font-bold text-brand-text text-sm">
                      Location pinned. Tap map to adjust.
                    </span>
                  </div>
                )}
              </div>

              <div className="step-item flex gap-4 mt-8">
                <button
                  onClick={handleBack}
                  className="px-8 py-4 border border-black/10 hover:bg-black/5 text-brand-text rounded-2xl font-bold transition-all cursor-pointer"
                >
                  Back
                </button>
                <button
                  disabled={!location}
                  onClick={handleNext}
                  className="flex-1 btn-primary py-4 flex items-center justify-center gap-2 disabled:opacity-50 text-lg cursor-pointer"
                >
                  Continue <ArrowLeft className="w-5 h-5 rotate-180" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: CONFIRM */}
          {currentStep === 3 && (
            <div className="flex flex-col h-full">
              <div className="step-item text-center mb-8">
                <h2 className="text-3xl font-black text-brand-text tracking-tight">
                  Final Review
                </h2>
                <p className="text-brand-text/60 mt-3 font-medium">
                  Does everything look correct? Submit to finalize.
                </p>
              </div>

              <div className="step-item flex-1 bg-brand-surface border border-black/5 rounded-4xl p-6 sm:p-8 space-y-8">
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 bg-brand-yellow/20 rounded-lg flex items-center justify-center text-brand-yellow">
                      <Camera size={16} />
                    </div>
                    <h3 className="font-bold text-brand-text uppercase tracking-widest text-sm">
                      Proof Image
                    </h3>
                  </div>
                  <div className="aspect-video rounded-2xl overflow-hidden shadow-inner border border-black/5">
                    {photoPreview && (
                      <img
                        src={photoPreview}
                        alt="Review"
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>
                </div>

                {description && (
                  <div>
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-8 h-8 bg-brand-text/5 rounded-lg flex items-center justify-center text-brand-text/40">
                        <Sparkles size={16} />
                      </div>
                      <h3 className="font-bold text-brand-text uppercase tracking-widest text-sm">
                        Description
                      </h3>
                    </div>
                    <p className="text-brand-text/70 font-medium text-sm bg-white p-4 rounded-2xl border border-black/5">
                      {description}
                    </p>
                  </div>
                )}

                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 bg-brand-green/20 rounded-lg flex items-center justify-center text-brand-green">
                      <MapPin size={16} />
                    </div>
                    <h3 className="font-bold text-brand-text uppercase tracking-widest text-sm">
                      Location Data
                    </h3>
                  </div>
                  <div className="bg-white p-5 rounded-2xl shadow-sm border border-black/5">
                    <p className="font-bold text-brand-text text-lg">
                      Coordinates Captured
                    </p>
                    <p className="text-brand-text/50 font-mono mt-2 flex gap-4 text-sm">
                      <span>Lat: {location?.lat.toFixed(6)}</span>
                      <span>Lng: {location?.lng.toFixed(6)}</span>
                    </p>
                  </div>
                </div>
              </div>

              <div className="step-item flex gap-4 mt-8">
                <button
                  onClick={handleBack}
                  disabled={submissionStatus === "submitting"}
                  className="px-8 py-4 border border-black/10 hover:bg-black/5 text-brand-text rounded-2xl font-bold transition-all cursor-pointer disabled:opacity-50"
                >
                  Back
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={submissionStatus === "submitting"}
                  className="flex-1 btn-primary py-4 flex items-center justify-center gap-3 text-lg cursor-pointer disabled:opacity-80"
                >
                  {submissionStatus === "submitting" ? (
                    <>
                      <Loader2 className="w-6 h-6 animate-spin text-white/80" />
                      <span>
                        {submitPhase === "uploading"
                          ? "Uploading…"
                          : "Analyzing…"}
                      </span>
                    </>
                  ) : (
                    <>
                      <UploadCloud className="w-6 h-6" />
                      <span>Submit Report</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
