'use client';
import { useState, useRef, ChangeEvent, useEffect } from 'react';
import { LuPenLine, LuSquarePen, LuLogOut, LuSave, LuLoaderCircle } from 'react-icons/lu';
import { createClient } from '@/lib/supabase/client';
import Styles from '@/app/admin/admin.module.css';
import { type User } from '@supabase/supabase-js'

interface Props {
  admin: User;
  setAdmin: React.Dispatch<React.SetStateAction<User | null>>;
  scale?: boolean;
  userDashbox: boolean;
  setUserDashbox: React.Dispatch<React.SetStateAction<boolean>>;
  adminAvatarUrl: string;
  setAdminAvatarUrl: React.Dispatch<React.SetStateAction<string>>;
}

const AdminSettings: React.FC<Props> = ({
  admin,
  setAdmin,
  scale = false,
  userDashbox,
  setUserDashbox,
  adminAvatarUrl,
  setAdminAvatarUrl,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    github_url: '',
    linkedin_url: '',
    telegram_url: '',
    twitter_url: '',
    youtube_url: '',
    website_url: '',
    readme: '',
    avatar_url: '',
  });
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [loggingOut, setLoggingOut] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dashboxRef = useRef<HTMLDivElement>(null);
  const supabase = createClient();


  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        const { data, error } = await supabase
          .from('admins')
          .select('username, github_url, linkedin_url, telegram_url, twitter_url, youtube_url, website_url, readme, avatar_url')
          .eq('id', admin.id)
          .single();
        if (error) throw error;
        setFormData({
          username: data.username || '',
          github_url: data.github_url || '',
          linkedin_url: data.linkedin_url || '',
          telegram_url: data.telegram_url || '',
          twitter_url: data.twitter_url || '',
          youtube_url: data.youtube_url || '',
          website_url: data.website_url || '',
          readme: data.readme || '',
          avatar_url: data.avatar_url || '',
        });
        // In case this is the latest avatar and should be synced
        setAdminAvatarUrl(data.avatar_url || '');
      } catch (err) {
        console.error('Failed to fetch admin data:', err);
        setError('Could not load admin profile.');
      }
    };
    if (admin?.id) {
      fetchAdminData();
    }
  }, [admin.id]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dashboxRef.current && !dashboxRef.current.contains(event.target as Node)) {
        setUserDashbox(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [setUserDashbox]);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAvatarClick = () => {
    if (isEditing && fileInputRef.current) fileInputRef.current.click();
  };

  const uploadAvatar = async (file: File): Promise<string | null> => {
    try {
      setUploading(true);
      const fileExt = file.name.split('.').pop();
      const fileName = `${admin.id}-${Date.now()}.${fileExt}`;
      const { data, error } = await supabase.storage.from('avatars').upload(fileName, file);
      if (error) throw error;
      const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(data.path);
      return urlData.publicUrl;
    } catch (err) {
      console.error('Avatar upload failed:', err);
      setError('Failed to upload avatar.');
      return null;
    } finally {
      setUploading(false);
    }
  };

  const handleAvatarChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      return setError('Max file size is 5MB.');
    }

    if (!file.type.startsWith('image/')) {
      return setError('File must be an image.');
    }

    const img = new Image();
    img.onload = async () => {
      if (img.width < 300 || img.height < 300) {
        return setError('Min size is 300x300px.');
      }
      if (img.width !== img.height) {
        return setError('Image must be square.');
      }

      const url = await uploadAvatar(file);
      if (url) setFormData(prev => ({ ...prev, avatar_url: url }));
    };
    img.onerror = () => setError('Invalid image.');
    img.src = URL.createObjectURL(file);
  };

  const handleSave = async () => {
    if (!formData.username.trim()) {
      return setError('Username required');
    }

    try {
      setSaving(true);
                             const { data, error } = await supabase
           .from('admins')
           .update({
             username: formData.username,
             github_url: formData.github_url || null,
             linkedin_url: formData.linkedin_url || null,
             telegram_url: formData.telegram_url || null,
             twitter_url: formData.twitter_url || null,
             youtube_url: formData.youtube_url || null,
             website_url: formData.website_url || null,
             readme: formData.readme || null,
             avatar_url: formData.avatar_url || null,
             updated_at: new Date().toISOString(),
           })
           .eq('id', admin.id)
           .select()
           .single();

      if (error) throw error;

      setAdminAvatarUrl(formData.avatar_url);
      setIsEditing(false);
    } catch (err) {
      console.error('Save failed:', err);
      setError('Failed to save changes.');
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    try {
      setLoggingOut(true);
      const res = await fetch('/auth/signout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      if (res.ok || res.redirected || (res.status === 302)){ setAdmin(null) }
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      setLoggingOut(false);
    }
  };

  return (
    <div className={Styles.adminSettings}>
      <div className={Styles.dashboxData}>
        <span>
          <img
            src={formData.avatar_url || '/avatar.jpg'}
            alt="Avatar"
            onClick={handleAvatarClick}
            style={{ cursor: isEditing ? 'pointer' : 'default' }}
          />
          {isEditing && (uploading ? <LuLoaderCircle className="LoaderSpin" /> : <LuSquarePen />)}
          <input
            ref={fileInputRef}
            type="file"
            hidden
            accept="image/*"
            onChange={handleAvatarChange}
            disabled={uploading}
          />
        </span>
        <span>
          <h1>{formData.username}</h1>
          <p>{admin.email}</p>
        </span>
      </div>

      {error && <div className={Styles.error}>{error}</div>}

      <div className={Styles.dashboxForm}>
        <fieldset>
          <legend>Username</legend>
          <input type="text" name="username" value={formData.username} onChange={handleInputChange} disabled={!isEditing || saving || loggingOut} />
        </fieldset>
        <fieldset>
          <legend>GitHub</legend>
          <input type="url" name="github_url" value={formData.github_url} onChange={handleInputChange} disabled={!isEditing || saving  || loggingOut} required/>
        </fieldset>
        <fieldset>
          <legend>LinkedIn</legend>
          <input type="url" name="linkedin_url" value={formData.linkedin_url} onChange={handleInputChange} disabled={!isEditing || saving  || loggingOut} />
        </fieldset>
        <fieldset>
          <legend>Telegram</legend>
          <input type="url" name="telegram_url" value={formData.telegram_url} onChange={handleInputChange} disabled={!isEditing || saving  || loggingOut} />
        </fieldset>
        <fieldset>
          <legend>Twitter</legend>
          <input type="url" name="twitter_url" value={formData.twitter_url} onChange={handleInputChange} disabled={!isEditing || saving  || loggingOut} />
        </fieldset>
        <fieldset>
          <legend>YouTube</legend>
          <input type="url" name="youtube_url" value={formData.youtube_url} onChange={handleInputChange} disabled={!isEditing || saving  || loggingOut} />
        </fieldset>
        <fieldset>
          <legend>Website</legend>
          <input type="url" name="website_url" value={formData.website_url} onChange={handleInputChange} disabled={!isEditing || saving  || loggingOut} />
        </fieldset>
        <fieldset>
          <legend>README</legend>
          <textarea name="readme" value={formData.readme} onChange={handleInputChange} disabled={!isEditing || saving || loggingOut} placeholder="Use HTML for readme, just like GitHub" required/>
        </fieldset>

        <span>
          <button type="button" onClick={() => setIsEditing(!isEditing)} disabled={saving || uploading || loggingOut}>
            <LuPenLine /> {isEditing ? 'Cancel' : 'Edit'}
          </button>
          {isEditing && (
            <button type="button" onClick={handleSave} disabled={saving || uploading || loggingOut}>
              {saving ? <LuLoaderCircle className="LoaderSpin" /> : <LuSave />} {saving ? 'Saving...' : 'Save'}
            </button>
          )}
          <button type="button" onClick={handleLogout} className={Styles.logoutButton} disabled={saving || loggingOut}>
            {loggingOut ? (<><LuLoaderCircle className="LoaderSpin"/> Logging out</>) : (<><LuLogOut/> Log out</>)}
          </button>
        </span>
      </div>
    </div>
  );
};

export default AdminSettings;