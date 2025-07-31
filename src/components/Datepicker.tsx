import { Button } from '@/components/button';
import { Calendar } from '@/components/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/popover';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { Calendar as CalendarIcon } from 'lucide-react';
import { FunctionComponent } from 'react';

interface DatePickerProps {
  date?: Date;
  onDateChange(date?: Date): void;
  className?: string;
}

const DatePicker: FunctionComponent<DatePickerProps> = (props) => {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            'w-full justify-start font-normal h-11',
            !props.date && 'text-muted-foreground',
            props.className
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {props.date ? (
            format(props.date, 'PPP')
          ) : (
            <span className="body-small-medium">Pick a date</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0">
        <Calendar
          mode="single"
          selected={props.date}
          onSelect={props.onDateChange}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  );
};

export default DatePicker;
