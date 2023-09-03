import { controller, fromBody, fromQuery, fromRoute, httpDelete, httpGet, httpPatch, httpPost, httpPut, injectable } from '../main/decorators';

@injectable()
export class TestService
{
    private readonly _config = { name: 'TsRoller', purpose: 'Test' };

    public getName(): string
    {
        return this._config.name;
    }

    public getPurpose(): string
    {
        return this._config.purpose;
    }
}

@controller('api/Test')
export class TestController
{
    public constructor(private readonly _customTestService: TestService) { }

    @httpGet('config')
    public getConfig(): any
    {
        return {
            name: this._customTestService.getName(),
            purpose: this._customTestService.getPurpose()
        };
    }

    @httpGet('foo/:param1/bar/:param2')
    public get1(
        @fromRoute('param1') param1: number,
        @fromRoute('param2') param2: string,
        @fromQuery('param3') param3: string): any
    {
        return { param1, param2, param3 };
    }

    @httpGet('id/:id')
    public get2(
        @fromRoute('id') id: number,
        @fromQuery('language') language: string): any
    {
        return { id, language }
    }

    @httpPost(':param1')
    public post(
        @fromRoute('param1') param1: number,
        @fromQuery('param2') param2: string,
        @fromBody() body: any): any
    {
        return { param1, param2, body };
    }

    @httpPut(':param1')
    public put(
        @fromRoute('param1') param1: number,
        @fromBody() body: any): any
    {
        return { param1, body };
    }

    @httpPatch('foo/bar/baz/:id')
    public patch(
        @fromRoute('id') id: number,
        @fromBody() body: any): any
    {
        return { id, body };
    }

    @httpDelete('foo/bar/:id')
    public delete(
        @fromRoute('id') id: number): any
    {
        return { id };
    }
}