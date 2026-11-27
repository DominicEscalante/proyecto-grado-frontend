import * as PopoverPrimitive from '@radix-ui/react-popover';
import { cn } from '../../lib/utils.js';

export const Popover = PopoverPrimitive.Root;
export const PopoverTrigger = PopoverPrimitive.Trigger;

export function PopoverContent({ className, align = 'start', sideOffset = 4, ...props }: React.ComponentProps<typeof PopoverPrimitive.Content>) {
  return (
    <PopoverPrimitive.Portal>
      <PopoverPrimitive.Content
        align={align}
        sideOffset={sideOffset}
        className={cn('z-[1100] max-h-[var(--radix-popover-content-available-height)] overflow-auto rounded-lg border border-stone-200 bg-white p-3 text-stone-900 shadow-md', className)}
        {...props}
      />
    </PopoverPrimitive.Portal>
  );
}
