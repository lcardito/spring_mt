package com.clearvision.spectrum.dao.tenant;

import com.clearvision.spectrum.model.tenant.SupportedApp;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface SupportedAppDao extends JpaRepository<SupportedApp, Long> {
    Optional<SupportedApp> findByName(String name);
}
