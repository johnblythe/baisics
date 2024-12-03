import { IntakeFormData } from "@/app/start/actions";
import { convertHeightToFeetAndInches } from "@/utils/formatting";
import { User } from "@prisma/client";
import { useState } from "react";

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
}

export function UserProfileDisplay({
  intakeForm,
  images,
  onDeleteImage,
  onEditProfile,
  user: initialUser,
  onRequestUpsell,
}: UserProfileDisplayProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [user, setUser] = useState(initialUser);
  console.log("🚀 ~ initialUser:", initialUser)

  // Create a summary of key information
  const summaryInfo = [
    { label: "Goal", value: intakeForm.trainingGoal.split("_").join(" ") },
    { label: "Schedule", value: `${intakeForm.daysAvailable} days/week` },
    { label: "Experience", value: intakeForm.experienceLevel },
    { label: "Stats", value: `${intakeForm.age}y, ${intakeForm.height && convertHeightToFeetAndInches(intakeForm.height)}, ${intakeForm.weight}lb` },
  ];

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
                {images.length > 0 && (
                  <div className="p-6">
                    <h3 className="text-xl font-semibold mb-4">Progress Pictures</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {images.map((image) => (
                        <div key={image.id} className="relative group">
                          <img
                            src={image.base64Data}
                            alt={image.fileName}
                            className="w-full h-64 object-cover rounded-lg"
                          />
                          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-opacity rounded-lg">
                            <button
                              onClick={() => onDeleteImage(image.id)}
                              className="absolute top-2 right-2 p-2 bg-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                              title="Delete image"
                            >
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
                  </div>
                )}
                
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
