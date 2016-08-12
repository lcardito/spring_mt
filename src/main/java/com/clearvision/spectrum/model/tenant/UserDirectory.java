package com.clearvision.spectrum.model.tenant;

import com.clearvision.spectrum.model.SimpleModel;

import javax.persistence.Entity;

@Entity
public class UserDirectory extends SimpleModel<UserDirectory> {
	private Long syncIntervalInMins;
	private String name;
	private String password;
	private String url;
	private boolean active;
	private boolean ssoEnabled;
	private String ssoDomain;
	public UserDirectory() {
	}

	public UserDirectory(Long id,String name,String url,Long syncIntervalInMins,String password, boolean active, boolean ssoEnabled,
			String ssoDomain) {
		setId(id);
		this.syncIntervalInMins = syncIntervalInMins;
		this.name=name;
		this.url=url;
		this.password=password;
		this.active=active;
		this.ssoEnabled = ssoEnabled;
		this.ssoDomain = ssoDomain;
	}

	public Long getSyncIntervalInMins() {
		return syncIntervalInMins;
	}

	public void setSyncIntervalInMins(Long syncIntervalInMins) {
		this.syncIntervalInMins = syncIntervalInMins;
	}

	public String getName() {
		return name;
	}

	public void setName(String name) {
		this.name = name;
	}

	public String getUrl() {
		return url;
	}

	public void setUrl(String url) {
		this.url = url;
	}

	public String getPassword() {
		return password;
	}

	public void setPassword(String password) {
		this.password = password;
	}

	public boolean isActive() {
		return active;
	}

	public void setActive(boolean isActive) {
		this.active = isActive;
	}

	public boolean isSSOEnabled() {
		return ssoEnabled;
	}

	public void setSSOEnabled(boolean ssoEnabled) {
		this.ssoEnabled = ssoEnabled;
	}

	public String getSsoDomain() {
		return ssoDomain;
	}

	public void setSsoDomain(String ssoDomain) {
		this.ssoDomain = ssoDomain;
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
