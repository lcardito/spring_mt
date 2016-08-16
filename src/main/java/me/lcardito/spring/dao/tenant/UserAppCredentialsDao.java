package me.lcardito.spring.dao.tenant;


import me.lcardito.spring.model.tenant.UserAppCredential;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserAppCredentialsDao extends JpaRepository<UserAppCredential, Long> {
//	UserAppCredential findByUserIdAppID(Long userId, Long appId);
}
