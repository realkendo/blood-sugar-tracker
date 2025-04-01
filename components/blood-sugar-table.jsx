"use client"

import { useState } from "react"
import { Pencil, Trash2, Check, X } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"

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
      return <Badge variant="destructive">Low</Badge>
    } else if (value > 180) {
      return (
        <Badge variant="warning" className="bg-orange-500">
          High
        </Badge>
      )
    } else {
      return (
        <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">
          Normal
        </Badge>
      )
    }
  }

  return (
    <div className="space-y-4">
      {error && <div className="text-sm text-red-500 font-medium">{error}</div>}

      {hoursWithReadings.length > 0 ? (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Time</TableHead>
              <TableHead>Blood Sugar (mg/dL)</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {hoursWithReadings.map(({ hour, value }) => (
              <TableRow key={hour} className="hover:bg-muted/50">
                <TableCell className="font-medium">{hour}:00</TableCell>
                <TableCell>
                  {editingHour === hour ? (
                    <Input
                      type="number"
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      className="w-24"
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
                </TableCell>
                <TableCell>{editingHour !== hour && getStatusBadge(value)}</TableCell>
                <TableCell className="text-right">
                  {editingHour === hour ? (
                    <div className="flex justify-end space-x-1">
                      <Button variant="ghost" size="icon" onClick={saveEdit} title="Save">
                        <Check className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={cancelEdit} title="Cancel">
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <div className="flex justify-end space-x-1">
                      <Button variant="ghost" size="icon" onClick={() => startEditing(hour, value)} title="Edit">
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => onDelete(hour)} title="Delete">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      ) : (
        <div className="text-center py-8 text-muted-foreground border border-dashed rounded-md">
          <p>No readings recorded yet.</p>
          <p className="text-sm">Add some readings to see them here.</p>
        </div>
      )}
    </div>
  )
}

