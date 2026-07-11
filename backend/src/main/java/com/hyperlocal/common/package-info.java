/**
 * Shared infrastructure kernel: JWT issuing/parsing, the security filter chain,
 * request-scoped identity ({@link com.hyperlocal.common.CurrentUser}), API error
 * rendering and CORS. Business modules may use the types in this root package;
 * everything under {@code internal} is off-limits to them (enforced by the
 * modularity test). This module never depends on any business module.
 */
package com.hyperlocal.common;
