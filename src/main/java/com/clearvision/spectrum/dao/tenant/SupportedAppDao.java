package com.clearvision.spectrum.dao.tenant;

import com.clearvision.spectrum.model.tenant.SupportedApp;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SupportedAppDao extends JpaRepository<SupportedApp, Long> {
//	SupportedApp findByName(String name);
}
