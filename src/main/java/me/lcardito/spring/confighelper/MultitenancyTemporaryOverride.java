package me.lcardito.spring.confighelper;

import org.springframework.core.NamedThreadLocal;

public class MultitenancyTemporaryOverride implements AutoCloseable {
    private static final ThreadLocal<String> tenantOverride = new NamedThreadLocal<>("temporaryTenantOverride");

    public void setCurrentTenant(String tenantId) {
        tenantOverride.set(tenantId);
    }

    public static String getCurrentTenant() {
        return tenantOverride.get();
    }

    @Override
    public void close() throws Exception {
        tenantOverride.remove();
    }
}
