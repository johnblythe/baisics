import {
  IntakeFormData,
  Sex,
  TrainingGoal,
  TrainingPreference,
} from "@/app/start/actions";
import { useState } from "react";
import { ImageDropzone } from "./ImageDropzone";

interface IntakeFormProps {
  initialData: IntakeFormData | null;
  onSubmit: (data: IntakeFormData & { files?: File[] }) => Promise<void>;
  isSubmitting: boolean;
}

const SAMPLE_PROFILES = {
  athleteProfile: {
    sex: "male" as Sex,
    trainingGoal: "muscle_gain" as TrainingGoal,
    daysAvailable: 5,
    trainingPreferences: [
      "resistance",
      "free weights",
      "plyometrics",
      "running",
    ] as TrainingPreference[],
    age: 25,
    weight: 180,
    height: 72,
    additionalInfo:
      "I was an athlete in college but have since lost my physique. famliar with weights and lifting, but need some help with the programming and diet to do some body recomp and get back to my best.",
    dailyBudget: 60,
  },
  beginnerProfile: {
    sex: "female" as Sex,
    trainingGoal: "weight_loss" as TrainingGoal,
    daysAvailable: 3,
    trainingPreferences: ["machines", "cardio", "yoga"] as TrainingPreference[],
    age: 35,
    weight: 150,
    height: 65,
    additionalInfo: "i'm new to fitness. looking to establish healthy habits",
    dailyBudget: 30,
  },
  seniorProfile: {
    sex: "other" as Sex,
    trainingGoal: "endurance" as TrainingGoal,
    daysAvailable: 4,
    trainingPreferences: [
      "resistance",
      "machines",
      "yoga",
    ] as TrainingPreference[],
    age: 65,
    weight: 160,
    height: 68,
    additionalInfo: "Focus on maintaining mobility and independence",
    dailyBudget: 45,
  },
};

export function IntakeForm({
  initialData,
  onSubmit,
  isSubmitting,
}: IntakeFormProps) {
  const [formData, setFormData] = useState<IntakeFormData>(
    initialData || SAMPLE_PROFILES.athleteProfile
  );
  const [files, setFiles] = useState<File[]>([]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit({ ...formData, files });
  };

  return (
    <div className="max-w-2xl mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold mb-6">Training Profile Setup</h2>

      {/* Profile Selection Buttons */}
      <div className="flex gap-2 mb-6">
        {Object.entries(SAMPLE_PROFILES).map(([key, profile]) => (
          <button
            key={key}
            type="button"
            onClick={() => setFormData(profile)}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            Load{" "}
            {key
              .replace(/Profile$/, "")
              .replace(/([A-Z])/g, " $1")
              .trim()}{" "}
            Profile
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Sex Selection */}
        <div>
          <label className="block text-sm font-medium mb-2">Sex</label>
          <select
            value={formData.sex}
            onChange={(e) =>
              setFormData({ ...formData, sex: e.target.value as Sex })
            }
            className="w-full p-2 border rounded-md"
            required
          >
            <option value="">Select...</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </select>
        </div>

        {/* Training Goal */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Training Goal
          </label>
          <select
            value={formData.trainingGoal}
            onChange={(e) =>
              setFormData({
                ...formData,
                trainingGoal: e.target.value as TrainingGoal,
              })
            }
            className="w-full p-2 border rounded-md"
            required
          >
            <option value="">Select...</option>
            <option value="weight_loss">Weight Loss</option>
            <option value="muscle_gain">Muscle Gain</option>
            <option value="strength">Strength</option>
            <option value="endurance">Endurance</option>
          </select>
        </div>

        {/* Days Available */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Days Available Per Week
          </label>
          <input
            type="number"
            min="1"
            max="7"
            value={formData.daysAvailable}
            onChange={(e) =>
              setFormData({
                ...formData,
                daysAvailable: parseInt(e.target.value),
              })
            }
            className="w-full p-2 border rounded-md"
            required
          />
        </div>

        {/* Daily Budget */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Daily Budget (minutes)
          </label>
          <input
            type="number"
            value={formData.dailyBudget}
            onChange={(e) =>
              setFormData({
                ...formData,
                dailyBudget: parseInt(e.target.value),
              })
            }
            className="w-full p-2 border rounded-md"
            required
          />
        </div>

        {/* Age */}
        <div>
          <label className="block text-sm font-medium mb-2">Age</label>
          <input
            type="number"
            value={formData.age}
            onChange={(e) =>
              setFormData({ ...formData, age: parseInt(e.target.value) })
            }
            className="w-full p-2 border rounded-md"
            required
          />
        </div>

        {/* Weight */}
        <div>
          <label className="block text-sm font-medium mb-2">Weight</label>
          <input
            type="number"
            value={formData.weight}
            onChange={(e) =>
              setFormData({ ...formData, weight: parseInt(e.target.value) })
            }
            className="w-full p-2 border rounded-md"
            required
          />
        </div>

        {/* Height */}
        <div>
          <label className="block text-sm font-medium mb-2">Height</label>
          <input
            type="number"
            value={formData.height}
            onChange={(e) =>
              setFormData({ ...formData, height: parseInt(e.target.value) })
            }
            className="w-full p-2 border rounded-md"
            required
          />
        </div>

        {/* Training Preferences */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Training Preferences
          </label>
          <div className="grid grid-cols-2 gap-2">
            {[
              {
                value: "resistance",
                label: "Resistance Training",
              },
              {
                value: "free weights",
                label: "Free Weights",
              },
              { value: "machines", label: "Machines" },
              {
                value: "kettlebell",
                label: "Kettlebell",
              },
              { value: "running", label: "Running" },
              {
                value: "plyometrics",
                label: "Plyometrics",
              },
              { value: "yoga", label: "Yoga" },
              { value: "cardio", label: "Cardio" },
            ].map(({ value, label }) => (
              <label key={value} className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.trainingPreferences.includes(
                    value as TrainingPreference
                  )}
                  onChange={(e) => {
                    const newPrefs = e.target.checked
                      ? [...formData.trainingPreferences, value]
                      : formData.trainingPreferences.filter((p) => p !== value);
                    setFormData({
                      ...formData,
                      trainingPreferences: newPrefs as TrainingPreference[],
                    });
                  }}
                />
                <span className="ml-2">{label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Additional Info */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Additional Info
          </label>
          <textarea
            value={formData.additionalInfo}
            onChange={(e) =>
              setFormData({ ...formData, additionalInfo: e.target.value })
            }
            className="w-full p-2 border rounded-md"
            rows={3}
          />
        </div>

        <ImageDropzone onFilesChange={setFiles} files={files} />

        <button
          type="submit"
          className="w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          Submit
        </button>
      </form>
    </div>
  );
}
