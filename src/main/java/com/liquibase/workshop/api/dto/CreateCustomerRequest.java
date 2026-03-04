package com.liquibase.workshop.api.dto;

public record CreateCustomerRequest(String email, String displayName) {
}
