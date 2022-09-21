# named-routes

Inspired by named-urls ([npmjs](https://www.npmjs.com/package/named-urls), [github](https://github.com/kennedykori/named-urls/))

As I am unsure of how forking works, this package is a direct copy of the package above.
I have extended the functionality with a few additions:
1. Removed toString() method.
3. Added `base`: Raw path given to include(), not affected by nesting.
4. Added `star`: Raw base as route representation to catch all patterns. `base` suffixed with `/*`.
5. Added `self`: Full path to `base`.

<br>
<hr>
<br>
<br>

## Example setup:
```ts
// "src/routes.ts"
import { include } from '@emilte/named-routes';

export const ROUTES = {
   foo: include('/foo/', {
        bar: 'bar/',
        scope: include('scope/:param', { // <- Note optional trailing slash.
            baz: 'baz', // <- Note optional trailing slash.
            qux: 'qux/',
            nos: '/nos/' // <- Note absolute path.
     })
   })
}
```

<details>
<summary>Final result</summary>

```ts
ROUTES = {
    foo: {
        base: '/foo/',
        star: '/foo/*',
        self: '/foo/',
        bar: '/foo/bar/',
        scope: {
            base: 'scope/:param',
            star: 'scope/:param/*',
            self: '/foo/scope/:param',
            baz: '/foo/scope/:param/baz',
            qux: '/foo/scope/:param/qux/',
            nos: '/nos/'
        }
    }
}
```
</details>

<br>
<br>
<br>


## Usage:

Example 1 (simple):
```ts
ROUTES.foo.base === '/foo/'
ROUTES.foo.self === '/foo/'
ROUTES.foo.star === '/foo/*'

ROUTES.foo.scope.base === 'scope/:param'
ROUTES.foo.scope.star === 'scope/:param/*'
ROUTES.foo.scope.self === '/foo/scope/:param'

ROUTES.foo.scope.baz === '/foo/scope/:param/baz'

ROUTES.foo.scope.qux === '/foo/scope/:param/qux/'

ROUTES.foo.scope.nos === '/nos/'

// Use `reverse` to inject params.
reverse(ROUTES.foo.scope.baz, {param:'hello-world'}) === '/foo/scope/hello-world/baz'
```

Example 2 (router):
```tsx
// "src/AppRoutes.tsx"
import { Route, Routes } from 'react-router-dom';
import { BazPage, QuxPage } from 'Pages'; // Some example components.
import { ROUTES } from 'routes'; // From example setup.
import { FooRoutes } from 'src'; // Some other nested routing.

export function AppRoutes() {
    return (
        <Routes>
            <Route path={ROUTES.foo.scope.baz} element={BazPage} />
            <Route path={ROUTES.foo.scope.qux} element={QuxPage} />
            <Route path={ROUTES.foo.star} element={FooRoutes} /> {/* Catch everything else */}
        </Routes>
    )
}
```

Example 3 (link):
```tsx
// "src/Pages/BazPage.tsx"
import { reverse } from '@emilte/named-routes';
import { ROUTES } from 'routes'; // From example setup.

export function BazPage() {
    const quxOneUrl = reverse(ROUTES.foo.scope.qux, {param: 1})
    return <a href={quxOneUrl}>Go to Qux 1</a>
}
```