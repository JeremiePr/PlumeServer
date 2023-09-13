import { Controller, FromBody, FromHeader, FromQuery, FromRoute, HttpDelete, HttpGet, HttpPatch, HttpPost, HttpPut, Inject, Injectable } from '../main/decorators';

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
    public getConfig(): any
    {
        return {
            name: this._customTestService.getName(),
            purpose: this._customTestService.getPurpose()
        };
    }

    @HttpGet('foo/:param1/bar/:param2')
    public get1(
        @FromRoute('param1') param1: number,
        @FromRoute('param2') param2: string,
        @FromQuery('param3') param3: string): any
    {
        return { param1, param2, param3 };
    }

    @HttpGet('id/:id')
    public get2(
        @FromRoute('id') id: number,
        @FromQuery('language') language: string): any
    {
        return { id, language }
    }

    @HttpPost(':param1')
    public post(
        @FromRoute('param1') param1: number,
        @FromQuery('param2') param2: string,
        @FromBody() body: any): any
    {
        return { param1, param2, body };
    }

    @HttpPut(':param1')
    public put(
        @FromRoute('param1') param1: number,
        @FromBody() body: any): any
    {
        return { param1, body };
    }

    @HttpPatch('foo/bar/baz/:id')
    public patch(
        @FromRoute('id') id: number,
        @FromBody() body: any): any
    {
        return { id, body };
    }

    @HttpDelete('foo/bar/:id')
    public delete(
        @FromRoute('id') id: number): any
    {
        return { id };
    }
}