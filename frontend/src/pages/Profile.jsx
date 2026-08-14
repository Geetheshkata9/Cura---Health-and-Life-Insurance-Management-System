import React, { useState, useContext, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { Shield, ArrowLeft, Save, User as UserIcon, Mail, Phone, MapPin, Camera } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '../components/ThemeToggle';

const Profile = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);

  const defaultAvatar = `https://ui-avatars.com/api/?background=6366f1&color=fff&size=128&name=${encodeURIComponent(user?.name || 'User')}`;

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setPhone(user.phone || '');
      setAddress(user.address || '');
    }
  }, [user]);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    try {
      const res = await api.put('/auth/profile', { name, phone, address });
      // Update the local storage user data
      const updated = { ...user, name: res.data.name, phone: res.data.phone, address: res.data.address };
      localStorage.setItem('user', JSON.stringify(updated));
      setMessage({ type: 'success', text: 'Profile updated successfully!' });
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to update profile.' });
    } finally {
      setSaving(false);
    }
  };

  const dashboardPath = user?.role === 'customer' ? '/customer/dashboard' : '/admin/dashboard';

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans">
      {/* Header */}
      <header className="bg-card border-b border-border sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <span className="bg-primary text-primary-foreground p-1.5 rounded-lg shadow-sm">
              <Shield size={18} />
            </span>
            <span className="text-xl font-black text-foreground tracking-tight">Cura</span>
            <span className="bg-primary/10 text-primary text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider">
              Profile
            </span>
          </div>
          <div className="flex items-center space-x-3">
            <ThemeToggle />
            <Link to={dashboardPath}>
              <Button variant="outline" size="sm" className="text-xs font-semibold">
                <ArrowLeft size={13} className="mr-1.5" />
                Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-3xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        {/* Profile Header Card */}
        <div className="bg-gradient-to-r from-primary to-blue-600 rounded-3xl p-8 sm:p-10 text-white shadow-lg flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-6">
          <div className="relative group">
            <img
              src={user?.image || defaultAvatar}
              alt={user?.name}
              className="w-24 h-24 rounded-2xl object-cover border-4 border-white/30 shadow-lg"
            />
            <div className="absolute inset-0 bg-black/30 rounded-2xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
              <Camera size={20} className="text-white" />
            </div>
          </div>
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight">{user?.name}</h1>
            <p className="text-primary-foreground/80 text-xs mt-1">{user?.email}</p>
            <span className="inline-block mt-2 text-[10px] uppercase font-bold tracking-wider bg-white/20 px-3 py-0.5 rounded-full">
              {user?.role}
            </span>
          </div>
        </div>

        {/* Edit Form */}
        <Card className="border border-border shadow-sm bg-card rounded-3xl">
          <CardContent className="p-6 sm:p-8 space-y-6">
            <h2 className="text-lg font-bold text-foreground border-b border-border pb-4">Edit Profile</h2>

            {message && (
              <div className={`p-4 rounded-xl text-center text-xs font-semibold border ${
                message.type === 'success' ? 'bg-green-50 border-green-100 text-green-700 dark:bg-green-950/20 dark:border-green-900 dark:text-green-400' : 'bg-red-50 border-red-100 text-red-700 dark:bg-red-950/20 dark:border-red-900 dark:text-red-400'
              }`}>
                {message.text}
              </div>
            )}

            <form onSubmit={handleSave} className="space-y-5">
              {/* Email (read-only) */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                  <Mail size={13} /> Email
                </label>
                <input
                  type="email"
                  value={user?.email || ''}
                  disabled
                  className="w-full px-4 py-2.5 bg-muted/50 border border-border rounded-xl text-sm text-muted-foreground cursor-not-allowed"
                />
              </div>

              {/* Name */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                  <UserIcon size={13} /> Full Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-2.5 bg-background border border-border rounded-xl text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                  placeholder="Your full name"
                />
              </div>

              {/* Phone */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                  <Phone size={13} /> Phone Number
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-4 py-2.5 bg-background border border-border rounded-xl text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                  placeholder="Your phone number"
                />
              </div>

              {/* Address */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                  <MapPin size={13} /> Address
                </label>
                <textarea
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-2.5 bg-background border border-border rounded-xl text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all resize-none"
                  placeholder="Your address"
                />
              </div>

              <Button
                type="submit"
                disabled={saving}
                className="w-full font-bold py-5 text-xs transition-colors shadow-sm"
              >
                {saving ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="animate-spin rounded-full h-3.5 w-3.5 border-t-2 border-b-2 border-primary-foreground"></div>
                    Saving...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <Save size={14} />
                    Save Changes
                  </span>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Profile;
