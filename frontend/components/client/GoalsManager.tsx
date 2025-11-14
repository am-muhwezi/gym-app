import React, { useState, useEffect } from 'react';
import { Goal, GoalCreatePayload, GoalType } from '../../types';
import { Card, Button, Modal, Input, Select, TextArea, Badge, ProgressBar } from '../ui';
import { goalService } from '../../services';

interface GoalsManagerProps {
  clientId: string;
}

const GOAL_TYPES: { value: GoalType; label: string }[] = [
  { value: 'weight_loss', label: 'Weight Loss' },
  { value: 'muscle_gain', label: 'Muscle Gain' },
  { value: 'strength', label: 'Strength Training' },
  { value: 'endurance', label: 'Endurance' },
  { value: 'flexibility', label: 'Flexibility' },
  { value: 'general_fitness', label: 'General Fitness' },
  { value: 'rehabilitation', label: 'Rehabilitation' },
];

const GoalsManager: React.FC<GoalsManagerProps> = ({ clientId }) => {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  const [formData, setFormData] = useState<GoalCreatePayload>({
    goal_type: 'general_fitness',
    title: '',
    description: '',
    target_value: '',
    current_value: '',
    target_date: '',
  });

  useEffect(() => {
    loadGoals();
  }, [clientId]);

  const loadGoals = async () => {
    try {
      setLoading(true);
      const data = await goalService.getClientGoals(clientId);
      setGoals(data);
    } catch (error) {
      console.error('Error loading goals:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingGoal) {
        await goalService.updateGoal(clientId, editingGoal.id, formData);
      } else {
        await goalService.createGoal(clientId, formData);
      }
      setShowAddModal(false);
      setEditingGoal(null);
      resetForm();
      loadGoals();
    } catch (error: any) {
      console.error('Error saving goal:', error);
      alert(`Failed to save goal: ${error.message || 'Please try again.'}`);
    }
  };

  const handleEdit = (goal: Goal) => {
    setEditingGoal(goal);
    setFormData({
      goal_type: goal.goal_type,
      title: goal.title || '',
      description: goal.description,
      target_value: goal.target_value || '',
      current_value: goal.current_value || '',
      target_date: goal.target_date || '',
    });
    setShowAddModal(true);
  };

  const handleComplete = async (goalId: string, currentStatus: boolean) => {
    try {
      await goalService.toggleGoalAchieved(clientId, goalId, !currentStatus);
      loadGoals();
    } catch (error: any) {
      console.error('Error updating goal:', error);
      alert(`Failed to update goal: ${error.message}`);
    }
  };

  const handleDelete = async (goalId: string) => {
    if (confirm('Are you sure you want to delete this goal?')) {
      try {
        await goalService.deleteGoal(clientId, goalId);
        loadGoals();
      } catch (error: any) {
        console.error('Error deleting goal:', error);
        alert('Delete feature not implemented in backend yet.');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      goal_type: 'general_fitness',
      title: '',
      description: '',
      target_value: '',
      current_value: '',
      target_date: '',
    });
  };

  const activeGoals = goals.filter((g) => !g.achieved);
  const completedGoals = goals.filter((g) => g.achieved);

  if (loading) {
    return <p className="text-gray-400">Loading goals...</p>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Goals</h2>
          <p className="text-gray-400 text-sm">
            {activeGoals.length} active, {completedGoals.length} completed
          </p>
        </div>
        <Button onClick={() => setShowAddModal(true)}>Add Goal</Button>
      </div>

      {/* Active Goals */}
      {activeGoals.length > 0 && (
        <div>
          <h3 className="text-xl font-semibold mb-4">Active Goals</h3>
          <div className="space-y-4">
            {activeGoals.map((goal) => {
              const progress =
                goal.current_value && goal.target_value
                  ? (parseFloat(goal.current_value) / parseFloat(goal.target_value)) * 100
                  : 0;

              return (
                <Card key={goal.id}>
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="text-lg font-semibold">{goal.title}</h4>
                        <Badge variant="info" size="sm">
                          {goal.goal_type.replace('_', ' ')}
                        </Badge>
                      </div>
                      <p className="text-gray-400 text-sm">{goal.description}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="secondary" onClick={() => handleEdit(goal)}>
                        Edit
                      </Button>
                      <Button size="sm" variant="primary" onClick={() => handleComplete(goal.id, goal.achieved)}>
                        Mark Complete
                      </Button>
                    </div>
                  </div>

                  {goal.target_value && (
                    <ProgressBar
                      current={parseFloat(goal.current_value || '0')}
                      target={parseFloat(goal.target_value)}
                      label="Progress"
                      color={progress >= 100 ? 'success' : progress >= 75 ? 'warning' : 'primary'}
                    />
                  )}

                  <div className="flex justify-between items-center mt-4 text-sm">
                    {goal.target_date && (
                      <span className="text-gray-500">
                        Target: {new Date(goal.target_date).toLocaleDateString()}
                      </span>
                    )}
                    <button
                      onClick={() => handleDelete(goal.id)}
                      className="text-red-400 hover:text-red-300"
                    >
                      Delete
                    </button>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* Completed Goals */}
      {completedGoals.length > 0 && (
        <div>
          <h3 className="text-xl font-semibold mb-4 text-gray-400">Completed Goals</h3>
          <div className="space-y-3">
            {completedGoals.map((goal) => (
              <Card key={goal.id} className="opacity-60">
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="font-semibold line-through">{goal.title}</h4>
                    <p className="text-sm text-gray-500">{goal.description}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="success">Completed</Badge>
                    <Button size="sm" variant="secondary" onClick={() => handleComplete(goal.id, goal.achieved)}>
                      Mark Incomplete
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {goals.length === 0 && (
        <Card>
          <p className="text-gray-400 text-center py-8">
            No goals yet. Click "Add Goal" to create one.
          </p>
        </Card>
      )}

      {/* Add/Edit Goal Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => {
          setShowAddModal(false);
          setEditingGoal(null);
          resetForm();
        }}
        title={editingGoal ? 'Edit Goal' : 'Add New Goal'}
        size="lg"
        footer={
          <>
            <Button
              variant="secondary"
              onClick={() => {
                setShowAddModal(false);
                setEditingGoal(null);
                resetForm();
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleSubmit}>
              {editingGoal ? 'Update' : 'Create'} Goal
            </Button>
          </>
        }
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Select
            label="Goal Type"
            required
            value={formData.goal_type}
            onChange={(e) => setFormData({ ...formData, goal_type: e.target.value as GoalType })}
            options={GOAL_TYPES}
          />

          <Input
            label="Goal Title"
            required
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="e.g., Lose 10kg"
          />

          <TextArea
            label="Description"
            required
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Describe the goal..."
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Current Value"
              value={formData.current_value}
              onChange={(e) => setFormData({ ...formData, current_value: e.target.value })}
              placeholder="e.g., 80kg"
            />
            <Input
              label="Target Value"
              value={formData.target_value}
              onChange={(e) => setFormData({ ...formData, target_value: e.target.value })}
              placeholder="e.g., 70kg"
            />
          </div>

          <Input
            label="Target Date"
            type="date"
            value={formData.target_date}
            onChange={(e) => setFormData({ ...formData, target_date: e.target.value })}
          />
        </form>
      </Modal>
    </div>
  );
};

export default GoalsManager;
