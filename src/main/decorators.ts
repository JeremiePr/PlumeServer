import { registeredServices } from './core';
import { IRequestHandler } from './handlers';
import { Result } from './result';
import { ControllerMethod, Service } from './types';

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
type HttpSource = 'query' | 'route' | 'body' | 'header';

const methods: Array<{ httpMethod: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'; route: string; target: any; key: string | symbol; }> = [];
const parameters: Array<{ name?: string; type: string; httpSource: 'query' | 'route' | 'body' | 'header'; target: any; key: string; index: number; }> = [];
const manualInjects: Array<{ id: string; target: any; key: string; index: number; }> = [];

const http = <T>(httpMethod: HttpMethod, route: string) => (target: any, key: string | symbol, _: TypedPropertyDescriptor<(...args: Array<any>) => Promise<Result<T>>>) =>
{
    if (methods.some(x => x.target === target.constructor && x.httpMethod === httpMethod && x.route === route))
        throw new Error(`Another endpoint '${target.constructor.name}' in the same controller with the same route '${route}' already exists`);

    methods.push({ httpMethod: httpMethod, route, target: target.constructor, key });
}

const from = (httpSource: HttpSource, name?: string) => (target: any, key: any, index: number) =>
{
    if (['body', 'header'].includes(httpSource) && parameters.some(x => x.target === target && x.key === key && x.httpSource === httpSource))
        throw new Error(`Endpoint '${target.constructor.name}.${key}' already has another http source as '${httpSource}'`);

    const type = Reflect.getMetadata('design:paramtypes', target, key)[index];
    parameters.push({ name, type: type.name, httpSource, target: target.constructor, key, index });
}

const injectable = () => (target: any) =>
{
    if (registeredServices.some(x => x.target === target))
        throw new Error(`Service '${target.name}' cannot be injected twice`);

    const service: Service = {
        type: 'service',
        name: target.name,
        target,
        instance: null,
        controllerData: null,
        handlerPattern: null,
        manualInjects: manualInjects
            .filter(x => x.target === target)
            .map(x => ({ id: x.id, index: x.index }))
    };

    registeredServices.push(service);
}

const controller = (route: string) => (target: any) =>
{
    if (registeredServices.some(x => x.target === target))
        throw new Error(`Controller '${target.name}' cannot be injected twice`);

    const controllerMethods: Array<ControllerMethod> = [];
    for (const method of methods.filter(m => m.target === target))
    {
        const types: Array<any> = Reflect.getMetadata('design:paramtypes', target.prototype, method.key) ?? [];

        const controllerParameters = types
            .map((_, i: number): { name?: string, type: string, httpSource: 'query' | 'route' | 'body' | 'header' } =>
            {
                const parameter = parameters.find(p => p.target === target && p.key === method.key && p.index === i);
                if (!parameter) return { name: undefined, type: typeof {}, httpSource: 'query' };

                return { name: parameter.name, type: parameter.type, httpSource: parameter.httpSource };
            })

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
        handlerPattern: null,
        manualInjects: manualInjects
            .filter(x => x.target === target)
            .map(x => ({ id: x.id, index: x.index }))
    };

    registeredServices.push(service);
};

const requestHandler = (pattern: string | null) => <T extends new (...args: Array<any>) => IRequestHandler>(target: T) =>
{
    const service: Service = {
        type: 'handler',
        name: target.name,
        target,
        instance: null,
        controllerData: null,
        handlerPattern: pattern,
        manualInjects: manualInjects
            .filter(x => x.target === target)
            .map(x => ({ id: x.id, index: x.index }))
    };

    registeredServices.push(service);
}

// Exports

export const Inject = (id: string) => (target: any, key: any, index: number) => void manualInjects.push({ id, target, key, index });
export const Injectable = () => injectable();
export const Controller = (route: string) => controller(route);
export const RequestHandler = (pattern: string | null = null) => requestHandler(pattern);
export const HttpGet = <T>(route: string = '') => http<T>('GET', route);
export const HttpPost = <T>(route: string = '') => http<T>('POST', route);
export const HttpPut = <T>(route: string = '') => http<T>('PUT', route);
export const HttpPatch = <T>(route: string = '') => http<T>('PATCH', route);
export const HttpDelete = <T>(route: string = '') => http<T>('DELETE', route);
export const FromQuery = (name: string) => from('query', name);
export const FromRoute = (name: string) => from('route', name);
export const FromBody = () => from('body', '');
export const FromHeader = (name?: string) => from('header', name ?? '');