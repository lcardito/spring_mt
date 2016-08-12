package com.clearvision.spectrum.model.tenant;

import com.clearvision.spectrum.model.SimpleModel;

import javax.persistence.Entity;
import javax.persistence.ManyToOne;

@Entity
public class ProjectApplication extends SimpleModel {
	@ManyToOne(optional = false)
	private Application application;

	@ManyToOne(optional = false)
	private Project project;

	private String userGroup;
	private String devGroup;
	private String adminGroup;

	public Application getApplication() {
		return application;
	}

	public void setApplication(Application application) {
		this.application = application;
	}

	public Project getProject() {
		return project;
	}

	public void setProject(Project project) {
		this.project = project;
	}

	public ProjectApplication(){
		super();
	}

	public String getUserGroup() {
		return userGroup;
	}

	public void setUserGroup(String userGroup) {
		this.userGroup = userGroup;
	}

	public String getAdminGroup() {
		return adminGroup;
	}

	public void setAdminGroup(String adminGroup) {
		this.adminGroup = adminGroup;
	}

	public String getDevGroup() {
		return devGroup;
	}

	public void setDevGroup(String devGroup) {
		this.devGroup = devGroup;
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
