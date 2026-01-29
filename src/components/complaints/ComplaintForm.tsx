import { useState, useRef, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { GovButton } from '@/components/ui/gov-button';
import { GovInput } from '@/components/ui/gov-input';
import { useToast } from '@/hooks/use-toast';
import { 
  Camera, 
  MapPin, 
  Upload, 
  X, 
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import type { ComplaintCategory } from '@/lib/types';
import { CATEGORY_LABELS, CATEGORY_ICONS } from '@/lib/types';

interface ComplaintFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

export function ComplaintForm({ onSuccess, onCancel }: ComplaintFormProps) {
  const { user, profile, refreshProfile } = useAuth();
  const { toast } = useToast();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  const [step, setStep] = useState<'permissions' | 'capture' | 'details'>('permissions');
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [location, setLocation] = useState<{ lat: number; lng: number; address: string } | null>(null);
  const [category, setCategory] = useState<ComplaintCategory | ''>('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [permissionStatus, setPermissionStatus] = useState({
    camera: false,
    location: false,
  });

  const requestPermissions = async () => {
    try {
      // Request camera permission
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      });
      setStream(mediaStream);
      setPermissionStatus(prev => ({ ...prev, camera: true }));

      // Request location permission
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          // Reverse geocoding could be added here with Google Maps API
          setLocation({
            lat: latitude,
            lng: longitude,
            address: `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`
          });
          setPermissionStatus(prev => ({ ...prev, location: true }));
          setStep('capture');
        },
        (error) => {
          toast({
            title: 'Location Permission Required',
            description: 'Please enable location access to register complaints.',
            variant: 'destructive',
          });
        },
        { enableHighAccuracy: true }
      );
    } catch (error) {
      toast({
        title: 'Camera Permission Required',
        description: 'Please enable camera access to capture live photos.',
        variant: 'destructive',
      });
    }
  };

  useEffect(() => {
    if (stream && videoRef.current) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [stream]);

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0);
        const imageData = canvas.toDataURL('image/jpeg', 0.8);
        setCapturedImage(imageData);
        stream?.getTracks().forEach(track => track.stop());
        setStep('details');
      }
    }
  };

  const retakePhoto = async () => {
    setCapturedImage(null);
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      });
      setStream(mediaStream);
      setStep('capture');
    } catch (error) {
      toast({
        title: 'Camera Error',
        description: 'Unable to access camera.',
        variant: 'destructive',
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!capturedImage || !location || !category || !user) return;

    setLoading(true);

    try {
      // Convert base64 to blob
      const response = await fetch(capturedImage);
      const blob = await response.blob();
      const fileName = `${user.id}/${Date.now()}.jpg`;

      // Upload to storage
      const { error: uploadError } = await supabase.storage
        .from('complaint-photos')
        .upload(fileName, blob, { contentType: 'image/jpeg' });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('complaint-photos')
        .getPublicUrl(fileName);

      // Create complaint record
      const { error: insertError } = await supabase
        .from('complaints')
        .insert({
          user_id: user.id,
          category: category,
          description: description || null,
          photo_url: urlData.publicUrl,
          latitude: location.lat,
          longitude: location.lng,
          location_address: location.address,
        });

      if (insertError) throw insertError;

      onSuccess();
    } catch (error: any) {
      toast({
        title: 'Submission Failed',
        description: error.message || 'Failed to submit complaint.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Hidden canvas for photo capture */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Step 1: Permissions */}
      {step === 'permissions' && (
        <div className="text-center py-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 text-primary mb-6">
            <Camera className="w-10 h-10" />
          </div>
          <h3 className="text-xl font-bold text-foreground mb-3">
            One-Time Permissions Required
          </h3>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            To register a complaint, we need access to your camera for live photos 
            and your location to pinpoint the issue area.
          </p>
          
          <div className="flex flex-col gap-3 max-w-xs mx-auto mb-6">
            <div className={`flex items-center gap-3 p-3 rounded-lg ${permissionStatus.camera ? 'bg-completed/10' : 'bg-muted'}`}>
              {permissionStatus.camera ? (
                <CheckCircle className="w-5 h-5 text-completed" />
              ) : (
                <Camera className="w-5 h-5 text-muted-foreground" />
              )}
              <span className={permissionStatus.camera ? 'text-completed' : 'text-muted-foreground'}>
                Camera Access
              </span>
            </div>
            <div className={`flex items-center gap-3 p-3 rounded-lg ${permissionStatus.location ? 'bg-completed/10' : 'bg-muted'}`}>
              {permissionStatus.location ? (
                <CheckCircle className="w-5 h-5 text-completed" />
              ) : (
                <MapPin className="w-5 h-5 text-muted-foreground" />
              )}
              <span className={permissionStatus.location ? 'text-completed' : 'text-muted-foreground'}>
                Location Access
              </span>
            </div>
          </div>

          <div className="flex gap-3 justify-center">
            <GovButton variant="outline" onClick={onCancel}>
              Cancel
            </GovButton>
            <GovButton onClick={requestPermissions}>
              Grant Permissions
            </GovButton>
          </div>
        </div>
      )}

      {/* Step 2: Camera Capture */}
      {step === 'capture' && (
        <div className="space-y-4">
          <div className="relative rounded-xl overflow-hidden bg-foreground aspect-[4/3]">
            <video 
              ref={videoRef} 
              autoPlay 
              playsInline 
              muted
              className="w-full h-full object-cover"
            />
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2">
              <button
                onClick={capturePhoto}
                className="w-16 h-16 bg-primary-foreground rounded-full border-4 border-primary shadow-lg hover:scale-105 transition-transform"
              />
            </div>
          </div>
          
          {location && (
            <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
              <MapPin className="w-5 h-5 text-primary" />
              <span className="text-sm text-foreground">{location.address}</span>
            </div>
          )}
        </div>
      )}

      {/* Step 3: Details */}
      {step === 'details' && (
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Captured Photo */}
          <div className="relative">
            {capturedImage && (
              <img 
                src={capturedImage} 
                alt="Captured" 
                className="w-full rounded-xl aspect-[4/3] object-cover"
              />
            )}
            <button
              type="button"
              onClick={retakePhoto}
              className="absolute top-3 right-3 p-2 bg-foreground/80 text-primary-foreground rounded-full hover:bg-foreground transition-colors"
            >
              <Camera className="w-4 h-4" />
            </button>
          </div>

          {/* Location */}
          {location && (
            <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
              <MapPin className="w-5 h-5 text-primary" />
              <span className="text-sm text-foreground">{location.address}</span>
            </div>
          )}

          {/* Category Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              Complaint Category <span className="text-destructive">*</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {(Object.entries(CATEGORY_LABELS) as [ComplaintCategory, string][]).map(([key, label]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setCategory(key)}
                  className={`flex flex-col items-center gap-2 p-3 rounded-lg border-2 transition-all ${
                    category === key 
                      ? 'border-primary bg-primary/5' 
                      : 'border-muted hover:border-primary/50'
                  }`}
                >
                  <span className="text-2xl">{CATEGORY_ICONS[key]}</span>
                  <span className="text-xs font-medium text-center">{label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              Additional Details (Optional)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the issue in detail..."
              className="w-full h-24 p-3 rounded-lg border-2 border-muted bg-background text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all resize-none"
              maxLength={500}
            />
            <p className="text-xs text-muted-foreground text-right">{description.length}/500</p>
          </div>

          {/* Submit Buttons */}
          <div className="flex gap-3 pt-4">
            <GovButton type="button" variant="outline" onClick={onCancel} className="flex-1">
              Cancel
            </GovButton>
            <GovButton 
              type="submit" 
              className="flex-1" 
              disabled={!category || loading}
            >
              {loading ? 'Submitting...' : 'Submit Complaint'}
            </GovButton>
          </div>
        </form>
      )}
    </div>
  );
}
