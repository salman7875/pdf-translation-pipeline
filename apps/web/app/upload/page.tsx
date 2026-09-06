"use client";

import React, { useState, useCallback } from "react";
import { useDropzone, FileRejection } from "react-dropzone";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  UploadCloud,
  FileText,
  X,
  CheckCircle2,
  AlertCircle,
  FolderOpen,
  ArrowRight,
} from "lucide-react";

interface UploadingFile {
  id: string;
  file: File;
  progress: number;
  status: "uploading" | "completed" | "error";
  errorMessage?: string;
}

const MAX_FILE_SIZE = 10 * 1024 * 1024;

export default function DocumentWorkspacePage() {
  const [files, setFiles] = useState<UploadingFile[]>([]);

  const uploadFile = (fileItem: UploadingFile) => {
    let currentProgress = 0;
    const interval = setInterval(() => {
      currentProgress += 25;
      if (currentProgress >= 100) {
        clearInterval(interval);
        setFiles((prev) =>
          prev.map((item) =>
            item.id === fileItem.id
              ? { ...item, progress: 100, status: "completed" }
              : item,
          ),
        );
      } else {
        setFiles((prev) =>
          prev.map((item) =>
            item.id === fileItem.id
              ? { ...item, progress: currentProgress }
              : item,
          ),
        );
      }
    }, 250);
  };

  const onDrop = useCallback(
    (acceptedFiles: File[], rejectedFiles: FileRejection[]) => {
      const newFiles: UploadingFile[] = acceptedFiles.map((file) => ({
        id: `${file.name}-${Date.now()}`,
        file,
        progress: 0,
        status: "uploading",
      }));

      const rejectedItems: UploadingFile[] = rejectedFiles.map((rejection) => ({
        id: `${rejection.file.name}-${Date.now()}`,
        file: rejection.file,
        progress: 0,
        status: "error",
        errorMessage:
          rejection.errors[0]?.message || "Invalid file type or size",
      }));

      setFiles((prev) => [...prev, ...newFiles, ...rejectedItems]);
      newFiles.forEach((fileItem) => uploadFile(fileItem));
    },
    [],
  );

  const removeFile = (id: string) => {
    setFiles((prev) => prev.filter((item) => item.id !== id));
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    maxSize: MAX_FILE_SIZE,
    accept: {
      "application/pdf": [".pdf"],
      "application/msword": [".doc"],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
        [".docx"],
      "image/jpeg": [".jpg", ".jpeg"],
      "image/png": [".png"],
    },
  });

  const completedCount = files.filter((f) => f.status === "completed").length;

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950 p-6 md:p-12 flex flex-col justify-between">
      <div className="max-w-4xl mx-auto w-full space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b pb-6 dark:border-slate-800">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Document Upload
            </h1>
            <p className="text-xs text-muted-foreground mt-1">
              Add your files to the workspace processing pipeline.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" className="text-xs">
              <FolderOpen className="w-3.5 h-3.5 mr-2" /> Select Folder
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="bg-card shadow-xs border-muted/60">
            <CardContent className="p-4">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Storage Used
              </p>
              <p className="text-2xl font-bold text-foreground mt-1">
                1.2 GB{" "}
                <span className="text-xs font-normal text-muted-foreground">
                  / 10 GB
                </span>
              </p>
            </CardContent>
          </Card>
          <Card className="bg-card shadow-xs border-muted/60">
            <CardContent className="p-4">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Active Batch
              </p>
              <p className="text-2xl font-bold text-foreground mt-1">
                {files.length}{" "}
                <span className="text-xs font-normal text-muted-foreground">
                  Files
                </span>
              </p>
            </CardContent>
          </Card>
          <Card className="bg-card shadow-xs border-muted/60">
            <CardContent className="p-4">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Upload Status
              </p>
              <p className="text-2xl font-bold text-foreground mt-1">
                {completedCount} / {files.length}{" "}
                <span className="text-xs font-normal text-muted-foreground">
                  Done
                </span>
              </p>
            </CardContent>
          </Card>
        </div>

        <Card className="shadow-xs border bg-card">
          <CardHeader className="pb-4">
            <CardTitle className="text-base font-semibold">
              Upload Portal
            </CardTitle>
            <CardDescription className="text-xs">
              Drag and drop your project assets here. Max size 10MB per file.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div
              {...getRootProps()}
              className={`flex flex-col items-center justify-center p-10 border-2 border-dashed rounded-xl cursor-pointer transition-all ${
                isDragActive
                  ? "border-primary bg-primary/5 scale-[0.99]"
                  : "border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/20"
              }`}
            >
              <input {...getInputProps()} />
              <div className="p-3 bg-muted/60 rounded-full mb-3 text-muted-foreground">
                <UploadCloud className="w-6 h-6" />
              </div>
              <p className="text-sm font-semibold text-foreground text-center">
                {isDragActive
                  ? "Drop files now"
                  : "Click to select or drag and drop"}
              </p>
              <p className="mt-1 text-xs text-muted-foreground text-center">
                Supports PDF, DOCX, PNG, JPG (up to 10MB)
              </p>
            </div>

            {files.length > 0 && (
              <div className="space-y-3 pt-2 border-t dark:border-slate-800">
                <div className="flex items-center justify-between text-xs font-medium text-muted-foreground px-1">
                  <span>Uploading Queue ({files.length})</span>
                  <button
                    onClick={() => setFiles([])}
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Clear Queue
                  </button>
                </div>

                <div className="space-y-2.5 max-h-70 overflow-y-auto pr-1">
                  {files.map(({ id, file, progress, status, errorMessage }) => (
                    <div
                      key={id}
                      className="flex items-center justify-between p-3 border rounded-lg bg-slate-50/50 dark:bg-slate-900/40 text-xs"
                    >
                      <div className="flex items-center space-x-3 w-full mr-3 min-w-0">
                        <FileText className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                        <div className="flex-1 min-w-0 space-y-1">
                          <div className="flex items-center justify-between gap-2">
                            <p className="font-medium truncate text-foreground">
                              {file.name}
                            </p>
                            <span className="text-[11px] text-muted-foreground flex-shrink-0">
                              {(file.size / (1024 * 1024)).toFixed(2)} MB
                            </span>
                          </div>

                          {status === "uploading" && (
                            <div className="space-y-1">
                              <Progress value={progress} className="h-1" />
                            </div>
                          )}

                          {status === "completed" && (
                            <Badge
                              variant="outline"
                              className="text-[10px] h-5 font-normal text-emerald-600 border-emerald-200 bg-emerald-50 dark:bg-emerald-950/30 dark:border-emerald-800"
                            >
                              <CheckCircle2 className="w-2.5 h-2.5 mr-1" />{" "}
                              Uploaded
                            </Badge>
                          )}

                          {status === "error" && (
                            <span className="text-[11px] text-destructive flex items-center">
                              <AlertCircle className="w-2.5 h-2.5 mr-1" />
                              {errorMessage}
                            </span>
                          )}
                        </div>
                      </div>

                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-muted-foreground hover:text-foreground flex-shrink-0"
                        onClick={() => removeFile(id)}
                      >
                        <X className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <Button size="sm" disabled={completedCount === 0} className="gap-2">
              Continue <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
