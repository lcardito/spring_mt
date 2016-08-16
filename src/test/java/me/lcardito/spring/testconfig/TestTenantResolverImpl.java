package me.lcardito.spring.testconfig;

import org.hibernate.context.spi.CurrentTenantIdentifierResolver;
import org.springframework.context.annotation.Primary;
import org.springframework.stereotype.Component;

@Component
@Primary
public class TestTenantResolverImpl implements CurrentTenantIdentifierResolver {
    @Override
    public String resolveCurrentTenantIdentifier() {
        return "test_internal";
    }

    @Override
    public boolean validateExistingCurrentSessions() {
        return true;
    }
}

