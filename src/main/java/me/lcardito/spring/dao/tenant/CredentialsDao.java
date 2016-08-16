package me.lcardito.spring.dao.tenant;

import me.lcardito.spring.model.tenant.Credentials;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CredentialsDao extends JpaRepository<Credentials, Long> {
//    List<Credentials> findByUserIdAndType(Long userId, String type);
}
