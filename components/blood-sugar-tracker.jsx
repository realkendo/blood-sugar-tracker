"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";

// Initialize 24 hours of data
const initializeData = () => {
  return Array.from({ length: 24 }, (_, i) => ({
    hour: i,
    value: null,
    time: `${i.toString().padStart(2, "0")}:00`,
  }));
};

export default function BloodSugarTracker() {
  const [readings, setReadings] = useState(initializeData());
  const [currentHour, setCurrentHour] = useState(0);
  const [currentValue, setCurrentValue] = useState("");
  const [error, setError] = useState(null);

  // Update a reading for a specific hour
  const updateReading = () => {
    if (!currentValue) {
      setError("Please enter a blood sugar value");
      return;
    }

    const value = Number.parseFloat(currentValue);
    if (isNaN(value) || value < 0) {
      setError("Please enter a valid positive number");
      return;
    }

    setReadings((prev) =>
      prev.map((reading) =>
        reading.hour === currentHour ? { ...reading, value } : reading
      )
    );
    setCurrentValue("");
    setError(null);
  };

  // Handle input change for blood sugar value
  const handleValueChange = (e) => {
    setCurrentValue(e.target.value);
    if (error) setError(null);
  };

  // Get chart data, filtering out null values for the chart
  const getChartData = () => {
    return readings.map((reading) => ({
      ...reading,
      // Use 0 for null values in the chart to avoid gaps
      value: reading.value === null ? 0 : reading.value,
    }));
  };

  // Determine the range for a blood sugar value
  const getBloodSugarRange = (value) => {
    if (value === null) return "unknown";
    if (value < 70) return "low";
    if (value > 180) return "high";
    return "normal";
  };

  return (
    <div className="grid gap-6 md:grid-cols-2 border border-purple-500">
      <Card>
        <CardHeader>
          <CardTitle>Input Blood Sugar Readings</CardTitle>
          <CardDescription>
            Enter your blood sugar level for each hour of the day
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="hour">Hour</Label>
                <select
                  id="hour"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={currentHour}
                  onChange={(e) =>
                    setCurrentHour(Number.parseInt(e.target.value))
                  }
                >
                  {readings.map((reading) => (
                    <option key={reading.hour} value={reading.hour}>
                      {reading.time}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="value">Blood Sugar (mg/dL)</Label>
                <Input
                  id="value"
                  type="number"
                  placeholder="Enter value"
                  value={currentValue}
                  onChange={handleValueChange}
                />
              </div>
            </div>

            <Button onClick={updateReading} className="w-full">
              Update Reading
            </Button>

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
          </div>

          <div className="mt-6">
            <h3 className="font-medium mb-2">Current Readings</h3>
            <div className="max-h-[300px] overflow-y-auto border rounded-md">
              <table className="w-full">
                <thead className="bg-muted sticky top-0">
                  <tr>
                    <th className="text-left p-2">Time</th>
                    <th className="text-left p-2">Blood Sugar</th>
                    <th className="text-left p-2">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {readings.map((reading) => {
                    const range = getBloodSugarRange(reading.value);
                    return (
                      <tr key={reading.hour} className="border-t">
                        <td className="p-2">{reading.time}</td>
                        <td className="p-2">
                          {reading.value !== null
                            ? `${reading.value} mg/dL`
                            : "-"}
                        </td>
                        <td className="p-2">
                          {reading.value !== null && (
                            <span
                              className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                                range === "low"
                                  ? "bg-red-300 text-red-800"
                                  : range === "high"
                                  ? "bg-orange-300 text-orange-800"
                                  : "bg-green-300 text-green-800"
                              }`}
                            >
                              {range === "low"
                                ? "Low"
                                : range === "high"
                                ? "High"
                                : "Normal"}
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Blood Sugar Chart</CardTitle>
          <CardDescription>
            Visualize your blood sugar levels over a 24-hour period
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer
            config={{
              bloodSugar: {
                label: "Blood Sugar",
                color: "hsl(var(--chart-1))",
              },
              normalRangeMin: {
                label: "Min Normal",
                color: "hsl(var(--chart-2))",
              },
              normalRangeMax: {
                label: "Max Normal",
                color: "hsl(var(--chart-3))",
              },
            }}
            className="h-[350px]"
          >
            <AreaChart
              data={getChartData()}
              margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
            >
              <defs>
                <linearGradient
                  id="bloodSugarGradient"
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop
                    offset="5%"
                    stopColor="var(--color-bloodSugar)"
                    stopOpacity={0.8}
                  />
                  <stop
                    offset="95%"
                    stopColor="var(--color-bloodSugar)"
                    stopOpacity={0.2}
                  />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis
                dataKey="time"
                tickFormatter={(value) => value}
                interval={3}
              />
              <YAxis
                domain={[0, 300]}
                ticks={[0, 70, 180, 300]}
                tickFormatter={(value) => `${value}`}
              />
              <ChartTooltip
                content={
                  <ChartTooltipContent
                    indicator="line"
                    formatter={(value) => `${value} mg/dL`}
                  />
                }
              />
              <Area
                type="monotone"
                dataKey="value"
                stroke="var(--color-bloodSugar)"
                fillOpacity={1}
                fill="url(#bloodSugarGradient)"
              />
              {/* Normal range reference lines */}
              <Area
                type="monotone"
                dataKey={() => 70}
                stroke="var(--color-normalRangeMin)"
                strokeDasharray="3 3"
                fill="none"
                name="Min Normal"
              />
              <Area
                type="monotone"
                dataKey={() => 180}
                stroke="var(--color-normalRangeMax)"
                strokeDasharray="3 3"
                fill="none"
                name="Max Normal"
              />
            </AreaChart>
          </ChartContainer>

          <div className="mt-4 grid grid-cols-3 gap-2 text-sm">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-green-500"></span>
              <span>Normal (70-180 mg/dL)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-red-500"></span>
              <span>Low (&lt;70 mg/dL)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-orange-500"></span>
              <span>High (&gt;180 mg/dL)</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
