---
name: integration-laravel
description: PostHog integration for Laravel applications
metadata:
  author: PostHog
  version: 1.67.0
---

# PostHog integration for Laravel

This skill helps you add PostHog analytics to Laravel applications.

## Workflow

Follow these steps in order to complete the integration:

1. `references/1-begin.md` - PostHog Setup - Begin ← **Start here**
2. `references/2-edit.md` - PostHog Setup - Edit
3. `references/3-revise.md` - PostHog Setup - Revise
4. `references/4-conclude.md` - PostHog Setup - Conclusion

## Reference files

- `references/EXAMPLE.md` - Laravel example project code
- `references/1-begin.md` - Start the event tracking setup process by analyzing the project and creating an event tracking plan
- `references/2-edit.md` - Implement PostHog event tracking in the identified files, following best practices and the example project
- `references/3-revise.md` - Review and fix any errors in the PostHog integration implementation
- `references/4-conclude.md` - Review and fix any errors in the PostHog integration implementation
- `references/laravel.md` - Laravel
- `references/identify-users.md` - Identify users
- `references/COMMANDMENTS.md` - Framework-specific rules the integration must follow

The example project shows the target implementation pattern. Consult the documentation for API details.

## Key principles

- **Environment variables**: Always use environment variables for PostHog keys. Never hardcode them.
- **Minimal changes**: Add PostHog code alongside existing integrations. Don't replace or restructure existing code.
- **Match the example**: Your implementation should follow the example project's patterns as closely as possible.

## Framework guidelines

- A missing PostHog configuration must never break the app — read keys optionally (never a required setting, and never with a format check such as a URL rule in an env schema, which a blank value fails at boot), guard init and capture behind their presence, and keep build and boot working with no PostHog environment set — but never silently: in development or debug builds fail loudly, using the language's idiomatic error, with the message "<VAR> variable required by PostHog is missing or un-configured, this causes events to be silently missed. This error stops appearing once <VAR> is configured" (substituting the actual variable name); production stays a no-op. Only client code, in a browser or on a device, raises it as an error. Server-side code (a server, a worker, a module they load) logs that message as a warning outside production and keeps running, because an error there stops the process from booting for anyone without PostHog keys. A process another program launches, such as an MCP server on STDIO, has nobody watching it boot and no development build — it always writes the warning to stderr (never stdout, which can carry the protocol)
- Sending analytics must never fail or stall the app's own work. Where the app waits on a flush, handle any error it raises and keep the wait short. A long-running server or worker whose SDK sends in the background needs no flush after each capture
- On Laravel 12 or later, install `posthog/posthog-laravel` and run `php artisan posthog:install`. Package discovery registers the client, request context, exception reporting and flushing, so do NOT add `PostHog::init`, a PostHog middleware, or an exception report callback
- Call the `PostHog\Laravel\Facades\PostHog` facade, not the PHP SDK's `PostHog\PostHog` class
- Set the project token as `POSTHOG_API_KEY` and the host as `POSTHOG_HOST` in `.env`, the names the published `config/posthog.php` reads. A blank token disables the SDK without breaking boot
- Inside a request, capture without a distinct id: the Laravel SDK takes the signed-in user from auth. Pass the user's id explicitly to `identify` at login and signup
- Do NOT use Laravel's event system or observers for analytics, and leave the Laravel SDK's optional collectors off - call capture explicitly where actions occur
- On Laravel 11 or earlier, use `posthog/posthog-php` with the manual setup from the Laravel docs: init once in a service provider, wrap each request in `PostHog::withContext` from a middleware, report exceptions from `withExceptions`, and call `PostHog::flush()` in queue jobs, Horizon and Octane, because a long-running worker never destructs and its buffered events are lost on restart
- Remember that source code is available in the vendor directory after composer install
- posthog/posthog-php is the PHP SDK package name
- Check composer.json for existing dependencies and autoload configuration before adding new files
- The PHP SDK uses static methods (PostHog::capture, PostHog::identify) - initialize once with PostHog::init()
- PHP SDK methods take associative arrays with 'distinctId', 'event', 'properties' keys - not positional arguments
- Any first-party loader or proxy script you add must load standalone — require its own config includes explicitly rather than assuming the app bootstrapped them

## Identifying users

Identify users during login and signup events. Refer to the example code and documentation for the correct identify pattern for this framework. If both frontend and backend code exist, pass the client-side session and distinct ID using `X-POSTHOG-DISTINCT-ID` and `X-POSTHOG-SESSION-ID` headers to maintain correlation.

## Error tracking

Add PostHog error tracking to relevant files, particularly around critical user flows and API boundaries.
