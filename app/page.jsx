import BloodSugarTracker from "@/components/blood-sugar-tracker"

export default function Home() {
  return (
    <main className="min-h-screen p-4 md:p-8 bg-gray-50">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Blood Sugar Tracker</h1>
        <p className="text-gray-600 mb-8">Track and visualize blood sugar levels over a 24-hour period</p>
        <BloodSugarTracker />
      </div>
    </main>
  )
}

