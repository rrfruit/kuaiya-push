import { Button } from '@repo/ui/components/ui/button'
import { useAppStore } from '@/stores/useAppStore'

export default function DashboardPage() {
  const { sidebarOpen, toggleSidebar, theme, setTheme } = useAppStore()

  return (
    <div className="p-4">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <div className="space-x-2">
          <Button variant="outline" onClick={toggleSidebar}>
            {sidebarOpen ? 'Close Sidebar' : 'Open Sidebar'}
          </Button>
          <Button variant="outline" onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}>
            Switch to {theme === 'light' ? 'Dark' : 'Light'}
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border bg-card text-card-foreground shadow">
          <div className="p-6 flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="tracking-tight text-sm font-medium">Total Revenue</h3>
          </div>
          <div className="p-6 pt-0">
            <div className="text-2xl font-bold">$45,231.89</div>
            <p className="text-xs text-muted-foreground">+20.1% from last month</p>
          </div>
        </div>
      </div>
      <div className="pt-4">
        <p className="text-sm text-muted-foreground">
          Current State: Theme is <strong>{theme}</strong>, Sidebar is{' '}
          <strong>{sidebarOpen ? 'Open' : 'Closed'}</strong>
        </p>
      </div>
    </div>
  )
}
