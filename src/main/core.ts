import * as cors from 'cors';
import * as express from 'express';
import { IncomingMessage, Server, ServerResponse } from 'http';
import 'reflect-metadata';
import { ControllerMethod, Service } from './types';
import { IRequestHandler } from './handlers';
import { Result } from './result';

export const registeredServices: Array<Service> = [];

export class PlumeServer
{
    private _server: Server<typeof IncomingMessage, typeof ServerResponse> | null = null;
    private _express: express.Express | null = null;
    private _router: express.Router | null = null;
    private _port = 0;
    private _isRunning = false;

    private constructor(private readonly _services: Array<Service>) { }

    private initialize(): void
    {
        this._express = express();
        this._router = express.Router();
        this._express.use(express.urlencoded({ extended: true }));
        this._express.use(express.json());
        this._express.use(cors());
    }

    private async buildController(controller: Service): Promise<void>
    {
        const instance = this.resolveInstance(controller.target);
        if (!instance) throw new Error(`Controller instance of type '${controller.name}' not found`);
        if (!controller.controllerData?.controllerMethods) return;

        for (const method of controller.controllerData.controllerMethods)
        {
            const route = `/${controller.controllerData.route}/${method.route}`;
            const endpoint = this.getEndpoint(controller, method, instance);
            switch (method.httpMethod)
            {
                case 'GET': this._router?.get(route, endpoint); break;
                case 'POST': this._router?.post(route, endpoint); break;
                case 'PUT': this._router?.put(route, endpoint); break;
                case 'PATCH': this._router?.patch(route, endpoint); break;
                case 'DELETE': this._router?.delete(route, endpoint); break;
            }
        }
    }

    private getEndpoint(controller: Service, method: ControllerMethod, instance: any): ((request: any, response: any) => Promise<void>)
    {
        return async (request: any, response: any) =>
        {
            try
            {
                const args = method.controllerParameters
                    .map(p =>
                    {
                        let result: any;
                        switch (p.httpSource)
                        {
                            case 'query': result = p.name ? request.query[p.name] : undefined; break;
                            case 'route': result = p.name ? request.params[p.name] : undefined; break;
                            case 'body': result = p.name ? request.body[p.name] : request.body; break;
                            case 'header': result = p.name ? request.headers[p.name] : request.headers; break;
                        }

                        if (result && p.type === 'Number') result = +result;
                        if (result && p.type === 'Boolean') result = result === 'true';

                        return result;
                    });

                const requestHandlers = this._services.filter(s => s.type === 'handler' && (!s.handlerPattern || controller.controllerData?.route?.startsWith(s.handlerPattern)));

                const handle = async (handlerIndex: number, args: Array<any>): Promise<Result<any>> =>
                {
                    if (handlerIndex < requestHandlers.length)
                    {
                        const handler: IRequestHandler = this.resolveInstance(requestHandlers[handlerIndex].target);
                        const next = (args: Array<any>) => handle(handlerIndex + 1, args);
                        return await handler.handle(args, next, request);
                    }

                    return await instance[method.key].apply(instance, args);
                };

                const result = await handle(0, args);
                response.status(result.status).json(result.isSuccess ? result.data : result.error);
            }
            catch (err)
            {
                const error: any = err;
                response.status(500).json(error);
            }
        };
    }

    private resolveInstance(target: any): any
    {
        const service = this._services.find(s => s.target === target);
        if (!service)
        {
            if (typeof target === 'string') throw new Error(`Service of name '${target}' is not registered`);
            else throw new Error(`Service of type '${target?.name}' is not registered`);
        }
        if (service.instance) return service.instance;
        if (service.type === 'instance') throw new Error(`Instance of key '${target}' is not registered`);

        const typeDependencies = Reflect.getMetadata('design:paramtypes', target) ?? [];
        const typeDependencyInstances = typeDependencies.map((dependency: any, i: number) =>
        {
            const manualInject = service.manualInjects.find(x => x.index === i);
            if (manualInject && ['Object', 'String', 'Number', 'Boolean'].includes(dependency.name)) return this.resolveInstance(manualInject.id);
            else return this.resolveInstance(dependency);
        });

        service.instance = new target(...typeDependencyInstances);
        return service.instance ?? null;
    }

    public registerInstance(id: string, instance: any): void
    {
        const service: Service = {
            type: 'instance',
            name: null,
            target: id,
            instance: instance,
            controllerData: null,
            handlerPattern: null,
            manualInjects: []
        };
        this._services.push(service);
    }

    public getService<T>(target: any): T | null
    {
        if (!this._isRunning) throw new Error('Unable to retrieve a service before it is running');
        return this._services.find(s => s.target === target)?.instance ?? null;
    }

    public async serve(port: number): Promise<PlumeServer>
    {
        if (!this._express || !this._router)
            throw new Error('Error when running host');

        if (port <= 0)
            throw new Error('Port is invalid');

        this._port = port;

        for (const service of this._services.filter(s => s.type === 'controller'))
        {
            await this.buildController(service);
        }

        this._server = this._express.listen(this._port);
        this._express.use('/', this._router);

        this._isRunning = true;

        return this;
    }

    public close(): void
    {
        this._server?.close();
    }

    public static createHost(): PlumeServer
    {
        const host = new PlumeServer(registeredServices);
        host.initialize();
        return host;
    }
}