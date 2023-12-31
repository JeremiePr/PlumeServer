export interface ControllerMethodArgument
{
    name?: string;
    type: string;
    httpSource: 'query' | 'route' | 'body' | 'header';
}

export interface ControllerMethod
{
    key: string | symbol;
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
    type: 'service' | 'controller' | 'instance' | 'handler';
    name: string | null;
    target: any;
    instance: any;
    controllerData: ControllerData | null;
    handlerPattern: string | null;
    manualInjects: Array<{ id: string; index: number; }>;
}