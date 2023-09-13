import { IncomingMessage } from 'http';

export interface IRequestHandler
{
    handle(args: Array<any>, next: (...args: Array<any>) => Promise<void>, request: IncomingMessage): Promise<any>;
}