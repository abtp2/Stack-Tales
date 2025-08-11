"use client";
import {
  ImageKitAbortError,
  ImageKitInvalidRequestError,
  ImageKitServerError,
  ImageKitUploadNetworkError,
  upload,
} from "@imagekit/next";
import "./MediaUpload.css";
import { useRef, useState } from "react";
import { LuImageUp, LuTrash2 } from "react-icons/lu";
import { type User } from '@supabase/supabase-js'

interface UploadedMedia {
  id: string;
  url: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  uploadedAt: Date;
  thumbnailUrl?: string;
}

interface UploadProgress {
  fileName: string;
  progress: number;
  status: "uploading" | "completed" | "error" | "cancelled";
  error?: string;
}

interface MediaUploadProps {
  admin: User;
}

const MediaUpload = ({ admin }: MediaUploadProps) => {
  const [uploads, setUploads] = useState<UploadProgress[]>([]);
  const [uploadedMedia, setUploadedMedia] = useState<UploadedMedia[]>([]);
  const [dragOver, setDragOver] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const abortControllersRef = useRef<Map<string, AbortController>>(new Map());

  const MAX_FILE_SIZE = 50 * 1024 * 1024;
  const SUPPORTED_TYPES = {
    image: ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp", "image/svg+xml"],
    video: ["video/mp4", "video/webm", "video/mov", "video/avi", "video/quicktime"],
  };

  const getAllSupportedTypes = () => [...SUPPORTED_TYPES.image, ...SUPPORTED_TYPES.video];

  const validateFile = (file: File): { isValid: boolean; error?: string } => {
    const supportedTypes = getAllSupportedTypes();
    if (!supportedTypes.includes(file.type)) {
      return {
        isValid: false,
        error: `Unsupported file type: ${file.type}.`,
      };
    }
    if (file.size > MAX_FILE_SIZE) {
      return {
        isValid: false,
        error: `File too large: ${(file.size / 1024 / 1024).toFixed(2)}MB.`,
      };
    }
    return { isValid: true };
  };

  const formatFileSize = (bytes: number): string => {
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const getFileCategory = (fileType: string): "image" | "video" =>
    SUPPORTED_TYPES.image.includes(fileType) ? "image" : "video";

  const authenticator = async () => {
    const response = await fetch("/api/imagekit/upload", {
      headers: {
        "Content-Type": "application/json",
        "x-session-id": admin.id,
      },
    });
    if (!response.ok) {
      throw new Error(`Auth failed: ${response.status}`);
    }
    return response.json();
  };

  const uploadSingleFile = async (file: File): Promise<void> => {
    const uploadId = `${file.name}-${Date.now()}`;
    const abortController = new AbortController();
    abortControllersRef.current.set(uploadId, abortController);

    setUploads((prev) => [...prev, { fileName: file.name, progress: 0, status: "uploading" }]);

    try {
      const { signature, expire, token, publicKey } = await authenticator();

      const uploadResponse = await upload({
        expire,
        token,
        signature,
        publicKey,
        file,
        fileName: `${Date.now()}-${file.name}`,
        folder: `/uploads/${admin.id}`,
        useUniqueFileName: true,
        onProgress: (event) => {
          const progress = (event.loaded / event.total) * 100;
          setUploads((prev) =>
            prev.map((upload) =>
              upload.fileName === file.name ? { ...upload, progress } : upload
            )
          );
        },
        abortSignal: abortController.signal,
      });

      if (!uploadResponse.fileId || !uploadResponse.url) {
        throw new Error("Upload response missing fileId or url");
      }

      const uploadedFile: UploadedMedia = {
        id: uploadResponse.fileId,
        url: uploadResponse.url,
        fileName: file.name,
        fileType: file.type,
        fileSize: file.size,
        uploadedAt: new Date(),
        thumbnailUrl: uploadResponse.thumbnailUrl,
      };

      setUploadedMedia((prev) => [...prev, uploadedFile]);
      setUploads((prev) =>
        prev.map((upload) =>
          upload.fileName === file.name
            ? { ...upload, progress: 100, status: "completed" }
            : upload
        )
      );
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : "Upload failed";
      setUploads((prev) =>
        prev.map((upload) =>
          upload.fileName === file.name ? { ...upload, status: "error", error: errorMsg } : upload
        )
      );
    } finally {
      abortControllersRef.current.delete(uploadId);
    }
  };

  const handleFileUpload = async (files: FileList | File[]) => {
    const fileArray = Array.from(files);
    for (const file of fileArray) {
      const { isValid, error } = validateFile(file);
      if (!isValid) return alert(`${file.name}: ${error}`);
    }
    await Promise.allSettled(fileArray.map(uploadSingleFile));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.length) handleFileUpload(e.target.files);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files.length) handleFileUpload(e.dataTransfer.files);
  };

  const cancelUpload = (fileName: string) => {
    for (const [key, controller] of abortControllersRef.current) {
      if (key.includes(fileName)) controller.abort();
    }
  };

  const copyToClipboard = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      alert("URL copied to clipboard!");
    } catch {
      alert("Failed to copy URL");
    }
  };

  return (
    <div className="upload-container">
      <div
        className={`upload-dropzone ${dragOver ? "drag-over" : ""}`}
        onDrop={handleDrop}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={(e) => {
          e.preventDefault();
          setDragOver(false);
        }}
      >
        <div className="dropzone-content">
          <div className="icon-placeholder">
            <LuImageUp/>
          </div>
          <div className="upload-text">
            <p className="headline">Drag and drop files here, or click to select</p>
            <p className="subline">
              Supports images (JPEG, PNG, GIF, WebP, SVG) and videos (MP4, WebM, MOV, AVI)
            </p>
            <p className="filesize">Maximum file size: {MAX_FILE_SIZE / 1024 / 1024}MB</p>
          </div>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleInputChange}
            multiple
            accept={getAllSupportedTypes().join(",")}
            className="file-input"
          />
          <button type="button" onClick={() => fileInputRef.current?.click()} className="upload-btn">
            Select Files
          </button>
        </div>
      </div>

      {uploads.length > 0 && (
        <div className="upload-progress">
          <div className="progress-header">
            <h3>Upload Progress</h3>
            <button onClick={() =>
              setUploads((prev) =>
                prev.filter((upload) => upload.status === "uploading" || upload.status === "error")
              )
            }>
              Clear Completed
            </button>
          </div>
          <div className="upload-list">
            {uploads.map((upload, index) => (
              <div key={index} className="upload-item">
                <div className="upload-meta">
                  <span className="upload-meta-file-name">{upload.fileName}</span>
                  <div className="upload-status">
                    <span className={`status-badge ${upload.status}`}>{upload.status}</span>
                    {upload.status === "uploading" && (
                      <button className="upload-cancel" onClick={() => cancelUpload(upload.fileName)}>Cancel</button>
                    )}
                  </div>
                </div>
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: `${upload.progress}%` }} />
                </div>
                {upload.error && <p className="error-text">{upload.error}</p>}
              </div>
            ))}
          </div>
        </div>
      )}

      {uploadedMedia.length > 0 && (
        <div className="media-gallery">
          <h3>Uploaded Media</h3>
          <div className="gallery">
            {uploadedMedia.map((media) => (
              <div key={media.id} className="media-card">
                <div className="media-preview">
                  {getFileCategory(media.fileType) === "image" ? (
                    <img src={media.url} alt={media.fileName} loading="lazy" />
                  ) : (
                    <video src={media.url} controls preload="metadata" />
                  )}
                </div>
                <div className="media-info">
                  <h4 title={media.fileName}>{media.fileName}</h4>
                  <div className="meta">
                    <div>Size: {formatFileSize(media.fileSize)}</div>
                    <div>Type: {media.fileType}</div>
                    <div>Uploaded: {media.uploadedAt.toLocaleDateString()}</div>
                  </div>
                  <div className="url-copy">
                    <div className="copy-input">
                      <input type="text" value={media.url} readOnly />
                      <button onClick={() => copyToClipboard(media.url)}>Copy</button>
                    </div>
                  </div>
                  <div className="media-actions">
                    <a href={media.url} target="_blank" rel="noopener noreferrer">Open in new tab</a>
                    <button onClick={() => setUploadedMedia((prev) => prev.filter((m) => m.id !== media.id))}>
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default MediaUpload;