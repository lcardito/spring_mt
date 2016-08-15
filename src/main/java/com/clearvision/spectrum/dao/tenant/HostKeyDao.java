package com.clearvision.spectrum.dao.tenant;

import com.clearvision.spectrum.model.tenant.HostKey;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface HostKeyDao extends JpaRepository<HostKey, Long> {
    Optional<HostKey> findByAlgorithm(String algorithm);
//	HostKey getHostKey(String algorithm);
//	void setHostKey(HostKey key);
}
