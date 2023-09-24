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

    private constructor(status: number, data: T | null, error: string | null, isSuccess: boolean)
    {
        this._status = status;
        this._data = data;
        this._error = error;
        this._isSuccess = isSuccess;
    }

    public static ok<T>(data: T): Promise<Result<T>>
    {
        return new Promise(resolve => resolve(new Result(200, data, null, true)));
    }

    public static noContent(): Promise<Result<void>>
    {
        return new Promise(resolve => resolve(new Result(204, null, null, true)));
    }

    public static success2xx<T>(status: NumberRange<200, 299>, data: T): Promise<Result<T>>
    {
        return new Promise(resolve => resolve(new Result(status, data, null, true)));
    }

    public static requestError4xx(status: NumberRange<400, 499>, error: string): Promise<Result<void>>
    {
        return new Promise(resolve => resolve(new Result(status, null, error, false)));
    }

    public static serverError5xx(status: NumberRange<500, 599>, error: string): Promise<Result<void>>
    {
        return new Promise(resolve => resolve(new Result(status, null, error, false)));
    }
}