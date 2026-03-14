'use client';

import { useState } from 'react';

export default function AvatarUploader({ currentAvatar, onUploadSuccess }) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [preview, setPreview] = useState(currentAvatar || '');

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate size (2MB max)
    if (file.size > 2 * 1024 * 1024) {
      setError('File size must be less than 2MB');
      return;
    }
    // Validate type
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      setError('Only JPG, PNG and WEBP are allowed');
      return;
    }

    setError('');
    const objectUrl = URL.createObjectURL(file);
    setPreview(objectUrl);
    setUploading(true);

    try {
      // 1. Get Presigned URL
      const presignRes = await fetch('/api/profile/avatar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'presign',
          filename: file.name,
          contentType: file.type
        })
      });
      
      const presignData = await presignRes.json();
      if (!presignRes.ok) throw new Error(presignData.error || 'Failed to get upload URL');

      // 2. Upload to S3 directly
      const uploadRes = await fetch(presignData.presignedUrl, {
        method: 'PUT',
        headers: {
          'Content-Type': file.type,
        },
        body: file
      });

      if (!uploadRes.ok) throw new Error('Failed to upload image to S3');

      // 3. Save public URL via API
      const saveRes = await fetch('/api/profile/avatar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'save',
          avatarUrl: presignData.publicUrl
        })
      });

      if (!saveRes.ok) throw new Error('Failed to save avatar URL');

      onUploadSuccess(presignData.publicUrl);
    } catch (err) {
      console.error(err);
      setError(err.message || 'Error uploading file');
      setPreview(currentAvatar); // revert preview
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex flex-col items-center sm:items-start gap-4">
      <div className="relative group">
        <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-200 border-4 border-white shadow-lg flex items-center justify-center">
          {preview ? (
            <img src={preview} alt="Avatar" className="w-full h-full object-cover" />
          ) : (
            <span className="text-3xl text-gray-400">👤</span>
          )}
        </div>
        {uploading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full">
            <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}
      </div>

      <div className="flex flex-col items-center sm:items-start">
        <label className="cursor-pointer px-4 py-2 bg-white border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
          <span>{uploading ? 'Uploading...' : 'Change Picture'}</span>
          <input 
            type="file" 
            className="hidden" 
            accept="image/jpeg, image/png, image/webp"
            onChange={handleFileChange}
            disabled={uploading}
          />
        </label>
        {error && <p className="text-red-500 text-xs mt-2 max-w-xs text-center sm:text-left">{error}</p>}
        <p className="text-gray-500 text-xs mt-2">JPG, PNG or WEBP. Max 2MB.</p>
      </div>
    </div>
  );
}
