package me.lcardito.spring.dao.tenant;

import me.lcardito.spring.model.tenant.OAuthTokenRequest;
import org.springframework.data.jpa.repository.JpaRepository;

public interface OAuthTokenRequestDao extends JpaRepository<OAuthTokenRequest, Long> {
//	public void deleteByApplicationId(Long appId);
//	public OAuthTokenRequest findByApplicationId(Long appId);
}
