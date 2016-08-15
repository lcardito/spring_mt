package com.clearvision.spectrum;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.ComponentScan;

@SpringBootApplication
@ComponentScan
public class Spectrum {
    public static void main(String[] args) {
        SpringApplication.run(Spectrum.class, args);
    }
}
