import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'formatEstado',
  standalone: true,
})
export class FormatEstadoPipe implements PipeTransform {
  transform(value: string): string {
    if (!value) {
      return '-';
    }
    // Replace underscores with spaces and format first letter of each word
    return value
      .replace(/_/g, ' ')
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  }
}
