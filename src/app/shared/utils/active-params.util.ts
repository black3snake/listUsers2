import {ActiveParamsType} from "../../../types/active-params.type";
import {ParamMap, Params} from "@angular/router";

export class ActiveParamsUtil {
  static processParams(queryParamMap: Params|ParamMap): ActiveParamsType {
    const activeParams: ActiveParamsType = {};
    if(queryParamMap.has('query')) {
      activeParams.query = queryParamMap.get('query');
    }
    if(queryParamMap.has('page')) {
      const pageNumber = parseInt(queryParamMap.get('page'));
      if (!isNaN(pageNumber) && pageNumber > 0 )
        activeParams.page = pageNumber;
    }
    return activeParams;
  }
}
