"use client";
import {ImageKitAbortError,ImageKitInvalidRequestError,ImageKitServerError,ImageKitUploadNetworkError,upload,} from "@imagekit/next";
import "./MediaUpload.css";
import { useRef, useState, useEffect } from "react";
import {LuImageUp} from "react-icons/lu";

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

const MediaUpload = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploads, setUploads] = useState<UploadProgress[]>([]);
  const [uploadedMedia, setUploadedMedia] = useState<UploadedMedia[]>([]);
  const [dragOver, setDragOver] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const abortControllersRef = useRef<Map<string, AbortController>>(new Map());
  const session = JSON.parse(localStorage.getItem("admin_session"));
  
  // Maximum file size (50MB)
  const MAX_FILE_SIZE = 50 * 1024 * 1024;
  const SUPPORTED_TYPES = {
    image: ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp", "image/svg+xml"],
    video: ["video/mp4", "video/webm", "video/mov", "video/avi", "video/quicktime"],
  };

  const getAllSupportedTypes = () => [...SUPPORTED_TYPES.image, ...SUPPORTED_TYPES.video];
  
  // Check authentication status
  useEffect(() => {
    const checkAuth = async () => {
      try {
        setUser(session || null);
      } catch (error) {
        console.error("Auth check error:", error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    checkAuth();
  }, []);
  
  //Validates file type and size
  const validateFile = (file: File): { isValid: boolean; error?: string } => {
    const supportedTypes = getAllSupportedTypes();
    if (!supportedTypes.includes(file.type)) {
      return {
        isValid: false,
        error: `Unsupported file type: ${file.type}. Supported: ${supportedTypes.join(", ")}`,
      };
    }
    if (file.size > MAX_FILE_SIZE) {
      return {
        isValid: false,
        error: `File too large: ${(file.size / 1024 / 1024).toFixed(2)}MB. Max: ${MAX_FILE_SIZE / 1024 / 1024}MB`,
      };
    }
    return { isValid: true };
  };

  const getFileCategory = (fileType: string): "image" | "video" => {
    return SUPPORTED_TYPES.image.includes(fileType) ? "image" : "video";
  };
  
  //Formats file size for display
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };
  
  //Authenticates and retrieves upload credentials
  const authenticator = async () => {
    try {
      const response = await fetch("/api/imagekit/upload", {
        headers: {
          "Content-Type": "application/json",
          "x-session-id": session?.id,
        },
      });
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Request failed: ${response.status} - ${errorText}`);
      }
      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Authentication error:", error);
      throw new Error("Authentication failed");
    }
  };
  
  //Handles single file upload
  const uploadSingleFile = async (file: File): Promise<void> => {
    const uploadId = `${file.name}-${Date.now()}`;
    const abortController = new AbortController();
    abortControllersRef.current.set(uploadId, abortController);
    
    // Add to uploads tracking
    setUploads((prev) => [...prev, { fileName: file.name, progress: 0, status: "uploading" }]);

    try {
      // Get authentication parameters
      const { signature, expire, token, publicKey } = await authenticator();
      // Upload file
      const uploadResponse = await upload({
        expire,
        token,
        signature,
        publicKey,
        file,
        fileName: `${Date.now()}-${file.name}`,
        folder: `/uploads/${user?.id || "anonymous"}`,
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
      // Create uploaded media object
      const uploadedFile: UploadedMedia = {
        id: uploadResponse.fileId,
        url: uploadResponse.url,
        fileName: file.name,
        fileType: file.type,
        fileSize: file.size,
        uploadedAt: new Date(),
        thumbnailUrl: uploadResponse.thumbnailUrl,
      };
      // Update states
      setUploadedMedia((prev) => [...prev, uploadedFile]);
      setUploads((prev) =>
        prev.map((upload) =>
          upload.fileName === file.name ? { ...upload, progress: 100, status: "completed" } : upload
        )
      );
    } catch (error) {
      let errorMessage = "Upload failed";
      if (error instanceof ImageKitAbortError) {
        errorMessage = "Upload cancelled";
        setUploads((prev) =>
          prev.map((upload) =>
            upload.fileName === file.name ? { ...upload, status: "cancelled" } : upload
          )
        );
      } else if (
        error instanceof ImageKitInvalidRequestError ||
        error instanceof ImageKitUploadNetworkError ||
        error instanceof ImageKitServerError ||
        error instanceof Error
      ) {
        errorMessage = error.message;
        setUploads((prev) =>
          prev.map((upload) =>
            upload.fileName === file.name ? { ...upload, status: "error", error: errorMessage } : upload
          )
        );
      }
    } finally {
      abortControllersRef.current.delete(uploadId);
    }
  };
  //Handles multiple file uploads
  const handleFileUpload = async (files: FileList | File[]) => {
    if (!user) return alert("Please log in to upload files");
    const fileArray = Array.from(files);
    // Validate all files first
    for (const file of fileArray) {
      const { isValid, error } = validateFile(file);
      if (!isValid) return alert(`${file.name}: ${error}`);
    }
    // Upload all files concurrently
    await Promise.allSettled(fileArray.map((file) => uploadSingleFile(file)));
  };
  
  //Handle file input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.length) handleFileUpload(e.target.files);
  };
  
  //Handle drag & drop
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files.length) handleFileUpload(e.dataTransfer.files);
  };
  
  //Cancel Upload
  const cancelUpload = (fileName: string) => {
    for (const [key, controller] of abortControllersRef.current) {
      if (key.includes(fileName)) controller.abort();
    }
  };
  
  //Copy to clipboard
  const copyToClipboard = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      alert("URL copied to clipboard!");
    } catch (e) {
      alert("Failed to copy URL");
    }
  };

  if (loading) return <span>Loading...</span>;
  if (!user) return <p>Please log in to upload media files.</p>;

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
                    {upload.status === "uploading.." && (
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