import { IntakeFormData } from "@/app/start/actions";
import { convertHeightToFeetAndInches } from "@/utils/formatting";
import { User } from "@prisma/client";
import { useState, useEffect } from "react";
import { ImageDropzone } from "./ImageDropzone";

type UploadedImage = {
  id: string;
  sessionId: string;
  fileName: string;
  base64Data: string;
  createdAt: Date;
  aiDescription?: string;
};

interface UserProfileDisplayProps {
  intakeForm: IntakeFormData;
  images: UploadedImage[];
  onDeleteImage: (imageId: string) => void;
  onEditProfile: () => void;
  user: User;
  onRequestUpsell: () => void;
  onUploadImages?: (files: File[]) => void;
}

export function UserProfileDisplay({
  intakeForm,
  images,
  onDeleteImage,
  onEditProfile,
  user: initialUser,
  onRequestUpsell,
  onUploadImages,
}: UserProfileDisplayProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [user, setUser] = useState(initialUser);
  const [deletingImageIds, setDeletingImageIds] = useState<Set<string>>(new Set());
  const [selectedImage, setSelectedImage] = useState<UploadedImage | null>(null);
  const [uploadFiles, setUploadFiles] = useState<File[]>([]);

  const handleDeleteImage = async (imageId: string) => {
    setDeletingImageIds(prev => new Set([...prev, imageId]));
    try {
      await onDeleteImage(imageId);
    } finally {
      setDeletingImageIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(imageId);
        return newSet;
      });
    }
  };

  // Enhanced summary info with icons and better categorization
  const profileSections = [
    {
      title: "Personal Stats",
      icon: "user",
      items: [
        { label: "Age", value: `${intakeForm.age} years`, icon: "calendar" },
        { label: "Height", value: convertHeightToFeetAndInches(intakeForm.height), icon: "ruler" },
        { label: "Weight", value: `${intakeForm.weight} lbs`, icon: "scale" },
        { label: "Sex", value: intakeForm.sex, icon: "user" },
      ]
    },
    {
      title: "Training Profile",
      icon: "dumbbell",
      items: [
        { label: "Goal", value: intakeForm.trainingGoal.split("_").join(" "), icon: "target" },
        { label: "Experience", value: intakeForm.experienceLevel, icon: "chart" },
        { label: "Schedule", value: `${intakeForm.daysAvailable} days/week`, icon: "calendar" },
        { label: "Preferences", value: intakeForm.trainingPreferences.join(", "), icon: "heart" },
      ]
    }
  ];

  // When files change in the ImageDropzone, process them for upload
  const handleFilesChange = (files: File[]) => {
    console.log("🚀 ~ handleFilesChange ~ files:", files)
    setUploadFiles(files);
  };

  // Handle the upload of images
  const handleUploadImages = async (files: File[]) => {
    console.log("🚀 ~ handleUploadImages ~ files:", files)
    if (!onUploadImages) return;
    try {
      await onUploadImages(files);
      // Clear the upload files after successful upload
      setUploadFiles([]);
    } catch (error) {
      console.error('Error uploading images:', error);
      // Optionally, you could add error handling UI here
    }
  };

  const handleKeyPress = (e: KeyboardEvent) => {
    if (!selectedImage) return;
    
    const currentIndex = images.findIndex(img => img.id === selectedImage.id);
    
    if (e.key === 'ArrowRight' && currentIndex < images.length - 1) {
      setSelectedImage(images[currentIndex + 1]);
    } else if (e.key === 'ArrowLeft' && currentIndex > 0) {
      setSelectedImage(images[currentIndex - 1]);
    } else if (e.key === 'Escape') {
      setSelectedImage(null);
    }
  };

  useEffect(() => {
    if (selectedImage) {
      window.addEventListener('keydown', handleKeyPress);
      return () => window.removeEventListener('keydown', handleKeyPress);
    }
  }, [selectedImage, images]);

  return (
    <div className="space-y-6 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Upsell Banner for Freemium/Anonymous Users */}
      {user && (
        !user.email ? (
          <div 
            onClick={onRequestUpsell}
            className="bg-yellow-100 text-yellow-800 p-4 rounded-lg text-center cursor-pointer hover:bg-yellow-200 transition-colors"
          >
            Get your full, customizable program for free!
          </div>
        ) : !user.isPremium && (
          <div 
            onClick={onRequestUpsell}
            className="bg-yellow-100 text-yellow-800 p-4 rounded-lg text-center cursor-pointer hover:bg-yellow-200 transition-colors"
          >
            Upgrade to Premium for even more features and greater success on your journey!
          </div>
        )
      )}

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
        {/* Profile Header */}
        <div className="relative bg-gradient-to-r from-blue-600 to-purple-600 p-6">
          <div className="flex justify-between items-center">
            <div className="space-y-1">
              <h2 className="text-2xl font-bold text-white">Your Fitness Profile</h2>
              <p className="text-blue-100">Tracking your fitness journey</p>
            </div>
            <div className="flex items-center space-x-3">
              {user && (
                <span className={`px-4 py-2 rounded-full text-sm font-medium ${
                  user.isPremium 
                    ? 'bg-white/10 text-white backdrop-blur-sm' 
                    : 'bg-blue-100 text-blue-800'
                }`}>
                  {user.isPremium ? '✨ Premium Member' : 'Freemium'}
                </span>
              )}
              <button
                onClick={onEditProfile}
                className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-full backdrop-blur-sm transition"
              >
                Edit Profile
              </button>
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-full backdrop-blur-sm transition"
              >
                {isExpanded ? 'Show Less' : 'Show More'}
              </button>
            </div>
          </div>
        </div>

        {/* Profile Content */}
        {isExpanded && (
          <div className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Stats Sections */}
              {profileSections.map((section) => (
                <div key={section.title} className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center space-x-2">
                    <span>{section.title}</span>
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    {section.items.map((item) => (
                      <div key={item.label} className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 hover:shadow-md transition">
                        <div className="text-sm text-gray-500 dark:text-gray-400">{item.label}</div>
                        <div className="font-medium mt-1 capitalize text-gray-900 dark:text-white">{item.value}</div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}

              {/* Progress Pictures Section */}
              <div className="lg:col-span-2">
                <div className="bg-gradient-to-br from-gray-50 to-white dark:from-gray-800/50 dark:to-gray-700/50 rounded-xl p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                      Progress Pictures
                    </h3>
                    <span className="px-4 py-2 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-100 rounded-full text-sm">
                      {images.length} photos
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {images.map((image) => (
                      <div 
                        key={image.id} 
                        className="relative group bg-white dark:bg-gray-800 rounded-2xl p-2 shadow-lg hover:shadow-xl transition-all duration-300"
                      >
                        <div className="relative overflow-hidden rounded-xl cursor-pointer">
                          <img
                            src={image.base64Data}
                            alt={image.fileName}
                            className={`w-full h-48 object-cover object-top transition-all duration-300 ${
                              deletingImageIds.has(image.id) ? 'opacity-50' : ''
                            }`}
                            onClick={() => setSelectedImage(image)}
                          />
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteImage(image.id);
                            }}
                            className="absolute top-2 right-2 p-2 rounded-full bg-red-500 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-red-600"
                            disabled={deletingImageIds.has(image.id)}
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    ))}
                    
                    {/* Dropzone */}
                    <ImageDropzone
                      files={uploadFiles}
                      onFilesChange={setUploadFiles}
                      onUploadImages={handleUploadImages}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Additional Information - Enhanced */}
            {intakeForm.additionalInfo && (
              <div className="mt-6 bg-gray-50 dark:bg-gray-700/50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                  Additional Notes
                </h3>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                  {intakeForm.additionalInfo}
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modal */}
      {selectedImage && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedImage(null)}
        >
          <div 
            className="relative max-w-4xl w-full max-h-[90vh]"
            onClick={e => e.stopPropagation()}
          >
            <img
              src={selectedImage.base64Data}
              alt={selectedImage.fileName}
              className="w-full h-auto max-h-[85vh] object-scale-down rounded-lg"
            />
            <div className="absolute inset-y-0 left-0 right-0 flex items-center justify-between px-4">
              {images.findIndex(img => img.id === selectedImage.id) > 0 && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    const currentIndex = images.findIndex(img => img.id === selectedImage.id);
                    setSelectedImage(images[currentIndex - 1]);
                  }}
                  className="p-2 bg-black bg-opacity-50 rounded-full text-white hover:bg-opacity-75 transition-colors"
                  aria-label="Previous image"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
              )}
              {images.findIndex(img => img.id === selectedImage.id) < images.length - 1 && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    const currentIndex = images.findIndex(img => img.id === selectedImage.id);
                    setSelectedImage(images[currentIndex + 1]);
                  }}
                  className="p-2 bg-black bg-opacity-50 rounded-full text-white hover:bg-opacity-75 transition-colors"
                  aria-label="Next image"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              )}
            </div>
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute top-4 right-4 p-2 bg-black bg-opacity-50 rounded-full text-white hover:bg-opacity-75 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
