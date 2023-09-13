import { IncomingMessage } from 'http';
import { IRequestHandler as IRequestHandler } from '../main/handlers';
import { Inject, RequestHandler as RequestHandler } from './../main/decorators';

@RequestHandler()
export class ErrorHandler implements IRequestHandler
{
    public constructor(@Inject('config') private readonly _config: any) { }

    public async handle(args: Array<any>, next: (args: Array<any>) => Promise<any>, request: IncomingMessage): Promise<any>
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