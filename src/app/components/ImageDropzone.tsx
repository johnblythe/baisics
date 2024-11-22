import { useDropzone } from "react-dropzone";
import { useCallback } from "react";

interface ImageDropzoneProps {
  onFilesChange: (files: File[]) => void;
  files: File[];
}

export function ImageDropzone({ onFilesChange, files }: ImageDropzoneProps) {
  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      const newFiles = [...files, ...acceptedFiles].slice(0, 10);
      onFilesChange(newFiles);
    },
    [onFilesChange, files]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".jpeg", ".jpg", ".png", ".gif"],
    },
    maxSize: 5242880, // 5MB
  });

  return (
    <div className="mt-4">
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer
          ${isDragActive ? "border-blue-500 bg-blue-50" : "border-gray-300"}`}
      >
        <input {...getInputProps()} />
        {isDragActive ? (
          <p>Drop the files here ...</p>
        ) : (
          <p>Drag & drop images here, or click to select files</p>
        )}
      </div>
      {files.length > 0 && (
        <div className="mt-4">
          <p className="text-sm text-gray-600">Selected files:</p>
          <ul className="list-disc pl-5">
            {files.map((file) => (
              <li key={file.name} className="text-sm">
                {file.name}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
