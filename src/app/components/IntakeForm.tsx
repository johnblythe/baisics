import { IntakeFormData, Sex, TrainingGoal } from "@/app/start/actions";
import { useState } from "react";

interface IntakeFormProps {
  initialData?: IntakeFormData;
  onSubmit: (data: IntakeFormData) => Promise<void>;
}

export function IntakeForm({ initialData, onSubmit }: IntakeFormProps) {
  const [formData, setFormData] = useState<IntakeFormData>(
    initialData || {
      sex: "male" as Sex,
      trainingGoal: "muscle_gain" as TrainingGoal,
      daysAvailable: 3,
      trainingPreferences: ["resistance"],
      additionalInfo: "",
    }
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(formData);
  };

  return (
    <div className="max-w-2xl mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold mb-6">Training Profile Setup</h2>
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
              setFormData({ ...formData, trainingGoal: e.target.value })
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
                  checked={formData.trainingPreferences.includes(value)}
                  onChange={(e) => {
                    const newPrefs = e.target.checked
                      ? [...formData.trainingPreferences, value]
                      : formData.trainingPreferences.filter((p) => p !== value);
                    setFormData({ ...formData, trainingPreferences: newPrefs });
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
            rows="3"
          />
        </div>

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