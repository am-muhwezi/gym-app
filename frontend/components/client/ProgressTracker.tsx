import React, { useState, useEffect } from 'react';
import { ClientProgress, ProgressCreatePayload } from '../../types';
import { Card, Button, Modal, Input, TextArea, StatCard } from '../ui';
import { progressService } from '../../services';

interface ProgressTrackerProps {
  clientId: string;
}

const ProgressTracker: React.FC<ProgressTrackerProps> = ({ clientId }) => {
  const [progressRecords, setProgressRecords] = useState<ClientProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [comparison, setComparison] = useState<{
    first: ClientProgress | null;
    latest: ClientProgress | null;
    changes: Record<string, number>;
  } | null>(null);
  const [formData, setFormData] = useState<ProgressCreatePayload>({
    recorded_date: new Date().toISOString().split('T')[0],
    weight: undefined,
    body_fat_percentage: undefined,
    muscle_mass: undefined,
    chest: undefined,
    waist: undefined,
    hips: undefined,
    arms: undefined,
    thighs: undefined,
    notes: '',
  });

  useEffect(() => {
    loadProgress();
  }, [clientId]);

  const loadProgress = async () => {
    try {
      setLoading(true);
      const [records, comp] = await Promise.all([
        progressService.getClientProgress(clientId),
        progressService.getProgressComparison(clientId),
      ]);
      setProgressRecords(records);
      setComparison(comp);
    } catch (error) {
      console.error('Error loading progress:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await progressService.createProgress(clientId, formData);
      setShowAddModal(false);
      resetForm();
      loadProgress();
    } catch (error) {
      console.error('Error saving progress:', error);
      alert('Failed to save progress. Please try again.');
    }
  };

  const resetForm = () => {
    setFormData({
      recorded_date: new Date().toISOString().split('T')[0],
      weight: undefined,
      body_fat_percentage: undefined,
      muscle_mass: undefined,
      chest: undefined,
      waist: undefined,
      hips: undefined,
      arms: undefined,
      thighs: undefined,
      notes: '',
    });
  };

  const formatChange = (value: number, unit: string = '') => {
    const sign = value > 0 ? '+' : '';
    return `${sign}${value.toFixed(2)}${unit}`;
  };

  if (loading) {
    return <p className="text-gray-400">Loading progress...</p>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Progress Tracking</h2>
        <Button onClick={() => setShowAddModal(true)}>Record Progress</Button>
      </div>

      {/* Summary Stats */}
      {comparison?.latest && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Weight"
            value={`${comparison.latest.weight || 'N/A'}kg`}
            subtitle={
              comparison.changes.weight
                ? formatChange(comparison.changes.weight, 'kg')
                : undefined
            }
            trend={
              comparison.changes.weight
                ? {
                    value: Math.abs(comparison.changes.weight),
                    isPositive: comparison.changes.weight > 0,
                  }
                : undefined
            }
            icon="⚖️"
          />
          <StatCard
            title="Body Fat %"
            value={`${comparison.latest.body_fat_percentage || 'N/A'}%`}
            subtitle={
              comparison.changes.body_fat_percentage
                ? formatChange(comparison.changes.body_fat_percentage, '%')
                : undefined
            }
            trend={
              comparison.changes.body_fat_percentage
                ? {
                    value: Math.abs(comparison.changes.body_fat_percentage),
                    isPositive: comparison.changes.body_fat_percentage < 0, // Less is better
                  }
                : undefined
            }
            icon="📊"
          />
          <StatCard
            title="Muscle Mass"
            value={`${comparison.latest.muscle_mass || 'N/A'}kg`}
            subtitle={
              comparison.changes.muscle_mass
                ? formatChange(comparison.changes.muscle_mass, 'kg')
                : undefined
            }
            trend={
              comparison.changes.muscle_mass
                ? {
                    value: Math.abs(comparison.changes.muscle_mass),
                    isPositive: comparison.changes.muscle_mass > 0,
                  }
                : undefined
            }
            icon="💪"
          />
          <StatCard
            title="Total Records"
            value={progressRecords.length}
            subtitle={`Since ${comparison.first ? new Date(comparison.first.recorded_date).toLocaleDateString() : 'N/A'}`}
            icon="📝"
          />
        </div>
      )}

      {/* Measurements Changes */}
      {comparison && Object.keys(comparison.changes).length > 0 && (
        <Card>
          <h3 className="text-xl font-semibold mb-4">Measurement Changes</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {Object.entries(comparison.changes).map(([key, value]) => {
              if (['chest', 'waist', 'hips', 'arms', 'thighs'].includes(key)) {
                return (
                  <div key={key} className="p-3 bg-dark-800 rounded-lg text-center">
                    <p className="text-sm text-gray-400 capitalize mb-1">{key}</p>
                    <p
                      className={`text-lg font-bold ${
                        value > 0 ? 'text-green-400' : 'text-red-400'
                      }`}
                    >
                      {formatChange(value, 'cm')}
                    </p>
                  </div>
                );
              }
              return null;
            })}
          </div>
        </Card>
      )}

      {/* Progress History */}
      <div>
        <h3 className="text-xl font-semibold mb-4">Progress History</h3>
        {progressRecords.length > 0 ? (
          <div className="space-y-4">
            {progressRecords.map((record) => (
              <Card key={record.id}>
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h4 className="font-semibold text-lg">
                      {new Date(record.recorded_date).toLocaleDateString()}
                    </h4>
                    {record.notes && (
                      <p className="text-sm text-gray-400 mt-1">{record.notes}</p>
                    )}
                  </div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {record.weight && (
                    <div className="p-2 bg-dark-800 rounded">
                      <p className="text-xs text-gray-500">Weight</p>
                      <p className="font-semibold">{record.weight}kg</p>
                    </div>
                  )}
                  {record.body_fat_percentage && (
                    <div className="p-2 bg-dark-800 rounded">
                      <p className="text-xs text-gray-500">Body Fat</p>
                      <p className="font-semibold">{record.body_fat_percentage}%</p>
                    </div>
                  )}
                  {record.muscle_mass && (
                    <div className="p-2 bg-dark-800 rounded">
                      <p className="text-xs text-gray-500">Muscle</p>
                      <p className="font-semibold">{record.muscle_mass}kg</p>
                    </div>
                  )}
                  {record.chest && (
                    <div className="p-2 bg-dark-800 rounded">
                      <p className="text-xs text-gray-500">Chest</p>
                      <p className="font-semibold">{record.chest}cm</p>
                    </div>
                  )}
                  {record.waist && (
                    <div className="p-2 bg-dark-800 rounded">
                      <p className="text-xs text-gray-500">Waist</p>
                      <p className="font-semibold">{record.waist}cm</p>
                    </div>
                  )}
                  {record.hips && (
                    <div className="p-2 bg-dark-800 rounded">
                      <p className="text-xs text-gray-500">Hips</p>
                      <p className="font-semibold">{record.hips}cm</p>
                    </div>
                  )}
                  {record.arms && (
                    <div className="p-2 bg-dark-800 rounded">
                      <p className="text-xs text-gray-500">Arms</p>
                      <p className="font-semibold">{record.arms}cm</p>
                    </div>
                  )}
                  {record.thighs && (
                    <div className="p-2 bg-dark-800 rounded">
                      <p className="text-xs text-gray-500">Thighs</p>
                      <p className="font-semibold">{record.thighs}cm</p>
                    </div>
                  )}
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <p className="text-gray-400 text-center py-8">
              No progress records yet. Click "Record Progress" to add one.
            </p>
          </Card>
        )}
      </div>

      {/* Add Progress Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => {
          setShowAddModal(false);
          resetForm();
        }}
        title="Record Progress"
        size="xl"
        footer={
          <>
            <Button variant="secondary" onClick={() => setShowAddModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit}>Save Progress</Button>
          </>
        }
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Date"
            type="date"
            required
            value={formData.recorded_date}
            onChange={(e) => setFormData({ ...formData, recorded_date: e.target.value })}
          />

          <div className="grid grid-cols-3 gap-4">
            <Input
              label="Weight (kg)"
              type="number"
              step="0.1"
              value={formData.weight || ''}
              onChange={(e) =>
                setFormData({ ...formData, weight: parseFloat(e.target.value) || undefined })
              }
            />
            <Input
              label="Body Fat (%)"
              type="number"
              step="0.1"
              value={formData.body_fat_percentage || ''}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  body_fat_percentage: parseFloat(e.target.value) || undefined,
                })
              }
            />
            <Input
              label="Muscle Mass (kg)"
              type="number"
              step="0.1"
              value={formData.muscle_mass || ''}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  muscle_mass: parseFloat(e.target.value) || undefined,
                })
              }
            />
          </div>

          <h4 className="font-semibold text-lg mt-6 mb-2">Body Measurements (cm)</h4>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <Input
              label="Chest"
              type="number"
              step="0.1"
              value={formData.chest || ''}
              onChange={(e) =>
                setFormData({ ...formData, chest: parseFloat(e.target.value) || undefined })
              }
            />
            <Input
              label="Waist"
              type="number"
              step="0.1"
              value={formData.waist || ''}
              onChange={(e) =>
                setFormData({ ...formData, waist: parseFloat(e.target.value) || undefined })
              }
            />
            <Input
              label="Hips"
              type="number"
              step="0.1"
              value={formData.hips || ''}
              onChange={(e) =>
                setFormData({ ...formData, hips: parseFloat(e.target.value) || undefined })
              }
            />
            <Input
              label="Arms"
              type="number"
              step="0.1"
              value={formData.arms || ''}
              onChange={(e) =>
                setFormData({ ...formData, arms: parseFloat(e.target.value) || undefined })
              }
            />
            <Input
              label="Thighs"
              type="number"
              step="0.1"
              value={formData.thighs || ''}
              onChange={(e) =>
                setFormData({ ...formData, thighs: parseFloat(e.target.value) || undefined })
              }
            />
          </div>

          <TextArea
            label="Notes"
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            placeholder="Any observations or notes..."
          />
        </form>
      </Modal>
    </div>
  );
};

export default ProgressTracker;
