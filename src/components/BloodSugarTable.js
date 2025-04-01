"use client"

import { useState } from "react"
import { Pencil, Trash2, Check, X } from "lucide-react"

export default function BloodSugarTable({ readings, onUpdate, onDelete }) {
  const [editingHour, setEditingHour] = useState(null)
  const [editValue, setEditValue] = useState("")
  const [error, setError] = useState("")

  const startEditing = (hour, value) => {
    setEditingHour(hour)
    setEditValue(value || "")
    setError("")
  }

  const saveEdit = () => {
    if (editingHour !== null) {
      const value = Number.parseFloat(editValue)

      if (isNaN(value)) {
        setError("Please enter a valid number")
        return
      }

      if (value < 0 || value > 600) {
        setError("Value should be between 0 and 600")
        return
      }

      onUpdate(editingHour, value)
      setEditingHour(null)
      setError("")
    }
  }

  const cancelEdit = () => {
    setEditingHour(null)
    setError("")
  }

  // Get only hours with readings
  const hoursWithReadings = readings
    .map((value, hour) => ({ hour, value }))
    .filter((item) => item.value !== null)
    .sort((a, b) => a.hour - b.hour)

  // Function to get status badge
  const getStatusBadge = (value) => {
    if (value < 70) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
          Low
        </span>
      )
    } else if (value > 180) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
          High
        </span>
      )
    } else {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
          Normal
        </span>
      )
    }
  }

  return (
    <div className="space-y-4">
      {error && <div className="text-sm text-red-500 font-medium">{error}</div>}

      {hoursWithReadings.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Time
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Blood Sugar (mg/dL)
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Status
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {hoursWithReadings.map(({ hour, value }) => (
                <tr key={hour} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{hour}:00</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {editingHour === hour ? (
                      <input
                        type="number"
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        className="block w-24 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            saveEdit()
                          } else if (e.key === "Escape") {
                            cancelEdit()
                          }
                        }}
                        autoFocus
                      />
                    ) : (
                      value
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {editingHour !== hour && getStatusBadge(value)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    {editingHour === hour ? (
                      <div className="flex justify-end space-x-1">
                        <button onClick={saveEdit} title="Save" className="text-blue-600 hover:text-blue-900">
                          <Check className="h-4 w-4" />
                        </button>
                        <button onClick={cancelEdit} title="Cancel" className="text-gray-600 hover:text-gray-900">
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex justify-end space-x-1">
                        <button
                          onClick={() => startEditing(hour, value)}
                          title="Edit"
                          className="text-blue-600 hover:text-blue-900"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => onDelete(hour)}
                          title="Delete"
                          className="text-red-600 hover:text-red-900"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500 border border-dashed rounded-md">
          <p>No readings recorded yet.</p>
          <p className="text-sm">Add some readings to see them here.</p>
        </div>
      )}
    </div>
  )
}

