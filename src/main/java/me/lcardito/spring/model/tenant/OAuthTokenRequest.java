package me.lcardito.spring.model.tenant;

import me.lcardito.spring.model.SimpleModel;

import javax.persistence.Entity;
import javax.persistence.OneToOne;

@Entity
public class OAuthTokenRequest extends SimpleModel<OAuthTokenRequest> {
	private String requestToken;
	private String tokenSecret;

	@OneToOne(optional = false)
	private  Application application;

	public OAuthTokenRequest(Long id, String requestToken, String tokenSecret) {
		this(id, requestToken, tokenSecret, null);
	}

	public OAuthTokenRequest(Long id,
	                         String requestToken,
	                         String tokenSecret,
	                         Application application)
	{
		setId(id);
		this.requestToken = requestToken;
		this.tokenSecret = tokenSecret;
		this.application = application;
	}

	public OAuthTokenRequest() {
	}

	public String getRequestToken() {
		return requestToken;
	}

	public void setRequestToken(String requestToken) {
		this.requestToken = requestToken;
	}

	public String getTokenSecret() {
		return tokenSecret;
	}

	public void setTokenSecret(String tokenSecret) {
		this.tokenSecret = tokenSecret;
	}

	public Application getApplication() {
		return application;
	}

	public void setApplication(Application application) {
		this.application = application;
	}

	/**
	 * For clarity, explicitly call equals and hashcode from parent class.
	 */
	@Override
	public boolean equals(Object o) {
		return super.equals(o);
	}

	@Override
	public int hashCode() {
		return super.hashCode();
	}

}

