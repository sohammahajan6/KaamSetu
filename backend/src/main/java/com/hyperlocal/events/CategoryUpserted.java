package com.hyperlocal.events;

import java.util.UUID;

/** Published by the category module whenever a category is created or updated. */
public record CategoryUpserted(UUID id, String name, boolean active) {
}
