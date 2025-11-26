import { AlignLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Fragment } from 'react/jsx-runtime'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@repo/ui/components/ui/breadcrumb'
import { Button } from '@repo/ui/components/ui/button'
import { useSidebar } from '@repo/ui/components/ui/sidebar'
import { cn } from '@repo/ui/lib/utils'
import { useIsMobile } from '@/hooks/use-mobile'
import ModeToggle from './mode-toggle'

interface ContentLayoutProps {
  title: string
  breadcrumbs?: {
    label: string
    href: string
  }[]
  children: React.ReactNode
  actions?: React.ReactNode
  className?: string
  headerClassName?: string
  style?: React.CSSProperties
}

function SidebarTriggerMobile() {
  const { toggleSidebar } = useSidebar()
  return (
    <Button data-sidebar="trigger" data-slot="sidebar-trigger" variant="ghost" size="icon" onClick={toggleSidebar}>
      <AlignLeft />
      <span className="sr-only">Toggle Sidebar</span>
    </Button>
  )
}

function Breadcrumbs({ breadcrumbs }: { breadcrumbs: { label: string; href: string }[] }) {
  const navigate = useNavigate()

  return (
    <Breadcrumb>
      <BreadcrumbList>
        {breadcrumbs.map((breadcrumb, i) => (
          <Fragment key={i}>
            <BreadcrumbItem>
              {i === breadcrumbs.length - 1 ? (
                <BreadcrumbPage>{breadcrumb.label}</BreadcrumbPage>
              ) : (
                <>
                  <BreadcrumbLink
                    className="cursor-pointer"
                    onClick={() => {
                      navigate(breadcrumb.href)
                    }}
                  >
                    {breadcrumb.label}
                  </BreadcrumbLink>
                </>
              )}
            </BreadcrumbItem>
            {i !== breadcrumbs.length - 1 && <BreadcrumbSeparator />}
          </Fragment>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  )
}

export default function ContentLayout({
  title,
  children,
  actions,
  className,
  style,
  headerClassName,
  breadcrumbs,
}: ContentLayoutProps) {
  const isMobile = useIsMobile()

  return (
    <>
      <header
        className={cn(
          'bg-background/95 sticky top-0 z-10 flex h-14 shrink-0 items-center gap-2 border-b pr-4 backdrop-blur-sm transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12',
          headerClassName,
        )}
      >
        <div className="flex flex-1 items-center gap-2 pr-4 pl-2">
          {isMobile && <SidebarTriggerMobile />}

          {breadcrumbs ? <Breadcrumbs breadcrumbs={breadcrumbs} /> : <div className="text-lg font-medium">{title}</div>}
        </div>
        <div className="flex items-center gap-2">
          <ModeToggle />
        </div>
        {actions && <div className="flex items-center gap-2">{actions}</div>}
      </header>
      <div className={cn('flex flex-1 flex-col', className)} style={style}>
        {children}
      </div>
    </>
  )
}
