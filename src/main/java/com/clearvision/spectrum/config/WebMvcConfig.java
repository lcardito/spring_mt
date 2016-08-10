package com.clearvision.spectrum.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurerAdapter;
import com.clearvision.spectrum.confighelper.TenantIdentifierInterceptorAdapter;

import javax.inject.Inject;

/**
 * WebMvcConfig.
 *
 * @author Zakir Magdum
 */
@Configuration
public class WebMvcConfig extends WebMvcConfigurerAdapter {

    @Inject
    private TenantIdentifierInterceptorAdapter multiTenancyInterceptor;

    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        registry.addInterceptor(multiTenancyInterceptor);
    }
}