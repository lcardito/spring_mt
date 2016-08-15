package com.clearvision.spectrum.dao.tenant;

import com.clearvision.spectrum.model.tenant.Application;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ApplicationDao extends JpaRepository<Application, Long> {
	//List<Application> findByUrl(String url);
	//List<Application> getApplicationsBySupportedAppId(Long SupportedAppId);
    Optional<Application> findByName(String applicationName);
    List<Application> findBySupportedAppId(Long supportedAppId);
    Optional<Application> findBySupportedAppIdAndName(Long supportedAppId, String applicationName);
    Optional<Application> findByUrlLike(String url);
}
