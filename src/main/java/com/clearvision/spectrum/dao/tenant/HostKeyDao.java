package com.clearvision.spectrum.dao.tenant;

import com.clearvision.spectrum.model.tenant.HostKey;
import org.springframework.data.jpa.repository.JpaRepository;

public interface HostKeyDao extends JpaRepository<HostKey, Long> {
	HostKey getHostKey(String algorithm);
	void setHostKey(HostKey key);
}
