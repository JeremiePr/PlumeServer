import { registeredServices } from './core';
import { ControllerMethod, Service } from './types';

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
type HttpSource = 'query' | 'route' | 'body' | 'header';

const methods: Array<{ httpMethod: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'; route: string; target: any; key: string; }> = [];
const parameters: Array<{ name: string; type: string; httpSource: 'query' | 'route' | 'body' | 'header'; target: any; key: string; index: number; }> = [];
const manualInjects: Array<{ id: string; target: any; key: string; index: number; }> = [];

const http = (httpMethod: HttpMethod, route: string) => (target: any, key: string) =>
{
    if (methods.some(x => x.target === target.constructor && x.httpMethod === httpMethod && x.route === route))
        throw new Error(`Another endpoint '${target.constructor.name}' in the same controller with the same route '${route}' already exists`);

    methods.push({ httpMethod: httpMethod, route, target: target.constructor, key });
}

const from = (httpSource: HttpSource, name: string) => (target: any, key: string, index: number) =>
{
    if (['body', 'header'].includes(httpSource) && parameters.some(x => x.target === target && x.key === key && x.httpSource === httpSource))
        throw new Error(`Endpoint '${target.constructor.name}.${key}' already has another http source as '${httpSource}'`);

    const type = Reflect.getMetadata('design:paramtypes', target, key)[index];

    if ((httpSource === 'route' || httpSource === 'query') && type.name !== 'String' && type.name !== 'Number' && type.name !== 'Boolean')
        throw new Error(`Endpoint '${target.constructor.name}.${key}'. Argument type '${type.name}' is invalid with the http source '${httpSource}'`);

    if ((httpSource === 'body' || httpSource === 'header') && type.name !== 'Object')
        throw new Error(`Endpoint '${target.constructor.name}.${key}'. Argument type '${type.name}' is invalid with the http source '${httpSource}'`);

    parameters.push({ name, type: type.name, httpSource, target: target.constructor, key, index });
}

// Services

export const Inject = (id: string) => (target: any, key: string, index: number) =>
{
    manualInjects.push({ id, target, key, index });
}

export const Injectable = () => (target: any) =>
{
    if (registeredServices.some(x => x.target === target))
        throw new Error(`Service '${target.name}' cannot be injected twice`);

    const service: Service = {
        type: 'service',
        name: target.name,
        target,
        instance: null,
        controllerData: null,
        manualInjects: manualInjects
            .filter(x => x.target === target)
            .map(x => ({ id: x.id, index: x.index }))
    };

    registeredServices.push(service);
}

export const Controller = (route: string) => (target: any) =>
{
    if (registeredServices.some(x => x.target === target))
        throw new Error(`Controller '${target.name}' cannot be injected twice`);

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
            throw new Error(`Controller '${target.name}' endpoint ${method.key}. Some arguments are not registered`);

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
        controllerData: { route, controllerMethods },
        manualInjects: manualInjects
            .filter(x => x.target === target)
            .map(x => ({ id: x.id, index: x.index }))
    };

    registeredServices.push(service);
}

// Controller Methods

export const HttpGet = (route: string = '') => http('GET', route);
export const HttpPost = (route: string = '') => http('POST', route);
export const HttpPut = (route: string = '') => http('PUT', route);
export const HttpPatch = (route: string = '') => http('PATCH', route);
export const HttpDelete = (route: string = '') => http('DELETE', route);

// Controller Parameters

export const FromQuery = (name: string) => from('query', name);
export const FromRoute = (name: string) => from('route', name);
export const FromBody = () => from('body', '');
export const FromHeader = () => from('header', '');