import React, { useState, useRef, useEffect } from 'react';
import { Camera, MapPin, CheckCircle, UploadCloud, Navigation, Loader2, ArrowLeft } from 'lucide-react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default Leaflet marker icons not showing up due to webpack/vite issues
import iconUrl from 'leaflet/dist/images/marker-icon.png';
import iconRetinaUrl from 'leaflet/dist/images/marker-icon-2x.png';
import shadowUrl from 'leaflet/dist/images/marker-shadow.png';

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
function LocationSelector({ location, setLocation }: { location: LocationData | null, setLocation: (loc: LocationData) => void }) {
  useMapEvents({
    click(e) {
      setLocation({ lat: e.latlng.lat, lng: e.latlng.lng });
    },
  });

  return location ? <Marker position={[location.lat, location.lng]} /> : null;
}

export function ReportWaste() {
  const [currentStep, setCurrentStep] = useState<Step>(1);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [location, setLocation] = useState<LocationData | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Clean up object URLs
  useEffect(() => {
    return () => {
      if (photoPreview) URL.revokeObjectURL(photoPreview);
    };
  }, [photoPreview]);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      const url = URL.createObjectURL(selectedFile);
      setPhotoPreview(url);
    }
  };

  const capturePhoto = () => {
    // In a real app we might use navigator.mediaDevices.getUserMedia
    // For simplicity, we just trigger the file input with accept="image/*" and capture="environment"
    fileInputRef.current?.click();
  };

  const removePhoto = () => {
    setFile(null);
    setPhotoPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
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
      (error) => {
        setLocationError("Unable to retrieve your location. Please drop a pin on the map.");
        setIsLocating(false);
        // Default to a central location (e.g., somewhere general) if failed
        setLocation({ lat: 51.505, lng: -0.09 });
      }
    );
  };

  const handleNext = () => {
    if (currentStep < 3) setCurrentStep((prev) => (prev + 1) as Step);
  };

  const handleBack = () => {
    if (currentStep > 1) setCurrentStep((prev) => (prev - 1) as Step);
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setIsSubmitting(false);
    setIsSuccess(true);
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center space-y-6">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-green-500" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900">Report Sent!</h2>
          <p className="text-gray-600">
            Thank you for reporting this waste. Our team will verify and take action shortly.
          </p>
          <button
            onClick={() => window.location.href = '/'}
            className="w-full mt-8 py-3 px-6 bg-green-600 hover:bg-green-700 text-white rounded-xl font-medium transition-colors"
          >
            Return to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-3xl mx-auto px-4 h-16 flex items-center justify-between">
          <button 
            onClick={() => window.history.back()}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-600"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-xl font-semibold text-gray-900">Report Waste</h1>
          <div className="w-10" /> {/* Spacer */}
        </div>
      </header>

      {/* Progress Bar */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-3xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between relative">
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-gray-200 rounded-full" />
            <div 
              className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-green-500 rounded-full transition-all duration-500 ease-in-out" 
              style={{ width: `${((currentStep - 1) / 2) * 100}%` }}
            />
            
            {[1, 2, 3].map((stepNumber) => (
              <div 
                key={stepNumber}
                className={`relative flex items-center justify-center w-8 h-8 rounded-full border-2 transition-colors duration-300 ${
                  currentStep >= stepNumber 
                    ? 'bg-green-500 border-green-500 text-white' 
                    : 'bg-white border-gray-300 text-gray-400'
                }`}
              >
                {stepNumber < currentStep ? <CheckCircle className="w-5 h-5" /> : stepNumber}
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-2 text-xs font-medium text-gray-500">
            <span>Photo</span>
            <span>Location</span>
            <span>Confirm</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 max-w-3xl mx-auto w-full px-4 py-8 flex flex-col">
        <div className="flex-1 bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8">
          
          {/* STEP 1: PHOTO */}
          {currentStep === 1 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="text-center">
                <h2 className="text-2xl font-bold text-gray-900">Take a Photo</h2>
                <p className="text-gray-500 mt-2">Clear photos help us identify and locate the waste faster.</p>
              </div>

              {!photoPreview ? (
                <div 
                  className="border-2 border-dashed border-gray-300 rounded-2xl aspect-video flex flex-col items-center justify-center bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer"
                  onClick={capturePhoto}
                >
                  <Camera className="w-12 h-12 text-gray-400 mb-4" />
                  <span className="font-medium text-gray-600">Tap to take photo or upload</span>
                </div>
              ) : (
                <div className="relative rounded-2xl overflow-hidden aspect-video group">
                  <img src={photoPreview} alt="Waste preview" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <button 
                      onClick={removePhoto}
                      className="px-4 py-2 bg-white text-red-600 rounded-lg font-medium hover:bg-gray-100"
                    >
                      Retake Photo
                    </button>
                  </div>
                </div>
              )}

              <input 
                type="file" 
                accept="image/*" 
                capture="environment" 
                className="hidden" 
                ref={fileInputRef}
                onChange={handlePhotoUpload}
              />

              <button
                disabled={!photoPreview}
                onClick={handleNext}
                className="w-full py-4 bg-green-600 hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-xl font-medium text-lg transition-colors flex items-center justify-center gap-2"
              >
                Continue <ArrowLeft className="w-5 h-5 rotate-180" />
              </button>
            </div>
          )}

          {/* STEP 2: LOCATION */}
          {currentStep === 2 && (
            <div className="space-y-6 h-full flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="text-center">
                <h2 className="text-2xl font-bold text-gray-900">Set Location</h2>
                <p className="text-gray-500 mt-2">Where is the waste located?</p>
              </div>

              <div className="flex-1 min-h-[300px] relative rounded-2xl overflow-hidden border border-gray-200">
                {!location ? (
                  <div className="absolute inset-0 bg-gray-50 flex flex-col items-center justify-center p-6 text-center z-10">
                    <Navigation className="w-12 h-12 text-gray-400 mb-4" />
                    <p className="text-gray-600 mb-6">We need your location to pinpoint the waste.</p>
                    <button 
                      onClick={getCurrentLocation}
                      disabled={isLocating}
                      className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-xl font-medium transition-colors flex items-center gap-2"
                    >
                      {isLocating ? <Loader2 className="w-5 h-5 animate-spin" /> : <MapPin className="w-5 h-5" />}
                      Use My Current Location
                    </button>
                    {locationError && <p className="text-red-500 mt-4 text-sm">{locationError}</p>}
                  </div>
                ) : (
                  <MapContainer 
                    center={[location.lat, location.lng]} 
                    zoom={16} 
                    style={{ height: '100%', width: '100%' }}
                  >
                    <TileLayer
                      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    <LocationSelector location={location} setLocation={setLocation} />
                  </MapContainer>
                )}
                
                {location && (
                  <div className="absolute bottom-4 left-4 right-4 z-[400] bg-white text-sm px-4 py-3 rounded-lg shadow-lg flex items-center gap-3">
                    <MapPin className="w-5 h-5 text-green-500 shrink-0" />
                    <span className="truncate text-gray-700">Location selected. Tap map to adjust.</span>
                  </div>
                )}
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  onClick={handleBack}
                  className="px-6 py-4 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-medium transition-colors"
                >
                  Back
                </button>
                <button
                  disabled={!location}
                  onClick={handleNext}
                  className="flex-1 py-4 bg-green-600 hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-xl font-medium text-lg transition-colors flex items-center justify-center gap-2"
                >
                  Continue <ArrowLeft className="w-5 h-5 rotate-180" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: CONFIRM */}
          {currentStep === 3 && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="text-center">
                <h2 className="text-2xl font-bold text-gray-900">Review & Submit</h2>
                <p className="text-gray-500 mt-2">Almost done! Please review your report details.</p>
              </div>

              <div className="bg-gray-50 rounded-2xl p-4 sm:p-6 space-y-6">
                <div>
                  <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Photo</h3>
                  <div className="aspect-video rounded-xl overflow-hidden shadow-sm">
                    {photoPreview && <img src={photoPreview} alt="Review" className="w-full h-full object-cover" />}
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Location Data</h3>
                  <div className="flex items-center gap-3 bg-white p-4 rounded-xl shadow-sm">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center shrink-0">
                      <MapPin className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 shrink-0">Coordinates Captured</p>
                      <p className="text-sm text-gray-500 font-mono mt-1">
                        Lat: {location?.lat.toFixed(6)} <br/>
                        Lng: {location?.lng.toFixed(6)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={handleBack}
                  disabled={isSubmitting}
                  className="px-6 py-4 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-medium transition-colors disabled:opacity-50"
                >
                  Back
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="flex-1 py-4 bg-green-600 hover:bg-green-700 text-white rounded-xl font-medium text-lg transition-all flex items-center justify-center gap-2 disabled:bg-green-400"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" /> Submitting...
                    </>
                  ) : (
                    <>
                      <UploadCloud className="w-5 h-5" /> Submit Report
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
