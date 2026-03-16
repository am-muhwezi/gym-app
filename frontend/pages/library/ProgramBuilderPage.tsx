import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { programService } from '../../services/programService';
import type { ProgramDuration, ExerciseModality, ExperienceLevel } from '../../types';

const ProgramBuilderPage: React.FC = () => {
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [duration, setDuration] = useState<ProgramDuration>('8_weeks');
  const [modality, setModality] = useState<ExerciseModality>('strength');
  const [experienceLevel, setExperienceLevel] = useState<ExperienceLevel>('intermediate');
  const [goals, setGoals] = useState('');
  const [requirements, setRequirements] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!name.trim()) {
      alert('Please enter a program name');
      return;
    }

    try {
      setSaving(true);
      const payload = {
        name,
        description,
        duration,
        modality,
        experience_level: experienceLevel,
        goals,
        requirements,
      };

      const program = await programService.createProgram(payload);

      // Redirect to program details/configuration page
      alert('Program created! You can now configure weeks and days in the edit view.');
      navigate('/library/programs');
    } catch (error) {
      console.error('Error saving program:', error);
      alert('Failed to save program');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-6 bg-dark-900 min-h-screen">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Create Program</h1>
          <p className="text-gray-400 mt-2">Create a multi-week training program</p>
        </div>
        <button
          onClick={() => navigate('/library/programs')}
          className="px-4 py-2 text-gray-400 hover:text-white"
        >
          Cancel
        </button>
      </div>

      {/* Form */}
      <div className="max-w-3xl mx-auto">
        <div className="bg-dark-800 border border-dark-700 rounded-lg p-8">
          <div className="space-y-6">
            {/* Basic Info */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Program Name *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2 bg-dark-900 text-white border border-dark-700 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent placeholder-gray-500"
                placeholder="e.g., 8-Week Strength Builder"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                className="w-full px-4 py-2 bg-dark-900 text-white border border-dark-700 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent placeholder-gray-500"
                placeholder="Describe the program and its focus..."
              />
            </div>

            {/* Program Settings */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Duration *
                </label>
                <select
                  value={duration}
                  onChange={(e) => setDuration(e.target.value as ProgramDuration)}
                  className="w-full px-4 py-2 bg-dark-900 text-white border border-dark-700 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent"
                >
                  <option value="4_weeks">4 Weeks</option>
                  <option value="8_weeks">8 Weeks</option>
                  <option value="12_weeks">12 Weeks</option>
                  <option value="16_weeks">16 Weeks</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Modality *
                </label>
                <select
                  value={modality}
                  onChange={(e) => setModality(e.target.value as ExerciseModality)}
                  className="w-full px-4 py-2 bg-dark-900 text-white border border-dark-700 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent"
                >
                  <option value="strength">Strength</option>
                  <option value="cardio">Cardio</option>
                  <option value="conditioning">Conditioning</option>
                  <option value="power">Power</option>
                  <option value="weightlifting">Weightlifting</option>
                  <option value="yoga">Yoga</option>
                  <option value="mobility">Mobility</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Experience Level *
                </label>
                <select
                  value={experienceLevel}
                  onChange={(e) => setExperienceLevel(e.target.value as ExperienceLevel)}
                  className="w-full px-4 py-2 bg-dark-900 text-white border border-dark-700 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent"
                >
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </div>
            </div>

            {/* Goals */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Program Goals
              </label>
              <textarea
                value={goals}
                onChange={(e) => setGoals(e.target.value)}
                rows={3}
                className="w-full px-4 py-2 bg-dark-900 text-white border border-dark-700 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent placeholder-gray-500"
                placeholder="What will clients achieve with this program?"
              />
            </div>

            {/* Requirements */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Equipment & Requirements
              </label>
              <textarea
                value={requirements}
                onChange={(e) => setRequirements(e.target.value)}
                rows={3}
                className="w-full px-4 py-2 bg-dark-900 text-white border border-dark-700 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent placeholder-gray-500"
                placeholder="What equipment or prerequisites are needed?"
              />
            </div>

            {/* Info Box */}
            <div className="bg-brand-primary/10 border border-brand-primary/20 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <svg className="w-5 h-5 text-brand-primary mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div className="text-sm text-brand-primary">
                  <p className="font-medium mb-1">Next Steps</p>
                  <p>After creating the program, you'll be able to configure weeks and assign workouts to specific days. This basic version creates the program structure - full week/day configuration can be added through the API or enhanced UI.</p>
                </div>
              </div>
            </div>

            {/* Save Button */}
            <button
              onClick={handleSave}
              disabled={saving}
              className="w-full px-6 py-3 bg-brand-primary text-white rounded-lg hover:bg-brand-primary/80 transition-colors font-medium disabled:opacity-50"
            >
              {saving ? 'Creating...' : 'Create Program'}
            </button>
          </div>
        </div>

        {/* Preview */}
        <div className="mt-6 bg-dark-800 border border-dark-700 rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4 text-white">Program Preview</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-400">Name:</span>
              <span className="font-medium text-white">{name || '(Not set)'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Duration:</span>
              <span className="font-medium text-white">
                {duration.replace('_', ' ').charAt(0).toUpperCase() + duration.slice(1).replace('_', ' ')}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Modality:</span>
              <span className="font-medium text-white">{modality.charAt(0).toUpperCase() + modality.slice(1)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Experience Level:</span>
              <span className="font-medium text-white">{experienceLevel.charAt(0).toUpperCase() + experienceLevel.slice(1)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProgramBuilderPage;
