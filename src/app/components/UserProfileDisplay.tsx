import { IntakeFormData } from "@/app/start/actions";
import { convertHeightToFeetAndInches } from "@/utils/formatting";
import { User } from "@prisma/client";
import { useState, useEffect } from "react";
import { useDropzone } from "react-dropzone";

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

  // Add dropzone configuration
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      "image/*": [".jpeg", ".jpg", ".png", ".gif"],
    },
    maxSize: 5242880, // 5MB
  });

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

              {/* Progress Pictures Section - Enhanced */}
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
                  
                  {images.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {images.map((image) => (
                        <div 
                          key={image.id} 
                          className="relative group z-10 bg-white dark:bg-gray-800 rounded-2xl p-2 shadow-lg hover:shadow-xl transition-all duration-300"
                        >
                          <div className="relative overflow-hidden rounded-xl cursor-pointer">
                            <img
                              src={image.base64Data}
                              alt={image.fileName}
                              className={`w-full h-48 object-cover object-top hover:brightness-110 transition-all duration-300 ${
                                deletingImageIds.has(image.id) ? 'opacity-50' : ''
                              }`}
                              onClick={() => setSelectedImage(image)}
                            />
                            <div className="absolute top-2 right-2 z-30">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteImage(image.id);
                                }}
                                disabled={deletingImageIds.has(image.id)}
                                className={`p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-lg 
                                  hover:bg-red-50 transition-colors ${
                                  deletingImageIds.has(image.id) 
                                    ? 'opacity-50 cursor-not-allowed' 
                                    : 'hover:text-red-500'
                                  }`}
                                title="Delete image"
                              >
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  className="h-5 w-5"
                                  viewBox="0 0 20 20"
                                  fill="currentColor"
                                >
                                  <path
                                    fillRule="evenodd"
                                    d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                                    clipRule="evenodd"
                                  />
                                </svg>
                              </button>
                            </div>
                          </div>
                          {image.aiDescription && (
                            <div className="p-3 text-sm text-gray-600 dark:text-gray-300">
                              {image.aiDescription}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div
                      {...getRootProps()}
                      className={`
                        relative overflow-hidden rounded-2xl p-8 text-center cursor-pointer
                        bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20
                        border-2 border-dashed transition-all duration-200 ease-in-out
                        ${isDragActive 
                          ? 'border-blue-500 shadow-lg scale-[0.99]' 
                          : 'border-gray-300 hover:border-blue-400 hover:shadow-md'
                        }
                      `}
                    >
                      <input {...getInputProps()} />
                      <div className="space-y-4">
                        <div className="mx-auto w-20 h-20 text-blue-500 dark:text-blue-400">
                          <svg 
                            xmlns="http://www.w3.org/2000/svg" 
                            fill="none" 
                            viewBox="0 0 24 24" 
                            strokeWidth={1.5} 
                            stroke="currentColor"
                            className="w-full h-full"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                          </svg>
                        </div>
                        <div>
                          <p className="text-xl font-semibold text-gray-700 dark:text-gray-200">
                            {isDragActive 
                              ? 'Drop to upload!' 
                              : 'Add Progress Pictures'
                            }
                          </p>
                          <p className="mt-2 text-gray-500 dark:text-gray-400">
                            Drag and drop your images here, or click to select files
                          </p>
                          <p className="mt-1 text-sm text-gray-400">
                            PNG, JPG, GIF up to 5MB
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
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
