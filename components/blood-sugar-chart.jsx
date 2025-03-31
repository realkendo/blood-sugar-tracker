"use client"

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts"

// Define target ranges
const TARGET_MIN = 70
const TARGET_HIGH = 180

export default function BloodSugarChart({ readings }) {
  // Create data points for each hour (0-23)
  const hourlyData = readings.map((value, hour) => ({
    hour,
    value,
    formattedHour: `${hour}:00`,
  }))

  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length && payload[0].payload.value !== null) {
      const data = payload[0].payload

      // Determine status based on value
      let status = "Normal"
      let statusColor = "text-blue-600"

      if (data.value < TARGET_MIN) {
        status = "Low"
        statusColor = "text-red-600"
      } else if (data.value > TARGET_HIGH) {
        status = "High"
        statusColor = "text-orange-600"
      }

      return (
        <div className="bg-white border border-gray-200 rounded-md shadow-lg p-3">
          <p className="font-bold">{label}</p>
          <p className="text-lg font-bold">{data.value} mg/dL</p>
          <p className={`font-medium ${statusColor}`}>{status}</p>
        </div>
      )
    }

    return null
  }

  return (
    <div className="w-full">
      <ResponsiveContainer width="100%" height={400}>
        <LineChart data={hourlyData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
          {/* Minimal grid lines */}
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" opacity={0.5} />

          <XAxis
            dataKey="formattedHour"
            tick={{ fill: "#666" }}
            axisLine={{ stroke: "#ccc" }}
            tickLine={{ stroke: "#ccc" }}
            interval={3} // Show fewer x-axis labels
          />

          <YAxis
            tick={{ fill: "#666" }}
            axisLine={{ stroke: "#ccc" }}
            tickLine={{ stroke: "#ccc" }}
            domain={[0, "auto"]}
          />

          <Tooltip content={<CustomTooltip />} />

          {/* Target range reference lines with labels */}
          <ReferenceLine
            y={TARGET_MIN}
            stroke="#ef4444"
            strokeWidth={1.5}
            strokeDasharray="3 3"
            label={{
              value: "Low",
              position: "right",
              fill: "#ef4444",
              fontSize: 12,
            }}
          />

          <ReferenceLine
            y={TARGET_HIGH}
            stroke="#f97316"
            strokeWidth={1.5}
            strokeDasharray="3 3"
            label={{
              value: "High",
              position: "right",
              fill: "#f97316",
              fontSize: 12,
            }}
          />

          {/* The main line connecting all data points */}
          <Line
            type="linear"
            dataKey="value"
            stroke="#3b82f6"
            strokeWidth={2.5}
            connectNulls={false}
            dot={(props) => {
              const { cx, cy, payload } = props
              if (payload.value === null) return null

              let fillColor = "#3b82f6" // blue for normal
              if (payload.value < TARGET_MIN) fillColor = "#ef4444" // red for low
              if (payload.value > TARGET_HIGH) fillColor = "#f97316" // orange for high

              return <circle cx={cx} cy={cy} r={5} fill={fillColor} stroke="white" strokeWidth={2} />
            }}
            activeDot={{ r: 8, fill: "#3b82f6", stroke: "white", strokeWidth: 2 }}
          />
        </LineChart>
      </ResponsiveContainer>

      {/* Simple legend */}
      <div className="flex justify-center mt-4 gap-6 text-xs text-gray-600">
        <div className="flex items-center">
          <div className="w-2 h-2 rounded-full bg-blue-500 mr-1"></div>
          <span>Normal</span>
        </div>
        <div className="flex items-center">
          <div className="w-2 h-2 rounded-full bg-red-500 mr-1"></div>
          <span>Low (&lt;70)</span>
        </div>
        <div className="flex items-center">
          <div className="w-2 h-2 rounded-full bg-orange-500 mr-1"></div>
          <span>High (&gt;180)</span>
        </div>
      </div>
    </div>
  )
}

