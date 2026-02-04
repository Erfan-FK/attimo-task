'use client';

import React, { forwardRef } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DateTimePickerProps {
  value: Date | null;
  onChange: (date: Date | null) => void;
  placeholder?: string;
  className?: string;
}

const CustomInput = forwardRef<HTMLButtonElement, any>(({ value, onClick, placeholder }, ref) => (
  <button
    type="button"
    onClick={onClick}
    ref={ref}
    className={cn(
      'flex h-9 w-full items-center justify-start rounded-xl border border-border bg-surface px-3 py-2 text-sm ring-offset-bg',
      'focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2',
      'hover:bg-surface2 transition-colors',
      !value && 'text-muted'
    )}
  >
    <Calendar className="mr-2 h-4 w-4 text-muted" />
    {value || placeholder || 'Select date and time'}
  </button>
));
CustomInput.displayName = 'CustomInput';

export function DateTimePicker({ value, onChange, placeholder, className }: DateTimePickerProps) {
  return (
    <div className={cn('date-time-picker-wrapper', className)}>
      <DatePicker
        selected={value}
        onChange={onChange}
        showTimeSelect
        timeFormat="HH:mm"
        timeIntervals={15}
        dateFormat="MMM d, yyyy h:mm aa"
        customInput={<CustomInput placeholder={placeholder} />}
        calendarClassName="custom-calendar"
        popperClassName="custom-popper"
        timeCaption="Time"
      />
    </div>
  );
}
