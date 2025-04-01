"use client"

import { useState, useEffect } from "react"
import { Tab } from "@headlessui/react"
import { Coffee, Sun, Sunset, Moon, Plus, Trash, AlertCircle } from "lucide-react"
import BloodSugarChart from "./BloodSugarChart"
import BloodSugarTable from "./BloodSugarTable"
import BloodSugarStats from "./BloodSugarStats"
import Toast from "./Toast"

export default function BloodSugarTracker() {
  // Initialize with empty hourly readings (0-23 hours)
  const [hourlyReadings, setHourlyReadings] = useState(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("hourlyBloodSugarReadings")
        return saved ? JSON.parse(saved) : Array(24).fill(null)
      } catch (error) {
        console.error("Error loading from localStorage:", error)
        return Array(24).fill(null)
      }
    }
    return Array(24).fill(null)
  })

  const [currentHour, setCurrentHour] = useState(() => new Date().getHours())
  const [bloodSugarValue, setBloodSugarValue] = useState("")
  const [error, setError] = useState("")
  const [toast, setToast] = useState({ show: false, title: "", message: "", type: "" })

  // Add a state for auto-advance feature
  const [autoAdvance, setAutoAdvance] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("bloodSugarAutoAdvance")
      return saved ? JSON.parse(saved) === true : true // Default to true
    }
    return true
  })

  // Save auto-advance preference to localStorage
  useEffect(() => {
    try {
      localStorage.setItem("bloodSugarAutoAdvance", JSON.stringify(autoAdvance))
    } catch (error) {
      console.error("Error saving auto-advance preference:", error)
    }
  }, [autoAdvance])

  // Save to localStorage whenever readings change
  useEffect(() => {
    try {
      localStorage.setItem("hourlyBloodSugarReadings", JSON.stringify(hourlyReadings))
    } catch (error) {
      console.error("Error saving to localStorage:", error)
      showToast("Error saving data", "Your data couldn't be saved to local storage.", "error")
    }
  }, [hourlyReadings])

  // Show toast message
  const showToast = (title, message, type = "success") => {
    setToast({ show: true, title, message, type })
    setTimeout(() => setToast({ show: false, title: "", message: "", type: "" }), 3000)
  }

  // Modify the addReading function to advance to the next hour
  const addReading = () => {
    setError("")

    if (!bloodSugarValue) {
      setError("Please enter a blood sugar value")
      return
    }

    const value = Number.parseFloat(bloodSugarValue)
    if (isNaN(value)) {
      setError("Please enter a valid number")
      return
    }

    if (value < 0 || value > 600) {
      setError("Blood sugar value should be between 0 and 600 mg/dL")
      return
    }

    if (currentHour < 0 || currentHour > 23) {
      setError("Hour should be between 0 and 23")
      return
    }

    const updatedReadings = [...hourlyReadings]
    updatedReadings[currentHour] = value

    setHourlyReadings(updatedReadings)
    setBloodSugarValue("")

    // Advance to the next hour if auto-advance is enabled
    if (autoAdvance) {
      const nextHour = (currentHour + 1) % 24
      setCurrentHour(nextHour)
    }

    showToast("Reading added", `Blood sugar reading of ${value} mg/dL added for ${currentHour}:00`)

    // Focus the input field again
    document.getElementById("blood-sugar-value").focus()
  }

  // Clear all data
  const clearAllData = () => {
    if (window.confirm("Are you sure you want to clear all your blood sugar readings? This cannot be undone.")) {
      setHourlyReadings(Array(24).fill(null))
      showToast("Data cleared", "All blood sugar readings have been cleared.")
    }
  }

  // Create time blocks for the grid
  const timeBlocks = [
    { name: "Early Morning", hours: [0, 1, 2, 3, 4, 5], icon: <Moon className="h-4 w-4" /> },
    { name: "Morning", hours: [6, 7, 8, 9, 10, 11], icon: <Coffee className="h-4 w-4" /> },
    { name: "Afternoon", hours: [12, 13, 14, 15, 16, 17], icon: <Sun className="h-4 w-4" /> },
    { name: "Evening", hours: [18, 19, 20, 21, 22, 23], icon: <Sunset className="h-4 w-4" /> },
  ]

  // Get status color for a time button
  const getTimeButtonColor = (hour) => {
    // If this hour has a reading
    if (hourlyReadings[hour] !== null) {
      const value = hourlyReadings[hour]
      if (value < 70) return "bg-red-100 border-red-300 text-red-700"
      if (value > 180) return "bg-orange-100 border-orange-300 text-orange-700"
      return "bg-green-100 border-green-300 text-green-700"
    }

    // If this is the selected hour
    if (hour === currentHour) {
      return "bg-blue-100 border-blue-300 text-blue-700"
    }

    return ""
  }

  return (
    <div className="space-y-8">
      {toast.show && <Toast title={toast.title} message={toast.message} type={toast.type} />}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold">Add Blood Sugar Reading</h2>
            <p className="text-sm text-gray-500">Select a time and enter your blood sugar level</p>
          </div>
          <div className="p-4">
            <div className="space-y-6">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md flex items-start">
                  <AlertCircle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
                  <p>{error}</p>
                </div>
              )}

              <div className="space-y-4">
                <label className="font-medium text-gray-700">Select Time</label>

                {timeBlocks.map((block) => (
                  <div key={block.name} className="space-y-2">
                    <div className="flex items-center gap-2 text-sm font-medium text-gray-500">
                      {block.icon}
                      <span>{block.name}</span>
                    </div>
                    <div className="grid grid-cols-6 gap-2">
                      {block.hours.map((hour) => (
                        <button
                          key={hour}
                          onClick={() => setCurrentHour(hour)}
                          className={`h-10 border rounded-md text-sm font-medium transition-colors ${getTimeButtonColor(hour) || "border-gray-300 hover:bg-gray-50"} relative`}
                        >
                          {hour}:00
                          {hourlyReadings[hour] !== null && (
                            <span className="absolute -top-1 -right-1 flex h-3 w-3">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500"></span>
                            </span>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label htmlFor="blood-sugar-value" className="font-medium text-gray-700">
                    Blood Sugar for {currentHour}:00
                  </label>
                  <div className="flex items-center gap-2">
                    {autoAdvance && <span className="text-xs text-gray-500">Next: {(currentHour + 1) % 24}:00</span>}
                    <div className="flex items-center space-x-2">
                      <label htmlFor="auto-advance" className="text-xs cursor-pointer text-gray-700">
                        Auto-advance
                      </label>
                      <input
                        id="auto-advance"
                        type="checkbox"
                        checked={autoAdvance}
                        onChange={(e) => setAutoAdvance(e.target.checked)}
                        className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <input
                    id="blood-sugar-value"
                    type="number"
                    placeholder="Enter blood sugar value"
                    value={bloodSugarValue}
                    onChange={(e) => setBloodSugarValue(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        addReading()
                      }
                    }}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-lg"
                    autoFocus
                  />
                  <button
                    onClick={addReading}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    <Plus className="mr-2 h-4 w-4" /> Add
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div className="px-4 py-3 bg-gray-50 border-t border-gray-200 text-right">
            <button
              onClick={clearAllData}
              className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <Trash className="mr-2 h-4 w-4" /> Clear All Data
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold">Blood Sugar Statistics</h2>
            <p className="text-sm text-gray-500">Summary of your daily readings</p>
          </div>
          <div className="p-4">
            <BloodSugarStats readings={hourlyReadings} />
          </div>
        </div>
      </div>

      <Tab.Group>
        <Tab.List className="flex space-x-1 rounded-xl bg-blue-50 p-1">
          <Tab
            className={({ selected }) =>
              `w-full rounded-lg py-2.5 text-sm font-medium leading-5 
              ${selected ? "bg-white text-blue-700 shadow" : "text-gray-500 hover:bg-white/[0.12] hover:text-blue-600"}`
            }
          >
            Chart
          </Tab>
          <Tab
            className={({ selected }) =>
              `w-full rounded-lg py-2.5 text-sm font-medium leading-5 
              ${selected ? "bg-white text-blue-700 shadow" : "text-gray-500 hover:bg-white/[0.12] hover:text-blue-600"}`
            }
          >
            Table
          </Tab>
        </Tab.List>
        <Tab.Panels className="mt-6">
          <Tab.Panel>
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
              <div className="p-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold">Blood Sugar Chart</h2>
                <p className="text-sm text-gray-500">24-hour view of your blood sugar levels</p>
              </div>
              <div className="p-4">
                <BloodSugarChart readings={hourlyReadings} />
              </div>
            </div>
          </Tab.Panel>
          <Tab.Panel>
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
              <div className="p-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold">Blood Sugar Readings</h2>
                <p className="text-sm text-gray-500">Hourly readings for today</p>
              </div>
              <div className="p-4">
                <BloodSugarTable
                  readings={hourlyReadings}
                  onUpdate={(hour, value) => {
                    try {
                      const updatedReadings = [...hourlyReadings]
                      updatedReadings[hour] = value
                      setHourlyReadings(updatedReadings)
                      showToast("Reading updated", `Blood sugar reading for ${hour}:00 updated to ${value} mg/dL`)
                    } catch (error) {
                      showToast("Error updating reading", "There was an error updating your reading.", "error")
                    }
                  }}
                  onDelete={(hour) => {
                    try {
                      const updatedReadings = [...hourlyReadings]
                      updatedReadings[hour] = null
                      setHourlyReadings(updatedReadings)
                      showToast("Reading deleted", `Blood sugar reading for ${hour}:00 has been deleted`)
                    } catch (error) {
                      showToast("Error deleting reading", "There was an error deleting your reading.", "error")
                    }
                  }}
                />
              </div>
            </div>
          </Tab.Panel>
        </Tab.Panels>
      </Tab.Group>
    </div>
  )
}

