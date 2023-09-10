import * as cors from 'cors';
import * as express from 'express';
import { Server } from 'http';
import 'reflect-metadata';
import { ControllerMethod, Service } from './types';

export const registeredServices: Array<Service> = [];

export class PlumeServer
{
    private _express: express.Express | null = null;
    private _router: express.Router | null = null;

    private constructor(
        private readonly _port: number,
        private readonly _services: Array<Service>,
        private readonly _onApiError: (err: any) => void) { }

    public async run(): Promise<{ server: Server, services: Array<{ target: any, instance: any }> }>
    {
        this._express = express();
        this._router = express.Router();

        this._express.use(express.urlencoded({ extended: true }));
        this._express.use(express.json());
        this._express.use(cors());

        for (const service of this._services)
        {
            service.instance = this.getInstance(service.target);
        }

        for (const service of this._services.filter(s => s.type === 'controller'))
        {
            await this.buildController(service);
        }

        const server = this._express.listen(this._port);
        const services = this._services.filter(s => !!s.instance).map(s => ({ target: s.target, instance: s.instance }));

        this._express.use('/', this._router);

        return { server, services };
    }

    private async buildController(controller: Service): Promise<void>
    {
        const instance = this.getInstance(controller.target);
        if (!instance) throw new Error(`Controller instance of type '${controller.name}' not found`);
        if (!controller.controllerData?.controllerMethods) return;

        for (const method of controller.controllerData.controllerMethods)
        {
            const route = `/${controller.controllerData.route}/${method.route}`;
            const endpoint = this.getEndpoint(method, instance);
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

    private getEndpoint(method: ControllerMethod, instance: any): ((req: any, res: any) => Promise<void>)
    {
        return async (req: any, res: any) =>
        {
            try
            {
                const args = method.controllerParameters
                    .map(p =>
                    {
                        let result: any;
                        switch (p.httpSource)
                        {
                            case 'query': result = req.query[p.name]; break;
                            case 'route': result = req.params[p.name]; break;
                            case 'body': result = req.body; break;
                            case 'header': result = req.headers; break;
                        }

                        if (result && p.type === 'Number') result = +result;
                        if (result && p.type === 'Boolean') result = result === 'true';

                        return result;
                    });

                const response = await instance[method.key].apply(instance, args);

                res.status(200).json(response);
            }
            catch (err)
            {
                const error: any = err;
                this._onApiError(error);

                res.status(500).json(error);
            }
        };
    }

    private getInstance(target: any): any
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
            if (manualInject && ['Object', 'String', 'Number', 'Boolean'].includes(dependency.name)) return this.getInstance(manualInject.id);
            else return this.getInstance(dependency);
        });

        service.instance = new target(...typeDependencyInstances);
        return service.instance;
    }

    public static async run(port: number, onApiErrors?: (err: any) => void, instances?: Array<{ id: any, instance: any }>): Promise<{ server: Server, services: Array<{ target: any, instance: any }> }>
    {
        instances ??= [];
        onApiErrors ??= () => { };

        instances.forEach(({ id, instance }) => this.registerInstance(id, instance));
        const server = new PlumeServer(port, registeredServices, onApiErrors);
        return await server.run();
    }

    private static registerInstance(id: any, instance: any): void
    {
        const service: Service = {
            type: 'instance',
            name: null,
            target: id,
            instance: instance,
            controllerData: null,
            manualInjects: []
        };
        registeredServices.push(service);
    }
}