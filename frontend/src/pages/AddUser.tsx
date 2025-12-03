import React, { useState, useRef, useEffect } from 'react';
import { usePatientQueue, type PatientPriority } from '@/context/PatientQueueContext';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { Camera, Loader2, UserPlus, X, User, Calendar, Mail, Phone, MapPin, AlertTriangle, CreditCard } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from '@/components/ui/alert-dialog';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

type IdSide = 'front' | 'back';

export default function AddUser() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [age, setAge] = useState<number | undefined>(undefined);
  const [sex, setSex] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardNumberError, setCardNumberError] = useState('');
  const [emergencyContactName, setEmergencyContactName] = useState('');
  const [emergencyContactPhone, setEmergencyContactPhone] = useState('');
  const [isUrgent, setIsUrgent] = useState(false);

  const [frontIdImage, setFrontIdImage] = useState<string | null>(null);
  const [backIdImage, setBackIdImage] = useState<string | null>(null);
  
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [capturingSide, setCapturingSide] = useState<IdSide>('front');
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { toast } = useToast();
  const { addPatient } = usePatientQueue();
  const navigate = useNavigate();

  useEffect(() => {
    if (isCameraOpen) {
      const getCameraPermission = async () => {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
          setHasCameraPermission(true);
  
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
        } catch (error) {
          console.error('Error accessing camera:', error);
          setHasCameraPermission(false);
          setIsCameraOpen(false);
          toast({
            variant: 'destructive',
            title: 'Camera Access Denied',
            description: 'Please enable camera permissions in your browser settings.',
          });
        }
      };
      getCameraPermission();
    } else {
        if (videoRef.current && videoRef.current.srcObject) {
            const stream = videoRef.current.srcObject as MediaStream;
            stream.getTracks().forEach(track => track.stop());
            videoRef.current.srcObject = null;
        }
    }
  }, [isCameraOpen, toast]);

  const openCamera = (side: IdSide) => {
    setCapturingSide(side);
    setIsCameraOpen(true);
  }

  const handleCapture = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const context = canvas.getContext('2d');
      if (context) {
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUri = canvas.toDataURL('image/jpeg');
        if (capturingSide === 'front') {
          setFrontIdImage(dataUri);
        } else {
          setBackIdImage(dataUri);
        }
        setIsCameraOpen(false);
      }
    }
  };

  const handleExtractData = async () => {
    if (!frontIdImage && !backIdImage) {
        toast({
            variant: "destructive",
            title: "No Images",
            description: "Please scan at least one side of the ID card."
        });
        return;
    }
    setIsProcessing(true);
    try {
        const { extractUserData } = await import('@/lib/ai');
        const result = await extractUserData(frontIdImage || undefined, backIdImage || undefined);
        
        if(result.name) setName(result.name);
        if(result.email) setEmail(result.email);
        if(result.phone) setPhone(result.phone);
        if(result.address) setAddress(result.address);

        toast({
            title: 'Success!',
            description: 'Patient data extracted from ID.',
        });

    } catch (error) {
        console.error("Error extracting data: ", error)
        toast({
            variant: "destructive",
            title: "Extraction Failed",
            description: "Could not extract data from the ID. Please try again or enter manually."
        })
    } finally {
        setIsProcessing(false);
    }
  }

  const clearImage = (side: IdSide) => {
    if (side === 'front') setFrontIdImage(null);
    else setBackIdImage(null);
  }

  const IdImagePreview = ({ side, image, onClear }: { side: IdSide, image: string | null, onClear: (side: IdSide) => void }) => {
    if (!image) return null;
    return (
        <div className="relative">
            <img src={image} alt={`${side} of ID`} width={150} height={95} className="rounded-md object-cover"/>
            <Button variant="destructive" size="sm" className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0" onClick={() => onClear(side)}>
                <X size={14}/>
            </Button>
        </div>
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Enhanced validation
    if (!name || name.trim().length < 2) {
        toast({
            variant: "destructive",
            title: "Invalid Name",
            description: "Please enter a valid full name (at least 2 characters).",
        });
        return;
    }
    
    if (!age || age < 1 || age > 150) {
        toast({
            variant: "destructive",
            title: "Invalid Age",
            description: "Please enter a valid age between 1 and 150.",
        });
        return;
    }
    
    if (!sex) {
        toast({
            variant: "destructive",
            title: "Missing Information",
            description: "Please select the patient's sex.",
        });
        return;
    }

    // Validate emergency contact for minors
    if (age && age < 18) {
        if (!emergencyContactName || emergencyContactName.trim().length < 2) {
            toast({
                variant: "destructive",
                title: "Emergency Contact Required",
                description: "Emergency contact name is required for patients under 18 years old.",
            });
            return;
        }
        if (!emergencyContactPhone || emergencyContactPhone.trim().length < 10) {
            toast({
                variant: "destructive",
                title: "Emergency Contact Required",
                description: "Emergency contact phone number is required for patients under 18 years old.",
            });
            return;
        }
    }

    setIsSubmitting(true);
    
    try {
      // Validate name has at least first and last name
      const nameParts = name.trim().split(' ');
      if (nameParts.length < 2) {
        toast({
            variant: "destructive",
            title: "Incomplete Name",
            description: "Please enter both first and last name.",
        });
        return;
      }

      // Add patient to queue
      const patientData = {
        name: name.trim(),
        email: email.trim() || undefined,
        phone: phone.trim() || undefined,
        address: address.trim() || undefined,
        age,
        sex,
        card_number: cardNumber.trim() || undefined,
        emergency_contact_name: emergencyContactName.trim() || undefined,
        emergency_contact_phone: emergencyContactPhone.trim() || undefined,
        priority: (isUrgent ? 'Urgent' : 'Standard') as PatientPriority
      };
      
      await addPatient(patientData);
      
      toast({
          title: "✅ Patient Added Successfully",
          description: `${name.trim()} has been added to the waiting room queue and is ready for questioning.`,
      });

      // Clear the form
      setName('');
      setEmail('');
      setPhone('');
      setAddress('');
      setAge(undefined);
      setSex('');
      setCardNumber('');
      setCardNumberError('');
      setEmergencyContactName('');
      setEmergencyContactPhone('');
      setIsUrgent(false);
      setFrontIdImage(null);
      setBackIdImage(null);

      // Redirect to the queue page
      navigate('/reception/queue');
    } catch (error: any) {
      console.error('Error adding patient:', error);
      
      // Handle card number validation errors specifically
      if (error.message && error.message.includes('card number')) {
        setCardNumberError(error.message);
        toast({
          variant: "destructive",
          title: "❌ Card Number Error",
          description: error.message,
        });
      } else {
        toast({
          variant: "destructive",
          title: "❌ Failed to Add Patient",
          description: "There was an error adding the patient to the system. Please check all fields and try again.",
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-900 p-6">
      <main className="container mx-auto flex justify-center items-start pt-8">
        <Card className="w-full max-w-2xl mx-auto bg-slate-800 border border-slate-700">
          <CardHeader className="bg-slate-800 border-b border-slate-700">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <UserPlus className="w-6 h-6" />
              </div>
              <div>
                <CardTitle className="text-2xl font-bold text-white">Add New Patient</CardTitle>
                <CardDescription className="text-gray-400">
                  Scan an ID or enter patient details to add them to the questioning queue.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
        <CardContent className="p-8">
            <div className="space-y-6">
                <div className="bg-slate-700 rounded-xl p-6 border border-slate-600">
                  <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
                    <Camera className="h-5 w-5 text-blue-400" />
                    ID Scanning (Optional)
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <Button variant="outline" className="w-full h-12 border-2 border-dashed border-slate-500 hover:border-blue-500 hover:bg-slate-600 text-white transition-all duration-200" onClick={() => openCamera('front')}>
                          <Camera className="mr-2 h-5 w-5" /> Scan Front of ID
                      </Button>
                      <Button variant="outline" className="w-full h-12 border-2 border-dashed border-slate-500 hover:border-blue-500 hover:bg-slate-600 text-white transition-all duration-200" onClick={() => openCamera('back')}>
                          <Camera className="mr-2 h-5 w-5" /> Scan Back of ID
                      </Button>
                  </div>
                  <div className="flex justify-center gap-4 my-6 min-h-[100px]">
                      <IdImagePreview side="front" image={frontIdImage} onClear={clearImage} />
                      <IdImagePreview side="back" image={backIdImage} onClear={clearImage} />
                  </div>
                  {(frontIdImage || backIdImage) && (
                      <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white" onClick={handleExtractData} disabled={isProcessing}>
                          {isProcessing ? <><Loader2 className="mr-2 h-4 w-4 animate-spin"/> Processing...</> : 'Extract Data from ID'}
                      </Button>
                  )}
                </div>
            </div>

            <div className="relative my-8">
                <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t-2 border-gray-200" />
                </div>
                <div className="relative flex justify-center text-sm font-medium uppercase tracking-wide">
                    <span className="bg-slate-800 px-4 py-2 text-gray-400 rounded-full border border-slate-600">
                    Or enter manually
                    </span>
                </div>
            </div>
          
            <form className="space-y-6" onSubmit={handleSubmit}>
                <div className="space-y-3">
                    <Label htmlFor="name" className="text-sm font-semibold text-gray-300 flex items-center gap-2">
                      <User className="h-4 w-4" />
                      Full Name *
                    </Label>
                    <Input 
                      id="name" 
                      placeholder="Enter patient's first and last name" 
                      value={name} 
                      onChange={(e) => setName(e.target.value)} 
                      className="h-12 border-2 bg-slate-700 border-slate-600 text-white focus:border-blue-500 transition-all duration-200"
                      required 
                    />
                </div>
                <div className="space-y-3">
                    <Label htmlFor="cardNumber" className="text-sm font-semibold text-gray-300 flex items-center gap-2">
                      <CreditCard className="h-4 w-4" />
                      Card Number (Optional)
                    </Label>
                    <Input 
                      id="cardNumber" 
                      placeholder="Leave blank for auto-generation" 
                      value={cardNumber} 
                      onChange={(e) => {
                        setCardNumber(e.target.value);
                        setCardNumberError(''); // Clear error when user types
                      }} 
                      className={`h-12 border-2 bg-slate-700 text-white focus:border-blue-500 transition-all duration-200 ${
                        cardNumberError ? 'border-red-500' : 'border-slate-600'
                      }`}
                    />
                    {cardNumberError && (
                      <p className="text-sm text-red-400 mt-1 flex items-center gap-1">
                        <AlertTriangle className="h-4 w-4" />
                        {cardNumberError}
                      </p>
                    )}
                    <p className="text-xs text-gray-400 mt-1">
                      If left blank, a card number will be automatically generated (e.g., C-00001)
                    </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                        <Label htmlFor="age" className="text-sm font-semibold text-gray-300 flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          Age *
                        </Label>
                        <Input 
                          id="age" 
                          type="number" 
                          placeholder="e.g., 34" 
                          value={age || ''} 
                          onChange={(e) => setAge(parseInt(e.target.value, 10))} 
                          className="h-12 border-2 bg-slate-700 border-slate-600 text-white focus:border-blue-500 transition-all duration-200"
                          required 
                        />
                    </div>
                    <div className="space-y-3">
                        <Label htmlFor="sex" className="text-sm font-semibold text-gray-300 flex items-center gap-2">
                          <User className="h-4 w-4" />
                          Sex *
                        </Label>
                        <Select value={sex} onValueChange={setSex} required>
                            <SelectTrigger id="sex" className="h-12 border-2 bg-slate-700 border-slate-600 text-white focus:border-blue-500">
                                <SelectValue placeholder="Select sex" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Male">Male</SelectItem>
                                <SelectItem value="Female">Female</SelectItem>
                                <SelectItem value="Other">Other</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                      <Label htmlFor="email" className="text-sm font-semibold text-gray-300 flex items-center gap-2">
                        <Mail className="h-4 w-4" />
                        Email Address (Optional)
                      </Label>
                      <Input
                          id="email"
                          type="email"
                          placeholder="Enter patient's email"
                          value={email} 
                          onChange={(e) => setEmail(e.target.value)}
                          className="h-12 border-2 bg-slate-700 border-slate-600 text-white focus:border-blue-500 transition-all duration-200"
                      />
                  </div>
                  <div className="space-y-3">
                      <Label htmlFor="phone" className="text-sm font-semibold text-gray-300 flex items-center gap-2">
                        <Phone className="h-4 w-4" />
                        Phone Number (Optional)
                      </Label>
                      <Input 
                        id="phone" 
                        type="tel" 
                        placeholder="Enter patient's phone number" 
                        value={phone} 
                        onChange={(e) => setPhone(e.target.value)} 
                        className="h-12 border-2 bg-slate-700 border-slate-600 text-white focus:border-blue-500 transition-all duration-200"
                      />
                  </div>
                </div>
                <div className="space-y-3">
                    <Label htmlFor="address" className="text-sm font-semibold text-gray-300 flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      Address (Optional)
                    </Label>
                    <Input 
                      id="address" 
                      placeholder="Enter patient's address" 
                      value={address} 
                      onChange={(e) => setAddress(e.target.value)} 
                      className="h-12 border-2 bg-slate-700 border-slate-600 text-white focus:border-blue-500 transition-all duration-200"
                    />
                </div>

                {/* Emergency Contact Section */}
                <div className="space-y-4 bg-slate-800/50 rounded-xl p-4 border border-slate-600">
                  <h3 className="text-sm font-semibold text-gray-300 flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    Emergency Contact {age && age < 18 && <span className="text-red-400">*</span>}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <Label htmlFor="emergencyContactName" className="text-sm font-medium text-gray-300">
                        Contact Name {age && age < 18 && <span className="text-red-400">*</span>}
                      </Label>
                      <Input 
                        id="emergencyContactName" 
                        placeholder="Emergency contact full name" 
                        value={emergencyContactName} 
                        onChange={(e) => setEmergencyContactName(e.target.value)} 
                        className="h-12 border-2 bg-slate-700 border-slate-600 text-white focus:border-blue-500 transition-all duration-200"
                        required={age !== undefined && age < 18}
                      />
                    </div>
                    <div className="space-y-3">
                      <Label htmlFor="emergencyContactPhone" className="text-sm font-medium text-gray-300">
                        Contact Phone {age && age < 18 && <span className="text-red-400">*</span>}
                      </Label>
                      <Input 
                        id="emergencyContactPhone" 
                        type="tel"
                        placeholder="Emergency contact phone number" 
                        value={emergencyContactPhone} 
                        onChange={(e) => setEmergencyContactPhone(e.target.value)} 
                        className="h-12 border-2 bg-slate-700 border-slate-600 text-white focus:border-blue-500 transition-all duration-200"
                        required={age !== undefined && age < 18}
                      />
                    </div>
                  </div>
                  {age && age < 18 && (
                    <p className="text-xs text-yellow-400 mt-2">
                      Emergency contact information is required for patients under 18 years old.
                    </p>
                  )}
                </div>

                <div className="bg-red-900/20 border-2 border-red-700 rounded-xl p-4">
                  <div className="flex items-center space-x-3">
                      <Checkbox 
                        id="urgent" 
                        checked={isUrgent} 
                        onCheckedChange={(checked) => setIsUrgent(checked as boolean)}
                        className="border-2 border-red-400 data-[state=checked]:bg-red-500 data-[state=checked]:border-red-500 bg-slate-700"
                      />
                      <label
                          htmlFor="urgent"
                          className="text-sm font-semibold leading-none text-red-300 peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer flex items-center gap-2"
                      >
                          <AlertTriangle className="h-4 w-4" />
                          Mark as URGENT PRIORITY
                      </label>
                  </div>
                  <p className="text-xs text-red-400 mt-2 ml-7">Check this box for patients requiring immediate attention</p>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-4 pt-6">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => navigate('/reception/queue')}
                    className="flex-1 h-12 border-2 border-slate-600 bg-slate-700 text-white hover:bg-slate-600 transition-all duration-200"
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    className="flex-1 h-12 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105" 
                    disabled={isSubmitting}
                  >
                      {isSubmitting ? (
                        <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Adding Patient...</>
                      ) : (
                        <><UserPlus className="mr-2 h-5 w-5" /> Create Patient Account</>
                      )}
                  </Button>
                </div>
            </form>
        </CardContent>
        </Card>
      </main>

      <AlertDialog open={isCameraOpen} onOpenChange={setIsCameraOpen}>
        <AlertDialogContent className="max-w-2xl w-[90vw] md:w-full">
          <AlertDialogHeader>
            <AlertDialogTitle>Scan {capturingSide === 'front' ? 'Front' : 'Back'} of National ID</AlertDialogTitle>
          </AlertDialogHeader>
          <div className="relative">
            <video ref={videoRef} className="w-full aspect-video rounded-md" autoPlay muted playsInline />
            <canvas ref={canvasRef} className="hidden" />
            
            {hasCameraPermission === false && (
                <Alert variant="destructive">
                    <AlertTitle>Camera Access Required</AlertTitle>
                    <AlertDescription>
                        Please allow camera access to use this feature. You may need to change permissions in your browser settings.
                    </AlertDescription>
                </Alert>
            )}
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleCapture} disabled={hasCameraPermission !== true}>
              Capture
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}