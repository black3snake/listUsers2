import {Pipe, PipeTransform} from '@angular/core';

@Pipe({
  name: 'symbolLess'
})
export class SymbolLessPipe implements PipeTransform {

  transform(value: string): string {
    if (!value || value.length < 8) {
      return value;
    }
    const match = value.match(/^(.{2}).*(.{4})$/);

    if (match) {
      return `${match[1]}..${match[2]}`;
    }
    return value;
  }
}
