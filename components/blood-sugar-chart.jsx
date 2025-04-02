"use client"

import { useRef } from "react"
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js"
import { Line } from "react-chartjs-2"

// Register ChartJS components
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler)

// Define target ranges
const TARGET_MIN = 70
const TARGET_HIGH = 180

// Add horizontal lines for thresholds using plugin
const thresholdPlugin = {
  id: "thresholdLines",
  beforeDraw(chart) {
    const { ctx, chartArea, scales } = chart
    const { top, bottom, left, right } = chartArea
    const { y } = scales

    // Draw low threshold line
    const lowY = y.getPixelForValue(TARGET_MIN)
    ctx.save()
    ctx.beginPath()
    ctx.moveTo(left, lowY)
    ctx.lineTo(right, lowY)
    ctx.lineWidth = 1.5
    ctx.strokeStyle = "#ef4444"
    ctx.setLineDash([5, 5])
    ctx.stroke()

    // Draw low threshold label
    ctx.font = "12px Arial"
    ctx.fillStyle = "#ef4444"
    ctx.textAlign = "right"
    ctx.fillText("Low", right - 5, lowY - 5)

    // Draw high threshold line
    const highY = y.getPixelForValue(TARGET_HIGH)
    ctx.beginPath()
    ctx.moveTo(left, highY)
    ctx.lineTo(right, highY)
    ctx.lineWidth = 1.5
    ctx.strokeStyle = "#f97316"
    ctx.setLineDash([5, 5])
    ctx.stroke()

    // Draw high threshold label
    ctx.font = "12px Arial"
    ctx.fillStyle = "#f97316"
    ctx.textAlign = "right"
    ctx.fillText("High", right - 5, highY - 5)

    ctx.restore()
  },
}

export default function BloodSugarChart({ readings }) {
  const chartRef = useRef(null)

  // Create labels for each hour (0-23)
  const labels = Array.from({ length: 24 }, (_, i) => `${i}:00`)

  // Create dataset from readings
  const dataValues = readings.map((value) => value)

  // Create point background colors based on values
  const pointBackgroundColors = readings.map((value) => {
    if (value === null) return "rgba(0, 0, 0, 0)" // transparent for null values
    if (value < TARGET_MIN) return "#ef4444" // red for low
    if (value > TARGET_HIGH) return "#f97316" // orange for high
    return "#3b82f6" // blue for normal
  })

  // Chart data
  const data = {
    labels,
    datasets: [
      {
        label: "Blood Sugar",
        data: dataValues,
        borderColor: "#3b82f6",
        backgroundColor: pointBackgroundColors,
        pointBorderColor: "white",
        pointBorderWidth: 2,
        pointRadius: 5,
        pointHoverRadius: 8,
        tension: 0, // 0 for straight lines, 0.4 for curved lines
        spanGaps: false, // don't connect null values
        borderWidth: 2.5,
      },
    ],
  }

  // Chart options
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const value = context.raw
            if (value === null) return "No reading"

            let status = "Normal"
            if (value < TARGET_MIN) status = "Low"
            if (value > TARGET_HIGH) status = "High"

            return [`Blood Sugar: ${value} mg/dL`, `Status: ${status}`]
          },
        },
      },
    },
    scales: {
      x: {
        grid: {
          color: "rgba(240, 240, 240, 0.5)",
        },
        ticks: {
          color: "#666",
          maxRotation: 0,
          autoSkip: true,
          maxTicksLimit: 8,
        },
      },
      y: {
        beginAtZero: false,
        grid: {
          color: "rgba(240, 240, 240, 0.5)",
        },
        ticks: {
          color: "#666",
        },
      },
    },
  }

  return (
    <div className="w-full">
      <div className="h-[400px]">
        <Line ref={chartRef} data={data} options={options} plugins={[thresholdPlugin]} />
      </div>

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

