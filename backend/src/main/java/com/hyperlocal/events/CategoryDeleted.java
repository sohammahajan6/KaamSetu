package com.hyperlocal.events;

import java.util.UUID;

/** Published by the category module when a category is deleted. */
public record CategoryDeleted(UUID id) {
}
