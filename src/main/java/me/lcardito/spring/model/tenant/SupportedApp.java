package me.lcardito.spring.model.tenant;

import me.lcardito.spring.model.SimpleModel;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.OneToMany;
import javax.persistence.Table;
import java.util.Collections;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "SupportedApp")
public class SupportedApp extends SimpleModel<SupportedApp> {
	// we want installedApplications types to be unique (i.e. not more than one supported 'Jira' app
	@Column(nullable = false, unique=true)
	private String lcName; // lowercase name used for unique constraint on table.  necessary to enforce uniqueness
	@Column(nullable = false)
	private String name;
	@Column(nullable = false)
	private String minVersion;
	@Column(nullable = false)
	private String maxVersion;

	@OneToMany(mappedBy = "supportedApp")
	private Set<Application> installedApps = new HashSet<>(0);

	/**
	 *
	 * @param name case insensitive name.  Application will display the name as entered but uniqueness is case
	 *                insensitive
	 * @param minVersion
	 * @param maxVersion
	 */
	public SupportedApp(String name, String minVersion, String maxVersion) {
		setName(name);
		setMinVersion(minVersion);
		setMaxVersion(maxVersion);
	}

	public SupportedApp() {

	}

	public String getName() {
		return name;
	}

	public void setName(String name) {
		this.name = name;
		setLcName(name);
	}

	public String getMinVersion() {
		return minVersion;
	}

	public void setMinVersion(String minVersion) {
		this.minVersion = minVersion;
	}

	public String getMaxVersion() {
		return maxVersion;
	}

	public void setMaxVersion(String maxVersion) {
		this.maxVersion = maxVersion;
	}

	String getLcName() {
		//Not ideal to be public but necessary apparently Spring doesn't like protected or private getters :-(
		return lcName;
	}

	private void setLcName(String lcName) {
		this.lcName = lcName.toLowerCase();
	}

	/**
	 * The list of supportedPlugins that are supported by spectrum for this application
	 * @return Unmodifiable set of supportedPlugins that this supported application supports
	 */
	public Set<Application> getInstalledApps(){
		return Collections.unmodifiableSet(installedApps);
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
