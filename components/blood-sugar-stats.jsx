"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { ArrowDown, ArrowUp, Activity, Target, AlertTriangle, CheckCircle } from "lucide-react"

export default function BloodSugarStats({ readings }) {
  // Filter out null values
  const validReadings = readings.filter((reading) => reading !== null)

  if (validReadings.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground border border-dashed rounded-md">
        <p>No readings available yet.</p>
        <p className="text-sm">Add some readings to see statistics here.</p>
      </div>
    )
  }

  // Calculate statistics
  const average = validReadings.reduce((sum, val) => sum + val, 0) / validReadings.length
  const min = Math.min(...validReadings)
  const max = Math.max(...validReadings)

  // Calculate time in range (70-180 mg/dL is a common target)
  const inRange = validReadings.filter((v) => v >= 70 && v <= 180).length
  const percentInRange = (inRange / validReadings.length) * 100

  // Calculate time below range
  const belowRange = validReadings.filter((v) => v < 70).length
  const percentBelowRange = (belowRange / validReadings.length) * 100

  // Calculate time above range
  const aboveRange = validReadings.filter((v) => v > 180).length
  const percentAboveRange = (aboveRange / validReadings.length) * 100

  // Get color for average
  const getAverageColor = () => {
    if (average < 70) return "bg-red-100 border-red-200"
    if (average > 180) return "bg-orange-100 border-orange-200"
    return "bg-green-100 border-green-200"
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-3 gap-4">
        <StatCard
          title="Average"
          value={`${average.toFixed(1)}`}
          unit="mg/dL"
          icon={<Activity className="h-5 w-5 text-blue-500" />}
          className={getAverageColor()}
        />
        <StatCard
          title="Lowest"
          value={`${min}`}
          unit="mg/dL"
          icon={<ArrowDown className="h-5 w-5 text-red-500" />}
          className="bg-red-50 border-red-100"
        />
        <StatCard
          title="Highest"
          value={`${max}`}
          unit="mg/dL"
          icon={<ArrowUp className="h-5 w-5 text-orange-500" />}
          className="bg-orange-50 border-orange-100"
        />
      </div>

      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Target className="h-5 w-5 text-primary" />
          <h3 className="text-sm font-medium">Time in Range</h3>
        </div>

        <div className="space-y-3">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <div className="flex items-center">
                <AlertTriangle className="h-4 w-4 text-red-500 mr-1" />
                <span>Below Range</span>
              </div>
              <span className="font-medium text-red-600">{percentBelowRange.toFixed(1)}%</span>
            </div>
            <Progress value={percentBelowRange} className="h-3 bg-red-100" indicatorClassName="bg-red-500" />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <div className="flex items-center">
                <CheckCircle className="h-4 w-4 text-green-500 mr-1" />
                <span>In Range (70-180 mg/dL)</span>
              </div>
              <span className="font-medium text-green-600">{percentInRange.toFixed(1)}%</span>
            </div>
            <Progress value={percentInRange} className="h-3 bg-green-100" indicatorClassName="bg-green-500" />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <div className="flex items-center">
                <AlertTriangle className="h-4 w-4 text-orange-500 mr-1" />
                <span>Above Range</span>
              </div>
              <span className="font-medium text-orange-600">{percentAboveRange.toFixed(1)}%</span>
            </div>
            <Progress value={percentAboveRange} className="h-3 bg-orange-100" indicatorClassName="bg-orange-500" />
          </div>
        </div>
      </div>

      <div className="text-sm text-muted-foreground">
        <p>Total readings: {validReadings.length}</p>
      </div>
    </div>
  )
}

function StatCard({ title, value, unit, icon, className = "" }) {
  return (
    <Card className={`border ${className}`}>
      <CardContent className="p-4">
        <div className="flex justify-between items-start">
          <p className="text-sm font-medium">{title}</p>
          {icon}
        </div>
        <div className="flex items-baseline mt-2">
          <p className="text-2xl font-bold">{value}</p>
          <p className="text-sm text-muted-foreground ml-1">{unit}</p>
        </div>
      </CardContent>
    </Card>
  )
}

