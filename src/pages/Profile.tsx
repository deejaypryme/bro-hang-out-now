
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { profileService } from '@/services/database';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import TimezoneSelector from '@/components/TimezoneSelector';
import Header from '@/components/Header';
import { toast } from 'sonner';
import { User, Mail, Phone, Globe, Camera } from 'lucide-react';

const Profile = () => {
  const { user, profile, refreshProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [phone, setPhone] = useState('');
  const [timezone, setTimezone] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');

  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name || '');
      setUsername(profile.username || '');
      setPhone(profile.phone || '');
      setTimezone(profile.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone);
      setAvatarUrl(profile.avatar_url || '');
    }
  }, [profile]);

  const getUserInitials = () => {
    if (fullName) {
      return fullName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    }
    return user?.email?.[0].toUpperCase() || 'U';
  };

  const handleSave = async () => {
    if (!user) return;
    setLoading(true);
    try {
      await profileService.updateProfile(user.id, {
        full_name: fullName || null,
        username: username || null,
        phone: phone || null,
        timezone: timezone || null,
        avatar_url: avatarUrl || null,
      });
      await refreshProfile();
      toast.success('Profile updated!');
    } catch (error: any) {
      toast.error(error.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const userStats = {
    broPoints: 0,
    currentStreak: 0,
  };

  return (
    <div className="min-h-screen hero-background">
      <Header userStats={userStats} />
      <main className="max-w-2xl mx-auto py-bro-2xl px-bro-lg">
        <Card variant="glass" className="shadow-2xl border-white/20">
          <CardHeader className="text-center pb-bro-lg">
            <div className="flex justify-center mb-bro-lg">
              <Avatar className="h-24 w-24 border-4 border-white/30 shadow-xl">
                <AvatarImage src={avatarUrl} />
                <AvatarFallback className="bg-gradient-to-r from-accent-orange to-accent-light text-white text-2xl font-bold">
                  {getUserInitials()}
                </AvatarFallback>
              </Avatar>
            </div>
            <CardTitle className="typo-headline-lg text-primary-navy">Profile Settings</CardTitle>
            <p className="typo-body text-brand-secondary mt-bro-xs">Customize your profile</p>
          </CardHeader>
          <CardContent className="space-y-bro-xl">
            <div className="space-y-bro-sm">
              <Label htmlFor="fullName" className="typo-body font-semibold text-primary-navy flex items-center gap-bro-sm">
                <User className="w-4 h-4" /> Full Name
              </Label>
              <Input
                id="fullName"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Your full name"
                className="h-12 text-base border-primary-navy/20 focus:border-accent-orange focus:ring-accent-orange/20 bg-white/80 backdrop-blur-sm"
              />
            </div>

            <div className="space-y-bro-sm">
              <Label htmlFor="username" className="typo-body font-semibold text-primary-navy flex items-center gap-bro-sm">
                <Mail className="w-4 h-4" /> Username
              </Label>
              <Input
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                placeholder="your_username"
                className="h-12 text-base border-primary-navy/20 focus:border-accent-orange focus:ring-accent-orange/20 bg-white/80 backdrop-blur-sm"
              />
              <p className="typo-mono text-brand-muted text-xs">Letters, numbers, and underscores only</p>
            </div>

            <div className="space-y-bro-sm">
              <Label htmlFor="phone" className="typo-body font-semibold text-primary-navy flex items-center gap-bro-sm">
                <Phone className="w-4 h-4" /> Phone
              </Label>
              <Input
                id="phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+1 (555) 123-4567"
                className="h-12 text-base border-primary-navy/20 focus:border-accent-orange focus:ring-accent-orange/20 bg-white/80 backdrop-blur-sm"
              />
            </div>

            <div className="space-y-bro-sm">
              <Label className="typo-body font-semibold text-primary-navy flex items-center gap-bro-sm">
                <Globe className="w-4 h-4" /> Timezone
              </Label>
              <TimezoneSelector value={timezone} onChange={setTimezone} />
            </div>

            <div className="space-y-bro-sm">
              <Label htmlFor="avatarUrl" className="typo-body font-semibold text-primary-navy flex items-center gap-bro-sm">
                <Camera className="w-4 h-4" /> Avatar URL
              </Label>
              <Input
                id="avatarUrl"
                value={avatarUrl}
                onChange={(e) => setAvatarUrl(e.target.value)}
                placeholder="https://example.com/avatar.jpg"
                className="h-12 text-base border-primary-navy/20 focus:border-accent-orange focus:ring-accent-orange/20 bg-white/80 backdrop-blur-sm"
              />
            </div>

            <div className="pt-bro-md">
              <Button
                onClick={handleSave}
                disabled={loading}
                variant="primary"
                size="lg"
                className="w-full"
              >
                {loading ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>

            <div className="text-center pt-bro-sm">
              <p className="typo-mono text-brand-muted text-xs">
                Member since {profile?.created_at ? new Date(profile.created_at).toLocaleDateString() : '...'}
              </p>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Profile;
