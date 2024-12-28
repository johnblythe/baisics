import { useDropzone } from "react-dropzone";
import { useCallback, useEffect } from "react";

interface ImageDropzoneProps {
  onFilesChange: (files: File[]) => void;
  files: File[];
  className?: string;
  onUploadImages?: (files: File[]) => Promise<void>;
}

const compressImage = async (file: File): Promise<File> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 1200;
        const MAX_HEIGHT = 1200;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (blob) {
              const compressedFile = new File([blob], file.name, {
                type: 'image/jpeg',
                lastModified: Date.now(),
              });
              resolve(compressedFile);
            } else {
              reject(new Error('Canvas to Blob conversion failed'));
            }
          },
          'image/jpeg',
          0.7  // compression quality
        );
      };
    };
    reader.onerror = (error) => reject(error);
  });
};

export function ImageDropzone({ onFilesChange, files, className = '', onUploadImages }: ImageDropzoneProps) {
  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      console.log(" ImageDropzone onDrop - acceptedFiles:", acceptedFiles);
      try {
        const compressedFiles = await Promise.all(
          acceptedFiles.map(file => compressImage(file))
        );
        console.log("🚀 ImageDropzone onDrop - compressedFiles:", compressedFiles);
        
        // Update local state
        onFilesChange([...files, ...compressedFiles].slice(0, 10));
        
        // Immediately trigger upload for new files
        if (compressedFiles.length > 0 && onUploadImages) {
          console.log("🚀 ImageDropzone - Triggering upload");
          await onUploadImages(compressedFiles);
        }
      } catch (error) {
        console.error('Error in ImageDropzone onDrop:', error);
      }
    },
    [files, onFilesChange, onUploadImages]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".jpeg", ".jpg", ".png", ".gif"],
    },
    maxSize: 5242880, // 5MB
  });

  useEffect(() => {
    // Cleanup function to revoke object URLs
    return () => {
      files.forEach(file => {
        URL.revokeObjectURL(URL.createObjectURL(file));
      });
    };
  }, [files]);

  return (
    <div className={`mt-4`}>
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
        <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {files.map((file) => (
            <div key={file.name} className="relative group">
              <img
                src={URL.createObjectURL(file)}
                alt={file.name}
                className="w-full h-32 object-cover rounded-lg"
              />
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onFilesChange(files.filter(f => f.name !== file.name));
                }}
                className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
