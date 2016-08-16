package me.lcardito.spring.model.tenant;

import me.lcardito.spring.model.Filterable;
import me.lcardito.spring.model.SimpleModel;

import javax.persistence.Column;
import javax.persistence.Entity;
import java.sql.Timestamp;
import java.util.Date;

@Entity
public class Project extends SimpleModel<Project> {
	@Filterable
	private String name;
	@Filterable
	private String projectKey;
	@Filterable
	@Column(length = 4000)
	private String description;
	private Timestamp createdDate = new Timestamp(new Date().getTime());

	public Project() {
		super();
	}

	public Project(Long id, String name, String projectKey, String description) {
		setId(id);
		this.name = name;
		this.projectKey = projectKey;
		this.description = description;
	}

	public String getName() {
		return name;
	}

	public void setName(String name) {
		this.name = name;
	}

	public String getProjectKey() {
		return projectKey;
	}

	public void setProjectKey(String projectKey) {
		this.projectKey = projectKey;
	}

	public String getDescription() {
		return description;
	}

	public void setDescription(String description) {
		this.description = description;
	}

	public Timestamp getCreatedDate() {
		return new Timestamp(createdDate.getTime());
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
