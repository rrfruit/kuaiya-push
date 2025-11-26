import { cn } from '@repo/ui/lib/utils'
import logo from './logo.jpeg'

function Logo(props: { className?: string }) {
  return <img src={logo} alt="logo" className={cn('size-10 rounded-md', props.className)} />
}

export default Logo
