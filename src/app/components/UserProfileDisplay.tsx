import { IntakeFormData } from "@/app/start/actions";
import { convertHeightToFeetAndInches } from "@/utils/formatting";
import { User } from "@prisma/client";
import { useState } from "react";
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

  // Create a summary of key information
  const summaryInfo = [
    { label: "Goal", value: intakeForm.trainingGoal.split("_").join(" ") },
    { label: "Schedule", value: `${intakeForm.daysAvailable} days/week` },
    { label: "Experience", value: intakeForm.experienceLevel },
    { label: "Stats", value: `${intakeForm.age}y, ${intakeForm.height && convertHeightToFeetAndInches(intakeForm.height)}, ${intakeForm.weight}lb` },
  ];

  // Add dropzone configuration
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      "image/*": [".jpeg", ".jpg", ".png", ".gif"],
    },
    maxSize: 5242880, // 5MB
  });

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

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md transition-all duration-300">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center space-x-3">
              <h3 className="text-xl font-bold">Your Profile</h3>
              {user && (
                <span className={`px-2 py-1 text-xs rounded-full ${
                  user.isPremium 
                    ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white' 
                    : 'bg-blue-100 text-blue-800'
                }`}>
                  {user.isPremium ? 'Premium' : 'Freemium'}
                </span>
              )}
            </div>
            <div className="space-x-2">
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="px-3 py-1 text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200"
              >
                {isExpanded ? (
                  <span className="flex items-center">
                    Show Less
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clipRule="evenodd" />
                    </svg>
                  </span>
                ) : (
                  <span className="flex items-center">
                    Show More
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </span>
                )}
              </button>
              {!isExpanded && (
                <button
                  onClick={onEditProfile}
                  className="px-4 py-2 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                >
                  Edit Profile
                </button>
              )}
            </div>
          </div>

          {/* Summary View */}
          {!isExpanded && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {summaryInfo.map(({ label, value }) => (
                <div key={label} className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="text-sm text-gray-500 dark:text-gray-400">{label}</div>
                  <div className="font-medium mt-1 capitalize">{value}</div>
                </div>
              ))}
            </div>
          )}

          {/* Expanded View */}
          {isExpanded && (
            <div className="mt-6">
              {/* Original detailed content */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Progress Pictures Section */}
                <div className="p-6">
                  <h3 className="text-xl font-semibold mb-4">Progress Pictures</h3>
                  {images.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {images.map((image) => (
                        <div key={image.id} className="relative group">
                          <img
                            src={image.base64Data}
                            alt={image.fileName}
                            className={`w-full h-64 object-cover rounded-lg ${
                              deletingImageIds.has(image.id) ? 'opacity-50' : ''
                            }`}
                          />
                          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-opacity rounded-lg">
                            <button
                              onClick={() => handleDeleteImage(image.id)}
                              disabled={deletingImageIds.has(image.id)}
                              className={`absolute top-2 right-2 p-2 bg-white rounded-full 
                                ${deletingImageIds.has(image.id) 
                                  ? 'opacity-50 cursor-not-allowed' 
                                  : 'opacity-0 group-hover:opacity-100 transition-opacity'
                                }`}
                              title="Delete image"
                            >
                              {deletingImageIds.has(image.id) ? (
                                <svg className="animate-spin h-5 w-5 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                              ) : (
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  className="h-5 w-5 text-red-500"
                                  viewBox="0 0 20 20"
                                  fill="currentColor"
                                >
                                  <path
                                    fillRule="evenodd"
                                    d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                                    clipRule="evenodd"
                                  />
                                </svg>
                              )}
                            </button>
                          </div>
                          {image.aiDescription && (
                            <div className="absolute bottom-0 left-0 right-0 p-2 bg-black bg-opacity-50 text-white text-sm rounded-b-lg">
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
                        border-2 border-dashed rounded-lg p-8 text-center cursor-pointer
                        transition-all duration-200 ease-in-out
                        ${isDragActive 
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                          : 'border-gray-300 hover:border-blue-400 dark:border-gray-600'
                        }
                      `}
                    >
                      <input {...getInputProps()} />
                      <div className="space-y-4">
                        <div className="mx-auto w-16 h-16 text-gray-400">
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
                          <p className="text-lg font-medium text-gray-700 dark:text-gray-300">
                            {isDragActive 
                              ? 'Drop your images here...' 
                              : 'Add Progress Pictures'
                            }
                          </p>
                          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                            Drag and drop your images here, or click to select files
                          </p>
                          <p className="mt-1 text-xs text-gray-400">
                            PNG, JPG, GIF up to 5MB
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-3">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      Age
                    </h3>
                    <p className="mt-1">{intakeForm.age} years</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      Height
                    </h3>
                    <p className="mt-1">{convertHeightToFeetAndInches(intakeForm.height)}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      Weight
                    </h3>
                    <p className="mt-1">{intakeForm.weight} lbs</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      Sex
                    </h3>
                    <p className="mt-1 capitalize">{intakeForm.sex}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      Training Goal
                    </h3>
                    <p className="mt-1 capitalize">
                      {intakeForm.trainingGoal
                        .split("_")
                        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                        .join(" ")}
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      Experience Level
                    </h3>
                    <p className="mt-1 capitalize">{intakeForm.experienceLevel}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      Days Available
                    </h3>
                    <p className="mt-1">{intakeForm.daysAvailable} days per week</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      Training Preferences
                    </h3>
                    <p className="mt-1 capitalize">
                      {intakeForm.trainingPreferences.join(", ")}
                    </p>
                  </div>
                </div>
              </div>

              {/* Additional Information */}
              {intakeForm.additionalInfo && (
                <div className="mt-6">
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Additional Information
                  </h3>
                  <p className="mt-1 text-gray-700 dark:text-gray-300">
                    {intakeForm.additionalInfo}
                  </p>
                </div>
              )}

              {/* Action Buttons in Expanded View */}
              <div className="mt-6 flex justify-end space-x-2">
                <button
                  onClick={onEditProfile}
                  className="px-4 py-2 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                >
                  Edit Profile
                </button>
                {/* Upsell Button for Freemium Users */}
                {!user.isPremium && (
                  <button
                    onClick={onRequestUpsell}
                    className="px-4 py-2 text-sm bg-purple-500 text-white rounded hover:bg-purple-600 transition-colors"
                  >
                    Upgrade to Premium
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
