import { DayPicker, type DayPickerProps } from 'react-day-picker';
import 'react-day-picker/style.css';

export function Calendar({ accentColor, ...props }: DayPickerProps & { accentColor: string }) {
  return (
    <DayPicker
      {...props}
      className="text-sm"
      style={{
        '--rdp-accent-color': accentColor,
        '--rdp-day-width': '36px',
        '--rdp-day-height': '36px',
        '--rdp-day_button-width': '34px',
        '--rdp-day_button-height': '34px',
      } as React.CSSProperties}
    />
  );
}
