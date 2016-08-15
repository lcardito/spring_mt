package com.clearvision.spectrum;

import com.clearvision.spectrum.confighelper.CurrentTenantResolverImpl;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.ComponentScan;

@SpringBootApplication(exclude = CurrentTenantResolverImpl.class)
@ComponentScan
public class SpectrumTest {
    public static void main(String[] args) {
        SpringApplication.run(Spectrum.class, args);
    }
}
