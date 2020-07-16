import { Pipe, PipeTransform } from '@angular/core';
import { CrossRoad } from '../models/semaphore';

@Pipe({
  name: 'filterAddress'
})
export class FilterAddressPipe implements PipeTransform {

  public transform(list: CrossRoad[], filterText: string): any {
        
    if (!filterText) return list;
    return list ? list.filter(item => item.address.search(new RegExp(filterText, 'gi')) > -1) : [];
  }

}
