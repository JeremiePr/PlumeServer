# PlumeServer

## Table of contents

* [General info](#general-info)
* [Technologies](#technologies)
* [Setup](#setup)
* [Usage](#usage)
* [Contributors](#contributors)
* [Links](#links)

## General info

PlumeServer is an easy to use tool to create a quick Web API using Node.js and Express.js

Example:
```ts
import { Controller, HttpGet, FromRoute, PlumeServer, Injectable, Result, ok } from '@jeje-devs/plume-server';

@Injectable()
export class PlanetService
{
    public getPlanets(name: string): Array<string>
    {
        return ['Mercury', 'Venus', 'Earth', 'Mars', 'Jupiter', 'Saturne', 'Uranus', 'Neptune']
            .filter(x => x.toLowerCase().includes(name.toLowerCase()));
    }
}

@Controller('api/planets')
export class PlanetController
{
    public constructor(
        private readonly _planetService: PlanetService) { }

    @HttpGet(':name')
    public getPlanets(@FromRoute('name') name: string): Result<Array<string>>
    {
        return ok(this._planetService.getPlanets(name));
    }
}

const host = PlumeServer.createHost();
host.serve(8080);
```

## Technologies

* Node.js
* Express.js
* Typescript

## Setup

```
npm install @jeje-devs/plume-server
```

## Usage

Create a controller class using the decorator **@Controller**:
```ts
@Controller('api/route')
export class MyController
```

Create the different http methods using the decorators:
```ts
@HttpGet('hello')
public sayHello(): Result<string>
{
    return ok('Hello World!');
}
```

The available methods are
* HttpGet
* HttpPost
* HttpPut
* HttpPatch
* HttpDelete

### Query and Route params

To send query params, add parameters to the endpoint method with the decorator **@FromQuery**.
For routes params, you need to use **@FromRoute**
The types must be **string**, **number** or **boolean**

```ts
// Endpoint url: /api/controller/cars?model=208&brand=Peugeot
@HttpGet('cars')
public async getCars(@FromQuery('model') model: string, @FromQuery('brand') brand: string): Promise<Result<Array<Car>>>
{
    // ...
}

@HttpGet('cars/:id')
public async getCarById(@FromRoute('id') id: number): Promise<Result<Car>>
{
    // ...
}
```

The argument is the property name sent by the client.

### Body params

For body params, you need to use the **@FromBody**

```ts
@HttpPost('cars')
public addCar(@FromBody() car: Car)
{
    // ...
}
```

### Example

Here is an example of what you can achieve:
```ts
import { Controller, HttpGet, HttpPost, HttpPut, HttpDelete, FromBody, Injectable, Result, ok, noContent } from '@jeje-devs/plume-server';
import { Car } from 'src/models/car.model';
import { CarService } from 'src/services/car.service';

@Controller('api/cars')
export class CarController
{
    public constructor(
        private readonly _carService: CarService) { }

    @HttpGet()
    public async getCars(@FromQuery('name') name: string, @FromBody('brand') brand: string): Promise<Result<Array<Car>>>
    {
        const data = await this._carService.getCars(name, brand);
        return ok(data);
    }

    @HttpPost()
    public async createCar(@FromBody() car: Car): Promise<Result<void>>
    {
        await this._carService.createCar(car);
        return noContent();
    }

    @HttpPut(':id')
    public async updateCar(@FromRoute('id') id: number, @FromBody() car: Car): Promise<Result<void>>
    {
        await this._carService.updateCar(id, car);
        return noContent();
    }

    @HttpDelete(':id')
    public async deleteCar(@FromRoute('id') id: number): Promise<Result<void>>
    {
        await this._carService.deleteCar(id);
        return noContent();
    }
}
```

### Dependency injection

You can add other classes and register them with the mandatory **@Injectable** decorator.
Typically, every other service classes referenced by the **@Controller** classes need to be registered, otherwise the application will not run.
You will need to add the dependencies in the class constructor.

```ts
import { Controller, HttpGet, Injectable, Result, ok } from '@jeje-devs/plume-server';

@Injectable()
export class ElementService
{
    public getElements(): Array<string>
    {
        return ['Fire', 'Water', 'Wind', 'Earth'];
    }
}

@Controller('api/elements')
export class ElementController
{
    public constructor(
        private readonly _elementService: ElementService) { }

    @HttpGet()
    public getElements(): Result<Array<string>>
    {
        const data = this._elementService.getElements();
        return ok(data);
    }
}
```

### Starting server

To start the server you need to run the **PlumeServer.createHost** and **host.serve** methods:
```ts
import { Controller, PlumeServer } from '@jeje-devs/plume-server';

import 'src/controller/car.controller';

const port = 8080;

const singletonToInject = {
    value1: 'Foo',
    value2: 'Bar'
};

const host = PlumeServer.createHost();
host.onApiErrors = (err: any) => console.error(err);
host.registerInstance('customSingleton', singletonToInject);
host.serve(port).then(() => console.log('Server is running'));
```

## Contributors

- [Jérémie Primas](https://github.com/JeremiePr)

## Links

- [npm](https://www.npmjs.com/package/@jeje-devs/plume-server)
- [GitHub](https://github.com/JeremiePr/PlumeServer)