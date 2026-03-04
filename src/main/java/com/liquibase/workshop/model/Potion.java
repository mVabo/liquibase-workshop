package com.liquibase.workshop.model;

import java.math.BigDecimal;

public record Potion(Long id, String code, String name, BigDecimal price, int stock) {
}
