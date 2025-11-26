import { Moon, Sun } from 'lucide-react'
import { Toggle } from '@repo/ui/components/ui/toggle'
import { cn } from '@repo/ui/lib/utils'
import { useTheme } from '@/components/theme-provider'

export default function ModeToggle(props: { className?: string }) {
  const { theme, setTheme } = useTheme()

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light')
  }

  return (
    <>
      {theme === 'light' ? (
        <Toggle
          size="sm"
          className={cn('hover:bg-secondary! rounded-full bg-transparent!', props.className)}
          onPressedChange={toggleTheme}
        >
          <Sun className="size-4" />
        </Toggle>
      ) : (
        <Toggle size="sm" className={cn('rounded-full', props.className)} onPressedChange={toggleTheme}>
          <Moon className="size-4" />
        </Toggle>
      )}
    </>
  )
}
