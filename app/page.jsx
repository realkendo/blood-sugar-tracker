import BloodSugarTracker from "@/components/blood-sugar-tracker"

export default function Home() {
  return (
    <main className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-8 text-center">Blood Sugar Level Tracker</h1>
      <BloodSugarTracker />
    </main>
  )
}

