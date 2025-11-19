"use client"

/**
 * DashboardPage Component
 * 
 * View Layer in MVVM Pattern
 * Displays user dashboard
 * 
 * Features:
 * - User dashboard interface
 * - Protected route (requires authentication)
 */
export default function DashboardPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center">
      <div className="w-full max-w-4xl space-y-8 px-4">
        <div className="text-center">
          <h1 className="text-4xl font-bold">Dashboard</h1>
        </div>
      </div>
    </div>
  );
}
