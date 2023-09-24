import { Controller, FromBody, FromQuery, FromRoute, HttpDelete, HttpGet, HttpPatch, HttpPost, HttpPut, Inject, Injectable, RequestHandler } from '../main/decorators';
import { IRequestHandler } from '../main/handlers';
import { Result, ok } from '../main/result';

@Injectable()
export class TestService
{
    public constructor(@Inject('config') private readonly _config: { name: string; purpose: string; }) { }

    public getName(): string
    {
        return this._config.name;
    }

    public getPurpose(): string
    {
        return this._config.purpose;
    }
}

@Controller('api/Test')
export class TestController
{
    public constructor(private readonly _customTestService: TestService) { }

    @HttpGet('config')
    public getConfig(): Result<any>
    {
        return ok({ name: this._customTestService.getName(), purpose: this._customTestService.getPurpose() });
    }

    @HttpGet('foo/:param1/bar/:param2')
    public get1(
        @FromRoute('param1') param1: number,
        @FromRoute('param2') param2: string,
        @FromQuery('param3') param3: string): Result<any>
    {
        return ok({ param1, param2, param3 });
    }

    @HttpGet('id/:id')
    public get2(
        @FromRoute('id') id: number,
        @FromQuery('language') language: string): Result<any>
    {
        return ok({ id, language });
    }

    @HttpPost(':param1')
    public post(
        @FromRoute('param1') param1: number,
        @FromQuery('param2') param2: string,
        @FromBody() body: any): Result<any>
    {
        return ok({ param1, param2, body });
    }

    @HttpPut(':param1')
    public put(
        @FromRoute('param1') param1: number,
        @FromBody() body: any): Result<any>
    {
        return ok({ param1, body });
    }

    @HttpPatch('foo/bar/baz/:id')
    public patch(
        @FromRoute('id') id: number,
        @FromBody() body: any): Result<any>
    {
        return ok({ id, body });
    }

    @HttpDelete('foo/bar/:id')
    public delete(
        @FromRoute('id') id: number): Result<any>
    {
        return ok({ id });
    }
}

@RequestHandler()
export class ErrorHandler implements IRequestHandler
{
    public async handle(args: Array<any>, next: (args: Array<any>) => Promise<Result<any>>): Promise<Result<any>>
    {
        try
        {
            return await next(args);
        }
        catch (err)
        {
            const error: any = err;
            console.error(error);
            throw err;
        }
    }
}