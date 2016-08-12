package com.clearvision.spectrum.dao.tenant;

import com.clearvision.spectrum.model.tenant.OAuth2AccessToken;
import com.clearvision.spectrum.model.tenant.OAuth2Authentication;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface OAuth2AccessTokenDao extends JpaRepository<OAuth2AccessToken, Long> {

	OAuth2AccessToken findByToken(String tokenValue);

	OAuth2Authentication findAuthenticationByToken(String tokenValue);

	OAuth2AccessToken findByRefreshToken(String tokenValue);

	OAuth2AccessToken findAccessTokenByAuthenticationKey(String authenticationKey);

	List<OAuth2AccessToken> findByClientId(String clientId);

	List<OAuth2AccessToken> findByUserName(String userName);

	List<OAuth2AccessToken> findByClientIdAndUserName(String clientId, String userName);

	void flush();
}