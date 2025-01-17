import React from 'react';
import FormSection from './FormSection';
import { Photo } from './shared';

interface ProgressPhotosProps {
  photos: Photo[];
  onChange: (photos: Photo[]) => void;
}

export const ProgressPhotos: React.FC<ProgressPhotosProps> = ({ photos, onChange }) => {
  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const photoTypes = ['FRONT', 'BACK', 'SIDE_LEFT', 'SIDE_RIGHT'] as const;
    
    const newPhotos = await Promise.all(files.map(async (file, index) => {
      const base64Data = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.readAsDataURL(file);
      });
      
      return {
        type: photoTypes[index] || 'CUSTOM',
        file,
        base64Data
      };
    }));
    
    onChange([...photos, ...newPhotos].slice(0, 8)); // Limit to 8 photos
  };

  const removePhoto = (index: number) => {
    const newPhotos = [...photos];
    newPhotos.splice(index, 1);
    onChange(newPhotos);
  };

  return (
    <FormSection title="Progress Photos">
      {/* Photo Instructions */}
      <div className="mb-6 bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
        <h3 className="text-sm font-medium text-blue-800 dark:text-blue-300 mb-2">Tips for Great Progress Photos</h3>
        <ul className="text-sm text-blue-700 dark:text-blue-400 space-y-2">
          <li className="flex items-start">
            <span className="mr-2">•</span>
            <span>Take photos in consistent lighting and location</span>
          </li>
          <li className="flex items-start">
            <span className="mr-2">•</span>
            <span>Wear fitted clothing that shows your body shape</span>
          </li>
          <li className="flex items-start">
            <span className="mr-2">•</span>
            <span>Include front, back, and both side views for complete progress tracking</span>
          </li>
          <li className="flex items-start">
            <span className="mr-2">•</span>
            <span>Stand in a neutral pose with arms slightly away from body</span>
          </li>
        </ul>
      </div>

      {/* Photo Upload Area */}
      <div className="relative">
        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all duration-200
            ${photos.length > 0
              ? 'border-green-300 dark:border-green-700 bg-green-50 dark:bg-green-900/20' 
              : 'border-gray-300 dark:border-gray-700 hover:border-indigo-300 dark:hover:border-indigo-700 hover:bg-indigo-50 dark:hover:bg-indigo-900/20'}`}
        >
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handlePhotoUpload}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
          
          <div className="space-y-4">
            <div className="flex justify-center">
              <svg className="w-12 h-12 text-gray-400 dark:text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <p className="text-lg font-medium text-gray-900 dark:text-white">
                Drop your progress photos here
              </p>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                or click to select files
              </p>
            </div>
          </div>
        </div>

        {/* Photo Preview Grid */}
        {photos.length > 0 && (
          <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {photos.map((photo, index) => (
              <div key={index} className="relative group aspect-square">
                <img
                  src={URL.createObjectURL(photo.file!)}
                  alt={`Progress photo ${index + 1}`}
                  className="w-full h-full object-cover rounded-lg"
                />
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all duration-200 rounded-lg">
                  <button
                    type="button"
                    onClick={() => removePhoto(index)}
                    className="absolute top-2 right-2 p-1 bg-white rounded-full shadow-sm opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-gray-100"
                  >
                    <svg className="w-4 h-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <div className="absolute bottom-2 left-2 px-2 py-1 bg-black bg-opacity-50 rounded text-white text-xs">
                  {photo.type.replace('_', ' ').toLowerCase()}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </FormSection>
  );
};

export default ProgressPhotos; 