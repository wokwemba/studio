
'use client';

import { FormField } from './data';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Calendar as CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';

interface DynamicFormProps {
  fields: FormField[];
  formData: Record<string, any>;
  onFormChange: (fieldName: string, value: any) => void;
  isDisabled?: boolean;
}

export function DynamicForm({ fields, formData, onFormChange, isDisabled }: DynamicFormProps) {
  const renderField = (field: FormField) => {
    switch (field.type) {
      case 'text':
      case 'file': // HTML file inputs are complex, using text for now to enter paths.
        return (
          <Input
            type={field.type === 'file' ? 'file' : 'text'}
            id={field.name}
            name={field.name}
            placeholder={field.placeholder}
            value={field.type === 'file' ? undefined : (formData[field.name] || '')}
            onChange={(e) => onFormChange(field.name, field.type === 'file' ? e.target.files : e.target.value)}
            disabled={isDisabled}
          />
        );
      case 'date':
        return (
           <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={"outline"}
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !formData[field.name] && "text-muted-foreground"
                )}
                disabled={isDisabled}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {formData[field.name] ? format(new Date(formData[field.name]), "PPP") : <span>{field.placeholder || 'Pick a date'}</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={formData[field.name] ? new Date(formData[field.name]) : undefined}
                onSelect={(date) => onFormChange(field.name, date?.toISOString())}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        );
      case 'textarea':
        return (
          <Textarea
            id={field.name}
            name={field.name}
            placeholder={field.placeholder}
            value={formData[field.name] || ''}
            onChange={(e) => onFormChange(field.name, e.target.value)}
            disabled={isDisabled}
          />
        );
      case 'select':
        return (
          <Select
            value={formData[field.name]}
            onValueChange={(value) => onFormChange(field.name, value)}
            disabled={isDisabled}
          >
            <SelectTrigger id={field.name}>
              <SelectValue placeholder={field.placeholder || 'Select an option'} />
            </SelectTrigger>
            <SelectContent>
              {field.options?.map((option) => (
                <SelectItem key={option} value={option}>{option}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        );
      case 'checkbox':
        return (
          <div className="flex items-center space-x-2 pt-2">
            <Checkbox
              id={field.name}
              checked={!!formData[field.name]}
              onCheckedChange={(checked) => onFormChange(field.name, checked)}
              disabled={isDisabled}
            />
            <Label htmlFor={field.name} className="text-sm font-normal text-muted-foreground cursor-pointer">
              {field.label}
            </Label>
          </div>
        );
      case 'checkbox-group':
        return (
            <ScrollArea className="h-72 w-full rounded-md border p-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {field.options?.map((option) => (
                    <div key={option} className="flex items-center space-x-2">
                    <Checkbox
                        id={`${field.name}-${option}`}
                        checked={formData[field.name]?.includes(option)}
                        onCheckedChange={(checked) => {
                        const currentValues = formData[field.name] || [];
                        const newValues = checked
                            ? [...currentValues, option]
                            : currentValues.filter((v: string) => v !== option);
                        onFormChange(field.name, newValues);
                        }}
                        disabled={isDisabled}
                    />
                    <Label htmlFor={`${field.name}-${option}`} className="font-normal text-sm">
                        {option}
                    </Label>
                    </div>
                ))}
              </div>
            </ScrollArea>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-4 border-t pt-4 mt-4">
      {fields.map((field) => (
        <div key={field.name} className="grid w-full items-center gap-1.5">
           {field.type !== 'checkbox' && <Label htmlFor={field.name}>{field.label}</Label>}
          {renderField(field)}
        </div>
      ))}
    </div>
  );
}
