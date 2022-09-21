import { compile, parse } from 'path-to-regexp';

// Credit: https://github.com/kennedykori/named-urls/blob/master/src/index.ts

// ===================================================
// TYPES
// ===================================================
export interface Include {
  <dR extends Routes>(path: string, routes: dR): dR & { base?: string; self?: string; star?: string };
}

export type Routes = {
  [path: string]: string | Routes;
};

export interface Reverse {
  (pattern: string | undefined, params?: ReverseParams): string;
}

export interface ReverseParams {
  [path: string]: number | string;
}

export type ReverseForce = Reverse;

// ===================================================
// IMPLEMENTATION
// ===================================================

/**
 * Nested routing with scope and included patterns.
 *
 * CHANGES:
 * - Added `base`, `self` and `star` to all entries.
 *   - `base`: Raw `base`, not affected by nesting.
 *   - `self`: Full path to `base`.
 *   - `star`: Raw base as route representation to catch all patterns. `base` suffixed with `/*`.
 * - Removed toString().
 */
export const include: Include = (base, routes) => {
  const mappedRoutes: Routes = {
    base: routes.base || base,
    self: base,
    star: routes.star || [base, '*'].join('/').replace('//', '/'),
  };

  /** Reserved attributes from nested prefixing of base. */
  const preventPrefixFields = ['base', 'star'];

  Object.keys(routes)
    .filter((route) => !preventPrefixFields.includes(route))
    .forEach((route) => {
      const url = routes[route];

      if (typeof url === 'object') {
        // nested include - prefix all sub-routes with base
        mappedRoutes[route] = include(base, url);
      } else if (typeof url === 'string') {
        // route - prefix with base and replace duplicate //
        mappedRoutes[route] = url.indexOf('/') === 0 ? url : [base, url].join('/').replace('//', '/');
      } else {
        // don't allow invalid routes object
        throw new TypeError(
          // eslint-disable-next-line max-len
          `"${route}" is not valid. A routes object can only contain a string or an object as values.`,
        );
      }
    });
  return mappedRoutes as typeof routes;
};

/**
 * Helper to reverse patterns and inject params.
 */
function compileWithParams<P extends ReverseParams>(pattern: string, params: P) {
  const reversed = compile<P>(pattern);

  return reversed(params);
}

/**
 * Reverse patterns with params.
 *
 * CHANGED: pattern allows undefined and defaults to empty string.
 */
export const reverse: Reverse = (pattern = '', params = {}) => {
  try {
    return compileWithParams(pattern, params);
  } catch (err) {
    return pattern;
  }
};

/**
 * CHANGED: pattern allows undefined and defaults to empty string.
 */
export const reverseForce: ReverseForce = (pattern = '', params = {}) => {
  try {
    return compileWithParams(pattern, params);
  } catch (err) {
    const tokens = parse(pattern);

    return tokens.filter((token: unknown) => typeof token === 'string').join('');
  }
};