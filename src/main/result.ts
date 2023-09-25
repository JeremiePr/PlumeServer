type Enumerate<N extends number, Acc extends number[] = []> = Acc['length'] extends N ? Acc[number] : Enumerate<N, [...Acc, Acc['length']]>
type NumberRange<F extends number, T extends number> = Exclude<Enumerate<T>, Enumerate<F>>;

export class Result<T>
{
    private readonly _status: number;
    private readonly _data: T | null;
    private readonly _error: string | null;
    private readonly _isSuccess: boolean;

    public get status(): number
    {
        return this._status;
    }

    public get data(): T | null
    {
        return this._data;
    }

    public get error(): string | null
    {
        return this._error;
    }

    public get isSuccess(): boolean
    {
        return this._isSuccess;
    }

    public constructor(status: number, data: T | null, error: string | null, isSuccess: boolean)
    {
        this._status = status;
        this._data = data;
        this._error = error;
        this._isSuccess = isSuccess;
    }
}

export function ok<T>(data: T): Result<T>
{
    return new Result(200, data, null, true);
}

export function noContent(): Result<void>
{
    return new Result(204, null, null, true);
}

export function success2xx<T>(status: NumberRange<200, 300>, data: T): Result<T>
{
    return new Result(status, data, null, true);
}

export function requestError4xx(status: NumberRange<400, 500>, error: string): Result<void>
{
    return new Result(status, null, error, false);
}

export function serverError5xx(status: NumberRange<500, 600>, error: string): Result<void>
{
    return new Result(status, null, error, false);
}