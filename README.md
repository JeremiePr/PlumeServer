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
import { Controller, HttpGet, FromRoute, PlumeServer, Injectable } from '@jeje-devs/plume-server';

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
    public getPlanets(@FromRoute('name') name: string): Array<string>
    {
        return this._planetService.getPlanets(name);
    }
}

PlumeServer.run(8080);
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
public sayHello(): string
{
    return 'Hello World!';
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
public getCars(@FromQuery('model') model: string, @FromQuery('brand') brand: string): Array<Car>
{
    // ...
}

@HttpGet('cars/:id')
public getCarById(@FromRoute('id') id: number): Car
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
import { Controller, HttpGet, HttpPost, HttpPut, HttpDelete, FromBody, Injectable } from '@jeje-devs/plume-server';
import { Car } from 'src/models/car.model';
import { CarService } from 'src/services/car.service';

@Controller('api/cars')
export class CarController
{
    public constructor(
        private readonly _carService: CarService) { }

    @HttpGet()
    public async getCars(@FromQuery('name') name: string, @FromBody('brand') brand: string): Promise<Array<Car>>
    {
        return await this._carService.getCars(name, brand);
    }

    @HttpPost()
    public async createCar(@FromBody() car: Car): Promise<void>
    {
        await this._carService.createCar(car);
    }

    @HttpPut(':id')
    public async updateCar(@FromRoute('id') id: number, @FromBody() car: Car): Promise<void>
    {
        await this._carService.updateCar(id, car);
    }

    @HttpDelete(':id')
    public async deleteCar(@FromRoute('id') id: number): Promise<void>
    {
        await this._carService.deleteCar(id);
    }
}
```

### Dependency injection

You can add other classes and register them with the mandatory **@Injectable** decorator.
Typically, every other service classes referenced by the **@Controller** classes need to be registered, otherwise the application will not run.
You will need to add the dependencies in the class constructor.

```ts
import { Controller, HttpGet, Injectable } from '@jeje-devs/plume-server';

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
    public getElements(): Array<string>
    {
        return this._elementService.getElements();
    }
}
```

If you want to register and inject a custom instance, you need to do:

```ts

```

### Starting server

To start the server you need to run the **PlumeServer.run** method:
```ts
import { Controller, PlumeServer } from '@jeje-devs/plume-server';

import 'src/controller/car.controller';

const port = 8080;

const singletonToInject = {
    value1: 'Foo',
    value2: 'Bar'
};

PlumeServer.run(
    port,
    err => console.error(err),
    [{ id: 'customSingleton', instance: singletonToInject }]
).then(() => console.log('Server running'));
```

## Contributors

- [Jérémie Primas](https://github.com/JeremiePr)

## Links

- [npm](https://www.npmjs.com/package/@jeje-devs/plume-server)
- [GitHub](https://github.com/JeremiePr/PlumeServer)