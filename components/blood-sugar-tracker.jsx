"use client"

import { useState, useEffect } from "react"
import { Plus, Trash, AlertCircle, Coffee, Sun, Sunset, Moon } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useToast } from "@/hooks/use-toast"
import BloodSugarChart from "./blood-sugar-chart"
import BloodSugarTable from "./blood-sugar-table"
import BloodSugarStats from "./blood-sugar-stats"

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
  const { toast } = useToast()

  // Add a new state for auto-advance feature
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
      toast({
        title: "Error saving data",
        description: "Your data couldn't be saved to local storage.",
        variant: "destructive",
      })
    }
  }, [hourlyReadings, toast])

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

    toast({
      title: "Reading added",
      description: `Blood sugar reading of ${value} mg/dL added for ${currentHour}:00`,
    })

    // Focus the input field again
    document.getElementById("blood-sugar-value").focus()
  }

  // Clear all data
  const clearAllData = () => {
    if (confirm("Are you sure you want to clear all your blood sugar readings? This cannot be undone.")) {
      setHourlyReadings(Array(24).fill(null))
      toast({
        title: "Data cleared",
        description: "All blood sugar readings have been cleared.",
      })
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
      return "bg-primary/10 border-primary text-primary"
    }

    return ""
  }

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Add Blood Sugar Reading</CardTitle>
            <CardDescription>Select a time and enter your blood sugar level</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-4">
                <Label>Select Time</Label>

                {timeBlocks.map((block) => (
                  <div key={block.name} className="space-y-2">
                    <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                      {block.icon}
                      <span>{block.name}</span>
                    </div>
                    <div className="grid grid-cols-6 gap-2">
                      {block.hours.map((hour) => (
                        <Button
                          key={hour}
                          variant="outline"
                          size="sm"
                          onClick={() => setCurrentHour(hour)}
                          className={`h-10 ${getTimeButtonColor(hour)}`}
                        >
                          {hour}:00
                          {hourlyReadings[hour] !== null && (
                            <span className="absolute -top-1 -right-1 flex h-3 w-3">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-3 w-3 bg-primary"></span>
                            </span>
                          )}
                        </Button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label htmlFor="value">Blood Sugar for {currentHour}:00</Label>
                  <div className="flex items-center gap-2">
                    {autoAdvance && (
                      <span className="text-xs text-muted-foreground">Next: {(currentHour + 1) % 24}:00</span>
                    )}
                    <div className="flex items-center space-x-2">
                      <Label htmlFor="auto-advance" className="text-xs cursor-pointer">
                        Auto-advance
                      </Label>
                      <input
                        id="auto-advance"
                        type="checkbox"
                        checked={autoAdvance}
                        onChange={(e) => setAutoAdvance(e.target.checked)}
                        className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                      />
                    </div>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Input
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
                    className="text-lg"
                    autoFocus
                  />
                  <Button onClick={addReading} className="whitespace-nowrap">
                    <Plus className="mr-2 h-4 w-4" /> Add
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-end">
            <Button variant="outline" size="sm" onClick={clearAllData}>
              <Trash className="mr-2 h-4 w-4" /> Clear All Data
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Blood Sugar Statistics</CardTitle>
            <CardDescription>Summary of your daily readings</CardDescription>
          </CardHeader>
          <CardContent>
            <BloodSugarStats readings={hourlyReadings} />
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="chart">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="chart">Chart</TabsTrigger>
          <TabsTrigger value="table">Table</TabsTrigger>
        </TabsList>
        <TabsContent value="chart" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Blood Sugar Chart</CardTitle>
              <CardDescription>24-hour view of your blood sugar levels</CardDescription>
            </CardHeader>
            <CardContent>
              <BloodSugarChart readings={hourlyReadings} />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="table" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Blood Sugar Readings</CardTitle>
              <CardDescription>Hourly readings for today</CardDescription>
            </CardHeader>
            <CardContent>
              <BloodSugarTable
                readings={hourlyReadings}
                onUpdate={(hour, value) => {
                  try {
                    const updatedReadings = [...hourlyReadings]
                    updatedReadings[hour] = value
                    setHourlyReadings(updatedReadings)
                    toast({
                      title: "Reading updated",
                      description: `Blood sugar reading for ${hour}:00 updated to ${value} mg/dL`,
                    })
                  } catch (error) {
                    toast({
                      title: "Error updating reading",
                      description: "There was an error updating your reading.",
                      variant: "destructive",
                    })
                  }
                }}
                onDelete={(hour) => {
                  try {
                    const updatedReadings = [...hourlyReadings]
                    updatedReadings[hour] = null
                    setHourlyReadings(updatedReadings)
                    toast({
                      title: "Reading deleted",
                      description: `Blood sugar reading for ${hour}:00 has been deleted`,
                    })
                  } catch (error) {
                    toast({
                      title: "Error deleting reading",
                      description: "There was an error deleting your reading.",
                      variant: "destructive",
                    })
                  }
                }}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

