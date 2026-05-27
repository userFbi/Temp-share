// TempShare.jsx

import React, { useEffect, useRef, useState } from "react";
import "./TempShare.css";

const TempShare = () => {
  const [files, setFiles] = useState([]);
  const [expiryDays, setExpiryDays] = useState(1);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const [uploading, setUploading] = useState(false);
  const [completed, setCompleted] = useState(false);

  const [progress, setProgress] = useState(0);
  const [shareCode, setShareCode] = useState("");

  const [customFilename, setCustomFilename] = useState("");

  const dropRef = useRef(null);

  // =========================
  // Helpers
  // =========================

  const generateShareCode = () => {
    return "TS-" + Math.floor(100000 + Math.random() * 900000);
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024)
      return (bytes / 1024).toFixed(1) + " KB";

    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  const fileToBase64 = (file) => {
    return new Promise((resolve) => {
      const reader = new FileReader();

      reader.onload = () => resolve(reader.result);

      reader.readAsDataURL(file);
    });
  };

  // =========================
  // File Handling
  // =========================

  const handleFileChange = (e) => {
    const selected = Array.from(e.target.files);

    setFiles((prev) => [...prev, ...selected]);
  };

  const handleDrop = (e) => {
    e.preventDefault();

    const droppedFiles = Array.from(e.dataTransfer.files);

    setFiles((prev) => [...prev, ...droppedFiles]);

    dropRef.current.classList.remove("dragging");
  };

  const removeFile = (index) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  // =========================
  // Upload Logic
  // =========================

  const saveFilesToLocalStorage = async () => {
    const code = generateShareCode();

    const allData =
      JSON.parse(localStorage.getItem("tempshare_uploads")) || {};

    const savedFiles = [];

    for (let file of files) {
      const base64 = await fileToBase64(file);

      savedFiles.push({
        name: file.name,
        type: file.type,
        size: file.size,
        data: base64,
      });
    }

    allData[code] = {
      files: savedFiles,
      expiresAt:
        Date.now() + expiryDays * 24 * 60 * 60 * 1000,
    };

    localStorage.setItem(
      "tempshare_uploads",
      JSON.stringify(allData)
    );

    return code;
  };

  const handleUpload = async () => {
    if (files.length === 0) return;

    setUploading(true);

    let current = 0;

    const interval = setInterval(async () => {
      current += 10;

      setProgress(current);

      if (current >= 100) {
        clearInterval(interval);

        const code = await saveFilesToLocalStorage();

        setShareCode(code);

        setUploading(false);

        setCompleted(true);
      }
    }, 200);
  };

  // =========================
  // Copy
  // =========================

  const handleCopy = async () => {
    await navigator.clipboard.writeText(shareCode);
  };

  // =========================
  // Reset
  // =========================

  const resetUpload = () => {
    setFiles([]);
    setProgress(0);
    setCompleted(false);
    setShareCode("");
  };

  // =========================
  // Year
  // =========================

  const currentYear = new Date().getFullYear();

  // =========================
  // SVG Icons
  // =========================

  const FileIcon = () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth="2"
      width="18"
      height="18"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
      />
    </svg>
  );

  // =========================
  // UI
  // =========================

  return (
    <div className="tempshare">
      {/* Header */}
      <header className="header">
        <div className="header-content">
          <div className="logo">
            <span>TS</span>
          </div>

          <div className="header-text">
            <h1>TempShare</h1>
            <p>Quick temporary photo & video sharing</p>
          </div>
        </div>
      </header>

      {/* Main */}
      <main>
        <div className="container">
          {/* Hero */}
          <div className="hero">
            <h2>
              Share files{" "}
              <span className="gradient-text">
                temporarily
              </span>
            </h2>

            <p>
              Upload photos, videos, or documents and get
              a shareable link that expires automatically.
            </p>
          </div>

          {/* Upload Card */}
          <div className="upload-card">
            {/* Idle State */}
            {!uploading && !completed && (
              <>
                <div
                  className="drop-zone"
                  ref={dropRef}
                  onDragOver={(e) => {
                    e.preventDefault();
                    dropRef.current.classList.add(
                      "dragging"
                    );
                  }}
                  onDragLeave={() => {
                    dropRef.current.classList.remove(
                      "dragging"
                    );
                  }}
                  onDrop={handleDrop}
                >
                  <input
                    type="file"
                    multiple
                    accept="image/*,video/*,.pdf,.doc,.docx"
                    onChange={handleFileChange}
                  />

                  <div className="drop-icon">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                      />
                    </svg>
                  </div>

                  <p className="title">
                    Drop files here or click to upload
                  </p>

                  <p className="subtitle">
                    Photos, videos, PDFs, documents
                  </p>
                </div>

                {/* Preview */}
                <div className="file-preview">
                  {files.map((file, index) => (
                    <div
                      className="file-item"
                      key={index}
                    >
                      <div className="file-info">
                        <FileIcon />

                        <div>
                          <div className="file-name">
                            {file.name}
                          </div>

                          <div className="file-size">
                            {formatFileSize(
                              file.size
                            )}
                          </div>
                        </div>
                      </div>

                      <button
                        className="file-remove"
                        onClick={() =>
                          removeFile(index)
                        }
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>

                {/* Form */}
                <div className="form-fields">
                  {/* Expiry */}
                  {/* Expiry */}
                  <div className="form-group">
                    <label>Expiry Time</label>

                    <div
                      className={`dropdown ${dropdownOpen ? "open" : ""
                        }`}
                    >
                      <button
                        type="button"
                        className="dropdown-trigger"
                        onClick={() =>
                          setDropdownOpen(!dropdownOpen)
                        }
                      >
                        <div className="dropdown-left">
                          {/* Timer Icon */}
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth="2"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>

                          <span>
                            {expiryDays} day
                            {expiryDays > 1 ? "s" : ""}
                          </span>
                        </div>

                        {/* Dropdown Arrow */}
                        <svg
                          className="dropdown-arrow"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M19 9l-7 7-7-7"
                          />
                        </svg>
                      </button>

                      {dropdownOpen && (
                        <div className="dropdown-menu">
                          {[1, 2, 3, 7].map((day) => (
                            <button
                              key={day}
                              className={`dropdown-option ${expiryDays === day
                                ? "selected"
                                : ""
                                }`}
                              onClick={() => {
                                setExpiryDays(day);
                                setDropdownOpen(false);
                              }}
                            >
                              {day} day
                              {day > 1 ? "s" : ""}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Filename */}
                  <div className="form-group">
                    <label>
                      Custom filename (optional)
                    </label>

                    <input
                      type="text"
                      className="text-input"
                      placeholder="Enter custom filename..."
                      value={customFilename}
                      onChange={(e) =>
                        setCustomFilename(
                          e.target.value
                        )
                      }
                    />
                  </div>

                  {/* Button */}
                  <div className="button-container">
                    <button
                      className="upload-btn"
                      disabled={files.length === 0}
                      onClick={handleUpload}
                    >
                      Upload Files
                    </button>
                  </div>
                </div>
              </>
            )}

            {/* Uploading */}
            {uploading && (
              <div className="progress-container">
                <div className="progress-circle">
                  <svg viewBox="0 0 80 80">
                    <circle
                      className="progress-bg"
                      cx="40"
                      cy="40"
                      r="36"
                    />

                    <circle
                      className="progress-bar"
                      cx="40"
                      cy="40"
                      r="36"
                      strokeDasharray="226"
                      strokeDashoffset={
                        226 - (226 * progress) / 100
                      }
                    />
                  </svg>

                  <div className="progress-text">
                    {progress}%
                  </div>
                </div>

                <p className="uploading-text">
                  Uploading {files.length} file
                  {files.length > 1 ? "s" : ""}...
                </p>

                <div className="linear-progress">
                  <div
                    className="linear-progress-bar"
                    style={{
                      width: `${progress}%`,
                    }}
                  />
                </div>
              </div>
            )}

            {/* Complete */}
            {completed && (
              <div className="complete-container">
                <div className="success-icon scale-in">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>

                <h3>Upload Complete!</h3>

                <p>
                  Your files will expire in{" "}
                  {expiryDays} day
                  {expiryDays > 1 ? "s" : ""}
                </p>

                <div className="share-link">
                  <input
                    type="text"
                    value={shareCode}
                    readOnly
                  />

                  <button
                    className="copy-btn"
                    onClick={handleCopy}
                  >
                    Copy
                  </button>
                </div>

                <button
                  className="upload-more"
                  onClick={resetUpload}
                >
                  Upload More Files
                </button>
              </div>
            )}
          </div>

          {/* How it works */}
          <section className="how-it-works">
            <h2>How it works</h2>

            <div className="steps-grid">
              {[
                {
                  title: "Upload your files",
                  desc: "Drag & drop or select photos, videos, or documents",
                },
                {
                  title: "Set expiry time",
                  desc: "Choose how long your files stay available (1-7 days)",
                },
                {
                  title: "Get shareable link",
                  desc: "Instantly receive a unique link to share with anyone",
                },
                {
                  title: "Auto-delete",
                  desc: "Files are automatically removed after expiry for privacy",
                },
              ].map((step, index) => (
                <div
                  className="step-card"
                  key={index}
                >
                  <div className="step-icon">
                    {index === 0 && (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                        />
                      </svg>
                    )}

                    {index === 1 && (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    )}

                    {index === 2 && (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
                        />
                      </svg>
                    )}

                    {index === 3 && (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                    )}
                  </div>

                  <h3>{step.title}</h3>

                  <p>{step.desc}</p>
                </div>
              ))}
            </div>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer>
        <p>
          ©{currentYear} TempShare. Files are
          stored securely and deleted after expiry.
        </p>
      </footer>
    </div>
  );
};

export default TempShare;