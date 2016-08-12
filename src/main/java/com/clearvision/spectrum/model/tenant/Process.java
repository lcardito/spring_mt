package com.clearvision.spectrum.model.tenant;

import com.clearvision.spectrum.model.Filterable;
import com.clearvision.spectrum.model.SimpleModel;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.Table;
import javax.persistence.UniqueConstraint;
import java.sql.Timestamp;
import java.util.Date;

@Entity
@Table(uniqueConstraints = @UniqueConstraint(columnNames = {"title", "createDate"}))
public class Process extends SimpleModel<Process> {

	@Filterable
	@Column(length = 255)
	private String title;
	@Filterable
	@Column(length = 4000)
	private String description;
	private Timestamp createDate;
	private String createdBy;
	private Timestamp updateDate;
	private String updatedBy;

	public Process() {
	}

	public Process(String title, String description, Date createDate, String createdBy, Date updateDate, String updatedBy) {
		this.title = title;
		this.description = description;
		this.createDate = new Timestamp(createDate.getTime());
		this.createdBy = createdBy;
		this.updateDate = new Timestamp(updateDate.getTime());
		this.updatedBy = updatedBy;
	}

	public String getTitle() {
		return title;
	}

	public void setTitle(String title) {
		this.title = title;
	}

	public String getDescription() {
		return description;
	}

	public void setDescription(String description) {
		this.description = description;
	}

	public Date getCreateDate() {
		return new Date(createDate.getTime());
	}

	public void setCreateDate(Date createDate) {
		this.createDate = new Timestamp(createDate.getTime());
	}

	public String getCreatedBy() {
		return createdBy;
	}

	public void setCreatedBy(String createdBy) {
		this.createdBy = createdBy;
	}

	public Date getUpdateDate() {
		return new Date(updateDate.getTime());
	}

	public void setUpdateDate(Date updateDate) {
		this.updateDate = new Timestamp(updateDate.getTime());
	}

	public String getUpdatedBy() {
		return updatedBy;
	}

	public void setUpdatedBy(String updatedBy) {
		this.updatedBy = updatedBy;
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
