# named-routes

Example:
```ts
const ROUTES = {
   foo: include('/foo/', {
     bar: 'bar/',
     scope: include('scope/:param', { // <- Note the missing trailing slash.
       baz: 'baz', // <- Note the missing trailing slash.
       qux: 'qux/'
     })
   })
}
```

## Usage:
```ts
ROUTES.foo.base === '/foo/'
ROUTES.foo.self === '/foo/'
ROUTES.foo.star === '/foo/*'

ROUTES.foo.scope.base === 'scope/:param'
ROUTES.foo.scope.self === '/foo/scope/:param'
ROUTES.foo.scope.star === '/scope/*'

ROUTES.foo.scope.baz === '/foo/scope/:param/baz'

ROUTES.foo.scope.qux === '/foo/scope/:param/qux/'

// Use `reverse` to inject params.
reverse(ROUTES.foo.scope.baz, {param:'hello-world'}) === '/foo/scope/hello-world/baz'
```