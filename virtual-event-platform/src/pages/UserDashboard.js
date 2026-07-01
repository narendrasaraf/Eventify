import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { User, Phone, Mail, ShieldAlert, Sparkles, Loader2 } from 'lucide-react';
import PageHeader from '../components/PageHeader';
import { toast } from 'react-toastify';

const UserDashboard = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({ name: '', phoneNumber: '' });
  const [isSaving, setIsSaving] = useState(false);
  const [pwdForm, setPwdForm] = useState({ currentPassword: '', newPassword: '' });
  const [isUpdatingPwd, setIsUpdatingPwd] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const response = await axios.get('http://localhost:5000/api/v1/users/me', { withCredentials: true });
      const userData = response.data.data.user;
      setUser(userData);
      setEditForm({
        name: userData.name || '',
        phoneNumber: userData.phoneNumber || ''
      });
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast.error('Failed to authenticate session.');
      navigate('/login');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!editForm.name.trim()) {
      toast.warning('Name cannot be empty.');
      return;
    }

    setIsSaving(true);
    try {
      const response = await axios.patch('http://localhost:5000/api/v1/users/me', editForm, { withCredentials: true });
      const updatedUser = response.data.data.user;
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setIsEditing(false);
      toast.success('Profile settings updated successfully!');
    } catch (error) {
      console.error('Update failed:', error);
      toast.error(error.response?.data?.message || 'Failed to update profile settings.');
    } finally {
      setIsSaving(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (pwdForm.newPassword.length < 6) {
      toast.warning('New password must be at least 6 characters.');
      return;
    }

    setIsUpdatingPwd(true);
    try {
      await axios.patch('http://localhost:5000/api/v1/auth/change-password', pwdForm, { withCredentials: true });
      toast.success('Password updated successfully!');
      setPwdForm({ currentPassword: '', newPassword: '' });
    } catch (error) {
      console.error('Password change failed:', error);
      toast.error(error.response?.data?.message || 'Failed to update security password.');
    } finally {
      setIsUpdatingPwd(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-4">
        <Loader2 className="h-10 w-10 text-indigo-500 animate-spin" />
        <p className="text-slate-400 animate-pulse font-medium">Retrieving profile settings...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-8 w-full space-y-8">

      <PageHeader
        title="Profile Settings"
        subtitle="Manage your personal details, operational settings, and secure authentication preferences."
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left Card: Avatar & Summary */}
        <div className="bg-slate-900/40 border border-slate-800 p-8 rounded-3xl text-center flex flex-col items-center justify-center relative">
          <div className="absolute top-4 right-4 bg-slate-950 border border-slate-800 px-3 py-1 rounded-full flex items-center gap-1 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            {user?.role || 'user'}
          </div>

          <div className="w-24 h-24 rounded-full bg-slate-800 p-1 mb-4">
            <div className="w-full h-full rounded-full bg-slate-950 flex items-center justify-center overflow-hidden">
              {user?.profilePicture ? (
                <img src={user.profilePicture} alt={user.name} className="w-full h-full object-cover" />
              ) : (
                <User className="h-10 w-10 text-slate-400" />
              )}
            </div>
          </div>

          <h3 className="text-xl font-bold text-white mb-1">{user?.name}</h3>
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-widest">{user?.authProvider} provider</span>
        </div>

        {/* Right Card: Details Form */}
        <div className="bg-slate-900/40 backdrop-blur-xl border border-slate-800/80 p-8 rounded-3xl md:col-span-2">
          <div className="flex justify-between items-center mb-6">
            <h4 className="text-lg font-bold text-white">Personal Profile</h4>
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="text-xs font-bold text-indigo-400 hover:text-indigo-300 transition-colors"
            >
              {isEditing ? 'Cancel Edit' : 'Edit Details'}
            </button>
          </div>

          {isEditing ? (
            <form onSubmit={handleUpdate} className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                  <input
                    type="text"
                    required
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-11 pr-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-white font-medium"
                    value={editForm.name}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Phone Number</label>
                <div className="relative">
                  <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                  <input
                    type="text"
                    placeholder="Enter phone number"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-11 pr-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-white font-medium"
                    value={editForm.phoneNumber}
                    onChange={(e) => setEditForm({ ...editForm, phoneNumber: e.target.value })}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSaving}
                className="bg-indigo-600 hover:bg-indigo-500 text-white w-full py-4 rounded-xl text-sm font-black transition-all hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/10"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" /> Saving Changes...
                  </>
                ) : (
                  'Save Profile Details'
                )}
              </button>
            </form>
          ) : (
            <div className="space-y-6">
              <div className="flex items-center gap-4 bg-slate-950/40 p-4 rounded-xl border border-slate-800">
                <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                  <User className="h-4 w-4 text-slate-400" />
                </div>
                <div>
                  <div className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Account Name</div>
                  <div className="text-sm font-bold text-white mt-0.5">{user?.name}</div>
                </div>
              </div>

              <div className="flex items-center gap-4 bg-slate-950/40 p-4 rounded-xl border border-slate-800">
                <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                  <Mail className="h-4 w-4 text-slate-400" />
                </div>
                <div>
                  <div className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Email Address</div>
                  <div className="text-sm font-bold text-white mt-0.5">{user?.email}</div>
                </div>
              </div>

              <div className="flex items-center gap-4 bg-slate-950/40 p-4 rounded-xl border border-slate-800">
                <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                  <Phone className="h-4 w-4 text-slate-400" />
                </div>
                <div>
                  <div className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Phone Link</div>
                  <div className="text-sm font-bold text-white mt-0.5">{user?.phoneNumber || 'Not Linked'}</div>
                </div>
              </div>

              <div className="bg-slate-950/20 border border-slate-900 p-4 rounded-xl flex items-center gap-3 text-xs text-slate-500 font-semibold leading-relaxed">
                <ShieldAlert className="h-5 w-5 text-indigo-400/80 shrink-0" />
                <span>To modify email addresses or password credentials, please contact support or proceed to Google Identity Settings page.</span>
              </div>
            </div>
          )}
        </div>

        {/* Bottom Card: Security Settings / Password Update */}
        <div className="bg-slate-900/40 backdrop-blur-xl border border-slate-800/80 p-8 rounded-3xl md:col-span-3">
          <h4 className="text-lg font-bold text-white mb-6">Security Settings</h4>
          <form onSubmit={handlePasswordChange} className="max-w-xl space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Current Password</label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-white font-medium"
                  value={pwdForm.currentPassword}
                  onChange={(e) => setPwdForm({ ...pwdForm, currentPassword: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">New Password</label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-white font-medium"
                  value={pwdForm.newPassword}
                  onChange={(e) => setPwdForm({ ...pwdForm, newPassword: e.target.value })}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isUpdatingPwd}
              className="btn-secondary btn-md transition-all hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2"
            >
              {isUpdatingPwd ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Updating...
                </>
              ) : (
                'Update Password Credentials'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;
