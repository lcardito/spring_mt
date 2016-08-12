package com.clearvision.spectrum.dao.tenant;

import com.clearvision.spectrum.model.tenant.OAuth2Authentication;
import com.clearvision.spectrum.model.tenant.OAuth2RefreshToken;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface OAuth2RefreshTokenDao extends JpaRepository<OAuth2RefreshToken, Long> {

	OAuth2RefreshToken findByToken(String tokenValue);

	OAuth2Authentication findAuthenticationByToken(String tokenValue);

	List<OAuth2RefreshToken> findByUserName(String userName);

	void flush();
}
