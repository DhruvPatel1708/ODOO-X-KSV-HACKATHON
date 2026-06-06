import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { User, Mail, Shield, Phone, Building2, MapPin, Camera, Save, CheckCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';

export default function Profile() {
  const { user } = useAuth();
  const toast = useToast();
  const [avatarPreview, setAvatarPreview] = useState(user?.avatar || null);
  const [saving, setSaving] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: {
      name: user?.name || '',
      email: user?.email || '',
      phone: user?.phone || '+91 9876543210',
      company: user?.company || 'VendorBridge Enterprises Pvt. Ltd.',
      department: user?.department || 'Procurement',
      location: user?.location || 'Mumbai, Maharashtra',
      bio: user?.bio || 'Experienced procurement professional specializing in vendor management and supply chain optimization.',
    }
  });

  const initials = user?.name
    ? user.name.split(' ').map(n => n[0]).join('').toUpperCase()
    : 'U';

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = async (data) => {
    setSaving(true);
    // Simulate save
    await new Promise(resolve => setTimeout(resolve, 1000));
    setSaving(false);
    toast.success('Profile updated successfully');
  };

  const roleLabel = {
    admin: 'Administrator',
    procurement_officer: 'Procurement Officer',
    manager: 'Manager / Approver',
    vendor: 'Vendor',
  };

  const roleBadgeColor = {
    admin: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
    procurement_officer: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    manager: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
    vendor: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="page-title">Profile</h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Manage your personal information</p>
      </div>

      {/* Profile Header Card */}
      <div className="glass-card rounded-2xl p-8">
        <div className="flex flex-col sm:flex-row items-center gap-6">
          {/* Avatar */}
          <div className="relative group">
            {avatarPreview ? (
              <img
                src={avatarPreview}
                alt={user?.name}
                className="w-28 h-28 rounded-2xl object-cover ring-4 ring-brand-500/20 shadow-lg"
              />
            ) : (
              <div className="w-28 h-28 rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center text-white text-3xl font-bold shadow-lg">
                {initials}
              </div>
            )}
            <label className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-2xl opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity duration-200">
              <Camera className="w-6 h-6 text-white" />
              <input type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
            </label>
          </div>

          {/* Info */}
          <div className="text-center sm:text-left flex-1">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{user?.name}</h2>
            <p className="text-gray-500 dark:text-gray-400 text-sm mt-0.5">{user?.email}</p>
            <div className="flex items-center gap-2 mt-3 justify-center sm:justify-start">
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${roleBadgeColor[user?.role] || roleBadgeColor.admin}`}>
                <Shield className="w-3 h-3" />
                {roleLabel[user?.role] || user?.role}
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
                <CheckCircle className="w-3 h-3" /> Active
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="glass-card rounded-2xl p-8">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Personal Information</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="label flex items-center gap-1.5">
              <User className="w-3.5 h-3.5" /> Full Name
            </label>
            <input
              {...register('name', { required: 'Name is required' })}
              className="input"
              placeholder="Your full name"
            />
            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
          </div>

          <div>
            <label className="label flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5" /> Email
            </label>
            <input
              {...register('email')}
              type="email"
              className="input opacity-60 cursor-not-allowed"
              disabled
            />
            <p className="text-xs text-gray-400 mt-1">Email cannot be changed</p>
          </div>

          <div>
            <label className="label flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5" /> Phone
            </label>
            <input
              {...register('phone')}
              className="input"
              placeholder="+91 9876543210"
            />
          </div>

          <div>
            <label className="label flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5" /> Company
            </label>
            <input
              {...register('company')}
              className="input"
              placeholder="Company name"
            />
          </div>

          <div>
            <label className="label flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5" /> Department
            </label>
            <input
              {...register('department')}
              className="input"
              placeholder="Department"
            />
          </div>

          <div>
            <label className="label flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5" /> Location
            </label>
            <input
              {...register('location')}
              className="input"
              placeholder="City, State"
            />
          </div>

          <div className="md:col-span-2">
            <label className="label">Bio</label>
            <textarea
              {...register('bio')}
              rows={3}
              className="input resize-none"
              placeholder="A brief description about yourself..."
            />
          </div>
        </div>

        <div className="flex justify-end mt-6 pt-4 border-t border-surface-border dark:border-dark-border">
          <button type="submit" disabled={saving} className="btn-primary flex items-center gap-2">
            {saving ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
}
