export interface ControllerMethodArgument
{
    name: string;
    type: string;
    httpSource: 'query' | 'route' | 'body' | 'header';
}

export interface ControllerMethod
{
    key: string;
    httpMethod: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
    route: string;
    controllerParameters: Array<ControllerMethodArgument>;
}

export interface ControllerData
{
    route: string;
    controllerMethods: Array<ControllerMethod> | null;
}

export interface Service
{
    type: 'service' | 'controller' | 'instance';
    name: string | null;
    target: any;
    instance: any;
    controllerData: ControllerData | null;
}