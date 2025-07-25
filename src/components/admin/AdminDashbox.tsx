'use client'
import { useState, useRef, ChangeEvent, useEffect } from 'react';
import { LuPenLine, LuSquarePen, LuLogOut, LuSave, LuLoaderCircle } from 'react-icons/lu';
import { createClient } from '@/lib/supabase/client';
import Styles from "@/app/admin/admin.module.css";

interface AdminDashboxProps {
  scale?: boolean;
  adminId?: string;
  onLogout?: () => void;
  userDashbox: boolean;
  setUserDashbox: React.Dispatch<React.SetStateAction<boolean>>;
  adminAvatarUrl: string;
  setAdminAvatarUrl: React.Dispatch<React.SetStateAction<string>>;
}
interface AdminData {
  id: string;
  email: string;
  name: string;
  username?: string;
  github_url?: string;
  linkedin_url?: string;
  avatar_url?: string;
  role: string;
}
interface AdminFormData {
  username: string;
  github_url: string;
  linkedin_url: string;
  avatar_url: string;
}
const AdminDashbox: React.FC<AdminDashboxProps> = ({ 
  scale = false, 
  adminId,
  userDashbox,
  setUserDashbox,
  adminAvatarUrl,
  setAdminAvatarUrl,
  onLogout 
}) => {
  const [admin, setAdmin] = useState<AdminData | null>(null);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [uploading, setUploading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [formData, setFormData] = useState<AdminFormData>({
    username: '',
    github_url: '',
    linkedin_url: '',
    avatar_url: ''
  });
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const supabase = createClient();
  const dashboxRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dashboxRef.current &&
        !dashboxRef.current.contains(event.target as Node)
      ) {
        setUserDashbox(false);
      }
    };
  
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  // Load admin data on component mount
  useEffect(() => {
    loadAdminData();
  }, [adminId]);

  const loadAdminData = async () => {
    try {
      setLoading(true);
      setError('');

      // Get admin from session storage if no adminId provided
      let currentAdminId = adminId;
      if (!currentAdminId) {
        const session = localStorage.getItem('admin_session');
        if (session) {
          const sessionData = JSON.parse(session);
          currentAdminId = sessionData.id;
        }
      }

      if (!currentAdminId) {
        throw new Error('No admin ID found');
      }

      const { data, error } = await supabase
        .from('admins')
        .select('*')
        .eq('id', currentAdminId)
        .single();

      if (error) throw error;

      setAdmin(data);
      setFormData({
        username: data.username || data.name || '',
        github_url: data.github_url || '',
        linkedin_url: data.linkedin_url || '',
        avatar_url: data.avatar_url || ''
      });

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load admin data');
      console.error('Error loading admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAvatarClick = () => {
    if (isEditing && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const uploadAvatar = async (file: File): Promise<string | null> => {
    try {
      setUploading(true);
      
      // Create unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${admin?.id}-${Date.now()}.${fileExt}`;
      
      // Upload file to Supabase Storage
      const { data, error } = await supabase.storage
        .from('avatars') // Make sure this bucket exists
        .upload(fileName, file);

      if (error) throw error;

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('avatars')
        .getPublicUrl(data.path);

      return urlData.publicUrl;
    } catch (err) {
      console.error('Error uploading avatar:', err);
      setError('Failed to upload avatar' + JSON.stringify(err));
      return null;
    } finally {
      setUploading(false);
    }
  };

  const handleAvatarChange = async (e: ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0];
  if (file && admin) {
    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('Avatar file size must be less than 5MB');
      return;
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file');
      return;
    }

    // Validate image dimensions and aspect ratio
    const img = new Image();
    img.onload = async () => {
      const { width, height } = img;
      
      // Check minimum dimensions
      if (width < 300 || height < 300) {
        setError('Image must be at least 300x300 pixels');
        return;
      }
      
      // Check 1:1 aspect ratio
      if (width !== height) {
        setError('Image must have a 1:1 aspect ratio (square)');
        return;
      }

      // If validation passes, upload the avatar
      const avatarUrl = await uploadAvatar(file);
      if (avatarUrl) {
        setFormData(prev => ({
          ...prev,
          avatar_url: avatarUrl
        }));
      }
    };
    
    img.onerror = () => {
      setError('Failed to load image for validation');
    };
    
    img.src = URL.createObjectURL(file);
  }
};

  const handleEdit = () => {
    setIsEditing(!isEditing);
    setError('');
    
    if (isEditing && admin) {
      // Reset form data if canceling edit
      setFormData({
        username: admin.username || admin.name || '',
        github_url: admin.github_url || '',
        linkedin_url: admin.linkedin_url || '',
        avatar_url: admin.avatar_url || ''
      });
    }
  };

  const handleSave = async () => {
    if (!admin) return;

    // Validate required fields
    if (!formData.username.trim()) {
      setError('Username is required');
      return;
    }

    // Validate URLs
    const urlPattern = /^https?:\/\/.+/;
    if (formData.github_url && !urlPattern.test(formData.github_url)) {
      setError('Please enter a valid GitHub URL');
      return;
    }
    if (formData.linkedin_url && !urlPattern.test(formData.linkedin_url)) {
      setError('Please enter a valid LinkedIn URL');
      return;
    }

    try {
      setSaving(true);
      setError('');

      const { data, error } = await supabase
        .from('admins')
        .update({
          username: formData.username,
          github_url: formData.github_url || null,
          linkedin_url: formData.linkedin_url || null,
          avatar_url: formData.avatar_url || null,
          updated_at: new Date().toISOString()
        })
        .eq('id', admin.id)
        .select()
        .single();

      if (error) throw error;

      // Update local state
      setAdmin(data);
      setIsEditing(false);
      
      //update nav avatar URL
      setAdminAvatarUrl(formData.avatar_url);
      
      // Update session storage
      const session = localStorage.getItem('admin_session');
      if (session) {
        const sessionData = JSON.parse(session);
        sessionData.name = formData.username;
        localStorage.setItem('admin_session', JSON.stringify(sessionData));
      }

      console.log('Admin data updated successfully');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save changes');
      console.error('Error saving admin data:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    try {
      // Update last logout time
      if (admin) {
        await supabase
          .from('admins')
          .update({ last_logout: new Date().toISOString() })
          .eq('id', admin.id);
      }

      // Clear session
      localStorage.removeItem('admin_session');
      
      if (onLogout) {
        onLogout();
      }
    } catch (err) {
      console.error('Error during logout:', err);
      // Still proceed with logout even if update fails
      localStorage.removeItem('admin_session');
      if (onLogout) {
        onLogout();
      }
    }
  };

  if (loading) {
    return (
      <div className={Styles.adminDashbox} style={{ transform: scale ? 'scale(1)' : 'scale(0)' }}>
        <div>Loading admin data...</div>
      </div>
    );
  }

  if (!admin) {
    return (
      <div className={Styles.adminDashbox} style={{ transform: scale ? 'scale(1)' : 'scale(0)' }}>
        <div>Error: {error || 'Failed to load admin data'}</div>
      </div>
    );
  }

  const displayAvatar = formData.avatar_url || admin.avatar_url || '/avatar.jpg';
  const displayUsername = formData.username || admin.username || admin.name;

  return (
    <div className={Styles.adminDashbox} ref={dashboxRef} style={scale ? { transform: 'scale(1)' } : { transform: 'scale(0)' }}>
      <div className={Styles.dashboxData}>
        <span>
          <img 
            src={displayAvatar}
            alt="Avatar"
            onClick={handleAvatarClick}
            style={{ cursor: isEditing ? 'pointer' : 'default' }}
          />
          {isEditing && (
            <>
              {uploading ? <LuLoaderCircle className="LoaderSpin"/> : <LuSquarePen onClick={handleAvatarClick} />}
            </>
          )}
          <input 
            ref={fileInputRef}
            type="file" 
            accept="image/*"
            hidden 
            onChange={handleAvatarChange}
            disabled={uploading}
          />
        </span>
        <span>
          <h1 onClick={()=>{setUserDashbox(false)}}>{displayUsername}</h1>
          <p>{admin.email}</p>
        </span>
      </div>
      
      {error && <div style={{ color: 'red', margin: '10px 0' }}>{error}</div>}
      
      <div className={Styles.dashboxForm}>
        <fieldset>
          <legend>Username</legend>
          <input 
            type="text" 
            name="username"
            value={formData.username}
            onChange={handleInputChange}
            required
            disabled={!isEditing}
          />
        </fieldset>
        
        <fieldset>
          <legend>Github URL</legend>
          <input 
            type="url"
            name="github_url"
            value={formData.github_url}
            onChange={handleInputChange}
            disabled={!isEditing}
          />
        </fieldset>
        
        <fieldset>
          <legend>LinkedIn URL</legend>
          <input 
            type="url"
            name="linkedin_url"
            value={formData.linkedin_url}
            onChange={handleInputChange}
            disabled={!isEditing}
          />
        </fieldset>
        
        <span>
          <button type="button" onClick={handleEdit} disabled={saving || uploading}>
            <LuPenLine /> {isEditing ? 'Cancel' : 'Edit'}
          </button>
          {isEditing && (
            <button type="button" onClick={handleSave} disabled={saving || uploading}>
              {saving ? <LuLoaderCircle className="LoaderSpin"/> : <LuSave />} 
              {saving ? 'Saving...' : 'Save'}
            </button>
          )}
          
          <button type="button" onClick={handleLogout} disabled={saving} className={Styles.logoutButton}>
            <LuLogOut /> LogOut
          </button>
        </span>
      </div>
    </div>
  );
};

export default AdminDashbox;