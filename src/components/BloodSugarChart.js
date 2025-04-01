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

// Add horizontal lines for thresholds and enhance grid using plugin
const enhancedChartPlugin = {
  id: "enhancedChart",
  beforeDraw(chart) {
    const { ctx, chartArea, scales } = chart
    const { top, bottom, left, right } = chartArea
    const { x, y } = scales

    // Draw enhanced grid lines
    ctx.save()

    // Draw vertical grid lines (hours)
    ctx.lineWidth = 0.8
    ctx.strokeStyle = "rgba(180, 180, 180, 0.6)"
    ctx.setLineDash([])

    // Draw every 3 hours with stronger line
    for (let i = 0; i <= 24; i += 3) {
      const xPos = x.getPixelForValue(i + ":00")
      if (xPos >= left && xPos <= right) {
        ctx.beginPath()
        ctx.moveTo(xPos, top)
        ctx.lineTo(xPos, bottom)
        ctx.stroke()
      }
    }

    // Draw horizontal grid lines (values)
    const gridValues = [50, 100, 150, 200, 250, 300]
    gridValues.forEach((value) => {
      const yPos = y.getPixelForValue(value)
      if (yPos >= top && yPos <= bottom) {
        ctx.beginPath()
        ctx.moveTo(left, yPos)
        ctx.lineTo(right, yPos)
        ctx.stroke()

        // Add value label
        ctx.font = "10px Arial"
        ctx.fillStyle = "#666"
        ctx.textAlign = "left"
        ctx.fillText(value, left + 5, yPos - 5)
      }
    })

    // Draw low threshold line
    const lowY = y.getPixelForValue(TARGET_MIN)
    ctx.beginPath()
    ctx.moveTo(left, lowY)
    ctx.lineTo(right, lowY)
    ctx.lineWidth = 2
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
    ctx.lineWidth = 2
    ctx.strokeStyle = "#f97316"
    ctx.setLineDash([5, 5])
    ctx.stroke()

    // Draw high threshold label
    ctx.font = "12px Arial"
    ctx.fillStyle = "#f97316"
    ctx.textAlign = "right"
    ctx.fillText("High", right - 5, highY - 5)

    // Draw target range area
    ctx.fillStyle = "rgba(34, 197, 94, 0.1)"
    ctx.fillRect(left, highY, right - left, lowY - highY)

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
        pointRadius: 6,
        pointHoverRadius: 9,
        tension: 0.4, // Increased for smoother curves
        spanGaps: true, // Connect points across gaps
        borderWidth: 3,
        fill: false,
        cubicInterpolationMode: "monotone", // Ensures the line doesn't go below zero
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
        backgroundColor: "rgba(255, 255, 255, 0.9)",
        titleColor: "#333",
        bodyColor: "#333",
        borderColor: "#ccc",
        borderWidth: 1,
        padding: 10,
        cornerRadius: 6,
        displayColors: false,
        callbacks: {
          title: (tooltipItems) => `Time: ${tooltipItems[0].label}`,
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
          display: false, // We'll draw our own grid in the plugin
        },
        ticks: {
          color: "#666",
          maxRotation: 0,
          autoSkip: true,
          maxTicksLimit: 8,
          font: {
            size: 10,
          },
        },
      },
      y: {
        beginAtZero: false,
        min: 40, // Set minimum to show some space below the lowest expected value
        suggestedMax: 300, // Set maximum to show some space above the highest expected value
        grid: {
          display: false, // We'll draw our own grid in the plugin
        },
        ticks: {
          color: "#666",
          font: {
            size: 10,
          },
        },
      },
    },
    elements: {
      line: {
        tension: 0.4, // Smoother curve
      },
    },
  }

  return (
    <div className="w-full">
      <div className="h-[400px] p-2 bg-white rounded-lg">
        <Line ref={chartRef} data={data} options={options} plugins={[enhancedChartPlugin]} />
      </div>

      {/* Enhanced legend */}
      <div className="flex justify-center mt-4 gap-6 text-sm text-gray-700 bg-gray-50 p-2 rounded-md">
        <div className="flex items-center">
          <div className="w-3 h-3 rounded-full bg-blue-500 mr-2"></div>
          <span>Normal (70-180 mg/dL)</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 rounded-full bg-red-500 mr-2"></div>
          <span>Low (&lt;70 mg/dL)</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 rounded-full bg-orange-500 mr-2"></div>
          <span>High (&gt;180 mg/dL)</span>
        </div>
      </div>
    </div>
  )
}

