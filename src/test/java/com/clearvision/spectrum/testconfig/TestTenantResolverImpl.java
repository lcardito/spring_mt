package com.clearvision.spectrum.testconfig;

import org.hibernate.context.spi.CurrentTenantIdentifierResolver;
import org.springframework.context.annotation.Primary;
import org.springframework.stereotype.Component;

@Component
@Primary
public class TestTenantResolverImpl implements CurrentTenantIdentifierResolver {
    @Override
    public String resolveCurrentTenantIdentifier() {
        return "internal";
    }

    @Override
    public boolean validateExistingCurrentSessions() {
        return true;
    }
}

