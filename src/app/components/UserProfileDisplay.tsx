import { IntakeFormData } from "@/app/start/actions";

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
}

export function UserProfileDisplay({
  intakeForm,
  images,
  onDeleteImage,
  onEditProfile,
}: UserProfileDisplayProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md">
      {/* Profile Header */}
      <div className="p-6 border-gray-200 dark:border-gray-700">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">User Profile</h2>
          <button
            onClick={onEditProfile}
            className="px-4 py-2 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          >
            Edit Profile
          </button>
        </div>

        {/* Profile Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Progress Pictures */}
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
                Sex
              </h3>
              <p className="mt-1 capitalize">{intakeForm.sex}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Training Goal
              </h3>
              <p className="mt-1 capitalize">{intakeForm.trainingGoal}</p>
            </div>
          </div>
          <div className="space-y-3">
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
      </div>
    </div>
  );
}
