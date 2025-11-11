import React, { useState, useEffect } from 'react';
import { Log, LogCreatePayload } from '../../types';
import { Card, Button, Modal, Input, TextArea } from '../ui';
import { logService } from '../../services';

interface DailyLogsProps {
  clientId: string;
}

const DailyLogs: React.FC<DailyLogsProps> = ({ clientId }) => {
  const [logs, setLogs] = useState<Log[]>([]);
  const [recentLogs, setRecentLogs] = useState<Log[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingLog, setEditingLog] = useState<Log | null>(null);
  const [averagePerformance, setAveragePerformance] = useState<number>(0);
  const [formData, setFormData] = useState<LogCreatePayload>({
    date: new Date().toISOString().split('T')[0],
    notes: '',
    performance_rating: undefined,
  });

  useEffect(() => {
    loadLogs();
  }, [clientId]);

  const loadLogs = async () => {
    try {
      setLoading(true);
      const [allLogs, last21Days, avgPerf] = await Promise.all([
        logService.getClientLogs(clientId),
        logService.getRecentLogs(clientId, 21),
        logService.getAveragePerformance(clientId, 21),
      ]);
      setLogs(allLogs);
      setRecentLogs(last21Days);
      setAveragePerformance(avgPerf);
    } catch (error) {
      console.error('Error loading logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingLog) {
        await logService.updateLog(editingLog.id, formData);
      } else {
        await logService.createLog(clientId, formData);
      }
      setShowAddModal(false);
      setEditingLog(null);
      resetForm();
      loadLogs();
    } catch (error) {
      console.error('Error saving log:', error);
      alert('Failed to save log. Please try again.');
    }
  };

  const handleEdit = (log: Log) => {
    setEditingLog(log);
    setFormData({
      date: log.date,
      notes: log.notes,
      performance_rating: log.performance_rating,
    });
    setShowAddModal(true);
  };

  const handleDelete = async (logId: string) => {
    if (confirm('Are you sure you want to delete this log?')) {
      try {
        await logService.deleteLog(logId);
        loadLogs();
      } catch (error) {
        console.error('Error deleting log:', error);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      date: new Date().toISOString().split('T')[0],
      notes: '',
      performance_rating: undefined,
    });
  };

  const renderStars = (rating?: number) => {
    if (!rating) return <span className="text-gray-500">Not rated</span>;
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <span key={star} className={star <= rating ? 'text-yellow-400' : 'text-gray-600'}>
            ★
          </span>
        ))}
      </div>
    );
  };

  if (loading) {
    return <p className="text-gray-400">Loading logs...</p>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Daily Activity Logs</h2>
          <p className="text-gray-400 text-sm">
            {recentLogs.length} logs in last 21 days • Avg Performance:{' '}
            <span className="font-semibold text-brand-primary">{averagePerformance.toFixed(1)}/5</span>
          </p>
        </div>
        <Button onClick={() => setShowAddModal(true)}>Add Log</Button>
      </div>

      {/* Performance Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <p className="text-gray-400 text-sm mb-1">Total Logs</p>
          <p className="text-3xl font-bold">{logs.length}</p>
        </Card>
        <Card>
          <p className="text-gray-400 text-sm mb-1">Last 21 Days</p>
          <p className="text-3xl font-bold">{recentLogs.length}</p>
        </Card>
        <Card>
          <p className="text-gray-400 text-sm mb-1">Avg Performance (21d)</p>
          <div className="flex items-center gap-2">
            <p className="text-3xl font-bold">{averagePerformance.toFixed(1)}</p>
            {renderStars(Math.round(averagePerformance))}
          </div>
        </Card>
      </div>

      {/* Recent Logs (21 days) */}
      {recentLogs.length > 0 && (
        <div>
          <h3 className="text-xl font-semibold mb-4">Last 21 Days</h3>
          <div className="space-y-3">
            {recentLogs.map((log) => (
              <Card key={log.id}>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="font-semibold">
                        {new Date(log.date).toLocaleDateString('en-US', {
                          weekday: 'short',
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </h4>
                      {renderStars(log.performance_rating)}
                    </div>
                    <p className="text-gray-400">{log.notes}</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(log)}
                      className="text-brand-primary hover:text-brand-secondary text-sm"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(log.id)}
                      className="text-red-400 hover:text-red-300 text-sm"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* All Logs History */}
      {logs.length > recentLogs.length && (
        <div>
          <h3 className="text-xl font-semibold mb-4 text-gray-400">Older Logs</h3>
          <div className="space-y-3">
            {logs
              .filter((log) => !recentLogs.find((rl) => rl.id === log.id))
              .map((log) => (
                <Card key={log.id} className="opacity-70">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-semibold text-sm">
                        {new Date(log.date).toLocaleDateString()}
                      </h4>
                      <p className="text-gray-500 text-sm mt-1">{log.notes}</p>
                    </div>
                    {renderStars(log.performance_rating)}
                  </div>
                </Card>
              ))}
          </div>
        </div>
      )}

      {logs.length === 0 && (
        <Card>
          <p className="text-gray-400 text-center py-8">
            No activity logs yet. Click "Add Log" to record daily activities.
          </p>
        </Card>
      )}

      {/* Add/Edit Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => {
          setShowAddModal(false);
          setEditingLog(null);
          resetForm();
        }}
        title={editingLog ? 'Edit Log' : 'Add Activity Log'}
        footer={
          <>
            <Button
              variant="secondary"
              onClick={() => {
                setShowAddModal(false);
                setEditingLog(null);
                resetForm();
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleSubmit}>{editingLog ? 'Update' : 'Save'} Log</Button>
          </>
        }
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Date"
            type="date"
            required
            value={formData.date}
            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
          />

          <TextArea
            label="Notes"
            required
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            placeholder="Describe the session, workout, or activities..."
            rows={5}
          />

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-3">
              Performance Rating
            </label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((rating) => (
                <button
                  key={rating}
                  type="button"
                  onClick={() => setFormData({ ...formData, performance_rating: rating })}
                  className={`text-3xl transition-colors ${
                    formData.performance_rating && formData.performance_rating >= rating
                      ? 'text-yellow-400'
                      : 'text-gray-600 hover:text-gray-500'
                  }`}
                >
                  ★
                </button>
              ))}
              {formData.performance_rating && (
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, performance_rating: undefined })}
                  className="ml-2 text-sm text-red-400 hover:text-red-300"
                >
                  Clear
                </button>
              )}
            </div>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default DailyLogs;
