package com.clearvision.spectrum.dao.tenant;

import com.clearvision.spectrum.model.tenant.Credentials;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CredentialsDao extends JpaRepository<Credentials, Long> {
//    List<Credentials> findByUserIdAndType(Long userId, String type);
}
