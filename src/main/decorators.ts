import { registeredServices } from './core';
import { ControllerMethod, ControllerMethodArgument, Service } from './types';

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
type HttpSource = 'query' | 'route' | 'body' | 'header';

const methods: Array<{ httpMethod: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'; route: string; target: any; key: string; }> = [];

const parameters: Array<{ name: string; type: string; httpSource: 'query' | 'route' | 'body' | 'header'; target: any; key: string; index: number; }> = [];

const http = (method: HttpMethod, route: string) => (target: any, key: string) =>
{
    methods.push({ httpMethod: method, route, target: target.constructor, key });
}

const from = (httpSource: HttpSource, name: string) => (target: any, key: string, index: number) =>
{
    const type = Reflect.getMetadata('design:paramtypes', target, key)[index];

    if ((httpSource === 'route' || httpSource === 'query') && type.name !== 'String' && type.name !== 'Number' && type.name !== 'Boolean')
        throw new Error('Argument type invalid');

    if ((httpSource === 'body' || httpSource === 'header') && type.name !== 'Object')
        throw new Error('Argument type invalid');

    parameters.push({ name, type: type.name, httpSource, target: target.constructor, key, index });
}

// Services

export const injectable = () => (target: any) =>
{
    const service: Service = {
        type: 'service',
        name: target.name,
        target,
        instance: null,
        controllerData: null
    };

    registeredServices.push(service);
}

export const controller = (route: string) => (target: any) =>
{
    const controllerMethods: Array<ControllerMethod> = [];
    for (const method of methods.filter(m => m.target === target))
    {
        const controllerParameters = parameters
            .filter(p => p.target === target)
            .filter(p => p.key === method.key)
            .sort((a, b) => a.index - b.index)
            .map(p => ({ name: p.name, type: p.type, httpSource: p.httpSource }));

        const types = Reflect.getMetadata('design:paramtypes', target.prototype, method.key) ?? [];
        if (controllerParameters.length !== types.length)
            throw new Error('Some endpoint method arguments are incorrect');

        controllerMethods.push({
            key: method.key,
            httpMethod: method.httpMethod,
            route: method.route,
            controllerParameters
        });
    }

    const service: Service = {
        type: 'controller',
        name: target.name,
        target,
        instance: null,
        controllerData: { route, controllerMethods }
    };

    registeredServices.push(service);
}

// Controller Methods

export const httpGet = (route: string) => http('GET', route);
export const httpPost = (route: string) => http('POST', route);
export const httpPut = (route: string) => http('PUT', route);
export const httpPatch = (route: string) => http('PATCH', route);
export const httpDelete = (route: string) => http('DELETE', route);

// Controller Parameters

export const fromQuery = (name: string) => from('query', name);
export const fromRoute = (name: string) => from('route', name);
export const fromBody = () => from('body', '');
export const fromHeader = () => from('header', '');