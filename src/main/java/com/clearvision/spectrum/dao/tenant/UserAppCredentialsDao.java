package com.clearvision.spectrum.dao.tenant;


import com.clearvision.spectrum.model.tenant.UserAppCredential;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserAppCredentialsDao extends JpaRepository<UserAppCredential, Long> {
//	UserAppCredential findByUserIdAppID(Long userId, Long appId);
}
