import { TestEntrySet, runTests, theBoolean, theNumber, theObject, theString } from '@jeje-devs/plume-testing';
import { PlumeServer } from '../main/core';

import './test.controller';
import { TestService } from './test.controller';

const port = 3071;
const baseApiTestRoute = `http://localhost:${port}/api/Test`;

const tests: TestEntrySet<PlumeServer> = {

    'TestEndpointGetConfig': async () =>
    {
        const expected = { name: 'TsRoller', purpose: 'Test' };
        const actual = await fetch(baseApiTestRoute + '/config', {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        }).then(response => response.json());

        theObject(actual).shouldNotBeNil();
        theObject(actual).shouldHaveTheSameNumberOfPropertiesWith(expected);
        theString(actual.name).shouldBe(expected.name);
        theString(actual.purpose).shouldBe(expected.purpose);
    },

    'TestEndpointGet1': async () =>
    {
        const expected = { param1: 14, param2: 'hello', param3: 'baz' };
        const actual = await fetch(baseApiTestRoute + '/foo/14/bar/hello?param3=baz', {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        }).then(response => response.json());

        theObject(actual).shouldNotBeNil();
        theObject(actual).shouldHaveTheSameNumberOfPropertiesWith(expected);
        theNumber(actual.param1).shouldBe(expected.param1);
        theString(actual.param2).shouldBe(expected.param2);
        theString(actual.param3).shouldBe(expected.param3);
    },

    'TestEndpointGet2': async () =>
    {
        const expected = { id: 7840, language: 'fr-CH' };
        const actual = await fetch(baseApiTestRoute + '/id/7840?language=fr-CH', {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        }).then(response => response.json());

        theObject(actual).shouldNotBeNil();
        theObject(actual).shouldHaveTheSameNumberOfPropertiesWith(expected);
        theNumber(actual.id).shouldBe(expected.id);
        theString(actual.language).shouldBe(expected.language);
    },

    'TestEndpointPost': async () =>
    {
        const expected = { param1: 45, param2: 'Hola', body: { id: 12, name: 'FooBar' } };
        const actual = await fetch(baseApiTestRoute + '/45?param2=Hola', {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ id: 12, name: 'FooBar' })
        }).then(response => response.json());

        theObject(actual).shouldNotBeNil();
        theObject(actual).shouldHaveTheSameNumberOfPropertiesWith(expected);
        theNumber(actual.param1).shouldBe(expected.param1);
        theString(actual.param2).shouldBe(expected.param2);
        theObject(actual.body).shouldHaveTheSameNumberOfPropertiesWith(expected.body);
        theNumber(actual.body.id).shouldBe(expected.body.id);
        theString(actual.body.name).shouldBe(expected.body.name);
    },

    'TestEndpointPut': async () =>
    {
        const expected = { param1: 2, body: { boo: true, val: 'Here' } };
        const actual = await fetch(baseApiTestRoute + '/2', {
            method: 'PUT',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ boo: true, val: 'Here' })
        }).then(response => response.json());

        theObject(actual).shouldNotBeNil();
        theObject(actual).shouldHaveTheSameNumberOfPropertiesWith(expected);
        theNumber(actual.param1).shouldBe(expected.param1);
        theObject(actual.body).shouldHaveTheSameNumberOfPropertiesWith(expected.body);
        theBoolean(actual.body.boo).shouldBe(expected.body.boo);
        theString(actual.body.val).shouldBe(expected.body.val);
    },

    'TestEndpointPatch': async () =>
    {
        const expected = { id: 92, body: { name: 'Butter', ref: 'IGR0001' } };
        const actual = await fetch(baseApiTestRoute + '/foo/bar/baz/92', {
            method: 'PATCH',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ name: 'Butter', ref: 'IGR0001' })
        }).then(response => response.json());

        theObject(actual).shouldNotBeNil();
        theObject(actual).shouldHaveTheSameNumberOfPropertiesWith(expected);
        theNumber(actual.id).shouldBe(expected.id);
        theObject(actual.body).shouldHaveTheSameNumberOfPropertiesWith(expected.body);
        theString(actual.body.name).shouldBe(expected.body.name);
        theString(actual.body.ref).shouldBe(expected.body.ref);
    },

    'TestEndpointDelete': async () =>
    {
        const expected = { id: 7145 };
        const actual = await fetch(baseApiTestRoute + '/foo/bar/7145', {
            method: 'DELETE',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ name: 'Butter', ref: 'IGR0001' })
        }).then(response => response.json());

        theObject(actual).shouldNotBeNil();
        theObject(actual).shouldHaveTheSameNumberOfPropertiesWith(expected);
        theNumber(actual.id).shouldBe(expected.id);
    }

};

async function initialize(): Promise<PlumeServer>
{
    const host = PlumeServer.createHost();
    host.onApiErrors = err => console.error(err);
    host.registerInstance('config', { name: 'TsRoller', purpose: 'Test' });

    return await host.serve(port);
}

function terminate(host: PlumeServer): void
{
    host.close();
}

runTests(tests, initialize, terminate);