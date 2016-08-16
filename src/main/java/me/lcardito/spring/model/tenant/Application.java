package me.lcardito.spring.model.tenant;

import me.lcardito.spring.model.SimpleModel;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;
import javax.persistence.Table;

@Entity
@Table(name = "Application")
public class Application extends SimpleModel<Application> {
	@Column(unique = true)
	private String name;
	private String url;
	private String atlassianAppLinkId;
	@Column(length = 6)
	private String hexColour;
	private String accessToken;

	@ManyToOne
	@JoinColumn(name="supported_app_id", nullable = false)
	private SupportedApp supportedApp;


	public Application(Long id, String name, String url, String hexColour) {
		setId(id);
		this.name = name;
		this.url = url;
		this.hexColour = hexColour;
	}

	public Application() {
	}

	public String getUrl() {
		return url.replaceAll("/+?$", "");
	}

	public String getAtlassianAppLinkId() {
		return atlassianAppLinkId;
	}

	public void setAtlassianAppLinkId(String atlassianAppLinkId) {
		this.atlassianAppLinkId = atlassianAppLinkId;
	}

	public void setUrl(String url) {
		this.url = url;
	}

	public String getName() {
		return name;
	}

	public void setName(String name) {
		this.name = name;
	}

	public String getHexColour() {
		return hexColour;
	}

	public void setHexColour(String hexColour) {
		this.hexColour = hexColour;
	}


	public SupportedApp getSupportedApp() {
		return supportedApp;
	}

	public void setSupportedApp(SupportedApp supportedApp) {
		this.supportedApp = supportedApp;
	}

	public String getAccessToken() {
		return accessToken;
	}

	public void setAccessToken(String accessToken) {
		this.accessToken = accessToken;
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
