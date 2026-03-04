package com.liquibase.workshop.api;

import com.liquibase.workshop.model.Potion;
import io.swagger.v3.oas.annotations.Operation;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/potions")
public class PotionController {

    private final JdbcTemplate jdbcTemplate;

    public PotionController(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @GetMapping
    @Operation(summary = "List all potions")
    public List<Potion> listPotions() {
        return jdbcTemplate.query(
            """
                SELECT id, code, name, price, stock
                FROM potions
                ORDER BY id
                """,
            (rs, rowNum) -> new Potion(
                rs.getLong("id"),
                rs.getString("code"),
                rs.getString("name"),
                rs.getBigDecimal("price"),
                rs.getInt("stock")
            )
        );
    }
}
