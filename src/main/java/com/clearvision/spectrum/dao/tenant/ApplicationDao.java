package com.clearvision.spectrum.dao.tenant;

import com.clearvision.spectrum.model.tenant.Application;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ApplicationDao extends JpaRepository<Application, Long> {
	boolean applicationExists(String name);
	List<Application> getApplicationsBySupportedAppId(Long SupportedAppId);
	List<Application> findByUrl(String url);
    void update(Application app);
    Application findByName(String applicationName);
    void create(Application app);
}
