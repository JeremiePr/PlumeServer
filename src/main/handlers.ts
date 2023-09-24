import { IncomingMessage } from 'http';
import { Result } from './result';

export interface IRequestHandler
{
    handle(args: Array<any>, next: (...args: Array<any>) => Promise<Result<any>>, request: IncomingMessage): Promise<Result<any>>;
}