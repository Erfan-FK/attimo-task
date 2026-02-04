'use client';

import { useState, useEffect } from 'react';
import { AppShell } from '@/components/app-shell/app-shell';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { CustomSelect, CustomSelectTrigger, CustomSelectContent, CustomSelectItem, CustomSelectValue } from '@/components/ui/custom-select';
import { toast } from 'sonner';
import { useTheme } from 'next-themes';
import { supabase } from '@/lib/supabase/client';
import { Loader2, Sun, Moon, Monitor } from 'lucide-react';

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  useEffect(() => {
    setMounted(true);
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setEmail(user.email || '');
        
        // Fetch profile from backend
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/api/profile`, {
            headers: {
              'Authorization': `Bearer ${session.access_token}`,
            },
          });
          
          if (response.ok) {
            const data = await response.json();
            setFullName(data.data.profile.full_name || '');
          }
        }
      }
    } catch (error) {
      console.error('Failed to load profile:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast.error('Not authenticated');
        return;
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/api/profile`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ full_name: fullName }),
      });

      if (response.ok) {
        toast.success('Profile updated successfully!');
      } else {
        const data = await response.json();
        toast.error(data.message || 'Failed to update profile');
      }
    } catch (error) {
      toast.error('Failed to save changes');
    } finally {
      setIsSaving(false);
    }
  };

  const handleChangePassword = async () => {
    try {
      // Validate passwords
      if (!newPassword || newPassword.length < 6) {
        toast.error('New password must be at least 6 characters');
        return;
      }

      if (newPassword !== confirmPassword) {
        toast.error('Passwords do not match');
        return;
      }

      setIsChangingPassword(true);

      // Update password using Supabase
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) {
        toast.error(error.message || 'Failed to change password');
        return;
      }

      toast.success('Password changed successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error) {
      toast.error('Failed to change password');
    } finally {
      setIsChangingPassword(false);
    }
  };

  return (
    <AppShell title="Settings">
      <div className="h-full grid grid-cols-1 md:grid-cols-2 grid-rows-4 md:grid-rows-2 gap-4 p-2">
        {/* Profile Card - Row 1, Col 1 */}
        <Card className="flex flex-col min-h-0">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Profile</CardTitle>
            <CardDescription className="text-xs">Manage your account information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 flex-1">
            {isLoading ? (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="h-5 w-5 animate-spin text-muted" />
              </div>
            ) : (
              <>
                <div className="space-y-1">
                  <label htmlFor="name" className="text-xs font-medium">
                    Full Name
                  </label>
                  <Input 
                    id="name" 
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Enter your full name"
                    className="h-8 text-sm"
                  />
                </div>
                <div className="space-y-1">
                  <label htmlFor="email" className="text-xs font-medium">
                    Email
                  </label>
                  <Input 
                    id="email" 
                    type="email" 
                    value={email}
                    disabled
                    className="bg-surface2 cursor-not-allowed h-8 text-sm"
                  />
                </div>
                <Button onClick={handleSave} disabled={isSaving} size="sm" className="w-full mt-2">
                  {isSaving ? (
                    <>
                      <Loader2 className="h-3 w-3 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    'Save Changes'
                  )}
                </Button>
              </>
            )}
          </CardContent>
        </Card>

        {/* Appearance Card - Row 1, Col 2 */}
        <Card className="flex flex-col min-h-0">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Appearance</CardTitle>
            <CardDescription className="text-xs">Customize how the app looks</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 flex-1 flex flex-col justify-center">
            <div className="space-y-2">
              <label className="text-sm font-medium">Theme</label>
              {mounted && (
                <CustomSelect value={theme} onValueChange={setTheme}>
                  <CustomSelectTrigger className="h-10">
                    <CustomSelectValue />
                  </CustomSelectTrigger>
                  <CustomSelectContent>
                    <CustomSelectItem value="light">
                      <div className="flex items-center gap-2">
                        <Sun className="h-5 w-5" />
                        <span>Light</span>
                      </div>
                    </CustomSelectItem>
                    <CustomSelectItem value="dark">
                      <div className="flex items-center gap-2">
                        <Moon className="h-5 w-5" />
                        <span>Dark</span>
                      </div>
                    </CustomSelectItem>
                    <CustomSelectItem value="system">
                      <div className="flex items-center gap-2">
                        <Monitor className="h-5 w-5" />
                        <span>System</span>
                      </div>
                    </CustomSelectItem>
                  </CustomSelectContent>
                </CustomSelect>
              )}
              <p className="text-xs text-muted mt-2">
                Choose your preferred color scheme. The theme will be applied across the entire application.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Change Password Card - Row 2, Col 1 */}
        <Card className="flex flex-col min-h-0">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Change Password</CardTitle>
            <CardDescription className="text-xs">Update your account password</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 flex-1">
            <div className="space-y-1">
              <label htmlFor="new-password" className="text-xs font-medium">
                New Password
              </label>
              <Input
                id="new-password"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password"
                className="h-8 text-sm"
              />
            </div>
            <div className="space-y-1">
              <label htmlFor="confirm-password" className="text-xs font-medium">
                Confirm Password
              </label>
              <Input
                id="confirm-password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
                className="h-8 text-sm"
              />
            </div>
            <Button onClick={handleChangePassword} disabled={isChangingPassword} size="sm" className="w-full mt-2">
              {isChangingPassword ? (
                <>
                  <Loader2 className="h-3 w-3 mr-2 animate-spin" />
                  Changing...
                </>
              ) : (
                'Change Password'
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Danger Zone Card - Row 2, Col 2 */}
        <Card className="border-error flex flex-col min-h-0">
          <CardHeader className="pb-3">
            <CardTitle className="text-error text-base">Danger Zone</CardTitle>
            <CardDescription className="text-xs">Irreversible actions</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col justify-center space-y-3">
            <div className="space-y-2">
              <p className="text-sm font-medium">Delete Account</p>
              <p className="text-xs text-muted">
                Once you delete your account, there is no going back. All your data including notes, tasks, and AI history will be permanently removed.
              </p>
            </div>
            <Button variant="destructive" size="sm" className="w-full">Delete Account</Button>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
