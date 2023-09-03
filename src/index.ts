import { PlumeServer } from './main/core';
import { controller, fromBody, fromHeader, fromQuery, fromRoute, httpDelete, httpGet, httpPatch, httpPost, httpPut, injectable } from './main/decorators';

const classDecorators = { injectable, controller };
const endpointDecorators = { httpGet, httpPost, httpPut, httpPatch, httpDelete };
const endpointArgumentDecorators = { fromQuery, fromRoute, fromBody, fromHeader };

export default { PlumeServer, ...classDecorators, ...endpointDecorators, ...endpointArgumentDecorators };