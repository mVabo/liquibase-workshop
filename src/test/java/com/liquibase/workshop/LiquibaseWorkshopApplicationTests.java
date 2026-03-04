package com.liquibase.workshop;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;

@SpringBootTest(properties = {
    "spring.liquibase.enabled=false",
    "spring.datasource.url=jdbc:h2:mem:workshop;MODE=PostgreSQL;DB_CLOSE_DELAY=-1",
    "spring.datasource.driver-class-name=org.h2.Driver",
    "spring.datasource.username=sa",
    "spring.datasource.password="
})
class LiquibaseWorkshopApplicationTests {

    @Test
    void contextLoads() {
    }
}
