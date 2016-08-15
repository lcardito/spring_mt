package com.clearvision.spectrum.dao.tenant;

import com.clearvision.spectrum.model.tenant.OAuthTokenRequest;
import org.springframework.data.jpa.repository.JpaRepository;

public interface OAuthTokenRequestDao extends JpaRepository<OAuthTokenRequest, Long> {
//	public void deleteByApplicationId(Long appId);
//	public OAuthTokenRequest findByApplicationId(Long appId);
}
