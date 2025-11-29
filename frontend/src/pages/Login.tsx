import React, { useState, useEffect } from 'react';
import { useAuth } from '@/components/AuthProvider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Stethoscope, Shield, User, TestTube, UserCheck, Loader2, Heart } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export default function Login() {
  useEffect(() => {
    document.body.classList.add('login-page');
    return () => document.body.classList.remove('login-page');
  }, []);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await login(username, password);
      navigate('/reception/queue');
    } catch (err) {
      setError('Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const demoCredentials = [
    { role: 'Receptionist', username: 'reception', password: 'reception123', icon: <UserCheck className="h-4 w-4" />, color: 'bg-blue-500' },
    { role: 'Doctor', username: 'doctor', password: 'doctor123', icon: <Stethoscope className="h-4 w-4" />, color: 'bg-green-500' },
    { role: 'Triage', username: 'triage', password: 'triage123', icon: <User className="h-4 w-4" />, color: 'bg-teal-500' },
    { role: 'Laboratory', username: 'laboratory', password: 'laboratory123', icon: <TestTube className="h-4 w-4" />, color: 'bg-purple-500' },
    { role: 'Nurse', username: 'nurse', password: 'nurse123', icon: <Heart className="h-4 w-4" />, color: 'bg-pink-500' },
    { role: 'Admin', username: 'admin', password: 'admin123', icon: <Shield className="h-4 w-4" />, color: 'bg-red-500' },
  ];

  const handleDemoLogin = (demoUsername: string, demoPassword: string) => {
    setUsername(demoUsername);
    setPassword(demoPassword);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-8 items-center">
        
        {/* Left side - Branding */}
        <div className="hidden lg:flex flex-col items-center justify-center space-y-8 p-8">
          <div className="text-center space-y-6">
            <div className="flex items-center justify-center space-x-3">
              <div className="p-4 bg-gradient-to-br from-blue-500 to-green-500 rounded-2xl shadow-lg">
                <Heart className="h-12 w-12 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
                  Menaharia
                </h1>
                <p className="text-xl text-muted-foreground font-medium">Medium Clinic</p>
              </div>
            </div>
            
            <div className="space-y-4 text-center max-w-md">
              <h2 className="text-2xl font-semibold text-foreground">
                Modern Healthcare Management
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                Streamline your clinic operations with our comprehensive patient management system. 
                From queue management to prescriptions, everything in one place.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 max-w-sm">
              <div className="bg-card rounded-lg p-4 border shadow-sm">
                <div className="text-2xl font-bold text-blue-600">24/7</div>
                <div className="text-sm text-muted-foreground">System Uptime</div>
              </div>
              <div className="bg-card rounded-lg p-4 border shadow-sm">
                <div className="text-2xl font-bold text-green-600">100%</div>
                <div className="text-sm text-muted-foreground">Data Security</div>
              </div>
            </div>
          </div>
        </div>

        {/* Right side - Login Form */}
        <div className="flex items-center justify-center">
          <Card className="w-full max-w-md shadow-2xl border-0 bg-card/80 backdrop-blur-sm">
            <CardHeader className="space-y-4 pb-6">
              <div className="flex lg:hidden items-center justify-center space-x-3 mb-4">
                <div className="p-3 bg-gradient-to-br from-blue-500 to-green-500 rounded-xl shadow-lg">
                  <Heart className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
                    Menaharia
                  </h1>
                  <p className="text-sm text-muted-foreground">Medium Clinic</p>
                </div>
              </div>
              
              <div className="text-center space-y-2">
                <CardTitle className="text-2xl font-bold">Welcome Back</CardTitle>
                <p className="text-muted-foreground">Sign in to access the clinic management system</p>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-6">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="username" className="text-sm font-medium">Username</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="username"
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="pl-10 h-11 transition-all duration-200 focus:ring-2 focus:ring-primary/20"
                      placeholder="Enter your username"
                      required
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-medium">Password</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pr-10 h-11 transition-all duration-200 focus:ring-2 focus:ring-primary/20"
                      placeholder="Enter your password"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
                
                {error && (
                  <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
                    <p className="text-red-600 dark:text-red-400 text-sm font-medium">{error}</p>
                  </div>
                )}
                
                <Button 
                  type="submit" 
                  className="w-full h-11 bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 transition-all duration-200 shadow-lg hover:shadow-xl" 
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Signing in...
                    </>
                  ) : (
                    'Sign In'
                  )}
                </Button>
              </form>
              
              {/* Demo Credentials */}
              <div className="space-y-4">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-card px-2 text-muted-foreground">Demo Accounts</span>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-2">
                  {demoCredentials.map((cred) => (
                    <button
                      key={cred.role}
                      type="button"
                      onClick={() => handleDemoLogin(cred.username, cred.password)}
                      className="group p-3 bg-muted/50 hover:bg-muted rounded-lg border transition-all duration-200 hover:shadow-md hover:scale-105"
                    >
                      <div className="flex items-center space-x-2">
                        <div className={`p-1.5 rounded-md ${cred.color} text-white group-hover:scale-110 transition-transform`}>
                          {cred.icon}
                        </div>
                        <div className="text-left">
                          <div className="text-xs font-medium text-foreground">{cred.role}</div>
                          <div className="text-xs text-muted-foreground">{cred.username}</div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
                
                <div className="text-center">
                  <p className="text-xs text-muted-foreground">
                    Click on any demo account to auto-fill credentials
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}