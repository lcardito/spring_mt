package com.clearvision.spectrum.dao.tenant;

import com.clearvision.spectrum.model.tenant.Application;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ApplicationDao extends JpaRepository<Application, Long> {
	Optional<Application> findByName(String name);
	List<Application> getApplicationsBySupportedAppId(Long SupportedAppId);
	List<Application> findByUrl(String url);
}
